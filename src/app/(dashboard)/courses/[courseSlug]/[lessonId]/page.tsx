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
import { BookmarkButton } from "@/components/course/bookmark-button";
import { QuizSection } from "@/components/course/quiz-section";
import { AICoachChat } from "@/components/course/ai-coach-chat";
import { LessonKeyboardNav } from "@/components/course/lesson-keyboard-nav";
import { LessonComments } from "@/components/course/lesson-comments";
import { ProjectSubmissionForm } from "@/components/course/project-submission-form";
import { cn } from "@/lib/utils";
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

interface GateQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
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
  const mdxSource = await serialize(lesson.content_md ?? "", {
    mdxOptions: {
      remarkPlugins: [remarkGfm, remarkMath],
      rehypePlugins: [rehypeHighlight, rehypeKatex],
    },
  });

  // Fetch all lessons in course for navigation
  const { data: allLessons } = await supabase
    .from("lessons")
    .select("id, title, order_index, type")
    .eq("course_id", course.id)
    .order("order_index");

  const lessons: Pick<Lesson, "id" | "title" | "order_index" | "type">[] =
    allLessons ?? [];
  const currentIndex = lessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

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

  // Fetch gate questions (theory-like lessons only)
  // Dual-mode retired: load technical + both-mode questions, skip simple-only.
  const { data: gateQuestionsRaw } = isTheoryLike
    ? await supabase
        .from("lesson_gate_questions")
        .select("id, question, options, correct_answer, explanation")
        .eq("lesson_id", lessonId)
        .in("mode", ["technical", "both"])
        .order("display_order")
    : { data: [] };

  const gateQuestions = (gateQuestionsRaw ?? []) as GateQuestion[];

  // Fetch bookmark status
  const { data: bookmark } = user
    ? await supabase
        .from("lesson_bookmarks")
        .select("id")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .single()
    : { data: null };

  // Fetch feedback status (to avoid duplicate prompt)
  const { data: existingFeedback } = user
    ? await supabase
        .from("lesson_feedback")
        .select("id")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .single()
    : { data: null };

  // User display info for Realtime presence
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "Student";
  const avatarUrl =
    (user?.user_metadata?.avatar_url as string | null | undefined) ?? null;

  // Fetch existing project submission (project-like lessons only)
  const { data: existingProject } =
    isProjectLike && user
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
        <div className="max-w-[680px] mx-auto flex items-center justify-between gap-4">
          {/* ← Back to course + breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground min-w-0">
            <Link
              href={`/courses?c=${courseSlug}`}
              className="inline-flex items-center gap-1 shrink-0 font-medium text-muted-foreground hover:text-foreground transition"
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
        <div className="max-w-[680px] mx-auto">
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
                  nextLessonId={nextLesson?.id ?? null}
                  nextLessonTitle={nextLesson?.title ?? null}
                  mdxSource={mdxSource}
                  lessonType={lesson.type}
                  lessonOrder={lesson.order_index}
                  gateQuestions={gateQuestions}
                  userId={user.id}
                  displayName={displayName}
                  avatarUrl={avatarUrl}
                  lessonTitle={lesson.title}
                  feedbackAlreadySubmitted={!!existingFeedback}
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
                  nextLessonId={nextLesson?.id ?? null}
                  nextLessonTitle={nextLesson?.title ?? null}
                  mdxSource={mdxSource}
                  lessonType={lesson.type}
                  lessonOrder={lesson.order_index}
                  gateQuestions={[]}
                  userId={user.id}
                  displayName={displayName}
                  avatarUrl={avatarUrl}
                  lessonTitle={lesson.title}
                  feedbackAlreadySubmitted={!!existingFeedback}
                />
              )}

              {/* Project submission form (project + boss) */}
              {isProjectLike && user && (
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
          <div className="max-w-[680px] mx-auto">
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
        nextLessonId={nextLesson?.id ?? null}
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
        <div className="max-w-[680px] mx-auto flex items-center justify-between gap-4">
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
