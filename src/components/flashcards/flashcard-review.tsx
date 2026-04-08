"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Zap, BookOpen, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateFlashcardProgress } from "@/app/(dashboard)/flashcards/actions";
import type { ReviewCard } from "@/app/(dashboard)/flashcards/page";

// ─── Quality labels ───────────────────────────────────────────────────────────

const QUALITY_BUTTONS = [
  { quality: 0 as const, label: "Uitat",   color: "text-red-600   bg-red-50   border-red-300   hover:bg-red-100   dark:bg-red-950/30   dark:border-red-800   dark:text-red-400"   },
  { quality: 2 as const, label: "Greu",    color: "text-orange-600 bg-orange-50 border-orange-300 hover:bg-orange-100 dark:bg-orange-950/30 dark:border-orange-800 dark:text-orange-400" },
  { quality: 4 as const, label: "Bine",    color: "text-blue-600   bg-blue-50   border-blue-300   hover:bg-blue-100   dark:bg-blue-950/30   dark:border-blue-800   dark:text-blue-400"   },
  { quality: 5 as const, label: "Perfect", color: "text-green-600  bg-green-50  border-green-300  hover:bg-green-100  dark:bg-green-950/30  dark:border-green-800  dark:text-green-400"  },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

interface FlashcardReviewProps {
  cards: ReviewCard[];
}

export function FlashcardReview({ cards: initialCards }: FlashcardReviewProps) {
  const [queue, setQueue] = useState<ReviewCard[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);  // total reviewed this session
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [badgeUnlocked, setBadgeUnlocked] = useState(false);

  const current = queue[currentIndex];
  const remaining = queue.length - currentIndex;

  function handleFlip() {
    if (!flipped) setFlipped(true);
  }

  function handleRate(quality: 0 | 1 | 2 | 3 | 4 | 5) {
    if (!current || isPending) return;

    const nextReviewed = reviewed + 1;
    setReviewed(nextReviewed);

    startTransition(async () => {
      await updateFlashcardProgress(current.id, quality, nextReviewed);
      // Badge unlocked at session card 10
      if (nextReviewed === 10) setBadgeUnlocked(true);
    });

    // Advance to next card
    setFlipped(false);
    if (currentIndex + 1 >= queue.length) {
      setDone(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  // ── Done screen ────────────────────────────────────────────────────────────
  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className="flex flex-col items-center gap-6 py-12 text-center"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/30">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Sesiune completă!</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Ai revizuit {reviewed} carduri azi. Excelent!
          </p>
        </div>

        {badgeUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-5 py-3 dark:bg-amber-950/30 dark:border-amber-800"
          >
            <span className="text-2xl">🃏</span>
            <div className="text-left">
              <p className="font-bold text-sm text-amber-700 dark:text-amber-300">Badge deblocat: Cartele Dibace!</p>
              <p className="text-xs text-muted-foreground">Prima sesiune de 10+ carduri completată.</p>
            </div>
          </motion.div>
        )}

        <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-5 py-2.5">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            {reviewed >= 10 ? "+10 XP" : "Revino mâine pentru mai multe!"}
          </span>
        </div>

        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
        >
          Înapoi la dashboard
          <ChevronRight className="h-4 w-4" />
        </a>
      </motion.div>
    );
  }

  if (!current) return null;

  // ── Progress bar ───────────────────────────────────────────────────────────
  const progressPercent = queue.length > 0
    ? Math.round((currentIndex / queue.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{currentIndex} din {queue.length} revizuite</span>
          <span>{remaining} rămase</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            style={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Lesson label */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <BookOpen className="h-3.5 w-3.5" />
        <span>{current.lesson_title}</span>
        {current.dueDate && (
          <span className="ml-1 rounded bg-orange-100 px-1.5 py-0.5 text-orange-600 text-[10px] font-medium dark:bg-orange-950/40 dark:text-orange-400">
            SCADENT
          </span>
        )}
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.18 }}
          className="cursor-pointer"
          onClick={handleFlip}
          style={{ perspective: 1000 }}
        >
          <motion.div
            className="relative min-h-[200px]"
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.45, type: "spring", stiffness: 180, damping: 20 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 border-border bg-card px-8 text-center shadow-sm"
              style={{ backfaceVisibility: "hidden" }}
            >
              <p className="text-xl font-bold text-foreground">{current.front_text}</p>
              {!flipped && (
                <p className="mt-4 text-xs text-muted-foreground">
                  Click pentru a vedea definiția
                </p>
              )}
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 border-primary/40 bg-primary/5 px-8 text-center shadow-sm"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <p className="text-base text-foreground/90 leading-relaxed">{current.back_text}</p>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Rating buttons — shown only after flip */}
      <AnimatePresence>
        {flipped && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="space-y-3"
          >
            <p className="text-center text-xs text-muted-foreground font-medium">
              Cât de bine ai știut?
            </p>
            <div className="grid grid-cols-4 gap-2">
              {QUALITY_BUTTONS.map(({ quality, label, color }) => (
                <motion.button
                  key={quality}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleRate(quality)}
                  disabled={isPending}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border-2 py-3 text-sm font-semibold transition",
                    color,
                    isPending && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <span>{label}</span>
                  <span className="text-[10px] font-normal opacity-70">
                    {quality === 0 ? "q:0" : quality === 2 ? "q:2" : quality === 4 ? "q:4" : "q:5"}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* SM-2 info tooltip */}
            <p className="text-center text-[11px] text-muted-foreground/60">
              Algoritmul SM-2 calculează automat data urmăorului review.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session counter */}
      <div className="flex justify-center">
        <div className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border",
          reviewed >= 10
            ? "bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
            : "bg-muted border-border text-muted-foreground"
        )}>
          <Zap className="h-3 w-3" />
          Sesiune: {reviewed} {reviewed < 10 ? `/ 10 (XP la 10)` : "✓ XP câștigat!"}
        </div>
      </div>
    </div>
  );
}
