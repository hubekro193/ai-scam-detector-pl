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
    id: "payment.small-topup",
    regex: /doplat\w*/,
    severity: "high",
    label: "Prośba o drobną dopłatę",
    explanation:
      "Prośba o niewielką \"dopłatę\" (często 1-2 zł) to popularny trik: mała kwota usypia czujność, ale strona płatności wyłudza pełne dane karty do dalszych, większych obciążeń.",
  },
  {
    id: "payment.outside-platform",
    regex: /(przelew bezposrednio|zaplac poza (allegro|olx|platforma)|platnosc poza serwisem|przelej na numer konta)/,
    severity: "critical",
    label: "Płatność poza oficjalną platformą",
    explanation:
      "Wiadomość namawia do zapłaty poza oficjalnym systemem płatności platformy (np. Allegro, OLX). Poza platformą tracisz ochronę kupującego/sprzedającego.",
  },
  {
    id: "payment.already-paid-confirm",
    regex: /(juz zaplacilem|kupujacy zaplacil|kliknij (aby |żeby )?odebrac (pieniadze|srodki|platnosc)|potwierdz odbior platnosci)/,
    severity: "high",
    label: "\"Odbierz pieniądze\" — odwrócony scam płatniczy",
    explanation:
      "Wiadomość sugeruje, że ktoś już zapłacił i musisz \"potwierdzić odbiór\" klikając link. W rzeczywistości to Ty tracisz dane karty lub pieniądze — nikt nie musi klikać linku, by otrzymać przelew.",
  },
  {
    id: "payment.extra-delivery-fee",
    regex: /(doplat\w* za dostaw\w*|oplac\w* dostaw\w*|brakujac\w* oplat\w* za przesylk\w*)/,
    severity: "high",
    label: "Nieoczekiwana opłata za dostawę",
    explanation:
      "Prośba o dodatkową opłatę za dostawę, o której nie było mowy wcześniej — typowy scam \"na kuriera\" wykorzystujący fałszywą stronę płatności.",
  },
  {
    id: "payment.customs-fee",
    regex: /(oplat\w* celn\w*|\bclo\b|podatek importowy|oplata celna)/,
    severity: "high",
    label: "Rzekoma opłata celna",
    explanation:
      "Wiadomość żąda drobnej \"opłaty celnej\" za przesyłkę — częsty wariant scamu kurierskiego, szczególnie przy rzekomych paczkach z zagranicy. Prawdziwe cło nie jest pobierane w ten sposób.",
  },
];

export const detectPaymentRisk: Detector = (_text, normalized) => {
  const signals: Signal[] = [];
  for (const p of PATTERNS) {
    if (p.regex.test(normalized)) {
      signals.push({
        id: p.id,
        category: "payment",
        severity: p.severity,
        label: p.label,
        explanation: p.explanation,
      });
    }
  }
  return signals;
};
