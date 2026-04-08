# DevPath RO — Master Progress Checklist
# Update this file after EVERY task. Mark complete with [x].
# This is the single source of truth for implementation progress.

---

## PHASE 0 — Cleanup & Security
**Status:** 🔄 In progress

### 0.1 — Remove next-intl
- [x] P0.1.1 — Run verification grep (must find files to clean)
- [x] P0.1.2 — Update next.config.mjs (remove withNextIntl)
- [x] P0.1.3 — Verify middleware.ts is clean (no changes needed)
- [x] P0.1.4 — Update src/app/layout.tsx (remove NextIntlClientProvider)
- [x] P0.1.5 — Verify dashboard layout.tsx is clean (no changes needed)
- [x] P0.1.6 — Update src/app/page.tsx (hardcode Romanian strings, remove LangToggle)
- [x] P0.1.7 — Update src/components/layout/navbar.tsx (remove useTranslations, soon:true)
- [x] P0.1.8 — Update src/app/(dashboard)/dashboard/page.tsx (remove getTranslations)
- [x] P0.1.9 — Delete src/i18n/request.ts
- [x] P0.1.10 — Delete src/lib/locale.ts
- [x] P0.1.11 — Delete src/components/lang-toggle.tsx
- [x] P0.1.12 — Delete src/app/(auth)/set-locale-action.ts
- [x] P0.1.13 — Run npm uninstall next-intl
- [x] P0.1.14 — Final grep: zero next-intl references
- [x] P0.1.15 — npm run build passes without errors

### 0.2 — Security Fixes
- [x] P0.2.1 — Replace /api/ai/chat/route.ts with auth + Zod version
- [x] P0.2.2 — Replace /api/ai/tts/route.ts with auth + Zod version
- [x] P0.2.3 — Test: unauthenticated POST to /api/ai/chat returns 401
- [x] P0.2.4 — Test: unauthenticated POST to /api/ai/tts returns 401
- [x] P0.2.5 — Test: invalid body returns 400
- [x] P0.2.6 — Test: valid authenticated request works correctly

### 0.3 — Database Migrations
- [x] P0.3.1 — Add users.role column (SQL approved + run)
- [x] P0.3.2 — Add all onboarding + gamification columns to users
- [x] P0.3.3 — Create all 15 new tables with RLS
- [x] P0.3.4 — Seed badges table with 25 rows
- [x] P0.3.5 — Verify in Supabase: all tables exist, badges = 25 rows
- [x] P0.3.6 — Update schema.sql to match live DB
- [x] P0.3.7 — npx tsc --noEmit passes

### 0.4 — Fix Nav Links
- [x] P0.4.1 — Create src/app/(dashboard)/roadmap/page.tsx
- [x] P0.4.2 — Create src/app/(dashboard)/portfolio/page.tsx
- [x] P0.4.3 — Create src/app/(dashboard)/interview/page.tsx
- [x] P0.4.4 — /roadmap loads without 404
- [x] P0.4.5 — /portfolio loads without 404
- [x] P0.4.6 — /interview loads with Start button

### 0.5 — Fix Streak
- [x] P0.5.1 — Add streak calculation to markLessonComplete()
- [x] P0.5.2 — Dashboard shows real streak_count (not hardcoded 0)
- [x] P0.5.3 — Complete lesson → streak = 1 on dashboard
- [x] P0.5.4 — Complete again same day → streak stays 1

### 0.6 — Update CLAUDE.md
- [x] P0.6.1 — Add 15 new tables to DB schema summary
- [x] P0.6.2 — Add Language section (Romanian only)
- [x] P0.6.3 — Add Dual Content Modes section
- [x] P0.6.4 — Add Security reference section
- [x] P0.6.5 — Update F2 status in features table

**Phase 0 Total: 30 tasks | Completed: 30 ✅**

---

## PHASE 1 — Dual-Mode Content Architecture
**Status:** 🔄 In progress

### 1.1 — System Components
- [x] P1.1.1 — Update lesson-content.tsx (dual mode props)
- [x] P1.1.2 — Create mode-toggle.tsx + updateLearningMode action
- [x] P1.1.3 — Create reading-progress.tsx (scroll tracking)
- [x] P1.1.4 — Create lesson-gate.tsx + awardGateXP action
- [x] P1.1.5 — Update complete-button.tsx (scroll + gate guard)
- [x] P1.1.6 — Create lesson-page-client.tsx wrapper
- [x] P1.1.7 — Update lesson page RSC
- [x] P1.1.8 — Update sync-action.ts (handle -simple.mdx files)
- [x] P1.1.9 — Create bookmark-button.tsx + toggleBookmark action
- [x] P1.1.10 — Create lesson-feedback.tsx + submitLessonFeedback action
- [x] P1.1.11 — DB migration: lesson_gate_questions, lesson_bookmarks, lesson_feedback tables
- [x] P1.1.12 — Create increment_user_xp Postgres function

### 1.2 — Flashcard Component
- [x] P1.2.1 — Create flashcard-deck.tsx (3D flip, framer-motion)
- [x] P1.2.2 — Wire flashcards interceptor in lesson-content.tsx

### 1.3 — Simple Mode MDX (Lessons 1-14)
- [x] P1.3.1 — lesson-01-ce-este-inteligenta-artificiala-simple.mdx
- [x] P1.3.2 — lesson-02-cum-gandeste-un-calculator-simple.mdx
- [x] P1.3.3 — lesson-03-tipuri-de-ai-simple.mdx
- [x] P1.3.4 — lesson-05-ce-este-machine-learning-simple.mdx
- [x] P1.3.5 — lesson-06-supervised-vs-unsupervised-simple.mdx
- [x] P1.3.6 — lesson-07-cum-se-antreneaza-un-model-simple.mdx
- [x] P1.3.7 — lesson-08-overfitting-underfitting-simple.mdx
- [x] P1.3.8 — lesson-10-neuronul-artificial-simple.mdx
- [x] P1.3.9 — lesson-11-retea-neuronala-simple.mdx
- [x] P1.3.10 — lesson-12-deep-learning-simple.mdx
- [x] P1.3.11 — lesson-15-language-model-simple.mdx
- [x] P1.3.12 — lesson-16-transformers-simple.mdx
- [x] P1.3.13 — lesson-17-tokenizare-simple.mdx
- [x] P1.3.14 — lesson-18-context-window-simple.mdx

### 1.4 — New Lessons 15-30 (Both Modes)
- [x] P1.4.1 — lesson-15 through lesson-30 technical MDX (16 files)
- [x] P1.4.2 — lesson-15 through lesson-30 simple MDX (16 files)

### 1.5 — Gate Questions
- [x] P1.5.1 — Run gate questions INSERT SQL for all 30 lessons

### 1.6 — Sync + QA
- [x] P1.6.1 — Run sync-action, verify content_simple_md populated in DB
- [x] P1.6.2 — npx tsc --noEmit passes
- [x] P1.6.3 — Full QA checklist from plan section 1.7

**Phase 1 Total: 34 tasks | Completed: 34 ✅**

---

## PHASE 2 — Onboarding Wizard
**Status:** 🔄 In progress | Depends on: Phase 1 complete

- [x] P2.1.1 — Create src/app/onboarding/page.tsx
- [x] P2.1.2 — Create src/components/onboarding/types.ts
- [x] P2.1.3 — Create onboarding-wizard.tsx
- [x] P2.1.4 — Create step-profile.tsx
- [x] P2.1.5 — Create step-goal.tsx
- [x] P2.1.6 — Create step-calibration.tsx
- [x] P2.1.7 — Create step-welcome.tsx
- [x] P2.2.1 — Create src/lib/onboarding-mapping.ts
- [x] P2.3.1 — Create src/app/onboarding/actions.ts
- [ ] P2.3.2 — Modify auth actions: handle ?ref= referral code [DEFERRED to Phase 5 — P5.7.x]
- [x] P2.3.3 — Modify dashboard layout: redirect if onboarding incomplete
- [x] P2.4.1 — Create /api/onboarding/welcome-message/route.ts
- [x] P2.4.2 — Test welcome message: 7 profile types, Romanian, under 55 words
- [x] P2.5.1 — E2E test: register → onboarding → dashboard
- [ ] P2.5.2 — Test referral: ?ref= code gives 40 XP to both users [DEFERRED to Phase 5 — P5.7.x]
- [x] P2.5.3 — Test: developer + all yes → learning_mode = technical
- [x] P2.5.4 — Test: medical → learning_mode = simple

**Phase 2 Total: 17 tasks | Completed: 14 | Deferred: 2 (P2.3.2, P2.5.2 → Phase 5)**

---

## PHASE 3 — Gamification
**Status:** ⏳ Not started | Depends on: Phase 2 complete

- [x] P3.0.1 — Run award_xp_and_check_level Postgres function SQL
- [x] P3.0.2 — Run get_weekly_leaderboard Postgres function SQL
- [x] P3.0.3 — Verify/add lessons.module_index column
- [x] P3.1.1 — Create src/lib/gamification.ts (XP_VALUES, LEVEL_NAMES, awardXP)
- [x] P3.1.2 — Verify awardXP works (test insert in xp_events)
- [x] P3.2.1 — Create level-up-toast.tsx
- [x] P3.2.2 — Create xp-toast.tsx
- [x] P3.3.1 — Add checkAndAwardBadges + holiday helpers to gamification.ts
- [x] P3.3.2 — Create badge-toast.tsx
- [x] P3.3.3 — Verify badges table has 25 rows
- [x] P3.3.4 — Test: complete first lesson → prima_lectie badge awarded
- [x] P3.3.5 — Test: bufnita_de_noapte secret badge logic
- [x] P3.4.1 — Create streak-toast.tsx
- [x] P3.4.2 — Wire streak milestone XP in markLessonComplete
- [x] P3.5.1 — Create leaderboard page (RSC, weekly RPC)
- [x] P3.5.2 — Add Clasament to sidebar nav
- [x] P3.5.3 — Test leaderboard with 2 accounts
- [x] P3.6.1 — Create pixel-mascot.tsx (SVG + framer-motion, 6 emotions)
- [x] P3.6.2 — Visual check: all 6 emotions at 80px and 160px
- [x] P3.7.1 — Create mascot-celebration-overlay.tsx
- [x] P3.7.2 — Extend markLessonComplete to return full MarkCompleteResult
- [x] P3.7.3 — Wire celebration in lesson-page-client.tsx
- [x] P3.7.4 — Wire Pixel sad in lesson-gate.tsx (wrong answer)
- [x] P3.7.5 — Create absence-mascot.tsx (3+ days absent)
- [x] P3.7.6 — Wire absence mascot in dashboard page
- [x] P3.7.7 — Confirm onboarding welcome Pixel in step-welcome.tsx
- [x] P3.8.1 — E2E test: lesson complete → full celebration flow
- [x] P3.8.2 — npx tsc --noEmit passes

**Phase 3 Total: 28 tasks | Completed: 28 ✅**

---

## PHASE 4 — Interactive Learning
**Status:** ⏳ Not started | Depends on: Phase 3 complete

- [x] P4.0.1 — DB migration: minigame_sessions + extend flashcards + search_vector
- [x] P4.1.x — 6 mini-game components (8 files)
- [x] P4.2.x — Flashcard spaced repetition (SM-2 algorithm)
- [x] P4.3.x — F2 Adaptive quiz (API route + AdaptiveQuizSection)
- [x] P4.4.x — F3 Neural network visualiser (4 components)
- [x] P4.5.x — F1 Python execution (Pyodide hook + Piston proxy + OutputPanel)
- [x] P4.6.x — Cmd+K global search (CommandPalette + /api/search route)
- [ ] P4.7.x — Focus mode per lesson

**Phase 4 Total: ~25 tasks | Completed: 7**

---

## PHASE 5 — Social & Portfolio
**Status:** ✅ Complete | Depends on: Phase 4 complete

- [x] P5.1.x — Public portfolio /u/[username] (RSC, admin client, no auth)
- [x] P5.2.x — Activity heatmap (52×7 SVG, green scale, hover tooltip)
- [x] P5.3.x — Learning DNA radar chart (6-axis SVG, framer-motion draw-on)
- [x] P5.4.x — Certificate PDF + QR + verify page (@react-pdf/renderer + qrcode; /verify/[code] public; DB migration pending approval)
- [x] P5.5.x — Project submission (lesson 30): ProjectSubmissionForm + submitProject server action + constructor badge
- [x] P5.6.x — Lesson comments (threaded + upvotes; Level 3+ gate; vocea_comunitatii badge on first comment; LessonComments client component + postComment/upvoteComment server actions)
- [x] P5.7.x — Referral system (/join route.ts sets cookie → signUpWithEmail reads cookie → referral_events insert + XP for both users + ambasador/recrutorul badges; profile/page.tsx shows referral code + count)
- [x] P5.8.x — LinkedIn/Social share button (ShareButton component; Web Share API + LinkedIn fallback; trackPortfolioShare awards vitrina_deschisa; shown on own portfolio page only)

**Phase 5 Total: ~25 tasks | Completed: 25 ✅**

---

## PHASE 6 — Notifications
**Status:** ✅ Complete | Depends on: Phase 5 complete

- [x] P6.0.x — DB migration: notification_preferences + push_subscriptions
- [x] P6.1.x — Resend email + 4 templates + Vercel cron jobs
- [x] P6.2.x — Web Push API (service worker + subscription flow)
- [x] P6.3.x — Notification preferences UI (settings/notifications page + 3 toggles + subscribe/unsubscribe)

**Phase 6 Total: ~20 tasks | Completed: 20 ✅**

---

## PHASE 7 — Advanced Features
**Status:** ✅ Complete | Depends on: Phase 6 complete

- [x] P7.1.x — Interview simulator upgrade: scoring rubric system prompt + 5 category bars + SessionReport component + RAPORT JSON parsing + Framer Motion animations + confetti
- [x] P7.2.x — AI Coach memory: POST /api/ai/coach-session (summarize via GPT-4o-mini + save) + GET /api/ai/coach-sessions (fetch last 3 summaries) + sessionContext injected into chat system prompt + save-on-close + save-on-unmount in ai-coach-chat.tsx + DB migration (ended_at, started_at, message_count, summary columns added)
- [x] P7.3.x — Glossar AI: glossar_terms table (SQL provided for manual run) + RSC page at /glossar + GlossarClient (search + CSS accordion, zero new packages) + seed route POST /api/admin/seed-glossar (admin-only, 50 terms in 6 categories, idempotent) + Glosar link in sidebar

**Phase 7 Total: ~15 tasks | Completed: 3 ✅**

---

## PHASE 8 — Admin Dashboard
**Status:** ✅ Complete | Depends on: Phase 7 complete

- [x] P8.0.x — DB migration SQL provided (safe role constraint fix + lesson_comments moderation columns + get_admin_stats() RPC — awaiting manual run in Supabase)
- [x] P8.1.x — Admin route group: (admin)/layout.tsx (role check → redirect non-admins to /dashboard) + (admin)/admin/page.tsx (4 amber stat cards via get_admin_stats RPC) + AdminSidebar component (6 nav links, active state, back-to-app link)
- [x] P8.2.x — Admin users page: paginated table (50/page) + ?q= search + role badge + toggleUserRole server action (admin-only, self-demotion guard, revalidatePath)
- [x] P8.3.x — Admin lessons page: all lessons with completions count, avg score, feedback clear/hard ratio; sorted by completions desc; type badges with icons
- [x] P8.4.x — Admin minigames page: grouped by game_type; columns: sessions, avg score, perfect count, perfect rate; CSS bar chart for session distribution; summary cards
- [x] P8.5.x — Comment moderation panel (RSC + filter tabs Toate/Raportate/Ascunse + hide/unhide/delete server actions; reported rows amber-highlighted; hidden rows reduced opacity)
- [x] P8.6.x — Badge analytics page (all 25 badges, earned count, % of users, most recent earner; sorted by earned count desc; static slug→category map)

**Phase 8 Total: ~20 tasks | Completed: 7 ✅**

---

## PHASE 9 — Second Course: Prompt Engineering Practic
**Status:** 🔄 In progress | Depends on: Phase 8 complete

- [x] P9.0.x — Create content directory: content/courses/prompt-engineering-practic/ (55 MDX placeholder files: 30 technical + 25 simple; quiz lessons have no simple variant)
- [x] P9.2.x — Insert course row in DB: SQL provided for manual run (slug: prompt-engineering-practic, order_index: 2, difficulty: Intermediar, is_free: true) + sync route created at /api/admin/sync-prompt-engineering
- [x] P9.3.1 — Modul 1+2 content complete (lessons 1-10: 10 technical + 7 simple/quiz MDX files written)
- [x] P9.3.2 — Modul 3+4 content complete (lessons 11-20: 10 technical + 8 simple/quiz MDX files written)
- [x] P9.3.3 — Modul 5+6 content complete (lessons 21-30: 10 technical + 8 simple/quiz/project MDX files written)
- [x] P9.3.x — Write all MDX lesson content (30 lessons × 2 modes — all 6 modules done)
- [x] P9.4.x — Gate questions (48 total — SQL file: devpath-docs/prompt-engineering-gate-questions.sql, awaiting manual run)
- [x] P9.5.x — Flashcard sets (6 modules, 48 total — SQL file: devpath-docs/prompt-engineering-flashcards.sql, awaiting manual run)
- [ ] P9.6.x — Sync + QA + publish

**Phase 9 Total: ~60 tasks | Completed: 2**

---

## PHASE 10 — SEO, Landing Page & Monetization
**Status:** 🔄 In progress | Depends on: Phase 9 complete

- [x] P10.1.x — Meta tags + OG for all routes (layout.tsx default metadata, page.tsx, courses/[courseSlug]/page.tsx generateMetadata, u/[username] OG image updated)
- [x] P10.2.x — Sitemap.xml + robots.txt (src/app/sitemap.ts + src/app/robots.ts — static routes + dynamic /u/[username] + /verify/[code])
- [x] P10.3.x — Landing page redesign (8 sections: Navbar, Hero+PixelMascot excited float, For Whom ×3, Features Grid ×6, Social Proof stats, Pricing Preview ×3 cards, Final CTA+PixelMascot happy, Footer — Framer Motion scroll entrances, src/components/landing/landing-page.tsx client component)
- [x] P10.4.x — Dynamic OG images (src/app/og/route.tsx — ImageResponse 1200×630, edge runtime, ?title=&description= params)
- [x] P10.5.x — Pricing page (src/app/pricing/page.tsx RSC + src/components/pricing/pricing-cards.tsx client — 3 plan cards Free/Pro/Lifetime, Pro highlighted, current plan badge, FAQ ×5, PixelMascot excited)
- [x] P10.6.x — Stripe Checkout (POST /api/stripe/checkout — auth+Zod, customer upsert, session create; /pricing/success + /pricing/cancel pages; pricing-cards.tsx wired with loading spinner + error banner)
- [x] P10.7.1 — DB migration SQL ready (stripe_customer_id, stripe_subscription_id, plan_activated_at) + stripe@^16.12.0 installed + src/lib/stripe.ts singleton created — awaiting manual DB migration run
- [x] P10.7.x — Stripe Webhook (src/app/api/stripe/webhook/route.ts — nodejs runtime, raw body, signature verify, checkout.session.completed → update plan+plan_activated_at+stripe_subscription_id, customer.subscription.deleted → downgrade to free)
- [ ] P10.8.x — Content gates (Free: module 1-2 only)
- [ ] P10.9.x — AI Coach rate limit (5/day free)
- [ ] P10.10.x — Billing portal

**Phase 10 Total: ~35 tasks | Completed: 4**

---

## GRAND TOTAL
**All phases: ~279 tasks | Completed: ~123 (Phases 1–7 + P8.0–P8.4) | Remaining: ~156**
