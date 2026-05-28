# DevPath RO — Project State
Last updated: 2026-04-08

## Platform summary
Romanian e-learning platform for AI/IT education targeting 80% non-technical users (doctors, entrepreneurs, students) and 20% technical users (developers, CS students). Desktop-first Next.js 14 App Router application deployed on Vercel with Supabase backend, delivering 2 courses across 60+ MDX lesson files with dual content modes (Simple/Technical), gamification, AI coaching, and social features.

## Working features

### Authentication & Infrastructure
- ✅ Email/password + Google/GitHub OAuth (Supabase Auth)
- ✅ Session refresh middleware on every request
- ✅ Dashboard auth guard (layout-level redirect)
- ✅ Role-based access (admin/user)

### Content & Learning
- ✅ AI Fundamentals course — 30 lessons (theory, quiz, exercise, project) with full MDX content
- ✅ Prompt Engineering Practic course — 30 lessons, 55 MDX files written (sync + QA pending)
- ✅ Dual content modes: Mod Simplu (no code, analogies) + Mod Tehnic (full Python code)
- ✅ Mode toggle per lesson, persisted to `users.learning_mode`
- ✅ Gate questions on theory lessons (must answer correctly to complete)
- ✅ Scroll tracking (90% required before completion button enables)
- ✅ Lesson bookmarks and feedback (thumbs up/down)
- ✅ Flashcard decks with 3D flip animation (Framer Motion)
- ✅ Flashcard spaced repetition (SM-2 algorithm)
- ✅ MDX sync-action for both courses

### AI Features
- ✅ AI Coach chat — GPT-4o-mini streaming via Vercel AI SDK, auth + Zod validated
- ✅ Voice AI Coach — Web Speech API STT (push-to-talk) + OpenAI TTS-1 "nova"
- ✅ AI Coach memory — session summaries saved, last 3 loaded as context
- ✅ Adaptive AI Quiz Generation (F2) — generates personalized questions after failed quiz
- ✅ In-Browser Python Execution (F1) — Pyodide WASM + Piston API fallback
- ✅ Neural Network Visualizer (F3) — pure SVG + Framer Motion, 4 components

### Gamification
- ✅ XP system with 16 event types (lesson complete, quiz, streak, mini-game, etc.)
- ✅ 10-level system with Romanian names (Curios → Maestrul AI)
- ✅ 25 badges (progress, streak, skill, social, secret categories)
- ✅ Streak tracking with milestone XP bonuses (3/7/14/30/100 days)
- ✅ Pixel mascot — SVG + Framer Motion, 6 emotions, celebration overlay
- ✅ Absence mascot (3+ days absent dashboard greeting)
- ✅ Level-up, XP, badge, and streak toasts
- ✅ Weekly leaderboard (RPC function)

### Interactive Learning
- ✅ 6 mini-game types (sort concepts, fill blank, match pairs, true/false, build network, write prompt)
- ✅ Mini-games trigger every 3rd lesson automatically
- ✅ Cmd+K global search (CommandPalette + full-text search API)
- ⚠️ Focus mode per lesson — not yet implemented (P4.7.x)

### Social & Portfolio
- ✅ Public portfolio at /u/[username] (no auth required)
- ✅ Activity heatmap (52x7 SVG, green scale)
- ✅ Learning DNA radar chart (6-axis SVG)
- ✅ Certificate PDF with QR code + /verify/[code] public page
- ✅ Project submission (lesson 30) with constructor badge
- ✅ Threaded lesson comments with upvotes (Level 3+ gate)
- ✅ Referral system (/join route, cookie-based, 40 XP both users)
- ✅ LinkedIn/Social share button (Web Share API + fallback)

### Notifications
- ✅ Email via Resend (weekly progress, streak lost, course completion, referral success)
- ✅ Web Push API (service worker + subscription flow)
- ✅ Notification preferences page (3 toggles: email/push/streak)
- ✅ Vercel cron jobs (streak-check, weekly-email)

### Admin
- ✅ Admin dashboard with stat cards (get_admin_stats RPC)
- ✅ User management (paginated, search, role toggle)
- ✅ Lesson analytics (completions, avg score, feedback ratio)
- ✅ Mini-game analytics (grouped by type, session distribution)
- ✅ Comment moderation (filter tabs, hide/unhide/delete)
- ✅ Badge analytics (earned count, % of users)

### SEO & Monetization
- ✅ Meta tags + OG for all routes
- ✅ sitemap.xml + robots.txt (static + dynamic routes)
- ✅ Landing page redesign (8 sections, Framer Motion scroll entrances)
- ✅ Dynamic OG images (ImageResponse, edge runtime)
- ✅ Pricing page (3 plans: Free/Pro/Lifetime)
- ✅ Stripe Checkout (session create, customer upsert)
- ✅ Stripe Webhook (checkout.session.completed, subscription.deleted)
- ⚠️ Content gates (free = module 1-2 only) — not yet implemented (P10.8.x)
- ⚠️ AI Coach rate limit (5/day free) — not yet implemented (P10.9.x)
- ⚠️ Billing portal — not yet implemented (P10.10.x)

### Glossar
- ✅ AI Glossar page (RSC + client search + CSS accordion, 50 terms, 6 categories)
- ✅ Admin seed route (idempotent)

### Interview
- ✅ Interview simulator with scoring rubric (5 category bars, session report, confetti)

## Tech stack

| Package | Version | Purpose |
|---|---|---|
| next | 14.2.35 | Framework (App Router) |
| react / react-dom | ^18 | UI library |
| typescript | ^5 | Language (strict mode) |
| ai (Vercel AI SDK) | ^3.4.33 | AI streaming + generateObject |
| @ai-sdk/openai | ^0.0.66 | OpenAI provider |
| @ai-sdk/react | ^3.0.136 | useChat hook |
| @supabase/supabase-js | ^2.99.1 | Database + Auth client |
| @supabase/ssr | ^0.9.0 | Server-side Supabase client |
| framer-motion | ^12.38.0 | Animations (mascot, page transitions, games) |
| @monaco-editor/react | ^4.7.0 | In-browser code editor |
| @react-pdf/renderer | ^4.3.2 | Certificate PDF generation |
| qrcode | ^1.5.4 | QR codes for certificates |
| stripe | ^16.12.0 | Payment processing |
| resend | ^4.8.0 | Transactional email |
| web-push | ^3.6.7 | Browser push notifications |
| @react-email/components | ^0.0.35 | Email templates |
| @react-email/render | ^1.4.0 | Email rendering |
| react-markdown | ^10.1.0 | MDX rendering |
| remark-gfm | ^4.0.1 | GitHub Flavored Markdown |
| rehype-highlight | ^7.0.2 | Code syntax highlighting |
| highlight.js | ^11.11.1 | Syntax highlighting engine |
| gray-matter | ^4.0.3 | MDX frontmatter parsing |
| canvas-confetti | ^1.9.4 | Celebration effects |
| lucide-react | ^0.577.0 | Icons |
| zod | ^3.25.76 | Input validation |
| @radix-ui/* | various | UI primitives (avatar, dropdown, progress, separator, slot, switch, tooltip) |
| class-variance-authority | ^0.7.1 | Component variant utility |
| clsx | ^2.1.1 | Conditional class names |
| tailwind-merge | ^3.5.0 | Tailwind class merging |
| tailwindcss-animate | ^1.0.7 | Animation utilities |
| @tailwindcss/typography | ^0.5.19 | Prose styling |
| pyodide | ^0.27.0 | Python WASM types (devDep, CDN-loaded at runtime) |

## Database schema

| Table | Columns | Purpose | Has data? |
|---|---|---|---|
| users | 18+ cols (id, email, name, plan, role, xp_points, level, streak_count, learning_mode, etc.) | User profiles + gamification state | Yes |
| courses | 7 cols | Course catalog | Yes (2 courses) |
| lessons | 10+ cols (incl. content_md, content_simple_md, search_vector) | Lesson content | Yes |
| user_progress | 6 cols | Per-user lesson completion + scores | Yes |
| quiz_questions | 6 cols | Static quiz questions per lesson | Yes |
| projects | 6 cols | User portfolio projects | Yes |
| lesson_gate_questions | ~5 cols | Gate completion questions per lesson | Yes |
| lesson_gate_attempts | ~5 cols | User gate question attempts | Yes |
| lesson_bookmarks | ~4 cols | Saved lessons per user | Yes |
| lesson_feedback | ~5 cols | Thumbs up/down per lesson | Yes |
| xp_events | ~5 cols | XP transaction log | Yes |
| badges | ~5 cols | Badge catalog (25 rows seeded) | Yes |
| user_badges | ~4 cols | Badges earned per user | Yes |
| referral_events | ~4 cols | Referral tracking | Yes |
| quiz_wrong_answers | ~6 cols | Wrong quiz answers for adaptive quiz | Yes |
| ai_generated_questions | ~8 cols | Adaptive quiz AI output | Yes |
| flashcards | ~5 cols | Flashcard definitions per lesson | Yes |
| user_flashcard_progress | ~7 cols (SM-2: ease_factor, interval_days, repetitions, due_date) | Spaced repetition state | Yes |
| lesson_comments | ~8 cols (incl. moderation columns) | Threaded comments with upvotes | Yes |
| push_subscriptions | ~4 cols | Browser push endpoints | Yes |
| ai_coach_sessions | ~7 cols (incl. summary, message_count) | AI coach session summaries | Yes |
| minigame_sessions | ~7 cols | Mini-game results | Yes |
| notification_preferences | ~5 cols | Email/push/streak toggles | Yes |
| glossar_terms | ~6 cols | AI glossary (50 terms, 6 categories) | Yes |
| certificates | ~5 cols | Course completion certificates | Yes |

Trigger: `on_auth_user_created` → auto-inserts into `public.users`.
RPC functions: `award_xp_and_check_level`, `get_weekly_leaderboard`, `get_admin_stats`.

## Application structure

### Routes (page.tsx)
- `/` — Landing page (8 sections)
- `/login`, `/register` — Auth pages
- `/onboarding` — 4-step onboarding wizard
- `/dashboard` — Main dashboard (stats, continue learning)
- `/courses`, `/courses/[courseSlug]`, `/courses/[courseSlug]/[lessonId]` — Course browsing + lesson viewer
- `/flashcards` — Flashcard review (SM-2)
- `/glossar` — AI glossary
- `/interview` — Interview simulator
- `/leaderboard` — Weekly leaderboard
- `/portfolio` — User portfolio (dashboard)
- `/profile` — User profile settings
- `/roadmap` — Learning roadmap
- `/settings/notifications` — Notification preferences
- `/pricing`, `/pricing/success`, `/pricing/cancel` — Stripe checkout flow
- `/u/[username]` — Public portfolio (no auth)
- `/verify/[code]` — Certificate verification (public)
- `/admin`, `/admin/users`, `/admin/lessons`, `/admin/minigames`, `/admin/comments`, `/admin/badges` — Admin panel

### Routes (route.ts — API)
- `/api/ai/chat`, `/api/ai/tts` — AI Coach (edge runtime)
- `/api/ai/coach-session`, `/api/ai/coach-sessions` — Session memory
- `/api/ai/generate-quiz` — Adaptive quiz
- `/api/execute-code` — Piston proxy
- `/api/search` — Full-text search
- `/api/certificate/[courseSlug]` — PDF generation
- `/api/stripe/checkout`, `/api/stripe/webhook` — Payments
- `/api/push/subscribe`, `/api/push/send` — Push notifications
- `/api/cron/streak-check`, `/api/cron/weekly-email` — Cron jobs
- `/api/onboarding/welcome-message` — AI welcome
- `/api/admin/seed-glossar`, `/api/admin/sync-prompt-engineering` — Admin utilities
- `/auth/callback` — OAuth callback
- `/join` — Referral redirect

### Components (16 folders + 2 standalone)
- `course/` (7 files), `layout/` (4), `ui/` (shadcn), `minigame/` (8), `gamification/` (4 toasts), `mascot/` (3), `onboarding/` (5), `flashcards/` (1), `visualiser/` (4), `search/` (1), `portfolio/` (4), `landing/` (1), `pricing/` (1), `admin/` (1), `dashboard/` (1), `glossar/` (1), `interview/` (1), `profile/` (1), `settings/` (1), `pdf/` (1)

### Content
- `content/courses/ai-fundamentals/` — 56 MDX files (30 technical + 26 simple)
- `content/courses/prompt-engineering-practic/` — 55 MDX files (30 technical + 25 simple)

### Hooks
- `use-pyodide.ts`, `use-push-notifications.ts`, `use-speech-recognition.ts`, `use-speech-synthesis.ts`

### Lib
- `supabase/` (server.ts, client.ts, middleware.ts, admin.ts)
- `gamification.ts`, `gamification-constants.ts`, `holiday-helpers.ts`
- `flashcard-sm2.ts`, `onboarding-mapping.ts`, `stripe.ts`
- `email/` (templates), `utils.ts`

## Not yet implemented

### Interactive Learning
- Focus mode per lesson (P4.7.x)

### Monetization & Gating
- Content gates: free users limited to modules 1-2 (P10.8.x)
- AI Coach rate limit: 5 calls/day for free users (P10.9.x)
- Stripe billing portal for subscription management (P10.10.x)

### Course 2 Finalization
- Prompt Engineering Practic: sync + QA + publish (P9.6.x)

### Deferred from Phase 2
- Referral code handling during auth signup flow (P2.3.2 → moved to P5.7.x, completed there)

## Installed tools

### MCPs (from .claude/settings.json)
- **Context7** — live library documentation (Next.js, Supabase, Framer Motion, etc.)
- **Supabase MCP** — live schema access, queries, RLS policy inspection (read-only)

### Skills (from .agents/skills/)
- deploy-to-vercel
- vercel-cli-with-tokens
- vercel-composition-patterns
- vercel-react-best-practices
- vercel-react-native-skills
- web-design-guidelines

### Agents (from .claude/agents/)
- nextjs-architecture-expert
- react-performance-optimizer
- supabase-schema-architect

### Commands (from .claude/commands/)
- nextjs-component-generator
- nextjs-performance-audit
- supabase-migration-assistant
- supabase-schema-sync
- supabase-security-audit
- supabase-type-generator

## Known issues

- Prompt Engineering Practic course: MDX content written but not yet synced to DB or QA'd (P9.6.x)
- Gate questions SQL file (`prompt-engineering-gate-questions.sql`) awaiting manual run in Supabase
- Flashcard SQL file (`prompt-engineering-flashcards.sql`) awaiting manual run in Supabase
- Stripe DB migration columns (stripe_customer_id, stripe_subscription_id, plan_activated_at) — SQL provided, awaiting manual run
- Free tier content gating not enforced — all content accessible to all users
- AI Coach has no rate limiting — free users can make unlimited calls
- Phase 4 progress count in devpath-progress.md shows "Completed: 7" but task groups P4.1-P4.6 are all marked [x] — count was not updated
- Phase 7/8/9/10 task counts in devpath-progress.md are approximate ("~15", "~20", etc.)
- `next-intl` was fully removed but `messages/ro.json` and `messages/en.json` still exist as reference files (not imported at runtime)
- Performance budget guard hook references macOS `stat -f%z` syntax — may not work correctly on all platforms

## Implementation methodology

### Workflow
1. Bogdan describes task in Romanian → Claude (chat) generates English prompt
2. Bogdan copies prompt → Claude Code (terminal) implements
3. Bogdan verifies in browser → reports back to Claude (chat)

### Document system used
- `IMPLEMENTATION-INDEX.md` = master navigator, told Claude Code which ref to load
- `PHASE-X-REF.md` = short context per phase (~55 lines), loaded at session start
- `devpath-plan-phaseX.md` = detailed specs (1000-2200 lines), used by human + Claude chat to generate prompts
- `devpath-progress.md` = master checklist (~279 tasks, `[x]`/`[ ]` notation)
- `DevPath-RO-Context-Rezumat-FINAL.md` = summary context for new Claude chat conversations
- `TOOLS-AND-MCP-SETUP.md` = MCP setup, compact schedule, prompt template

### Task notation
P[phase].[group].[task] — e.g., P4.A.1 = Phase 4, Group A, Task 1
Groups lettered A-G per phase. One group = one prompt to Claude Code.

### Prompt format
```
---START PROMPT---
**CONTEXT** — only what's specific to this task
**TASK** — what to build
**FILES TO CREATE** — exact path + what it does
**FILES TO MODIFY** — exact path + what changes
**TECHNICAL REQUIREMENTS** — specific to task
**NEW PACKAGES TO INSTALL** — or "None"
**DO NOT** — what not to break
**EXPECTED RESULT** — what the user sees
---END PROMPT---
```

### Session start template (given to Claude Code)
```
Read devpath-docs/IMPLEMENTATION-INDEX.md to confirm current phase.
Read devpath-docs/phase-refs/PHASEX-REF.md for task group context.
Then read only the relevant section of devpath-docs/devpath-plan-phaseX.md.

Implement task [TASK-ID] only.
After completing, mark [TASK-ID] as done in devpath-docs/devpath-progress.md.
Run npx tsc --noEmit and fix any type errors before finishing.
```

### Rules that made it efficient
- `/compact` after every major milestone (specific schedule defined per phase)
- One task group per prompt, never combine
- Ref files as lightweight navigators (not full plans)
- SQL shown for human approval before execution
- Progress updated after each prompt
- Claude Code had CLAUDE.md + Supabase MCP + Context7 MCP — no need to repeat stack in prompts
- DB schema never included in prompts (Supabase MCP provides live access)

### What to improve next time
- Plan files were too long (1000-2200 lines) — cap at 500
- Context duplicated across files (vision + plans + refs + context-rezumat) — use single EXECUTION-PLAN.md with inline refs
- Separate PROGRESS.md for checklist only (don't mix with plan details)
- Task counts in progress file were approximate for later phases — maintain exact counts
- devpath-master-context.md (full audit) became stale after Phase 0 — either auto-update or don't create
