"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { awardGateXP } from "@/app/(dashboard)/courses/actions";
import { CosmoMascot } from "@/components/mascot/cosmo-mascot";

interface GateQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

interface LessonGateProps {
  questions: GateQuestion[];
  lessonId: string;
  visible: boolean; // pass hasReachedEnd from useReadingProgress
  onAllCorrect: () => void;
}

export function LessonGate({
  questions,
  lessonId,
  visible,
  onAllCorrect,
}: LessonGateProps) {
  const [answers, setAnswers] = useState<Record<string, number | null>>(
    Object.fromEntries(questions.map((q) => [q.id, null]))
  );
  const [shaking, setShaking] = useState<string | null>(null);
  const [xpAwarded, setXpAwarded] = useState<Record<string, boolean>>({});
  const [lastAnswerWrong, setLastAnswerWrong] = useState(false);

  if (questions.length === 0) return null;

  function handleAnswer(questionId: string, optionIndex: number) {
    const question = questions.find((q) => q.id === questionId)!;
    if (answers[questionId] === question.correct_answer) return; // already correct

    if (optionIndex === question.correct_answer) {
      setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
      // Award XP on first correct attempt
      if (!xpAwarded[questionId]) {
        setXpAwarded((prev) => ({ ...prev, [questionId]: true }));
        awardGateXP(questionId, lessonId).catch(() => {});
      }
      setLastAnswerWrong(false);
      // Check if all correct
      const newAnswers = { ...answers, [questionId]: optionIndex };
      const allCorrect = questions.every(
        (q) => newAnswers[q.id] === q.correct_answer
      );
      if (allCorrect) {
        setTimeout(onAllCorrect, 600);
      }
    } else {
      setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
      setShaking(questionId);
      setLastAnswerWrong(true);
      setTimeout(() => setShaking(null), 600);
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="mt-10 mb-4 rounded-xl border border-primary/20 bg-primary/5 p-6"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <span>🧠</span> Verifică ce ai reținut
          </h3>

          <div className="space-y-6">
            {questions.map((q) => {
              const selected = answers[q.id];
              const isCorrect = selected === q.correct_answer;
              const isWrong =
                selected !== null && selected !== q.correct_answer;

              return (
                <motion.div
                  key={q.id}
                  animate={
                    shaking === q.id
                      ? { x: [-6, 6, -5, 5, -3, 3, 0] }
                      : { x: 0 }
                  }
                  transition={{ duration: 0.4 }}
                >
                  <p className="text-sm font-medium text-foreground mb-3">
                    {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((option, idx) => {
                      const isSelected = selected === idx;
                      const isThisCorrect = idx === q.correct_answer;
                      let buttonClass =
                        "w-full text-left text-sm px-4 py-2.5 rounded-lg border transition cursor-pointer ";
                      if (isCorrect && isThisCorrect) {
                        buttonClass +=
                          "border-green-400 bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-300 dark:border-green-700";
                      } else if (isWrong && isSelected) {
                        buttonClass +=
                          "border-red-400 bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300 dark:border-red-700";
                      } else {
                        buttonClass +=
                          "border-border bg-background hover:bg-muted/50 text-foreground";
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleAnswer(q.id, idx)}
                          disabled={isCorrect}
                          className={buttonClass}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>

                  {isWrong && (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5"
                    >
                      <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                      Hai, că merge! Mai o dată — citește din nou paragraful
                      relevant.
                    </motion.p>
                  )}

                  {isCorrect && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 space-y-1"
                    >
                      <p className="text-xs text-green-700 dark:text-green-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        Corect! +5 XP
                      </p>
                      <p className="text-xs text-muted-foreground pl-5">
                        {q.explanation}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Cosmo encouraging mascot on wrong answer */}
          <AnimatePresence>
            {lastAnswerWrong && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="mt-4 flex items-start gap-3 rounded-xl bg-red-50/10 border border-red-200/20 p-3"
              >
                <CosmoMascot emotion="encouraging" size={44} />
                <p className="text-sm text-muted-foreground pt-1">
                  Nu-i bai! Citește din nou lecția și încearcă din nou — poți!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
