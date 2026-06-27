"use client";

// First-ever React Context in the lesson tree. It feeds per-user inline-question
// data (loaded server-side via getLessonInteractiveState) into MDX-embedded
// <InlineQuestion> components, and aggregates the Variant-A gating signal +
// live lesson score. It must be an ancestor of <MDXRemote> so the questions can
// read it. Each <InlineQuestion> calls the server action itself and reports the
// result back up via onAnswered — aggregation (gating + live score) lives here.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  InlineAttempt,
  InlineQuestion,
  LessonInteractiveState,
  LessonScoreResult,
  SaveAttemptResult,
} from "@/types";

interface InteractiveLessonContextValue {
  /** Resolve a question by its order_index (the `n` of <InlineQuestion n={n} />). */
  getByOrder: (n: number) => InlineQuestion | undefined;
  /** Current attempt state for a question (seeded from server, updated live). */
  getAttempt: (questionId: string) => InlineAttempt | undefined;
  /** Report a fresh server result up: merges attempt + updates live score. */
  onAnswered: (questionId: string, result: SaveAttemptResult) => void;
  /** Live lesson score (updates after each answer). */
  scoreResult: LessonScoreResult;
}

const InteractiveLessonContext =
  createContext<InteractiveLessonContextValue | null>(null);

/** Neutral empty state — used for lessons with no inline questions (never blocks). */
export function emptyInteractiveState(): LessonInteractiveState {
  return {
    questions: [],
    attempts: {},
    lesson_score: null,
    score_result: { correct_questions: 0, total_questions: 0, score: 20, color: "white" },
  };
}

interface InteractiveLessonProviderProps {
  interactiveState: LessonInteractiveState;
  /** Lifts the Variant-A gating signal (all non-essay questions attempted). */
  onGatingChange?: (allAnswered: boolean) => void;
  children: ReactNode;
}

export function InteractiveLessonProvider({
  interactiveState,
  onGatingChange,
  children,
}: InteractiveLessonProviderProps) {
  const [attempts, setAttempts] = useState<Record<string, InlineAttempt>>(
    interactiveState.attempts
  );
  const [scoreResult, setScoreResult] = useState<LessonScoreResult>(
    interactiveState.score_result
  );

  // order_index → question, for O(1) <InlineQuestion n={…}> lookup.
  const byOrder = useMemo(() => {
    const m = new Map<number, InlineQuestion>();
    for (const q of interactiveState.questions) m.set(q.order_index, q);
    return m;
  }, [interactiveState.questions]);

  const getByOrder = useCallback((n: number) => byOrder.get(n), [byOrder]);
  const getAttempt = useCallback((id: string) => attempts[id], [attempts]);

  const onAnswered = useCallback((questionId: string, result: SaveAttemptResult) => {
    if (result.error) return;
    setAttempts((prev) => {
      const existing = prev[questionId];
      const merged: InlineAttempt = {
        // id/user_id/updated_at are server-owned and unused client-side; keep
        // any prior values, synthesize harmless placeholders otherwise.
        id: existing?.id ?? questionId,
        user_id: existing?.user_id ?? "",
        question_id: questionId,
        best_score: result.best_score,
        attempts: result.attempts,
        revealed: result.revealed,
        updated_at: existing?.updated_at ?? "",
      };
      return { ...prev, [questionId]: merged };
    });
    setScoreResult(result.lesson_score);
  }, []);

  // Variant A: inline-complete when EVERY non-essay_ai question has attempts >= 1
  // (answered at all — correct or wrong). essay_ai is excluded from the
  // denominator so a reserved/un-answerable question can't brick completion.
  const allInlineAnswered = useMemo(() => {
    const answerable = interactiveState.questions.filter((q) => q.type !== "essay_ai");
    return answerable.every((q) => (attempts[q.id]?.attempts ?? 0) >= 1);
  }, [interactiveState.questions, attempts]);

  useEffect(() => {
    onGatingChange?.(allInlineAnswered);
  }, [allInlineAnswered, onGatingChange]);

  const value = useMemo<InteractiveLessonContextValue>(
    () => ({ getByOrder, getAttempt, onAnswered, scoreResult }),
    [getByOrder, getAttempt, onAnswered, scoreResult]
  );

  return (
    <InteractiveLessonContext.Provider value={value}>
      {children}
    </InteractiveLessonContext.Provider>
  );
}

/** Consumed by <InlineQuestion>; throws if used outside the provider. */
export function useInteractiveLesson(): InteractiveLessonContextValue {
  const ctx = useContext(InteractiveLessonContext);
  if (!ctx) {
    throw new Error(
      "useInteractiveLesson must be used within <InteractiveLessonProvider>"
    );
  }
  return ctx;
}
