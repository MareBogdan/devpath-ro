"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AIQuestion {
  id?: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

interface AdaptiveQuizSectionProps {
  lessonId: string;
  /**
   * false (default): opt-in — show an intro + "Testează-te" button and call Claude
   * only on click, so opening a lesson costs nothing. true: generate on mount
   * (used after a failed quiz, where the learner has already asked for practice).
   */
  autoStart?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdaptiveQuizSection({ lessonId, autoStart = false }: AdaptiveQuizSectionProps) {
  const [started, setStarted] = useState(autoStart);
  const [questions, setQuestions] = useState<AIQuestion[]>([]);
  const [loading, setLoading] = useState(autoStart);
  // true when generation failed (non-2xx / network) or returned no usable questions.
  const [failed, setFailed] = useState(false);
  // Retry repeats the attempt that failed (plain load vs. "generate others").
  const [lastForce, setLastForce] = useState(false);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  async function fetchQuestions(forceRegenerate = false) {
    setLoading(true);
    setFailed(false);
    setLastForce(forceRegenerate);
    setSelected({});
    setRevealed({});
    try {
      const res = await fetch("/api/ai/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, forceRegenerate }),
      });
      if (!res.ok) throw new Error("Eroare la generare");
      const data = (await res.json()) as { questions?: AIQuestion[] };
      // Keep only well-formed questions so a bad payload can never crash the render.
      const valid = (Array.isArray(data.questions) ? data.questions : []).filter(
        (q) =>
          typeof q?.question === "string" &&
          Array.isArray(q.options) &&
          q.options.length > 0
      );
      if (valid.length === 0) throw new Error("Niciun răspuns valid");
      setQuestions(valid);
    } catch (err) {
      console.warn("[adaptive-quiz] Failed to generate questions:", err);
      setQuestions([]);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }

  // Opt-in: nothing is fetched until the learner starts (unless autoStart).
  useEffect(() => {
    if (autoStart) fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, autoStart]);

  function handleStart() {
    if (started || loading) return;
    setStarted(true);
    fetchQuestions();
  }

  function handleSelect(qIndex: number, optIndex: number) {
    if (revealed[qIndex]) return;
    setSelected((prev) => ({ ...prev, [qIndex]: optIndex }));
    setRevealed((prev) => ({ ...prev, [qIndex]: true }));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mt-12 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/40">
            <Bot className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-foreground">Practică personalizată</h3>
              <span className="rounded-full bg-amber-100 dark:bg-amber-950/40 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                🤖 AI
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Întrebări generate de AI pe baza lecției
            </p>
          </div>
        </div>

        {started && (
          <button
            onClick={() => fetchQuestions(true)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition disabled:opacity-50"
          >
            <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
            Generează alte întrebări
          </button>
        )}
      </div>

      <div className="h-px bg-amber-200 dark:bg-amber-800/50" />

      {/* Content */}
      <AnimatePresence mode="wait">
        {!started ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/60 dark:bg-amber-950/20 p-6 text-center"
          >
            <p className="text-sm text-foreground max-w-md">
              Vrei să vezi cât ai reținut? AI-ul îți generează 3 întrebări despre această
              lecție, doar când apeși butonul. Practică liberă — fără notă, fără XP.
            </p>
            <button
              onClick={handleStart}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition"
            >
              <Bot className="h-4 w-4" />
              Testează-te cu un quiz
            </button>
          </motion.div>
        ) : loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 py-10 text-center"
          >
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-2 w-2 rounded-full bg-amber-400"
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              AI-ul generează întrebări personalizate...
            </p>
          </motion.div>
        ) : failed ? (
          <motion.div
            key="error"
            role="status"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/60 dark:bg-amber-950/20 p-6 text-center"
          >
            <p className="text-sm text-amber-900 dark:text-amber-200">
              Nu am putut genera întrebări acum. Încearcă din nou.
            </p>
            <button
              onClick={() => fetchQuestions(lastForce)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-100 dark:bg-amber-950/40 px-3 py-1.5 text-xs font-medium text-amber-800 dark:text-amber-200 hover:bg-amber-200/70 dark:hover:bg-amber-950/60 transition disabled:opacity-50"
            >
              <RefreshCw className="h-3 w-3" />
              Încearcă din nou
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="questions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {questions.map((q, qIndex) => (
              <motion.div
                key={qIndex}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: qIndex * 0.1, duration: 0.25 }}
                className="space-y-3"
              >
                {/* Question */}
                <div className="flex items-start gap-3">
                  <span className="flex-none mt-0.5 h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center justify-center shrink-0">
                    {qIndex + 1}
                  </span>
                  <p className="font-medium text-foreground leading-snug">{q.question}</p>
                </div>

                {/* Options */}
                <div className="ml-9 space-y-2">
                  {q.options.map((option, optIndex) => {
                    const isSelected = selected[qIndex] === optIndex;
                    const isCorrect = optIndex === q.correct_answer;
                    const isRevealed = !!revealed[qIndex];

                    let style = "border-border bg-card hover:border-amber-300 hover:bg-amber-50/50 dark:hover:bg-amber-950/20";
                    if (isRevealed && isCorrect) {
                      style = "border-green-500 bg-green-50 dark:bg-green-950/30";
                    } else if (isRevealed && isSelected && !isCorrect) {
                      style = "border-red-400 bg-red-50 dark:bg-red-950/30";
                    } else if (!isRevealed && isSelected) {
                      style = "border-amber-400 bg-amber-50/60 dark:bg-amber-950/20";
                    }

                    return (
                      <button
                        key={optIndex}
                        onClick={() => handleSelect(qIndex, optIndex)}
                        disabled={isRevealed}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all duration-150 text-sm",
                          style,
                          isRevealed ? "cursor-default" : "cursor-pointer active:scale-[0.98]"
                        )}
                      >
                        <span
                          className={cn(
                            "flex-none h-5 w-5 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0",
                            isRevealed && isCorrect
                              ? "border-green-500 bg-green-500 text-white"
                              : isRevealed && isSelected && !isCorrect
                              ? "border-red-400 bg-red-400 text-white"
                              : "border-muted-foreground/30"
                          )}
                        >
                          {isRevealed && isCorrect ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : isRevealed && isSelected && !isCorrect ? (
                            <XCircle className="h-3 w-3" />
                          ) : (
                            String.fromCharCode(65 + optIndex)
                          )}
                        </span>
                        <span
                          className={cn(
                            isRevealed && isCorrect
                              ? "text-green-700 dark:text-green-300 font-medium"
                              : isRevealed && isSelected && !isCorrect
                              ? "text-red-600 dark:text-red-400"
                              : "text-foreground"
                          )}
                        >
                          {option}
                        </span>
                      </button>
                    );
                  })}

                  {/* Explanation */}
                  <AnimatePresence>
                    {revealed[qIndex] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2 p-3 rounded-lg text-sm border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 overflow-hidden"
                      >
                        <span className="font-semibold">
                          {selected[qIndex] === q.correct_answer ? "✓ Corect! " : "✗ Răspuns greșit. "}
                        </span>
                        {q.explanation}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}

            {questions.length > 0 && (
              <p className="text-center text-xs text-muted-foreground/60">
                Practică liberă — fără notă, fără XP. Click pe un răspuns pentru feedback instant.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
