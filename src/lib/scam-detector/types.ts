/**
 * Core types for the AI Scam Detector PL rule engine.
 *
 * The engine takes a raw message (SMS / email / OLX / Allegro / WhatsApp text)
 * and returns a structured DetectionResult — no ML, no LLM calls here.
 * This is Module 5 (rule-based detection) + Module 3 (scoring) of the roadmap.
 */

export type RiskCategory =
  | "link"
  | "identity"
  | "pressure"
  | "data"
  | "payment"
  | "language"
  | "context";

export type Severity = "low" | "medium" | "high" | "critical";

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export type Confidence = "Low" | "Medium" | "High";

/** A single detected red flag. */
export interface Signal {
  /** Stable machine id, e.g. "link.shortener" — useful for tests and evaluation. */
  id: string;
  category: RiskCategory;
  severity: Severity;
  /** Short human label in Polish, shown in the UI. */
  label: string;
  /** Plain-language explanation in Polish: why this is suspicious. */
  explanation: string;
  /** The exact fragment of the message that triggered this signal, if applicable. */
  evidence?: string;
}

export interface DetectionResult {
  riskLevel: RiskLevel;
  riskScore: number; // 0-100
  summary: string; // plain Polish summary, 1-2 sentences
  detectedSignals: Signal[];
  recommendedAction: string[];
  confidence: Confidence;
  /** Technical details for advanced users — never shown by default in the UI. */
  technical: {
    categoryScores: Record<RiskCategory, number>;
    triggeredCategories: RiskCategory[];
    rawScore: number; // score before capping at 100
  };
}

/** Every category detector implements this signature. */
export type Detector = (text: string, normalized: string) => Signal[];

/** Points awarded per severity level before category/synergy adjustments. */
export const SEVERITY_WEIGHT: Record<Severity, number> = {
  low: 6,
  medium: 16,
  high: 30,
  critical: 45,
};
