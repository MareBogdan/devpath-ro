import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import {
  ChevronRight,
  ChevronLeft,
  FileText,
  HelpCircle,
  Wrench,
  FolderOpen,
  CheckCircle2,
  Clock,
  FlaskConical,
  Trophy,
  Lock,
} from "lucide-react";
import { LessonPageClient } from "@/components/course/lesson-page-client";
import {
  getLessonInteractiveState,
  getLessonWowNotes,
} from "@/app/(dashboard)/courses/inline-loaders";
import { BookmarkButton } from "@/components/course/bookmark-button";
import { QuizSection } from "@/components/course/quiz-section";
import { AICoachChat } from "@/components/course/ai-coach-chat";
import { LessonKeyboardNav } from "@/components/course/lesson-keyboard-nav";
import { LessonComments } from "@/components/course/lesson-comments";
import { ProjectSubmissionForm } from "@/components/course/project-submission-form";
import { cn } from "@/lib/utils";
import { getNextLesson } from "@/lib/next-lesson";
import { escapeStrayAngleBrackets } from "@/lib/mdx-sanitize";
import type { Lesson } from "@/types";

interface PageProps {
  params: { courseSlug: string; lessonId: string };
}

const lessonTypeIcon: Record<string, React.ElementType> = {
  theory: FileText,
  quiz: HelpCircle,
  exercise: Wrench,
  project: FolderOpen,
  lesson: FileText,
  lab: FlaskConical,
  boss: Trophy,
};

const lessonTypeBg: Record<string, string> = {
  theory: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  quiz: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  exercise: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  project: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  // New curriculum types: lesson = neutral, lab = blue, boss = gold/amber
  lesson: "bg-muted text-muted-foreground",
  lab: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  boss: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
};

const lessonTypeLabels: Record<string, string> = {
  theory: "Teorie",
  quiz: "Quiz",
  exercise: "Exercițiu",
  project: "Proiect",
  lesson: "Lecție",
  lab: "Lab",
  boss: "Boss Fight",
};

const MDX_OPTIONS = {
  remarkPlugins: [remarkGfm, remarkMath],
  rehypePlugins: [rehypeHighlight, rehypeKatex],
};

/**
 * Compile lesson markdown/MDX, in three tiers so one malformed lesson never
 * crashes the page:
 *   1. as written;
 *   2. with stray "<" in prose escaped (e.g. "<1ms" — the usual authoring slip);
 *   3. the raw text in a code fence with a short notice.
 */
async function compileLessonMdx(markdown: string, title: string) {
  try {
    return await serialize(markdown, { mdxOptions: MDX_OPTIONS });
  } catch (err) {
    console.warn(`[lesson] MDX compile failed for "${title}" — retrying with escaped "<":`, String(err).split("\n")[1]?.trim() ?? err);
    try {
      return await serialize(escapeStrayAngleBrackets(markdown), { mdxOptions: MDX_OPTIONS });
    } catch (err2) {
      console.error(`[lesson] MDX compile failed for "${title}" even after repair:`, err2);
    }
    try {
      // Fence longer than any backtick run inside the text so it can't be closed early.
      const longestRun = Math.max(
        2,
        ...(markdown.match(/`+/g) ?? []).map((run) => run.length)
      );
      const fence = "`".repeat(longestRun + 1);
      return await serialize(
        `> Această lecție nu a putut fi afișată cu formatarea completă. Iată textul ei brut:\n\n${fence}text\n${markdown}\n${fence}\n`
      );
    } catch {
      return await serialize("> Conținutul acestei lecții nu poate fi afișat momentan.");
    }
  }
}

export default async function LessonPage({ params }: PageProps) {
  const { courseSlug, lessonId } = params;
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch course
  const { data: course } = await supabase
    .from("courses")
    .select("id, title, slug")
    .eq("slug", courseSlug)
    .single();

  if (!course) notFound();

  // Fetch current lesson
  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .eq("course_id", course.id)
    .single();

  if (!lesson) notFound();

  // Compile the lesson MDX on the server — next-mdx-remote requires a
  // server-side compile step; the client <MDXRemote> renders the result.
  // A lesson whose MDX fails to compile degrades to its raw text instead of a 500.
  const mdxSource = await compileLessonMdx(lesson.content_md ?? "", lesson.title);

  // Fetch all lessons in course for navigation. Unpublished (skeleton) lessons are
  // not part of the reading path; the current lesson is always kept so that the
  // "N din M" counter and prev link stay correct on an admin-viewed draft.
  const { data: allLessons } = await supabase
    .from("lessons")
    .select("id, title, order_index, type, is_published")
    .eq("course_id", course.id)
    .order("order_index");

  const lessons: Pick<Lesson, "id" | "title" | "order_index" | "type">[] = (
    allLessons ?? []
  ).filter((l) => l.is_published === true || l.id === lessonId);
  const currentIndex = lessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  // Next lesson: next published lesson in this course, else the first published
  // lesson of the next course that has any (null = end of the curriculum).
  const nextLesson = await getNextLesson(supabase, course.id, lesson.order_index);

  // Fetch user's completion status + level
  const [progressResult, userProfileResult] = await Promise.all([
    user
      ? supabase
          .from("user_progress")
          .select("completed")
          .eq("user_id", user.id)
          .eq("lesson_id", lessonId)
          .single()
      : Promise.resolve({ data: null }),
    user
      ? supabase
          .from("users")
          .select("level")
          .eq("id", user.id)
          .single()
      : Promise.resolve({ data: null }),
  ]);

  const isCompleted = progressResult.data?.completed ?? false;
  const userLevel: number = (userProfileResult.data?.level as number | null | undefined) ?? 1;

  const isTheoryLike = lesson.type === "theory" || lesson.type === "lesson";
  const isExerciseLike = lesson.type === "exercise" || lesson.type === "lab";
  const isProjectLike = lesson.type === "project" || lesson.type === "boss";

  // Coming-soon: lesson row seeded but content not yet written/published.
  const isComingSoon =
    lesson.is_published === false && (lesson.content_md ?? "").trim() === "";

  // Game-only lessons: content_md is a single self-closing MDX component tag
  // (e.g. `<BinaryTranslator />`). These have no prose to read, so the
  // "Marchează completat" button must skip the read-scroll gate that normal
  // theory/lesson pages use.
  const isGameOnly = /^<[A-Z][a-zA-Z]+\s*\/>$/.test(
    (lesson.content_md ?? "").trim()
  );

  // Inline-question interactive state (theory-like lessons only; RLS-scoped).
  const interactiveState =
    isTheoryLike && user ? await getLessonInteractiveState(lessonId) : null;

  // Wow Notes — contextual side-notes (theory-like lessons only; auth-read).
  const wowNotes =
    isTheoryLike && user ? await getLessonWowNotes(lessonId) : null;

  // ── Desktop Wow-Note gutter (Sub-part B) ──────────────────────────────────
  // ONE source of truth for the gutter switch. The 680px reading column widens to a
  // shared 1012px shell (680 + 32 gap + 300 gutter) ONLY at xl: AND only when the
  // lesson actually has notes — so every 0-note lesson (all live lessons today) and
  // everything below xl: stays byte-identical to before. `railShellClass` reserves
  // the gutter on the right (xl:pr-[332px]) so the non-grid blocks (header / footer /
  // comments / completion chrome) keep their content over the 680px reading column.
  const hasWowNotes = (wowNotes?.notes?.length ?? 0) > 0;
  // Reading column is ALWAYS a centered 680px column. Wow Notes float into the
  // right page margin (see wow-note.tsx) rather than reserving a grid gutter, so
  // the text stays centered on the page and no vertical gaps appear.
  const shellClass = "max-w-[680px]";
  const railShellClass = "max-w-[680px]";

  // Fetch bookmark status
  const { data: bookmark } = user
    ? await supabase
        .from("lesson_bookmarks")
        .select("user_id")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle()
    : { data: null };

  // Fetch feedback status (to avoid duplicate prompt)
  const { data: existingFeedback } = user
    ? await supabase
        .from("lesson_feedback")
        .select("user_id")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle()
    : { data: null };

  // User display info for Realtime presence
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "Student";
  const avatarUrl =
    (user?.user_metadata?.avatar_url as string | null | undefined) ?? null;

  // Fetch existing project submission (only for actual `project` lessons —
  // `boss` lessons reuse the project-like rendering path for game content
  // but never show the portfolio submission form, so no fetch needed).
  const { data: existingProject } =
    lesson.type === "project" && user
      ? await supabase
          .from("projects")
          .select("id")
          .eq("user_id", user.id)
          .eq("course_id", course.id)
          .single()
      : { data: null };

  // Fetch quiz questions if this is a quiz lesson
  const { data: quizQuestions } =
    lesson.type === "quiz"
      ? await supabase
          .from("quiz_questions")
          .select("id, question, options, correct_answer, explanation")
          .eq("lesson_id", lessonId)
          .order("id")
      : { data: [] };

  // Reading time estimate (technical wpm)
  const readingTime = isTheoryLike
    ? Math.max(1, Math.ceil(lesson.content_md.split(/\s+/).length / 100))
    : lesson.type === "quiz"
    ? 5
    : 15;

  const TypeIcon = lessonTypeIcon[lesson.type] ?? FileText;
  const typeBg = lessonTypeBg[lesson.type] ?? lessonTypeBg.theory;

  return (
    <div className="flex flex-col min-h-full">
      {/* Sticky lesson header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-6 py-3">
        <div className={`${railShellClass} mx-auto flex items-center justify-between gap-4`}>
          {/* ← Back to course + breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground min-w-0">
            <Link
              href={`/courses?c=${courseSlug}`}
              className="inline-flex items-center gap-1 shrink-0 font-medium text-muted-foreground hover:text-foreground transition max-sm:py-2"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{course.title}</span>
              <span className="sm:hidden">Curs</span>
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-40" />
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {lesson.title}
            </span>
          </nav>

          {/* Lesson metadata badges + actions */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground hidden sm:block">
              {currentIndex + 1} din {lessons.length}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                typeBg
              )}
            >
              <TypeIcon className="h-3 w-3" />
              {lessonTypeLabels[lesson.type] ?? lesson.type}
            </span>
            {isTheoryLike && (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />~{readingTime} min
              </span>
            )}
            {isCompleted && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Completat</span>
              </span>
            )}
            {user && (
              <BookmarkButton
                lessonId={lessonId}
                initialBookmarked={!!bookmark}
              />
            )}
          </div>
        </div>
      </div>

      {/* Lesson content */}
      <div className="flex-1 px-6 py-8">
        <div className={`${shellClass} mx-auto`}>
          <h1 className="mb-8 text-balance bg-gradient-to-r from-[#6C5CE7] to-[#00CEC9] bg-clip-text pb-1 text-3xl font-bold leading-[1.15] text-transparent">
            {lesson.title}
          </h1>

          {isComingSoon ? (
            /* Coming-soon placeholder — calm, neutral state, not an error */
            <div className="mt-4 rounded-2xl border border-border bg-muted/30 px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-base font-medium text-foreground">
                Această lecție va fi disponibilă în curând.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Lucrăm la conținutul acestei lecții. Revino în curând.
              </p>
            </div>
          ) : (
            <>
              {/* Theory-like lessons: client wrapper handles content + gate + complete */}
              {isTheoryLike && user && (
                <LessonPageClient
                  lessonId={lessonId}
                  courseSlug={courseSlug}
                  isCompleted={isCompleted}
                  nextLessonId={nextLesson?.lessonId ?? null}
                  nextCourseSlug={nextLesson?.courseSlug ?? null}
                  nextLessonTitle={nextLesson?.title ?? null}
                  mdxSource={mdxSource}
                  lessonType={lesson.type}
                  userId={user.id}
                  displayName={displayName}
                  avatarUrl={avatarUrl}
                  lessonTitle={lesson.title}
                  feedbackAlreadySubmitted={!!existingFeedback}
                  isGameOnly={isGameOnly}
                  interactiveState={interactiveState}
                  wowNotes={wowNotes}
                  hasWowNotes={hasWowNotes}
                  showAiQuiz={lesson.is_published === true}
                />
              )}

              {/* Quiz lessons: rendered by QuizSection (includes adaptive AI practice) */}
              {lesson.type === "quiz" && (
                <QuizSection
                  lessonId={lessonId}
                  courseSlug={courseSlug}
                  questions={(quizQuestions ?? []) as {
                    id: string;
                    question: string;
                    options: string[];
                    correct_answer: number;
                    explanation: string;
                  }[]}
                  isCompleted={isCompleted}
                />
              )}

              {/* Exercise / Project lessons (incl. lab/boss): show content + complete button */}
              {(isExerciseLike || isProjectLike) && user && (
                <LessonPageClient
                  lessonId={lessonId}
                  courseSlug={courseSlug}
                  isCompleted={isCompleted}
                  nextLessonId={nextLesson?.lessonId ?? null}
                  nextCourseSlug={nextLesson?.courseSlug ?? null}
                  nextLessonTitle={nextLesson?.title ?? null}
                  mdxSource={mdxSource}
                  lessonType={lesson.type}
                  userId={user.id}
                  displayName={displayName}
                  avatarUrl={avatarUrl}
                  lessonTitle={lesson.title}
                  feedbackAlreadySubmitted={!!existingFeedback}
                  showAiQuiz={lesson.is_published === true}
                />
              )}

              {/* Portfolio submission form — only on actual `project`
                  lessons. `boss` lessons render their own game component
                  via <LessonPageClient> above and don't take portfolio
                  submissions. */}
              {lesson.type === "project" && user && (
                <ProjectSubmissionForm
                  courseId={course.id}
                  existingProjectId={existingProject?.id ?? null}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Lesson comments — hidden for coming-soon lessons */}
      {user && !isComingSoon && (
        <div className="px-6 pb-8">
          <div className={`${railShellClass} mx-auto`}>
            <Suspense fallback={<div className="h-32 rounded-xl bg-muted/40 animate-pulse" />}>
              <LessonComments
                lessonId={lessonId}
                userLevel={userLevel}
                userId={user.id}
              />
            </Suspense>
          </div>
        </div>
      )}

      {/* Keyboard navigation (Alt+Arrow) */}
      <LessonKeyboardNav
        courseSlug={courseSlug}
        prevLessonId={prevLesson?.id ?? null}
        nextLessonId={nextLesson?.lessonId ?? null}
        nextCourseSlug={nextLesson?.courseSlug ?? null}
      />

      {/* AI Coach floating chat — hidden for coming-soon lessons */}
      {!isComingSoon && (
        <AICoachChat
          lessonTitle={lesson.title}
          lessonContent={lesson.content_md}
          lessonId={lessonId}
          isExercise={lesson.type === "exercise"}
        />
      )}

      {/* Sticky bottom — prev/next navigation only */}
      <div className="sticky bottom-0 border-t border-border bg-background/95 backdrop-blur px-6 py-4">
        <div className={`${railShellClass} mx-auto flex items-center justify-between gap-4`}>
          {/* Prev navigation */}
          <div>
            {prevLesson ? (
              <Link
                href={`/courses/${courseSlug}/${prevLesson.id}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition"
                title="Alt + ←"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Lecția anterioară</span>
                <kbd className="hidden lg:inline-flex items-center text-[10px] text-muted-foreground/50 font-mono border border-border rounded px-1 py-0.5 ml-0.5">
                  Alt ←
                </kbd>
              </Link>
            ) : (
              <Link
                href={`/courses?c=${courseSlug}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Înapoi la curs</span>
              </Link>
            )}
          </div>

          {/* Next navigation lives in the in-content CTA card (lesson-page-client) */}
        </div>
      </div>
    </div>
  );
}
