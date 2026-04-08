import { notFound } from "next/navigation";
import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Trophy, Star, ExternalLink } from "lucide-react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LEVEL_NAMES } from "@/lib/gamification-constants";
import { PortfolioHeader } from "@/components/portfolio/portfolio-header";
import { PortfolioStats } from "@/components/portfolio/portfolio-stats";
import { ActivityHeatmap } from "@/components/portfolio/activity-heatmap";
import { LearningDnaRadar } from "@/components/portfolio/learning-dna-radar";
import { ShareButton } from "@/components/portfolio/share-button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ username: string }>;
}

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  xp_points: number | null;
  level: number | null;
  streak_count: number | null;
  created_at: string;
  plan: string | null;
};

// ─── Module metadata ──────────────────────────────────────────────────────────

const MODULE_NAMES: Record<number, string> = {
  1: "Bazele AI",
  2: "Machine Learning",
  3: "Rețele Neuronale",
  4: "NLP și LLM",
  5: "Prompt Engineering",
  6: "Aplicații AI",
};

// ─── Cached data fetching (deduplicates between generateMetadata + page) ──────

const resolveUser = cache(async (username: string): Promise<UserRow | null> => {
  const supabase = createSupabaseAdminClient();

  const SELECT =
    "id, email, name, avatar_url, xp_points, level, streak_count, created_at, plan";

  // 1. Try referral_code
  const { data: byReferral } = await supabase
    .from("users")
    .select(SELECT)
    .eq("referral_code", username)
    .maybeSingle();
  if (byReferral) return byReferral as UserRow;

  // 2. Fall back to email prefix match
  const { data: byEmail } = await supabase
    .from("users")
    .select(SELECT)
    .ilike("email", `${username}@%`)
    .limit(1);
  return ((byEmail as UserRow[] | null)?.[0]) ?? null;
});

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await resolveUser(username);
  if (!user) return { title: "Profil negăsit — DevPath RO" };

  const displayName = user.name ?? user.email.split("@")[0];
  const levelName = LEVEL_NAMES[user.level ?? 1] ?? "Curios";
  const xp = user.xp_points ?? 0;

  const ogTitle = encodeURIComponent(`${displayName} — DevPath RO Portfolio`);
  const ogDesc = encodeURIComponent(
    `${displayName} este la nivelul ${levelName} cu ${xp.toLocaleString("ro-RO")} XP pe DevPath RO.`
  );

  return {
    title: `${displayName} — Portfolio`,
    description: `${displayName} este la nivelul ${levelName} cu ${xp.toLocaleString("ro-RO")} XP pe DevPath RO.`,
    openGraph: {
      title: `${displayName} — DevPath RO Portfolio`,
      description: `${displayName} este la nivelul ${levelName} cu ${xp.toLocaleString("ro-RO")} XP pe DevPath RO.`,
      siteName: "DevPath RO",
      images: [
        {
          url: `/og?title=${ogTitle}&description=${ogDesc}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      images: [`/og?title=${ogTitle}&description=${ogDesc}`],
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PublicPortfolioPage({ params }: PageProps) {
  const { username } = await params;
  const supabase = createSupabaseAdminClient();

  const profile = await resolveUser(username);
  if (!profile) notFound();

  // Completed lessons with timestamps + scores
  const { data: progressData } = await supabase
    .from("user_progress")
    .select("lesson_id, completed_at, score")
    .eq("user_id", profile.id)
    .eq("completed", true);

  // All lessons (module calc + course resolution)
  const { data: allLessons } = await supabase
    .from("lessons")
    .select("id, course_id, module_index, type");

  // All courses
  const { data: allCourses } = await supabase
    .from("courses")
    .select("id, slug, title");

  // Earned badges
  const { data: userBadgesRaw } = await supabase
    .from("user_badges")
    .select("earned_at, badges(slug, name, description, icon)")
    .eq("user_id", profile.id)
    .order("earned_at", { ascending: false });

  // Projects
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, description, github_url, completed_at, course_id")
    .eq("user_id", profile.id)
    .order("completed_at", { ascending: false });

  // ─── Computed ──────────────────────────────────────────────────────────────

  const completedIds = new Set((progressData ?? []).map((p) => p.lesson_id));

  const completedCourses = (allCourses ?? []).filter((course) => {
    const courseLessons = (allLessons ?? []).filter(
      (l) => l.course_id === course.id
    );
    return (
      courseLessons.length > 0 && courseLessons.every((l) => completedIds.has(l.id))
    );
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
    const completedInModule = moduleLessons.filter((l) =>
      completedIds.has(l.id)
    );
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
    .map((p) => p.completed_at!.split("T")[0]);

  // Flatten badges
  const badges = (userBadgesRaw ?? []).flatMap((row) => {
    const b = row.badges;
    if (!b || Array.isArray(b)) return [];
    const badge = b as {
      slug: string;
      name: string;
      description: string;
      icon: string;
    };
    return [{ ...badge, earned_at: row.earned_at as string }];
  });

  const displayName = profile.name ?? profile.email.split("@")[0];

  // Detect if the visitor is the profile owner (show ShareButton)
  let isOwnProfile = false;
  try {
    const authSupabase = createSupabaseServerClient();
    const { data: { user: viewer } } = await authSupabase.auth.getUser();
    if (viewer && viewer.id === profile.id) isOwnProfile = true;
  } catch {
    // Ignore auth errors on public page
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal public header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-foreground">
            Dev<span className="text-primary">Path</span>{" "}
            <span className="text-muted-foreground font-normal text-sm">RO</span>
          </Link>
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Intră în cont
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <PortfolioHeader
          name={displayName}
          avatarUrl={profile.avatar_url}
          level={profile.level ?? 1}
          xp={profile.xp_points ?? 0}
          streak={profile.streak_count ?? 0}
          joinDate={profile.created_at}
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
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            Cursuri terminate
          </h2>
          {completedCourses.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 px-1">
              Niciun curs terminat încă.
            </p>
          ) : (
            <div className="space-y-2">
              {completedCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border"
                >
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <p className="font-medium text-foreground flex-1">
                    {course.title}
                  </p>
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
            <h2 className="text-sm font-semibold text-foreground">
              Badge-uri câștigate
            </h2>
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
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              Proiecte
            </h2>
            <div className="space-y-2">
              {(projects ?? []).map((project) => (
                <div
                  key={project.id}
                  className="p-4 rounded-xl bg-card border border-border"
                >
                  <p className="font-medium text-foreground">{project.title}</p>
                  {project.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {project.description}
                    </p>
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

        {/* Share section (own profile only) */}
        {isOwnProfile && (
          <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5">
            <div>
              <p className="text-sm font-medium text-foreground">
                Distribuie profilul tău
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Arată lumii progresul tău în AI. Câștigă badge-ul{" "}
                <strong>Vitrina Deschisă 🌟</strong>.
              </p>
            </div>
            <ShareButton username={username} userName={displayName} />
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Profil generat de{" "}
            <Link href="/" className="text-primary hover:underline font-medium">
              DevPath RO
            </Link>{" "}
            — Platforma română de învățare AI
          </p>
        </div>
      </main>
    </div>
  );
}
