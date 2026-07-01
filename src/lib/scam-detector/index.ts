import { ALL_DETECTORS } from "./detectors/index.js";
import { scoreSignals } from "./scoring.js";
import { normalize } from "./utils.js";
import type { DetectionResult, Signal } from "./types.js";

export * from "./types.js";
export { scoreSignals } from "./scoring.js";

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
