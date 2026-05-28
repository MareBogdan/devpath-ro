"use client";

// Game 3 — Match Pairs
// Lesson 9: Training / Overfitting / Underfitting
// Click a term then click its matching definition.

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MinigameProps {
  onComplete: (score: number, isPerfect: boolean) => void;
}

interface Pair {
  id: number;
  term: string;
  definition: string;
}

const PAIRS: Pair[] = [
  { id: 1, term: "Overfitting",    definition: "Modelul memorează datele de antrenament" },
  { id: 2, term: "Underfitting",   definition: "Modelul este prea simplu pentru date" },
  { id: 3, term: "Training set",   definition: "Date folosite pentru antrenarea modelului" },
  { id: 4, term: "Validation set", definition: "Date pentru ajustarea hiperparametrilor" },
  { id: 5, term: "Test set",       definition: "Date rezervate evaluării finale" },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

type MatchState = Record<number, number>; // termId → defId

export function GameMatchPairs({ onComplete }: MinigameProps) {
  const [termIds] = useState(() => shuffle(PAIRS.map((p) => p.id)));
  const [defIds] = useState(() => shuffle(PAIRS.map((p) => p.id)));
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
  const [matches, setMatches] = useState<MatchState>({});      // termId → defId
  const [wrong, setWrong] = useState<{ termId: number; defId: number } | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const matchedTermIds = new Set(Object.keys(matches).map(Number));
  const matchedDefIds = new Set(Object.values(matches));
  const allMatched = matchedTermIds.size === PAIRS.length;

  function handleTermClick(termId: number) {
    if (submitted || matchedTermIds.has(termId)) return;
    setSelectedTerm(termId === selectedTerm ? null : termId);
  }

  function handleDefClick(defId: number) {
    if (submitted || matchedDefIds.has(defId) || selectedTerm === null) return;

    const correct = selectedTerm === defId; // term id === def id for correct match
    if (correct) {
      setMatches((prev) => ({ ...prev, [selectedTerm]: defId }));
      setSelectedTerm(null);
    } else {
      setWrong({ termId: selectedTerm, defId });
      setTimeout(() => {
        setWrong(null);
        setSelectedTerm(null);
      }, 600);
    }
  }

  function handleSubmit() {
    if (!allMatched || submitted) return;
    setSubmitted(true);
    // All matches are validated in real-time (only correct matches accepted), so score is 100
    setTimeout(() => onComplete(100, true), 800);
  }

  function getTermStyle(termId: number) {
    if (matchedTermIds.has(termId)) {
      return "border-green-500 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300";
    }
    if (wrong?.termId === termId) {
      return "border-red-400 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300 animate-shake";
    }
    if (selectedTerm === termId) {
      return "border-primary bg-primary/10 text-primary ring-2 ring-primary/30";
    }
    return "border-border bg-card hover:border-primary/40 hover:bg-accent/30";
  }

  function getDefStyle(defId: number) {
    if (matchedDefIds.has(defId)) {
      return "border-green-500 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300";
    }
    if (wrong?.defId === defId) {
      return "border-red-400 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300";
    }
    if (selectedTerm !== null) {
      return "border-border bg-card hover:border-primary/40 hover:bg-accent/30 cursor-pointer";
    }
    return "border-border bg-card opacity-60";
  }

  const termMap = Object.fromEntries(PAIRS.map((p) => [p.id, p.term]));
  const defMap = Object.fromEntries(PAIRS.map((p) => [p.id, p.definition]));

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h3 className="font-bold text-lg">Potrivește perechile</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Selectează un termen, apoi fă click pe definiția corectă.
        </p>
      </div>

      {selectedTerm !== null && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm text-primary font-medium"
        >
          Selectat: <span className="font-bold">{termMap[selectedTerm]}</span> — alege definiția
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {/* Terms column */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground text-center">Termeni</p>
          {termIds.map((termId) => (
            <motion.button
              key={termId}
              layout
              whileTap={!matchedTermIds.has(termId) ? { scale: 0.97 } : {}}
              onClick={() => handleTermClick(termId)}
              disabled={matchedTermIds.has(termId) || submitted}
              className={cn(
                "w-full rounded-lg border px-3 py-2.5 text-sm font-medium text-left transition",
                getTermStyle(termId),
                matchedTermIds.has(termId) ? "cursor-default" : "cursor-pointer"
              )}
            >
              <span className="flex items-center gap-2">
                {matchedTermIds.has(termId) && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
                {termMap[termId]}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Definitions column */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground text-center">Definiții</p>
          {defIds.map((defId) => (
            <motion.button
              key={defId}
              layout
              whileTap={!matchedDefIds.has(defId) && selectedTerm !== null ? { scale: 0.97 } : {}}
              onClick={() => handleDefClick(defId)}
              disabled={matchedDefIds.has(defId) || submitted || selectedTerm === null}
              className={cn(
                "w-full rounded-lg border px-3 py-2.5 text-sm text-left transition",
                getDefStyle(defId)
              )}
            >
              <span className="flex items-center gap-2">
                {matchedDefIds.has(defId) && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600" />}
                {wrong?.defId === defId && <XCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />}
                {defMap[defId]}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={!allMatched || submitted}
          className={cn(
            "px-8 py-2.5 rounded-lg text-sm font-semibold transition",
            allMatched && !submitted
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {submitted
            ? "Verificat!"
            : allMatched
            ? "Finalizează"
            : `Mai ai ${PAIRS.length - matchedTermIds.size} perechi de potrivit`}
        </button>
      </div>
    </div>
  );
}
