import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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
    totalLessonsResult,
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
      .select("completed_at")
      .eq("user_id", user.id)
      .eq("completed", true),
    supabase
      .from("lessons")
      .select("id", { count: "exact", head: true }),
  ]);

  const profile = profileResult.data;
  const referralCount = referralCountResult.count ?? 0;
  const allBadges = allBadgesResult.data ?? [];
  const userBadgesRaw = userBadgesResult.data ?? [];
  const certificatesRaw = certificatesResult.data ?? [];
  const completedProgress = completedProgressResult.data ?? [];
  const totalLessons = totalLessonsResult.count ?? 0;

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
        lessonsCompleted={completionDates.length}
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
