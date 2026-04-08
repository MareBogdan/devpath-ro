"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

interface FlashcardDeckProps {
  cards: { front: string; back: string }[];
}

export function FlashcardDeck({ cards }: FlashcardDeckProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (cards.length === 0) return null;

  const card = cards[index];

  return (
    <div className="my-8">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-muted-foreground">
          🃏 Termeni cheie — {index + 1}/{cards.length}
        </h4>
        <span className="text-xs text-muted-foreground">Click pe card pentru definiție</span>
      </div>

      {/* Card */}
      <motion.div
        className="relative h-32 cursor-pointer"
        onClick={() => setFlipped((f) => !f)}
        style={{ perspective: 1000 }}
      >
        <motion.div
          className="w-full h-full relative"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 flex items-center justify-center rounded-xl border border-border bg-card px-6 text-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span className="text-lg font-semibold text-foreground">{card.front}</span>
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 flex items-center justify-center rounded-xl border border-primary/30 bg-primary/5 px-6 text-center"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <span className="text-sm text-foreground/90">{card.back}</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-3 mt-3">
        <button
          onClick={() => {
            setIndex((i) => Math.max(0, i - 1));
            setFlipped(false);
          }}
          disabled={index === 0}
          className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30 transition"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => setFlipped(false)}
          className="p-1.5 rounded-md hover:bg-muted transition"
          title="Întoarce cardul"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => {
            setIndex((i) => Math.min(cards.length - 1, i + 1));
            setFlipped(false);
          }}
          disabled={index === cards.length - 1}
          className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30 transition"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
