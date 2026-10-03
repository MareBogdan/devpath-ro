/**
 * Single source of truth for "how long does a lesson take" estimates shown in the UI
 * (dashboard course cards, courses hero). Change it here and every figure follows.
 */
export const MINUTES_PER_LESSON = 10;

/** Whole hours of content for `lessonCount` lessons (at least 1h when there are any). */
export function estimateContentHours(lessonCount: number): number {
  if (lessonCount <= 0) return 0;
  return Math.max(1, Math.round((lessonCount * MINUTES_PER_LESSON) / 60));
}
