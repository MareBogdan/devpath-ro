import type { SupabaseClient } from "@supabase/supabase-js";

export interface NextLesson {
  lessonId: string;
  title: string;
  /** Slug of the course the lesson belongs to — differs from the current course when crossing a course boundary. */
  courseSlug: string;
}

/**
 * The lesson a learner should open after `lessonOrderIndex` in `courseId`:
 *   1. the next PUBLISHED lesson in the same course; else
 *   2. the first published lesson of the next course (by courses.order_index) that
 *      has any — courses with no published lessons ("În curând") are skipped.
 * Returns null at the end of the available curriculum.
 *
 * Plain server-side helper (no "use server") so it is safe to import from both
 * RSC pages and server actions without becoming a client-callable action.
 */
export async function getNextLesson(
  supabase: SupabaseClient,
  courseId: string,
  lessonOrderIndex: number
): Promise<NextLesson | null> {
  const { data: course } = await supabase
    .from("courses")
    .select("slug, order_index")
    .eq("id", courseId)
    .maybeSingle();
  if (!course) return null;

  const { data: sameCourse } = await supabase
    .from("lessons")
    .select("id, title")
    .eq("course_id", courseId)
    .eq("is_published", true)
    .gt("order_index", lessonOrderIndex)
    .order("order_index", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (sameCourse) {
    return {
      lessonId: sameCourse.id as string,
      title: sameCourse.title as string,
      courseSlug: course.slug as string,
    };
  }

  const { data: laterCourses } = await supabase
    .from("courses")
    .select("id, slug")
    .gt("order_index", course.order_index)
    .order("order_index", { ascending: true });

  for (const c of laterCourses ?? []) {
    const { data: first } = await supabase
      .from("lessons")
      .select("id, title")
      .eq("course_id", c.id)
      .eq("is_published", true)
      .order("order_index", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (first) {
      return {
        lessonId: first.id as string,
        title: first.title as string,
        courseSlug: c.slug as string,
      };
    }
  }

  return null;
}
