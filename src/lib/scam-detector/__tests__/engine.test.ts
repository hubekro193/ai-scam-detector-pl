import { describe, expect, it } from "vitest";
import { analyzeMessage } from "../index.js";
import { TEST_MESSAGES } from "../examples.js";

describe("analyzeMessage — rule-based engine (Module 5)", () => {
  for (const test of TEST_MESSAGES) {
    it(`classifies "${test.label}" as ${test.expectedLevel}`, () => {
      const result = analyzeMessage(test.message);
      expect(result.riskLevel).toBe(test.expectedLevel);
    });
  }

  it("never returns Low/Medium when a critical-severity signal is present (hard floor)", () => {
    const result = analyzeMessage("Prosze podac kod BLIK aby potwierdzic zamowienie.");
    const hasCritical = result.detectedSignals.some((s) => s.severity === "critical");
    expect(hasCritical).toBe(true);
    expect(["High", "Critical"]).toContain(result.riskLevel);
  });

  it("returns Low risk and empty signals for an empty message", () => {
    const result = analyzeMessage("");
    expect(result.riskLevel).toBe("Low");
    expect(result.detectedSignals).toHaveLength(0);
  });

  it("riskScore is always within 0-100", () => {
    for (const test of TEST_MESSAGES) {
      const result = analyzeMessage(test.message);
      expect(result.riskScore).toBeGreaterThanOrEqual(0);
      expect(result.riskScore).toBeLessThanOrEqual(100);
    }
  });

  it("recommendedAction always includes at least one item", () => {
    for (const test of TEST_MESSAGES) {
      const result = analyzeMessage(test.message);
      expect(result.recommendedAction.length).toBeGreaterThan(0);
    }
  });

  it("does not flag a benign, everyday message", () => {
    const result = analyzeMessage("Hej, jak minal weekend? Widzimy sie jutro?");
    expect(result.riskLevel).toBe("Low");
  });
});
