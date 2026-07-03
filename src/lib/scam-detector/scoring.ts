import type {
  Confidence,
  DetectionResult,
  RiskCategory,
  RiskLevel,
  Signal,
} from "./types";
import { SEVERITY_WEIGHT } from "./types";

const ALL_CATEGORIES: RiskCategory[] = [
  "link",
  "identity",
  "pressure",
  "data",
  "payment",
  "language",
  "context",
];

/** Diminishing-returns cap: repeated signals in the same category shouldn't alone max the score. */
const CATEGORY_CAP = 50;

const CATEGORY_LABELS_PL: Record<RiskCategory, string> = {
  link: "podejrzany link",
  identity: "podszywanie się pod nadawcę",
  pressure: "presja czasu",
  data: "prośba o dane wrażliwe",
  payment: "podejrzana płatność",
  language: "nietypowy język wiadomości",
  context: "niespójny kontekst wiadomości",
};

const RECOMMENDED_ACTIONS_BY_CATEGORY: Record<RiskCategory, string> = {
  link: "Nie klikaj w link zawarty w tej wiadomości.",
  data: "Nie podawaj kodu BLIK, hasła, numeru karty, CVV, kodu SMS ani numeru PESEL.",
  payment: "Nie dokonuj żadnej płatności na podstawie tej wiadomości poza oficjalną aplikacją firmy.",
  identity: "Zweryfikuj nadawcę bezpośrednio w oficjalnej aplikacji lub na oficjalnej stronie — nie używaj linku ani numeru z wiadomości.",
  pressure: "Nie działaj pod presją czasu — realne instytucje dają Ci czas na weryfikację.",
  context: "Nie przenoś rozmowy poza oficjalną platformę (np. z OLX/Allegro na WhatsApp).",
  language: "Zwróć uwagę na styl wiadomości, ale nie polegaj tylko na nim — dopasuj ocenę do innych sygnałów.",
};

function computeCategoryScores(signals: Signal[]): Record<RiskCategory, number> {
  const scores = Object.fromEntries(ALL_CATEGORIES.map((c) => [c, 0])) as Record<
    RiskCategory,
    number
  >;

  for (const signal of signals) {
    scores[signal.category] += SEVERITY_WEIGHT[signal.severity];
  }

  for (const category of ALL_CATEGORIES) {
    scores[category] = Math.min(CATEGORY_CAP, scores[category]);
  }

  return scores;
}

function levelFromScore(score: number): RiskLevel {
  if (score >= 70) return "Critical";
  if (score >= 45) return "High";
  if (score >= 20) return "Medium";
  return "Low";
}

const LEVEL_ORDER: RiskLevel[] = ["Low", "Medium", "High", "Critical"];

function maxLevel(a: RiskLevel, b: RiskLevel): RiskLevel {
  return LEVEL_ORDER.indexOf(a) >= LEVEL_ORDER.indexOf(b) ? a : b;
}

function computeConfidence(signals: Signal[], triggeredCategories: RiskCategory[]): Confidence {
  if (signals.length === 0) return "High"; // confident nothing suspicious found
  const hasCritical = signals.some((s) => s.severity === "critical");
  if (hasCritical || triggeredCategories.length >= 3) return "High";
  if (triggeredCategories.length === 2) return "Medium";
  return "Low"; // single weak category — could be a false positive
}

function buildSummary(triggeredCategories: RiskCategory[], riskLevel: RiskLevel): string {
  if (triggeredCategories.length === 0) {
    return "Nie wykryto wyraźnych sygnałów ryzyka w tej wiadomości, ale zawsze zachowuj ostrożność przy nietypowych prośbach.";
  }
  const top = triggeredCategories.slice(0, 3).map((c) => CATEGORY_LABELS_PL[c]);
  const list = top.length === 1 ? top[0] : `${top.slice(0, -1).join(", ")} oraz ${top[top.length - 1]}`;

  const riskWord: Record<RiskLevel, string> = {
    Low: "niskie ryzyko",
    Medium: "umiarkowane ryzyko",
    High: "wysokie ryzyko",
    Critical: "bardzo wysokie ryzyko",
  };

  return `Ta wiadomość wykazuje ${riskWord[riskLevel]} oszustwa — zawiera: ${list}.`;
}

/**
 * Context-category signals are heterogeneous (platform bypass vs. a vague
 * account warning vs. a missing order number are very different situations),
 * so — unlike the other categories — it needs signal-specific action text
 * instead of one generic line. A weak corroborating signal like
 * "missing order number" doesn't get its own action line: it's supporting
 * evidence, not something actionable on its own.
 */
function contextAction(signals: Signal[]): string | null {
  const ids = new Set(signals.filter((s) => s.category === "context").map((s) => s.id));
  if (ids.has("context.interaction-trick")) {
    return "Nie odpowiadaj na tę wiadomość i nie klikaj linku — to nie jest realny sposób na 'aktywację' wiadomości SMS.";
  }
  if (ids.has("context.platform-bypass")) {
    return "Nie przenoś rozmowy poza oficjalną platformę (np. z OLX/Allegro na WhatsApp).";
  }
  if (ids.has("context.vague-account-issue")) {
    return "Zweryfikuj sprawę logując się bezpośrednio w oficjalnej aplikacji — nie przez link ani numer z wiadomości.";
  }
  return null;
}

function buildRecommendedActions(signals: Signal[], triggeredCategories: RiskCategory[]): string[] {
  if (triggeredCategories.length === 0) {
    return [
      "Wiadomość nie wykazuje typowych sygnałów oszustwa, ale zawsze zachowuj ostrożność przy nietypowych prośbach o dane lub płatności.",
    ];
  }

  const actions = triggeredCategories
    .filter((c) => c !== "language") // language alone rarely warrants its own action line
    .map((c) => (c === "context" ? contextAction(signals) : RECOMMENDED_ACTIONS_BY_CATEGORY[c]))
    .filter((a): a is string => a !== null);

  actions.push(
    "W razie wątpliwości zgłoś wiadomość i zablokuj nadawcę. To narzędzie pomaga ocenić ryzyko, ale nie daje gwarancji — zawsze weryfikuj ważne sprawy oficjalnym kanałem."
  );

  return actions;
}

export function scoreSignals(signals: Signal[]): DetectionResult {
  const categoryScores = computeCategoryScores(signals);
  const triggeredCategories = ALL_CATEGORIES.filter((c) => categoryScores[c] > 0);

  const rawScore = ALL_CATEGORIES.reduce((sum, c) => sum + categoryScores[c], 0);

  // Synergy bonus: several weak signals across different categories, taken
  // together, are riskier than any single one in isolation.
  let synergyBonus = 0;
  if (triggeredCategories.length >= 5) synergyBonus = 20;
  else if (triggeredCategories.length >= 3) synergyBonus = 10;

  const cappedScore = Math.min(100, rawScore + synergyBonus);

  let riskLevel = levelFromScore(cappedScore);

  // Hard floor: a single critical signal (e.g. request for BLIK/password/card)
  // must never be shown as Low/Medium risk, even if it's the only signal.
  const criticalCount = signals.filter((s) => s.severity === "critical").length;
  if (criticalCount >= 2) riskLevel = maxLevel(riskLevel, "Critical");
  else if (criticalCount === 1) riskLevel = maxLevel(riskLevel, "High");

  const confidence = computeConfidence(signals, triggeredCategories);
  const summary = buildSummary(triggeredCategories, riskLevel);
  const recommendedAction = buildRecommendedActions(signals, triggeredCategories);

  return {
    riskLevel,
    riskScore: Math.round(cappedScore),
    summary,
    detectedSignals: signals,
    recommendedAction,
    confidence,
    technical: {
      categoryScores,
      triggeredCategories,
      rawScore,
    },
  };
}
