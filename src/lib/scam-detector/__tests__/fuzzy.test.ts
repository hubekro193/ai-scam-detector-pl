import { describe, expect, it } from "vitest";
import { containsFuzzyPhrase, containsFuzzyWord, levenshteinDistance } from "../fuzzy";

describe("levenshteinDistance", () => {
  it("returns 0 for identical strings", () => {
    expect(levenshteinDistance("dopłata", "dopłata")).toBe(0);
  });

  it("counts a single substitution as distance 1", () => {
    expect(levenshteinDistance("skan", "skań")).toBe(1);
  });

  it("counts a single insertion/deletion as distance 1", () => {
    expect(levenshteinDistance("skan", "skann")).toBe(1);
    expect(levenshteinDistance("skann", "skan")).toBe(1);
  });
});

describe("containsFuzzyWord — word-form and typo tolerance", () => {
  it("matches an inflected Polish form one edit away — the exact real bug this fixes", () => {
    // Historical bug (Module 10): regex stem "skan dowodu" didn't match
    // "skanu dowodu" because "skanu" is the genitive form, not "skan".
    expect(containsFuzzyWord("przeslij nam skanu dowodu", "skan")).toBe(true);
  });

  it("matches a different grammatical case of the same word (e.g. accusative vs nominative)", () => {
    expect(containsFuzzyWord("prosze o weryfikacje", "weryfikacja")).toBe(true);
  });

  it("matches a word with a dropped letter (typo tolerance for longer words)", () => {
    expect(containsFuzzyWord("podaj przelew bezposrenio na konto", "bezposrednio")).toBe(true);
  });

  it("does NOT fuzzy-match short words (avoids false positives)", () => {
    // "kod" (3 letters) must require an exact match, not fuzzy — otherwise
    // it would collide with "kot", "kos", "rod", etc.
    expect(containsFuzzyWord("mam kota w domu", "kod")).toBe(false);
  });

  it("does not match genuinely unrelated words", () => {
    expect(containsFuzzyWord("jutro jadę na wakacje", "przelew")).toBe(false);
  });

  it("still matches an exact, correctly-spelled word", () => {
    expect(containsFuzzyWord("prosze o numer karty", "karty")).toBe(true);
  });
});

describe("containsFuzzyPhrase — multi-word phrases with gaps and typos", () => {
  it("matches words in order with an unrelated word in between", () => {
    expect(containsFuzzyPhrase("przeslij nam skan swojego dowodu osobistego", ["skan", "dowodu"])).toBe(
      true
    );
  });

  it("matches a typo'd second word within the gap tolerance", () => {
    expect(
      containsFuzzyPhrase("prosimy o przeslanie skanu dowodu osobistego", ["skan", "dowod"])
    ).toBe(true);
  });

  it("does not match if the words appear in reverse order", () => {
    expect(containsFuzzyPhrase("dowodu osobistego skan", ["skan", "dowod"])).toBe(false);
  });

  it("does not match if the gap between words is too large", () => {
    expect(
      containsFuzzyPhrase("skan tego dokumentu ktory wczoraj zgubilem gdzies w domu dowodu", [
        "skan",
        "dowod",
      ], 2)
    ).toBe(false);
  });

  it("returns false for completely unrelated text", () => {
    expect(containsFuzzyPhrase("hej co u ciebie slychac", ["skan", "dowod"])).toBe(false);
  });
});
