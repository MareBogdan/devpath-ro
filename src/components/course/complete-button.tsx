"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, ArrowRight, BookOpen, Brain } from "lucide-react";
import { motion } from "framer-motion";
import {
  markLessonComplete,
  type MarkCompleteResult,
} from "@/app/(dashboard)/courses/actions";
import confetti from "canvas-confetti";

interface CompleteButtonProps {
  lessonId: string;
  courseSlug: string;
  isCompleted: boolean;
  nextLessonId: string | null;
  isReadingComplete?: boolean; // defaults true for quiz/exercise/project
  isInlineComplete?: boolean;  // defaults true when no inline questions (Variant A: all attempted)
  onCompleted?: (result: MarkCompleteResult) => void;
}

export function CompleteButton({
  lessonId,
  courseSlug,
  isCompleted: initialCompleted,
  nextLessonId: initialNextId,
  isReadingComplete = true,
  isInlineComplete = true,
  onCompleted,
}: CompleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [nextLessonId, setNextLessonId] = useState(initialNextId);

  const isUnlocked = isReadingComplete && isInlineComplete;

  let tooltipText = "";
  if (!isReadingComplete) tooltipText = "Citește lecția mai întâi 📖";
  else if (!isInlineComplete) tooltipText = "Răspunde la întrebările din lecție";

  function fireConfetti() {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.7 },
      colors: ["#6366f1", "#8b5cf6", "#22c55e", "#f59e0b", "#3b82f6"],
    });
  }

  function handleComplete() {
    if (!isUnlocked) return;
    startTransition(async () => {
      const result = await markLessonComplete(lessonId, courseSlug);
      if (result.success) {
        setIsCompleted(true);
        setNextLessonId(result.nextLessonId);
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
      router.push(`/courses/${courseSlug}/${nextLessonId}`);
    } else {
      // Last lesson in the course — go back to the course map with this
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
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Marchează completat
          </>
        )}
      </motion.button>

      {/* Tooltip when disabled */}
      {tooltipText && (
        <div className="absolute right-0 bottom-full mb-2 w-52 text-xs bg-popover border border-border rounded-lg shadow-lg px-3 py-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 text-center">
          {tooltipText}
        </div>
      )}
    </div>
  );
}
