# BLOCK 1.5 + BLOCK 2 + BLOCK 3 — Execution Plan

> Canonical execution document for the next ~70 prompts of work after Block 1.
> Created 2026-05-06 during a dedicated planning session (logged in CHANGELOG.md).

---

## Context

Block 1 (UI/UX polish, 12 prompts) shipped on 2026-04-28. The Cosmo mascot was finished ahead of schedule across Phases 1–8 (Phase 8 completed 2026-05-06) and is now a polished SVG golden retriever with 8 emotions, gaze tracking, idle animations, and bounce-synced head/body. The next phases — replacing Pixel with Cosmo, then researching the curriculum, then writing ~300 lessons — were referenced as "⏳ Waiting" in CHANGELOG but never had a dedicated execution plan.

**What the audit found.** No prior `BLOCK2-3-EXECUTION-PLAN.md` existed. `BLOCK1-EXECUTION-PLAN.md` Section 4 (lines 502–663) contained *recommendations* for a 7-course / ~200-lesson AI-focused curriculum. This plan supersedes that scope based on the user's directive: a broader **electricity → AI narrative** for Romanian non-technical users (~10–12 courses, ~300+ lessons). The user also confirmed **single-mode lessons only** (Mod Simplu / Mod Tehnic stays retired per Block 1 Prompt 1.4) and **Block 1.5 runs before Block 2** (linear sequence, not parallel).

---

## User decisions (locked)

| # | Decision | Implication |
|---|---|---|
| 1 | **Single-mode lessons** (technical only) | Block 1 retirement of Mod Simplu / Mod Tehnic stands. Block 3 writes ONE version per lesson. Archived simple-mode prose may be mined as sidebars/analogies. |
| 2 | **Electricity → AI narrative** | Broader curriculum: ~10–12 courses, ~300+ lessons. Replaces BLOCK1 Section 4 scope. |
| 3 | **Block 1.5 first, then Block 2** | Cosmo fully deployed before curriculum research starts. |

---

## Aggregate effort estimate

| Block | Prompts | Output |
|---|---|---|
| 1.5 | 4 | Cosmo deployed across 16 files; Pixel deleted; CLAUDE.md cleaned |
| 2 | 6 | Complete curriculum spine + DB migration |
| 3 | 55–65 | ~300 MDX lessons synced to DB |
| **Total** | **65–75 prompts** | Platform fully content-loaded |

---

## Block 1.5 — Cosmo Integration (4 prompts)

### Files affected

16 references to the old `PixelMascot` (audited 2026-05-06):

1. `src/components/mascot/pixel-mascot.tsx` — **delete** after migration
2. `src/components/mascot/mascot-celebration-overlay.tsx`
3. `src/components/course/ai-coach-chat.tsx`
4. `src/components/course/lesson-page-client.tsx`
5. `src/components/course/lesson-gate.tsx`
6. `src/components/dashboard/absence-mascot.tsx`
7. `src/components/onboarding/step-welcome.tsx`
8. `src/components/landing/landing-page.tsx`
9. `src/components/pricing/pricing-cards.tsx`
10. `src/components/minigame/minigame-modal.tsx`
11. `src/components/minigame/minigame-result-screen.tsx`
12. `src/components/gamification/level-up-toast.tsx`
13. `src/components/gamification/streak-toast.tsx`
14. `src/app/globals.css` — verify (likely color refs only, may be no-op)
15. `src/app/pricing/success/page.tsx`
16. `src/app/pricing/cancel/page.tsx`

**Reuse:** `src/components/mascot/cosmo-mascot.tsx` already exposes the `CosmoMascot` API (props: `emotion`, `size`, `className`, `enableIdleAnimations`, `enableInteraction`). PixelMascot had a similar prop shape — most call sites should swap with minimal edits.

### Sub-prompts

#### Prompt 1.5.1 — Audit + emotion-mapping spec

- Run a definitive grep audit of every `PixelMascot` reference, `<PixelMascot>` JSX usage, and `pixel-mascot` import — confirm the 16-file list and surface anything missed.
- Produce an **emotion mapping table** per call site, using the user's directional examples as the anchor:

| Site | Cosmo emotion | Notes |
|---|---|---|
| `ai-coach-chat.tsx` | `thinking` while streaming, `encouraging` at rest | Wire to `useChat` `isLoading` state |
| `lesson-page-client.tsx` | `encouraging` | Lesson reading mode |
| `lesson-gate.tsx` | `thinking` (question) → `celebrating` (pass) → `encouraging` (retry) | State-driven |
| `absence-mascot.tsx` (dashboard) | `sleeping` (>3 days) → `sad` (>7 days) → `waving` (return) | Conditional |
| `onboarding/step-welcome.tsx` | `waving` | First impression |
| `landing-page.tsx` | `happy` (idle), `waving` on hero entrance | |
| `pricing-cards.tsx` | `happy` | |
| `minigame-modal.tsx` | `excited` | Pre-game energy |
| `minigame-result-screen.tsx` | `celebrating` (win) / `encouraging` (loss) | |
| `level-up-toast.tsx` | `celebrating` | |
| `streak-toast.tsx` | `excited` | |
| `pricing/success/page.tsx` | `celebrating` | |
| `pricing/cancel/page.tsx` | `encouraging` | "Hai să mai vorbim" |
| `mascot-celebration-overlay.tsx` | Already accepts emotion via prop — verify it forwards correctly to `CosmoMascot` |

Output: `devpath-docs/cosmo-integration-spec.md` containing the table and any prop-shape diffs between PixelMascot and CosmoMascot.

#### Prompt 1.5.2 — Batch 1 swap-in (8 stateless files)

Replace imports + JSX in: landing, pricing-cards, pricing/success, pricing/cancel, onboarding/step-welcome, minigame-modal, minigame-result-screen, mascot-celebration-overlay. Verify TypeScript clean.

#### Prompt 1.5.3 — Batch 2 swap-in (7 stateful files + Pixel deletion)

Replace the remaining 7 stateful sites (ai-coach-chat, lesson-page-client, lesson-gate, absence-mascot, level-up-toast, streak-toast, globals.css). Wire emotion-state logic where needed (e.g., AI Coach `isLoading → thinking`). Then **delete** `src/components/mascot/pixel-mascot.tsx`. Verify TypeScript clean. Run lint.

#### Prompt 1.5.4 — End-to-end QA + CLAUDE.md update

- Visit every page in `npm run dev` and confirm Cosmo renders correctly with the right emotion.
- Confirm no console errors, no missing `<PixelMascot>` references.
- Update `CLAUDE.md`: add a Cosmo deployment-sites table (the stale Dual Content Modes section was removed in this planning session, see CHANGELOG).
- Update CHANGELOG with Block 1.5 closeout.

---

## Block 2 — Curriculum Research (6 prompts)

### Course backbone (locked direction — to be refined in 2.1)

11-course progression, total ~280–330 lessons. Each course has 3–5 modules; each module has 5–10 lessons.

| # | Course (Romanian title) | English gloss | Est. lessons |
|---|---|---|---|
| 1 | Cum funcționează un computer | How a computer works (electricity → CPU) | 25–30 |
| 2 | Programare pentru începători | Programming basics (Python or JS) | 30–35 |
| 3 | Internet și Web | Internet & web fundamentals | 20–25 |
| 4 | Date și baze de date | Data & databases | 20–25 |
| 5 | Statistică și probabilități pentru AI | Stats & probability for AI | 25–30 |
| 6 | Machine Learning — Fundamente | ML fundamentals | 30–35 |
| 7 | Deep Learning | Neural networks, CNNs, RNNs | 25–30 |
| 8 | AI Modern (Transformers & LLMs) | Modern AI: transformers, GPT | 25–30 |
| 9 | Prompt Engineering | Prompts, chain-of-thought, RAG | 20–25 |
| 10 | AI Engineering Aplicat | APIs, tool use, deployment | 25–30 |
| 11 | Etică & Viitor AI | Ethics, alignment, regulation | 15–20 |

**Reuse:** existing `content/courses/ai-fundamentals/` and `content/courses/prompt-engineering-practic/` MDX files become the seed content for courses 6–9. Existing rows in `public.courses` will be re-numbered/re-slugged via Supabase MCP migration (one prompt's worth of SQL).

### Sub-prompts

- **2.1 — Lock course backbone**: confirm the 11-course list, set Romanian titles, slugs, target lesson counts, sequence, and difficulty curve (1–5). Output: `devpath-docs/curriculum/curriculum-spine.md`.
- **2.2 — Module breakdown courses 1–4** (foundations): 3–5 modules per course with 1-line descriptions. Output: `devpath-docs/curriculum/01-computer.md` through `04-data.md`.
- **2.3 — Module breakdown courses 5–8** (math + ML + DL + transformers): same shape.
- **2.4 — Module breakdown courses 9–11** (prompts, AI eng, ethics).
- **2.5 — Lesson taxonomy + per-lesson 1-liners**: for every module, list every lesson with title, type (`theory|example|quiz|exercise|project|flashcard`), difficulty, and a 1-sentence "what this lesson teaches". This is the deliverable from which Block 3 writes.
- **2.6 — Cross-course prerequisites + DB migration**: prerequisite map (lesson X requires lesson Y), then a Supabase migration to insert/update `public.courses` and `public.lessons` rows so DB matches the spine. **Show SQL first, wait for approval per CLAUDE.md rules.**

---

## Block 3 — Lesson Content Writing (~55–65 prompts)

### Lesson template (locked in 3.1)

Each `.mdx` lesson has:
- Frontmatter: `title`, `description`, `order`, `type` (theory|quiz|exercise|project), `moduleId`, `difficulty` (1–5)
- Hook: analogy callout (mined from archived simple-mode files where relevant)
- Theory: 600–1200 words, plain Romanian, no jargon without definition
- Code/example block (where applicable) — uses existing `code-editor`, `quiz-block`, `neural-network-viz` MDX components
- Quiz: 3–5 questions OR 1 exercise/project
- "Next:" pointer to the next lesson via slug link

**Custom MDX components reused:** `src/components/course/code-editor.tsx`, `quiz-block.tsx`, `lesson-content.tsx` (renderer + custom-component dispatch). Sync to DB via existing `src/app/(dashboard)/courses/sync-action.ts`.

### Style guide (locked in 3.1)

- Romanian-only (CLAUDE.md rule: "Platform is Romanian-only")
- 2nd person ("tu", "să-ți imaginezi…") — friendly, never condescending
- Every new technical term gets a parenthetical English equivalent the first time: "rețea neuronală (neural network)"
- Each lesson opens with a real-world analogy before any abstraction
- Code samples must pass `npm run lint`

### Sub-prompts

- **3.1 — Lesson template + style guide** (1 prompt): write `devpath-docs/lesson-template.mdx` and `devpath-docs/lesson-style-guide.md`. Author 1 reference lesson end-to-end as the canonical example.
- **3.2 → 3.12 — One sub-block per course**:
  - **3.2 (Course 1, ~28 lessons)** — 5 prompts × 5–6 lessons each
  - **3.3 (Course 2, ~32 lessons)** — 6 prompts
  - **3.4 (Course 3, ~22 lessons)** — 4 prompts
  - **3.5 (Course 4, ~22 lessons)** — 4 prompts
  - **3.6 (Course 5, ~28 lessons)** — 5 prompts
  - **3.7 (Course 6, ~32 lessons, includes seed AI Fundamentals merge)** — 6 prompts
  - **3.8 (Course 7, ~28 lessons)** — 5 prompts
  - **3.9 (Course 8, ~28 lessons)** — 5 prompts
  - **3.10 (Course 9, ~22 lessons, includes seed Prompt Engineering merge)** — 4 prompts
  - **3.11 (Course 10, ~28 lessons)** — 5 prompts
  - **3.12 (Course 11, ~18 lessons)** — 3 prompts
- **3.13 — Final QA + DB sync** (1–2 prompts): visual lesson-by-lesson sweep, sync MDX → DB via `sync-action.ts`, validate `quiz_questions` rows match each lesson's quiz, fix any frontmatter errors.

### Batching rule

Per prompt session, write **5–6 lessons** of similar type from the same module. Mixing modules within a single session causes context drift; mixing lesson types (theory + project + quiz) is fine since they share frontmatter and the same MDX component vocabulary.

---

## Verification (per block)

### After Block 1.5

- `npx tsc --noEmit` clean
- `npm run lint` clean (no new errors)
- `npm run dev` — visit every site in the 16-file list, confirm Cosmo renders with the spec'd emotion, confirm no console errors
- `grep -ri "PixelMascot\|pixel-mascot"` returns ZERO matches in `src/`
- `src/components/mascot/pixel-mascot.tsx` does not exist
- CLAUDE.md no longer contains "Mod Simplu" / "Mod Tehnic" sections

### After Block 2

- `devpath-docs/curriculum/` contains 11 course MD files + `curriculum-spine.md`
- Every lesson in the spine has a unique slug, type, difficulty, prerequisite
- Supabase `public.courses` row count = 11; `public.lessons` row count matches spine total
- Cross-references resolve (no orphan slugs)

### After Block 3

- Every lesson row in `public.lessons` has a non-null `content_md`
- Every lesson MDX file lints clean
- `npm run dev` — sample-walk through every course, every lesson loads without errors
- All `quiz_questions` rows exist for lessons of `type=quiz`
- Bundle size on `/courses/[courseSlug]/[lessonId]` page does not regress >10 kB vs current

---

## Critical files to read at each block start

- **Block 1.5 start**: `src/components/mascot/cosmo-mascot.tsx` (the API), `src/components/mascot/pixel-mascot.tsx` (Pixel's API for prop-mapping)
- **Block 2 start**: `BLOCK1-EXECUTION-PLAN.md` Section 4 (lines 502–663), `schema.sql` `public.courses` + `public.lessons` definitions, existing `content/courses/ai-fundamentals/` directory
- **Block 3 start**: `src/components/course/lesson-content.tsx` (MDX renderer + custom-component dispatch), `src/app/(dashboard)/courses/sync-action.ts` (sync path), `devpath-docs/lesson-template.mdx` (after 3.1)

---

## Risks + mitigations

| Risk | Mitigation |
|---|---|
| Cosmo API mismatch with Pixel call sites | Prompt 1.5.1 produces a per-call-site emotion-mapping spec BEFORE any code changes — surface diffs early |
| Curriculum scope creep (11 courses → 15) | Block 2 locks the spine in 2.1; subsequent prompts only fill it in, no adding courses |
| Block 3 lesson drift (tone, length) | 3.1 ships a canonical reference lesson + style guide; every subsequent prompt opens by re-reading these |
| Bundle bloat from MDX growth | Verify after every 50 lessons; lazy-load custom components per lesson |
| DB migration mistakes during 2.6 | CLAUDE.md rule: show SQL first, wait for approval. No autonomous schema changes. |

---

## Out of scope (not in this plan)

- Feature 1 (Pyodide Python execution), Feature 2 (Adaptive AI Quiz), Feature 3 (Neural Network Visualizer) — separate roadmap, will be invoked from individual lessons in Block 3 where useful but no dedicated phase here
- Internationalization (next-intl is removed; platform is Romanian-only)
- Production deployment (per CLAUDE.md, no deployment yet)
- Marketing / SEO pages outside the 16 Pixel sites
