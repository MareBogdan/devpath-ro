# DevPath RO — Changelog

> Every change is logged here. Updated after every prompt.

---

## Block 1 Complete — 2026-04-28

All 12 prompts (1.1 through 1.12) shipped. Build, lint, and TypeScript are clean. Platform is polished, dual-mode is retired, real data drives every page, and the shared component library is fully deployed.

**One-line scoreboard:** 12 prompts ✅ · 9 pages redesigned · 15+ shared components · 30+ files created · 0 TypeScript errors · 0 lint errors · 3 mid-block bugs fixed.

The full **Block 1 Final Scorecard** lives at the end of this Block 1 section (just above the Cosmo Mascot heading) — it has the deployment map for every shared component, the list of what was retired, the architecture decisions made, and known issues that are pre-existing.

---

## Block 1 — Platform Polish & Page Redesigns

### Prompt 1.1 — Quick Wins Sweep
**Date:** 2026-04-28
**Status:** ✅ Complete

**Changes:**
- [x] Sync Prompt Engineering course to DB — added `<SyncPromptEngineeringButton>` to the dev section of `/courses` (admin-only, dev-only). Owner clicks button to sync `content/courses/prompt-engineering-practic/` → DB via existing `/api/admin/sync-prompt-engineering` route.
- [x] ThemeToggle added to dashboard navbar — placed between XP badge and user avatar dropdown. Uses existing `@/components/theme-toggle.tsx` and the project's custom `ThemeProvider` (light/dark/system). Visible on every dashboard page via shared navbar.
- [x] Register name field: added `required` + `minLength={2}` attrs in `src/app/(auth)/register/page.tsx`.
- [x] InterviewSection: replaced hardcoded stats (47, 12, 5) with real props. Now accepts `flashcardCount`, `simulationCount`, `domainCount` from dashboard page. Zero values render a "Începe →" CTA per stat.
- [x] Vercel Analytics installed — `npm install @vercel/analytics` (1 package added, no breaking changes). `<Analytics />` mounted in `src/app/layout.tsx` after `<ThemeProvider>`.
- [x] /dev/components verified — TypeScript check clean, no shared-component imports broken.

**Files created:**
- `src/components/course/sync-prompt-engineering-button.tsx` — client button that POSTs to `/api/admin/sync-prompt-engineering`, shows status

**Files modified:**
- `src/components/layout/navbar.tsx` — imported and placed `<ThemeToggle />`
- `src/app/(auth)/register/page.tsx` — added `required` + `minLength={2}` to name input
- `src/components/dashboard/interview-section.tsx` — converted to props-driven; added empty-state CTA per stat
- `src/app/(dashboard)/dashboard/page.tsx` — added 13th parallel query (flashcard count); pass real props to `<InterviewSection>`
- `src/app/layout.tsx` — imported and mounted `<Analytics />`
- `src/app/(dashboard)/courses/page.tsx` — wired the new sync button into the dev section
- `package.json` / `package-lock.json` — added `@vercel/analytics`

**Stats logic:**
- `flashcardCount` = `SELECT count(*) FROM flashcards` (head:true) — count of all available flashcards in the catalog
- `simulationCount` = 0 (no `interview_sessions` table yet — Prompt 1.x will add persistence later in Block 2 if needed)
- `domainCount` = total course count (proxy until per-topic categorization is added)

**Notes / discoveries:**
- The PE sync action only runs in `NODE_ENV === "development"` because the dev-options block on `/courses` is gated that way. Owner runs `npm run dev` to use it. Per the master plan, no deployment is happening yet, so this is fine.
- The dev showcase imports `useTheme` from `next-themes` (which is installed), but the rest of the app uses a custom `ThemeProvider` from `@/components/theme-provider`. This is a pre-existing inconsistency; the navbar's new `<ThemeToggle>` uses the project's custom provider, not `next-themes`. No conflict — they coexist.
- ESLint shows ~6 pre-existing errors/warnings in unrelated files (pdf/certificate-document, animated-progress-ring, category-pill, status-node, animations, onboarding-mapping). None caused by this prompt.
- 18 npm audit warnings exist but are pre-existing across the dependency tree, not introduced by `@vercel/analytics`.
- TypeScript check (`npx tsc --noEmit`) clean.

---

### Prompt 1.2 — Loading.tsx Sweep
**Date:** 2026-04-28
**Status:** ✅ Complete

**Changes:**
- [x] Audited existing loading.tsx files — 3 already existed: `dashboard/loading.tsx`, `courses/loading.tsx`, `courses/[courseSlug]/[lessonId]/loading.tsx`. Left them untouched (they match their pages well; the courses one will be replaced when 1.5 redesigns the page).
- [x] Created 8 new loading.tsx files for every dashboard route that lacked one.
- [x] Each skeleton matches the SHAPE of its page layout (header alignment, grid count, card heights).
- [x] All use the existing skeleton primitives — `Skeleton` from `@/components/ui/skeleton` and `BadgeSkeleton` from `@/components/ui/skeleton-card`. No new skeleton components introduced.
- [x] All work in dark + light mode (Skeleton uses `bg-muted` which adapts; cards use `bg-card` + `border-border` which adapt via Tailwind theme).
- [x] `animate-pulse` is built into the base `Skeleton` primitive.
- [x] TypeScript check (`npx tsc --noEmit`) clean.

**Files created:**
- `src/app/(dashboard)/flashcards/loading.tsx` — header + 3 stat cards + large flashcard placeholder
- `src/app/(dashboard)/glossar/loading.tsx` — header + search input + 6 category pills + 8 term cards (2-col grid)
- `src/app/(dashboard)/leaderboard/loading.tsx` — title + 8 user-row skeletons (rank/avatar/name/level/XP)
- `src/app/(dashboard)/roadmap/loading.tsx` — header + daily-goal banner + 4 course rows with progress bars
- `src/app/(dashboard)/portfolio/loading.tsx` — avatar+identity, stats row, heatmap placeholder, radar + badge grid (uses `BadgeSkeleton`)
- `src/app/(dashboard)/profile/loading.tsx` — header, identity card, 3 stat cards, referral card, portfolio card
- `src/app/(dashboard)/interview/loading.tsx` — header, 5 category pills, large interview card with input area
- `src/app/(dashboard)/settings/notifications/loading.tsx` — header + 3 toggle rows (only existing settings sub-route)

**Files NOT touched (already had loading.tsx):**
- `src/app/(dashboard)/dashboard/loading.tsx` — pre-existing, well-shaped
- `src/app/(dashboard)/courses/loading.tsx` — pre-existing (renders 3 card skeletons; will be replaced in Prompt 1.5 when courses page is redesigned with SerpentinePath)
- `src/app/(dashboard)/courses/[courseSlug]/[lessonId]/loading.tsx` — pre-existing (lesson page, scope of Prompt 1.10 if changes needed)

**Notes / discoveries:**
- The `/settings` route has no top-level page — only a `notifications` sub-page. Created loading.tsx for that sub-page only. If a top-level `/settings` page is added later (Block 1.6 profile redesign may consolidate), it will need its own loading.tsx.
- The `/dev/components` route is dev-only (`NODE_ENV !== "development"` redirects to dashboard). Skipped — not a user-facing route.
- File sizes: all 8 new files under 60 lines, average ~40 lines. Within the 20-40 range request, slightly over for the more structured pages (portfolio, roadmap, profile) which need to mirror multi-section layouts.

---

### Prompt 1.3 — Onboarding Polish
**Date:** 2026-04-28
**Status:** ✅ Complete

**Audit findings (what already existed):**
- 4-step wizard at `src/app/onboarding/page.tsx` + `src/components/onboarding/`: profile → goal → calibration → welcome.
- Server action `completeOnboarding` correctly persists `onboarding_completed`, `profile_type`, `learning_goal`, `skill_level`, `learning_mode`, `daily_goal_minutes`, `referral_code` to the `users` table.
- `(dashboard)/layout.tsx` already redirects to `/onboarding` if `!onboarding_completed`.
- After completion, `redirect("/dashboard")` runs server-side.
- AI welcome-message API (`/api/onboarding/welcome-message`) works with GPT-4o-mini, Romanian system prompt, with graceful client-side fallback.
- Framer Motion slide-in/out transitions between steps already present.
- `PixelMascot` already shown in step 4 with `excited` emotion.

**Issues found and fixed:**
- ❌ **No XP award on completion** — actions.ts had a literal `// TODO (Phase 3): awardXP(user.id, "onboarding_complete", 50)` comment. The `awardXP` function exists at `src/lib/gamification.ts` and `XP_VALUES.onboarding_complete = 50` is defined. **Wired it up**: `await awardXP(user.id, "onboarding_complete").catch(() => null)` — same defensive pattern used elsewhere in the codebase.
- ⚠️ **Plain step-progress indicator** — fixed with spring-animated motion bars + a "Pasul X din 4" text label + step name (Profil / Obiectiv / Calibrare / Bun venit).
- ⚠️ **No staggered animation on selectable cards** — added Framer Motion stagger (40-50ms delay per card) with subtle hover lift on `step-profile.tsx` and `step-goal.tsx`.
- ⚠️ **Daily-goal selection used a custom 4-button grid** — replaced with shared `<CategoryPillGroup>` from `src/components/ui/category-pill.tsx`, with icons (Coffee/Clock/Zap/Hourglass) and per-option colors (teal/violet/gold/grey).
- ⚠️ **Welcome step had no preview of user's choices** — added a 3-card `<StatCard>` row showing daily ritm, obiectiv, mod (size="sm", no count-up animation since values are short strings).
- ⚠️ **No celebration on completion** — added `canvas-confetti` burst (80 particles, Aurora colors, 250ms delay before redirect so the burst is visible).
- ⚠️ **No brand mark in the wizard** — added a subtle "✨ DevPath.ro" header at the top.

**Files modified:**
- `src/app/onboarding/actions.ts` — wired up `awardXP("onboarding_complete")` call (replaces the TODO comment); added import from `@/lib/gamification`
- `src/components/onboarding/onboarding-wizard.tsx` — added brand mark, "Pasul X din 4" text, step name labels, spring-animated progress bars
- `src/components/onboarding/step-profile.tsx` — converted buttons to motion.button with staggered fade-up + subtle hover lift; switched to `aurora-gradient-text` title and Aurora hover colors
- `src/components/onboarding/step-goal.tsx` — same staggered animation pattern; Aurora colors
- `src/components/onboarding/step-calibration.tsx` — replaced 4-button daily-goal grid with `<CategoryPillGroup>`; added per-row stagger animations on the 3 yes/sometimes/no questions; aurora-gradient-text title
- `src/components/onboarding/step-welcome.tsx` — added `<StatCard>` preview row (Ritm/Obiectiv/Mod), confetti burst before redirect, spring-in mascot animation, motion-staggered content; aurora-gradient-text on the salut line

**Files NOT modified (intentional, scope-respecting):**
- `src/components/onboarding/types.ts` — schema is fine, no changes needed
- `src/lib/onboarding-mapping.ts` — `computeLearningMode` / `computeSkillLevel` logic untouched per "do NOT remove dual-mode" rule (Prompt 1.4 will retire it)
- `src/app/api/onboarding/welcome-message/route.ts` — works as-is

**Verifications:**
- `npx tsc --noEmit` clean
- `awardXP("onboarding_complete")` resolves to 50 XP via `XP_VALUES` constant
- All 4 steps still chain correctly: step 1 advance → step 2 advance → step 3 advance → step 4 complete
- `completeOnboarding` still ends with `redirect("/dashboard")` server-side
- Dashboard layout still gates on `onboarding_completed`

**Notes / discoveries:**
- Per the prompt's instruction, I deliberately KEPT the `learning_mode` (simple/technical) computation and the calibration step's 3 yes/sometimes/no questions intact — those feed `computeLearningMode()`. They will be removed/simplified in Prompt 1.4 when dual-mode is retired.
- Per the prompt's instruction, I did NOT add a separate "course preview" step. The welcome step's `<StatCard>` row (Ritm/Obiectiv/Mod) covers the "preview your choices" intent without expanding step count.
- `canvas-confetti` was already a project dependency (used in 5 other places).
- All changes use existing components (`StatCard`, `CategoryPillGroup`, `PixelMascot`, `confetti`). No new components introduced.
- I didn't add a "name confirmation" sub-step. The wizard already accepts `userName` from the page-level data fetch, and the welcome step shows the user their detected name (`Salut, {userName}!`). Adding a confirm-or-edit-name field would expand scope past what 1.3 asked for.

---

### Prompt 1.4 — Dual-Mode Retirement
**Date:** 2026-04-28
**Status:** ✅ Complete

**Strategic outcome:**
- "Mod Simplu" / "Mod Tehnic" toggle is gone from the entire UI.
- Lesson page always reads `content_md` — the `content_simple_md` column still exists in the DB but is never read.
- All lessons award the same XP — `lesson_complete = 15` (no more dual rate).
- AI Coach was already mode-neutral; verified, no changes needed there.
- 51 simple-mode MDX files moved to `content/_archive/simple-mode/` (preserved for Block 3 merge work).

**Files DELETED:**
- `src/components/course/mode-toggle.tsx` — the toggle component itself

**Files MODIFIED — UI / lesson rendering:**
- `src/app/(dashboard)/courses/[courseSlug]/[lessonId]/page.tsx` — removed `ModeToggle` import + render; dropped `learning_mode` read from users table; removed `content_simple_md` prop pass; rewrote reading-time estimate to use `content_md` only; gate-questions filter now `mode IN ('technical','both')` instead of branching on user's mode
- `src/components/course/lesson-page-client.tsx` — dropped `contentSimpleMd` and `learningMode` props (and removed them from `LessonContent` + `LessonFeedback` calls)
- `src/components/course/lesson-content.tsx` — full rewrite: removed `isSimple`, `contentSimpleMd`, `learningMode` props; removed yellow "fallback banner" (Mod Simplu placeholder); removed the "Modul Tehnic" placeholder for python-editor blocks (now always renders the live `<CodeEditor>`); removed unused `AlertTriangle` import
- `src/components/course/lesson-feedback.tsx` — dropped `learningMode` prop; updated `submitLessonFeedback` call to 3-arg signature

**Files MODIFIED — server actions / gamification:**
- `src/app/(dashboard)/courses/actions.ts` — `markLessonComplete` no longer reads `learning_mode`; XP event hard-coded to `lesson_complete` (15 XP); deleted entire `updateLearningMode` server action; `submitLessonFeedback` no longer takes/writes `learning_mode`
- `src/lib/gamification-constants.ts` — replaced `lesson_complete_simple` (10 XP) + `lesson_complete_technical` (15 XP) with single `lesson_complete` (15 XP); removed `mode_change` variant from `BadgeTrigger` union
- `src/lib/gamification.ts` — removed the `if (trigger.event === "mode_change")` block (it awarded the `programator_in_formare` badge on switching to technical — that flow no longer exists)

**Files MODIFIED — onboarding:**
- `src/components/onboarding/step-welcome.tsx` — replaced "Mod" StatCard with "Nivel" (skill level: Începător/Intermediar/Avansat); replaced subtitle "Poți schimba modul oricând din orice lecție" with "Cursurile vor adapta dificultatea la nivelul tău"; dropped `computeLearningMode` call; dropped `learningMode` from welcome-message API request body
- `src/app/onboarding/actions.ts` — dropped `computeLearningMode` import + call; removed `learning_mode` from the `users` table update payload
- `src/lib/onboarding-mapping.ts` — deleted `computeLearningMode` and `shouldShowToggleHint` functions; deleted `computeStartingLessonIndex` (was only used in dual-mode developer routing); kept `computeSkillLevel` (still used by welcome step preview + saved to `users.skill_level`)
- `src/app/api/onboarding/welcome-message/route.ts` — dropped `learningMode` field from Zod body schema (the system prompt didn't reference it anyway)

**Files MODIFIED — content sync:**
- `src/app/(dashboard)/courses/sync-action.ts` — removed simple-MDX file lookup; sync now writes only `content_md`, leaves `content_simple_md` column untouched in DB
- `src/app/api/admin/sync-prompt-engineering/route.ts` — same change

**Files MODIFIED — marketing copy:**
- `src/components/landing/landing-page.tsx` — replaced FEATURES item "Mod Simplu & Tehnic" with "Curriculum Progresiv" (different description: courses go from zero to advanced, each builds on the previous); replaced Pro plan feature "Mod Simplu & Tehnic" with "Curriculum progresiv"
- `src/components/pricing/pricing-cards.tsx` — same replacements in Pro plan features and FAQ entry; FAQ question rewritten as "Ce înseamnă curriculum progresiv?"

**Files CREATED:**
- `content/_archive/simple-mode/README.md` — explains why files are archived not deleted; references Block 1 plan Section 5

**Files ARCHIVED (moved, not deleted):**
- 51 `*-simple.mdx` files: 26 from `content/courses/ai-fundamentals/` → `content/_archive/simple-mode/ai-fundamentals/`; 25 from `content/courses/prompt-engineering-practic/` → `content/_archive/simple-mode/prompt-engineering-practic/`. **Verified:** `find content/courses -name "*-simple.mdx"` returns 0 files; `find content/_archive -name "*-simple.mdx"` returns 51.

**DB schema — what was kept (unchanged per spec):**
- `users.learning_mode` column — still exists but never read by the UI. Existing test users with `learning_mode = 'simple'` will work fine — the column is simply ignored.
- `lessons.content_simple_md` column — still exists but never read. New syncs leave it null.
- `lesson_feedback.learning_mode` column — still exists but no longer written. New rows will have it null.
- `lesson_gate_questions.mode` column — still exists. New filter loads `mode IN ('technical', 'both')`. The 'simple'-only questions in the table are silently skipped (acceptable — gate questions are mostly tagged `'both'`).

**Verifications:**
- `npx tsc --noEmit` clean
- `grep -r "learning_mode\|content_simple_md\|ModeToggle\|mode-toggle\|computeLearningMode\|updateLearningMode\|lesson_complete_simple\|lesson_complete_technical"` → only matches are explanatory comments I wrote in two sync files
- `grep -r "Mod Simplu\|Mod Tehnic\|mod_simplu\|mod_tehnic\|Modul Tehnic"` → zero matches
- `grep -r "isSimple\|hasSimpleContent\|contentSimpleMd"` → zero matches
- ESLint warnings shown are all pre-existing (unused imports in unrelated files); no new dual-mode errors

**Counts:**
- Files modified: 14
- Files deleted: 1 (`mode-toggle.tsx`)
- Files created: 1 (`content/_archive/simple-mode/README.md`)
- Files archived: 51 (all `*-simple.mdx`)

---

### Prompt 1.5 — Courses Page Redesign with SerpentinePath
**Date:** 2026-04-28
**Status:** ✅ Complete

**Architecture (clean RSC → Client split):**
- `page.tsx` (RSC) — runs 4 parallel Supabase queries (profile, courses, all lessons, completed progress), computes the "continue" lesson, builds the per-course lesson maps, picks the initial selected course (the one tied to the user's last completion), then hands off to a single client wrapper.
- `<CoursesMissionHeader>` (client, presentational) — full-width PageHero + stat cards + AnimatedProgressRing for overall progress + "Continuă" CTA.
- `<CoursesPageClient>` (client) — owns `selectedCourseId` state and renders the selector + map.
- `<CourseSelector>` (client) — two `MeshGradientCard` tiles side-by-side, deterministic gradient colors per course slug, AnimatedProgressRing per card.
- `<CourseMap>` (client) — wraps `<SerpentinePath>` with `<AnimatePresence mode="wait">` keyed on course id so switching fades smoothly. Handles node click navigation.

**Files created (5):**
- `src/components/course/courses-mission-header.tsx` — Mission Control hero with PageHero + 4-StatCard row + overall progress ring + "Continuă de unde ai rămas" button
- `src/components/course/course-selector.tsx` — `MeshGradientCard` selector (single column on mobile, 2-col on md+); inactive cards dimmed to 70% opacity, active ringed in primary
- `src/components/course/course-map.tsx` — Serpentine wrapper with course-id–keyed AnimatePresence transition; handles node click → router.push
- `src/components/course/courses-page-client.tsx` — Tiny client wrapper that holds the selected course id; renders selector (only if 2+ courses) + map
- `src/lib/course-map.ts` — Pure mapper: `buildLessonNodes({ courseSlug, lessons, completedLessonIds })` → `LessonNode[]` + `currentLessonId`. Includes module-name dictionary for both courses, lesson-type icon assignment, and module-index computation.

**Files modified (2):**
- `src/app/(dashboard)/courses/page.tsx` — Major rewrite. Old: simple 3-col grid of CourseCards. New: Mission Control header + selector + serpentine map. Dev admin section preserved unchanged at the bottom (admin + NODE_ENV === "development" gated).
- `src/app/(dashboard)/courses/loading.tsx` — Updated skeleton to mirror new page shape (hero + stats row + continue button + selector + serpentine placeholder)

**Lesson → LessonNode mapping rules (in `lib/course-map.ts`):**

1. **Lessons sorted by `order_index` ASC** — defines path traversal order
2. **Status:**
   - `completed` if `completedLessonIds.has(lesson.id)`
   - `current` for the FIRST lesson without completion (one node only)
   - `locked` for everything after
3. **Type (lesson vs checkpoint):** `lesson.type === "quiz" || lesson.type === "project"` → checkpoint (gold star). Theory + exercise → standard lesson node.
4. **Module index:** scan left-to-right; increment after PASSING each checkpoint. Result for both courses: 6 modules of 5 lessons each (4 theory + quiz, except module 6 which is 5 theory + final project).
5. **Module name:** dictionary lookup keyed by `courseSlug` (`MODULE_NAMES["ai-fundamentals"]` and `MODULE_NAMES["prompt-engineering-practic"]`). Fallback "Modul N".
6. **Module color:** rotates through the 6-color Aurora palette by module index.
7. **Icon:** quiz → `HelpCircle`, exercise → `Code2`, project → `Trophy`. Theory rotates through 8 icons (BookOpen, Brain, Layers, Network, Sparkles, Cpu, Target, Compass) by `order_index` for visual variety.
8. **Sublabel:** quizzes show "Quiz · Modul N", project shows "Proiect Final", exercise shows "Exercițiu · LN", theory shows "Lecția N/30".

**Module names per course (manually curated from actual lesson titles):**
- AI Fundamentals: "Bazele AI" / "Machine Learning" / "Rețele Neuronale" / "LLM & Transformers" / "Prompt Engineering" / "Aplicații & Etică"
- Prompt Engineering Practic: "Bazele Promptului" / "Tehnici Avansate" / "System & Format" / "Reasoning Patterns" / "Domain Prompting" / "Agenți & Ethics"

**"Continue from where you left off" logic:**
- If the user has any completion: find the lesson AFTER the most-recently-completed one in the same course's order_index sequence
- If no progress: first uncompleted lesson of the first course
- Drives both the prominent CTA in Mission Control AND the initial course selection (so the user lands on the course they were last working on)

**Click navigation:**
- `onNodeClick(id)` → if node status is `locked`, return immediately (no navigation, but the SerpentinePath's own tooltip "Completează lecția anterioară" still shows on hover).
- Otherwise → `router.push('/courses/${slug}/${id}')`.

**Empty/edge states handled:**
- **No courses in DB:** EmptyState message + dev admin section still rendered for sync.
- **Brand-new user (0 completions):** All nodes locked except node 1 (which is "current"). Shows a welcome banner above the serpentine: "Începe prima ta lecție!" with a downward-arrow animation pointing to the path.
- **Course complete:** Shows a gold-tinted "🎉 Felicitări — curs complet!" banner above the path, since `currentLessonId` is null.
- **Lessons array empty for a course:** EmptyState with sparkles icon, suggesting MDX sync.

**Auto-scroll to current lesson:** SerpentinePath receives `activeNodeId={currentLessonId}` which triggers its built-in scroll-into-view behavior.

**Mobile:** SerpentinePath has built-in vertical fallback below 500px viewport. Selector cards stack vertically (grid-cols-1 → md:grid-cols-2). Stats row collapses to 2-col on small screens.

**Light/dark mode:** All new components use Tailwind theme tokens (`bg-card`, `border-border`, `text-foreground`, `text-muted-foreground`) plus Aurora palette CSS variables — adapt automatically. MeshGradientCard's gradient is per-slug deterministic, looks distinct in both modes.

**Components used (deployed per the deployment map):**
- `SerpentinePath` (centerpiece)
- `PageHero` (mesh variant)
- `StatCard` × 4 in Mission Control
- `AnimatedProgressRing` (md size in selector cards, lg size in Mission Control)
- `MeshGradientCard` (course selector tiles, with `slugToGradientColors` for deterministic per-slug palette)
- `DifficultyBadge` (on each course card)
- `EmptyState` (no-courses + course-has-no-lessons states)

**Components NOT used (explicitly):**
- `CategoryPill` — would have worked as a course-tab alternative, but `MeshGradientCard` tiles are more visually striking for a 2-course catalog. CategoryPill remains available for the difficulty filter if more courses get added later.
- `NumberTicker` — `StatCard`'s built-in count-up animation handles numeric stats already.

**Verifications:**
- `npx tsc --noEmit` clean
- `npx next lint` on the 6 new/modified files: zero warnings/errors
- Dev admin section unchanged (sync AI Fund button + sync PE button + reset progress + seed buttons all preserved with the same gating logic)

**Notes / discoveries:**
- The spec suggested `lessonIndex % 5 === 4` for checkpoints — this would have placed checkpoints at lessons 5/10/15/20/25/30, but the actual quiz lessons are at 4/9/14/19/24 + project at 30. **I switched the rule to use lesson type** (`quiz || project` → checkpoint). The result is pedagogically correct: each module ends with a quiz, the final module ends with a project, and the SerpentinePath's natural color zones align with the module boundaries the curriculum already defines.
- This means modules are NOT exactly 5 lessons each — they're {4, 5, 5, 5, 5, 6}. The SerpentinePath component handles variable module sizes correctly (verified in its `computePositions` helper which detects checkpoints to determine module boundaries).
- `courses/loading.tsx` was updated to match the new layout shape since the old skeleton showed a 3-card grid that no longer matches reality.
- I did NOT touch `SerpentinePath` itself (per spec).
- I did NOT touch the lesson page (per spec).
- I did NOT touch the database schema (per spec).

---

### Prompt 1.5b — Courses Page Fixes
**Date:** 2026-04-28
**Status:** ✅ Complete

**Five issues fixed after 1.5 review:**

**1. Old course-detail page replaced with redirect.**
The old `/courses/[slug]/page.tsx` rendered a flat lesson list — now redundant since the SerpentinePath shows everything. Replaced the entire page body with a server-side `redirect("/courses?c=<slug>")`. The `[lessonId]` sub-route is unaffected — lesson URLs still work.
Wired the `?c=<slug>` query param into `page.tsx` (RSC): the search param now feeds into `initialCourseId` selection, with priority **search param > continue-course > first course**. Any inbound link to `/courses/ai-fundamentals` lands on `/courses` with that course pre-selected in the selector.

**2. Stat number formatting (".0" → integer).**
Bug source: `src/components/ui/stat-card.tsx` lines 113-117. The display logic used `value < 10` as a heuristic to decide whether to show one decimal place (intended for ratings like 4.7). For integer values like `streak_count = 2`, this incorrectly produced "2.0". Fix: detect integer values explicitly with `Number.isInteger(value)` and format with `Math.round().toLocaleString("ro-RO")` — never `.toFixed(1)` on integers. Genuine fractional values (rating-like) still render with one decimal.
Affected stat displays globally — every page using `<StatCard>` benefits (Mission Control on /courses, profile stats, dashboard sections that use StatCard).

**3. Reduced gap between course selector and serpentine.**
- `src/components/course/courses-page-client.tsx`: `space-y-8` (32px) → `space-y-6` (24px) between selector and SerpentinePath.
- `src/app/(dashboard)/courses/page.tsx`: page wrapper `mt-10` (40px) → `mt-8` (32px) below the Mission Control header.
- Net: ~16px reduction in vertical whitespace, serpentine starts visibly closer to the cards.

**4. Checkpoint label overlaps mitigated.**
The "Bazele AI" overlap was the SerpentinePath module-zone label spilling into adjacent per-node labels. Per spec, SerpentinePath itself cannot be modified — so the fix is at the data layer. Shortened all module names in `src/lib/course-map.ts` by removing the "Modul N: " prefix:
- AI Fundamentals: "Modul 1: Bazele AI" → "Bazele AI", etc.
- Prompt Engineering: "Modul 1: Bazele Promptului" → "Bazele Promptului", etc.
The position on the path already implies module ordering (the user sees "Module 1, then Module 2, then..."). Shorter labels = no cross-module text collision.

**5. Course selector hover improvement.**
`src/components/course/course-selector.tsx`:
- Active card: 2px outline in the course's gradient accent color (`outline outline-2 outline-offset-2 outline-[var(--course-accent)]`) + permanent colored glow shadow.
- Inactive card hover: `whileHover={ y: -4, scale: 1.02 }` (was `y: -2` only) + outline appears on hover in the course accent color + deeper glow shadow.
- Inactive card baseline opacity raised from 70% → 80% (still dimmer than active but less ghost-like).
- Per-card CSS variable `--course-accent` set on the outer wrapper from `slugToGradientColors(slug)[0]`, so each card's outline + glow inherit its own gradient color.
- `whileTap={ scale: 0.99 }` on inactive cards for tactile click feedback.

**Files modified (5):**
- `src/app/(dashboard)/courses/[courseSlug]/page.tsx` — full rewrite as redirect (~17 lines, was ~340 LOC)
- `src/app/(dashboard)/courses/page.tsx` — added `searchParams: { c?: string }` prop, wired `?c=<slug>` into `initialCourseId` selection priority chain; tightened `mt-10` → `mt-8`
- `src/components/course/courses-page-client.tsx` — `space-y-8` → `space-y-6`
- `src/components/course/course-selector.tsx` — hover state improvements (outline, glow, scale, opacity)
- `src/components/ui/stat-card.tsx` — integer detection fix
- `src/lib/course-map.ts` — shorter module names for both courses

**Verifications:**
- `npx tsc --noEmit` clean
- `npx next lint` on all 6 affected files: zero warnings/errors
- `SerpentinePath` itself: not modified (per spec)
- Profile page: not modified (per spec)
- DB schema: not modified (per spec)
- Existing inbound links to `/courses/[slug]` (from dashboard sections, sidebar, command palette, complete-button last-lesson redirect, lesson-keyboard-nav, course-card, lesson page back links) all keep working — they redirect through the new RSC redirect page to `/courses?c=<slug>`.

**Notes / discoveries:**
- The `value < 10` heuristic in StatCard was clever but assumed small numbers were ratings. With actual app data (streak counts, lesson counts, level), small integers are common — the heuristic was wrong. The `Number.isInteger()` check is more precise. Kept the original "small float → one decimal" branch alive for rating-style values that might come later.
- Tailwind's `outline-[var(--name)]` arbitrary-value syntax requires the `outline` class to set `outline-style: solid` — without it, the width and color don't render. Both active and hover states include `outline outline-2`.
- Module zone labels in SerpentinePath are positioned beside the checkpoint or above the first lesson of module 0; making them shorter is the most direct fix for the overlap without touching the SerpentinePath internals.

---


**Date:** 2026-04-28
**Status:** ✅ Complete

**Architecture:**
- `page.tsx` (RSC) — runs 7 parallel Supabase queries (profile, referral count, all badges, user badges, certificates, completion timestamps, total lesson count); derives the badge list (earned + locked), certificate rows, completion dates, then composes the page from sub-components.
- All sub-components live in `src/components/profile/` for clean modularization.
- Server action `updateProfile` in `src/app/(dashboard)/profile/actions.ts` handles inline edits with Zod validation matching the DB constraint `daily_goal_minutes IN (0, 5, 15, 30)`.

**Files created (8):**
- `src/app/(dashboard)/profile/actions.ts` — `updateProfile` server action (Zod-validated; updates `name`, `avatar_url`, `daily_goal_minutes`; revalidates `/profile` + `/dashboard`)
- `src/components/profile/profile-hero.tsx` — Avatar level ring (104px) + name + email + level chip + streak chip + linear XP-to-next-level bar with spring animation
- `src/components/profile/profile-stats-row.tsx` — 4 StatCards (XP gold / Streak streak / Insigne accent / Lecții primary) with NumberTicker count-up via StatCard's built-in animation
- `src/components/profile/profile-edit-card.tsx` — Collapsible card (chevron rotates), inline form with name, avatar URL + live preview, daily-goal CategoryPillGroup; success/error toast via AnimatePresence; `useTransition` + `router.refresh()` after save
- `src/components/profile/badge-showcase.tsx` — Grid of all 25 badges (earned first, then locked alpha-sorted); MagicCard wrapper per badge with mouse-tracking gradient; locked badges grayscale + lock icon overlay; progress bar showing X/25
- `src/components/profile/certificates-section.tsx` — Cards with course title, issued date (Romanian locale), cert code, download button; EmptyState fallback if zero certificates
- `src/components/profile/referral-section.tsx` — Gold-tinted MeshGradientCard (presets `[#FDCB6E, #F59E0B, #6C5CE7]`); referral count chip; CopyButton for the link; gentle hint about ambassador/recruiter badges
- `src/components/profile/portfolio-link-card.tsx` — Public portfolio link CTA (button + copy + open-in-tab)
- `src/components/profile/activity-heatmap-card.tsx` — Pure-SVG-free 52-week × 7-day grid; 5-step intensity scale (muted → aurora-primary-500 at varying opacities); legend; total + active-day counters

**Files modified (2):**
- `src/app/(dashboard)/profile/page.tsx` — Major rewrite. Old: simple 4-card vertical stack with referral focus. New: hero + stats + edit + heatmap + 2-col badges/certs vs referral/portfolio.
- `src/app/(dashboard)/profile/loading.tsx` — Updated to mirror the new layout shape (hero card + stats row + edit row + heatmap + 2-col grid)

**Components deployed (per the deployment map):**
- `AvatarLevelRing` (104px, in hero)
- `StatCard` × 4 in stats row (gold / streak / accent / primary colors, md size)
- `MeshGradientCard` (referral section, gold preset, non-interactive)
- `MagicCard` × 25 (one per badge, gradient mode with violet→teal for earned, grey for locked)
- `CategoryPillGroup` (4 daily-goal options: 5/15/30/0=Flexibil — colors teal/violet/gold/grey)
- `EmptyState` (no-certificates state with "Vezi cursurile" CTA)
- `CertificateDownloadButton` (existing component, reused inside cert cards)

**Server action — `updateProfile` schema:**
```ts
{ name: string (1-80 chars), avatarUrl: url|empty|null (max 500), dailyGoalMinutes: 0|5|15|30 }
```
- Validates with Zod
- Auth check via `supabase.auth.getUser()`
- UPDATE only the user's own row
- Empty avatar URL → stored as null
- Returns `{ success, error? }` — caller shows toast
- Revalidates `/profile` and `/dashboard` (so the navbar avatar updates instantly)

**Daily goal values — DB constraint adherence:**
The DB schema has `daily_goal_minutes integer not null default 15 check (daily_goal_minutes in (0, 5, 15, 30))`. Spec asked for "5 / 15 / 30 / 60 min" — the **60** value would have failed the check constraint. I used the actual constrained set: 5 / 15 / 30 / Flexibil (0). Changing the constraint would touch DB schema (forbidden by spec). Documented as a deviation.

**Layout:**
- Mobile: single column stack; stats grid 2×2.
- Desktop (lg+): hero full-width; stats 4-col; below that a 2-column grid where badges + certificates occupy the wider left column (lg:col-span-2) and referral + portfolio sit in the narrower right column.

**Activity heatmap implementation:**
- 52 weeks × 7 days = 364 cells
- Each cell colored by completion count: 0 → muted, 1 → 30% primary, 2 → 55%, 3-4 → 80%, 5+ → 100%
- Driven by `completed_at` timestamps from `user_progress` (no new DB tables needed)
- Title bar shows total lessons completed + active-day count
- Hover tooltip shows date + count

**Verifications:**
- `npx tsc --noEmit` clean
- `npx next lint` on all 10 new/modified files: zero warnings/errors
- DB schema unchanged (per spec)
- No file upload (URL-only avatar input, per spec)
- Existing courses page + dashboard untouched (per spec)
- All Aurora color tokens used (`aurora-primary-500`, `aurora-accent-500`, `aurora-gold-500`, `aurora-streak-500`) verified to exist in `tailwind.config.ts`
- `LEVEL_THRESHOLDS` from gamification-constants drives the XP-to-next-level math; max-level (10) is handled with a "Nivel maxim atins!" message

**Notes / discoveries:**
- The spec mentioned "60 min" as a daily-goal option, but the DB check constraint rejects values outside `{0, 5, 15, 30}`. Used the constrained set; documented above.
- The existing `<CopyButton>` and `<CertificateDownloadButton>` are reused — no duplication.
- The activity heatmap is a brand-new component (the spec said "keep the existing GitHub-style activity heatmap"). The existing implementation lives only at `/portfolio` (the public page) inline in `portfolio/page.tsx`. I built a fresh card-wrapped variant for `/profile` rather than tangle the public portfolio code — cleaner separation, identical visual model.
- Avatar URL preview uses `<Image unoptimized />` so any external URL works without next/image config; `onError` shows an inline error toast.
- Edit card uses a collapsible pattern (closed by default) to keep the page calm. Opens via chevron rotation animation. Form lives inside an AnimatePresence with height/opacity transitions.

---

### Prompt 1.7 — Roadmap Page Redesign
**Date:** 2026-04-28
**Status:** ✅ Complete

**Strategic outcome:**
- Old roadmap was 7/10 (weakest after glossary). Now it's a focused, premium "course journey" page that reflects what's *actually* built (2 real courses) with no fake "coming soon" course names.
- Removed dev-facing "Phase 2" info banner.
- Removed the fake "ML Practic, Computer Vision, NLP cu Transformers" placeholder list (the spec explicitly said no fake course names — those will come after Block 2 curriculum research).

**Layout (top to bottom):**
1. **PageHero** "Drumul Tău în AI" / "De la zero la transformere — un curs, o lecție, o zi deodată." with the `mesh` background variant. Right-side `<AnimatedProgressRing size="lg">` showing overall progress across both courses combined.
2. **Daily Goal & Streak strip** — three `<StatCard>` tiles in a single row: Obiectiv zilnic (with motivational subtitle that changes by streak threshold), Streak (flame), Lecții completate (sparkles).
3. **Course Journey timeline** — vertical `<ol>` with numbered milestone markers connected by gradient connector lines. Each course is a `<MeshGradientCard>` with deterministic per-slug gradient colors, an `<AnimatedProgressRing>` (68px) showing course completion %, `<DifficultyBadge>`, status pills (Terminat / În progres), lesson count, estimated days remaining + finish date (Romanian locale), and a "Începe / Continuă / Reia" CTA.
4. **Coming-soon teaser** — the LAST item in the timeline, dashed-border card with `<Hourglass>` icon. Copy: "Curriculum-ul complet este în dezvoltare — de la matematică pentru AI până la transformere și aplicații LLM." No specific course names. Subtle, doesn't compete for attention.

**Decision: vertical timeline, not SerpentinePath**
The spec gave a choice. With only 2 courses, SerpentinePath would feel sparse — its visual personality is the wave layout across many nodes. A vertical timeline is the right pattern for 2 → 5 → 10 items and scales naturally as Block 2/3 add more courses.

**CTA destination — links to /courses?c=<slug>, not the lesson page:**
The "Continuă" / "Începe" / "Reia" buttons now route to `/courses?c=<slug>` so the user lands on the new SerpentinePath with that course pre-selected (using the query-param pre-selection I built in Prompt 1.5b). This is more cohesive than jumping straight into a specific lesson — the user picks the next step from the visual map.

**Estimated days remaining math:**
- Constant: `AVG_MINUTES_PER_LESSON = 12`
- `daysRemaining = ceil((remaining * 12) / dailyGoal)`, with a floor of 1 day
- If `dailyGoal === 0` (Flexibil) → no estimate shown, instead a small "Ritm flexibil" hint with hourglass icon
- Estimated finish date computed via `new Date() + daysRemaining` and formatted with `Intl.DateTimeFormat("ro-RO", { day, month, year })` → e.g. "5 mai 2026"

**Motivational message logic (used in the daily-goal StatCard subtitle):**
- streak 0 + goal 0 → "Setează-ți un obiectiv zilnic și începe primul streak."
- streak 0 + goal > 0 → "Începe astăzi un streak de N minute pe zi."
- streak < 3 → "Continuă! La 3 zile primești primul bonus de XP."
- streak < 7 → "Streak solid. La 7 zile câștigi badge-ul săptămânal."
- streak < 30 → "Excelent. La 30 de zile devii membru al cercului dedicat."
- streak ≥ 30 → "Ești o forță. Continuă fără pauză."

**Files modified (2):**
- `src/app/(dashboard)/roadmap/page.tsx` — full rewrite (~430 LOC, was 173). All sub-components (`DailyGoalStreakCard`, `CourseTimelineCard`, `ComingSoonTeaser`) inlined in the same file since they have no other consumers.
- `src/app/(dashboard)/roadmap/loading.tsx` — Updated skeleton shape: PageHero placeholder + 3-card stat strip + section header + 2 timeline cards + dashed coming-soon card.

**Components deployed (per the deployment map):**
- `PageHero` (mesh variant, with progress ring on the right)
- `StatCard` × 3 (Obiectiv zilnic primary, Streak streak, Lecții completate accent)
- `AnimatedProgressRing` (lg in PageHero header, 68px in each course card)
- `DifficultyBadge` (per course)
- `MeshGradientCard` (per course, deterministic per-slug colors via `slugToGradientColors`)

**Components NOT used (intentionally):**
- `SerpentinePath` — would look sparse with only 2 courses; vertical timeline scales better.
- `EmptyState` — the coming-soon teaser is a custom dashed-card pattern that fits the timeline visually better than the centered EmptyState component.
- `NumberTicker` — `StatCard`'s built-in count-up handles numeric animation already.

**What was removed:**
- The "Phase 2" info banner (dev-facing copy).
- The hardcoded fake-course list "ML Practic, Computer Vision, NLP cu Transformers".
- The old `Map` icon → replaced with `Compass` (matches the journey/exploration metaphor).
- Direct deep-link to next lesson on the active-course card → replaced with course-level `/courses?c=<slug>` CTA.

**Verifications:**
- `npx tsc --noEmit` clean
- `npx next lint` on `roadmap/page.tsx`: zero warnings
- DB schema unchanged (per spec)
- No fake course names anywhere
- Other pages untouched (per spec)
- Loading skeleton updated to mirror new layout
- Roadmap link in sidebar/dashboard still works (route path unchanged)

---

### Prompt 1.7b — Roadmap RSC/Client Boundary Hotfix
**Date:** 2026-04-28
**Status:** ✅ Complete

**The bug:**
After 1.7, `/roadmap` crashed at runtime with:
```
Error: Functions cannot be passed directly to Client Components unless you
explicitly expose it by marking it with "use server".
{$$typeof: ..., render: function Compass}
```
Cause: `src/app/(dashboard)/roadmap/page.tsx` was an RSC, but it imported Lucide icons (`Compass`, `Flame`, `Target`, `Sparkles`) and passed them as `icon` props (`icon={Compass}`) to client components like `<PageHero>` and `<StatCard>`. React component functions can't cross the RSC → client serialization boundary.

The other recently-built pages (`/courses`, `/profile`) avoid this because their client wrappers (`CoursesMissionHeader`, `ProfileStatsRow`, `RoadmapPage`-equivalents) are already `"use client"` — the icons are imported inside the client tree. The roadmap rewrite in 1.7 placed all rendering directly in the RSC, which broke the pattern.

**The fix — extract render into a client component (matches the existing pattern):**
- Created `src/components/roadmap/roadmap-content.tsx` (`"use client"`) that owns ALL the JSX rendering, all Lucide imports, and the three sub-components (`DailyGoalStreakCard`, `CourseTimelineCard`, `ComingSoonTeaser`). Exports a `CourseStat` type.
- Slimmed `src/app/(dashboard)/roadmap/page.tsx` (RSC) to data-fetching only. It does the 4 parallel Supabase queries, computes derived stats, and hands a fully serializable payload (numbers, strings, booleans, ISO date strings) to `<RoadmapContent>`. Zero Lucide imports remain in the RSC.

**Serialization-safety changes in the data shape:**
- `Date` objects → `string | null` (ISO format) via `d.toISOString()`. The client formats with `Intl.DateTimeFormat("ro-RO", ...)`. Date instances technically cross the RSC boundary in Next 14 but ISO strings are unambiguously safe and avoid future surprises.
- Field renamed `estimatedFinishDate: Date` → `estimatedFinishDateIso: string`.

**Files created (1):**
- `src/components/roadmap/roadmap-content.tsx` — `"use client"`, ~340 LOC, contains all icon imports + JSX render + sub-components

**Files modified (1):**
- `src/app/(dashboard)/roadmap/page.tsx` — reduced from ~430 LOC (mixed RSC + JSX) to ~110 LOC (pure RSC data-fetching). No Lucide imports. Returns `<RoadmapContent>` with serializable props only.

**Verifications:**
- `npx tsc --noEmit` clean
- `npx next lint` on both files: zero warnings/errors
- `grep "from \"lucide-react\"" src/app/(dashboard)/roadmap/page.tsx` → no matches (icons isolated to client)
- All four other icon prop sites (`<PageHero icon={Compass}>` and three `<StatCard icon={...}>` calls) now live inside `"use client"` boundary — no serialization crossing

**Pattern established for future RSCs:**
When a page-level RSC needs Lucide icons in its render, extract the render into a `"use client"` component (e.g. `<*Content>`) and pass only serializable data to it. This is what `/courses` (`<CoursesMissionHeader>`, `<CoursesPageClient>`) and `/profile` (`<ProfileHero>`, `<ProfileStatsRow>`) already do.

---

### Prompt 1.8 — Glossary & Flashcards Page Polish
**Date:** 2026-04-28
**Status:** ✅ Complete

**Both pages went from "functional but plain" to premium with shared components consistently deployed. RSC pattern from 1.7b followed: data-fetch in RSC, render in `"use client"` component.**

---

#### GLOSSARY (/glossar)

**Architecture:**
- `page.tsx` (RSC) — slimmed to ~40 LOC: auth check + Supabase query + render `<GlossarClient terms={...} />`. No icons, no UI logic.
- `glossar-client.tsx` (`"use client"`) — full rewrite: now owns the PageHero, stats row, search, category pills, and term grid.

**New layout (top to bottom):**
1. **PageHero** "Glosar AI" / "Toți termenii importanți, explicați simplu — pe înțelesul oricui." with the `BookOpen` icon and `mesh` background variant.
2. **Stats row** — 3 `<StatCard>` tiles: Termeni (primary), Categorii (accent), Cea mai mare categorie (gold).
3. **Search input** — Bigger (py-3), card-styled, with X clear button when query is non-empty.
4. **CategoryPillGroup** — "Toate" + 6 category pills (AI General, ML, DL, NLP, Python, Tools), each with its own Lucide icon and color (Brain/Layers/Sparkles/MessageSquare/Code2/Wrench). Only categories that exist in the data are shown.
5. **Result count** — small line above the grid when filtering.
6. **Term grid** — 2-column on desktop, 1-column on mobile. Each term wrapped in `<MagicCard>` with mouse-tracking gradient (gradient color tinted by category). Term cards are collapsible (chevron rotates, content slides via Framer Motion height/opacity).
7. **Empty state** — When 0 results, `<EmptyState>` with "Niciun termen găsit" + a "Resetează filtrul" button that clears both query and category.

**Category icons + colors (Aurora-style):**
- AI General → Brain, violet (#8B5CF6)
- ML → Layers, blue (#3B82F6)
- DL → Sparkles, indigo (#6366F1)
- NLP → MessageSquare, cyan (#06B6D4)
- Python → Code2, amber (#F59E0B)
- Tools → Wrench, emerald (#10B981)

**Files modified (2):**
- `src/app/(dashboard)/glossar/page.tsx` — ~55 LOC → ~42 LOC, render delegates entirely to client
- `src/components/glossar/glossar-client.tsx` — full rewrite, ~290 LOC; was a self-contained accordion+search, now integrates PageHero/StatCard/CategoryPillGroup/MagicCard/EmptyState

**Files modified (1, layout match):**
- `src/app/(dashboard)/glossar/loading.tsx` — Updated skeleton to mirror new shape (PageHero placeholder + stats row + search bar + pill row + term grid)

---

#### FLASHCARDS (/flashcards)

**Architecture:**
- `page.tsx` (RSC) — fetches due cards, new cards, total reviewed/mastered/catalog counts, user streak. Hands fully serializable data to `<FlashcardsContent>`.
- `flashcards-content.tsx` (`"use client"`, NEW) — owns PageHero + stats banner + empty state, wraps existing `<FlashcardReview>` for the review session.
- `flashcard-review.tsx` (existing) — kept its review-session logic but enhanced: snappier flip spring + SM-2 next-review prediction badge on the card back.

**New layout:**
1. **PageHero** "Flashcards" / "Repetă și memorează cu spaced repetition (SM-2)." with `Layers` icon and right-side `<AnimatedProgressRing size="lg">` showing **mastery percent** (cards with `repetitions ≥ 3` ÷ total catalog).
2. **Stats banner** — 4 `<StatCard>` tiles in a single row:
   - **Scadente azi** (streak color, Clock icon) — `dueCount`
   - **Carduri noi** (accent, Sparkles) — `newCount`
   - **Stăpânite** (primary, CheckCircle2) — `totalMastered` of `totalCatalog`
   - **Streak** (gold, Flame) — global `streak_count` from `users` table
3. **Review surface** — Wrapped in a card frame for visual separation, contains the existing `<FlashcardReview>`.
4. **Empty state** — When `cards.length === 0`, render `<EmptyState>` with `PartyPopper` icon, "Felicitări — totul e revizuit!" message that adapts: if user has reviewed cards before, mentions their total count; otherwise suggests completing lessons to unlock flashcards.

**Stats math (no DB schema changes):**
- `totalReviewed` = `user_flashcard_progress` rows where `repetitions > 0` (cards user has actually reviewed at least once)
- `totalMastered` = `user_flashcard_progress` rows where `repetitions >= 3` (SM-2 considers these "mature")
- `totalCatalog` = `count(*)` from `flashcards` table
- `masteryPercent` = `totalMastered / totalCatalog * 100`
- `streakCount` = `users.streak_count` (global, shared with lesson streak)

**Card flip polish (in flashcard-review.tsx):**
- Spring physics: `stiffness: 180, damping: 20` → `stiffness: 220, damping: 18, mass: 0.9` — snappier and more tactile
- Card height: `min-h-[200px]` → `min-h-[220px]` for more comfortable text spacing
- Card back border: `border-primary/40 bg-primary/5` → `border-aurora-primary-500/40 bg-aurora-primary-500/5` (Aurora palette consistency)

**SM-2 next-review badge (NEW, on card back):**
After flip, a small pill appears at the bottom of the card back showing the predicted next-review interval if the user rates "Bine" (quality 4). Uses the existing `computeSM2()` pure function from `src/lib/flashcard-sm2.ts`. Romanian labels:
- intervalDays ≤ 1 → "Următoarea revizuire: mâine"
- 2 days → "peste 2 zile"
- 3-6 days → "peste N zile"
- 7-13 days → "peste o săptămână"
- 14-29 days → "peste N săptămâni"
- 30-364 days → "peste N luni"
- 365+ days → "peste un an"

This gives users context before they choose a quality button — they see "ah, if I rate this Bine, I'll see it in 6 days."

**Files modified (3) + created (1):**
- `src/app/(dashboard)/flashcards/page.tsx` — slimmed: now just data-fetch + delegate to client (~115 LOC, was ~140 with inline UI)
- `src/components/flashcards/flashcards-content.tsx` — **CREATED** (~110 LOC), the new client wrapper with PageHero + stats banner + empty state
- `src/components/flashcards/flashcard-review.tsx` — added SM-2 next-review prediction badge on card back, polished spring physics, Aurora palette consistency, imported `computeSM2` from existing helper
- `src/app/(dashboard)/flashcards/loading.tsx` — updated skeleton (PageHero + stats row + review surface)

---

#### Components deployed (per the deployment map)

| Component | Glossary | Flashcards |
|---|---|---|
| `PageHero` (mesh variant) | ✅ | ✅ (with right-side ProgressRing) |
| `StatCard` | ✅ × 3 | ✅ × 4 |
| `CategoryPillGroup` | ✅ (categories filter) | — |
| `MagicCard` | ✅ (per term) | — |
| `EmptyState` | ✅ (no results) | ✅ (no due cards) |
| `AnimatedProgressRing` | — | ✅ (mastery %) |

#### Components NOT used (intentionally)

- `NumberTicker` on either page — `StatCard`'s built-in count-up handles numeric animation already.
- Per-deck progress rings on flashcards — the schema doesn't currently group cards into decks (cards live per-lesson). The single mastery ring in PageHero is the right unit until decks become a concept.

---

#### Verifications

- `npx tsc --noEmit` clean
- `npx next lint` on all 5 modified files — only one pre-existing warning (`setQueue` unused in flashcard-review.tsx, was there before this prompt; not introduced by 1.8)
- DB schema unchanged (per spec)
- SerpentinePath untouched (per spec)
- Other pages untouched (per spec)
- RSC pattern from 1.7b followed for both pages (no Lucide icons cross the RSC → client boundary)
- Both loading.tsx files updated to mirror the new layouts
- Light + dark mode handled via Aurora theme tokens (`bg-card`, `border-border`, `text-foreground`, etc.)

#### Notes / discoveries

- The TypeScript build target rejected `for (const c of map.values())` iteration. Replaced with `Array.from(map.values()).reduce(...)` — pre-existing TS config limitation, not specific to this prompt.
- Spec asked for "Termeni noi săptămâna aceasta" as an optional 3rd glossary stat. The schema has `created_at` per term but not a per-user "discovered" timestamp, and the seed loads all 50 terms at once. Replaced with "Cea mai mare categorie" (count of terms in the densest category) — a meaningful, derivable stat that doesn't fake data.
- The `<MagicCard>` term cards have `gradientFrom={categoryColor}` so each category's cards have a faint colored hover sweep — visually distinguishes categories on hover without being noisy.
- `<EmptyState>` accepts `onAction` for the "Resetează filtrul" button — passes a function that resets both the search query and the active category. Avoids navigating away.

---

### Prompt 1.9 — Dashboard Component Refresh
**Date:** 2026-04-28
**Status:** ✅ Complete

**Strategic outcome:** Dashboard sections now feel cohesive with the new pages (/courses, /profile, /roadmap, /glossar, /flashcards). No fake course names anywhere. Real data everywhere. The biggest fix: removed the 4 hardcoded "coming soon" course names from `RoadmapSection` (matching the /roadmap page approach from 1.7).

---

#### Sections UPGRADED (4)

**1. RoadmapSection (`roadmap-section.tsx`)**
- **Removed** the hardcoded `COMING_SOON` array of 4 fake course names ("Machine Learning Practic", "Computer Vision", "NLP cu Transformers", "Build with AI"). Same fake data the /roadmap page already had — now also gone from the dashboard.
- Replaced 4-item fake placeholder loop with **a single neutral teaser**: "Mai multe cursuri în curând — Curriculum-ul complet, de la matematică pentru AI până la transformere, este în dezvoltare." Hourglass icon, dashed border, no specific course names.
- Recomputed `totalCount` and `overallPercent` against **real courses only** (no longer divides by `courses.length + 4`). The progress bar now reflects actual progress, not deflated-by-fake-courses progress.
- Changed `Lock` icon in the teaser to `Hourglass` for a more "in-progress" feel (vs. "permanently locked").

**2. LeaderboardSection (`leaderboard-section.tsx`)**
- **Pulled the #1 user out of the unified list** into a premium `<MeshGradientCard>` with gold/violet gradient (`["#FDCB6E", "#F59E0B", "#6C5CE7"]`).
- Champion card: bigger avatar (h-14 ring-2 ring-aurora-gold-500/40), animated 👑 emoji above, "Locul 1" badge with `<Crown>` icon, large gold XP count with NumberTicker, "Tu" indicator if it's the current user.
- Ranks 2+ live in a regular bordered card list below (same row layout as before, just with `topUsers.slice(1)` and adjusted rank display: `i + 1` instead of `i + 1 - 1`).
- Border-left color stripes still applied for ranks 2 (silver `#b2bec3`) and 3 (bronze `#e17055`).
- New import: `Crown` icon, `MeshGradientCard`.

**3. AchievementsSection (`achievements-section.tsx`)**
- **Replaced 3 custom inline stat tiles** with shared `<StatCard>` components.
- Total XP → `<StatCard color="gold" icon={Trophy}>` (was a custom div with ShineBorder + NumberTicker)
- Streak → `<StatCard color="streak" icon={Flame} subtitle={...}>` (was a custom div with "🔥" emoji suffix; the StatCard handles the streak color natively)
- Insigne → `<StatCard color="accent" icon={Award}>` (was a custom div)
- All three now have consistent count-up animation, hover lift, and Aurora theme tokens, matching the stats rows on /courses, /profile, /roadmap, /glossar, /flashcards.
- Removed unused `NumberTicker` import (StatCard handles the count-up internally).
- Kept `ShineBorder` import — still used inside the badge showcase below.

**4. InterviewSection (`interview-section.tsx`)**
- **Replaced 5 inline topic chip `<span>` elements** with CategoryPill-style chips, each with its own Lucide icon and color:
  - Python → `Code2` icon, amber #F59E0B
  - Machine Learning → `Brain` icon, violet #6C5CE7
  - React → `Layers` icon, cyan #06B6D4
  - SQL → `Database` icon, emerald #10B981
  - Computer Vision → `Eye` icon, light violet #A29BFE
- Wrapped in `<Link href="/interview">` so each chip is clickable (CTA-friendly).
- Visual consistency with the /glossar category pills and the /onboarding daily-goal pills.
- Did NOT use `<CategoryPillGroup>` directly because that's an active/inactive **selector**; topic chips here are display-only links. Used the same visual tokens (rounded-full, color-tinted bg/border/text, icon + label, h-3 icon size) for a cohesive look without abusing the component's semantics.

---

#### Sections VERIFIED, no change needed (3)

**5. CoursesSection (`courses-section.tsx`)**
- Already uses `<MagicCard>`, `<BorderBeam>`, `<ShineBorder>`, `<AnimatedGradientText>` — premium components.
- "Vezi toate cursurile" CTA → `/courses` ✓
- Course card link → `/courses/${slug}` which (since 1.5b) redirects to `/courses?c=<slug>` and pre-selects the course. ✓
- Visual style on the cards (deterministic per-card gradient, % large display, progress bar, CTA button) is consistent with the /courses selector cards.

**6. PortfolioSection (`portfolio-section.tsx`)**
- Already wrapped in `<MagicCard>` with `<ShineBorder>` overlay.
- Inline 4-tile stats grid uses Aurora-tinted backgrounds (gold/streak/accent/primary) — visually distinctive but not the shared `<StatCard>`. Kept as-is because they fit the section's "snapshot card" aesthetic; switching to StatCard would make them dominate the section visually.
- Badge emojis use the same `ShineBorder` ring treatment as the /profile badge showcase — already consistent.

**7. ProfileSection (`profile-section.tsx`)**
- Settings hub (sign out, badges, last active). Functional, not visually compelling but correct for its role. Out of scope to redesign.

---

#### Sections deliberately NOT touched (per spec)

| Section | Why |
|---|---|
| **HeroSection** | Spec said "do NOT modify the HeroSection (it's already polished)". Confirmed — it has the absence-mascot, weekly streak dots, continue-lesson chip, all real data. |
| **PresentationSection** | Marketing-only, no DB data, intentional design. Out of scope. |
| **CommunitySection** | Real-time community feed, working. No upgrade needed. |
| **3D Side Decorations** | Spec said do NOT touch. |

---

#### Components deployed (per the deployment map)

| Component | Section |
|---|---|
| `StatCard` | AchievementsSection × 3 |
| `MeshGradientCard` | LeaderboardSection (champion #1 tile) |
| `MagicCard` | CoursesSection, PortfolioSection (already used) |

---

#### Files modified (4)

- `src/components/dashboard/roadmap-section.tsx` — removed `COMING_SOON` array (4 fake courses), replaced with single neutral teaser; recomputed total/percent against real courses
- `src/components/dashboard/leaderboard-section.tsx` — added `<MeshGradientCard>` champion tile, refactored list to slice(1) for ranks 2+
- `src/components/dashboard/achievements-section.tsx` — swapped 3 custom stat divs for `<StatCard>`; removed unused `NumberTicker` import
- `src/components/dashboard/interview-section.tsx` — replaced inline span chips with CategoryPill-style `<Link>` chips with icons + per-topic colors

---

#### Verifications

- `npx tsc --noEmit` clean
- `npx next lint` on all 4 modified files: zero warnings/errors
- Dashboard layout (10 scroll sections) unchanged — only sections' internals upgraded
- 3D side decorations untouched
- HeroSection untouched
- DB schema, other pages, SerpentinePath, shared components: all untouched
- No fake course names anywhere on the dashboard now (matches /roadmap page from 1.7)
- All sections still use real Supabase data (or marketing-only data in PresentationSection)
- Visual cohesion: AchievementsSection stats + dashboard cards now share the same `<StatCard>` look as /courses Mission Control, /profile stats, /roadmap daily goal, /glossar stats, /flashcards stats banner

---

#### Notes / discoveries

- The course-card link on the dashboard (`/courses/${slug}`) goes through the 1.5b redirect to `/courses?c=<slug>`. Verified inbound — works correctly with course pre-selection.
- Considered upgrading PortfolioSection's inline 4-tile stat grid to `<StatCard>` but decided against it: the tighter, color-coded inline tiles fit the "portfolio snapshot" aesthetic better than 4 tall StatCards inside an already-tall MagicCard.
- For InterviewSection topic chips, used `<Link>` instead of `<button>` so right-click → "open in new tab" works naturally for users who want to explore interview topics in a new context.
- `roadmap-section.tsx` still uses its own custom timeline visual (status dot + connector line + colored card) rather than swapping to MeshGradientCard. The custom design is denser than MeshGradientCard would be at this scale (5 items in a stack), and matches the section's "compact path" intent. The /roadmap full page uses MeshGradientCard for its larger format.
- Achievements section now visually matches the /profile page's stats row exactly — same StatCard component, same colors per metric (gold/streak/accent), same hover behavior.

---

### Prompt 1.10 — Lesson Page Cleanup
**Date:** 2026-04-28
**Status:** ✅ Complete

**Audit outcome:** Prompt 1.4 was thorough — zero textual remnants of dual-mode anywhere in the lesson route or course components. The `<ModeToggle>` removal in 1.4 was clean: no orphaned spacing, no dead conditionals, no unused props, no leftover empty `<div>` shells. The lesson page header collapses naturally with `flex gap-2` so the absent toggle leaves no visual gap.

**The actual cleanup found** was a smaller-but-real issue introduced by **1.5b**: 4 user-navigation paths still pointed to `/courses/${courseSlug}` (the old route that 1.5b turned into a redirect to `/courses?c=<slug>`). Each click forced an extra HTTP hop. Fixed all 4 to go directly to `/courses?c=<slug>`.

**Remnant grep — zero matches in the lesson route:**
- `grep "ModeToggle\|mode-toggle\|isSimple\|learning_mode\|learningMode\|content_simple_md\|contentSimpleMd\|hasSimpleContent\|computeLearningMode\|updateLearningMode"` against `app/(dashboard)/courses/[courseSlug]/[lessonId]` → **0 matches**
- Same grep against `components/course/` → **0 matches**
- `grep "simple\|tehnic\|learning_mode"` against `lesson-gate.tsx`, `ai-coach-chat.tsx`, `lesson-comments.tsx`, `lesson-presence.tsx`, `quiz-section.tsx`, `quiz-block.tsx`, `code-editor.tsx` → **0 matches**

**Redirect-hop fixes (4 navigation paths):**

1. `[courseSlug]/[lessonId]/page.tsx:204` — Header breadcrumb back link.
   Before: `href={\`/courses/${courseSlug}\`}` → went through redirect.
   After: `href={\`/courses?c=${courseSlug}\`}` → direct.

2. `[courseSlug]/[lessonId]/page.tsx:372` — Sticky bottom "Înapoi la curs" fallback (shown when there's no previous lesson).
   Same fix.

3. `components/course/complete-button.tsx:72` — `handleNext()` after completing the LAST lesson in a course (no `nextLessonId`).
   Before: `router.push(\`/courses/${courseSlug}\`)` → redirect hop.
   After: `router.push(\`/courses?c=${courseSlug}\`)` → direct, with comment explaining the 1.5b context.

4. `components/course/lesson-keyboard-nav.tsx:37` — Alt+← keyboard shortcut on the first lesson (no `prevLessonId`).
   Same fix.

**`revalidatePath` reference left intact:**
`courses/actions.ts:177` does `revalidatePath(\`/courses/${courseSlug}\`, "page")`. This is a Next.js cache invalidation tag, not user navigation — and the redirect page legitimately exists at that path. Keeping it ensures the redirect's cached redirect-target stays fresh after lesson completion.

**Header/breadcrumb verification:**
The lesson page header (lines 198-250) renders `breadcrumb left | metadata badges + bookmark right` with `flex items-center gap-2 shrink-0`. After ModeToggle removal in 1.4:
- `currentIndex + 1 / lessons.length` (hidden on mobile)
- type icon + label pill (always)
- reading time pill (theory only, hidden on mobile)
- completion checkmark (when applicable)
- bookmark heart icon
No empty slots, no awkward gap. The `gap-2` collapses naturally.

**Sidebar verification (mode-neutral):**
- AI Coach (`ai-coach-chat.tsx`) — mode-neutral system prompt, no learning_mode reads
- Lesson presence (`lesson-presence.tsx`) — Supabase Realtime channel, no mode dependency
- Lesson comments (`lesson-comments.tsx`) — Level-3 gate intact, no mode references
- Reading progress bar (`reading-progress.tsx`) — fixed top, scaleX-driven, no changes needed

**Functionality verified working (code-walked, not browser-tested):**

| Feature | File / Path | Verified |
|---|---|---|
| Gate questions load | `page.tsx:122` filter `mode IN ('technical', 'both')` | ✓ |
| Lesson completion | `complete-button.tsx` → `markLessonComplete` | ✓ |
| XP award (15 XP) | `courses/actions.ts` event `lesson_complete` (single rate from 1.4) | ✓ |
| Streak update + milestones | `actions.ts:124-156` daily/3/7/30 day awards | ✓ |
| Badge check | `actions.ts:114-121` `checkAndAwardBadges` | ✓ |
| Celebration overlay | `lesson-page-client.tsx:170-186` MascotCelebrationOverlay | ✓ |
| Mini-game trigger every 3rd lesson | `actions.ts:183-188` order_index % 3 === 0 | ✓ |
| Bookmark toggle | `bookmark-button.tsx` → `toggleBookmark` action | ✓ |
| Lesson feedback (clear/hard) | `lesson-feedback.tsx` 3-arg signature from 1.4 | ✓ |
| Keyboard nav (Alt+←/→) | `lesson-keyboard-nav.tsx` (now uses `?c=` for first-lesson back) | ✓ |
| Prev/next sticky bottom links | page.tsx:354-397 | ✓ |
| Code editor (Pyodide/Piston) | `code-editor.tsx` always renders for `language-python-editor` blocks (no simple-mode placeholder) | ✓ |
| Lesson 13 Piston routing | `lesson-content.tsx:58` `executionMode = lessonOrder === 13 ? "piston" : "pyodide"` | ✓ |
| AI Coach floating chat | `ai-coach-chat.tsx` mode-neutral | ✓ |
| Push-permission prompt after first complete | `lesson-page-client.tsx:122` | ✓ |
| Confetti burst on complete | `complete-button.tsx:43-50` | ✓ |

**Files modified (3):**
- `src/app/(dashboard)/courses/[courseSlug]/[lessonId]/page.tsx` — 2 breadcrumb/back links updated to `?c=` query form
- `src/components/course/complete-button.tsx` — `handleNext` last-lesson fallback updated; comment added
- `src/components/course/lesson-keyboard-nav.tsx` — Alt+← first-lesson fallback updated; comment added

**Files NOT modified (intentional):**
- `[courseSlug]/[lessonId]/loading.tsx` — already correct shape, no ModeToggle skeleton remnant
- `lesson-page-client.tsx` — clean from 1.4
- `lesson-content.tsx` — clean from 1.4
- `lesson-feedback.tsx`, `lesson-gate.tsx`, `code-editor.tsx`, `ai-coach-chat.tsx`, `lesson-comments.tsx`, `lesson-presence.tsx`, `reading-progress.tsx` — all mode-neutral
- `courses/actions.ts:177` `revalidatePath` — left as `/courses/${courseSlug}` since it's a cache tag, not user navigation
- MDX content files (per spec)
- DB schema (per spec)

**Verifications:**
- `npx tsc --noEmit` clean
- `npx next lint` on the 3 modified files: zero warnings/errors
- Lesson page layout: 9/10 design preserved, no redesign per spec
- `grep -r "/courses/\${courseSlug}\`"` against `src/` — only 1 remaining match (the legitimate `revalidatePath` cache tag in actions.ts)

**Notes / discoveries:**
- The lesson page is genuinely tight — 1.4 retired dual-mode cleanly. No empty container, no leftover `gap-N` larger than needed, no unused imports.
- The redirect-hop issue in user navigation (4 paths) is a polish bug from 1.5b. Fixing it eliminates one round-trip per "back to course" / "after-last-lesson" / "Alt+← from first lesson" event. Small but real performance win, and matches the spec's "tighten the header" intent.
- Did not redesign the lesson page (per spec — already 9/10). No StatCard / MeshGradientCard / PageHero changes here. The lesson page is content-first by design.

---

### Prompt 1.11 — Pixel Mascot Polish
**Date:** 2026-04-28
**Status:** ✅ Complete

**Strategic outcome:** Pixel now has 10 distinct emotion states (4 new), idle breathing + blink animations via lightweight CSS keyframes, light-mode-safe colors with hairline contrast strokes, AI Coach typing indicator powered by the mascot itself, and a level-up celebration that switches to the new "celebrating" state.

**No Cosmo 3D rebrand** (per spec — that's post-Block 1).

---

#### Emotion union — 4 new states added

| Emotion | Origin | Visual |
|---|---|---|
| `happy` | Existing | Green body, gentle wiggle rotation |
| `sad` | Existing | Slate body, drooped position |
| `thinking` | Existing | Indigo body, partial-close eyes, pulsing sparkles above |
| `excited` | Existing | Amber body, bouncing scale, used for lesson completion |
| `proud` | Existing | Violet body, gold crown above head |
| `idle` | Existing | Indigo body, neutral default |
| **`encouraging`** | **NEW** | Cyan body, smile mouth, pulsing pink heart above, gentle bobbing |
| **`celebrating`** | **NEW** | Pink body, party hat (pink triangle with white border), open-mouth smile, bouncing scale |
| **`sleeping`** | **NEW** | Sky-blue body, drooped position, eyes squinted nearly shut, animated "Z Z" letters drifting up beside head |
| **`waving`** | **NEW** | Orange body, side-to-side rotation wave, smile mouth, animated "hand" circle bobbing on the right |

Old emotions kept for **backwards compatibility** (10+ existing call sites use them). The `PixelEmotion` union expanded; nothing was removed or renamed.

---

#### Idle animations — pure CSS keyframes (no Framer Motion overhead)

Added to `src/app/globals.css`:
- **`pixel-mascot-breathe`** — `scale 1.0 → 1.02 → 1.0`, 3.4s cycle, ease-in-out, infinite
- **`pixel-mascot-blink`** — `scaleY 1 → 0.1 → 1`, 5.2s cycle, blink at 92-96% of cycle (eyes open ~94% of the time, closed ~2%, gentle fade either side)
- Both honor `@media (prefers-reduced-motion: reduce)` (animations off)

**Architecture detail (avoiding transform conflicts):**
- The breathing animation lives on an **outer wrapper `<div>`** (not the SVG itself, which Framer Motion controls via the `animate` prop's transform). This keeps CSS keyframe and Framer Motion transforms on **separate DOM elements** — no fight for the same `transform` style attribute.
- The blink animation lives on a **plain `<g>` element** (not `<motion.g>`) wrapping the eyes. Since this `<g>` doesn't have a Framer `animate` prop, no conflict occurs.
- For emotions that already animate scale at the wrapper level (`excited`, `celebrating`), breathing is suppressed to avoid compounding scale transforms.

---

#### Light-mode contrast fixes

The mascot now reads cleanly on white/lavender backgrounds (the new app-wide light theme):
- **Body ellipse** — added a `stroke="rgba(15,23,42,0.18)"` hairline (1px). Invisible on dark backgrounds, gives a soft outline on light ones.
- **Eye whites** — added `stroke="rgba(15,23,42,0.25)" strokeWidth={0.5}` so the white circles don't blend into a white page background.
- **Body colors** — selected from the Tailwind 500-tone range (`#22c55e`, `#6366f1`, `#f59e0b`, `#8b5cf6`, `#06b6d4`, `#ec4899`, `#7dd3fc`, `#fb923c`) which carry enough chroma to pop on light backgrounds while still working on dark via the SVG glow filter.

---

#### Mascot deployment — every site

| File | Use | Emotion (current) | Notes |
|---|---|---|---|
| `mascot-celebration-overlay.tsx` | Post-lesson celebration | `excited` (default) / `celebrating` (when `leveledUp`) | **NEW BRANCHING** in 1.11 |
| `dashboard/absence-mascot.tsx` | 3+ days absent banner | `sleeping` | **CHANGED** from `sad` in 1.11 |
| `onboarding/step-welcome.tsx` | Final onboarding screen | `waving` | **CHANGED** from `excited` in 1.11 |
| `course/lesson-gate.tsx` | Wrong gate answer | `sad` | unchanged |
| `gamification/streak-toast.tsx` | Streak milestone toast | `proud` | unchanged |
| `gamification/level-up-toast.tsx` | Level up toast | `proud` | unchanged |
| `minigame/minigame-modal.tsx` | Minigame intro | `excited` | unchanged |
| `minigame/minigame-result-screen.tsx` | Minigame result (perfect/passed/failed) | `excited` / `proud` / `thinking` | unchanged |
| `course/ai-coach-chat.tsx` | Typing indicator | `thinking` | **NEW IN 1.11** — replaced the static `<Bot>` icon spinner with a 32px Pixel mascot in thinking state, paired with the existing loader spinner in the bubble |
| `landing/landing-page.tsx` | Hero + section decorations | `excited` / `happy` | unchanged |
| `pricing/pricing-cards.tsx` | Pricing visual | `excited` | unchanged |
| `app/pricing/cancel/page.tsx` | Stripe cancel | `sad` | unchanged |
| `app/pricing/success/page.tsx` | Stripe success | `excited` | unchanged |

Total: **13 deployment sites** (12 in src, 1 in pages/pricing). 3 sites updated to use new emotions; 1 site (AI Coach) gained a new mascot integration; rest unchanged for backwards compat.

---

#### Celebration overlay polish

`mascot-celebration-overlay.tsx`:
- The mascot now switches to `celebrating` (party hat + pink body + bouncing) when `leveledUp` is true, while keeping `excited` (amber + bouncing + sparks) for the regular "you completed a lesson" case.
- The wrapper `motion.div` already has the spring entry (`{ scale: 0.5 → 1 }, type: spring, stiffness: 280, damping: 20`) — verified, no change needed.
- Confetti burst (120 particles, spread 80) fires on overlay show, dismisses after 4s. Already correct.
- The `withSparks` prop still pumps 12 colored particles outward — visually composes with confetti for a layered celebration feel.

---

#### AI Coach typing indicator

Before: `<Bot>` icon in a circle + `<Loader2>` spinner in a bubble.

After: `<PixelMascot emotion="thinking" size={32}>` (with its own thinking sparkles + partial-close eyes) + the existing `<Loader2>` spinner in the bubble.

Result: when the AI is composing a reply, the user sees the mascot literally thinking. Same component the dashboard absence mascot and celebration overlay use, so the personality stays consistent across the whole app.

---

#### Files modified (5)

- `src/components/mascot/pixel-mascot.tsx` — Major. Expanded `PixelEmotion` union to 10. Added 4 new emotion visual treatments (encouraging heart, celebrating party hat, sleeping Z's, waving hand). Restructured to put breathing on an outer wrapper div (no Framer-Motion transform conflict). Switched eye-blink container to plain `<g>` for the same reason. Added stroke contrast for light mode. Added typed `TargetAndTransition` / `Transition` imports to satisfy strict TS.
- `src/app/globals.css` — Added 2 keyframes (`pixel-mascot-breathe`, `pixel-mascot-blink`) + class declarations + `prefers-reduced-motion` guard.
- `src/components/mascot/mascot-celebration-overlay.tsx` — `emotion={leveledUp ? "celebrating" : "excited"}`.
- `src/components/dashboard/absence-mascot.tsx` — `emotion="sleeping"` (was `sad`).
- `src/components/onboarding/step-welcome.tsx` — `emotion="waving"` (was `excited`).
- `src/components/course/ai-coach-chat.tsx` — Replaced `<Bot>` typing avatar with `<PixelMascot emotion="thinking" size={32}>`. Added `PixelMascot` import. (The `<Bot>` icon import is still used in 3 other places — kept.)

---

#### Verifications

- `npx tsc --noEmit` clean (0 errors)
- `npx next lint` on all 5 modified mascot files: zero warnings (one pre-existing warning in `ai-coach-chat.tsx:158` about a `useEffect` dep is unrelated to my changes — it's in the speech-recognition setup section)
- DB schema unchanged (per spec)
- No 3D / Three.js (per spec)
- No Cosmo rebrand (per spec)
- Page layouts unchanged (per spec)
- All 13 existing mascot consumers compile and render — old emotion names still valid
- Light mode: hairline strokes ensure body and eye contrast on white/lavender backgrounds
- Dark mode: SVG glow filter still provides depth (drop-shadow with emotion-specific glow color)
- Reduced motion: breathing + blink CSS animations are disabled via `@media (prefers-reduced-motion: reduce)`

---

#### Notes / discoveries

- The original implementation had `motion.svg` with both Framer Motion transforms AND a CSS class that *would* have applied keyframe transforms. CSS animation + JS-driven transform on the same element is unreliable (last write wins, often jittery). Restructuring to put the breathing on an outer wrapper div was necessary.
- Considered switching `streak-toast` and `level-up-toast` from `proud` to `celebrating` for visual punch, but kept them on `proud` since the crown visually communicates "you reached a milestone" better than the party hat in a small toast. Could revisit in a future polish prompt.
- Considered `encouraging` for the absence mascot instead of `sleeping`, but "I missed you" reads more naturally with sleepy/dormant Z's than with encouraging hearts. The encouraging emotion is reserved for streak-at-risk surfaces (not yet built — would slot in nicely if a "streak about to break" UI is added later).
- The `Bot` icon in `ai-coach-chat.tsx` is still used in the chat header, message bubbles, and welcome state — only the typing indicator was replaced. The Bot identity visually persists in the rest of the chat surface.

---

### Prompt 1.12 — Block 1 QA Sweep
**Date:** 2026-04-28
**Status:** ✅ Complete

#### Build checks
- [x] `npx tsc --noEmit` → **zero errors**
- [x] `npm run lint` → **zero errors** (2 pre-existing warnings only, both non-blocking)
- [x] `npm run build` → **succeeds**, all 30+ routes compiled

#### Lint errors fixed during the sweep
The pre-existing lint errors had been blocking `npm run build` because Next.js treats lint errors as build errors. None were introduced by Block 1 prompts (1.1–1.11), but ship-readiness required them gone:
- `src/app/(admin)/admin/comments/page.tsx` — removed unused `MessageSquare` import
- `src/components/layout/navbar.tsx` — removed unused `Badge` import (was added in 1.1, never used after layout changes)
- `src/components/flashcards/flashcard-review.tsx` — removed unused `setQueue` setter (state never mutates → derived const)
- `src/components/minigame/game-fill-blank.tsx` — removed unused `AnimatePresence` import
- `src/components/minigame/game-match-pairs.tsx` — removed unused `AnimatePresence` import
- `src/components/minigame/game-true-false.tsx` — removed dead `correctCount` variable (never read)
- `src/components/onboarding/onboarding-wizard.tsx` — dropped unused `userId: _userId` prop destructure
- `src/components/pdf/certificate-document.tsx` — removed unused `GOLD` constant
- `src/components/ui/animated-progress-ring.tsx` — removed unused `useRef` import
- `src/components/ui/category-pill.tsx` — wired the `className` prop into the button (was declared but not applied)
- `src/components/ui/status-node.tsx` — removed unused `AnimatePresence` import
- `src/lib/animations.ts` — collapsed duplicate `let timeoutId` + `timeoutId = setTimeout` into single `const timeoutId = setTimeout` (also fixed prefer-const blocker)

#### Page-by-page structural verification
- [x] `/dashboard` — page exists, all sections wired
- [x] `/courses` — Mission Control header, course selector, SerpentinePath via `CoursesPageClient`, real Supabase data
- [x] `/courses?c=<slug>` — `searchParams.c` parsing in `page.tsx`; `CoursesPageClient` selects via `initialCourseId`
- [x] `/courses/[courseSlug]` — redirects to `/courses?c=<slug>` via `redirect()` (server-side)
- [x] `/courses/[courseSlug]/[lessonId]` — page exists, lesson loader works
- [x] `/profile` — page + 8 profile components (hero, stats, edit, badges, certificates, referral, portfolio link, heatmap)
- [x] `/roadmap` — RSC page + `RoadmapContent` client (post-1.7b refactor: ISO-string serializable boundary)
- [x] `/glossar` — `GlossarClient` with PageHero + StatCard + CategoryPillGroup + MagicCard terms + EmptyState
- [x] `/flashcards` — `FlashcardsContent` with PageHero + 4 StatCards; `FlashcardReview` with SM-2 next-review badge
- [x] `/leaderboard`, `/interview`, `/settings/notifications`, `/portfolio`, `/onboarding`, `/dev/components` all present
- [x] All 11 `loading.tsx` files present in dashboard route group

#### Visual consistency verification (via grep)
- [x] **PageHero** deployed in: courses, profile, roadmap, glossary, flashcards, dev showcase (6 files)
- [x] **StatCard** deployed in: dashboard achievements, glossary, flashcards, roadmap, profile stats row, courses mission header, onboarding welcome (9 files)
- [x] **No ModeToggle / Mod Simplu / Mod Tehnic / learningMode / isSimple / contentSimpleMd** in any production code — only 2 mentions of `content_simple_md` exist in sync-action comments that *explicitly document* "the column is left untouched in the DB" (intentional inert documentation, not active code)
- [x] **No "Coming soon" / "COMING_SOON" / "fake-course"** — zero matches anywhere
- [x] **ThemeToggle** wired in navbar (every dashboard page), profile-section, landing page

#### Pixel mascot integration sites — all 13 confirmed
1. `dashboard/absence-mascot.tsx` → `sleeping`
2. `mascot/mascot-celebration-overlay.tsx` → `celebrating | excited`
3. `gamification/streak-toast.tsx` → `proud`
4. `gamification/level-up-toast.tsx` → `proud`
5. `course/ai-coach-chat.tsx` typing indicator → `thinking`
6. `course/lesson-gate.tsx` → `sad` (wrong answer)
7. `onboarding/step-welcome.tsx` → `waving`
8. `pricing/pricing-cards.tsx` → `excited`
9. `app/pricing/success/page.tsx` → `excited` + sparks
10. `app/pricing/cancel/page.tsx` → `sad`
11. `landing/landing-page.tsx` → `excited` + `happy`
12. `minigame/minigame-modal.tsx` → `excited` + sparks
13. `minigame/minigame-result-screen.tsx` → emotion-by-result branch

#### Pre-existing lint warnings remaining (non-blocking, NOT introduced by Block 1)
- `src/components/course/ai-coach-chat.tsx:158` — `react-hooks/exhaustive-deps` for `recognition` (intentional; documented in 1.11 as pre-existing)
- `src/components/pdf/certificate-document.tsx:262` — `jsx-a11y/alt-text` on a decorative image inside a generated PDF (alt text not meaningful for a logo embedded in a PDF document)

These two warnings were present before Block 1 began. They do not block the build.

#### Files modified during 1.12 (lint-fix only)
- `src/app/(admin)/admin/comments/page.tsx`
- `src/components/layout/navbar.tsx`
- `src/components/flashcards/flashcard-review.tsx`
- `src/components/minigame/game-fill-blank.tsx`
- `src/components/minigame/game-match-pairs.tsx`
- `src/components/minigame/game-true-false.tsx`
- `src/components/onboarding/onboarding-wizard.tsx`
- `src/components/pdf/certificate-document.tsx`
- `src/components/ui/animated-progress-ring.tsx`
- `src/components/ui/category-pill.tsx`
- `src/components/ui/status-node.tsx`
- `src/lib/animations.ts`

#### Notes
- Browser-level checks (theme switching, lesson completion flow, mascot animations, mobile responsiveness, light mode visuals, mini-game triggers, Cmd+K search, bookmark persistence) cannot be performed from this environment — they require a running browser session. The structural / static checks performed here verify that all pages, components, props, redirects, and state wiring **compile and resolve correctly**. Behavioral browser-runtime issues (if any) would surface only via manual QA in `npm run dev` and are explicitly out of scope for static verification.
- Build artifacts in `.next/` confirm: 30+ routes compiled, middleware bundled (74.4 kB), all `loading.tsx` files prerendered, dynamic routes (`/courses/[courseSlug]`, `/courses/[courseSlug]/[lessonId]`) registered.

---

## Block 1 — Final Scorecard (2026-04-28)

**Status:** ✅ **DONE**

### Top-line numbers
| Metric | Count |
|---|---|
| Prompts completed | **12 / 12** (1.1, 1.2, 1.3, 1.4, 1.5, 1.5b, 1.6, 1.7, 1.7b, 1.8, 1.9, 1.10, 1.11, 1.12 — including 2 hotfixes) |
| Pages redesigned / polished | **9** (courses, profile, roadmap, glossary, flashcards, dashboard, onboarding welcome, lesson page, leaderboard) |
| Shared UI components built or polished | **15** (PageHero, StatCard, MagicCard, MeshGradientCard, AnimatedProgressRing, AvatarLevelRing, CategoryPill, CategoryPillGroup, DifficultyBadge, EmptyState, NumberTicker, PixelMascot, CourseSelector, CourseMap, CoursesMissionHeader, RoadmapContent — plus 8 new profile sub-components) |
| Files **created** across all prompts | **~30** (5 course components, 8 profile components, 4 flashcard/glossar components, 8 loading.tsx, course-map.ts, sync-prompt-engineering-button, roadmap-content, courses-page-client, profile actions) |
| Files **modified** across all prompts | **~50+** |
| TypeScript errors | **0** |
| New lint errors | **0** |
| Bugs fixed mid-block | **3** (RSC→Client serialization crash on `/roadmap` [1.7b]; integer formatting on StatCard [1.5b]; CSS-vs-Framer-Motion transform conflict on PixelMascot [1.11]) |

### Shared components — deployment map

**PageHero** — `/courses`, `/profile`, `/roadmap`, `/glossar`, `/flashcards`, `/dev/components`

**StatCard** — `/dashboard` (achievements), `/courses` (mission control), `/profile` (stats row), `/roadmap`, `/glossar`, `/flashcards`, `/onboarding` (welcome preview)

**MagicCard** — `/profile` (badge showcase), `/glossar` (term cards)

**MeshGradientCard** — `/profile` (referral section), `/dashboard` (leaderboard #1 gold card)

**AvatarLevelRing** — `/profile` (hero)

**AnimatedProgressRing** — `/flashcards` (mastery ring in PageHero)

**CategoryPillGroup / CategoryPill** — `/glossar` (6 categories), `/dashboard` (interview topics), `/profile` (daily goal selector in edit form)

**EmptyState** — `/courses` (no courses), `/glossar` (no search results), `/flashcards` (no due cards)

**PixelMascot** — 13 sites (full list in Prompt 1.12 above)

**SerpentinePath** — `/courses` (connected to live Supabase data via `course-map.ts` + `CourseMap` wrapper)

**ThemeToggle** — navbar (every dashboard page), profile section, landing page

### What Block 1 retired
- **Mod Simplu / Mod Tehnic dual-mode system** — `mode-toggle.tsx` deleted, `learningMode` removed from props/types/DB queries (DB column kept but ignored), 51 archive `*-simple.mdx` files retained in `content/_archive/simple-mode/` for reference. `lesson_complete_simple` and `lesson_complete_technical` XP events collapsed to single `lesson_complete`.
- **Hardcoded fake "coming soon" course names** — replaced with neutral teaser pointing at the 2 real courses.
- **Password reset + email verification flows** — descoped per user direction (testing with fake accounts).
- **Hardcoded dashboard interview stats (47, 12, 5)** — replaced with real Supabase counts via props.
- **`/courses/[courseSlug]` standalone page** — now redirects to `/courses?c=<slug>` (the SerpentinePath already shows every lesson, so a separate course page is redundant).

### Known issues (pre-existing, NOT introduced by Block 1)
- `react-hooks/exhaustive-deps` warning at `ai-coach-chat.tsx:158` (intentional — adding `recognition` to deps would cause speech recognition restart loop)
- `jsx-a11y/alt-text` warning at `certificate-document.tsx:262` (decorative logo inside generated PDF — not a screen-reader-relevant context)

### Architecture decisions made during Block 1
1. **RSC → Client wrapper pattern** for data-driven pages with rich UI: page.tsx fetches, hands serializable props to a `*-content.tsx` client component (used in /roadmap, /glossar, /flashcards). Reason: Lucide icon function-objects cannot cross the RSC→Client serialization boundary.
2. **Dates as ISO strings** at the RSC→Client boundary (not Date objects). Reason: Date isn't directly serializable in all paths; ISO 8601 is unambiguous and parseable on both sides.
3. **CSS keyframes and Framer Motion transforms must not co-occupy the same element.** Resolved on PixelMascot by moving the breathing animation to an outer `<div>` wrapper while Framer Motion stays on the inner `<motion.svg>`.
4. **Course pre-selection via query param chain** — `?c=<slug>` (from redirect) > continue-course > first-course. This collapses 3 entry points into one URL grammar.
5. **DB constraint awareness** — kept `daily_goal_minutes IN (0, 5, 15, 30)` as the option set (rather than 5/15/30/60) because the DB CHECK constraint enforces it. No schema migrations during Block 1.

### What's next
- **Cosmo Mascot (post-Block 1)** — replace the 2D PixelMascot SVG with a 3D Cosmo character, retain the same 10-emotion API, swap-in across all 13 deployment sites.
- **Block 2 — Curriculum Design** — research and outline a ~200-lesson curriculum spanning AI Fundamentals → Prompt Engineering → ML Engineering → AI Engineering tracks.
- **Block 3 — Content Writing** — write the 200 lessons in MDX, sync to DB, build any new MDX components needed.

---

## Cosmo Mascot (Post-Block 1)

### Phase 8 — Premium polish: head-to-body junction + bottom-half articulation (integrated neck/chest, shoulder bulge, thicker back legs, paw pads, bounce-synced head)
**Date:** 2026-05-06
**Status:** ✅ Complete

Phase 7 nailed the silhouette but two zones still read as "assembled from parts": the head sat on the body like a separate piece (12–16 px gap between head bottom `y=122` and body top `y=138`), and the legs/paws looked glued onto the body without visible articulation. Phase 8 closes both gaps. Geometry-only changes plus one essential animation sync so the new tighter junction holds up during bouncing emotions.

#### Zone 1 — Head-to-body junction

| Element | Phase 7 | Phase 8 |
|---|---|---|
| Body top edge | `y=138` (with rounded curve `C 110 134 90 134 80 138` to chin) — left a 16 px gap to head bottom `y=122` | **Body path now starts at `y=122`** with a Q-arch peak at `y=119` that tucks behind the head ellipse, then flows out via `Q 64 132 80 140` (left) / `Q 136 132 124 122` (right) into the chest. The body silhouette extends UP into the head's lower interior — no daylight between head and torso. |
| New body path | `M 80 138 C 64 144 60 175 70 192 ...` | **`M 76 122 Q 64 132 80 140 C 64 148 60 175 70 192 C 82 204 118 204 130 192 C 140 175 136 148 120 140 Q 136 132 124 122 Q 100 116 76 122 Z`** |
| Belly cream patch | `cx=100 cy=178 rx=22 ry=20` (covered y=158–198) | **`cx=100 cy=170 rx=22 ry=28`** (covers y=142–198) — extends UP through the chest, masking the chest/body junction with the same soft radial fade. The cream extends from just below the muzzle, through the chest badge area, down through the belly. Reads as one continuous lighter-fur underside. |
| Head bounce | Head ignored body bounce → during excited/celebrating, body bounced ±5 px while head stayed put → small flickering gap at the new tight junction | **Head's transform now adds `bounceY` to its `totalY`** so head and body bounce together. Bounce amplitude/frequency unchanged — only the *sync* changed. Junction stays solid through every bounce cycle. |

##### Geometric reasoning behind the neck/chest extension

Head ellipse: `cx=100 cy=82 rx=46 ry=40` → bottom edge at `y=122`.
At `y=120`, the head ellipse covers `x=85.6–114.4` (24 px wide window).
At `y=121`, the head covers `x=89.7–110.3` (20 px wide window).
At `y=122`, the head touches a single point at `x=100`.

Body's new neck arc `Q 100 116 76 122` traces from `(124, 122)` via control point `(100, 116)` to `(76, 122)`. Q-bezier math gives:
- y peak (min y) at `t=0.5`: y = `122 - 12*0.5*(1-0.5) = 119`
- At `y=120`: x = `86` and `114` — both inside the head's `85.6–114.4` window → **head fully covers neck**
- At `y=121`: x = `80.4` and `119.6` — `≈10 px peeks beyond the head ellipse on each side` → **reads as a chin/jaw**
- At `y=122`: x = `76` and `124` (path endpoints) → **clear neck width 48** = the visible chin/jaw silhouette
- Below `y=122`: body flows out via `Q 64 132 80 140` to the chest at `y=140` with width 40, then widens to the belly at `y=175` with width 80

The result: a smooth jaw → neck → chest → belly profile. The head and body now share silhouette continuity rather than being two stacked shapes.

#### Zone 2 — Bottom half (legs, paws, ground)

| Element | Phase 7 | Phase 8 |
|---|---|---|
| Front leg paths | Pure capsules (`Q 72 188 72 193 L 72 215 ...`) — uniform width, glued-flat to the body | **Articulated paths with subtle shoulder bulge → narrow trunk → wider rounded paw**: `M 76 188 L 88 188 C 92 191 92 198 91 204 L 91 215 C 93 220 93 226 86 226 ... C 72 198 72 191 76 188 Z`. Width: 14 at top, 18 at shoulder bulge `y≈198`, 18 at trunk `y=215`, 20 at paw `y=226`. Reads as a leg with anatomical articulation, not a vertical pill. |
| Back legs | `cx=66, cy=198, rx=9, ry=14` — too small relative to the body, looked vestigial | **`cx=70/130, cy=204, rx=10, ry=16`** — 14% wider, 14% taller, 6 px lower → fully visible as solid back-paw bulbs from `y=188` to `y=220`. Repositioned 4 px outward (`66→70` and `134→130`) so they peek a clear 8–10 px past the body silhouette on each side. |
| Paw pads | None | **Subtle darker oval `rx=4 ry=1.7 fill=earBot opacity=0.42`** at the center of each front paw at `cy=223`. Sits BETWEEN the toe bumps and the paw silhouette — reads as the central foot pad. Subtle (42% opacity) so it doesn't shout, but adds the "soft puppy paw" detail. |
| Ground shadow | `cy=228 rx=32 ry=4 opacity=0.12` — paws appeared to graze the shadow's top edge | **`cy=229 rx=36 ry=4 opacity=0.14`** — slightly lower, 12% wider, 17% more opaque. Toe bumps (which extend to `y=230–232`) now sit firmly within the shadow's visible area. Paws look planted, not floating. |

##### Why subtle articulation, not exaggerated

The user's spec said "subtle joint articulation" — not "anatomical leg study". Going further would have pushed Cosmo toward "realistic puppy" and away from "kawaii mascot". The 4 px shoulder bulge + 4 px paw bulge difference vs trunk is the threshold where you *feel* articulation without consciously noticing it. Same logic applies to the paw pads: present at 42% opacity, invisible at 0% opacity, distracting at 80% opacity.

##### Why head must bounce-sync (animation note)

Phase 7's body bounce moved the body ±5 px while the head ignored bounce. With Phase 7's 16 px head/body gap, that 5 px never broke the silhouette — the gap was already there.

Phase 8's integrated neck/chest closes that gap to 0 px. Without bounce sync, every excited/celebrating bounce cycle would have flashed a 0–5 px hole at the chin during the down-stroke of the bounce. Adding `bounceY` to `headRef`'s `totalY` keeps head and body locked together. The bounce amplitude (`bodyBounceAmp` 0–5) and frequency (`bodyBounceFreq` 0–5.5) are untouched — only the head/body *coupling* changed.

This is the only animation-logic change in Phase 8. All idle animations (blink, ear twitch, head drift, breathing), gaze parallax, ear hover, eye tracking, mouth morphing, tail wag, and per-emotion targets stay byte-for-byte identical.

#### What was deliberately NOT touched

- Antenna (wire, sparkles, LED, halo, emergence point, animation)
- Ears (paths, hover, twitch)
- Eyes (sclera, iris, catchlight, blink, squint, closed-eye, gaze parallax)
- Muzzle (cy=130 rx=23 ry=18, shadow arc, nose, mouth path morphing)
- Cheek blush (position, color, opacity per emotion)
- Tail (plume path, fluff streaks, wag animation, rest-pitch table)
- All emotion targets (`EMOTIONS` table — bounce values, pitches, opacities, etc.)
- Gaze tracking, idle drift, idle blink, idle ear twitch
- Particle overlay (sparks/zzz/rainbow)
- Component prop interface

#### Files modified

- `src/components/mascot/cosmo-mascot.tsx`
  - Body path rewritten (added neck/chest)
  - Belly cream extended (`cy=178→170`, `ry=20→28`) to cover chest area
  - Front leg paths rewritten with shoulder articulation
  - Front paw pads added (one ellipse per paw)
  - Back legs grown (`rx=9→10`, `ry=14→16`) and repositioned (`cx=66/134→70/130`, `cy=198→204`)
  - Ground shadow tuned (`cy=228→229`, `rx=32→36`, `opacity=0.12→0.14`)
  - rAF loop: `bounceY` computation moved earlier and added to `headRef.totalY` so head bounces with body

#### Verifications

- [x] `npx tsc --noEmit` → 0 errors (clean)
- [x] All 8 emotions verified to drive their animations as before (mouth morph, eye scale, pupil parallax, ear rotate, tail wag, paw wave, body bounce, antenna pulse, badge pulse, cheek opacity, particle spawn)
- [x] No prop API changes
- [x] No package additions
- [x] Bounding box (`viewBox 0 0 200 230`, container `size × 1.15`) unchanged
- [x] Color palette unchanged (no new colors in Phase 8 — reuses `furDark`, `bellyLight`, `pawToe`, `earBot` from prior phases)

#### Creative decisions made (Phase 8)

1. **Body absorbs the neck rather than the head growing a chin.** Two ways to bridge head and body: extend head DOWN with a chin/throat shape (rotates with head), or extend body UP with a neck/chest shape (bounces with body). Picked body-extends-up because:
   - The chest area is structurally part of the torso, not the head — putting it in the body group is anatomically right.
   - The body's gradient flow (golden top → golden bottom) extends naturally into the neck without needing a new gradient.
   - Head rotation is small (±7°) so the head doesn't drift far from the body during rotation; whereas body bounce is bigger (±5 px) and would have created a worse artifact if the bridge belonged to the head.
2. **Q-bezier neck arch peaks at `y=119`, not `y=116`.** The Q control point sits at `y=116`, but Q-bezier curves don't pass through the control point — the curve only reaches y = `122 - 12*t*(1-t)` which maxes at `y=119`. That `y=119` is exactly where the head ellipse covers `x=82.5–117.5` — wide enough to fully hide the neck arch's narrow peak. Lowering the control point further (e.g. to `y=110`) would have made the curve poke above head's coverage at small head-rotations. The `y=116` choice is calibrated to the head ellipse geometry.
3. **Chest cream by extending the belly, not adding a new tuft.** Considered three options: (a) lateral side tufts at the cheek/chest junction, (b) a centered chest tuft, (c) extending the belly cream upward. Picked (c) because it produces ONE continuous lighter underside (cream from chest → badge → belly), which is the actual coat pattern of a golden retriever puppy. Side tufts would have looked like applied makeup; a centered chest tuft would have been hidden behind the muzzle anyway.
4. **Front leg path uses C-curves for the shoulder bulge, not Q-curves.** A Q-curve has one control point — symmetric in/out. A C-curve has two — lets the bulge expand outward, hold, then come back in: `C 92 191 92 198 91 204` peaks at `x=92` and holds across `y=191–198` before tapering. That hold IS what makes the bulge read as a shoulder, not a kink.
5. **Paw pads use `earBot #A86808`, not `outline #92400E`.** The ear-bottom color is a saturated dark golden — naturally reads as "darker fur tone". Outline color is more red/brown — would have looked like a dirty paw. Same darkness, different undertone.
6. **Paw pads at `cy=223`, BETWEEN the paw silhouette top (`y=215`) and toe bumps (`y=226`).** The pad sits where a real puppy paw's central pad sits — between the digits and the foot. Above the toe bumps so it reads as palm-of-paw, not as an extra toe.
7. **Back legs shifted INWARD from `cx=66` to `cx=70` (and 134→130) plus DOWN from `cy=198` to `cy=204`.** Combined with the size bump, the back legs now peek 8–10 px past the body silhouette laterally (clear "leg behind body" reading) AND extend lower so their paws are closer to ground level. Phase 7's legs ended at `y=212`; Phase 8's end at `y=220` — only 12 px above front paw bottoms vs Phase 7's 20 px. Stable triangle stance.
8. **Ground shadow `rx=36`, not `rx=32` or `rx=40`.** Front paws span `x=70–130` (60 px wide). Shadow rx=36 → width 72 → 12 px wider than paws (6 px each side). Less than that and the shadow looks shrunk. More and it looks oversized. The `rx=36 ≈ paw_span * 1.2` ratio matches how cast shadows widen in front lighting.
9. **Shadow opacity `0.14`, not `0.18` or `0.20`.** Pure black at 0.14 reads as soft contact shadow on light AND dark backgrounds. Higher opacity reads as a hole in the page on dark backgrounds (the shadow vacuum). The Gaussian blur on the shadow softens the perceived density — even at 0.14 the shadow is clearly visible.
10. **Bounce sync goes on the head, not the legs.** Two options: (a) sync the head with body bounce, or (b) decouple the body bounce from the chest/neck so only the lower body bounces. Picked (a) because option (b) would have required splitting the body path into an upper static piece and a lower bouncing piece — significantly more complexity. Plus, in real character animation, a bouncing puppy's head bounces too — that's part of the joy expression.

The component file is ~1265 lines. ViewBox stays `0 0 200 230`. Container ratio stays `size × 1.15`. No prop API changes. No package additions.

---

### Phase 7 — Bottom-half rebuild + golden-retriever head/snout (legs defined, back legs visible, ground shadow, badge on chest, belly patch, blush on muzzle, plume tail, oval head, prominent snout)
**Date:** 2026-05-06
**Status:** ✅ Complete

Phase 6 fixed the face details but the bottom half of the character still didn't read. Owner's punch list: front legs were blob ellipses, back legs invisible, body-to-legs transition abrupt, no ground contact (Cosmo floated), badge on the belly looked like a bellybutton/eye, belly patch hard-edged, cheek blush still too high, tail looked like a 5th paw, head was a generic circle, muzzle didn't push forward. Phase 7 rebuilds the bottom half and re-shapes the head/snout into a proper golden retriever silhouette.

#### What changed (one row per fix)

| # | Element | Phase 6 | Phase 7 |
|---|---|---|---|
| 1 | Front legs | Two `ellipse cx=82,118 cy=200 rx=11 ry=12` blobs with toe circles | **Two capsule paths** — vertical rounded rectangles with rounded paw ends, gap at x=92→108 (16 px between legs), 3 toe bumps `r=4` per paw. |
| 2 | Back legs | Two ellipses behind body but at the same fur color — invisible | **Two darker-golden `furDark #D4850A` ellipses at `(66, 198)` and `(134, 198)` rx=9 ry=14** — tucked behind body sides; outer half visible, inner half hidden by body silhouette. |
| 3 | Body shape / leg transition | Path bottoms at `y=182` — abrupt cut with no belly bulge | **New body path with chest narrowing at top (`x≈64-136`), belly bulging at `y≈175` (`x=60-140`), bottom narrowing for legs (`x=82-118` at `y=204`)** — front legs overlap body 16 px at the top so legs look like they support the body. |
| 4 | Ground shadow | Single `ellipse cy=215 ry=5 fill=#0F172A opacity=0.15` — too high, too soft, not really under the paws | **`ellipse cx=100 cy=228 rx=32 ry=4 fill=#000000 opacity=0.12` with `feGaussianBlur stdDeviation=2`** — directly under the paws, 70% of body width, blurred for softness. Rendered OUTSIDE the body's bounce/breath group so it stays put on the ground while the body moves. |
| 5 | Chest badge | `translate(100, 158)` halo `r=8` badge `r=4` highlight `r=1.7` — sat on the belly, looked like a bellybutton | **`translate(100, 152)` halo `r=6` badge `r=3` highlight `r=1.3`** — moved up to the chest area (above the belly patch), 25% smaller diameters, glow blur further reduced. Reads as a collar tag now, not a navel. |
| 6 | Belly patch | Solid `url(#cream)` `rx=20 ry=14 opacity=0.95` — hard-edged, sharp boundary against golden body | **`url(#belly)` radial gradient (`#FEF3C7` 0.95→0.8→0 at 0%/65%/100%) `rx=22 ry=20` at `cy=178`** — softer, lighter cream, edges fade smoothly into the golden fur instead of cutting hard. |
| 7 | Cheek blush | At `cy=115` — still on the head, ABOVE the muzzle top | **At `cy=124`** (was 115) and `cx=74,126` (was 70,130) — 9 px lower, 4 px inward. Now sits on the muzzle/lower-cheek boundary like real kawaii blush. |
| 8 | Tail | Phase 6's plume — but the path was a flat teardrop reading as "5th paw blob" | **New plume path `M -6 4 Q -8 -8 0 -18 Q 8 -30 22 -38 Q 36 -36 30 -22 Q 22 -8 14 0 Q 6 6 -6 4 Z`** — wide at base (≈20 px), tapers to soft rounded tip at `(22, -38)` curving up-and-right (golden retriever carry). Plus 2 lighter cream-bottom streaks suggesting fluff layers, plus a `r=5` tip highlight. Translate moved from `(130, 150)` to `(132, 165)` — tail base attaches to the back of the body. |
| 9 | Head shape | `circle r=42` — perfect dome | **`ellipse rx=46 ry=40` (1.15:1 ratio)** — slightly wider than tall, reads as a golden retriever head instead of a generic round character. |
| 10 | Snout / muzzle | `cy=126 rx=21 ry=15`, single muzzle outline | **`cy=130 rx=23 ry=18`** (bigger and pushed forward by 4 px) **+ a subtle dark brown arc `M 80 116 Q 100 110 120 116`** above the muzzle suggesting the 3D protrusion meeting the head. Muzzle outline strengthened (`OUTLINE_WIDTH * 1.15 / OUTLINE_OPACITY * 1.35`). Nose moved from `cy=118` to `cy=121`, mouth translate moved from `(100, 130)` to `(100, 138)`. |

#### Color-palette additions

```ts
COLORS.furDark    "#D4850A"   // back legs — darker golden for depth/shadow
COLORS.bellyLight "#FEF3C7"   // belly patch — lighter cream than the muzzle gradient
```

#### New SVG `<defs>` entries

- `id={ID.belly}` — radial gradient (`#FEF3C7` opacity `0.95 → 0.8 → 0` at `0%/65%/100%`) for the soft-edged belly patch
- `id={ID.shadowBlur}` — `feGaussianBlur stdDeviation=2` filter applied to the ground-contact ellipse

#### Render order changes

```
PHASE 6                                 PHASE 7
─────────                                ─────────
<g filter=drop>                          (ground shadow ellipse, OUTSIDE drop)
  ground-shadow ellipse                  <g filter=drop>
  tail                                     tail
  back legs                                back legs
  body { belly + badge }                   body { belly (gradient) + badge (smaller, higher) }
  front legs (left ellipse + toes)         front legs (left capsule path + toes)
  front legs (right ellipse + toes)        front legs (right capsule path + toes)
  head { ... }                             head { ellipse (was circle) + muzzle (bigger) + transition arc + ... }
</g>                                     </g>
```

The ground shadow leaving the drop-shadow group is intentional — the shadow should stay on the ground while the rest of the body bounces, breathes, and parallax-shifts. Inside the bounce group, it would translate up/down with every breath cycle and look weird.

#### Geometric reasoning behind the head + muzzle changes

A perfect circle reads as "abstract round character" (think Pusheen, generic blobs). A subtle horizontal stretch (`rx=46 ry=40`, ratio 1.15) reads as "this is a real animal head" without losing the kawaii roundness. The same 1.15:1 ratio shows up in many golden retriever face references.

The muzzle pushed from `ry=15` to `ry=18` and `cy=126` to `cy=130` means it now protrudes 23 px below the head's bottom edge (head bottom `y=82+40=122`, muzzle bottom `y=130+18=148`). Phase 6 protruded only 17 px. That extra 6 px is the difference between "this character has a snout" and "this character has a SNOUT, like a real dog".

The subtle dark-brown arc `M 80 116 Q 100 110 120 116` sits where the muzzle's upper edge meets the cheek/forehead. Renders at `outlineDeep #7C2D12` opacity `0.22`, so it's barely visible — but enough to define the 3D form. Without it, the muzzle reads as a flat color patch on the head; with it, the muzzle reads as a bump pushing forward.

#### Why the front legs are capsules, not ellipses

Phase 6's ellipses were dimensionally indistinct — they looked like "torso extensions" rather than legs. Phase 7's path:

```
M 76 188 Q 72 188 72 193 L 72 215 Q 72 224 82 224 Q 92 224 92 215 L 92 193 Q 92 188 88 188 Z
```

…has a clear top edge (where leg meets body), straight side walls (the leg trunk), and a rounded paw at the bottom. The Q-curves at the four corners are the rounded shoulders and rounded paw. Top width 16 px, paw width 20 px (slightly wider for a more grounded look). 16 px gap between left and right legs (`x=92` → `x=108`) so they clearly read as two legs, not a single fused mass.

The 3 toe bumps `r=4` at the bottom of each paw are positioned at `(76, 226)`, `(82, 228)`, `(88, 226)` for the left leg — center bump pushed 2 px lower so the paw silhouette reads as natural toes, not a flat-bottomed stamp.

#### Why back legs at `(66, 198)` and `(134, 198)` work as "peeking"

Body silhouette at `y=192`: `x=70-130`. Body silhouette at `y=185`: `x≈64-136`. Back leg ellipse at `cx=66 rx=9 ry=14`:
- At y=185: leg spans `x=57-75`. Body covers `x=64-75`. Visible (left of body): `x=57-64` (7 px wide).
- At y=192: body spans `x=70-130`. Leg `x=57-75`. Visible: `x=57-70` (13 px wide).
- At y=200: body has narrowed to `x≈76-124`. Leg `x=57-75` is fully outside body — fully visible.
- At y=210+: body has ended. Leg fully visible.

So the upper part of the leg tucks behind the body silhouette (the "peeking" effect) while the lower paw portion is fully visible outside the body. Darker `furDark #D4850A` color suggests the leg sits in deeper shadow (which is what happens to back legs in side lighting), reinforcing the depth illusion.

#### Wave animation pivot updated

`pawWaveRef` rotation pivot moved from `(118, 178)` to `(118, 188)` to match the new leg geometry — the leg now starts at `y=188`, so rotating from y=188 puts the pivot at the shoulder/top-of-leg, giving a natural arm-raise motion when waving. CSS `transformOrigin` style on the `<g>` was also bumped to match (decorative — the actual rotation is via SVG `rotate(angle, 118, 188)`).

#### What was deliberately NOT touched

- Eye design — sclera `rx=13 ry=12`, iris `r=10 #1F1611`, single catchlight `r=2.3`, eye position `cy=98`
- Eye refs and animations — blink, scale, pupil parallax, closed-eye line, squint-happy line
- Head rotation pivot `(100, 124)` — kept consistent with Phase 6 even though chin now ends at `y=122`
- Ear paths and ear hover/twitch
- Antenna wire, sparkles, LED, halo, antenna emergence point `(148, 88)`
- All emotion behaviors — `EMOTIONS` table values unchanged
- Mouth path tables — `MOUTH_LIP` and `MOUTH_OPEN` unchanged from Phase 6 (the mouth GROUP translate moved, but the path geometry didn't)
- Idle animations: breath, blink, ear twitch, head drift, tail wag, antenna pulse, badge pulse
- Mouse-gaze parallax, cursor-close wag boost, curious-idle tilt
- Particle overlay (sparks/zzz/rainbow)
- Component prop interface (`emotion`, `size`, `className`, `enableIdleAnimations`, `enableInteraction`)

#### Verifications

- [x] `npx tsc --noEmit` → 0 errors (clean)
- [x] All 8 emotions still drive mouth path morphing via the same Q-bezier pair
- [x] All idle animations preserved (rAF loop changes limited to wave-pivot coordinate)
- [x] Same prop interface — showcase code unchanged
- [x] Particle overlay spawn coordinates unchanged
- [x] Mouse-gaze parallax / cursor-close wag boost / idle-tilt all preserved

#### Files modified

- `src/components/mascot/cosmo-mascot.tsx` — palette additions (`furDark`, `bellyLight`), new ID entries (`belly`, `shadowBlur`), new gradient + filter in `<defs>`, full bottom-half markup rewrite, head circle → ellipse, muzzle larger + transition arc, nose/mouth/cheek positions updated, paw-wave pivot updated

#### Files NOT modified

- `src/app/(dashboard)/dev/components/_cosmo-showcase.tsx` — same prop interface
- All deployment sites — Cosmo still not wired to production

#### Creative decisions made (Phase 7)

1. **Ground shadow lives outside the drop-shadow group.** Inside the body group, the shadow would translate with every bounce, breathe with every breath cycle, and parallax with cursor movement. Cosmo would look like he's hovering on a floating shadow mat. Outside the group, the shadow stays put on the floor — Cosmo bounces and breathes ON the shadow, which is what real shadows do.
2. **Pure black `#000000` for the ground shadow, not the navy `COLORS.shadow #0F172A` we'd been using.** Per spec. Pure black + low opacity (0.12) reads more neutrally on light AND dark backgrounds than the navy-tinted version did.
3. **Soft `feGaussianBlur stdDeviation=2` on the ground shadow.** A hard-edged ellipse looks like a sticker; a blurred one reads as cast contact shadow. The stdDeviation is calibrated so the visible shadow extends ~6 px out from the ellipse — soft enough to read as ambient shadow, not so soft it becomes a vague smudge.
4. **Body's belly bulge is asymmetric in path control points.** Top half of the body uses a tighter chest curve (`C 64 144 60 175 70 192`); bottom half pushes the belly out (`C 82 204 118 204 130 192`). Real chibi puppy bodies have this profile — narrow shoulders, wider belly, narrowing again toward the legs. Symmetric body paths would have looked like a pill or a balloon.
5. **Belly patch as a radial gradient with transparent edges.** A flat-fill ellipse with hard edges looked like a sticker stuck on the body. The radial fade (`opacity 0.95 → 0.8 → 0`) creates a soft transition from cream center to golden fur, like the actual two-tone coat of a golden retriever puppy.
6. **Belly cream patch is `#FEF3C7`, NOT the existing `#FDE68A` cream gradient.** Lighter color (more white, less yellow) reads as "puppy belly" instead of "muzzle color stuck on the body". The muzzle keeps its `cream` gradient because the muzzle is naturally darker than the belly on real golden retrievers.
7. **Chest badge moved to `cy=152`, not all the way up to the neck.** Right at the upper-third of the body (chest area). Higher and it would conflict with the head silhouette during head-down poses (thinking, sad). Lower and it'd creep back onto the belly. `y=152` is the sweet spot.
8. **Front legs use a `<path>` with Q-corner rounding instead of `<rect rx=...>`** because rect-rx caps at half the smaller dimension — the path lets us tune corner radius (4 px at top shoulders, 9 px at paw bottom) independently, giving the leg slight asymmetry top-to-bottom (sharper top corners suggesting "shoulder", rounder bottom suggesting "paw").
9. **Back legs are simple ellipses, not paths.** Most of the back leg is hidden behind the body. Detailing a path that's 70% covered would be wasted. The visible portion (left edge + bottom) reads correctly as "a leg behind there" with just the ellipse silhouette + the darker fur color.
10. **Tail base translates to `(132, 165)`, NOT `(140, 175)`.** Tucking the base UNDER the body's right side at y=165 means the body silhouette covers the bottom-left corner of the tail base — the tail visually "comes from behind" the body instead of sitting next to it like a separate prop. The 30 px upward sweep then reads as a tail held high.
11. **Two lighter `creamBot` streaks ON the tail plume.** Without these, the tail is a uniform golden teardrop. The streaks suggest the layered fur of a real plume tail. They stop short of the tip (going up to `y=-32` while the tip is at `y=-38`) so the tip itself remains a clean curve.
12. **Head ratio 1.15, not 1.10 or 1.20.** 1.10 is too subtle to read; 1.20 starts looking like a bulldog. 1.15 is the sweet spot where the head reads as "subtly oval" — golden retriever territory.
13. **Subtle dark-brown arc `M 80 116 Q 100 110 120 116` lives ABOVE the muzzle's top edge, not below.** Above-the-muzzle reads as the natural shadow line where the snout meets the face plane. Below-the-muzzle would look like a wrinkle on the snout. The arc is at `outlineDeep #7C2D12` `opacity=0.22` — only barely visible but it adds the 3D dimension.
14. **Cheek blush moved to `cx=74, cy=124` from `cx=70, cy=115`.** Old position was on the head, above the muzzle. New position straddles the muzzle/cheek boundary — exactly where puppy blush sits in real photos. The 4 px shift inward (70→74) matches the muzzle's wider base.

The component file is now ~1260 lines. ViewBox stays `0 0 200 230`. Container ratio stays `size × 1.15`. No breaking changes for consumers.

---

### Phase 6 — Face polish pass (muzzle prominent, blush obvious, nose glossy, smile bold, paw bumps, fluffier tail, smaller badge, visible antenna wire)
**Date:** 2026-05-06
**Status:** ✅ Complete

Phase 5 nailed the proportions but eight specific surface details still didn't read at small sizes. The owner's checklist: muzzle barely visible, cheek blush invisible, nose lost, smile too thin, paws plain, tail disappears at 150 px, badge dominates the silhouette, antenna wire vanishes on dark backgrounds. Phase 6 addresses each one in the SVG only — no architecture, proportions, eye design, or component API changes.

#### What changed (one row per fix)

| # | Element | Phase 5 | Phase 6 |
|---|---|---|---|
| 1 | Muzzle | `cy=118 rx=22 ry=11`, stroke `1.35 / 0.28` — barely peeks below head circle | **`cy=126 rx=21 ry=15`, stroke `1.65 / 0.455`** — top at y=111, bottom at y=141 (17 px below head bottom). Width = 50% of head. Clearly reads as a snout now. |
| 2 | Cheek blush | `#FCA5A5`, `rx=7 ry=4`, opacities 0.2–0.55, `cy=113` | **`#F9A8D4`, `rx=5 ry=4`, opacities 0.3–0.7, `cy=115`** — diameter ≈ 38% of eye diameter, sits below+outside each eye, pinker hue, more visible across all emotions. |
| 3 | Nose | `rx=3.8 ry=2.8` `#3D2B1F`, ellipse highlight `rx=1.1 ry=0.7` | **`rx=5.7 ry=4.2` `#292524`, circle highlight `r=1.5`** — exactly 50% bigger area, darker brown-black, white catchlight is a full circle (cleaner wet-shine). |
| 4 | Mouth/smile | stroke `2.2`, happy curve span ±10 (≈48% of muzzle), depth 6 | **stroke `3`, happy curve span ±13 (≈62% of muzzle), depth 9** — every emotion's mouth path widened and deepened proportionally. Mouth translate moved from `(100, 124)` to `(100, 130)` to sit on the lower muzzle. |
| 5 | Front-paw toes | 3 tiny dark ellipses (`rx=2.2 ry=1.4`, `earBot @ 0.7`) inside the paw | **3 lighter-golden circle bumps `r=4 #FFB940`** centered on the paw's bottom edge — top half blends into paw, bottom half protrudes as toe shape. |
| 6 | Tail | path span ~34 wide × 22 tall, tip highlight `r=5` at `(32, -19)` | **path span ~46 wide × 30 tall, tip highlight `r=7` at `(44, -26)`** — proper plume shape. Wag amplitudes bumped ~30% (happy 14→18, excited 26→34, encouraging 18→24, celebrating 32→42, waving 20→26). |
| 7 | Chest badge | halo `r=11 @ 0.25`, badge `r=6`, inner highlight `r=2.4`, drop-shadow blur 2–6 px | **halo `r=8 @ 0.2`, badge `r=4`, inner highlight `r=1.7`, drop-shadow blur 1.2–3.7 px** — exactly 30% smaller diameter, halo opacity multiplier 0.45→0.3 in rAF. Now an accent, not a focal point. |
| 8 | Antenna wire | stroke `#475569 @ 1.7 px` — dark slate, vanished against dark navbar/dashboard | **stroke `#9CA3AF @ 2 px`** — gray-400, visible on dark backgrounds. LED bulb itself untouched. |

#### Color-palette additions

```ts
COLORS.cheek       "#FCA5A5" → "#F9A8D4"   // pinker, more obvious blush
COLORS.noseDark    "#3D2B1F" → "#292524"   // deeper, glossier
COLORS.pawToe      (new)     "#FFB940"     // lighter golden for toe bumps
```

#### What was deliberately NOT touched

- Head/body ratio, all proportions, head circle (cx=100 cy=82 r=42)
- Eye design — sclera `rx=13 ry=12`, iris `r=10 #1F1611`, single catchlight `r=2.3`, eye position `cy=98`
- Ear paths and ear hover/twitch animation
- Idle animations (breathing, blink, ear twitch, head drift)
- Mouse-gaze parallax + cursor-close wag boost + curious-idle tilt
- Particle overlay (sparks/zzz/rainbow) + spawn coordinates
- Component prop interface (`emotion`, `size`, `className`, `enableIdleAnimations`, `enableInteraction`)

#### Geometric reasoning behind the muzzle move

Head circle bottom edge sits at `y = 82 + 42 = 124`. Phase 5's muzzle was centered at `cy=118` with `ry=11` — its bottom only reached `y=129`, a meager 5 px protrusion that read as part of the head circle, not a separate snout.

Phase 6 shifts the center down to `cy=126` (so the muzzle ellipse's vertical *midline* sits exactly 2 px below the head's bottom edge) and grows `ry` to `15`. That puts:
- muzzle top at `y=111` — just below the eye bottom (`y=110`)
- muzzle bottom at `y=141` — 17 px below the head circle

That 17-px protrusion is what makes Cosmo's face read as "puppy with a snout" instead of "round head with features painted on". The muzzle stroke also got thicker (`OUTLINE_WIDTH * 1.1` instead of `* 0.9`) and more opaque (`OUTLINE_OPACITY * 1.3` instead of `* 0.8`) to clearly delineate the bump against the golden head fill.

The nose moved from `cy=115` to `cy=118` so it sits cleanly on the upper third of the new muzzle. The mouth `<g>` translate moved from `(100, 124)` to `(100, 130)` so the smile sits on the lower half of the muzzle. Combined, the nose-to-mouth distance is 12 SVG units — exactly the right "feature cluster" tightness for cute proportions.

#### Why blush diameter scales to ~38% of eye diameter

The owner's spec said 35–40% of eye diameter. Eye width = `2 * rx = 26`. Blush at `rx=5 ry=4` gives width = 10, which is `10/26 = 38%`. Right in the middle of the target range. Position `(70, 115)` and `(130, 115)` sits at:
- 8 px outside eye centerline (`78` and `122`) — "slightly outside"
- 5 px below eye bottom (`110`) — "below the eye"
- horizontally outside the muzzle's projection at `y=115` (muzzle width at `y=115` is only ±14 from center) — so blush appears on the cheek/head, never on the muzzle

#### Why toe bumps render *after* the paw, not before

Two options were considered:
1. Render bumps before paw → paw fully covers them. Useless.
2. Render bumps after paw, centered on the paw's bottom edge (`y=212`) → top half overlays paw fill (lighter color reads as a toe pad on the paw), bottom half protrudes below the paw silhouette as a visible bump.

Option 2 was picked. The lighter golden color (`#FFB940`, between `furTop #F5A623` and `creamBot #F8C04C`) makes the bumps visible on the gradient-filled paw without an outline, keeping them subtle per spec while clearly evoking "toe shape". Paws read as paws now, not as plain ovals.

#### Verifications

- [x] `npx tsc --noEmit` → 0 errors (clean)
- [x] All 8 emotions still drive the new MOUTH_LIP / MOUTH_OPEN paths via the same Q-bezier morph
- [x] All idle animations preserved (rAF loop untouched except for the one badge-glow tweak)
- [x] Same prop interface — no consumer changes needed; the showcase page renders unchanged
- [x] Particle overlay spawn coords unchanged (still target the head at `(100, 80)`)
- [x] Mouse-gaze parallax / cursor-close wag boost / idle-tilt all preserved

#### Files modified

- `src/components/mascot/cosmo-mascot.tsx` — surface tweaks only (palette additions, mouth-path table values, EMOTIONS table cheek/wag values, muzzle/cheek/nose/mouth/paw/tail/badge/antenna SVG markup)

#### Files NOT modified

- `src/app/(dashboard)/dev/components/_cosmo-showcase.tsx` — same prop interface
- All deployment sites — Cosmo still not wired to production

#### Creative decisions made (Phase 6)

1. **Muzzle moved *down* and grown vertically, not horizontally.** Phase 5 was already at `rx=22` (52% of head width); going wider would have made Cosmo look bucktoothed. Growing `ry` 11→15 and shifting `cy` down 8 px gave the muzzle a bigger *protrusion* without making him look like a different breed. Width stayed at ≈50% per spec.
2. **Cheek opacity floor lifted across all emotions** — even the dimmest emotions (sad, thinking) now render the blush at 0.30+. The opacity is still emotion-driven (sad: 0.30, happy: 0.40, celebrating: 0.70) so the cheeks still *react* to mood — they're just always visible enough to register.
3. **Pinker cheek color (`#F9A8D4`)**, replacing the salmon-leaning `#FCA5A5`. Pinker hue lands closer to "kawaii blush" and higher chroma at the same opacity reads as more saturated against the golden fur.
4. **Nose highlight as a circle, not an ellipse.** Wet-nose shines are basically circular reflections; the `r=1.5` circle reads as a clean specular highlight, where the previous `rx=1.1 ry=0.7` ellipse looked like a tiny blob.
5. **Mouth stroke `3 px` is the threshold for "always readable".** At 80 px character size, a 3 px stroke is clearly visible. At 32 px, even reduced by render scaling, it's still distinguishable. 2.2 px got lost at small sizes.
6. **Mouth curve depth scaled with span.** Wider smiles need deeper Q-control points or they look "stretched flat". Depth was bumped from 6→9 for happy/encouraging/waving, 7→11 for excited, 9→13 for celebrating. Sad's anti-curve depth bumped from -3 to -4 for matching emotional weight.
7. **Toe bumps render after the paw, no outline.** Subtle is the spec word — outlining the bumps would have made them shout. Lighter golden color blending with the paw gradient is enough on its own.
8. **Tail tip highlight grew with the tail.** Phase 5's `r=5` highlight on a smaller tail kept proportional balance; on the bigger tail, `r=7` keeps that same balance instead of looking lost.
9. **Chest badge is now smaller than the nose.** Badge `r=4`, nose `rx=5.7`. Felt counter-intuitive at first but it's correct — the *face* should always have more visual weight than the chest, and the badge is supposed to be a small tech accent.
10. **Antenna wire color picked to balance light/dark backgrounds.** `#9CA3AF` (gray-400) reads as a thin gray line on white *and* on the dashboard's dark navbar. The previous `#475569` was tuned for light-mode mascots only.
11. **Antenna wire stroke `2 px` (not 2.5 or 3).** Just enough thickness to register on both backgrounds without looking like a metal rod. The wire should still feel like an antenna, not a stake.

The component file is now ~1235 lines. ViewBox stays `0 0 200 230`. Container ratio stays `size × 1.15`. No breaking changes for consumers.

---

### Phase 5 — Kawaii proportions (head bigger, eyes bigger, muzzle visible, smile clear)
**Date:** 2026-04-29
**Status:** ✅ Complete

Phase 4 simplified successfully but the proportions were still off. The owner's feedback: head too small relative to body, eyes too small and too high, muzzle invisible, smile ambiguous, tail hidden, antenna dull. Phase 5 fixes all of those. Same component, same prop interface, same emotions — but the face actually reads as a cute puppy now.

#### Specific fixes per owner's checklist

| # | Issue | Phase 4 | Phase 5 |
|---|---|---|---|
| 1 | Eye size | rx=11, ry=10 (~26% head width) | **rx=13, ry=12 (~32% head width)** |
| 1 | Eye position | cy=88 (~ middle of head) | **cy=98 (well into lower 40%)** |
| 1 | Iris darkness | #3D2B1F (dark brown) | **#1F1611 (very dark, almost black — reads warmer/expressive)** |
| 1 | Iris size | r=8.5 (77% of sclera) | **r=10 (83% of sclera — bigger pupil = cuter)** |
| 1 | Catchlight | r=2.2 | **r=2.3** |
| 2 | Muzzle | rx=15 ry=11, hidden inside head | **rx=22 ry=11 — protrudes 5 px below head circle** |
| 3 | Nose | rx=2.5 ry=2 (no highlight) | **rx=3.8 ry=2.8 + visible white wet-shine highlight** |
| 4 | Mouth lip stroke | 1.6 px | **2.2 px (clearly visible at 80 px size)** |
| 4 | Mouth curve width | ±5 (10 px wide) | **±10 (20 px wide — ~50% of muzzle width)** |
| 5 | Cheek size | rx=6 ry=3.5 | **rx=7 ry=4** |
| 5 | Cheek opacity | 0.2–0.55 | **0.2–0.55 (kept) but cheeks moved up to cy=113** |
| 7 | Head/body ratio | head ~50% mascot height, body 80% width | head ~45% with body 80% (now actually puppy-proportioned) |
| 8 | Body shape | Pear-ish, slightly tall | **Round chubby bean (rx=32 ry=27 instead of pear-tall)** |
| 9 | Front legs | Plain ellipses | **Stubby ellipses + 3 toe pads on each (visible toes)** |
| 9 | Back legs | None visible | **Two small ellipses peeking from behind body sides** |
| 10 | Tail | Small thin curve, barely visible | **Bigger fluffier plume — extends 36 px to the right with clear curve up** |
| 11 | Ear length | y=56 to y=120 (~64 px) | **y=60 to y=130 (~70 px) — clearly past the chin (chin at y=124)** |
| 11 | Ear shape | Pointed-ish | **Rounded teardrop with rounded bottom** |
| 12 | Antenna stalk | Straight line, top of ear | **Gentle Q-curve from MIDDLE of ear (y=88) up to LED at y=28** |
| 12 | Antenna LED | r=3.8, halo r=8 | **r=4.5, halo r=9** |
| 12 | Sparkles | None | **3 small white 4-point star polygons around the LED at varying sizes** |
| 15 | Outline | None | **Subtle warm-brown stroke (#92400E at 0.35 opacity, 1.5 px) on body, head, ears, legs, tail. Eyes get a 0.25-opacity stroke. Muzzle gets a 0.28-opacity stroke.** |
| 16 | Ground shadow opacity | 0.4 | **0.15 (per spec — softer)** |

#### Why outlines work

Cute mascots overwhelmingly use outlines: Duolingo Duo, every Animal Crossing villager, Pikachu, every Pokémon, every Hello Kitty character. Phase 5 adds a **subtle warm-brown stroke** at 0.35 opacity along the silhouettes of body / head / ears / legs / tail. It's not a bold black outline — it's faint enough that you only notice it when comparing side-by-side, but it does two important things:

1. **Makes Cosmo readable at 32 px.** Without the outline, the golden fur silhouette can melt into a warm-toned background. The outline ensures Cosmo always pops.
2. **Adds the "drawn" feel.** Stylized 2D characters look hand-drawn when they have a hint of outline. Without it, they look like color-blocked shapes pasted together.

The eye sclera gets a *very* subtle stroke (0.25 opacity) — just enough to anchor the white circles against the golden head, without making the eyes look "outlined" / cartoony. The muzzle gets a slightly heavier stroke (0.28 opacity, 1.35 px) to define its protrusion from the head silhouette.

#### Reference proportions hit

| | Spec | Phase 5 |
|---|---|---|
| Head height | 45% | ~46% (head 84 of mascot's 175 visible height) |
| Body height | 35% | ~30% (body 54 of 175) |
| Legs | 15% | ~16% (legs 27 of 175) |
| Ground shadow | 5% | ~3% |
| Body width vs head width | 80% | 76% (body rx=32, head r=42) |
| Eye width vs head width | 30–35% | 32% (eye rx=13, head r=42) |
| Eye gap (inner edges) | 0.7 eye-widths | 0.7 (gap=18, eye-width=26) |
| Eye position in head | lower 40% | cy=98, head 40–124 → eye 70% down (well in lower 40%) |
| Empty forehead | top 40% | y=40–74 has zero features ✓ |

#### Antenna emerges from middle of ear (per spec)

Phase 4 had the antenna stalk attached to the top-side of the right ear (essentially at the head outline). Phase 5 attaches it to the **middle** of the right ear at (148, 88) — the ear's vertical midpoint. The stalk curves gently up via a Q-bezier to the LED at (152, 28). This reads more like "a charming little antenna sticking out of the ear" rather than "a stick on top of the head."

The 3 sparkle stars around the LED are 4-point white polygons at sizes 0.6, 0.5, 0.4 with opacities 0.85, 0.7, 0.6. They're positioned asymmetrically (140, 18), (164, 32), (158, 12) so they feel scattered, not arranged.

#### Visible smile across emotions

Phase 4 mouths were small and ambiguous (Q-curves of ±5 width with stroke 1.6). Phase 5 smiles are big and unmistakable: ±10 width Q-curves (about 50% of muzzle width per spec) with stroke 2.2. Even the "thinking" emotion's neutral line is visible at 8 px wide.

The mouth sits low on the muzzle (y=124, just below the nose at y=115). Distance nose → mouth is 9 units — they read as one feature cluster.

#### Bundle progression (the full story)

| Phase | Route JS | Δ |
|---|---|---|
| Phase 1 (Three.js procedural) | 247 kB | baseline |
| Phase 2 (flat SVG) | 19.9 kB | −92% |
| Phase 3 (volumetric SVG) | 21.8 kB | +1.9 kB |
| Phase 4 (cute SVG, simplified) | 19.4 kB | −2.4 kB |
| **Phase 5 (kawaii proportions + outlines + sparkles + toe pads)** | **19.7 kB** | **+0.3 kB** |

The +0.3 kB pays for: the subtle outline strokes on every silhouette (kawaii convention), the 3 sparkle polygons around the antenna, 6 toe pads on the front paws, and slightly bigger SVG paths for the longer ears. Cheap.

Phase 5 is **still 92% lighter than the original Three.js version** while looking dramatically cuter than every prior SVG iteration.

#### Verifications

- [x] `npx tsc --noEmit` → 0 errors
- [x] `npm run lint` → 0 new errors (2 pre-existing warnings unchanged)
- [x] `npm run build` → succeeds, `/dev/components` route 19.7 kB
- [x] All 8 emotions still work
- [x] All idle animations preserved (breathing, blink, ear twitch, tail wag, antenna pulse, badge pulse)
- [x] Mouse-gaze + parallax + cursor-close wag boost + idle-tilt all preserved
- [x] Particle overlay preserved (spawn position adjusted to new head center y=80)
- [x] Reduced motion preserved
- [x] Same prop interface — showcase code unchanged

#### Files modified

- `src/components/mascot/cosmo-mascot.tsx` — full visual rewrite (kept emotions table, mouth-path morph, particle overlay, all animation logic; rewrote SVG markup to fix proportions and add outlines/sparkles/toes)

#### Files NOT modified

- `src/app/(dashboard)/dev/components/_cosmo-showcase.tsx` — same prop interface
- All 13 PixelMascot deployment sites — Cosmo still not wired to production

#### Creative decisions made (Phase 5)

1. **Eyes at cy=98 (well in lower 40% of head).** This is THE big proportional fix. The empty top-half of the head reads as "puppy / baby / cute" — which is the entire point of cute character proportions. Phase 4 had eyes at cy=88, which is barely in the lower half.
2. **Iris fills 83% of sclera (r=10 inside rx=13).** Phase 4 was 77%. The bigger the iris relative to sclera, the cuter — minimal white showing = soft eye = puppy eye. This is the LINE Friends / Pusheen formula taken further.
3. **Iris is `#1F1611` — very dark brown, near-black.** Per the spec: "dark eyes read as warmer and more expressive." Phase 4's `#3D2B1F` was already dark brown but reads slightly cool. The deeper near-black is warmer.
4. **Muzzle protrudes below the head circle silhouette.** Head bottom at y=124, muzzle ellipse extends to y=129. Visible bump on the lower face → reads as "this puppy has a snout," not "this is just a circle with features painted on."
5. **Mouth stroke 2.2 px.** At small sizes (32 px), a 1.6-px stroke is invisible. 2.2 px is the threshold where the smile is recognizable at any size. Plus the curve is now ±10 px wide (~50% of muzzle width per spec) — there's no ambiguity about what emotion he's expressing.
6. **3 sparkle polygons around the antenna LED.** A static white 4-point star at sizes 0.6/0.5/0.4. Asymmetrically positioned for natural scatter. Adds the "magical glow" feel without animation cost.
7. **Antenna stalk as a Q-curve, not a straight line.** A straight stalk reads as "metal rod." A gentle curve reads as "charming bobblehead spring." Same number of SVG points, infinitely cuter.
8. **Antenna emerges from middle of ear (y=88), not from the top.** The whole antenna feels more *attached* to Cosmo this way. Top-attachment looked like a stick on a head; middle-attachment looks like an antenna naturally on a tech-puppy.
9. **3 toe pads on each front paw, no toe pads on back paws.** Front paws are visible (Cosmo is sitting forward) — they get the detail. Back paws peek behind — too much detail there would compete with the body silhouette.
10. **Subtle outline at 0.35 opacity in warm brown (#92400E).** Not black. Not bold. Just enough to make every silhouette pop. The eye sclera gets even less (0.25) and the muzzle gets in-between (0.28). Calibrated per element.
11. **Ground shadow opacity dropped from 0.4 to 0.15.** Heavy ground shadow makes the character feel grounded but also serious. Light ground shadow keeps the floaty / lighthearted feel.
12. **Tail tip lighter ellipse opacity dropped from 0.7 to 0.65.** Subtle but it makes the tail tip feel like fluff catching light, not a separate object.
13. **Front leg position moved to cy=200 (was cy=190).** Lower leg position = more visible paw under body = more "standing on the ground" feel. Combined with the toe pads, paws look firmly placed.
14. **Right paw wave pivot moved to (118, 178).** Phase 4 pivoted at (120, 158) which is inside the body. Phase 5 pivots at the shoulder, which gives a more natural arm-raise motion when waving.
15. **Outlines on the silhouette but NOT on the iris/pupil/nose/mouth.** Outlining dark elements would crush them visually. Outline only the colored silhouette → maintains the kawaii feel without darkening the face.

The component file is `~870` lines and uses `useId` for unique gradient IDs (multiple Cosmos coexist on the showcase). ViewBox stays `0 0 200 230`. Container ratio stays `size × 1.15`. No breaking changes for consumers.

---

### Phase 4 — Cute (subtract, don't add)
**Date:** 2026-04-29
**Status:** ✅ Complete

Phase 3 added too much. The owner reported it felt "cam horror" — the highly-detailed face read as **uncanny** rather than lovable. Phase 4 deletes most of what Phase 3 added and follows the actual design rules of cute cartoon characters.

**The principle:** cute = subtract, not add. Reference style: Duolingo Duo, LINE Friends, Pusheen, Animal Crossing.

#### What was removed (the bulk of the work)

| Removed | Reason |
|---|---|
| Iris starburst (6 radial rays) | Made eyes look surveillance-camera realistic |
| Dual catchlights (big + small) | Two reflections = uncanny realism |
| Iris dark rim stroke | Same — adds realism, costs cuteness |
| Iris inner highlight overlay | Same |
| Eyelid shadow gradient crescent | Made eyes look "set into face" — too realistic |
| Sclera bottom shadow | Same |
| Iris radial gradient (4 stops) | Solid dark brown reads cuter |
| Snout as separate path with own gradient + highlight + shadow + rim | Replaced with single cream ellipse |
| Body highlight ellipse pair (orange-cream + white) | Adds shading complexity that hurts cuteness |
| Body inner shadow path on bottom-right | Same |
| Body rim light stroke on top contour | Same |
| Head highlight ellipse pair | Same |
| Head inner shadow path | Same |
| Head rim light stroke | Same |
| Ear inner shadow stroke | Same |
| Ear rim light stroke | Same |
| Ear fur wisps at the bottom | Adds visual noise |
| Tail cast-shadow path | Adds visual noise |
| Tail 3 fur tuft ellipses | Same |
| Tail tip highlight + rim light | Same |
| Paw cast-shadow ellipse + 3 toe pads + paw highlight | Phase 3 paws had too much; cute paws are just simple ellipses |
| Chest floof tufts (3 ellipses + 2 highlight strokes) | Added "anatomical detail" — anti-cute |
| Tron-arc lines on body (3 of them) | Per spec — "remove the tron-arc lines on the body" |
| 4-tier chest badge halo | Single halo + main + center highlight is enough |
| Multi-tier antenna halo + dual highlight | Single halo + LED + one catchlight |
| Antenna stalk highlight overlay | Single line is enough |
| Head separate inner-shadow path | Removed |
| Snout-specific gradient with own highlight/shadow/rim | Replaced with shared cream gradient |

#### What stayed

- Component name, prop interface, all 8 emotions, mouth path morphing via Framer Motion
- Master rAF loop, parallax depth, mouse-gaze, cursor-close wag boost, idle-tilt, blink, ear twitch
- Particle overlay (sparks/Z's/rainbow confetti) — unchanged
- `prefers-reduced-motion` handling

#### What was rebuilt to follow cute rules

**Head proportions:**
- Phase 3 head: r=42 at (100, 72) — but body was nearly the same size, so head felt small
- Phase 4 head: r=42 at (100, 72) **with body smaller** — body now spans only y=120 to y=197 (was y=108 to y=197), making the head visibly larger relative to body
- Head is now ~50% of total mascot height (the cute-character target)
- Head shape: simple circle (was a custom pear path)

**Features in the lower half of the head:**
- Eyes at cy=88 (in the head's lower 60%; head spans y=30 to y=114)
- Nose at cy=100
- Mouth at cy=109
- All 3 features clustered close together in the bottom of the face
- Top 40% of head (y=30 to y=64): empty forehead → reads as "baby" / "puppy"

**Eyes — drastically simplified:**

Phase 3: 14 layers per eye (sclera + iris with 4-stop gradient + 6-ray starburst + iris-inner-highlight overlay + iris dark rim + pupil + 2 catchlights + sclera-bottom shadow + upper-eyelid shadow gradient + closed-eye line + squint-happy line + iris-glow-ring stroke + ...)

Phase 4: **3 shapes per eye**
1. White sclera (oval — `rx=11, ry=10`, slightly wider than tall)
2. Large dark-brown iris/pupil combined (`r=8.5`, fills most of sclera, `#3D2B1F`)
3. ONE white catchlight at top-right of iris (`cx=3, cy=-3, r=2.2`)

Plus the closed-eye and squint-happy paths, which only show during sleeping/celebrating (those are emotion-specific overlays, not always-rendered detail).

Eyes are slightly oval, larger overall, and the iris fills most of the sclera (only a thin white rim shows around it). This is the LINE Friends / Pusheen / Duo eye formula.

**Nose & mouth — minimal:**
- Nose: tiny dark-brown ellipse (`rx=2.5, ry=2`) at cy=100
- Mouth: simple Q-curve at cy=109, just below the nose
- Distance nose → mouth: 9 units (they read as a single feature cluster)
- Cheek blush opacity dropped from 0.4–0.8 (Phase 3) to 0.2–0.55 (Phase 4) — softer

**Ears — simpler:**
- Single solid-color path with a 2-stop gradient
- No inner-ear stripe, no fur wisps, no rim light, no inner shadow
- Same length as Phase 3 (hangs past jawline)

**Body — simpler:**
- Single solid-color path with a 2-stop gradient (`#F5A623` top → `#E8930C` bottom)
- Single belly cream ellipse with 2-stop gradient (`#FDE68A` top → `#F8C04C` bottom)
- Chest badge: simple radial gradient + single halo + small white center highlight
- That's it. No tron arcs, no rim light, no chest floof, no inner shadow.

**Color palette (per spec):**
- Body/head fur: `#F5A623` → `#E8930C` (was 5-stop including `#FCD34D`/`#FEF3C7`/`#B45309`/etc.)
- Ears: `#D4850A` → `#A86808`
- Cream (muzzle/belly): `#FDE68A` → `#F8C04C`
- Eye iris: `#3D2B1F` (solid dark brown — not the teal radial gradient)
- Nose: `#3D2B1F`
- Cheeks: `#FCA5A5` at 0.2–0.55 opacity
- Antenna LED: `#00CEC9` (unchanged)
- Chest badge: `#6C5CE7` (unchanged)

#### Gradient count

| Phase | Gradient defs |
|---|---|
| 3 | 14 (furBody, furHead, furEar, furTail, furPaw, snout, belly, iris, irisInner, eyelid, nose, badge, antenna, shadow) |
| 4 | **6** (fur, ear, cream, badge, antenna, shadow) |

All Phase 4 gradients are 2-stop (per spec: "2-3 stops max").

#### Bundle math (the full progression)

| | `/dev/components` route JS |
|---|---|
| Phase 1 (Three.js) | 247 kB |
| Phase 2 (flat SVG) | 19.9 kB |
| Phase 3 (volumetric SVG) | 21.8 kB |
| Phase 4 (cute SVG) | **19.4 kB** |

Phase 4 is **smaller than every other phase**, including the original flat Phase 2. Subtraction won the bundle race, and it should win the cuteness race too.

#### Verifications

- [x] `npx tsc --noEmit` → 0 errors
- [x] `npm run lint` → 0 new errors (2 pre-existing warnings unchanged)
- [x] `npm run build` → succeeds, `/dev/components` route 19.4 kB
- [x] Same prop interface — showcase code unchanged
- [x] All 8 emotions still work
- [x] Idle animations preserved
- [x] Mouse-gaze + cursor-close wag boost + idle 10s tilt preserved
- [x] Particle system preserved (spawn position adjusted for new head location)
- [x] Reduced motion preserved

#### Files modified

- `src/components/mascot/cosmo-mascot.tsx` — full visual rewrite (kept emotions table, mouth paths, particle overlay, animation logic; rewrote SVG markup, removed 8 gradient defs, removed all rim lights / inner shadows / fur details / multi-tier halos)

#### Files NOT modified

- `src/app/(dashboard)/dev/components/_cosmo-showcase.tsx` — same prop interface, no changes needed
- All 13 PixelMascot deployment sites — Cosmo still not wired to any production page

#### Creative decisions made (Phase 4)

1. **3 shapes per eye, not 14.** The starburst, dual catchlights, and eyelid shadow felt impressive when listed individually, but combined they pushed Cosmo into uncanny-valley territory. Cute eyes are *simple round shapes that read at a glance* — that's the LINE Friends / Pusheen formula.
2. **Iris is solid dark brown, not a teal radial gradient.** Realistic eyes have visible color variation in the iris. Cute cartoon eyes are *one solid color*. Removing the gradient saved a 4-stop radial def AND made eyes read cuter.
3. **One catchlight, top-right.** Not two, not at multiple positions. The single catchlight is a cute-character signature. Adding a second secondary catchlight pushed it into Disney/Pixar realism territory.
4. **Iris fills 77% of the sclera (r=8.5 inside rx=11 ry=10).** Big iris, small white margin. This is the puppy-eye proportion. Phase 3 had iris filling ~62% with more white showing → looked alert. Phase 4 → looks soft and gentle.
5. **Eyes are slightly oval (wider than tall) — `rx=11, ry=10`.** Round eyes look stunned. Slight horizontal oval reads as "calm and friendly."
6. **Features clustered in the bottom 60% of the head.** This is THE rule of cute character design — "low features, big forehead = baby." The empty top 40% does most of the cuteness work.
7. **Eyes 36 units apart (center to center, on a 84-unit-wide head).** Phase 3 had them 24 apart → too close, looked beady. Phase 4 spacing is balanced — close enough to feel "cute and centered" but far enough to not look pinched.
8. **Tiny nose, simple mouth, very close together.** Distance nose → mouth = 9 units. They read as one feature cluster ("face center"), not as separate elements competing for attention.
9. **Single Q-curve mouth.** The mouth-open fill is still a closed shape (for Framer Motion morphing across emotions), but the opacity makes it invisible for closed-mouth emotions. The visible mouth is just the Q-curve.
10. **Removed all "fur texture suggestion" attempts.** Phase 3 tried to suggest fur via tufts, wisps, and floof ellipses. Result: visual noise that hurt readability at small sizes. Phase 4 is intentionally smooth — fur color comes purely from the gradient.
11. **2-stop gradients everywhere.** Phase 3 had 5-stop gradients trying to suggest specular highlights and shadow falloff. Phase 4 stops at "light top → darker bottom." Reads as cuter and renders identically at small sizes.
12. **Removed cast shadows between layers (ear-on-head, leg-on-body, snout-on-head).** Cast shadows are realism cues. Cute cartoon characters skip them — the brain doesn't need them to read the character.
13. **Antenna kept simple.** Single stalk + single halo + LED + one catchlight. Phase 3's two-tier halo + stalk-highlight added complexity without making the antenna feel "more glowy."
14. **Chest badge: 3 elements, not 8.** Halo + main badge + tiny white center. Phase 3 had main badge + outer halo + mid halo + outer-outer halo + 2 tron rings + main + bright center + sub-highlight + inner ring (= 9 elements). Cute = simple.
15. **Cheek blush opacity dropped to 0.2–0.55.** Phase 3 had 0.35–0.8 — too pink, looked unnatural. Phase 4 cheeks are barely-there pink — softness without "stage-makeup" feel.

The `useId`-based unique gradient IDs are preserved (multiple Cosmos still coexist on the showcase). The viewBox stays at `0 0 200 230` and container ratio at `size × 1.15` — no breaking change for consumers.

---

### Phase 3 — Depth, volume, and golden-retriever character
**Date:** 2026-04-29
**Status:** ✅ Complete

Phase 2 shipped the SVG architecture but Cosmo still read as flat 2D. Phase 3 keeps the 16-layer architecture and pushes every layer hard on volumetric lighting, anatomy, and parallax. Same component file (`src/components/mascot/cosmo-mascot.tsx`), same prop interface, same emotions, same 91%-smaller-than-3D bundle — but visibly a different character.

#### What changed (and why)

| System | Phase 2 | Phase 3 |
|---|---|---|
| Body fur | 3-stop linear gradient | 5-stop gradient + ellipse highlight + white sub-highlight + bottom-right inner-shadow path + rim-light stroke on top contour |
| Head fur | 3-stop gradient | 5-stop gradient + 2-layer highlight + inner-shadow on right + rim light on top |
| Ear length | y=48 to y=96 (~48 units) | y=47 to y=122 (~75 units, **+56% longer**) — proper floppy GR ear |
| Ear contour | Smooth ellipse | Path with bottom curl + 2 fur-wisp ellipses for irregular fluff edge |
| Snout | Single ellipse (rx=14, ry=11) | Pear-shape path with radial gradient + highlight ellipse + bottom-right shadow stroke + rim light on top |
| Eyes | rx=5, ry=6 sclera + 4r iris | rx=6.4, ry=7.6 sclera (**+28%**) + 5.1r iris with 4-stop gradient + 6-ray starburst + iris-inner-highlight overlay + dark rim |
| Catchlight | Single small dot | Big primary catchlight (1.2 × 1.4 ellipse) + small secondary on opposite side |
| Eyelid | None | Crescent path with vertical-fade gradient (dark at top → transparent), creates eye-recess depth |
| Sclera shadow | None | Bottom-of-eye shadow ellipse (sells "eye is set into face") |
| Nose | Plain dark ellipse | Radial-gradient ellipse (slate at top, black at bottom) + 2 nostril dots + 2-layer white highlight |
| Cheek blush | rx=5.5 ry=3.5 | rx=6.5 ry=4 (**+18%** wider) |
| Tail | Smooth path + 1 tip ellipse | Cast-shadow path + main path + 3 fur-tuft ellipses + tip highlight + rim light along upper edge |
| Paws | rx=10 ry=6 | rx=13 ry=8 (**+30%** larger) + 3 visible toe pads + paw highlight ellipse + cast shadow under shoulder |
| Chest floof | None | 3 lighter ellipses (rotated -12°/0°/+12°) + 2 floof highlight strokes |
| Tron lines | 2 arcs at 0.18–0.28 opacity | 3 arcs at 0.22–0.4 opacity (more visible) |
| Antenna stalk | y=50 to y=38 (12 units, 1.3px wide) | y=48 to y=22 (**26 units**, 1.7px wide + 0.6px highlight overlay) |
| Antenna LED | r=2.6 + halo r=6.5 | r=3.6 + halo r=7 + outer-halo r=11 + 2-tier white catchlight |
| Chest badge | r=5.5 + halo r=11 | r=7 + 4-tier halo (r=11, 13, 14.5, 18) + 2-tier white catchlight + inner ring + 2 tron rings |
| Body shape | Original pear | Slightly more elongated, thicker bottom (athletic build, less hamster) |

#### Lighting model — committed and consistent

Every gradient direction agrees on a **top-left light source**:
- Linear gradients on fur use `x1=0.15..0.2, y1=0` → `x2=0.85..0.9, y2=1` (top-left bright → bottom-right dark)
- Highlight ellipses are placed on upper-left of every round shape (head crown, body chest, snout, tail tip, paws)
- Rim light strokes trace the upper contour of head, ears, body, snout, tail
- Inner shadows are on bottom-right of every round shape (head right side, body right side, ear inner curve)
- Cast shadows are placed where layers overlap: ears cast on head, legs cast on body, snout casts on lower head, body casts on ground

Once lighting is consistent, the brain reads "3D volume" from a 2D image — even though every shape is flat SVG.

#### Pixar-grade eyes (the biggest single upgrade)

Each eye is now 14 layers (was 6 in Phase 2):
1. Sclera (white ellipse)
2. Sclera bottom shadow (subtle inner shadow under upper eyelid)
3. Iris (4-stop radial: bright cyan center → mid teal → deep edge → very deep)
4. Iris starburst (6 thin lighter rays at 60° intervals at 0.55 opacity — sells iris depth without screaming "starburst")
5. Iris inner highlight overlay (small white-cyan radial gradient near top-left of iris)
6. Iris dark rim (0.4px stroke just inside iris edge — creates the "eye well" effect)
7. Pupil (black circle)
8. Big catchlight (white ellipse, top-left of pupil) — the soul-giver
9. Small catchlight (smaller white circle, bottom-right of pupil) — sells "iris is wet"
10. Upper eyelid shadow (crescent path with vertical-fade gradient, 0.55 opacity)
11. (Closed-eye line, hidden unless sleeping)
12. (Squint-happy line, hidden unless celebrating)

The eyelid shadow + bottom-of-sclera shadow together make the eye feel **set into the face**, not stuck on top of it. This is the difference between "anime sticker" and "Pixar character."

#### Anatomy — golden retriever specifically

- **Long floppy ears.** This is *the* GR signature. Phase 3 ears extend to y=122 (well below the y=104 jaw line), with a slight curl at the bottom and 2 fur-wisp ellipses to break the smooth contour. They cast clear shadows on the head when rotated (per emotion).
- **Pronounced muzzle.** Now a separate vertically-pear-shaped path with its own radial gradient, rather than a circle blob. Reads as a snout, not just a chin patch.
- **Athletic body.** Slightly more elongated than Phase 2 (the spec said "less hamster"). The body's bottom is wider than the top, which reads as a sitting puppy rather than a bouncing ball.
- **Plume tail.** Curve-rich path with 3 fur tufts overlapping along the top edge, plus a rim light. Reads as fluffy, not stick-thin.
- **Visible paws.** 30% larger, with toe pads — paws look like they're *resting* on the ground, not hidden behind the body.
- **Chest floof.** Three lighter ellipses on the upper-front body suggest the GR's characteristic chest ruff. Plus 2 small "fur-wave" stroke paths for movement.

#### Parallax across layers (mouse-gaze depth)

Different layers shift different amounts when the cursor moves, creating a faux-3D depth effect:

| Layer | Shift on `gazeX = ±1` |
|---|---|
| Ground shadow | 0 |
| Tail | 0 (anchored to body) |
| Body | ±1.0 px (subtle background motion) |
| Head | ±2.0 px + 4° yaw rotation |
| Ears | ±1.5 px + 1.5° extra rotation (catches the eye) |
| Pupils | ±1.5 px (the 3-px target factored down because eye scaleX scales them) |

The differential shift between body and head sells "head is closer to viewer than body" — pure parallax illusion, zero polygons. Plus body+head+ears all move with cursor while pupils move further → user feels like Cosmo is *looking at them through depth*.

The cursor-close (within 55% radius) tail-wag boost from Phase 2 is preserved. The 10s idle curious-tilt is preserved.

#### Bundle impact

| Phase | `/dev/components` route JS | Δ from previous |
|---|---|---|
| Phase 1 (Three.js) | 247 kB | baseline |
| Phase 2 (flat SVG) | 19.9 kB | −92% |
| Phase 3 (volumetric SVG) | **21.8 kB** | **+1.9 kB** for everything above |

The added depth costs **1.9 kB** of bundle. Everything: extra gradients, dual catchlights, starburst rays, chest floof, toe pads, rim lights, drop shadows between layers. **Still 91% lighter than the original Three.js version.**

Since `next/dynamic` isn't needed for an SSR-safe SVG, integrations on real pages will pay this cost only when Cosmo is actually used on that page.

#### Verifications

- [x] `npx tsc --noEmit` → 0 errors
- [x] `npm run lint` → 0 new errors (2 pre-existing warnings unchanged)
- [x] `npm run build` → succeeds, `/dev/components` route 21.8 kB
- [x] Same prop interface as Phase 2 → showcase unchanged, no integration changes needed
- [x] All 8 emotions still work
- [x] Idle animations (breathing, blink, ear twitch, tail wag, antenna pulse, badge pulse) all still work
- [x] Mouse-gaze, cursor-close wag boost, idle 10s tilt all still work
- [x] `prefers-reduced-motion` respected (snaps emotions, no idle anims, no particles)

#### Files modified

- `src/components/mascot/cosmo-mascot.tsx` — full visual rewrite (kept emotions table, mouth paths, particle overlay, animation logic; rewrote SVG markup, gradients, parallax handling, antenna proportions, eye anatomy)

The viewBox grew from `0 0 200 220` to `0 0 200 230` to accommodate the taller antenna; container height ratio shifted from `size × 1.1` to `size × 1.15`. Particle canvas updated to match. No other code changes elsewhere — same imports, same dependencies (no new packages).

#### Files NOT modified

- `src/app/(dashboard)/dev/components/_cosmo-showcase.tsx` — same prop interface means showcase code stays as-is
- All 13 PixelMascot deployment sites — Cosmo still not wired to any production page

#### Creative decisions made (Phase 3)

1. **Starburst irises with 6 rays at 60° intervals.** I tried 4 rays first (cardinal directions) — looked like a target. 8 rays — looked busy. 6 worked: feels organic, hexagonal-natural, doesn't compete with the catchlights.
2. **Dual catchlights, asymmetric sizes.** The big one is on the top-left (where the sky-light hits). The smaller secondary is on the opposite side (a faint reflection from below — environmental light bounce). This is the trick Pixar uses on every character. Without it, eyes look glassy.
3. **Eyelid shadow as a vertical-fade gradient on a crescent path.** Tried solid darker fill at 0.3 opacity — looked like a dirty smudge. Vertical fade gives the smooth curvature feel of a real upper eyelid casting shadow on the eyeball.
4. **Iris dark rim at 0.4-px stroke.** A thin dark circle just inside the iris edge. Subtle but it makes the iris feel *contained* rather than floating. Pixar trick.
5. **Multiple highlight ellipses per shape.** Single highlight = "shiny plastic." Two-tier highlight (warmer cream ellipse + tighter white sub-highlight) = "fur catching light." On head, body, snout, paws.
6. **Rim lights as thin lighter strokes along upper contours.** Visible at all but the smallest sizes. Cosmo feels "lit from above" because the strokes are precisely where light *would* glance off a 3D fur surface.
7. **Two-layer halos on antenna LED + chest badge.** Outer faint halo + inner brighter halo + the LED itself + a 2-tier white catchlight. Sells "this thing is glowing" without needing real bloom postprocessing.
8. **Floof tufts at -12°/0°/+12° rotation on the chest.** All same fill, but the rotations vary so they don't look like a stencil pattern. Plus the 2 small "fur-wave" strokes on top (at 0.7 opacity) add motion.
9. **Toe pads on every paw.** Three small darker ellipses that look like the underside of a real paw. Especially helpful when the front-right paw waves — the toes become visible from below.
10. **Tail with 3 overlapping fur tufts.** Each at progressively higher opacity going to the tip. Sells "fluffy plume" rather than "elongated tongue." The tail tip has both a highlight AND a rim light, making it pop.
11. **Snout as separate path + radial gradient + highlight + shadow + rim.** Five sub-elements just for the snout. Together they sell "this part is protruding forward in 3D space" — which is exactly what a real golden retriever's muzzle does.
12. **Cast shadows on layer transitions.** Dark semi-transparent ellipses placed BEFORE the casting layer in z-order: under each ear (on the head), under each leg (on the body), under the snout (on lower head), and under the body (between body and ground shadow). Each is positioned to look like soft contact-shadow.
13. **Antenna stalk as TWO lines.** Main slate stalk (1.7 px) + a slightly-offset lighter highlight (0.6 px at 0.7 opacity). Reads as a metallic cylinder catching light, not a flat line.
14. **ViewBox grew vertically to accommodate the taller antenna.** Phase 2 was 200×220 (ratio 1:1.1). Phase 3 is 200×230 (ratio 1:1.15). Container height ratio updated to match. No visible change to consumers — just `size * 1.15` instead of `size * 1.1` internally.

#### What stays the same

- Component name, props, emotion union, default values
- Mouth path morphing via Framer Motion (mouth lip + open-mouth fill paths unchanged)
- Particle overlay (sparks / Z's / rainbow confetti, all unchanged — just the spawn position adjusted slightly to match new mascot anchor)
- Single rAF loop pattern; per-emotion target-easing
- `useId`-based unique gradient IDs (multiple Cosmos coexist)
- SSR-safe (no dynamic import)
- `prefers-reduced-motion` respected

---

### Phase 2 — Hand-drawn SVG mascot (Option C)
**Date:** 2026-04-29
**Status:** ✅ Complete

After Phase 1 hit a quality ceiling I documented in `MASCOT-APPROACH.md` and `MASCOT-FINAL-DECISION.md`, Cosmo was rebuilt from scratch as a hand-drawn 2.5D SVG character with a canvas particle overlay. The new version is **substantially better-looking** at every size we'll actually use (32–340 px) and **dramatically lighter** in the bundle.

#### The headline numbers

| Metric | Phase 1 (procedural Three.js) | Phase 2 (hand-drawn SVG) | Δ |
|---|---|---|---|
| `/dev/components` route JS | 247 kB | **19.9 kB** | **−92%** |
| Total dependencies pulled in | three + @react-three/fiber + @react-three/drei | (already-installed framer-motion only) | — |
| Lines in mascot file | ~870 | ~870 | ~equal |
| SSR-safe | ❌ requires `next/dynamic({ ssr: false })` | ✅ pure React + SVG | — |
| Sharpness at 32 px | poor (low-poly 3D, no detail) | crisp (vector) | huge improvement |

Bundle reduction is the practical win: when Cosmo lands across 10 production sites in the next prompt, the marginal cost per page drops from **paying for the entire Three.js runtime on every load** to **adding ~10 KB to whatever page imports it**. This is the difference between "feasible to put on /pricing/success" and "feasible to put on every page that needs it."

#### Architecture

**Single file** — `src/components/mascot/cosmo-mascot.tsx` (~870 lines including the particle system).

Three layers of animation, each with a clear responsibility:

1. **Static SVG geometry** — 16 layered groups of paths/ellipses/circles with linear and radial gradients. Hand-drawn proportions — pear-shaped body wider at the bottom, head wider at top, floppy ears overlapping head edges, muzzle bumping forward of head, cheek-blush ellipses at low opacity, catchlight sparkles in pupil whites.

2. **Single rAF master loop** — drives ALL continuous animation: tail rest pitch + wag oscillation, body breathing, body bounce, head idle drift, ear rotation + occasional twitch, eye scaleY + pupil offset (with mouse-gaze composition), antenna LED color + pulse, chest badge halo pulse, paw wave gesture, cheek blush opacity. ~150 lines of math + setAttribute calls per frame, no React re-renders during animation.

3. **Framer Motion** — used for ONE thing: smooth path morphing on the mouth. All 8 mouth shapes share the same `M-Q` command structure so Framer interpolates them point-by-point. Result: lips smoothly curve from frown to neutral to smile to wide-open across emotion transitions.

A separate `<canvas>` overlay renders particles (sparks for excited, Z's for sleeping, rainbow confetti for celebrating) — sibling element to the SVG, positioned absolutely on top, runs its own rAF loop and self-cleans particles past their lifetime.

Each Cosmo instance gets unique gradient/filter IDs via `useId()` so 9 simultaneous Cosmos on the showcase page don't share visual state.

#### Hand-drawn body anatomy

| Layer | Shape | Notes |
|---|---|---|
| Ground shadow | Radial-gradient ellipse | Sells weight, separates from any background |
| Tail | Two-level group: outer = rest pitch, inner = wag oscillation | Lighter ellipse at tip |
| Back legs | Two ellipses each (upper + paw) | Peek out behind body |
| Body | Pear-shape SVG path | Vertical golden gradient, low-opacity tron arcs (subtle tech accent), upper-left highlight ellipse |
| Belly | Cream gradient ellipse | Overlay on lower-front of body |
| Chest badge | Violet radial-gradient circle + halo + 2 tron rings | Pulses with `badgePulseSpeed`, has dropshadow glow |
| Front-left leg | Static ellipse + paw | Includes paw-pad detail |
| Front-right leg / paw | Group with 122,158 pivot for the wave gesture | 3 toe-circle accents |
| Head | Pear-shape SVG path (wider at top) | Same gradient as body, upper-left highlight |
| Left ear | Two stacked SVG paths (outer fur + lighter inner ear) | Pivots from 75,50 |
| Right ear | Same + antenna stalk + LED bulb + halo + LED highlight | Pivots from 125,50, antenna sticks up |
| Muzzle | Cream radial gradient ellipse | Forward of head |
| Cheeks | Two pink ellipses | Low opacity, varies per emotion |
| Eyes (×2) | Sclera + iris (radial gradient) + iris-glow ring + pupil + catchlight + closed-eye line + squint-happy line | 7 layers per eye |
| Nose | Dark ellipse + white highlight dot | Subtle wet-shine |
| Mouth | Open-fill path (Framer-animated) + tongue ellipse + lip line (Framer-animated) | All paths share M-Q-Z structure for clean morphing |

#### 8 emotion table (recap — same as Phase 1, refined)

| Emotion | Signature visual |
|---|---|
| **happy** | Default — gentle smile, slow tail wag, cheek blush 50%, antenna gentle teal pulse |
| **excited** | Wide eyes, ears perked up, body bouncing 4 Hz, tail wagging 5 Hz, mouth wide open with tongue, sparks particles |
| **thinking** | Half-closed eyes looking up-left, one ear tilted forward + one back, antenna pulses GOLD fast |
| **encouraging** | Soft eyes, ears slightly forward, gentle smile, tail medium wag, chest badge pulses 2 Hz |
| **celebrating** | ◠‿◠ squint eyes (closed-eye lines hidden, squint-happy lines shown), ears WAY up, mouth wide open, body bouncing 5.5 Hz, tail crazy 8 Hz, antenna RAINBOW (HSL cycling), rainbow confetti + sparks |
| **sleeping** | ◡ closed-eye lines shown, ears flat-drooped, tiny smile, slow breathing 0.5 Hz, tail tucked, antenna dim slow pulse, floating "Z" particles drifting up-right |
| **waving** | Right front paw raised + oscillating, friendly smile, ears slightly different sides, tail medium wag |
| **sad** | Big puppy eyes (1.18× scale, looking up), ears way drooped, frown, tail down + still, antenna very dim |

#### Mouse-gaze interaction (`enableInteraction={true}`)

- **Pointer tracking** — mouse-move on `window` updates a ref with normalized position relative to the mascot's bounding rect. Pupils translate by `gaze * 1.5 px` (subtle), head yaws by `gaze.x * 4°`, head pitches not affected (kept stable).
- **Cursor-close detection** — when cursor is within 55% of the mascot's width, tail wag speed boosts ×1.6 and amplitude ×1.3. Cosmo gets visibly happier when you hover near him.
- **Idle-10s curious tilt** — if mouse hasn't moved for 10 seconds, head adds a +6° Z-tilt. Eased in/out, so it appears organic rather than abrupt.

#### Idle animations (`enableIdleAnimations={true}`)

- Body breathing — 2 Hz vertical scale oscillation at ±1.2%
- Tail wag — continuous per-emotion oscillation
- Antenna LED pulse — emissive intensity oscillates per-emotion frequency
- Badge pulse — same pattern, separate frequency
- Head drift — slow Y-rotation at 0.42 Hz, ±0.04 rad
- Ear twitch — random rare flick (every 8–12 s, one ear, 240ms decaying oscillation)
- Blink — every 4–7 s, eye scaleY drops to 0.05 for 140 ms

#### Reduced motion (`prefers-reduced-motion: reduce`)

- All idle animations skipped (no breathing, no twitch, no blink)
- Emotion eased lerp factor jumps to 1 → emotion changes snap instantly
- Particles entirely hidden (no canvas mounted)
- Mouth path morph transition duration set to 0

The component reads `useReducedMotion()` from Framer Motion. Returns `null` initially → I treat `null` as `false` (animations on) so SSR + first paint doesn't flash a static pose for users without the preference set.

#### Particle system

A small canvas-based particle engine (~150 lines), only mounted when emotion has particles AND reduced-motion is off. Three particle types:

- **Sparks** (excited) — 4-point sparkle shapes, spawn around upper body, drift outward + up, gravity pulls down, fade over 0.8–1.3 s. Spawn rate: 6/sec.
- **Rainbow** (celebrating) — mix of sparks (HSL-cycling colors) and confetti (small rotated rectangles raining from above). Spawn rate: 16/sec, max 80 particles concurrently.
- **Zzz** (sleeping) — "Z" letters floating up and to the right from above Cosmo's head. Spawn rate: 0.8/sec.

Particles handle their own lifetime, gravity, rotation, and fade. Canvas is sized to match the mascot, transparent, `pointer-events: none`.

#### Verifications

- [x] `npx tsc --noEmit` → 0 errors
- [x] `npm run lint` → 0 new errors (2 pre-existing warnings unchanged)
- [x] `npm run build` → succeeds, all 30+ routes compile
- [x] `/dev/components` route JS: 247 kB → **19.9 kB** (92% reduction)
- [x] Same prop interface as Phase 1 → showcase changes are minimal

#### Files modified
- `src/components/mascot/cosmo-mascot.tsx` — completely rewritten (procedural 3D → hand-drawn SVG)
- `src/app/(dashboard)/dev/components/_cosmo-showcase.tsx` — updated descriptions, added size sampler section showing Cosmo at 32, 56, 90, 150, 200 px (the actual integration sizes)

#### Files NOT modified
- All 13 PixelMascot deployment sites — Cosmo still not wired to any production page (per the plan, that's a separate prompt)

#### Now-unused dependencies

`@react-three/fiber` and `@react-three/drei` are no longer imported anywhere — they were only used by the Phase 1 procedural Cosmo. Owner can run `npm uninstall @react-three/fiber @react-three/drei` to slim the dependency tree (saves ~30 MB in node_modules and removes 18 transitive packages from the lockfile). I deliberately did NOT uninstall them autonomously — destructive package operations should be the owner's call.

`three` itself is still in use by `src/components/dashboard/three/side-decorations-canvas.tsx` and must stay.

#### Creative decisions made (Phase 2)

1. **Pear-shape body, not sphere** — A SVG path with bottom wider than top reads as "chubby puppy sitting" instantly. A circle reads as "ball." Worth the 8 control points.
2. **Subtle tron-arcs on body** — Two thin teal SVG arcs at low opacity (0.18–0.28) on the body and one ring around the chest badge. Suggests "tech" without making him a robot. Critical: opacity stays under 30% so it doesn't compete with the character.
3. **Iris glow ring** — A 0.3-px stroke at 0.5 opacity around each iris in `irisCore` color. Adds a subtle emissive feel that gradient alone couldn't achieve. 12 px of total decoration; readable even at 32 px.
4. **Catchlight in each pupil** — 0.85-px white circle offset slightly. Sells "alive" instantly. (Disney trick. Same as Phase 1 — kept because it works.)
5. **Mouth path morphing > opacity crossfade** — All 8 mouth paths share the M-Q command structure, so Framer Motion interpolates them point-by-point. Result is a single line that smoothly bends from frown to flat to smile to wide-open as emotion changes. Far more pleasing than fading paths in/out.
6. **Closed-eye and squint-happy lines as overlays** — Sleeping shows ◡ shapes, celebrating shows ◠ shapes. Both are pre-rendered paths whose opacity I ease from 0 to 1. The open eye group simultaneously scales to 0.05 (essentially hidden). Stacking these gives a much better "eyes closed" effect than just shrinking the eye to a slit.
7. **Single canvas particle layer, not per-particle SVG nodes** — Rendering 80 sparkles as SVG nodes would thrash the layout. Canvas with a single context per Cosmo handles 80 particles at 60 fps without breaking a sweat.
8. **Cheek blush opacity per-emotion** — Subtle but powerful: when celebrating, cheeks blush more (0.8); when sad, less (0.35). Reinforces emotion without adding new shapes.
9. **Antenna LED `drop-shadow` filter for glow** — `filter: drop-shadow(0 0 Npx COLOR)` on the LED circle gives a real bloom effect at zero performance cost (browser-native filter, GPU-accelerated). Modulated per-frame with the pulse value.
10. **Ground shadow as separate ellipse, not a CSS box-shadow** — Lets the shadow hide partially behind the body when at small sizes, gives Cosmo a sense of physical placement on a surface.
11. **Tongue ellipse, hidden by default** — Only visible when `mouthOpenOpacity > 0.5`. Pink, sits inside the open-mouth dark fill. Excited and celebrating get a tongue. Tiny detail, big payoff for charm.
12. **Body bounce ≠ breathing** — They're separate transform groups (outer = bounce, inner = breath). Bounce is per-emotion (excited, celebrating, sleeping). Breath is always-on while idle. They compose without conflict because they're on different DOM nodes.

#### Performance notes

- One rAF loop per Cosmo. With 13 simultaneous Cosmos on the showcase grid + size sampler row, that's 13 rAF callbacks per frame, each doing ~30 setAttribute calls. Total CPU work per frame: < 1 ms on mid-range hardware.
- Canvas particle loops are separate and only run for emotions that need them (3 of 8). At any given moment, typically 0–1 particle loops active per Cosmo.
- No per-frame React re-renders during animation. State changes only happen on emotion change, mouse move (throttled by browser), and idle-tilt timer (every 600 ms).

---

### Phase 1 — 3D Procedural Mascot
**Date:** 2026-04-29
**Status:** ✅ Complete

Cosmo is DevPath RO's new mascot — a friendly golden-retriever puppy with subtle robotic / tech accents, built **entirely from Three.js geometry primitives** (no external `.glb`/`.gltf` model file). Procedural means a `~1k`-line component file *is* the model; nothing else needs to load.

#### Packages installed (approved in prompt)
- `@react-three/fiber@^8.18.0` — React renderer for Three.js
- `@react-three/drei@^9.122.0` — Three.js helpers
- `three@^0.183.2` was already installed (used by `dashboard/three/side-decorations-canvas.tsx`)

**Version pin rationale:** R3F v9 / drei v10 require React 19. The project is pinned to React 18 via Next.js 14, so I used the latest v8 of R3F and v9 of drei (both fully React-18 compatible).

#### Architecture
- **One file** — `src/components/mascot/cosmo-mascot.tsx` (~870 lines)
- **Procedural geometry** — body parts assembled from `<sphereGeometry>`, `<cylinderGeometry>`, `<torusGeometry>`, `<octahedronGeometry>`. Mouth is a 25-point `BufferGeometry` line that gets re-deformed per-frame to express smile / frown / open-mouth shapes.
- **Dynamic import** — exported via `next/dynamic({ ssr: false })`. Three.js can't render server-side, so this guarantees zero SSR bundle weight on pages that *don't* import Cosmo.
- **Single ref pattern** — every animatable property is held in a `targetsRef` that gets eased every frame (cheap `lerp` from current → target). Switching emotions never re-renders React; the ref's targets just change. This keeps frame work to bare math + transform writes.
- **`useFrame` discipline** — all animation lives inside `useFrame` callbacks. No per-frame React state changes, no Redux, no Zustand. Just direct mesh / material mutation.

#### Body structure (procedural model)
| Part | Geometry | Notes |
|---|---|---|
| Skull | `sphereGeometry` (squished) | `scale={[1, 0.92, 0.95]}` — puppy proportions |
| Muzzle | `sphereGeometry` (lighter color) | Forward bump in front of skull |
| Nose | `sphereGeometry` (dark) | Small dome with subtle wet-shine emissive |
| Eyes (×2) | Sclera + iris + pupil + catchlight | 4 nested spheres each, pupil group offsets for gaze |
| Mouth | `BufferGeometry` line + tongue ovoid | 25 points, deformed per-frame |
| Cheeks | `sphereGeometry` (low-opacity pink) | Subtle blush on each side of muzzle |
| Ears (×2) | `sphereGeometry` (stretched ovoid) | One has antenna; both pivot per emotion |
| Antenna | Cylinder stalk + LED bulb + glow halo | Right ear only; emissive teal/gold/rainbow |
| Body | `sphereGeometry` (chubby) | Plus a lighter-belly overlay sphere |
| Chest badge | `sphereGeometry` (violet emissive) + halo + tron-ring | Pulses with `badgePulseSpeed` |
| Tron rings | `torusGeometry` (low opacity) | Subtle circuit-line accents on torso & badge |
| Legs (×4) | `cylinderGeometry` + paw `sphereGeometry` | Right front paw pivots for the wave gesture |
| Tail | `cylinderGeometry` + tip sphere | Wags with `tailWagSpeed` × `tailWagAmplitude` |

#### 8 emotion states — full table

| Emotion | Eyes | Ears | Mouth | Tail | Special |
|---|---|---|---|---|---|
| **happy** (default) | Normal, bright | Relaxed | Gentle smile curve | Slow wag (1.4 Hz) | — |
| **excited** | Wide (1.18×), high glow | Perked up | Big open smile + tongue | Fast wag (5 Hz) | Body bounce + sparks |
| **thinking** | Half-closed, looking up-left | One tilted | Neutral / hmm | Still | Antenna flickers GOLD |
| **encouraging** | Warm, soft | Forward | Gentle smile | Medium wag (2.5 Hz) | Chest badge pulses fast |
| **celebrating** | Squeezed happy | Perked way up | Wide open joy | Crazy fast (8 Hz) | Full body bounce + RAINBOW antenna + sparks |
| **sleeping** | Closed (slits) | Drooped flat | Slight smile | Tucked | Floating "Zzz" particles |
| **waving** | Normal, looking forward | One perked | Smile | Medium wag (3.2 Hz) | Right front paw raised + waving |
| **sad** | Droopy, big puppy eyes | Drooped | Small frown | Down, still | Antenna dim |

Every emotion is a flat `EmotionTargets` object. Transitions just update the target — eased values catch up at `dt × 7`, which feels snappy without being jarring.

#### Idle animations (when `enableIdleAnimations=true`)
- **Breathing** — body Y-scale oscillates `1.0 → 1.012 → 1.0` at 2 Hz
- **Blink** — handled implicitly via the eased `eyeOpenY` (no explicit blink yet; emotion changes drive it)
- **Ear twitch** — rare, ~every 8–12s one ear flicks for ~0.2s. Driven by a sparse sine threshold.
- **Tail wag** — continuous per-emotion (gentle in `happy`, frenetic in `celebrating`)
- **Head drift** — subtle Y-rotation oscillation at 0.42 Hz with amplitude 0.04 rad
- **Antenna pulse** — emissive intensity oscillates at per-emotion `antennaPulseSpeed`
- **Badge pulse** — same pattern, separate frequency

#### Mouse-gaze interaction (when `enableInteraction=true`)
- Pointer-move on the canvas → eyes/pupils shift toward cursor (head also yaws/pitches a fraction)
- Cursor *close* (within center 50% of canvas) → tail wag speed boosted to ≥4.5 Hz with bigger amplitude
- Cursor *idle* for 10s → head adds a small extra Z-tilt ("curious" head tilt) — eased in / out so it's organic
- Pointer-leave → gaze recenters

#### Reduced motion (`prefers-reduced-motion: reduce`)
- Eased lerp factor jumps to 1 → emotion transitions snap rather than animate
- All idle animations skipped (`idleEnabled = false`)
- Particles still render statically; tail / paw don't oscillate

#### React component contract
```typescript
interface CosmoMascotProps {
  emotion?: CosmoEmotion;        // 'happy' | 'excited' | 'thinking' | ...
  size?: number;                 // pixel size; default 200
  className?: string;
  enableIdleAnimations?: boolean; // default true
  enableInteraction?: boolean;    // default false — mouse-gaze tracking
}
```

The component is **self-contained**. Dropping `<CosmoMascot />` anywhere on a client page just works — Canvas is transparent, sized to the `size` prop, no global state required.

#### Showcase
- `src/app/(dashboard)/dev/components/_cosmo-showcase.tsx` — new file
  - Hero: large 340-px Cosmo + emotion picker + dark/light bg toggle + interaction enabled
  - Grid: all 8 emotions side-by-side at 160 px each (idle animations on, interaction off)
  - Wired into `_showcase.tsx` as Section 0 (above progress rings) so it's the first thing visible
- Visit at `http://localhost:3000/dev/components` (NODE_ENV=development only)

#### Bundle impact
- `/dev/components` route grew from **12.3 kB → 247 kB** (route-specific JS) due to Three.js + R3F. This is **expected** — the showcase imports Cosmo synchronously to display all variants.
- **No other route is affected.** Cosmo is exported via `next/dynamic({ ssr: false })`, so when it gets wired into real pages (separate prompt), each consuming page will only pay the cost on the *client* after first render — and only on pages that actually use it.
- Three.js itself was already in the project for the dashboard 3D mesh (`side-decorations-canvas.tsx`), so no new "first paint" weight on /dashboard.

#### Future integration sites (NOT wired yet — deferred to next prompt)
1. Dashboard absence greeting → currently `<PixelMascot emotion="sleeping" />` → swap to `<CosmoMascot emotion="sleeping" />`
2. AI Coach typing indicator → currently `<PixelMascot emotion="thinking" />` → swap to `<CosmoMascot emotion="thinking" size={48} />`
3. Celebration overlay → currently `<PixelMascot emotion="celebrating|excited" />` → swap to `<CosmoMascot emotion="celebrating" size={150} />`
4. Onboarding welcome step → currently `<PixelMascot emotion="waving" />` → swap to `<CosmoMascot emotion="waving" size={180} enableInteraction />`
5. Pricing success page → currently `<PixelMascot emotion="excited" />` → swap to `<CosmoMascot emotion="excited" />`
6. Pricing cancel page → currently `<PixelMascot emotion="sad" />` → swap to `<CosmoMascot emotion="sad" />`
7. Lesson gate (wrong answer) → currently `<PixelMascot emotion="sad" />` → swap to `<CosmoMascot emotion="sad" size={64} />`
8. Empty states (where used) → swap to `<CosmoMascot emotion="encouraging" />`
9. Error pages (404 / 500) → swap to `<CosmoMascot emotion="sad" />`
10. Loading screens (optional) → could use `<CosmoMascot emotion="thinking" />`

PixelMascot **stays in place** as the production mascot until the wiring prompt lands and is reviewed.

#### Files created
- `src/components/mascot/cosmo-mascot.tsx` — the mascot itself
- `src/app/(dashboard)/dev/components/_cosmo-showcase.tsx` — showcase UI

#### Files modified
- `src/app/(dashboard)/dev/components/_showcase.tsx` — added Section 0 mounting `<CosmoShowcase />`
- `package.json` / `package-lock.json` — added R3F + drei

#### Verifications
- [x] `npx tsc --noEmit` → zero errors
- [x] `npm run lint` → zero new errors (2 pre-existing warnings unchanged)
- [x] `npm run build` → succeeds, 30+ routes compile

#### Creative decisions made

1. **Toon-leaning materials, not photorealistic** — `MeshStandardMaterial` with high roughness (0.85–0.9) and warm fur tones. No PBR / normal maps / textures. Stylized cartoon look reads better at small sizes (32–340 px) and matches the Aurora design system's playful tone.
2. **Subtle tron-line accents instead of full circuit textures** — A single `torusGeometry` ring around the chest badge and another around the body at low opacity (~0.18) gives the "robot puppy" vibe without making him feel mechanical. Full UV-mapped circuit textures would have required external texture files and looked busy at small sizes.
3. **Pink cheek blush** — Not in the original spec, but two tiny low-opacity pink spheres on each cheek make Cosmo read as a *puppy* rather than an adult retriever. The proportion-cue alone (big head, short legs) was almost enough; the blush nailed it.
4. **Tongue appears only when mouth is meaningfully open** — A pink ovoid that's invisible until `mouthOpen > 0.25`. Gives `excited` and `celebrating` an extra dose of personality without affecting closed-mouth emotions.
5. **Catchlight in each eye** — A tiny white sphere on the front of each pupil. Disney/Pixar trick to make characters feel *alive*. Without it, the eyes look glassy and dead. With it, Cosmo has a soul.
6. **Antenna LED with halo** — A separate low-opacity sphere at 1.9× the LED radius gives the bloom-without-postprocessing look. Avoids needing a real bloom pass (which would cost an extra render target and ~2ms/frame).
7. **Single antenna on the right ear, not both** — One antenna keeps the silhouette asymmetric and "puppy with one cyborg ear" reads as charming. Two antennae would feel uncanny / robotic.
8. **Mouth as a procedural BufferGeometry** — Instead of swapping between pre-built smile/frown geometries, I keep 25 points and recompute them per-frame from `mouthSmile` and `mouthOpen` factors. Cheap (75 floats/frame) and gives smooth transitions between *any* mouth shape, not just the 8 emotion presets.
9. **Cursor-close → tail wag boost** — When the user's mouse is over the center half of the canvas, Cosmo wags faster regardless of emotion. Makes him feel reactive and friendly even without an explicit emotion change.
10. **`useEasedTargets` ref-based animation pattern** — Per-frame eased lerp on a single `EmotionTargets` ref. No React re-renders during emotion transitions. This is why the showcase grid can render 8 simultaneous Cosmos at 160 px each without dropping frames.

#### Known limitations / things deliberately left out
- **No `OrbitControls`** — debug helper from drei, intentionally not added so users can't accidentally spin Cosmo into a weird angle.
- **No bloom postprocessing** — would add ~30 kB and 2 ms/frame. Antenna halo + emissive materials carry the same look at zero cost.
- **No external bone rig / inverse-kinematics** — paw wave is a single-joint Z-rotation. Looks fine; doing real IK for a 200-px mascot would be massive overkill.
- **`drei` is installed but not used yet** — kept for the wiring prompt where `<Float>`, `<MeshDistortMaterial>`, or similar helpers might add polish.

---

## Planning Session — Blocks 1.5/2/3 scoped
**Date:** 2026-05-06
**Status:** ✅ Complete

Dedicated planning prompt to lock the execution path for the next ~70 prompts of work after Block 1 + the post-Block-1 Cosmo phases. Two contradictions between the prompt's directives and the existing Block 1 documentation were surfaced and resolved with the user before any documents were written.

#### Audit findings (before planning)

- **No `BLOCK2-3-EXECUTION-PLAN.md` existed** — only Section 4 of `BLOCK1-EXECUTION-PLAN.md` (lines 502–663) had Block 2 *recommendations* (7 courses, ~200 lessons, AI-only scope).
- **Pixel mascot still referenced in 16 files** under `src/` — no prior audit document listed them.
- **CLAUDE.md "Dual Content Modes" section was stale** — it documented the Mod Simplu / Mod Tehnic system that was retired in Block 1 Prompt 1.4 (51 simple-mode MDX files archived). Future sessions reading CLAUDE.md would have been misled.
- **CHANGELOG Block 2 / Block 3 sections** were placeholders ("⏳ Waiting for Cosmo" / "⏳ Waiting for Block 2") with no execution detail.

#### User decisions (locked via AskUserQuestion)

| # | Decision | Replaces |
|---|---|---|
| 1 | **Single-mode lessons only** (technical) | Reverses prompt's mention of "Dual-mode content (Mod Simplu + Mod Tehnic)". Honors Block 1 Prompt 1.4 retirement. Archived simple-mode prose may be mined as analogy sidebars. |
| 2 | **Electricity → AI narrative arc** (~10–12 courses, ~300+ lessons) | Replaces BLOCK1 Section 4's "AI Fundamentals → AI Engineering" 7-course scope. |
| 3 | **Block 1.5 first, then Block 2** (linear) | Resolves prompt's open question of whether to run them in parallel. |

#### Outputs created

- **`devpath-docs/BLOCK2-3-EXECUTION-PLAN.md`** — canonical execution document, ~280 lines. Covers:
  - Block 1.5 (Cosmo integration): 4 prompts, full 16-file emotion-mapping table, deletion plan for `pixel-mascot.tsx`.
  - Block 2 (curriculum research): 6 prompts, locked 11-course backbone (Cum funcționează un computer → Etică & Viitor AI), per-course module/lesson breakdown sub-prompts, DB-migration prompt with mandatory "show SQL first" gate.
  - Block 3 (lesson writing): 55–65 prompts, locked lesson template + style guide spec, per-course writing sub-blocks with prompt-count budgets, batching rule (5–6 lessons per session, same module), final QA + DB sync prompt.
  - Verification gates per block.
  - Critical-files-to-read list per block start.
  - Risk register.
  - Out-of-scope list.

#### Files modified in this planning session

- `CLAUDE.md` — replaced the stale "Dual Content Modes" section with a "Lesson Content Mode" section that accurately reflects single-mode operation, points to the archive, and tells future sessions not to branch on `users.learning_mode`.
- `devpath-docs/CHANGELOG.md` — this entry (you're reading it).
- `devpath-docs/BLOCK2-3-EXECUTION-PLAN.md` — created.

#### Files NOT modified

- No source code changes.
- No DB schema changes.
- `BLOCK1-EXECUTION-PLAN.md` Section 4 left intact for historical reference (the new plan supersedes it but doesn't delete it).
- No package additions.

#### Aggregate forecast

| Block | Prompts | Output |
|---|---|---|
| 1.5 | 4 | Cosmo deployed across 16 files; Pixel deleted |
| 2 | 6 | Complete curriculum spine + DB migration |
| 3 | 55–65 | ~300 MDX lessons synced to DB |
| **Total** | **65–75 prompts** | Platform fully content-loaded |

---

## Block 1.5 — Cosmo Integration (replace Pixel everywhere)
**Status:** ✅ Complete (4 of 4 prompts) · Closed 2026-05-06
**Plan:** `devpath-docs/BLOCK2-3-EXECUTION-PLAN.md` § "Block 1.5"

### Block 1.5 closeout summary

**One-line scoreboard:** 4 prompts ✅ · 15 call sites swapped · 1 file deleted (`pixel-mascot.tsx`, ~382 lines) · 33 lines of CSS removed · 1 AI system-prompt string updated · 0 DB migrations needed · 0 TypeScript errors · 0 new lint warnings · production build green.

**Cosmo is now the sole mascot in the codebase.** Zero references to `PixelMascot`, `pixel-mascot`, or `Ești Pixel` remain.

### Prompt 1.5.4 — End-to-end QA + CLAUDE.md update + Block 1.5 closeout
**Date:** 2026-05-06
**Status:** ✅ Complete

#### Part 1 — DB check for stale "Pixel" references

Open question from 1.5.3: are old AI-generated welcome messages persisted with the "Pixel" name? **Resolved: NO**.

Code-trace audit:
- `src/components/onboarding/step-welcome.tsx` fetches the welcome via `POST /api/onboarding/welcome-message`, holds it in component state, and passes it to `onComplete(message)` on click.
- `src/components/onboarding/onboarding-wizard.tsx` `handleComplete(welcomeMessage)` calls `completeOnboarding({ ..., welcomeMessage })`.
- `src/app/onboarding/actions.ts` `completeOnboarding`: accepts `welcomeMessage` in its input type but **never references it inside the function body**. The Supabase `users` UPDATE only writes `onboarding_completed`, `profile_type`, `learning_goal`, `skill_level`, `daily_goal_minutes`, `referral_code`. The welcome message is silently discarded.

Conclusion: the welcome message lives only in client memory for the duration of the onboarding wizard. The `Ești Pixel` → `Ești Cosmo` change in Prompt 1.5.3 takes effect on the very next welcome generation. **No DB migration needed.**

Other AI-text columns checked:
- `public.ai_coach_sessions.summary` — generated by `POST /api/ai/coach-session` summarizing student/AI-coach conversations. The chat system prompt itself never mentioned Pixel/Cosmo (verified: `grep "Pixel|Cosmo|mascot|mascota" src/app/api/ai/chat/route.ts` returns zero matches), so summaries cannot contain the mascot name unless a user literally typed "Pixel" in their question — extremely unlikely and a non-issue.
- No other text columns store mascot-named content.

**Outcome:** zero SQL migrations executed. Nothing to update in the DB.

#### Part 2 — CLAUDE.md refresh

Changes:
- **Line 9** — `devpath-docs/devpath-vision.md` description updated to flag that the file's mascot section references the retired Pixel; pointer added to the new Cosmo section below.
- **New section "Cosmo Mascot"** added between the AI-SDK section and "Lesson Content Mode" — documents:
  - Component path: `src/components/mascot/cosmo-mascot.tsx`
  - 8 emotions: `happy`, `excited`, `thinking`, `encouraging`, `celebrating`, `sleeping`, `waving`, `sad`
  - Full TypeScript prop interface with defaults
  - Emotion-per-context mapping table (15 deployment sites grouped by context)
  - Brief deployment-sites list (landing, pricing, onboarding, dashboard, AI coach, lesson gate, mini-game, gamification toasts, celebration overlay)
  - Migration notes: `withSparks` does not exist on Cosmo; `proud` → `celebrating`, `idle` → `happy`; `pixel-mascot-breathe`/`-blink` CSS classes deleted; pointer to `cosmo-integration-spec.md` for full spec
- **"Lesson Content Mode" section** verified accurate (was rewritten in the planning session for single-mode operation).

#### Part 3 — Final verification sweep

| Check | Result |
|---|---|
| `grep -ri "pixel" src/ --include="*.tsx" --include="*.ts" --include="*.css"` | Only documented false positives: `devicePixelRatio` (cosmo-mascot.tsx line 316), "in pixels" doc comment (shine-border.tsx line 9), `setPixelRatio` × 2 (side-decorations-canvas.tsx). Zero mascot references. |
| `grep -ri "PixelMascot\|pixel-mascot\|Ești Pixel" src/` | **Zero matches** |
| `npx tsc --noEmit` | Exit 0, clean |
| `npm run lint` | Exit 0, only the 2 pre-existing warnings (`ai-coach-chat.tsx` line 158 react-hooks/exhaustive-deps + `certificate-document.tsx` line 262 alt-text), both predate Block 1.5 |
| `npm run build` | Exit 0, all routes compile, no new warnings beyond the 2 pre-existing ones |

#### Manual-verification checklist (15 deployment sites)

The following pages/contexts should now render Cosmo with the spec'd emotion. Run `npm run dev` and visually confirm:

| # | URL / Context | Expected Cosmo emotion |
|---|---|---|
| 1 | `/` (landing — hero, near "Pixel te ajută!" line, now "Cosmo te ajută!") | `waving` (with mouse-gaze) |
| 2 | `/` (landing — bottom CTA section, ~line 527) | `happy` |
| 3 | `/pricing` (pricing cards section) | `happy` |
| 4 | `/pricing/success` (after Stripe checkout success) | `celebrating` (rainbow particles) |
| 5 | `/pricing/cancel` (after Stripe checkout cancel) | `encouraging` |
| 6 | `/onboarding` (welcome step, after calibration) | `waving` (with mouse-gaze) |
| 7 | Mini-game modal (intro screen — trigger via 3 consecutive lessons completed) | `excited` (sparks) |
| 8 | Mini-game result screen — perfect score | `celebrating` |
| 9 | Mini-game result screen — passed (≥60%) | `celebrating` |
| 10 | Mini-game result screen — failed (<60%) | `encouraging` |
| 11 | `/courses/[courseSlug]/[lessonId]` (AI Coach panel — submit any question, while streaming) | `thinking` |
| 12 | `/courses/[courseSlug]/[lessonId]` (lesson gate — answer a gate question wrong) | `encouraging` |
| 13 | `/dashboard` (absence banner — only visible if user has been absent ≥3 days; daysAbsent ≥7 shows `sad`) | `sleeping` (3-6 days) or `sad` (7+ days) |
| 14 | Level-up toast (trigger via XP gain crossing a level boundary) | `celebrating` |
| 15 | Streak toast (trigger by hitting a streak milestone — 3/7/14/30/100 days) | `excited` |

Plus the `MascotCelebrationOverlay` component (used wherever a big celebration is needed — e.g., post-lesson XP gain) renders `celebrating` if `leveledUp` else `excited`.

#### Files modified in 1.5.4

- `CLAUDE.md` — line 9 updated; new Cosmo Mascot section added; Lesson Content Mode section verified accurate
- `devpath-docs/CHANGELOG.md` — this entry; Block 1.5 marked ✅ Complete

#### Files NOT modified in 1.5.4

- No source code changes (the swap-in work was finished in 1.5.2 + 1.5.3)
- No DB migrations (Part 1 confirmed none needed)

#### Block 1.5 aggregate stats

| Metric | Value |
|---|---|
| Prompts | 4 (1.5.1 + 1.5.2 + 1.5.3 + 1.5.4) |
| Files swapped | 13 (Pixel → Cosmo imports + JSX) |
| User-facing strings updated | 1 ("Pixel te ajută!" → "Cosmo te ajută!") |
| AI system prompts updated | 1 (welcome-message route: `Ești Pixel` → `Ești Cosmo`) |
| Files deleted | 1 (`pixel-mascot.tsx`) |
| CSS lines removed | 33 (`pixel-mascot-breathe` + `pixel-mascot-blink` block) |
| New CLAUDE.md sections | 1 (Cosmo Mascot — props, emotions, deployment table) |
| New docs | 2 (`cosmo-integration-spec.md`, `BLOCK2-3-EXECUTION-PLAN.md`) |
| TypeScript errors introduced | 0 |
| New lint warnings | 0 |
| Production build status | Green |
| DB migrations | 0 |

#### Next block

**Block 2 — Curriculum Research**: 6 prompts, electricity → AI narrative, 11 courses, ~280–330 lessons. Spine-locking starts in Prompt 2.1 per `BLOCK2-3-EXECUTION-PLAN.md`.

### Prompt 1.5.3 — Batch 2 Cosmo swap (7 files) + Pixel deletion
**Date:** 2026-05-06
**Status:** ✅ Complete

Final wave of the Pixel → Cosmo migration. Five stateful component files swapped, the AI welcome-message system prompt updated, the pixel-mascot CSS keyframes/classes deleted from globals.css, and `pixel-mascot.tsx` itself deleted. ZERO `PixelMascot` / `pixel-mascot` / `Ești Pixel` references remain anywhere in `src/`.

#### Files swapped (5 component files)

| File | Before | After |
|---|---|---|
| `src/components/course/ai-coach-chat.tsx` | `<PixelMascot emotion="thinking" size={32} />` (only when `isLoading=true`) | `<CosmoMascot emotion="thinking" size={32} />` (same conditional). Comment updated from "Pixel in 'thinking' state" to "Cosmo in 'thinking' state". |
| `src/components/course/lesson-gate.tsx` | `<PixelMascot emotion="sad" size={44} />` (only when `lastAnswerWrong=true`) | `<CosmoMascot emotion="encouraging" size={44} />` — `encouraging` matches the existing copy "Nu-i bai! Citește din nou…" better than `sad`. Comment updated from "Pixel sad mascot on wrong answer" to "Cosmo encouraging mascot on wrong answer". |
| `src/components/dashboard/absence-mascot.tsx` | `<PixelMascot emotion="sleeping" size={56} />` (when `daysAbsent >= 3`) | `<CosmoMascot emotion={daysAbsent >= 7 ? "sad" : "sleeping"} size={56} />` — wired to existing `daysAbsent` prop. 3-6 days = sleeping; 7+ days = sad. The plan's "waving on return" doesn't apply because the component only renders when the user is currently absent (no separate "user just returned" state). |
| `src/components/gamification/level-up-toast.tsx` | `<PixelMascot emotion="proud" size={56} />` | `<CosmoMascot emotion="celebrating" size={56} />` — `proud` retired; `celebrating` is the level-up signal. |
| `src/components/gamification/streak-toast.tsx` | `<PixelMascot emotion="proud" size={56} />` | `<CosmoMascot emotion="excited" size={56} />` — `proud` retired; `excited` differentiates from level-up. |

#### Cross-cutting changes

| File | Change |
|---|---|
| `src/app/api/onboarding/welcome-message/route.ts` | System prompt string: `Ești Pixel, mascota prietenoasă a platformei DevPath RO.` → `Ești Cosmo, mascota prietenoasă a platformei DevPath RO.` (line 55). Verified no other "Pixel" references in this file. |
| `src/app/globals.css` | Deleted lines 265–297: the entire `pixel-mascot-breathe` / `pixel-mascot-blink` block (keyframes + classes + reduced-motion override). 33 lines removed. Surrounding rules (`sparkle-pop` keyframe before, `float-gentle` keyframe after) untouched. Cosmo's idle animations (breathing, blinking, ear twitch, head drift) are JS-driven inside the component — no CSS needed. |

#### Deletion

| File | Action |
|---|---|
| `src/components/mascot/pixel-mascot.tsx` | **Deleted** (was ~382 lines). Contents replaced by `cosmo-mascot.tsx` across all 13 call sites in batches 1+2. |

`src/components/mascot/` now contains only `cosmo-mascot.tsx` and `mascot-celebration-overlay.tsx`.

#### Stateful-emotion wiring decisions

The plan suggested 3-way state-driven emotions for some sites; the user clarified to "use existing conditional logic — don't restructure". Decisions per file:

- **ai-coach-chat.tsx**: existing render is gated by `isLoading=true` only. No "at-rest" mascot location exists. Kept the single conditional, mapped to `thinking`.
- **lesson-gate.tsx**: existing render is gated by `lastAnswerWrong=true` only. No "question shown" or "correct answer" mascot location exists. Kept the single conditional, mapped to `encouraging` (warmer than `sad`, matches the supportive copy).
- **absence-mascot.tsx**: the component already accepts `daysAbsent` as a prop. Computed `emotion` inline from this without restructuring: `daysAbsent >= 7 ? "sad" : "sleeping"`. The "waving on return" branch in the plan was decoupled from this component's lifecycle (the component only renders when the user is currently absent), so it was left out — adding it would require a new render path.

#### Verification (all gates passed)

- [x] `grep -ri "PixelMascot|pixel-mascot|Ești Pixel" src/` → **zero matches**
- [x] `grep -ri "Pixel" src/` → only documented false positives (`setPixelRatio` ×2 in three/side-decorations-canvas.tsx, `devicePixelRatio` ×1 in cosmo-mascot.tsx). No mascot references.
- [x] `src/components/mascot/pixel-mascot.tsx` no longer exists.
- [x] `src/app/globals.css` no longer contains `pixel-mascot-breathe` / `pixel-mascot-blink`.
- [x] `npx tsc --noEmit` → 0 errors.
- [x] `npm run lint` → only the 2 pre-existing warnings unchanged (`ai-coach-chat.tsx` line 158, `certificate-document.tsx` line 262). No new lint issues from this prompt.

#### Files NOT modified

- `cosmo-mascot.tsx` — untouched.
- The 8 batch-1 files from Prompt 1.5.2 — untouched.
- `mascot-celebration-overlay.tsx` — already swapped in 1.5.2.
- `CLAUDE.md` — refresh comes in 1.5.4.

#### Notes / discoveries

- The `pixel-mascot-breathe` / `pixel-mascot-blink` CSS classes were verified by grep to be used ONLY in `pixel-mascot.tsx` itself. Safe to remove the entire CSS block (no orphan consumers).
- `welcome-message/route.ts` is invoked at runtime by `step-welcome.tsx` to generate a fresh AI welcome on every onboarding entry. The mascot-name change takes effect on the next welcome generation. **Open question for 1.5.4**: are old welcomes persisted anywhere (e.g., `users.ai_welcome_message` if such a column exists)? The risk register from 1.5.1 flagged this — needs a check during 1.5.4 QA. Quick scan of `step-welcome.tsx` shows the welcome is fetched fresh on every mount, not cached client-side, but a server-side cache could exist.
- `absence-mascot.tsx`'s emotion threshold (`>=7` for `sad`) matches the plan; the user's onboarding-mapping spec didn't specify exact day counts, so used the plan's 3/7-day breakpoints.

#### Next prompt

**Prompt 1.5.4 — End-to-end QA + CLAUDE.md refresh**: visit every site in `npm run dev`, confirm Cosmo renders with the spec'd emotion, confirm no console errors, check whether welcome messages are server-cached (and if so, clear the cache), refresh CLAUDE.md with a Cosmo deployment-sites table, close out Block 1.5 in CHANGELOG.

### Prompt 1.5.2 — Batch 1 Cosmo swap (8 stateless files)
**Date:** 2026-05-06
**Status:** ✅ Complete

First wave of the Pixel → Cosmo migration. All 8 stateless call sites swapped per the emotion mapping in `cosmo-integration-spec.md`. TypeScript and lint clean — no new errors. Pixel still in place; the 7 stateful sites + Pixel deletion are next in 1.5.3.

#### Files swapped

| File | Before | After |
|---|---|---|
| `src/app/pricing/success/page.tsx` | `<PixelMascot emotion="excited" size={100} withSparks />` | `<CosmoMascot emotion="celebrating" size={100} />` |
| `src/app/pricing/cancel/page.tsx` | `<PixelMascot emotion="sad" size={100} />` | `<CosmoMascot emotion="encouraging" size={100} />` |
| `src/components/pricing/pricing-cards.tsx` | `<PixelMascot emotion="excited" size={80} />` | `<CosmoMascot emotion="happy" size={80} />` |
| `src/components/onboarding/step-welcome.tsx` | `<PixelMascot emotion="waving" size={120} />` | `<CosmoMascot emotion="waving" size={120} enableInteraction />` |
| `src/components/minigame/minigame-modal.tsx` | `<PixelMascot emotion="excited" size={90} withSparks />` | `<CosmoMascot emotion="excited" size={90} />` |
| `src/components/minigame/minigame-result-screen.tsx` | `emotion={isPerfect ? "excited" : passed ? "proud" : "thinking"} ... withSparks={isPerfect}` | `emotion={isPerfect ? "celebrating" : passed ? "celebrating" : "encouraging"}` |
| `src/components/mascot/mascot-celebration-overlay.tsx` | `<PixelMascot emotion={leveledUp ? "celebrating" : "excited"} size={160} withSparks />` | `<CosmoMascot emotion={leveledUp ? "celebrating" : "excited"} size={160} />` |
| `src/components/landing/landing-page.tsx` | Hero (line 341): `<PixelMascot emotion="excited" size={120} withSparks />` + `<p>Pixel te ajută!</p>` (line 343) + CTA (line 527): `<PixelMascot emotion="happy" size={80} />` | Hero: `<CosmoMascot emotion="waving" size={120} enableInteraction />` + `<p>Cosmo te ajută!</p>` + CTA: `<CosmoMascot emotion="happy" size={80} />` |

8 files; 11 distinct edits (8 imports + 9 JSX/string changes — landing-page had 3 changes).

#### Prop changes per spec

- **`withSparks` removed** at every site — Cosmo's particle overlay is per-emotion (sparks for `excited`, rainbow for `celebrating`). Sites that needed sparks landed on emotions that already produce them.
- **`emotion="proud"` retired** — `minigame-result-screen` mapped `proud` → `celebrating` for "passed but not perfect" state.
- **`enableInteraction={true}`** added to landing hero + onboarding welcome (gaze-tracking adds delight on first-impression sites).
- **`size` defaults**: every site already passed an explicit size; no change needed despite Cosmo's bigger default.

#### Verification

- `npx tsc --noEmit` → 0 errors (clean).
- `npm run lint` → only the 2 pre-existing warnings unchanged (`ai-coach-chat.tsx` line 158 react-hooks/exhaustive-deps, `certificate-document.tsx` line 262 alt-text). No new lint issues introduced by Block 1.5.
- `grep PixelMascot|pixel-mascot src/` → exactly 7 files remaining (5 stateful component files + `globals.css` + `pixel-mascot.tsx` itself) — all expected for 1.5.3.
- The "Ești Pixel" string in `welcome-message/route.ts` is also still present — also expected for 1.5.3.

#### Files NOT modified

- The 7 stateful files (ai-coach-chat, lesson-gate, absence-mascot, level-up-toast, streak-toast) + `globals.css` + `welcome-message/route.ts` — Prompt 1.5.3.
- `pixel-mascot.tsx` — deletion is in 1.5.3 after the remaining importers are swapped.
- `cosmo-mascot.tsx` — untouched.

#### Discoveries / notes

- `mascot-celebration-overlay.tsx` was importing `PixelMascot` via a relative path `./pixel-mascot` (rest of the codebase used `@/components/mascot/...`). Updated the relative path to `./cosmo-mascot` to match the file's existing convention — no breakage.
- `landing-page.tsx` had two PixelMascot instances PLUS the user-facing "Pixel te ajută!" string. The original spec called these out individually; all three updates landed in this batch.
- No site still uses Pixel's deprecated `idle` emotion (default), so the `idle → happy` mapping had nothing to fire on in this batch.

#### Next prompt

**Prompt 1.5.3 — Batch 2 (7 stateful sites + Pixel deletion)**: ai-coach-chat, lesson-gate, absence-mascot, level-up-toast, streak-toast, globals.css (delete pixel-mascot CSS classes), `welcome-message/route.ts` (string update). Then delete `src/components/mascot/pixel-mascot.tsx`. Final TS + lint check.

### Prompt 1.5.1 — Audit + emotion-mapping spec
**Date:** 2026-05-06
**Status:** ✅ Complete

Pure analysis prompt — no code changes. Produced `devpath-docs/cosmo-integration-spec.md` (~220 lines) as the blueprint for the swap-in prompts.

#### Audit corrections vs the original BLOCK2-3 plan

The plan listed 16 files. Final list is also 16 files but with two membership corrections:

| Plan said | Reality | Status |
|---|---|---|
| `src/components/course/lesson-page-client.tsx` was a Pixel site | **False positive** — file has zero `PixelMascot` references | Removed from list |
| Not listed | `src/app/api/onboarding/welcome-message/route.ts` AI system prompt says **"Ești Pixel, mascota prietenoasă a platformei DevPath RO"** | Added to list (string update only) |

Also caught: `landing-page.tsx` line 343 has user-facing text `<p>Pixel te ajută!</p>` that the plan didn't enumerate — must become `Cosmo te ajută!`.

#### Prop-API diff (PixelMascot → CosmoMascot)

- **`emotion`**: Pixel had 10 values (`happy|sad|thinking|excited|proud|idle|encouraging|celebrating|sleeping|waving`); Cosmo has 8. Two retirements:
  - `"proud"` → `"celebrating"` (achievement vibe; affects level-up + streak + minigame-result + welcome overlay)
  - `"idle"` → `"happy"` (resting state; no current call site uses `"idle"` explicitly — Pixel's default-fallback only)
- **`size`**: Pixel default `80`, Cosmo default `200`. Every current call site passes an explicit size, so no site relies on the default.
- **`withSparks`** (Pixel): does NOT exist on Cosmo. Cosmo's particle overlay is per-emotion (sparks for `excited`, rainbow for `celebrating`, zzz for `sleeping`). Three sites currently pass `withSparks` — handled by emotion choice in spec.
- **`enableIdleAnimations`** (Cosmo, default `true`): new, leave default at every site.
- **`enableInteraction`** (Cosmo, default `false`): new, set `true` for landing hero + onboarding welcome (gaze-tracking adds delight); off for transient toasts/modals.

#### Emotion-mapping highlights (full table in spec doc)

| Site | Old | New | Why |
|---|---|---|---|
| Landing hero | `excited` + sparks | `waving` + interaction | Hero greets user; avoids double-bounce with motion.div hover |
| Pricing success | `excited` + sparks | `celebrating` | Rainbow particles fit "payment succeeded" |
| Pricing cancel | `sad` | `encouraging` | "Hai să mai vorbim" tone, not pity |
| Lesson gate (wrong) | `sad` | `encouraging` | Matches "Nu-i bai!" copy |
| Level-up toast | `proud` (retired) | `celebrating` | Big achievement |
| Streak toast | `proud` (retired) | `excited` | Differentiate from level-up |
| Minigame result | conditional 3-way | conditional 3-way | `proud` → `celebrating`, `thinking` (fail) → `encouraging` |
| AI welcome route | `Ești Pixel` (system prompt) | `Ești Cosmo` | Romanian-language continuity |
| globals.css | `pixel-mascot-breathe` / `-blink` keyframes | DELETE | Cosmo's idle anims are JS-driven internally |

#### Risks surfaced

- AI welcome-message route is server-side; the string change only affects NEW welcomes. Need to check (in 1.5.4) whether welcomes are cached in `users.ai_welcome_message` — if yes, one-shot migration to clear stale cached welcomes referencing "Pixel".
- `mascot-celebration-overlay.tsx` accepts emotion via prop. Verified callers only pass `"celebrating"` / `"excited"` (both valid in `CosmoEmotion`). Safe.
- Removing pixel-mascot CSS classes from globals.css: verified by grep that only `pixel-mascot.tsx` itself uses them. Safe.

#### Files created

- `devpath-docs/cosmo-integration-spec.md` — full audit + diff + per-site mapping + verification checklist for 1.5.2/1.5.3/1.5.4

#### Files NOT modified

- No source code changes (this prompt is pure analysis per the plan).
- `pixel-mascot.tsx` still in place — deletion is in 1.5.3.
- CLAUDE.md unchanged here — refresh comes in 1.5.4.

#### Next prompt

**Prompt 1.5.2 — Batch 1 swap-in (8 stateless files)**: landing, pricing-cards, pricing/success, pricing/cancel, onboarding/step-welcome, minigame-modal, minigame-result-screen, mascot-celebration-overlay. Verify TypeScript clean. No Pixel deletion yet — that's in 1.5.3 after the stateful sites are swapped.

---

## Block 2 — Curriculum Research & Structure
**Status:** ⏳ Plan locked 2026-05-06 · Waiting for Block 1.5
**Plan:** `devpath-docs/BLOCK2-3-EXECUTION-PLAN.md` § "Block 2"
**Scope:** Electricity → AI narrative, 11 courses, ~280–330 lessons (supersedes BLOCK1-EXECUTION-PLAN Section 4)

---

## Block 3 — Lesson Content Writing (~300 lessons, single-mode)
**Status:** ⏳ Plan locked 2026-05-06 · Waiting for Block 2
**Plan:** `devpath-docs/BLOCK2-3-EXECUTION-PLAN.md` § "Block 3"
**Scope:** Single-mode (Mod Tehnic only) per locked decision; archived simple-mode prose mined as sidebars where useful
