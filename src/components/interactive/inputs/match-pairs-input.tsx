"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { seededShuffle } from "@/lib/seeded-shuffle";
import type { InlineUserAnswer, MatchPairsContent } from "@/types";

interface MatchPairsInputProps {
  content: MatchPairsContent;
  seed: string; // question id — keeps the right-column shuffle hydration-stable
  disabled: boolean;
  /** Read-only green solution view shows ONLY when locked (correct). A revealed-
   *  but-wrong question stays interactive so the user can still re-pair and fix it. */
  locked: boolean;
  onChange: (answer: InlineUserAnswer) => void;
}

export function MatchPairsInput({
  content,
  seed,
  disabled,
  locked,
  onChange,
}: MatchPairsInputProps) {
  const lefts = useMemo(() => content.pairs.map((p) => p.left), [content.pairs]);
  const rights = useMemo(
    () => seededShuffle(content.pairs.map((p) => p.right), seed),
    [content.pairs, seed]
  );

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [assign, setAssign] = useState<Record<string, string>>({});
  const [announce, setAnnounce] = useState("");

  // Seed the draft on mount (an empty/partial mapping is a valid wrong attempt).
  useEffect(() => {
    onChange({ type: "match_pairs", mapping: lefts.map((l) => ({ left: l, right: "" })) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function emit(next: Record<string, string>) {
    // Send RAW strings — full length (one entry per left, "" if unassigned).
    onChange({
      type: "match_pairs",
      mapping: lefts.map((l) => ({ left: l, right: next[l] ?? "" })),
    });
  }

  function pickLeft(left: string) {
    if (disabled) return;
    setSelectedLeft(left);
    setAnnounce(`Ai selectat „${left}”. Alege perechea din coloana dreaptă.`);
  }

  function pickRight(right: string) {
    if (disabled || selectedLeft === null) return;
    const next: Record<string, string> = {};
    // Drop this right from any other left (each right used once), then assign.
    for (const l of lefts) {
      if (assign[l] && assign[l] !== right) next[l] = assign[l];
    }
    next[selectedLeft] = right;
    setAssign(next);
    setAnnounce(`Ai legat „${selectedLeft}” cu „${right}”.`);
    setSelectedLeft(null);
    emit(next);
  }

  function clearLeft(left: string) {
    if (disabled) return;
    const next = { ...assign };
    delete next[left];
    setAssign(next);
    setAnnounce(`Ai șters perechea pentru „${left}”.`);
    emit(next);
  }

  // Show the correct pairing (read-only, green) ONLY once locked (correct);
  // a revealed-but-wrong question stays interactive so the user can still fix it.
  if (locked) {
    return (
      <ul className="space-y-2">
        {content.pairs.map((p) => (
          <li
            key={p.left}
            className="flex items-center gap-2 rounded-lg border border-green-400 bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950/30 dark:text-green-300 dark:border-green-700"
          >
            <span className="font-medium">{p.left}</span>
            <span className="opacity-60">→</span>
            <span>{p.right}</span>
          </li>
        ))}
      </ul>
    );
  }

  const usedRights = new Set(Object.values(assign));

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {/* Left column — anchors (given order) */}
        <div className="space-y-2">
          {lefts.map((left) => {
            const isSelected = selectedLeft === left;
            const paired = assign[left];
            return (
              <div key={left} className="space-y-1">
                <button
                  type="button"
                  aria-pressed={isSelected}
                  disabled={disabled}
                  onClick={() => pickLeft(left)}
                  className={
                    "w-full text-left text-sm px-3 py-2.5 rounded-lg border transition disabled:cursor-not-allowed " +
                    (isSelected
                      ? "border-[#6C5CE7] bg-[#6C5CE7]/10 text-foreground"
                      : paired
                      ? "border-[#00CEC9]/50 bg-[#00CEC9]/10 text-foreground"
                      : "border-border bg-background hover:bg-muted/50 text-foreground")
                  }
                >
                  {left}
                </button>
                {paired && (
                  <div className="flex items-center gap-1 pl-2 text-xs text-muted-foreground">
                    <span className="opacity-60">→</span>
                    <span className="truncate">{paired}</span>
                    <button
                      type="button"
                      aria-label={`Șterge perechea pentru „${left}”`}
                      disabled={disabled}
                      onClick={() => clearLeft(left)}
                      className="ml-1 text-muted-foreground hover:text-red-500 disabled:cursor-not-allowed"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right column — shuffled targets */}
        <div className="space-y-2">
          {rights.map((right) => {
            const used = usedRights.has(right);
            return (
              <button
                key={right}
                type="button"
                disabled={disabled || selectedLeft === null}
                onClick={() => pickRight(right)}
                className={
                  "w-full text-left text-sm px-3 py-2.5 rounded-lg border transition disabled:cursor-not-allowed " +
                  (used
                    ? "border-[#00CEC9]/40 bg-[#00CEC9]/5 text-muted-foreground"
                    : selectedLeft !== null
                    ? "border-[#6C5CE7]/40 bg-background hover:bg-[#6C5CE7]/10 text-foreground"
                    : "border-border bg-background text-foreground")
                }
              >
                {right}
              </button>
            );
          })}
        </div>
      </div>

      {/* Screen-reader live announcements for the click-to-pair flow. */}
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </div>
  );
}
