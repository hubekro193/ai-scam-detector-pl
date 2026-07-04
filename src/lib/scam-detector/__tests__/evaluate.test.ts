import { describe, expect, it } from "vitest";
import { evaluate } from "../evaluate";

/**
 * Regression guard for Module 10 evaluation: fails the build if precision or
 * recall on the labeled dataset ever regresses below the current baseline.
 *
 * Important caveat (documented in README too): 100% on this dataset does NOT
 * mean the engine is perfect in the wild — every example here was used to
 * design or debug the rules, so this measures "did we break something we
 * already knew about," not "does this generalize to scams we haven't seen."
 * That would require a held-out set never used during development.
 */
describe("evaluate() — precision/recall regression guard (Module 10)", () => {
  it("maintains at least 90% precision and recall on the labeled dataset", () => {
    const result = evaluate();
    expect(result.precision).toBeGreaterThanOrEqual(0.9);
    expect(result.recall).toBeGreaterThanOrEqual(0.9);
  });

  it("dataset has a meaningful mix of scam and legit examples (not all one class)", () => {
    const result = evaluate();
    const scamCount = result.truePositives + result.falseNegatives;
    const legitCount = result.trueNegatives + result.falsePositives;
    expect(scamCount).toBeGreaterThan(5);
    expect(legitCount).toBeGreaterThan(5);
  });
});
