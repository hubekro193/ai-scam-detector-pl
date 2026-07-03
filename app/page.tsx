"use client";

import { useState } from "react";
import { TEST_MESSAGES } from "@/lib/scam-detector/examples";
import type { DetectionResult, RiskLevel } from "@/lib/scam-detector/types";

const EXAMPLE_IDS = ["courier-topup-scam", "blik-friend-scam", "legit-parcel-notification"];
const EXAMPLES = TEST_MESSAGES.filter((m) => EXAMPLE_IDS.includes(m.id));

const RISK_STYLES: Record<RiskLevel, { badge: string; card: string; icon: string; word: string }> = {
  Low: {
    badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
    card: "border-emerald-200 bg-emerald-50",
    icon: "🟢",
    word: "Niskie ryzyko",
  },
  Medium: {
    badge: "bg-amber-100 text-amber-800 border-amber-300",
    card: "border-amber-200 bg-amber-50",
    icon: "🟡",
    word: "Umiarkowane ryzyko",
  },
  High: {
    badge: "bg-orange-100 text-orange-800 border-orange-300",
    card: "border-orange-200 bg-orange-50",
    icon: "🟠",
    word: "Wysokie ryzyko",
  },
  Critical: {
    badge: "bg-red-100 text-red-800 border-red-300",
    card: "border-red-200 bg-red-50",
    icon: "🔴",
    word: "Bardzo wysokie ryzyko",
  },
};

export default function HomePage() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTechnical, setShowTechnical] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Coś poszło nie tak.");
      } else {
        setResult(data as DetectionResult);
      }
    } catch {
      setError("Nie udało się połączyć z serwerem. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  }

  const styles = result ? RISK_STYLES[result.riskLevel] : null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">AI Scam Detector PL</h1>
        <p className="mt-1 text-sm text-slate-600">
          Wklej treść podejrzanego SMS-a, e-maila lub wiadomości z OLX/Allegro/WhatsApp, a sprawdzimy
          typowe sygnały oszustwa.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Wklej tutaj treść wiadomości..."
          rows={7}
          maxLength={4000}
          className="w-full resize-y rounded-lg border border-slate-300 bg-white p-3 text-sm shadow-sm focus:border-slate-500 focus:outline-none"
        />

        <p className="text-xs text-slate-500">
          Nie wklejaj haseł, kodów BLIK, numerów kart, CVV ani numeru PESEL — do analizy wystarczy
          treść samej wiadomości.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={!message.trim() || loading}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Sprawdzam..." : "Sprawdź wiadomość"}
          </button>

          <span className="text-xs text-slate-400">lub wypróbuj przykład:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => setMessage(ex.message)}
              className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </form>

      {error && (
        <div className="mt-6 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {result && styles && (
        <section className={`mt-6 rounded-xl border p-5 ${styles.card}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${styles.badge}`}
            >
              {styles.icon} {styles.word} — {result.riskScore}/100
            </span>
            <span className="text-xs text-slate-500">Pewność oceny: {result.confidence}</span>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-slate-800">{result.summary}</p>

          {result.detectedSignals.length > 0 && (
            <ul className="mt-4 space-y-1.5">
              {result.detectedSignals.map((s) => (
                <li key={s.id} className="text-sm text-slate-700">
                  <span className="font-medium">{s.label}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 rounded-lg bg-white/70 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Co zrobić
            </p>
            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm text-slate-700">
              {result.recommendedAction.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>

          {result.detectedSignals.length > 0 && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowTechnical((v) => !v)}
                className="text-xs font-medium text-slate-500 underline decoration-dotted hover:text-slate-700"
              >
                {showTechnical ? "Ukryj szczegóły techniczne" : "Pokaż szczegóły techniczne"}
              </button>

              {showTechnical && (
                <div className="mt-2 space-y-2 rounded-lg border border-slate-200 bg-white/70 p-3">
                  {result.detectedSignals.map((s) => (
                    <div key={s.id} className="text-xs text-slate-600">
                      <span className="font-mono text-slate-400">
                        [{s.category}/{s.severity}]
                      </span>{" "}
                      <span className="font-medium text-slate-700">{s.label}</span>
                      <p className="mt-0.5">{s.explanation}</p>
                      {s.evidence && <p className="mt-0.5 italic text-slate-500">„{s.evidence}"</p>}
                    </div>
                  ))}
                  <p className="pt-1 text-[11px] text-slate-400">
                    Źródło wyjaśnienia: {result.explanationSource === "ai" ? "AI (Claude)" : "silnik regułowy"}
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      <footer className="mt-10 border-t border-slate-200 pt-4 text-xs text-slate-400">
        To narzędzie pomaga ocenić ryzyko, ale nie daje gwarancji, że wiadomość jest bezpieczna lub
        niebezpieczna. Zawsze weryfikuj ważne sprawy oficjalnym kanałem.
      </footer>
    </main>
  );
}
