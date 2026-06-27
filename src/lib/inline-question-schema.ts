// ============================================
// DevPath RO — Inline-question content validation (Zod)
// ============================================
// Runtime mirror of the InlineQuestion* content interfaces in src/types.
// Used by the saveInlineAttempt Server Action and at authoring/import time to
// validate a question's `content` jsonb against its declared `type`.
//
// The discriminant is the `type` field of the { type, content } envelope — the
// content jsonb itself carries no internal discriminant — so this validates the
// PAIRING (type ↔ content shape), not just the inner object.
//
// Placement: the AI routes inline their Zod schemas per-route, so there is no
// shared schema module to extend. This content schema is needed by more than
// one consumer (Server Action + authoring), so it lives in src/lib alongside
// the other domain helpers (gamification-constants.ts, flashcard-sm2.ts, ...).

import { z } from "zod";
import type {
  SingleChoiceContent,
  TrueFalseContent,
  ShortAnswerContent,
  MatchPairsContent,
  OrderingContent,
  FillBlankContent,
  EssayAiContent,
  InlineUserAnswer,
} from "@/types";

export const singleChoiceContentSchema = z.object({
  prompt: z.string().min(1),
  options: z.array(z.string().min(1)).min(2),
  correct_index: z.number().int().nonnegative(),
  explanation: z.string().min(1),
});

export const trueFalseContentSchema = z.object({
  prompt: z.string().min(1),
  correct: z.boolean(),
  explanation: z.string().min(1),
});

export const shortAnswerContentSchema = z.object({
  prompt: z.string().min(1),
  accepted: z.array(z.string().min(1)).min(1),
  explanation: z.string().min(1),
});

export const matchPairsContentSchema = z.object({
  prompt: z.string().min(1),
  pairs: z
    .array(z.object({ left: z.string().min(1), right: z.string().min(1) }))
    .min(1),
  explanation: z.string().min(1),
});

export const orderingContentSchema = z.object({
  prompt: z.string().min(1),
  items: z.array(z.string().min(1)).min(2),
  explanation: z.string().min(1),
});

export const fillBlankContentSchema = z.object({
  prompt: z.string().min(1),
  blanks: z.array(z.object({ accepted: z.array(z.string().min(1)).min(1) })).min(1),
  explanation: z.string().min(1),
});

// Reserved — AI-graded essay (not rendered in the first slice).
export const essayAiContentSchema = z.object({
  prompt: z.string().min(1),
  rubric: z.string().min(1),
  min_words: z.number().int().positive(),
});

/**
 * Discriminated union over `type`, validating the { type, content } envelope.
 * essay_ai is included but reserved.
 */
export const inlineQuestionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("single_choice"), content: singleChoiceContentSchema }),
  z.object({ type: z.literal("true_false"), content: trueFalseContentSchema }),
  z.object({ type: z.literal("short_answer"), content: shortAnswerContentSchema }),
  z.object({ type: z.literal("match_pairs"), content: matchPairsContentSchema }),
  z.object({ type: z.literal("ordering"), content: orderingContentSchema }),
  z.object({ type: z.literal("fill_blank"), content: fillBlankContentSchema }),
  z.object({ type: z.literal("essay_ai"), content: essayAiContentSchema }),
]);

export type InlineQuestionInput = z.infer<typeof inlineQuestionSchema>;

/**
 * Runtime mirror of InlineUserAnswer — what the client submits to
 * saveInlineAttempt. The action validates against this before trusting the
 * payload (the Server Action is a public endpoint). essay_ai has no member:
 * it is reserved and never submitted for local grading.
 */
export const inlineUserAnswerSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("single_choice"), selected_index: z.number().int().nonnegative() }),
  z.object({ type: z.literal("true_false"), value: z.boolean() }),
  z.object({ type: z.literal("short_answer"), text: z.string() }),
  z.object({ type: z.literal("fill_blank"), values: z.array(z.string()) }),
  z.object({
    type: z.literal("match_pairs"),
    mapping: z.array(z.object({ left: z.string(), right: z.string() })),
  }),
  z.object({ type: z.literal("ordering"), order: z.array(z.string()) }),
]);

// ── Compile-time drift guard ─────────────────────────────────────────────────
// The Zod content shapes must stay structurally identical to the hand-written
// interfaces in src/types. If a field drifts (added/removed/retyped on either
// side), the corresponding `Exact<...>` resolves to `false`, which fails the
// `extends true` constraint below and breaks the build. Pure types — no runtime.
type Exact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type AssertTrue<T extends true> = T;

// Exported (so ESLint doesn't flag it unused) tuple that still enforces drift:
// if any Zod content shape diverges from its hand-written interface, the matching
// Exact<> resolves to `false`, AssertTrue<false> fails its constraint, and the
// build breaks. Pure types — no runtime.
export type InlineQuestionSchemaDriftGuard = [
  AssertTrue<Exact<z.infer<typeof singleChoiceContentSchema>, SingleChoiceContent>>,
  AssertTrue<Exact<z.infer<typeof trueFalseContentSchema>, TrueFalseContent>>,
  AssertTrue<Exact<z.infer<typeof shortAnswerContentSchema>, ShortAnswerContent>>,
  AssertTrue<Exact<z.infer<typeof matchPairsContentSchema>, MatchPairsContent>>,
  AssertTrue<Exact<z.infer<typeof orderingContentSchema>, OrderingContent>>,
  AssertTrue<Exact<z.infer<typeof fillBlankContentSchema>, FillBlankContent>>,
  AssertTrue<Exact<z.infer<typeof essayAiContentSchema>, EssayAiContent>>,
  AssertTrue<Exact<z.infer<typeof inlineUserAnswerSchema>, InlineUserAnswer>>,
];
