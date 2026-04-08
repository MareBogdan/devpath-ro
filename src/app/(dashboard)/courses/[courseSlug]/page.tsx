import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  ChevronRight,
  BookOpen,
  CheckCircle2,
  Clock,
  BarChart3,
  PlayCircle,
  FileText,
  HelpCircle,
  Wrench,
  FolderOpen,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Lesson } from "@/types";

interface PageProps {
  params: { courseSlug: string };
}

const lessonTypeIcon: Record<string, React.ElementType> = {
  theory: FileText,
  quiz: HelpCircle,
  exercise: Wrench,
  project: FolderOpen,
};

const lessonTypeColor: Record<string, string> = {
  theory: "text-blue-500",
  quiz: "text-purple-500",
  exercise: "text-orange-500",
  project: "text-green-500",
};

// Module structure for AI Fundamentals (derived from order_index)
const MODULE_TITLES: Record<number, string> = {
  1: "Introducere în AI",
  2: "Machine Learning",
  3: "Rețele Neuronale și Deep Learning",
  4: "Modele de Limbaj și Prompt Engineering",
  5: "AI în Practică",
  6: "Proiect Final",
};

function getModuleNumber(orderIndex: number): number {
  if (orderIndex <= 4) return 1;
  if (orderIndex <= 9) return 2;
  if (orderIndex <= 14) return 3;
  if (orderIndex <= 19) return 4;
  if (orderIndex <= 24) return 5;
  return 6;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createSupabaseServerClient();
  const { data: course } = await supabase
    .from("courses")
    .select("title, description")
    .eq("slug", params.courseSlug)
    .single();

  if (!course) return { title: "Curs — DevPath RO" };

  const ogTitle = encodeURIComponent(course.title);
  const ogDesc = encodeURIComponent(course.description ?? "Curs interactiv pe DevPath RO.");

  return {
    title: course.title,
    description: course.description ?? undefined,
    openGraph: {
      title: `${course.title} — DevPath RO`,
      description: course.description ?? undefined,
      images: [
        {
          url: `/og?title=${ogTitle}&description=${ogDesc}`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { courseSlug } = params;
  const difficultyLabels: Record<string, string> = {
    beginner: "Începător",
    intermediate: "Intermediar",
    advanced: "Avansat",
  };

  const lessonTypeLabels: Record<string, string> = {
    theory: "Teorie",
    quiz: "Quiz",
    exercise: "Exercițiu",
    project: "Proiect",
  };

  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch course
  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", courseSlug)
    .single();

  if (!course) notFound();

  // Fetch lessons ordered
  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", course.id)
    .order("order_index");

  const allLessons: Lesson[] = lessons ?? [];

  // Fetch user progress for this course
  const { data: progress } = user
    ? await supabase
        .from("user_progress")
        .select("lesson_id, completed")
        .eq("user_id", user.id)
        .in(
          "lesson_id",
          allLessons.map((l) => l.id)
        )
    : { data: [] };

  const completedIds = new Set(
    (progress ?? []).filter((p) => p.completed).map((p) => p.lesson_id)
  );

  const completedCount = completedIds.size;
  const totalCount = allLessons.length;
  const percent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Find the first non-completed lesson for the CTA
  const firstIncomplete = allLessons.find((l) => !completedIds.has(l.id));
  const ctaLessonId = firstIncomplete?.id ?? allLessons[0]?.id;

  // Group lessons by module
  const moduleGroups: Record<number, Lesson[]> = {};
  for (const lesson of allLessons) {
    const mod = getModuleNumber(lesson.order_index);
    if (!moduleGroups[mod]) moduleGroups[mod] = [];
    moduleGroups[mod].push(lesson);
  }
  const sortedModuleNumbers = Object.keys(moduleGroups)
    .map(Number)
    .sort((a, b) => a - b);

  const difficultyStyles: Record<string, string> = {
    beginner:
      "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400",
    intermediate:
      "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400",
    advanced:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400",
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/courses" className="hover:text-foreground transition">
            Cursuri
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{course.title}</span>
        </nav>

        {/* Course header card */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-border p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0">
              <BookOpen className="h-7 w-7" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span
                  className={cn(
                    "text-xs font-medium border rounded-full px-2.5 py-0.5",
                    difficultyStyles[course.difficulty]
                  )}
                >
                  {difficultyLabels[course.difficulty] ?? course.difficulty}
                </span>
                {course.is_free && (
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-950 border border-green-200 dark:border-green-900 rounded-full px-2.5 py-0.5">
                    Gratuit
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {course.title}
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {course.description}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-blue-200/50 dark:border-blue-800/30">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Dificultate</p>
                <p className="text-sm font-medium text-foreground">
                  {difficultyLabels[course.difficulty] ?? course.difficulty}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Lecții</p>
                <p className="text-sm font-medium text-foreground">
                  {totalCount} lecții
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Progresul tău</p>
                <p className="text-sm font-medium text-foreground">
                  {completedCount}/{totalCount} completate
                </p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progresul tău</span>
              <span>{percent}%</span>
            </div>
            <Progress value={percent} className="h-2" />
          </div>

          {/* Start / Continue CTA */}
          {ctaLessonId && (
            <div className="mt-5">
              <Link
                href={`/courses/${courseSlug}/${ctaLessonId}`}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-2.5 rounded-lg transition"
              >
                <PlayCircle className="h-4 w-4" />
                {completedCount > 0 ? "Continuă cursul" : "Începe lecția"}
              </Link>
            </div>
          )}
        </div>

        {/* Lessons list — grouped by module */}
        <div className="space-y-8">
          {sortedModuleNumbers.map((moduleNum) => {
            const moduleLessons = moduleGroups[moduleNum];
            const moduleCompleted = moduleLessons.filter((l) =>
              completedIds.has(l.id)
            ).length;
            const moduleTitle =
              MODULE_TITLES[moduleNum] ?? `Modul ${moduleNum}`;

            return (
              <div key={moduleNum}>
                {/* Module header */}
                <div className="flex items-center justify-between mb-3">
                  <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {moduleNum}
                    </span>
                    {moduleTitle}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {moduleCompleted}/{moduleLessons.length} completate
                  </span>
                </div>

                {/* Lesson rows */}
                <div className="space-y-2 pl-2 border-l-2 border-border ml-3">
                  {moduleLessons.map((lesson) => {
                    const isCompleted = completedIds.has(lesson.id);
                    const TypeIcon = lessonTypeIcon[lesson.type] ?? FileText;
                    const typeColor =
                      lessonTypeColor[lesson.type] ?? "text-blue-500";
                    // Global index for numbering
                    const globalIndex = allLessons.findIndex(
                      (l) => l.id === lesson.id
                    );

                    return (
                      <Link
                        key={lesson.id}
                        href={`/courses/${courseSlug}/${lesson.id}`}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-xl border transition-all group",
                          isCompleted
                            ? "border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20 hover:border-green-300"
                            : "border-border bg-card hover:border-primary/30 hover:bg-accent/50"
                        )}
                      >
                        {/* Index or checkmark */}
                        <div
                          className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0",
                            isCompleted
                              ? "bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <span>{globalIndex + 1}</span>
                          )}
                        </div>

                        {/* Lesson info */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "font-medium text-sm leading-snug",
                              isCompleted
                                ? "text-muted-foreground"
                                : "text-foreground"
                            )}
                          >
                            {lesson.title}
                          </p>
                        </div>

                        {/* Type badge */}
                        <div
                          className={cn(
                            "flex items-center gap-1.5 shrink-0",
                            typeColor
                          )}
                        >
                          <TypeIcon className="h-4 w-4" />
                          <span className="text-xs font-medium hidden sm:block">
                            {lessonTypeLabels[lesson.type] ?? lesson.type}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
