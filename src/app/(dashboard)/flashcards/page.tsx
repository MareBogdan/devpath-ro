import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FlashcardReview } from "@/components/flashcards/flashcard-review";
import { BookOpen, Layers } from "lucide-react";

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

// ─── Page ─────────────────────────────────────────────────────────────────────

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
    .select("flashcard_id")
    .eq("user_id", user.id);

  const studiedIds = allProgress?.map((p) => p.flashcard_id) ?? [];

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

  // ── 3. Merge: due first, then new ─────────────────────────────────────────
  const cards: ReviewCard[] = [...dueFlashcards, ...newReviewCards];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Layers className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Carduri Flash</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Recenzie zilnică cu algoritmul SM-2 — carduri sortate după dată de revizuire.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 space-y-1">
          <p className="text-2xl font-bold text-primary">{dueFlashcards.length}</p>
          <p className="text-xs text-muted-foreground">Carduri scadente azi</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 space-y-1">
          <p className="text-2xl font-bold">{newReviewCards.length}</p>
          <p className="text-xs text-muted-foreground">Carduri noi disponibile</p>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/40" />
          <div>
            <p className="font-semibold text-lg">Nicio carte de revizuit!</p>
            <p className="text-muted-foreground text-sm mt-1">
              Felicitări — ai terminat toate cardurile de azi. Revino mâine!
            </p>
          </div>
        </div>
      ) : (
        <FlashcardReview cards={cards} />
      )}
    </div>
  );
}
