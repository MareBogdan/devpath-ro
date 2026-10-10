# LESSON-STANDARD.md — what a finished DevPath RO lesson is

> **Audience:** an agent (or a person) who has never seen the conversation that produced this file and must take **one** lesson `.mdx` and turn it into a *finished* lesson. **Source of the decisions:** `MASTER-PLAN.md` D1–D5 (settled — do not reinterpret). **Reference implementation:** `content/courses/hardware-fizica/l07-tranzistorul-robinet-electric-controlat-de-tensiune.mdx` + `.questions.json` (the pilot).
> **Language:** this file is English; **all lesson text, headings, term definitions and questions are Romanian.**

---

## 0. The job in one paragraph

Input: `content/courses/<slug>/<lesson>.mdx` (a ~2,000-word wall of text under generic headings). Output, for that one lesson only:
1. the **same lesson, restructured**: real headings, broken-up paragraphs, **15–20% fewer words**, **3–5 `<Term>`**, three `<InlineQuestion n="k" />` anchors at concept boundaries;
2. a sibling **`<lesson>.questions.json`** with exactly **3** questions;
3. **`node scripts/validate-questions.mjs <lesson>.mdx --stats --baseline HEAD` exits 0** with no review items you can't justify.

You do **not** touch the database, other lessons, games, components or configuration. The owner reviews the diff, then the SQL (`scripts/questions-to-sql.mjs`) and the content sync (`scripts/sync-content.mjs --dry-run`) are shown and approved separately.

**This is restructuring and enrichment, not rewriting.** See §1.

---

## 1. What never changes

The lesson's **teaching content**: the mechanisms, the examples, the names, dates, numbers, formulas, units, code, tables, and the order in which ideas build on each other. You may re-word to cut (§3) but you may not add a claim, drop an argument, or reorder the argument. This protects the *pedagogy*. **It never protects an error** — see the next rule.

- **A factual error found while converting a lesson is FIXED and REPORTED — never preserved.** These lessons are live on an educational site; copying a wrong number forward because "the task was restructuring" ships the error to every student, and a rollout over 130 lessons would multiply it. Procedure:
  1. **Verify before you touch it.** Redo the arithmetic or unit conversion yourself, or name the primary source (a textbook, a datasheet, a standard). Don't "correct" from memory alone.
  2. **If it is verifiably wrong, fix it with the smallest edit that makes it true** — change the number, or soften or drop the comparison; never rewrite the section — and fix it **everywhere it appears**: body, FactBox, CosmoHint, table, `<Term def>`, question explanations.
  3. **Report every fix** as `FIX · line · before → after · how verified` (§8).
  4. **If you suspect an error but cannot verify it** (a disputed historical figure, a convention that differs between sources), do **not** change it: report it as `SUSPECTED · line · why · what would settle it`.
  5. **If the text contradicts itself or states an idealisation that is wrong at a finer level** (pilot: "no static consumption" next to the sub-threshold-leakage paragraph), do not resolve it yourself: report it as `TENSION · lines · what clashes` for the owner.

  Pilot fixes (hardware-fizica L7): ~10⁷ cm/s is 360.000 km/h, not 100.000 (body **and** CosmoHint); "7.740 de kilometri — de la București la Beijing și înapoi" → "mai mult decât distanța de la București la Beijing" (one way is ~7.060 km, so a round trip is ~14.000); a "TTL" row in a MOS threshold-voltage table → "NMOS/CMOS clasic" (TTL is bipolar and has no MOS threshold); "electronii masivi" → "majoritari" (the term the course uses); "1 V under 100 nm → 10.000–100.000 V/cm" → 100.000–1.000.000 V/cm (1 V over 100 nm is already 10⁵ V/cm). Left and reported: SUSPECTED the point-contact gain "de o sută de ori"; TENSION the static-power claims.
- Keep `{/* ANIMATION … */}` and `{/* TABLE … */}` placeholder comments exactly where they are (they are the owner's TODOs for visuals that don't exist yet); mention them in the report.
- Keep `<FactBox>`, `<CosmoHint>`, tables, lists, code blocks, formulas and bold terms. You may tighten the sentences *inside* a FactBox/CosmoHint, never drop its fact.
- Keep the frontmatter (`title`, `order`, `type`, `module_index`, `duration`, `difficulty`) untouched.
- Terms' `def` text and questions are **new** text — they are enrichment and must be true and consistent with the lesson.

---

## 2. Headings

**The five generic headings are abolished** (`## HOOK`, `## CONTEXT`, `## MIEZUL`, `## REVEAL`, `## ÎNCHEIERE` — also in mixed case: *Miezul*, *Reveal*). 114 of 131 lessons use them. The validator **fails** any lesson that keeps one (`MDX-HEADING`).

**A heading names what the section says.** Tests, all must pass:
1. *Swap test* — could this heading sit unchanged in another lesson? Then it is generic. Rewrite.
2. *Spoiler test* — a reader skimming only the headings should learn the lesson's argument.
3. Sentence case, **≤ 10 words**, no all-caps, no "Introducere / Concluzie / Rezumat / Ce urmează" (validator: warning). A heading is a *claim or a stage* ("1947: un semnal mic comandă un curent mare"), not a scene or a metaphor — an image with no claim ("O folie de aur pe o pană de plastic") and a metaphor ("Ce rămâne din robinet") both fail the spoiler test. Don't use a term in a heading that the section hasn't explained yet ("point-contact").
4. **No `# H1` in the body** — the page already renders the lesson title as the H1. (Course 2 lessons repeat `# Title`; delete it.)
5. Structure: `##` sections; `###` only to split a long `##` into named parts. A **bare wrapper** — a `##` that carries no meaning of its own, like `## MIEZUL` over nine `###` — is forbidden: delete it. A *descriptive* `##` that groups several `###` and itself names a claim or a stage ("Cum comandă poarta curentul" over *structură · inversie · prag · regiuni*) is fine, even with no prose of its own: the test is whether the heading says something, not whether it has a paragraph.
6. Remove `---` rules between sections; `h2` is already underlined by the theme.

### Worked before → after (all from real lessons in the repo)

| Lesson | Before | After | Why |
|---|---|---|---|
| `sisteme-de-operare/c2-l7-deadlockuri.mdx` | `## HOOK` (the 2003 blackout: a race condition, not a deadlock, took down the grid) | `## Blackout-ul din 2003 nu a fost un deadlock` | The heading now carries the hook's claim. |
| `sisteme-de-operare/c2-l9-fragmentarea-memoriei.mdx` | `## HOOK` (Redis: 8 GB free, yet "out of memory") | `## 8 GB liberi și totuși fără memorie` | States the paradox the section opens. |
| `sisteme-de-operare/c2-l7-deadlockuri.mdx` | `## MIEZUL` wrapping nine `###`: *Definiție formală · Cele 4 condiții Coffman · Resource Allocation Graph · Strategiile de gestionare · Deadlock ABBA: cod complet · Deadlock în Kernel Linux · … PostgreSQL · Livelock și Starvation · … Limbaje moderne* | `## Ce este un deadlock — definiția, condițiile, graful` (first three) · `## Cum îl gestionezi` (strategii) · `## Deadlock-ul în cod real` (ABBA, kernel, PostgreSQL, limbaje) · `## Livelock și starvation: frații mai puțin vizibili` | The wrapper disappears; the nine parts are grouped by what the reader is doing (understand → handle → see it in real code → meet the cousins). |
| `hardware-fizica/l07-…mdx` (pilot) | `## O folie de aur pe o pană de plastic` (a scene) · `## Miezul` (wrapper over 11 `###`) · `## Reveal` · `## Ce urmează` | `## 1947: un semnal mic comandă un curent mare` · `## Cum comandă poarta curentul` · `## Prețul comutării: puterea și viteza` · `## Cum s-a micșorat tranzistorul — și unde se oprește` · `## Memoria care nu se micșorează odată cu logica` · `## Robinetul comandat de câmp, după 51 de ani` | The scene becomes a claim; the wrapper is gone and the 11 parts are grouped under 4 claims; *Reveal* + *Ce urmează* merge into one short closing section. (A first draft, "Micșorarea fără sfârșit", said the opposite of its section — the review caught it.) |
| `sisteme-de-operare/c2-l9-…mdx` | `## CONTEXT` (84 words: "Știi deja că … Lecția asta explică …") | *(heading deleted)* — one sentence at the end of the hook, or cut | A recap of earlier lessons is restatement (§3); keep at most one sentence that connects, with no heading. |
| `sisteme-de-operare/c2-l7-…mdx` | `## ÎNCHEIERE` ("Lecția următoare intră direct în …") | *(heading deleted)* — the last 1–2 sentences close the final section | A pointer to the next lesson is not a section. |

---

## 3. Length — cut 15–20% (D5)

**Measure with the validator, not by eye:** `node scripts/validate-questions.mjs <lesson>.mdx --stats --baseline HEAD`. (`HEAD` means "the lesson as committed before you started"; once you have committed the rewrite, point `--baseline` at the *original* revision instead — for the pilot that is `49cbe30`.) It counts prose words — frontmatter, `{/* comments */}`, `<Term def="…">` attributes, JSX tag markup, `<InlineQuestion />` anchors and markdown punctuation don't count; headings, FactBox/CosmoHint text, table cells and list items do. **Target: −15% to −20%** (pilot: 2,054 → 1,742 words, −15.2%). With `--baseline` the validator **enforces** the band (`D5-CUT`): under −15% means you stopped early, over −20% means you are cutting teaching. Note the `<Term>` definitions (~130 words in the pilot) are not counted — they sit behind a click — so the *visible-on-load* text shrinks by the full cut; if you count the cards the net change is smaller.

### Cut (in this order of preference)
1. **Restatement** — a sentence that says again what the previous one said; "recap" sections (`CONTEXT`, `REVEAL`, `ÎNCHEIERE`) that list what the lesson just covered; the same claim made in the hook, the middle and the wrap-up (pilot: "no static consumption" was said four times — kept where it earns its place).
2. **Throat-clearing** — "Acum e momentul să…", "Asta a schimbat totul.", "Și da —", "Să vedem ce înseamnă asta", announcing what the next paragraph will do.
3. **Over-long analogies and run-on scene setting** — keep the analogy's point, drop its extra steps (pilot: the three-step Gelsinger escalation reactor → rocket nozzle → Sun became reactor → Sun).
4. **Citation trivia that carries no argument** — patent numbers, "X followed in year Y" side facts. (A number that *carries* the argument — a measurement, a ratio, a date that orders events — is never trivia.)
5. **Hedging stacks and doubled adjectives.**

### Never cut
- **The concrete example** (the story, the code, the case study, the worked calculation).
- **The numbers** that carry an argument, with their units.
- **The "why this matters"** sentence of a section (the pilot's: "…de aceea procesoarele fierbinți consumă mai mult chiar și în repaus").
- A qualifier that changes a claim ("aproximativ", "în teorie", "în general", "doar", "semiconductoare") — dropping it changes what is asserted. (Pilot mistake caught in review: cutting "aproximativ" and "semiconductoare"; both restored.)
- Any step of a mechanism or any item of a list that a later sentence or a question depends on.

**Do the cut before restoring qualifiers, then re-measure.** Every restored qualifier ("echivalentă", "fizică", "mai mult") costs words; budget for them. (Pilot: the first cut reached −14.9%, the review sent back eleven restored qualifiers and glosses, and the lesson then needed 30 more words of real padding removed to stay inside the band.)

### Rhythm — this matters as much as length
In Markdown, **a single newline does not start a new paragraph** — consecutive lines merge. The old lessons write one sentence per line and render as one wall of text. In a finished lesson:
- a blank line between paragraphs; **3–5 sentences max** per paragraph, one idea each;
- a paragraph that walks through steps becomes bold lead-ins (`**Faza 1:** …`) or a short list;
- break after the claim, before the example;
- no paragraph over ~90 words (validator warns; pilot's longest: 60).

---

## 4. `<Term>` — clickable definitions (D1)

```mdx
sandwich de siliciu <Term def="Siliciu în care s-au introdus intenționat, în cantități mici, atomi străini (bor, fosfor) ca să-i schimbe felul de a conduce: tip P, dominat de goluri, sau tip N, dominat de electroni.">dopat</Term> opus
```

The definition lives **in the MDX, next to the word** — not in `glossar_terms` (that table only feeds the glossary page). The reader taps the word → a small card opens; tap outside / `Esc` closes it.

**3–5 per lesson** (validator: error outside 3–5; lab/boss lessons: none needed).

**A word qualifies when all three hold:** (a) a reader at this point of the course plausibly doesn't know it; (b) the lesson doesn't already explain it in the sentence or paragraph where it first appears; (c) knowing it changes how they read the passage.
**A word does not qualify:** common words; terms the sentence already defines ("tunelare cuantică" — the lesson explains it in-line); terms from an earlier lesson that the course has taught (unless the lesson depends on it and a reader returning after a week would stall); acronyms that are expanded right there ("DIBL (Drain-Induced Barrier Lowering)"); a term that is only decoration.

Rules:
- **First occurrence only**, never repeated; never in a heading; never inside another `<Term>`; spread them through the lesson (not all in one paragraph); at most one per paragraph.
- Wrap a single word or short phrase **as it appears in the sentence** (inflected forms are fine: `<Term …>nodurile</Term>`); no bold/markdown inside.
- `def` is **plain text, 1–2 sentences, ≤ 320 characters**, written for *this lesson* ("Zona din care câmpul a alungat purtătorii…" — it uses the lesson's own mechanism), not a dictionary entry. It must not (i) repeat the sentence it sits in, (ii) define a term with another undefined term, (iii) add a claim the lesson contradicts.
- **Always the string form `def="…"`** (the `{…}` form is dropped by `next-mdx-remote`), and **no straight double quote `"` inside** the value — use „…” or `'`.
- Works inside paragraphs, list items and table cells. A `<Term>` without `def` degrades to plain text.

**Check the earlier lessons before choosing.** "A reader at this point of the course" means: grep the lessons of the same course that come *before* this one (`grep -rli "<word>" content/courses/<slug>/`) — a word that an earlier lesson already teaches does not qualify, even if it feels technical. (Pilot: the first five terms included *dopat*, *goluri* and *zonă de dezertare*; lesson 6 teaches all three and uses *zonă de dezertare* eight times — the review caught it and they were replaced.) Also: a def may not lean on another term the reader hasn't met, and **spread the terms** — at least one in the second half, where the jargon usually is (validator warns).

Pilot terms (position in the lesson): *nodurile* (26%), *electronii minoritari* (34%), *funcția de lucru* (41%), *factorul de activitate* (50%), *cache-ul* (88%).

---

## 5. Questions — exactly 3 per lesson (D2, D3)

`lab` and `boss` lessons have **zero** questions — the game is the assessment. Everything below is for `lesson`.

### 5.1 Placement — at concept boundaries, never clustered at the end
Put `<InlineQuestion n="1" />` (**string form**, on its own line) **right after the section it tests**:

| Slot | Where | Type (usual) | What it tests |
|---|---|---|---|
| **Q1** | after the **first real concept** (≈ 20–40% of the lesson) | `true_false` or `single_choice` | a distinction the reader just met |
| **Q2** | after the **main mechanism** (≈ 40–70%) | `fill_blank`, `ordering` or `match_pairs` | the mechanism itself — a sequence, a mapping, the missing term |
| **Q3** | second half (≈ 50–95%), **right after the last concept it tests**, before the wrap-up | `short_answer`, or a *hard* `single_choice` | applying the idea to a new case |

The validator enforces: every question has exactly one anchor in the string form, in order, no orphans; **no two questions closer than 10% of the lesson** (error); warnings if Q1 > 45%, Q2 outside 30–75%, Q3 < 50%. **These spacing numbers are deliberately loose — do not "fix" them back to something stricter.** An earlier draft used 12% / Q3 ≥ 60%. In the pilot the mechanism ends at 47% and the power section at 58%, 11% apart; obeying the stricter numbers would have meant parking Q3 after the *next* subsection (asking about power after velocity saturation) or dragging Q2 away from the mechanism it tests. A question belongs **immediately after the concept it tests**; the percentages only exist to catch genuine clustering (two questions back-to-back, or all three at the end). So: if the validator flags a spacing or window problem, restructure only when the questions really are clustered; **never move an anchor away from its concept to satisfy a number**, and never tighten these thresholds in the script or here. If this paragraph and any other copy of the numbers disagree, this paragraph wins.

The anchor goes right after the section that *taught* the thing the question tests — not at the end of the H2 that happens to contain it (pilot: Q3 was first parked after the next subsection and the review rightly objected). Once a lesson has questions the page locks "Marchează completat" until each has been *attempted* once (right or wrong) — so anchors must exist for every question.

### 5.2 The difficulty bar — the "cover test"
A good question **cannot be answered by common sense plus the question's own wording**. Write it, then cover the lesson and ask: could a smart reader who skipped the lesson get it? If yes, rewrite.
- Ask about **a case, not a definition**: a scenario with numbers, "what happens if…", "which of these would break". Definition recall ("Ce este X?") is the weakest form.
- Don't echo a heading or a bold term verbatim — the answer must not be findable by Ctrl-F. **The answer must not be the sentence directly above the anchor**, restated: ask about a consequence, a case with numbers, or the *interaction* of two things the lesson said apart.
- **Don't hand over the key** in the prompt: if the prompt prints the formula ("P = α·C·V²·f … V la jumătate"), anyone can do the arithmetic without the lesson. Give the case, not the formula. A good short-answer has a *trap* — a wrong answer a smart non-reader would give (pilot Q3: V halved *and* f doubled → ÷2; a reader who forgets V² says "rămâne la fel").
- **Distractors may only use concepts the reader has already met at that point** (a distractor built on something taught 60% later can't tempt anyone and reads as filler), and must not contradict a claim the lesson itself makes (pilot: an option saying the gate holds state "gratuit" collided with the lesson's own sub-threshold-leakage paragraph).
- The explanation (shown after a correct answer or after the second miss) must **teach the mechanism**, not restate the answer, and may name the confusion the wrong options stand for.

### 5.3 D3 — the grid rules for `single_choice` (all mechanical, all enforced)

1. **Exactly 3 options.** With four there is always one filler.
2. **Length parity:** the shortest option is ≥ 85% of the longest, by characters. (If the options differ by more than 15%, the long one reads as "the careful answer".)
3. **The correct answer is never the single longest option** — and don't make it the shortest every time either: put it in the *middle* of the length ranking and vary `correct_index`, or "never the longest" becomes a learnable tell across lessons. (also flagged: tied for longest, or uniquely the most words, or the correct answer in the same position in every question of the lesson).
4. **Every wrong option is a real confusion you can name.** Authoring file: `distractors[i]` = the confusion option *i* stands for (`null` at the correct index). If you can't name it, the option is filler — delete it and write another. (Validator: error on a missing/trivial note.)
5. **Banned:** "toate cele de mai sus", "niciuna dintre…", "ambele variante", "nu se poate spune"; **double negatives** (two negation words in one option: *nu / nici / fără / niciun / nimic / deloc…*); options that are **logical complements** (identical once the negation is removed: "X crește" / "X nu crește"); (review item) options that differ only by an antonym swap.
6. **Grammatical parallelism:** all options start with the same kind of word and share capitalisation and final punctuation. (Review item — the validator approximates the part of speech and asks for human judgement; justify or fix.)

Also: no absolute words in `true_false` prompts (*întotdeauna, niciodată, orice, doar…* — students learn they mean "false"); vary `correct_index` across questions; all `explanation`s ≥ ~25 characters.

### 5.4 Worked examples — the failure the owner complained about, and its fix
**The failure:** the correct answer is the longest and the most developed; two of the four options are visibly filler nobody could pick. A student answers by shape, not by knowledge.

**Example A — a definition question where length gives it away**

Before (validator: **8 errors, 2 review items**):
> Ce este tensiunea de prag (V_th) a unui MOSFET?
> A. *Tensiunea de la care, în urma formării stratului de inversie sub poartă, canalul devine conductiv și curentul poate trece între Sursă și Drenă* **(correct, 142 chars)**
> B. Tensiunea bateriei *(18)* · C. Un tip de cablu *(15)* · D. Nu are nicio legătură cu tranzistorul *(37)*

What the validator reports: `D3-1` four options · `D3-2` options differ by **89%** (142/18/15/37) · `D3-3` the correct answer is the single longest · `D3-4` ×3 no named confusion for B, C, D · `D3-5` option D has a double negative (*nu + nicio*) · review: correct has the most words; options start with different kinds of word.

After (validator: **0 rule errors**):
> Un MOSFET are V_th = 0,5 V. Aplici V_GS = 0,3 V. Ce măsori între Sursă și Drenă?
> A. Un curent proporțional cu 0,3 V, canalul fiind format pe jumătate *(65)*
> **B. Un curent foarte mic, doar scurgere sub-prag, fără canal *(56 — correct, the shortest)***
> C. Un curent maxim, fiindcă tranzistorul e deja în saturație *(57)*

`distractors`: A = "crede că canalul crește liniar cu V_GS încă de la 0 V, fără un prag net"; C = "confundă regiunea de saturație cu starea 'pornit' și ignoră pragul". What changed: a **scenario with numbers** (needs the idea of a threshold, not its wording) → three options of the same shape, each a *different real mistake*, the correct one **not** the longest, no filler, no catch-all.

**Example B — logical complements, a double negative and "toate cele de mai sus"**

Before (**9 errors**):
> Care afirmații despre BJT sunt adevărate?
> A. BJT-ul e controlat de curent · B. BJT-ul **nu** e controlat de curent · C. BJT-ul **nu** poate funcționa **fără** să fie controlat de curent · D. **Toate cele de mai sus**

`D3-5`: A and B are complements (identical once *nu* is removed — one of them *must* be true, so it's a coin flip between two); C has a double negative; D is a banned catch-all; plus 4 options, a 63% length spread, no named confusions.

After (**0 rule errors**; 50 / 50 / 51 characters, correct answer first and not the longest):
> Ce are nevoie un BJT ca să rămână deschis?
> **A. Un curent injectat permanent în stratul din mijloc** · B. O tensiune pe o poartă separată prin oxid izolator · C. O sarcină stocată într-un condensator reîmprospătat

`distractors`: B = "atribuie BJT-ului poarta izolată, adică mecanismul MOSFET-ului"; C = "amestecă tranzistorul cu celula DRAM 1T1C". The wrong options are the *neighbouring* concepts from the same lesson — a reader who mixed up BJT/MOSFET/DRAM is the one who misses it.

### 5.5 Other types — authoring notes
- **`ordering`:** 3–6 items (more is tedious on a phone), each a full short clause, unambiguous order (a real sequence from the lesson), items shuffled for the student by the app. Compared after normalisation.
- **`match_pairs`:** ≥ 3 pairs, lefts unique and rights unique.
- **`fill_blank`:** blanks are `{{1}}`, `{{2}}`… in the prompt, exactly 1..n; `blanks[i].accepted` lists every defensible spelling (matching ignores case, spacing and diacritics: `exponențial` = `exponential`).
- **`short_answer`:** a short, checkable answer (a number, a term). List the variants a student will really type. **The grader (`normalizeText` in `src/lib/inline-scoring.ts`) does exactly this:** Unicode-decompose and strip diacritics → lowercase → collapse runs of whitespace to ONE space → trim → compare for exact equality with each accepted string (also normalised). It does **not** strip punctuation or remove inner spaces: `"4 x"`, `"4x"`, `"4×"`, `"de 4 ori."` are all different strings. So list every plausible form — the bare number (`"2"`), the phrase (`"de 2 ori"`), the echo of the question (`"scade de 2 ori"`), the spelled-out number (`"doua"`), the fraction/percentage forms a correct student may use (`"1/2"`, `"0,5"`, `"50%"`, `"la jumatate"`), `"x2"`/`"2x"`/`"2 x"`/`"2×"`/`"×2"`. (The review of the pilot found its first list rejected "scade de 4 ori", "1/4", "un sfert", "4 ×".) Open-ended questions don't belong here (`essay_ai` is reserved, don't use it).
- **`true_false`:** one claim; the explanation says *why* it is true/false.

### 5.6 Authoring file — `<lesson>.questions.json` (next to the `.mdx`, same basename)
```json
{ "questions": [
  { "order": 1, "type": "single_choice",
    "concept": "what this question tests (authoring note, not seeded)",
    "content": { "prompt": "…", "options": ["…","…","…"], "correct_index": 1, "explanation": "…" },
    "distractors": ["the confusion option 1 stands for", null, "the confusion option 3 stands for"] },
  { "order": 2, "type": "ordering", "concept": "…",
    "content": { "prompt": "…", "items": ["…","…","…"], "explanation": "…" } },
  { "order": 3, "type": "short_answer", "concept": "…",
    "content": { "prompt": "…", "accepted": ["4","de 4 ori"], "explanation": "…" } }
] }
```
`content` is **exactly** the shape stored in `inline_questions.content` (see `src/lib/inline-question-schema.ts`). `concept` and `distractors` are authoring notes — kept in the repo, stripped when seeded.

---

## 6. Python editor (D4)

**Where:** only `python-inginerie-software`, `algoritmi-structuri-date` and the **numeric** parts of `matematica-ai` (≈ 52 lessons). **Never** in hardware, OS or networking lessons.

A fenced block can become runnable: ` ```python-editor … ``` ` instead of ` ```python … ``` `. Pyodide runs it in a Web Worker (NumPy and matplotlib preloaded, 10 s timeout that terminates the worker; don't rely on network, files, threads or processes).

**Make a block runnable when** all hold: it is **self-contained** (runs as pasted, no undefined names); it is **short** (≲ 25 lines); it finishes in well under 10 s and is deterministic (seed random numbers); it only needs the standard library, NumPy or matplotlib; and **the output teaches** — changing a number and re-running shows the reader something the paragraph claimed (a complexity blow-up, a shape, a gradient step).
**Leave it static when:** it is a fragment or pseudo-code; it illustrates syntax of another language or a shell command; it needs `input()`, files, network, sockets, threads, `multiprocessing`, a database, `pip install`; it is deliberately broken or an infinite loop; it is long enough to scroll; or its value is the *shape* of the code, not running it. The ~331 existing static blocks are mostly this kind — convert a handful per lesson at most, the ones the reader will actually want to poke.

> **⚠ Prerequisite not yet built.** In a lesson page, `LessonContent` passes `mode="exercise"` (editable + Run) **only for `type: exercise | project`**; for `lesson`, `lab` and `boss` a `python-editor` block renders in **display mode: read-only Monaco with a Copy button, no Run**. So until a change in `lesson-content.tsx` / `mdx-components.tsx` (e.g. a per-block `run` flag, or running in every type), D4 cannot make a block runnable in a `lesson`, nor in the planned Python labs/bosses of C4–C6. Don't convert blocks until the owner schedules that fix; report "N candidates" per lesson instead.

---

## 7. Procedure for one lesson (checklist)

1. Read the lesson fully. Note the **concepts in order**, the main mechanism, the numbers and examples (these are your *never-cut* list), and anything that looks factually wrong (verify it, then fix or report per §1).
2. Run the baseline: `node scripts/validate-questions.mjs <lesson>.mdx --stats` → record the word count.
3. **Headings:** delete the generic ones and any `# H1`/wrapper; write the new heading structure (§2) before touching prose.
4. **Cut and break paragraphs** (§3) section by section; re-run `--stats --baseline HEAD`; stop inside −15…−20%.
5. **Terms** (§4): pick 3–5, wrap, write the defs.
6. **Questions** (§5): choose the three concepts (first concept / main mechanism / application), write them in `<lesson>.questions.json`, put the anchors in the `.mdx`.
7. `node scripts/validate-questions.mjs <lesson>.mdx --stats --baseline HEAD` → **exit 0**; every REVIEW item fixed or justified in the report.
8. Re-read the finished lesson once as a student: is anything missing that a question or later section needs? Is every fact still there?
9. Report (§8). **Do not** run `questions-to-sql`, `sync-content` (without `--dry-run`), or touch the DB.

Pitfalls that burn time: `n={1}` instead of `n="1"` (silently renders nothing); a straight `"` inside `def="…"`; one sentence per line (no blank lines → still a wall); a question whose correct option is the "most careful" sentence; Term wrapping text that already defines itself; `---` rules left between every section.

---

## 8. What to report back (per lesson)

- Word count before → after and the %.
- Heading map: old → new.
- The terms (word → one-line def) and why each qualifies.
- The three questions with their `distractors` notes and where each anchor sits (% through the lesson, from the validator).
- **Cut summary:** the kinds of thing removed and any *whole sentence with a fact* removed (so the owner can audit §1).
- **Factual corrections** — every `FIX`, `SUSPECTED` and `TENSION` (§1), each with the line and how it was verified — **placeholders left** (`ANIMATION`/`TABLE`), and, for Python lessons, **runnable-block candidates**.
- The validator's final output.

---

## 9. After the agent — what the owner approves (not the agent's job)

1. Review the `.mdx` and `.questions.json` diff.
2. `node scripts/sync-content.mjs <slug> --dry-run` → expect exactly the touched lesson(s) `[content_md]` → run without `--dry-run` (content first, so the anchors exist).
3. `node scripts/questions-to-sql.mjs <lesson>.mdx` prints one guarded transaction (lesson resolved by course+order+title, refuses if the lesson already has questions, post-checks equality) → shown to the owner → run via the Supabase MCP on project `zgofeajewktwmswckgup` only.
4. Note: `inline_questions.content` — including the correct answer — is sent to the browser with the page (the server grades, but the payload is readable). Acceptable for now; a known property, not something to work around in content.

## 10. Reference: the pilot
`hardware-fizica` L7 — 2,054 → 1,742 words (−15.2%); 5 terms (see §4); 3 questions at 23% / 47% / 58%: Q1 `single_choice` (BJT vs MOSFET: why 10⁸ BJTs left open would consume far more — the options are three "Fiecare BJT…" claims, 69/71/74 characters, correct one in the middle), Q2 `match_pairs` (V_GS/V_DS situation ↔ region behaviour, deliberately not by region name), Q3 `short_answer` (V halved and f doubled → power ÷2); longest paragraph 60 words. The validator passes with 0 errors and 0 review items. It was reviewed by an independent agent before sign-off — its findings drove most of the rules marked "(pilot…)" above.
