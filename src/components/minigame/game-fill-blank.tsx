"use client";

// Game 2 — Fill in the Blank
// Lesson 6: Supervised vs Unsupervised Learning
// Click a word chip from the bank to fill blanks in order.

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MinigameProps {
  onComplete: (score: number, isPerfect: boolean) => void;
}

interface Sentence {
  id: number;
  parts: string[];   // even indices = text, odd indices = blank placeholders
  answer: string;    // correct word for the blank
}

const SENTENCES: Sentence[] = [
  {
    id: 1,
    parts: ["Învățarea ", "_blank_", " folosește date cu etichete."],
    answer: "supravegheată",
  },
  {
    id: 2,
    parts: ["Clusterizarea este un exemplu de învățare ", "_blank_", "."],
    answer: "nesupravegheată",
  },
  {
    id: 3,
    parts: ["Regresia liniară prezice valori ", "_blank_", "."],
    answer: "continue",
  },
  {
    id: 4,
    parts: ["Clasificarea asignează date la categorii ", "_blank_", "."],
    answer: "predefinite",
  },
];

// All correct answers + distractors, shuffled
const WORD_BANK = [
  "supravegheată",
  "nesupravegheată",
  "continue",
  "predefinite",
  "aleatoare",    // distractor
  "discrete",     // distractor
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function GameFillBlank({ onComplete }: MinigameProps) {
  const [words] = useState(() => shuffle(WORD_BANK));
  const [filled, setFilled] = useState<Record<number, string>>({});  // sentenceId → word
  const [used, setUsed] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const allFilled = Object.keys(filled).length === SENTENCES.length;

  function fillBlank(sentenceId: number, word: string) {
    if (submitted) return;
    // If blank already filled, return the old word to bank
    setFilled((prev) => {
      const oldWord = prev[sentenceId];
      const next = { ...prev, [sentenceId]: word };
      setUsed((u) => {
        const s = new Set(u);
        if (oldWord) s.delete(oldWord);
        s.add(word);
        return s;
      });
      return next;
    });
  }

  function clearBlank(sentenceId: number) {
    if (submitted) return;
    const word = filled[sentenceId];
    if (!word) return;
    setFilled((prev) => {
      const next = { ...prev };
      delete next[sentenceId];
      return next;
    });
    setUsed((u) => { const s = new Set(u); s.delete(word); return s; });
  }

  function handleSubmit() {
    if (!allFilled || submitted) return;
    setSubmitted(true);
    const correct = SENTENCES.filter((s) => filled[s.id] === s.answer).length;
    const score = Math.round((correct / SENTENCES.length) * 100);
    setTimeout(() => onComplete(score, score === 100), 1200);
  }

  const [pendingWord, setPendingWord] = useState<string | null>(null);

  function handleWordClick(word: string) {
    if (submitted || used.has(word)) return;
    setPendingWord(word === pendingWord ? null : word);
  }

  function handleBlankClick(sentenceId: number) {
    if (submitted) return;
    if (pendingWord) {
      fillBlank(sentenceId, pendingWord);
      setPendingWord(null);
    } else if (filled[sentenceId]) {
      clearBlank(sentenceId);
    }
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h3 className="font-bold text-lg">Completează spațiile</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Selectează un cuvânt, apoi fă click pe spațiul gol pentru a-l plasa.
        </p>
      </div>

      {/* Word bank */}
      <div className="flex flex-wrap gap-2 justify-center p-3 rounded-xl bg-muted/40 border border-border">
        {words.map((word) => {
          const isUsed = used.has(word);
          const isSelected = pendingWord === word;
          return (
            <motion.button
              key={word}
              whileHover={!isUsed ? { scale: 1.05 } : {}}
              whileTap={!isUsed ? { scale: 0.95 } : {}}
              onClick={() => handleWordClick(word)}
              disabled={isUsed || submitted}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium border transition",
                isUsed
                  ? "opacity-30 cursor-default bg-muted border-border text-muted-foreground"
                  : isSelected
                  ? "bg-primary/10 border-primary text-primary ring-2 ring-primary/30"
                  : "bg-card border-border hover:border-primary/40 hover:bg-accent/30 cursor-pointer"
              )}
            >
              {word}
            </motion.button>
          );
        })}
      </div>

      {/* Sentences */}
      <div className="space-y-4">
        {SENTENCES.map((sentence) => {
          const filledWord = filled[sentence.id];
          const isCorrect = submitted && filledWord === sentence.answer;
          const isWrong = submitted && filledWord !== sentence.answer;

          return (
            <div key={sentence.id} className="flex flex-wrap items-baseline gap-x-1 gap-y-1 text-base leading-relaxed">
              {sentence.parts.map((part, i) => {
                if (part === "_blank_") {
                  return (
                    <motion.button
                      key={i}
                      onClick={() => handleBlankClick(sentence.id)}
                      whileTap={!submitted ? { scale: 0.97 } : {}}
                      className={cn(
                        "inline-flex items-center min-w-[120px] justify-center rounded-md border-b-2 px-2 py-0.5 text-sm font-semibold transition",
                        filledWord
                          ? isCorrect
                            ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300"
                            : isWrong
                            ? "border-red-400 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"
                            : "border-primary bg-primary/5 text-primary"
                          : pendingWord
                          ? "border-primary border-dashed bg-primary/5 text-primary/50 cursor-pointer animate-pulse"
                          : "border-border border-dashed text-muted-foreground cursor-pointer hover:border-primary/50"
                      )}
                    >
                      {filledWord ?? "___"}
                      {isWrong && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          (→ {sentence.answer})
                        </span>
                      )}
                    </motion.button>
                  );
                }
                return <span key={i}>{part}</span>;
              })}
            </div>
          );
        })}
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={!allFilled || submitted}
          className={cn(
            "px-8 py-2.5 rounded-lg text-sm font-semibold transition",
            allFilled && !submitted
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {submitted
            ? "Verificat!"
            : allFilled
            ? "Verifică"
            : `Mai ai ${SENTENCES.length - Object.keys(filled).length} spații de completat`}
        </button>
      </div>
    </div>
  );
}
