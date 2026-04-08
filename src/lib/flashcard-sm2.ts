// ─── SM-2 Spaced Repetition Algorithm ────────────────────────────────────────
// Pure functions — no DB, no side effects.

export interface SM2State {
  easeFactor: number;   // starts at 2.5
  intervalDays: number; // starts at 1
  repetitions: number;  // starts at 0
}

export interface SM2Result extends SM2State {
  dueDate: Date;
}

// quality: 0 = blackout, 1 = incorrect, 2 = incorrect but easy recall,
//          3 = correct with difficulty, 4 = correct with hesitation, 5 = perfect
export function computeSM2(
  state: SM2State,
  quality: 0 | 1 | 2 | 3 | 4 | 5
): SM2Result {
  let { easeFactor, intervalDays, repetitions } = state;

  if (quality < 2) {
    // Failed recall — reset to beginning
    repetitions = 0;
    intervalDays = 1;
  } else {
    // Successful recall
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    repetitions += 1;
    easeFactor = Math.max(
      1.3,
      easeFactor + 0.1 - (5 - quality) * 0.08
    );
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + intervalDays);

  return { easeFactor, intervalDays, repetitions, dueDate };
}

// Default SM-2 state for a brand-new card
export const DEFAULT_SM2_STATE: SM2State = {
  easeFactor: 2.5,
  intervalDays: 1,
  repetitions: 0,
};
