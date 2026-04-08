# DevPath RO — Project Status Report

**Date:** 2026-03-28
**Auditor:** Claude Code (read-only audit, no changes made)
**Scope:** Full codebase review of `c:\DevPath RO`

---

## Legend
- ✅ Done — fully implemented, wired end-to-end, verified in files
- 🟡 Partial — implemented but incomplete or missing one wiring step
- ❌ Missing — not started, no files exist

---

## 1. Authentication & Infrastructure

| Item | Status | Notes |
|---|---|---|
| Email/password sign-in | ✅ Done | `signInWithEmail()` in `(auth)/actions.ts` — FormData-based, Supabase Auth |
| Email/password registration | ✅ Done | `signUpWithEmail()` — 6-char min password, redirects to `/dashboard` |
| Google OAuth | ✅ Done | `signInWithOAuth("google")` — custom SVG icon in `oauth-buttons.tsx` |
| GitHub OAuth | ✅ Done | `signInWithOAuth("github")` — Lucide icon |
| OAuth callback route | ✅ Done | `src/app/auth/callback/route.ts` — Supabase exchange handler |
| Login page UI | ✅ Done | `(auth)/login/page.tsx` — email/password form + OAuth + error display |
| Register page UI | ✅ Done | `(auth)/register/page.tsx` — name/email/password form + OAuth |
| Session refresh middleware | ✅ Done | `src/middleware.ts` calls `updateSession()` on every request |
| Dashboard auth guard | ✅ Done | `(dashboard)/layout.tsx` — redirects unauthenticated to `/login` |
| Route protection | ✅ Done | All `/dashboard/*` routes protected via layout-level `getUser()` check |

**Gaps:** None. Auth is production-ready end-to-end.

---

## 2. UI & Layout

| Item | Status | Notes |
|---|---|---|
| Landing page | ✅ Done | Hero, feature cards, stats bar, footer — all i18n-wired, not a placeholder |
| Navbar | ✅ Done | Logo, nav links, dark mode toggle, RO/EN toggle, user dropdown with plan badge |
| Sidebar | ✅ Done | Per-course progress bars, lock icons for paid courses, overall progress — wired to real Supabase data |
| Dark mode toggle | ✅ Done | Theme provider configured in root layout |
| RO/EN language toggle | ✅ Done | `next-intl` v4, cookie-based locale, both `ro.json` + `en.json` complete (148 lines each) |
| User dropdown (plan/role badge) | ✅ Done | Shows Free/Pro/Lifetime plan + Admin badge if applicable |
| Page transitions | ✅ Done | `page-transition.tsx` — Framer Motion |
| Dashboard page | ✅ Done | Greeting, 4-stat grid (lessons, progress ring, streak, courses), continue-learning card, recent activity |
| Streak counter | 🟡 Partial | UI exists and renders — hardcoded to `0`, no streak calculation logic |
| Roadmap page | ❌ Missing | Nav link exists, no `(dashboard)/roadmap/` directory |
| Portfolio page | ❌ Missing | Nav link exists, no `(dashboard)/portfolio/` directory |
| Interview page | ❌ Missing | Nav link exists, no `(dashboard)/interview/` directory |

**shadcn/ui components installed (10):** `button`, `avatar`, `badge`, `progress`, `separator`, `dropdown-menu`, `skeleton`, `progress-ring` (custom), `tooltip`, `toast`

---

## 3. Courses System

| Item | Status | Notes |
|---|---|---|
| MDX lesson files | ✅ Done | **30 lessons** in `content/courses/ai-fundamentals/` — see full list below |
| Courses listing page | ✅ Done | Grid of course cards with progress, difficulty, admin seed/sync tools |
| Course detail page | ✅ Done | Lessons grouped by 6 modules, progress % shown, first-incomplete-lesson CTA |
| Lesson viewer page | ✅ Done | RSC fetches lesson, quiz questions, and progress; full layout with AI Coach |
| Lesson types — theory | ✅ Done | Renders via `<LessonContent>` (react-markdown + rehype-highlight) |
| Lesson types — quiz | ✅ Done | `<QuizBlock>` renders questions, scores, explanations |
| Lesson types — exercise | 🟡 Partial | `<CodeEditor>` (Monaco) renders — but no "Run" button or code execution yet (F1) |
| Lesson types — project | 🟡 Partial | Type defined in schema; `lesson-30-proiect-final.mdx` exists — no special project UI |
| Lesson completion | ✅ Done | `<CompleteButton>` → `markLessonComplete()` server action → `user_progress` upsert + confetti |
| Progress tracking | ✅ Done | `user_progress` table + server action + sidebar progress bars — wired end-to-end |
| Keyboard navigation | ✅ Done | `Alt+←` / `Alt+→` between lessons via `lesson-keyboard-nav.tsx` |
| Prev/Next lesson nav | ✅ Done | Sticky bottom bar with previous/next lesson buttons |
| MDX → DB sync | ✅ Done | Admin-only `<SyncButton>` triggers `sync-action.ts` |
| Reading time estimate | ✅ Done | Calculated at ~200 wpm for theory lessons, shown in lesson header |

### All 30 Lesson Files (`content/courses/ai-fundamentals/`)

```
lesson-01-ce-este-ai.mdx
lesson-02-cum-gandeste-calculatorul.mdx
lesson-03-tipuri-de-ai.mdx
lesson-04-quiz-modulul-1.mdx
lesson-05-ce-este-machine-learning.mdx
lesson-06-supervised-vs-unsupervised.mdx
lesson-07-cum-se-antreneaza-un-model.mdx
lesson-08-overfitting-underfitting.mdx
lesson-09-quiz-modulul-2.mdx
lesson-10-neuronul-artificial.mdx
lesson-11-retea-neuronala.mdx
lesson-12-deep-learning.mdx
lesson-13-exercitiu-retea.mdx
lesson-14-quiz-modulul-3.mdx
lesson-15-language-model.mdx
lesson-16-transformers.mdx
lesson-17-tokenizare.mdx
lesson-18-context-window.mdx
lesson-19-quiz-modulul-4.mdx
lesson-20-ce-este-prompt.mdx
lesson-21-tehnici-baza.mdx
lesson-22-roluri-sistem-prompts.mdx
lesson-23-exercitiu-prompturi.mdx
lesson-24-quiz-modulul-5.mdx
lesson-25-openai-api.mdx
lesson-26-rag.mdx
lesson-27-ai-agents.mdx
lesson-28-etica-ai.mdx
lesson-29-piata-muncii.mdx
lesson-30-proiect-final.mdx
```

6 quiz lessons, 2 exercise lessons, 1 project lesson, 21 theory lessons.

---

## 4. AI Coach

| Item | Status | Notes |
|---|---|---|
| Chat API route | ✅ Done | `/api/ai/chat/route.ts` — edge runtime, GPT-4o-mini, streaming, Romanian system prompt, lesson context injection (up to 4000 chars) |
| Chat UI | ✅ Done | Side panel, message history, markdown rendering, scroll-to-bottom, welcome message |
| "Explică eroarea" quick action | ✅ Done | Shows only on exercise-type lessons |
| "Verifică soluția" quick action | ✅ Done | Shows only on exercise-type lessons |
| Voice input (STT) | ✅ Done | `use-speech-recognition.ts` — Web Speech API, `ro-RO`, push-to-talk, interim results |
| Waveform animation during recording | ✅ Done | 5-bar Framer Motion waveform in `ai-coach-chat.tsx` |
| TTS API route | ✅ Done | `/api/ai/tts/route.ts` — OpenAI TTS-1, voice: **nova**, returns `audio/mpeg` |
| TTS hook | ✅ Done | `use-speech-synthesis.ts` — AbortController race-condition fix, markdown stripper, audio lifecycle management |
| Auto-read AI responses aloud | ✅ Done | On message load-complete, triggers `speak()` |
| Mute/unmute toggle | ✅ Done | Speaker icon in chat header |
| TTS stops when mic activates | ✅ Done | Prevents feedback loop |
| `isSupported` guard | ✅ Done | Mic button hidden if browser lacks `SpeechRecognition` |

**Gaps:** No "generate exercise" feature (not in original plan). Everything planned for F4 is complete.

---

## 5. Payments (Stripe)

| Item | Status | Notes |
|---|---|---|
| Stripe package | ❌ Missing | Not in `package.json` |
| Stripe API routes | ❌ Missing | No `/api/stripe/` directory |
| Stripe environment variables | ❌ Missing | No `STRIPE_*` keys in `.env.example` |
| Checkout flow | ❌ Missing | No UI for plan upgrade |
| Webhook handler | ❌ Missing | No `stripe-webhooks` route |
| Plan enforcement | 🟡 Partial | `users.plan` column exists (`free`/`pro`/`lifetime`) and sidebar shows lock icon on paid courses — but no actual payment gate, upgrade is never triggered |

**Summary:** Architecture anticipates Stripe (`plan` column, lock icons), but **zero payment logic exists**. Not even scaffolded.

---

## 6. Features F1–F5

### F1 — In-Browser Python Execution

| Item | Status |
|---|---|
| `pyodide` npm package | ❌ Missing |
| `src/hooks/use-pyodide.ts` | ❌ Missing |
| `src/app/api/execute-code/route.ts` | ❌ Missing |
| `src/components/course/output-panel.tsx` | ❌ Missing |
| "Run ▶" button on CodeEditor | ❌ Missing |
| CodeEditor `mode="exercise"` prop | ❌ Missing |

**Status: ❌ Not started.** `CodeEditor` renders Monaco but is display-only. The `python-editor` MDX block is intercepted in `lesson-content.tsx` but renders a static editor with no execution capability.

---

### F2 — Adaptive AI Quiz Generation

| Item | Status |
|---|---|
| DB table `quiz_wrong_answers` | ❌ Missing |
| DB table `ai_generated_questions` | ❌ Missing |
| `saveWrongAnswers()` server action | ❌ Missing |
| Wrong answer recording in `quiz-block.tsx` | ❌ Missing |
| `src/app/api/ai/generate-quiz/route.ts` | ❌ Missing |
| `src/components/course/adaptive-quiz-section.tsx` | ❌ Missing |

**Status: ❌ Not started.** `quiz-block.tsx` scores locally and calls `markLessonComplete` but never persists wrong answers. No AI generation endpoint exists.

---

### F3 — Neural Network Visualiser

| Item | Status |
|---|---|
| `language-neural-network-viz` MDX interceptor | ❌ Missing |
| `src/components/visualiser/neural-network-visualiser.tsx` | ❌ Missing |
| `src/components/visualiser/network-svg.tsx` | ❌ Missing |
| `src/components/visualiser/forward-pass-animation.tsx` | ❌ Missing |
| `src/components/visualiser/network-controls.tsx` | ❌ Missing |

**Status: ❌ Not started.** `lesson-content.tsx` has no `neural-network-viz` interceptor. No visualiser components exist anywhere.

---

### F4 — Voice AI Coach

| Item | Status |
|---|---|
| Push-to-talk STT | ✅ Done |
| OpenAI TTS-1 nova endpoint | ✅ Done |
| AbortController race-condition fix | ✅ Done |
| Waveform animation | ✅ Done |
| Mute toggle | ✅ Done |

**Status: ✅ Fully complete.** All planned functionality implemented and wired.

---

### F5 — Real-time Social Presence

| Item | Status |
|---|---|
| Supabase Realtime channel (`lesson-presence:${lessonId}`) | ✅ Done |
| `channel.track()` — user joins | ✅ Done |
| Avatar stack (max 5 + overflow) | ✅ Done |
| Live student counter | ✅ Done |
| Celebration toast (Framer Motion) | ✅ Done |
| Broadcast listener for `lesson-presence:complete` | ✅ Done |
| `CompleteButton` `onComplete` prop to fire broadcast | ❌ Missing |
| Broadcast dispatch from `complete-button.tsx` | ❌ Missing |

**Status: 🟡 85% complete.** `lesson-presence.tsx` listens for a `lesson-presence:complete` broadcast event but `complete-button.tsx` never fires it — the `onComplete` callback prop was not added. Celebration toasts will never appear for other users.

---

## 7. Portfolio & Interview Sections

| Item | Status | Notes |
|---|---|---|
| Portfolio page | ❌ Missing | No `(dashboard)/portfolio/` directory |
| Interview prep page | ❌ Missing | No `(dashboard)/interview/` directory |
| `public.projects` table | ✅ Done | Table exists in `schema.sql` with RLS — architecture ready |
| Portfolio UI components | ❌ Missing | No project card, submission form, or display components |

---

## 8. Database Schema

| Table | RLS | Status |
|---|---|---|
| `public.users` | ✅ | Done |
| `public.courses` | ✅ | Done |
| `public.lessons` | ✅ | Done |
| `public.user_progress` | ✅ | Done |
| `public.quiz_questions` | ✅ | Done |
| `public.projects` | ✅ | Done — no UI yet |
| `public.quiz_wrong_answers` | — | ❌ Missing (needed for F2) |
| `public.ai_generated_questions` | — | ❌ Missing (needed for F2) |

Auth trigger `on_auth_user_created` → `handle_new_user()` auto-creates `public.users` row on signup. Indexes on `lessons.course_id`, `lessons.order_index`, `user_progress.user_id` in place.

---

## 9. Production-Ready vs Scaffolded/Placeholder

### Genuinely Production-Ready ✅
- Full auth system (email + Google + GitHub OAuth)
- All 30 AI Fundamentals lesson MDX files
- Lesson delivery pipeline (MDX → DB sync → RSC page → progress tracking)
- Quiz system (questions, scoring, explanations, retry)
- AI Coach chat (streaming, Romanian, lesson context)
- Voice AI Coach — STT + TTS full pipeline (F4)
- Supabase Realtime presence tracking + avatar stack (F5 — minus broadcast)
- Dashboard with real progress data
- i18n (RO/EN) across all pages
- Dark/light mode
- Lesson completion with confetti
- Admin tools (seed, sync, reset)

### Partial / One Step Away 🟡
- **F5 Social Presence** — just needs `onComplete` prop wired in `complete-button.tsx`
- **Exercise lessons** — CodeEditor renders but no "Run" button
- **Project lesson type** — file exists, no special UI beyond standard lesson viewer
- **Streak counter** — UI renders, always shows 0
- **Plan enforcement** — lock icons show, no payment gate

### Not Started / Missing ❌
- **F1** — In-browser Python execution (no files)
- **F2** — Adaptive AI Quiz generation (no files, no DB tables)
- **F3** — Neural Network Visualiser (no files)
- **Stripe payments** — zero implementation
- **Portfolio page** — no UI
- **Interview page** — no UI
- **Roadmap page** — no UI

---

## Summary

| Category | Status |
|---|---|
| Auth & Infrastructure | ✅ Production-ready |
| UI & Layout (core) | ✅ Production-ready |
| Nav placeholder pages (Portfolio, Roadmap, Interview) | ❌ Missing |
| Courses + Progress tracking | ✅ Production-ready |
| AI Coach (chat + voice) | ✅ Production-ready |
| Stripe / Payments | ❌ Not started |
| F1 — Python execution | ❌ Not started |
| F2 — Adaptive quiz | ❌ Not started |
| F3 — Neural network viz | ❌ Not started |
| F4 — Voice AI Coach | ✅ Complete |
| F5 — Social presence | 🟡 85% (missing broadcast dispatch) |
| Database schema | 🟡 Partial (missing 2 F2 tables) |
| Portfolio UI | ❌ Not started |
