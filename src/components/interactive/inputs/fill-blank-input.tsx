"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  parseFillBlankPrompt,
  validateFillBlankMarkers,
} from "@/lib/fill-blank-parser";
import type { FillBlankContent, InlineUserAnswer } from "@/types";

interface FillBlankInputProps {
  content: FillBlankContent;
  disabled: boolean;
  /** Read-only green solution view shows ONLY when locked (correct). A revealed-
   *  but-wrong question stays editable so the user can still fix it and resubmit. */
  locked: boolean;
  onChange: (answer: InlineUserAnswer) => void;
}

export function FillBlankInput({
  content,
  disabled,
  locked,
  onChange,
}: FillBlankInputProps) {
  const blankCount = content.blanks.length;
  const validation = useMemo(
    () => validateFillBlankMarkers(content.prompt, blankCount),
    [content.prompt, blankCount]
  );
  const segments = useMemo(
    () => parseFillBlankPrompt(content.prompt),
    [content.prompt]
  );

  const [values, setValues] = useState<string[]>(() =>
    Array(blankCount).fill("")
  );

  // Seed the draft on mount so an (even empty) submit is allowed — an empty/wrong
  // attempt still satisfies Variant-A gating. values[] is always length === blankCount.
  useEffect(() => {
    onChange({ type: "fill_blank", values: Array(blankCount).fill("") });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!validation.ok) {
    return (
      <div className="my-2 flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
        <span>Eroare de autorare (fill_blank): {validation.error}</span>
      </div>
    );
  }

  function update(blankIndex: number, value: string) {
    const next = values.slice();
    next[blankIndex] = value;
    setValues(next);
    onChange({ type: "fill_blank", values: next });
  }

  return (
    <p className="text-sm leading-[2.2] text-foreground">
      {segments.map((seg, i) => {
        if (seg.kind === "text") {
          return seg.text ? <span key={i}>{seg.text}</span> : null;
        }
        const accepted = content.blanks[seg.index]?.accepted ?? [];
        const display = locked ? accepted[0] ?? "" : values[seg.index] ?? "";
        return (
          <input
            key={i}
            type="text"
            aria-label={`Spațiu liber ${seg.index + 1}`}
            value={display}
            disabled={disabled || locked}
            onChange={(e) => update(seg.index, e.target.value)}
            className={
              "mx-1 inline-block w-32 rounded-md border px-2 py-1 text-sm focus:outline-none focus:ring-1 disabled:cursor-not-allowed " +
              (locked
                ? "border-green-400 bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-300 dark:border-green-700"
                : "border-border bg-background text-foreground focus:border-[#6C5CE7] focus:ring-[#6C5CE7]")
            }
          />
        );
      })}
    </p>
  );
}
