"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, ArrowRight, BookOpen, Brain, Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  markLessonComplete,
  type MarkCompleteResult,
} from "@/app/(dashboard)/courses/actions";
import confetti from "canvas-confetti";
import { safeConfetti } from "@/components/gamification/gamification-boundary";

interface CompleteButtonProps {
  lessonId: string;
  courseSlug: string;
  isCompleted: boolean;
  nextLessonId: string | null;
  /** Course the next lesson lives in (differs from courseSlug across a course boundary). */
  nextCourseSlug?: string | null;
  isReadingComplete?: boolean; // defaults true for quiz/exercise/project
  isInlineComplete?: boolean;  // defaults true when no inline questions (Variant A: all attempted)
  /** Lab/boss lessons: false until the embedded game reports it was finished. Defaults true. */
  isGameComplete?: boolean;
  /** Answerable inline questions in the lesson / how many are still unattempted (for the visible gate reason). */
  inlineTotal?: number;
  inlineRemaining?: number;
  onCompleted?: (result: MarkCompleteResult) => void;
}

export function CompleteButton({
  lessonId,
  courseSlug,
  isCompleted: initialCompleted,
  nextLessonId: initialNextId,
  nextCourseSlug: initialNextCourseSlug,
  isReadingComplete = true,
  isInlineComplete = true,
  isGameComplete = true,
  inlineTotal = 0,
  inlineRemaining = 0,
  onCompleted,
}: CompleteButtonProps) {
  const hintId = useId();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [nextLessonId, setNextLessonId] = useState(initialNextId);
  const [nextCourseSlug, setNextCourseSlug] = useState(initialNextCourseSlug);

  const isUnlocked = isReadingComplete && isInlineComplete && isGameComplete;

  // Why the button is locked — VISIBLE text under it, never a hover tooltip (a phone has no hover:
  // the student would see a grey button and no reason). One line per gate that is still blocking.
  const reasons: { key: string; text: string }[] = [];
  if (!isReadingComplete) reasons.push({ key: "read", text: "Citește lecția până la capăt." });
  if (!isInlineComplete) reasons.push({ key: "inline", text: inlineReason(inlineTotal, inlineRemaining) });
  if (!isGameComplete) reasons.push({ key: "game", text: "Termină jocul ca să poți marca lecția ca finalizată." });

  function fireConfetti() {
    safeConfetti(() =>
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.7 },
        colors: ["#6366f1", "#8b5cf6", "#22c55e", "#f59e0b", "#3b82f6"],
      })
    );
  }

  function handleComplete() {
    if (!isUnlocked) return;
    startTransition(async () => {
      const result = await markLessonComplete(lessonId, courseSlug);
      if (result.success) {
        setIsCompleted(true);
        setNextLessonId(result.nextLessonId);
        setNextCourseSlug(result.nextCourseSlug);
        fireConfetti();
        window.dispatchEvent(
          new CustomEvent("lesson-presence:complete", { detail: { lessonId } })
        );
        onCompleted?.(result);
      }
    });
  }

  function handleNext() {
    if (nextLessonId) {
      // nextCourseSlug differs from courseSlug when the next lesson is the first
      // one of the next course.
      router.push(`/courses/${nextCourseSlug ?? courseSlug}/${nextLessonId}`);
    } else {
      // End of the available curriculum — go back to the course map with this
      // course pre-selected (avoids the /courses/[slug] → /courses?c=<slug>
      // redirect hop introduced in 1.5b).
      router.push(`/courses?c=${courseSlug}`);
    }
  }

  if (isCompleted) {
    return (
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
          <CheckCircle2 className="h-5 w-5" />
          Lecție completată
        </div>
        <button
          onClick={handleNext}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-2 rounded-lg transition text-sm"
        >
          Lecția următoare
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative group">
      <motion.button
        onClick={handleComplete}
        disabled={isPending || !isUnlocked}
        aria-describedby={reasons.length > 0 ? hintId : undefined}
        animate={
          isUnlocked && !isPending
            ? {
                scale: [1, 1.02, 1],
                transition: { repeat: Infinity, repeatDelay: 3, duration: 0.6 },
              }
            : {}
        }
        className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-medium px-5 py-2.5 rounded-lg transition"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Se salvează...
          </>
        ) : !isReadingComplete ? (
          <>
            <BookOpen className="h-4 w-4" />
            Marchează completat
          </>
        ) : !isInlineComplete ? (
          <>
            <Brain className="h-4 w-4" />
            Marchează completat
          </>
        ) : !isGameComplete ? (
          <>
            <Gamepad2 className="h-4 w-4" />
            Marchează completat
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Marchează completat
          </>
        )}
      </motion.button>

      {reasons.length > 0 && (
        <div
          id={hintId}
          data-testid="complete-gate-hint"
          aria-live="polite"
          className="mt-2 max-w-[18rem] space-y-0.5 text-xs leading-snug text-muted-foreground sm:text-right"
        >
          {reasons.map((r) => (
            <p key={r.key} data-testid={r.key === "game" ? "game-gate-hint" : `${r.key}-gate-hint`}>
              {r.text}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

/** "Răspunde la cele 3 întrebări din lecție" — or, once some are answered, how many are left. */
function inlineReason(total: number, remaining: number): string {
  if (total <= 0) return "Răspunde la întrebările din lecție.";
  if (total === 1) return "Răspunde la întrebarea din lecție.";
  if (remaining >= total) return `Răspunde la cele ${total} întrebări din lecție.`;
  if (remaining === 1) return "Mai ai de răspuns la o întrebare din lecție.";
  return `Mai ai de răspuns la ${remaining} din cele ${total} întrebări din lecție.`;
}
