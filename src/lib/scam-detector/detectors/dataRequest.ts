import type { Detector, Signal } from "../types";

interface Pattern {
  id: string;
  regex: RegExp;
  severity: Signal["severity"];
  label: string;
  explanation: string;
}

// These are the highest-weight signals in the whole engine: no legitimate
// bank, courier, or marketplace ever asks for these things via SMS/chat link.
const PATTERNS: Pattern[] = [
  {
    id: "data.blik-code",
    regex: /kod blik/,
    severity: "critical",
    label: "Prośba o kod BLIK",
    explanation:
      "Wiadomość prosi o podanie kodu BLIK. Kod BLIK jednorazowo autoryzuje płatność — podanie go komukolwiek jest równoznaczne z oddaniem pieniędzy. Żadna legalna firma nigdy o to nie prosi.",
  },
  {
    id: "data.card-details",
    regex: /(numer karty|cvv|data waznosci karty|kod cvc)/,
    severity: "critical",
    label: "Prośba o dane karty płatniczej",
    explanation:
      "Wiadomość prosi o numer karty, CVV lub datę ważności. Te dane pozwalają na wykonanie płatności bez Twojej dodatkowej zgody.",
  },
  {
    id: "data.login-password",
    regex: /(podaj haslo|podaj login|dane logowania|zaloguj sie i podaj)/,
    severity: "critical",
    label: "Prośba o dane logowania",
    explanation:
      "Wiadomość prosi o login/hasło do konta — to klasyczny phishing mający wykraść dostęp do Twojego konta bankowego lub innego serwisu.",
  },
  {
    id: "data.sms-code",
    regex: /(kod sms|kod autoryzacyjny|kod weryfikacyjny)/,
    severity: "critical",
    label: "Prośba o kod SMS/autoryzacyjny",
    explanation:
      "Jednorazowe kody SMS służą do autoryzacji operacji na koncie. Podanie takiego kodu pozwala oszustowi przejąć kontrolę nad Twoim kontem lub płatnością.",
  },
  {
    id: "data.pesel",
    regex: /\bpesel\b/,
    severity: "high",
    label: "Prośba o numer PESEL",
    explanation:
      "Wiadomość prosi o numer PESEL — wrażliwe dane osobowe, które mogą posłużyć do kradzieży tożsamości lub wyłudzeń.",
  },
  {
    id: "data.id-scan",
    regex: /(skan dowodu|zdjecie dowodu osobistego|przeslij dowod)/,
    severity: "high",
    label: "Prośba o skan dowodu osobistego",
    explanation:
      "Wiadomość prosi o przesłanie skanu/zdjęcia dowodu osobistego — dokument ten może posłużyć do wyłudzeń na Twoje dane.",
  },
];

export const detectDataRequestRisk: Detector = (_text, normalized) => {
  const signals: Signal[] = [];
  for (const p of PATTERNS) {
    if (p.regex.test(normalized)) {
      signals.push({
        id: p.id,
        category: "data",
        severity: p.severity,
        label: p.label,
        explanation: p.explanation,
      });
    }
  }
  return signals;
};
