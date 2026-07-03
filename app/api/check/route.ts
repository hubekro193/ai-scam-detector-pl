import { NextResponse } from "next/server";
import { explainMessage } from "@/lib/scam-detector";

export const runtime = "nodejs";

const MAX_LENGTH = 4000;

interface CheckRequestBody {
  message?: unknown;
}

export async function POST(request: Request) {
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
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Wystąpił błąd podczas analizy wiadomości. Spróbuj ponownie." },
      { status: 500 }
    );
  }
}
