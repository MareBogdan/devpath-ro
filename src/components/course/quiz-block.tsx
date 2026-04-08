"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Trophy, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  markLessonComplete,
  saveWrongAnswers,
  type WrongAnswer,
} from "@/app/(dashboard)/courses/actions";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

interface QuizBlockProps {
  lessonId: string;
  courseSlug: string;
  questions: QuizQuestion[];
  isCompleted: boolean;
  onQuizFailed?: () => void;
}

type AnswerMap = Record<number, number>; // questionIndex → selectedOption

export function QuizBlock({
  lessonId,
  courseSlug,
  questions,
  isCompleted: initialCompleted,
  onQuizFailed,
}: QuizBlockProps) {
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitted, setSubmitted] = useState(initialCompleted);
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [isPending, startTransition] = useTransition();

  // Normalize correct_answer to number — DB column is TEXT so Supabase
  // returns "1" (string), but optIndex is a JS number. Coerce once here.
  const normalizedQuestions = questions.map((q) => ({
    ...q,
    correct_answer: Number(q.correct_answer),
  }));

  const allAnswered =
    normalizedQuestions.length > 0 &&
    Object.keys(answers).length === normalizedQuestions.length;

  const correctCount = submitted
    ? normalizedQuestions.filter((q, i) => answers[i] === q.correct_answer).length
    : 0;

  const score =
    normalizedQuestions.length > 0
      ? Math.round((correctCount / normalizedQuestions.length) * 100)
      : 0;

  // Used for rendering the score banner after submission
  const passed = score >= 60;

  function handleSelect(qIndex: number, optionIndex: number) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
  }

  function handleSubmit() {
    if (!allAnswered || submitted) return;
    setSubmitted(true);

    // Calculate score using current answers — can't rely on the reactive
    // `correctCount` above because `submitted` is still false at this point.
    const count = normalizedQuestions.filter((q, i) => answers[i] === q.correct_answer).length;
    const submitScore = Math.round((count / normalizedQuestions.length) * 100);
    const submitPassed = submitScore >= 60;

    // Collect wrong answers for adaptive quiz
    const wrong: WrongAnswer[] = normalizedQuestions
      .map((q, i) => ({
        questionId: q.id,
        selectedOption: answers[i] ?? -1,
        correctOption: q.correct_answer,
      }))
      .filter((_, i) => answers[i] !== normalizedQuestions[i].correct_answer);

    if (submitPassed && !isCompleted) {
      startTransition(async () => {
        const result = await markLessonComplete(lessonId, courseSlug);
        if (result.success) setIsCompleted(true);
      });
    }

    // Save wrong answers + trigger adaptive section when score < 80%
    if (submitScore < 80 && wrong.length > 0) {
      startTransition(async () => {
        await saveWrongAnswers(lessonId, wrong);
      });
      onQuizFailed?.();
    }
  }

  function handleRetry() {
    if (isCompleted) return; // don't retry if already completed in DB
    setAnswers({});
    setSubmitted(false);
  }

  if (normalizedQuestions.length === 0) {
    return (
      <div className="mt-8 p-6 rounded-xl border border-border bg-muted/30 text-center text-muted-foreground">
        Nu există întrebări disponibile pentru acest quiz.
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-8">
      {/* Score banner (after submit) */}
      <AnimatePresence>
      {submitted && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={cn(
            "flex items-center gap-4 p-5 rounded-xl border",
            passed
              ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
              : "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800"
          )}
        >
          <Trophy
            className={cn(
              "h-8 w-8 shrink-0",
              passed ? "text-green-600 dark:text-green-400" : "text-orange-500 dark:text-orange-400"
            )}
          />
          <div className="flex-1">
            <p
              className={cn(
                "text-lg font-bold",
                passed ? "text-green-700 dark:text-green-300" : "text-orange-700 dark:text-orange-300"
              )}
            >
              {passed ? "Felicitări! 🎉" : "Continuă să exersezi!"}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {correctCount} din {normalizedQuestions.length} răspunsuri corecte — {score}%
              {passed
                ? " · Modulul 1 completat!"
                : " · Recitește lecțiile și încearcă din nou."}
            </p>
          </div>
          {!passed && !isCompleted && (
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition shrink-0"
            >
              <RotateCcw className="h-4 w-4" />
              Încearcă din nou
            </button>
          )}
        </motion.div>
      )}
      </AnimatePresence>

      {/* Questions */}
      {normalizedQuestions.map((q, qIndex) => {
        const selected = answers[qIndex];
        const isCorrect = submitted && selected === q.correct_answer;

        return (
          <div key={q.id} className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="flex-none mt-0.5 h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                {qIndex + 1}
              </span>
              <p className="font-medium text-foreground leading-snug">{q.question}</p>
            </div>

            <div className="ml-9 space-y-2">
              {q.options.map((option, optIndex) => {
                const isSelected = selected === optIndex;
                const isThisCorrect = optIndex === q.correct_answer;

                let optionStyle = "border-border bg-card hover:border-primary/40 hover:bg-accent/30";
                if (!submitted && isSelected) {
                  optionStyle = "border-primary bg-primary/5";
                } else if (submitted && isThisCorrect) {
                  optionStyle = "border-green-500 bg-green-50 dark:bg-green-950/30";
                } else if (submitted && isSelected && !isThisCorrect) {
                  optionStyle = "border-red-400 bg-red-50 dark:bg-red-950/30";
                }

                return (
                  <button
                    key={optIndex}
                    onClick={() => handleSelect(qIndex, optIndex)}
                    disabled={submitted}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all duration-150 text-sm",
                      optionStyle,
                      submitted ? "cursor-default" : "cursor-pointer active:scale-[0.98]"
                    )}
                  >
                    {/* Option indicator */}
                    <span
                      className={cn(
                        "flex-none h-5 w-5 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0",
                        !submitted && isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : submitted && isThisCorrect
                          ? "border-green-500 bg-green-500 text-white"
                          : submitted && isSelected && !isThisCorrect
                          ? "border-red-400 bg-red-400 text-white"
                          : "border-muted-foreground/30"
                      )}
                    >
                      {submitted && isThisCorrect ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : submitted && isSelected && !isThisCorrect ? (
                        <XCircle className="h-3 w-3" />
                      ) : (
                        String.fromCharCode(65 + optIndex) // A, B, C, D
                      )}
                    </span>
                    <span
                      className={cn(
                        submitted && isThisCorrect
                          ? "text-green-700 dark:text-green-300 font-medium"
                          : submitted && isSelected && !isThisCorrect
                          ? "text-red-600 dark:text-red-400"
                          : "text-foreground"
                      )}
                    >
                      {option}
                    </span>
                  </button>
                );
              })}

              {/* Explanation (shown after submit) */}
              {submitted && (
                <div
                  className={cn(
                    "mt-2 p-3 rounded-lg text-sm border-l-4",
                    isCorrect
                      ? "bg-green-50 dark:bg-green-950/20 border-green-500 text-green-800 dark:text-green-200"
                      : "bg-blue-50 dark:bg-blue-950/20 border-blue-400 text-blue-800 dark:text-blue-200"
                  )}
                >
                  <span className="font-semibold">{isCorrect ? "✓ Corect! " : "✗ Răspuns greșit. "}</span>
                  {q.explanation}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Submit button */}
      {!submitted && (
        <div className="ml-9">
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || isPending}
            className={cn(
              "inline-flex items-center gap-2 font-semibold px-6 py-2.5 rounded-lg transition text-sm",
              allAnswered
                ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {isPending ? "Se salvează..." : allAnswered ? "Verifică răspunsurile" : `Răspunde la toate întrebările (${Object.keys(answers).length}/${normalizedQuestions.length})`}
          </button>
        </div>
      )}
    </div>
  );
}
