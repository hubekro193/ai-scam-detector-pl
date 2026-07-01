/**
 * Safe, fully fictional test messages for Module 9 (test dataset).
 *
 * Rules followed here (per project safety policy):
 * - all domains are placeholders under example.com — none of them resolve or exist
 * - no real credentials, phone numbers, or working malicious instructions
 * - messages are representative of real PL scam patterns, but are original,
 *   clearly-fictional constructions, not copies of real live scam text
 */

export interface TestMessage {
  id: string;
  label: string;
  /** Rough expectation used only to sanity-check the engine — not a hard contract. */
  expectedLevel: "Low" | "Medium" | "High" | "Critical";
  message: string;
}

export const TEST_MESSAGES: TestMessage[] = [
  {
    id: "courier-topup-scam",
    label: "Kurier: fałszywa dopłata do przesyłki",
    expectedLevel: "Critical",
    message:
      "InPost: Twoja przesylka nr 336721 nie moze zostac dostarczona z powodu brakujacej doplaty 1,50 zl. Brak wplaty w ciagu 24h spowoduje zwrot paczki do nadawcy. Uregyluj platnosc: http://inpost-oplata.example.com/pay?id=336721",
  },
  {
    id: "bank-phishing-critical",
    label: "Bank: phishing z prośbą o login i kod SMS",
    expectedLevel: "Critical",
    message:
      "Szanowny Kliencie, wykryto nieautoryzowana probe logowania do Twojego konta. Aby je zabezpieczyc, zaloguj sie i podaj kod SMS w ciagu 15 minut: http://mbank-bezpieczenstwo.example.xyz/logowanie. W przeciwnym razie konto zostanie zablokowane.",
  },
  {
    id: "blik-friend-scam",
    label: "\"Na BLIKA\" — podszycie się pod znajomego",
    expectedLevel: "Critical",
    message:
      "Czesc, to ja, mam nowy numer. Pilnie potrzebuje pomocy, czy mozesz mi wyslac kod BLIK na 300 zl? Oddam jutro rano, dzieki wielkie!",
  },
  {
    id: "reversed-payment-olx",
    label: "OLX: odwrócony scam \"kupujący już zapłacił\"",
    expectedLevel: "Critical",
    message:
      "Dzien dobry, jestem zainteresowany Pana ogloszeniem. Juz zaplacilem przez OLX Dostawa, prosze kliknac ponizszy link aby potwierdzic odbior platnosci: http://olx-platnosc-dostawa.example.com/confirm",
  },
  {
    id: "whatsapp-bypass-medium",
    label: "Allegro: próba przeniesienia rozmowy na WhatsApp",
    expectedLevel: "Medium",
    message:
      "Witam, jestem zainteresowana zakupem. Czy mozemy przeniesc rozmowe na WhatsApp, tak bedzie mi wygodniej? Moj numer to +48 5XX XXX XXX.",
  },
  {
    id: "legit-parcel-notification",
    label: "Legalne powiadomienie o przesyłce (niskie ryzyko)",
    expectedLevel: "Low",
    message:
      "Twoja przesylka nr 4471182399 jest w drodze i zostanie dostarczona jutro miedzy 10:00 a 14:00. Sledz status w aplikacji InPost.",
  },
  {
    id: "friendly-chat",
    label: "Zwykła wiadomość bez sygnałów ryzyka",
    expectedLevel: "Low",
    message: "Hej, jak minal weekend? Widzimy sie jutro na tym samym miejscu co zwykle?",
  },
];
