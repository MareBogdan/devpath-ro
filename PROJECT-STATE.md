# DevPath RO — Project State
Last updated: 2026-08-07

## Platform summary
Romanian gamified learning platform for AI/tech education. Mission: "De la electronul fizic la agenți AI autonomi" (from the physical electron to autonomous AI agents). Target audience: technically curious users aged 20–35 who want to genuinely understand how AI works. Desktop-first Next.js 14 App Router application on Vercel with Supabase backend, delivering a 12-course / 205-lesson curriculum (single content mode, `content_md` only), with gamification, an interactive learning layer, AI coaching, and social features. Content is Romanian-only.

## Curriculum — ML/PyTorch structure (PyTorch pivot, 2026-08-04)

The curriculum was re-pivoted to focus squarely on machine learning / deep learning, with PyTorch as the spine. 12 courses, 205 lessons total. Courses 1-3 (hardware, OS, networking) are unchanged and hold real user data; Courses 4-12 were rewritten for ML/DL/PyTorch and re-slugged. Verified against the live DB on 2026-08-07 (migration + seeder already applied).

| # | slug | title | difficulty | lessons | published |
|---|------|-------|-----------|---------|-----------|
| 1 | hardware-fizica | Hardware & Fizică | 2.0 | 30 | 25 |
| 2 | sisteme-de-operare | Sisteme de Operare | 2.5 | 22 | 19 |
| 3 | retele-internet | Rețele & Internet | 2.5 | 26 | 0 |
| 4 | python-matematica-dl | Python & Matematică pentru Deep Learning | 2.0 | 17 | 0 |
| 5 | data-engineering-ml-clasic | Data Engineering & ML Clasic | 2.5 | 15 | 0 |
| 6 | pytorch-core | PyTorch Core | 3.0 | 16 | 0 |
| 7 | computer-vision-cnn | Computer Vision & CNN | 3.0 | 15 | 0 |
| 8 | sequence-models-rnn | Sequence Models (RNN & LSTM) | 3.5 | 14 | 0 |
| 9 | transformer-architecture | Arhitectura Transformer | 4.0 | 13 | 0 |
| 10 | modele-generative | Modele Generative | 4.0 | 13 | 0 |
| 11 | reinforcement-learning | Reinforcement Learning | 4.0 | 12 | 0 |
| 12 | pytorch-productie | PyTorch în Producție | 3.5 | 12 | 0 |

**Authoring status:** Only C1 (30 lessons written, 25 published — 5 written-but-unpublished) and C2 (19 written & published) have real content. C3–C12 are seeded placeholders (`content_md = ''`, unpublished). Content authoring for the remaining courses is the active production phase.

**Key pivot facts (PyTorch pivot, 2026-08-04):**
- Courses 1-3 are INTACT (slug, title, lessons, order) — they hold real user data and were not touched.
- Courses 4-12 were rewritten for an ML/DL/PyTorch focus and re-slugged. The rename is done in the DB by migration `20260804120000_rename_courses_4_12_slugs.sql`, which must run BEFORE the seeder (otherwise the seeder would insert duplicate new courses instead of updating the existing ones).
- Old v5 slug → new slug (order 4-12): `python-inginerie-software`→`python-matematica-dl`, `algoritmi-structuri-date`→`data-engineering-ml-clasic`, `matematica-ai`→`pytorch-core`, `baze-date-ingineria-datelor`→`computer-vision-cnn`, `machine-learning`→`sequence-models-rnn`, `deep-learning-computer-vision`→`transformer-architecture`, `ai-generativ-llms`→`modele-generative`, `agentic-ai-mcp`→`reinforcement-learning`, `ai-in-productie`→`pytorch-productie`.
- Source of truth for the curriculum: `devpath-docs/CURRICULUM-STRUCTURE.md` (parsed by `scripts/seed-curriculum.mjs`).

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
- Level-up / XP / badge / streak toasts
- Weekly leaderboard (RPC)

### Social & Portfolio
- Public portfolio at `/u/[username]` (no auth), activity heatmap, Learning DNA radar
- Certificate PDF with QR + `/verify/[code]` public verification
- Threaded lesson comments with upvotes
- Referral system (`/join`, cookie-based)
- Social share

### Notifications
- Email via Resend (weekly progress, streak lost, course completion, referral)
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
**AI:** ai ^3.4.33, @ai-sdk/anthropic ^0.0.56 (model in src/lib/ai/model.ts; `@ai-sdk/openai` left installed but unused), @ai-sdk/react ^3.0.136 (SDK v3 — API differs from v4/v5)
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

## Database schema (live — verify via Supabase MCP)

Content/curriculum: `courses` (12 rows), `lessons` (205 rows; `content_md`, `module_index`, `is_published`, `search_vector`; UNIQUE(course_id, order_index)).

13 tables reference `lessons.id` (all ON DELETE CASCADE): `user_progress`, `quiz_questions`, `quiz_wrong_answers`, `ai_generated_questions`, `flashcards`, `inline_questions`, `wow_notes`, `lesson_scores`, `lesson_bookmarks`, `lesson_feedback`, `lesson_comments`, `minigame_sessions`, `ai_coach_sessions`.

Other tables: `users`, `xp_events`, `badges`, `user_badges`, `referral_events`, `user_flashcard_progress`, `push_subscriptions`, `notification_preferences`, `glossar_terms`, `certificates`, `projects`, `inline_attempts` (per-user inline-question attempts; FK → `inline_questions.id`, so correctly NOT among the 13 `lessons` children).

**Dropped** (migration `20260627120000_drop_retired_gate_and_dead_columns`): `lesson_gate_questions`, `lesson_gate_attempts`, and `lessons.content_simple_md`. The dual-mode / gate-question system no longer exists.

**Seed infrastructure (July 2026):** `scripts/seed-curriculum.mjs` is the single seed source (the old `seed-curriculum.sql` is deprecated, archived under `devpath-docs/archive/`). It is scoped to the 9 Course 4–12 slugs, uses the atomic `reseed_course_lessons` RPC (delete-then-insert with a 13-table child-row guard), and protects Courses 1–3. UNIQUE(course_id, order_index) is enforced live.

Trigger: `on_auth_user_created` → auto-inserts into `public.users`.
RPC functions include: `award_xp_and_check_level`, `get_weekly_leaderboard`, `get_admin_stats`, `reseed_course_lessons`.

## Application structure

### Pages (24 page.tsx)
`/`, `/login`, `/register`, `/onboarding`, `/pricing` (+`/success`,`/cancel`), `/u/[username]`, `/verify/[code]`, `/dashboard`, `/courses`, `/courses/[courseSlug]`, `/courses/[courseSlug]/[lessonId]`, `/flashcards`, `/glossar`, `/interview`, `/leaderboard`, `/portfolio`, `/profile`, `/roadmap`, `/settings/notifications`, `/dev/components` (dev-only), and admin: `/admin`, `/admin/users`, `/admin/lessons`, `/admin/minigames`, `/admin/comments`, `/admin/badges`.

### API routes (22 route.ts)
`/api/ai/chat`, `/api/ai/coach-session(s)`, `/api/ai/generate-quiz`, `/api/search`, `/api/certificate/[courseSlug]`, `/api/stripe/{checkout,webhook}`, `/api/push/{subscribe,send}`, `/api/cron/{streak-check,weekly-email}`, `/api/onboarding/welcome-message`, `/api/admin/{seed-glossar,sync-prompt-engineering}`, `/auth/callback`, `/join`.

### Components (src/components/, real counts)
`ui/` (31), `course/` (28), `dashboard/` (12), `profile/` (9), `minigame/` (8), `onboarding/` (6), `portfolio/` (5), `layout/` (5), `interactive/` (5), `gamification/` (4), `visualiser/` (4), `mdx/` (4), `mascot/` (2), `flashcards/` (2), plus single-file: `admin/`, `glossar/`, `interview/`, `landing/`, `pricing/`, `pdf/`, `roadmap/`, `search/`, `settings/`, and standalone `theme-provider.tsx` / `theme-toggle.tsx`.

### Server Actions (10)
`(auth)/actions.ts`, `courses/actions.ts`, `courses/inline-actions.ts`, `courses/sync-action.ts`, `flashcards/actions.ts`, `profile/actions.ts`, `settings/notifications/actions.ts`, `onboarding/actions.ts`, `admin/comments/actions.ts`, `admin/users/actions.ts`.

### Content directory
`content/courses/` holds the 12 current course slug folders; only `hardware-fizica/` (25 .mdx) and `sisteme-de-operare/` (19 .mdx) have files. The other 10 are empty. (The old `ai-fundamentals/` and `prompt-engineering-practic/` folders no longer exist.) Note: C1 DB has 30 lessons with content but disk has 25 .mdx — 5 C1 lessons carry DB content with no current MDX file (unpublished).

### Hooks & Lib
Hooks: `use-pyodide` (worker client), `use-push-notifications`, `use-speech-recognition`. Workers: `src/workers/pyodide.worker.ts`.
Lib: `supabase/{server,client,middleware,admin}`, `gamification(+constants)`, `stripe`, `flashcard-sm2`, `email/*`, `course-map`, `difficulty`, `animations`, `holiday-helpers`, `onboarding-mapping`, and the interactive engine: `inline-question-schema`, `inline-scoring`, `fill-blank-parser`, `seeded-shuffle`.

## Not yet implemented
- Content gates (free tier limited to early modules)
- AI Coach rate limit (free tier)
- Stripe billing portal
- Content authoring for Courses 3–12 (active production phase)

## Installed tools

### MCPs
- Supabase MCP — live schema access, queries (read-only)
- Context7 MCP — live library documentation
- Playwright MCP, GitHub MCP (bind when `claude` starts from a VS Code integrated terminal)

## Known issues
- Free-tier content gating not enforced — all content currently accessible
- AI Coach has no rate limiting
- C1: 5 lessons have DB content but no MDX file on disk, and are unpublished (30 written vs 25 published)
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
