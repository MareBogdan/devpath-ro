import { NextResponse } from "next/server";
import { render } from "@react-email/render";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getResendClient, FROM_EMAIL } from "@/lib/email/resend";
import { WeeklyProgressEmail } from "@/lib/email/templates/weekly-progress";
import { LEVEL_NAMES } from "@/lib/gamification-constants";

// nodejs runtime — render() is not compatible with edge
export const runtime = "nodejs";

// Guard: only Vercel cron or internal calls with the cron secret
function isAuthorized(req: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://devpath.ro";

  // Fetch users who have email_weekly_progress enabled
  const { data: users, error } = await supabase
    .from("notification_preferences")
    .select(
      "user_id, users!inner(name, email, xp_points, level, streak_count)"
    )
    .eq("email_weekly_progress", true);

  if (error) {
    console.error("[weekly-email] fetch error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  let sent = 0;
  let failed = 0;

  for (const row of users ?? []) {
    const user = row.users as unknown as {
      name: string | null;
      email: string;
      xp_points: number;
      level: number;
      streak_count: number;
    };

    if (!user.email) continue;

    // Count lessons completed in the last 7 days
    const { count: weeklyCount } = await supabase
      .from("user_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", row.user_id)
      .eq("completed", true)
      .gte("completed_at", oneWeekAgo);

    // Skip users who haven't done anything this week
    if (!weeklyCount || weeklyCount === 0) continue;

    const level = user.level ?? 1;
    const html = await render(
      WeeklyProgressEmail({
        name: user.name ?? user.email.split("@")[0],
        lessonsCompletedThisWeek: weeklyCount,
        totalXP: user.xp_points ?? 0,
        currentLevel: level,
        levelName: LEVEL_NAMES[level] ?? "Curios",
        streakCount: user.streak_count ?? 0,
        siteUrl,
      })
    );

    const resend = getResendClient();
    const { error: sendError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: `Raportul tău săptămânal DevPath RO — ${weeklyCount} lecții completate`,
      html,
    });

    if (sendError) {
      console.error("[weekly-email] send error for", user.email, sendError);
      failed++;
    } else {
      sent++;
    }
  }

  return NextResponse.json({ sent, failed });
}
