# CLAUDE.md — DevPath RO

> AI assistant configuration for Claude Code. Read this file at the start of every session.

---

## Project Overview

**DevPath RO** is a Romanian e-learning platform for IT/AI students. Desktop-first Next.js 14 App Router web application deployed on Vercel. Delivers 30+ MDX lesson files across structured modules with theory, quiz, exercise, and project lesson types.

- **Live stack:** Next.js 14 App Router + React 18 + TypeScript (strict mode)
- **Auth & DB:** Supabase (PostgreSQL + Auth + Realtime WebSockets)
- **AI:** Vercel AI SDK + OpenAI API (GPT-4o-mini text, TTS-1 voice "nova")
- **UI:** Tailwind CSS + Radix UI + shadcn/ui + Framer Motion
- **Code editor:** Monaco Editor (`@monaco-editor/react`)
- **i18n:** next-intl (Romanian primary / English toggle)
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
| `@ai-sdk/openai` | ^0.0.66 |
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

### i18n
| Package | Version |
|---|---|
| `next-intl` | ^4.8.3 |

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
- Use `process.env.OPENAI_API_KEY` for OpenAI — never hardcode keys.
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

### i18n
- `next-intl` is configured for Romanian (`ro`) and English (`en`).
- Lesson content and AI responses are in Romanian.
- i18n config entry: `src/i18n/request.ts`.

---

## 5 High-Tech Features — Current Status

| # | Feature | Status | Notes |
|---|---|---|---|
| F5 | Real-time Social Presence | ✅ DONE | Supabase Realtime pub/sub, avatar stacks, Framer Motion celebration toasts |
| F4 | Voice AI Coach | ✅ DONE | Web Speech API (push-to-talk STT) + custom OpenAI TTS endpoint (voice "nova") with AbortController race-condition fix |
| F2 | Adaptive AI Quiz Generation | 🚀 NEXT | Database tables created in Phase 0. API route and UI components: Phase 4 |
| F1 | In-Browser Python Execution | 📋 PLANNED | Pyodide WASM + Piston API fallback, requires `pyodide` npm package (approved) |
| F3 | Neural Network Visualizer | 📋 PLANNED | Pure SVG + Framer Motion, zero new packages, custom MDX component |

### Feature 2 (NEXT) — Exact Plan
New tables needed (ask before running SQL):
```sql
CREATE TABLE public.quiz_wrong_answers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  question_id uuid references public.quiz_questions(id) on delete cascade not null,
  selected_option integer not null,
  correct_option integer not null,
  attempt_at timestamptz not null default now()
);

CREATE TABLE public.ai_generated_questions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  source_question_ids uuid[] not null,
  question text not null,
  options jsonb not null,
  correct_answer integer not null,
  explanation text not null,
  generated_at timestamptz not null default now()
);
```
New files: `src/app/api/ai/generate-quiz/route.ts`, `src/components/course/adaptive-quiz-section.tsx`
Modified files: `quiz-block.tsx`, `courses/actions.ts`, `[lessonId]/page.tsx`

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
│   │   │       ├── chat/route.ts   # Edge: GPT-4o-mini streaming (Vercel AI SDK)
│   │   │       └── tts/route.ts    # Edge: OpenAI TTS-1 nova → audio/mpeg proxy
│   │   ├── auth/callback/route.ts  # Supabase OAuth callback
│   │   ├── globals.css
│   │   ├── layout.tsx              # Root layout (next-intl, themes)
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
│   │   ├── use-speech-recognition.ts  # Web Speech API STT (push-to-talk)
│   │   └── use-speech-synthesis.ts   # OpenAI TTS-1 nova (with AbortController)
│   ├── i18n/request.ts             # next-intl server config
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
├── content/                  # MDX lesson files (AI Fundamentals course)
├── messages/                 # next-intl translation files (ro.json, en.json)
├── schema.sql               # Full Supabase schema (reference only)
├── seed.sql                 # Seed data for development
├── next.config.mjs          # next-intl plugin wrapper
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
- `src/app/api/ai/chat/route.ts` — GPT-4o-mini streaming, `runtime = "edge"`
- `src/app/api/ai/tts/route.ts` — OpenAI TTS-1 proxy, returns `audio/mpeg`

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
| `public.lesson_gate_questions` | Gate completion questions per lesson | ✅ Public read (auth) |
| `public.lesson_gate_attempts` | User gate question attempts | ✅ User owns own rows |
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
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
const result = await streamText({ model: openai("gpt-4o-mini"), ... });
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

Context7 MCP is configured in this project's `.claude/settings.json`. When you need up-to-date documentation for any library used in this project (Next.js, Supabase, Vercel AI SDK, Framer Motion, Radix UI, next-intl, Zod, etc.), use Context7 tools automatically without waiting to be asked. This is especially important for:
- Vercel AI SDK (`ai`, `@ai-sdk/openai`, `@ai-sdk/react`) — API changes frequently
- Supabase JS v2 (`@supabase/supabase-js`, `@supabase/ssr`) — SSR patterns
- next-intl v4 — server/client boundary rules changed in v4
- Next.js 14 App Router — use Context7 instead of relying on training data

---

## Language

Platform is Romanian-only. next-intl has been removed entirely. Do not add any i18n library.
All user-facing text is hardcoded in Romanian directly in component files.
Messages are stored in `messages/ro.json` for reference only — not imported at runtime.

---

## Dual Content Modes

Lessons have two content columns:
- `content_md` = Mod Tehnic (existing, technical with code)
- `content_simple_md` = Mod Simplu (new, no code, analogies only)

Always check `users.learning_mode` to determine which column to render.
If `content_simple_md` is null, fall back to `content_md` with a notice.

---

## Security Reference Implementation

`/api/ai/chat/route.ts` is the reference for all new API routes.
Pattern: auth check first → Zod validation → business logic.
Never skip either step. Edge runtime supports `createSupabaseServerClient()` via `next/headers` cookies().

---

## Development Priorities

1. **Immediate:** Feature 2 — Adaptive AI Quiz Generation
   - Run DB migrations (show SQL first, wait for approval)
   - Build `/api/ai/generate-quiz` route with `generateObject()` + Zod
   - Build `<AdaptiveQuizSection>` client component
   - Extend `quiz-block.tsx` to record wrong answers

2. **Next:** Feature 1 — In-Browser Python Execution (requires `pyodide` package)

3. **After:** Feature 3 — Neural Network Visualizer (zero new packages)

---

## Implementation Navigation
- Start every session by reading: devpath-docs/IMPLEMENTATION-INDEX.md
- Then read: devpath-docs/phase-refs/PHASE0-REF.md for current phase
- Then read ONLY the relevant section of devpath-docs/devpath-plan-phase0.md
- After completing each task group: mark done in devpath-docs/devpath-progress.md
- Never read entire plan files — use phase-refs as entry point

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

The `pyodide` npm package (approved) provides TypeScript types only.
- Always use `next/dynamic` with `ssr: false` for Pyodide components.
- Never `import pyodide` at the top level of any file.
- Load lazily inside `use-pyodide.ts` hook on first "Run" click, then cache singleton.

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
