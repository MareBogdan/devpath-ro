/**
 * Question + lesson-structure validator — enforces decisions D2 and D3 mechanically.
 *
 *   node scripts/validate-questions.mjs <target>... [--strict] [--stats] [--baseline <git-rev>] [--require]
 *
 * <target> is any of:
 *   • a course slug            hardware-fizica            (every lesson in content/courses/<slug>/)
 *   • a directory              content/courses/hardware-fizica
 *   • a lesson file            content/courses/…/l07-….mdx   (its sibling l07-….questions.json is used)
 *   • a questions file         content/courses/…/l07-….questions.json
 *
 * Authoring format (one file per lesson, next to the .mdx, same basename):
 *   <lesson>.questions.json = { "questions": [ { "order": 1, "type": "single_choice",
 *       "concept": "what this tests", "content": { …exactly the inline_questions.content shape… },
 *       "distractors": [ null, "the real confusion option 1 stands for", "…option 2…" ] }, … ] }
 * `concept` and `distractors` are authoring notes (stripped when seeded); `distractors` is required for
 * single_choice — one entry per option, null at the correct index (D3 rule 4).
 *
 * Exit code 1 when any ERROR is reported (or any WARNING with --strict). Warnings are "REVIEW" items:
 * heuristics that need a human decision (grammatical parallelism, antonym swaps, slot types…).
 *
 * Rules (ids appear in the output):
 *   FORMAT        file/JSON shape, per-type content shape (mirror of src/lib/inline-question-schema.ts)
 *   D2-COUNT      exactly 3 questions on a lesson; 0 on lab/boss
 *   D2-SLOT       (warn) Q1 true_false|single_choice · Q2 fill_blank|ordering|match_pairs · Q3 short_answer|single_choice
 *   D3-1 COUNT    single_choice has exactly 3 options
 *   D3-2 LENGTH   every option within 15% of the longest (shortest >= 0.85 × longest, by characters)
 *   D3-3 LONGEST  the correct option is not the single longest (warn: also tied-longest / most words)
 *   D3-4 NOTES    every wrong option has a named confusion in `distractors`
 *   D3-5 BANNED   no "toate cele de mai sus" / "niciuna dintre" / … ; no double negatives; no options that are
 *                 logical complements (equal once negation words are removed); (warn) antonym swaps
 *   D3-6 PARALLEL (warn) options start with the same kind of word and share capitalisation/punctuation
 *   TF-TELL       (warn) true_false prompt with an absolute word (întotdeauna / niciodată / orice …)
 *   MDX-ANCHOR    every question has exactly one <InlineQuestion n="k" /> (string form), in order, no orphans
 *   MDX-PLACE     question spacing / position along the lesson (error when two are < 10% apart; warn on slot windows: Q1 ≤ 45%, Q2 30–75%, Q3 ≥ 50%)
 *   MDX-TERMS     3–5 <Term> on a lesson, each def 1–2 sentences, ≤ 320 chars, well-formed, not in headings, not nested,
 *                 (warn) ≤ 1 per paragraph and at least one in the second half
 *   MDX-HEADING   the five generic headings are forbidden (HOOK / CONTEXT / MIEZUL / REVEAL / ÎNCHEIERE, also with a suffix);
 *                 (warn) Introducere / Concluzie / Rezumat / Ce urmează, > 10 words, ALL CAPS, `---` rules; (error) a body `# H1`
 *   MDX-RHYTHM    (warn) a paragraph over 90 words
 *   D5-CUT        with --baseline: the prose word count must drop by 15–20% (error outside the band)
 *
 * --stats     print the lesson's prose word count (see wordsOf) — and, with --baseline <rev>, the change vs. that git revision.
 *             The D5-CUT band is enforced whenever --baseline is given. <Term> definitions are not counted (they sit behind a click).
 * --require   a lesson without a questions file is an ERROR (default: reported as PENDING, exit unaffected)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";
import matter from "gray-matter";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const COURSES = path.join(ROOT, "content", "courses");

// ── CLI ──────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const STRICT = argv.includes("--strict");
const STATS = argv.includes("--stats");
const REQUIRE = argv.includes("--require");
const baselineIdx = argv.indexOf("--baseline");
const BASELINE = baselineIdx >= 0 ? argv[baselineIdx + 1] : null;
const targets = argv.filter((a, i) => !a.startsWith("--") && !(baselineIdx >= 0 && i === baselineIdx + 1));

if (targets.length === 0) {
  console.error("usage: node scripts/validate-questions.mjs <course-slug | dir | lesson.mdx | lesson.questions.json>... [--strict] [--stats] [--baseline <git-rev>] [--require]");
  process.exit(2);
}

// ── Reporting ────────────────────────────────────────────────────────────────
const findings = []; // { level: "ERROR"|"WARN"|"INFO", file, q, rule, msg, text }
const rel = (f) => path.relative(ROOT, f).replace(/\\/g, "/");
function report(level, file, q, rule, msg, text) {
  findings.push({ level, file: rel(file), q, rule, msg, text });
}
const err = (f, q, r, m, t) => report("ERROR", f, q, r, m, t);
const warn = (f, q, r, m, t) => report("WARN", f, q, r, m, t);

// ── Text helpers ─────────────────────────────────────────────────────────────
const strip = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const tokens = (s) => strip(s).replace(/[^a-z0-9ăâîșț\s'-]/g, " ").split(/\s+/).filter(Boolean);
const clip = (s, n = 90) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

const NEGATIONS = new Set(["nu", "nici", "niciun", "nicio", "niciunul", "niciuna", "nimic", "nimeni", "fara", "niciodata", "deloc", "nicaieri"]);
const BANNED_PHRASES = [
  /toate\s+(cele\s+)?de\s+mai\s+sus/,
  /toate\s+variantele(\s+de\s+mai\s+sus)?/,
  /toate\s+(raspunsurile|optiunile)/,
  /ambele\s+(variante|raspunsuri|optiuni)/,
  /nici(\s+una|una)\s+din(tre)?/,
  /niciuna\s+din(tre)?/,
  /niciunul\s+din(tre)?/,
  /nu\s+se\s+poate\s+(spune|stabili|sti)/,
  /^\s*[abc]\s+(si|\+|,)\s+[abc]\s*$/,
];
const ABSOLUTES = /\b(intotdeauna|niciodata|mereu|orice|oricand|toti|toate|tot\s+timpul|exclusiv|doar|numai|absolut)\b/;
const ANTONYMS = [
  ["creste", "scade"], ["cresc", "scad"], ["mai mare", "mai mic"], ["mai mari", "mai mici"], ["deschis", "inchis"],
  ["pozitiv", "negativ"], ["pozitiva", "negativa"], ["cu", "fara"], ["mareste", "micsoreaza"], ["blocheaza", "conduce"],
  ["inainte", "dupa"], ["maxim", "minim"], ["sursa", "drena"], ["scade", "creste"],
];
const PREPOSITIONS = new Set(["de", "la", "in", "pe", "cu", "prin", "pentru", "din", "dintre", "fara", "sub", "peste", "dupa", "inainte", "intre", "catre", "spre", "ca"]);
const DETERMINERS = new Set(["un", "o", "niste", "acest", "aceasta", "acesta", "aceste", "acel", "acea", "orice", "fiecare", "toate", "toti"]);
const ADVERBS = new Set(["mai", "foarte", "doar", "numai", "aproape", "exact", "nu", "cand", "daca", "unde", "cum", "deoarece"]);

function firstWordKind(option) {
  const t = tokens(option)[0] ?? "";
  if (NEGATIONS.has(t) || ADVERBS.has(t)) return "adverb/neg";
  if (PREPOSITIONS.has(t)) return "preposition";
  if (DETERMINERS.has(t)) return "determiner";
  if (/(eaza|esc|este|aste|ind|ând|ind|ie|am|ati|ez|uie|ește|ăște|ește)$/.test(t) || /(ează|ește|ăște|ește|esc|ează)$/.test(option.split(/\s+/)[0]?.toLowerCase() ?? "")) return "verb";
  return "noun/other";
}

const countWords = (s) => (s.match(/\S+/g) ?? []).length;

/** Prose word count of a lesson: frontmatter, {/* comments *\/}, <Term def="…"> attributes, JSX tags and
 *  <InlineQuestion /> anchors are excluded; markdown punctuation-only tokens do not count. */
function wordsOf(mdx) {
  let body = matter(mdx.replace(/\r\n/g, "\n")).content;
  body = body.replace(/\{\/\*[\s\S]*?\*\/\}/g, " ");
  body = body.replace(/<InlineQuestion[^>]*\/>/g, " ").replace(/<WowNote[^>]*\/>/g, " ");
  body = body.replace(/<Term\s+def="[^"]*"\s*>/g, " ").replace(/<\/Term>/g, " ");
  body = body.replace(/<\/?[A-Za-z][^>]*>/g, " ");
  return (body.match(/\S+/g) ?? []).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

/** Same walk, but returns the word offset of each <InlineQuestion n="k" /> (for placement checks). */
function anchorOffsets(mdx) {
  let body = matter(mdx.replace(/\r\n/g, "\n")).content;
  body = body.replace(/\{\/\*[\s\S]*?\*\/\}/g, " ");
  const out = [];
  let words = 0;
  let last = 0;
  const re = /<InlineQuestion\b([^>]*)\/>/g;
  let m;
  const clean = (s) =>
    s
      .replace(/<WowNote[^>]*\/>/g, " ")
      .replace(/<Term\s+def="[^"]*"\s*>/g, " ")
      .replace(/<\/Term>/g, " ")
      .replace(/<\/?[A-Za-z][^>]*>/g, " ");
  const count = (s) => (clean(s).match(/\S+/g) ?? []).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
  while ((m = re.exec(body))) {
    words += count(body.slice(last, m.index));
    last = m.index + m[0].length;
    out.push({ attrs: m[1], words });
  }
  const total = words + count(body.slice(last));
  return { anchors: out, total };
}

// ── Question validation ──────────────────────────────────────────────────────
const TYPES = ["single_choice", "true_false", "short_answer", "fill_blank", "ordering", "match_pairs"];
const SLOT_TYPES = { 1: ["true_false", "single_choice"], 2: ["fill_blank", "ordering", "match_pairs"], 3: ["short_answer", "single_choice"] };
const isStr = (v) => typeof v === "string" && v.trim().length > 0;

function checkContentShape(f, qn, q) {
  const c = q.content;
  const bad = (m, t) => err(f, qn, "FORMAT", m, t);
  if (!c || typeof c !== "object") return bad("content missing");
  if (!isStr(c.prompt)) bad("content.prompt missing");
  if (!isStr(c.explanation)) bad("content.explanation missing");
  else if (c.explanation.trim().length < 25) warn(f, qn, "FORMAT", "explanation is very short — it is what the student reads after a miss", clip(c.explanation));
  switch (q.type) {
    case "single_choice":
      if (!Array.isArray(c.options) || !c.options.every(isStr)) bad("content.options must be non-empty strings");
      if (!Number.isInteger(c.correct_index) || c.correct_index < 0 || c.correct_index >= (c.options?.length ?? 0)) bad("content.correct_index out of range", String(c.correct_index));
      break;
    case "true_false":
      if (typeof c.correct !== "boolean") bad("content.correct must be boolean");
      break;
    case "short_answer":
      if (!Array.isArray(c.accepted) || c.accepted.length === 0 || !c.accepted.every(isStr)) bad("content.accepted must be a non-empty string array");
      break;
    case "fill_blank": {
      if (!Array.isArray(c.blanks) || c.blanks.length === 0 || !c.blanks.every((b) => Array.isArray(b?.accepted) && b.accepted.length && b.accepted.every(isStr))) { bad("content.blanks must be [{accepted:[…]}]"); break; }
      const nums = [...String(c.prompt ?? "").matchAll(/\{\{(\d+)\}\}/g)].map((m) => +m[1]).sort((a, b) => a - b);
      if (nums.join() !== c.blanks.map((_, i) => i + 1).join()) bad(`prompt markers {{n}} must be exactly 1..${c.blanks.length}`, clip(c.prompt));
      break;
    }
    case "ordering":
      if (!Array.isArray(c.items) || c.items.length < 3 || !c.items.every(isStr)) bad("content.items needs ≥ 3 non-empty strings");
      else if (c.items.length > 6) warn(f, qn, "FORMAT", "ordering with more than 6 items is tedious on a phone", String(c.items.length));
      else if (new Set(c.items.map(strip)).size !== c.items.length) bad("ordering items must be unique");
      break;
    case "match_pairs":
      if (!Array.isArray(c.pairs) || c.pairs.length < 3 || !c.pairs.every((p) => isStr(p?.left) && isStr(p?.right))) bad("content.pairs needs ≥ 3 {left,right}");
      else if (new Set(c.pairs.map((p) => strip(p.left))).size !== c.pairs.length || new Set(c.pairs.map((p) => strip(p.right))).size !== c.pairs.length) bad("match_pairs lefts and rights must each be unique");
      break;
  }
}

function checkSingleChoice(f, qn, q) {
  const c = q.content;
  const opts = c.options;
  if (!Array.isArray(opts) || !opts.every(isStr) || !Number.isInteger(c.correct_index)) return; // FORMAT already reported

  // D3-1
  if (opts.length !== 3) err(f, qn, "D3-1 COUNT", `single_choice must have exactly 3 options, has ${opts.length}`, opts.map((o) => clip(o, 40)).join(" | "));

  // D3-2
  const lens = opts.map((o) => o.length);
  const longest = Math.max(...lens);
  const shortest = Math.min(...lens);
  if (shortest < 0.85 * longest) {
    const gap = Math.round((1 - shortest / longest) * 100);
    err(f, qn, "D3-2 LENGTH", `options differ by ${gap}% in length (${lens.join(" / ")} chars; allowed ≤ 15%)`, `shortest: "${clip(opts[lens.indexOf(shortest)])}" · longest: "${clip(opts[lens.indexOf(longest)])}"`);
  }

  // D3-3
  const ci = c.correct_index;
  const sorted = [...lens].sort((a, b) => b - a);
  if (lens[ci] === longest && sorted[0] > sorted[1]) {
    err(f, qn, "D3-3 LONGEST", `the correct answer is the single longest option (${lens[ci]} chars vs ${sorted[1]})`, clip(opts[ci]));
  } else if (lens[ci] === longest) {
    warn(f, qn, "D3-3 LONGEST", "the correct answer ties for the longest option", clip(opts[ci]));
  }
  const words = opts.map(countWords);
  if (words[ci] === Math.max(...words) && words.filter((w) => w === words[ci]).length === 1) {
    warn(f, qn, "D3-3 LONGEST", "the correct answer has the most words (reads as the most developed)", clip(opts[ci]));
  }

  // D3-4
  const notes = q.distractors;
  opts.forEach((o, i) => {
    if (i === ci) return;
    const n = Array.isArray(notes) ? notes[i] : undefined;
    if (!isStr(n) || n.trim().length < 12) err(f, qn, "D3-4 NOTES", `option ${i + 1} has no named confusion in "distractors[${i}]" — if you cannot name it, delete the option`, clip(o));
  });

  // D3-5: banned phrases, double negatives, complements
  opts.forEach((o, i) => {
    const s = strip(o);
    for (const re of BANNED_PHRASES) {
      if (re.test(s)) { err(f, qn, "D3-5 BANNED", `option ${i + 1} uses a banned catch-all/combination phrase`, clip(o)); break; }
    }
    const negs = tokens(o).filter((t) => NEGATIONS.has(t));
    if (negs.length >= 2) err(f, qn, "D3-5 BANNED", `option ${i + 1} contains a double negative (${negs.join(" + ")})`, clip(o));
  });
  const stripNeg = (o) => tokens(o).filter((t) => !NEGATIONS.has(t)).join(" ");
  for (let i = 0; i < opts.length; i++) {
    for (let j = i + 1; j < opts.length; j++) {
      const hasNegI = tokens(opts[i]).some((t) => NEGATIONS.has(t));
      const hasNegJ = tokens(opts[j]).some((t) => NEGATIONS.has(t));
      if (hasNegI !== hasNegJ && stripNeg(opts[i]) === stripNeg(opts[j])) {
        err(f, qn, "D3-5 BANNED", `options ${i + 1} and ${j + 1} are logical complements (identical once the negation is removed)`, `"${clip(opts[i], 60)}" ⇄ "${clip(opts[j], 60)}"`);
      }
      const a = tokens(opts[i]);
      const b = tokens(opts[j]);
      if (a.length === b.length) {
        const diffs = a.map((t, k) => [t, b[k]]).filter(([x, y]) => x !== y);
        if (diffs.length >= 1 && diffs.length <= 2 && diffs.every(([x, y]) => ANTONYMS.some(([p, r]) => (x === p && y === r) || (x === r && y === p)))) {
          warn(f, qn, "D3-5 BANNED", `options ${i + 1} and ${j + 1} differ only by an antonym swap — they exclude each other logically`, `"${clip(opts[i], 60)}" ⇄ "${clip(opts[j], 60)}"`);
        }
      }
    }
  }

  // D3-6 (review)
  const kinds = opts.map(firstWordKind);
  if (new Set(kinds).size > 1) warn(f, qn, "D3-6 PARALLEL", `options start with different kinds of word (${kinds.join(" / ")}) — review grammatical parallelism`, opts.map((o) => clip(o, 40)).join(" | "));
  const caps = opts.map((o) => /^[A-ZĂÂÎȘȚ]/.test(o.trim()));
  const ends = opts.map((o) => /[.!?]$/.test(o.trim()));
  if (new Set(caps).size > 1 || new Set(ends).size > 1) warn(f, qn, "D3-6 PARALLEL", "options differ in capitalisation or final punctuation", opts.map((o) => clip(o, 40)).join(" | "));
}

function checkTrueFalse(f, qn, q) {
  const p = q.content?.prompt;
  if (isStr(p) && ABSOLUTES.test(strip(p))) warn(f, qn, "TF-TELL", "true_false prompt contains an absolute word — students learn that these statements are false", clip(p));
}

function validateQuestionsFile(file, lessonType, mdx) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch (e) {
    err(file, null, "FORMAT", `invalid JSON: ${e.message}`);
    return;
  }
  const qs = data.questions;
  if (!Array.isArray(qs)) return err(file, null, "FORMAT", 'file must be { "questions": [ … ] }');

  const isGame = lessonType === "lab" || lessonType === "boss";
  if (isGame && qs.length > 0) err(file, null, "D2-COUNT", `${lessonType} lessons have ZERO questions — the game is the assessment`, `${qs.length} found`);
  if (!isGame && qs.length !== 3) err(file, null, "D2-COUNT", `a lesson has exactly 3 questions (D2), found ${qs.length}`);

  const orders = qs.map((q) => q.order);
  if (!qs.every((q, i) => q.order === i + 1)) err(file, null, "FORMAT", "question orders must be 1, 2, 3 … in sequence", JSON.stringify(orders));

  qs.forEach((q, i) => {
    const qn = i + 1;
    if (!TYPES.includes(q.type)) return err(file, qn, "FORMAT", `unknown type "${q.type}" (essay_ai is reserved)`);
    checkContentShape(file, qn, q);
    if (!isStr(q.concept)) warn(file, qn, "FORMAT", 'missing "concept" note (what this question tests)');
    const slot = SLOT_TYPES[qn];
    if (slot && !isGame && !slot.includes(q.type)) warn(file, qn, "D2-SLOT", `Q${qn} is usually ${slot.join(" | ")}, this is ${q.type}`);
    if (q.type === "single_choice") checkSingleChoice(file, qn, q);
    if (q.type === "true_false") checkTrueFalse(file, qn, q);
  });

  // answer-position bias across the lesson
  const idx = qs.filter((q) => q.type === "single_choice").map((q) => q.content?.correct_index);
  if (idx.length >= 2 && new Set(idx).size === 1) warn(file, null, "D3-3 LONGEST", `every single_choice has the correct answer at position ${idx[0] + 1}`);

  if (mdx) checkAnchors(file, qs, mdx);
}

// ── MDX cross-checks ─────────────────────────────────────────────────────────
function checkAnchors(qfile, qs, mdx) {
  const { anchors, total } = anchorOffsets(mdx);
  const seen = [];
  anchors.forEach((a) => {
    const m = a.attrs.match(/\bn="(\d+)"/);
    if (!m) err(qfile, null, "MDX-ANCHOR", 'an <InlineQuestion> anchor must use the string form n="1" (n={1} is dropped by next-mdx-remote)', clip(a.attrs.trim()));
    else seen.push({ n: +m[1], words: a.words });
  });
  qs.forEach((q, i) => {
    const hits = seen.filter((s) => s.n === q.order);
    if (hits.length !== 1) err(qfile, i + 1, "MDX-ANCHOR", `expected exactly one <InlineQuestion n="${q.order}" /> in the lesson, found ${hits.length}`);
  });
  seen.forEach((s) => { if (!qs.some((q) => q.order === s.n)) err(qfile, null, "MDX-ANCHOR", `<InlineQuestion n="${s.n}" /> has no question`); });
  const sortedByPos = [...seen].sort((a, b) => a.words - b.words).map((s) => s.n);
  if (sortedByPos.join() !== [...sortedByPos].sort((a, b) => a - b).join()) err(qfile, null, "MDX-ANCHOR", "anchors appear out of order in the lesson", sortedByPos.join(" → "));

  if (total === 0 || seen.length === 0) return;
  // Thresholds below are deliberately loose (10% spacing, Q3 from 50%) — a question goes right after the
  // concept it tests; these only catch genuine clustering. Do NOT tighten them: see LESSON-STANDARD.md §5.1.
  const pos = (n) => (seen.find((s) => s.n === n)?.words ?? 0) / total;
  const p = [1, 2, 3].map(pos);
  if (seen.length === 3) {
    for (let i = 1; i < 3; i++) {
      if (p[i] - p[i - 1] < 0.1) err(qfile, i + 1, "MDX-PLACE", `Q${i} and Q${i + 1} are only ${Math.round((p[i] - p[i - 1]) * 100)}% of the lesson apart (minimum 10%) — questions belong at concept boundaries, not clustered`, `at ${p.map((x) => Math.round(x * 100) + "%").join(" / ")}`);
    }
    if (p[0] > 0.45) warn(qfile, 1, "MDX-PLACE", `Q1 sits at ${Math.round(p[0] * 100)}% — it should follow the FIRST concept (≤ ~45%)`);
    if (p[1] < 0.3 || p[1] > 0.75) warn(qfile, 2, "MDX-PLACE", `Q2 sits at ${Math.round(p[1] * 100)}% — it should follow the main mechanism (30–75%)`);
    if (p[2] < 0.5) warn(qfile, 3, "MDX-PLACE", `Q3 sits at ${Math.round(p[2] * 100)}% — it belongs in the second half (≥ 50%), right after the last concept it tests`);
    if (p[2] > 0.97) warn(qfile, 3, "MDX-PLACE", "Q3 is at the very end of the lesson — place it after the last concept, before the wrap-up");
  }
}

function checkTermsAndHeadings(file, mdx, lessonType) {
  const body = matter(mdx.replace(/\r\n/g, "\n")).content;
  // Blank out fenced code so '# comment' lines and '---' inside code are not mistaken for markdown.
  const prose = body.replace(/```[\s\S]*?```/g, (m) => m.replace(/[^\n]/g, " "));
  const terms = [...body.matchAll(/<Term\s+def="([^"]*)"\s*>([\s\S]*?)<\/Term>/g)];
  const rawTerms = (body.match(/<Term\b/g) ?? []).length;
  const isGame = lessonType === "lab" || lessonType === "boss";
  if (rawTerms !== terms.length) {
    err(file, null, "MDX-TERMS", `${rawTerms} <Term> tag(s) in the file but only ${terms.length} well-formed — check for a straight " inside def, a missing def="…", or an unclosed tag`);
  }
  if (!isGame) {
    if (terms.length < 3 || terms.length > 5) {
      (terms.length === 0 ? warn : err)(file, null, "MDX-TERMS", `a lesson has 3–5 <Term> (D1/standard), found ${terms.length}`);
    }
    const names = terms.map((t) => strip(t[2]).trim());
    if (new Set(names).size !== names.length) warn(file, null, "MDX-TERMS", "the same term is defined more than once", names.join(", "));
    // spread: at least one term in the second half of the prose
    const total = wordsOf(mdx);
    if (terms.length >= 3 && total > 0) {
      const wordsBefore = (idx) => wordsOf("---\n---\n" + body.slice(0, idx));
      const late = terms.filter((t) => wordsBefore(t.index) / total >= 0.5).length;
      if (late === 0) warn(file, null, "MDX-TERMS", "no <Term> in the second half of the lesson — the jargon is usually there too");
    }
  }
  for (const t of terms) {
    const def = t[1].trim();
    const sentences = def.split(/(?<=[.!?…])\s+(?=[A-ZĂÂÎȘȚ„"])/).filter(Boolean).length;
    if (!def) err(file, null, "MDX-TERMS", "empty def", t[2].trim());
    else {
      if (sentences > 2) err(file, null, "MDX-TERMS", `definition has ${sentences} sentences (max 2)`, clip(def));
      if (def.length > 320) err(file, null, "MDX-TERMS", `definition is ${def.length} chars (max 320)`, clip(def));
      if (/<|>|\{\{/.test(def)) err(file, null, "MDX-TERMS", "definition must be plain text", clip(def));
    }
    if (/\n|\*\*/.test(t[2])) warn(file, null, "MDX-TERMS", "a <Term> wraps a single plain word or short phrase", clip(t[2].trim()));
    if (/<Term\b/.test(t[2])) err(file, null, "MDX-TERMS", "a <Term> inside another <Term>", clip(t[2].trim()));
  }

  // Line-based checks: headings, H1, rules.
  const lines = prose.split("\n");
  const GENERIC5 = /^(hook|context|miezul|reveal|incheiere)\b/;
  const GENERIC_SOFT = /^(introducere|concluzie|concluzii|rezumat|ce urmeaza)\b/;
  lines.forEach((line, i) => {
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const text = h[2].trim();
      const norm = strip(text).replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
      if (level === 1) err(file, null, "MDX-HEADING", `a body "# H1" duplicates the page title — delete it (line ${i + 1})`, line.trim());
      if (GENERIC5.test(norm)) err(file, null, "MDX-HEADING", `generic heading — name what the section says (line ${i + 1})`, line.trim());
      else if (GENERIC_SOFT.test(norm)) warn(file, null, "MDX-HEADING", `generic heading — a pointer/recap is not a section (line ${i + 1})`, line.trim());
      if (countWords(text) > 10) warn(file, null, "MDX-HEADING", `heading is ${countWords(text)} words (aim ≤ 10)`, line.trim());
      if (text.length > 3 && text === text.toUpperCase() && /[A-ZĂÂÎȘȚ]/.test(text)) warn(file, null, "MDX-HEADING", "ALL-CAPS heading — use sentence case", line.trim());
    } else if (/^\s*---+\s*$/.test(line) && i > 0) {
      warn(file, null, "MDX-HEADING", `a "---" rule between sections — H2 is already underlined by the theme (line ${i + 1})`);
    }
  });

  // Rhythm: no paragraph over 90 words (tables, lists, JSX blocks and code are skipped).
  for (const para of prose.split(/\n\s*\n/)) {
    const t = para.trim();
    if (!t || /^(\||[-*]\s|\d+\.\s|<|\{\/\*|#)/.test(t)) continue;
    const n = countWords(t.replace(/<Term\s+def="[^"]*"\s*>/g, "").replace(/<\/Term>/g, ""));
    if (n > 90) warn(file, null, "MDX-RHYTHM", `a paragraph of ${n} words (aim ≤ 90) — split it`, clip(t, 70));
    const termsInPara = (t.match(/<Term\b/g) ?? []).length;
    if (termsInPara > 1) warn(file, null, "MDX-TERMS", `${termsInPara} <Term> in one paragraph (aim ≤ 1)`, clip(t, 70));
  }
}

// ── Target resolution ────────────────────────────────────────────────────────
function lessonsIn(dir) {
  return fs.readdirSync(dir).filter((f) => f.endsWith(".mdx") && !f.endsWith("-simple.mdx")).sort().map((f) => path.join(dir, f));
}
function resolveTarget(t) {
  const abs = path.isAbsolute(t) ? t : path.resolve(process.cwd(), t);
  if (fs.existsSync(abs)) {
    const st = fs.statSync(abs);
    if (st.isDirectory()) return lessonsIn(abs);
    if (abs.endsWith(".questions.json")) return [abs.replace(/\.questions\.json$/, ".mdx")];
    return [abs];
  }
  const slugDir = path.join(COURSES, t);
  if (fs.existsSync(slugDir)) return lessonsIn(slugDir);
  console.error(`not found: ${t}`);
  process.exit(2);
}

let pending = 0;
let checked = 0;
const lessonFiles = [...new Set(targets.flatMap(resolveTarget))];
for (const mdxFile of lessonFiles) {
  const mdx = fs.existsSync(mdxFile) ? fs.readFileSync(mdxFile, "utf-8") : null;
  const fm = mdx ? matter(mdx.replace(/\r\n/g, "\n")).data : {};
  const lessonType = fm.type ?? "lesson";
  const qfile = mdxFile.replace(/\.mdx$/, ".questions.json");
  const isGame = lessonType === "lab" || lessonType === "boss";

  if (mdx) checkTermsAndHeadings(mdxFile, mdx, lessonType);
  if (fs.existsSync(qfile)) {
    checked++;
    validateQuestionsFile(qfile, lessonType, mdx);
  } else if (!isGame) {
    if (REQUIRE) err(mdxFile, null, "D2-COUNT", "no questions file (expected " + path.basename(qfile) + ")");
    else pending++;
  }
  if (STATS && mdx) {
    let line = `${rel(mdxFile)}: ${wordsOf(mdx)} words`;
    if (BASELINE) {
      try {
        const old = execFileSync("git", ["show", `${BASELINE}:${rel(mdxFile)}`], { cwd: ROOT, encoding: "utf-8", maxBuffer: 1 << 24 });
        const w0 = wordsOf(old);
        const w1 = wordsOf(mdx);
        line += `  (baseline ${BASELINE}: ${w0} → ${w1 >= w0 ? "+" : ""}${Math.round(((w1 - w0) / w0) * 1000) / 10}%)`;
        const cut = (w0 - w1) / w0;
        if (cut < 0.15) err(mdxFile, null, "D5-CUT", `the lesson is ${Math.round(cut * 1000) / 10}% shorter than ${BASELINE} — the standard asks for 15–20%`, `${w0} → ${w1} words`);
        else if (cut > 0.2) err(mdxFile, null, "D5-CUT", `the lesson is ${Math.round(cut * 1000) / 10}% shorter than ${BASELINE} — more than 20% means teaching was cut`, `${w0} → ${w1} words`);
      } catch {
        line += `  (no baseline at ${BASELINE})`;
      }
    }
    findings.push({ level: "INFO", file: "", q: null, rule: "STATS", msg: line, text: "" });
  }
}

// ── Output ───────────────────────────────────────────────────────────────────
const order = { ERROR: 0, WARN: 1, INFO: 2 };
findings.sort((a, b) => order[a.level] - order[b.level] || a.file.localeCompare(b.file) || (a.q ?? 0) - (b.q ?? 0));
for (const f of findings) {
  if (f.level === "INFO") { console.log(`INFO   ${f.msg}`); continue; }
  const tag = f.level === "ERROR" ? "ERROR " : "REVIEW";
  const where = `${f.file}${f.q ? ` · Q${f.q}` : ""}`;
  console.log(`${tag} ${where}\n       [${f.rule}] ${f.msg}${f.text ? `\n       → ${f.text}` : ""}`);
}
const errors = findings.filter((f) => f.level === "ERROR").length;
const warns = findings.filter((f) => f.level === "WARN").length;
console.log(`\n${errors === 0 && (!STRICT || warns === 0) ? "✅" : "❌"} ${lessonFiles.length} lesson(s), ${checked} questions file(s) checked · ${errors} error(s) · ${warns} review item(s)${pending ? ` · ${pending} lesson(s) PENDING (no questions file yet)` : ""}`);
process.exit(errors > 0 || (STRICT && warns > 0) ? 1 : 0);
