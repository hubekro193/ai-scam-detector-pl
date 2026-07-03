import { afterEach, describe, expect, it } from "vitest";
import { analyzeMessage } from "../index";
import { explainWithAI } from "../ai/explain";
import { _resetClientCache } from "../ai/client";

describe("explainWithAI — Module 6 fallback behavior (offline, no API key)", () => {
  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
    _resetClientCache();
  });

  it("falls back to the rule-based summary when no API key is configured", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    _resetClientCache();

    const result = analyzeMessage("Prosze podac kod BLIK aby potwierdzic zamowienie.");
    const explained = await explainWithAI(result);

    expect(explained.source).toBe("rule-based");
    expect(explained.summary).toBe(result.summary);
  });

  it("never throws even if called on a signal-free (Low risk) result", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    _resetClientCache();

    const result = analyzeMessage("Hej, co u Ciebie?");
    await expect(explainWithAI(result)).resolves.toBeDefined();
  });
});
