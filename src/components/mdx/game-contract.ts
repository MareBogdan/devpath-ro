"use client";

import { createContext, useContext } from "react";

/**
 * GAME COMPLETION CONTRACT
 *
 * Every lab / boss / game that a student can finish accepts exactly ONE optional
 * prop and nothing else:
 *
 *     onComplete?: () => void
 *
 * Rules a game must follow:
 *  1. Call `onComplete` EXACTLY ONCE per mount, at the moment the game reaches its
 *     own genuine success end state (the state that already shows its win /
 *     "completed" screen). A loss, game-over, timeout, retry, round change or
 *     "play again" is NOT completion.
 *  2. Fire it from the transition into that state (an effect keyed on the state, or
 *     the handler that performs the transition). Guard it with a ref so React
 *     StrictMode double-effects, re-renders and restarts can never fire it twice.
 *  3. If `onComplete` is undefined the game behaves exactly as before.
 *  4. Adding the prop and the single call site is the whole change: no edits to
 *     rules, scoring, visuals or the state machine.
 *
 * `withGameFrame` (game-frame.tsx) reads the surrounding lesson's handler from
 * `GameCompletionContext` and passes it down as `onComplete`, so MDX lessons keep
 * mounting a bare `<TransistorLab />` and nothing in the content changes.
 */
export interface GameCompletionProps {
  onComplete?: () => void;
}

/** Provided by the lesson page; consumed by `withGameFrame`. null → no listener. */
export const GameCompletionContext = createContext<(() => void) | null>(null);

export function useGameCompletionHandler(): (() => void) | null {
  return useContext(GameCompletionContext);
}
