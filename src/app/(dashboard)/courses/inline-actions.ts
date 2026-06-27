"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  inlineQuestionSchema,
  inlineUserAnswerSchema,
} from "@/lib/inline-question-schema";
import { verifyInlineAnswer, computeLessonScore } from "@/lib/inline-scoring";
import type {
  InlineAttempt,
  InlineQuestion,
  InlineUserAnswer,
  LessonScoreResult,
  SaveAttemptResult,
} from "@/types";

type SupabaseServer = ReturnType<typeof createSupabaseServerClient>;

// Neutral score used on bailed/unsupported returns (UI ignores it when `error` set).
const NEUTRAL_SCORE: LessonScoreResult = computeLessonScore(0, 0);

function bail(error: string): SaveAttemptResult {
  return {
    error,
    correct: false,
    best_score: 0,
    attempts: 0,
    revealed: false,
    explanation: null,
    lesson_score: NEUTRAL_SCORE,
  };
}

/**
 * Recompute the per-lesson tally and persist ONLY the raw `correct_questions`
 * (score + total are computed live, never stored). Count-based recompute is
 * naturally CONVERGENT: a race on rapid concurrent submits at worst settles on
 * the next submit (or next page load via the loader), never corrupting state.
 * Returns the live LessonScoreResult (total computed from the question count).
 */
async function recomputeLessonScore(
  supabase: SupabaseServer,
  userId: string,
  lessonId: string
): Promise<LessonScoreResult> {
  // total = live count of the lesson's LOCALLY-GRADABLE inline questions (NOT stored).
  // essay_ai is reserved/un-gradable, so it is excluded from the denominator — mirroring
  // the Variant-A gating exclusion. Otherwise a lesson with an essay_ai could never reach
  // GREEN (all gradable correct but total inflated by the un-scorable essay). (Bug 4)
  const { data: qIdRows } = await supabase
    .from("inline_questions")
    .select("id")
    .eq("lesson_id", lessonId)
    .neq("type", "essay_ai");
  const ids = (qIdRows ?? []).map((r) => r.id as string);
  const total = ids.length;

  if (total === 0) {
    // Question-less lesson: nothing to persist, neutral result.
    return computeLessonScore(0, 0);
  }

  // correct = this user's attempts with best_score === 100 among these questions.
  const { count } = await supabase
    .from("inline_attempts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("best_score", 100)
    .in("question_id", ids);
  const correct = count ?? 0;

  await supabase.from("lesson_scores").upsert(
    { user_id: userId, lesson_id: lessonId, correct_questions: correct },
    { onConflict: "user_id,lesson_id" }
  );

  return computeLessonScore(correct, total);
}

/**
 * Save one inline-question submission. Server Action — mirrors markLessonComplete:
 * auth first, RLS-scoped writes, typed return. NO XP coupling
 * (does not touch awardXP / XP RPCs / user_progress / xp_events).
 *
 * Rules:
 *  - essay_ai is reserved → rejected, no write.
 *  - A question already at best_score === 100 is LOCKED → read-only; returns its
 *    correct/locked state without incrementing attempts or writing.
 *  - Otherwise per-question score is BINARY (100 if fully correct, else 0);
 *    best_score never decreases; `revealed` becomes true on a correct answer or
 *    after the SECOND wrong submission.
 *
 * The returned object carries everything the UI needs to update optimistically;
 * revalidation is only for reload-consistency.
 */
export async function saveInlineAttempt(
  questionId: string,
  userAnswer: InlineUserAnswer
): Promise<SaveAttemptResult> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return bail("Neautentificat.");

  // Never trust the client payload (public endpoint).
  const answerParsed = inlineUserAnswerSchema.safeParse(userAnswer);
  if (!answerParsed.success) return bail("Răspuns invalid.");
  const answer = answerParsed.data;

  // Load the question (content is authenticated-read).
  const { data: qRow } = await supabase
    .from("inline_questions")
    .select("id, lesson_id, type, order_index, content, created_at")
    .eq("id", questionId)
    .maybeSingle();
  if (!qRow) return bail("Întrebare inexistentă.");
  const question = qRow as InlineQuestion;

  // essay_ai is reserved — never locally graded.
  if (question.type === "essay_ai") {
    return bail("Tip de întrebare nesuportat (essay_ai).");
  }

  const lessonId = question.lesson_id;

  // Load existing attempt (needed for the lock check + best/attempt carry-over).
  const { data: existing } = await supabase
    .from("inline_attempts")
    .select("id, user_id, question_id, best_score, attempts, revealed, updated_at")
    .eq("question_id", questionId)
    .eq("user_id", user.id)
    .maybeSingle();
  const prior = (existing as InlineAttempt | null) ?? null;

  // Validate content + grade (catch malformed-content authoring bugs).
  let explanation: string | null = null;
  let correct: boolean;
  try {
    const parsed = inlineQuestionSchema.parse({
      type: question.type,
      content: question.content,
    });
    explanation =
      "explanation" in parsed.content ? parsed.content.explanation : null;
    correct = verifyInlineAnswer(question, answer);
  } catch {
    return bail("Conținut invalid.");
  }

  // LOCK: already-correct questions are read-only — return state, do NOT re-score.
  if (prior && prior.best_score === 100) {
    const lesson_score = await recomputeLessonScore(supabase, user.id, lessonId);
    return {
      correct: true,
      best_score: 100,
      attempts: prior.attempts,
      revealed: true,
      explanation, // surfaced for a locked/correct question
      lesson_score,
    };
  }

  const newAttempts = (prior?.attempts ?? 0) + 1;
  const submissionScore = correct ? 100 : 0;
  const bestScore = Math.max(prior?.best_score ?? 0, submissionScore); // never decreases
  const revealed =
    (prior?.revealed ?? false) || correct || (newAttempts >= 2 && !correct);

  const { error: upsertErr } = await supabase.from("inline_attempts").upsert(
    {
      user_id: user.id,
      question_id: questionId,
      best_score: bestScore,
      attempts: newAttempts,
      revealed,
    },
    { onConflict: "user_id,question_id" }
  );
  if (upsertErr) return bail(upsertErr.message);

  const lesson_score = await recomputeLessonScore(supabase, user.id, lessonId);

  // Intentionally NO revalidatePath here. The returned result already drives the
  // optimistic UI, and the lesson page re-reads inline state server-side on every
  // (dynamic) load via getLessonInteractiveState — nothing else in the /courses
  // segment renders lesson_scores. A layout-level revalidate was not just redundant
  // but harmful: it refetched THIS lesson page mid-transition, remounting the MDX
  // subtree and wiping each <InlineQuestion>'s local draft + 1st-wrong feedback
  // (shake / "Mai încearcă" / Cosmo). Server stays the source of truth. (Bug 2)

  return {
    correct,
    best_score: bestScore,
    attempts: newAttempts,
    revealed,
    explanation: revealed ? explanation : null, // shown on correct or after 2nd wrong
    lesson_score,
  };
}
