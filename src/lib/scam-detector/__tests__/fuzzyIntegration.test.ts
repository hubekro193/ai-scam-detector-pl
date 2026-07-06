import { describe, expect, it } from "vitest";
import { analyzeMessage } from "../index";

/**
 * Proves the fuzzy matching added to detectors (Module 10 detection-quality
 * pass) actually catches messages the OLD regex-only patterns would have
 * missed — same real bug class as normalize()'s "ł" issue, but for word
 * inflection/typos/word-gaps instead of diacritics.
 */
describe("Fuzzy matching integration — catches word-form variants and typos", () => {
  it("detects an ID-scan request with a word (Twojego) between the fuzzy-matched terms", () => {
    const result = analyzeMessage(
      "Prosimy o przeslanie skanu Twojego dowodu osobistego w celu weryfikacji konta."
    );
    expect(result.detectedSignals.map((s) => s.id)).toContain("data.id-scan");
    expect(result.riskLevel).not.toBe("Low");
  });

  it("detects a login-password request despite a grammatical typo (logowanie vs logowania)", () => {
    const result = analyzeMessage(
      "Aby potwierdzic tozsamosc, podaj nam swoje dane logowanie do bankowosci."
    );
    expect(result.detectedSignals.map((s) => s.id)).toContain("data.login-password");
  });

  it("detects an outside-platform payment request despite a dropped letter (bezposrenio)", () => {
    const result = analyzeMessage(
      "Wolelibysmy, zeby zaplacila Pani bezposrenio przelewem, pomijajac platnosc serwisu."
    );
    expect(result.detectedSignals.map((s) => s.id)).toContain("payment.outside-platform");
  });

  it("does not fuzzy-match unrelated, genuinely benign text", () => {
    const result = analyzeMessage("Dzien dobry, czy mozemy sie umowic na jutro po poludniu?");
    expect(result.riskLevel).toBe("Low");
  });
});
