"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import type { InlineUserAnswer, TrueFalseContent } from "@/types";

interface TrueFalseInputProps {
  content: TrueFalseContent;
  disabled: boolean;
  showSolution: boolean;
  onChange: (answer: InlineUserAnswer) => void;
}

const OPTIONS: { label: string; value: boolean }[] = [
  { label: "Adevărat", value: true },
  { label: "Fals", value: false },
];

export function TrueFalseInput({
  content,
  disabled,
  showSolution,
  onChange,
}: TrueFalseInputProps) {
  const [selected, setSelected] = useState<boolean | null>(null);

  return (
    <div className="flex gap-2" role="radiogroup">
      {OPTIONS.map(({ label, value }) => {
        const isSelected = selected === value;
        const isCorrect = value === content.correct;

        let cls =
          "flex-1 text-sm px-4 py-2.5 rounded-lg border transition flex items-center justify-center gap-2 ";
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
            key={label}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => {
              setSelected(value);
              onChange({ type: "true_false", value });
            }}
            className={cls}
          >
            {showSolution && isCorrect && (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            )}
            {showSolution && isSelected && !isCorrect && (
              <XCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
