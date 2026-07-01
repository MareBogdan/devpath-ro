import { redirect } from "next/navigation";
import { FlaskConical, BookOpen } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/empty-state";
import { CoursesHero } from "@/components/course/courses-hero";
import { CoursesPageClient } from "@/components/course/courses-page-client";
import type { CourseSelectorOption } from "@/components/course/course-selector";
import type { RawLesson } from "@/lib/course-map";
import { SeedButton } from "@/components/course/seed-button";
import { SyncButton } from "@/components/course/sync-button";
import { SyncAllCoursesButton } from "@/components/course/sync-all-button";
import { SyncPromptEngineeringButton } from "@/components/course/sync-prompt-engineering-button";
import { ResetProgressButton } from "@/components/course/reset-progress-button";

interface CoursesPageProps {
  searchParams?: { c?: string };
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // ─── Parallel fetches ─────────────────────────────────────────────────────
  const [
    profileResult,
    coursesResult,
    lessonsResult,
    progressResult,
  ] = await Promise.all([
    supabase
      .from("users")
      .select("role, xp_points, level, streak_count")
      .eq("id", user.id)
      .single(),
    supabase
      .from("courses")
      .select("id, slug, title, description, difficulty")
      .order("order_index"),
    supabase
      .from("lessons")
      .select("id, title, type, course_id, order_index, is_published")
      .order("order_index"),
    supabase
      .from("user_progress")
      .select("lesson_id, completed_at")
      .eq("user_id", user.id)
      .eq("completed", true)
      .order("completed_at", { ascending: false }),
  ]);

  const profile = profileResult.data;
  const courses = coursesResult.data ?? [];
  const allLessons = lessonsResult.data ?? [];
  const progress = progressResult.data ?? [];

  const isAdmin = profile?.role === "admin";

  const completedLessonIds = progress.map((p) => p.lesson_id as string);
  const completedSet = new Set(completedLessonIds);

  // ─── Build selector options + per-course lesson map ──────────────────────
  const lessonsByCourse: Record<string, RawLesson[]> = {};
  for (const c of courses) {
    lessonsByCourse[c.id] = allLessons
      .filter((l) => l.course_id === c.id)
      .map((l) => ({
        id: l.id as string,
        title: l.title as string,
        type: l.type as string,
        order_index: l.order_index as number,
      }));
  }

  const selectorOptions: CourseSelectorOption[] = courses.map((c) => {
    const courseLessons = lessonsByCourse[c.id] ?? [];
    const completedCount = courseLessons.filter((l) =>
      completedSet.has(l.id)
    ).length;
    const publishedCount = allLessons.filter(
      (l) => l.course_id === c.id && l.is_published === true
    ).length;
    return {
      id: c.id as string,
      slug: c.slug as string,
      title: c.title as string,
      description: (c.description as string | null) ?? "",
      difficulty: (c.difficulty as number | null) ?? 2.0,
      totalLessons: courseLessons.length,
      completedLessons: completedCount,
      publishedLessons: publishedCount,
    };
  });

  // ─── Hero stats ─────────────────────────────────────────────────────────
  const totalLessonsCompleted = completedSet.size;
  // Full curriculum size — derived from the lessons actually seeded, never
  // hardcoded, so the hero can't go stale when the curriculum is restructured.
  const totalLessonsAll = selectorOptions.reduce(
    (sum, c) => sum + c.totalLessons,
    0
  );

  // Per-course state for the hero's 12 course badges.
  const courseStates: ("completed" | "started" | "locked")[] =
    selectorOptions.map((c) =>
      c.totalLessons > 0 && c.completedLessons === c.totalLessons
        ? "completed"
        : c.completedLessons > 0
        ? "started"
        : "locked"
    );

  // "Continue from where you left off" — most recently completed lesson's NEXT lesson,
  // or first uncompleted lesson if no progress yet.
  let continueLessonId: string | null = null;
  let continueCourseSlug: string | null = null;
  let continueLessonTitle: string | null = null;

  if (progress.length > 0) {
    const lastCompletedId = progress[0].lesson_id as string;
    const lastCompletedLesson = allLessons.find((l) => l.id === lastCompletedId);
    if (lastCompletedLesson) {
      const courseLessons = lessonsByCourse[lastCompletedLesson.course_id as string] ?? [];
      const next = courseLessons.find(
        (l) =>
          l.order_index > (lastCompletedLesson.order_index as number) &&
          !completedSet.has(l.id)
      );
      const courseRow = courses.find(
        (c) => c.id === lastCompletedLesson.course_id
      );
      if (next && courseRow) {
        continueLessonId = next.id;
        continueCourseSlug = courseRow.slug as string;
        continueLessonTitle = next.title;
      }
    }
  }

  // Fallback: first uncompleted lesson of the first course
  if (!continueLessonId && courses.length > 0) {
    for (const c of courses) {
      const firstUncompleted = (lessonsByCourse[c.id] ?? []).find(
        (l) => !completedSet.has(l.id)
      );
      if (firstUncompleted) {
        continueLessonId = firstUncompleted.id;
        continueCourseSlug = c.slug as string;
        continueLessonTitle = firstUncompleted.title;
        break;
      }
    }
  }

  const continueLessonHref =
    continueLessonId && continueCourseSlug
      ? `/courses/${continueCourseSlug}/${continueLessonId}`
      : null;

  // ─── Initial selected course ─────
  // Priority: ?c=<slug> query param (from /courses/[slug] redirect) → continue
  // course → first course
  let initialCourseId = courses[0]?.id as string | undefined;
  if (continueCourseSlug) {
    const matched = courses.find((c) => c.slug === continueCourseSlug);
    if (matched) initialCourseId = matched.id as string;
  }
  if (searchParams?.c) {
    const requested = courses.find((c) => c.slug === searchParams.c);
    if (requested) initialCourseId = requested.id as string;
  }

  const isEmpty = courses.length === 0;

  return (
    <div className="pb-20">
      {!isEmpty && (
        <CoursesHero
          completedCount={totalLessonsCompleted}
          totalLessons={totalLessonsAll}
          courseStates={courseStates}
          continueLessonHref={continueLessonHref}
          continueLessonTitle={continueLessonTitle}
        />
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {isEmpty ? (
          <EmptyState
            icon={BookOpen}
            title="Niciun curs disponibil"
            description="Baza de date este goală. Folosește butoanele de development pentru a sincroniza conținutul MDX."
          />
        ) : (
          <CoursesPageClient
            courses={selectorOptions}
            lessonsByCourse={lessonsByCourse}
            completedLessonIds={completedLessonIds}
            initialCourseId={initialCourseId!}
          />
        )}

        {/* ─── Dev admin section — preserved, unchanged behavior ─── */}
        {isAdmin && process.env.NODE_ENV === "development" && (
          <div className="mt-16 pt-8 border-t border-border">
            <details className="group">
              <summary className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground list-none">
                <FlaskConical className="h-4 w-4" />
                <span>Opțiuni development</span>
              </summary>
              <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border space-y-6">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Sincronizare toate cursurile (curriculum nou)
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Scanează fiecare subdirector din{" "}
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      content/courses/
                    </code>
                    , îl potrivește cu un{" "}
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      courses.slug
                    </code>{" "}
                    și pentru fiecare fișier .mdx scrie{" "}
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      content_md
                    </code>{" "}
                    + setează{" "}
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      is_published = true
                    </code>
                    . Cursurile legacy sunt ignorate.
                  </p>
                  <SyncAllCoursesButton />
                </div>
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-medium text-foreground mb-1">
                    Sincronizare legacy: AI Fundamentals
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Citește fișierele din{" "}
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      content/courses/ai-fundamentals/
                    </code>{" "}
                    și upsertează lecțiile în baza de date.
                  </p>
                  <SyncButton />
                </div>
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-medium text-foreground mb-1">
                    Sincronizare legacy: Prompt Engineering Practic
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Citește fișierele din{" "}
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      content/courses/prompt-engineering-practic/
                    </code>{" "}
                    și upsertează lecțiile în baza de date.
                  </p>
                  <SyncPromptEngineeringButton />
                </div>
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-medium text-foreground mb-1">
                    Resetează progresul
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Șterge tot progresul tău din{" "}
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      user_progress
                    </code>{" "}
                    pentru a retesta fluxul de la 0%.
                  </p>
                  <ResetProgressButton />
                </div>
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-medium text-foreground mb-1">
                    Seed date de test
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Inserează din nou datele de test (va returna eroare dacă
                    există deja).
                  </p>
                  <SeedButton
                    labels={{
                      seedButton: "Inserează date de test",
                      seeding: "Se inserează datele...",
                      seedSuccess: "Date inserate cu succes!",
                    }}
                  />
                </div>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
