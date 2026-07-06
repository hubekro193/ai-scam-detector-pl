import type { Detector, Signal } from "../types";
import { containsFuzzyPhrase } from "../fuzzy";

interface Pattern {
  id: string;
  regex: RegExp;
  severity: Signal["severity"];
  label: string;
  explanation: string;
  /**
   * Bare keyword patterns (e.g. "kod blik", "numer karty") also match
   * legitimate messages that MENTION the term while warning you not to
   * share it — real banks send "Twój kod weryfikacyjny: 123456. Nie
   * podawaj go nikomu." That's the opposite of a scam. Guarded patterns
   * get suppressed when the message has a "don't share this" disclaimer
   * and no actual request verb telling the reader to hand something over.
   */
  guarded?: boolean;
  /**
   * Fallback fuzzy phrase checks (see fuzzy.ts) — catch inflected word
   * forms and typos the regex stem misses, without rewriting the regex
   * into an unreadable pile of alternations. Any phrase matching counts.
   */
  fuzzyPhrases?: string[][];
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
    guarded: true,
  },
  {
    id: "data.card-details",
    regex: /(numer karty|cvv|data waznosci karty|kod cvc)/,
    severity: "critical",
    label: "Prośba o dane karty płatniczej",
    explanation:
      "Wiadomość prosi o numer karty, CVV lub datę ważności. Te dane pozwalają na wykonanie płatności bez Twojej dodatkowej zgody.",
    guarded: true,
  },
  {
    id: "data.login-password",
    regex: /(podaj haslo|podaj login|dane logowania|zaloguj sie i podaj)/,
    severity: "critical",
    label: "Prośba o dane logowania",
    explanation:
      "Wiadomość prosi o login/hasło do konta — to klasyczny phishing mający wykraść dostęp do Twojego konta bankowego lub innego serwisu.",
    guarded: true,
    fuzzyPhrases: [["podaj", "haslo"], ["podaj", "login"], ["dane", "logowania"], ["zaloguj", "podaj"]],
  },
  {
    id: "data.sms-code",
    regex: /(kod sms|kod autoryzacyjny|kod weryfikacyjny)/,
    severity: "critical",
    label: "Prośba o kod SMS/autoryzacyjny",
    explanation:
      "Jednorazowe kody SMS służą do autoryzacji operacji na koncie. Podanie takiego kodu pozwala oszustowi przejąć kontrolę nad Twoim kontem lub płatnością.",
    guarded: true,
  },
  {
    id: "data.pesel",
    regex: /\bpesel\b/,
    severity: "high",
    label: "Prośba o numer PESEL",
    explanation:
      "Wiadomość prosi o numer PESEL — wrażliwe dane osobowe, które mogą posłużyć do kradzieży tożsamości lub wyłudzeń.",
    guarded: true,
  },
  {
    id: "data.id-scan",
    regex: /(skan\w* dowodu|zdjeci\w* dowodu osobist\w*|przesli\w* dowod\w*)/,
    severity: "high",
    label: "Prośba o skan dowodu osobistego",
    explanation:
      "Wiadomość prosi o przesłanie skanu/zdjęcia dowodu osobistego — dokument ten może posłużyć do wyłudzeń na Twoje dane.",
    // This exact pattern caused a real bug (Module 10): "skanu dowodu"
    // didn't match the "skan dowodu" stem. Fuzzy phrase matching as a
    // fallback catches that whole class of inflection mismatches.
    fuzzyPhrases: [["skan", "dowodu"], ["zdjecie", "dowodu"], ["przeslij", "dowod"]],
  },
];

// "Nie podawaj/udostępniaj/przekazuj [tego] nikomu" — the standard disclaimer
// legitimate OTP messages and anti-phishing PSAs use.
const DISCLAIMER_REGEX =
  /(nie\s+\w*(podawaj|udostepniaj|przekazuj|wysylaj)\w*.{0,20}nikomu|nikomu\s+(nie\s+)?\w*(podawaj|udostepniaj|przekazuj)\w*|nigdy\s+nie\s+pros\w*)/;

// Actual request verbs — present when someone is asking the reader to hand
// something over, as opposed to a service just stating the reader's own code.
const REQUEST_VERB_REGEX =
  /(podaj\w*|wyslij\w*|przeslij\w*|przekaz\w*|wpisz\w*|dyktuj\w*|powiedz\w*|odczytaj\w*)/;

function matchesPattern(normalized: string, p: Pattern): boolean {
  if (p.regex.test(normalized)) return true;
  return (p.fuzzyPhrases ?? []).some((phrase) => containsFuzzyPhrase(normalized, phrase));
}

export const detectDataRequestRisk: Detector = (_text, normalized) => {
  const signals: Signal[] = [];

  const hasDisclaimer = DISCLAIMER_REGEX.test(normalized);
  const hasRequestVerb = REQUEST_VERB_REGEX.test(normalized);
  const looksLikeLegitNotice = hasDisclaimer && !hasRequestVerb;

  for (const p of PATTERNS) {
    if (!matchesPattern(normalized, p)) continue;
    if (p.guarded && looksLikeLegitNotice) continue;

    signals.push({
      id: p.id,
      category: "data",
      severity: p.severity,
      label: p.label,
      explanation: p.explanation,
    });
  }
  return signals;
};
