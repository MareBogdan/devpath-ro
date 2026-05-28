"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitLessonFeedback } from "@/app/(dashboard)/courses/actions";

interface LessonFeedbackProps {
  lessonId: string;
  show: boolean;
  alreadySubmitted: boolean;
}

export function LessonFeedback({
  lessonId,
  show,
  alreadySubmitted: initialSubmitted,
}: LessonFeedbackProps) {
  const [submitted, setSubmitted] = useState(initialSubmitted);
  const [showThanks, setShowThanks] = useState(false);
  const startTimeRef = useRef(Date.now());

  async function handleFeedback(rating: "clear" | "hard") {
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    await submitLessonFeedback(lessonId, rating, timeSpent);
    setSubmitted(true);
    setShowThanks(true);
    setTimeout(() => setShowThanks(false), 3000);
  }

  if (submitted && !showThanks) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 flex items-center gap-3 flex-wrap"
        >
          {showThanks ? (
            <p className="text-sm text-muted-foreground">
              Mulțumim pentru feedback! 🙏
            </p>
          ) : (
            <>
              <span className="text-sm text-muted-foreground">
                Ți-a fost utilă această lecție?
              </span>
              <button
                onClick={() => handleFeedback("clear")}
                className="text-sm px-3 py-1 rounded-lg border border-border hover:bg-muted transition"
              >
                👍 Da, a fost clară
              </button>
              <button
                onClick={() => handleFeedback("hard")}
                className="text-sm px-3 py-1 rounded-lg border border-border hover:bg-muted transition"
              >
                👎 A fost grea
              </button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
