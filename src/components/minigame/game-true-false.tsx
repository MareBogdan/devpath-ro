"use client";

// Game 4 — True or False
// Lesson 12: Deep Learning
// 5 statements, click Adevărat/Fals. 10s timer per question with speed bonus.

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface MinigameProps {
  onComplete: (score: number, isPerfect: boolean) => void;
}

interface Statement {
  id: number;
  text: string;
  answer: boolean;
  explanation: string;
}

const STATEMENTS: Statement[] = [
  {
    id: 1,
    text: "Deep Learning necesită cantități mici de date pentru antrenament.",
    answer: false,
    explanation: "Deep Learning necesită cantități mari de date pentru rezultate bune.",
  },
  {
    id: 2,
    text: "Rețelele convoluționale (CNN) sunt excelente pentru analiza imaginilor.",
    answer: true,
    explanation: "CNN-urile sunt optimizate pentru recunoașterea pattern-urilor spațiale din imagini.",
  },
  {
    id: 3,
    text: "Un neuron artificial calculează suma ponderată a intrărilor și aplică o funcție de activare.",
    answer: true,
    explanation: "Exact — funcția de activare introduce non-linearitatea necesară rețelei.",
  },
  {
    id: 4,
    text: "Deep Learning și Machine Learning sunt termeni interschimbabili.",
    answer: false,
    explanation: "Deep Learning este o subramură a Machine Learning, nu echivalentul său.",
  },
  {
    id: 5,
    text: "GPU-urile accelerează semnificativ antrenarea rețelelor neuronale.",
    answer: true,
    explanation: "GPU-urile permit paralelizarea calculelor matriciale, reducând timpii de antrenament.",
  },
];

const TIME_PER_QUESTION = 10; // seconds

export function GameTrueFalse({ onComplete }: MinigameProps) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(boolean | null)[]>(Array(STATEMENTS.length).fill(null));
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [showFeedback, setShowFeedback] = useState(false);
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const statement = STATEMENTS[current];
  const selectedAnswer = answers[current];

  function clearTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  useEffect(() => {
    if (done || showFeedback) return;
    setTimeLeft(TIME_PER_QUESTION);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearTimer();
          // Auto-submit null (wrong)
          handleAnswer(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearTimer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, done]);

  function handleAnswer(value: boolean | null) {
    clearTimer();
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = value;
      return next;
    });
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      if (current + 1 >= STATEMENTS.length) {
        setDone(true);
        // Calculate score and emit
        const correctCount = answers.filter((a, i) => {
          const ans = i === current ? value : a;
          return ans === STATEMENTS[i].answer;
        }).length;
        // Count the current answer too
        const actualCorrect = answers.reduce((acc, a, i) => {
          if (i === current) return acc + (value === STATEMENTS[i].answer ? 1 : 0);
          return acc + (a === STATEMENTS[i].answer ? 1 : 0);
        }, 0);
        const score = Math.round((actualCorrect / STATEMENTS.length) * 100);
        setTimeout(() => onComplete(score, score === 100), 400);
      } else {
        setCurrent((c) => c + 1);
      }
    }, 1000);
  }

  const timerPercent = (timeLeft / TIME_PER_QUESTION) * 100;
  const isCorrect = selectedAnswer !== null && selectedAnswer === statement.answer;

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h3 className="font-bold text-lg">Adevărat sau Fals?</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Întrebarea {current + 1} din {STATEMENTS.length}
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2">
        {STATEMENTS.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 w-2 rounded-full transition-colors",
              i < current
                ? answers[i] === STATEMENTS[i].answer
                  ? "bg-green-500"
                  : "bg-red-400"
                : i === current
                ? "bg-primary"
                : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Timer bar */}
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={cn(
            "h-full rounded-full transition-colors",
            timeLeft > 5 ? "bg-primary" : "bg-orange-500"
          )}
          style={{ width: `${timerPercent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Statement card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "rounded-xl border-2 p-6 text-center min-h-[120px] flex flex-col justify-center",
            showFeedback
              ? isCorrect
                ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                : "border-red-400 bg-red-50 dark:bg-red-950/30"
              : "border-border bg-card"
          )}
        >
          <p className="text-base font-medium leading-relaxed">{statement.text}</p>

          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center justify-center gap-2"
            >
              {isCorrect ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <p className={cn(
                "text-sm",
                isCorrect ? "text-green-700 dark:text-green-300" : "text-red-600 dark:text-red-400"
              )}>
                {isCorrect ? "Corect! " : `Fals — Răspuns: ${statement.answer ? "Adevărat" : "Fals"}. `}
                {statement.explanation}
              </p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Answer buttons */}
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          whileHover={!showFeedback ? { scale: 1.03 } : {}}
          whileTap={!showFeedback ? { scale: 0.97 } : {}}
          onClick={() => !showFeedback && handleAnswer(true)}
          disabled={showFeedback}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl py-4 font-bold text-lg border-2 transition",
            showFeedback && selectedAnswer === true
              ? statement.answer
                ? "bg-green-100 border-green-500 text-green-700 dark:bg-green-950/40"
                : "bg-red-100 border-red-400 text-red-700 dark:bg-red-950/40"
              : "bg-green-50 border-green-300 text-green-700 hover:bg-green-100 dark:bg-green-950/20 dark:border-green-800 dark:text-green-300"
          )}
        >
          <CheckCircle2 className="h-5 w-5" />
          Adevărat
        </motion.button>

        <motion.button
          whileHover={!showFeedback ? { scale: 1.03 } : {}}
          whileTap={!showFeedback ? { scale: 0.97 } : {}}
          onClick={() => !showFeedback && handleAnswer(false)}
          disabled={showFeedback}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl py-4 font-bold text-lg border-2 transition",
            showFeedback && selectedAnswer === false
              ? !statement.answer
                ? "bg-green-100 border-green-500 text-green-700 dark:bg-green-950/40"
                : "bg-red-100 border-red-400 text-red-700 dark:bg-red-950/40"
              : "bg-red-50 border-red-300 text-red-700 hover:bg-red-100 dark:bg-red-950/20 dark:border-red-800 dark:text-red-300"
          )}
        >
          <XCircle className="h-5 w-5" />
          Fals
        </motion.button>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        <span>{timeLeft}s</span>
      </div>
    </div>
  );
}
