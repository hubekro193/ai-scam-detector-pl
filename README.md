# AI Scam Detector PL

Silnik regułowy do oceny ryzyka oszustwa/phishingu w polskojęzycznych wiadomościach (SMS, e-mail, OLX, Allegro, WhatsApp, kurier/bank).

**Status: Moduł 5 ukończony** — rule-based scoring engine (bez LLM). Frontend i warstwa AI-assisted explanation to kolejne kroki.

## Struktura

```
src/lib/scam-detector/
  types.ts          — typy: Signal, DetectionResult, RiskCategory, Severity...
  utils.ts           — normalizacja tekstu, ekstrakcja URL
  detectors/          — 7 niezależnych detektorów (link, identity, pressure, data, payment, language, context)
  scoring.ts          — agregacja sygnałów w riskScore/riskLevel/confidence
  index.ts            — analyzeMessage(text) — główny punkt wejścia
  examples.ts          — bezpieczne, fikcyjne przykłady testowe
  demo.ts               — skrypt uruchamiający silnik na przykładach
  __tests__/            — testy vitest
```

## Użycie

```ts
import { analyzeMessage } from "./src/lib/scam-detector";

const result = analyzeMessage("Twoje konto zostanie zablokowane...");
console.log(result.riskLevel, result.riskScore, result.detectedSignals);
```

## Komendy

```
npm install
npm run demo    # uruchamia silnik na przykładowych wiadomościach
npm test         # testy jednostkowe (vitest)
```

## Zasada projektowa

To narzędzie ocenia ryzyko — nie daje gwarancji. Zawsze zachęcaj użytkownika do weryfikacji ważnych spraw oficjalnym kanałem.
