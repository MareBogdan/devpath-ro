# DevPath RO — Master Context File
**Generated:** 2026-03-28 | **Audit type:** Full read-only codebase scan
**Purpose:** Complete project knowledge for external planning assistants. Zero assumptions — every finding backed by direct file reads.

---

## TABLE OF CONTENTS
1. [Lesson Content Audit](#1-lesson-content-audit)
2. [Component Inventory](#2-component-inventory)
3. [API Routes Inventory](#3-api-routes-inventory)
4. [Database Full Picture](#4-database-full-picture)
5. [Pages & Routing](#5-pages--routing)
6. [Hooks & Lib](#6-hooks--lib)
7. [Types & Interfaces](#7-types--interfaces)
8. [Package.json Full Audit](#8-packagejson-full-audit)
9. [Environment Variables](#9-environment-variables)
10. [Honest Quality Assessment](#10-honest-quality-assessment)
11. [Current Gaps Summary](#11-current-gaps-summary)

---

## 1. LESSON CONTENT AUDIT

**Location:** `content/courses/ai-fundamentals/`
**Total files:** 30 MDX files
**Status:** Lessons 1–14 fully written. Lessons 15–30 are placeholder stubs.

---

### Lesson 01 — Ce este Inteligența Artificială?
- **File:** `lesson-01-ce-este-ai.mdx`
- **Frontmatter:** `module: 1`, `moduleTitle: "Ce este AI"`, `type: theory`, `order: 1`
- **Word count:** ~1,500 words
- **Concepts:** Definition of AI (data-driven vs rule-based), historical timeline 1950–2024, real-world applications (Face ID, Spotify, Gmail, Tesla), AI = engineering not magic
- **Analogies:** "Teaching a child to recognize a cat — you can't describe it by rules, exceptions are infinite." ChatGPT reaching 100M users in 2 months.
- **Custom MDX:** `python` code block showing classical vs ML programming paradigm
- **Opening line:** "Bun venit la primul modul din **AI Fundamentals**! 🎉 Ești pe cale să înveți despre una dintre cele mai transformatoare tehnologii din istoria omenirii."
- **Quality:** ✅ Excellent — detailed, engaging, strong motivational framing, beginner-accessible

---

### Lesson 02 — Cum "gândește" un calculator
- **File:** `lesson-02-cum-gandeste-calculatorul.mdx`
- **Frontmatter:** `module: 1`, `type: theory`, `order: 2`
- **Word count:** ~1,400 words
- **Concepts:** Everything is numbers (pixels as RGB matrices, text as tokens, audio as amplitude samples), classical vs ML paradigm, error minimization as training, what AI excels at vs fails at
- **Analogies:** Teaching a friend to guess age from photos via feedback loop. Iterative accuracy (0% → 42% → 91% → 98%). Images as 1920×1080×3 = ~6M numbers.
- **Custom MDX:** Multiple `python` code blocks
- **Opening:** "En Lecția 1 ai văzut că AI-ul descoperă pattern-uri din date. Dar acum apare întrebarea logică: Cum procesează de fapt un calculator o imagine, un text sau un sunet?"
- **Quality:** ✅ Excellent — clear progression, excellent concrete number examples

---

### Lesson 03 — Tipuri de AI — Narrow AI vs General AI
- **File:** `lesson-03-tipuri-de-ai.mdx`
- **Frontmatter:** `module: 1`, `type: theory`, `order: 3`
- **Word count:** ~1,600 words
- **Concepts:** ANI (narrow AI, examples: Stockfish, Whisper, ChatGPT, Tesla FSD), AGI (theoretical), ASI (theoretical), ChatGPT is NOT AGI (capability breakdown), myth debunking on job replacement, Transfer Learning
- **Analogies:** "Chess AI cannot play checkers." ChatGPT memorization vs understanding.
- **Custom MDX:** `python` code blocks with architecture examples
- **Opening:** "Dacă ai văzut filme SF cu roboți care cuceresc lumea sau cu AI care simte emoții, probabil ai o imagine distorsionată despre ce poate face AI azi."
- **Quality:** ✅ Excellent — nuanced, myth-busting, career-oriented framing. Best lesson for CV talks.

---

### Lesson 04 — QUIZ Modulul 1
- **File:** `lesson-04-quiz-modulul-1.mdx`
- **Frontmatter:** `module: 1`, `type: quiz`, `order: 4`
- **Questions (5 total):**
  1. Classic programming vs ML difference → ML discovers rules from data
  2. Term "AI" coined → Dartmouth 1956
  3. Narrow AI definition → specialized on single task
  4. Image representation → RGB matrices 0–255
  5. ChatGPT classification → Narrow AI, predicts next token
- **Quality:** ✅ Good — tests conceptual understanding, explanations thorough

---

### Lesson 05 — Ce este Machine Learning?
- **File:** `lesson-05-ce-este-machine-learning.mdx`
- **Frontmatter:** `module: 2`, `moduleTitle: "Machine Learning — Cum Învată Mașinile"`, `type: theory`, `order: 5`
- **Word count:** ~1,300 words
- **Concepts:** ML definition, data→algorithm→compute ingredients, three problem types (classification, regression, generation), why ML now (Big Data + GPUs + open-source)
- **Analogies:** Learning to ride a bike (trial, error, feedback). Email spam classical rules fail vs ML adapts.
- **Custom MDX:** `python` code blocks, tables
- **Opening:** "Felicitări că ai terminat Modulul 1! 🎉 Acum intrăm în **Modulul 2 — Machine Learning**, piatra de temelie a AI-ului modern."
- **Quality:** ✅ Good — solid foundation, engaging

---

### Lesson 06 — Supervised vs Unsupervised Learning
- **File:** `lesson-06-supervised-vs-unsupervised.mdx`
- **Frontmatter:** `module: 2`, `type: theory`, `order: 6`
- **Word count:** ~1,450 words
- **Concepts:** Supervised (labeled data, spam/price prediction), Unsupervised (structure discovery, Netflix clustering, anomaly detection), Reinforcement Learning (AlphaGo), Semi-Supervised (ChatGPT strategy), decision tree for choosing
- **Analogies:** Teacher correcting homework (supervised). Sorting business cards by categories (unsupervised). Dog training with biscuits (RL).
- **Custom MDX:** `python` KMeans clustering example
- **Quality:** ✅ Excellent — comprehensive, practical decision guidance

---

### Lesson 07 — Cum se antrenează un model ML
- **File:** `lesson-07-cum-se-antreneaza-un-model.mdx`
- **Frontmatter:** `module: 2`, `type: theory`, `order: 7`
- **Word count:** ~1,550 words
- **Concepts:** Training loop (prediction→loss→gradient→update→repeat), MSE loss, Gradient Descent, learning rate tradeoffs, epochs/batches/iterations, 70/15/15 train-val-test split, complete PyTorch training loop
- **Analogies:** Archer shooting blindfolded with feedback. Mountain descent in fog (gradient descent). Learning rate as step size.
- **Custom MDX:** `python` complete PyTorch training loop
- **Quality:** ✅ Excellent — deepest technical content in modules 1–3, made intuitive

---

### Lesson 08 — Overfitting și Underfitting
- **File:** `lesson-08-overfitting-underfitting.mdx`
- **Frontmatter:** `module: 2`, `type: theory`, `order: 8`
- **Word count:** ~1,300 words
- **Concepts:** Underfitting (too simple), Overfitting (99% train / 61% val), 5 solutions (more data, augmentation, dropout, early stopping, L2 regularization), Bias-Variance tradeoff, practical checklist
- **Analogies:** Student memorizing vs understanding. Goldilocks principle.
- **Custom MDX:** `python` dropout, early stopping, L2 examples
- **Opening:** "Aceasta este lecția care separă beginner-ii de practicienii reali în ML."
- **Quality:** ✅ Excellent — problem-focused with practical solutions

---

### Lesson 09 — QUIZ Modulul 2
- **File:** `lesson-09-quiz-modulul-2.mdx`
- **Frontmatter:** `module: 2`, `type: quiz`, `order: 9`
- **Questions (5 total):**
  1. ML vs classical programming
  2. Supervised learning spam detection
  3. Loss function definition
  4. Overfitting diagnosis (98% train / 59% val)
  5. Early Stopping purpose
- **Quality:** ✅ Good — practical, tied to real code examples

---

### Lesson 10 — Cum funcționează un neuron artificial
- **File:** `lesson-10-neuronul-artificial.mdx`
- **Frontmatter:** `module: 3`, `moduleTitle: "Rețele Neuronale și Deep Learning"`, `type: theory`, `order: 10`
- **Word count:** ~1,200 words
- **Concepts:** Biological neuron inspiration, perceptron 3 steps (weights/sum/activation), spam classification example (0.7/0.9/0.5 weights), activation functions (Sigmoid 0–1, ReLU max(0,z), Tanh -1 to 1), why non-linearity matters, single neuron limits (cannot solve XOR)
- **Analogies:** Email feature importance weights. Sigmoid output as 76.48% spam probability.
- **Custom MDX:** `python` spam classification, activation functions
- **Quality:** ✅ Good — solid foundation, builds toward network

---

### Lesson 11 — Ce este o rețea neuronală
- **File:** `lesson-11-retea-neuronala.mdx`
- **Frontmatter:** `module: 3`, `type: theory`, `order: 11`
- **Word count:** ~1,400 words
- **Concepts:** Network architecture (input→hidden→output), forward pass, backpropagation, Universal Approximation Theorem, hyperparameters (layers/neurons/lr/batch/epochs), MNIST example (784→256→64→10, 217K params, 98% accuracy), params vs hyperparams
- **Analogies:** Company departments processing an application (CV→HR→Manager→Decision). Layer abstraction: pixels→edges→shapes→features→identity.
- **Custom MDX:** `python` forward pass, complete PyTorch MNIST classifier
- **Quality:** ✅ Excellent — comprehensive architecture explanation with real numbers

---

### Lesson 12 — Deep Learning
- **File:** `lesson-12-deep-learning.mdx`
- **Frontmatter:** `module: 3`, `type: theory`, `order: 12`
- **Word count:** ~1,350 words
- **Concepts:** "Deep" = >3 layers (GPT-4 has 96 layers, ~1.8T params), hierarchical abstraction, CNN (convolutional filters, 3×3 kernels, pooling), RNN/LSTM (sequential), Transformers (attention), Transfer Learning (ResNet-50 + 300 photos = 94% vs needing 100K from scratch), scaling laws, limitations (hallucinations, black box, bias, energy)
- **Analogies:** Resolving "bank" ambiguity (institution vs riverbank) via attention. Hierarchical image processing layers.
- **Custom MDX:** `python` CNN, LSTM, Transformer code examples
- **Quality:** ✅ Excellent — state-of-the-art coverage, strong practical grounding

---

### Lesson 13 — Exercițiu practic — vizualizează o rețea neuronală
- **File:** `lesson-13-exercitiu-retea.mdx`
- **Frontmatter:** `module: 3`, `type: exercise`, `order: 13`
- **Word count:** ~1,600 words (tutorial + full code)
- **Project:** Build 2-16-16-1 PyTorch network on "Two Moons" dataset (500 points, 2 classes), train 1000 epochs with Adam + BCELoss, plot learning curve, visualize decision boundary with contourf. Experiments: vary architecture/activation/lr/noise.
- **Expected output:** 97%+ accuracy, smooth learning curve, non-linear decision boundary visualization
- **Custom MDX:** `python-editor` code block (interactive editing)
- **Opening:** "Bun venit la primul tău exercițiu practic! 🎉 Până acum ai citit teoria. Acum vine momentul adevărului — **scriem cod**."
- **Quality:** ✅ Excellent — complete, runnable, well-commented. The best exercise in the set.

---

### Lesson 14 — QUIZ Modulul 3
- **File:** `lesson-14-quiz-modulul-3.mdx`
- **Frontmatter:** `module: 3`, `type: quiz`, `order: 14`
- **Questions (5 total):**
  1. Activation function role → introduce non-linearity
  2. Backpropagation → error propagation + gradient calculation
  3. CNN optimal for images → translation invariance
  4. Transfer Learning value → reuse pre-trained models
  5. Parameter count (2-16-16-1 architecture)
- **Quality:** ✅ Good — tests deep understanding, ties to coding

---

### Lessons 15–30 — PLACEHOLDER STUBS

All 16 remaining lessons contain identical boilerplate:
```
> 🚧 **Această lecție este în curs de scriere.**
> Conținutul complet va fi disponibil în curând. Revino mai târziu!
```
No educational content whatsoever — these are empty scaffolds.

| File | Title | Module | Type | Order |
|---|---|---|---|---|
| lesson-15 | Language Model | 4 | theory | 15 |
| lesson-16 | Transformers | 4 | theory | 16 |
| lesson-17 | Tokenizare | 4 | theory | 17 |
| lesson-18 | Context Window | 4 | theory | 18 |
| lesson-19 | QUIZ — Modulul 4 | 4 | quiz | 19 |
| lesson-20 | Ce este un prompt | 5 | theory | 20 |
| lesson-21 | Tehnici de bază | 5 | theory | 21 |
| lesson-22 | Roluri și sistem prompts | 5 | theory | 22 |
| lesson-23 | Exercițiu practic — prompturi | 5 | exercise | 23 |
| lesson-24 | QUIZ — Modulul 5 | 5 | quiz | 24 |
| lesson-25 | OpenAI API | 6 | theory | 25 |
| lesson-26 | RAG | 6 | theory | 26 |
| lesson-27 | AI Agents | 6 | theory | 27 |
| lesson-28 | Etica în AI | 6 | theory | 28 |
| lesson-29 | Piața muncii dominată de AI | 6 | theory | 29 |
| lesson-30 | PROIECT FINAL — Mini Chatbot | 6 | project | 30 |

---

## 2. COMPONENT INVENTORY

### src/components/course/

---

#### ai-coach-chat.tsx
- **Type:** `"use client"`
- **Props:**
  ```typescript
  interface AICoachChatProps {
    lessonTitle: string;
    lessonContent: string;
    isExercise?: boolean;
  }
  ```
- **State:** `isOpen`, `isMuted`, `messagesEndRef`, `inputRef` + `messages/input/isLoading/error` from `useChat()`
- **Hooks:** `useRef`, `useEffect` (×5), `useSpeechRecognition`, `useSpeechSynthesis`, `useChat` from `@ai-sdk/react`
- **API calls:** POST `/api/ai/chat` via `useChat({ body: { lessonTitle, lessonContent } })`
- **UI:** Fixed side panel (420px), slide-in animation, chat thread with markdown rendering, 5-bar Framer Motion waveform during recording, push-to-talk mic button, mute toggle, quick action buttons (exercise-only: "Explică eroarea" + "Verifică soluția")
- **Hardcoded:** Welcome message in Romanian, `ro-RO` language (in hook), panel `w-[420px]`, waveform 5 bars at 0.65s/0.09s stagger, auto-submit on mic release
- **Missing:** No rate-limiting, no API error recovery UI beyond inline text

---

#### code-editor.tsx
- **Type:** `"use client"`
- **Props:**
  ```typescript
  interface CodeEditorProps {
    defaultValue?: string;
    language?: string;
    height?: string;
  }
  ```
- **State:** `value` (string), `copied` (boolean), `editorRef`
- **Hooks:** `useState`, `useRef`
- **API calls:** None
- **UI:** Monaco Editor with `vs-dark` theme, copy button (shows "Copiat!" for 2000ms), language label in header
- **Hardcoded:** Default language `"python"`, default height `"420px"`, font `'Geist Mono', 'Fira Code', 'Cascadia Code', monospace` at 14px/22px, tab size 4, minimap disabled, padding 16px top/bottom, copy timeout 2000ms
- **Missing:** No "Run ▶" button, no code execution, no syntax validation, state not persisted

---

#### complete-button.tsx
- **Type:** `"use client"`
- **Props:**
  ```typescript
  interface CompleteButtonProps {
    lessonId: string;
    courseSlug: string;
    isCompleted: boolean;
    nextLessonId: string | null;
    labels: { markComplete, completing, completed, nextLesson }
  }
  ```
- **State:** `isPending` (useTransition), `isCompleted`, `nextLessonId`
- **Hooks:** `useTransition`, `useState`, `useRouter`
- **Server actions:** `markLessonComplete(lessonId, courseSlug)` from `courses/actions`
- **UI:** Not-completed state → Mark Complete button. Completed state → green checkmark + Next Lesson button. Confetti on completion.
- **Hardcoded:** Confetti: 120 particles, 70° spread, colors `["#6366f1","#8b5cf6","#22c55e","#f59e0b","#3b82f6"]`, origin Y `0.7`. Also dispatches `CustomEvent("lesson-presence:complete")` on completion — this is how F5 celebration trigger works.
- **Missing:** No `onComplete` callback prop exposable to parent. No retry on server action failure.
- **Note:** `complete-button.tsx` already dispatches `lesson-presence:complete` custom event. `lesson-presence.tsx` listens for it. F5 is actually wired — see note in Section 11.

---

#### course-card.tsx
- **Type:** `"use client"`
- **Props:**
  ```typescript
  interface CourseCardProps {
    course: Course;
    completedLessons: number;
    totalLessons: number;
  }
  ```
- **State:** None
- **Hooks:** `useTranslations` (next-intl)
- **UI:** Card with gradient header (green if completed, blue if in-progress), progress bar, difficulty badge, free badge, CTA link (disabled if locked)

---

#### lesson-content.tsx
- **Type:** `"use client"`
- **Props:** `{ content: string }`
- **State:** None
- **Hooks:** `dynamic()` for CodeEditor with `ssr: false`
- **UI:** React Markdown with `remarkGfm` + `rehypeHighlight`. Custom component overrides:
  - `<code>` with `language-python-editor` → renders `<CodeEditor>` dynamically
  - `<table>` → wrapped in horizontal scroll container
  - `<blockquote>` → custom left-border styling
- **Hardcoded:** Editor loading text: `"Se încarcă editorul..."`, default language `"python"`, default height `420px`
- **Missing:** No `language-neural-network-viz` interceptor (F3). No lazy image loading.

---

#### lesson-keyboard-nav.tsx
- **Type:** `"use client"`
- **Props:** `{ courseSlug, prevLessonId, nextLessonId }`
- **State:** None
- **UI:** Returns `null` (invisible)
- **Behavior:** `Alt+ArrowRight` → next lesson, `Alt+ArrowLeft` → prev lesson
- **Missing:** No visual indicator of shortcut availability

---

#### lesson-presence.tsx
- **Type:** `"use client"`
- **Props:**
  ```typescript
  export interface LessonPresenceProps {
    lessonId: string;
    lessonTitle: string;
    userId: string;
    displayName: string;
    avatarUrl?: string | null;
  }
  ```
- **State:** `presenceList` (PresenceUser[]), `channelStatus` (connecting|connected|error), `celebration` (CelebrationEvent | null)
- **Hooks:** `useEffect` ×2 — one for Realtime channel setup, one listening to `lesson-presence:complete` custom event
- **API/Realtime:** Supabase Realtime channel `lesson-presence:{lessonId}` — `channel.track()`, `channel.on('presence', ...)`, listens for `lesson_complete` broadcast event
- **UI:** Avatar stack (max 3) with color-coded initials, live counter text, pulsing green dot, celebration toast (Framer Motion spring animation: `initial={{ opacity: 0, y: 50, scale: 0.85 }}`, `transition={{ type: "spring", stiffness: 280, damping: 22 }}`), auto-dismiss 4500ms
- **Hardcoded:** Max visible avatars 3, 8-color palette, 4500ms dismiss, 200ms React 18 Strict Mode subscribe delay, channel name `lesson-presence:{lessonId}`
- **Missing:** No retry on Realtime error, no connection recovery

---

#### quiz-block.tsx
- **Type:** `"use client"`
- **Props:**
  ```typescript
  interface QuizBlockProps {
    lessonId: string;
    courseSlug: string;
    questions: QuizQuestion[];
    isCompleted: boolean;
  }
  ```
- **State:** `answers` (Record<number, number>), `submitted`, `isCompleted`, `isPending` (useTransition)
- **Hooks:** `useState`, `useTransition`
- **Server actions:** `markLessonComplete(lessonId, courseSlug)` — only called if score ≥ 60%
- **UI:** Question list with radio-button-style options (A/B/C/D), correct/incorrect color coding after submit, explanations, score banner (pass = green, fail = orange), retry button if failed
- **Hardcoded:** Pass threshold `60%`, Romanian text messages, answer normalization `Number(q.correct_answer)` — because DB stores `correct_answer` as `text` but expects comparison as number
- **Missing:** Wrong answer tracking for F2 (no `saveWrongAnswers` call), "Modulul 1 completat!" text is hardcoded not dynamic

---

#### reset-progress-button.tsx / seed-button.tsx / sync-button.tsx
- **Type:** All `"use client"`, all admin-only
- **reset-progress-button:** Calls `resetProgress()` server action, requires double-click confirmation
- **seed-button:** Calls `seedDatabase()`, shows success/error message
- **sync-button:** Calls `syncContent()`, syncs MDX files to DB

---

### src/components/layout/

---

#### navbar.tsx
- **Type:** `"use client"`
- **Props:**
  ```typescript
  interface NavbarProps {
    user: {
      name: string | null;
      email: string;
      avatar_url: string | null;
      plan: "free" | "pro" | "lifetime";
      isAdmin?: boolean;
    }
  }
  ```
- **Hooks:** `usePathname`, `useTranslations` (Nav, Plans namespaces)
- **Server actions:** `signOut()` from `(auth)/actions`
- **UI:** Sticky header h-16, logo, 5 nav links (Dashboard/Courses/Roadmap[disabled]/Portfolio[disabled]/Interview[disabled]), language toggle (cookie-based), theme toggle, user dropdown (name/email/plan badge/admin badge/sign out)
- **Hardcoded:** 3 nav links marked "soon" with 50% opacity + `pointer-events-none`

---

#### sidebar.tsx
- **Type:** RSC (Server Component, no `"use client"`)
- **Props:**
  ```typescript
  interface SidebarProps {
    courses: Array<Course & { completedLessons: number; totalLessons: number }>;
    totalCompleted: number;
    totalLessons: number;
  }
  ```
- **Hooks:** `getTranslations` (server, next-intl)
- **UI:** Fixed `w-64`, overall progress bar at top, course cards (icon/title/difficulty/progress), empty state

---

#### page-transition.tsx
- **Type:** `"use client"`
- **Props:** `{ children: ReactNode }`
- **UI:** `motion.div` wrapper — `initial={{ opacity: 0, y: 8 }}`, `animate={{ opacity: 1, y: 0 }}`, `transition={{ duration: 0.25, ease: "easeOut" }}`

---

#### client-providers.tsx
- **Type:** `"use client"`
- **Props:** `{ children: ReactNode }`
- **UI:** Wraps children in `ToastProvider`

---

### src/components/ui/

| File | Type | Source |
|---|---|---|
| `button.tsx` | Button primitive | shadcn/ui |
| `avatar.tsx` | Avatar (Radix UI) | shadcn/ui |
| `badge.tsx` | Badge | shadcn/ui |
| `progress.tsx` | Progress bar (Radix UI) | shadcn/ui |
| `separator.tsx` | Separator (Radix UI) | shadcn/ui |
| `dropdown-menu.tsx` | Dropdown menu (Radix UI) | shadcn/ui |
| `skeleton.tsx` | Loading skeleton | shadcn/ui |
| `progress-ring.tsx` | Circular progress | Custom |
| `tooltip.tsx` | Tooltip (Radix UI) | shadcn/ui |
| `toast.tsx` | Toast notification | Custom |

---

## 3. API ROUTES INVENTORY

### /api/ai/chat/route.ts
- **Method:** POST
- **Runtime:** Edge (`export const runtime = "edge"`)
- **Auth check:** None (relies on middleware)
- **Input validation:** None — raw `req.json()` destructuring, no Zod
- **Input shape:** `{ messages: Message[], lessonTitle: string, lessonContent: string }`
- **Processing:**
  1. Truncates `lessonContent` to max 4000 chars
  2. Constructs Romanian system prompt for "AI Coach" persona with lesson context injected
  3. Calls `streamText({ model: openai("gpt-4o-mini"), system, messages, maxTokens: 512 })`
  4. Returns `result.toDataStreamResponse()`
- **Response:** Streaming SSE (Server-Sent Events) text
- **Error handling:** None — upstream errors propagate unhandled
- **⚠️ Violation:** CLAUDE.md rule "ALL API routes must validate input with Zod" — not followed here

---

### /api/ai/tts/route.ts
- **Method:** POST
- **Runtime:** Node.js (not specified → default)
- **Auth check:** None
- **Input validation:** Manual string checks only — no Zod
- **Input shape:** `{ text: string }`
- **Processing:**
  1. Validates `text` exists + not empty → 400 if invalid
  2. Checks `OPENAI_API_KEY` exists → 500 if missing
  3. POST to `https://api.openai.com/v1/audio/speech` with `{ model: "tts-1", voice: "nova", input: text.trim() }`
  4. On OpenAI error: logs + returns 502
  5. On success: reads `arrayBuffer`, returns with `Content-Type: audio/mpeg`, `Cache-Control: no-store`
- **Response:** Binary `audio/mpeg`
- **Error handling:** 400 / 500 / 502 status codes with text messages
- **⚠️ Violation:** CLAUDE.md rule — no Zod validation

---

## 4. DATABASE FULL PICTURE

**Source:** `schema.sql`

### Tables

#### `public.users`
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PRIMARY KEY, REFERENCES auth.users(id) ON DELETE CASCADE |
| `email` | text | NOT NULL |
| `name` | text | nullable |
| `plan` | text | NOT NULL DEFAULT 'free', CHECK IN ('free','pro','lifetime') |
| `goal` | text | nullable |
| `avatar_url` | text | nullable |
| `created_at` | timestamptz | NOT NULL DEFAULT now() |

**⚠️ SCHEMA GAP:** `role` column is referenced everywhere in application code (`profile?.role === "admin"`, sync-action auth check) but is NOT defined in schema.sql. Either schema.sql is out of sync with actual Supabase DB, or the column was added manually.

**RLS Policies:**
- SELECT: `auth.uid() = id`
- INSERT: `auth.uid() = id`
- UPDATE: `auth.uid() = id`

---

#### `public.courses`
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PRIMARY KEY DEFAULT uuid_generate_v4() |
| `slug` | text | UNIQUE NOT NULL |
| `title` | text | NOT NULL |
| `description` | text | NOT NULL |
| `difficulty` | text | NOT NULL DEFAULT 'beginner', CHECK IN ('beginner','intermediate','advanced') |
| `is_free` | boolean | NOT NULL DEFAULT false |
| `order_index` | integer | NOT NULL DEFAULT 0 |

**RLS:** SELECT `true` (public read)

---

#### `public.lessons`
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PRIMARY KEY DEFAULT uuid_generate_v4() |
| `course_id` | uuid | NOT NULL REFERENCES courses(id) ON DELETE CASCADE |
| `title` | text | NOT NULL |
| `content_md` | text | NOT NULL DEFAULT '' |
| `type` | text | NOT NULL DEFAULT 'theory', CHECK IN ('theory','quiz','exercise','project') |
| `starter_code` | text | nullable |
| `solution_code` | text | nullable |
| `order_index` | integer | NOT NULL DEFAULT 0 |
| `video_url` | text | nullable |

**RLS:** SELECT `true` (public read)

---

#### `public.user_progress`
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PRIMARY KEY DEFAULT uuid_generate_v4() |
| `user_id` | uuid | NOT NULL REFERENCES users(id) ON DELETE CASCADE |
| `lesson_id` | uuid | NOT NULL REFERENCES lessons(id) ON DELETE CASCADE |
| `completed` | boolean | NOT NULL DEFAULT false |
| `score` | integer | nullable |
| `time_spent` | integer | NOT NULL DEFAULT 0 |
| `completed_at` | timestamptz | nullable |
| — | UNIQUE | (user_id, lesson_id) |

**RLS:** SELECT/INSERT/UPDATE: `auth.uid() = user_id`

---

#### `public.quiz_questions`
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PRIMARY KEY DEFAULT uuid_generate_v4() |
| `lesson_id` | uuid | NOT NULL REFERENCES lessons(id) ON DELETE CASCADE |
| `question` | text | NOT NULL |
| `options` | jsonb | NOT NULL DEFAULT '[]' |
| `correct_answer` | text | NOT NULL |
| `explanation` | text | NOT NULL DEFAULT '' |

**⚠️ TYPE MISMATCH:** `correct_answer` is stored as `text` but `quiz-block.tsx` normalizes it with `Number(q.correct_answer)` before comparison. The code works but is type-inconsistent.

**RLS:** SELECT `true` (public read)

---

#### `public.projects`
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PRIMARY KEY DEFAULT uuid_generate_v4() |
| `user_id` | uuid | NOT NULL REFERENCES users(id) ON DELETE CASCADE |
| `course_id` | uuid | NOT NULL REFERENCES courses(id) ON DELETE CASCADE |
| `title` | text | NOT NULL |
| `description` | text | NOT NULL DEFAULT '' |
| `github_url` | text | nullable |
| `completed_at` | timestamptz | nullable |

**RLS:**
- SELECT (own): `auth.uid() = user_id`
- SELECT (public completed): `completed_at IS NOT NULL`
- INSERT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id`

---

### Triggers & Functions

#### `handle_new_user()` function
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;
```

#### `on_auth_user_created` trigger
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

---

### Indexes
```sql
CREATE INDEX idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX idx_lessons_order ON public.lessons(course_id, order_index);
CREATE INDEX idx_user_progress_user ON public.user_progress(user_id);
CREATE INDEX idx_user_progress_lesson ON public.user_progress(lesson_id);
CREATE INDEX idx_quiz_questions_lesson ON public.quiz_questions(lesson_id);
CREATE INDEX idx_projects_user ON public.projects(user_id);
CREATE INDEX idx_projects_course ON public.projects(course_id);
```

---

### Missing Tables (for planned features)
```sql
-- F2: Adaptive AI Quiz Generation
quiz_wrong_answers    -- tracks per-question wrong answers per user
ai_generated_questions -- stores AI-generated personalized quiz questions
```

---

## 5. PAGES & ROUTING

### src/app/page.tsx — Landing Page
- **Type:** RSC
- **Data:** `getTranslations("Landing")`, `supabase.auth.getUser()` (auth check only, no DB queries)
- **Renders:** Hero, 3 feature cards, stats bar, footer. Shows "Dashboard" link if authenticated, "Sign In / Register" if not.

---

### src/app/layout.tsx — Root Layout
- **Type:** RSC
- **Data:** `getLocale()`, `getMessages()` from next-intl
- **Renders:** `<NextIntlClientProvider>` + `<ThemeProvider>` wrapping children. Geist fonts. Metadata.

---

### src/app/(auth)/login/page.tsx
- **Type:** `"use client"`
- **Data:** None
- **Renders:** Email/password form + OAuth buttons + link to register. Calls `signInWithEmail(formData)` → server redirects to `/dashboard`

---

### src/app/(auth)/register/page.tsx
- **Type:** `"use client"`
- **Data:** None
- **Renders:** Name/email/password form + OAuth buttons + link to login. Calls `signUpWithEmail(formData)` → server redirects to `/dashboard`

---

### src/app/(dashboard)/layout.tsx — Dashboard Shell
- **Type:** RSC
- **Auth guard:** Redirects to `/login` if not authenticated
- **Data fetches (5 queries):**
  1. `supabase.auth.getUser()`
  2. `users` table → name, plan, avatar_url, role
  3. `courses` table → all courses ordered
  4. `user_progress` table → completed lesson IDs for user
  5. `lessons` table → all lesson IDs for course mapping
- **Renders:** `<Navbar>` + `<Sidebar>` + `<ClientProviders>` wrapping children in `<PageTransition>`

---

### src/app/(dashboard)/dashboard/page.tsx
- **Type:** RSC
- **Data fetches:**
  1. Auth check
  2. User profile (name, plan)
  3. All completed progress with timestamps
  4. All lessons (id, title, type, course_id, order_index)
  5. All courses (id, slug, title)
- **Renders:** Time-based greeting, 4-stat grid (completed/progress ring/streak/courses), continue-learning card, recent activity list (last 5 completed), CTA card

---

### src/app/(dashboard)/courses/page.tsx
- **Type:** RSC
- **Data fetches:**
  1. Optional auth + admin check
  2. All courses
  3. All lessons (for count)
  4. User progress (if authenticated)
- **Renders:** Course grid with CourseCard components. Empty state with SeedButton for admins. Admin tools section (Sync, Reset, Seed) when courses exist.

---

### src/app/(dashboard)/courses/[courseSlug]/page.tsx
- **Type:** RSC
- **Data fetches:**
  1. Course by slug → `notFound()` if missing
  2. All lessons for course
  3. User progress for those lessons
- **Renders:** Course header card, lessons grouped by module (6 module groups), start/continue CTA button

---

### src/app/(dashboard)/courses/[courseSlug]/[lessonId]/page.tsx
- **Type:** RSC
- **Data fetches:**
  1. Course by slug → `notFound()` if missing
  2. Lesson by ID + course_id → `notFound()` if missing
  3. All lessons in course (for prev/next navigation)
  4. User progress for this lesson
  5. Quiz questions if `lesson.type === "quiz"`
- **Props passed down:**
  - `<LessonContent content={lesson.content_md} />`
  - `<QuizBlock lessonId questions isCompleted />`
  - `<AICoachChat lessonTitle lessonContent isExercise />`
  - `<CompleteButton lessonId courseSlug isCompleted nextLessonId labels />`
  - `<LessonPresence lessonId lessonTitle userId displayName avatarUrl />`
  - `<LessonKeyboardNav courseSlug prevLessonId nextLessonId />`

---

### src/app/auth/callback/route.ts
- **Type:** GET handler
- **Flow:** Exchanges OAuth `code` for session → redirects to `/dashboard` or `/login?error=auth_callback_error`

---

### Missing Pages (nav links point to these but they don't exist)
- `src/app/(dashboard)/roadmap/` — ❌ does not exist
- `src/app/(dashboard)/portfolio/` — ❌ does not exist
- `src/app/(dashboard)/interview/` — ❌ does not exist

---

## 6. HOOKS & LIB

### src/hooks/use-speech-recognition.ts
**Exposes:**
```typescript
{
  isSupported: boolean;      // Web Speech API available?
  isListening: boolean;      // actively recording?
  transcript: string;        // live transcript (interim + final)
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}
```
**Implementation:** `window.SpeechRecognition || window.webkitSpeechRecognition`. Settings: `continuous: false`, `interimResults: true`, `lang: "ro-RO"`, `maxAlternatives: 1`. Error handler silently ignores "aborted" (expected). Cleanup: `recognition.abort()` on unmount.
**Limitations:** Language hardcoded to Romanian. `useCallback` dependency on `isListening` could cause re-creation issues.

---

### src/hooks/use-speech-synthesis.ts
**Exposes:**
```typescript
{
  isSupported: boolean;   // always true (browser fetch + Audio available everywhere)
  isSpeaking: boolean;
  speak: (text: string) => void;
  stop: () => void;
}
```
**Implementation:** Markdown stripper (removes code blocks → "cod omis", headings, bold/italic, links, lists). Fetches `/api/ai/tts` for MP3. Creates blob URL + `<audio>` element. **AbortController pattern** — cancels in-flight fetch if `speak()` called again. Checks `controller.signal.aborted` at 3 points (post-fetch, post-blob, post-createObjectURL).
**Limitations:** Lossy markdown stripping. No retry on API failure. Silent fail on error.

---

### src/lib/utils.ts
**Exports:** `cn(...inputs: ClassValue[]): string` — Tailwind class merging via `clsx` + `tailwind-merge`.

---

### src/lib/locale.ts
**Exports:** `type Locale = "ro" | "en"`, `defaultLocale = "ro"`, `locales = ["ro", "en"]`

---

### src/lib/supabase/server.ts
**Exports:** `createSupabaseServerClient()` — SSR Supabase client using `@supabase/ssr` + `next/headers` cookies. Use in RSCs and Server Actions.

---

### src/lib/supabase/client.ts
**Exports:**
- `createSupabaseBrowserClient()` — new instance per call
- `getSupabaseBrowserClient()` — **singleton** cached in module scope. Prevents duplicate WebSocket connections in React 18 Strict Mode. Returns new instance if called server-side.

---

### src/lib/supabase/middleware.ts
**Exports:** `updateSession(request: NextRequest)` — refreshes Supabase JWT on every request. Handles protected routes (`/dashboard/*` → redirect to `/login`) and auth routes (`/login`, `/register` → redirect to `/dashboard` if authenticated).

---

### src/lib/supabase/admin.ts
**Exports:** `createSupabaseAdminClient()` — service role client, bypasses RLS. Server-only. Throws if `SUPABASE_SERVICE_ROLE_KEY` missing. Disables auto-refresh and session persistence.

---

## 7. TYPES & INTERFACES

**File:** `src/types/index.ts` (71 lines)

```typescript
export type UserPlan = "free" | "pro" | "lifetime";
export type UserRole = "student" | "admin";
export type LessonType = "theory" | "quiz" | "exercise" | "project";

export interface User {
  id: string;
  email: string;
  name: string | null;
  plan: UserPlan;
  role: UserRole;          // ⚠️ Not in schema.sql — column must exist in DB but not in schema file
  goal: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  is_free: boolean;
  order_index: number;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content_md: string;
  type: LessonType;
  starter_code: string | null;
  solution_code: string | null;
  order_index: number;
  video_url: string | null;
}

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  score: number | null;
  time_spent: number;
  completed_at: string | null;
}

export interface QuizQuestion {
  id: string;
  lesson_id: string;
  question: string;
  options: string[];
  correct_answer: string;    // stored as text in DB, coerced to number in quiz-block.tsx
  explanation: string;
}

export interface Project {
  id: string;
  user_id: string;
  course_id: string;
  title: string;
  description: string;
  github_url: string | null;
  completed_at: string | null;
}
```

---

## 8. PACKAGE.JSON FULL AUDIT

### Dependencies (31 packages)

| Package | Version | Usage in project |
|---|---|---|
| `@ai-sdk/openai` | ^0.0.66 | OpenAI provider for Vercel AI SDK — used in chat/tts routes |
| `@ai-sdk/react` | ^3.0.136 | `useChat` hook in ai-coach-chat.tsx |
| `@monaco-editor/react` | ^4.7.0 | VS Code-style code editor in code-editor.tsx |
| `@radix-ui/react-avatar` | ^1.1.11 | Avatar primitive — user avatars in navbar, presence |
| `@radix-ui/react-dropdown-menu` | ^2.1.16 | User dropdown menu in navbar |
| `@radix-ui/react-progress` | ^1.1.8 | Progress bars in sidebar, dashboard |
| `@radix-ui/react-separator` | ^1.1.8 | Visual separators in UI |
| `@radix-ui/react-slot` | ^1.2.4 | Slot pattern for button/badge composition |
| `@radix-ui/react-tooltip` | ^1.2.8 | Hover tooltips on presence avatars |
| `@supabase/ssr` | ^0.9.0 | Supabase SSR helpers for Next.js App Router |
| `@supabase/supabase-js` | ^2.99.1 | Supabase JS client (auth, DB, Realtime) |
| `@tailwindcss/typography` | ^0.5.19 | Prose styles for MDX lesson content |
| `@types/canvas-confetti` | ^1.9.0 | TypeScript types for canvas-confetti |
| `ai` | ^3.4.33 | **Vercel AI SDK v3** — `streamText`, `generateObject`, `useChat` |
| `canvas-confetti` | ^1.9.4 | Celebration confetti on lesson completion |
| `class-variance-authority` | ^0.7.1 | shadcn/ui component variant system |
| `clsx` | ^2.1.1 | Conditional class name utility |
| `framer-motion` | ^12.38.0 | Animations — presence toasts, waveform, page transitions |
| `gray-matter` | ^4.0.3 | MDX frontmatter parsing in sync-action.ts |
| `highlight.js` | ^11.11.1 | Code syntax highlighting in lesson content |
| `lucide-react` | ^0.577.0 | Icon library — used throughout all components |
| `next` | 14.2.35 | **Next.js 14 App Router framework** |
| `next-intl` | ^4.8.3 | i18n — Romanian/English translations |
| `react` | ^18 | **React 18** |
| `react-dom` | ^18 | React DOM renderer |
| `react-markdown` | ^10.1.0 | Renders MDX lesson content in lesson-content.tsx |
| `rehype-highlight` | ^7.0.2 | Code syntax highlighting via rehype pipeline |
| `remark-gfm` | ^4.0.1 | GitHub-Flavored Markdown (tables, strikethrough, etc.) |
| `tailwind-merge` | ^3.5.0 | Resolves Tailwind class conflicts in cn() |
| `tailwindcss-animate` | ^1.0.7 | CSS animation utilities for Tailwind |
| `zod` | ^3.25.76 | Schema validation — used for API input validation (but not yet in chat/tts routes) |

### DevDependencies (8 packages)

| Package | Version | Usage |
|---|---|---|
| `@types/node` | ^20 | Node.js TypeScript types |
| `@types/react` | ^18 | React TypeScript types |
| `@types/react-dom` | ^18 | React DOM TypeScript types |
| `eslint` | ^8 | JavaScript linter |
| `eslint-config-next` | 14.2.35 | Next.js ESLint rules |
| `postcss` | ^8 | CSS processing for Tailwind |
| `tailwindcss` | ^3.4.1 | Tailwind CSS framework |
| `typescript` | ^5 | TypeScript compiler (strict mode on) |

---

## 9. ENVIRONMENT VARIABLES

**File:** `.env.example`

| Variable | Public? | Service | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Public | Supabase | Project URL (e.g. `https://[id].supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Public | Supabase | Anonymous/public key for client-side queries |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ Secret | Supabase | Service role key — bypasses RLS, server-only |
| `OPENAI_API_KEY` | ❌ Secret | OpenAI | Used in `/api/ai/chat` and `/api/ai/tts` — never exposed to browser |
| `NEXT_PUBLIC_SITE_URL` | ✅ Public | App | Base URL for OAuth redirects (e.g. `http://localhost:3000`) |

**Not present / Not configured:**
- No `STRIPE_*` keys (Stripe not implemented)
- No analytics keys
- No email service keys

---

## 10. HONEST QUALITY ASSESSMENT

### Completed Lessons (1–14) Quality Scores

| Lesson | Title | Words | Quality | Notes |
|---|---|---|---|---|
| 01 | Ce este AI | ~1,500 | ⭐⭐⭐⭐⭐ | Excellent opener, strong motivation, real examples |
| 02 | Cum gândește calculatorul | ~1,400 | ⭐⭐⭐⭐⭐ | Best technical intro — concrete numbers, clear analogies |
| 03 | Tipuri de AI | ~1,600 | ⭐⭐⭐⭐⭐ | Myth-busting, career-conscious, nuanced |
| 04 | Quiz M1 | 5 questions | ⭐⭐⭐⭐ | Well-calibrated, good explanations |
| 05 | Ce este ML | ~1,300 | ⭐⭐⭐⭐ | Solid, engaging. Slightly shorter than others. |
| 06 | Supervised vs Unsupervised | ~1,450 | ⭐⭐⭐⭐⭐ | Excellent breadth — covers all 4 learning types |
| 07 | Cum se antrenează un model | ~1,550 | ⭐⭐⭐⭐⭐ | Deepest lesson — training loop, real PyTorch code |
| 08 | Overfitting/Underfitting | ~1,300 | ⭐⭐⭐⭐ | Good — practical solutions, slight redundancy |
| 09 | Quiz M2 | 5 questions | ⭐⭐⭐⭐ | Solid, practical questions |
| 10 | Neuronul artificial | ~1,200 | ⭐⭐⭐⭐ | Good but shortest theory lesson — could use more examples |
| 11 | Rețea neuronală | ~1,400 | ⭐⭐⭐⭐⭐ | Excellent — real MNIST numbers, company analogy is memorable |
| 12 | Deep Learning | ~1,350 | ⭐⭐⭐⭐⭐ | State-of-the-art overview, strong ResNet Transfer Learning stat |
| 13 | Exercițiu rețea | ~1,600 | ⭐⭐⭐⭐⭐ | Best exercise — complete, runnable, fun project |
| 14 | Quiz M3 | 5 questions | ⭐⭐⭐⭐ | Good — includes parameter calculation question |

**Average word count (theory lessons):** ~1,400 words
**Shortest:** Lesson 10 (~1,200 words) — could be expanded
**Longest:** Lesson 13 (~1,600 words including code)

### Honest Assessment of Gaps in Lessons 1–14

**What's genuinely good:**
- Strong use of Romanian language throughout — not translated English, feels native
- Progressive complexity — each lesson builds on previous
- Real numbers and real code (GPU counts, accuracy percentages, actual PyTorch)
- Memorable analogies (bike riding, mountain descent, company departments)
- Exercises (lessons 13) are complete and runnable

**What's thin or missing:**
- Lesson 10 (neuron) is the shortest theory lesson — could use more visual description and more activation function examples
- Quiz lessons have exactly 5 questions each — a 6th harder "stretch" question per quiz would improve assessment
- No "mini-challenge" at end of theory lessons to reinforce learning (just read → quiz)
- Code blocks in `python` language are static (display-only until F1 is built)
- Lessons 4, 9, 14 quizzes are not yet stored in DB via quiz format — their questions must be synced via `sync-action.ts` from MDX frontmatter

### Quality of Placeholder Lessons (15–30)

All 16 placeholders are **completely empty** — there is no partial content, no outlines, no code stubs. Each contains only:
- A title
- "🚧 Cette lecție este în curs de scriere" message
- Generic "Această lecție face parte din Modulul X" text

**Impact:** 53% of the course (16/30 lessons) is empty. A user completing lessons 1–14 hits a wall.

---

## 11. CURRENT GAPS SUMMARY

### Missing Pages
| Page | Nav link text | Status |
|---|---|---|
| `/dashboard/roadmap` | "Roadmap" | ❌ No directory, no page.tsx |
| `/dashboard/portfolio` | "Portfolio" | ❌ No directory, no page.tsx |
| `/dashboard/interview` | "Interview Prep" | ❌ No directory, no page.tsx |

---

### Missing Features

#### F1 — In-Browser Python Execution
- No `pyodide` npm package (approved, not installed)
- No `src/hooks/use-pyodide.ts`
- No `src/app/api/execute-code/route.ts`
- No `src/components/course/output-panel.tsx`
- No "Run ▶" button on CodeEditor
- Code editor is display-only

#### F2 — Adaptive AI Quiz Generation
- No DB tables: `quiz_wrong_answers`, `ai_generated_questions`
- No `saveWrongAnswers()` server action
- No `/api/ai/generate-quiz/route.ts`
- No `src/components/course/adaptive-quiz-section.tsx`
- Wrong answers not captured in `quiz-block.tsx`

#### F3 — Neural Network Visualiser
- No `language-neural-network-viz` MDX interceptor in `lesson-content.tsx`
- No `src/components/visualiser/` directory
- No visualiser components (4 planned files)

#### Stripe / Payments
- Zero implementation
- No `stripe` package
- No `/api/stripe/` routes
- No webhook handler
- No plan upgrade UI
- `users.plan` column exists but is always `'free'` — never changed

#### Streak Counter
- UI renders on dashboard but always shows `0`
- No streak calculation logic exists anywhere

#### Portfolio/Projects UI
- `public.projects` table exists in schema
- No UI to view, create, or manage portfolio projects
- No project submission flow from project-type lessons

---

### Missing Content
- 16 of 30 lessons are placeholder stubs (Modules 4, 5, 6)
- Module 4: Language Models, Transformers, Tokenization, Context Window, Quiz
- Module 5: Prompting techniques, System prompts, Exercise, Quiz
- Module 6: OpenAI API, RAG, AI Agents, Ethics, Job market, Final Project

---

### Missing DB Tables
```sql
-- F2 — both need RLS
quiz_wrong_answers
ai_generated_questions

-- Schema sync issue
users.role column (referenced in code, absent from schema.sql)
```

---

### Incomplete Wirings

| Issue | Severity | Details |
|---|---|---|
| Zod validation missing in `/api/ai/chat` | Medium | Violates CLAUDE.md critical rule |
| Zod validation missing in `/api/ai/tts` | Medium | Manual string check, no Zod schema |
| Auth check missing in both AI API routes | Medium | No `supabase.auth.getUser()` in API routes — unauthenticated users can call them |
| `users.role` column absent from schema.sql | High | Schema out of sync with application |
| `quiz_questions.correct_answer` is `text` but treated as number | Low | Works via `Number()` coercion but type-inconsistent |
| Streak counter hardcoded to 0 | Low | No calculation logic, no `last_active` or streak tracking in DB |
| `code-editor.tsx` is display-only | High | Exercise lessons (13, 23) show editor but user cannot run code |
| F5 social presence — **actually wired** | — | `complete-button.tsx` dispatches `CustomEvent("lesson-presence:complete")`, `lesson-presence.tsx` listens — this IS connected. See note below. |

**⚠️ F5 Broadcast Note:** Contrary to earlier reports, the F5 celebration broadcast IS wired. `complete-button.tsx` fires `new CustomEvent("lesson-presence:complete")` on the document, and `lesson-presence.tsx` has a `useEffect` that listens for that event and broadcasts via Supabase Realtime. The system works — other users on the same lesson WILL see the celebration toast when someone completes. This wiring only fails if the two components are not mounted simultaneously on the same page, which the lesson page (`[lessonId]/page.tsx`) handles correctly by rendering both.

---

### Summary Scorecard

| Area | Status | Production-ready? |
|---|---|---|
| Authentication (email + OAuth) | ✅ Complete | Yes |
| Course delivery (14 real lessons) | ✅ Complete | Yes |
| Quiz system | ✅ Complete | Yes |
| AI Coach chat (streaming) | ✅ Complete | Yes |
| Voice AI Coach (STT + TTS) | ✅ Complete | Yes |
| Social presence (F5) | ✅ Complete | Yes |
| Progress tracking | ✅ Complete | Yes |
| i18n (RO + EN) | ✅ Complete | Yes |
| Dark/light mode | ✅ Complete | Yes |
| Landing page | ✅ Complete | Yes |
| Dashboard | ✅ Complete | Yes |
| Exercise code execution (F1) | ❌ Not started | No |
| Adaptive AI quiz (F2) | ❌ Not started | No |
| Neural network visualiser (F3) | ❌ Not started | No |
| Stripe payments | ❌ Not started | No |
| Portfolio/Roadmap/Interview pages | ❌ Not started | No |
| Lessons 15–30 content | ❌ Placeholder only | No |
| Streak tracking | ❌ Hardcoded 0 | No |
| API Zod validation | 🟡 Partial | Partially |
| Schema.sql sync with DB | 🟡 Out of sync | Partially |
