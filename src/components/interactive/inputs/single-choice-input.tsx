"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import type { InlineUserAnswer, SingleChoiceContent } from "@/types";

interface SingleChoiceInputProps {
  content: SingleChoiceContent;
  disabled: boolean;
  showSolution: boolean;
  onChange: (answer: InlineUserAnswer) => void;
}

export function SingleChoiceInput({
  content,
  disabled,
  showSolution,
  onChange,
}: SingleChoiceInputProps) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="space-y-2" role="radiogroup">
      {content.options.map((option, idx) => {
        const isSelected = selected === idx;
        const isCorrect = idx === content.correct_index;

        let cls =
          "w-full text-left text-sm px-4 py-2.5 rounded-lg border transition flex items-center gap-2 ";
        if (showSolution && isCorrect) {
          cls +=
            "border-green-400 bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-300 dark:border-green-700";
        } else if (showSolution && isSelected && !isCorrect) {
          cls +=
            "border-red-400 bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300 dark:border-red-700";
        } else if (isSelected) {
          cls += "border-[#6C5CE7] bg-[#6C5CE7]/10 text-foreground";
        } else {
          cls += "border-border bg-background hover:bg-muted/50 text-foreground";
        }
        cls += disabled ? " cursor-not-allowed" : " cursor-pointer";

        return (
          <button
            key={idx}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => {
              setSelected(idx);
              onChange({ type: "single_choice", selected_index: idx });
            }}
            className={cls}
          >
            {showSolution && isCorrect && (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            )}
            {showSolution && isSelected && !isCorrect && (
              <XCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{option}</span>
          </button>
        );
      })}
    </div>
  );
}
