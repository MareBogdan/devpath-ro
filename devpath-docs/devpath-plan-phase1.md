  # DevPath RO — Phase 1: Dual-Mode Content Architecture
**Status:** Not started
**Effort:** 1-2 weeks
**Depends on:** Phase 0 fully complete (next-intl removed, auth guards added, streak fixed)
**References:** devpath-vision.md (Simple/Technical mode rules, mascot system, design principles)

---

## WHY PHASE 1 EXISTS

80% of DevPath RO's target audience — doctors, entrepreneurs, non-CS students, curious people — will abandon the platform the moment they encounter a Python code block, because code signals "this is not for me." The current lessons 1–14 contain multiple code snippets in every theory lesson, meaning the platform is silently alienating the majority it was built for. The dual-mode architecture — where every lesson exists in both a Simple (analogy-first, zero code) and Technical (full Python, precise terminology) version — is the core product decision that makes DevPath RO fundamentally different from Coursera, Udemy, and every other Romanian IT learning platform, none of which have ever attempted audience-aware content switching. Beyond the mode system, 53% of course content (lessons 15–30) consists entirely of placeholder stubs reading "Conținut în curs de pregătire," meaning users who complete the first half of the course hit a wall of empty pages — a trust-destroying experience that makes the platform look unfinished. Phase 1 is not a nice-to-have: it is the moment the product becomes what it was designed to be.

---

## PHASE 1 OVERVIEW

**What gets built:**
- DB already has `content_simple_md` column added in Phase 0 — no schema change needed for content
- 3 new DB tables: `lesson_gate_questions`, `lesson_bookmarks`, `lesson_feedback`
- 1 new column: `users.learning_mode` (if not added in Phase 0)
- 10 component changes: lesson-content.tsx updated, 7 new components created, lesson page + sync-action updated
- 14 existing lessons get Simple Mode MDX files written (`lesson-XX-slug-simple.mdx`)
- 16 new lessons written in both modes (lessons 15–30, currently stubs)
- Gate questions written for all 30 theory lessons (INSERT SQL provided)
- Flashcard terms defined for all lessons

**File count:**
- 14 simple mode MDX files for existing lessons
- 16 technical MDX files replacing stubs (lessons 15–30)
- 16 simple MDX files for new lessons
- Total new MDX files: 46

---

## 1.1 — Lesson Delivery System Updates

### Task 1.1.1 — Update lesson-content.tsx for dual mode

**Current state:** Client component (`"use client"`) that accepts a single `content: string` prop and renders it via ReactMarkdown. It intercepts `language-python-editor` code blocks to render the Monaco CodeEditor component. It has custom renderers for `<pre>`, `<code>`, `<table>`, and `<blockquote>`.

**What changes:**
- Accept `learningMode: 'simple' | 'technical'` prop (new)
- Accept `contentSimpleMd: string | null` prop (new)
- Rendering logic: if `learningMode === 'simple'` AND `contentSimpleMd !== null` → render `contentSimpleMd`
- If `learningMode === 'simple'` AND `contentSimpleMd === null` → render `content` (the technical MD) with a yellow notice banner at the top
- If `learningMode === 'technical'` → render `content` as before (existing behavior)
- The `python-editor` interceptor only activates when `learningMode === 'technical'`; in Simple Mode, python-editor blocks render as a greyed-out placeholder with text "Conținut interactiv disponibil în Modul Tehnic"

**File:** `src/components/course/lesson-content.tsx`

```typescript
"use client";

import dynamic from "next/dynamic";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { AlertTriangle } from "lucide-react";

const CodeEditor = dynamic(
  () => import("@/components/course/code-editor").then((m) => m.CodeEditor),
  {
    ssr: false,
    loading: () => (
      <div className="my-6 rounded-xl border border-border bg-[#1e1e1e] h-[420px] flex items-center justify-center">
        <span className="text-sm text-muted-foreground font-mono animate-pulse">
          Se încarcă editorul...
        </span>
      </div>
    ),
  }
);

interface LessonContentProps {
  content: string;
  contentSimpleMd?: string | null;
  learningMode?: "simple" | "technical";
}

export function LessonContent({
  content,
  contentSimpleMd,
  learningMode = "technical",
}: LessonContentProps) {
  const isSimple = learningMode === "simple";
  const activeContent =
    isSimple && contentSimpleMd ? contentSimpleMd : content;
  const showFallbackBanner = isSimple && !contentSimpleMd;

  return (
    <div id="lesson-content">
      {showFallbackBanner && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-900/40 dark:bg-yellow-950/20 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            Versiunea simplificată a acestei lecții este în curs de pregătire.
            Afișăm varianta completă momentan.
          </p>
        </div>
      )}
      <div
        className="animate-in fade-in duration-300 prose prose-slate dark:prose-invert max-w-none
          prose-headings:font-bold prose-headings:tracking-tight
          prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
          prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
          prose-p:leading-relaxed prose-p:text-foreground/90
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-strong:text-foreground prose-strong:font-semibold
          prose-blockquote:border-l-primary prose-blockquote:bg-muted/50
          prose-blockquote:py-1 prose-blockquote:rounded-r-md
          prose-code:before:content-none prose-code:after:content-none
          prose-code:bg-muted prose-code:text-foreground prose-code:px-1.5
          prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
          prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-border
          prose-pre:rounded-xl prose-pre:p-0 prose-pre:overflow-hidden
          prose-table:border-collapse
          prose-th:bg-muted prose-th:text-foreground
          prose-td:border-border prose-th:border-border
          prose-li:text-foreground/90 prose-li:marker:text-primary"
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            pre: ({ children, ...props }) => {
              const hasEditor = React.Children.toArray(children).some(
                (child) =>
                  React.isValidElement(child) &&
                  (child.props as { className?: string }).className?.includes(
                    "language-python-editor"
                  )
              );
              if (hasEditor) return <>{children}</>;
              return (
                <pre
                  {...props}
                  className="overflow-x-auto text-sm leading-relaxed p-5"
                >
                  {children}
                </pre>
              );
            },
            code: ({ className, children, ...props }) => {
              if (className?.includes("language-python-editor")) {
                if (!isSimple) {
                  return (
                    <CodeEditor
                      defaultValue={String(children).trimEnd()}
                      language="python"
                    />
                  );
                }
                // Simple Mode: show placeholder instead of interactive editor
                return (
                  <div className="my-6 rounded-xl border border-border bg-muted/30 p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      ⚙️ Exercițiul de cod este disponibil în{" "}
                      <strong>Modul Tehnic</strong>. Activează-l din butonul de
                      sus-dreapta.
                    </p>
                  </div>
                );
              }
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            table: ({ children, ...props }) => (
              <div className="overflow-x-auto my-6">
                <table {...props} className="min-w-full">
                  {children}
                </table>
              </div>
            ),
            blockquote: ({ children, ...props }) => (
              <blockquote
                {...props}
                className="border-l-4 border-primary pl-4 pr-4 py-2 my-4 bg-muted/50 rounded-r-md italic text-muted-foreground"
              >
                {children}
              </blockquote>
            ),
          }}
        >
          {activeContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}
```

---

### Task 1.1.2 — Create mode-toggle.tsx

**File:** `src/components/course/mode-toggle.tsx`

**What it does:** Toggle button showing current mode. Sticky positioned in the lesson header area. On click, calls the `updateLearningMode` server action then refreshes the page. Disabled with tooltip when `contentSimpleMd` is null and user tries to switch to Simple.

**Server action to add in `src/app/(dashboard)/courses/actions.ts`:**
```typescript
export async function updateLearningMode(
  mode: "simple" | "technical"
): Promise<{ error?: string }> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("users")
    .update({ learning_mode: mode })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/courses", "layout");
  return {};
}
```

**Component:**
```typescript
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { updateLearningMode } from "@/app/(dashboard)/courses/actions";

interface ModeToggleProps {
  currentMode: "simple" | "technical";
  hasSimpleContent: boolean;
}

export function ModeToggle({ currentMode, hasSimpleContent }: ModeToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const newMode = currentMode === "simple" ? "technical" : "simple";
    if (newMode === "simple" && !hasSimpleContent) return;

    startTransition(async () => {
      await updateLearningMode(newMode);
      router.refresh();
    });
  }

  const isSimple = currentMode === "simple";
  const canSwitchToSimple = hasSimpleContent;
  const wouldSwitchToSimple = currentMode === "technical";
  const isDisabled =
    isPending || (wouldSwitchToSimple && !canSwitchToSimple);

  return (
    <div className="relative group">
      <motion.button
        onClick={handleToggle}
        disabled={isDisabled}
        whileHover={isDisabled ? {} : { scale: 1.02 }}
        whileTap={isDisabled ? {} : { scale: 0.97 }}
        className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition
          ${
            isSimple
              ? "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300"
              : "bg-indigo-50 border-indigo-200 text-indigo-800 dark:bg-indigo-950/30 dark:border-indigo-800 dark:text-indigo-300"
          }
          disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span>{isSimple ? "🥔" : "⚙️"}</span>
        <span>{isSimple ? "Mod Simplu" : "Mod Tehnic"}</span>
      </motion.button>

      {/* Tooltip */}
      <div className="absolute right-0 top-full mt-1.5 w-52 text-xs bg-popover border border-border rounded-lg shadow-lg px-3 py-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
        {isDisabled && wouldSwitchToSimple
          ? "Varianta simplificată pentru această lecție este în pregătire."
          : "Schimbă modul de afișare al lecțiilor. Se aplică pe tot cursul."}
      </div>
    </div>
  );
}
```

---

### Task 1.1.3 — Create reading-progress.tsx

**File:** `src/components/course/reading-progress.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export function useReadingProgress() {
  const [progress, setProgress] = useState(0);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement;
      const total = scrollHeight - clientHeight;
      if (total <= 0) {
        setProgress(100);
        setHasReachedEnd(true);
        return;
      }
      const current = (scrollTop / total) * 100;
      const rounded = Math.min(100, Math.round(current));
      setProgress(rounded);
      if (current >= 90) {
        setHasReachedEnd(true); // never resets to false
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // check on mount in case content is short
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { progress, hasReachedEnd };
}

interface ReadingProgressBarProps {
  accentColor?: string; // tailwind color value e.g. "#6366f1"
}

export function ReadingProgressBar({
  accentColor = "#6366f1",
}: ReadingProgressBarProps) {
  const { progress } = useReadingProgress();
  const springProgress = useSpring(progress, { stiffness: 200, damping: 30 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[100] h-[3px] origin-left"
      style={{
        scaleX: springProgress.get() / 100,
        backgroundColor: accentColor,
        transformOrigin: "0% 50%",
      }}
    />
  );
}
```

**Usage note:** `ReadingProgressBar` renders at the very top of the lesson page (outside sticky header). `useReadingProgress` is imported in the lesson page's client wrapper to gate the CompleteButton and LessonGate.

---

### Task 1.1.4 — Create lesson-gate.tsx

**File:** `src/components/course/lesson-gate.tsx`

```typescript
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { awardGateXP } from "@/app/(dashboard)/courses/actions";

interface GateQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

interface LessonGateProps {
  questions: GateQuestion[];
  lessonId: string;
  visible: boolean; // pass hasReachedEnd from useReadingProgress
  onAllCorrect: () => void;
}

export function LessonGate({
  questions,
  lessonId,
  visible,
  onAllCorrect,
}: LessonGateProps) {
  const [answers, setAnswers] = useState<Record<string, number | null>>(
    Object.fromEntries(questions.map((q) => [q.id, null]))
  );
  const [shaking, setShaking] = useState<string | null>(null);
  const [xpAwarded, setXpAwarded] = useState<Record<string, boolean>>({});

  if (questions.length === 0) {
    // No gate questions — parent should call onAllCorrect immediately
    return null;
  }

  function handleAnswer(questionId: string, optionIndex: number) {
    const question = questions.find((q) => q.id === questionId)!;
    if (answers[questionId] === question.correct_answer) return; // already correct

    if (optionIndex === question.correct_answer) {
      setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
      // Award XP on first correct attempt if not already awarded
      if (!xpAwarded[questionId]) {
        setXpAwarded((prev) => ({ ...prev, [questionId]: true }));
        awardGateXP(questionId, lessonId).catch(() => {});
      }
      // Check if all correct
      const newAnswers = { ...answers, [questionId]: optionIndex };
      const allCorrect = questions.every(
        (q) => newAnswers[q.id] === q.correct_answer
      );
      if (allCorrect) {
        setTimeout(onAllCorrect, 600);
      }
    } else {
      // Wrong answer: shake + show mascot message
      setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
      setShaking(questionId);
      setTimeout(() => setShaking(null), 600);
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="mt-10 mb-4 rounded-xl border border-primary/20 bg-primary/5 p-6"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <span>🧠</span> Verifică ce ai reținut
          </h3>

          <div className="space-y-6">
            {questions.map((q) => {
              const selected = answers[q.id];
              const isCorrect = selected === q.correct_answer;
              const isWrong =
                selected !== null && selected !== q.correct_answer;

              return (
                <motion.div
                  key={q.id}
                  animate={
                    shaking === q.id
                      ? { x: [-6, 6, -5, 5, -3, 3, 0] }
                      : { x: 0 }
                  }
                  transition={{ duration: 0.4 }}
                >
                  <p className="text-sm font-medium text-foreground mb-3">
                    {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((option, idx) => {
                      const isSelected = selected === idx;
                      const isThisCorrect = idx === q.correct_answer;
                      let buttonClass =
                        "w-full text-left text-sm px-4 py-2.5 rounded-lg border transition cursor-pointer ";
                      if (isCorrect && isThisCorrect) {
                        buttonClass +=
                          "border-green-400 bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-300 dark:border-green-700";
                      } else if (isWrong && isSelected) {
                        buttonClass +=
                          "border-red-400 bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300 dark:border-red-700";
                      } else {
                        buttonClass +=
                          "border-border bg-background hover:bg-muted/50 text-foreground";
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleAnswer(q.id, idx)}
                          disabled={isCorrect}
                          className={buttonClass}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>

                  {isWrong && (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5"
                    >
                      <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                      Hai, că merge! Mai o dată — citește din nou paragraful
                      relevant.
                    </motion.p>
                  )}

                  {isCorrect && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 space-y-1"
                    >
                      <p className="text-xs text-green-700 dark:text-green-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        Corect! +5 XP
                      </p>
                      <p className="text-xs text-muted-foreground pl-5">
                        {q.explanation}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

**Server action to add in actions.ts:**
```typescript
export async function awardGateXP(
  questionId: string,
  lessonId: string
): Promise<void> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Award 5 XP — upsert to avoid double-awarding
  // Using user_progress score field to track gate XP (add 5 to existing score)
  const { data: progress } = await supabase
    .from("user_progress")
    .select("score")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .single();

  const currentScore = progress?.score ?? 0;
  await supabase.from("user_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      score: currentScore + 5,
    },
    { onConflict: "user_id,lesson_id" }
  );

  // Also increment user XP
  await supabase.rpc("increment_user_xp", { user_id_param: user.id, xp_amount: 5 });
}
```

Note: `increment_user_xp` is a Postgres function — add to schema.sql:
```sql
CREATE OR REPLACE FUNCTION increment_user_xp(user_id_param uuid, xp_amount integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.users SET xp = COALESCE(xp, 0) + xp_amount WHERE id = user_id_param;
END;
$$;
```

---

### Task 1.1.5 — Update complete-button.tsx

**What changes:** Add `isReadingComplete` and `isGateComplete` props. Button disabled unless both are true. Tooltip text when disabled. Subtle pulse animation when both unlock.

```typescript
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, ArrowRight, BookOpen, Brain } from "lucide-react";
import { motion } from "framer-motion";
import { markLessonComplete } from "@/app/(dashboard)/courses/actions";
import confetti from "canvas-confetti";

interface CompleteButtonProps {
  lessonId: string;
  courseSlug: string;
  isCompleted: boolean;
  nextLessonId: string | null;
  isReadingComplete?: boolean; // defaults to true for quiz/exercise lessons
  isGateComplete?: boolean;    // defaults to true when no gate questions
}

export function CompleteButton({
  lessonId,
  courseSlug,
  isCompleted: initialCompleted,
  nextLessonId: initialNextId,
  isReadingComplete = true,
  isGateComplete = true,
}: CompleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [nextLessonId, setNextLessonId] = useState(initialNextId);

  const isUnlocked = isReadingComplete && isGateComplete;

  let tooltipText = "";
  if (!isReadingComplete) tooltipText = "Citește lecția mai întâi 📖";
  else if (!isGateComplete) tooltipText = "Răspunde la întrebările de mai jos";

  function fireConfetti() {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.7 },
      colors: ["#6366f1", "#8b5cf6", "#22c55e", "#f59e0b", "#3b82f6"],
    });
  }

  function handleComplete() {
    if (!isUnlocked) return;
    startTransition(async () => {
      const result = await markLessonComplete(lessonId, courseSlug);
      if (result.success) {
        setIsCompleted(true);
        setNextLessonId(result.nextLessonId);
        fireConfetti();
        window.dispatchEvent(
          new CustomEvent("lesson-presence:complete", { detail: { lessonId } })
        );
      }
    });
  }

  function handleNext() {
    if (nextLessonId) {
      router.push(`/courses/${courseSlug}/${nextLessonId}`);
    } else {
      router.push(`/courses/${courseSlug}`);
    }
  }

  if (isCompleted) {
    return (
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
          <CheckCircle2 className="h-5 w-5" />
          Lecție completată
        </div>
        <button
          onClick={handleNext}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-2 rounded-lg transition text-sm"
        >
          Lecția următoare
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative group">
      <motion.button
        onClick={handleComplete}
        disabled={isPending || !isUnlocked}
        animate={
          isUnlocked && !isPending
            ? { scale: [1, 1.02, 1], transition: { repeat: Infinity, repeatDelay: 3, duration: 0.6 } }
            : {}
        }
        className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-medium px-5 py-2.5 rounded-lg transition"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Se salvează...
          </>
        ) : !isReadingComplete ? (
          <>
            <BookOpen className="h-4 w-4" />
            Marchează completat
          </>
        ) : !isGateComplete ? (
          <>
            <Brain className="h-4 w-4" />
            Marchează completat
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Marchează completat
          </>
        )}
      </motion.button>

      {/* Tooltip when disabled */}
      {tooltipText && (
        <div className="absolute right-0 bottom-full mb-2 w-52 text-xs bg-popover border border-border rounded-lg shadow-lg px-3 py-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 text-center">
          {tooltipText}
        </div>
      )}
    </div>
  );
}
```

---

### Task 1.1.6 — Update lesson page to wire everything together

**File:** `src/app/(dashboard)/courses/[courseSlug]/[lessonId]/page.tsx`

Key changes from current version:
- Remove `getTranslations` from next-intl (Phase 0 removed next-intl)
- Fetch `users.learning_mode` and `users.id` from the users table
- Fetch `lesson_gate_questions` for this lesson
- Fetch `lesson_bookmarks` to know if bookmarked
- Pass `learningMode` and `contentSimpleMd` to `LessonContent`
- Render `ModeToggle` in the lesson header
- Gate questions and reading gating is handled client-side via a new `LessonPageClient` wrapper component

**Architecture decision:** The reading progress tracking and gate state must be client-side. Create a thin client wrapper `src/components/course/lesson-page-client.tsx` that holds state, wraps `LessonContent`, `LessonGate`, `ReadingProgressBar`, and `CompleteButton`. The RSC lesson page passes data to it as props.

**New file: `src/components/course/lesson-page-client.tsx`**
```typescript
"use client";

import { useState } from "react";
import { LessonContent } from "@/components/course/lesson-content";
import { LessonGate } from "@/components/course/lesson-gate";
import { CompleteButton } from "@/components/course/complete-button";
import { ReadingProgressBar, useReadingProgress } from "@/components/course/reading-progress";

interface GateQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

interface LessonPageClientProps {
  lessonId: string;
  courseSlug: string;
  isCompleted: boolean;
  nextLessonId: string | null;
  contentMd: string;
  contentSimpleMd: string | null;
  learningMode: "simple" | "technical";
  lessonType: string;
  gateQuestions: GateQuestion[];
}

export function LessonPageClient({
  lessonId,
  courseSlug,
  isCompleted,
  nextLessonId,
  contentMd,
  contentSimpleMd,
  learningMode,
  lessonType,
  gateQuestions,
}: LessonPageClientProps) {
  const { hasReachedEnd } = useReadingProgress();
  const [gateComplete, setGateComplete] = useState(
    gateQuestions.length === 0 // if no gate questions, gate is already complete
  );

  // For quiz and exercise lessons: no reading gate, no gate questions
  const isTheory = lessonType === "theory";
  const effectiveReadingComplete = isTheory ? hasReachedEnd : true;
  const effectiveGateComplete = isTheory ? gateComplete : true;

  return (
    <>
      <ReadingProgressBar />
      <LessonContent
        content={contentMd}
        contentSimpleMd={contentSimpleMd}
        learningMode={learningMode}
      />
      {isTheory && (
        <LessonGate
          questions={gateQuestions}
          lessonId={lessonId}
          visible={hasReachedEnd}
          onAllCorrect={() => setGateComplete(true)}
        />
      )}
      {/* CompleteButton is rendered in the sticky bottom bar of the parent RSC */}
      {/* We expose the state via window event — see below */}
      <input type="hidden" id="gate-reading-complete" value={String(effectiveReadingComplete)} />
      <input type="hidden" id="gate-gate-complete" value={String(effectiveGateComplete)} />
    </>
  );
}
```

**Updated lesson page (simplified — key changes shown):**

```typescript
// In page.tsx — add these queries:

// Fetch user's learning mode
const { data: userProfile } = user
  ? await supabase
      .from("users")
      .select("learning_mode")
      .eq("id", user.id)
      .single()
  : { data: null };

const learningMode: "simple" | "technical" =
  (userProfile?.learning_mode as "simple" | "technical") ?? "simple";

// Fetch gate questions for theory lessons
const { data: gateQuestions } =
  lesson.type === "theory"
    ? await supabase
        .from("lesson_gate_questions")
        .select("id, question, options, correct_answer, explanation")
        .eq("lesson_id", lessonId)
        .in("mode", [learningMode, "both"])
        .order("display_order")
    : { data: [] };

// Fetch bookmark status
const { data: bookmark } = user
  ? await supabase
      .from("lesson_bookmarks")
      .select("id")
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId)
      .single()
  : { data: null };
```

In the JSX, replace `<LessonContent content={lesson.content_md} />` with:
```tsx
<LessonPageClient
  lessonId={lessonId}
  courseSlug={courseSlug}
  isCompleted={isCompleted}
  nextLessonId={nextLesson?.id ?? null}
  contentMd={lesson.content_md}
  contentSimpleMd={lesson.content_simple_md ?? null}
  learningMode={learningMode}
  lessonType={lesson.type}
  gateQuestions={(gateQuestions ?? []) as GateQuestion[]}
/>
```

Add `ModeToggle` in the lesson header area (next to the lesson type badge):
```tsx
import { ModeToggle } from "@/components/course/mode-toggle";

// In the header div:
<ModeToggle
  currentMode={learningMode}
  hasSimpleContent={!!lesson.content_simple_md}
/>
```

Remove all `t(...)` calls from next-intl and replace with Romanian literal strings:
- `t("lessonOf")` → `"din"`
- `t("theory")` etc. → `"Teorie"`, `"Quiz"`, `"Exercițiu"`, `"Proiect"`
- `t("markComplete")` → `"Marchează completat"`
- `t("completing")` → `"Se salvează..."`
- `t("completed")` → `"Lecție completată"`
- `t("nextLesson")` → `"Lecția următoare"`
- `t("prevLesson")` → `"Lecția anterioară"`
- `t("backToCourse")` → `"Înapoi la curs"`

---

### Task 1.1.7 — Update sync-action.ts for dual-mode MDX files

**File:** `src/app/(dashboard)/courses/sync-action.ts`

Find the section that reads the MDX file and populates `content_md`. Add parallel lookup for the `-simple.mdx` variant:

```typescript
// After reading the technical MDX file (existing code):
// const technicalContent = matter(rawFile).content;

// NEW: look for simple version
const simpleSlug = mdxFile.replace(/\.mdx$/, "-simple.mdx");
const simplePath = path.join(contentDir, simpleSlug);

let simpleContent: string | null = null;
try {
  const rawSimple = fs.readFileSync(simplePath, "utf-8");
  simpleContent = matter(rawSimple).content;
} catch {
  console.warn(`[sync] No simple version found for ${mdxFile} — content_simple_md will be null`);
}

// When upserting the lesson record, include content_simple_md:
await supabase.from("lessons").upsert({
  // ...existing fields...
  content_simple_md: simpleContent,
}, { onConflict: "course_id,order_index" });
```

**Naming convention:** Simple MDX files are named exactly as the technical file but with `-simple` appended before the extension:
- Technical: `lesson-01-ce-este-ai.mdx`
- Simple: `lesson-01-ce-este-ai-simple.mdx`

---

### Task 1.1.8 — Reading time estimates

Reading time is already calculated on the lesson page (line 116-119 in the current page.tsx). Update it to use the correct WPM based on mode:

```typescript
const wpm = learningMode === "simple" ? 150 : 100;
const contentForWordCount =
  learningMode === "simple" && lesson.content_simple_md
    ? lesson.content_simple_md
    : lesson.content_md;

const readingTime =
  lesson.type === "theory"
    ? Math.max(1, Math.ceil(contentForWordCount.split(/\s+/).length / wpm))
    : lesson.type === "quiz"
    ? 5
    : 15; // exercise/project
```

---

### Task 1.1.9 — Create bookmark-button.tsx

**File:** `src/components/course/bookmark-button.tsx`

**Server action to add in actions.ts:**
```typescript
export async function toggleBookmark(
  lessonId: string
): Promise<{ bookmarked: boolean; error?: string }> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { bookmarked: false, error: "Unauthorized" };

  const { data: existing } = await supabase
    .from("lesson_bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .single();

  if (existing) {
    await supabase.from("lesson_bookmarks").delete().eq("id", existing.id);
    return { bookmarked: false };
  } else {
    await supabase
      .from("lesson_bookmarks")
      .insert({ user_id: user.id, lesson_id: lessonId });
    return { bookmarked: true };
  }
}
```

**Component:**
```typescript
"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { toggleBookmark } from "@/app/(dashboard)/courses/actions";

interface BookmarkButtonProps {
  lessonId: string;
  initialBookmarked: boolean;
}

export function BookmarkButton({ lessonId, initialBookmarked }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    // Optimistic update
    setBookmarked((prev) => !prev);
    startTransition(async () => {
      const result = await toggleBookmark(lessonId);
      if (result.error) {
        setBookmarked((prev) => !prev); // revert on error
      } else {
        setBookmarked(result.bookmarked);
      }
    });
  }

  return (
    <motion.button
      onClick={handleToggle}
      disabled={isPending}
      whileTap={{ scale: 0.85 }}
      title={bookmarked ? "Elimină din favorite" : "Adaugă la favorite"}
      className="p-1.5 rounded-md hover:bg-muted transition text-muted-foreground hover:text-foreground"
    >
      <Heart
        className={`h-4 w-4 transition-colors ${
          bookmarked ? "fill-red-500 text-red-500" : ""
        }`}
      />
    </motion.button>
  );
}
```

---

### Task 1.1.10 — Create lesson-feedback.tsx

**File:** `src/components/course/lesson-feedback.tsx`

**Server action to add in actions.ts:**
```typescript
export async function submitLessonFeedback(
  lessonId: string,
  rating: "clear" | "hard",
  timeSpentSeconds: number,
  learningMode: string
): Promise<{ error?: string }> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  await supabase.from("lesson_feedback").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      rating,
      time_spent_seconds: timeSpentSeconds,
      learning_mode: learningMode,
    },
    { onConflict: "user_id,lesson_id" }
  );

  return {};
}
```

**Component:**
```typescript
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitLessonFeedback } from "@/app/(dashboard)/courses/actions";

interface LessonFeedbackProps {
  lessonId: string;
  learningMode: string;
  show: boolean; // passed true after CompleteButton is clicked
  alreadySubmitted: boolean;
}

export function LessonFeedback({
  lessonId,
  learningMode,
  show,
  alreadySubmitted: initialSubmitted,
}: LessonFeedbackProps) {
  const [submitted, setSubmitted] = useState(initialSubmitted);
  const [showThanks, setShowThanks] = useState(false);
  const startTimeRef = useRef(Date.now());

  async function handleFeedback(rating: "clear" | "hard") {
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    await submitLessonFeedback(lessonId, rating, timeSpent, learningMode);
    setSubmitted(true);
    setShowThanks(true);
    setTimeout(() => setShowThanks(false), 3000);
  }

  if (submitted && !showThanks) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 flex items-center gap-3 flex-wrap"
        >
          {showThanks ? (
            <p className="text-sm text-muted-foreground">
              Mulțumim pentru feedback! 🙏
            </p>
          ) : (
            <>
              <span className="text-sm text-muted-foreground">
                Ți-a fost utilă această lecție?
              </span>
              <button
                onClick={() => handleFeedback("clear")}
                className="text-sm px-3 py-1 rounded-lg border border-border hover:bg-muted transition"
              >
                👍 Da, a fost clară
              </button>
              <button
                onClick={() => handleFeedback("hard")}
                className="text-sm px-3 py-1 rounded-lg border border-border hover:bg-muted transition"
              >
                👎 A fost grea
              </button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

## 1.2 — Database Changes

Run these migrations **before** implementing components. Show SQL to user, wait for approval.

```sql
-- Ensure learning_mode column exists on users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS learning_mode text NOT NULL DEFAULT 'simple'
  CHECK (learning_mode IN ('simple', 'technical'));

-- Gate questions table
CREATE TABLE IF NOT EXISTS public.lesson_gate_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL, -- array of 4 strings
  correct_answer integer NOT NULL CHECK (correct_answer BETWEEN 0 AND 3),
  explanation text NOT NULL,
  mode text NOT NULL DEFAULT 'both' CHECK (mode IN ('simple', 'technical', 'both')),
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lesson_gate_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read gate questions"
  ON public.lesson_gate_questions FOR SELECT USING (true);
CREATE INDEX idx_gate_questions_lesson_id ON public.lesson_gate_questions(lesson_id);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS public.lesson_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);
ALTER TABLE public.lesson_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bookmarks"
  ON public.lesson_bookmarks USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Lesson feedback table
CREATE TABLE IF NOT EXISTS public.lesson_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  rating text NOT NULL CHECK (rating IN ('clear', 'hard')),
  time_spent_seconds integer NOT NULL DEFAULT 0,
  learning_mode text NOT NULL DEFAULT 'simple',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);
ALTER TABLE public.lesson_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own feedback"
  ON public.lesson_feedback USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- XP increment function
CREATE OR REPLACE FUNCTION increment_user_xp(user_id_param uuid, xp_amount integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.users SET xp = COALESCE(xp, 0) + xp_amount WHERE id = user_id_param;
END;
$$;
```

---

## 1.3 — Rewrite Lessons 1-14 in Simple Mode

**General rules:**
- File: `lesson-XX-[slug]-simple.mdx` in `content/courses/ai-fundamentals/`
- Frontmatter: same fields as technical version, add `mode: simple`
- Zero Python code blocks. Zero mathematical formulas.
- Every technical concept: "Imaginează-ți că..." or "E ca și când..."
- Target: 800–1000 words. Tone: warm, conversational.
- Code blocks replaced with `[INFOGRAPHIC: ...]` placeholders

**Lesson 01 Simple — `lesson-01-ce-este-ai-simple.mdx`**

Frontmatter: `title: "Ce este Inteligența Artificială?", module: 1, moduleTitle: "Ce este AI", type: theory, order: 1, mode: simple`

Content structure:
1. Hook: "Ți-a recomandat Netflix un film azi? Ți-a filtrat Gmail un spam? Ți-a propus Google Maps un alt drum? Toate astea sunt AI. Tu îl folosești de 10-20 de ori pe zi fără să știi."
2. What AI is: recipe analogy — a recipe = rules (classical programming), but recognizing your grandmother's cooking by taste = AI
3. History in 4 bullet points: 1950 (Turing test), 1997 (Deep Blue), 2012 (deep learning), 2022 (ChatGPT)
4. 8 Romanian daily-life examples: Spotify, Gmail spam, Google Maps trafic, FaceID, Google Translate, YouTube autoplay, TikTok feed, Bolt prețuri dinamice
5. Key insight: "AI nu e magie și nu e un om în computer. E o metodă de a găsi pattern-uri în date."
6. Closing: "În lecția următoare vedem cum 'gândește' de fapt un calculator — și e mai simplu decât crezi."

Replace all code blocks with:
`[INFOGRAPHIC: Two-column comparison. Left: "Programare Clasică" — flowchart: Rules → Computer → Output. Right: "Machine Learning" — flowchart: Data + Output → Computer → Rules discovered.]`

Gate questions (INSERT into `lesson_gate_questions`):
- Q1: "Care este un exemplu de AI zilnic?" | Options: ["Un ceas deșteptător","Recomandările Netflix","O lampă cu senzor","Un calculator de buzunar"] | Correct: 1 | Mode: simple
- Q2: "Ce este de fapt inteligența artificială?" | Options: ["Un robot care gândește ca un om","O metodă prin care mașinăriile învață din exemple","Un program cu reguli complexe","O simulare a creierului"] | Correct: 1 | Mode: simple

Flashcard terms (embed as `flashcards` code block in MDX):
```json
[
  {"front": "Inteligență Artificială", "back": "O metodă prin care calculatoarele învață din exemple, în loc să urmeze reguli scrise de programatori."},
  {"front": "Pattern", "back": "Un tipar repetat în date. AI găsește aceste tipare: de ex. 'emailurile cu «gratuit» sunt des spam'."},
  {"front": "Programare clasică vs AI", "back": "Clasic: programatorul scrie toate regulile. AI: calculatorul descoperă singur regulile din exemple."}
]
```

---

**Lesson 02 Simple — `lesson-02-cum-gandeste-calculatorul-simple.mdx`**

Opening: "Calculatorul nu «gândește» — el calculează. Dar calculează atât de repede și cu atâtea date că rezultatul arată ca gândire."

Content:
1. Everything is numbers: photo analogy — "O fotografie de 1920×1080 pixels = 6 milioane de numere. Fiecare pixel are 3 valori (roșu, verde, albastru). Calculatorul nu vede o față — procesează milioane de numere."
2. Feedback loop: "E ca și când ai preda unui prieten să ghicească vârsta din poze. Îi spui când greșește. Treptat devine mai bun. Asta face AI."
3. What AI is good vs bad at: two plain lists
4. Key insight: "Calculatorul nu înțelege ce vede — numără și compară. Dar face asta de milioane de ori pe secundă."

Infographics:
- `[INFOGRAPHIC: Face photo → arrow → grid of numbers (5×5 sample). Label: "Ce vede omul" vs "Ce vede calculatorul".]`
- `[INFOGRAPHIC: Circular diagram: Predicție → Verificare → Greșeală → Ajustare → repeat.]`

Gate questions:
- Q1: "Cum «vede» un calculator o fotografie?" | Options: ["Ca o imagine cu culori","Ca milioane de numere 0-255","Ca un fișier salvat","Nu poate vedea fotografii"] | Correct: 1
- Q2: "La ce este AI-ul cel mai bun?" | Options: ["Să înțeleagă emoțiile","Să găsească pattern-uri în date mari","Să rezolve situații noi","Să ia decizii morale"] | Correct: 1

Flashcards:
```json
[
  {"front": "Pixel", "back": "Cel mai mic element al unei imagini digitale. Reprezentat de 3 numere (roșu, verde, albastru) între 0 și 255."},
  {"front": "Feedback loop", "back": "Ciclul prin care AI primește o predicție, află dacă a greșit, și își ajustează calculele. Repetat de milioane de ori."}
]
```

---

**Lesson 03 Simple — `lesson-03-tipuri-de-ai-simple.mdx`**

Opening: "Dacă ai văzut Terminator sau Ex Machina, ți-ai format o imagine greșită. Hai să clarificăm ce există azi."

Content:
1. Narrow AI: 8 examples (ChatGPT, Spotify, Tesla FSD, Gmail spam, DALL-E, Stockfish, FaceID, Google Translate). Surgeon analogy: "Un chirurg cardiac excelent nu poate fi stomatolog și psihiatru."
2. AGI: does not exist. "Roboții din filme sunt AGI. Niciun AI real nu e aproape de asta."
3. What ChatGPT actually is: predicts next word based on patterns. "Nu știe nimic — a văzut pattern-uri."
4. Will AI take your job? "Va schimba ce faci, nu neapărat ce ești. Medicii care folosesc AI vor înlocui medicii care nu îl folosesc."

Infographic: `[INFOGRAPHIC: Spectrum left to right: ANI (icons: chess, music, car, email, camera, chat) → AGI (question mark, "Nu există încă") → ASI ("Ficțiune SF"). Current position marker on ANI.]`

Gate questions:
- Q1: "Ce tip de AI este ChatGPT?" | Options: ["AGI","Narrow AI specializat pe text","Robot cu conștiință","Superinteligență"] | Correct: 1
- Q2: "Care e diferența dintre Narrow AI și AGI?" | Options: ["Narrow AI e mai rapid","Narrow AI face un lucru bine, AGI ar face orice","AGI există în laboratoare","Nu există diferență"] | Correct: 1

---

**Lesson 04 Simple — `lesson-04-quiz-modulul-1-simple.mdx`** (quiz type — rewrite questions only)

5 questions appropriate for non-technical audience. No RGB values, no code syntax:
1. "Recomandările YouTube sunt…?" → AI care a învățat din vizionări
2. "Diferența programare clasică vs AI?" → Clasic=reguli scrise, AI=descoperă din date
3. "Ce este Narrow AI?" → AI specializat pe o singură sarcină
4. "Există azi AI care gândește ca un om?" → Nu — AGI nu există
5. "Care NU este AI?" → Beculeț cu senzor de mișcare (urmează o regulă fixă, nu învață)

---

**Lesson 05 Simple — `lesson-05-ce-este-machine-learning-simple.mdx`**

Opening: "ML e motivul pentru care Spotify a descoperit trupa ta preferată înainte să o cunoști."

Content: Bike analogy (core), 3 ingredients (date/algoritm/calcul), 3 problem types (clasificare/predicție/generare), why ML exploded after 2012, what non-programmers can do with ML today (ChatGPT, Midjourney, no-code tools).

Infographic: `[INFOGRAPHIC: Circular bike learning loop: Încerc → Cad/Greșesc → Creierul ajustează → Încerc din nou (mai bine). Below: "Machine Learning face același lucru cu date."]`

Gate questions:
- Q1: "Ce face ML diferit de programarea clasică?" | Options: ["Rulează mai repede","Învață din exemple în loc să urmeze reguli","Necesită internet","E mai greu"] | Correct: 1
- Q2: "Cele 3 ingrediente pentru ML?" | Options: ["Internet/calculator/programator","Date/algoritm/putere de calcul","Cod/server/baze de date","AI/roboți/automatizare"] | Correct: 1

---

**Lesson 06 Simple — `lesson-06-supervised-vs-unsupervised-simple.mdx`**

Content: Teacher analogy for Supervised (labeled photos), sorting analogy for Unsupervised (unlabeled pile), dog training for Reinforcement Learning. Decision guide: "Ai etichete? → Supervised. Nu ai? → Unsupervised. Vrei strategie optimă? → Reinforcement."

Infographic: `[INFOGRAPHIC: Three panels: 1) Teacher with labeled cards → student learns. 2) Pile of objects sorted into discovered groups. 3) Dog doing trick → treat/no treat.]`

Gate questions:
- Q1: "Medic antrenează AI cu radiografii etichetate cancer/sănătos. Ce tip?" | Correct: "Supervised Learning" (index 2)
- Q2: "Netflix grupează utilizatori fără chestionar. Ce tip?" | Correct: "Unsupervised Learning" (index 1)

---

**Lesson 07 Simple — `lesson-07-cum-se-antreneaza-un-model-simple.mdx`**

Core story: Andrei and ciorbă de burtă. Training loop = chef iterating on recipe. Parameters = recipe knobs. Learning rate = how much to adjust after each feedback. Train/test split = exam analogy.

Gate questions:
- Q1: "Ce înseamnă «eroarea» în antrenare?" | Correct: "Diferența dintre predicție și răspunsul corect" (index 1)
- Q2: "De ce setul de test e separat?" | Correct: "Ca să testăm pe date pe care nu le-a văzut" (index 1)

---

**Lesson 08 Simple — `lesson-08-overfitting-underfitting-simple.mdx`**

Core: Student who memorizes vs understands. Numbers: "99% pe antrenament, 62% pe date noi = overfitting." 5 solutions in plain language. Goldilocks principle.

Infographic: `[INFOGRAPHIC: 3 scatter plots with fitting lines: Underfitting (straight line, misses all), Perfect (smooth curve follows trend), Overfitting (wildly squiggly, touches every point).]`

Gate questions:
- Q1: "98% antrenament, 62% date noi. Care e problema?" | Correct: "Overfitting" (index 1)
- Q2: "Soluția cea mai simplă pentru overfitting?" | Correct: "Adaugă date diverse de antrenament" (index 1)

---

**Lesson 09 Simple — `lesson-09-quiz-modulul-2-simple.mdx`** (quiz type)

5 simple-audience questions: supervised vs unsupervised scenarios, overfitting diagnosis, parameters definition, train/test split purpose, reinforcement learning analogy.

---

**Lesson 10 Simple — `lesson-10-neuronul-artificial-simple.mdx`**

Core: Jury of 3 judges analogy (spam detection). Three steps: receive signals, weigh by importance, decide. Activation function = light switch.

Infographic: `[INFOGRAPHIC: Jury illustration — 3 inputs on left → 3 judges with different sized gavels → scale: if sum > threshold → SPAM stamp, else OK.]`

Gate questions:
- Q1: "Ce rol au «weights» în neuron?" | Correct: "Determină importanța fiecărui semnal" (index 1)
- Q2: "La ce servește activation function?" | Correct: "Decide dacă neuronul transmite semnal mai departe" (index 1)

---

**Lesson 11 Simple — `lesson-11-retea-neuronala-simple.mdx`**

Core: Factory with 3 floors analogy. Floor 1 = finds edges, Floor 2 = finds facial parts, Floor 3 = identifies person. Universal Approximation Theorem explained without math.

Infographic: `[INFOGRAPHIC: Factory building — Floor 1 workers detect edges, Floor 2 team leads combine into facial features, Floor 3 director identifies person. Arrow showing info flowing upward. Right side: matching neural net diagram.]`

Gate questions:
- Q1: "Ce face un hidden layer?" | Correct: "Procesează și transformă informația" (index 1)
- Q2: "Care strat primește pixelii imaginii?" | Correct: "Input layer" (index 2)

---

**Lesson 12 Simple — `lesson-12-deep-learning-simple.mdx`**

Why "deep" = many layers. Recognition hierarchy analogy (contur→siluetă→față→trăsături→identitate). 5 concrete DL breakthroughs (FaceID, voice assistants, Google Translate, DALL-E, AlphaFold). Transfer Learning = specialist doctor changing specialty.

Gate questions:
- Q1: "De ce se numește 'Deep' Learning?" | Correct: "Rețelele au multe straturi" (index 1)
- Q2: "Ce este Transfer Learning?" | Correct: "Reutilizarea unui model antrenat pentru o sarcină similară" (index 1)

---

**Lesson 13 Simple — `lesson-13-exercitiu-retea-simple.mdx`** (exercise type)

Simple Mode for exercise: no Python editor. Instead, a visual walkthrough of what a neural network does on the Two Moons dataset, with screenshots/descriptions of each step. Instructions to try Google Colab version. The `python-editor` block shows the placeholder message in Simple Mode (handled automatically by lesson-content.tsx).

Content structure: Describe what the exercise does in plain language, show expected output as text (not code), explain what each step means in real-world terms.

---

**Lesson 14 Simple — `lesson-14-quiz-modulul-3-simple.mdx`** (quiz type)

5 questions rewritten for simple audience — no backpropagation math, no parameter count calculations:
1. "Ce face o funcție de activare?" → Introduce non-linearitate (in plain Romanian)
2. "Cum învață o rețea neuronală?" → Prin predicție → eroare → ajustare repetată
3. "Care arhitectură e bună pentru imagini?" → CNN (cu analogia filtrului care detectează forme)
4. "Ce este Transfer Learning?" → Reutilizarea unui model antrenat pe date masive
5. "Ce face un hidden layer?" → Transformă informația în reprezentări din ce în ce mai abstracte

---

## 1.4 — New Lessons 15-30 (Both Modes)

Lessons 15-30 are currently stub files with "în curs de pregătire" content. Each needs:
- A full technical MDX rewrite
- A simple MDX file created alongside

**Module 4: Language Models & Transformers (lessons 15-19)**

---

**Lesson 15 — Ce este un Language Model**
- Technical: Next-token prediction. Probability distributions over vocabulary. N-gram models → Neural LMs → Transformer LMs. Python: `tokenizer.encode()`, log probability of token sequences. Autoregressive generation.
- Simple: "ChatGPT e un completator de propoziții extrem de bun. Nimic mai mult — și nimic mai puțin." Game show analogy: given "Capitala Franței este", predict next word. Train on billions of texts.
- Gate (both): Q1 "Ce face un language model?" → Prezice cuvântul următor. Q2 "Ce este «temperatura» unui LLM?" → Controlează cât de aleatoriu e răspunsul (simple); Controls randomness of sampling (technical).

**Lesson 16 — Transformers și Attention**
- Technical: Self-attention mechanism. Query/Key/Value matrices. Multi-head attention. Position embeddings. Encoder vs decoder. Architecture diagram. Python snippet showing attention weights visualization.
- Simple: "Transformerul e ce face ChatGPT deștept. Secretul: citește toate cuvintele simultan și înțelege care cuvinte «se referă» la altele." Highlighter analogy: when reading "banca de lângă râu", the model highlights "râu" when processing "banca" to understand it's a bench, not a financial institution.
- Gate: Q1 "Ce este mecanismul Attention?" → Permite modelului să vadă relații între orice două cuvinte. Q2 "Ce înseamnă multi-head attention?" → Rețeaua «privește» simultan din mai multe perspective.

**Lesson 17 — Tokenizare**
- Technical: BPE (Byte Pair Encoding). Tiktoken library. Token counts and costs. Why "tokenization" ≠ "words". Code: `import tiktoken; enc.encode("text")`. Token efficiency across languages.
- Simple: "Tokenizarea e cum rupe ChatGPT textul în bucăți — nu cuvinte, ci silabe sau combinații de litere." Word puzzle analogy. Why Romanian text costs more tokens than English (example: "bine" = 1 token, "înțelegere" = 3+ tokens).
- Gate: Q1 "Ce este un token?" → O bucată de text procesată de LLM (poate fi cuvânt, silabă sau literă). Q2 "De ce contează numărul de tokeni?" → Determină costul și limita de context.

**Lesson 18 — Context Window și Memoria LLM**
- Technical: Context window limits (GPT-3=4K, GPT-4=128K, Claude=200K). KV cache. Why LLMs don't have persistent memory by default. RAG as solution. Sliding window strategies.
- Simple: "ChatGPT are «memorie de lucru» — ține minte tot ce ai scris ÎN conversația curentă, dar uită tot după. E ca un coleg care citea nota de briefing înainte de fiecare întâlnire de la zero." Whiteboard analogy: context window = whiteboard size.
- Gate: Q1 "Ce este «context window»?" → Cantitatea de text pe care LLM-ul o poate ține în minte simultan. Q2 "De ce ChatGPT «uită» conversațiile anterioare?" → Nu are memorie persistentă — fiecare conversație nouă e de la zero.

**Lesson 19 — Quiz Modulul 4**
- 5 questions covering: next-token prediction, attention mechanism, tokenization, context window, LLM vs classical AI distinction.

---

**Module 5: Prompt Engineering (lessons 20-24)**

**Lesson 20 — Ce este un Prompt**
- Technical: System prompt vs user message vs assistant message. OpenAI chat completions API structure. Few-shot examples. Role specification. JSON mode. Temperature and top_p.
- Simple: "Un prompt e o instrucțiune dată AI-ului. Calitatea răspunsului depinde 80% de calitatea instrucțiunii." Restaurant order analogy: vague order = random result; specific order = what you want.
- Gate: Q1 "Ce este un prompt?" → Instrucțiunea sau întrebarea pe care o dai AI-ului. Q2 "De ce contează modul în care formulezi întrebarea?" → AI-ul răspunde exact la ce întrebi — formular vag = răspuns vag.

**Lesson 21 — Tehnici de bază: Zero-shot, Few-shot, Chain-of-thought**
- Technical: Zero-shot prompting. Few-shot with examples. Chain-of-thought ("Let's think step by step"). Tree of Thoughts. ReAct pattern. Python examples with OpenAI SDK.
- Simple: "Zero-shot = cerere fără exemple. Few-shot = cerere cu 2-3 exemple de ce vrei. Chain-of-thought = ceri AI-ului să gândească cu voce tare." Case study: same task, 3 different prompt styles, compare quality.
- Gate: Q1 "Ce este few-shot prompting?" → Furnizarea de exemple concrete în prompt pentru a ghida AI. Q2 "De ce chain-of-thought îmbunătățește raționamentul?" → Forțează modelul să explice pașii, reducând erorile.

**Lesson 22 — Roluri și System Prompts**
- Technical: System message role. Persona engineering. Instruction following. Jailbreak resistance. Constitutional AI basics. Python: system vs user messages in API calls.
- Simple: "System prompt-ul e «fișa postului» AI-ului. Dacă îi spui cine e și ce face, răspunsurile devin consistent mai bune." Secretary analogy: without briefing = random behavior, with clear role = consistent professional.
- Gate: Q1 "Ce este un system prompt?" → Instrucțiunea care definește rolul și comportamentul AI-ului. Q2 "Când e util să dai un rol AI-ului?" → Când vrei răspunsuri specializate și consistente.

**Lesson 23 — Exercițiu: Prompt Engineering practic**
- Type: exercise. Technical mode: optimize prompts via API calls, measure quality, test edge cases.
- Simple mode: walkthrough exercise — given 5 bad prompts, rewrite them to be better. No code. Uses the interactive python-editor in technical mode; in simple mode shows examples with explanation.

**Lesson 24 — Quiz Modulul 5**
- 5 questions on prompt engineering techniques, system prompts, few-shot, chain-of-thought.

---

**Module 6: Instrumente AI practice (lessons 25-29)**

**Lesson 25 — OpenAI API și alternativele**
- Technical: API keys, rate limits, pricing tiers. Python SDK. Streaming responses. Function calling. Embeddings API. Whisper API. Alternatives: Anthropic Claude API, Google Gemini, open-source (Ollama, LM Studio).
- Simple: "API-ul OpenAI e poarta prin care orice aplicație poate vorbi cu ChatGPT. Nu ai nevoie de cod ca să îl folosești — există tool-uri fără cod." Overview of no-code tools that use AI APIs (Zapier AI, Make.com, Bubble AI).
- Gate: Q1 "Ce este un API?" → O interfață prin care o aplicație poate comunica cu un serviciu extern. Q2 "De ce există alternative la OpenAI?" → Cost, confidențialitate, performanță pe sarcini specifice.

**Lesson 26 — RAG (Retrieval-Augmented Generation)**
- Technical: Vector embeddings. Cosine similarity. Vector databases (Pinecone, pgvector). RAG pipeline: chunk → embed → store → retrieve → augment → generate. LangChain basics. Code example.
- Simple: "RAG e cum dai ChatGPT o bibliotecă personală. În loc să știe totul dinainte, caută răspunsul în documentele tale înainte să răspundă." Librarian analogy: "Înainte să răspundă, bibliotecarul caută în rafturile tale."
- Gate: Q1 "Ce problemă rezolvă RAG?" → Permite LLM să răspundă despre documente pe care nu le-a văzut în antrenare. Q2 "Ce sunt embeddings?" → Reprezentări numerice ale textului care captează sensul semantic.

**Lesson 27 — AI Agents**
- Technical: Agent loop (perceive → plan → act → observe). Tool use (function calling). ReAct pattern. Multi-agent systems. AutoGPT, LangGraph overview. Risks: infinite loops, hallucinated tool calls.
- Simple: "Un AI Agent nu doar răspunde — face lucruri. Caută pe internet, trimite emailuri, citește fișiere. E diferența dintre un consilier și un asistent care execută." Travel agency analogy: advisor gives advice vs agent books everything for you.
- Gate: Q1 "Ce face un AI agent diferit de un chatbot?" → Poate lua acțiuni în lumea reală (căutare, scriere fișiere, apeluri API). Q2 "Ce este «tool use»?" → Capacitatea AI-ului de a apela funcții externe (calculator, căutare web, baze de date).

**Lesson 28 — Etica AI și biasuri**
- Technical: Algorithmic bias. Fairness metrics. Data poisoning. AI safety overview. EU AI Act. Responsible AI guidelines. Code example showing bias in a hiring model.
- Simple: "AI-ul nu e neutru — el repetă biasurile din datele pe care a fost antrenat. Un AI antrenat pe CV-uri din trecut va reproduce discriminările din trecut." Mirror analogy: "AI e o oglindă a datelor umane, nu un judecător obiectiv."
- Gate: Q1 "De unde vin biasurile în AI?" → Din datele de antrenament care reflectă inegalitățile umane. Q2 "Ce este EU AI Act?" → Primul cadru legal major care reglementează utilizarea AI în Europa.

**Lesson 29 — Piața muncii și AI**
- Technical: Jobs most affected (and how). Augmentation vs automation distinction. AI engineer roles. Prompt engineer, AI product manager, ML Ops. Salary data. Skills that remain valuable. Building an AI portfolio.
- Simple: "AI nu «fură» joburi — transformă joburile. Medicii cu AI înlocuiesc medicii fără AI." 5 concrete ways AI changes 5 specific professions (medical, legal, marketing, customer service, software dev). Skills that remain: judgment, empathy, creativity, domain expertise.
- Gate: Q1 "Ce joburi sunt cel mai puțin afectate de AI?" → Cele care cer judecată contextuală, empatie sau creativitate originală. Q2 "Ce înseamnă «augmentation» vs «automation»?" → Augmentation: AI te ajută să fii mai bun. Automation: AI înlocuiește complet sarcina.

---

**Lesson 30 — Proiect Final (project type)**
- Type: project. No Simple Mode needed (project mode is identical — different scope).
- Content: Build a complete mini-application using OpenAI API. Three track options: (A) Chatbot customizat, (B) Document Q&A cu RAG, (C) Analizor de sentiment pentru recenzii. Each track has step-by-step instructions with code skeleton in python-editor blocks. Submission: GitHub link + 3-sentence description.

---

## 1.5 — Gate Questions SQL INSERT Statements

After running the schema migration and syncing lessons to DB to get lesson IDs, run these inserts. The lesson IDs must be fetched from the `lessons` table by `order_index`. Use this pattern:

```sql
-- Helper: find lesson id by order_index
-- Replace $LESSON_ID with actual UUID from: SELECT id FROM lessons WHERE order_index = X AND course_id = (SELECT id FROM courses WHERE slug = 'ai-fundamentals');

-- Lesson 01 gate questions
INSERT INTO public.lesson_gate_questions (lesson_id, question, options, correct_answer, explanation, mode, display_order)
VALUES
  ('$LESSON_01_ID',
   'Care este un exemplu de AI pe care îl folosești zilnic?',
   '["Un ceas deșteptător", "Recomandările de pe Netflix", "O lampă cu senzor de mișcare", "Un calculator de buzunar"]',
   1,
   'Netflix analizează ce ai urmărit și găsește tipare pentru a-ți recomanda ce ți-ar plăcea. Exact ce face AI — găsește pattern-uri în date.',
   'simple', 0),
  ('$LESSON_01_ID',
   'Ce este de fapt inteligența artificială?',
   '["Un robot care gândește ca un om", "O metodă prin care mașinăriile învață din exemple", "Un program cu reguli foarte complexe", "O simulare a creierului uman"]',
   1,
   'AI înseamnă să înveți o mașinărie din date și exemple — nu să îi scrii toate regulile manual. Diferența fundamentală față de programarea clasică.',
   'simple', 1);
```

Repeat this pattern for all 30 lessons using the gate questions defined in sections 1.3 and 1.4 above. The full INSERT script covers ~60 gate questions total (2 per theory lesson × 26 theory lessons + 4 quiz lessons which use their own quiz system).

---

## 1.6 — Flashcard Component

**Decision: Embed flashcards in MDX via special code block, intercepted by lesson-content.tsx.**

This avoids a new DB table and works within the existing MDX pattern.

**MDX syntax (add to each lesson's MDX file):**
````
```flashcards
[
  {"front": "Term", "back": "Definition in Romanian"},
  {"front": "Term 2", "back": "Definition 2"}
]
```
````

**Update lesson-content.tsx to intercept `language-flashcards`:**

```typescript
// In the code component renderer, add before the default return:
if (className?.includes("language-flashcards")) {
  try {
    const cards = JSON.parse(String(children)) as { front: string; back: string }[];
    return <FlashcardDeck cards={cards} />;
  } catch {
    return null;
  }
}
```

**New file: `src/components/course/flashcard-deck.tsx`**

```typescript
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

interface FlashcardDeckProps {
  cards: { front: string; back: string }[];
}

export function FlashcardDeck({ cards }: FlashcardDeckProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (cards.length === 0) return null;

  const card = cards[index];

  return (
    <div className="my-8">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-muted-foreground">
          🃏 Termeni cheie — {index + 1}/{cards.length}
        </h4>
        <span className="text-xs text-muted-foreground">Click pe card pentru definiție</span>
      </div>

      {/* Card */}
      <motion.div
        className="relative h-32 cursor-pointer"
        onClick={() => setFlipped((f) => !f)}
        style={{ perspective: 1000 }}
      >
        <motion.div
          className="w-full h-full relative"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 flex items-center justify-center rounded-xl border border-border bg-card px-6 text-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span className="text-lg font-semibold text-foreground">{card.front}</span>
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 flex items-center justify-center rounded-xl border border-primary/30 bg-primary/5 px-6 text-center"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <span className="text-sm text-foreground/90">{card.back}</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-3 mt-3">
        <button
          onClick={() => { setIndex((i) => Math.max(0, i - 1)); setFlipped(false); }}
          disabled={index === 0}
          className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30 transition"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => setFlipped(false)}
          className="p-1.5 rounded-md hover:bg-muted transition"
          title="Întoarce cardul"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => { setIndex((i) => Math.min(cards.length - 1, i + 1)); setFlipped(false); }}
          disabled={index === cards.length - 1}
          className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30 transition"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
```

---

## 1.7 — Testing & QA Checklist

Run `npx tsc --noEmit` after all component changes.

**Mode System:**
- [ ] Simple Mode renders `content_simple_md` when not null
- [ ] Simple Mode shows yellow fallback banner when `content_simple_md` is null
- [ ] Technical Mode always renders `content_md`
- [ ] Mode toggle button shows correct label for current mode
- [ ] Mode toggle persists across page refresh (stored in `users.learning_mode`)
- [ ] Mode toggle disabled with tooltip when Simple content not available for that lesson
- [ ] python-editor blocks show placeholder message in Simple Mode
- [ ] python-editor renders Monaco editor in Technical Mode

**Reading Progress & Gate:**
- [ ] Reading progress bar appears at top of viewport
- [ ] Bar reaches ~100% when scrolled to bottom
- [ ] `hasReachedEnd` becomes true at 90% scroll and never resets
- [ ] `hasReachedEnd` is true immediately on mount if content is short (< viewport)
- [ ] LessonGate appears with slide-up animation after `hasReachedEnd` is true
- [ ] Wrong answer: shake animation plays, "Hai că merge" message appears
- [ ] Correct answer: green checkmark, explanation text, "+5 XP" displayed
- [ ] All gate questions answered: CompleteButton unlocks
- [ ] CompleteButton disabled with tooltip "Citește lecția mai întâi" when not scrolled
- [ ] CompleteButton disabled with tooltip "Răspunde la întrebările de mai jos" when gate incomplete
- [ ] CompleteButton pulses when both conditions met
- [ ] Quiz lessons: no LessonGate, no reading progress requirement
- [ ] Exercise lessons: no LessonGate, no reading progress requirement

**Bookmark:**
- [ ] Heart icon visible in lesson header
- [ ] Click toggles bookmark state with optimistic UI
- [ ] Bookmark persists across page refresh
- [ ] Unbookmark works (record deleted from `lesson_bookmarks`)

**Feedback:**
- [ ] Feedback form appears after CompleteButton success
- [ ] 👍 and 👎 buttons both submit correctly
- [ ] "Mulțumim pentru feedback" message appears after submission
- [ ] Form does not re-appear on second visit to same lesson

**Flashcards:**
- [ ] Flashcard deck renders from `flashcards` code block
- [ ] Card flips on click with 3D animation
- [ ] Next/previous navigation works
- [ ] Reset button flips card back to front

**Sync Action:**
- [ ] `npm run sync` (or however sync is triggered) processes both `*.mdx` and `*-simple.mdx` files
- [ ] Missing `-simple.mdx` logs warning but does not throw error
- [ ] `content_simple_md` is null in DB for lessons without simple file

**New Lessons (15-30):**
- [ ] All 16 stub lessons replaced with full content
- [ ] All 16 simple versions created
- [ ] All lessons sync to DB correctly via sync-action
- [ ] Gate questions inserted for all new lessons
- [ ] Flashcard decks embedded in all new lessons

**TypeScript:**
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] No `any` types introduced
- [ ] All new props are typed

**Database:**
- [ ] All 3 new tables have RLS enabled
- [ ] `lesson_gate_questions` readable by anonymous users (for pre-auth preview)
- [ ] `lesson_bookmarks` writable only by owner
- [ ] `lesson_feedback` writable only by owner
- [ ] `increment_user_xp` function exists and works

---

## 1.8 — Implementation Order

1. Run DB migration (show SQL to user first, wait for approval)
2. Update lesson-content.tsx (Task 1.1.1)
3. Create reading-progress.tsx (Task 1.1.3)
4. Create lesson-gate.tsx + awardGateXP action (Task 1.1.4)
5. Create flashcard-deck.tsx + update lesson-content.tsx interceptor (Task 1.6)
6. Update complete-button.tsx (Task 1.1.5)
7. Create lesson-page-client.tsx wrapper
8. Create mode-toggle.tsx + updateLearningMode action (Task 1.1.2)
9. Create bookmark-button.tsx + toggleBookmark action (Task 1.1.9)
10. Create lesson-feedback.tsx + submitLessonFeedback action (Task 1.1.10)
11. Update lesson page RSC (Task 1.1.6)
12. Update sync-action.ts (Task 1.1.7)
13. Write 14 simple mode MDX files (Task 1.3)
14. Write 16 technical MDX rewrites for lessons 15-30 (Task 1.4)
15. Write 16 simple MDX files for lessons 15-30 (Task 1.4)
16. Run sync to populate DB
17. Insert gate questions SQL
18. Run full QA checklist (Task 1.7)
19. `npx tsc --noEmit`
