# AI Scam Detector PL

Silnik do oceny ryzyka oszustwa/phishingu w polskojęzycznych wiadomościach (SMS, e-mail, OLX, Allegro, WhatsApp, kurier/bank).

**Status: Moduł 5 (rule-based scoring), Moduł 6 (AI-assisted explanation) i Moduł 7 (frontend Next.js) ukończone.** Ewaluacja trwa na bieżąco (Moduł 10) — silnik jest testowany na realnych wiadomościach, nie tylko na wymyślonych przykładach.

## Architektura — dlaczego rules + AI, nie tylko AI

Silnik regułowy (`analyzeMessage`) zawsze liczy `riskScore`/`riskLevel`/`detectedSignals` — deterministycznie, offline, bez wywołań sieciowych. To jedyne źródło prawdy dla oceny ryzyka: da się to testować jednostkowo, audytować i nie da się tego zmanipulować przez treść wiadomości (prompt injection).

Warstwa AI (`explainMessage`, Moduł 6) jest **czysto opisowa** — dostaje tylko listę już wykrytych sygnałów (kategorię, etykietę, krótki fragment-dowód), nigdy pełnej treści wiadomości, i tylko przepisuje `summary` na bardziej naturalny polski. Nie może zmienić oceny ryzyka. Jeśli brak klucza API albo wywołanie się nie powiedzie/przekroczy czas — aplikacja cicho wraca do wyjaśnienia z silnika regułowego. AI nigdy nie jest pojedynczym punktem awarii.

## Struktura

```
app/
  page.tsx             — główny UI: textarea, wynik, przykłady do wypróbowania
  layout.tsx           — layout + metadata
  globals.css          — Tailwind v4
  api/check/route.ts   — jedyne miejsce, gdzie wywoływany jest explainMessage() po stronie serwera
src/lib/scam-detector/
  types.ts            — typy: Signal, DetectionResult, RiskCategory, Severity...
  utils.ts             — normalizacja tekstu, ekstrakcja URL (w tym refang() dla zdefangowanych linków)
  detectors/           — 7 niezależnych detektorów (link, identity, pressure, data, payment, language, context)
  scoring.ts           — agregacja sygnałów w riskScore/riskLevel/confidence + rekomendowane działania
  ai/
    client.ts           — leniwie tworzony klient Anthropic (null jeśli brak klucza)
    explain.ts           — wysyła TYLKO sygnały (nie treść wiadomości) do Claude, zwraca naturalne wyjaśnienie PL
  index.ts             — analyzeMessage(text) [sync, offline] i explainMessage(text) [async, + AI]
  examples.ts          — bezpieczne, fikcyjne przykłady testowe (w tym sanitizowane regresje z realnych scamów)
  demo.ts              — skrypt uruchamiający silnik na przykładach
  __tests__/           — testy vitest (offline, bez potrzeby klucza API)
src/cli/
  check.ts             — interaktywne CLI: wklej dowolną wiadomość, dostań pełną ocenę
```

## Użycie

```ts
import { analyzeMessage, explainMessage } from "./src/lib/scam-detector";

// tylko silnik regułowy, synchroniczne, offline:
const result = analyzeMessage("Twoje konto zostanie zablokowane...");

// z opcjonalnym wyjaśnieniem AI (wymaga ANTHROPIC_API_KEY):
const explained = await explainMessage("Twoje konto zostanie zablokowane...");
```

## Konfiguracja AI (opcjonalna)

```
cp .env.example .env
# wklej swój klucz do .env: ANTHROPIC_API_KEY=sk-ant-...
```

Bez klucza aplikacja działa normalnie — po prostu używa wyjaśnień z silnika regułowego zamiast Claude.

## Komendy

```
npm install
npm run dev                # uruchamia aplikację webową na http://localhost:3000
npm run build               # build produkcyjny (Next.js)
npm run demo                 # uruchamia silnik na przykładowych wiadomościach (CLI)
npm run check -- "treść"     # sprawdź własną wiadomość (interaktywne CLI, bez UI)
npm test                     # testy jednostkowe (vitest), zawsze offline
```

## Zasada projektowa

To narzędzie ocenia ryzyko — nie daje gwarancji. Zawsze zachęcaj użytkownika do weryfikacji ważnych spraw oficjalnym kanałem.
