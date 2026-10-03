import { redirect } from "next/navigation";
import { Trophy } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LearningDnaRadar } from "@/components/portfolio/learning-dna-radar";
import {
  computeCourseProgress,
  finishedCourses,
  radarAxes,
  type CourseLite,
  type LessonLite,
} from "@/lib/portfolio-data";
import { ProfileHero } from "@/components/profile/profile-hero";
import { ProfileStatsRow } from "@/components/profile/profile-stats-row";
import { ProfileEditCard } from "@/components/profile/profile-edit-card";
import { BadgeShowcase, type BadgeRow } from "@/components/profile/badge-showcase";
import {
  CertificatesSection,
  type CertificateRow,
} from "@/components/profile/certificates-section";
import { ReferralSection } from "@/components/profile/referral-section";
import { PortfolioLinkCard } from "@/components/profile/portfolio-link-card";
import { ActivityHeatmapCard } from "@/components/profile/activity-heatmap-card";

export default async function ProfilePage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // ─── Parallel fetches ─────────────────────────────────────────────────────
  const [
    profileResult,
    referralCountResult,
    allBadgesResult,
    userBadgesResult,
    certificatesResult,
    completedProgressResult,
    publishedLessonsResult,
    coursesResult,
  ] = await Promise.all([
    supabase
      .from("users")
      .select(
        "name, email, referral_code, xp_points, level, streak_count, avatar_url, daily_goal_minutes"
      )
      .eq("id", user.id)
      .single(),
    supabase
      .from("referral_events")
      .select("id", { count: "exact", head: true })
      .eq("referrer_id", user.id),
    supabase
      .from("badges")
      .select("slug, name, icon, description"),
    supabase
      .from("user_badges")
      .select("badge_id, earned_at, badges(slug)")
      .eq("user_id", user.id),
    supabase
      .from("certificates")
      .select("id, code, issued_at, courses(slug, title)")
      .eq("user_id", user.id)
      .order("issued_at", { ascending: false }),
    supabase
      .from("user_progress")
      .select("lesson_id, completed_at")
      .eq("user_id", user.id)
      .eq("completed", true),
    // Published lessons (id + course) → totals, per-course progress, radar
    supabase
      .from("lessons")
      .select("id, course_id")
      .eq("is_published", true),
    supabase
      .from("courses")
      .select("id, slug, title, order_index")
      .order("order_index"),
  ]);

  const profile = profileResult.data;
  const referralCount = referralCountResult.count ?? 0;
  const allBadges = allBadgesResult.data ?? [];
  const userBadgesRaw = userBadgesResult.data ?? [];
  const certificatesRaw = certificatesResult.data ?? [];
  const completedProgress = completedProgressResult.data ?? [];
  const publishedLessons = publishedLessonsResult.data ?? [];
  const totalLessons = publishedLessons.length;

  // ─── Derived data ─────────────────────────────────────────────────────────
  const referralCode = profile?.referral_code ?? "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://devpath.ro";
  const referralLink = `${siteUrl}/join?ref=${referralCode}`;
  const portfolioUsername = referralCode || (user.email?.split("@")[0] ?? "user");
  const portfolioLink = `${siteUrl}/u/${portfolioUsername}`;
  const displayName =
    profile?.name ?? user.email?.split("@")[0] ?? "Student";
  const email = (profile?.email as string | null) ?? user.email ?? "";

  const xpPoints = (profile?.xp_points as number | null) ?? 0;
  const level = (profile?.level as number | null) ?? 1;
  const streakCount = (profile?.streak_count as number | null) ?? 0;
  const dailyGoal = ((profile?.daily_goal_minutes as number | null) ?? 15) as
    | 0
    | 5
    | 15
    | 30;

  // Build badges list (earned + locked)
  const earnedSlugs = new Set<string>();
  const earnedAtMap = new Map<string, string>();
  for (const ub of userBadgesRaw) {
    const badgeRel = ub.badges as unknown;
    const badge = (Array.isArray(badgeRel) ? badgeRel[0] : badgeRel) as
      | { slug: string }
      | null
      | undefined;
    if (badge?.slug) {
      earnedSlugs.add(badge.slug);
      earnedAtMap.set(badge.slug, (ub.earned_at as string | null) ?? "");
    }
  }

  const badges: BadgeRow[] = allBadges.map((b) => ({
    slug: b.slug as string,
    name: b.name as string,
    icon: (b.icon as string | null) ?? "🏅",
    description: (b.description as string | null) ?? null,
    earned: earnedSlugs.has(b.slug as string),
    earnedAt: earnedAtMap.get(b.slug as string) ?? null,
  }));

  // Certificates
  const certificates: CertificateRow[] = certificatesRaw.flatMap((row) => {
    const courseRel = row.courses as unknown;
    const course = (Array.isArray(courseRel) ? courseRel[0] : courseRel) as
      | { slug: string; title: string }
      | null
      | undefined;
    if (!course) return [];
    return [
      {
        id: row.id as string,
        courseSlug: course.slug,
        courseTitle: course.title,
        issuedAt: row.issued_at as string,
        code: row.code as string,
      },
    ];
  });

  // Completion timestamps for activity heatmap
  const completionDates = completedProgress
    .map((p) => p.completed_at as string | null)
    .filter((d): d is string => Boolean(d));

  // Per-course progress → completed courses + Learning DNA radar. Only lessons that
  // are published count (a completed row for an unpublished lesson is ignored).
  const publishedIds = new Set(publishedLessons.map((l) => l.id as string));
  const completedIds = new Set(
    completedProgress
      .map((p) => p.lesson_id as string)
      .filter((id) => publishedIds.has(id))
  );
  const courseProgress = computeCourseProgress(
    (coursesResult.data ?? []) as CourseLite[],
    publishedLessons as LessonLite[],
    completedIds
  );
  const completedCourses = finishedCourses(courseProgress);
  const radar = radarAxes(courseProgress);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Hero — avatar + level + XP progress */}
      <ProfileHero
        name={displayName}
        email={email}
        avatarUrl={(profile?.avatar_url as string | null) ?? null}
        level={level}
        xpPoints={xpPoints}
        streakCount={streakCount}
      />

      {/* Stats row */}
      <ProfileStatsRow
        totalXP={xpPoints}
        streakCount={streakCount}
        badgesEarned={earnedSlugs.size}
        totalBadges={badges.length}
        lessonsCompleted={completedIds.size}
        totalLessons={totalLessons}
      />

      {/* Edit profile (collapsible) */}
      <ProfileEditCard
        initialName={displayName}
        initialAvatarUrl={(profile?.avatar_url as string | null) ?? null}
        initialDailyGoal={dailyGoal}
      />

      {/* Activity heatmap */}
      <ActivityHeatmapCard completionDates={completionDates} />

      {/* Learning DNA radar + completed courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section
          aria-labelledby="dna-heading"
          className="rounded-2xl border border-border bg-card p-5 sm:p-6"
        >
          <h2 id="dna-heading" className="text-lg font-bold text-foreground">
            ADN-ul de învățare
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 mb-4">
            Procentul de lecții completate în fiecare dintre primele șase cursuri
          </p>
          <LearningDnaRadar modules={radar} />
        </section>

        <section
          aria-labelledby="finished-heading"
          className="rounded-2xl border border-border bg-card p-5 sm:p-6"
        >
          <h2
            id="finished-heading"
            className="text-lg font-bold text-foreground flex items-center gap-2"
          >
            <Trophy className="h-4 w-4 text-primary" />
            Cursuri terminate
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 mb-4">
            {completedCourses.length} din {courseProgress.filter((c) => c.total > 0).length} disponibile
          </p>
          {completedCourses.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              Niciun curs terminat încă. Completează toate lecțiile unui curs ca să apară aici.
            </p>
          ) : (
            <ul className="space-y-2">
              {completedCourses.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-background/50 p-3"
                >
                  <Trophy className="h-4 w-4 shrink-0 text-green-500" />
                  <span className="flex-1 text-sm font-medium text-foreground">{c.title}</span>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                    Terminat
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Two-column layout on desktop: badges (left, wide) + referral + portfolio (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <BadgeShowcase badges={badges} />
          <CertificatesSection certificates={certificates} />
        </div>
        <div className="space-y-6">
          <ReferralSection
            referralCode={referralCode}
            referralLink={referralLink}
            referralCount={referralCount}
          />
          <PortfolioLinkCard
            username={portfolioUsername}
            portfolioLink={portfolioLink}
          />
        </div>
      </div>
    </div>
  );
}
