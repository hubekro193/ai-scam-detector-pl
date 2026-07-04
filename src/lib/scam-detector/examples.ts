/**
 * Safe, fully fictional test messages for Module 9 (test dataset) and
 * Module 10 (evaluation — see evaluate.ts for precision/recall metrics).
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
  /**
   * Ground truth for statistical evaluation (Module 10): is this message
   * actually a scam/phishing attempt, independent of which risk tier the
   * engine assigns it? Used by evaluate.ts to compute precision/recall
   * against the binary "flagged vs not flagged" decision.
   */
  isScam: boolean;
  message: string;
}

export const TEST_MESSAGES: TestMessage[] = [
  // ─────────────────────────── True positives (scams) ───────────────────────────
  {
    id: "courier-topup-scam",
    label: "Kurier: fałszywa dopłata do przesyłki",
    expectedLevel: "Critical",
    isScam: true,
    message:
      "InPost: Twoja przesylka nr 336721 nie moze zostac dostarczona z powodu brakujacej doplaty 1,50 zl. Brak wplaty w ciagu 24h spowoduje zwrot paczki do nadawcy. Uregyluj platnosc: http://inpost-oplata.example.com/pay?id=336721",
  },
  {
    id: "bank-phishing-critical",
    label: "Bank: phishing z prośbą o login i kod SMS",
    expectedLevel: "Critical",
    isScam: true,
    message:
      "Szanowny Kliencie, wykryto nieautoryzowana probe logowania do Twojego konta. Aby je zabezpieczyc, zaloguj sie i podaj kod SMS w ciagu 15 minut: http://mbank-bezpieczenstwo.example.xyz/logowanie. W przeciwnym razie konto zostanie zablokowane.",
  },
  {
    id: "blik-friend-scam",
    label: "\"Na BLIKA\" — podszycie się pod znajomego",
    expectedLevel: "Critical",
    isScam: true,
    message:
      "Czesc, to ja, mam nowy numer. Pilnie potrzebuje pomocy, czy mozesz mi wyslac kod BLIK na 300 zl? Oddam jutro rano, dzieki wielkie!",
  },
  {
    id: "reversed-payment-olx",
    label: "OLX: odwrócony scam \"kupujący już zapłacił\"",
    expectedLevel: "Critical",
    isScam: true,
    message:
      "Dzien dobry, jestem zainteresowany Pana ogloszeniem. Juz zaplacilem przez OLX Dostawa, prosze kliknac ponizszy link aby potwierdzic odbior platnosci: http://olx-platnosc-dostawa.example.com/confirm",
  },
  {
    id: "whatsapp-bypass-medium",
    label: "Allegro: próba przeniesienia rozmowy na WhatsApp",
    expectedLevel: "Medium",
    isScam: true,
    message:
      "Witam, jestem zainteresowana zakupem. Czy mozemy przeniesc rozmowe na WhatsApp, tak bedzie mi wygodniej? Moj numer to +48 5XX XXX XXX.",
  },
  {
    id: "dhl-customs-fee-real-diacritics",
    label: "DHL: rzekoma opłata celna (pełne polskie znaki)",
    expectedLevel: "Critical",
    isScam: true,
    message:
      "DHL Express: Twoja paczka została wstrzymana z powodu brakującej opłaty celnej w wysokości 2,99 zł. Jeśli opłata nie zostanie uregulowana dzisiaj do godz. 18:00, przesyłka zostanie zwrócona do nadawcy. Aby potwierdzić dostawę, przejdź do formularza: https://dhl-paczka24.example.com/oplata/PL-839204 Numer przesyłki: DHL489203771PL",
  },
  {
    id: "inpost-address-issue-defanged",
    label: "InPost: fałszywy problem z adresem (link w formie zdefangowanej)",
    expectedLevel: "High",
    isScam: true,
    message:
      "Twoja paczka została wstrzymana z powodu braku numeru ulicy na paczce. Zaktualizuj informacje o wysyłce: hxxps://inpost-weryfikacja[.]example[.]com/PL",
  },
  {
    id: "dpd-reply-y-activation-trick",
    label: "DPD: technika \"odpowiedz Y i aktywuj link\"",
    expectedLevel: "Critical",
    isScam: true,
    message:
      "DPD - Powiadomienie o próbie doręczenia: Dzisiaj o godz. 10:02 nasz kurier Piotr Laskowski (ID: DPD-3721) próbował dostarczyć paczkę, ale nie udało się tego zrobić, ponieważ nie udało się skontaktować z odbiorcą. Umów ponowną dostawę na naszej stronie internetowej: https://dpd-example.example.link/pl (Odpowiedz „Y\", a następnie zamknij i ponownie otwórz wiadomość SMS, aby aktywować link.)",
  },
  {
    id: "dpd-reply-y-activation-trick-variant",
    label: "DPD: wariant techniki aktywacyjnej (inne sformułowanie)",
    expectedLevel: "Critical",
    isScam: true,
    message:
      "DPD: Dzień dobry, nasz kurier tymczasowo nie mógł umieścić Państwa przesyłki w paczkomacie. Prosimy o ponowne umówienie dostawy: https://moj-dpd.example.com (Proszę odpowiedzieć Y. Następnie zakończ wiadomość i ponownie otwórz link aktywacyjny lub skopiuj go do przeglądarki Safari i otwórz.)",
  },
  {
    id: "tax-office-impersonation",
    label: "Urząd Skarbowy: fałszywa zaległość podatkowa",
    expectedLevel: "Critical",
    isScam: true,
    message:
      "URZĄD SKARBOWY: Stwierdzono zaległość podatkową w wysokości 230 zł. Uregyluj płatność w ciągu 48 godzin, aby uniknąć postępowania egzekucyjnego: http://e-us-platnosc.example.pl/zaplac",
  },
  {
    id: "fake-job-offer-id-scan",
    label: "Fałszywa oferta pracy: opłata weryfikacyjna + skan dowodu",
    expectedLevel: "High",
    isScam: true,
    message:
      "Gratulacje! Zostales zakwalifikowany do pracy zdalnej z wynagrodzeniem 6000 zl miesiecznie. Aby potwierdzic zatrudnienie, przeslij skan dowodu osobistego oraz oplac oplate weryfikacyjna w wysokosci 50 zl na konto szkoleniowe.",
  },
  {
    id: "shortened-link-prize-scam",
    label: "Rzekoma wygrana z linkiem skróconym (bit.ly)",
    expectedLevel: "High",
    isScam: true,
    message:
      "Gratulacje! Wygrales bezplatna karte podarunkowa o wartosci 500 zl. To Twoja ostatnia szansa, oferta wazna tylko dzisiaj. Odbierz tutaj: https://bit.ly/xK9dQ2 Nie przegap!!!",
  },
  {
    id: "olx-outside-platform-payment",
    label: "OLX: namowa do zapłaty poza platformą",
    expectedLevel: "High",
    isScam: true,
    message:
      "Dzien dobry, jest Pan zainteresowany moja oferta? Wolalabym, zeby zaplacil Pan bezposrednio przelewem, pomijajac platnosc OLX — tak bedzie szybciej dla nas obu.",
  },
  {
    id: "crypto-investment-scam",
    label: "Fałszywa inwestycja kryptowalutowa z presją czasu",
    expectedLevel: "High",
    isScam: true,
    message:
      "Znana osoba poleca te platforme inwestycyjna! Zainwestuj juz 200 zl, a otrzymasz zwrot 2000 zl w 24 godziny. To ostatnia szansa, oferta znika o polnocy: http://krypto-inwestycja.example.online",
  },
  {
    id: "poczta-polska-customs-fee",
    label: "Poczta Polska: rzekoma opłata celna",
    expectedLevel: "Critical",
    isScam: true,
    message:
      "Poczta Polska: Nie mozna dostarczyc przesylki z powodu nieuiszczonej oplaty celnej w wysokosci 3,50 zl. Zaplac w ciagu 2 godzin: http://poczta-platnosc.example.top/oplac",
  },
  {
    id: "whatsapp-investment-group-scam",
    label: "Grupa inwestycyjna WhatsApp z presją i linkiem",
    expectedLevel: "Medium",
    isScam: true,
    message:
      "Dolacz do naszej grupy inwestycyjnej na WhatsApp, gdzie codziennie dzielimy sie sygnalami dajacymi 300% zwrotu! Nie przegap, miejsca sie koncza: https://chat.whatsapp.example.link/invite123",
  },
  {
    id: "romance-scam-emotional-money-request",
    label: "Emocjonalna prośba o pilny przelew (\"utknąłem na lotnisku\")",
    expectedLevel: "Medium",
    isScam: true,
    message:
      "Kochanie, utknalem na lotnisku i brakuje mi pieniedzy na bilet powrotny. Czy mozesz przeslac 500 zl na to konto, oddam jak tylko wroce?",
  },
  {
    id: "facebook-lottery-pesel-request",
    label: "Fałszywa loteria Facebook z prośbą o PESEL",
    expectedLevel: "High",
    isScam: true,
    message:
      "Gratulujemy wygranej w loterii na Facebooku! Aby odebrac nagrode 5000 zl, wypelnij formularz podajac imie, nazwisko i numer PESEL: http://facebook-loteria.example.cc/odbierz",
  },
  {
    id: "bank-full-takeover-critical",
    label: "Fałszywe odblokowanie konta: login + numer karty naraz",
    expectedLevel: "Critical",
    isScam: true,
    message:
      "ING: Twoje konto zostalo tymczasowo zablokowane z powodu podejrzanej transakcji. Aby je odblokowac, zaloguj sie i podaj dane logowania oraz numer karty: http://ing-odblokowanie.example.site",
  },
  {
    id: "fake-tax-refund-blik",
    label: "Fałszywy zwrot podatku z prośbą o kod BLIK",
    expectedLevel: "Critical",
    isScam: true,
    message:
      "Urzad Skarbowy: Przysluguje Ci zwrot podatku w wysokosci 437 zl. Aby otrzymac zwrot, podaj kod BLIK w ciagu 30 minut: http://zwrot-podatku.example.club/odbierz",
  },
  {
    id: "fake-hr-department-login",
    label: "Fałszywy dział kadr: prośba o dane logowania do portalu",
    expectedLevel: "Critical",
    isScam: true,
    message:
      "Dzial kadr: W zwiazku z aktualizacja systemu placowego prosimy, abys zalogowal sie i podal dane logowania do portalu pracownika w ciagu 24h: http://portal-pracowniczy.example.top/logowanie",
  },

  // ─────────────────────────── True negatives (legit messages) ───────────────────────────
  {
    id: "legit-parcel-notification",
    label: "Legalne powiadomienie o przesyłce (niskie ryzyko)",
    expectedLevel: "Low",
    isScam: false,
    message:
      "Twoja przesylka nr 4471182399 jest w drodze i zostanie dostarczona jutro miedzy 10:00 a 14:00. Sledz status w aplikacji InPost.",
  },
  {
    id: "friendly-chat",
    label: "Zwykła wiadomość bez sygnałów ryzyka",
    expectedLevel: "Low",
    isScam: false,
    message: "Hej, jak minal weekend? Widzimy sie jutro na tym samym miejscu co zwykle?",
  },
  {
    id: "legit-delivery-confirmation-request",
    label: "Legalne pytanie o potwierdzenie obecności przy dostawie",
    expectedLevel: "Low",
    isScam: false,
    message:
      "Dzien dobry, na jutro (04.10.2024) okolo godziny 11:00-13:00 planowana jest dostawa przesylki z wniesieniem. Prosimy o potwierdzenie smsem zwrotnym czy pod adresem kurierzy zastana kogos w tym terminie. Pozdrawiamy, AmbroExpress",
  },
  {
    id: "vague-account-warning-no-link",
    label: "Niesprecyzowane ostrzeżenie o koncie (bez linku i bez prośby o dane)",
    expectedLevel: "Low",
    isScam: false,
    message:
      "Wykryto podejrzana aktywnosc na Twoim koncie. Sprawdz szczegoly logujac sie samodzielnie do swojej bankowosci internetowej.",
  },
  {
    // Real-world false-positive class: legitimate OTP messages MENTION the
    // sensitive term while warning you not to share it. Regression test for
    // the dataRequest.ts "guarded" pattern fix.
    id: "legit-otp-with-disclaimer",
    label: "Legalny kod weryfikacyjny z zastrzeżeniem \"nie udostępniaj\"",
    expectedLevel: "Low",
    isScam: false,
    message:
      "Twoj kod weryfikacyjny do potwierdzenia platnosci to: 583920. Nie podawaj go nikomu, nawet pracownikowi banku. Kod jest wazny 5 minut.",
  },
  {
    // Same false-positive class as above, third-person phrasing ("nigdy nie
    // prosi" — a real anti-phishing PSA a bank might send).
    id: "legit-anti-phishing-psa",
    label: "Legalne ostrzeżenie banku przed phishingiem",
    expectedLevel: "Low",
    isScam: false,
    message:
      "Bank XYZ nigdy nie prosi o podanie hasla, kodu BLIK ani numeru karty przez SMS lub telefon. Badz czujny i nie klikaj w podejrzane linki.",
  },
  {
    id: "legit-blik-fraud-warning",
    label: "Ogólne ostrzeżenie przed oszustwem \"na BLIK\" (nie scam)",
    expectedLevel: "Low",
    isScam: false,
    message:
      "UWAGA: W ostatnim czasie nasilily sie proby oszustw metoda \"na BLIK\". Nigdy nie podawaj kodu BLIK osobom trzecim, nawet jesli podszywaja sie pod znajomych.",
  },
  {
    id: "olx-price-negotiation",
    label: "OLX: zwykła negocjacja ceny",
    expectedLevel: "Low",
    isScam: false,
    message: "Dzien dobry, czy zgodzi sie Pan na 150 zl zamiast 180 zl? Moge odebrac jutro po 17.",
  },
  {
    id: "allegro-shipping-confirmation",
    label: "Allegro: legalne potwierdzenie wysyłki",
    expectedLevel: "Low",
    isScam: false,
    message:
      "Twoje zamowienie nr 88213 zostalo wyslane. Numer przesylki: DPD123456789PL. Sledz paczke w aplikacji Allegro.",
  },
  {
    id: "doctor-appointment-reminder",
    label: "Przypomnienie o wizycie lekarskiej",
    expectedLevel: "Low",
    isScam: false,
    message:
      "Przypominamy o wizycie u dr Kowalskiej dnia 12.07 o godz. 15:30. W razie potrzeby zmiany terminu prosimy o kontakt telefoniczny z rejestracja.",
  },
  {
    id: "work-meeting-reschedule",
    label: "Wewnętrzna wiadomość o zmianie terminu spotkania",
    expectedLevel: "Low",
    isScam: false,
    message: "Czesc, przesuwamy jutrzejsze spotkanie zespolu na 14:00, sala B. Daj znac czy pasuje.",
  },
  {
    id: "utility-bill-reminder",
    label: "Przypomnienie o opłacie za prąd (legalne)",
    expectedLevel: "Low",
    isScam: false,
    message:
      "Przypominamy o zblizajacym sie terminie platnosci za prad - termin 25.07. Fakture znajdziesz w swoim panelu klienta na oficjalnej stronie dostawcy.",
  },
  {
    id: "school-parent-chat",
    label: "Wiadomość ze szkolnej grupy rodziców",
    expectedLevel: "Low",
    isScam: false,
    message: "Jutro wycieczka klasowa, zbiorka o 8:00 przy szkole. Prosze spakowac dzieciom drugie sniadanie.",
  },
  {
    id: "legit-paczkomat-pickup-code",
    label: "Legalny kod odbioru z prawdziwej domeny InPost",
    expectedLevel: "Low",
    isScam: false,
    message:
      "Twoja paczka czeka w Paczkomacie WWA01M ul. Testowa 1. Kod odbioru: 928374. Pobierz aplikacje InPost: https://inpost.pl/app",
  },
  {
    id: "friendly-chat-2",
    label: "Zwykła wiadomość o meczu (bez sygnałów ryzyka)",
    expectedLevel: "Low",
    isScam: false,
    message: "Ej, widziales mecz wczoraj? Szkoda ze przegrali w dogrywce.",
  },
  {
    id: "legit-monthly-statement",
    label: "Legalne powiadomienie o podsumowaniu wydatków",
    expectedLevel: "Low",
    isScam: false,
    message:
      "Twoje miesieczne podsumowanie wydatkow jest juz dostepne w aplikacji mobilnej. Zaloguj sie do aplikacji, aby je zobaczyc.",
  },
  {
    id: "legit-job-interview-invite",
    label: "Legalne zaproszenie na rozmowę kwalifikacyjną",
    expectedLevel: "Low",
    isScam: false,
    message:
      "Dziekujemy za aplikacje na stanowisko Junior Developer. Rozmowa kwalifikacyjna odbedzie sie 15.07 o 10:00 w naszym biurze przy ul. Przykladowej 5.",
  },
];
