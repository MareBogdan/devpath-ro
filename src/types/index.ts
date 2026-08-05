// ============================================
// DevPath RO — Core Type Definitions
// ============================================

export type UserPlan = "free" | "pro" | "lifetime";
export type UserRole = "student" | "admin";

export interface User {
  id: string;
  email: string;
  name: string | null;
  plan: UserPlan;
  role: UserRole;
  goal: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: number;
  is_free: boolean;
  order_index: number;
}

export type LessonType =
  | "theory"
  | "quiz"
  | "exercise"
  | "project"
  | "lesson"
  | "lab"
  | "boss";

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content_md: string;
  type: LessonType;
  starter_code: string | null;
  solution_code: string | null;
  order_index: number;
  video_url: string | null;
  is_published: boolean;
  module_index: number | null;
}

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  score: number | null;
  time_spent: number;
  completed_at: string | null;
}

export interface QuizQuestion {
  id: string;
  lesson_id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export interface Project {
  id: string;
  user_id: string;
  course_id: string;
  title: string;
  description: string;
  github_url: string | null;
  completed_at: string | null;
}

// ============================================
// Course 1 — Interactive Layer
// Tables: inline_questions / inline_attempts / lesson_scores / wow_notes
// (migration 20260626120000_course1_interactive_layer.sql)
// ============================================

// The question kind lives in the `type` column; the `content` jsonb carries ONLY
// the shape's own fields (no internal discriminant). Narrowing therefore happens
// on InlineQuestion.type — see the InlineQuestion union below — which gives the
// cleanest ergonomics for `switch (q.type)` in the renderer.
export type InlineQuestionType =
  | "single_choice"
  | "true_false"
  | "short_answer"
  | "match_pairs"
  | "ordering"
  | "fill_blank"
  | "essay_ai";

export interface SingleChoiceContent {
  prompt: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface TrueFalseContent {
  prompt: string;
  correct: boolean;
  explanation: string;
}

export interface ShortAnswerContent {
  prompt: string;
  accepted: string[];
  explanation: string;
}

export interface MatchPairsContent {
  prompt: string;
  pairs: { left: string; right: string }[];
  explanation: string;
}

export interface OrderingContent {
  prompt: string;
  items: string[];
  explanation: string;
}

export interface FillBlankContent {
  prompt: string;
  blanks: { accepted: string[] }[];
  explanation: string;
}

// Reserved — AI-graded essay. No locally-verifiable answer; `min_words` gates
// submission and `rubric` guides the grader. Not rendered in the first slice.
export interface EssayAiContent {
  prompt: string;
  rubric: string;
  min_words: number;
}

// Convenience union of every content shape (un-narrowed). Prefer narrowing via
// InlineQuestion.type rather than switching on this directly.
export type InlineQuestionContent =
  | SingleChoiceContent
  | TrueFalseContent
  | ShortAnswerContent
  | MatchPairsContent
  | OrderingContent
  | FillBlankContent
  | EssayAiContent;

// Shared (DB) columns for every inline_questions row.
interface InlineQuestionRow {
  id: string;
  lesson_id: string;
  order_index: number;
  created_at: string;
}

// Discriminated union over the `type` column: narrowing `q.type` also narrows
// `q.content` to the matching shape, so `switch (q.type)` in the renderer reads
// `q.content` with full type safety.
export type InlineQuestion =
  | (InlineQuestionRow & { type: "single_choice"; content: SingleChoiceContent })
  | (InlineQuestionRow & { type: "true_false"; content: TrueFalseContent })
  | (InlineQuestionRow & { type: "short_answer"; content: ShortAnswerContent })
  | (InlineQuestionRow & { type: "match_pairs"; content: MatchPairsContent })
  | (InlineQuestionRow & { type: "ordering"; content: OrderingContent })
  | (InlineQuestionRow & { type: "fill_blank"; content: FillBlankContent })
  | (InlineQuestionRow & { type: "essay_ai"; content: EssayAiContent });

export interface InlineAttempt {
  id: string;
  user_id: string;
  question_id: string;
  best_score: number; // smallint, 0..100 (DB CHECK-enforced)
  attempts: number;
  revealed: boolean;
  updated_at: string;
}

/**
 * Per-user/per-lesson tally. NOTE: neither `score` (0–100) nor `total_questions`
 * is stored — both are computed live in TypeScript (see LessonScoreResult). The
 * DB persists only the raw `correct_questions` count.
 */
export interface LessonScore {
  id: string;
  user_id: string;
  lesson_id: string;
  correct_questions: number;
  updated_at: string;
}

export type WowNoteMediaType = "none" | "svg" | "component";
export type WowNoteSide = "left" | "right";
export type WowNoteKind = "insight" | "term" | "analogy";

export interface WowNote {
  id: string;
  lesson_id: string;
  order_index: number;
  title: string;
  body: string | null;
  media_type: WowNoteMediaType;
  media_ref: string | null; // non-null whenever media_type !== "none" (DB CHECK)
  side: WowNoteSide; // which page margin the note floats into (desktop)
  kind: WowNoteKind; // visual style: teal insight / violet term / amber analogy
  created_at: string;
}

// ── Computed / contract types (implemented by later step-2 pieces; shapes only) ──

export type LessonScoreColor = "green" | "yellow" | "white";

/**
 * Computed lesson score — never persisted. `correct_questions` plus the live
 * `total_questions` (count of the lesson's inline_questions) yield `score`
 * (0–100) and `color`. Returned by the scoring helper; read by the dashboard
 * and completion gating.
 */
export interface LessonScoreResult {
  correct_questions: number;
  total_questions: number;
  score: number; // 0–100
  color: LessonScoreColor;
}

/**
 * Per-lesson interactive bundle, loaded server-side in the lesson page and
 * provided to the MDX-embedded <InlineQuestion> components via context.
 * `attempts` is keyed by question_id for O(1) per-question lookup.
 */
export interface LessonInteractiveState {
  questions: InlineQuestion[]; // ordered by order_index
  attempts: Record<string, InlineAttempt>; // question_id -> attempt
  lesson_score: LessonScore | null; // raw row; null until the first answer
  score_result: LessonScoreResult; // derived; always present (0/0 -> score 0)
}

/**
 * Wow Notes carrier — kept SEPARATE from LessonInteractiveState because notes
 * are pure authenticated-read content with no per-user state, and render in a
 * different subsystem (the gutter) than the scoring/gating context. Wrapped in
 * an interface rather than a bare WowNote[] for a named context contract and
 * room to grow (e.g. a future per-user "seen" flag).
 */
export interface LessonWowNotes {
  notes: WowNote[]; // ordered by order_index
}

/**
 * What the client submits per question type — the input pair to SaveAttemptResult.
 * Discriminated on `type` (matches InlineQuestion.type). essay_ai is intentionally
 * ABSENT: it is reserved/AI-graded and has no locally-submittable answer shape.
 * Field names are the contract <InlineQuestion> must send:
 *   single_choice -> selected_index, true_false -> value, short_answer -> text,
 *   fill_blank -> values (one per blank, in order), match_pairs -> mapping
 *   (the user's chosen left↔right pairing), ordering -> order (submitted sequence).
 */
export type InlineUserAnswer =
  | { type: "single_choice"; selected_index: number }
  | { type: "true_false"; value: boolean }
  | { type: "short_answer"; text: string }
  | { type: "fill_blank"; values: string[] }
  | { type: "match_pairs"; mapping: { left: string; right: string }[] }
  | { type: "ordering"; order: string[] };

/**
 * Returned by the `saveInlineAttempt` Server Action (mirrors MarkCompleteResult).
 * Drives per-answer UI feedback. `correct` = answered correctly THIS submission
 * (independent of points awarded); `best_score` = persisted best across attempts;
 * `attempts` = updated attempt count (retry / best-attempt UI); `explanation` is
 * populated only when it should be shown (answered correctly or revealed).
 * `error` is set only on a bailed/unsupported call (auth/not-found/essay_ai); when
 * present, the UI should ignore the scoring fields (which carry neutral defaults).
 */
export interface SaveAttemptResult {
  error?: string;
  correct: boolean;
  best_score: number; // 0..100
  attempts: number;
  revealed: boolean;
  explanation: string | null;
  lesson_score: LessonScoreResult;
}
