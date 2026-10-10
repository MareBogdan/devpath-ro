# CLAUDE.md — DevPath RO

> AI assistant configuration for Claude Code. Read this file at the start of every session.

---

## Project Documentation
- `devpath-docs/MASTER-PLAN.md` — **Current source of truth for what to work on** (post-launch: bring courses 1–6 to launch quality; decisions D1–D7; Phase 0 checklist; JURNAL). Read first in any new session.
- `devpath-docs/LESSON-STANDARD.md` — **What a finished lesson is** (headings, the 15–20% cut, `<Term>`, the 3 questions + D3 grid rules, Python editor, the "fix and report factual errors" rule). Apply it with `node scripts/validate-questions.mjs <lesson.mdx> --stats --baseline HEAD` as the gate; pilot = `hardware-fizica` L7. Read before any lesson-content work.
- `devpath-docs/CURRICULUM-STRUCTURE.md` — The curriculum: 13 courses / 245 lessons, every lab/boss slot, which lessons exist vs are planned.
- `PROJECT-STATE.md` — Project state: features, tech stack, app structure, DB overview, methodology (single content mode, `content_md`).
- `devpath-docs/devpath-vision.md` — Original platform vision document. The mascot section references "Pixel" — that mascot was retired in Block 1.5 (2026-05-06) and replaced by Cosmo. See "Cosmo Mascot" section below for the current API.
- `schema.sql` — DB schema reference. For live state, verify via Supabase MCP.

## Design System
- `DESIGN-SYSTEM.md` — Complete Aurora palette reference. Read before any UI/styling task.
- Dark mode is the default. All new components must look good on dark first.
- Primary: violet (#6C5CE7). Accent: teal (#00CEC9). Gold: gamification. Red: streak/alerts.

---

## Project Overview

**DevPath RO** is a Romanian e-learning platform for IT/AI students. Desktop-first Next.js 14 App Router web application deployed on Vercel. Delivers a 13-course / 245-lesson curriculum (single content mode, `content_md`) with `lesson`, `lab`, and `boss` lesson types. Courses 1–6 are published (136 lessons written incl. the 5 Course 1 labs/bosses, 14 lab/boss slots planned in C2–C6); courses 7–13 (`pytorch-core` … `pytorch-productie`) are unpublished skeletons shown as "În curând".

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
│   │   ├── (auth)/               # Login, register, OAuth
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── actions.ts        # Server actions: signIn, signUp, signOut
│   │   │   └── oauth-buttons.tsx
│   │   ├── (dashboard)/          # Protected app shell (auth guard in layout)
│   │   │   ├── layout.tsx        # RSC: auth check, user data, Navbar
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
│   │   │   ├── courses-hero.tsx    # Client: /courses hero (roadmap badges, stats)
│   │   │   └── course-map.tsx      # Client: unified 13-course serpentine (data: lib/course-map.ts)
│   │   ├── mdx/
│   │   │   ├── mdx-components.tsx  # Client: the MDX component registry (see "MDX Custom Components")
│   │   │   ├── game-frame.tsx      # Client: GameFrame — the ONE wrapper for every interactive game (full-bleed + fullscreen)
│   │   │   ├── use-fullscreen.ts   # Client: shared fullscreen hook (native API, Popover top-layer fallback, landscape lock)
│   │   │   └── games/              # Mini-games + boss fights, registered (framed) in mdx-components.tsx
│   │   ├── layout/
│   │   │   ├── navbar.tsx          # Client: top navigation
│   │   │   ├── bottom-nav.tsx      # Client: mobile bottom navigation
│   │   │   ├── page-transition.tsx # Client: Framer Motion transitions
│   │   │   └── client-providers.tsx
│   │   └── ui/                     # shadcn/ui + custom UI (serpentine-path.tsx = the course map)
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
│   │   └── utils.ts         # cn() helper
│   ├── middleware.ts         # Supabase session refresh on every request
│   └── types/index.ts       # Domain types: User, Course, Lesson, etc.
├── content/courses/<slug>/   # MDX lesson files — 136 authored, all in courses 1–6
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

Context7 MCP is configured for this project (in Claude Code's user config, `~/.claude.json`). When you need up-to-date documentation for any library used in this project (Next.js, Supabase, Vercel AI SDK, Framer Motion, Radix UI, Zod, etc.), use Context7 tools automatically without waiting to be asked. This is especially important for:
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
| Inline question wrong answer | `encouraging` (matches "Nu-i bai!" copy) |
| Returning after 3-6 day absence | `sleeping` |
| Returning after 7+ day absence | `sad` |
| Onboarding welcome | `waving` (with `enableInteraction`) |
| Landing hero | `waving` (with `enableInteraction`) |
| Pricing card / generic happy state | `happy` |
| Mini-game intro | `excited` |
| Mini-game perfect / passed | `celebrating` |
| Mini-game failed | `encouraging` |
| Streak toast | `excited` |
| Stripe checkout success | `celebrating` |
| Stripe checkout cancel | `encouraging` ("hai să mai vorbim") |
| Generic celebration overlay | `celebrating` (level up) / `excited` (XP gain) |

### Where Cosmo is currently deployed

- Landing page (hero + CTA)
- Pricing page (cards + success/cancel pages)
- Onboarding welcome step
- Dashboard hero + absence banner
- AI Coach chat (loading state) and the lesson page client
- Inline questions (wrong-answer feedback) and the MDX `<CosmoHint>` tag
- Mini-game modal + result screen
- Streak toast
- Mascot celebration overlay (any place that imports it — e.g., post-lesson XP gain and the level-up moment)
- Interview loading state

(The old lesson gate and the standalone level-up toast were retired — the level-up moment is the celebration overlay's "LEVEL UP!" card.)

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

Features F1–F5 are all shipped and the MVP is deployed. The current priority is **bringing courses 1–6 to launch quality** — Phase 0 foundation (P1 structure ✅, P2 cleanup, P3 Course 1's five lab/boss, P4 pilot lesson), then the Bogdan-led page-by-page pass. **Do not work on courses 7–13 until 1–6 are done.** The plan, decisions D1–D7 and the backlog live in `devpath-docs/MASTER-PLAN.md` (the current source of truth); follow its working rules (one objective per prompt; gate = `tsc` 0 · `lint` 0 · `build` with lint ON in an isolated copy).

---

## Implementation Navigation
- Start every session by reading `devpath-docs/MASTER-PLAN.md` (what to do next), then `PROJECT-STATE.md` for project state + methodology.
- Curriculum source of truth: `devpath-docs/CURRICULUM-STRUCTURE.md` (13 courses / 245 lessons; parsed by `scripts/seed-curriculum.mjs` — keep the `| # | Titlu | Type |` columns and `total_lessons`).
- `PROGRESS.md` is the history log (newest entries at the bottom; older history is in `devpath-docs/archive/`): append to it after every prompt.
- Pre-v5 planning docs and finished plans (e.g. `DEPLOY-PLAN.md`) are archived under `devpath-docs/archive/` — historical only, not the source of truth.

---

## Directories — Never Read Unless Explicitly Asked
- `node_modules/` — never read, always ignore
- `.next/` — build output, never relevant
- `.git/` — never read git internals
- `content/` — MDX files, only when working on lesson content specifically
- `seed.sql` — only when asked about seed data
- `schema.sql` — use Supabase MCP for schema instead
- `graphify-out/` — generated knowledge-graph output (gitignored)
- `devpath-public/` — a separate, gitignored nested repo; not part of this project
- `devpath-docs/archive/` — archived history (`CHANGELOG-2026-04_to_05.md` 214 KB, `PROGRESS-deploy-mvp-2026-09-30_to_10-03.md` 105 KB): grep it, never read it whole

---

## MDX Custom Components Pattern

Lessons are compiled on the server with `next-mdx-remote/serialize` and rendered by `<MDXRemote components={...} />` in `src/components/course/lesson-content.tsx`. **Every custom MDX component is registered in one place: `src/components/mdx/mdx-components.tsx`** (`getMdxComponents`). Two kinds:

1. **JSX tags** — `FactBox`, `CosmoHint`, `LabBox`, `InlineQuestion` (`<InlineQuestion n="1" />`, string form only), `WowNote`, `Term` (`<Term def="…">word</Term>` — click-to-open definition, `components/interactive/term.tsx`; def in the MDX, never in `glossar_terms`), `Sub` (`V<Sub>GS</Sub>` — a real subscript, `components/mdx/sub.tsx`; explicit tag, never an automatic `X_Y` transform), the games/boss fights (`BinaryTranslator`, `TransistorLab`, `RAMGridGame`, `BossFightAlarmaSef`, `BossFightAsambleazaCPU`), plus the `ADCSimulator` stub. To add one: import it in `mdx-components.tsx` and add it to the returned map. **Interactive games/labs/bosses must be registered through `withGameFrame(Game)`** (`components/mdx/game-frame.tsx`), never bare: the frame lets the game break out of the 680px prose column (up to 1200px; prose stays 680px), and provides the shared fullscreen mode (native Fullscreen API, falling back to a Popover top-layer overlay on iPhone Safari, plus a landscape lock on phones). A game that draws its own fullscreen button (BinaryTranslator) uses `withGameFrame(Game, "game")` and reads the state via `useGameFrame()`. Games must keep text ≥ 9px (they are phone-playable in landscape fullscreen). **Completion contract** (`components/mdx/game-contract.ts`): a game that a student can finish accepts one optional prop `onComplete?: () => void` and calls it exactly once per mount, from the transition into its own genuine success state (ref-guarded; a loss/retry/round change is not completion). `withGameFrame` injects the lesson page’s handler via `GameCompletionContext`, so MDX stays a bare `<TransistorLab />`. On `lab`/`boss` lessons the Complete button stays disabled until it fires (`LessonPageClient` → `CompleteButton isGameComplete`); the AI quiz is not rendered on them; XP is flat per type (lesson 15 · lab 25 · boss 50, `lessonCompleteXP` in `lib/gamification-constants.ts`, read from the DB row, awarded server-side as `lesson_complete`). Lab/boss lessons also map to the course map via `lib/course-map.ts`: a lab keeps its `Code2` icon and a boss is always a large checkpoint node with a `Trophy` (the last lesson of a course gets no trophy). A module closes with exactly one large node: `resolveCheckpoints` ranks boss > the course’s last lesson > every-5th, and a weaker candidate next to a kept stronger one is an ordinary node; ordinary nodes after a course’s last checkpoint hang from that checkpoint’s module ("tail" nodes in `serpentine-path.tsx`) instead of opening a one-node module.
2. **Fenced code blocks with a special language tag** — ` ```python-editor ` (→ `CodeEditor`, Monaco + Pyodide, loaded with `next/dynamic` `ssr:false`) and ` ```neural-network-viz ` (→ `NeuralNetworkVisualiser`, JSON config in the block). They are intercepted by the `pre`/`code` overrides in the same file via `className?.includes("language-…")`.

MDX lesson frontmatter (as in `content/courses/*/*.mdx`): `title`, `order`, `type` (`lesson|lab|boss`), `module_index`, `duration`, `difficulty`. Files in `content/courses/<course-slug>/` map to `public.lessons` via `sync-action.ts` / `scripts/sync-content.mjs` (`node scripts/sync-content.mjs [slug|--all] [--dry-run]` — diffs before writing, sets `is_published` + `module_index`, no-op when the DB already matches; **always `--dry-run` first**; frontmatter `module_index` of C2–C6 is stale vs the DB, see MASTER-PLAN backlog). Only `lesson|lab|boss` are used by the curriculum; the DB CHECK also still accepts legacy `theory|quiz|exercise|project`.

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

## Deployment & live database (MVP deployed — rules that stay true)

The MVP is live on Vercel (https://devpath-ro.vercel.app). The deploy checklist and its history are in `PROGRESS.md`; the plan from here is `devpath-docs/MASTER-PLAN.md`. Visual/text polish decisions belong to the owner.

- **Supabase project (live):** ref **`zgofeajewktwmswckgup`** (`devpath-ro`, eu-central-1). `.env.local` points to it.
- **Old project — DO NOT TOUCH:** `umtecpbixdkumfjsvzcl`. **The project-bound `mcp__supabase__*` server IS bound to the OLD project** — verified 2026-10-09: Claude Code's user config (`~/.claude.json`, entry for this folder) defines it as `https://mcp.supabase.com/mcp?project_ref=umtecpbixdkumfjsvzcl`. (Its calls currently fail with "You do not have permission", so it cannot even answer which ref it serves — never retry it. The `mcpServers.supabase` block in the gitignored `.claude/settings.json`, which names the new ref, is NOT what is in effect: MCP servers are read from `~/.claude.json`/`.mcp.json`, not from `settings.json`.) For live-DB work use ONLY `mcp__claude_ai_Supabase__*` and always pass `project_id="zgofeajewktwmswckgup"`; confirm the URL first and STOP if it resolves to the old ref.
- **Live DB ≠ `schema.sql`:** `schema.sql` and the repo migrations dated before 2026-09-30 do not reflect the live DB (it was built from `base_schema` + `interactive_layer_and_migrations`). The migrations from `20260930*` onward in `supabase/migrations/` are the ones applied live (gamification core, RLS hardening, the `pytorch-core` insert, …). Never re-run older repo migrations blindly; new SQL goes into `supabase/migrations/` and must be shown to the owner before applying.
- **Security rules that must stay true (Phase 3, 2026-09-30):** `users` is own-row SELECT only and clients may UPDATE only safe profile columns; XP, badges, streak/`last_active`, referrals and `stripe_*` are written ONLY with the service-role client from server code. `src/lib/gamification.ts` is deliberately NOT a `"use server"` file (its exports would become browser-callable) — never add the directive or import it from a client component. `award_xp_and_check_level` is EXECUTE-able by `service_role` only. Read other users' public data through the `get_public_profiles` / `get_top_users` / `get_community_stats` / `get_recent_completions` RPCs, never by querying `users` directly.
