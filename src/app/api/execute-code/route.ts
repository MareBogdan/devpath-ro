import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "edge";

// ─── Rate limiting ────────────────────────────────────────────────────────────
// Simple in-memory map — resets on cold start (acceptable for edge).

const lastCallByIp = new Map<string, number>();
const RATE_LIMIT_MS = 5_000; // 5s cooldown per IP

// ─── Schema ───────────────────────────────────────────────────────────────────

const requestSchema = z.object({
  code: z.string().min(1).max(20_000),
  language: z.string().default("python"),
  version: z.string().default("3.10.0"),
});

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Auth guard
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Neautentificat" }, { status: 401 });
  }

  // Rate limit per IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const last = lastCallByIp.get(ip) ?? 0;
  if (now - last < RATE_LIMIT_MS) {
    return NextResponse.json(
      { error: "Prea multe cereri. Așteaptă 5 secunde." },
      { status: 429 }
    );
  }
  lastCallByIp.set(ip, now);

  // Validate input
  const parsed = requestSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Date invalide" }, { status: 400 });
  }

  const { code, language, version } = parsed.data;

  // Proxy to Piston API with 15s timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const pistonRes = await fetch(
      "https://emkc.org/api/v2/piston/execute",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          version,
          files: [{ content: code }],
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!pistonRes.ok) {
      return NextResponse.json(
        { error: "Serviciul de execuție nu este disponibil." },
        { status: 502 }
      );
    }

    const data = (await pistonRes.json()) as {
      run?: { stdout?: string; stderr?: string };
    };

    return NextResponse.json({
      stdout: data.run?.stdout ?? "",
      stderr: data.run?.stderr ?? "",
    });
  } catch (err) {
    clearTimeout(timeout);
    const isTimeout =
      err instanceof Error && err.name === "AbortError";
    return NextResponse.json(
      {
        error: isTimeout
          ? "Execuția a depășit limita de 15 secunde."
          : "Eroare la execuția codului.",
      },
      { status: 502 }
    );
  }
}
