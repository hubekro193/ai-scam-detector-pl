import type { RiskLevel } from "@/lib/scam-detector/types";

const SIZE = 96;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const RING_COLOR: Record<RiskLevel, string> = {
  Low: "#059669", // emerald-600
  Medium: "#d97706", // amber-600
  High: "#ea580c", // orange-600
  Critical: "#dc2626", // red-600
};

export function ScoreRing({ score, level }: { score: number; level: RiskLevel }) {
  const progress = Math.max(0, Math.min(100, score)) / 100;
  const offset = CIRCUMFERENCE * (1 - progress);
  const color = RING_COLOR[level];
  const center = SIZE / 2;

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="shrink-0">
      <g transform={`rotate(-90 ${center} ${center})`}>
        <circle cx={center} cy={center} r={RADIUS} fill="none" stroke="#e2e8f0" strokeWidth={STROKE} />
        <circle
          cx={center}
          cy={center}
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </g>
      <text
        x={center}
        y={center}
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: 22, fontWeight: 700, fill: "#0f172a" }}
      >
        {score}
      </text>
    </svg>
  );
}
