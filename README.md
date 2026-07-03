# AI Scam Detector PL

Silnik do oceny ryzyka oszustwa/phishingu w polskojęzycznych wiadomościach (SMS, e-mail, OLX, Allegro, WhatsApp, kurier/bank).

**Status: Moduły 5-7 (silnik regułowy, AI-assisted explanation, frontend Next.js) i Moduł 11 (prywatność/bezpieczeństwo) ukończone.** Ewaluacja trwa na bieżąco (Moduł 10) — silnik jest testowany na realnych wiadomościach, nie tylko na wymyślonych przykładach.

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

## Prywatność i bezpieczeństwo (Moduł 11)

Co jest zrobione:

- **Treść wiadomości nigdy nie jest zapisywana** — ani w bazie danych (bo jej nie ma), ani w logach serwera. `app/api/check/route.ts` celowo nie zawiera żadnego `console.log` z treścią wiadomości ani wynikiem.
- **Warstwa AI nie widzi pełnej wiadomości** — dostaje tylko wykryte sygnały (kategoria, etykieta, krótki fragment-dowód), patrz `src/lib/scam-detector/ai/explain.ts`.
- **Rate limiting** na `/api/check` — 10 żądań/minutę per adres IP (`src/lib/rateLimit.ts`), licznik uwzględnia też żądania z błędną walidacją, żeby nie dało się go obejść.
- **Limit rozmiaru żądania** — nagłówek `Content-Length` jest sprawdzany przed odczytaniem body, żeby nie dało się zapchać serwera ogromnym payloadem.
- **Nagłówki bezpieczeństwa** (`next.config.mjs`): `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.
- **Klucz API nigdy nie trafia do przeglądarki** — cała logika AI działa wyłącznie w route handlerze po stronie serwera.
- React domyślnie escapuje wszystkie wyświetlane teksty (brak `dangerouslySetInnerHTML` w całym froncie) — brak wektora XSS przez wklejoną wiadomość.

Uczciwe ograniczenia (świadomie nienaprawione na tym etapie MVP):

- Rate limiter jest **w pamięci procesu** — działa dobrze na jednej instancji, ale resetuje się przy restarcie i nie jest współdzielony między wieloma instancjami (np. przy skalowaniu na Vercel/serverless). Do prawdziwej produkcji: współdzielony store (Redis/Upstash).
- Adres IP do rate limitingu pochodzi z nagłówka `x-forwarded-for`, który można podrobić bez zaufanego reverse proxy przed aplikacją — wystarczające żeby zniechęcić przypadkowe nadużycia, nie jest twardą barierą bezpieczeństwa.
- Brak Content Security Policy (CSP) — wymagałoby to konfiguracji nonce dla Next.js hydration scripts; odłożone, żeby nie zepsuć działania appki bez możliwości pełnego przetestowania w tej iteracji.
