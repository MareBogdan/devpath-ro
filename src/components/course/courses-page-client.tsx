"use client";

import { useMemo } from "react";
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

  // On load, scroll the unified serpentine to the course requested via ?c=
  // (or the user's current lesson). Per-course status now lives on each World
  // Gate, so the old course-card grid is gone — the page is hero → serpentine.
  const initialSection = built.sections.find(
    (s) => s.courseId === initialCourseId
  );
  const activeNodeId =
    initialSection?.firstNodeId ?? built.currentLessonId ?? undefined;

  return (
    <CourseMap
      nodes={built.nodes}
      currentLessonId={built.currentLessonId}
      activeNodeId={activeNodeId}
      nodeCourseSlug={built.nodeCourseSlug}
      completedCount={built.completedCount}
      totalCount={built.totalCount}
    />
  );
}
