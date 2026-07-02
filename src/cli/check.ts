/**
 * Interactive CLI: paste a message, get a full DetectionResult back.
 *
 * Usage:
 *   npm run check -- "treść wiadomości do sprawdzenia"
 *   echo "tresc" | npm run check
 *   npm run check              (then paste + Ctrl-D)
 */
import "dotenv/config";
import { explainMessage } from "../lib/scam-detector/index.js";

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf8").trim();
}

const LEVEL_ICON: Record<string, string> = {
  Low: "🟢",
  Medium: "🟡",
  High: "🟠",
  Critical: "🔴",
};

async function main() {
  const argMessage = process.argv.slice(2).join(" ").trim();
  const message = argMessage || (await readStdin());

  if (!message) {
    console.error("Brak wiadomości do sprawdzenia. Użycie: npm run check -- \"treść\"");
    process.exit(1);
  }

  const result = await explainMessage(message);

  console.log(`\n${LEVEL_ICON[result.riskLevel] ?? ""} Ryzyko: ${result.riskLevel} (score ${result.riskScore}/100, pewność: ${result.confidence})`);
  console.log(`Źródło wyjaśnienia: ${result.explanationSource === "ai" ? "AI (Claude)" : "silnik regułowy"}`);
  console.log(`\n${result.summary}`);

  if (result.detectedSignals.length > 0) {
    console.log("\nWykryte sygnały:");
    for (const s of result.detectedSignals) {
      console.log(`  - [${s.category}/${s.severity}] ${s.label} — ${s.explanation}`);
    }
  }

  console.log("\nZalecane działania:");
  for (const a of result.recommendedAction) console.log(`  - ${a}`);
  console.log();
}

main().catch((err) => {
  console.error("Błąd:", err);
  process.exit(1);
});
