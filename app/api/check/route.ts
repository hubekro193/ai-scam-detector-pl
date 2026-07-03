import { NextResponse } from "next/server";
import { explainMessage } from "@/lib/scam-detector";
import { checkRateLimit, getClientKey } from "@/lib/rateLimit";

export const runtime = "nodejs";

const MAX_LENGTH = 4000;
// A little headroom over MAX_LENGTH for JSON structure ({"message":"..."}) — anything
// bigger than this is rejected before we even attempt to read/buffer the body.
const MAX_BODY_BYTES = 20_000;

interface CheckRequestBody {
  message?: unknown;
}

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

  let body: CheckRequestBody;
  try {
    body = (await request.json()) as CheckRequestBody;
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe żądanie." }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message : "";
  const trimmed = message.trim();

  if (!trimmed) {
    return NextResponse.json({ error: "Wiadomość nie może być pusta." }, { status: 400 });
  }
  if (trimmed.length > MAX_LENGTH) {
    return NextResponse.json(
      { error: `Wiadomość jest zbyt długa (maks. ${MAX_LENGTH} znaków).` },
      { status: 400 }
    );
  }

  try {
    const result = await explainMessage(trimmed);
    // Never persist the raw message — analysis is stateless by design (privacy rule).
    // No console.log/logging of `trimmed` or `result` here, on purpose.
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Wystąpił błąd podczas analizy wiadomości. Spróbuj ponownie." },
      { status: 500 }
    );
  }
}
