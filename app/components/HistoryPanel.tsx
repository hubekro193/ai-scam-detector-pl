"use client";

import type { HistoryEntry } from "../hooks/useLocalHistory";
import { RISK_STYLES } from "./riskStyles";

function formatTimestamp(ms: number): string {
  return new Date(ms).toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HistoryPanel({
  entries,
  onRemove,
  onClearAll,
}: {
  entries: HistoryEntry[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        Historia jest włączona, ale jeszcze pusta — sprawdź jakąś wiadomość, żeby się tu pojawiła.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">
          Ostatnie {entries.length} sprawdzeń — widoczne tylko w tej przeglądarce.
        </p>
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs font-medium text-slate-500 underline decoration-dotted hover:text-red-600"
        >
          Wyczyść historię
        </button>
      </div>

      <ul className="space-y-2">
        {entries.map((entry) => {
          const style = RISK_STYLES[entry.riskLevel];
          return (
            <li
              key={entry.id}
              className={`flex items-start justify-between gap-3 rounded-lg border p-3 text-sm ${style.card}`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${style.badge}`}
                  >
                    {style.icon} {entry.riskLevel} ({entry.riskScore})
                  </span>
                  <span className="text-xs text-slate-400">{formatTimestamp(entry.checkedAt)}</span>
                </div>
                <p className="mt-1.5 truncate text-slate-700">{entry.messagePreview}</p>
                {entry.signalLabels.length > 0 && (
                  <p className="mt-1 text-xs text-slate-500">{entry.signalLabels.join(", ")}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onRemove(entry.id)}
                aria-label="Usuń z historii"
                className="shrink-0 rounded-full px-2 py-1 text-slate-400 hover:bg-white/60 hover:text-red-600"
              >
                ✕
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
