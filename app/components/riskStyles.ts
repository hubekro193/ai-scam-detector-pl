import type { RiskLevel } from "@/lib/scam-detector/types";

export const RISK_STYLES: Record<
  RiskLevel,
  { badge: string; card: string; dot: string; icon: string; word: string }
> = {
  Low: {
    badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
    card: "border-emerald-200 bg-emerald-50/60",
    dot: "bg-emerald-500",
    icon: "🟢",
    word: "Niskie ryzyko",
  },
  Medium: {
    badge: "bg-amber-100 text-amber-800 border-amber-300",
    card: "border-amber-200 bg-amber-50/60",
    dot: "bg-amber-500",
    icon: "🟡",
    word: "Umiarkowane ryzyko",
  },
  High: {
    badge: "bg-orange-100 text-orange-800 border-orange-300",
    card: "border-orange-200 bg-orange-50/60",
    dot: "bg-orange-500",
    icon: "🟠",
    word: "Wysokie ryzyko",
  },
  Critical: {
    badge: "bg-red-100 text-red-800 border-red-300",
    card: "border-red-200 bg-red-50/60",
    dot: "bg-red-500",
    icon: "🔴",
    word: "Bardzo wysokie ryzyko",
  },
};

/** Fixed display order for grouping examples by risk level. */
export const RISK_LEVEL_ORDER: RiskLevel[] = ["Critical", "High", "Medium", "Low"];
