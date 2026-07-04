"use client";

import { useEffect, useRef, useState } from "react";
import { TEST_MESSAGES } from "@/lib/scam-detector/examples";
import type { RiskLevel } from "@/lib/scam-detector/types";
import { RISK_LEVEL_ORDER, RISK_STYLES } from "./riskStyles";

export function ExamplePicker({ onSelect }: { onSelect: (message: string) => void }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const grouped = RISK_LEVEL_ORDER.map((level) => ({
    level,
    items: TEST_MESSAGES.filter((m) => m.expectedLevel === level),
  })).filter((group) => group.items.length > 0);

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-slate-300 bg-white px-3 py-1 text-xs text-slate-500 transition hover:border-indigo-300 hover:text-indigo-700"
      >
        Przeglądaj przykłady ({TEST_MESSAGES.length})
        <span className={`transition-transform ${open ? "rotate-180" : ""}`}>⌄</span>
      </button>

      {open && (
        <div className="absolute left-0 z-20 mt-2 w-[min(90vw,26rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="max-h-80 overflow-y-auto p-2">
            {grouped.map((group) => {
              const style = RISK_STYLES[group.level as RiskLevel];
              return (
                <div key={group.level} className="mb-2 last:mb-0">
                  <p className="sticky top-0 z-10 flex items-center gap-1.5 bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                    {style.word} ({group.items.length})
                  </p>
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelect(item.message);
                        setOpen(false);
                      }}
                      className="block w-full rounded-lg px-2 py-1.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
