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
    id: "identity.new-number-friend",
    regex: /(mam nowy numer|to ja,? dzwonie z innego numeru|pisze z nowego numeru)/,
    severity: "high",
    label: "Podszycie się pod znajomego/rodzinę (nowy numer)",
    explanation:
      "Klasyczny wzorzec oszustwa \"na BLIK\": ktoś podaje się za znajomego lub członka rodziny piszącego z nowego numeru, licząc na to, że nie zweryfikujesz tożsamości przed pomocą finansową.",
  },
  {
    id: "identity.authority-office",
    regex: /(urzad skarbowy|\bzus\b|komornik|policja|e-mandat|prokuratura)/,
    severity: "medium",
    label: "Powołanie się na urząd/instytucję państwową",
    explanation:
      "Wiadomość powołuje się na urząd lub instytucję państwową. Takie instytucje nie informują o zaległościach czy mandatach przez SMS/link z prośbą o natychmiastową płatność.",
  },
  {
    id: "identity.bank-generic",
    regex: /(twoj bank informuje|dzial bezpieczenstwa banku|infolinia bankowa)/,
    severity: "medium",
    label: "Powołanie się na bank bez podania nazwy",
    explanation:
      "Wiadomość mówi ogólnie o \"banku\" bez podania konkretnej, sprawdzalnej nazwy — utrudnia to weryfikację i jest typowe dla wiadomości masowych.",
  },
  {
    id: "identity.employer",
    regex: /(dzial kadr|twoj pracodawca|z ramienia firmy)/,
    severity: "low",
    label: "Powołanie się na pracodawcę",
    explanation:
      "Wiadomość powołuje się na pracodawcę lub dział kadr — warto zweryfikować nadawcę innym, znanym kanałem kontaktu.",
  },
  {
    id: "identity.emotional-money-request",
    regex: /(utkn\w+.{0,40}(pieni\w+|kas\w+)|potrzebuj\w+ pilnie pieni\w+|pozycz\w* mi.{0,20}(pieni\w+|zl)|prosz\w* o pomoc finansow\w+)/,
    severity: "high",
    label: "Emocjonalna prośba o pilny przelew pieniędzy",
    explanation:
      "Wiadomość buduje presję emocjonalną (np. \"utknąłem, brakuje mi pieniędzy\"), by skłonić Cię do szybkiego przelewu bez zastanowienia — częsty wzorzec w oszustwach \"na bliską osobę\" i romance scamach.",
  },
  {
    id: "identity.sender-prefix",
    regex: /^(inpost|dpd|dhl|allegro|olx|poczta polska|blik)(\s+\w+){0,2}\s*[:\-]/,
    severity: "low",
    label: "Wiadomość podszywa się pod znaną markę w nagłówku",
    explanation:
      "Wiadomość zaczyna się od nazwy znanej marki jako \"nadawcy\" — w SMS-ach nazwa nadawcy może być łatwo podrobiona (tzw. spoofing), więc sama nazwa niczego nie potwierdza.",
  },
];

export const detectIdentityRisk: Detector = (_text, normalized) => {
  const signals: Signal[] = [];
  for (const p of PATTERNS) {
    if (p.regex.test(normalized)) {
      signals.push({
        id: p.id,
        category: "identity",
        severity: p.severity,
        label: p.label,
        explanation: p.explanation,
      });
    }
  }
  return signals;
};
