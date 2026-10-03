---
name: devpath-ro-patterns
description: >-
  DevPath RO specific patterns. Use when creating new
  features, components, or API routes. Covers: Supabase
  Realtime presence, the AI Coach / AI quiz data flow
  (Anthropic Claude via the Vercel AI SDK v3, browser STT only,
  no TTS), the lesson page structure, in-browser Python
  (Pyodide in a Web Worker), MDX conventions, the Romanian-only
  (no i18n) rule, and the feature architecture decisions.
allowed-tools: Read
---

# DevPath RO — Project Patterns Reference

> Source of truth for project state: `PROJECT-STATE.md`, `CLAUDE.md`, `PROGRESS.md`. This file only records patterns that are easy to get wrong.

## 1. SUPABASE REALTIME PATTERN

**File:** `src/components/course/lesson-presence.tsx`

### Channel naming
```typescript
supabase.channel(`lesson-presence:${lessonId}`, {
  config: { presence: { key: userId } },
})
```
Channel name format: `lesson-presence:<uuid>`. The `key` option deduplicates presence by `userId` — same user in two tabs shows as one entry.

### Presence track payload shape
```typescript
interface PresenceUser {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  online_at: string; // ISO timestamp
}
await channel.track({ user_id, display_name, avatar_url, online_at: new Date().toISOString() })
```

### Broadcast for completion celebrations
```typescript
// CompleteButton fires a DOM event → LessonPresence listens and broadcasts:
window.dispatchEvent(new CustomEvent("lesson-presence:complete", { detail: { lessonId } }));

channelRef.current.send({
  type: "broadcast",
  event: "lesson_complete",
  payload: { display_name: string, lesson_title: string }
})
// Receivers ignore their own broadcasts: if (ev.display_name !== displayName) setCelebration(ev)
```

### Cleanup on unmount — React 18 Strict Mode fix
```typescript
// Defer subscribe() by 200 ms so Strict Mode's fake unmount never opens a WebSocket
// that immediately closes (confusing console error).
let subscribed = false;
const timeoutId = window.setTimeout(() => { subscribed = true; channel.subscribe(...); }, 200);
return () => {
  clearTimeout(timeoutId);
  if (subscribed) supabase.removeChannel(channel); // only if actually subscribed
};
```

---

## 2. AI (TEXT ONLY — Anthropic Claude, Vercel AI SDK v3)

**Files:** `src/lib/ai/model.ts`, `src/lib/optional-features.ts`, `src/app/api/ai/{chat,coach-session,coach-sessions,generate-quiz}/route.ts`, `src/components/course/ai-coach-chat.tsx`, `src/components/course/adaptive-quiz-section.tsx`, `src/hooks/use-speech-recognition.ts`

### The model lives in ONE place
```typescript
// src/lib/ai/model.ts
export const AI_MODEL = "claude-haiku-4-5";      // alias, no date suffix
export const aiModel = anthropic(AI_MODEL);       // @ai-sdk/anthropic reads ANTHROPIC_API_KEY lazily
export const isAIConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY);
```
Routes import `aiModel` / `isAIConfigured`; never hardcode a model id or a key elsewhere. Missing key → `disabledResponse("ai", "AI indisponibil momentan.")` (503 `{ ok:false, disabled:true, feature:"ai" }`) **before** calling the model.

### Route order (reference: `api/ai/chat/route.ts`)
auth (`supabase.auth.getUser()` → 401) → `isAIConfigured()` (503) → Zod `safeParse` (400) → business logic → `streamText` / `generateObject` in try/catch (502 on provider failure). `export const runtime = "edge"`.

### AI Coach chat
- `useChat({ api: "/api/ai/chat", body: {...} })` — import from **`"ai/react"`** (v3 path, keep as-is).
- Body schema: `{ messages[{role,content}], lessonId?, lessonTitle?, lessonContent?, sessionContext? }`; lesson content is cut to 4000 chars server-side; `streamText({ model: aiModel, system, messages, maxTokens: 512 })` → `result.toDataStreamResponse()`.
- Coach session summaries: `api/ai/coach-session(s)` → `ai_coach_sessions` (RLS: own rows).

### Voice = INPUT ONLY (browser Web Speech API)
```
click mic (toggle)  → recognition.startListening()   // SpeechRecognition, lang "ro-RO", continuous:false, interimResults:true
interim transcript  → shown live in the input field
utterance ends / click again → isListening true→false → transcript appended as a user message
```
There is **no text-to-speech and no sound** (removed on owner request), no `/api/ai/tts`, no `/api/ai/stt`, no `use-speech-synthesis`, no extra API key. Do not re-add them.

### Adaptive AI quiz (F2) — opt-in
`AdaptiveQuizSection` is mounted by `LessonPageClient` on every **published** lesson (before the completion row), `autoStart` is false: it shows an intro + "Testează-te cu un quiz" and only calls `POST /api/ai/generate-quiz { lessonId, forceRegenerate }` on click. The route loads the published lesson (404 otherwise), asks Claude (`generateObject`, Zod: exactly 3 questions × 4 options) for questions about that lesson, and caches them per user + lesson in `ai_generated_questions` (re-open = cache hit, no Claude call; "Generează alte" = `forceRegenerate`, button `disabled={loading}`). Failure shows a fallback with retry.

---

## 3. LESSON PAGE STRUCTURE

**File:** `src/app/(dashboard)/courses/[courseSlug]/[lessonId]/page.tsx` (RSC)

### Server fetches (via `createSupabaseServerClient()`)
`auth.getUser()` → `courses` by slug → `lessons` by id+course → all course lessons (prev/next; unpublished filtered, current kept) → `getNextLesson()` (`lib/next-lesson.ts`, can cross into the next course) → `user_progress`, `users.level`, bookmark, feedback, project, `quiz_questions` (only `type === "quiz"`), inline-question state + Wow Notes (theory-like only, via `courses/inline-loaders.ts`).

### Content
Single mode: render **`content_md` only** (compiled server-side with `next-mdx-remote/serialize`, remark-gfm/math + rehype-highlight/katex; three-tier fallback in `compileLessonMdx` so a bad lesson never 500s). Lesson types: `lesson|lab|boss` (new curriculum), legacy `theory|exercise|project|quiz`. Not used: `content_simple_md` (dropped), `users.learning_mode`.

### Client wrapper
`LessonPageClient` renders: `LessonContent` (inside `LessonErrorBoundary`) → optional `AdaptiveQuizSection` (`showAiQuiz`, published only) → completion row (`LessonPresence`, `CompleteButton`) → `LessonFeedback` → next-lesson card → celebration/toasts (`GamificationBoundary`). Completing a lesson navigates to the next one, so anything the learner should still reach must sit **before** the Complete button.

### Server actions & gamification
- `courses/actions.ts`: mark complete, progress, next lesson.
- XP / badges / streak / referrals / `stripe_*` are written ONLY with the service-role client from server code (`lib/gamification.ts` is deliberately **not** a `"use server"` file and must never be imported by a client component). Public user data is read through the `get_public_profiles` / `get_top_users` / `get_community_stats` / `get_recent_completions` RPCs, not by querying `users`.

### Course map
`/courses/[slug]` redirects to `/courses?c=<slug>`; `lib/course-map.ts` `buildAllCoursesNodes` builds one serpentine across all courses. **No sequential locking**: nodes are `completed | current (first not-done per course) | available`; every published lesson is openable in any order. Unpublished courses are listed as "În curând".

---

## 4. LANGUAGE — ROMANIAN ONLY, NO i18n LIBRARY

`next-intl` was removed: there is no `src/i18n/`, no `messages/`, no locale cookie, and the middleware only calls `updateSession` (Supabase session refresh + protected-route redirect). All user-facing text is hardcoded Romanian in the components; lesson content and AI answers are Romanian. Do not add an i18n library.

---

## 5. IN-BROWSER PYTHON (F1) — Pyodide in a Web Worker, nothing else

**Files:** `src/workers/pyodide.worker.ts`, `src/hooks/use-pyodide.ts`, `src/components/course/code-editor.tsx`
- Pyodide **v0.27.0** from the CDN (`https://cdn.jsdelivr.net/pyodide/v0.27.0/full/`), loaded inside a **Web Worker** with classic `importScripts` (newer Pyodide needs a module worker). Never bundled, never `import pyodide`, never on the main thread.
- `use-pyodide.ts` creates the worker lazily on the first "Run", shares one worker across editors, queues runs. Each run has a 10 s timeout (`PYTHON_RUN_TIMEOUT_MS`); on timeout or Stop the worker is `terminate()`d and a fresh one warms up (an AbortSignal can't stop an infinite loop).
- `CodeEditor` (Monaco) is loaded with `next/dynamic` + `ssr:false`.
- **There is no Piston and no server-side code execution** (`api/execute-code` is gone); PyTorch is not available in Pyodide, so PyTorch lessons are read/explained, not run.

---

## 6. FEATURE ARCHITECTURE DECISIONS — DO NOT REVERSE

- **F3 Neural Network Visualizer:** pure SVG + framer-motion, no React Flow / D3. Cap 8 neurons/layer, 4 layers.
- **F5 Social presence:** Supabase Realtime Presence (in-memory, zero tables, zero packages).
- **F1 Python:** Pyodide-only in a Web Worker (see §5).
- **F4 Voice:** browser Web Speech API push-to-talk **input only** — no Whisper, no TTS, no server voice routes.
- **AI provider:** Anthropic Claude (`claude-haiku-4-5`) behind `src/lib/ai/model.ts`; OpenAI is not used.
- **Optional features** (Stripe, Resend, crons, web push, text AI) ship disabled unless their keys exist; each route degrades via `lib/optional-features.ts` (`disabledResponse`).
- **Packages:** do not install new npm packages without explicit approval.
