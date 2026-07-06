"use client";

import { useState } from "react";
import { TEST_MESSAGES } from "@/lib/scam-detector/examples";
import type { DetectionResult } from "@/lib/scam-detector/types";
import { ScoreRing } from "./components/ScoreRing";
import { Faq } from "./components/Faq";
import { ExamplePicker } from "./components/ExamplePicker";
import { HistoryPanel } from "./components/HistoryPanel";
import { RISK_STYLES } from "./components/riskStyles";
import { useLocalHistory } from "./hooks/useLocalHistory";

const EXAMPLE_IDS = ["courier-topup-scam", "blik-friend-scam", "legit-parcel-notification"];
const EXAMPLES = TEST_MESSAGES.filter((m) => EXAMPLE_IDS.includes(m.id));

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Wklej wiadomość",
    text: "Skopiuj podejrzanego SMS-a, e-mail lub wiadomość z czatu OLX, Allegro czy WhatsApp.",
  },
  {
    step: "02",
    title: "Analizujemy sygnały ryzyka",
    text: "Sprawdzamy linki, presję czasu, prośby o dane, próby podszycia się pod firmę i inne typowe wzorce.",
  },
  {
    step: "03",
    title: "Dostajesz jasny wynik",
    text: "Poziom ryzyka, wyjaśnienie prostym językiem i konkretne zalecenie, co zrobić dalej.",
  },
];

const PROJECT_FACTS = [
  { value: "7", label: "kategorii sygnałów ryzyka" },
  { value: "Reguły + AI", label: "silnik regułowy jako źródło prawdy, AI tylko wyjaśnia" },
  { value: "0", label: "wiadomości zapisywanych na serwerze" },
];

export default function HomePage() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTechnical, setShowTechnical] = useState(false);
  const localHistory = useLocalHistory();

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
        localHistory.addEntry({ message, result: data as DetectionResult });
      }
    } catch {
      setError("Nie udało się połączyć z serwerem. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  }

  const styles = result ? RISK_STYLES[result.riskLevel] : null;

  return (
    <div className="bg-white">
      {/* Dark canvas: header + hero share one seamless block, echoing an editorial agency feel */}
      <div className="relative overflow-hidden bg-slate-950">
        {/* Glow blobs standing in for a photographic hero image */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl"
        />

        <header className="relative mx-auto flex max-w-4xl items-center justify-between px-4 py-6">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-sm font-bold text-white">
              ✓
            </span>
            <span className="font-semibold text-white">AI Scam Detector PL</span>
          </div>
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
            Wersja beta
          </span>
        </header>

        <section className="relative mx-auto max-w-4xl px-4 pb-24 pt-6 text-center sm:pt-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Analiza działa lokalnie — treść nie jest zapisywana
          </span>

          <h1 className="mx-auto mt-6 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Zanim klikniesz — <span className="text-indigo-400">sprawdź, czy to nie scam.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-400 sm:text-lg">
            Wklej treść SMS-a, e-maila lub wiadomości z OLX/Allegro. Analiza zajmuje kilka sekund —
            bez rejestracji i bez zapisywania danych.
          </p>
        </section>
      </div>

      <main className="mx-auto max-w-4xl px-4 pb-20">
        {/* Check form: floats up out of the dark hero onto the white canvas */}
        <section className="relative z-10 mx-auto -mt-16 max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/10 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Wklej tutaj treść wiadomości..."
              rows={7}
              maxLength={4000}
              className="w-full resize-y rounded-lg border border-slate-300 bg-white p-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />

            <p className="text-xs text-slate-500">
              Nie wklejaj haseł, kodów BLIK, numerów kart, CVV ani numeru PESEL — do analizy
              wystarczy treść samej wiadomości.
            </p>

            {localHistory.hydrated && (
              <label className="flex items-center gap-2 text-xs text-slate-500">
                <input
                  type="checkbox"
                  checked={localHistory.enabled}
                  onChange={(e) => localHistory.setEnabled(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Zapisuj historię sprawdzonych wiadomości (pełna treść i wynik) w tej przeglądarce —
                nigdy nie wysyłane na serwer, w każdej chwili możesz ją wyczyścić

              </label>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={!message.trim() || loading}
                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? "Sprawdzam..." : "Sprawdź wiadomość"}
              </button>

              <span className="text-xs text-slate-400">lub wypróbuj przykład:</span>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => setMessage(ex.message)}
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  {ex.label}
                </button>
              ))}

              <ExamplePicker onSelect={setMessage} />
            </div>
          </form>

          {error && (
            <div className="mt-5 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          {result && styles && (
            <section className={`mt-5 rounded-xl border p-5 ${styles.card}`}>
              <div className="flex flex-wrap items-center gap-4">
                <ScoreRing score={result.riskScore} level={result.riskLevel} />
                <div className="min-w-0 flex-1">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${styles.badge}`}
                  >
                    {styles.icon} {styles.word}
                  </span>
                  <p className="mt-2 text-xs text-slate-500">Pewność oceny: {result.confidence}</p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-800">{result.summary}</p>

              {result.detectedSignals.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {result.detectedSignals.map((s) => (
                    <li
                      key={s.id}
                      className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {s.label}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4 rounded-lg bg-white/80 p-3">
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
                    <div className="mt-2 space-y-2 rounded-lg border border-slate-200 bg-white/80 p-3">
                      {result.detectedSignals.map((s) => (
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
                      <p className="pt-1 text-[11px] text-slate-400">
                        Źródło wyjaśnienia:{" "}
                        {result.explanationSource === "ai" ? "AI (Claude)" : "silnik regułowy"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}
        </section>

        {/* Local history — opt-in, browser-only, never sent to the server */}
        {localHistory.hydrated && localHistory.enabled && (
          <section className="mx-auto mt-6 max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
            <h2 className="text-sm font-semibold text-slate-900">Historia sprawdzonych wiadomości</h2>
            <div className="mt-3">
              <HistoryPanel
                entries={localHistory.history}
                onRemove={localHistory.removeEntry}
                onClearAll={localHistory.clearHistory}
              />
            </div>
          </section>
        )}

        {/* How it works: editorial stepped list, oversized ghost numbers */}
        <section className="mt-24">
          <span className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
            Proces
          </span>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Jak to działa</h2>

          <div className="mt-6 divide-y divide-slate-200 border-t border-slate-200">
            {HOW_IT_WORKS.map((step) => (
              <div
                key={step.step}
                className="grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-1 py-6 sm:grid-cols-[100px_1fr]"
              >
                <span className="text-4xl font-bold text-slate-200 sm:text-5xl">{step.step}</span>
                <div>
                  <h3 className="font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Honest project facts (not fake usage stats) */}
        <section className="mt-16 grid gap-4 sm:grid-cols-3">
          {PROJECT_FACTS.map((fact) => (
            <div
              key={fact.label}
              className="rounded-xl border border-slate-200 bg-white p-5 text-center"
            >
              <p className="text-2xl font-bold text-slate-900">{fact.value}</p>
              <p className="mt-1 text-xs text-slate-500">{fact.label}</p>
            </div>
          ))}
        </section>

        {/* FAQ */}
        <section className="relative mt-24 pt-14 sm:pt-20">
          <span
            aria-hidden
            className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 select-none whitespace-nowrap text-6xl font-bold text-slate-100 sm:text-8xl"
          >
            FAQ
          </span>
          <div className="relative text-center">
            <h2 className="text-2xl font-bold text-slate-900">Częste pytania</h2>
          </div>
          <div className="relative mx-auto mt-8 max-w-2xl">
            <Faq />
          </div>
        </section>
      </main>

      <footer className="bg-slate-950">
        <div className="mx-auto max-w-4xl px-4 py-8 text-xs text-slate-400">
          To narzędzie pomaga ocenić ryzyko, ale nie daje gwarancji, że wiadomość jest bezpieczna
          lub niebezpieczna. Zawsze weryfikuj ważne sprawy oficjalnym kanałem — bezpośrednio w
          aplikacji banku, kuriera lub platformy.
        </div>
      </footer>
    </div>
  );
}
