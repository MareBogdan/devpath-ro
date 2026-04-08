"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { computeSM2, DEFAULT_SM2_STATE, type SM2State } from "@/lib/flashcard-sm2";
import { awardXP, checkAndAwardBadges } from "@/lib/gamification";

// ─── Update Flashcard Progress ────────────────────────────────────────────────

export async function updateFlashcardProgress(
  flashcardId: string,
  quality: 0 | 1 | 2 | 3 | 4 | 5,
  sessionCardCount: number // 1-based: how many cards have been reviewed so far this session
): Promise<{ error?: string }> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Fetch current SM-2 state (if it exists)
  const { data: existing } = await supabase
    .from("user_flashcard_progress")
    .select("ease_factor, interval_days, repetitions")
    .eq("user_id", user.id)
    .eq("flashcard_id", flashcardId)
    .single();

  const currentState: SM2State = existing
    ? {
        easeFactor: Number(existing.ease_factor),
        intervalDays: Number(existing.interval_days),
        repetitions: Number(existing.repetitions),
      }
    : DEFAULT_SM2_STATE;

  const result = computeSM2(currentState, quality);

  const { error } = await supabase.from("user_flashcard_progress").upsert(
    {
      user_id: user.id,
      flashcard_id: flashcardId,
      ease_factor: result.easeFactor,
      interval_days: result.intervalDays,
      repetitions: result.repetitions,
      due_date: result.dueDate.toISOString(),
      last_reviewed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,flashcard_id" }
  );

  if (error) return { error: error.message };

  // Award XP + badge after completing the 10th card in this session
  if (sessionCardCount === 10) {
    await awardXP(user.id, "flashcard_session").catch(() => null);
    await checkAndAwardBadges(user.id, {
      event: "flashcard_session",
      cardCount: sessionCardCount,
    }).catch(() => null);
  }

  return {};
}
