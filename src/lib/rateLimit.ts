/**
 * Minimal in-memory, best-effort rate limiter for the /api/check endpoint.
 *
 * Deliberately simple for the MVP: a fixed window counter per IP, held in a
 * Map in the Node.js process. Two honest limitations, worth knowing before
 * relying on this in production:
 *
 * 1. It resets whenever the server process restarts and is NOT shared across
 *    multiple instances/regions — on a serverless or multi-replica deploy,
 *    each instance has its own counter, so the real effective limit is
 *    (limit x number of instances). For real production scale, replace this
 *    with a shared store (e.g. Redis / Upstash) keyed the same way.
 * 2. The IP address comes from request headers (x-forwarded-for), which a
 *    client can spoof if there's no trusted reverse proxy in front of the
 *    app setting that header correctly. Good enough to deter casual abuse,
 *    not a hard security boundary.
 */

interface WindowState {
  count: number;
  windowStart: number;
}

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

const hits = new Map<string, WindowState>();

// Periodically forget stale entries so this Map doesn't grow forever.
const CLEANUP_INTERVAL_MS = 5 * 60_000;
let lastCleanup = Date.now();

function cleanupIfNeeded(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, state] of hits) {
    if (now - state.windowStart > WINDOW_MS) hits.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  cleanupIfNeeded(now);

  const state = hits.get(key);

  if (!state || now - state.windowStart > WINDOW_MS) {
    hits.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, retryAfterSeconds: 0 };
  }

  if (state.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterSeconds = Math.ceil((state.windowStart + WINDOW_MS - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  state.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - state.count, retryAfterSeconds: 0 };
}

/** Best-effort client identifier from standard proxy headers, with a safe fallback. */
export function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() ?? "unknown";

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}
