import { ALL_DETECTORS } from "./detectors/index.js";
import { scoreSignals } from "./scoring.js";
import { normalize } from "./utils.js";
import { explainWithAI } from "./ai/explain.js";
import type { DetectionResult, Signal } from "./types.js";

export * from "./types.js";
export { scoreSignals } from "./scoring.js";
export { explainWithAI } from "./ai/explain.js";

/**
 * Analyze a raw Polish-language message and return a structured risk assessment.
 *
 * This is the MVP step 1 of the roadmap: pure rule-based scoring, no LLM calls.
 * Module 6 will add an optional AI-assisted explanation layer on top of this
 * same DetectionResult shape.
 */
export function analyzeMessage(rawText: string): DetectionResult {
  const text = rawText ?? "";
  const normalized = normalize(text);

  const signals: Signal[] = ALL_DETECTORS.flatMap((detector) => detector(text, normalized));

  return scoreSignals(signals);
}

/**
 * Module 6: analyzeMessage() + optional AI-assisted explanation.
 *
 * The rule engine (Module 5) always runs first and is the sole source of
 * truth for riskScore/riskLevel/detectedSignals. The AI layer only rewrites
 * `summary` into more natural Polish — if ANTHROPIC_API_KEY isn't set, or
 * the call fails/times out, this returns exactly what analyzeMessage() would.
 */
export async function explainMessage(rawText: string): Promise<DetectionResult> {
  const result = analyzeMessage(rawText);
  const explained = await explainWithAI(result);

  return {
    ...result,
    summary: explained.summary,
    explanationSource: explained.source,
  };
}
