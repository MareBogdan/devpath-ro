import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "edge";

const chatRequestSchema = z.object({
  lessonId: z.string().uuid().optional(),
  lessonTitle: z.string().max(200).optional(),
  lessonContent: z.string().max(8000).optional(),
  sessionContext: z.string().max(800).optional(),
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

  const result = await streamText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt,
    messages,
    maxTokens: 512,
  });

  return result.toDataStreamResponse();
}
