popo# Block 1 — Execution Plan & Strategic Review

> **Date:** 2026-04-28
> **Author:** Claude (Opus 4.7) — acting as solutions architect for the owner's revised vision
> **Inputs:** PLATFORM-ASSESSMENT.md, DEVELOPMENT-ROADMAP.md, owner's 3-block vision (no-launch, retire dual mode, course-level difficulty, lesson-specific mini-games, mascot rebrand)
> **Scope:** Honest review of the 3-block plan, prompt-by-prompt Block 1 plan, component deployment map, recommendations for Blocks 2 and 3, fate of the 51 orphaned simple-mode files

---

## Section 1 — Honest Opinion on the 3-Block Plan

### Is the order correct?

**Mostly yes, but Block 1 has too much packed into "Step 1" and the mascot is in the wrong place.**

The macro structure (polish first → curriculum design → content writing) is correct for a no-launch, quality-first platform. You cannot design a 200-lesson curriculum on top of a buggy product, and you cannot write 200 lessons before validating the platform works for the owner. So: BLOCK 1 → BLOCK 2 → BLOCK 3 is the right order.

**What's wrong inside Block 1:**

1. **Step 1 ("micro-fixes sweep") mixes a real ~half-day of work with two existing-but-not-wired things.** The theme toggle component already exists at `src/components/theme-toggle.tsx`; it's just not in the navbar. The PE course sync is one button click on an admin page. These should not occupy the same mental slot as "loading.tsx for all routes." Split it.

2. **Onboarding is listed as Step 2 but it's already partially built.** `src/app/onboarding/page.tsx` exists, the `OnboardingWizard` component exists with 4 steps (`step-profile`, `step-goal`, `step-calibration`, `step-welcome`). The roadmap and assessment both claimed onboarding was missing — that was wrong at the time of the assessment, or it was added since. Either way, this is a polish-and-test job, not a build-from-scratch job. That changes the effort dramatically.

3. **Mascot Cosmo at Step 6 is a strategic mistake.** See detailed argument below.

4. **Step 7 ("final polish") is a vague cleanup bucket.** It will quietly absorb anything that didn't get done. Replace it with a checklist: a 15-item QA matrix you can actually verify.

### Is anything missing from Block 1?

Yes. Six things that the plan does not name:

1. **Lesson page UI is the most-visited screen and is not in Block 1.** Block 1 redesigns Courses, Profile, Roadmap, Glossary, Flashcards, Dashboard. But once the user is *inside* a lesson, that's where they spend 90% of their time. The lesson page is currently 9/10, but with the dual-mode toggle being retired, the lesson chrome will need rework (mode toggle removed, breadcrumbs cleaner, sidebar reorganized). Add this.

2. **Search experience.** Cmd+K command palette exists but is hidden in the navbar (`<div className="hidden">` wrapping it). Block 1 should either expose it visibly with a "/" or "⌘K" hint, or formally accept it as keyboard-only.

3. **Empty/loading states for the new components.** SerpentinePath, MeshGradientCard, etc. have happy-path designs but no defined empty/loading/error skeletons specific to those components. When you redesign Courses around Serpentine, what shows during the RSC fetch? When the user has 0 progress, what does the path look like?

4. **Mobile review for the redesigned pages.** The plan defaults to desktop-first (correct per CLAUDE.md), but every redesigned page needs at least one explicit mobile pass. Don't discover at the end that SerpentinePath breaks at 375px.

5. **Decision on the `/dev/components` showcase.** It's currently dev-only. After Block 1, do you keep it? Move it? It's been the most useful artifact in the codebase for proving these components work — keeping it as a living style guide is genuinely valuable.

6. **Fate of the dual-mode infrastructure** (the `mode-toggle` component, `users.learning_mode` column, `content_simple_md` columns, `lesson_gate_questions` simple variants, gamification dual XP rates). Retiring dual mode is not just deleting MDX files — it touches database schema, server actions, gate logic, XP constants, and 5+ components. This deserves its own atomic step, not a vague "remove dual mode" bullet.

### Is the dual-mode retirement a good decision?

**Yes, but it's also the most disruptive single decision in the plan, and it has hidden costs.**

**Why it's a good decision:**

- The dual-mode toggle is the most confusing UX element in the platform. Users have to decide their cognitive level before they've seen the content. That's backwards.
- "Course 1 = beginner, Course 7 = advanced" is the standard pedagogical model used by every successful platform (Khan Academy, Coursera specializations, fast.ai). It's standard because it works.
- Difficulty-per-course lets you pace concepts — Course 2 can build on Course 1's vocabulary instead of every lesson having to re-teach the basics for the simple-mode reader.
- It also unlocks better mini-games. A game that assumes "you just learned about regression in lesson 4 of Course 2" is way more focused than a game that has to work for both a coder and a non-coder.

**Hidden costs nobody is naming:**

1. **51 simple MDX files become decision debt, not just file debt.** They contain hours of writing — analogies, metaphors, history framings — that often *outclass* the technical version pedagogically. Throwing them away is wasteful. Section 5 of this document covers this.

2. **`users.learning_mode` is referenced in 8+ places.** Removing it cleanly takes ~half a day. This is fine, but plan for it.

3. **The gamification system has dual-mode XP rates** (simple = 10 XP, technical = 15 XP). Removing this simplifies the rules and likely makes XP feel more deserved.

4. **Lesson 13 in the dev showcase, the Pyodide hook, the AI Coach system prompts** — none of these reference learning_mode but the lesson content does. A grep-and-clean is needed.

5. **The simple-mode lessons were the platform's accessibility story for non-technical users.** With the new "Course 1 = absolute beginner" structure, you're betting that beginners will go through Course 1 instead of dropping in mid-stream and switching to simple mode. That's a content-quality bet — Course 1 has to be *exceptional* or the audience that simple mode was designed for will bounce.

**Verdict:** Retire it. But (a) merge the best simple-mode prose into Course 1, and (b) write down the migration as an atomic prompt with a checklist, not a blanket "remove it."

### Is the mascot timing right (Block 1 step 6) or should it move?

**Move it. The mascot rebrand is the single highest-risk, lowest-impact item in Block 1. It belongs at the END of Block 3, or arguably never.**

**Why it's risky:**

- Pixel is currently referenced in: AI Coach system prompts, celebration overlays, onboarding step 4 ("welcome message"), the absence-mascot dashboard greeting, the `/api/onboarding/welcome-message` route, and at least three lesson MDX files (search for "Pixel").
- A 3D Three.js golden-retriever-robot is a 3-5 day project on its own (modeling, rigging, animation states, performance optimization, fallback for low-power devices, ARIA/reduced-motion).
- The existing Pixel mascot (`pixel-mascot.tsx`, SVG + Framer Motion, 6 emotions) is *good*. It's not the bottleneck on platform quality.

**Why it's low-impact for Block 1's stated goal ("make the platform beautiful and functional"):**

- The owner is the primary tester. The owner already knows what Pixel looks like. Rebranding does not make Pixel more useful for the owner.
- A 3D mascot in Three.js will eat ~300KB of JS on every page that shows it, plus a model file (~1-3MB). For a platform with 60 lessons and growing, this is non-trivial.
- The current platform's wow-factor comes from SerpentinePath, RewardToast, MeshGradientCard, dashboard 3D side decorations. Adding a 3D mascot doesn't unlock anything new.

**My recommendation:** Replace "mascot rebrand" with **"mascot polish"** in Block 1: improve the existing Pixel SVG mascot's emotions, add 1-2 new states (thinking, celebrating-big), make the absence-mascot variant more distinctive. Defer the Cosmo 3D rebrand to a "Block 2.5 nice-to-have" or do it after Block 3 once content is in. **Do not gate Block 1 completion on a 3D mascot.**

If the owner is committed to Cosmo and won't be moved: do it as a single atomic prompt at the very end of Block 1 (after everything else works), with a hard kill-switch (a dev flag) so we can ship without it if it turns out to be janky.

### Risks I see

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| **Block 2 (curriculum design) blows past 1 week** because designing 7-10 courses × ~30 lessons is a research-and-decisions project | High | High — delays Block 3 | Time-box Block 2 to 1 week of exploration, then commit to a v1 outline. Iterate during Block 3. Do not aim for a perfect curriculum on day 1. |
| **Block 3 (content writing) is the real long pole.** 200 lessons at 2 hours/lesson = 400 hours of writing. That's 10 weeks at 40 hr/week, full-time, of just writing | Certain | Defines the timeline | Accept this. Block 1 + 2 give you a polished platform on which content can land. Block 3 is a marathon, not a sprint. Plan for 6 months of writing. |
| **Owner-as-only-tester** misses bugs that affect new users (onboarding, first-lesson, account-creation friction) | Medium | Medium | Bring 2-3 friends through the platform at end of Block 1 specifically to catch new-user bugs. Not a launch — a private alpha. |
| **The dual-mode retirement breaks live-state** (existing user accounts have `learning_mode` set, completed simple lessons that no longer exist) | Medium | Medium | Migration plan: keep `learning_mode` column, mark all users as default ("technical"), redirect any URL pointing to a `-simple` lesson to its standard variant. |
| **Course curriculum design depends on owner's level** of math/AI knowledge | Medium | Low | Block 2 plan must include "what does the owner currently know?" — the curriculum should not start at a level the owner is 5 years past, nor at a level the owner is years away from reaching. |
| **Component deployment without lesson-page redesign** creates inconsistency: 8 polished pages, 1 unchanged lesson page | Medium | Medium | Add a Step 4.5: lesson-page chrome cleanup (remove mode toggle, polish sidebar, update breadcrumbs). |
| **Glossary page upgrade is named but the glossary itself was an afterthought** — currently 6/10 with 55 terms. Polishing the page won't fix that the content is shallow | Low | Low | Acceptable for Block 1. Real fix is curriculum-aligned glossary in Block 3. |

---

## Section 2 — Block 1 Detailed Prompt Plan

Each prompt below is one Claude Code session worth of work. Sized by experience: S = ~half day, M = ~1-1.5 days, L = ~2-3 days. Prompts are listed in execution order with explicit dependencies.

### Prompt 1.1 — "Quick Wins Sweep"

**Description:** Six small fixes batched into one session. Clears trivial debt before any visual work.

**Tasks:**
1. Sync Prompt Engineering course to DB (admin sync route — one button)
2. Add ThemeToggle to dashboard navbar (component already exists at `src/components/theme-toggle.tsx`, just import it next to the user dropdown)
3. Add `required` attr to register name field
4. Replace InterviewSection's hardcoded stats (47, 12, 5) with real DB queries (count from `interview_sessions` if table exists, otherwise show real flashcard count + course count + use lesson count, hide the "Simulări" card until persistence is built)
5. Add Vercel Analytics package (`@vercel/analytics` import in root layout)
6. Verify the `/dev/components` showcase still renders cleanly after the navbar change

**Files modified:** `src/components/layout/navbar.tsx`, `src/app/(auth)/register/page.tsx`, `src/components/dashboard/interview-section.tsx`, `src/app/layout.tsx`, `src/app/(dashboard)/dashboard/page.tsx` (if InterviewSection needs new props)

**Effort:** S

**Dependencies:** None — first prompt of the block

**Done when:**
- PE course visible at `/courses` (will be 2 cards now)
- Theme toggle clickable in dashboard navbar, persists across reloads
- Register form requires name
- InterviewSection no longer shows fake stats
- `npx tsc --noEmit` clean
- Vercel Analytics deployed (visible in Vercel dashboard within 24h)

---

### Prompt 1.2 — "Loading.tsx Sweep"

> **Note:** Original Prompt 1.2 ("Password Reset") was removed per owner's direction — fake test accounts only, no real email flows in Block 1. Email verification is also deferred. Both are filed under post-launch.

**Description:** Add `loading.tsx` for every dashboard route. Use existing `SkeletonCard` and `Skeleton` primitives. Match each page's layout shape so there's no jarring shift on hydration.

**Tasks:**
- `dashboard/loading.tsx` — hero skeleton + section skeletons
- `courses/loading.tsx` — grid of `CourseCardSkeleton` (matching count to 2 courses)
- `flashcards/loading.tsx` — single card skeleton
- `glossar/loading.tsx` — pill row + grid skeleton
- `leaderboard/loading.tsx` — list rows skeleton
- `roadmap/loading.tsx` — timeline skeleton
- `portfolio/loading.tsx` — heatmap skeleton + radar skeleton
- `profile/loading.tsx` — card skeletons
- `interview/loading.tsx` — single big card skeleton
- `settings/loading.tsx` (if it doesn't exist)

**Files created:** 9-10 loading.tsx files

**Effort:** S

**Dependencies:** None

**Components used:** `SkeletonCard`, `Skeleton`, `StatCardSkeleton`, `CourseCardSkeleton`

**Done when:** Every dashboard route shows a skeleton during navigation, no blank flashes anywhere.

---

### Prompt 1.3 — "Onboarding Polish"

**Description:** The onboarding wizard exists. Audit it, fix issues, ensure it sets `learning_mode = 'technical'` (since dual-mode is being retired — see 1.5), connect the welcome-message API, ensure XP award on completion, ensure proper redirect to `/dashboard` after.

**Tasks:**
1. Audit each step (`step-profile`, `step-goal`, `step-calibration`, `step-welcome`) — verify all data persists to `users` table
2. Verify the welcome message API call works and falls back gracefully if it 500s
3. Make the wizard visually use Block 1 components: PageHero for the header, StatCard for the "you'll learn X minutes per day" preview, CategoryPill for goal selection
4. Add 50 XP award on completion (already may exist — verify)
5. Test the full flow in dev: new user → onboarding → dashboard
6. Fix any console errors or visual rough edges

**Files modified:** `src/components/onboarding/onboarding-wizard.tsx`, `src/components/onboarding/step-*.tsx`, `src/app/onboarding/actions.ts`

**Effort:** S to M (S if onboarding is functionally fine, M if it's broken)

**Dependencies:** 1.1 (so the user knows there are 2 courses to start with)

**Components used:** `PageHero`, `CategoryPill`, `StatCard`, existing onboarding step components

**Done when:** A brand-new test user (fake email) can sign up, complete onboarding in <90 seconds, land on dashboard with their preferences saved and 50 XP showing.

---

### Prompt 1.4 — "Dual-Mode Retirement (Atomic Migration)"

**Description:** This is the disruptive prompt. Remove the dual-mode toggle, the `mod simplu` UI surface, and the simple-mode XP differentiation. Keep the underlying columns (`content_simple_md`, `users.learning_mode`) for now — we'll delete those after Course 1's redesign in Block 3 incorporates the best simple-mode prose.

**Tasks:**
1. Remove `<ModeToggle>` from the lesson page header
2. Remove the "fallback banner" that says "Mod Simplu nu există pentru această lecție"
3. In `[lessonId]/page.tsx`, always read `content_md` (ignore `content_simple_md` for now)
4. Remove `learning_mode` from onboarding (drop the calibration step's "tech vs simple" question OR rebrand it as "choose your starting course" — see 1.4)
5. In `lib/gamification-constants.ts`, remove the dual XP rates — pick the technical rate (15 XP) as canonical
6. In `courses/actions.ts`, remove any branching on `learning_mode`
7. Remove the `mode-toggle.tsx` component (delete file)
8. Remove `mod` query param handling in lesson page
9. Update AI Coach system prompt to drop "in Mod Simplu, explain without code" branching — the AI Coach is now always in one mode
10. Move all 51 simple-mode MDX files to `content/_archive/simple-mode/` (do NOT delete — archive them so the prose is preserved for Block 3 merging)

**Files modified/deleted:** ~10-12 files. Notable: `mode-toggle.tsx` (delete), lesson page (modify), gamification constants (modify), courses actions (modify), onboarding step-calibration (modify or delete that step), API routes for AI Coach (modify), `content/courses/*/`*-simple.mdx` (move to archive)

**Effort:** M

**Dependencies:** 1.1, 1.3 (onboarding flow already polished so the calibration-step change doesn't bring it down)

**Done when:**
- No `<ModeToggle>` visible anywhere
- `npx tsc --noEmit` clean
- All 51 `*-simple.mdx` files moved to archive folder
- Existing test user with `learning_mode = 'simple'` still works (lesson page renders standard content, no broken links)
- AI Coach responds in one consistent voice

---

### Prompt 1.5 — "Courses Page Redesign with SerpentinePath"

**Description:** The crown jewel of Block 1. Replace the flat 3-card grid at `/courses` with a Mission Control header + a course selector (since we have 2 courses) + a per-course SerpentinePath rendering all that course's lessons with real completion status.

**Tasks:**
1. Build `CoursesMissionHeader` — XP fuel gauge (already proven in dashboard), streak flame, total lessons completed across all courses
2. Build `CourseSelector` — pill/tab UI for choosing which course's map to view (Course 1: AI Fundamentals, Course 2: Prompt Engineering)
3. Build `CourseMap` — wrapper that takes course ID, fetches all lessons + user progress, maps to `LessonNode[]` shape, renders `<SerpentinePath>`
4. Map lesson types to icons (theory = BookOpen, quiz = HelpCircle, exercise = Code2, project = Trophy)
5. Map completion status to node status (completed = green, current = highlighted, locked = grey)
6. Add "Continue from where you left off" button that scrolls to the active node
7. Module zone colors using Aurora palette (each module = different background hue)
8. Empty state for users with 0 progress (the path is fully locked except node 1)
9. Mobile fallback: collapse SerpentinePath into a vertical list view at <500px

**Files created:** `src/components/course/course-map.tsx`, `src/components/course/courses-mission-header.tsx`, `src/components/course/course-selector.tsx`

**Files modified:** `src/app/(dashboard)/courses/page.tsx` (major rewrite — keep the dev admin section behind the existing `process.env.NODE_ENV === "development"` flag)

**Effort:** L

**Dependencies:** 1.1 (PE course synced — without it the Course 2 selector tab is empty), 1.4 (no mode toggle conflicts)

**Components used:** `SerpentinePath` (the centerpiece), `MeshGradientCard` (for the course selector cards if multi-course design wants it), `PageHero`, `AnimatedProgressRing`, `StatCard`, `DifficultyBadge`, `EmptyState`

**Done when:**
- `/courses` shows Mission Control header with real XP/streak data
- Course selector switches between AI Fundamentals and Prompt Engineering
- Each course renders SerpentinePath with all its lessons and accurate completion status
- Clicking a node navigates to the lesson
- Mobile shows a clean vertical list, no broken layout
- Empty state (new user) shows path with all locked nodes except first
- `npx tsc --noEmit` clean

---

### Prompt 1.6 — "Profile Page Redesign"

**Description:** Profile page is currently 8/10. Upgrade it to 9/10 using the shared component library, and integrate basic profile editing (name, avatar URL).

**Tasks:**
1. Replace the existing layout with `PageHero` header
2. Use `AvatarLevelRing` for the user's avatar (level + progress in one component)
3. Use `StatCard` for each stat: total XP, current streak, badges earned, lessons completed
4. Use `MeshGradientCard` for the referral section (visually distinct, gold accent)
5. Add an inline "Edit profile" panel: name field, avatar URL (no Supabase Storage yet — just a URL input), daily goal slider, save button
6. Keep the activity heatmap and badge grid from the existing portfolio page conventions
7. Show earned certificates as badges/cards at the bottom

**Files modified:** `src/app/(dashboard)/profile/page.tsx`, `src/app/(dashboard)/profile/actions.ts` (add `updateProfile` action)

**Effort:** M

**Dependencies:** None — but logically follows 1.5

**Components used:** `PageHero`, `AvatarLevelRing`, `StatCard`, `MeshGradientCard`, `AnimatedProgressRing`, `Badge`, existing heatmap/radar from portfolio

**Done when:**
- Profile page header looks distinct from old design
- User can update name + avatar URL + daily goal inline
- Stats are visually prominent with `StatCard`
- Mobile: stats stack to 2-col, page reads cleanly

---

### Prompt 1.7 — "Roadmap Page Redesign"

**Description:** The roadmap page is currently 7/10 — the weakest after Glossary. Use SerpentinePath in mini mode (the dev showcase has a 10-node demo) to show course progression. Show estimated dates based on the user's daily goal.

**Tasks:**
1. Replace the timeline with a mini SerpentinePath showing all courses as nodes (Course 1 → Course 2 → Course 3 (locked) → ... → Course 7-10)
2. For each course, show: name, lesson count, estimated completion date based on `users.daily_goal_minutes`
3. Lock all courses beyond what currently exists (with "Coming soon" styling)
4. Remove the dev-facing "Phase 2" banner
5. Add a "Today's goal" card at the top using `StatCard`
6. Add `CategoryPill` filters for difficulty (when more courses exist, this becomes useful — for now, all show)

**Files modified:** `src/app/(dashboard)/roadmap/page.tsx`

**Effort:** M

**Dependencies:** 1.5 (proves the SerpentinePath wiring pattern)

**Components used:** `SerpentinePath` (mini mode), `StatCard`, `PageHero`, `CategoryPill`, `DifficultyBadge`, `MeshGradientCard`

**Done when:** Roadmap page no longer feels like an afterthought; user can see the multi-course path even though only 2 courses exist; daily-goal-based date estimates appear next to each course.

---

### Prompt 1.8 — "Glossary & Flashcards Page Polish"

**Description:** Two related quick wins. Glossary is the platform's weakest page (6/10); Flashcards is functional but visually plain (8/10). Both upgrade with the shared library.

**Tasks (Glossary):**
1. Add `PageHero` with "AI Glossar" title
2. Replace the existing client component's filter tabs with `CategoryPill` group
3. Wrap each term in `MagicCard` (mouse-tracking gradient adds polish)
4. Add a search input bound to filter logic
5. Add term count + category count in `StatCard` row at top

**Tasks (Flashcards):**
1. Add `PageHero` with "Flashcards" title
2. Add stats row using `StatCard`: cards due today, total reviewed, current streak, accuracy
3. Improve the card flip animation (already uses Framer Motion — refine spring physics)
4. Show the SM-2 next review date as a subtle badge on the card back

**Files modified:** `src/app/(dashboard)/glossar/page.tsx` (and its `glossar-client.tsx`), `src/app/(dashboard)/flashcards/page.tsx` (and its client component if any)

**Effort:** M (combined)

**Dependencies:** None

**Components used:** `PageHero`, `CategoryPill`, `MagicCard`, `StatCard`, existing flashcard flip components

**Done when:**
- Glossary page reaches 8/10 (visually distinct categories, search, premium card hover)
- Flashcards page has a stats banner that makes review feel like progress, not a chore

---

### Prompt 1.9 — "Dashboard Component Refresh"

**Description:** The dashboard already uses good components, but several sections could swap in the polished shared library. Targeted upgrade — don't redesign, just upgrade.

**Tasks:**
1. `RoadmapSection` — replace the current course timeline with mini-SerpentinePath (matching 1.8)
2. `PortfolioSection` — swap inline heatmap card for `MeshGradientCard` wrapper
3. `LeaderboardSection` — wrap top user in `MeshGradientCard` (gold variant)
4. `AchievementsSection` — use `StatCard` for the activity timeline header stats
5. `InterviewSection` — already fixed in 1.1 (real stats), but also wrap the topic chips in `CategoryPill`

**Files modified:** 5 dashboard section files

**Effort:** S

**Dependencies:** 1.1 (Interview stats fix), 1.7 (proven roadmap mini-serpentine pattern)

**Components used:** `SerpentinePath`, `MeshGradientCard`, `StatCard`, `CategoryPill`, `MagicCard`

**Done when:** Dashboard sections feel cohesive with the new pages, not like a separate UI from /courses, /profile, /roadmap.

---

### Prompt 1.10 — "Lesson Page Cleanup"

**Description:** With dual-mode retired (1.5), the lesson page chrome can be cleaned up. Not a redesign — a cleanup.

**Tasks:**
1. Remove the now-deleted ModeToggle area's empty space — adjust grid
2. Tighten the breadcrumb/header (course name → lesson title → progress)
3. Polish the "lesson sidebar" (AI coach + presence + comments) spacing
4. Verify the gate-questions UI still works without simple-mode variants
5. Verify the celebration overlay still fires correctly
6. Verify mini-game trigger still works

**Files modified:** `src/app/(dashboard)/courses/[courseSlug]/[lessonId]/page.tsx`, possibly `lesson-page-client.tsx`

**Effort:** S

**Dependencies:** 1.4 (dual-mode retired)

**Components used:** existing lesson components, no major new component deployment

**Done when:** Lesson page reads cleanly post-dual-mode-removal. No visual debt from the removed toggle. All existing functionality (gate, complete, mini-game, comments, AI coach) works unchanged.

---

### Prompt 1.11 — "Pixel Mascot Polish (Hold Cosmo)"

**Description:** Replacement for the original Step 6 ("Mascot Cosmo 3D"). Polish the existing Pixel SVG mascot. Defer the Cosmo 3D rebrand.

**Tasks:**
1. Audit `pixel-mascot.tsx` (6 emotions). Check each emotion renders correctly.
2. Add 1-2 new emotion states if needed for new UI surfaces (e.g. "thinking" for AI coach typing indicator, "celebrating-big" for level-up)
3. Make the absence-mascot variant more visually distinct from the standard one
4. Verify the mascot reads cleanly on light mode (was originally designed for dark)
5. Optionally: add a subtle ambient idle animation (1-2 seconds, breathing/blinking) when mascot is on screen >5s

**Files modified:** `src/components/mascot/pixel-mascot.tsx`, `src/components/mascot/mascot-celebration-overlay.tsx`, `src/components/dashboard/absence-mascot.tsx`

**Effort:** S

**Dependencies:** None

**Done when:** Pixel feels alive on every surface that uses it. No blocked Block 1 progress on a 3D model.

---

### Prompt 1.12 — "Block 1 QA Sweep"

**Description:** Replacement for the original Step 7 ("final polish"). Concrete, verifiable QA pass.

**Tasks (Checklist):**
- [ ] `npx tsc --noEmit` clean
- [ ] `npm run lint` clean (or no new warnings)
- [ ] `npm run build` succeeds
- [ ] All 9 dashboard routes have working `loading.tsx`
- [ ] Theme toggle works on every dashboard page (check 9 routes)
- [ ] Onboarding: new user (fake email) → 4 steps → dashboard with XP
- [ ] Courses page: SerpentinePath renders both courses, completion status accurate
- [ ] Profile page: edit name, save, page reflects update
- [ ] Roadmap page: mini-SerpentinePath visible, dates render
- [ ] Glossary: search filters terms, categories filter, MagicCard hover works
- [ ] Flashcards: stats banner present, review flow unchanged
- [ ] Dashboard: all 10 sections render, no console errors
- [ ] Lesson page: open one of each type (theory, quiz, exercise), all work
- [ ] AI Coach: chat works, voice in/out works, no errors
- [ ] Mini-game trigger: complete 3 lessons, mini-game appears
- [ ] Mobile spot-check: dashboard, courses, lesson, profile at 375px width
- [ ] Light mode spot-check: same 4 pages
- [ ] Pixel mascot renders on dashboard, lesson, celebration overlay, absence state
- [ ] No remaining ModeToggle UI anywhere
- [ ] No console errors on any page
- [ ] `/dev/components` showcase still works (sanity check)

**Files modified:** Whatever the QA pass uncovers

**Effort:** S to M (depends on what QA reveals)

**Dependencies:** All previous prompts

**Done when:** Every checkbox above is checked. Block 1 is done.

---

### Block 1 Total Effort Estimate

| Prompt | Effort |
|---|---|
| 1.1 Quick wins | S |
| 1.2 Loading.tsx | S |
| 1.3 Onboarding polish | S-M |
| 1.4 Dual-mode retirement | M |
| 1.5 Courses redesign | L |
| 1.6 Profile redesign | M |
| 1.7 Roadmap redesign | M |
| 1.8 Glossary + Flashcards | M |
| 1.9 Dashboard refresh | S |
| 1.10 Lesson page cleanup | S |
| 1.11 Mascot polish | S |
| 1.12 QA sweep | S-M |

**Total: ~2.5-3 weeks of focused work** (5-6 days of S, 5-6 days of M, 2-3 days of L, plus reasonable buffer for issues found in QA). Slightly trimmed since password reset + email verification were dropped — aligns comfortably with the owner's "2-3 weeks for Block 1" estimate.

---

## Section 3 — Component Deployment Map

This table shows which shared components from `src/components/ui/` should land on which page during Block 1. ✅ = primary use, ◐ = secondary/optional use, blank = not used.

| Component | Dashboard | Courses | Profile | Roadmap | Glossary | Flashcards | Interview | Lesson |
|---|---|---|---|---|---|---|---|---|
| **PageHero** | | ✅ | ✅ | ✅ | ✅ | ✅ | ◐ | |
| **SerpentinePath** | ◐ (RoadmapSection) | ✅ | | ✅ (mini) | | | | |
| **MeshGradientCard** | ◐ (Portfolio, Leaderboard) | ◐ (course selector) | ✅ (referral) | ◐ | | | ◐ | |
| **MagicCard** | ◐ | | | | ✅ (terms) | ◐ | | |
| **StatCard** | ✅ (Achievements, Interview) | ✅ (Mission Control) | ✅ | ✅ | ✅ | ✅ | ✅ (after 1.1 fix) | |
| **AnimatedProgressRing** | ◐ (HeroSection has it) | ✅ (course progress dial) | ✅ (level ring) | ◐ | | ◐ (deck progress) | | ◐ |
| **AvatarLevelRing** | ✅ (HeroSection) | | ✅ | | | | | |
| **CategoryPill** | ◐ (InterviewSection) | ✅ (course selector) | | ✅ (difficulty filter) | ✅ (categories) | ◐ (deck filter) | ◐ (categories) | |
| **DifficultyBadge** | ◐ (CoursesSection) | ✅ (course cards) | | ✅ | | | | |
| **PageTransition** | | | | | | | | |
| **RewardToast** | (used globally) | | | | | | | (used in completion) |
| **EmptyState** | | ✅ (no progress) | | ✅ (no goal set) | ✅ (no search match) | ✅ (no due cards) | | |
| **NumberTicker** | ◐ (HeroSection has it) | ✅ (XP gauge) | ✅ | ✅ | ✅ (count) | ✅ | ✅ | |
| **AnimatedGradientText** | ✅ (already used) | ✅ (mission title) | ✅ | ✅ | ✅ | ✅ | ✅ (already used) | ✅ |
| **BorderBeam** | ◐ | ◐ (active node) | ◐ | | | | ◐ | |
| **DotPattern** | | ◐ (background) | | ◐ | ◐ | | | |
| **Meteors** | ◐ (existing 3D may suffice) | | | | | | | |
| **ShineBorder** | ◐ | ◐ (current course card) | | | | | | |
| **StatusNode** | | ✅ (in SerpentinePath) | | ✅ (in mini-Serpentine) | | | | |
| **SkeletonCard** | ✅ (loading.tsx) | ✅ (loading.tsx) | ✅ (loading.tsx) | ✅ (loading.tsx) | ✅ (loading.tsx) | ✅ (loading.tsx) | ✅ (loading.tsx) | ✅ (loading.tsx) |

**Reading the table:**

- **Pages with the most variety:** Dashboard (already loaded), Courses (the redesign target), Profile (the editing surface).
- **Pages that mainly need PageHero + StatCard + EmptyState:** Glossary, Flashcards, Roadmap. These are quick wins.
- **Lesson page deliberately stays minimal.** The lesson is content-first — adding too many decorative components would steal focus from the MDX. Block 1 leaves the lesson page mostly alone (only the dual-mode cleanup in 1.11).
- **Interview page is a Block 2-or-later candidate** — it's already 9/10 and Block 1 only fixes the dashboard's hardcoded stats (1.1).

---

## Section 4 — Recommendations for Block 2 (Curriculum Structure)

This section is opinionated based on the current platform's capabilities, the existing 60 lessons, the MDX system, and what I've seen of the owner's vision.

### How should we structure the new curriculum?

**My recommendation: 7 courses, ~25-35 lessons each, ~200 lessons total. Strict prerequisite chain.**

```
Course 1: Mathematics for AI (Foundations)
  - 30 lessons. Algebra, functions, linear algebra basics, intro to calculus, intro to probability.
  - Assumes: high-school math but rusty.
  - Goal: comfortable with vectors, matrices, derivatives, basic probability by end.

Course 2: Programming for AI (Python + Tools)
  - 25 lessons. Python fundamentals, NumPy, Pandas, matplotlib, intro to Jupyter, Git basics.
  - Assumes: Course 1 OR equivalent comfort with math.
  - Goal: can write Python that manipulates data and runs in browser via Pyodide.

Course 3: Statistics & Data Reasoning
  - 25 lessons. Descriptive stats, distributions, hypothesis testing, regression, statistical thinking.
  - Assumes: Courses 1-2.
  - Goal: can read a dataset, ask the right questions, do basic analysis.

Course 4: Classical Machine Learning
  - 30 lessons. Linear/logistic regression, decision trees, k-means, SVMs, evaluation metrics, train/val/test, overfitting.
  - Assumes: Courses 1-3.
  - Goal: can train a classical ML model on a real dataset and evaluate it.

Course 5: Neural Networks & Deep Learning
  - 30 lessons. Perceptron, activation, backprop, MLP, CNNs (briefly), training loop, PyTorch basics.
  - Assumes: Courses 1-4.
  - Goal: can build and train a small neural network from scratch.

Course 6: NLP & Transformers
  - 30 lessons. Tokenization, embeddings, attention, transformer architecture, BERT/GPT family, fine-tuning.
  - Assumes: Course 5.
  - Goal: understands how LLMs work mechanically, can fine-tune a small model.

Course 7: Practical AI / LLM Engineering
  - 30 lessons. Prompt engineering (existing PE course content), RAG, agents, tool use, evaluation, deployment, ethics.
  - Assumes: Courses 5-6.
  - Goal: can build a real LLM-powered product.
```

**Total:** 200 lessons. Achievable in 6-9 months of focused writing.

**Why 7, not 10:** 10 is overengineering. 7 covers the full pipeline and stops at "you can build". Anything beyond is specialization (computer vision, RL, MLOps) which can be Course 8-10 added later, after the core 7 prove demand.

### What should happen to the existing 2 courses?

**My recommendation: Cannibalize, don't preserve.**

- **AI Fundamentals (30 lessons)** is currently a wide-but-shallow tour. It contains content that should be redistributed:
  - Lessons 1-4 (What is AI, history) → Course 1 intro chapter or Course 4 module 1
  - Lessons 5-9 (Machine Learning intro) → Course 4
  - Lessons 10-14 (Neural Networks intro) → Course 5
  - Lessons 15-19 (LLMs & Transformers intro) → Course 6 module 1
  - Lessons 20-24 (Prompt Engineering basics) → Course 7
  - Lessons 25-30 (Applications, Ethics) → distributed across all courses

- **Prompt Engineering Practic (30 lessons)** is more cohesive. It becomes the bulk of Course 7.

**The transition plan:**

1. Rename "AI Fundamentals" course to "AI Fundamentals (legacy)" or hide it from the courses list during Block 2-3.
2. Mark it as "archived" in `courses` table with a flag.
3. Keep its lessons accessible to users who started it (don't break their progress).
4. Build new courses with new MDX. Reuse prose where it's good — don't rewrite for the sake of rewriting.

### What lesson types work best with the mini-game system?

Based on the 6 existing mini-game types:

| Game | Best for content type | Why |
|---|---|---|
| **Sort Concepts** | Vocabulary lessons (categorization tasks) | Two or more buckets to sort items into |
| **Fill in the Blank** | Definition recall, term-in-context | Tests precise vocabulary |
| **Match Pairs** | Term ↔ definition lessons | Bidirectional recall |
| **True/False** | Conceptual clarity, common misconceptions | Quick check on understanding |
| **Build Network** | Multi-concept synthesis | "How do these 5 ideas connect?" |
| **Write Prompt** | Application/synthesis tasks | The most generative — best for end-of-module |

**My recommendation: trigger choice based on lesson type, not lesson number.**

Currently mini-games trigger every 3 lessons cycling through types. That's arbitrary. Better:
- Theory lessons → Match Pairs or Sort Concepts (vocabulary check)
- Exercise lessons → Write Prompt or Build Network (synthesis)
- Quiz lessons → no mini-game (the lesson IS the test)
- Project lessons → no mini-game (the lesson IS the test)

This requires a `lesson.minigame_config` JSON column where each lesson can specify which game and what content. That's an architectural change for Block 2 to design, Block 3 to populate.

### Should we keep MDX or switch?

**Keep MDX. Don't switch. Switching would burn weeks for marginal gain.**

MDX gives you:
- Authorable in any text editor
- Custom React components inline (Pyodide editor, neural network viz, flashcards)
- Version-controlled in git
- Type-safe with frontmatter validation

The alternative formats (Sanity, Notion-as-CMS, Contentlayer) all add infrastructure complexity for no real authoring win. The owner is the writer; MDX in VSCode is the right tool.

**However:** Block 2 should formalize the MDX schema. Currently lesson frontmatter has `type` (theory/quiz/exercise/project) but no `prerequisites`, no `concepts`, no `minigame_config`. Block 2 should design this schema before Block 3 starts writing 200 lessons.

### Romanian + English technical terms — practical guidance

The owner's note ("Rețelele neurale (neural networks) folosesc backpropagation pentru...") is right. Concretely:

- **First mention of an English term:** Romanian translation, then English in parentheses: "rețele neurale (neural networks)"
- **Subsequent mentions:** use whichever feels natural — but be consistent within a lesson
- **Code, API names, library names:** always English, never translate ("PyTorch", "scikit-learn", "embeddings")
- **Math terms:** English ("gradient", "tensor", "backpropagation") — these are universal
- **Conceptual labels:** Romanian where natural ("învățare supervizată" not "supervised learning"), English where it's the standard ("transformer", "attention head")

This is a stylistic rule — Block 2 should write it down as a "Lesson Style Guide" document, then Block 3 enforces it. Without that document, 200 lessons will end up inconsistent.

---

## Section 5 — What to Do About the 51 Orphaned Simple-Mode Files

**My recommendation: Option B (Merge the best analogies into Course 1) + archive the rest.**

Here's the reasoning for each option:

### Option A: Delete them
- ✗ Wasteful. Hours of writing thrown away.
- ✗ The simple-mode files often contain the *best* analogies in the platform. Lesson 11 simple-mode ("Ce este o rețea neuronală?") explains it through a soccer team metaphor that's better than the technical version.
- **Verdict: No.**

### Option B: Merge the best analogies into Course 1 ✅
- ✅ Course 1 ("Mathematics for AI") and Course 4 ("Classical ML") are the two courses where pedagogical accessibility matters most. The simple-mode prose has been pre-tested against non-technical audiences.
- ✅ Doesn't waste the writing.
- ✅ Strengthens the "Course 1 = absolute beginner" promise — Course 1 must be exceptional, and the simple-mode prose was *built* to be exceptional for beginners.
- ✗ Requires editorial judgment lesson-by-lesson — which analogies are gold, which were filler?
- **Verdict: Yes, this is the primary recommendation.**

### Option C: Keep them as "beginner tips" sidebars within lessons
- ◐ Interesting but adds UI complexity. Now every lesson has a sidebar component to manage. The ROI is unclear.
- ◐ Defeats the "course-level difficulty" decision — sidebars effectively re-introduce dual mode through a back door.
- ✗ During Block 1 polish, adding a new sidebar pattern is scope creep.
- **Verdict: No, contradicts the strategic decision.**

### My concrete proposal

**During 1.5 (dual-mode retirement):**
- Move all 51 simple-mode MDX files to `content/_archive/simple-mode/` — preserved, not in the active content path.

**During Block 2 (curriculum design):**
- Read each archived simple-mode file. For each one, decide:
  - **Gold analogy** (e.g. soccer team for neural networks): mark for inclusion in the Course 1/4/5 lesson it relates to
  - **Decent analogy:** mark as optional / filler material
  - **Filler / not better than tech version:** discard

**During Block 3 (writing):**
- When writing each new Course 1/4/5 lesson, the writer (owner + Claude) checks the marked archive for the matching analogy. If gold, weave it into the lesson body. The result: the new courses inherit the best pedagogical work of the old courses.

**At the end of Block 3:** the archive folder is deleted. The simple-mode prose has been absorbed where it belongs.

**Estimated time cost:** ~4-6 hours of editorial reading during Block 2 (reviewing 51 files at ~5 min each + decisions). Negligible compared to writing the new courses. High pedagogical leverage.

---

## Closing — Three Risks the Owner Should Pre-Decide

Before Block 1 starts, the owner should consciously decide:

1. **The Cosmo mascot question.** Is it Block 1 mandatory (in which case it eats 3-5 days), end-of-Block-1 nice-to-have (current recommendation), or post-Block-3 polish? Decide now to avoid mid-block scope creep.

2. **The course-1 launch standard.** "Each lesson makes the owner understand something new" is a good test, but it's the owner-test. Does the owner want a second tester (a friend, a non-technical family member) to verify Course 1 is *also* exceptional for someone else? If yes, plan that into Block 3.

3. **The 200-lesson commitment.** Block 3 is 6-9 months of writing. The owner's stated comfort with that timeline is the assumption underneath the entire plan. If the owner's actual time budget is 3 months, the curriculum needs to be 80-100 lessons across 4-5 courses, not 200 across 7. Better to right-size the curriculum than to burn out at lesson 60.

These are decisions, not implementation questions. Resolving them up-front prevents Block 1 from running over while Block 2 is still being designed mid-flight.

---

> **End of Block 1 Execution Plan.** This document supersedes the prior DEVELOPMENT-ROADMAP for Blocks 1-3. The PLATFORM-ASSESSMENT.md remains accurate as a feature inventory; production-launch concerns it raised (legal, analytics, content gating) are explicitly deferred per the owner's no-launch-pressure direction.
