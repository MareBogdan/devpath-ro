"use client";

// Game 5 — Build the Network
// Lesson 15: Language Models
// Drag-reorder layers to form the correct neural network pipeline.
// Uses framer-motion Reorder.

import { useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { GripVertical, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MinigameProps {
  onComplete: (score: number, isPerfect: boolean) => void;
}

interface Layer {
  id: string;
  label: string;
  icon: string;
  description: string;
}

// Correct order (top to bottom in a forward pass)
const CORRECT_ORDER = [
  "input",
  "embedding",
  "hidden",
  "attention",
  "output",
];

const LAYERS: Layer[] = [
  {
    id: "input",
    label: "Input Layer",
    icon: "📥",
    description: "Primește datele brute (tokeni)",
  },
  {
    id: "embedding",
    label: "Embedding Layer",
    icon: "🔢",
    description: "Convertește tokeni în vectori numerici",
  },
  {
    id: "hidden",
    label: "Hidden Layers",
    icon: "🧠",
    description: "Procesează și transformă reprezentările",
  },
  {
    id: "attention",
    label: "Attention Layer",
    icon: "👁️",
    description: "Calculează relevanța între tokeni",
  },
  {
    id: "output",
    label: "Output Layer",
    icon: "📤",
    description: "Produce probabilitățile pentru următorul token",
  },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function GameBuildNetwork({ onComplete }: MinigameProps) {
  const [items, setItems] = useState(() => shuffle(LAYERS.map((l) => l.id)));
  const [submitted, setSubmitted] = useState(false);

  const layerMap = Object.fromEntries(LAYERS.map((l) => [l.id, l]));

  function handleSubmit() {
    if (submitted) return;
    setSubmitted(true);
    const correctPositions = items.filter((id, i) => id === CORRECT_ORDER[i]).length;
    const score = Math.round((correctPositions / CORRECT_ORDER.length) * 100);
    setTimeout(() => onComplete(score, score === 100), 1200);
  }

  const isOrderCorrect = items.every((id, i) => id === CORRECT_ORDER[i]);

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h3 className="font-bold text-lg">Construiește rețeaua</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Ordonează straturile unui Language Model de sus în jos (de la input la output).
          Trage și plasează pentru a reordona.
        </p>
      </div>

      <Reorder.Group
        axis="y"
        values={items}
        onReorder={setItems}
        className="space-y-2"
        as="ul"
      >
        {items.map((id, index) => {
          const layer = layerMap[id];
          const isCorrect = submitted && id === CORRECT_ORDER[index];
          const isWrong = submitted && id !== CORRECT_ORDER[index];
          return (
            <NetworkLayerItem
              key={id}
              layerId={id}
              layer={layer}
              isCorrect={isCorrect}
              isWrong={isWrong}
              submitted={submitted}
            />
          );
        })}
      </Reorder.Group>

      {submitted && (
        <div className={cn(
          "rounded-lg p-3 text-center text-sm font-medium border",
          isOrderCorrect
            ? "bg-green-50 border-green-400 text-green-700 dark:bg-green-950/30 dark:text-green-300"
            : "bg-orange-50 border-orange-400 text-orange-700 dark:bg-orange-950/30 dark:text-orange-300"
        )}>
          {isOrderCorrect
            ? "Ordinea corectă! 🎉"
            : `Ordinea corectă: ${CORRECT_ORDER.map((id) => layerMap[id].label).join(" → ")}`}
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={submitted}
          className={cn(
            "px-8 py-2.5 rounded-lg text-sm font-semibold transition",
            !submitted
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {submitted ? "Verificat!" : "Verifică ordinea"}
        </button>
      </div>
    </div>
  );
}

// ── Draggable item ────────────────────────────────────────────────────────────

interface NetworkLayerItemProps {
  layerId: string;
  layer: Layer;
  isCorrect: boolean;
  isWrong: boolean;
  submitted: boolean;
}

function NetworkLayerItem({ layerId, layer, isCorrect, isWrong, submitted }: NetworkLayerItemProps) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={layerId}
      dragListener={false}
      dragControls={controls}
      as="li"
      className={cn(
        "flex items-center gap-3 rounded-xl border-2 p-3 transition select-none",
        isCorrect
          ? "border-green-500 bg-green-50 dark:bg-green-950/30"
          : isWrong
          ? "border-red-400 bg-red-50 dark:bg-red-950/30"
          : "border-border bg-card"
      )}
    >
      {/* Drag handle */}
      {!submitted && (
        <button
          onPointerDown={(e) => controls.start(e)}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none p-0.5"
          aria-label="Trage pentru reordonare"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}

      {/* Icon */}
      <span className="text-2xl shrink-0">{layer.icon}</span>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-semibold text-sm",
          isCorrect ? "text-green-700 dark:text-green-300" : isWrong ? "text-red-700 dark:text-red-300" : "text-foreground"
        )}>
          {layer.label}
        </p>
        <p className="text-xs text-muted-foreground truncate">{layer.description}</p>
      </div>

      {/* Status icon */}
      {submitted && (
        isCorrect
          ? <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          : <XCircle className="h-5 w-5 text-red-500 shrink-0" />
      )}
    </Reorder.Item>
  );
}
