// src/app/(dashboard)/portfolio/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Star, ExternalLink, Heart } from "lucide-react";
import Link from "next/link";
import { PortfolioHeader } from "@/components/portfolio/portfolio-header";
import { PortfolioStats } from "@/components/portfolio/portfolio-stats";
import { ActivityHeatmap } from "@/components/portfolio/activity-heatmap";
import { LearningDnaRadar } from "@/components/portfolio/learning-dna-radar";

const MODULE_NAMES: Record<number, string> = {
  1: "Bazele AI",
  2: "Machine Learning",
  3: "Rețele Neuronale",
  4: "NLP și LLM",
  5: "Prompt Engineering",
  6: "Aplicații AI",
};

export default async function PortfolioPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch user profile (include created_at for PortfolioHeader)
  const { data: profile } = await supabase
    .from("users")
    .select("name, plan, xp_points, level, streak_count, avatar_url, created_at, referral_code")
    .eq("id", user.id)
    .single();

  // Fetch completed progress
  const { data: progressData } = await supabase
    .from("user_progress")
    .select("lesson_id, completed_at, score")
    .eq("user_id", user.id)
    .eq("completed", true)
    .order("completed_at", { ascending: false });

  // Fetch all lessons (for course completion check + radar)
  const { data: allLessons } = await supabase
    .from("lessons")
    .select("id, course_id, module_index, type");

  // Fetch all courses
  const { data: allCourses } = await supabase
    .from("courses")
    .select("id, slug, title");

  // Fetch projects
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, description, github_url, completed_at, course_id")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false });

  // Fetch user badges
  const { data: userBadgesRaw } = await supabase
    .from("user_badges")
    .select("earned_at, badges(slug, name, description, icon)")
    .eq("user_id", user.id)
    .order("earned_at", { ascending: false });

  // Fetch bookmarked lessons with lesson info
  const { data: bookmarksRaw } = await supabase
    .from("lesson_bookmarks")
    .select("lesson_id, lessons(title, course_id, courses(slug, title))")
    .eq("user_id", user.id)
    .order("lesson_id", { ascending: false });

  // ─── Computed ─────────────────────────────────────────────────────────────

  const completedIds = new Set((progressData ?? []).map((p) => p.lesson_id));

  const completedCourses = (allCourses ?? []).filter((course) => {
    const courseLessons = (allLessons ?? []).filter(
      (l) => l.course_id === course.id
    );
    return courseLessons.length > 0 && courseLessons.every((l) => completedIds.has(l.id));
  });

  // Build progress map for score lookups
  const progressMap = new Map(
    (progressData ?? []).map((p) => [p.lesson_id, p])
  );

  // Per-module radar values
  const radarModules = [1, 2, 3, 4, 5, 6].map((moduleIdx) => {
    const moduleLessons = (allLessons ?? []).filter(
      (l) => l.module_index === moduleIdx
    );
    const completedInModule = moduleLessons.filter((l) => completedIds.has(l.id));
    const completionRate =
      moduleLessons.length > 0
        ? completedInModule.length / moduleLessons.length
        : 0;

    const quizLessons = completedInModule.filter((l) => l.type === "quiz");
    const quizScores = quizLessons
      .map((l) => progressMap.get(l.id)?.score ?? 0)
      .filter((s) => s > 0);
    const avgScoreNorm =
      quizScores.length > 0
        ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length / 100
        : 1;

    return {
      name: MODULE_NAMES[moduleIdx] ?? `Modul ${moduleIdx}`,
      value: Math.min(1, completionRate * avgScoreNorm),
    };
  });

  // Heatmap: completion dates for last 52 weeks
  const completionDates = (progressData ?? [])
    .filter((p) => p.completed_at)
    .map((p) => (p.completed_at as string).split("T")[0]);

  // Flatten badges
  const badges = (userBadgesRaw ?? []).flatMap((row) => {
    const b = row.badges;
    if (!b || Array.isArray(b)) return [];
    const badge = b as { slug: string; name: string; description: string; icon: string };
    return [{ ...badge, earned_at: row.earned_at as string }];
  });

  const displayName = profile?.name ?? user.email?.split("@")[0] ?? "Student";
  const username = profile?.referral_code || (user.email?.split("@")[0] ?? user.id.slice(0, 8));
  const joinDate = (profile as { created_at?: string } | null)?.created_at ?? new Date().toISOString();

  return (
    <div className="p-6 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <PortfolioHeader
          name={displayName}
          avatarUrl={profile?.avatar_url ?? null}
          level={profile?.level ?? 1}
          xp={profile?.xp_points ?? 0}
          streak={profile?.streak_count ?? 0}
          joinDate={joinDate}
          username={username}
        />

        {/* Stats */}
        <PortfolioStats
          completedCourses={completedCourses.length}
          completedLessons={completedIds.size}
          badgeCount={badges.length}
          projectCount={(projects ?? []).length}
        />

        {/* Activity heatmap */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            Activitate — ultimele 52 de săptămâni
          </h2>
          <ActivityHeatmap completionDates={completionDates} />
        </div>

        {/* Learning DNA radar */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            ADN-ul de învățare
          </h2>
          <p className="text-xs text-muted-foreground mb-6">
            Procentul de completare per modul × scorul mediu la quiz-uri
          </p>
          <LearningDnaRadar modules={radarModules} />
        </div>

        {/* Completed courses */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Cursuri terminate
          </h3>
          {completedCourses.length === 0 ? (
            <div className="rounded-xl bg-card border border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">Niciun curs terminat încă.</p>
              <Link
                href="/courses"
                className="mt-3 text-sm font-medium text-primary hover:underline inline-block"
              >
                Explorează cursurile
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {completedCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{course.title}</p>
                  </div>
                  <span className="text-xs bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-medium">
                    Terminat
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Badge-uri câștigate
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.slug}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card text-center"
                  title={badge.description}
                >
                  <span className="text-3xl leading-none">{badge.icon}</span>
                  <p className="text-xs font-medium text-foreground leading-tight">
                    {badge.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {(projects ?? []).length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              Proiectele tale
            </h3>
            <div className="space-y-2">
              {projects?.map((project) => (
                <div key={project.id} className="p-4 rounded-xl bg-card border border-border">
                  <p className="font-medium text-foreground">{project.title}</p>
                  {project.description && (
                    <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                  )}
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1"
                    >
                      GitHub <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bookmarks */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" />
            Lecții salvate
          </h3>
          {(bookmarksRaw ?? []).length === 0 ? (
            <div className="rounded-xl bg-card border border-border p-8 text-center">
              <Heart className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Apasă ♥ pe orice lecție pentru a o salva aici.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {(bookmarksRaw ?? []).map((bm) => {
                const lesson = bm.lessons as unknown as {
                  title: string;
                  course_id: string;
                  courses: { slug: string; title: string } | null;
                } | null;
                if (!lesson) return null;
                const courseSlug = lesson.courses?.slug;
                const lessonHref = courseSlug
                  ? `/courses/${courseSlug}/${bm.lesson_id}`
                  : "#";
                return (
                  <Link
                    key={bm.lesson_id}
                    href={lessonHref}
                    className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:bg-accent transition-colors"
                  >
                    <Heart className="h-4 w-4 text-rose-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{lesson.title}</p>
                      {lesson.courses?.title && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {lesson.courses.title}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
