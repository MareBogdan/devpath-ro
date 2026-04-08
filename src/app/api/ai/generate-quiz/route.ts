import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "edge";

// ─── Schemas ─────────────────────────────────────────────────────────────────

const requestSchema = z.object({
  lessonId: z.string().uuid(),
  forceRegenerate: z.boolean().optional().default(false),
});

const GeneratedQuizSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()).length(4),
      correct_answer: z.number().int().min(0).max(3),
      explanation: z.string(),
    })
  ).length(3),
});

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  // Auth check — always first
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
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { lessonId, forceRegenerate } = parsed.data;

  // Return cached questions unless forceRegenerate
  if (!forceRegenerate) {
    const { data: existing } = await supabase
      .from("ai_generated_questions")
      .select("id, question, options, correct_answer, explanation")
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId)
      .order("generated_at", { ascending: false })
      .limit(3);

    if (existing && existing.length > 0) {
      return NextResponse.json({ questions: existing });
    }
  }

  // Fetch wrong answers for this user+lesson to build context
  const { data: wrongRows } = await supabase
    .from("quiz_wrong_answers")
    .select("question_id")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId);

  const wrongQuestionIds = Array.from(new Set((wrongRows ?? []).map((r) => r.question_id as string)));

  let wrongContext = "";
  if (wrongQuestionIds.length > 0) {
    const { data: wrongQuestions } = await supabase
      .from("quiz_questions")
      .select("question")
      .in("id", wrongQuestionIds);

    wrongContext = (wrongQuestions ?? [])
      .map((q, i) => `${i + 1}. ${q.question}`)
      .join("\n");
  }

  const prompt = wrongContext
    ? `Ești un generator de întrebări de quiz educativ pentru platforma DevPath RO. Răspunde EXCLUSIV în limba română. Generează exact 3 întrebări noi bazate pe greșelile utilizatorului.\n\nÎntrebările la care utilizatorul a greșit:\n${wrongContext}\n\nGenerează 3 întrebări noi care testează aceleași concepte din unghiuri diferite. Fiecare întrebare are exact 4 opțiuni. Explică de ce răspunsul corect este corect.`
    : `Ești un generator de întrebări de quiz educativ pentru platforma DevPath RO. Răspunde EXCLUSIV în limba română. Generează exact 3 întrebări noi despre concepte de Inteligență Artificială la nivel introductiv. Fiecare întrebare are exact 4 opțiuni. Explică de ce răspunsul corect este corect.`;

  // Generate questions via GPT-4o-mini
  const result = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: GeneratedQuizSchema,
    prompt,
  });

  const questions = result.object.questions;

  // Clear old generated questions for this user+lesson if force regenerating
  if (forceRegenerate) {
    await supabase
      .from("ai_generated_questions")
      .delete()
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId);
  }

  // Persist to DB
  await supabase.from("ai_generated_questions").insert(
    questions.map((q) => ({
      user_id: user.id,
      lesson_id: lessonId,
      source_question_ids: wrongQuestionIds.length > 0 ? wrongQuestionIds : [],
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
    }))
  );

  return NextResponse.json({ questions });
}
