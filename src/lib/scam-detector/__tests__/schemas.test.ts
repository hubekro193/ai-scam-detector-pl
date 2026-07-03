import { describe, expect, it } from "vitest";
import { analyzeMessage } from "../index";
import { TEST_MESSAGES } from "../examples";
import { CheckRequestSchema, DetectionResultSchema } from "../schemas";

describe("DetectionResultSchema — contract test (Module 8)", () => {
  it("every analyzeMessage() result matches the DetectionResult schema exactly", () => {
    for (const test of TEST_MESSAGES) {
      const result = analyzeMessage(test.message);
      // .parse() throws with a readable error naming the exact field that
      // drifted, so a broken contract fails loudly here instead of shipping
      // a malformed response to the frontend.
      expect(() => DetectionResultSchema.parse(result)).not.toThrow();
    }
  });

  it("rejects a hand-crafted malformed result (sanity check that the schema is strict)", () => {
    const malformed = {
      riskLevel: "Super Dangerous", // not a valid enum value
      riskScore: 150, // out of 0-100 range
      summary: "",
      detectedSignals: [],
      recommendedAction: [],
      confidence: "High",
      technical: { categoryScores: {}, triggeredCategories: [], rawScore: 0 },
    };
    expect(DetectionResultSchema.safeParse(malformed).success).toBe(false);
  });
});

describe("CheckRequestSchema — API request validation (Module 8)", () => {
  it("accepts a normal message and trims whitespace", () => {
    const parsed = CheckRequestSchema.parse({ message: "  Hej, jak leci?  " });
    expect(parsed.message).toBe("Hej, jak leci?");
  });

  it("rejects an empty/whitespace-only message", () => {
    expect(CheckRequestSchema.safeParse({ message: "   " }).success).toBe(false);
  });

  it("rejects a message over 4000 characters", () => {
    const tooLong = "a".repeat(4001);
    expect(CheckRequestSchema.safeParse({ message: tooLong }).success).toBe(false);
  });

  it("rejects a non-string message", () => {
    expect(CheckRequestSchema.safeParse({ message: 12345 }).success).toBe(false);
  });

  it("rejects a missing message field", () => {
    expect(CheckRequestSchema.safeParse({}).success).toBe(false);
  });
});
