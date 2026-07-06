"use client";

import { useCallback, useEffect, useState } from "react";
import type { DetectionResult } from "@/lib/scam-detector/types";

/**
 * Local, private history of checked messages — opt-in, browser-only.
 *
 * Consistent with the project's privacy stance ("we don't save anything on
 * the server"): this never touches the network, lives entirely in
 * localStorage, and is OFF by default — the user has to explicitly turn it
 * on. Because it's opt-in and the whole point is letting the user revisit
 * exactly what they checked, each entry stores the FULL message and result
 * (not just a preview) — clicking an entry shows the complete picture.
 */

const HISTORY_KEY = "aiScamDetectorHistory";
const ENABLED_KEY = "aiScamDetectorHistoryEnabled";
const MAX_ENTRIES = 20;

export interface HistoryEntry {
  id: string;
  checkedAt: number;
  message: string;
  result: DetectionResult;
}

function readHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function useLocalHistory() {
  const [enabled, setEnabledState] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Read from localStorage only after mount — avoids SSR/client hydration
  // mismatches, since the server always renders the "disabled, empty" state.
  useEffect(() => {
    setEnabledState(localStorage.getItem(ENABLED_KEY) === "true");
    setHistory(readHistory());
    setHydrated(true);
  }, []);

  const setEnabled = useCallback((value: boolean) => {
    setEnabledState(value);
    localStorage.setItem(ENABLED_KEY, String(value));
    if (!value) {
      localStorage.removeItem(HISTORY_KEY);
      setHistory([]);
    }
  }, []);

  const addEntry = useCallback(
    (entry: { message: string; result: DetectionResult }) => {
      if (!enabled) return;
      const newEntry: HistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        checkedAt: Date.now(),
        message: entry.message,
        result: entry.result,
      };
      setHistory((prev) => {
        const next = [newEntry, ...prev].slice(0, MAX_ENTRIES);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        return next;
      });
    },
    [enabled]
  );

  const removeEntry = useCallback((id: string) => {
    setHistory((prev) => {
      const next = prev.filter((e) => e.id !== id);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }, []);

  return { enabled, setEnabled, history, addEntry, removeEntry, clearHistory, hydrated };
}
