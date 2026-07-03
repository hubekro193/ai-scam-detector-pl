import type { Detector, Signal } from "../types";

interface Pattern {
  id: string;
  regex: RegExp;
  severity: Signal["severity"];
  label: string;
  explanation: string;
}

const PATTERNS: Pattern[] = [
  {
    id: "pressure.account-blocked",
    regex: /(konto (zostanie |zostalo )?zablokowane|zablokujemy twoje konto|dostep zostanie zawieszony)/,
    severity: "high",
    label: "Groźba zablokowania konta",
    explanation:
      "Wiadomość grozi zablokowaniem konta, aby wywołać strach i skłonić do szybkiego, bezmyślnego działania.",
  },
  {
    id: "pressure.deadline-short",
    regex: /(w ciagu (\d+ )?(minut|godzin)|w ciagu \d+\s*h\b|masz (\d+ )?(minut|godzin)|do konca dnia|dzis(iaj)? do godz\w*\.?\s*\d+)/,
    severity: "high",
    label: "Bardzo krótki termin na reakcję",
    explanation:
      "Wiadomość narzuca bardzo krótki termin (minuty/godziny), by nie dać Ci czasu na przemyślenie lub weryfikację.",
  },
  {
    id: "pressure.last-chance",
    regex: /(ostatnia szansa|ostatni dzien|to twoja ostatnia|nie przegap)/,
    severity: "medium",
    label: "Presja \"ostatniej szansy\"",
    explanation:
      "Fraza sugerująca, że to ostatnia okazja do działania — klasyczna technika wywierania presji czasowej.",
  },
  {
    id: "pressure.parcel-return",
    regex: /(zwrot (paczki|przesylki) do nadawcy|przesylka (zostanie |zostanie zwrocona|wroci) do nadawcy|paczka wroci do nadawcy)/,
    severity: "medium",
    label: "Groźba zwrotu przesyłki",
    explanation:
      "Wiadomość grozi zwrotem paczki do nadawcy, jeśli nie zareagujesz natychmiast — typowe dla scamów \"na kuriera\".",
  },
  {
    id: "pressure.confirm-now",
    regex: /(potwierdz teraz|dzialaj natychmiast|natychmiastowej reakcji|wymagane natychmiast|pilne|uwaga)/,
    severity: "medium",
    label: "Wezwanie do natychmiastowego działania",
    explanation:
      "Słowa takie jak \"pilne\" czy \"natychmiast\" mają wywołać emocjonalną reakcję zamiast racjonalnej weryfikacji.",
  },
  {
    id: "pressure.payment-waiting",
    regex: /(platnosc oczekuje|zwrot srodkow oczekuje|twoja wplata czeka)/,
    severity: "medium",
    label: "Presja \"czekających\" pieniędzy",
    explanation:
      "Sugestia, że pieniądze na Ciebie \"czekają\" i musisz działać szybko, by je odebrać — częsty haczyk w scamach.",
  },
];

export const detectPressureRisk: Detector = (_text, normalized) => {
  const signals: Signal[] = [];
  for (const p of PATTERNS) {
    if (p.regex.test(normalized)) {
      signals.push({
        id: p.id,
        category: "pressure",
        severity: p.severity,
        label: p.label,
        explanation: p.explanation,
      });
    }
  }
  return signals;
};
