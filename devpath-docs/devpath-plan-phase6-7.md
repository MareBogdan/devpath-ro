# DevPath RO — Phase 6-7: Notifications & Advanced Features
**Status:** Not started
**Effort:** 1-2 weeks
**Depends on:** Phase 0–5 fully complete
**References:** devpath-vision.md (Notifications Strategy section, Level 5 Interview Prep unlock)

---

## WHY THIS PHASE EXISTS

By Phase 5, DevPath RO is a complete learning and social platform — but it is entirely reactive. Users must remember to open the app, continue their streak, and check their progress. Phase 6 adds the outbound layer: email and push notifications that pull users back at exactly the right moment. A streak-lost email the morning after a miss, a push at 20:00 when the user's streak is at risk — these are retention instruments that turn occasional visitors into daily learners. Without them, any streak system is purely punitive (the user finds out they lost their streak when they open the app), instead of protective (the platform warns them before the streak breaks).

Phase 7 converts the platform's existing AI infrastructure into deeper interactive features. The interview simulator gains scoring rubrics and a downloadable session report — turning a toy into a genuine interview prep tool that Level 5+ users will return to repeatedly. The AI Coach gains session memory so it can reference what it discussed with the user yesterday, eliminating the "start from scratch" problem that breaks immersion. The Glossar provides a searchable reference layer that makes the platform useful even when no lesson is open — one search is one reason to return.

---

## NEW PACKAGES — Explicit Flags

| Package | Version | Purpose | Status |
|---|---|---|---|
| `resend` | `^4.5.1` | Resend email API client — server-side email sending | ⚠️ **Requires user approval** |
| `web-push` | `^3.6.7` | VAPID key management + Web Push protocol for server-side push | ⚠️ **Requires user approval** |
| `@react-email/components` | `^0.0.35` | React components for HTML email templates | ⚠️ **Requires user approval** |
| `@react-email/render` | `^1.0.5` | Renders React Email components to HTML string for Resend | ⚠️ **Requires user approval** (usually installed alongside `@react-email/components`) |

**All 4 packages are server-only.** None ship to the browser bundle.

**No new packages** for Web Push subscription flow (native browser API), notification preferences UI (Radix UI + existing shadcn), or any Phase 7 feature.

---

## NEW ENVIRONMENT VARIABLES

Add to `.env.example` (do not add to `.env.local` — user manages their own keys):

```bash
# Phase 6 — Email (Resend)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@devpath.ro

# Phase 6 — Web Push
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...   # generated once with web-push CLI
VAPID_PRIVATE_KEY=...              # server-only, never expose
VAPID_SUBJECT=mailto:admin@devpath.ro

# Phase 7 — AI Coach memory (no new keys needed — uses existing OPENAI_API_KEY)
```

**VAPID key generation** (run once, save output to `.env.local`):
```bash
npx web-push generate-vapid-keys
```

---

## PHASE 6 — Notifications

### 6.0 — DB Migrations (run before any Phase 6 code)

**Show this SQL to user and wait for approval before running.**

```sql
-- ============================================
-- PHASE 6 DB MIGRATIONS
-- ============================================

-- User notification preferences
CREATE TABLE public.notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  email_weekly_progress boolean NOT NULL DEFAULT true,
  email_streak_lost boolean NOT NULL DEFAULT true,
  email_course_complete boolean NOT NULL DEFAULT true,
  email_referral_success boolean NOT NULL DEFAULT true,
  push_enabled boolean NOT NULL DEFAULT false,
  push_daily_reminder boolean NOT NULL DEFAULT true,
  push_streak_at_risk boolean NOT NULL DEFAULT true,
  push_reminder_hour integer NOT NULL DEFAULT 20  -- 0–23 in user's local timezone (stored as Europe/Bucharest hour)
  CHECK (push_reminder_hour BETWEEN 0 AND 23),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification preferences"
  ON public.notification_preferences FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
  ON public.notification_preferences FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences"
  ON public.notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger: auto-create default preferences on user signup
CREATE OR REPLACE FUNCTION public.create_default_notification_prefs()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.notification_preferences(user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_created_notification_prefs
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_notification_prefs();

-- Web Push subscriptions (one per user per device/browser)
CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  endpoint text NOT NULL UNIQUE,            -- Push service URL (browser-assigned)
  p256dh text NOT NULL,                     -- Public key for payload encryption
  auth text NOT NULL,                       -- Auth secret for payload encryption
  user_agent text,                          -- Browser identifier for display
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own push subscriptions"
  ON public.push_subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own push subscriptions"
  ON public.push_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own push subscriptions"
  ON public.push_subscriptions FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_push_subscriptions_user ON public.push_subscriptions(user_id);
```

---

### 6.1 — Resend Email + 4 Templates

**New files:**
- `src/lib/email/resend.ts` — singleton Resend client + `sendEmail` wrapper
- `src/lib/email/templates/weekly-progress.tsx` — React Email component
- `src/lib/email/templates/streak-lost.tsx` — React Email component
- `src/lib/email/templates/course-complete.tsx` — React Email component (PDF attached)
- `src/lib/email/templates/referral-success.tsx` — React Email component
- `src/app/api/cron/weekly-email/route.ts` — Vercel cron job, Monday 09:00 EET
- `src/app/api/cron/streak-check/route.ts` — Vercel cron job, daily 07:00 EET
- `vercel.json` — cron job config (new file if it doesn't exist)

**Modified files:**
- `src/app/(dashboard)/courses/actions.ts` — call `sendCourseCompleteEmail` after course completion
- `src/app/(auth)/actions.ts` — call `sendReferralSuccessEmail` when referred user completes first lesson

---

#### `src/lib/email/resend.ts`

```typescript
import { Resend } from "resend";
import { render } from "@react-email/render";
import type { ReactElement } from "react";

// Singleton client
const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailOptions {
  to: string;
  subject: string;
  react: ReactElement;
  attachments?: Array<{
    filename: string;
    content: Buffer;
  }>;
}

export async function sendEmail({
  to,
  subject,
  react,
  attachments,
}: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const html = await render(react);
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "noreply@devpath.ro",
      to,
      subject,
      html,
      attachments,
    });
    return { success: true };
  } catch (err) {
    console.error("[Resend] Send failed:", err);
    return { success: false, error: String(err) };
  }
}
```

---

#### `src/lib/email/templates/weekly-progress.tsx`

```typescript
import {
  Html, Body, Head, Container, Section, Text, Heading,
  Button, Hr, Preview, Font,
} from "@react-email/components";

interface WeeklyProgressEmailProps {
  userName: string;
  weeklyXP: number;
  totalXP: number;
  level: number;
  levelName: string;
  lessonsCompletedThisWeek: number;
  currentStreak: number;
  nextMilestoneXP: number;       // XP needed for next level
  topBadgeEarnedThisWeek?: string; // badge name, if any earned this week
  profileUrl: string;
}

export function WeeklyProgressEmail({
  userName,
  weeklyXP,
  totalXP,
  level,
  levelName,
  lessonsCompletedThisWeek,
  currentStreak,
  nextMilestoneXP,
  topBadgeEarnedThisWeek,
  profileUrl,
}: WeeklyProgressEmailProps) {
  return (
    <Html lang="ro">
      <Head />
      <Preview>Săptămâna aceasta: +{weeklyXP} XP · Nivel {level} · {lessonsCompletedThisWeek} lecții</Preview>
      <Body style={{ backgroundColor: "#0f172a", fontFamily: "system-ui, sans-serif" }}>
        <Container style={{ maxWidth: 480, margin: "0 auto", padding: "32px 16px" }}>
          <Heading style={{ color: "#f8fafc", fontSize: 24 }}>
            Raport săptămânal, {userName} 👋
          </Heading>
          <Section style={{ backgroundColor: "#1e293b", borderRadius: 8, padding: 24, marginBottom: 16 }}>
            <Text style={{ color: "#94a3b8", fontSize: 12, marginBottom: 4 }}>XP câștigat această săptămână</Text>
            <Text style={{ color: "#a5b4fc", fontSize: 36, fontWeight: "bold", margin: 0 }}>+{weeklyXP} XP</Text>
          </Section>
          <Section style={{ display: "grid" as const, gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <Section style={{ backgroundColor: "#1e293b", borderRadius: 8, padding: 16 }}>
              <Text style={{ color: "#94a3b8", fontSize: 11, margin: "0 0 4px" }}>LECȚII</Text>
              <Text style={{ color: "#f8fafc", fontSize: 24, fontWeight: "bold", margin: 0 }}>{lessonsCompletedThisWeek}</Text>
            </Section>
            <Section style={{ backgroundColor: "#1e293b", borderRadius: 8, padding: 16 }}>
              <Text style={{ color: "#94a3b8", fontSize: 11, margin: "0 0 4px" }}>STREAK</Text>
              <Text style={{ color: "#f8fafc", fontSize: 24, fontWeight: "bold", margin: 0 }}>{currentStreak}🔥</Text>
            </Section>
          </Section>
          {topBadgeEarnedThisWeek && (
            <Section style={{ backgroundColor: "#312e81", borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <Text style={{ color: "#c7d2fe", fontSize: 13, margin: 0 }}>
                🏅 Insignă nouă săptămâna aceasta: <strong>{topBadgeEarnedThisWeek}</strong>
              </Text>
            </Section>
          )}
          <Text style={{ color: "#94a3b8", fontSize: 13 }}>
            Ești la <strong style={{ color: "#f8fafc" }}>Nivel {level} — {levelName}</strong>
            {" "}({totalXP} XP total). Mai ai <strong style={{ color: "#a5b4fc" }}>{nextMilestoneXP - totalXP} XP</strong> până la nivelul următor.
          </Text>
          <Button
            href={profileUrl}
            style={{
              backgroundColor: "#6366f1",
              color: "#fff",
              borderRadius: 8,
              padding: "12px 24px",
              fontWeight: "bold",
              display: "block",
              textAlign: "center",
              textDecoration: "none",
              marginTop: 24,
            }}
          >
            Continuă lecțiile →
          </Button>
          <Hr style={{ borderColor: "#334155", margin: "24px 0" }} />
          <Text style={{ color: "#475569", fontSize: 11, textAlign: "center" as const }}>
            DevPath RO · Dezactivează emailurile în setări
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
```

---

#### `src/lib/email/templates/streak-lost.tsx`

```typescript
interface StreakLostEmailProps {
  userName: string;
  streakLost: number;       // how many days the streak was
  dashboardUrl: string;
}

// Design: warm slate background, Pixel sad (text emoji 😔), message about resilience
// CTA: "Reconstruiește streak-ul azi →"
// Key copy: "Streak-ul de {N} zile s-a oprit ieri. Pixel nu te judecă — te așteaptă."
// Sub-copy: "Stins temporar — dar revenire garantată! Orice legendă a resetat contorul."

export function StreakLostEmail({ userName, streakLost, dashboardUrl }: StreakLostEmailProps) {
  // Full React Email JSX — same structure as WeeklyProgressEmail
  // Colors: slate-900 bg, amber-400 accent (was a streak, so warm)
  // Mascot moment text: "😔 Pixel e un pic trist, dar gata să reînceapă cu tine."
}
```

---

#### `src/lib/email/templates/course-complete.tsx`

```typescript
interface CourseCompleteEmailProps {
  userName: string;
  courseName: string;
  totalXP: number;
  level: number;
  levelName: string;
  badgesEarned: number;
  certCode: string;          // for verify URL
  verifyUrl: string;
  dashboardUrl: string;
  // PDF is attached separately as a Buffer in sendEmail() attachments array
}

// Design: celebration layout, Pixel proud (🎓), green/purple gradient header
// Show: course name, total XP, level, badges count, cert code
// CTA: "Descarcă certificatul" (PDF already in email attachment) + "Explorează următorul curs →"
// Note: PDF certificate is attached by the calling code (courses/actions.ts)
// which calls getOrCreateCertificate + PDF generation before sendEmail()

export function CourseCompleteEmail({
  userName, courseName, totalXP, level, levelName,
  badgesEarned, certCode, verifyUrl, dashboardUrl,
}: CourseCompleteEmailProps) {
  // Full React Email JSX
}
```

---

#### `src/lib/email/templates/referral-success.tsx`

```typescript
interface ReferralSuccessEmailProps {
  referrerName: string;     // person who shared the link
  referredName: string;     // person who registered + completed first lesson
  xpAwarded: number;        // 40
  totalXP: number;          // referrer's new total XP
  dashboardUrl: string;
}

// Design: confetti-feel layout, social/warm tone
// Key copy: "{referredName} a finalizat prima lecție pe DevPath RO!
//            Tu i-ai deschis ușa. +{xpAwarded} XP pentru tine."
// CTA: "Vezi progresul tău →"

export function ReferralSuccessEmail({
  referrerName, referredName, xpAwarded, totalXP, dashboardUrl,
}: ReferralSuccessEmailProps) {
  // Full React Email JSX
}
```

---

#### `src/app/api/cron/weekly-email/route.ts`

```typescript
// Vercel cron: runs every Monday 07:00 UTC (= 09:00 Europe/Bucharest in winter,
//              10:00 in summer — close enough, no DST complexity needed)
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/resend";
import { WeeklyProgressEmail } from "@/lib/email/templates/weekly-progress";
import { LEVEL_NAMES } from "@/lib/gamification";

// Vercel cron invokes with GET + Authorization header = CRON_SECRET
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseServerClient();

  // Get all users with email_weekly_progress enabled
  const { data: users } = await supabase
    .from("users")
    .select(`
      id, email, name, level, xp_points,
      notification_preferences!inner(email_weekly_progress)
    `)
    .eq("notification_preferences.email_weekly_progress", true)
    .not("email", "is", null);

  if (!users?.length) return Response.json({ sent: 0 });

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://devpath.ro";

  let sent = 0;
  for (const user of users) {
    // Get weekly XP
    const { data: xpEvents } = await supabase
      .from("xp_events")
      .select("xp")
      .eq("user_id", user.id)
      .gte("created_at", oneWeekAgo);

    const weeklyXP = (xpEvents ?? []).reduce((sum, e) => sum + e.xp, 0);

    // Skip users with 0 activity this week to reduce email fatigue
    if (weeklyXP === 0) continue;

    // Get lessons completed this week
    const { count: lessonsThisWeek } = await supabase
      .from("user_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("completed", true)
      .gte("completed_at", oneWeekAgo);

    // Get any badge earned this week
    const { data: newBadges } = await supabase
      .from("user_badges")
      .select("badge_slug, badges!inner(name)")
      .eq("user_id", user.id)
      .gte("earned_at", oneWeekAgo)
      .limit(1);

    const { data: profile } = await supabase
      .from("users")
      .select("streak_count")
      .eq("id", user.id)
      .single();

    // Compute next level threshold
    const LEVEL_THRESHOLDS = [0, 200, 400, 700, 1000, 1400, 1800, 2300, 2900, 3500];
    const nextThreshold = LEVEL_THRESHOLDS[user.level] ?? LEVEL_THRESHOLDS[9];

    await sendEmail({
      to: user.email,
      subject: `Săptămâna ta pe DevPath RO: +${weeklyXP} XP 🚀`,
      react: WeeklyProgressEmail({
        userName: user.name ?? "Cursant",
        weeklyXP,
        totalXP: user.xp_points,
        level: user.level,
        levelName: LEVEL_NAMES[user.level] ?? "Curios",
        lessonsCompletedThisWeek: lessonsThisWeek ?? 0,
        currentStreak: profile?.streak_count ?? 0,
        nextMilestoneXP: nextThreshold,
        topBadgeEarnedThisWeek: (newBadges?.[0] as any)?.badges?.name,
        profileUrl: `${siteUrl}/dashboard`,
      }),
    });

    sent++;
  }

  return Response.json({ sent });
}
```

---

#### `src/app/api/cron/streak-check/route.ts`

```typescript
// Vercel cron: runs every day at 05:00 UTC (= 07:00 Europe/Bucharest in winter)
// Sends streak-lost email to users who had streak > 2 and had no activity yesterday

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseServerClient();

  // "Yesterday" = between 48h ago and 24h ago
  // We want users who had a streak yesterday but last_active is more than 1 day ago
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  // Users whose streak_count just dropped to 0 (was > 2 yesterday)
  // Approximation: users with streak_count = 0 AND last_active between 1-2 days ago
  // The streak reset is done by the markLessonComplete action (in Phase 3)
  // This cron just sends the email to those whose streak was recently lost

  const { data: lostStreakUsers } = await supabase
    .from("users")
    .select(`
      id, email, name,
      notification_preferences!inner(email_streak_lost)
    `)
    .eq("notification_preferences.email_streak_lost", true)
    .eq("streak_count", 0)
    .lt("last_active", oneDayAgo)
    .not("email", "is", null);

  // To find the streak value they lost, query xp_events for streak_daily entries
  // as a proxy for the length of their previous streak (count distinct days)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://devpath.ro";
  let sent = 0;

  for (const user of lostStreakUsers ?? []) {
    // Find max consecutive streak from xp_events (approximate: count streak_daily events)
    const { count: streakDayCount } = await supabase
      .from("xp_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("event_type", "streak_daily")
      .gte("created_at", new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const streakLost = Math.max(streakDayCount ?? 0, 3); // at least 3, matches "streak > 2" filter intent

    await sendEmail({
      to: user.email,
      subject: "Streak-ul s-a oprit — dar nu e prea târziu 🔥",
      react: StreakLostEmail({
        userName: user.name ?? "Cursant",
        streakLost,
        dashboardUrl: `${siteUrl}/dashboard`,
      }),
    });

    sent++;
  }

  return Response.json({ sent });
}
```

---

#### `vercel.json` (create if not exists)

```json
{
  "crons": [
    {
      "path": "/api/cron/weekly-email",
      "schedule": "0 7 * * 1"
    },
    {
      "path": "/api/cron/streak-check",
      "schedule": "0 5 * * *"
    },
    {
      "path": "/api/cron/push-streak-reminder",
      "schedule": "0 17 * * *"
    }
  ]
}
```

Add to `.env.example`:
```bash
CRON_SECRET=a-long-random-secret-for-cron-auth
```

---

### 6.2 — Web Push API

**Zero new browser packages.** Native `navigator.serviceWorker` + `PushManager` APIs. Server uses `web-push` npm package.

**New files:**
- `public/sw.js` — service worker (handles push events, shows notifications)
- `src/hooks/use-push-subscription.ts` — manages subscription state
- `src/app/api/push/subscribe/route.ts` — POST: save subscription to DB
- `src/app/api/push/unsubscribe/route.ts` — DELETE: remove subscription from DB
- `src/app/api/cron/push-streak-reminder/route.ts` — Vercel cron, daily 19:00 EET

---

#### `public/sw.js`

```javascript
// Service worker — handles incoming push notifications
// Location: public/sw.js (served at /sw.js)

self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  // data shape: { title: string, body: string, icon?: string, url?: string }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon ?? "/icon-192.png",
      badge: "/icon-72.png",
      data: { url: data.url ?? "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((windowClients) => {
      // Focus existing window or open new tab
      const match = windowClients.find((c) => c.url.includes(url));
      if (match) return match.focus();
      return clients.openWindow(url);
    })
  );
});
```

---

#### `src/hooks/use-push-subscription.ts`

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";

export type PushState = "unsupported" | "denied" | "unsubscribed" | "subscribing" | "subscribed";

export function usePushSubscription() {
  const [state, setState] = useState<PushState>("unsubscribed");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }

    // Check if already subscribed
    navigator.serviceWorker.ready.then(async (reg) => {
      const existing = await reg.pushManager.getSubscription();
      if (existing) setState("subscribed");
    });
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!("serviceWorker" in navigator)) return false;

    setState("subscribing");
    try {
      // Register service worker
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState("denied");
        return false;
      }

      // Create push subscription
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });

      // Save to DB
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          p256dh: btoa(
            String.fromCharCode(...new Uint8Array(subscription.getKey("p256dh")!))
          ),
          auth: btoa(
            String.fromCharCode(...new Uint8Array(subscription.getKey("auth")!))
          ),
          userAgent: navigator.userAgent.slice(0, 200),
        }),
      });

      setState("subscribed");
      return true;
    } catch {
      setState("unsubscribed");
      return false;
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (sub) {
      await fetch("/api/push/unsubscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
      await sub.unsubscribe();
    }
    setState("unsubscribed");
  }, []);

  return { state, subscribe, unsubscribe };
}

// Utility: convert VAPID public key from base64url to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
```

---

#### `src/app/api/push/subscribe/route.ts`

```typescript
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  endpoint: z.string().url(),
  p256dh: z.string().min(1),
  auth: z.string().min(1),
  userAgent: z.string().optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Invalid" }, { status: 400 });

  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.p256dh,
      auth: parsed.data.auth,
      user_agent: parsed.data.userAgent,
      last_used_at: new Date().toISOString(),
    },
    { onConflict: "endpoint" }
  );

  // Enable push in preferences
  await supabase
    .from("notification_preferences")
    .upsert({ user_id: user.id, push_enabled: true }, { onConflict: "user_id" });

  return Response.json({ success: true });
}
```

---

#### `src/app/api/push/unsubscribe/route.ts`

```typescript
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({ endpoint: z.string().url() });

export async function DELETE(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Invalid" }, { status: 400 });

  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("endpoint", parsed.data.endpoint);

  return Response.json({ success: true });
}
```

---

#### `src/lib/push.ts` — server-side push sending helper

```typescript
import webpush from "web-push";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Initialize VAPID keys once
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
}

export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  const supabase = createSupabaseServerClient();

  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth, id")
    .eq("user_id", userId);

  let sent = 0;
  let failed = 0;

  for (const sub of subscriptions ?? []) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload)
      );
      await supabase
        .from("push_subscriptions")
        .update({ last_used_at: new Date().toISOString() })
        .eq("id", sub.id);
      sent++;
    } catch (err: unknown) {
      // 410 Gone = subscription expired/revoked — delete it
      if ((err as { statusCode?: number })?.statusCode === 410) {
        await supabase.from("push_subscriptions").delete().eq("id", sub.id);
      }
      failed++;
    }
  }

  return { sent, failed };
}
```

---

#### `src/app/api/cron/push-streak-reminder/route.ts`

```typescript
// Vercel cron: daily at 17:00 UTC (= 19:00 Europe/Bucharest in winter, 20:00 in summer)
// Sends push to users with streak > 2 and no lesson today

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseServerClient();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Users with streak > 2, push_streak_at_risk enabled, no lesson today
  const { data: atRiskUsers } = await supabase
    .from("users")
    .select(`
      id, streak_count,
      notification_preferences!inner(push_enabled, push_streak_at_risk)
    `)
    .eq("notification_preferences.push_enabled", true)
    .eq("notification_preferences.push_streak_at_risk", true)
    .gt("streak_count", 2);

  let sent = 0;
  for (const user of atRiskUsers ?? []) {
    // Check if user already has a lesson completion today
    const { count } = await supabase
      .from("user_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("completed", true)
      .gte("completed_at", todayStart.toISOString());

    if ((count ?? 0) > 0) continue; // already learned today

    const result = await sendPushToUser(user.id, {
      title: "🔥 Streak-ul tău e în pericol!",
      body: `${user.streak_count} zile la rând. Nu lăsa șirul să se rupă — o lecție scurtă e de ajuns.`,
      url: "/dashboard",
    });

    sent += result.sent;
  }

  return Response.json({ sent });
}
```

**Push trigger after first lesson complete** (in `lesson-page-client.tsx` — documented as a modification):
After `markLessonComplete` returns success and this is the user's first ever completed lesson (can check `completedLessonsCount === 1`), show a toast that prompts push subscription:

```typescript
// Non-blocking prompt — never blocks the lesson completion celebration
// Show a subtle toast: "Vrei să primești reminder-uri? [Activează notificările]"
// Clicking "Activează" calls subscribe() from usePushSubscription()
// This is the ONLY place push permission is requested — never on page load
```

---

### 6.3 — Notification Preferences UI

**New files:**
- `src/app/(dashboard)/settings/page.tsx` — RSC settings page
- `src/app/(dashboard)/settings/actions.ts` — `updateNotificationPreferences` server action
- `src/components/settings/notification-settings.tsx` — client component

---

#### `src/app/(dashboard)/settings/page.tsx`

```typescript
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NotificationSettings } from "@/components/settings/notification-settings";

export default async function SettingsPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: prefs } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Setări notificări</h1>
      <NotificationSettings initialPrefs={prefs} />
    </div>
  );
}
```

---

#### `src/app/(dashboard)/settings/actions.ts`

```typescript
"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const PrefsSchema = z.object({
  email_weekly_progress: z.boolean(),
  email_streak_lost: z.boolean(),
  email_course_complete: z.boolean(),
  email_referral_success: z.boolean(),
  push_daily_reminder: z.boolean(),
  push_streak_at_risk: z.boolean(),
  push_reminder_hour: z.number().int().min(0).max(23),
});

export async function updateNotificationPreferences(input: z.infer<typeof PrefsSchema>) {
  const parsed = PrefsSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid preferences");

  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  await supabase
    .from("notification_preferences")
    .upsert(
      { user_id: user.id, ...parsed.data, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );

  revalidatePath("/settings");
}
```

---

#### `src/components/settings/notification-settings.tsx` (structure only)

```typescript
"use client";

import { useState } from "react";
import { updateNotificationPreferences } from "@/app/(dashboard)/settings/actions";
import { usePushSubscription } from "@/hooks/use-push-subscription";

// Renders two sections:
// 1. Email preferences (4 toggles using Radix UI Switch or HTML checkbox)
// 2. Push preferences (subscribe/unsubscribe button + 2 toggles + hour picker)

// Section 1 — Email
// - "Raport săptămânal" toggle (email_weekly_progress)
// - "Streak pierdut" toggle (email_streak_lost)
// - "Curs finalizat" toggle (email_course_complete)
// - "Prieten invitat" toggle (email_referral_success)

// Section 2 — Browser Push
// - Big subscribe/unsubscribe button using usePushSubscription()
// - When unsubscribed: "Activează notificările browser" button
// - When subscribed: show active device + "Dezactivează" button
// - "Reminder zilnic" toggle (push_daily_reminder) — disabled when push not enabled
// - "Streak în pericol" toggle (push_streak_at_risk) — disabled when push not enabled
// - Hour picker (select 18/19/20/21/22) for push_reminder_hour

// Auto-saves on each toggle change (debounced 500ms or on blur)
```

---

## PHASE 7 — Advanced Features

### 7.0 — DB Migrations (run before any Phase 7 code)

**Show this SQL to user and wait for approval before running.**

```sql
-- ============================================
-- PHASE 7 DB MIGRATIONS
-- ============================================

-- AI Coach session summaries
CREATE TABLE public.ai_coach_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE SET NULL,
  summary text NOT NULL,            -- GPT-4o-mini generated summary of the session
  message_count integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL,
  ended_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_coach_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coach sessions"
  ON public.ai_coach_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own coach sessions"
  ON public.ai_coach_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_coach_sessions_user ON public.ai_coach_sessions(user_id, ended_at DESC);

-- Interview simulator sessions (for scored history)
CREATE TABLE public.interview_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  job_role text NOT NULL,         -- e.g. "Junior AI Engineer"
  difficulty text NOT NULL CHECK (difficulty IN ('junior', 'mid', 'senior')),
  total_score integer NOT NULL,   -- 0–100
  scores_by_category jsonb NOT NULL,
  -- shape: { "technical": 85, "communication": 72, "problem_solving": 90, "ai_knowledge": 88 }
  question_count integer NOT NULL,
  duration_seconds integer NOT NULL,
  summary_html text,              -- rendered HTML report (cached)
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interview sessions"
  ON public.interview_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interview sessions"
  ON public.interview_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_interview_sessions_user ON public.interview_sessions(user_id, created_at DESC);

-- AI Glossar (50 AI/ML terms, definitions generated once and cached)
CREATE TABLE public.glossary_terms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  term text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,               -- URL-safe, e.g. "transformer-model"
  definition text NOT NULL,               -- Romanian definition, 2–3 sentences
  example text,                           -- Optional: "De exemplu, GPT-4 este un..."
  related_terms text[] NOT NULL DEFAULT '{}',
  category text NOT NULL CHECK (category IN (
    'fundamentals', 'models', 'training', 'applications',
    'tools', 'math', 'ethics'
  )),
  generated_at timestamptz NOT NULL DEFAULT now(),
  last_updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.glossary_terms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Glossary is publicly readable"
  ON public.glossary_terms FOR SELECT USING (true);

CREATE INDEX idx_glossary_slug ON public.glossary_terms(slug);
CREATE INDEX idx_glossary_category ON public.glossary_terms(category);

-- Full-text search on glossary
ALTER TABLE public.glossary_terms
  ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (
      to_tsvector('romanian', coalesce(term, '') || ' ' || coalesce(definition, '') || ' ' || coalesce(example, ''))
    ) STORED;

CREATE INDEX idx_glossary_search ON public.glossary_terms USING gin(search_vector);
```

---

### 7.1 — Interview Simulator Upgrade

**Existing:** A basic `/interview` page exists from Phase 0 (not yet in codebase — to be created as part of this phase at `src/app/(dashboard)/interview/`).

**Upgrade adds:** scoring rubric per category, session report with detailed feedback, history of past sessions.

**Level gate:** Level 5+ only (Practician, 1000+ XP). The dashboard layout already has access to user level — check in the page RSC.

**New files:**
- `src/app/(dashboard)/interview/page.tsx` — RSC shell + level gate
- `src/app/(dashboard)/interview/session/page.tsx` — live interview session (client component)
- `src/app/(dashboard)/interview/report/[sessionId]/page.tsx` — session report RSC
- `src/components/interview/interview-setup.tsx` — role + difficulty selector
- `src/components/interview/interview-chat.tsx` — full-screen chat UI
- `src/components/interview/score-breakdown.tsx` — radar chart per category
- `src/components/interview/session-report.tsx` — full report with PDF-ready layout
- `src/app/api/ai/interview/score/route.ts` — edge: scores a completed interview
- `src/app/(dashboard)/interview/actions.ts` — `saveInterviewSession` server action

---

#### Scoring rubric (4 categories, used in system prompt and score route)

```typescript
export const INTERVIEW_CATEGORIES = {
  technical: {
    label: "Cunoștințe tehnice",
    weight: 0.35,
    criteria: [
      "Acuratețea definițiilor AI/ML",
      "Înțelegerea arhitecturilor (Transformer, CNN, etc.)",
      "Cunoașterea tool-urilor (PyTorch, HuggingFace, etc.)",
    ],
  },
  ai_knowledge: {
    label: "Înțelegere AI practică",
    weight: 0.30,
    criteria: [
      "Prompt engineering și RAG",
      "Fine-tuning vs. in-context learning",
      "Evaluare și metrici de model",
    ],
  },
  problem_solving: {
    label: "Rezolvare probleme",
    weight: 0.20,
    criteria: [
      "Structurarea răspunsului la probleme noi",
      "Identificarea trade-off-urilor",
      "Abordarea cazurilor limită",
    ],
  },
  communication: {
    label: "Comunicare",
    weight: 0.15,
    criteria: [
      "Claritate și concizie",
      "Utilizarea exemplelor relevante",
      "Recunoașterea limitelor cunoașterii",
    ],
  },
} as const;

export type InterviewCategory = keyof typeof INTERVIEW_CATEGORIES;
export type InterviewDifficulty = "junior" | "mid" | "senior";
```

---

#### Interview system prompt (used in `/api/ai/chat` via `system` param)

```typescript
// Passed as system message when interview mode is active
export function buildInterviewSystemPrompt(
  role: string,
  difficulty: InterviewDifficulty,
  questionCount: number = 5
): string {
  return `
Ești un intervievator tehnic senior care evaluează candidați pentru rolul de ${role}.
Nivel de dificultate: ${difficulty}.
Conduci un interviu structurat în română cu exact ${questionCount} întrebări.

Reguli:
1. Pune câte o întrebare pe rând.
2. Ascultă răspunsul complet înainte de a comenta.
3. Poți cere clarificări sau aprofundări cu "Poți dezvolta...?" sau "Ce ai face dacă...?"
4. După fiecare răspuns, oferă un feedback scurt (1 propoziție), neutru.
5. La finalul tuturor întrebărilor, scrie exact: "---INTERVIU FINALIZAT---" pe o linie nouă.
6. Întrebările acoperă: cunoștințe tehnice, AI practic, rezolvare probleme și comunicare.

Format dificultate:
- junior: întrebări conceptuale, scenarii simple
- mid: probleme practice, trade-off-uri, debugging
- senior: design de sisteme AI, MLOps, evaluare critică
  `.trim();
}
```

---

#### `src/app/api/ai/interview/score/route.ts`

```typescript
import { z } from "zod";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";

export const runtime = "edge";

const RequestSchema = z.object({
  transcript: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })).min(2),
  role: z.string(),
  difficulty: z.enum(["junior", "mid", "senior"]),
});

const ScoreSchema = z.object({
  scores: z.object({
    technical: z.number().int().min(0).max(100),
    ai_knowledge: z.number().int().min(0).max(100),
    problem_solving: z.number().int().min(0).max(100),
    communication: z.number().int().min(0).max(100),
  }),
  overall_feedback: z.string(),  // 2–3 paragraphs in Romanian
  strengths: z.array(z.string()).min(1).max(3),
  improvements: z.array(z.string()).min(1).max(3),
  recommended_topics: z.array(z.string()).min(1).max(4), // DevPath lesson topics to revisit
});

export async function POST(req: Request) {
  const parsed = RequestSchema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Invalid" }, { status: 400 });

  const transcriptText = parsed.data.transcript
    .map((m) => `${m.role === "user" ? "Candidat" : "Intervievator"}: ${m.content}`)
    .join("\n\n");

  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: ScoreSchema,
    prompt: `
Analizează transcriptul acestui interviu tehnic pentru rolul de ${parsed.data.role} (nivel ${parsed.data.difficulty}) și evaluează candidatul.

Transcript:
${transcriptText}

Criteriile de evaluare:
- Cunoștințe tehnice (35%): acuratețe, profunzime, exemple concrete
- Înțelegere AI practică (30%): prompt engineering, RAG, fine-tuning, metrici
- Rezolvare probleme (20%): structură, trade-off-uri, edge cases
- Comunicare (15%): claritate, concizie, exemple, onestitate despre limite

Returnează scoruri 0–100 per categorie, feedback general, puncte forte și arii de îmbunătățire.
    `.trim(),
  });

  return Response.json(object);
}
```

---

#### `src/components/interview/session-report.tsx` (structure)

```typescript
"use client";

import { ScoreBreakdown } from "./score-breakdown";

interface SessionReportProps {
  session: InterviewSession; // from DB, includes scores_by_category jsonb
  onDownloadPDF?: () => void;
}

export function SessionReport({ session, onDownloadPDF }: SessionReportProps) {
  // Layout (PDF-ready: white bg, print media query compatible):
  //
  // Header: role + difficulty + date + duration
  // Overall score: big number + color coding (0–59 red, 60–79 amber, 80+ green)
  //
  // Score breakdown: 4 category scores with ScoreBreakdown (radar chart from 5.3 pattern)
  // Axes: ["Tehnic", "AI Practic", "Rezolvare", "Comunicare"]
  //
  // Strengths section: 1–3 bullet points (green)
  // Improvements section: 1–3 bullet points (amber)
  // Overall feedback: paragraph text
  // Recommended topics: links to DevPath lessons/modules
  //
  // "Descarcă raportul PDF" button → window.print() with CSS @media print
  // (no new package needed — browser native print to PDF)
}
```

**PDF approach:** Use `window.print()` with `@media print` CSS in `src/app/globals.css`:
```css
@media print {
  .no-print { display: none !important; }
  body { background: white; color: black; }
}
```
No `@react-pdf/renderer` needed here — browser print covers it. The `onDownloadPDF` prop calls `window.print()`.

---

#### Interview history in `src/app/(dashboard)/interview/page.tsx`

```typescript
// RSC — shows:
// 1. Level gate: if user.level < 5, show locked card with XP needed
// 2. "Simulare nouă" button → /interview/session (with setup wizard first)
// 3. Past sessions list: date, role, score badge, "Vezi raportul →" link
// Fetch: interview_sessions ORDER BY created_at DESC LIMIT 10
```

---

### 7.2 — AI Coach Memory

**Concept:** After a user closes the AI Coach panel or navigates away from the lesson, the last 10 messages are summarized via GPT-4o-mini and saved to `ai_coach_sessions`. On the next lesson, the AI Coach system prompt is prepended with a summary of recent sessions so Pixel "remembers" prior conversations.

**New files:**
- `src/app/api/ai/coach-session/route.ts` — POST: save session summary (edge)

**Modified files:**
- `src/components/course/ai-coach-chat.tsx` — on unmount/close, POST last 10 messages to session route; on mount, fetch recent session summaries to inject into system prompt
- `src/app/api/ai/chat/route.ts` — accept optional `sessionContext` string in request body, prepend to system prompt

---

#### `src/app/api/ai/coach-session/route.ts`

```typescript
import { z } from "zod";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "edge";

const schema = z.object({
  lessonId: z.string().uuid().nullable(),
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().max(2000),
  })).min(2).max(10),
  startedAt: z.string().datetime(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Invalid" }, { status: 400 });

  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const transcript = parsed.data.messages
    .map((m) => `${m.role === "user" ? "Student" : "Pixel"}: ${m.content}`)
    .join("\n");

  // Summarize conversation
  const { text: summary } = await generateText({
    model: openai("gpt-4o-mini"),
    prompt: `
Rezumă această conversație dintre un student și Pixel (AI Coach) în 2–3 propoziții scurte în română.
Fă rezumatul din perspectiva lui Pixel — notează ce a întrebat studentul, ce a înțeles și ce rămâne neclar.
Transcriptul va fi folosit în sesiuni viitoare pentru context.

Transcript:
${transcript}
    `.trim(),
  });

  await supabase.from("ai_coach_sessions").insert({
    user_id: user.id,
    lesson_id: parsed.data.lessonId,
    summary,
    message_count: parsed.data.messages.length,
    started_at: parsed.data.startedAt,
    ended_at: new Date().toISOString(),
  });

  return Response.json({ success: true, summary });
}
```

---

#### `src/app/api/ai/chat/route.ts` modification

Add `sessionContext` as an optional field in the request body schema. When present, prepend to the system prompt:

```typescript
// Add to Zod schema:
sessionContext: z.string().max(800).optional(),

// Add to system prompt construction:
const systemPrompt = [
  sessionContext
    ? `Context din sesiunile anterioare cu acest student:\n${sessionContext}`
    : null,
  "Ești Pixel, AI Coach-ul de pe DevPath RO...",  // existing system prompt
].filter(Boolean).join("\n\n");
```

---

#### `ai-coach-chat.tsx` modification plan

```typescript
// On mount: fetch last 3 session summaries
// GET /api/ai/coach-sessions?lessonId={lessonId}&limit=3 (or a server action)
// Join summaries → pass as sessionContext to useChat({ body: { sessionContext } })

// On unmount (useEffect cleanup) OR when isOpen changes from true to false:
// If messages.length >= 2, POST last min(10, messages.length) messages to /api/ai/coach-session
// Use a ref to track startedAt (set when panel opens)
// Fire-and-forget (don't await — won't block navigation)
// Note: useEffect cleanup fires on route change in Next.js App Router

// Key implementation note:
// useEffect(() => {
//   const startedAt = new Date().toISOString();
//   return () => {
//     if (messages.length >= 2) {
//       fetch("/api/ai/coach-session", { method: "POST", ... }); // no await
//     }
//   };
// }, []); // run once on mount, cleanup on unmount
```

---

#### Session context API endpoint

```typescript
// src/app/api/ai/coach-sessions/route.ts (GET — returns recent summaries)
// Returns last N session summaries for the current user
// Query param: ?limit=3 (default 3)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "3"), 5);

  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("ai_coach_sessions")
    .select("summary, lesson_id, ended_at")
    .eq("user_id", user.id)
    .order("ended_at", { ascending: false })
    .limit(limit);

  // Return joined summaries as a single string for context injection
  const context = (data ?? [])
    .map((s) => `[${new Date(s.ended_at).toLocaleDateString("ro-RO")}] ${s.summary}`)
    .join("\n");

  return Response.json({ context, sessions: data ?? [] });
}
```

---

### 7.3 — Glossar AI (`/dashboard/glossar`)

**50 AI/ML terms** stored in `glossary_terms` DB table. Definitions generated **once** via a seed script and cached — not generated at request time. Subsequent updates triggered manually via an admin route.

**New files:**
- `src/app/(dashboard)/glossar/page.tsx` — RSC list page
- `src/app/(dashboard)/glossar/[slug]/page.tsx` — RSC term detail page
- `src/app/api/admin/generate-glossary/route.ts` — one-time seeding route (admin only)
- `src/components/glossar/glossar-search.tsx` — client search component
- `src/components/glossar/term-card.tsx` — term display component

---

#### 50 terms seeded across 7 categories

```typescript
// Defined as a constant in src/app/api/admin/generate-glossary/route.ts
// Used to drive generateObject() calls

export const GLOSSARY_TERMS_TO_GENERATE = [
  // fundamentals (8)
  { term: "Inteligență Artificială", slug: "inteligenta-artificiala", category: "fundamentals" },
  { term: "Machine Learning", slug: "machine-learning", category: "fundamentals" },
  { term: "Deep Learning", slug: "deep-learning", category: "fundamentals" },
  { term: "Model", slug: "model-ai", category: "fundamentals" },
  { term: "Dataset", slug: "dataset", category: "fundamentals" },
  { term: "Antrenare", slug: "antrenare", category: "fundamentals" },
  { term: "Inferență", slug: "inferenta", category: "fundamentals" },
  { term: "Parametru", slug: "parametru", category: "fundamentals" },

  // models (10)
  { term: "Transformer", slug: "transformer", category: "models" },
  { term: "Large Language Model (LLM)", slug: "llm", category: "models" },
  { term: "GPT", slug: "gpt", category: "models" },
  { term: "BERT", slug: "bert", category: "models" },
  { term: "Rețea Neuronală", slug: "retea-neuronala", category: "models" },
  { term: "CNN (Rețea Neuronală Convoluțională)", slug: "cnn", category: "models" },
  { term: "RNN (Rețea Neuronală Recurentă)", slug: "rnn", category: "models" },
  { term: "Encoder-Decoder", slug: "encoder-decoder", category: "models" },
  { term: "Embedding", slug: "embedding", category: "models" },
  { term: "Token", slug: "token", category: "models" },

  // training (8)
  { term: "Gradient Descent", slug: "gradient-descent", category: "training" },
  { term: "Backpropagation", slug: "backpropagation", category: "training" },
  { term: "Overfitting", slug: "overfitting", category: "training" },
  { term: "Underfitting", slug: "underfitting", category: "training" },
  { term: "Regularizare", slug: "regularizare", category: "training" },
  { term: "Fine-Tuning", slug: "fine-tuning", category: "training" },
  { term: "Transfer Learning", slug: "transfer-learning", category: "training" },
  { term: "Batch Size", slug: "batch-size", category: "training" },

  // applications (8)
  { term: "Prompt Engineering", slug: "prompt-engineering", category: "applications" },
  { term: "RAG (Retrieval-Augmented Generation)", slug: "rag", category: "applications" },
  { term: "Agenți AI", slug: "agenti-ai", category: "applications" },
  { term: "Computer Vision", slug: "computer-vision", category: "applications" },
  { term: "NLP (Procesarea Limbajului Natural)", slug: "nlp", category: "applications" },
  { term: "Text-to-Image", slug: "text-to-image", category: "applications" },
  { term: "Chatbot", slug: "chatbot", category: "applications" },
  { term: "Clasificare", slug: "clasificare", category: "applications" },

  // tools (6)
  { term: "PyTorch", slug: "pytorch", category: "tools" },
  { term: "TensorFlow", slug: "tensorflow", category: "tools" },
  { term: "HuggingFace", slug: "huggingface", category: "tools" },
  { term: "LangChain", slug: "langchain", category: "tools" },
  { term: "OpenAI API", slug: "openai-api", category: "tools" },
  { term: "Vercel AI SDK", slug: "vercel-ai-sdk", category: "tools" },

  // math (5)
  { term: "Funcție de pierdere (Loss Function)", slug: "loss-function", category: "math" },
  { term: "Softmax", slug: "softmax", category: "math" },
  { term: "Normalizare", slug: "normalizare", category: "math" },
  { term: "Matrice", slug: "matrice", category: "math" },
  { term: "Vectori", slug: "vectori", category: "math" },

  // ethics (5)
  { term: "Bias (Părtinire)", slug: "bias-ai", category: "ethics" },
  { term: "Hallucination (Halucinație)", slug: "halucination", category: "ethics" },
  { term: "Siguranța AI", slug: "siguranta-ai", category: "ethics" },
  { term: "Explainability", slug: "explainability", category: "ethics" },
  { term: "GDPR și AI", slug: "gdpr-ai", category: "ethics" },
];
```

---

#### `src/app/api/admin/generate-glossary/route.ts`

```typescript
// One-time seeding route — protected by CRON_SECRET header
// Generates definitions for all 50 terms using generateObject()
// Run once after DB migration, then never again unless terms need updating

import { z } from "zod";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { GLOSSARY_TERMS_TO_GENERATE } from "./terms";

export const runtime = "edge";

const TermDefinitionSchema = z.object({
  definition: z.string(),     // 2–3 sentences in Romanian
  example: z.string(),        // "De exemplu, ..." in Romanian
  related_terms: z.array(z.string()).max(4), // other term slugs from the 50
});

export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseServerClient();
  let generated = 0;
  const errors: string[] = [];

  for (const termData of GLOSSARY_TERMS_TO_GENERATE) {
    try {
      const { object } = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: TermDefinitionSchema,
        prompt: `
Definește termenul de AI/ML "${termData.term}" în română.
Publicul țintă: studenți IT sau profesioniști non-tehnici care învață AI pentru prima dată.
Cerințe:
- definition: 2–3 propoziții clare și simple, fără jargon neexplicat
- example: o propoziție care începe cu "De exemplu," și dă un caz concret din viața reală
- related_terms: 2–4 slug-uri din lista: ${GLOSSARY_TERMS_TO_GENERATE.map(t => t.slug).join(", ")}
        `.trim(),
      });

      await supabase.from("glossary_terms").upsert({
        term: termData.term,
        slug: termData.slug,
        category: termData.category,
        definition: object.definition,
        example: object.example,
        related_terms: object.related_terms,
        generated_at: new Date().toISOString(),
        last_updated_at: new Date().toISOString(),
      }, { onConflict: "slug" });

      generated++;
    } catch (err) {
      errors.push(`${termData.slug}: ${String(err)}`);
    }
  }

  return Response.json({ generated, errors });
}
```

---

#### `src/app/(dashboard)/glossar/page.tsx`

```typescript
// RSC — no auth gate, accessible to all logged-in users
// Fetches all 50 terms grouped by category
// Renders: <GlossarSearch /> (client) + category sections with <TermCard />

export default async function GlossarPage() {
  const supabase = createSupabaseServerClient();

  const { data: terms } = await supabase
    .from("glossary_terms")
    .select("id, term, slug, definition, category")
    .order("term");

  // Group by category for display
  const byCategory = (terms ?? []).reduce<Record<string, typeof terms>>((acc, t) => {
    if (t) {
      acc[t.category] = [...(acc[t.category] ?? []), t];
    }
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Glosar AI</h1>
      <p className="text-muted-foreground mb-8">50 de termeni AI/ML explicați în română.</p>
      <GlossarSearch terms={terms ?? []} />
      {/* Category sections */}
    </div>
  );
}
```

---

#### `src/components/glossar/glossar-search.tsx`

```typescript
"use client";

import { useState, useMemo } from "react";
import { TermCard } from "./term-card";

// Client-side search only (all 50 terms already loaded — no network request needed)
// Filter: term + definition matching query string
// No Supabase full-text needed at this scale (50 terms, instant client filter)

export function GlossarSearch({ terms }: { terms: GlossaryTerm[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return terms;
    const q = query.toLowerCase();
    return terms.filter(
      (t) =>
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q)
    );
  }, [terms, query]);

  return (
    <div>
      <input
        type="search"
        placeholder="Caută un termen..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-lg border bg-card px-4 py-2.5 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-primary"
        autoFocus
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((term) => (
          <TermCard key={term.id} term={term} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          Niciun termen găsit pentru „{query}".
        </p>
      )}
    </div>
  );
}
```

---

## COMPLETE CHECKLIST

### Phase 6 — Notifications

**DB Migrations**
- [ ] P6.0.1 — Run `notification_preferences` table migration + RLS + default prefs trigger
- [ ] P6.0.2 — Run `push_subscriptions` table migration + RLS
- [ ] P6.0.3 — Add `CRON_SECRET` and `RESEND_API_KEY` / `RESEND_FROM_EMAIL` to `.env.example`
- [ ] P6.0.4 — Add `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` to `.env.example`
- [ ] P6.0.5 — Generate VAPID keys with `npx web-push generate-vapid-keys` and save to `.env.local`

**6.1 Email Setup**
- [ ] P6.1.1 — Get user approval + install `resend@^4.5.1`
- [ ] P6.1.2 — Get user approval + install `@react-email/components@^0.0.35` + `@react-email/render@^1.0.5`
- [ ] P6.1.3 — Create `src/lib/email/resend.ts` singleton + `sendEmail` wrapper
- [ ] P6.1.4 — Create `src/lib/email/templates/weekly-progress.tsx`
- [ ] P6.1.5 — Create `src/lib/email/templates/streak-lost.tsx`
- [ ] P6.1.6 — Create `src/lib/email/templates/course-complete.tsx`
- [ ] P6.1.7 — Create `src/lib/email/templates/referral-success.tsx`
- [ ] P6.1.8 — Create `src/app/api/cron/weekly-email/route.ts` (GET + CRON_SECRET guard)
- [ ] P6.1.9 — Create `src/app/api/cron/streak-check/route.ts` (GET + CRON_SECRET guard)
- [ ] P6.1.10 — Create `vercel.json` with cron schedule entries
- [ ] P6.1.11 — Modify `courses/actions.ts` markCourseComplete to call `sendCourseCompleteEmail`
- [ ] P6.1.12 — Modify `(auth)/actions.ts` signUp to call `sendReferralSuccessEmail` when referral triggers
- [ ] P6.1.13 — Test weekly email locally via `curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/weekly-email`
- [ ] P6.1.14 — Test streak-check email with a user whose streak_count = 0 and last_active > 1 day ago

**6.2 Web Push**
- [ ] P6.2.1 — Get user approval + install `web-push@^3.6.7`
- [ ] P6.2.2 — Create `public/sw.js` service worker (push + notificationclick handlers)
- [ ] P6.2.3 — Create `src/lib/push.ts` (`sendPushToUser` with 410 cleanup)
- [ ] P6.2.4 — Create `src/hooks/use-push-subscription.ts` (subscribe, unsubscribe, state)
- [ ] P6.2.5 — Create `src/app/api/push/subscribe/route.ts` (POST, saves to push_subscriptions)
- [ ] P6.2.6 — Create `src/app/api/push/unsubscribe/route.ts` (DELETE)
- [ ] P6.2.7 — Create `src/app/api/cron/push-streak-reminder/route.ts`
- [ ] P6.2.8 — Add third cron to `vercel.json` (`/api/cron/push-streak-reminder` at `0 17 * * *`)
- [ ] P6.2.9 — Modify `lesson-page-client.tsx`: after first lesson complete, show push permission toast
- [ ] P6.2.10 — Test push subscription flow in Chrome (requires HTTPS — use `ngrok` or Vercel preview)
- [ ] P6.2.11 — Test push send via `sendPushToUser` with a real subscription

**6.3 Notification Preferences UI**
- [ ] P6.3.1 — Create `src/app/(dashboard)/settings/page.tsx` (RSC, fetches prefs)
- [ ] P6.3.2 — Create `src/app/(dashboard)/settings/actions.ts` (`updateNotificationPreferences`)
- [ ] P6.3.3 — Create `src/components/settings/notification-settings.tsx` (toggles + push UI)
- [ ] P6.3.4 — Add "Setări" link in navbar or sidebar pointing to `/settings`

---

### Phase 7 — Advanced Features

**DB Migrations**
- [ ] P7.0.1 — Run `ai_coach_sessions` table migration + RLS
- [ ] P7.0.2 — Run `interview_sessions` table migration + RLS
- [ ] P7.0.3 — Run `glossary_terms` table migration + RLS + search_vector index

**7.1 Interview Simulator**
- [ ] P7.1.1 — Create `src/app/(dashboard)/interview/page.tsx` (RSC, Level 5 gate, history list)
- [ ] P7.1.2 — Create `src/components/interview/interview-setup.tsx` (role + difficulty selector)
- [ ] P7.1.3 — Create `src/app/(dashboard)/interview/session/page.tsx` (redirects to setup if no params)
- [ ] P7.1.4 — Create `src/components/interview/interview-chat.tsx` (full-screen useChat integration)
- [ ] P7.1.5 — Add `buildInterviewSystemPrompt` helper (in `src/lib/interview.ts`)
- [ ] P7.1.6 — Create `src/app/api/ai/interview/score/route.ts` (edge, `generateObject` + Zod)
- [ ] P7.1.7 — Create `src/app/(dashboard)/interview/actions.ts` (`saveInterviewSession`)
- [ ] P7.1.8 — Create `src/components/interview/score-breakdown.tsx` (radar chart, reuse LearningDnaChart pattern)
- [ ] P7.1.9 — Create `src/components/interview/session-report.tsx` (full report, `window.print()` PDF)
- [ ] P7.1.10 — Create `src/app/(dashboard)/interview/report/[sessionId]/page.tsx`
- [ ] P7.1.11 — Wire "---INTERVIU FINALIZAT---" detection in `interview-chat.tsx` → trigger scoring
- [ ] P7.1.12 — Add "Simulator Interviu" link in sidebar (Level 5+ only, locked otherwise)

**7.2 AI Coach Memory**
- [ ] P7.2.1 — Create `src/app/api/ai/coach-session/route.ts` (POST, summarize + save)
- [ ] P7.2.2 — Create `src/app/api/ai/coach-sessions/route.ts` (GET, return last N summaries)
- [ ] P7.2.3 — Modify `ai-coach-chat.tsx`: on mount, fetch recent sessions + inject as sessionContext
- [ ] P7.2.4 — Modify `ai-coach-chat.tsx`: on unmount, POST last 10 messages to coach-session (fire-and-forget)
- [ ] P7.2.5 — Modify `src/app/api/ai/chat/route.ts`: accept + use optional `sessionContext` in system prompt
- [ ] P7.2.6 — Test: chat on Lesson 5, close panel, reopen on Lesson 6 — Pixel should reference prior session

**7.3 Glossar AI**
- [ ] P7.3.1 — Create `GLOSSARY_TERMS_TO_GENERATE` constant (50 terms, categories, slugs)
- [ ] P7.3.2 — Create `src/app/api/admin/generate-glossary/route.ts` (POST, guarded by CRON_SECRET)
- [ ] P7.3.3 — Run glossary generation: `curl -X POST -H "Authorization: Bearer $CRON_SECRET" .../api/admin/generate-glossary`
- [ ] P7.3.4 — Verify all 50 rows inserted in `glossary_terms` table
- [ ] P7.3.5 — Create `src/components/glossar/term-card.tsx`
- [ ] P7.3.6 — Create `src/components/glossar/glossar-search.tsx` (client-side filter, no Supabase request)
- [ ] P7.3.7 — Create `src/app/(dashboard)/glossar/page.tsx` (RSC, grouped by category)
- [ ] P7.3.8 — Create `src/app/(dashboard)/glossar/[slug]/page.tsx` (term detail: definition, example, related terms as links)
- [ ] P7.3.9 — Add "Glosar" link in sidebar navigation
- [ ] P7.3.10 — Add `generateStaticParams` to `[slug]/page.tsx` for static generation at build time
