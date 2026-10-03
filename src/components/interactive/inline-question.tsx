"use client";

// <InlineQuestion n="1" /> — MDX-embedded interactive question. Resolves the
// question whose order_index === n from context, owns ALL shared behavior
// (server-side submit, pending, lock-on-correct, reveal, Cosmo, shake), and
// delegates only the draft-input UI to a per-type child. Copies lesson-gate.tsx's
// VISUAL language; the logic is fresh (server is the source of truth — no
// client-side correctness check, no XP).
//
// AUTHORING: write the STRING form `n="1"`, NOT the expression form `n={1}`.
// next-mdx-remote v6's serialize() DROPS JSX expression-valued attributes at
// compile time (`<X n={1} />` compiles to `_jsx(X, {})` — the `n` prop never
// reaches the component), so only string attributes survive that pipeline.
// resolveOrder() below still accepts a real number too, so the component stays
// correct under any pipeline that actually delivers the prop.

import { useCallback, useState, useTransition } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  Clock,
} from "lucide-react";
import { CosmoMascot } from "@/components/mascot/cosmo-mascot";
import { saveInlineAttempt } from "@/app/(dashboard)/courses/inline-actions";
import { useInteractiveLesson } from "@/components/interactive/interactive-lesson-context";
import { SingleChoiceInput } from "@/components/interactive/inputs/single-choice-input";
import { TrueFalseInput } from "@/components/interactive/inputs/true-false-input";
import { ShortAnswerInput } from "@/components/interactive/inputs/short-answer-input";
import { FillBlankInput } from "@/components/interactive/inputs/fill-blank-input";
import { OrderingInput } from "@/components/interactive/inputs/ordering-input";
import { MatchPairsInput } from "@/components/interactive/inputs/match-pairs-input";
import type { InlineQuestion as InlineQuestionRow, InlineUserAnswer } from "@/types";

// The 6 locally-verifiable types (essay_ai handled separately in the dispatcher).
type AnswerableQuestion = Exclude<InlineQuestionRow, { type: "essay_ai" }>;

// Coerce the `n` attribute to an order_index. Accepts a number (1) or a string
// ("1"); tolerant — extracts the first integer from whatever arrives. Returns
// null when nothing usable is present (e.g. the prop was dropped at compile time).
function resolveOrder(n: number | string): number | null {
  if (typeof n === "number") return Number.isFinite(n) ? n : null;
  const match = String(n).match(/-?\d+/);
  return match ? parseInt(match[0], 10) : null;
}

// Dev-only authoring hint, emitted once per key (this component re-renders often).
const warned = new Set<string>();
function warnOnce(key: string, message: string) {
  if (process.env.NODE_ENV !== "development" || warned.has(key)) return;
  warned.add(key);
  console.warn(message);
}

export function InlineQuestion({ n }: { n: number | string }) {
  const ctx = useInteractiveLesson();
  const order = resolveOrder(n);
  const q = order !== null ? ctx.getByOrder(order) : undefined;

  if (!q) {
    // No matching row (e.g. the interactive layer isn't seeded for this lesson
    // yet): render nothing rather than an error box in front of learners.
    warnOnce(`inline-${String(n)}`, `[InlineQuestion] no question with order_index=${String(n)} in this lesson — rendering nothing. Use the quoted form: <InlineQuestion n="1" />.`);
    return null;
  }
  if (q.type === "essay_ai") {
    return <ComingSoonBox />;
  }
  // key by id so state resets cleanly if a different question lands at this slot.
  return <InlineQuestionInner key={q.id} q={q} />;
}

function InlineQuestionInner({ q }: { q: AnswerableQuestion }) {
  const ctx = useInteractiveLesson();
  const seed = ctx.getAttempt(q.id);
  const reduced = useReducedMotion();
  const [isPending, startTransition] = useTransition();

  const [locked, setLocked] = useState(seed?.best_score === 100);
  const [revealed, setRevealed] = useState(seed?.revealed ?? false);
  const [draft, setDraft] = useState<InlineUserAnswer | null>(null);
  const [lastWrong, setLastWrong] = useState(false);
  const [shake, setShake] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDraft = useCallback((a: InlineUserAnswer) => setDraft(a), []);

  function handleSubmit() {
    if (locked || isPending || !draft) return;
    setErrorMsg(null);
    startTransition(async () => {
      const result = await saveInlineAttempt(q.id, draft);
      ctx.onAnswered(q.id, result);
      if (result.error) {
        setErrorMsg(result.error);
        return;
      }
      setRevealed(result.revealed);
      if (result.correct) {
        setLocked(true);
        setLastWrong(false);
      } else {
        setLastWrong(true);
        setShake(true);
        window.setTimeout(() => setShake(false), 600);
      }
    });
  }

  const inputProps = {
    disabled: locked || isPending,
    showSolution: locked || revealed,
    onChange: handleDraft,
  };

  function renderInput() {
    switch (q.type) {
      case "single_choice":
        return <SingleChoiceInput content={q.content} {...inputProps} />;
      case "true_false":
        return <TrueFalseInput content={q.content} {...inputProps} />;
      case "short_answer":
        return <ShortAnswerInput content={q.content} {...inputProps} />;
      case "fill_blank":
        return <FillBlankInput content={q.content} locked={locked} {...inputProps} />;
      case "ordering":
        return <OrderingInput content={q.content} seed={q.id} locked={locked} {...inputProps} />;
      case "match_pairs":
        return <MatchPairsInput content={q.content} seed={q.id} locked={locked} {...inputProps} />;
    }
  }

  return (
    <motion.div
      animate={shake && !reduced ? { x: [-6, 6, -5, 5, -3, 3, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className="my-7 rounded-xl border border-[#6C5CE7]/20 bg-[#6C5CE7]/[0.04] p-5"
    >
      <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#A78BFA]">
        <Sparkles className="h-3.5 w-3.5" /> Verifică-ți înțelegerea
      </div>

      {/* fill_blank renders its prompt inline (with the blanks); others show it here. */}
      {q.type !== "fill_blank" && (
        <p className="mb-3 text-sm font-medium text-foreground">{q.content.prompt}</p>
      )}

      {renderInput()}

      {!locked && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !draft}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#6C5CE7] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#5b4bd6] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Se verifică…
            </>
          ) : (
            "Verifică"
          )}
        </button>
      )}

      {errorMsg && <p className="mt-3 text-xs text-red-500">{errorMsg}</p>}

      {locked && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-green-700 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> Corect!
        </div>
      )}

      {lastWrong && !revealed && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <XCircle className="h-3.5 w-3.5 shrink-0 text-red-500" /> Mai încearcă —
          recitește și încearcă din nou.
        </p>
      )}

      {revealed && (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {q.content.explanation}
        </p>
      )}

      <AnimatePresence>
        {lastWrong && !locked && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="mt-4 flex items-start gap-3 rounded-xl border border-red-200/20 bg-red-50/10 p-3"
          >
            <CosmoMascot emotion="encouraging" size={44} />
            <p className="pt-1 text-sm text-muted-foreground">
              Nu-i bai! Mai încearcă o dată — ești pe drumul bun.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ComingSoonBox() {
  return (
    <div className="my-6 flex items-center gap-2 rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
      <Clock className="h-4 w-4 shrink-0" />
      Întrebare de tip eseu — evaluare AI în curând.
    </div>
  );
}
