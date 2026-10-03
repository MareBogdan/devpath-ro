"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface LessonKeyboardNavProps {
  courseSlug: string;
  prevLessonId: string | null;
  nextLessonId: string | null;
  /** Course the next lesson lives in (differs from courseSlug across a course boundary). */
  nextCourseSlug?: string | null;
}

/**
 * Invisible component that adds Alt+ArrowLeft / Alt+ArrowRight keyboard
 * shortcuts for lesson navigation.
 */
export function LessonKeyboardNav({
  courseSlug,
  prevLessonId,
  nextLessonId,
  nextCourseSlug,
}: LessonKeyboardNavProps) {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!e.altKey) return;

      if (e.key === "ArrowRight" && nextLessonId) {
        e.preventDefault();
        router.push(`/courses/${nextCourseSlug ?? courseSlug}/${nextLessonId}`);
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (prevLessonId) {
          router.push(`/courses/${courseSlug}/${prevLessonId}`);
        } else {
          // First lesson — Alt+← goes back to the course map with this
          // course pre-selected.
          router.push(`/courses?c=${courseSlug}`);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [courseSlug, prevLessonId, nextLessonId, nextCourseSlug, router]);

  return null;
}
