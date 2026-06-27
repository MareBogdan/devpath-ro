"use client";

// Lightweight, READ-ONLY context for MDX-embedded <WowNote> components. Unlike the
// inline-question provider, Wow Notes carry NO per-user state (no attempts, no
// score, no gating) — they are pure authenticated-read content. So this is just an
// order_index → WowNote lookup, mounted as an ancestor of <MDXRemote> (nested
// inside InteractiveLessonProvider). Null/empty notes => a harmless no-op.

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { WowNote } from "@/types";

interface WowNotesContextValue {
  /** Resolve a note by its order_index (the `n` of <WowNote n="1" />). */
  getByOrder: (n: number) => WowNote | undefined;
}

const WowNotesContext = createContext<WowNotesContextValue | null>(null);

interface WowNotesProviderProps {
  /** Per-lesson notes, ordered by order_index. Null/empty => no notes (no-op). */
  notes?: WowNote[] | null;
  children: ReactNode;
}

export function WowNotesProvider({ notes, children }: WowNotesProviderProps) {
  // order_index → note, for O(1) <WowNote n={…}> lookup.
  const byOrder = useMemo(() => {
    const m = new Map<number, WowNote>();
    for (const note of notes ?? []) m.set(note.order_index, note);
    return m;
  }, [notes]);

  const getByOrder = useCallback((n: number) => byOrder.get(n), [byOrder]);

  const value = useMemo<WowNotesContextValue>(
    () => ({ getByOrder }),
    [getByOrder]
  );

  return (
    <WowNotesContext.Provider value={value}>
      {children}
    </WowNotesContext.Provider>
  );
}

/** Consumed by <WowNote>; throws if used outside the provider. */
export function useWowNotes(): WowNotesContextValue {
  const ctx = useContext(WowNotesContext);
  if (!ctx) {
    throw new Error("useWowNotes must be used within <WowNotesProvider>");
  }
  return ctx;
}
