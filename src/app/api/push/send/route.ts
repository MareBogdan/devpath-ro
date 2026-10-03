import { NextResponse } from "next/server";
import webpush from "web-push";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  disabledResponse,
  hasValidCronSecret,
  isCronConfigured,
  isVapidConfigured,
} from "@/lib/optional-features";

// nodejs runtime — web-push uses Node.js crypto APIs
export const runtime = "nodejs";

// Web push is optional (MVP ships without it). VAPID keys are checked when a request
// arrives — never at import time — so a missing key cannot fail the build or crash
// the route; the endpoint answers with a clean 503 instead.
let vapidConfigured = false;
function configureWebPush(): boolean {
  if (vapidConfigured) return true;
  if (!isVapidConfigured()) return false;
  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT ?? "mailto:contact@devpath.ro",
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );
    vapidConfigured = true;
    return true;
  } catch (err) {
    console.error("[api/push/send] Invalid VAPID configuration:", err);
    return false;
  }
}

const payloadSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(300),
  url: z.string().optional().default("/dashboard"),
  icon: z.string().optional(),
});

export async function POST(req: Request) {
  // Internal endpoint: no CRON_SECRET configured → the feature is off.
  if (!isCronConfigured()) {
    return disabledResponse("push", "Push notifications are not configured.");
  }
  if (!hasValidCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!configureWebPush()) {
    return disabledResponse("push", "Push notifications are not configured (VAPID keys missing).");
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
