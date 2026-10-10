/**
 * Reading-time estimate shown in the lesson header ("~12 min").
 *
 * Two sources, in this order:
 *   1. the authored value — `lessons.estimated_minutes`, written by scripts/sync-content.mjs from the
 *      lesson's frontmatter `duration` (only for converted lessons, see that script);
 *   2. otherwise a figure computed from the PROSE only: ~160 words/minute (technical Romanian) plus a
 *      small allowance per inline question.
 *
 * "Prose only" matters: the raw MDX also holds JSX tags and their attributes, `<Term def="…">` definitions
 * (hidden behind a click), MDX comments (the ANIMATION / TABLE placeholders) and code fences — none of that is read at
 * reading speed. The old estimate split raw MDX on whitespace and divided by 100, which nearly doubled
 * the badge (L7: 1,962 raw tokens → "~20 min" for 1,501 words of prose).
 *
 * scripts/validate-questions.mjs mirrors WORDS_PER_MINUTE / MINUTES_PER_INLINE_QUESTION and the stripping
 * rules (it flags a frontmatter `duration` that is far from this estimate) — keep the two in step.
 */
export const WORDS_PER_MINUTE = 160;
export const MINUTES_PER_INLINE_QUESTION = 0.5;

/** Inline tags whose content is read as part of the surrounding word ("V<Sub>GS</Sub>", "<Term …>nod</Term>"). */
const INLINE_TAGS = /<\/?(?:Sub|Term)\b(?:"[^"]*"|'[^']*'|[^>"'])*>/g;
/** Any other JSX tag, attributes included (attribute values may contain ">"). */
const ANY_TAG = /<\/?[A-Za-z][A-Za-z0-9]*(?:"[^"]*"|'[^']*'|[^>"'])*>/g;

// Latin (incl. Romanian diacritics), Greek (α, Ω in formulas) and digits. tsconfig targets ES5, so no \p{L} with /u.
const HAS_LETTER_OR_DIGIT = /[0-9A-Za-zÀ-ɏͰ-Ͽ]/;

/** Words a student actually reads: prose, headings, FactBox/CosmoHint text, table cells, list items. */
export function countProseWords(contentMd: string): number {
  const text = contentMd
    .replace(/\r\n/g, "\n")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ") // MDX comments (ANIMATION / TABLE placeholders)
    .replace(/(```|~~~)[\s\S]*?\1/g, " ") // fenced code is skimmed, not read word by word
    .replace(INLINE_TAGS, "")
    .replace(ANY_TAG, " ")
    .replace(/&(?:lt|gt|amp);/g, " ");
  return (text.match(/\S+/g) ?? []).filter((w) => HAS_LETTER_OR_DIGIT.test(w)).length;
}

export interface ReadingTimeInput {
  contentMd: string;
  /** `lessons.estimated_minutes` — authored; wins when it is a positive whole number. */
  authoredMinutes?: number | null;
  /** Number of curated inline questions the lesson carries. */
  inlineQuestions?: number;
}

export function estimateReadingMinutes({
  contentMd,
  authoredMinutes,
  inlineQuestions = 0,
}: ReadingTimeInput): number {
  if (typeof authoredMinutes === "number" && Number.isInteger(authoredMinutes) && authoredMinutes > 0) {
    return authoredMinutes;
  }
  const minutes =
    countProseWords(contentMd) / WORDS_PER_MINUTE + inlineQuestions * MINUTES_PER_INLINE_QUESTION;
  return Math.max(1, Math.ceil(minutes));
}
