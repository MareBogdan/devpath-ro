import { NextResponse } from "next/server";
import webpush from "web-push";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// nodejs runtime — web-push uses Node.js crypto APIs
export const runtime = "nodejs";

// Guard: fail fast if VAPID keys are missing — prevents silent push failures
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
if (!vapidPublicKey || !vapidPrivateKey) {
  throw new Error(
    "[api/push/send] Missing VAPID keys. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in environment variables."
  );
}

// Configure web-push with VAPID keys once per cold start
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT ?? "mailto:contact@devpath.ro",
  vapidPublicKey,
  vapidPrivateKey
);

const payloadSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(300),
  url: z.string().optional().default("/dashboard"),
  icon: z.string().optional(),
});

// Guard: only internal calls with the cron secret
function isAuthorized(req: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { userId, title, body: notifBody, url, icon } = parsed.data;
  const supabase = createSupabaseAdminClient();

  // Fetch all push subscriptions for this user
  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const payload = JSON.stringify({ title, body: notifBody, url, icon });
  let sent = 0;
  const staleEndpoints: string[] = [];

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload
      );
      sent++;
    } catch (err: unknown) {
      const statusCode = (err as { statusCode?: number }).statusCode;
      // 410 Gone / 404 Not Found = subscription expired, clean it up
      if (statusCode === 410 || statusCode === 404) {
        staleEndpoints.push(sub.endpoint);
      }
    }
  }

  // Remove stale subscriptions
  if (staleEndpoints.length > 0) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .eq("user_id", userId)
      .in("endpoint", staleEndpoints);
  }

  return NextResponse.json({ sent, staleRemoved: staleEndpoints.length });
}
