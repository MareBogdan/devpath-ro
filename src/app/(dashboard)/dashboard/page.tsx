import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { HeroSection } from "@/components/dashboard/hero-section";
import { PresentationSection } from "@/components/dashboard/presentation-section";
import { CoursesSection } from "@/components/dashboard/courses-section";
import { AchievementsSection } from "@/components/dashboard/achievements-section";
import { RoadmapSection } from "@/components/dashboard/roadmap-section";
import { InterviewSection } from "@/components/dashboard/interview-section";
import { CommunitySection } from "@/components/dashboard/community-section";
import { LeaderboardSection } from "@/components/dashboard/leaderboard-section";
import { PortfolioSection } from "@/components/dashboard/portfolio-section";
import { ProfileSection } from "@/components/dashboard/profile-section";
import { SideDecorations } from "@/components/dashboard/side-decorations";

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const todayIso = new Date().toISOString().split("T")[0];

  // ─── All 13 queries in parallel ──────────────────────────────────────────
  const [
    profileResult,
    completedProgressResult,
    allLessonsResult,
    allCoursesResult,
    topUsersResult,
    userBadgesResult,
    allBadgesResult,
    earnedBadgesRawResult,
    recentCompletionsRawResult,
    totalUsersResult,
    activeTodayResult,
    communityFeedRawResult,
    flashcardCountResult,
  ] = await Promise.all([
    // User profile
    supabase
      .from("users")
      .select("name, plan, streak_count, last_active, xp_points, level, avatar_url")
      .eq("id", user.id)
      .single(),

    // Completed progress (with timestamps, sorted newest first)
    supabase
      .from("user_progress")
      .select("lesson_id, completed_at")
      .eq("user_id", user.id)
      .eq("completed", true)
      .order("completed_at", { ascending: false }),

    // All lessons (for next-lesson logic + total count)
    supabase
      .from("lessons")
      .select("id, title, type, course_id, order_index")
      .order("order_index"),

    // All courses
    supabase
      .from("courses")
      .select("id, slug, title, description, difficulty, order_index")
      .order("order_index"),

    // Top 5 users by XP (leaderboard)
    supabase
      .from("users")
      .select("id, name, xp_points, level, avatar_url")
      .order("xp_points", { ascending: false })
      .limit(5),

    // Current user badge count
    supabase
      .from("user_badges")
      .select("id")
      .eq("user_id", user.id),

    // Total badges available
    supabase
      .from("badges")
      .select("id"),

    // Recent earned badges with full details (achievements + portfolio)
    supabase
      .from("user_badges")
      .select("earned_at, badges(slug, name, icon)")
      .eq("user_id", user.id)
      .order("earned_at", { ascending: false })
      .limit(6),

    // Recent completed lessons with course name (achievements timeline)
    supabase
      .from("user_progress")
      .select("completed_at, lessons(title, courses(title))")
      .eq("user_id", user.id)
      .eq("completed", true)
      .order("completed_at", { ascending: false })
      .limit(5),

    // Total registered users (community section)
    supabase
      .from("users")
      .select("id", { count: "exact", head: true }),

    // Users active today (community section)
    supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .gte("last_active", todayIso),

    // Community feed — recent completions across all users
    supabase
      .from("user_progress")
      .select("completed_at, users(name), lessons(title)")
      .eq("completed", true)
      .order("completed_at", { ascending: false })
      .limit(8),

    // Total flashcards available (for InterviewSection stats)
    supabase
      .from("flashcards")
      .select("id", { count: "exact", head: true }),
  ]);

  // Unwrap results
  const { data: profile } = profileResult;
  const { data: completedProgress } = completedProgressResult;
  const { data: allLessons } = allLessonsResult;
  const { data: allCourses } = allCoursesResult;
  const { data: topUsers } = topUsersResult;
  const { data: userBadges } = userBadgesResult;
  const { data: allBadges } = allBadgesResult;
  const { data: earnedBadgesRaw } = earnedBadgesRawResult;
  const { data: recentCompletionsRaw } = recentCompletionsRawResult;
  const totalUsersCount = totalUsersResult.count;
  const activeTodayCount = activeTodayResult.count;
  const { data: communityFeedRaw } = communityFeedRawResult;
  const flashcardCount = flashcardCountResult.count ?? 0;

  // ─── Compute derived data ─────────────────────────────────────────────────

  const displayName =
    profile?.name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "Student";

  const completedIds = new Set(
    (completedProgress ?? []).map((p) => p.lesson_id)
  );
  const completedCount = completedIds.size;
  const totalLessons = allLessons?.length ?? 0;

  // Absence data
  const lastActive = profile?.last_active ? new Date(profile.last_active as string) : null;
  const daysAbsent = lastActive
    ? Math.floor((Date.now() - lastActive.getTime()) / 86_400_000)
    : 0;

  // Last lesson info
  const lastActivityLesson = (completedProgress ?? [])[0] ?? null;
  const lastLessonData = lastActivityLesson
    ? (allLessons ?? []).find((l) => l.id === lastActivityLesson.lesson_id)
    : null;
  const lastLessonCourse = lastLessonData
    ? (allCourses ?? []).find((c) => c.id === lastLessonData.course_id)
    : null;
  const lastLessonHref =
    lastLessonData && lastLessonCourse
      ? `/courses/${lastLessonCourse.slug}/${lastLessonData.id}`
      : null;

  // Weekly streak dots (Mon=0 .. Sun=6)
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7; // Monday = 0
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  const weeklyDots: boolean[] = Array(7).fill(false);
  for (const p of completedProgress ?? []) {
    if (!p.completed_at) continue;
    const d = new Date(p.completed_at);
    if (d >= startOfWeek) {
      const idx = (d.getDay() + 6) % 7;
      weeklyDots[idx] = true;
    }
  }

  // Courses with progress + next lesson
  const coursesForCards = (allCourses ?? []).map((course) => {
    const courseLessons = (allLessons ?? [])
      .filter((l) => l.course_id === course.id)
      .sort((a, b) => a.order_index - b.order_index);
    const completed = courseLessons.filter((l) => completedIds.has(l.id)).length;
    const nextLesson = courseLessons.find((l) => !completedIds.has(l.id));
    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description ?? "",
      difficulty: (course.difficulty as number | null) ?? 2.0,
      totalLessons: courseLessons.length,
      completedLessons: completed,
      nextLessonId: nextLesson?.id,
      nextLessonTitle: nextLesson?.title,
    };
  });

  // Roadmap data (same courses, simpler shape)
  const roadmapCourses = coursesForCards.map((c) => ({
    title: c.title,
    totalLessons: c.totalLessons,
    completedLessons: c.completedLessons,
  }));

  // Leaderboard data
  const leaderboardUsers = (topUsers ?? []).map((u) => ({
    id: u.id as string,
    name: u.name as string | null,
    xpPoints: (u.xp_points as number | null) ?? 0,
    level: (u.level as number | null) ?? 1,
    avatarUrl: u.avatar_url as string | null,
  }));

  const badgesEarned = userBadges?.length ?? 0;
  const totalBadgesCount = allBadges?.length ?? 0;

  const xpPoints = (profile?.xp_points as number | null) ?? 0;
  const userLevel = (profile?.level as number | null) ?? 1;
  const streakCount = profile?.streak_count ?? 0;

  // ─── Derived data for new sections ────────────────────────────────────────

  // Earned badge icons for portfolio + achievements
  const earnedBadgeIcons = (earnedBadgesRaw ?? []).flatMap((row) => {
    const badgeRaw = row.badges as unknown;
    const badge = (Array.isArray(badgeRaw) ? badgeRaw[0] : badgeRaw) as
      | { slug: string; name: string; icon: string }
      | null
      | undefined;
    if (!badge) return [];
    return [{ slug: badge.slug, name: badge.name, icon: badge.icon }];
  });

  // Recent lessons for achievements timeline
  const recentLessons = (recentCompletionsRaw ?? []).flatMap((row) => {
    const lessonRaw = row.lessons as unknown;
    const lesson = (Array.isArray(lessonRaw) ? lessonRaw[0] : lessonRaw) as
      | { title: string; courses: unknown }
      | null
      | undefined;
    if (!lesson || !row.completed_at) return [];
    const coursesRaw = lesson.courses as unknown;
    const course = (Array.isArray(coursesRaw) ? coursesRaw[0] : coursesRaw) as
      | { title: string }
      | null
      | undefined;
    return [{
      lessonTitle: lesson.title,
      courseTitle: course?.title ?? "",
      completedAt: row.completed_at as string,
    }];
  });

  // Community feed
  const communityFeed = (communityFeedRaw ?? []).flatMap((row) => {
    if (!row.completed_at) return [];
    const uRaw = row.users as unknown;
    const u = (Array.isArray(uRaw) ? uRaw[0] : uRaw) as { name: string | null } | null | undefined;
    const lRaw = row.lessons as unknown;
    const l = (Array.isArray(lRaw) ? lRaw[0] : lRaw) as { title: string } | null | undefined;
    return [{
      userName: u?.name ?? null,
      lessonTitle: l?.title ?? null,
      completedAt: row.completed_at as string,
    }];
  });

  // Completed course names for skills pills
  const completedCourseNames = coursesForCards
    .filter((c) => c.completedLessons === c.totalLessons && c.totalLessons > 0)
    .map((c) => c.title);

  return (
    <div className="pt-4 pb-16 relative">
      <SideDecorations />

      {/* 1 — Hero */}
      <HeroSection
        userName={displayName}
        xpPoints={xpPoints}
        level={userLevel}
        streakCount={streakCount}
        lessonsCompleted={completedCount}
        totalLessons={totalLessons}
        daysAbsent={daysAbsent}
        lastLessonTitle={lastLessonData?.title ?? null}
        lastLessonHref={lastLessonHref}
        weeklyDots={weeklyDots}
      />

      {/* 2 — Ce poți face pe DevPath */}
      <PresentationSection />

      {/* 3 — Cursurile tale */}
      <CoursesSection courses={coursesForCards} />

      {/* 4 — Realizările tale */}
      <AchievementsSection
        badgesEarned={earnedBadgeIcons}
        recentLessons={recentLessons}
        totalXp={xpPoints}
        currentStreak={streakCount}
      />

      {/* 5 — Roadmap */}
      <RoadmapSection courses={roadmapCourses} />

      {/* 6 — Simulare interviu */}
      <InterviewSection
        flashcardCount={flashcardCount}
        simulationCount={0}
        domainCount={(allCourses ?? []).length}
      />

      {/* 7 — Comunitate */}
      <CommunitySection
        totalUsers={totalUsersCount ?? 0}
        activeToday={activeTodayCount ?? 0}
        recentCompletions={communityFeed}
      />

      {/* 8 — Clasament */}
      <LeaderboardSection
        topUsers={leaderboardUsers}
        currentUserId={user.id}
      />

      {/* 9 — Portofoliu */}
      <PortfolioSection
        userName={displayName}
        avatarUrl={profile?.avatar_url ?? null}
        level={userLevel}
        xpPoints={xpPoints}
        streakCount={streakCount}
        badgesEarned={badgesEarned}
        totalBadges={totalBadgesCount}
        earnedBadgeIcons={earnedBadgeIcons}
        completedCourseNames={completedCourseNames}
      />

      {/* 10 — Profil & Setări */}
      <ProfileSection
        badgesEarned={badgesEarned}
        totalBadges={totalBadgesCount}
        lastActive={profile?.last_active as string | null ?? null}
      />
    </div>
  );
}
