// Server-side read loaders for the Course 1 interactive layer. Plain async
// functions (NOT "use server") — they are called from the lesson page (an RSC),
// so they must not be exposed as Server Action endpoints. All access goes through
// createSupabaseServerClient() and is therefore RLS-scoped to the current user.
// Read-only: no writes, no XP, no mutations.

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { computeLessonScore } from "@/lib/inline-scoring";
import type {
  InlineAttempt,
  InlineQuestion,
  LessonInteractiveState,
  LessonScore,
  LessonWowNotes,
  WowNote,
} from "@/types";

/**
 * Load the per-lesson interactive bundle for the current user. Safe for lessons
 * with ZERO inline questions (returns a valid empty state — never blocks). The
 * derived score_result is computed LIVE from the fetched attempts (self-healing
 * if the persisted lesson_scores row ever drifts); the raw lesson_scores row is
 * returned alongside as `lesson_score`.
 */
export async function getLessonInteractiveState(
  lessonId: string
): Promise<LessonInteractiveState> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: qRows } = await supabase
    .from("inline_questions")
    .select("id, lesson_id, type, order_index, content, created_at")
    .eq("lesson_id", lessonId)
    .order("order_index", { ascending: true });

  const questions = (qRows ?? []) as InlineQuestion[];

  // No questions → valid empty state (lesson must not be gated/blocked).
  if (questions.length === 0) {
    return {
      questions: [],
      attempts: {},
      lesson_score: null,
      score_result: computeLessonScore(0, 0),
    };
  }

  const attempts: Record<string, InlineAttempt> = {};
  let lessonScore: LessonScore | null = null;

  if (user) {
    const ids = questions.map((q) => q.id);

    const { data: aRows } = await supabase
      .from("inline_attempts")
      .select("id, user_id, question_id, best_score, attempts, revealed, updated_at")
      .eq("user_id", user.id)
      .in("question_id", ids);

    for (const a of (aRows ?? []) as InlineAttempt[]) {
      attempts[a.question_id] = a;
    }

    const { data: sRow } = await supabase
      .from("lesson_scores")
      .select("id, user_id, lesson_id, correct_questions, updated_at")
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId)
      .maybeSingle();
    lessonScore = (sRow as LessonScore | null) ?? null;
  }

  // Bug 4: essay_ai is reserved/un-gradable — exclude it from the score denominator
  // (mirrors the Variant-A gating exclusion). A lesson with ONLY essay_ai → total 0 →
  // computeLessonScore treats it as "not scored" (white).
  const total = questions.filter((q) => q.type !== "essay_ai").length;
  const correct = Object.values(attempts).filter((a) => a.best_score === 100).length;

  return {
    questions,
    attempts,
    lesson_score: lessonScore,
    score_result: computeLessonScore(correct, total),
  };
}

/**
 * Load a lesson's Wow Notes (ordered). Separate from the interactive state by
 * design — notes are pure authenticated-read content with no per-user state.
 * Safe for lessons with zero notes (returns an empty array). Read-only.
 */
export async function getLessonWowNotes(lessonId: string): Promise<LessonWowNotes> {
  const supabase = createSupabaseServerClient();
  const { data: rows } = await supabase
    .from("wow_notes")
    .select("id, lesson_id, order_index, title, body, media_type, media_ref, side, kind, created_at")
    .eq("lesson_id", lessonId)
    .order("order_index", { ascending: true });

  return { notes: (rows ?? []) as WowNote[] };
}
