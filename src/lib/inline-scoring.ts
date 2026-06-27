// ============================================
// DevPath RO — Inline-question scoring (pure)
// ============================================
// Server-only by convention, but intentionally PURE: no DB access, no
// next/headers, no secrets — so it is unit-testable in isolation. The 100/60/20
// scoring lives HERE in TypeScript, never in the database.
//
// Per-question scoring is BINARY: 100 only if fully correct, else 0 — for every
// type, including match_pairs / ordering / fill_blank (all pairs / full order /
// all blanks must be correct).

import type {
  InlineQuestion,
  InlineUserAnswer,
  LessonScoreColor,
  LessonScoreResult,
} from "@/types";
import { inlineQuestionSchema } from "@/lib/inline-question-schema";

// Combining diacritical marks block (U+0300–U+036F). Built via fromCharCode to
// keep the source pure-ASCII — no literal combining chars, no `\u` escapes, and
// no regex `u` flag (the project's TS type-check target rejects the `u` flag).
const COMBINING_MARKS = new RegExp(
  "[" + String.fromCharCode(0x300) + "-" + String.fromCharCode(0x36f) + "]",
  "g"
);

/**
 * Answer normalization for free-text comparison. Exact transform, in order:
 *   1. NFD decompose — splits each precomposed letter into base char + combining
 *      diacritical mark(s).
 *   2. strip U+0300–U+036F (combining marks) — after NFD this removes every
 *      Romanian diacritic in BOTH encodings, since each decomposes to base + mark:
 *        a-breve     -> a + U+0306,  a-circumflex -> a + U+0302,  i-circumflex -> i + U+0302,
 *        s-comma     -> s + U+0326 (from U+0219),  s-cedilla -> s + U+0327 (from U+015F),
 *        t-comma     -> t + U+0326 (from U+021B),  t-cedilla -> t + U+0327 (from U+0163).
 *      All of U+0306/0302/0326/0327 fall inside U+0300–U+036F, so all are stripped.
 *   3. toLowerCase — case-insensitive.
 *   4. collapse \s+ -> single space — internal-whitespace-insensitive.
 *   5. trim — drop leading/trailing whitespace.
 * Result: a diacritic-, case-, and spacing-insensitive comparison key.
 */
export function normalizeText(input: string): string {
  return input
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Pure correctness check. Validates the question's `content` jsonb with Zod
 * (throws on malformed content — an authoring bug that should surface loudly;
 * the Server Action catches it), then narrows by type and compares.
 *
 * essay_ai throws — it is reserved and NEVER locally graded (never silently true).
 */
export function verifyInlineAnswer(
  question: InlineQuestion,
  answer: InlineUserAnswer
): boolean {
  const parsed = inlineQuestionSchema.parse({
    type: question.type,
    content: question.content,
  });

  switch (parsed.type) {
    case "single_choice": {
      if (answer.type !== "single_choice") return false;
      return answer.selected_index === parsed.content.correct_index;
    }
    case "true_false": {
      if (answer.type !== "true_false") return false;
      return answer.value === parsed.content.correct;
    }
    case "short_answer": {
      if (answer.type !== "short_answer") return false;
      const got = normalizeText(answer.text);
      return parsed.content.accepted.some((a) => normalizeText(a) === got);
    }
    case "fill_blank": {
      if (answer.type !== "fill_blank") return false;
      const blanks = parsed.content.blanks;
      if (answer.values.length !== blanks.length) return false;
      // ALL blanks must match one of their accepted answers.
      return blanks.every((blank, i) => {
        const got = normalizeText(answer.values[i]);
        return blank.accepted.some((a) => normalizeText(a) === got);
      });
    }
    case "match_pairs": {
      if (answer.type !== "match_pairs") return false;
      const correct = parsed.content.pairs;
      if (answer.mapping.length !== correct.length) return false;
      // Full correctness: every correct (left,right) pair must appear in the
      // user's mapping. With equal lengths and unique lefts this is a bijection.
      const userPairs = answer.mapping.map((p) => ({
        left: normalizeText(p.left),
        right: normalizeText(p.right),
      }));
      return correct.every((cp) => {
        const left = normalizeText(cp.left);
        const right = normalizeText(cp.right);
        return userPairs.some((up) => up.left === left && up.right === right);
      });
    }
    case "ordering": {
      if (answer.type !== "ordering") return false;
      const items = parsed.content.items;
      if (answer.order.length !== items.length) return false;
      // Submitted sequence must equal the canonical order.
      return items.every((item, i) => normalizeText(item) === normalizeText(answer.order[i]));
    }
    case "essay_ai":
      throw new Error("essay_ai is reserved and not locally gradable");
  }
}

/**
 * Single source of truth for the 100/60/20 lesson score. Threshold-based on
 * correct-vs-total counts — NO division anywhere, so total === 0 is inherently
 * safe (never divides, never blocks):
 *   GREEN  = all correct          -> 100
 *   YELLOW = >=1 correct, not all  ->  60
 *   WHITE  = 0 correct (lesson otherwise traversed) -> 20
 *
 * total === 0 default: a lesson with NO inline questions returns a neutral WHITE
 * { correct:0, total:0, score:20 } — it never errors. Consumers should treat
 * total_questions === 0 as "not scored" (a traversed, question-less lesson) and
 * may choose to hide the score badge entirely.
 */
export function computeLessonScore(correct: number, total: number): LessonScoreResult {
  let color: LessonScoreColor;
  if (total === 0) {
    color = "white";
  } else if (correct >= total) {
    color = "green";
  } else if (correct > 0) {
    color = "yellow";
  } else {
    color = "white";
  }
  const score = color === "green" ? 100 : color === "yellow" ? 60 : 20;
  return { correct_questions: correct, total_questions: total, score, color };
}
