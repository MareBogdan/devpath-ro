// ─── Gamification Constants & Types ───────────────────────────────────────────
// No "use server" — safe to import from client components

export type XPEventType =
  | "onboarding_complete"
  | "lesson_complete"
  | "gate_first_try"
  | "quiz_perfect"
  | "quiz_good"
  | "streak_daily"
  | "streak_3_days"
  | "streak_7_days"
  | "streak_30_days"
  | "course_complete"
  | "minigame_perfect"
  | "minigame_complete"
  | "flashcard_session"
  | "referral_bonus"
  | "first_comment"
  | "comment_upvoted";

export const XP_VALUES: Record<XPEventType, number> = {
  onboarding_complete: 50,
  lesson_complete: 15,
  gate_first_try: 5,
  quiz_perfect: 25,
  quiz_good: 10,
  streak_daily: 5,
  streak_3_days: 20,
  streak_7_days: 50,
  streak_30_days: 200,
  course_complete: 100,
  minigame_perfect: 30,
  minigame_complete: 15,
  flashcard_session: 10,
  referral_bonus: 40,
  first_comment: 5,
  comment_upvoted: 10,
};

// ─── Level System ─────────────────────────────────────────────────────────────

// XP required to REACH each level (cumulative). Source: devpath-docs/devpath-vision.md
// ("Level 1 — Curios (0–199 XP)" … "Level 10 — Maestrul AI (3500+ XP)").
// The SQL function public.award_xp_and_check_level hardcodes the SAME curve
// (supabase/migrations/20260930120000_gamification_core.sql) — change both together.
export const LEVEL_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 200,
  3: 400,
  4: 700,
  5: 1000,
  6: 1400,
  7: 1800,
  8: 2300,
  9: 2900,
  10: 3500,
};

export const LEVEL_NAMES: Record<number, string> = {
  1: "Curios",
  2: "Explorator",
  3: "Învățăcel",
  4: "Descoperitor",
  5: "Practician",
  6: "Meșteșugat",
  7: "Cunoscător",
  8: "Inovator",
  9: "Vizionar",
  10: "Maestrul AI",
};

export const LEVEL_UNLOCK_TEXT: Record<number, string> = {
  2: "Mintea ta a început să exploreze. Continuă!",
  3: "Conexiunile se formează. Ești pe drumul cel bun, Învățăcel!",
  4: "Ai descoperit ceva real. Descoperitorul merge mai departe!",
  5: "Cunoașterea ta devine practică. Felicitări, Practician!",
  6: "Meșteșugarul știe că practica face maiestrie. Continuă!",
  7: "Cunoscătorul e cel pe care alții îl întreabă. Ești acolo!",
  8: "Inovatorul vede dincolo de ce e. Extraordinar!",
  9: "Vizionarul îți aparține acum. Puțini ajung aici.",
  10: "Ai ajuns. Maestrul AI — titlu câștigat, nu dat. Extraordinar!",
};

// ─── Shared Interfaces ────────────────────────────────────────────────────────

export interface AwardXPResult {
  newXP: number;
  oldLevel: number;
  newLevel: number;
  leveledUp: boolean;
  newLevelName?: string;
}

export interface AwardedBadge {
  slug: string;
  name: string;
  description: string;
  icon: string;
}

export type BadgeTrigger =
  | { event: "lesson_complete"; lessonType: string; courseId: string; moduleIndex: number; completedAt: Date }
  | { event: "quiz_complete"; score: number; courseId: string }
  | { event: "streak_update"; streakCount: number }
  | { event: "project_submit" }
  | { event: "referral_complete"; referralCount: number }
  | { event: "flashcard_session"; cardCount: number }
  | { event: "minigame_complete"; isPerfect: boolean }
  | { event: "portfolio_share" }
  | { event: "comment_posted" };
