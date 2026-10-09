# DevPath RO — Project State
Last updated: 2026-10-09 (P2 cleanup — see `devpath-docs/MASTER-PLAN.md`)

## Platform summary
Romanian gamified learning platform for AI/tech education. Mission: "De la electronul fizic la agenți AI autonomi" (from the physical electron to autonomous AI agents). Target audience: technically curious users aged 20–35 who want to genuinely understand how AI works. Desktop-first Next.js 14 App Router application on Vercel with Supabase backend, delivering a 13-course / 245-lesson curriculum (single content mode, `content_md` only), with gamification, an interactive learning layer, AI coaching, and social features. Content is Romanian-only.

## Curriculum — 13 courses / 245 lessons

**Source of truth for structure: `devpath-docs/CURRICULUM-STRUCTURE.md`** (every lesson title, the lab/boss slots, written vs planned). **Current plan: `devpath-docs/MASTER-PLAN.md`.** Live state is the DB (verify via Supabase MCP).

| # | slug | lessons (final) | state |
|---|------|----------------|-------|
| 1 | hardware-fizica | 30 | published · 25 written, 5 lab/boss slots to add |
| 2 | sisteme-de-operare | 22 | published · 19 written, 3 slots |
| 3 | retele-internet | 26 | published · 24 written, 2 slots |
| 4 | python-inginerie-software | 29 | published · 26 written, 3 slots |
| 5 | algoritmi-structuri-date | 19 | published · 16 written, 3 slots |
| 6 | matematica-ai | 24 | published · 21 written, 3 slots |
| 7 | pytorch-core | 16 | unpublished skeleton (inserted 2026-10-09) |
| 8 | computer-vision-cnn | 15 | unpublished skeleton |
| 9 | sequence-models-rnn | 14 | unpublished skeleton |
| 10 | transformer-architecture | 13 | unpublished skeleton |
| 11 | modele-generative | 13 | unpublished skeleton |
| 12 | reinforcement-learning | 12 | unpublished skeleton |
| 13 | pytorch-productie | 12 | unpublished skeleton |

**Authoring status (2026-10-09):** courses 1–6 are published with 131 lessons written (131 `.mdx` in `content/courses/`, all `type: lesson`); 0 lab/boss lessons exist yet in the content (5 are built as code for Course 1 — see MASTER-PLAN P3). Courses 7–13 are seeded placeholders (`content_md = ''`, `is_published = false`, 95 rows) shown as "În curând". The DB holds 13 courses and 226 lesson rows. **Do not work on courses 7–13 until 1–6 are launch quality** (MASTER-PLAN).

**History:** the August PyTorch pivot planned new slugs for C4–6, but decision D1 (2026-09-30) kept the live v5 slugs and content for C4–6. On 2026-10-09 (P1) `pytorch-core` was inserted as Course 7 and the ML courses shifted to 8–13; `data-engineering-ml-clasic` was dropped from the main track. Courses 1–3 hold real user data — never reseed them.

## Working features

### Authentication & Infrastructure
- Email/password + Google/GitHub OAuth (Supabase Auth)
- Session refresh middleware on every request
- Dashboard auth guard (layout-level redirect)
- Role-based access (admin/user)

### Content & Learning
- MDX lessons rendered via `next-mdx-remote` v6, with KaTeX math (`rehype-katex`/`remark-math`) and syntax highlighting
- Single content mode (`content_md`) — the old dual Simple/Technical mode was retired
- MDX sync-action publishes authored lessons to the DB
- Lesson bookmarks and feedback (thumbs up/down)
- Flashcard decks with 3D flip animation + SM-2 spaced repetition
- Interactive learning layer (see below)

### Interactive Learning Layer
- Inline questions embedded in MDX via `<InlineQuestion n="..." />` anchors, backed by the `inline_questions` DB table. 6 locally-verifiable types (single_choice, true_false, short_answer, match_pairs, ordering, fill_blank); server-side scoring. A reserved 7th type `essay_ai` (AI-graded) exists in the schema but is deliberately excluded from the 6 locally-verifiable types.
- Wow Notes embedded via `<WowNote n="..." />` anchors, backed by `wow_notes` (media types `none | svg | component` — text-only notes use `none` with the prose in the `body` column); desktop lateral gutter at the `xl:` breakpoint.
- Scoring stored in `lesson_scores` (best-attempt-counts, green/yellow/white lesson coloring).
- 6 mini-game types (build-network, fill-blank, match-pairs, sort-concepts, true-false, write-prompt) via a modal; mini-game results in `minigame_sessions`.
- Cmd+K global search (CommandPalette + full-text search API).

### AI Features
- AI Coach chat — Claude (Anthropic; model id lives only in `src/lib/ai/model.ts`) streaming via Vercel AI SDK v3, auth + Zod validated
- Voice AI Coach — voice **input** only: browser Web Speech API STT (push-to-talk, ro-RO) → text reply. No TTS / no sound (removed 2026-10-01, owner request); no server voice routes
- AI Coach memory — session summaries saved, last 3 loaded as context
- Adaptive AI Quiz Generation — generates personalized questions after a failed quiz
- In-Browser Python Execution — Pyodide WASM only, in a Web Worker with a 10 s timeout (terminate on timeout/Stop); Piston fallback removed
- Neural Network Visualizer — SVG + Framer Motion forward-pass animation

### Gamification
- XP system (16 event types), 10-level Romanian naming (Curios → Maestrul AI)
- 25 badges (progress/streak/skill/social/secret), streak tracking with milestone bonuses
- Cosmo mascot — procedural SVG golden retriever, 8 emotions (happy, excited, thinking, encouraging, celebrating, sleeping, waving, sad), idle animations, particle overlays
- XP / badge / streak toasts and the celebration overlay (its "LEVEL UP!" card is the level-up moment)
- Weekly leaderboard (RPC)

### Social & Portfolio
- Public portfolio at `/u/[username]` (no auth), activity heatmap, Learning DNA radar
- Certificate PDF with QR + `/verify/[code]` public verification
- Threaded lesson comments with upvotes
- Referral system (`/join`, cookie-based)
- Social share

### Notifications
- Email via Resend (weekly progress, streak lost — the course-completion and referral templates were never wired up and were removed)
- Web Push API (service worker + subscription flow)
- Notification preferences (email/push/streak toggles)
- Vercel cron jobs (streak-check, weekly-email)

### Admin
- Admin dashboard with stat cards, user management, lesson/mini-game/badge analytics, comment moderation

### Other pages
- AI Glossar (RSC + client search, 50 terms), Interview simulator, Roadmap, `/dev/components` (dev-only showcase)

### SEO & Monetization
- Meta/OG for all routes, sitemap + robots, dynamic OG images
- Pricing page (Free/Pro/Lifetime), Stripe Checkout + Webhook
- ⚠️ Content gates (free tier limits) — not yet enforced
- ⚠️ AI Coach rate limit — not yet implemented
- ⚠️ Stripe billing portal — not yet implemented

## Tech stack (real versions from package.json)

**Core:** next 14.2.35, react ^18, typescript ^5 (strict)
**AI:** ai ^3.4.33, @ai-sdk/anthropic ^0.0.56 (model in src/lib/ai/model.ts; `@ai-sdk/openai` was removed 2026-10-09), @ai-sdk/react ^3.0.136 (SDK v3 — API differs from v4/v5)
**DB/Auth:** @supabase/supabase-js ^2.99.1, @supabase/ssr ^0.9.0
**MDX:** next-mdx-remote ^6.0.0, react-markdown ^10, remark-gfm, rehype-highlight, gray-matter
**Math rendering:** katex ^0.16.47, rehype-katex ^7, remark-math ^6
**3D:** three ^0.183, @react-three/fiber ^8.18, @react-three/drei ^9.122
**UI/Animation:** framer-motion ^12.38, motion ^12.38, next-themes ^0.4.6, Radix UI (avatar, dropdown, progress, separator, slot, switch, tooltip), lucide-react, class-variance-authority, clsx, tailwind-merge, tailwindcss-animate, @tailwindcss/typography, canvas-confetti
**Editor:** @monaco-editor/react ^4.7.0
**Payments/Email/Push:** stripe ^16.12, resend ^4.8, @react-email/*, web-push ^3.6.7
**PDF/QR:** @react-pdf/renderer ^4.3.2, qrcode ^1.5.4
**Analytics:** @vercel/analytics ^2.0.1
**Validation:** zod ^3.25.76
**Dev:** pyodide ^0.27.0 (types; CDN-loaded at runtime), tailwindcss ^3.4.1, eslint ^8

> **No i18n library.** `next-intl` has been fully removed. Platform is Romanian-only, all UI text hardcoded in components. There is no `src/i18n/` directory and no `messages/` directory.

## Database schema (live — verify via Supabase MCP; `schema.sql` is stale)

Content/curriculum: `courses` (13 rows, `order_index` 1–13), `lessons` (226 rows: 131 published + 95 skeletons; `content_md`, `module_index`, `is_published`; UNIQUE(course_id, order_index)).

13 tables reference `lessons.id` (all ON DELETE CASCADE): `user_progress`, `quiz_questions`, `quiz_wrong_answers`, `ai_generated_questions`, `flashcards`, `inline_questions`, `wow_notes`, `lesson_scores`, `lesson_bookmarks`, `lesson_feedback`, `lesson_comments`, `minigame_sessions`, `ai_coach_sessions`.

Other tables: `users`, `xp_events`, `badges`, `user_badges`, `referral_events`, `user_flashcard_progress`, `push_subscriptions`, `notification_preferences`, `glossar_terms`, `certificates`, `projects`, `inline_attempts` (per-user inline-question attempts; FK → `inline_questions.id`, so correctly NOT among the 13 `lessons` children).

**Dropped** (migration `20260627120000_drop_retired_gate_and_dead_columns`): `lesson_gate_questions`, `lesson_gate_attempts`, and `lessons.content_simple_md`. The dual-mode / gate-question system no longer exists.

**Seed infrastructure:** `scripts/seed-curriculum.mjs` seeds/reseeds the unpublished skeleton courses from `devpath-docs/CURRICULUM-STRUCTURE.md` (the old `seed-curriculum.sql` is deprecated, archived under `devpath-docs/archive/`). Its `IN_SCOPE_SLUGS` are the 6 ML slugs (courses 8–13); `pytorch-core` (C7) was inserted by migration `20261009120000_insert_pytorch_core_course.sql` and is not in the seeder's scope. It uses the atomic `reseed_course_lessons` RPC (delete-then-insert with a 13-table child-row guard) and protects the published courses 1–6 (their slugs are in `PROTECTED_SLUGS`). UNIQUE(course_id, order_index) is enforced live.

Trigger: `on_auth_user_created` → auto-inserts into `public.users`.
RPC functions used by the app: `award_xp_and_check_level` (service_role only), `get_weekly_leaderboard`, `get_admin_stats`, `get_public_profiles`, `get_top_users`, `get_community_stats`, `get_recent_completions`; plus `reseed_course_lessons` (service_role, seeder only).

## Application structure

### Pages (28 page.tsx)
`/`, `/login`, `/register`, `/onboarding`, `/pricing` (+`/success`,`/cancel`), `/u/[username]`, `/verify/[code]`, `/dashboard`, `/courses`, `/courses/[courseSlug]`, `/courses/[courseSlug]/[lessonId]`, `/flashcards`, `/glossar`, `/interview`, `/leaderboard`, `/portfolio`, `/profile`, `/roadmap`, `/settings/notifications`, `/dev/components` (dev-only), and admin: `/admin`, `/admin/users`, `/admin/lessons`, `/admin/minigames`, `/admin/comments`, `/admin/badges`.

### API routes (17 route.ts)
`/api/ai/chat`, `/api/ai/coach-session(s)`, `/api/ai/generate-quiz`, `/api/search`, `/api/certificate/[courseSlug]`, `/api/stripe/{checkout,webhook}`, `/api/push/{subscribe,send}`, `/api/cron/{streak-check,weekly-email}`, `/api/onboarding/welcome-message`, `/api/admin/{seed-glossar,sync-prompt-engineering}`, `/auth/callback`, `/join`.

### Components (src/components/, approximate file counts)
`ui/` (~32), `course/` (~29), `mdx/` (~15 — the MDX component registry `mdx-components.tsx`, `FactBox`/`CosmoHint`/`LabBox`, `games/` incl. the 5 mini-game/boss components, `stubs/`), `dashboard/` (~13), `interactive/` (~11 — inline questions + Wow Notes), `profile/` (9), `minigame/` (8), `onboarding/` (6), `portfolio/` (5), `layout/` (~5), `gamification/` (~4), `visualiser/` (4), `mascot/` (2), `flashcards/` (2), plus single-file: `admin/`, `glossar/`, `interview/`, `landing/`, `pricing/`, `pdf/`, `roadmap/`, `search/`, `settings/`, and standalone `theme-provider.tsx` / `theme-toggle.tsx`.

### Server Actions (10)
`(auth)/actions.ts`, `courses/actions.ts`, `courses/inline-actions.ts`, `courses/sync-action.ts`, `flashcards/actions.ts`, `profile/actions.ts`, `settings/notifications/actions.ts`, `onboarding/actions.ts`, `admin/comments/actions.ts`, `admin/users/actions.ts`.

### Content directory
`content/courses/<slug>/` holds the `.mdx` lessons: `hardware-fizica` 25, `sisteme-de-operare` 19, `retele-internet` 24, `python-inginerie-software` 26, `algoritmi-structuri-date` 16, `matematica-ai` 21 = 131, matching the 131 published lessons in the DB. Leftover empty folders from the old v5 layout (`agentic-ai-mcp`, `ai-generativ-llms`, `ai-in-productie`, `baze-date-ingineria-datelor`, `deep-learning-computer-vision`, `machine-learning`) hold only a `.gitkeep` and are unused (a `content/` cleanup — left untouched by P2 per its scope); courses 7–13 have no content folder yet.

### Hooks & Lib
Hooks: `use-pyodide` (worker client), `use-push-notifications`, `use-speech-recognition`. Workers: `src/workers/pyodide.worker.ts`.
Lib: `supabase/{server,client,middleware,admin}`, `gamification(+constants)`, `stripe`, `flashcard-sm2`, `email/*`, `course-map`, `difficulty`, `animations`, `holiday-helpers`, `onboarding-mapping`, and the interactive engine: `inline-question-schema`, `inline-scoring`, `fill-blank-parser`, `seeded-shuffle`.

## Not yet implemented
- Content gates (free tier limited to early modules)
- AI Coach rate limit (free tier)
- Stripe billing portal
- The 19 lab/boss lessons of courses 1–6 (slots listed in `CURRICULUM-STRUCTURE.md`; MASTER-PLAN P3+)
- Content authoring for courses 7–13 (on hold until courses 1–6 reach launch quality)

## Installed tools

### MCPs
- Supabase MCP — live schema access, queries. Use `mcp__claude_ai_Supabase__*` with `project_id="zgofeajewktwmswckgup"` (see CLAUDE.md for the old-project rule)
- Context7 MCP — live library documentation
- Playwright MCP, GitHub MCP (bind when `claude` starts from a VS Code integrated terminal)

## Known issues
- Free-tier content gating not enforced — all content currently accessible
- AI Coach has no rate limiting
- Performance budget guard hook uses macOS `stat -f%z` syntax — may not work on all platforms

## Implementation methodology

### Workflow
1. Bogdan describes a task in Romanian → Claude (chat) generates an English prompt.
2. Bogdan copies the prompt → Claude Code (terminal) implements.
3. Bogdan verifies in the browser → reports back to Claude (chat).

For risky/technical work: first request a read-only audit/recon, then present firm recommendations, then generate the execution prompt (self-verified twice). One prompt at a time.

### Claude Code effort levels
- `/effort xhigh` — audits and risky refactors
- `/effort high` — clear executions
- `/effort medium` — mechanical tasks (commits, reads)

### Prompt format
```
---START PROMPT---
**CONTEXT** — only what's specific to this task
**TASK** — what to build
**FILES TO CREATE / MODIFY** — exact paths
**TECHNICAL REQUIREMENTS** — specific to task
**NEW PACKAGES TO INSTALL** — or "None"
**DO NOT** — what not to break
**EXPECTED RESULT** — what the user sees
---END PROMPT---
```

### Running Claude Code
Run `claude` from a VS Code integrated terminal at `C:\DevPath RO` (the sidebar panel does NOT bind MCP servers; the terminal does). Dev server: `npm run dev` on `:3000` in a separate terminal. Run `npx tsc --noEmit` after significant changes.
