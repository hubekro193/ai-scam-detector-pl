import type { Detector, Signal } from "../types.js";

export const detectContextRisk: Detector = (_text, normalized) => {
  const signals: Signal[] = [];

  // Platform bypass: moving an OLX/Allegro conversation to WhatsApp/SMS loses
  // the platform's buyer/seller protection — a strong, well-documented pattern.
  if (
    /(napisz (do mnie )?na whatsapp|przenies\w*\s+(ta\s+)?rozmow\w*|kontakt poza (allegro|olx|aplikacja|platforma)|napisz na messenger)/.test(
      normalized
    )
  ) {
    signals.push({
      id: "context.platform-bypass",
      category: "context",
      severity: "high",
      label: "Próba przeniesienia rozmowy poza platformę",
      explanation:
        "Wiadomość namawia do kontynuowania rozmowy poza oficjalną platformą (np. z OLX/Allegro na WhatsApp). Poza platformą nie działa ochrona transakcji ani historia rozmowy jako dowód.",
    });
  }

  // Vague account problem without any specifics (order/case number, date, amount).
  if (/(wykryto (nietypowa|podejrzana) aktywnosc|wykryto problem z (twoim )?kontem|nieautoryzowana proba logowania)/.test(normalized)) {
    signals.push({
      id: "context.vague-account-issue",
      category: "context",
      severity: "medium",
      label: "Niesprecyzowany \"problem z kontem\"",
      explanation:
        "Wiadomość ogólnikowo informuje o problemie z kontem, bez żadnych sprawdzalnych szczegółów (data, kwota, numer sprawy) — utrudnia to weryfikację, co jest typowe dla wiadomości masowych.",
    });
  }

  // Vague delivery/address problem — same "unverifiable pretext" pattern as
  // the account-issue signal above, just about an address instead of an account.
  if (/(brak (numeru )?ulicy|brak kodu pocztowego|nieprawidlowy adres dostawy|uzupelnij adres|zaktualizuj (informacje o wysylce|dane adresowe))/.test(normalized)) {
    signals.push({
      id: "context.vague-address-issue",
      category: "context",
      severity: "medium",
      label: "Niesprecyzowany \"problem z adresem\"",
      explanation:
        "Wiadomość ogólnikowo informuje o problemie z adresem/dostawą, bez konkretnych danych zamówienia, i namawia do kliknięcia linku, by to \"naprawić\" — typowy pretekst w phishingu kurierskim.",
    });
  }

  // "Reply Y, then close and reopen the SMS to activate the link" — a
  // well-documented smishing technique (used by real SMS-worm campaigns
  // impersonating couriers across Europe) designed to get the recipient to
  // interact with the message so carrier/OS spam filters and link previews
  // are bypassed. No legitimate courier/bank ever needs you to "activate" a
  // link this way — this phrasing alone is a near-certain scam signature.
  if (
    /(aby aktywowac (link|wiadomosc)|zamknij i (ponownie )?otworz (wiadomosc|sms)|odpowiedz\s*[„"']?[a-z]{1,3}[„"']?\s*,?\s*a nastepnie)/.test(
      normalized
    )
  ) {
    signals.push({
      id: "context.interaction-trick",
      category: "context",
      severity: "critical",
      label: "Prośba o \"aktywację\" linku przez odpowiedź/zamknięcie SMS-a",
      explanation:
        "Wiadomość prosi o odpowiedź jednym znakiem i zamknięcie/ponowne otwarcie SMS-a, by \"aktywować\" link. To znana technika stosowana w kampaniach smishingowych, mająca ominąć filtry antyspamowe operatora i skłonić Cię do interakcji z wiadomością. Żaden legalny kurier ani bank tego nie wymaga.",
    });
  }

  // Mentions an order/parcel but gives no order/tracking number to verify against.
  const mentionsOrderOrParcel = /(zamowien|przesylk|paczk)/.test(normalized);
  const hasTrackingNumber = /\b\d{4,}\b/.test(normalized);
  if (mentionsOrderOrParcel && !hasTrackingNumber) {
    signals.push({
      id: "context.missing-order-number",
      category: "context",
      severity: "low",
      label: "Brak numeru zamówienia/przesyłki",
      explanation:
        "Wiadomość mówi o zamówieniu lub przesyłce, ale nie podaje żadnego konkretnego numeru do zweryfikowania w oficjalnej aplikacji.",
    });
  }

  return signals;
};
