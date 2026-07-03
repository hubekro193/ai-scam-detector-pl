import type { Detector, Signal } from "../types";

/**
 * Language/grammar signals are intentionally kept at low-medium severity.
 *
 * Calibration note (Module 1 insight): a few years ago broken Polish was a
 * strong scam indicator. Modern scammers increasingly use AI translation
 * tools, so grammar quality alone is no longer reliable. We still flag it,
 * but it should never dominate the score on its own.
 */
export const detectLanguageRisk: Detector = (text, normalized) => {
  const signals: Signal[] = [];

  // Shouting: long all-caps words (PILNE, UWAGA, WAŻNE) — original case matters here.
  const capsWords = text.match(/\b[A-ZĄĆĘŁŃÓŚŹŻ]{4,}\b/g) ?? [];
  if (capsWords.length > 0) {
    signals.push({
      id: "language.shouting-caps",
      category: "language",
      severity: "low",
      label: "Krzyczące WIELKIE LITERY",
      explanation:
        "Wiadomość używa słów pisanych wielkimi literami, by przyciągnąć uwagę i wywołać emocjonalną reakcję.",
      evidence: capsWords.slice(0, 3).join(", "),
    });
  }

  // Excessive exclamation marks.
  if (/!!!+/.test(text)) {
    signals.push({
      id: "language.excessive-punctuation",
      category: "language",
      severity: "low",
      label: "Nadmiar wykrzykników",
      explanation: "Wiele wykrzykników z rzędu to typowy zabieg wzmacniający presję emocjonalną.",
    });
  }

  // Generic, impersonal greeting.
  if (/(szanowny kliencie|drogi uzytkowniku|szanowny panie\/pani)/.test(normalized)) {
    signals.push({
      id: "language.generic-greeting",
      category: "language",
      severity: "low",
      label: "Ogólnikowe powitanie",
      explanation:
        "Wiadomość zwraca się do Ciebie bezosobowo (\"Szanowny Kliencie\") zamiast użyć Twojego imienia — typowe dla masowo wysyłanych wiadomości phishingowych.",
    });
  }

  return signals;
};
