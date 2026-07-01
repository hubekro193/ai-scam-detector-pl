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
