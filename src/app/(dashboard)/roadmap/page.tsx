import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  RoadmapContent,
  type CourseStat,
} from "@/components/roadmap/roadmap-content";

const AVG_MINUTES_PER_LESSON = 12;

export default async function RoadmapPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // ─── Parallel fetches ─────────────────────────────────────────────────────
  const [profileResult, coursesResult, lessonsResult, progressResult] =
    await Promise.all([
      supabase
        .from("users")
        .select("name, daily_goal_minutes, streak_count, xp_points, level")
        .eq("id", user.id)
        .single(),
      supabase
        .from("courses")
        .select("id, slug, title, description, difficulty, order_index")
        .order("order_index"),
      supabase
        .from("lessons")
        .select("id, course_id, order_index")
        .order("order_index"),
      supabase
        .from("user_progress")
        .select("lesson_id")
        .eq("user_id", user.id)
        .eq("completed", true),
    ]);

  const profile = profileResult.data;
  const allCourses = coursesResult.data ?? [];
  const allLessons = lessonsResult.data ?? [];
  const progress = progressResult.data ?? [];

  const completedIds = new Set(
    progress.map((p) => p.lesson_id as string)
  );

  const dailyGoal = (profile?.daily_goal_minutes as number | null) ?? 15;
  const streakCount = (profile?.streak_count as number | null) ?? 0;

  // ─── Per-course derived data (fully serializable — no Date objects) ──────
  const courses: CourseStat[] = allCourses.map((course) => {
    const lessons = allLessons.filter((l) => l.course_id === course.id);
    const completedCount = lessons.filter((l) =>
      completedIds.has(l.id as string)
    ).length;
    const total = lessons.length;
    const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;
    const remaining = total - completedCount;

    let daysRemaining: number | null = null;
    let estimatedFinishDateIso: string | null = null;
    if (dailyGoal > 0 && remaining > 0) {
      daysRemaining = Math.max(
        1,
        Math.ceil((remaining * AVG_MINUTES_PER_LESSON) / dailyGoal)
      );
      const d = new Date();
      d.setDate(d.getDate() + daysRemaining);
      estimatedFinishDateIso = d.toISOString();
    }

    return {
      id: course.id as string,
      slug: course.slug as string,
      title: course.title as string,
      description: (course.description as string | null) ?? "",
      difficulty: (course.difficulty as number | null) ?? 2.0,
      orderIndex: (course.order_index as number) ?? 0,
      total,
      completedCount,
      percent,
      remaining,
      daysRemaining,
      estimatedFinishDateIso,
      isComplete: percent === 100 && total > 0,
      isStarted: completedCount > 0,
    };
  });

  // ─── Overall progress (all courses combined) ──────────────────────────────
  const totalLessonsAll = courses.reduce((acc, c) => acc + c.total, 0);
  const totalCompletedAll = courses.reduce(
    (acc, c) => acc + c.completedCount,
    0
  );
  const overallPercent =
    totalLessonsAll > 0
      ? Math.round((totalCompletedAll / totalLessonsAll) * 100)
      : 0;

  return (
    <RoadmapContent
      dailyGoal={dailyGoal}
      streakCount={streakCount}
      totalCompleted={totalCompletedAll}
      totalAvailable={totalLessonsAll}
      overallPercent={overallPercent}
      courses={courses}
    />
  );
}
