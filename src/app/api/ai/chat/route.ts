import { streamText } from "ai";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { aiModel, isAIConfigured } from "@/lib/ai/model";
import { disabledResponse } from "@/lib/optional-features";

export const runtime = "edge";

const chatRequestSchema = z.object({
  lessonId: z.string().uuid().optional(),
  lessonTitle: z.string().max(200).optional(),
  lessonContent: z.string().max(50000).optional(),
  sessionContext: z.string().max(4000).optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(10000),
      })
    )
    .min(1)
    .max(50),
});

export async function POST(req: Request) {
  // Auth check — always first, before anything else
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user || authError) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Text AI is optional: without ANTHROPIC_API_KEY answer with a clean 503 instead of
  // letting the provider throw.
  if (!isAIConfigured()) {
    return disabledResponse("ai", "AI indisponibil momentan.");
  }

  // Validation
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "Invalid request", details: parsed.error.issues }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { messages, lessonTitle, lessonContent, sessionContext } = parsed.data;

  // Truncate lesson content to keep system prompt reasonable
  const contentSnippet =
    typeof lessonContent === "string" && lessonContent.length > 4000
      ? lessonContent.slice(0, 4000) + "\n\n[...conținut trunchiat]"
      : lessonContent ?? "";

  const memoryBlock =
    sessionContext && sessionContext.trim().length > 0
      ? `**Memorie — sesiuni anterioare cu acest student:**\n${sessionContext}\n\n---\n\n`
      : "";

  const systemPrompt = `Ești **AI Coach** — asistentul prietenos și empatic al platformei **DevPath RO**, un curs de programare și AI în limba română.

Rolul tău este să ajuți cursanții să înțeleagă conceptele din lecțiile de AI și programare. Răspunzi ÎNTOTDEAUNA în **română**, cu un ton cald, încurajator și clar.

---

${memoryBlock}**Lecția curentă:** ${lessonTitle ?? "Sesiune generală"}

**Conținutul lecției (context):**
${contentSnippet}

---

**Reguli de răspuns:**
- Răspunde NUMAI la întrebări legate de lecția curentă sau de programare/AI în general.
- Folosește exemple simple și analogii pentru concepte complexe.
- Fii empatic și încurajator — cursanții pot fi la primul contact cu AI.
- Dacă nu știi ceva, spune-o clar și sugerează resurse.
- Păstrează răspunsurile concise (3-5 propoziții dacă nu e nevoie de mai mult).
- Folosește markdown pentru cod, liste sau evidențieri când ajută la claritate.
- Dacă ai memorie din sesiuni anterioare, poți face referire natural la ce a discutat studentul înainte.`;

  try {
    const result = await streamText({
      model: aiModel,
      system: systemPrompt,
      messages,
      maxTokens: 512,
    });

    return result.toDataStreamResponse();
  } catch (err) {
    console.error("[api/ai/chat] streamText error:", err);
    return new Response(
      JSON.stringify({ error: "AI generation failed" }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}
