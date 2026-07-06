/**
 * Zod schemas — Module 8 (structured output + validation).
 *
 * types.ts stays the compile-time source of truth (it's imported all over
 * the engine), but TypeScript types disappear at runtime. These schemas give
 * us two things TS types alone can't:
 *
 * 1. Runtime validation at the API boundary — untrusted input from the
 *    client gets parsed, not just cast with `as`.
 * 2. A contract test (see __tests__/schemas.test.ts) that fails loudly if
 *    the engine ever produces a DetectionResult shape that doesn't match
 *    what the frontend/API contract expects — catching drift between
 *    types.ts and actual runtime behavior that `tsc` cannot catch.
 */
import { z } from "zod";

export const RiskCategorySchema = z.enum([
  "link",
  "identity",
  "pressure",
  "data",
  "payment",
  "language",
  "context",
]);

export const SeveritySchema = z.enum(["low", "medium", "high", "critical"]);

export const RiskLevelSchema = z.enum(["Low", "Medium", "High", "Critical"]);

export const ConfidenceSchema = z.enum(["Low", "Medium", "High"]);

export const SignalSchema = z.object({
  id: z.string().min(1),
  category: RiskCategorySchema,
  severity: SeveritySchema,
  label: z.string().min(1),
  explanation: z.string().min(1),
  evidence: z.string().optional(),
  authoritative: z.boolean().optional(),
});

export const DetectionResultSchema = z.object({
  riskLevel: RiskLevelSchema,
  riskScore: z.number().int().min(0).max(100),
  summary: z.string().min(1),
  detectedSignals: z.array(SignalSchema),
  recommendedAction: z.array(z.string().min(1)).min(1),
  confidence: ConfidenceSchema,
  explanationSource: z.enum(["ai", "rule-based"]).optional(),
  technical: z.object({
    categoryScores: z.record(RiskCategorySchema, z.number()),
    triggeredCategories: z.array(RiskCategorySchema),
    rawScore: z.number(),
  }),
});

/** Request body for POST /api/check. Trims and bounds the message server-side. */
export const CheckRequestSchema = z.object({
  message: z
    .string({ message: "Wiadomość musi być tekstem." })
    .trim()
    .min(1, "Wiadomość nie może być pusta.")
    .max(4000, "Wiadomość jest zbyt długa (maks. 4000 znaków)."),
});

export type CheckRequest = z.infer<typeof CheckRequestSchema>;
