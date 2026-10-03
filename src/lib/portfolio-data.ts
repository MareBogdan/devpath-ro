// Pure helpers shared by /profile and the public /u/[username] portfolio.
// Input rows are plain data — callers decide which Supabase client fetched them.

export interface CourseLite {
  id: string;
  slug: string;
  title: string;
  order_index: number | null;
}

export interface LessonLite {
  id: string;
  course_id: string;
}

export interface CourseProgress {
  id: string;
  slug: string;
  title: string;
  total: number;
  completed: number;
  /** completed / total, 0 when the course has no published lessons */
  ratio: number;
}

/** Per-course completion, in curriculum order. `lessons` must be PUBLISHED lessons only. */
export function computeCourseProgress(
  courses: CourseLite[],
  lessons: LessonLite[],
  completedLessonIds: Set<string>
): CourseProgress[] {
  const byCourse = new Map<string, LessonLite[]>();
  for (const l of lessons) {
    const list = byCourse.get(l.course_id);
    if (list) list.push(l);
    else byCourse.set(l.course_id, [l]);
  }

  return [...courses]
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((c) => {
      const courseLessons = byCourse.get(c.id) ?? [];
      const completed = courseLessons.filter((l) => completedLessonIds.has(l.id)).length;
      const total = courseLessons.length;
      return {
        id: c.id,
        slug: c.slug,
        title: c.title,
        total,
        completed,
        ratio: total > 0 ? completed / total : 0,
      };
    });
}

/** Courses the learner has finished (every published lesson completed). */
export function finishedCourses(progress: CourseProgress[]): CourseProgress[] {
  return progress.filter((c) => c.total > 0 && c.completed === c.total);
}

/**
 * Learning-DNA radar axes. The radar component draws a hexagon, so it needs EXACTLY
 * six axes: the first six courses in curriculum order (shorter lists are padded).
 */
export function radarAxes(progress: CourseProgress[]): { name: string; value: number }[] {
  const axes = progress.slice(0, 6).map((c) => ({
    name: c.title.length > 30 ? `${c.title.slice(0, 29)}…` : c.title,
    value: c.ratio,
  }));
  while (axes.length < 6) axes.push({ name: "—", value: 0 });
  return axes;
}

/**
 * Escape `\`, `%` and `_` so user-supplied text is matched literally by LIKE / ILIKE
 * (PostgreSQL's default escape character is the backslash).
 */
export function escapeLikePattern(input: string): string {
  return input.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

/**
 * A public-profile handle is a referral code or an email local-part: letters, digits
 * and `. _ + -`. Anything else can't be a real handle and is rejected outright.
 */
export function isValidProfileHandle(input: string): boolean {
  return /^[A-Za-z0-9._+-]{1,64}$/.test(input);
}
