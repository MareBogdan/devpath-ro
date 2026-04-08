# High-Tech-Features-Plan.md
## DevPath RO — Strategic Technical Features Plan

**Document version:** 1.0
**Date:** 2026-03-24
**Purpose:** Portfolio/CV showcase document + actionable implementation roadmap

---

## Executive Summary

DevPath RO is a Next.js 14 App Router learning platform with a production-grade stack: Supabase (PostgreSQL + Auth + Realtime), OpenAI GPT-4o-mini streamed via Vercel AI SDK, Monaco Editor, Tailwind CSS, framer-motion, next-intl (RO/EN), and Radix UI. The platform delivers 30 AI Fundamentals lessons across six modules with theory, quiz, exercise, and project lesson types.

The five features described here transform DevPath RO from a content-delivery platform into an **intelligent, interactive, and socially-connected learning system**. Each feature is architecturally designed to fit the existing codebase with deliberate dependency choices and minimal new packages — the hallmark of senior engineering judgement.

> **Total estimated effort:** 10–12 focused working days for all five features.

---

## Feature Comparison Table

| Feature | Difficulty | Effort | New npm Packages | New DB Tables | CV Impact |
|---|---|---|---|---|---|
| F1: In-Browser Python Execution | Advanced | L | `pyodide` | 0 (optional column) | ⭐⭐⭐⭐⭐ |
| F2: Adaptive AI Quiz Generation | Medium | M | none | 2 tables | ⭐⭐⭐⭐ |
| F3: Neural Network Visualiser | Advanced | L | none | 0 | ⭐⭐⭐⭐⭐ |
| F4: Voice AI Coach | Medium | M | none | 0 | ⭐⭐⭐⭐ |
| F5: Real-time Social Presence | Medium | S | none | 0 (in-memory) | ⭐⭐⭐⭐ |

---

## Implementation Roadmap

```
Week 1
├── Feature 5: Real-time Social Presence       (0.5–1 day)
│   └── Smallest effort, instantly visible in demo, zero new packages
│
├── Feature 4: Voice AI Coach                  (1.5 days)
│   └── Extends ai-coach-chat.tsx, no new packages, high demo impact
│
└── Feature 2: Adaptive AI Quiz Generation     (1.5–2 days)
    └── DB migrations run in parallel with other feature work

Week 2
├── Feature 1: In-Browser Python Execution     (3–4 days)
│   ├── Phase 1–2: Pyodide integration + matplotlib capture
│   └── Phase 3–4: Piston hybrid + polish
│
└── Feature 3: Neural Network Visualiser       (3 days)
    ├── Phase 1: Static SVG rendering
    ├── Phase 2: Interactive layer/neuron controls
    └── Phase 3–4: Forward-pass animation + activation colouring
```

---

## Feature 1: In-Browser Python Code Execution

### Why It's Impressive for CV/Portfolio

Running Python in the browser via WebAssembly is a genuinely hard engineering problem that most bootcamp projects never attempt. It demonstrates command of browser-native execution environments, async loading of multi-megabyte WASM runtimes, and careful UX design around long-running computations. Employers in edtech, developer tooling, and platform engineering will immediately recognise this as non-trivial.

### Technical Feasibility — Advanced

The complexity comes from three distinct challenges:
1. The Pyodide WASM bundle is ~12 MB and must load lazily without blocking the lesson page.
2. Matplotlib plot capture requires intercepting `plt.show()` at the Python level and redirecting output to a base64 PNG buffer.
3. PyTorch is not available in Pyodide, requiring a hybrid fallback for Lesson 13+.

### Recommended Approach: Hybrid (Pyodide + Piston API)

| Option | Pros | Cons |
|---|---|---|
| **Pyodide (WASM)** | Fully offline after first load. Zero cost. numpy/sklearn/matplotlib work. Technically impressive. | PyTorch not available. ~12 MB first load. |
| **Piston API** | Full Python, PyTorch/sklearn work. Simple HTTP POST. | Third-party rate limits. Requires network. |
| **Hybrid (recommended)** | Best of both worlds. Architecturally deliberate. | Extra routing logic. |

**Strategy:**
- Lessons 1–12, 14–30: **Pyodide** — runs entirely in the browser.
- Lesson 13 and any lesson with `execution_mode = 'piston'`: **Piston API** — proxied via a Next.js server route to avoid CORS.

This is the most impressive answer for a portfolio: it demonstrates you understood the tradeoffs and made an intentional architectural decision.

### Exact npm Packages Needed

```bash
npm install pyodide@0.27.0
```

Only one new package. Pyodide is loaded via CDN at runtime (not bundled) to avoid bloating the Next.js bundle. The Piston API requires only a plain `fetch()` call — no package needed.

### Architecture Overview

**Data flow:**
```
User edits code in Monaco Editor
  → clicks "Run ▶"
  → CodeEditor checks executionMode prop
    ├─ "pyodide":
    │   usePyodide() hook (lazy-loads WASM once per session)
    │   → pyodide.runPythonAsync(preamble + userCode)
    │   → capture stdout via sys.stdout redirect
    │   → capture matplotlib via plt.savefig() → BytesIO → base64
    │   → return { stdout, stderr, plots: string[] }
    └─ "piston":
        fetch("/api/execute-code", { method: "POST", body: { code } })
        → server proxies to emkc.org/api/v2/piston/execute
        → return { stdout, stderr }
  → OutputPanel renders: stdout lines, stderr in red, plots as <img> tags
```

**New files:**
| File | Purpose |
|---|---|
| `src/hooks/use-pyodide.ts` | Singleton hook managing Pyodide load state; exposes `runCode(code)` |
| `src/app/api/execute-code/route.ts` | Server-side Piston API proxy with 15s timeout, IP-based cooldown |
| `src/components/course/output-panel.tsx` | Renders stdout/stderr/plots; loading spinner; error state |

**Modified files:**
| File | Change |
|---|---|
| `src/components/course/code-editor.tsx` | Add `mode: "display" \| "exercise"` + `executionMode` props; "Run ▶" button; `<OutputPanel>` below Monaco |
| `src/components/course/lesson-content.tsx` | Pass `mode="exercise"` and `executionMode` to CodeEditor for exercise lessons |
| `src/app/(dashboard)/courses/[courseSlug]/[lessonId]/page.tsx` | Pass `isExercise` to `LessonContent` |
| `schema.sql` | `ALTER TABLE lessons ADD COLUMN execution_mode text DEFAULT 'pyodide'` (optional) |

**Matplotlib plot capture (Python preamble injected before user code runs in Pyodide):**
```python
import sys, io, base64
_plots = []
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as _plt_orig
def _patched_show(*a, **kw):
    buf = io.BytesIO()
    _plt_orig.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    _plots.append(base64.b64encode(buf.read()).decode('utf-8'))
    _plt_orig.clf()
_plt_orig.show = _patched_show
```
After execution: `pyodide.globals.get('_plots').toJs()` retrieves base64 PNG strings for rendering as `<img>` tags.

### Execution Phases

1. **Editable Monaco + "Run" Button UI** — Transform `code-editor.tsx` to accept `mode` prop. When `mode === "exercise"`, set Monaco `readOnly: false`. Add "Run ▶" button. Render static `<OutputPanel>` placeholder. Pure UI change, zero risk.

2. **Pyodide Integration** — Create `use-pyodide.ts` hook. Load Pyodide from CDN on first `runCode()` call. Implement matplotlib preamble injection. Wire `OutputPanel` to display real stdout/stderr/plots. Test on sklearn-only lessons.

3. **Piston API Fallback** — Create `/api/execute-code/route.ts`. Add optional `execution_mode` column to `lessons` table (set Lesson 13 to `'piston'`). Implement hybrid routing. Test full PyTorch workflow via Piston.

4. **Polish** — Add 30s execution timeout with "Stop" button. Add rate-limit guard on the Piston proxy. Add loading animation in `OutputPanel`. Fire canvas-confetti (already installed) on first successful exercise run.

### Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Pyodide 12 MB blocks page load | Load lazily inside the hook on first "Run" click; cache singleton instance |
| Pyodide first-load takes 5–10 seconds | Show "Se pregătește mediul Python..." progress indicator |
| Piston API rate limiting | 5-second server-side cooldown per IP; clear error message |
| PyTorch training loop hangs UI | Pyodide runs in Web Worker via `runPythonAsync()`; Piston runs server-side |
| Piston public instance goes down | Fallback message "Executarea cloud temporar indisponibilă" + Google Colab link |

**Effort: L (Large)** — ~3–4 days

---

## Feature 2: Adaptive AI Quiz Generation

### Why It's Impressive for CV/Portfolio

Dynamically generating personalised quiz questions using AI, based on a student's specific wrong answers, demonstrates practical AI integration beyond simple chatbots. It shows you understand prompt engineering, structured output parsing (Zod), and feedback loop system design. This is the kind of feature that appears in Y Combinator edtech startups and will prompt genuine technical discussion in interviews.

### Technical Feasibility — Medium

The OpenAI integration pattern is already established via `/api/ai/chat/route.ts`. The primary challenges are: designing a prompt that produces well-formed JSON reliably, persisting generated questions without polluting the static `quiz_questions` table, and rendering them in `QuizBlock` without major surgery.

### Exact npm Packages Needed

**None.** Zod (`zod@3.25.76`), the Vercel AI SDK (`ai@3.4.33`), and `@ai-sdk/openai` are all already installed.

### Architecture Overview

**New DB tables:**
```sql
-- Tracks which questions a student answered incorrectly
CREATE TABLE public.quiz_wrong_answers (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references public.users(id) on delete cascade not null,
  lesson_id       uuid references public.lessons(id) on delete cascade not null,
  question_id     uuid references public.quiz_questions(id) on delete cascade not null,
  selected_option integer not null,
  correct_option  integer not null,
  attempt_at      timestamptz not null default now()
);

-- Stores AI-generated personalised questions
CREATE TABLE public.ai_generated_questions (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid references public.users(id) on delete cascade not null,
  lesson_id            uuid references public.lessons(id) on delete cascade not null,
  source_question_ids  uuid[] not null,
  question             text not null,
  options              jsonb not null,
  correct_answer       integer not null,
  explanation          text not null,
  generated_at         timestamptz not null default now()
);
```
*(Both tables get RLS policies matching existing patterns in `schema.sql`.)*

**Full data flow:**
```
Student submits quiz → QuizBlock calculates score
  → if score < 80%:
      → saveWrongAnswers() server action writes to quiz_wrong_answers
      → QuizBlock fires onSubmitResult({ score, wrongAnswers }) callback
  → AdaptiveQuizSection receives wrongAnswers
      → POST /api/ai/generate-quiz { lessonId, wrongAnswers }
      → API builds Romanian-language prompt targeting weak areas
      → GPT-4o-mini responds via generateObject() validated with Zod schema
      → API saves to ai_generated_questions
      → Returns questions array
  → AdaptiveQuizSection renders as "Practică personalizată" (practice mode, not graded)
```

**Zod schema for AI-structured output:**
```typescript
const GeneratedQuestionSchema = z.object({
  question:       z.string().min(10),
  options:        z.array(z.string()).length(4),
  correct_answer: z.number().int().min(0).max(3),
  explanation:    z.string().min(20),
});
const GeneratedQuizSchema = z.object({
  questions: z.array(GeneratedQuestionSchema).min(1).max(5),
});
```

**New files:**
| File | Purpose |
|---|---|
| `src/app/api/ai/generate-quiz/route.ts` | POST endpoint; calls GPT-4o-mini with `generateObject()`; persists to `ai_generated_questions` |
| `src/components/course/adaptive-quiz-section.tsx` | Client component below QuizBlock; fetches & renders AI-generated questions |

**Modified files:**
| File | Change |
|---|---|
| `src/components/course/quiz-block.tsx` | Record wrong answers via `saveWrongAnswers()` on failed submission; fire `onSubmitResult` callback |
| `src/app/(dashboard)/courses/actions.ts` | Add `saveWrongAnswers()` server action |
| `src/app/(dashboard)/courses/[courseSlug]/[lessonId]/page.tsx` | Render `<AdaptiveQuizSection>` below `<QuizBlock>` for quiz-type lessons |

### Execution Phases

1. **Data capture** — Add `saveWrongAnswers` server action. Extend `quiz-block.tsx`. Run SQL migrations for both tables. Nothing visible to user yet.

2. **Generation API** — Build `/api/ai/generate-quiz/route.ts`. Test Romanian-language prompt engineering until model produces valid 4-option questions reliably. Add Zod validation with up to 2 retries on parse failure.

3. **UI rendering** — Build `AdaptiveQuizSection` with framer-motion stagger entrance (each question slides in 0.1s apart). Style with amber accent + "🤖 Practică personalizată" badge to distinguish AI-generated content.

4. **Caching** — Retrieve from `ai_generated_questions` on repeat visits instead of re-generating. Add "Generează alte întrebări" button for fresh generation on demand.

### Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Model produces malformed JSON | `generateObject()` + Zod (Vercel AI SDK handles `response_format` automatically) |
| Model responds in English | System prompt: *"Răspunde EXCLUSIV în limba română"* |
| API cost | GPT-4o-mini ~$0.000015/1K tokens; 3 questions ≈ 300 tokens = negligible |

**Effort: M (Medium)** — ~1.5–2 days

---

## Feature 3: Interactive Neural Network Visualiser

### Why It's Impressive for CV/Portfolio

An interactive, animated neural network playground embedded in a lesson is a clear demonstration of data visualisation skills combined with React engineering. It is the most visually striking feature in this plan — the kind that gets a "wow" reaction during portfolio walkthroughs. It also demonstrates deep domain understanding of the course content.

### Technical Feasibility — Advanced

### Library Decision: Pure SVG + React + framer-motion (zero new packages)

| Option | Verdict |
|---|---|
| **React Flow (`@xyflow/react`)** | Fast but every React Flow app looks similar — less distinctive |
| **D3.js** | Maximum control but DOM/React conflicts and much higher effort |
| **Pure SVG + framer-motion (recommended)** | Zero new packages. Neural network topology is a fixed layered DAG — layout is trivial math (`x = layer × col_width`, `y = neuron × row_height + centre_offset`). framer-motion handles all animation. Fully consistent with the existing codebase. |

### Exact npm Packages Needed

**None.** `framer-motion@^12.38.0` (already installed) handles all animation.

### Architecture Overview

**Integration as a custom MDX component** (same pattern as `python-editor` — zero architectural novelty):

In lesson MDX files (Lessons 10, 11, 12):
````markdown
```neural-network-viz
{"layers": [2, 4, 4, 1], "inputLabels": ["x₁", "x₂"], "outputLabel": "P(ploaie)"}
```
````

In `lesson-content.tsx`:
```typescript
if (className?.includes("language-neural-network-viz")) {
  const config = JSON.parse(String(children));
  return <NeuralNetworkVisualiser {...config} />;
}
```

**Which lessons it applies to:**
- Lesson 10 (`lesson-10-neuronul-artificial.mdx`): single neuron — `layers: [2, 1]`
- Lesson 11 (`lesson-11-retea-neuronala.mdx`): standard network — `layers: [2, 3, 1]`
- Lesson 12 (`lesson-12-deep-learning.mdx`): deep network scale illustration — `layers: [784, 256, 64, 10]` (static display)

**New files:**
| File | Purpose |
|---|---|
| `src/components/visualiser/neural-network-visualiser.tsx` | Main interactive component; manages `layers`, `inputValues`, `isAnimating`, `activations` state |
| `src/components/visualiser/network-svg.tsx` | Pure SVG rendering: neuron circles + connection lines, coloured by activation value |
| `src/components/visualiser/forward-pass-animation.tsx` | Animated particles on SVG `<path>` elements via framer-motion `pathOffset` motion value |
| `src/components/visualiser/network-controls.tsx` | Layer/neuron sliders + input fields + "Run Forward Pass" button |

**Forward pass computation (pure JS math, no ML library):**
```typescript
function forwardPass(layers: number[], weights: number[][][], inputs: number[]): number[][] {
  let activations = [inputs];
  for (let l = 0; l < weights.length; l++) {
    const out = weights[l].map(neuron =>
      Math.max(0, neuron.reduce((sum, w, i) => sum + w * activations[l][i], 0))
    );
    activations.push(out);
  }
  return activations;
}
```
Weights pre-initialised with a seeded PRNG (deterministic per layer config string) — same network topology always shows the same visualisation.

**Activation colouring:** Dead ReLU neurons (= 0) are grey. Active neurons glow blue-white proportional to value. Connections thickened by weight magnitude. Radix UI `Tooltip` (already installed) shows activation value on hover.

### Execution Phases

1. **Static SVG rendering** — Build `NetworkSvg` for a fixed topology. Wire `neural-network-viz` interceptor in `lesson-content.tsx`. Style: dark background, blue neurons.

2. **Interactive controls** — Layer/neuron sliders in `NetworkControls`. Nodes re-position smoothly via framer-motion `layoutId` as topology changes.

3. **Forward-pass animation** — Build `ForwardPassAnimation`. On "Run Forward Pass": particles animate along each connection; receiving neurons light up as particles arrive. Uses framer-motion `useAnimate()` with a programmatic timeline.

4. **Polish** — Activation-value colouring. Radix UI `Tooltip` (already installed) showing neuron activation on hover. Mobile horizontal scroll wrapper. JSON parse error → friendly inline error component.

### Risks & Mitigations

| Risk | Mitigation |
|---|---|
| SVG layout breaks for large networks | Cap at 8 neurons/layer and 4 layers |
| Animation jitter | Pre-compute full timeline before starting |
| Mobile rendering | `preserveAspectRatio="xMidYMid meet"` + horizontal scroll wrapper |
| JSON parse error in MDX | try/catch + inline error component |

**Effort: L (Large)** — ~3 days

---

## Feature 4: Voice AI Coach

### Why It's Impressive for CV/Portfolio

Voice interfaces with AI are a 2024–2026 trend that very few portfolio projects implement correctly. Demonstrating push-to-talk recording, real-time transcription, and text-to-speech synthesis within an already-working AI chat panel shows comfort with Web APIs and multimodal AI. It differentiates the project from hundreds of "I built a chatbot" portfolio entries.

### Technical Feasibility — Medium

### Recommended Approach: Web Speech API (Browser-Native)

**Why not OpenAI Whisper:** Would require a new API route, audio Blob recording, multipart/form-data upload, API cost per request, and network latency before transcription. For a live portfolio demo, Web Speech API is faster and more reliable.

**CV talking point:** *"I chose Web Speech API for zero-latency, zero-cost on-device transcription. The architecture supports swapping in OpenAI Whisper with a single API route addition — the hook interface is identical."*

### Exact npm Packages Needed

**None.** `SpeechRecognition` and `SpeechSynthesis` are native browser APIs with TypeScript types included in standard `lib.dom.d.ts` (TypeScript 4.1+).

### Architecture Overview

**New files:**
| File | Purpose |
|---|---|
| `src/hooks/use-speech-recognition.ts` | Wraps `SpeechRecognition`; exposes `isListening`, `transcript`, `startListening()`, `stopListening()`, `isSupported`; configures `lang = 'ro-RO'`; `interimResults = true` |
| `src/hooks/use-speech-synthesis.ts` | Wraps `SpeechSynthesis`; exposes `speak(text)`, `stop()`, `isSpeaking`; strips markdown before speaking; selects Romanian voice if available |

**Detailed changes to `src/components/course/ai-coach-chat.tsx`:**
- `Mic` icon button (lucide-react, already installed) next to the Send button
- Push-to-talk: `onMouseDown` → `startListening()`, `onMouseUp` + `onTouchEnd` → `stopListening()`
- `transcript` wired to `setInput()` — user sees and can edit before sending
- On new assistant message: `speak(latestMessage.content)` — AI responses read aloud
- Mute/unmute toggle button (Speaker icon)
- Animated waveform during recording: 5 `<div>` bars with framer-motion keyframes `[4px, 16px, 8px, 12px, 4px]` at staggered phases
- `isSupported` guard: mic button silently hidden if browser lacks `SpeechRecognition`

**Privacy design:**
- Push-to-talk — microphone never active without intentional button hold
- Pulsing red dot + "Se ascultă..." indicator makes recording state obvious
- No audio stored or transmitted — fully on-device transcription via browser engine
- TTS paused when `isListening === true` to prevent feedback loop

### Execution Phases

1. **Recognition hook + basic transcription** — Build `use-speech-recognition.ts`. Wire mic button into `ai-coach-chat.tsx`. Transcript populates text input. Test mic → speak → release → input populated.

2. **Push-to-talk polish + waveform** — Mouse/touch event handlers. framer-motion waveform animation. Pulsing recording indicator. `isSupported` guard.

3. **TTS for AI responses** — Build `use-speech-synthesis.ts`. Wire to `messages` array. Mute toggle. Markdown stripping. Romanian voice selection.

4. **Edge cases** — `recognition.onerror` → permission denied tooltip. Auto-stop after 10s silence. Partial transcript preview in greyed input text.

### Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Safari requires webkit prefix | `window.SpeechRecognition \|\| window.webkitSpeechRecognition` |
| Romanian accuracy lower than English | UI note: *"Funcționează cel mai bine cu Chrome pe desktop"* |
| TTS voice sounds robotic | Known limitation; mention OpenAI TTS as production upgrade path in README |
| TTS/mic feedback loop | Pause `SpeechSynthesis` when `isListening === true` |

**Effort: M (Medium)** — ~1.5 days

---

## Feature 5: Real-time Social Learning Presence

### Why It's Impressive for CV/Portfolio

Real-time features are one of the clearest differentiators between junior and mid-level portfolio projects. Using Supabase Realtime Presence (WebSocket channels) demonstrates frontend state management and backend event coordination. The celebration toast ("Andrei a completat această lecție! 🎉") adds an emotional, human dimension that interviewers remember.

### Technical Feasibility — Medium

`@supabase/supabase-js@^2.99.1` is already installed and includes the full Realtime client with Presence and Broadcast support. **No new tables needed** — Presence is entirely in-memory on the Supabase edge (ephemeral, no PostgreSQL writes).

### Exact npm Packages Needed

**None.** `@supabase/supabase-js` (already installed) provides everything: `supabase.channel()`, `channel.on('presence', ...)`, `channel.track()`, `channel.subscribe()`, and `channel.send()` for broadcast.

### Architecture Overview

**Zero new DB tables.** Supabase Presence is an in-memory pub/sub system. No data written to PostgreSQL — presence state is fully ephemeral. The only DB query needed is the existing `users` table lookup already done in the lesson page server component.

**New files:**
| File | Purpose |
|---|---|
| `src/lib/supabase/client.ts` | Singleton browser Supabase client via `createBrowserClient()` from `@supabase/ssr` (for use in client components) |
| `src/components/course/lesson-presence.tsx` | Client component; joins `lesson:${lessonId}` Realtime channel; tracks current user; renders counter + avatar stack + celebration toasts |

**Presence data shape:**
```typescript
interface PresenceUser {
  user_id:    string;
  name:       string | null;
  avatar_url: string | null;
  joined_at:  string; // ISO timestamp
}
```

**Lesson completion celebration (purely client-side — no server action changes needed):**

`CompleteButton` gets a new optional `onComplete?: () => void` prop. When completion succeeds, `LessonPresence` broadcasts:
```typescript
channel.send({
  type: 'broadcast',
  event: 'lesson_complete',
  payload: { name: currentUser.name, user_id: currentUser.id }
})
```
Other users on the same lesson see: "🎉 [Name] a completat această lecție!" — framer-motion slide-in toast, auto-dismisses after 4 seconds.

**UI rendering:**
- "X studenți studiază această lecție" counter — only visible when count > 1
- Avatar stack: overlapping Radix UI `<Avatar>` components (already installed), max 5, "+N alții" for overflow
- Radix UI `Tooltip` (already installed) shows name on avatar hover
- Celebration toast: framer-motion `AnimatePresence` slide-in from top-right

**Modified files:**
| File | Change |
|---|---|
| `src/app/(dashboard)/courses/[courseSlug]/[lessonId]/page.tsx` | Add `<LessonPresence lessonId={...} currentUser={...} />` |
| `src/components/course/complete-button.tsx` | Add optional `onComplete?: () => void` prop; call after `setIsCompleted(true)` |

### Execution Phases

1. **Browser Supabase client + presence channel** — Create `src/lib/supabase/client.ts`. Build `LessonPresence` skeleton that joins/leaves channel. Verify presence events in console with two browser tabs.

2. **Counter and avatar stack UI** — Render "X studenți" pill in lesson header beside the type badge. Wire to `presentUsers` state. Test with two tabs.

3. **Celebration broadcast** — Add `onComplete` prop to `CompleteButton`. Wire broadcast call in `LessonPresence`. Build framer-motion celebration toast. Test full flow: Tab A completes → Tab B shows toast.

4. **Polish** — Entrance animation for new user joining avatar stack. Route-change cleanup. Deduplication by `user_id`. Filter own `lesson_complete` broadcasts from celebration toasts.

### Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Supabase free tier Realtime limits (200 concurrent) | Non-issue at portfolio scale; document upgrade path in README |
| Memory leak on fast navigation | `useEffect` cleanup: `channel.untrack()` + `channel.unsubscribe()` |
| Duplicate presence from same user in two tabs | Deduplicate `presentUsers` array by `user_id` before rendering |
| Toast fires for own completion | Filter: `if (payload.user_id !== currentUser.id)` |

**Effort: S (Small)** — ~0.5–1 day

---

## CV Impact — How to Frame These Features

### For an Edtech / SaaS Engineering role (Duolingo, Coursera, Notion):

> *"Built an AI-powered adaptive quiz system that detects weak areas from wrong answers and generates personalised questions using GPT-4o-mini with Zod-validated structured output. Combined with in-browser Python execution via Pyodide WASM and a Piston API fallback for PyTorch workloads — an architecturally deliberate hybrid driven by Pyodide's absence of PyTorch in its package ecosystem."*

Demonstrates: AI product thinking, structured data design, runtime tradeoff reasoning.

### For a Full-Stack / Frontend role at a product company:

> *"Implemented a real-time interactive neural network visualiser as a custom MDX component using pure SVG and framer-motion — zero new libraries. Added Supabase Realtime Presence for live co-presence indicators and lesson-completion celebrations using WebSocket channels with in-memory state and zero DB writes."*

Demonstrates: data visualisation, real-time systems, component composition, pragmatic architecture.

### For an AI/ML Platform Engineering role:

> *"Designed a hybrid Python execution engine: Pyodide WebAssembly for standard lessons with matplotlib plot capture via BytesIO/base64 redirect of plt.show(), and a server-side Piston API proxy for PyTorch lessons. The hybrid decision was architecturally driven by PyTorch's absence from the Pyodide package ecosystem — preserving the offline/zero-cost benefits of WASM for 90% of lessons while maintaining full PyTorch support for advanced exercises."*

Demonstrates: WASM execution environments, Python ecosystem knowledge, technical tradeoff articulation.

### The Meta-Narrative (for any role):

All five features share a common thread: every technical decision was made by first understanding the constraints of the existing codebase — what was already installed, what patterns were established, what the DB schema allowed — and then designing the minimal, coherent addition. **Three of five features require zero new npm packages**, leveraging only what was already present. This is the mark of senior engineering thinking applied to a portfolio project.

---

## Critical Files Reference

| File | Features Affected |
|---|---|
| `src/components/course/code-editor.tsx` | F1 — primary transformation target |
| `src/components/course/lesson-content.tsx` | F1 (exercise mode), F3 (neural-network-viz interceptor) |
| `src/components/course/ai-coach-chat.tsx` | F4 (voice), F5 (completion broadcast callback) |
| `src/components/course/quiz-block.tsx` | F2 (wrong answer recording, onSubmitResult callback) |
| `src/components/course/complete-button.tsx` | F5 (onComplete prop for broadcast) |
| `src/app/(dashboard)/courses/[courseSlug]/[lessonId]/page.tsx` | F1, F2, F5 — orchestration point |
| `src/app/(dashboard)/courses/actions.ts` | F2 (saveWrongAnswers server action) |
| `schema.sql` | F2 (two new tables), F1 (optional execution_mode column) |
