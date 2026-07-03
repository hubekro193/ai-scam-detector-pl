import { analyzeMessage } from "./index";
import { TEST_MESSAGES } from "./examples";

for (const test of TEST_MESSAGES) {
  const result = analyzeMessage(test.message);
  const match = result.riskLevel === test.expectedLevel ? "OK " : "!! ";

  console.log(`\n${match}${test.label} — expected ${test.expectedLevel}, got ${result.riskLevel} (score ${result.riskScore}, confidence ${result.confidence})`);
  console.log(`   ${result.summary}`);
  for (const s of result.detectedSignals) {
    console.log(`   - [${s.category}/${s.severity}] ${s.label}`);
  }
}
