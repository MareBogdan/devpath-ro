---
name: devpath-ro-patterns
description: >-
  DevPath RO specific patterns. Use when creating new
  features, components, or API routes. Covers: Supabase
  Realtime channel pattern, AI Coach data flow, lesson
  page RSC structure, next-intl v4 server/client setup,
  MDX conventions, and the 5 feature architecture decisions.
allowed-tools: Read
---

# DevPath RO — Project Patterns Reference

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
// Tracked via:
await channel.track({ user_id, display_name, avatar_url, online_at: new Date().toISOString() })
```

### Broadcast format for completion celebrations
```typescript
// Sender (CompleteButton fires custom DOM event → LessonPresence listens):
window.dispatchEvent(new CustomEvent("lesson-presence:complete", { detail: { lessonId } }));

// LessonPresence broadcasts to channel peers:
channelRef.current.send({
  type: "broadcast",
  event: "lesson_complete",
  payload: { display_name: string, lesson_title: string }
})

// Receivers: filter own broadcasts with:
if (ev.display_name !== displayName) { setCelebration(ev); }
```

### Cleanup on unmount pattern — React 18 Strict Mode fix
```typescript
// 200ms defer prevents Strict Mode's fake-unmount from opening a WebSocket
// that immediately closes (which logs a confusing error).
let subscribed = false;
const timeoutId = window.setTimeout(async () => {
  subscribed = true;
  channel.subscribe(async (status) => { ... });
}, 200);

return () => {
  clearTimeout(timeoutId);
  if (subscribed) supabase.removeChannel(channel); // only if actually subscribed
};
```

### Presence sync handler
```typescript
channel.on("presence", { event: "sync" }, () => {
  const state = channel.presenceState() as Record<string, PresenceUser[]>;
  const users = Object.values(state).flat();
  setPresenceList(users);
})
```

---

## 2. AI COACH DATA FLOW

**Files:** `src/app/api/ai/chat/route.ts`, `src/app/api/ai/tts/route.ts`, `src/hooks/use-speech-recognition.ts`, `src/hooks/use-speech-synthesis.ts`, `src/components/course/ai-coach-chat.tsx`

### Full voice pipeline
```
User presses + holds mic button
  → handleMicDown(): tts.stop() first (prevents feedback loop)
  → recognition.startListening()
  → SpeechRecognition (lang: "ro-RO", continuous: false, interimResults: true)
  → transcript streams live into input field via setInput(recognition.transcript)

User releases mic button
  → handleMicUp(): recognition.stopListening() [stop(), not abort() — gets final result]
  → isListening transitions true → false
  → useEffect detects transition: appends { role: "user", content: transcript }
  → recognition.resetTranscript(), setInput("")

Chat API call (/api/ai/chat)
  → streamText({ model: openai("gpt-4o-mini"), system: systemPrompt, messages, maxTokens: 512 })
  → result.toDataStreamResponse() (Vercel AI SDK v3)
  → useChat streams response into messages array

TTS playback (isLoading transitions true → false)
  → if (!isMuted) tts.speak(last.content)
  → stripMarkdown(text) → POST /api/ai/tts { text }
  → OpenAI TTS-1, voice "nova" → audio/mpeg ArrayBuffer
  → URL.createObjectURL(blob) → new Audio(url).play()
```

### AbortController race-condition pattern
```typescript
// On every new speak() call, stop() is called first:
const controller = new AbortController();
abortControllerRef.current = controller;

const res = await fetch("/api/ai/tts", { signal: controller.signal, ... });
if (controller.signal.aborted) return; // bail if stop() fired during fetch
const blob = await res.blob();
if (controller.signal.aborted) return; // bail if stop() fired during blob read
```
`stop()` calls `abortControllerRef.current.abort()` to cancel in-flight fetches immediately.

### Chat API route structure
- Runtime: `export const runtime = "edge"` NOT set (tts route doesn't have it either — only chat does)
- Chat: POST `/api/ai/chat` — body: `{ messages, lessonTitle, lessonContent }`
- TTS: POST `/api/ai/tts` — body: `{ text }` — returns `audio/mpeg`

### useChat configuration (v3)
```typescript
useChat({
  api: "/api/ai/chat",
  body: { lessonTitle, lessonContent }, // sent with every request
  initialMessages: [{ id: "welcome", role: "assistant", content: "..." }],
})
// Import: import { useChat } from "ai/react"  ← v3 path (NOT "@ai-sdk/react")
```

---

## 3. LESSON PAGE STRUCTURE

**Files:** `src/app/(dashboard)/courses/[courseSlug]/[lessonId]/page.tsx`

### RSC fetches server-side (all via `createSupabaseServerClient()`)
1. `supabase.auth.getUser()` — current user
2. `courses` table — by `slug` param
3. `lessons` table — by `id` + `course_id` (current lesson)
4. `lessons` table — all lessons in course for prev/next navigation
5. `user_progress` table — completion status for this lesson
6. `quiz_questions` table — only if `lesson.type === "quiz"`

### Props passed to client components
```typescript
<LessonContent content={lesson.content_md} />
// lesson.content_md is the MDX string from DB

<QuizBlock lessonId={lessonId} courseSlug={courseSlug}
  questions={quizQuestions} isCompleted={isCompleted} />

<LessonPresence lessonId userId displayName avatarUrl lessonTitle />
// displayName: user_metadata.full_name ?? name ?? email prefix ?? "Student"

<CompleteButton lessonId courseSlug isCompleted nextLessonId labels={t(...)} />

<AICoachChat lessonTitle={lesson.title} lessonContent={lesson.content_md}
  isExercise={lesson.type === "exercise"} />
```

### Server Actions in `src/app/(dashboard)/courses/actions.ts`
- Progress updates (mark lesson complete)
- Course completion tracking
- `saveWrongAnswers()` — to be added for F2

### Dashboard layout (`src/app/(dashboard)/layout.tsx`)
RSC that auth-guards all dashboard routes. Fetches user profile, course list, and progress for sidebar. Renders `<Navbar>` and `<Sidebar>`.

---

## 4. NEXT-INTL V4 SETUP

**Files:** `src/i18n/request.ts`, `src/middleware.ts`, `src/app/layout.tsx`

### How RO/EN toggle works
Locale is stored in a **cookie** named `locale`. Default: `"ro"`.

```typescript
// src/i18n/request.ts
const locale = (cookieStore.get("locale")?.value ?? "ro") as Locale;
return { locale, messages: (await import(`../../messages/${locale}.json`)).default };
```

Toggle is implemented via a Server Action that sets the `locale` cookie and redirects.

### Where translations live
```
messages/
  ro.json   ← Romanian (primary)
  en.json   ← English
```

### How to add a new translated string
1. Add key-value to both `messages/ro.json` and `messages/en.json`
2. In RSC: `const t = await getTranslations("Namespace");` → `t("key")`
3. In Client Components: `const t = useTranslations("Namespace");` → `t("key")`
4. In `src/app/layout.tsx`, `NextIntlClientProvider` wraps the app to provide translations client-side.

### Middleware
`src/middleware.ts` only calls `updateSession(request)` from `@/lib/supabase/middleware`. The next-intl middleware is NOT used — locale comes from cookie in `i18n/request.ts` only.

---

## 5. FEATURE ARCHITECTURE DECISIONS — DO NOT REVERSE

These decisions were made deliberately. Do not change them without explicit discussion.

### F3 — Neural Network Visualizer: Zero new packages
- **Decision:** Pure SVG + framer-motion (already installed). No React Flow, no D3.js.
- **Reason:** Neural network topology is a fixed layered DAG — layout is trivial math. framer-motion handles all animation. Adding React Flow would make the viz look generic (every React Flow app looks similar). D3 creates React/DOM conflicts.
- **Constraint:** Cap at 8 neurons/layer, 4 layers max to prevent SVG layout issues.

### F5 — Real-time Social Presence: Supabase Realtime in-memory
- **Decision:** Supabase Realtime Presence (WebSocket, in-memory on Supabase edge). Zero new DB tables.
- **Reason:** Presence is ephemeral — no point persisting who is online. Supabase JS (already installed) includes full Realtime client. Zero additional packages.

### F1 — In-Browser Python Execution: Pyodide CDN (not bundled)
- **Decision:** Load Pyodide WASM from CDN at runtime. The `pyodide` npm package = TypeScript types only.
- **Reason:** Pyodide WASM bundle is ~12 MB. Bundling it would violate the 350KB performance budget. CDN loading is lazy (first "Run" click only), cached in browser after first load.
- **Hybrid strategy:** Pyodide for lessons 1–12, 14–30 (no PyTorch). Piston API proxy for lesson 13+ (PyTorch required). PyTorch is absent from Pyodide's package ecosystem.

### F4 — Voice AI Coach STT: Web Speech API (not Whisper)
- **Decision:** Browser-native `SpeechRecognition` for speech-to-text. Push-to-talk pattern.
- **Reason:** Zero latency (on-device), zero cost, zero new packages. Whisper would require audio recording, multipart upload, new API route, and per-request cost.
- **Upgrade path:** The `use-speech-recognition.ts` hook interface is identical whether the backend is Web Speech API or Whisper — swapping is a one-file change if needed.

### F4 — TTS: Custom OpenAI TTS-1 endpoint (not browser SpeechSynthesis)
- **Decision:** POST to `/api/ai/tts` → OpenAI TTS-1, voice "nova" → `audio/mpeg`.
- **Reason:** Browser `SpeechSynthesis` is robotic and inconsistent across browsers/OS. OpenAI nova voice sounds natural and consistent. The AbortController pattern prevents race conditions when `stop()` is called mid-fetch.
