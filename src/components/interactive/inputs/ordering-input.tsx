"use client";

import { useEffect, useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { seededShuffle } from "@/lib/seeded-shuffle";
import type { InlineUserAnswer, OrderingContent } from "@/types";

interface OrderingInputProps {
  content: OrderingContent;
  seed: string; // question id — keeps the shuffle hydration-stable
  disabled: boolean;
  /** Read-only green solution view shows ONLY when locked (correct). A revealed-
   *  but-wrong question stays draggable/reorderable so the user can still fix it. */
  locked: boolean;
  onChange: (answer: InlineUserAnswer) => void;
}

export function OrderingInput({
  content,
  seed,
  disabled,
  locked,
  onChange,
}: OrderingInputProps) {
  const [order, setOrder] = useState<string[]>(() =>
    seededShuffle(content.items, seed)
  );

  // Seed the draft on mount (the current order is always a valid submission).
  useEffect(() => {
    onChange({ type: "ordering", order: seededShuffle(content.items, seed) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function emit(next: string[]) {
    setOrder(next);
    onChange({ type: "ordering", order: next });
  }

  function move(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= order.length) return;
    const next = order.slice();
    const tmp = next[index];
    next[index] = next[j];
    next[j] = tmp;
    emit(next);
  }

  // Show the canonical correct order (read-only, green) ONLY once locked (correct);
  // a revealed-but-wrong question stays editable so the user can still fix it.
  const display = locked ? content.items : order;

  if (locked) {
    return (
      <ol className="space-y-2">
        {display.map((item, i) => (
          <li
            key={item}
            className="flex items-center gap-2 rounded-lg border border-green-400 bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950/30 dark:text-green-300 dark:border-green-700"
          >
            <span className="w-5 text-xs font-semibold opacity-70">{i + 1}.</span>
            <span className="flex-1">{item}</span>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <Reorder.Group
      axis="y"
      values={order}
      onReorder={emit}
      className="space-y-2"
    >
      {order.map((item, i) => (
        <OrderingItem
          key={item}
          item={item}
          index={i}
          total={order.length}
          disabled={disabled}
          onMove={move}
        />
      ))}
    </Reorder.Group>
  );
}

interface OrderingItemProps {
  item: string;
  index: number;
  total: number;
  disabled: boolean;
  onMove: (index: number, dir: -1 | 1) => void;
}

function OrderingItem({ item, index, total, disabled, onMove }: OrderingItemProps) {
  // Explicit drag handle (dragListener=false) so touch-drag doesn't fight page scroll.
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
    >
      <button
        type="button"
        aria-label={`Trage pentru a reordona „${item}”`}
        disabled={disabled}
        onPointerDown={(e) => {
          if (!disabled) controls.start(e);
        }}
        className="touch-none cursor-grab text-muted-foreground disabled:cursor-not-allowed"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <span className="flex-1">{item}</span>

      {/* Keyboard/mobile-reliable reorder controls (Reorder has no keyboard support). */}
      <span className="flex flex-col">
        <button
          type="button"
          aria-label={`Mută „${item}” mai sus`}
          disabled={disabled || index === 0}
          onClick={() => onMove(index, -1)}
          className="text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label={`Mută „${item}” mai jos`}
          disabled={disabled || index === total - 1}
          onClick={() => onMove(index, 1)}
          className="text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </span>
    </Reorder.Item>
  );
}
