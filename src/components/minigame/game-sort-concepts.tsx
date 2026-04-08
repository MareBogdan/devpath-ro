"use client";

// Game 1 — Sort Concepts
// Lesson 3: Narrow AI vs General AI
// Click a card to assign it to one of two categories.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MinigameProps {
  onComplete: (score: number, isPerfect: boolean) => void;
}

type Category = "narrow" | "general";

interface ConceptCard {
  id: number;
  label: string;
  correct: Category;
}

const CARDS: ConceptCard[] = [
  { id: 1, label: "ChatGPT",                    correct: "narrow"  },
  { id: 2, label: "AlphaGo",                    correct: "narrow"  },
  { id: 3, label: "Filtru de spam",              correct: "narrow"  },
  { id: 4, label: "Recunoaștere facială",        correct: "narrow"  },
  { id: 5, label: "Adaptare la orice sarcină",   correct: "general" },
  { id: 6, label: "Transfer de cunoștințe",      correct: "general" },
  { id: 7, label: "Raționament abstract",        correct: "general" },
  { id: 8, label: "Conștiință de sine",          correct: "general" },
];

export function GameSortConcepts({ onComplete }: MinigameProps) {
  const [assignments, setAssignments] = useState<Record<number, Category>>({});
  const [submitted, setSubmitted] = useState(false);

  const allAssigned = Object.keys(assignments).length === CARDS.length;

  function assign(cardId: number, category: Category) {
    if (submitted) return;
    setAssignments((prev) => ({ ...prev, [cardId]: category }));
  }

  function handleSubmit() {
    if (!allAssigned || submitted) return;
    setSubmitted(true);
    const correct = CARDS.filter((c) => assignments[c.id] === c.correct).length;
    const score = Math.round((correct / CARDS.length) * 100);
    setTimeout(() => onComplete(score, score === 100), 1200);
  }

  const unassigned = CARDS.filter((c) => !(c.id in assignments));
  const narrowCards = CARDS.filter((c) => assignments[c.id] === "narrow");
  const generalCards = CARDS.filter((c) => assignments[c.id] === "general");

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h3 className="font-bold text-lg">Sortează conceptele</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Fă click pe un card, apoi alege categoria corectă.
        </p>
      </div>

      {/* Unassigned cards */}
      {unassigned.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center min-h-[40px]">
          {unassigned.map((card) => (
            <CardChip
              key={card.id}
              card={card}
              onAssign={assign}
              assigned={null}
              submitted={submitted}
            />
          ))}
        </div>
      )}

      {/* Drop zones */}
      <div className="grid grid-cols-2 gap-3">
        <DropZone
          label="Narrow AI"
          subtitle="Sisteme specializate (există azi)"
          category="narrow"
          cards={narrowCards}
          onAssign={assign}
          onRemove={(id) => setAssignments((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
          })}
          submitted={submitted}
        />
        <DropZone
          label="General AI"
          subtitle="Sisteme universale (teoretic)"
          category="general"
          cards={generalCards}
          onAssign={assign}
          onRemove={(id) => setAssignments((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
          })}
          submitted={submitted}
        />
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={!allAssigned || submitted}
          className={cn(
            "px-8 py-2.5 rounded-lg text-sm font-semibold transition",
            allAssigned && !submitted
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {submitted
            ? "Verificat!"
            : allAssigned
            ? "Verifică"
            : `Mai ai ${CARDS.length - Object.keys(assignments).length} carduri de sortat`}
        </button>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

interface CardChipProps {
  card: ConceptCard;
  onAssign: (id: number, cat: Category) => void;
  assigned: Category | null;
  submitted: boolean;
}

function CardChip({ card, onAssign, assigned, submitted }: CardChipProps) {
  const [picking, setPicking] = useState(false);

  if (submitted && assigned !== null) {
    const isCorrect = assigned === card.correct;
    return (
      <div className={cn(
        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium border",
        isCorrect
          ? "bg-green-50 border-green-400 text-green-700 dark:bg-green-950/30 dark:text-green-300"
          : "bg-red-50 border-red-400 text-red-700 dark:bg-red-950/30 dark:text-red-300"
      )}>
        {isCorrect ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span>✗</span>}
        {card.label}
      </div>
    );
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setPicking((p) => !p)}
        className={cn(
          "rounded-lg px-3 py-1.5 text-sm font-medium border transition",
          picking
            ? "bg-primary/10 border-primary text-primary"
            : "bg-card border-border hover:border-primary/40 hover:bg-accent/30"
        )}
      >
        {card.label}
      </motion.button>

      <AnimatePresence>
        {picking && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute z-10 top-full mt-1 left-0 flex gap-1.5 bg-popover border border-border rounded-lg p-1.5 shadow-lg"
          >
            <button
              onClick={() => { onAssign(card.id, "narrow"); setPicking(false); }}
              className="rounded px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300"
            >
              Narrow AI
            </button>
            <button
              onClick={() => { onAssign(card.id, "general"); setPicking(false); }}
              className="rounded px-2 py-1 text-xs font-medium bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 dark:bg-violet-950/40 dark:text-violet-300"
            >
              General AI
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface DropZoneProps {
  label: string;
  subtitle: string;
  category: Category;
  cards: ConceptCard[];
  onAssign: (id: number, cat: Category) => void;
  onRemove: (id: number) => void;
  submitted: boolean;
}

function DropZone({ label, subtitle, category, cards, onRemove, submitted }: DropZoneProps) {
  const color = category === "narrow" ? "blue" : "violet";
  return (
    <div className={cn(
      "rounded-xl border-2 border-dashed p-3 min-h-[120px] space-y-2",
      color === "blue"
        ? "border-blue-300 bg-blue-50/40 dark:border-blue-800 dark:bg-blue-950/20"
        : "border-violet-300 bg-violet-50/40 dark:border-violet-800 dark:bg-violet-950/20"
    )}>
      <div>
        <p className={cn(
          "text-xs font-bold uppercase tracking-wide",
          color === "blue" ? "text-blue-600 dark:text-blue-400" : "text-violet-600 dark:text-violet-400"
        )}>
          {label}
        </p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {cards.map((card) => (
          <motion.button
            key={card.id}
            layout
            onClick={() => !submitted && onRemove(card.id)}
            whileHover={!submitted ? { scale: 1.04 } : {}}
            className={cn(
              "rounded-md px-2 py-1 text-xs font-medium border transition",
              submitted
                ? assignments_correct(card, category)
                  ? "bg-green-50 border-green-400 text-green-700 dark:bg-green-950/30 dark:text-green-300"
                  : "bg-red-50 border-red-400 text-red-700 dark:bg-red-950/30 dark:text-red-300"
                : color === "blue"
                ? "bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 hover:opacity-70"
                : "bg-violet-100 border-violet-300 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 hover:opacity-70"
            )}
          >
            {card.label}
            {submitted && (assignments_correct(card, category) ? " ✓" : " ✗")}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function assignments_correct(card: ConceptCard, assignedCategory: Category) {
  return card.correct === assignedCategory;
}
