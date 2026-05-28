import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FlashcardsContent } from "@/components/flashcards/flashcards-content";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReviewCard {
  id: string;
  front_text: string;
  back_text: string;
  lesson_title: string;
  // SM-2 state (null = brand-new card, never studied)
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  dueDate: string | null;
}

// ─── Page (RSC, data fetch only) ─────────────────────────────────────────────

export default async function FlashcardsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date().toISOString();

  // ── 1. Due cards (have progress, due_date <= now) ──────────────────────────
  const { data: dueProgress } = await supabase
    .from("user_flashcard_progress")
    .select("flashcard_id, ease_factor, interval_days, repetitions, due_date")
    .eq("user_id", user.id)
    .lte("due_date", today);

  const dueIds = dueProgress?.map((p) => p.flashcard_id) ?? [];
  const dueFlashcards: ReviewCard[] = [];

  if (dueIds.length > 0) {
    const { data: cards } = await supabase
      .from("flashcards")
      .select("id, front_text, back_text, lesson_id, lessons!inner(title)")
      .in("id", dueIds);

    for (const card of cards ?? []) {
      const prog = dueProgress?.find((p) => p.flashcard_id === card.id);
      const lesson = card.lessons as unknown as { title: string } | null;
      dueFlashcards.push({
        id: card.id,
        front_text: card.front_text,
        back_text: card.back_text,
        lesson_title: lesson?.title ?? "Lecție",
        easeFactor: Number(prog?.ease_factor ?? 2.5),
        intervalDays: Number(prog?.interval_days ?? 1),
        repetitions: Number(prog?.repetitions ?? 0),
        dueDate: prog?.due_date ?? null,
      });
    }
  }

  // ── 2. New cards (no progress row at all), up to 10 ───────────────────────
  const { data: allProgress } = await supabase
    .from("user_flashcard_progress")
    .select("flashcard_id, repetitions")
    .eq("user_id", user.id);

  const studiedIds = (allProgress ?? []).map((p) => p.flashcard_id);

  let newCardQuery = supabase
    .from("flashcards")
    .select("id, front_text, back_text, lessons!inner(title)")
    .order("order_index")
    .limit(10);

  if (studiedIds.length > 0) {
    newCardQuery = newCardQuery.not("id", "in", `(${studiedIds.join(",")})`);
  }

  const { data: newCards } = await newCardQuery;

  const newReviewCards: ReviewCard[] = (newCards ?? []).map((card) => {
    const lesson = card.lessons as unknown as { title: string } | null;
    return {
      id: card.id,
      front_text: card.front_text,
      back_text: card.back_text,
      lesson_title: lesson?.title ?? "Lecție",
      easeFactor: 2.5,
      intervalDays: 1,
      repetitions: 0,
      dueDate: null,
    };
  });

  // ── 3. Stats: total reviewed ever, mastered (rep ≥ 3), total catalog size ─
  const totalReviewed = (allProgress ?? []).filter(
    (p) => Number(p.repetitions) > 0
  ).length;
  const totalMastered = (allProgress ?? []).filter(
    (p) => Number(p.repetitions) >= 3
  ).length;

  const { count: totalCatalogCount } = await supabase
    .from("flashcards")
    .select("id", { count: "exact", head: true });

  // ── 4. User streak (global)
  const { data: profile } = await supabase
    .from("users")
    .select("streak_count")
    .eq("id", user.id)
    .single();
  const streakCount = (profile?.streak_count as number | null) ?? 0;

  // ── 5. Merge: due first, then new ─────────────────────────────────────────
  const cards: ReviewCard[] = [...dueFlashcards, ...newReviewCards];

  return (
    <FlashcardsContent
      cards={cards}
      dueCount={dueFlashcards.length}
      newCount={newReviewCards.length}
      totalReviewed={totalReviewed}
      totalMastered={totalMastered}
      totalCatalog={totalCatalogCount ?? 0}
      streakCount={streakCount}
    />
  );
}
