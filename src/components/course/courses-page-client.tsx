"use client";

import { useMemo } from "react";
import { Clock, Lock } from "lucide-react";
import { type CourseSelectorOption } from "@/components/course/course-selector";
import { CourseMap } from "@/components/course/course-map";
import { buildAllCoursesNodes, type RawCourse, type RawLesson } from "@/lib/course-map";

interface CoursesPageClientProps {
  courses: CourseSelectorOption[];
  lessonsByCourse: Record<string, RawLesson[]>;
  completedLessonIds: string[]; // serializable
  initialCourseId: string;
}

export function CoursesPageClient({
  courses,
  lessonsByCourse,
  completedLessonIds,
  initialCourseId,
}: CoursesPageClientProps) {
  // Build the single continuous 12-course node list once.
  const built = useMemo(() => {
    const completedSet = new Set(completedLessonIds);
    const rawCourses: RawCourse[] = courses.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
    }));
    return buildAllCoursesNodes({
      courses: rawCourses,
      lessonsByCourse,
      completedLessonIds: completedSet,
    });
  }, [courses, lessonsByCourse, completedLessonIds]);

  // On load, scroll the unified serpentine to the first NOT-completed lesson of
  // the course requested via ?c= (the first lesson when nothing is done or the
  // course is finished). Per-course status now lives on each World Gate, so the
  // old course-card grid is gone — the page is hero → serpentine.
  const initialSection = built.sections.find(
    (s) => s.courseId === initialCourseId
  );
  const activeNodeId =
    (initialSection && built.nextLessonByCourse[initialSection.courseId]) ||
    initialSection?.firstNodeId ||
    built.currentLessonId ||
    undefined;

  // Courses with no published lessons yet — listed as locked "În curând" cards.
  const comingSoon = courses.filter((c) => c.publishedLessons === 0);

  return (
    <>
      <CourseMap
        nodes={built.nodes}
        currentLessonId={built.currentLessonId}
        activeNodeId={activeNodeId}
        nodeCourseSlug={built.nodeCourseSlug}
        completedCount={built.completedCount}
        totalCount={built.totalCount}
      />

      {comingSoon.length > 0 && (
        <section aria-labelledby="coming-soon-heading" className="mt-12">
          <h2
            id="coming-soon-heading"
            className="mb-4 text-lg font-semibold text-foreground"
          >
            În curând
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {comingSoon.map((c) => (
              <li
                key={c.id}
                className="flex items-start gap-3 rounded-xl border border-border bg-card/60 p-4 opacity-70"
              >
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-tight text-foreground">
                    {c.title}
                  </p>
                  {c.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {c.description}
                    </p>
                  )}
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                  <Clock className="h-3 w-3" />
                  În curând
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
