# CLAUDE.md — DevPath RO

> AI assistant configuration for Claude Code. Read this file at the start of every session.

---

## Project Documentation
- `PROJECT-STATE.md` — Single source of truth (ML/PyTorch pivot: 12 courses / 205 lessons, single content mode). Complete project state + methodology. Read first in any new session.
- `devpath-docs/devpath-vision.md` — Original platform vision document. The mascot section references "Pixel" — that mascot was retired in Block 1.5 (2026-05-06) and replaced by Cosmo. See "Cosmo Mascot" section below for the current API.
- `schema.sql` — DB schema reference. For live state, verify via Supabase MCP.

## Design System
- `DESIGN-SYSTEM.md` — Complete Aurora palette reference. Read before any UI/styling task.
- Dark mode is the default. All new components must look good on dark first.
- Primary: violet (#6C5CE7). Accent: teal (#00CEC9). Gold: gamification. Red: streak/alerts.

---

## Project Overview

**DevPath RO** is a Romanian e-learning platform for IT/AI students. Desktop-first Next.js 14 App Router web application deployed on Vercel. Delivers a 12-course / 205-lesson curriculum (single content mode, `content_md`) with `lesson`, `lab`, and `boss` lesson types.

- **Live stack:** Next.js 14 App Router + React 18 + TypeScript (strict mode)
- **Auth & DB:** Supabase (PostgreSQL + Auth + Realtime WebSockets)
- **AI:** Vercel AI SDK + Anthropic (Claude, model id in `src/lib/ai/model.ts`); voice input only = browser Web Speech API STT (mic); the AI Coach has NO text-to-speech/sound, no server voice routes
- **UI:** Tailwind CSS + Radix UI + shadcn/ui + Framer Motion
- **Code editor:** Monaco Editor (`@monaco-editor/react`)
- **Language:** Romanian-only (no i18n library)
- **Payments:** Stripe (Free / Pro / Lifetime plans)
- **Deploy:** Vercel (edge runtime on AI routes)
- **Content:** MDX lesson files in `content/` directory

---

## Full Tech Stack with Versions

From `package.json`:

### Core Framework
| Package | Version |
|---|---|
| `next` | 14.2.35 |
| `react` | ^18 |
| `react-dom` | ^18 |
| `typescript` | ^5 |

### AI & LLM
| Package | Version |
|---|---|
| `ai` (Vercel AI SDK) | ^3.4.33 |
| `@ai-sdk/anthropic` | ^0.0.56 |
| `@ai-sdk/openai` | ^0.0.66 (unused — safe to remove) |
| `@ai-sdk/react` | ^3.0.136 |

### Database & Auth
| Package | Version |
|---|---|
| `@supabase/supabase-js` | ^2.99.1 |
| `@supabase/ssr` | ^0.9.0 |

### UI Components & Animation
| Package | Version |
|---|---|
| `framer-motion` | ^12.38.0 |
| `@radix-ui/react-avatar` | ^1.1.11 |
| `@radix-ui/react-dropdown-menu` | ^2.1.16 |
| `@radix-ui/react-progress` | ^1.1.8 |
| `@radix-ui/react-separator` | ^1.1.8 |
| `@radix-ui/react-slot` | ^1.2.4 |
| `@radix-ui/react-tooltip` | ^1.2.8 |
| `lucide-react` | ^0.577.0 |
| `class-variance-authority` | ^0.7.1 |
| `clsx` | ^2.1.1 |
| `tailwind-merge` | ^3.5.0 |
| `tailwindcss-animate` | ^1.0.7 |
| `@tailwindcss/typography` | ^0.5.19 |
| `canvas-confetti` | ^1.9.4 |

### Editor & Content
| Package | Version |
|---|---|
| `@monaco-editor/react` | ^4.7.0 |
| `react-markdown` | ^10.1.0 |
| `remark-gfm` | ^4.0.1 |
| `rehype-highlight` | ^7.0.2 |
| `gray-matter` | ^4.0.3 |
| `highlight.js` | ^11.11.1 |

### Validation
| Package | Version |
|---|---|
| `zod` | ^3.25.76 |

---

## NPM Scripts

```bash
npm run dev      # Start Next.js dev server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint (next lint)
```

TypeScript check (not in scripts — run manually):
```bash
npx tsc --noEmit
```

---

## Critical Rules — Read Before Every Change

### Package Management
- **NEVER install new npm packages without explicit approval from the user.** State the package name, version, and reason first.
- Prefer native browser APIs or already-installed packages.
- Current packages cover most needs: Zod (validation), Framer Motion (animation), Radix UI (components), Vercel AI SDK (AI streaming), Supabase JS (DB + Realtime), canvas-confetti (celebrations).

### React & Next.js Architecture
- **Server Components by default.** Every new component must be RSC unless it uses browser APIs, hooks, or event handlers.
- `"use client"` only when strictly necessary (interactivity, hooks, browser APIs).
- Use Next.js App Router conventions: `page.tsx`, `layout.tsx`, `loading.tsx`, `route.ts`.
- All new API routes use `export const runtime = "edge"` where appropriate (stateless operations).
- Prefer Server Actions (`"use server"`) over API routes for form submissions and database mutations.

### API Routes
- **ALL API routes must validate input with Zod.** No exceptions.
- AI needs only `process.env.ANTHROPIC_API_KEY` — never hardcode keys. Import `aiModel` / `isAIConfigured` from `@/lib/ai/model` (the ONLY place the model id lives); if not configured return `disabledResponse("ai", "AI indisponibil momentan.")` (503) before calling the model.
- Return proper HTTP status codes (400 for validation errors, 502 for upstream errors).

### Database (Supabase)
- **ALL new Supabase tables must have Row Level Security (RLS) enabled.** No exceptions.
- **Always ask the user before making any database schema changes.** Show the exact SQL first.
- Use `createSupabaseServerClient()` from `@/lib/supabase/server` in Server Components and Server Actions.
- Use the singleton browser client from `@/lib/supabase/client` in Client Components.
- Never use the admin client (`@/lib/supabase/admin`) in client-side code.

### Environment Variables
- **Never modify `.env.local` or `.env.example`.**
- Read `.env.example` to understand required variables — never expose or log their values.

### TypeScript
- Strict mode is ON (`"strict": true` in `tsconfig.json`).
- Always run `npx tsc --noEmit` after significant changes.
- Use types from `@/types/index.ts` for domain objects (`User`, `Course`, `Lesson`, etc.).

---

## 5 High-Tech Features — Current Status

| # | Feature | Status | Notes |
|---|---|---|---|
| F5 | Real-time Social Presence | ✅ DONE | Supabase Realtime pub/sub, avatar stacks, Framer Motion celebration toasts |
| F4 | Voice AI Coach | ✅ DONE | Voice **input** only: browser Web Speech API push-to-talk STT (`ro-RO`) → text reply from Claude. No TTS / no sound (removed 2026-10-01 by owner request; `use-speech-synthesis` deleted). No server voice routes, no extra API key |
| F2 | Adaptive AI Quiz Generation | ✅ DONE | `api/ai/generate-quiz` + `components/course/adaptive-quiz-section.tsx` |
| F1 | In-Browser Python Execution | ✅ DONE | Pyodide-only, runs in a Web Worker (`src/workers/pyodide.worker.ts` + `hooks/use-pyodide.ts`) with a 10 s run timeout that terminates the worker. No Piston / no `api/execute-code` |
| F3 | Neural Network Visualizer | ✅ DONE | SVG + Framer Motion (`components/visualiser/`) |

All five high-tech features (F1–F5) are shipped and live in the codebase.

---

## File Structure Overview

```
c:\DevPath RO\
├── src/
│   ├── app/
│   │   ├── (auth)/               # Login, register, OAuth, locale actions
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── actions.ts        # Server actions: signIn, signUp, signOut
│   │   │   └── oauth-buttons.tsx
│   │   ├── (dashboard)/          # Protected app shell (auth guard in layout)
│   │   │   ├── layout.tsx        # RSC: auth check, sidebar data, Navbar
│   │   │   ├── dashboard/        # Main dashboard page
│   │   │   └── courses/
│   │   │       ├── [courseSlug]/
│   │   │       │   └── [lessonId]/page.tsx  # Lesson viewer (RSC)
│   │   │       ├── actions.ts    # Server actions: progress, completion
│   │   │       └── sync-action.ts
│   │   ├── api/
│   │   │   └── ai/
│   │   │       ├── chat/route.ts   # Edge: Claude streaming (Vercel AI SDK)
│   │   │       ├── coach-session(s)/route.ts, generate-quiz/route.ts
│   │   ├── auth/callback/route.ts  # Supabase OAuth callback
│   │   ├── globals.css
│   │   ├── layout.tsx              # Root layout (themes, providers)
│   │   └── page.tsx                # Landing page
│   ├── components/
│   │   ├── course/
│   │   │   ├── ai-coach-chat.tsx   # Client: AI chat + voice interface
│   │   │   ├── quiz-block.tsx      # Client: quiz rendering + scoring
│   │   │   ├── code-editor.tsx     # Client: Monaco editor
│   │   │   ├── lesson-content.tsx  # Client: MDX renderer
│   │   │   ├── lesson-presence.tsx # Client: Supabase Realtime presence
│   │   │   ├── complete-button.tsx # Client: lesson completion
│   │   │   └── course-card.tsx
│   │   ├── layout/
│   │   │   ├── navbar.tsx          # Client: top navigation
│   │   │   ├── sidebar.tsx         # Client: course/lesson navigation
│   │   │   ├── page-transition.tsx # Client: Framer Motion transitions
│   │   │   └── client-providers.tsx
│   │   └── ui/                     # shadcn/ui components
│   ├── hooks/
│   │   ├── use-pyodide.ts             # Pyodide worker client (timeout/Stop → terminate worker)
│   │   └── use-speech-recognition.ts  # Web Speech API STT (push-to-talk) — the only voice hook
│   ├── workers/
│   │   └── pyodide.worker.ts          # Pyodide in a Web Worker (CDN, preloads numpy/matplotlib)
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── server.ts    # createSupabaseServerClient (RSC/Server Actions)
│   │   │   ├── client.ts    # createBrowserClient singleton (Client Components)
│   │   │   ├── middleware.ts # updateSession
│   │   │   └── admin.ts     # Service role client (server-only)
│   │   ├── locale.ts
│   │   └── utils.ts         # cn() helper
│   ├── middleware.ts         # Supabase session refresh on every request
│   └── types/index.ts       # Domain types: User, Course, Lesson, etc.
├── content/                  # MDX lesson files (12-course ML/PyTorch curriculum; C1/C2 authored)
├── schema.sql               # Full Supabase schema (reference only; verify live via Supabase MCP)
├── seed.sql                 # Seed data for development
├── next.config.mjs          # Next config (transpiles next-mdx-remote, image domains)
├── tailwind.config.ts
└── tsconfig.json            # strict mode enabled
```

---

## Architecture: Server vs Client Components

### Server Components (RSC) — Default
- `src/app/(dashboard)/layout.tsx` — fetches auth, user profile, courses, progress server-side
- `src/app/(dashboard)/courses/[courseSlug]/[lessonId]/page.tsx` — lesson data fetching
- `src/app/(dashboard)/courses/page.tsx` and `dashboard/page.tsx`
- All `loading.tsx` files

### Client Components (`"use client"`)
- Everything in `src/components/course/` — needs hooks and browser APIs
- Everything in `src/components/layout/` — needs Framer Motion, event handlers
- All `src/hooks/` — hooks are always client-side
- `src/components/ui/` — interactive Radix UI components

### Server Actions (`"use server"`)
- `src/app/(auth)/actions.ts` — signIn, signUp, signOut via Supabase Auth
- `src/app/(dashboard)/courses/actions.ts` — progress updates, course completion
- `src/app/(dashboard)/courses/sync-action.ts` — MDX sync to DB

### API Routes (Edge Runtime)
- `src/app/api/ai/chat/route.ts` — Claude streaming, `runtime = "edge"` (voice input is browser-side; there are no tts/stt routes and the coach has no TTS)

---

## Database Schema Summary

| Table | Purpose | RLS |
|---|---|---|
| `public.users` | User profiles extending `auth.users` | ✅ User owns own row |
| `public.courses` | Course catalog | ✅ Public read |
| `public.lessons` | Lesson content (MDX stored in DB) | ✅ Public read |
| `public.user_progress` | Per-user lesson completion + scores | ✅ User owns own rows |
| `public.quiz_questions` | Static quiz questions per lesson | ✅ Public read |
| `public.projects` | User portfolio projects | ✅ User owns + public read for completed |
| `public.lesson_bookmarks` | Saved lessons per user | ✅ User owns own rows |
| `public.lesson_feedback` | Thumbs up/down per lesson | ✅ User owns own rows |
| `public.xp_events` | XP transaction log | ✅ User owns own rows |
| `public.badges` | Badge catalog (25 rows seeded) | ✅ Public read (auth) |
| `public.user_badges` | Badges earned per user | ✅ User owns own rows |
| `public.referral_events` | Referral tracking | ✅ Referrer sees own |
| `public.quiz_wrong_answers` | Wrong quiz answers for F2 | ✅ User owns own rows |
| `public.ai_generated_questions` | F2 adaptive quiz output | ✅ User owns own rows |
| `public.flashcards` | Flashcard definitions | ✅ Public read (auth) |
| `public.user_flashcard_progress` | Spaced repetition state | ✅ User owns own rows |
| `public.lesson_comments` | Lesson comments (threaded) | ✅ Public read (auth) |
| `public.push_subscriptions` | Browser push endpoints | ✅ User owns own rows |
| `public.ai_coach_sessions` | AI coach summaries | ✅ User owns own rows |
| `public.inline_questions` | Inline lesson questions (interactive layer) | ✅ Public read (auth) |
| `public.inline_attempts` | Per-user inline-question attempts (FK → inline_questions) | ✅ User owns own rows |
| `public.wow_notes` | Contextual "Wow Note" cards (media: none/svg/component) | ✅ Public read (auth) |
| `public.lesson_scores` | Per-user lesson score (correct-question counts) | ✅ User owns own rows |
| `public.minigame_sessions` | Mini-game results | ✅ User owns own rows |

The retired `lesson_gate_questions` / `lesson_gate_attempts` tables and the `lessons.content_simple_md` column were dropped in migration `20260627120000_drop_retired_gate_and_dead_columns`.

Trigger: `on_auth_user_created` → auto-inserts into `public.users` on every new signup.

---

## Key Patterns

### Supabase in Server Components
```typescript
import { createSupabaseServerClient } from "@/lib/supabase/server";
const supabase = createSupabaseServerClient();
const { data: { user } } = await supabase.auth.getUser();
```

### Supabase in Client Components
```typescript
import { createBrowserClient } from "@/lib/supabase/client";
const supabase = createBrowserClient();
```

### Zod validation in API routes
```typescript
const schema = z.object({ text: z.string().min(1) });
const parsed = schema.safeParse(await req.json());
if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
```

### AI streaming (Vercel AI SDK)
```typescript
import { aiModel } from "@/lib/ai/model"; // anthropic(AI_MODEL) — model id lives only there
import { streamText } from "ai";
const result = await streamText({ model: aiModel, ... });
return result.toDataStreamResponse();
```

### useChat hook (client)
```typescript
import { useChat } from "@ai-sdk/react";
const { messages, input, handleSubmit } = useChat({ api: "/api/ai/chat" });
```

---

## Second Project Note

The user also works on **edunext-production** (`c:\WORK_SPACE\edunext-production`). That is a completely separate project. Never apply DevPath RO conventions, DB migrations, or code changes to that project unless explicitly asked.

---

## Context7 MCP — Auto-Documentation

Context7 MCP is configured in this project's `.claude/settings.json`. When you need up-to-date documentation for any library used in this project (Next.js, Supabase, Vercel AI SDK, Framer Motion, Radix UI, Zod, etc.), use Context7 tools automatically without waiting to be asked. This is especially important for:
- Vercel AI SDK (`ai`, `@ai-sdk/anthropic`, `@ai-sdk/react`) — API changes frequently
- Supabase JS v2 (`@supabase/supabase-js`, `@supabase/ssr`) — SSR patterns
- Next.js 14 App Router — use Context7 instead of relying on training data

---

## Language

Platform is Romanian-only. next-intl has been removed entirely — there is no `src/i18n/` directory and no `messages/` directory. Do not add any i18n library.
All user-facing text is hardcoded in Romanian directly in component files. Lesson content and AI responses are in Romanian.

---

## Cosmo Mascot

DevPath RO's mascot is **Cosmo**, a procedural SVG golden retriever with 8 emotions, idle animations (breathing, blink, ear-twitch, head-drift), optional mouse-gaze tracking, and per-emotion canvas particle overlays. Replaced the legacy "Pixel" mascot in Block 1.5 (2026-05-06).

- **Component**: `src/components/mascot/cosmo-mascot.tsx`
- **Export**: `CosmoMascot` (named export)
- **8 emotions**: `happy`, `excited`, `thinking`, `encouraging`, `celebrating`, `sleeping`, `waving`, `sad`

### Props

```ts
interface CosmoMascotProps {
  emotion?: CosmoEmotion;        // default "happy"
  size?: number;                 // default 200 (CSS px width — height auto-scales 1.15x)
  className?: string;
  enableIdleAnimations?: boolean; // default true (breath/blink/ear-twitch/drift)
  enableInteraction?: boolean;    // default false (mouse-gaze + cursor-close tail-wag)
}
```

### When to use which emotion

| Context | Emotion |
|---|---|
| Lesson content / reading mode | `encouraging` |
| AI Coach streaming response | `thinking` |
| Lesson-gate wrong answer | `encouraging` (matches "Nu-i bai!" copy) |
| Returning after 3-6 day absence | `sleeping` |
| Returning after 7+ day absence | `sad` |
| Onboarding welcome | `waving` (with `enableInteraction`) |
| Landing hero | `waving` (with `enableInteraction`) |
| Pricing card / generic happy state | `happy` |
| Mini-game intro | `excited` |
| Mini-game perfect / passed | `celebrating` |
| Mini-game failed | `encouraging` |
| Level-up toast | `celebrating` |
| Streak toast | `excited` |
| Stripe checkout success | `celebrating` |
| Stripe checkout cancel | `encouraging` ("hai să mai vorbim") |
| Generic celebration overlay | `celebrating` (level up) / `excited` (XP gain) |

### Where Cosmo is currently deployed (15 sites)

- Landing page (hero + CTA)
- Pricing page (cards + success/cancel pages)
- Onboarding welcome step
- Dashboard absence banner
- AI Coach chat (loading state)
- Lesson gate (wrong-answer banner)
- Mini-game modal + result screen
- Level-up toast + streak toast
- Mascot celebration overlay (any place that imports it — e.g., post-lesson XP gain)

### Notes

- The `withSparks` prop from the legacy Pixel mascot **does NOT exist on Cosmo**. Particle effects (sparks/rainbow/zzz) are emitted automatically by `excited`, `celebrating`, and `sleeping` emotions via the canvas particle overlay built into the component.
- The retired Pixel emotions `proud` and `idle` map to `celebrating` and `happy` respectively.
- Default `size` differs (Pixel was 80, Cosmo is 200) — every existing call site passes an explicit `size`, so the default rarely matters.
- Cosmo's idle animations are JS-driven (rAF loop inside the component); there are NO `pixel-mascot-breathe` / `pixel-mascot-blink` CSS classes anymore — they were deleted from `globals.css` in Block 1.5.
- For full integration spec (per-site emotion mapping, prop diff vs Pixel, risk register), see `devpath-docs/cosmo-integration-spec.md`.

---

## Lesson Content Mode

Single-mode lessons only. The Mod Simplu / Mod Tehnic dual-mode system was retired in Block 1 (Prompt 1.4); 51 simple-mode files were archived to `content/_archive/simple-mode/`.

- Render lesson content from the `content_md` column only.
- The `content_simple_md` column was **dropped** from the schema (migration `20260627120000`); dual-mode no longer exists.
- The `users.learning_mode` column is **not used**; do not branch on it.
- Block 3 (curriculum content writing) produces ONE technical version per lesson. Archived simple-mode prose may be mined as analogies/sidebars where useful.

---

## Security Reference Implementation

`/api/ai/chat/route.ts` is the reference for all new API routes.
Pattern: auth check first → Zod validation → business logic.
Never skip either step. Edge runtime supports `createSupabaseServerClient()` via `next/headers` cookies().

---

## Development Priorities

Features F1–F5 are all shipped. The current priority is authoring lesson content for Courses 3–12 (only C1/C2 are authored — see `PROJECT-STATE.md`).

---

## Implementation Navigation
- Start every session by reading `PROJECT-STATE.md` (current ML/PyTorch state + methodology).
- Curriculum source of truth: `devpath-docs/CURRICULUM-STRUCTURE.md` (parsed by `scripts/seed-curriculum.mjs`).
- Pre-v5 planning docs are archived under `devpath-docs/archive/` — historical only, not the source of truth.

---

## Directories — Never Read Unless Explicitly Asked
- `node_modules/` — never read, always ignore
- `.next/` — build output, never relevant
- `.git/` — never read git internals
- `content/` — MDX files, only when working on lesson content specifically
- `seed.sql` — only when asked about seed data
- `schema.sql` — use Supabase MCP for schema instead

---

## MDX Custom Components Pattern

Custom MDX components are intercepted in `src/components/course/lesson-content.tsx` via the `components` prop of `react-markdown`. The pattern:

1. A code block with a special language tag in the MDX (e.g., ` ```python-editor `) is detected by `className?.includes("language-python-editor")`.
2. The matched block renders a custom component instead of `<code>`.
3. The `children` string is the code block content (parsed as JSON config or raw code).

To create a new custom MDX component (needed for F3 Neural Network Visualizer):
- Add a new `if (className?.includes("language-neural-network-viz"))` branch in `lesson-content.tsx`
- Parse `String(children)` as JSON config
- Return `<NeuralNetworkVisualiser {...config} />`

MDX lesson frontmatter fields: `title`, `description`, `order`, `type` (`theory|quiz|exercise|project`), `moduleId`. Files in `content/` map to `public.lessons` via `sync-action.ts`.

---

## Framer Motion — Existing Animations

### lesson-presence.tsx — Celebration Toast
```
initial={{ opacity: 0, y: 50, scale: 0.85 }}
animate={{ opacity: 1, y: 0, scale: 1 }}
exit={{ opacity: 0, y: 20, scale: 0.9 }}
transition={{ type: "spring", stiffness: 280, damping: 22 }}
// Emoji waggle: animate={{ rotate: [0, -12, 12, -8, 8, 0] }}, duration: 0.5
```

### page-transition.tsx — Page Transitions
Read that file before adding any new page-level animations.

**RULE:** Never duplicate these configs. Import/reuse existing components.

---

## Pyodide Loading Strategy (Feature F1)

Loads from CDN at runtime — **NEVER bundled in build:**
`https://cdn.jsdelivr.net/pyodide/v0.27.0/full/`

Pyodide runs **inside a Web Worker** (`src/workers/pyodide.worker.ts`, loaded via `new Worker(new URL(...))`, classic `importScripts` — v0.27.0 only; newer Pyodide needs a module worker). Python is Pyodide-only: no Piston, no server execution route.
- Always use `next/dynamic` with `ssr: false` for the CodeEditor (Monaco + Pyodide).
- Never `import pyodide` anywhere; never run Pyodide on the main thread.
- `use-pyodide.ts` creates the worker lazily on the first "Run" click and shares one worker across editors (runs are queued).
- Each run has a 10 s timeout (`PYTHON_RUN_TIMEOUT_MS`); on timeout or Stop the worker is `terminate()`d and a fresh one is warmed up. An AbortSignal alone cannot stop an infinite loop — terminating the worker is what does.

---

## Vercel AI SDK Version — CRITICAL

This project uses **`ai@3.4.33` (v3)**. Use Context7 to fetch docs for THIS version specifically. The API changed significantly v3 → v4 → v5 → v6.

**Correct v3 patterns:**
```typescript
streamText() → result.toDataStreamResponse()
useChat() from "@ai-sdk/react"   // ai-coach-chat.tsx uses "ai/react" (v3 path — keep as-is)
generateObject() with Zod schema
```
**Do NOT use:** `ToolLoopAgent`, `Agent` abstraction, `DevTools` middleware — v5/v6 only.

---

## shadcn/ui — Check Before Adding

Always run `npx shadcn@latest info` before adding any component.
Never add shadcn components manually — always use `npx shadcn@latest add <component>`.

---

## Context Management

- `/compact` → continue same feature (preserves context)
- `/clear` → only when switching to a completely different feature
- Never start a new session mid-feature without `/compact` first

---

## Compaction Instructions

**Always preserve:** which feature is in progress, last 3 files modified and why, any SQL migrations not yet approved, current error being debugged (exact message), architecture decisions made this session.

**Always discard:** installation logs, general library explanations, file listings of unmodified files.

---

## Effort Levels — Token Optimization

- `/effort low` → typos, CSS tweaks, renames
- *(default)* → normal feature work
- `/effort high` → architecture decisions, new feature design, complex DB schema

---

## Deploy MVP (in progress — started 2026-09-30)

Goal: deploy-ready MVP on Vercel, working + tested; visual/text polish is the LAST step and is decided by the owner.

- **Source of truth:** `PROGRESS.md` (8-phase checklist, issues ranked by severity, owner decisions D1–D6). Read it at the start of every session and update it after every prompt.
- **Supabase project (live):** ref **`zgofeajewktwmswckgup`** (`devpath-ro`, eu-central-1). `.env.local` points to it.
- **Old project — DO NOT TOUCH:** `umtecpbixdkumfjsvzcl`. The project-bound `mcp__supabase__*` server is bound to the OLD project. For live-DB work use ONLY `mcp__claude_ai_Supabase__*` and always pass `project_id="zgofeajewktwmswckgup"`; confirm the URL first and STOP if it resolves to the old ref.
- **Live DB ≠ repo:** the live DB has only 2 migrations (`base_schema`, `interactive_layer_and_migrations`) and 2 public functions. `schema.sql`, older repo migrations and PROJECT-STATE.md claims (RPCs, `xp_events`, `module_index`, badges seed) do not reflect it. Never re-run repo migrations blindly; new SQL goes into `supabase/migrations/` and must be shown to the owner before applying.
- **Baseline (2026-09-30):** `tsc` 0 errors; `npm run build` fails on 1 lint error (`lesson-content.tsx:58`); XP/level/badges/leaderboard broken (missing `xp_events` + RPCs); `users` UPDATE policy allows role/plan escalation.
- **Security rules that must stay true (Phase 3, 2026-09-30):** `users` is own-row SELECT only and clients may UPDATE only safe profile columns; XP, badges, streak/`last_active`, referrals and `stripe_*` are written ONLY with the service-role client from server code. `src/lib/gamification.ts` is deliberately NOT a `"use server"` file (its exports would become browser-callable) — never add the directive or import it from a client component. `award_xp_and_check_level` is EXECUTE-able by `service_role` only. Read other users' public data through the `get_public_profiles` / `get_top_users` / `get_community_stats` / `get_recent_completions` RPCs, never by querying `users` directly.
