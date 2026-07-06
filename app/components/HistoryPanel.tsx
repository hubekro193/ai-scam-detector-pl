"use client";

import { useState } from "react";
import type { HistoryEntry } from "../hooks/useLocalHistory";
import { RISK_STYLES } from "./riskStyles";
import { ScoreRing } from "./ScoreRing";

const PREVIEW_LENGTH = 90;

function formatTimestamp(ms: number): string {
  return new Date(ms).toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function preview(message: string): string {
  const trimmed = message.trim().replace(/\s+/g, " ");
  return trimmed.length > PREVIEW_LENGTH ? `${trimmed.slice(0, PREVIEW_LENGTH)}…` : trimmed;
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
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
          Ostatnie {entries.length} sprawdzeń — widoczne tylko w tej przeglądarce. Kliknij, żeby
          zobaczyć pełny wynik.
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
          const style = RISK_STYLES[entry.result.riskLevel];
          const isExpanded = expandedId === entry.id;

          return (
            <li key={entry.id} className={`rounded-lg border text-sm ${style.card}`}>
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                className="flex w-full items-start justify-between gap-3 p-3 text-left"
                aria-expanded={isExpanded}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${style.badge}`}
                    >
                      {style.icon} {entry.result.riskLevel} ({entry.result.riskScore})
                    </span>
                    <span className="text-xs text-slate-400">{formatTimestamp(entry.checkedAt)}</span>
                  </div>
                  <p className="mt-1.5 truncate text-slate-700">{preview(entry.message)}</p>
                </div>
                <span className="shrink-0 text-slate-400">{isExpanded ? "▲" : "▼"}</span>
              </button>

              {isExpanded && (
                <div className="space-y-3 border-t border-black/5 p-3 pt-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Wiadomość
                    </p>
                    <p className="mt-1 whitespace-pre-wrap rounded-lg bg-white/70 p-2.5 text-sm text-slate-700">
                      {entry.message}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <ScoreRing score={entry.result.riskScore} level={entry.result.riskLevel} />
                    <p className="max-w-md flex-1 text-sm text-slate-800">{entry.result.summary}</p>
                  </div>

                  {entry.result.detectedSignals.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Wykryte sygnały
                      </p>
                      <div className="mt-1.5 space-y-2">
                        {entry.result.detectedSignals.map((s) => (
                          <div key={s.id} className="text-xs text-slate-600">
                            <span className="font-mono text-slate-400">
                              [{s.category}/{s.severity}]
                            </span>{" "}
                            <span className="font-medium text-slate-700">{s.label}</span>
                            <p className="mt-0.5">{s.explanation}</p>
                            {s.evidence && (
                              <p className="mt-0.5 italic text-slate-500">„{s.evidence}"</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Zalecane działania
                    </p>
                    <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-slate-700">
                      {entry.result.recommendedAction.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[11px] text-slate-400">
                      Pewność oceny: {entry.result.confidence} · źródło:{" "}
                      {entry.result.explanationSource === "ai" ? "AI (Claude)" : "silnik regułowy"}
                    </p>
                    <button
                      type="button"
                      onClick={() => onRemove(entry.id)}
                      className="text-xs font-medium text-slate-500 underline decoration-dotted hover:text-red-600"
                    >
                      Usuń ten wpis
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
