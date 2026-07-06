import { NextResponse } from "next/server";
import { explainMessage } from "@/lib/scam-detector";
import { checkRateLimit, getClientKey } from "@/lib/rateLimit";
import { CheckRequestSchema, DetectionResultSchema } from "@/lib/scam-detector/schemas";
import { refreshThreatIntelIfStale } from "@/lib/scam-detector/threatIntel";

export const runtime = "nodejs";

// A little headroom over the 4000-char message limit for JSON structure
// ({"message":"..."}) — anything bigger than this is rejected before we even
// attempt to read/buffer the body.
const MAX_BODY_BYTES = 20_000;

export async function POST(request: Request) {
  // 1. Rate limit first — cheapest possible check, before touching the body at all.
  const clientKey = getClientKey(request);
  const rateLimit = checkRateLimit(clientKey);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Zbyt wiele zapytań. Spróbuj ponownie za chwilę." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  // 2. Reject oversized bodies via Content-Length before buffering them into memory.
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Żądanie jest zbyt duże." }, { status: 413 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe żądanie." }, { status: 400 });
  }

  // 3. Structured validation — Zod parses AND normalizes (trims) the input,
  // instead of a pile of ad hoc `typeof` checks. `.trim()` in the schema
  // means `message` below is already trimmed.
  const parsedRequest = CheckRequestSchema.safeParse(json);
  if (!parsedRequest.success) {
    const firstIssue = parsedRequest.error.issues[0];
    return NextResponse.json(
      { error: firstIssue?.message ?? "Nieprawidłowe dane wejściowe." },
      { status: 400 }
    );
  }

  // 3b. Keep the CERT Polska Warning List cache warm (no-op if refreshed
  // within the last 5 minutes; internally time-boxed to 3s, never throws).
  await refreshThreatIntelIfStale();

  try {
    const result = await explainMessage(parsedRequest.data.message);

    // 4. Validate our OWN output before it leaves the server. This is a
    // contract check, not a security boundary: if the engine ever produces
    // a shape that drifts from DetectionResultSchema, we fail loudly here
    // instead of silently shipping a malformed response to the frontend.
    const parsedResult = DetectionResultSchema.safeParse(result);
    if (!parsedResult.success) {
      return NextResponse.json(
        { error: "Wewnętrzny błąd formatu wyniku." },
        { status: 500 }
      );
    }

    // Never persist the raw message — analysis is stateless by design (privacy rule).
    // No console.log/logging of the message or result here, on purpose.
    return NextResponse.json(parsedResult.data);
  } catch {
    return NextResponse.json(
      { error: "Wystąpił błąd podczas analizy wiadomości. Spróbuj ponownie." },
      { status: 500 }
    );
  }
}
