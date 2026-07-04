/**
 * Module 10: statistical evaluation.
 *
 * Turns the labeled dataset (examples.ts) into real precision/recall/F1
 * numbers instead of eyeballing individual pass/fail cases. The "flagged"
 * decision is riskLevel !== "Low" — i.e. the engine raised at least some
 * concern — compared against the human-assigned `isScam` ground truth.
 *
 * Run: npm run evaluate
 */
import { fileURLToPath } from "node:url";
import { analyzeMessage } from "./index";
import { TEST_MESSAGES } from "./examples";
import type { RiskLevel } from "./types";

export interface EvaluationResult {
  total: number;
  truePositives: number;
  falsePositives: number;
  trueNegatives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
  f1: number;
  accuracy: number;
  falsePositiveCases: { id: string; label: string; riskLevel: RiskLevel }[];
  falseNegativeCases: { id: string; label: string; riskLevel: RiskLevel }[];
}

export function evaluate(): EvaluationResult {
  let truePositives = 0;
  let falsePositives = 0;
  let trueNegatives = 0;
  let falseNegatives = 0;
  const falsePositiveCases: EvaluationResult["falsePositiveCases"] = [];
  const falseNegativeCases: EvaluationResult["falseNegativeCases"] = [];

  for (const test of TEST_MESSAGES) {
    const result = analyzeMessage(test.message);
    const flagged = result.riskLevel !== "Low";

    if (test.isScam && flagged) {
      truePositives += 1;
    } else if (!test.isScam && flagged) {
      falsePositives += 1;
      falsePositiveCases.push({ id: test.id, label: test.label, riskLevel: result.riskLevel });
    } else if (!test.isScam && !flagged) {
      trueNegatives += 1;
    } else {
      // test.isScam && !flagged
      falseNegatives += 1;
      falseNegativeCases.push({ id: test.id, label: test.label, riskLevel: result.riskLevel });
    }
  }

  const total = TEST_MESSAGES.length;
  const precision = truePositives + falsePositives > 0 ? truePositives / (truePositives + falsePositives) : 1;
  const recall = truePositives + falseNegatives > 0 ? truePositives / (truePositives + falseNegatives) : 1;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  const accuracy = (truePositives + trueNegatives) / total;

  return {
    total,
    truePositives,
    falsePositives,
    trueNegatives,
    falseNegatives,
    precision,
    recall,
    f1,
    accuracy,
    falsePositiveCases,
    falseNegativeCases,
  };
}

function formatPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

/* c8 ignore start -- CLI entry point, exercised manually via `npm run evaluate` */
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const r = evaluate();
  const scamCount = TEST_MESSAGES.filter((t) => t.isScam).length;
  const legitCount = TEST_MESSAGES.length - scamCount;

  console.log(`\nDataset: ${r.total} wiadomości (${scamCount} scam / ${legitCount} legit)\n`);
  console.log("Confusion matrix (flagged = riskLevel !== Low):");
  console.log(`  True Positives:  ${r.truePositives}`);
  console.log(`  False Positives: ${r.falsePositives}`);
  console.log(`  True Negatives:  ${r.trueNegatives}`);
  console.log(`  False Negatives: ${r.falseNegatives}\n`);
  console.log(`Precision: ${formatPct(r.precision)}  (z tego co oznaczyliśmy jako ryzykowne, ile faktycznie było scamem)`);
  console.log(`Recall:    ${formatPct(r.recall)}  (z faktycznych scamów, ile złapaliśmy)`);
  console.log(`F1:        ${formatPct(r.f1)}`);
  console.log(`Accuracy:  ${formatPct(r.accuracy)}`);

  if (r.falsePositiveCases.length > 0) {
    console.log("\nFalse positives (legit messages flagged as risky):");
    for (const c of r.falsePositiveCases) console.log(`  - ${c.label} -> ${c.riskLevel}`);
  }
  if (r.falseNegativeCases.length > 0) {
    console.log("\nFalse negatives (real scams that slipped through as Low):");
    for (const c of r.falseNegativeCases) console.log(`  - ${c.label} -> ${c.riskLevel}`);
  }
  console.log();
}
/* c8 ignore stop */
