import { NextResponse } from "next/server";
import { render } from "@react-email/render";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getResendClient, FROM_EMAIL } from "@/lib/email/resend";
import { StreakLostEmail } from "@/lib/email/templates/streak-lost";

// nodejs runtime — render() is not compatible with edge
export const runtime = "nodejs";

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

  // Find users whose last_active was exactly 2 days ago (streak just broke yesterday)
  // last_active === the day before yesterday means they missed yesterday
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const { data: users, error } = await supabase
    .from("users")
    .select(
      "id, name, email, streak_count, notification_preferences!inner(email_streak_lost)"
    )
    .eq("last_active", twoDaysAgo)
    .gt("streak_count", 1); // Only notify if they had a meaningful streak

  if (error) {
    console.error("[streak-check] fetch error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sent = 0;
  let failed = 0;

  for (const user of users ?? []) {
    const prefs = user.notification_preferences as unknown as {
      email_streak_lost: boolean;
    };
    if (!prefs?.email_streak_lost) continue;
    if (!user.email) continue;

    const html = await render(
      StreakLostEmail({
        name: user.name ?? user.email.split("@")[0],
        lostStreakCount: user.streak_count ?? 2,
        siteUrl,
      })
    );

    const resend = getResendClient();
    const { error: sendError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: `Streak-ul tău s-a pierdut 😔 — revino azi pe DevPath RO`,
      html,
    });

    if (sendError) {
      console.error("[streak-check] send error for", user.email, sendError);
      failed++;
    } else {
      sent++;
    }
  }

  return NextResponse.json({ sent, failed });
}
