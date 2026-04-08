# DevPath RO — Phase 4-5: Interactive Learning & Social
**Status:** Not started
**Effort:** 2-3 weeks
**Depends on:** Phase 0 + Phase 1 + Phase 2-3 fully complete
**References:** devpath-vision.md (mini-games spec, portfolio spec, referral system, badges `cod_rulat`, `jucaus_perfect`, `cartele_dibace`, `vocea_comunitatii`, `vitrina_deschisa`, `ambasador`, `recrutorul`)

---

## WHY THIS PHASE EXISTS

By Phase 3's end, users can learn, earn XP, see progress, and meet Pixel — but every lesson is passive reading. Phase 4 adds kinetic engagement: mini-games that test retention mid-course, code users actually run in their browser, an AI that adapts to their weak points, and interactive SVG visualisations that make abstract neural networks tangible. Without these, the "interactive" promise is unfulfilled — DevPath RO remains a prettier version of a PDF.

Phase 5 adds the social layer that converts individual achievement into shareable identity. A user who finishes the AI Fundamentals course has earned something real. Phase 5 lets them prove it: verifiable PDF certificate, a public portfolio showing their Learning DNA radar chart and GitHub-style activity heatmap, and a referral system that turns engaged learners into organic recruiters. The activity heatmap creates the same "visible commitment" psychology as GitHub contribution graphs — once a user has 30 green squares, they will not stop.

Together these phases complete the core product loop: **learn → practice → prove → share → recruit → grow.**

---

## NEW PACKAGES — Explicit Flags

| Package | Version | Purpose | Approved |
|---|---|---|---|
| `pyodide` | `0.27.0` | TypeScript types for Pyodide CDN (runtime loaded from CDN, NOT bundled) | ✅ Pre-approved in CLAUDE.md |
| `@react-pdf/renderer` | `^4.1.6` | Server-side PDF generation for course certificates (Node.js runtime only) | ⚠️ **Requires user approval** |
| `qrcode` | `^1.5.4` | QR code generation as data URL for embedding in certificate PDF | ⚠️ **Requires user approval** |

**Zero other new packages.** All other features use: Framer Motion (drag/drop for games), Radix UI Dialog (command palette), Supabase full-text search (Cmd+K), pure SVG (heatmap, radar, neural network), canvas-confetti (already installed), and the existing Monaco Editor.

---

## PHASE 4 — Interactive Learning

### 4.0 — DB Migrations (run before any Phase 4 code)

**Show this SQL to user and wait for approval before running.**

```sql
-- ============================================
-- PHASE 4 DB MIGRATIONS
-- ============================================

-- Mini-game session results
CREATE TABLE public.minigame_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  game_type text NOT NULL CHECK (game_type IN (
    'sort_concepts', 'fill_blank', 'match_pairs',
    'true_false', 'build_network', 'write_prompt'
  )),
  trigger_lesson_index integer NOT NULL, -- 3, 6, 9, 12, 15, 18, 21, 24, 27
  score integer NOT NULL DEFAULT 0,      -- 0–100
  is_perfect boolean NOT NULL DEFAULT false,
  xp_awarded integer NOT NULL DEFAULT 0,
  played_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.minigame_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own minigame sessions"
  ON public.minigame_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own minigame sessions"
  ON public.minigame_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_minigame_sessions_user ON public.minigame_sessions(user_id);
CREATE INDEX idx_minigame_sessions_played ON public.minigame_sessions(played_at);

-- Flashcards content table (cards per lesson)
-- NOTE: user_flashcard_progress table is assumed to exist from Phase 1 planning.
-- Verify it exists; if not, run the CREATE below.
CREATE TABLE IF NOT EXISTS public.flashcards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  front_text text NOT NULL,
  back_text text NOT NULL,
  order_index integer NOT NULL DEFAULT 0
);

ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Flashcards are viewable by everyone"
  ON public.flashcards FOR SELECT USING (true);

CREATE INDEX idx_flashcards_lesson ON public.flashcards(lesson_id);

-- If user_flashcard_progress does not exist, create it
CREATE TABLE IF NOT EXISTS public.user_flashcard_progress (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  flashcard_id uuid REFERENCES public.flashcards(id) ON DELETE CASCADE NOT NULL,
  ease_factor numeric NOT NULL DEFAULT 2.5,
  interval_days integer NOT NULL DEFAULT 1,
  repetitions integer NOT NULL DEFAULT 0,
  due_date timestamptz NOT NULL DEFAULT now(),
  last_reviewed_at timestamptz,
  UNIQUE(user_id, flashcard_id)
);

ALTER TABLE public.user_flashcard_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own flashcard progress"
  ON public.user_flashcard_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own flashcard progress"
  ON public.user_flashcard_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own flashcard progress"
  ON public.user_flashcard_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_flashcard_progress_user ON public.user_flashcard_progress(user_id);
CREATE INDEX idx_flashcard_progress_due ON public.user_flashcard_progress(user_id, due_date);

-- Add search index to lessons and courses for Cmd+K (Section 4.6)
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (
      to_tsvector('romanian', coalesce(title, '') || ' ' || coalesce(content_md, ''))
    ) STORED;

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (
      to_tsvector('romanian', coalesce(title, '') || ' ' || coalesce(description, ''))
    ) STORED;

CREATE INDEX IF NOT EXISTS idx_lessons_search ON public.lessons USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_courses_search ON public.courses USING gin(search_vector);
```

---

### 4.1 — 6 Mini-Games

**When mini-games trigger:** After completing lessons at index 3, 6, 9, 12, 15, 18, 21, 24, 27.
Detection logic: in `markLessonComplete` (already in `courses/actions.ts`), after a successful completion, check `if (lessonOrderIndex > 0 && lessonOrderIndex % 3 === 0)` — if true, return `minigameReady: true` and `gameType` to the client.

**Game cycle:**
- Lesson 3 → `sort_concepts` (Game 1)
- Lesson 6 → `fill_blank` (Game 2)
- Lesson 9 → `match_pairs` (Game 3)
- Lesson 12 → `true_false` (Game 4)
- Lesson 15 → `build_network` (Game 5)
- Lesson 18 → `write_prompt` (Game 6)
- Lesson 21 → `sort_concepts` (cycle repeats)
- ...

**New files:**
- `src/components/minigame/minigame-modal.tsx` — AnimatePresence modal shell
- `src/components/minigame/game-sort-concepts.tsx`
- `src/components/minigame/game-fill-blank.tsx`
- `src/components/minigame/game-match-pairs.tsx`
- `src/components/minigame/game-true-false.tsx`
- `src/components/minigame/game-build-network.tsx`
- `src/components/minigame/game-write-prompt.tsx`
- `src/components/minigame/minigame-result-screen.tsx`

**Modified files:**
- `src/app/(dashboard)/courses/actions.ts` — `markLessonComplete` extended return
- `src/components/course/lesson-page-client.tsx` — handle `minigameReady: true`

---

#### `src/app/(dashboard)/courses/actions.ts` — extend `MarkCompleteResult`

Add to the existing `MarkCompleteResult` interface (from Phase 3):

```typescript
export interface MarkCompleteResult {
  // ... existing fields from Phase 3 ...
  minigameReady: boolean;
  gameType: MinigameType | null;
  triggerLessonIndex: number | null;
}

export type MinigameType =
  | "sort_concepts"
  | "fill_blank"
  | "match_pairs"
  | "true_false"
  | "build_network"
  | "write_prompt";

// Map from lesson order_index to game type
const MINIGAME_MAP: Record<number, MinigameType> = {
  3: "sort_concepts", 6: "fill_blank", 9: "match_pairs",
  12: "true_false", 15: "build_network", 18: "write_prompt",
  21: "sort_concepts", 24: "fill_blank", 27: "match_pairs",
};
```

In `markLessonComplete`, after the lesson is marked complete, add:

```typescript
const isMinigameTrigger = lesson.order_index % 3 === 0 && lesson.order_index >= 3;
const gameType = isMinigameTrigger
  ? (MINIGAME_MAP[lesson.order_index] ?? "sort_concepts")
  : null;

return {
  ...existingResult,
  minigameReady: isMinigameTrigger,
  gameType,
  triggerLessonIndex: isMinigameTrigger ? lesson.order_index : null,
};
```

---

#### `src/components/minigame/minigame-modal.tsx`

```typescript
"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { MinigameType } from "@/app/(dashboard)/courses/actions";
import { PixelMascot } from "@/components/mascot/pixel-mascot";
import { MinigameResultScreen } from "./minigame-result-screen";

interface MinigameModalProps {
  gameType: MinigameType;
  triggerLessonIndex: number;
  userId: string;
  onClose: () => void;
}

export function MinigameModal({
  gameType, triggerLessonIndex, userId, onClose
}: MinigameModalProps) {
  const [phase, setPhase] = useState<"intro" | "game" | "result">("intro");
  const [score, setScore] = useState(0);
  const [isPerfect, setIsPerfect] = useState(false);

  async function handleGameComplete(finalScore: number, perfect: boolean) {
    setScore(finalScore);
    setIsPerfect(perfect);
    // Record session + award XP via server action
    await recordMinigameSession({
      gameType, triggerLessonIndex, score: finalScore, isPerfect: perfect
    });
    setPhase("result");
  }

  // ...render intro screen, then game component, then result screen
}
```

---

#### Game-specific component signatures

```typescript
// All game components share this interface
interface MinigameProps {
  onComplete: (score: number, isPerfect: boolean) => void;
}

// Game 1: framer-motion drag into droppable zones
export function GameSortConcepts({ onComplete }: MinigameProps)

// Game 2: draggable word chips snapping into blank slots
export function GameFillBlank({ onComplete }: MinigameProps)

// Game 3: click-to-select + match logic, shake on wrong
export function GameMatchPairs({ onComplete }: MinigameProps)

// Game 4: framer-motion swipe gesture, 10s per question
export function GameTrueFalse({ onComplete }: MinigameProps)

// Game 5: SVG canvas with draggable nodes (simplified neural viz)
export function GameBuildNetwork({ onComplete }: MinigameProps)

// Game 6: textarea + /api/ai/chat scoring prompt
export function GameWritePrompt({ onComplete }: MinigameProps)
```

**Game 1 drag pattern** (framer-motion, no new package):
```typescript
// Cards: useDragControls + dragConstraints
// Droppable zones: track pointer position in onDrag event
// On drop: check if pointer overlaps zone bounding rect
// Highlight zone on hover: use onDragOver with getBoundingClientRect()
```

**Game 6 AI scoring system prompt:**
```
You are scoring a prompt written by a student.
Task: {task_description}
Student prompt: {student_prompt}
Score 1-10. Return JSON: { "score": number, "feedback": string (Romanian, max 2 sentences) }
```
Use `/api/ai/chat` with Zod schema `z.object({ score: z.number().min(1).max(10), feedback: z.string() })`.

---

#### `recordMinigameSession` server action (in `courses/actions.ts`)

```typescript
"use server";

import { checkAndAwardBadges } from "@/lib/gamification";

export async function recordMinigameSession(input: {
  gameType: MinigameType;
  triggerLessonIndex: number;
  score: number;
  isPerfect: boolean;
}) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const xpEarned = input.isPerfect ? 30 : 15;

  await supabase.from("minigame_sessions").insert({
    user_id: user.id,
    game_type: input.gameType,
    trigger_lesson_index: input.triggerLessonIndex,
    score: input.score,
    is_perfect: input.isPerfect,
    xp_awarded: xpEarned,
  });

  await awardXP(user.id, input.isPerfect ? "minigame_perfect" : "minigame_complete");

  await checkAndAwardBadges(user.id, {
    event: "minigame_complete",
    isPerfect: input.isPerfect,
  });
}
```

---

### 4.2 — Flashcard Spaced Repetition System

**Algorithm:** SM-2 (SuperMemo 2). On each review, user rates recall: 0 (blackout), 3 (hard), 4 (good), 5 (perfect). SM-2 computes new `ease_factor`, `interval_days`, and `due_date`.

**New files:**
- `src/lib/flashcard-sm2.ts` — pure SM-2 algorithm (no DB, pure functions)
- `src/app/api/flashcards/due/route.ts` — GET: returns due cards for user + lesson
- `src/app/api/flashcards/review/route.ts` — POST: update SM-2 state after review

**Modified files:**
- `src/components/course/flashcard-deck.tsx` — integrate SM-2 logic, show due count

---

#### `src/lib/flashcard-sm2.ts`

```typescript
export interface SM2State {
  easeFactor: number;     // starts at 2.5
  intervalDays: number;   // starts at 1
  repetitions: number;    // starts at 0
}

export interface SM2Result extends SM2State {
  dueDate: Date;
}

// quality: 0 = complete blackout, 3 = hard, 4 = good, 5 = perfect
export function computeSM2(state: SM2State, quality: 0 | 3 | 4 | 5): SM2Result {
  let { easeFactor, intervalDays, repetitions } = state;

  if (quality < 3) {
    // Failed recall: reset
    repetitions = 0;
    intervalDays = 1;
  } else {
    if (repetitions === 0) intervalDays = 1;
    else if (repetitions === 1) intervalDays = 6;
    else intervalDays = Math.round(intervalDays * easeFactor);

    repetitions += 1;
    easeFactor = Math.max(
      1.3,
      easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
    );
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + intervalDays);

  return { easeFactor, intervalDays, repetitions, dueDate };
}
```

---

#### `src/app/api/flashcards/due/route.ts`

```typescript
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({ lessonId: z.string().uuid() });

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = schema.safeParse({ lessonId: searchParams.get("lessonId") });
  if (!parsed.success) return Response.json({ error: "Invalid" }, { status: 400 });

  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Return flashcards for this lesson, LEFT JOIN with user progress to get SM-2 state
  // Cards with due_date <= now() come first (due for review)
  // New cards (no progress row yet) also included
  const { data } = await supabase
    .from("flashcards")
    .select(`
      id, front_text, back_text, order_index,
      user_flashcard_progress!left(ease_factor, interval_days, repetitions, due_date)
    `)
    .eq("lesson_id", parsed.data.lessonId)
    .order("order_index");

  return Response.json({ cards: data ?? [] });
}
```

---

#### `src/app/api/flashcards/review/route.ts`

```typescript
import { z } from "zod";
import { computeSM2 } from "@/lib/flashcard-sm2";
import { awardXP, checkAndAwardBadges } from "@/lib/gamification";

const schema = z.object({
  flashcardId: z.string().uuid(),
  quality: z.union([z.literal(0), z.literal(3), z.literal(4), z.literal(5)]),
  currentState: z.object({
    easeFactor: z.number(),
    intervalDays: z.number(),
    repetitions: z.number(),
  }).optional(),
  sessionCardCount: z.number().int().positive(), // total cards reviewed in this session
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Invalid" }, { status: 400 });

  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const current: SM2State = parsed.data.currentState ?? {
    easeFactor: 2.5, intervalDays: 1, repetitions: 0,
  };
  const result = computeSM2(current, parsed.data.quality);

  await supabase.from("user_flashcard_progress").upsert({
    user_id: user.id,
    flashcard_id: parsed.data.flashcardId,
    ease_factor: result.easeFactor,
    interval_days: result.intervalDays,
    repetitions: result.repetitions,
    due_date: result.dueDate.toISOString(),
    last_reviewed_at: new Date().toISOString(),
  }, { onConflict: "user_id,flashcard_id" });

  // Award XP after completing a 10+ card session (check total reviewed)
  if (parsed.data.sessionCardCount === 10) {
    await awardXP(user.id, "flashcard_session");
    await checkAndAwardBadges(user.id, {
      event: "flashcard_session",
      cardCount: parsed.data.sessionCardCount,
    });
  }

  return Response.json({ nextState: result });
}
```

---

### 4.3 — F2: Adaptive AI Quiz Generation

**Tables:** Already exist from Phase 0 plan (`quiz_wrong_answers`, `ai_generated_questions`).

**New files:**
- `src/app/api/ai/generate-quiz/route.ts` — Edge route, `generateObject()` + Zod
- `src/components/course/adaptive-quiz-section.tsx` — Client component

**Modified files:**
- `src/components/course/quiz-block.tsx` — record wrong answers on submit
- `src/app/(dashboard)/courses/[courseSlug]/[lessonId]/page.tsx` — render `<AdaptiveQuizSection>`

---

#### `src/app/api/ai/generate-quiz/route.ts`

```typescript
import { z } from "zod";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "edge";

const RequestSchema = z.object({
  lessonId: z.string().uuid(),
  wrongQuestionIds: z.array(z.string().uuid()).min(1).max(5),
});

const QuizQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).length(4),
  correct_answer: z.number().int().min(0).max(3),
  explanation: z.string(),
});

const QuizResponseSchema = z.object({
  questions: z.array(QuizQuestionSchema).min(1).max(5),
});

export async function POST(req: Request) {
  const parsed = RequestSchema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Invalid" }, { status: 400 });

  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch original wrong questions text for context
  const { data: wrongQuestions } = await supabase
    .from("quiz_questions")
    .select("question, correct_answer, explanation")
    .in("id", parsed.data.wrongQuestionIds);

  const prompt = `
Ești un profesor de AI care creează întrebări adaptive.
Studentul a greșit la aceste întrebări:
${wrongQuestions?.map((q) => `- ${q.question} (Răspuns corect: ${q.correct_answer})`).join("\n")}

Creează ${wrongQuestions?.length ?? 3} întrebări noi în română care testează aceleași concepte
din unghiuri diferite. Fă întrebările mai clare și mai accesibile.
  `.trim();

  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: QuizResponseSchema,
    prompt,
  });

  // Persist generated questions
  await supabase.from("ai_generated_questions").insert(
    object.questions.map((q) => ({
      user_id: user.id,
      lesson_id: parsed.data.lessonId,
      source_question_ids: parsed.data.wrongQuestionIds,
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
    }))
  );

  return Response.json({ questions: object.questions });
}
```

---

#### `src/components/course/adaptive-quiz-section.tsx`

```typescript
"use client";

interface AdaptiveQuizSectionProps {
  lessonId: string;
  wrongAnswerCount: number; // from server-side pre-check
}

export function AdaptiveQuizSection({ lessonId, wrongAnswerCount }: AdaptiveQuizSectionProps) {
  const [questions, setQuestions] = useState<GeneratedQuestion[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Only renders if wrongAnswerCount > 0
  // On mount, fetches from /api/ai/generate-quiz with wrongQuestionIds
  // Renders same quiz UI as quiz-block.tsx but with adaptive questions
  // No XP on retry — only feedback + explanation
}
```

**quiz-block.tsx modification:**
After scoring quiz, call new server action `recordQuizWrongAnswers(lessonId, wrongAnswerIds)` which inserts into `quiz_wrong_answers`. Import from `courses/actions.ts`.

---

### 4.4 — F3: Neural Network Visualiser

**Zero new packages.** Pure SVG + Framer Motion.

**New files:**
- `src/components/course/neural-network-visualiser.tsx` — SVG component

**Modified files:**
- `src/components/course/lesson-content.tsx` — add custom MDX handler for ` ```neural-network-viz `

---

#### MDX activation pattern (in `lesson-content.tsx`)

```typescript
// In the components prop of ReactMarkdown:
code({ node, className, children, ...props }) {
  if (className?.includes("language-neural-network-viz")) {
    const config = JSON.parse(String(children).trim()) as NeuralNetworkConfig;
    return <NeuralNetworkVisualiser {...config} />;
  }
  // ... existing handlers ...
}
```

---

#### `src/components/course/neural-network-visualiser.tsx`

```typescript
"use client";

import { motion, AnimatePresence } from "framer-motion";

export interface NeuralNetworkConfig {
  layers: number[];           // e.g. [3, 4, 4, 2] — neurons per layer
  labels?: {
    input?: string[];          // label per input neuron
    output?: string[];         // label per output neuron
    hidden?: string[][];       // label per hidden neuron per layer
  };
  animateForwardPass?: boolean; // default true
  highlightPath?: number[][];   // specific [layerIdx, neuronIdx] pairs to highlight
}

// Rendering constants
const NODE_RADIUS = 20;
const LAYER_GAP = 120;
const NODE_GAP = 60;
const CANVAS_PADDING = 40;

// SVG layout:
// 1. Compute total canvas width = layers.length * LAYER_GAP + 2 * CANVAS_PADDING
// 2. Compute total canvas height = max(layers) * NODE_GAP + 2 * CANVAS_PADDING
// 3. For each layer, compute y-positions centered on canvas
// 4. Draw edges (SVG <line>) first, then nodes (<circle>) on top
// 5. Animate forward pass: staggered blue pulse traveling left→right
//    Use framer-motion variants with staggerChildren keyed by layer index

interface NodePosition { x: number; y: number; layerIdx: number; nodeIdx: number; }

export function NeuralNetworkVisualiser({
  layers, labels, animateForwardPass = true, highlightPath
}: NeuralNetworkConfig) {
  const [isAnimating, setIsAnimating] = useState(false);

  const canvasWidth = layers.length * LAYER_GAP + 2 * CANVAS_PADDING;
  const maxNodes = Math.max(...layers);
  const canvasHeight = maxNodes * NODE_GAP + 2 * CANVAS_PADDING;

  // Compute all node positions
  const positions: NodePosition[][] = layers.map((count, layerIdx) => {
    const x = CANVAS_PADDING + layerIdx * LAYER_GAP;
    const totalHeight = count * NODE_GAP;
    const startY = (canvasHeight - totalHeight) / 2 + NODE_GAP / 2;
    return Array.from({ length: count }, (_, nodeIdx) => ({
      x, y: startY + nodeIdx * NODE_GAP, layerIdx, nodeIdx,
    }));
  });

  // Forward pass animation: activates each layer with 300ms delay
  // Each node pulses: scale 1→1.4→1, color #6366f1→#22c55e→#6366f1
  // Each connecting edge to next layer pulses with strokeDashoffset animation

  return (
    <div className="my-6 rounded-xl border bg-card p-4 flex flex-col items-center gap-3">
      <svg width={canvasWidth} height={canvasHeight}>
        {/* Render edges */}
        {positions.slice(0, -1).map((layer, li) =>
          layer.flatMap((from) =>
            positions[li + 1].map((to) => (
              <motion.line
                key={`${li}-${from.nodeIdx}-${to.nodeIdx}`}
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke="#334155" strokeWidth={1.5} strokeOpacity={0.4}
                // animate strokeOpacity 0.4→1→0.4 during forward pass at correct timing
              />
            ))
          )
        )}
        {/* Render nodes */}
        {positions.flat().map((pos) => (
          <motion.circle
            key={`${pos.layerIdx}-${pos.nodeIdx}`}
            cx={pos.x} cy={pos.y} r={NODE_RADIUS}
            fill="#6366f1" fillOpacity={0.85}
            // animate during forward pass
          />
        ))}
        {/* Labels */}
        {/* Render input/output labels if provided */}
      </svg>
      {animateForwardPass && (
        <button
          className="text-xs text-primary underline"
          onClick={() => setIsAnimating(true)}
        >
          Animează forward pass
        </button>
      )}
    </div>
  );
}
```

**MDX lesson usage example:**
````markdown
```neural-network-viz
{
  "layers": [3, 4, 4, 2],
  "labels": { "input": ["x₁", "x₂", "x₃"], "output": ["Cat", "Dog"] },
  "animateForwardPass": true
}
```
````

---

### 4.5 — F1: In-Browser Python Execution

**Package:** `pyodide@0.27.0` — types only, runtime loaded from CDN. Install: `npm install pyodide@0.27.0`.

**CDN base URL:** `https://cdn.jsdelivr.net/pyodide/v0.27.0/full/`

**Piston API fallback:** `https://emkc.org/api/v2/piston/execute` (free, no key, supports Python 3.10)

**New files:**
- `src/hooks/use-pyodide.ts` — loads Pyodide lazily, singleton pattern, runs code

**Modified files:**
- `src/components/course/code-editor.tsx` — add "Run" button, output panel, wire up hook
- `src/lib/gamification.ts` — add `code_executed` to `BadgeTrigger` union

---

#### `src/hooks/use-pyodide.ts`

```typescript
"use client";

import { useState, useRef, useCallback } from "react";

// Extend BadgeTrigger in gamification.ts to include:
// | { event: "code_executed" }

type PyodideStatus = "idle" | "loading" | "ready" | "error";
type RunResult = { stdout: string; stderr: string; source: "pyodide" | "piston" };

let pyodideSingleton: unknown = null; // cached after first load

export function usePyodide() {
  const [status, setStatus] = useState<PyodideStatus>("idle");
  const [output, setOutput] = useState<RunResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const loadPyodide = useCallback(async () => {
    if (pyodideSingleton) return pyodideSingleton;
    setStatus("loading");
    try {
      // Dynamic import — NEVER top-level import
      const { loadPyodide: _load } = await import(
        /* webpackIgnore: true */
        "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/pyodide.js"
      );
      pyodideSingleton = await _load({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/",
      });
      setStatus("ready");
      return pyodideSingleton;
    } catch {
      setStatus("error");
      return null;
    }
  }, []);

  const runCode = useCallback(async (code: string) => {
    setIsRunning(true);
    setOutput(null);

    let pyodide = pyodideSingleton ?? (await loadPyodide());

    if (pyodide) {
      try {
        // Capture stdout/stderr
        (pyodide as any).runPython(`
import sys, io
_stdout = io.StringIO()
_stderr = io.StringIO()
sys.stdout = _stdout
sys.stderr = _stderr
        `);
        (pyodide as any).runPython(code);
        const stdout = (pyodide as any).runPython("_stdout.getvalue()");
        const stderr = (pyodide as any).runPython("_stderr.getvalue()");
        setOutput({ stdout, stderr, source: "pyodide" });
        setIsRunning(false);
        return;
      } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : String(e);
        setOutput({ stdout: "", stderr: errMsg, source: "pyodide" });
        setIsRunning(false);
        return;
      }
    }

    // Piston fallback
    try {
      const res = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: "python",
          version: "3.10.0",
          files: [{ name: "main.py", content: code }],
        }),
      });
      const data = await res.json();
      setOutput({
        stdout: data.run?.stdout ?? "",
        stderr: data.run?.stderr ?? "",
        source: "piston",
      });
    } catch {
      setOutput({ stdout: "", stderr: "Execuția a eșuat. Încearcă din nou.", source: "piston" });
    }

    setIsRunning(false);
  }, [loadPyodide]);

  return { status, output, isRunning, runCode };
}
```

---

#### `code-editor.tsx` integration

```typescript
// Existing Monaco Editor component gains:
// 1. A "Run ▶" button (only shows when language === "python")
// 2. An output panel below the editor (collapsible, shows stdout/stderr)
// 3. On first successful run: call server action to award cod_rulat badge

// New prop:
interface CodeEditorProps {
  // ... existing props ...
  onFirstRun?: () => void; // called once to trigger cod_rulat badge
}

// Inside component:
const { status, output, isRunning, runCode } = usePyodide();
const hasRunRef = useRef(false);

async function handleRun() {
  await runCode(editorValue);
  if (!hasRunRef.current) {
    hasRunRef.current = true;
    onFirstRun?.();
  }
}
```

**Server action for `cod_rulat` badge** (in `courses/actions.ts`):
```typescript
export async function recordFirstCodeRun() {
  "use server";
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await checkAndAwardBadges(user.id, { event: "code_executed" });
}
```

Add to `BadgeTrigger` in `src/lib/gamification.ts`:
```typescript
| { event: "code_executed" }
```

Add to `checkAndAwardBadges` function:
```typescript
case "code_executed":
  await maybeAwardBadge(userId, "cod_rulat");
  break;
```

---

### 4.6 — Global Search (Cmd+K)

**Zero new packages.** Radix UI Dialog (already installed) + Supabase full-text search (using `search_vector` columns added in 4.0).

**New files:**
- `src/components/search/command-palette.tsx` — client component

**Modified files:**
- `src/components/layout/navbar.tsx` — render `<CommandPalette>`, add `Cmd+K` handler

---

#### `src/components/search/command-palette.tsx`

```typescript
"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState, useCallback } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

interface SearchResult {
  id: string;
  type: "course" | "lesson";
  title: string;
  courseSlug?: string;
  href: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createBrowserClient();

  // Open on Cmd+K / Ctrl+K
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);

    const tsQuery = q.trim().split(" ").map(w => `${w}:*`).join(" & ");

    const [{ data: courses }, { data: lessons }] = await Promise.all([
      supabase
        .from("courses")
        .select("id, slug, title")
        .textSearch("search_vector", tsQuery, { type: "websearch" })
        .limit(3),
      supabase
        .from("lessons")
        .select("id, title, course_id, courses!inner(slug)")
        .textSearch("search_vector", tsQuery, { type: "websearch" })
        .limit(6),
    ]);

    const courseResults: SearchResult[] = (courses ?? []).map((c) => ({
      id: c.id, type: "course", title: c.title,
      href: `/courses/${c.slug}`,
    }));

    const lessonResults: SearchResult[] = (lessons ?? []).map((l: any) => ({
      id: l.id, type: "lesson", title: l.title,
      courseSlug: l.courses?.slug,
      href: `/courses/${l.courses?.slug}/${l.id}`,
    }));

    setResults([...courseResults, ...lessonResults]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const t = setTimeout(() => search(query), 250);
    return () => clearTimeout(t);
  }, [query, search]);

  // Render: Dialog.Root + Dialog.Content with input + result list
  // Navigate to href on result click, close dialog
  // Keyboard: ArrowUp/Down to navigate, Enter to go, Escape to close
}
```

---

### 4.7 — Focus Mode

**Zero new packages, zero DB changes.** Client-only state via React Context.

**New files:**
- `src/hooks/use-focus-mode.ts` — context + hook
- `src/components/layout/focus-mode-provider.tsx` — context provider

**Modified files:**
- `src/app/(dashboard)/layout.tsx` — wrap children with `<FocusModeProvider>`
- `src/components/layout/navbar.tsx` — hide when focus mode active
- `src/components/layout/sidebar.tsx` — hide when focus mode active
- `src/components/course/lesson-page-client.tsx` — keyboard shortcut `F` + focus toggle button

---

#### `src/hooks/use-focus-mode.ts`

```typescript
"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface FocusModeContextValue {
  isFocused: boolean;
  toggle: () => void;
}

export const FocusModeContext = createContext<FocusModeContextValue>({
  isFocused: false,
  toggle: () => {},
});

export function useFocusMode() {
  return useContext(FocusModeContext);
}
```

In `lesson-page-client.tsx`, listen for `F` keypress (when no input is focused):
```typescript
useEffect(() => {
  function onKey(e: KeyboardEvent) {
    if (e.key === "f" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
      focusMode.toggle();
    }
  }
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [focusMode]);
```

In `navbar.tsx` and `sidebar.tsx`:
```typescript
const { isFocused } = useFocusMode();
if (isFocused) return null;
```

---

## PHASE 5 — Social & Portfolio

### 5.0 — DB Migrations (run before any Phase 5 code)

**Show this SQL to user and wait for approval before running.**

```sql
-- ============================================
-- PHASE 5 DB MIGRATIONS
-- ============================================

-- Username column for public portfolio URLs
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username text UNIQUE;
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- Lesson comments (threaded)
CREATE TABLE public.lesson_comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  parent_id uuid REFERENCES public.lesson_comments(id) ON DELETE CASCADE, -- null = root comment
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  upvote_count integer NOT NULL DEFAULT 0,
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lesson_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view non-deleted comments"
  ON public.lesson_comments FOR SELECT USING (is_deleted = false);

CREATE POLICY "Users can insert own comments"
  ON public.lesson_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can soft-delete own comments"
  ON public.lesson_comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (is_deleted = true); -- can only set is_deleted to true, not edit content

CREATE INDEX idx_lesson_comments_lesson ON public.lesson_comments(lesson_id, created_at);
CREATE INDEX idx_lesson_comments_parent ON public.lesson_comments(parent_id);

-- Comment upvotes (one per user per comment)
CREATE TABLE public.comment_upvotes (
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  comment_id uuid REFERENCES public.lesson_comments(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, comment_id)
);

ALTER TABLE public.comment_upvotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all upvotes"
  ON public.comment_upvotes FOR SELECT USING (true);

CREATE POLICY "Users can insert own upvotes"
  ON public.comment_upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own upvotes"
  ON public.comment_upvotes FOR DELETE USING (auth.uid() = user_id);

-- Function: atomically increment upvote_count
CREATE OR REPLACE FUNCTION public.toggle_comment_upvote(
  p_comment_id uuid,
  p_user_id uuid
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_exists boolean;
  v_new_count integer;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.comment_upvotes
    WHERE user_id = p_user_id AND comment_id = p_comment_id
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM public.comment_upvotes WHERE user_id = p_user_id AND comment_id = p_comment_id;
    UPDATE public.lesson_comments SET upvote_count = upvote_count - 1 WHERE id = p_comment_id
    RETURNING upvote_count INTO v_new_count;
    RETURN jsonb_build_object('upvoted', false, 'count', v_new_count);
  ELSE
    INSERT INTO public.comment_upvotes(user_id, comment_id) VALUES (p_user_id, p_comment_id);
    UPDATE public.lesson_comments SET upvote_count = upvote_count + 1 WHERE id = p_comment_id
    RETURNING upvote_count INTO v_new_count;
    RETURN jsonb_build_object('upvoted', true, 'count', v_new_count);
  END IF;
END;
$$;

-- Course certificates
CREATE TABLE public.course_certificates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  unique_code text UNIQUE NOT NULL,   -- 12-char alphanumeric, used in QR URL
  generated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.course_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view certificates"
  ON public.course_certificates FOR SELECT USING (true);

CREATE POLICY "Users can insert own certificates"
  ON public.course_certificates FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_certificates_code ON public.course_certificates(unique_code);

-- Portfolio share tracking (for vitrina_deschisa badge)
-- No separate table — tracked by checking user_badges for 'vitrina_deschisa'
```

---

### 5.1 — Public Portfolio Page `/u/[username]`

**No auth required.** RSC page, publicly accessible.

**New files:**
- `src/app/u/[username]/page.tsx` — RSC, public portfolio
- `src/components/portfolio/portfolio-page.tsx` — layout component
- `src/lib/portfolio.ts` — `getPortfolioData(username: string)` server helper

**Route is OUTSIDE `(dashboard)` group** — no auth guard, no session required.

---

#### `src/app/u/[username]/page.tsx`

```typescript
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PortfolioPage } from "@/components/portfolio/portfolio-page";
import type { Metadata } from "next";

interface Props { params: { username: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createSupabaseServerClient();
  const { data: user } = await supabase
    .from("users")
    .select("name, level, xp_points")
    .eq("username", params.username)
    .single();

  if (!user) return { title: "Profil negăsit" };
  return {
    title: `${user.name} — DevPath RO`,
    description: `Nivel ${user.level} · ${user.xp_points} XP · Portofoliu DevPath RO`,
    openGraph: {
      images: [`/api/og/portfolio?username=${params.username}`],
    },
  };
}

export default async function UserPortfolioPage({ params }: Props) {
  const supabase = createSupabaseServerClient();

  const { data: profile } = await supabase
    .from("users")
    .select("id, name, username, level, xp_points, avatar_url, created_at")
    .eq("username", params.username)
    .single();

  if (!profile) notFound();

  const [{ data: badges }, { data: completedCourses }, { data: projects }, { data: xpHistory }] =
    await Promise.all([
      supabase
        .from("user_badges")
        .select("badge_slug, earned_at, badges(name, icon)")
        .eq("user_id", profile.id),
      supabase
        .from("user_progress")
        .select("completed_at, lessons!inner(course_id, courses!inner(title, slug))")
        .eq("user_id", profile.id)
        .eq("completed", true),
      supabase
        .from("projects")
        .select("id, title, description, github_url, completed_at")
        .eq("user_id", profile.id)
        .not("completed_at", "is", null),
      supabase
        .from("xp_events")
        .select("xp, created_at")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: true }),
    ]);

  return (
    <PortfolioPage
      profile={profile}
      badges={badges ?? []}
      completedCourses={completedCourses ?? []}
      projects={projects ?? []}
      xpHistory={xpHistory ?? []}
    />
  );
}
```

---

#### Username auto-generation

When a user's `username` is null and they complete onboarding, auto-generate it in `completeOnboarding` server action (in `src/app/onboarding/actions.ts`):

```typescript
// After saving onboarding data, set username if not set
async function generateUniqueUsername(name: string, supabase: SupabaseClient): Promise<string> {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 20);
  let candidate = base;
  let suffix = 1;
  while (true) {
    const { data } = await supabase.from("users").select("id").eq("username", candidate).maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${suffix++}`;
  }
}
```

---

### 5.2 — Activity Heatmap (GitHub-style)

**Zero new packages.** Pure SVG component.

**New file:**
- `src/components/portfolio/activity-heatmap.tsx`

---

#### `src/components/portfolio/activity-heatmap.tsx`

```typescript
"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface XPEvent { xp: number; created_at: string; }

interface ActivityHeatmapProps {
  xpHistory: XPEvent[];
}

// Layout: 52 columns (weeks) × 7 rows (days Mon–Sun)
// Each cell: 12×12 SVG rect with 2px gap
// Color scale:
//   0 events:    fill="#1e293b" (slate-800)
//   1 event:     fill="#166534" (green-900)
//   2-3 events:  fill="#15803d" (green-700)
//   4+ events:   fill="#22c55e" (green-500)
// Tooltip: show date + event count on hover (title element)

const CELL = 12;
const GAP = 2;
const STEP = CELL + GAP;
const WEEKS = 52;
const DAYS = 7;

export function ActivityHeatmap({ xpHistory }: ActivityHeatmapProps) {
  const heatmap = useMemo(() => {
    // Build map: "YYYY-MM-DD" → count
    const counts = new Map<string, number>();
    for (const event of xpHistory) {
      const day = event.created_at.slice(0, 10);
      counts.set(day, (counts.get(day) ?? 0) + 1);
    }

    // Build 52w × 7d grid going back from today
    const today = new Date();
    const grid: Array<{ date: string; count: number; col: number; row: number }> = [];

    for (let i = WEEKS * DAYS - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const col = Math.floor(i / DAYS);
      const row = DAYS - 1 - (i % DAYS);
      grid.push({ date: dateStr, count: counts.get(dateStr) ?? 0, col, row });
    }

    return grid;
  }, [xpHistory]);

  function getColor(count: number) {
    if (count === 0) return "#1e293b";
    if (count === 1) return "#166534";
    if (count <= 3) return "#15803d";
    return "#22c55e";
  }

  const svgWidth = WEEKS * STEP;
  const svgHeight = DAYS * STEP;

  return (
    <div className="overflow-x-auto">
      <svg width={svgWidth} height={svgHeight} className="block">
        {heatmap.map((cell) => (
          <motion.rect
            key={cell.date}
            x={cell.col * STEP}
            y={cell.row * STEP}
            width={CELL} height={CELL}
            rx={2} ry={2}
            fill={getColor(cell.count)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: cell.col * 0.003 }}
          >
            <title>{cell.date}: {cell.count} activit{cell.count === 1 ? "ate" : "ăți"}</title>
          </motion.rect>
        ))}
      </svg>
    </div>
  );
}
```

---

### 5.3 — Learning DNA Radar Chart

**Zero new packages.** Pure SVG + Framer Motion. 6 axes = 6 modules of AI Fundamentals.

**New file:**
- `src/components/portfolio/learning-dna-chart.tsx`

---

#### `src/components/portfolio/learning-dna-chart.tsx`

```typescript
"use client";

import { motion } from "framer-motion";

interface RadarAxis {
  label: string;         // module name
  score: number;         // 0–1 (% module complete × avg quiz score)
}

interface LearningDnaChartProps {
  axes: RadarAxis[];     // always 6 elements
  size?: number;         // default 240
}

// Rendering:
// Center: (size/2, size/2)
// For N=6 axes, angle = (2π/6) × i, starting from top (−π/2)
// Outer radius = size/2 - 20 (padding)
// For each axis i: point = center + score × outerRadius × (cos(angle), sin(angle))
// Draw: background spider web (5 rings at 20%, 40%, 60%, 80%, 100%)
// Draw: colored filled polygon connecting all score points
// Draw: axis lines from center to outer
// Draw: labels outside outer ring
// Animate: polygon points from all-zero to actual scores with spring transition

export function LearningDnaChart({ axes, size = 240 }: LearningDnaChartProps) {
  const center = size / 2;
  const outerR = center - 20;
  const N = axes.length;

  function getPoint(radius: number, index: number): [number, number] {
    const angle = (2 * Math.PI / N) * index - Math.PI / 2;
    return [
      center + radius * Math.cos(angle),
      center + radius * Math.sin(angle),
    ];
  }

  // Score polygon points string
  const scorePoints = axes
    .map((ax, i) => getPoint(outerR * ax.score, i).join(","))
    .join(" ");

  // Web rings
  const rings = [0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <svg width={size} height={size} className="overflow-visible">
      {/* Background rings */}
      {rings.map((r) => (
        <polygon
          key={r}
          points={Array.from({ length: N }, (_, i) => getPoint(outerR * r, i).join(",")).join(" ")}
          fill="none" stroke="#334155" strokeWidth={1}
        />
      ))}
      {/* Axis lines */}
      {axes.map((_, i) => {
        const [x, y] = getPoint(outerR, i);
        return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#334155" strokeWidth={1} />;
      })}
      {/* Score polygon */}
      <motion.polygon
        points={Array.from({ length: N }, (_, i) => getPoint(0, i).join(",")).join(" ")}
        fill="#6366f180" stroke="#6366f1" strokeWidth={2}
        animate={{ points: scorePoints }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
      />
      {/* Labels */}
      {axes.map((ax, i) => {
        const [x, y] = getPoint(outerR + 18, i);
        return (
          <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
            fontSize={10} fill="#94a3b8"
          >
            {ax.label}
          </text>
        );
      })}
    </svg>
  );
}
```

**Score computation** (in `src/lib/portfolio.ts`):
```typescript
// For each of the 6 modules:
// completionScore = completedLessons / totalLessons in module
// quizScore = avg(quiz scores for this module) or 0 if no quizzes
// finalScore = completionScore * 0.6 + quizScore * 0.4  (normalize to 0–1)
```

---

### 5.4 — Course Completion Certificate

**New packages required:** `@react-pdf/renderer@^4.1.6` + `qrcode@^1.5.4` — **ask user for approval before installing.**

**New files:**
- `src/app/api/certificates/[courseId]/route.ts` — Node.js route (NOT edge), generates PDF
- `src/app/verify/[code]/page.tsx` — public RSC verification page
- `src/components/certificate/certificate-template.tsx` — `@react-pdf/renderer` JSX
- `src/lib/certificate.ts` — `generateCertificateCode()` helper

**Modified files:**
- `src/app/(dashboard)/courses/actions.ts` — `generateCertificate` server action (called on course complete)

---

#### `src/lib/certificate.ts`

```typescript
import { createSupabaseServerClient } from "@/lib/supabase/server";

export function generateCertificateCode(): string {
  // 12-char alphanumeric, URL-safe
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function getOrCreateCertificate(userId: string, courseId: string) {
  const supabase = createSupabaseServerClient();

  const { data: existing } = await supabase
    .from("course_certificates")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (existing) return existing;

  let code = generateCertificateCode();
  // Ensure uniqueness (collision extremely unlikely but check anyway)
  while (true) {
    const { data: collision } = await supabase
      .from("course_certificates")
      .select("id")
      .eq("unique_code", code)
      .maybeSingle();
    if (!collision) break;
    code = generateCertificateCode();
  }

  const { data } = await supabase
    .from("course_certificates")
    .insert({ user_id: userId, course_id: courseId, unique_code: code })
    .select()
    .single();

  return data;
}
```

---

#### `src/app/api/certificates/[courseId]/route.ts`

```typescript
// NOTE: No "export const runtime = 'edge'" — @react-pdf/renderer requires Node.js
import { z } from "zod";
import QRCode from "qrcode";
import { renderToBuffer } from "@react-pdf/renderer";
import { CertificateTemplate } from "@/components/certificate/certificate-template";
import { getOrCreateCertificate } from "@/lib/certificate";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const paramsSchema = z.object({ courseId: z.string().uuid() });

export async function GET(
  _req: Request,
  { params }: { params: { courseId: string } }
) {
  const parsed = paramsSchema.safeParse(params);
  if (!parsed.success) return new Response("Invalid", { status: 400 });

  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  // Verify course completion
  const { data: course } = await supabase
    .from("courses")
    .select("id, title")
    .eq("id", parsed.data.courseId)
    .single();
  if (!course) return new Response("Not found", { status: 404 });

  const { data: profile } = await supabase
    .from("users")
    .select("name")
    .eq("id", user.id)
    .single();

  const cert = await getOrCreateCertificate(user.id, course.id);
  if (!cert) return new Response("Error", { status: 500 });

  const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/verify/${cert.unique_code}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 80, margin: 1 });

  const pdfBuffer = await renderToBuffer(
    CertificateTemplate({
      userName: profile?.name ?? "Utilizator DevPath",
      courseName: course.title,
      certCode: cert.unique_code,
      generatedAt: new Date(cert.generated_at).toLocaleDateString("ro-RO"),
      qrDataUrl,
    })
  );

  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificat-devpath-${cert.unique_code}.pdf"`,
    },
  });
}
```

---

#### `src/components/certificate/certificate-template.tsx`

```typescript
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";

interface CertificateTemplateProps {
  userName: string;
  courseName: string;
  certCode: string;
  generatedAt: string;
  qrDataUrl: string;
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#0f172a", padding: 60, fontFamily: "Helvetica" },
  border: { borderWidth: 3, borderColor: "#6366f1", borderRadius: 8, padding: 40 },
  title: { fontSize: 11, color: "#94a3b8", letterSpacing: 4, textTransform: "uppercase", marginBottom: 20 },
  name: { fontSize: 36, color: "#f8fafc", fontFamily: "Helvetica-Bold", marginBottom: 12 },
  course: { fontSize: 16, color: "#a5b4fc", marginBottom: 40 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 40 },
  code: { fontSize: 10, color: "#475569" },
  date: { fontSize: 10, color: "#475569" },
});

export function CertificateTemplate({
  userName, courseName, certCode, generatedAt, qrDataUrl
}: CertificateTemplateProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.border}>
          <Text style={styles.title}>Certificat de Absolvire · DevPath RO</Text>
          <Text style={styles.name}>{userName}</Text>
          <Text style={styles.course}>a absolvit cu succes cursul: {courseName}</Text>
          <View style={styles.footer}>
            <View>
              <Text style={styles.date}>{generatedAt}</Text>
              <Text style={styles.code}>ID: {certCode}</Text>
            </View>
            <Image src={qrDataUrl} style={{ width: 80, height: 80 }} />
          </View>
        </View>
      </Page>
    </Document>
  );
}
```

---

#### `src/app/verify/[code]/page.tsx`

```typescript
// Public RSC page — no auth required
export default async function VerifyCertificatePage({ params }: { params: { code: string } }) {
  const supabase = createSupabaseServerClient();

  const { data: cert } = await supabase
    .from("course_certificates")
    .select("*, users(name), courses(title)")
    .eq("unique_code", params.code)
    .single();

  if (!cert) return <div>Certificat invalid sau inexistent.</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="max-w-md text-center space-y-4">
        <div className="text-4xl">✅</div>
        <h1 className="text-2xl font-bold">Certificat valid</h1>
        <p className="text-muted-foreground">
          <strong>{(cert as any).users?.name}</strong> a absolvit cursul{" "}
          <strong>{(cert as any).courses?.title}</strong>
        </p>
        <p className="text-sm text-muted-foreground">
          Emis pe {new Date(cert.generated_at).toLocaleDateString("ro-RO")}
        </p>
        <p className="text-xs text-muted-foreground font-mono">ID: {cert.unique_code}</p>
      </div>
    </div>
  );
}
```

---

### 5.5 — Project Submission Flow

**Zero new packages, zero new DB tables.** Uses existing `projects` table.

**New files:**
- `src/components/course/project-submission-form.tsx` — client form component

**Modified files:**
- `src/app/(dashboard)/courses/[courseSlug]/[lessonId]/page.tsx` — show form for `type='project'` lessons
- `src/app/(dashboard)/courses/actions.ts` — `submitProject` server action

---

#### `src/app/(dashboard)/courses/actions.ts` — `submitProject`

```typescript
export async function submitProject(input: {
  courseId: string;
  title: string;
  description: string;
  githubUrl: string | null;
}) {
  "use server";
  const schema = z.object({
    courseId: z.string().uuid(),
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(1000),
    githubUrl: z.string().url().nullable(),
  });
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid input");

  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: project } = await supabase
    .from("projects")
    .upsert({
      user_id: user.id,
      course_id: parsed.data.courseId,
      title: parsed.data.title,
      description: parsed.data.description,
      github_url: parsed.data.githubUrl,
      completed_at: new Date().toISOString(),
    }, { onConflict: "user_id,course_id" })
    .select()
    .single();

  if (!project) throw new Error("Insert failed");

  await checkAndAwardBadges(user.id, { event: "project_submit" });

  return { success: true, projectId: project.id };
}
```

---

### 5.6 — Lesson Comments

**New files:**
- `src/components/course/lesson-comments.tsx` — client component (threaded + upvotes)
- `src/app/(dashboard)/courses/actions.ts` — `postComment`, `toggleUpvote` server actions

**Modified files:**
- `src/app/(dashboard)/courses/[courseSlug]/[lessonId]/page.tsx` — render `<LessonComments>` (Level 3+ only, check `users.level >= 3`)

---

#### `src/app/(dashboard)/courses/actions.ts` — comments

```typescript
export async function postComment(input: {
  lessonId: string;
  content: string;
  parentId: string | null;
}) {
  "use server";
  const schema = z.object({
    lessonId: z.string().uuid(),
    content: z.string().min(1).max(2000),
    parentId: z.string().uuid().nullable(),
  });
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Invalid" };

  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Level gate: must be Level 3+ (from devpath-vision.md Level 3 unlock)
  const { data: profile } = await supabase
    .from("users")
    .select("level")
    .eq("id", user.id)
    .single();

  if (!profile || profile.level < 3) {
    return { error: "Nivel insuficient. Atinge Nivelul 3 pentru a posta comentarii." };
  }

  const { data: comment } = await supabase
    .from("lesson_comments")
    .insert({
      lesson_id: parsed.data.lessonId,
      user_id: user.id,
      parent_id: parsed.data.parentId,
      content: parsed.data.content,
    })
    .select()
    .single();

  // Check if this is the user's first comment
  const { count } = await supabase
    .from("lesson_comments")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (count === 1) {
    await awardXP(user.id, "first_comment");
    await checkAndAwardBadges(user.id, { event: "comment_posted" });
  }

  revalidatePath(`/courses`);
  return { success: true, comment };
}

export async function toggleUpvote(commentId: string) {
  "use server";
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data } = await supabase.rpc("toggle_comment_upvote", {
    p_comment_id: commentId,
    p_user_id: user.id,
  });

  // Check if comment now has 5 upvotes → award XP to comment author
  if ((data as any)?.count >= 5 && (data as any)?.upvoted) {
    const { data: comment } = await supabase
      .from("lesson_comments")
      .select("user_id, upvote_count")
      .eq("id", commentId)
      .single();

    if (comment && comment.upvote_count === 5) {
      await awardXP(comment.user_id, "comment_upvoted");
    }
  }

  return data;
}
```

---

### 5.7 — Referral System Complete

**Referral code** is already generated on onboarding completion (Phase 2). This section wires up the `/join` route.

**New files:**
- `src/app/join/page.tsx` — RSC page, handles `?ref=CODE` parameter
- `src/app/(dashboard)/profile/page.tsx` — show user's referral code + share link

**Modified files:**
- `src/app/(auth)/actions.ts` — `signUp` reads `ref` cookie after registration

---

#### `src/app/join/page.tsx`

```typescript
// Public RSC page — sets ref cookie, then redirects to /register
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function JoinPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  if (searchParams.ref) {
    cookies().set("devpath_ref", searchParams.ref, {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  }
  redirect("/register");
}
```

---

#### `src/app/(auth)/actions.ts` — referral on signup

After user successfully registers, in `signUp` action:

```typescript
// After Supabase auth signup succeeds:
const refCookie = cookies().get("devpath_ref");
if (refCookie?.value) {
  // Find referrer by code
  const { data: referrer } = await supabase
    .from("users")
    .select("id")
    .eq("referral_code", refCookie.value)
    .maybeSingle();

  if (referrer && referrer.id !== newUser.id) {
    // Record referral event
    await supabase.from("referral_events").insert({
      referrer_id: referrer.id,
      referred_id: newUser.id,
    });

    // Update referred_by on new user
    await supabase.from("users").update({ referred_by: referrer.id }).eq("id", newUser.id);

    // Award XP to both users
    await awardXP(referrer.id, "referral_bonus");
    await awardXP(newUser.id, "referral_bonus");

    // Check ambasador / recrutorul badges for referrer
    const { count } = await supabase
      .from("referral_events")
      .select("id", { count: "exact", head: true })
      .eq("referrer_id", referrer.id);

    await checkAndAwardBadges(referrer.id, {
      event: "referral_complete",
      referralCount: count ?? 1,
    });
  }

  // Clear the cookie
  cookies().delete("devpath_ref");
}
```

---

### 5.8 — LinkedIn/Social Share Button (triggers `vitrina_deschisa` badge)

**Zero new packages.** Web Share API (native browser) with LinkedIn URL fallback.

**New file:**
- `src/components/portfolio/share-button.tsx` — client component

**New server action** (in `courses/actions.ts` or a new `portfolio/actions.ts`):
```typescript
export async function trackPortfolioShare() {
  "use server";
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await checkAndAwardBadges(user.id, { event: "portfolio_share" });
}
```

---

#### `src/components/portfolio/share-button.tsx`

```typescript
"use client";

import { trackPortfolioShare } from "@/app/(dashboard)/courses/actions";

interface ShareButtonProps {
  username: string;
  userName: string;
}

export function ShareButton({ username, userName }: ShareButtonProps) {
  const shareUrl = `${window.location.origin}/u/${username}`;
  const shareText = `Am absolvit cursul AI Fundamentals pe DevPath RO! Urmărește progresul meu: ${shareUrl}`;

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "DevPath RO", text: shareText, url: shareUrl });
      } catch {
        // User cancelled — do nothing
        return;
      }
    } else {
      // Fallback: LinkedIn share URL
      const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`;
      window.open(linkedInUrl, "_blank", "noopener,noreferrer");
    }
    await trackPortfolioShare(); // triggers vitrina_deschisa badge
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
    >
      <span>🌟</span>
      Distribuie profilul
    </button>
  );
}
```

---

## COMPLETE CHECKLIST

### Phase 4 — Interactive Learning

**DB Migrations**
- [ ] P4.0.1 — Run `minigame_sessions` table migration + RLS
- [ ] P4.0.2 — Run `flashcards` table migration + RLS
- [ ] P4.0.3 — Run `user_flashcard_progress` table migration (if not exists) + RLS
- [ ] P4.0.4 — Add `search_vector` tsvector column + GIN index to `lessons`
- [ ] P4.0.5 — Add `search_vector` tsvector column + GIN index to `courses`
- [ ] P4.0.6 — Verify `module_index` column exists on `lessons` (needed for `primul_modul` badge) — add via ALTER if missing

**4.1 Mini-Games**
- [ ] P4.1.1 — Add `MinigameType` + `MINIGAME_MAP` to `courses/actions.ts`
- [ ] P4.1.2 — Extend `MarkCompleteResult` with `minigameReady`, `gameType`, `triggerLessonIndex`
- [ ] P4.1.3 — Add `recordMinigameSession` server action to `courses/actions.ts`
- [ ] P4.1.4 — Add `minigame_complete` XP event handling in `awardXP` (gamification.ts)
- [ ] P4.1.5 — Create `src/components/minigame/minigame-modal.tsx`
- [ ] P4.1.6 — Create `src/components/minigame/game-sort-concepts.tsx` (framer-motion drag)
- [ ] P4.1.7 — Create `src/components/minigame/game-fill-blank.tsx` (draggable chips)
- [ ] P4.1.8 — Create `src/components/minigame/game-match-pairs.tsx` (click-to-match)
- [ ] P4.1.9 — Create `src/components/minigame/game-true-false.tsx` (swipe + timer)
- [ ] P4.1.10 — Create `src/components/minigame/game-build-network.tsx` (SVG drag nodes)
- [ ] P4.1.11 — Create `src/components/minigame/game-write-prompt.tsx` (AI scoring)
- [ ] P4.1.12 — Create `src/components/minigame/minigame-result-screen.tsx` (Pixel + XP)
- [ ] P4.1.13 — Wire `minigameReady: true` in `lesson-page-client.tsx` → open modal
- [ ] P4.1.14 — Seed `minigame_sessions` fixture data in `seed.sql` for testing

**4.2 Flashcard Spaced Repetition**
- [ ] P4.2.1 — Create `src/lib/flashcard-sm2.ts` (pure SM-2 algorithm)
- [ ] P4.2.2 — Create `src/app/api/flashcards/due/route.ts` (GET due cards)
- [ ] P4.2.3 — Create `src/app/api/flashcards/review/route.ts` (POST SM-2 update)
- [ ] P4.2.4 — Update `src/components/course/flashcard-deck.tsx` to use SM-2 API
- [ ] P4.2.5 — Add due card count badge to flashcard deck button in lesson page
- [ ] P4.2.6 — Seed `flashcards` table with cards for AI Fundamentals course lessons

**4.3 Adaptive AI Quiz (F2)**
- [ ] P4.3.1 — Verify `quiz_wrong_answers` and `ai_generated_questions` tables exist + RLS
- [ ] P4.3.2 — Create `src/app/api/ai/generate-quiz/route.ts` (edge, generateObject + Zod)
- [ ] P4.3.3 — Add `recordQuizWrongAnswers` server action to `courses/actions.ts`
- [ ] P4.3.4 — Modify `quiz-block.tsx` to call `recordQuizWrongAnswers` after submit
- [ ] P4.3.5 — Create `src/components/course/adaptive-quiz-section.tsx`
- [ ] P4.3.6 — Render `<AdaptiveQuizSection>` in `[lessonId]/page.tsx` when wrong answers exist

**4.4 Neural Network Visualiser (F3)**
- [ ] P4.4.1 — Create `src/components/course/neural-network-visualiser.tsx`
- [ ] P4.4.2 — Add `language-neural-network-viz` handler in `lesson-content.tsx`
- [ ] P4.4.3 — Add example neural-network-viz block to one lesson in `content/` to test

**4.5 In-Browser Python Execution (F1)**
- [ ] P4.5.1 — Install `pyodide@0.27.0` (**get user approval first**)
- [ ] P4.5.2 — Create `src/hooks/use-pyodide.ts` (CDN load + Piston fallback)
- [ ] P4.5.3 — Add `code_executed` event to `BadgeTrigger` in `src/lib/gamification.ts`
- [ ] P4.5.4 — Add `code_executed` case to `checkAndAwardBadges` in `src/lib/gamification.ts`
- [ ] P4.5.5 — Add `recordFirstCodeRun` server action to `courses/actions.ts`
- [ ] P4.5.6 — Modify `code-editor.tsx`: add Run button + output panel + first-run badge trigger
- [ ] P4.5.7 — Test Pyodide load + numpy import + Piston fallback in dev environment

**4.6 Global Search Cmd+K**
- [ ] P4.6.1 — Create `src/components/search/command-palette.tsx`
- [ ] P4.6.2 — Add `<CommandPalette>` to `navbar.tsx` + Cmd+K keyboard listener
- [ ] P4.6.3 — Test full-text search returns correct results for Romanian queries

**4.7 Focus Mode**
- [ ] P4.7.1 — Create `src/hooks/use-focus-mode.ts` + `src/components/layout/focus-mode-provider.tsx`
- [ ] P4.7.2 — Wrap `(dashboard)/layout.tsx` children with `<FocusModeProvider>`
- [ ] P4.7.3 — Add `useFocusMode()` check to `navbar.tsx` and `sidebar.tsx`
- [ ] P4.7.4 — Add `F` key listener + focus mode toggle button in `lesson-page-client.tsx`

---

### Phase 5 — Social & Portfolio

**DB Migrations**
- [ ] P5.0.1 — Add `username text UNIQUE` column to `users` + index
- [ ] P5.0.2 — Run `lesson_comments` table migration + RLS
- [ ] P5.0.3 — Run `comment_upvotes` table migration + RLS
- [ ] P5.0.4 — Create `toggle_comment_upvote` Postgres RPC
- [ ] P5.0.5 — Run `course_certificates` table migration + RLS

**5.1 Public Portfolio**
- [ ] P5.1.1 — Create `src/lib/portfolio.ts` with `getPortfolioData()` + axis score computation
- [ ] P5.1.2 — Add `generateUniqueUsername()` to `src/app/onboarding/actions.ts`
- [ ] P5.1.3 — Create `src/app/u/[username]/page.tsx` (RSC, no auth)
- [ ] P5.1.4 — Create `src/components/portfolio/portfolio-page.tsx`
- [ ] P5.1.5 — Add OG image meta tag pointing to `/api/og/portfolio?username=...`

**5.2 Activity Heatmap**
- [ ] P5.2.1 — Create `src/components/portfolio/activity-heatmap.tsx`
- [ ] P5.2.2 — Integrate into `portfolio-page.tsx`

**5.3 Learning DNA Radar Chart**
- [ ] P5.3.1 — Create `src/components/portfolio/learning-dna-chart.tsx`
- [ ] P5.3.2 — Compute 6-axis scores in `getPortfolioData()` in `portfolio.ts`
- [ ] P5.3.3 — Integrate into `portfolio-page.tsx`

**5.4 Course Completion Certificate**
- [ ] P5.4.1 — Get user approval for `@react-pdf/renderer` + `qrcode` packages
- [ ] P5.4.2 — Install `@react-pdf/renderer@^4.1.6` + `qrcode@^1.5.4`
- [ ] P5.4.3 — Create `src/lib/certificate.ts` (code generation + upsert)
- [ ] P5.4.4 — Create `src/components/certificate/certificate-template.tsx` (@react-pdf/renderer JSX)
- [ ] P5.4.5 — Create `src/app/api/certificates/[courseId]/route.ts` (Node.js, NOT edge)
- [ ] P5.4.6 — Create `src/app/verify/[code]/page.tsx` (public RSC)
- [ ] P5.4.7 — Add "Descarcă certificat" button in dashboard after course complete
- [ ] P5.4.8 — Add Pixel graduation cap moment (mascot moment #7 from devpath-vision.md) in certificate download flow

**5.5 Project Submission**
- [ ] P5.5.1 — Create `src/components/course/project-submission-form.tsx`
- [ ] P5.5.2 — Add `submitProject` server action to `courses/actions.ts`
- [ ] P5.5.3 — Render `<ProjectSubmissionForm>` in `[lessonId]/page.tsx` when `lesson.type === 'project'`
- [ ] P5.5.4 — Verify `constructor` badge fires after first project submit

**5.6 Lesson Comments**
- [ ] P5.6.1 — Create `src/components/course/lesson-comments.tsx` (threaded + upvotes)
- [ ] P5.6.2 — Add `postComment` server action to `courses/actions.ts`
- [ ] P5.6.3 — Add `toggleUpvote` server action to `courses/actions.ts`
- [ ] P5.6.4 — Render `<LessonComments>` in `[lessonId]/page.tsx` (Level 3+ gate)
- [ ] P5.6.5 — Show level gate message for Level 1-2 users instead of comment box
- [ ] P5.6.6 — Verify `vocea_comunitatii` badge fires on first comment
- [ ] P5.6.7 — Verify `comment_upvoted` XP fires when comment reaches 5 upvotes

**5.7 Referral System**
- [ ] P5.7.1 — Create `src/app/join/page.tsx` (sets ref cookie, redirects to /register)
- [ ] P5.7.2 — Modify `signUp` in `src/app/(auth)/actions.ts` to process referral cookie
- [ ] P5.7.3 — Verify `referral_events` insert + both users get 40 XP
- [ ] P5.7.4 — Verify `ambasador` badge fires on 1st referral, `recrutorul` on 3rd
- [ ] P5.7.5 — Create `src/app/(dashboard)/profile/page.tsx` with referral code + share link display

**5.8 Social Share Button**
- [ ] P5.8.1 — Create `src/components/portfolio/share-button.tsx`
- [ ] P5.8.2 — Add `trackPortfolioShare` server action
- [ ] P5.8.3 — Render `<ShareButton>` on portfolio page (own profile view only)
- [ ] P5.8.4 — Verify `vitrina_deschisa` badge fires after share action
