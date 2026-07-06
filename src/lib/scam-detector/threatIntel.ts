/**
 * Live threat intel: CERT Polska Dangerous Websites Warning List.
 *
 * https://cert.pl/en/warning-list/ — a public, freely usable, continuously
 * updated list (~3800+ entries) of domains confirmed to be phishing/scam
 * sites targeting Polish internet users. No API key, no registration.
 *
 * Privacy-by-design choice: we download the FULL list periodically and
 * check domains against our own local copy — we never send a user's URL
 * to CERT Polska (or anyone) to "look it up". This is why CERT Polska was
 * chosen over Google Safe Browsing's Lookup API, which requires sending
 * each checked URL to Google's servers per request (see README).
 *
 * Consistent with the rest of the engine's "never let an external
 * dependency become a single point of failure" philosophy (same pattern
 * as the AI explanation layer and the rate limiter): analyzeMessage() stays
 * fully synchronous and never blocks on network I/O. This module exposes a
 * synchronous cache reader for detectors, and a separate async refresh
 * function the caller (API route, CLI) triggers independently.
 */

const LIST_URL = "https://hole.cert.pl/domains/v2/domains.txt";
const CACHE_TTL_MS = 5 * 60_000; // CERT Polska's own recommended refresh interval
const FETCH_TIMEOUT_MS = 3000;

let cachedDomains: Set<string> = new Set();
let lastFetchedAt = 0;
let fetchInFlight: Promise<void> | null = null;

function parseDomainList(text: string): Set<string> {
  const domains = text
    .split("\n")
    .map((line) => line.trim().toLowerCase())
    .filter((line) => line.length > 0 && !line.startsWith("#"));
  return new Set(domains);
}

async function fetchAndCache(): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(LIST_URL, { signal: controller.signal });
    if (!response.ok) return; // leave existing cache untouched on failure
    const text = await response.text();
    cachedDomains = parseDomainList(text);
    lastFetchedAt = Date.now();
  } catch {
    // Network error, timeout, DNS failure, etc. — never throw. The engine
    // keeps working with whatever cache it already has (possibly empty).
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fetch a fresh copy of the list if the cache is older than CACHE_TTL_MS.
 * Safe to call on every request — dedupes concurrent calls and is a no-op
 * when the cache is still fresh. Never throws.
 */
export async function refreshThreatIntelIfStale(): Promise<void> {
  const isStale = Date.now() - lastFetchedAt > CACHE_TTL_MS;
  if (!isStale) return;

  if (!fetchInFlight) {
    fetchInFlight = fetchAndCache().finally(() => {
      fetchInFlight = null;
    });
  }
  await fetchInFlight;
}

/**
 * Is this hostname (or one of its parent domains) on the CERT Polska
 * Warning List? Per CERT Polska's own spec: if "a.example.com" is listed,
 * "b.a.example.com" should also be treated as flagged, but "example.com"
 * (the parent of a listed subdomain) should NOT be — so we only walk
 * upward from the checked hostname, never downward.
 */
export function isDomainFlagged(hostname: string): boolean {
  if (cachedDomains.size === 0) return false;

  const labels = hostname.toLowerCase().split(".");
  for (let i = 0; i < labels.length - 1; i++) {
    const candidate = labels.slice(i).join(".");
    if (cachedDomains.has(candidate)) return true;
  }
  return false;
}

export function getThreatIntelStatus(): { domainCount: number; lastFetchedAt: number } {
  return { domainCount: cachedDomains.size, lastFetchedAt };
}

/** Test-only: inject a known set of domains without hitting the network. */
export function _setCacheForTesting(domains: string[], fetchedAt = Date.now()): void {
  cachedDomains = new Set(domains.map((d) => d.toLowerCase()));
  lastFetchedAt = fetchedAt;
}

/** Test-only: reset to the initial empty-cache state. */
export function _resetCacheForTesting(): void {
  cachedDomains = new Set();
  lastFetchedAt = 0;
  fetchInFlight = null;
}
