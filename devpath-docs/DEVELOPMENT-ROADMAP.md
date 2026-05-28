# DevPath RO — Development Roadmap

> **Date:** 2026-04-28
> **Authors:** CTO (Claude, Opus 4.6) + Co-Architect
> **Horizon:** 5 weeks (target: beta-ready by Week 3, wow-ready by Week 5)
> **Reference:** `devpath-docs/PLATFORM-ASSESSMENT.md` (8/10 overall score)

---

## Section 1: Honest Reaction to the Co-Architect's Plan

### What I agree with

**Phase A priorities are correct.** Onboarding is the #1 blocker — new users literally 404. Password reset is a basic expectation. Dark mode toggle is trivial but noticeable. These belong in Week 1.

**Phase B thinking is sound.** Profile editing, interview persistence, AI rate limiting, loading states — all genuine beta blockers. The co-architect correctly identifies that without these, the platform feels unfinished.

**Phase C ambition is right.** The platform has 20+ polished shared components (SerpentinePath, MagicCard, MeshGradientCard, RewardToast, StatCard, etc.) that are barely used on actual pages. Deploying these on the Courses, Roadmap, Profile, and Interview pages would transform the user experience.

### What I'd change

**1. The co-architect mixes 5-minute tasks with multi-day tasks in the same phase.**

Syncing the Prompt Engineering course is literally one API call — hit the existing `/api/admin/sync-prompt-engineering` route. Dark mode toggle is moving 10 lines of existing code from landing-page.tsx to navbar.tsx. Password reset is a Supabase built-in with a small UI addition. These should not occupy the same planning slot as "build an onboarding flow from scratch." Bundle all micro-fixes into a single 2-hour cleanup prompt at the start.

**2. Content gating should move from Phase A to Phase B.**

The co-architect wants gating in Phase A (blockers). I disagree. Here's why:
- For the first 10-50 beta testers, you want them to experience *everything*. You want feedback on the full product. Gating content behind a paywall during beta actively hurts feedback quality.
- Content gating has a dependency: you need the onboarding flow first (to know the user's plan) and the PE course synced (to have something worth gating).
- Gating is a revenue feature, not a product feature. Revenue matters at 500+ users, not at 10.
- Move it to Week 3, after the product is solid.

**3. "4 new pages with new components" is too vague.**

Which pages? In what order? What specifically changes? The PAGES-REDESIGN-PROPOSAL.md has detailed specs for Courses, Interview, Roadmap, and Profile. But the effort varies dramatically:
- **Courses page with SerpentinePath** = the crown jewel, highest visual impact, M effort
- **Roadmap page upgrade** = moderate impact, S effort (the dashboard section already does most of this)
- **Profile page with editing** = functional necessity + visual upgrade, M effort
- **Interview page redesign** = already 9/10 UI. Persistence matters more than redesign. The full RAG architecture from the proposal is XL effort and should be deferred.

I'd build them in this order: Courses (highest wow), Profile (highest need), Roadmap (moderate), Interview improvements (persistence, not full redesign).

**4. Mini-games with lesson-specific content = writing content.**

The owner explicitly said "leave content for later." Lesson-specific mini-game content means writing questions per lesson — that's content work. What we *can* do now is build the architecture to accept lesson-specific content (a JSON config per game type per lesson), but leave the actual content population for later. The co-architect should separate "build the pipe" from "fill the pipe."

**5. Mascot Cosmo is cosmetic and risky.**

Rebranding the mascot mid-development means touching every component that references "Pixel" (AI coach system prompts, celebration overlays, onboarding messages, landing page). It's a find-and-replace across 10+ files with no functional benefit. If the owner is committed to the rebrand, do it as a single atomic prompt after everything else. Don't weave it into feature work.

### What the co-architect missed

| Missed Item | Impact | Effort | My Assessment |
|---|---|---|---|
| **Vercel Analytics** | Need data to make any decision | S (1 line + 1 package) | Do in Week 1 alongside micro-fixes |
| **Email verification on signup** | Fake accounts waste AI budget | S (Supabase built-in) | Do in Week 2 |
| **Fix InterviewSection hardcoded stats** | Dashboard shows fabricated numbers | S (replace hardcoded with DB query) | Do in Week 1 |
| **Stripe billing portal** | Users can pay but can't cancel/manage | S (Stripe has a hosted portal) | Do in Week 3 with content gating |
| **Legal pages (GDPR)** | Legally required in Romania/EU | M (needs actual legal text) | Do in Week 4, can use templates |
| **Glossary page quality** | Currently 6/10, weakest page | S (use PageHero + CategoryPill) | Do in Week 4 alongside page upgrades |

### Is the order optimal?

No. Here's my reordering logic:

**Week 1** should be: unblock new users (onboarding) + sweep of all trivial fixes (dark toggle, password reset, sync PE, analytics, loading.tsx). This gives us a working product by end of Week 1.

**Week 2** should be: make the product feel complete (profile editing, interview persistence, AI rate limiting, email verification). This gives us a beta-testable product by end of Week 2.

**Week 3** should be: monetization layer (content gating, billing portal) + the highest-impact visual upgrade (courses page with serpentine path). This gives us a revenue-ready, visually impressive product.

**Week 4-5** should be: remaining page upgrades (roadmap, profile visual, glossary) + polish + legal + testing.

---

## Section 2: The Recommended Roadmap

### Week 1 — "Unblock Everything"

Goal: A new user can sign up, onboard, see 2 courses, and start learning.

| # | Task | Effort | Impact | Dependencies | Why This Order |
|---|---|---|---|---|---|
| 1.1 | **Micro-fixes sweep** — sync PE course (1 API call), dark mode toggle in navbar (move existing code), password reset UI ("Forgot password?" link + Supabase flow), fix register name `required` attr, add Vercel Analytics package, fix InterviewSection hardcoded stats with real DB query | S | 8 | None | These are all <30min tasks. Doing them first clears the board of trivial debt. |
| 1.2 | **Loading.tsx for all routes** — add skeleton loading screens for dashboard, courses, flashcards, glossar, leaderboard, roadmap, portfolio, profile, interview, settings | S | 7 | None | Prevents blank-screen flashes. Small effort, big perceived quality improvement. |
| 1.3 | **Onboarding flow** — multi-step: choose learning mode (Simplu/Tehnic), set daily goal (5/15/30 min), select interests, optional name/avatar. Sets `onboarding_completed=true` on finish. Awards 50 XP. Welcome message from mascot (API exists). | M | 10 | 1.1 (PE synced so onboarding can show 2 courses) | The #1 blocker. Without this, no new user can use the platform. |

### Week 2 — "Beta-Ready"

Goal: The platform is complete enough for 10-50 beta testers. Every feature that exists should work end-to-end without data loss.

| # | Task | Effort | Impact | Dependencies | Why This Order |
|---|---|---|---|---|---|
| 2.1 | **Profile editing** — settings page with: edit name, upload avatar (Supabase Storage), change daily goal, change learning mode, change password. Update `users` table. Add avatar upload to Supabase Storage bucket with RLS. | M | 8 | Week 1 complete | Users need to manage their account. Currently impossible. |
| 2.2 | **AI rate limiting** — per-user daily call counter for `/api/ai/chat`, `/api/ai/tts`, `/api/ai/stt`, `/api/ai/generate-quiz`. Free plan: 20 calls/day. Pro/Lifetime: 100 calls/day. Store in `ai_usage` table (user_id, date, call_count). Check before each AI call. | M | 7 | None | Without this, one user could bankrupt the OpenAI budget. Essential for any public launch. |
| 2.3 | **Interview session persistence** — new `interview_sessions` table (user_id, questions jsonb, report jsonb, score int, category_scores jsonb, created_at). Save on session complete. Add `/interview/history` page showing past sessions with score trends. | M | 7 | None | Transforms a throwaway feature into a retention driver. Users can track improvement over time. |
| 2.4 | **Email verification on signup** — enable Supabase email confirmation. Add "Check your email" page after registration. Handle verification callback. | S | 5 | None | Prevents fake accounts that waste AI budget. Pairs with rate limiting. |

### Week 3 — "Revenue & Wow"

Goal: The platform can accept payments AND looks visually stunning. The courses page becomes the centerpiece.

| # | Task | Effort | Impact | Dependencies | Why This Order |
|---|---|---|---|---|---|
| 3.1 | **Courses page redesign with SerpentinePath** — replace the flat grid with a cinematic course experience. Per-course view shows lessons on the serpentine path (already built, 1390 LOC). Course selector at top. Mission Control header with XP gauge + streak. MeshGradientCard for course cards if multiple courses. Module zone colors from the Aurora palette. | L | 10 | PE course synced (1.1) | The single highest-impact visual change. Transforms the platform from "grid of cards" to "Duolingo-style game map." Uses the crown jewel component that's been built but barely deployed. |
| 3.2 | **Content gating enforcement** — middleware or RSC check: if `user.plan === 'free'` and lesson is in a Pro-only module, show an upgrade prompt instead of content. Free = modules 1-2 per course. Pro/Lifetime = all modules. Gate AI coach (rate limit is already in place from 2.2). | M | 9 | Onboarding (1.3), rate limiting (2.2) | Now that users can onboard and AI costs are controlled, gating creates the revenue funnel. Needs onboarding first so users have chosen a plan context. |
| 3.3 | **Stripe billing portal** — add portal link in settings. Uses `stripe.billingPortal.sessions.create()`. Users can view invoices, update payment, cancel subscription. | S | 6 | Content gating (3.2) | If you're charging, users must be able to manage their subscription. Legally required. |

### Week 4 — "Polish & Pages"

Goal: Every page in the platform reaches 8/10 quality minimum. No "bare" pages remain.

| # | Task | Effort | Impact | Dependencies | Why This Order |
|---|---|---|---|---|---|
| 4.1 | **Profile page upgrade** — redesign using MeshGradientCard, AnimatedProgressRing for level, StatCards for XP/streak/badges. Integrate profile editing from 2.1 directly into the page (not separate settings page). Activity heatmap improvement. Show earned certificates. | M | 7 | Profile editing (2.1) | Profile is currently 8/10 but could be 9/10 with the new shared components. |
| 4.2 | **Roadmap page upgrade** — replace the bare timeline with an enhanced view. Use SerpentinePath in mini mode (already has a 10-node demo) to show course progression. Add estimated completion dates, daily goal integration, "coming soon" courses with locked styling. Remove the dev-facing "Phase 2" banner. | M | 7 | Courses page (3.1, proves serpentine integration pattern) | Currently the weakest page at 7/10. The dashboard roadmap section is better than the standalone page — fix that. |
| 4.3 | **Glossary page upgrade** — add PageHero, CategoryPill filters for the 6 categories, search input, card-based term display with MagicCard hover effects. Currently 6/10, should reach 8/10. | S | 5 | None | Quick win — the page exists, the components exist, just needs wiring. |
| 4.4 | **Flashcards page upgrade** — add PageHero, stats banner (cards studied today, streak, accuracy), better card flip animations. SM-2 state visualization (next review date, difficulty). | S | 5 | None | Currently functional but visually plain. |

### Week 5 — "Launch Prep"

Goal: The platform is ready for public launch with 500+ users.

| # | Task | Effort | Impact | Dependencies | Why This Order |
|---|---|---|---|---|---|
| 5.1 | **Legal pages** — Terms of Service, Privacy Policy, Cookie Policy. Romanian language. GDPR compliance (data export button, account deletion). Link from footer and settings. | M | 6 | None | Legally required in EU. Must be done before any public marketing. |
| 5.2 | **Interview page improvements** — add session history sidebar (from 2.3 data), difficulty selector (beginner/advanced), category focus mode, report PDF export. Extract 582-line page.tsx into sub-components. Do NOT do full RAG architecture yet. | M | 7 | Interview persistence (2.3) | The interview feature is good but raw. Adding history and difficulty makes it a complete product. |
| 5.3 | **Mini-game content architecture** — add `lesson_minigame_config` JSON column to lessons table (or separate table). Each lesson can define game-specific content. Update minigame-modal to read config. Leave content population for later. | M | 5 | None | Builds the pipe without filling it. When content writers come, they can populate game content per lesson. |
| 5.4 | **Dashboard InterviewSection live data** — replace hardcoded stats with real queries (count from interview_sessions, flashcard count, unique categories). Minor but removes fabricated numbers. | S | 4 | Interview persistence (2.3) | Depends on interview_sessions table existing. |
| 5.5 | **Final QA sweep** — run `npx tsc --noEmit`, test all routes manually, check mobile responsiveness on each page, verify dark/light mode on all pages, check all error states. | S | 8 | Everything | The last pass before inviting real users. |

---

## Section 3: Prompt Plan

Each prompt is a coherent unit of work that can be completed in a single Claude Code session.

### Prompt 1: "Micro-Fixes Sweep" (Week 1, Day 1)
- **What it builds:** Sync PE course to DB, dark mode toggle in dashboard navbar, password reset UI on login page, fix register name field, add Vercel Analytics, fix InterviewSection hardcoded stats
- **Estimated size:** S (2-3 hours of work, 6 small changes)
- **Dependencies:** None — this is the starting prompt
- **Files touched:** `navbar.tsx`, `login/page.tsx`, `register/page.tsx`, `interview-section.tsx`, `layout.tsx` (analytics), sync API call
- **Note:** The PE sync is a one-time admin action (call the existing route), not code changes

### Prompt 2: "Loading States" (Week 1, Day 1-2)
- **What it builds:** `loading.tsx` files for all 9 dashboard routes with proper skeletons using existing SkeletonCard component
- **Estimated size:** S (1-2 hours, 9 small files)
- **Dependencies:** None
- **Files created:** `dashboard/loading.tsx`, `courses/loading.tsx`, `flashcards/loading.tsx`, `glossar/loading.tsx`, `leaderboard/loading.tsx`, `roadmap/loading.tsx`, `portfolio/loading.tsx`, `profile/loading.tsx`, `interview/loading.tsx`

### Prompt 3: "Onboarding Flow" (Week 1, Day 2-4)
- **What it builds:** Complete onboarding page — multi-step wizard with learning mode selection, daily goal, interests, optional avatar, welcome message from mascot
- **Estimated size:** M (full day of work)
- **Dependencies:** Prompt 1 (PE synced so onboarding can reference 2 courses)
- **Files created:** `src/app/(dashboard)/onboarding/page.tsx`, `src/components/onboarding/` (step components)
- **DB changes:** May need `users.daily_goal_minutes` column if not present, `users.interests` jsonb column
- **Key decisions:** How many steps? What data do we collect? Does it set `learning_mode`?

### Prompt 4: "Profile Editing & Settings" (Week 2, Day 1-2)
- **What it builds:** Profile settings page — edit name, upload avatar to Supabase Storage, change password, change daily goal, change learning mode
- **Estimated size:** M (1-2 days)
- **Dependencies:** Prompt 3 (onboarding sets initial values that settings page edits)
- **Files created/modified:** `src/app/(dashboard)/settings/page.tsx` (new), `src/app/(dashboard)/settings/actions.ts`, Supabase Storage bucket config
- **DB changes:** Supabase Storage bucket `avatars` with RLS policy

### Prompt 5: "AI Rate Limiting" (Week 2, Day 2-3)
- **What it builds:** Per-user daily AI call tracking and enforcement. New table, middleware-style check in all AI routes.
- **Estimated size:** M (1 day)
- **Dependencies:** None (but logically follows profile editing)
- **Files modified:** All 4 AI API routes (`chat`, `tts`, `stt`, `generate-quiz`)
- **DB changes:** New `ai_usage` table (user_id, date, call_count, call_type) + RLS

### Prompt 6: "Interview Persistence" (Week 2, Day 3-4)
- **What it builds:** Save interview sessions to DB, interview history page with score trends
- **Estimated size:** M (1-2 days)
- **Dependencies:** None
- **Files created:** `interview_sessions` table migration, `src/app/(dashboard)/interview/history/page.tsx`
- **Files modified:** `src/app/(dashboard)/interview/page.tsx` (add save on complete)
- **DB changes:** New `interview_sessions` table + RLS + indexes

### Prompt 7: "Email Verification" (Week 2, Day 4)
- **What it builds:** Enable Supabase email confirmation, "check your email" UI, verification callback handling
- **Estimated size:** S (half day)
- **Dependencies:** None
- **Files modified:** `src/app/(auth)/register/page.tsx`, Supabase dashboard setting
- **Files created:** `src/app/(auth)/verify-email/page.tsx`

### Prompt 8: "Courses Page Redesign" (Week 3, Day 1-3)
- **What it builds:** The crown jewel — courses page with SerpentinePath integration. Course selector, per-course serpentine map showing all lessons with real completion data, Mission Control header
- **Estimated size:** L (2-3 days)
- **Dependencies:** Prompt 1 (PE course synced), all Week 1-2 prompts (stable foundation)
- **Files modified:** `src/app/(dashboard)/courses/page.tsx` (major rewrite)
- **Files created:** `src/components/course/course-map.tsx` (wrapper connecting SerpentinePath to real lesson data)
- **Key decisions:** Does each course get its own serpentine map? How do we handle the course-level overview vs the lesson-level map?
- **Note:** This is the single most impactful prompt. The SerpentinePath (1390 LOC, 9/10 quality) is ready — we're connecting it to real data.

### Prompt 9: "Content Gating & Billing" (Week 3, Day 3-5)
- **What it builds:** Free vs Pro content checks in RSC/middleware. Upgrade prompts on gated lessons. Stripe billing portal in settings.
- **Estimated size:** M (1-2 days)
- **Dependencies:** Prompt 5 (rate limiting creates the AI cost boundary), Prompt 8 (courses page shows gated lessons visually)
- **Files modified:** `src/app/(dashboard)/courses/[courseSlug]/[lessonId]/page.tsx` (add plan check), middleware or layout-level check
- **Files created:** `src/components/course/upgrade-prompt.tsx`, settings billing link
- **Key decisions:** Which modules are free? (Proposal: modules 1-2 per course = free, rest = Pro)

### Prompt 10: "Profile & Roadmap Page Upgrades" (Week 4, Day 1-3)
- **What it builds:** Profile page with MeshGradientCard, AnimatedProgressRing, embedded editing. Roadmap page with mini SerpentinePath, estimated dates, cleaner design.
- **Estimated size:** M (2 days)
- **Dependencies:** Prompt 4 (profile editing exists), Prompt 8 (serpentine pattern proven)
- **Files modified:** `portfolio/page.tsx`, `roadmap/page.tsx`, `profile/page.tsx`

### Prompt 11: "Glossary & Flashcards Page Upgrades" (Week 4, Day 3-4)
- **What it builds:** Glossary with PageHero, CategoryPill filters, card layout. Flashcards with stats banner, better animations.
- **Estimated size:** S (1 day)
- **Dependencies:** None
- **Files modified:** `glossar/page.tsx`, `flashcards/page.tsx`

### Prompt 12: "Interview Improvements" (Week 5, Day 1-2)
- **What it builds:** History sidebar on interview page, difficulty selector, category focus, report improvements. Component extraction from 582-line page.
- **Estimated size:** M (2 days)
- **Dependencies:** Prompt 6 (interview persistence)
- **Files modified:** `interview/page.tsx` (refactor + enhance)
- **Files created:** `src/components/interview/` directory with sub-components

### Prompt 13: "Legal & Launch Prep" (Week 5, Day 3-5)
- **What it builds:** Legal pages (Terms, Privacy, GDPR), mini-game content architecture (table + config reading), final QA sweep, Dashboard InterviewSection live data
- **Estimated size:** M (2 days)
- **Dependencies:** All previous prompts
- **Files created:** `src/app/terms/page.tsx`, `src/app/privacy/page.tsx`, legal content

---

## Section 4: What We're Deliberately Skipping (and Why)

| Skipped Item | Why It's Safe to Skip |
|---|---|
| **Writing new lesson content** | Owner explicitly deferred. 60 lessons across 2 courses is sufficient for beta. |
| **Writing mini-game questions per lesson** | Content work. We'll build the architecture (Prompt 13) but not fill it. |
| **Full Interview RAG architecture** | The PAGES-REDESIGN-PROPOSAL describes a vector DB + embeddings system. This is XL effort for marginal quality improvement over GPT-4o-mini with good prompts. Defer to post-launch. |
| **Course 3+ content** | No MDX files exist. Can't build what doesn't exist. |
| **Mascot rebrand (Pixel to Cosmo)** | Pure cosmetic. Touches 10+ files across system prompts, UI, celebration overlays. If the owner wants it, do it as a single atomic find-and-replace prompt, not interleaved with feature work. |
| **Test suite (Vitest/Playwright)** | Important but doesn't block beta launch. The codebase has 0 TypeScript errors and excellent patterns. Tests become critical at scale, not at 50 users. |
| **Admin dashboard** | Admin features work via scattered UI (courses page buttons, API routes). A centralized admin panel is nice-to-have, not launch-blocking. |
| **PWA manifest** | ServiceWorker exists for push. Full PWA installability is a post-launch optimization. |
| **Sentry/error monitoring** | Important for production at scale. For beta with 50 users, Vercel's built-in error logs suffice. Add before 500+ users. |
| **API versioning** | Over-engineering for current stage. No external API consumers. |
| **React.cache() wrappers** | Performance optimization. The 12 parallel queries already work well. Optimize when there's actual performance data from Vercel Analytics. |
| **SerpentinePath refactor** | The component is 1390 LOC but works at 9/10 quality. Splitting it into 3 files would be cleaner but adds no user value. Do it when we need to modify the internals. |
| **Video content** | `lessons.video_url` column exists but creating videos is a production task, not a code task. |

---

## Section 5: Risk Assessment

### Risk 1: Onboarding flow design decisions delay Week 1
- **Probability:** Medium
- **Impact:** High — everything downstream depends on onboarding working
- **Mitigation:** Keep onboarding simple. 3 steps max: learning mode, daily goal, done. Don't over-design it. The PAGES-REDESIGN-PROPOSAL has an elaborate onboarding with AI personality quiz — skip that for now. Ship simple, iterate later.

### Risk 2: SerpentinePath integration with real data is harder than expected
- **Probability:** Medium
- **Impact:** High — the Courses page redesign (Prompt 8) is the visual centerpiece
- **Mitigation:** The SerpentinePath already accepts a `LessonNode[]` prop with status, label, icon, color, moduleIndex. The mapping from Supabase lesson data to this format should be straightforward. Test with the existing dev showcase data first, then swap in real data. If it breaks, fall back to an enhanced grid layout.

### Risk 3: Content gating creates user friction that kills beta engagement
- **Probability:** Low-Medium
- **Impact:** Medium — beta testers might bounce if they hit a paywall
- **Mitigation:** Make the free tier generous (modules 1-2 per course = 8-10 lessons each). Show gated content titles and descriptions (just not the MDX body). Add "Request beta access" override for early testers.

### Risk 4: AI rate limiting is too restrictive or too permissive
- **Probability:** Medium
- **Impact:** Medium — too restrictive kills the AI coach UX, too permissive kills the budget
- **Mitigation:** Start generous (20 free, 100 pro), track actual usage via Vercel Analytics, adjust limits based on real data. Add a "daily AI calls remaining" indicator in the AI coach panel so users know their budget.

### Risk 5: Supabase Storage for avatar uploads introduces a new failure mode
- **Probability:** Low
- **Impact:** Low — avatar upload is optional, initials fallback already works everywhere
- **Mitigation:** The avatar upload is the only Supabase Storage usage in the app. Keep it simple: upload to a public bucket, store the URL in `users.avatar_url`. If Storage fails, the initials fallback is already universal.

---

## Section 6: Launch Readiness Checklist

### 10 Beta Testers (End of Week 2)

- [ ] New user can register, onboard, and reach dashboard without errors
- [ ] Both courses visible and accessible (AI Fundamentals + Prompt Engineering)
- [ ] Lesson completion flow works end-to-end (read → gate → complete → XP → celebration)
- [ ] AI Coach chatbot responds in Romanian with lesson context
- [ ] Dark/light mode toggle works in dashboard
- [ ] Password reset flow works
- [ ] Profile editing works (name, avatar, learning mode)
- [ ] AI rate limiting prevents budget overruns
- [ ] All pages have loading states (no blank screens)
- [ ] No TypeScript errors (`npx tsc --noEmit` clean)

### 50 Users (End of Week 3)

Everything above, plus:
- [ ] Content gating enforced (free users see modules 1-2 only)
- [ ] Stripe checkout works end-to-end (payment → plan upgrade → content unlocked)
- [ ] Billing portal accessible (cancel, update payment)
- [ ] Courses page shows SerpentinePath game map
- [ ] Interview sessions are saved and viewable in history
- [ ] Email verification on signup prevents fake accounts
- [ ] Vercel Analytics collecting data

### 500 Users (End of Week 5)

Everything above, plus:
- [ ] Legal pages published (Terms, Privacy, GDPR compliance)
- [ ] Account deletion works (GDPR right to erasure)
- [ ] All pages at 8/10+ visual quality (no "bare" pages)
- [ ] Roadmap page uses SerpentinePath mini-mode
- [ ] Profile page uses new shared components
- [ ] Glossary page has category filters and proper design
- [ ] Interview page has history sidebar and difficulty selector
- [ ] Mini-game architecture supports lesson-specific content (even if not populated)
- [ ] Dashboard InterviewSection shows real data
- [ ] Mobile experience verified on all pages
- [ ] Cron jobs working (streak check, weekly email)
- [ ] Final QA pass completed

### 1000+ Users (Post-launch, not in this roadmap)

- [ ] Error monitoring (Sentry)
- [ ] Test suite (critical paths)
- [ ] Performance optimization (React.cache, ISR)
- [ ] Admin dashboard
- [ ] Course 3+ content
- [ ] Video content integration
- [ ] Full Interview RAG system
- [ ] PWA manifest + install prompt

---

## Visual Summary

```
Week 1: UNBLOCK          Week 2: BETA-READY       Week 3: REVENUE + WOW
+-----------------+      +-----------------+      +-------------------+
| P1: Micro-fixes |      | P4: Profile edit|      | P8: Courses page  |
| P2: Loading.tsx |      | P5: AI rate lim |      |     + Serpentine   |
| P3: Onboarding  |      | P6: Interview DB|      | P9: Content gate  |
|                 |      | P7: Email verify|      |     + Billing      |
+-----------------+      +-----------------+      +-------------------+
         |                        |                        |
         v                        v                        v
   10 beta testers          50 users ready          Revenue possible

Week 4: POLISH            Week 5: LAUNCH
+-----------------+      +-----------------+
| P10: Profile +  |      | P12: Interview  |
|      Roadmap    |      |      upgrades   |
| P11: Glossary + |      | P13: Legal +    |
|      Flashcards |      |      QA + Launch |
+-----------------+      +-----------------+
         |                        |
         v                        v
   All pages 8/10+         500 users ready
```

---

> **Final note:** This roadmap is opinionated by design. It prioritizes user-facing impact over architectural purity. It defers content work, test infrastructure, and advanced AI features in favor of making the existing 95+ features actually accessible and polished. The platform's technical foundation is 9/10 — the gap is product completeness, not engineering quality. Fill the gaps, ship it, iterate.
