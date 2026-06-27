"use client";

import { useState } from "react";
import type { InlineUserAnswer, ShortAnswerContent } from "@/types";

interface ShortAnswerInputProps {
  content: ShortAnswerContent;
  disabled: boolean;
  showSolution: boolean;
  onChange: (answer: InlineUserAnswer) => void;
}

export function ShortAnswerInput({
  content,
  disabled,
  showSolution,
  onChange,
}: ShortAnswerInputProps) {
  const [text, setText] = useState("");

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={text}
        disabled={disabled}
        // Send RAW text — the server normalizes diacritics/case/whitespace.
        onChange={(e) => {
          setText(e.target.value);
          onChange({ type: "short_answer", text: e.target.value });
        }}
        placeholder="Scrie răspunsul…"
        className="w-full text-sm px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-[#6C5CE7] focus:outline-none focus:ring-1 focus:ring-[#6C5CE7] disabled:cursor-not-allowed disabled:opacity-90"
      />
      {showSolution && (
        <p className="text-xs text-green-700 dark:text-green-400">
          Răspuns acceptat: {content.accepted.join(" / ")}
        </p>
      )}
    </div>
  );
}
