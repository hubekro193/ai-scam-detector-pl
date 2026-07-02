import Anthropic from "@anthropic-ai/sdk";

let cachedClient: Anthropic | null | undefined;

/**
 * Lazily creates the Anthropic client from ANTHROPIC_API_KEY.
 * Returns null (not an error) when no key is configured — callers must
 * treat "no AI available" as a normal, expected state, not a failure.
 */
export function getAnthropicClient(): Anthropic | null {
  if (cachedClient !== undefined) return cachedClient;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    cachedClient = null;
    return null;
  }

  cachedClient = new Anthropic({ apiKey });
  return cachedClient;
}

/** Test-only helper to reset the cached client between test cases. */
export function _resetClientCache(): void {
  cachedClient = undefined;
}
