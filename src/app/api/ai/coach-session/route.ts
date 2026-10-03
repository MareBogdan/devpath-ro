// src/app/api/ai/coach-session/route.ts
// POST — summarize last N messages and save to ai_coach_sessions table
import { generateText } from "ai";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { aiModel, isAIConfigured } from "@/lib/ai/model";
import { disabledResponse } from "@/lib/optional-features";

export const runtime = "edge";

const schema = z.object({
  lessonId: z.string().uuid().nullable().optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(2000),
      })
    )
    .min(2)
    .max(10),
  startedAt: z.string().datetime(),
});

export async function POST(req: Request) {
  // Auth first
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Text AI is optional: without ANTHROPIC_API_KEY there is nothing to summarize with.
  if (!isAIConfigured()) {
    return disabledResponse("ai", "AI indisponibil momentan.");
  }

  // Parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { lessonId, messages, startedAt } = parsed.data;

  // Build transcript (truncate each message to keep prompt small)
  const transcript = messages
    .map(
      (m) =>
        `${m.role === "user" ? "Student" : "AI Coach"}: ${m.content.slice(0, 400)}`
    )
    .join("\n");

  // Summarize with Claude. A provider failure must not surface as a 500 — the summary
  // is only "memory" for later sessions, so answer with a clean 502 instead.
  let summary: string;
  try {
    const result = await generateText({
      model: aiModel,
      prompt: `Rezumă această conversație dintre un student și AI Coach în 2-3 propoziții scurte în română.
Notează ce a întrebat studentul, ce a înțeles și ce zone necesită mai multă atenție.
Rezumatul va fi folosit ca memorie pentru sesiunile viitoare de AI Coach — fii specific și concis.

Transcript:
${transcript}`.trim(),
      maxTokens: 200,
    });
    summary = result.text;
  } catch (err) {
    console.error("[api/ai/coach-session] generateText error:", err);
    return Response.json({ error: "AI generation failed" }, { status: 502 });
  }

  // Save to DB
  const { error } = await supabase.from("ai_coach_sessions").insert({
    user_id: user.id,
    lesson_id: lessonId ?? null,
    summary,
    message_count: messages.length,
    started_at: startedAt,
    ended_at: new Date().toISOString(),
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
