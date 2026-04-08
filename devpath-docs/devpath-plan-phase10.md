# DevPath RO — Phase 10: SEO, Landing Page & Monetization
**Status:** Not started
**Effort:** 1 week
**Depends on:** Phase 0-9 complete
**References:** devpath-vision.md (Platform Goals §5 — sustainable monetization; Design Principles §8 — mobile-aware, desktop-first)

---

## WHY THIS PHASE EXISTS

The platform is built, the content is live, users can learn, earn XP, and share portfolios. Phase 10 is the public face and the revenue engine.

Without SEO, no Romanian searching "cum functioneaza AI" will find DevPath RO — organic discovery is zero. Every new user has to arrive via a direct link, a referral, or paid traffic. Sitemap, structured meta tags, and dynamic OG images are the difference between being invisible and being found.

Without monetization, the platform cannot sustain the infrastructure it needs: Vercel compute, Supabase bandwidth, OpenAI API costs, Resend email volume, and future content. The Free/Pro/Lifetime model is the right fit for Romanian learners: Free gives real value (enough to form a habit), Pro rewards serious learners (unlimited AI Coach, all courses), and Lifetime appeals to the "pay once and own it" psychology that is strong in Romania.

Without a redesigned landing page, the first impression is a default Next.js shell. The landing page is the conversion surface — it must answer "What is this?", "Is it for me?", "What do I get?", and "How much?" in under 10 seconds, in Romanian, for both a 60-year-old doctor and a 22-year-old developer.

---

## PHASE 10 — SEO & Landing Page

### 10.0 — New Package Required

> **FLAG — New package needed:** `stripe@^16.x` is NOT currently in `package.json`.
> Before implementing sections 10.5–10.10, request approval:
> - `stripe@^16.x` — official Stripe Node.js SDK (server-side only, never imported in client components)
>
> `next/og` is already built into Next.js 14 — zero extra install.
> All other SEO features use only Next.js 14 App Router native APIs.

---

### 10.1 — Meta Tags + Open Graph for All Routes

**Goal:** Every page has accurate `<title>`, `<meta description>`, and Open Graph tags so Google and social previews work correctly.

**New files:**
- None — uses Next.js 14 `export const metadata` API in existing layout/page files

**Modified files:**
- `src/app/layout.tsx` — root metadata (site name, description, default OG image)
- `src/app/page.tsx` — landing page metadata
- `src/app/(dashboard)/dashboard/page.tsx` — dashboard metadata (noindex, private)
- `src/app/(dashboard)/courses/[courseSlug]/[lessonId]/page.tsx` — per-lesson metadata
- `src/app/pricing/page.tsx` — pricing page metadata (to be created in 10.5)

**Root layout metadata (src/app/layout.tsx):**

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://devpath.ro"),
  title: {
    default: "DevPath RO — Învață AI în Română",
    template: "%s | DevPath RO",
  },
  description:
    "Platforma prin care orice român înțelege și folosește AI. Lecții interactive, ghid vocal AI, certificate recunoscute. Gratuit pentru început.",
  keywords: ["AI", "inteligenta artificiala", "invatare online", "Romania", "curs AI", "ChatGPT", "machine learning"],
  authors: [{ name: "DevPath RO" }],
  creator: "DevPath RO",
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: "https://devpath.ro",
    siteName: "DevPath RO",
    title: "DevPath RO — Învață AI în Română",
    description:
      "Platforma prin care orice român înțelege și folosește AI. Lecții interactive, ghid vocal AI, certificate recunoscute.",
    images: [
      {
        url: "/og/default.png",
        width: 1200,
        height: 630,
        alt: "DevPath RO — Învață AI în Română",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DevPath RO — Învață AI în Română",
    description:
      "Platforma prin care orice român înțelege și folosește AI.",
    images: ["/og/default.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};
```

**Dashboard metadata (private — noindex):**

```typescript
export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};
```

**Lesson page metadata (RSC — dynamic):**

```typescript
export async function generateMetadata({
  params,
}: {
  params: { courseSlug: string; lessonId: string };
}): Promise<Metadata> {
  const supabase = createSupabaseServerClient();
  const { data: lesson } = await supabase
    .from("lessons")
    .select("title, description, courses(title)")
    .eq("id", params.lessonId)
    .single();

  if (!lesson) return { title: "Lecție" };

  return {
    title: `${lesson.title} — ${(lesson.courses as any)?.title}`,
    description: lesson.description ?? undefined,
    robots: { index: false, follow: false }, // lessons require login — no crawl
  };
}
```

---

### 10.2 — Sitemap.xml + robots.txt

**Goal:** Google can discover and crawl all public pages.

**New files:**
- `src/app/sitemap.ts` — dynamic sitemap generator
- `src/app/robots.ts` — robots rules

**src/app/sitemap.ts:**

```typescript
import { MetadataRoute } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://devpath.ro";

  // Static public pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/register`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.6 },
  ];

  // Public portfolio pages /u/[username]
  const supabase = createSupabaseServerClient();
  const { data: publicUsers } = await supabase
    .from("users")
    .select("username, updated_at")
    .not("username", "is", null);

  const portfolioPages: MetadataRoute.Sitemap = (publicUsers ?? []).map((u) => ({
    url: `${base}/u/${u.username}`,
    lastModified: new Date(u.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Certificate verification pages /verify/[code]
  const { data: certs } = await supabase
    .from("certificates")
    .select("code, created_at");

  const certPages: MetadataRoute.Sitemap = (certs ?? []).map((c) => ({
    url: `${base}/verify/${c.code}`,
    lastModified: new Date(c.created_at),
    changeFrequency: "never" as const,
    priority: 0.3,
  }));

  return [...staticPages, ...portfolioPages, ...certPages];
}
```

**src/app/robots.ts:**

```typescript
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing", "/u/", "/verify/"],
        disallow: ["/dashboard", "/courses/", "/onboarding", "/api/"],
      },
    ],
    sitemap: "https://devpath.ro/sitemap.xml",
  };
}
```

---

### 10.3 — Landing Page Redesign

**Goal:** Convert visitors who arrive via search or referral. Current page.tsx is the default Next.js shell. Redesign the visual layout — auth logic (redirect if logged in) stays intact.

**Modified files:**
- `src/app/page.tsx` — full visual redesign (existing auth redirect logic preserved)

**Page structure (5 sections):**

```
┌─────────────────────────────────────────────────────┐
│ NAVBAR                                              │
│ Logo left · "Cum funcționează" "Prețuri" "Despre"   │
│ right: "Intră în cont" + "Începe gratuit" (CTA)     │
├─────────────────────────────────────────────────────┤
│ HERO                                                │
│ H1: "Orice român poate înțelege AI"                 │
│ Subtext: 2 lines, warm, direct, no jargon           │
│ Two CTAs: [Începe gratuit] [Vezi cum funcționează]  │
│ Social proof strip: "2,400+ elevi · 30 lecții ·    │
│  Certificate recunoscute"                           │
│ Hero illustration: PixelMascot + lesson preview     │
├─────────────────────────────────────────────────────┤
│ FOR WHOM (2-column)                                 │
│ Left: "Ești doctor, antreprenor, curios?" → Simple  │
│ Right: "Ești developer, student CS?" → Technical   │
│ Both point to same platform, different entry paths  │
├─────────────────────────────────────────────────────┤
│ FEATURES (3-column grid)                            │
│ • Ghid vocal AI (Voice Coach F4)                    │
│ • Lecții în 2 moduri (Simple/Technical)             │
│ • Gamificare reală (XP, badges, streak)             │
│ • Certificat cu QR verificabil                      │
│ • Mini-jocuri interactive                           │
│ • Portofoliu public partajabil                      │
├─────────────────────────────────────────────────────┤
│ SOCIAL PROOF                                        │
│ 3 testimonial cards (placeholder text, Romanian)    │
│ Activity stats: lessons completed today (live       │
│ counter from Supabase — optional, can be static)    │
├─────────────────────────────────────────────────────┤
│ PRICING PREVIEW                                     │
│ 3 plan cards (Free / Pro / Lifetime) — brief        │
│ "Vezi toate planurile →" links to /pricing          │
├─────────────────────────────────────────────────────┤
│ FINAL CTA                                           │
│ "Primul pas durează 30 de secunde."                 │
│ [Creează cont gratuit]                              │
│ Mascot Pixel with excited emotion                   │
├─────────────────────────────────────────────────────┤
│ FOOTER                                              │
│ Logo · Links · "© 2026 DevPath RO"                 │
│ "Construit în România 🇷🇴"                          │
└─────────────────────────────────────────────────────┘
```

**Implementation notes:**
- Server Component (RSC) — no `"use client"` at the page level
- `<PixelMascot emotion="excited" />` used in hero and final CTA — already implemented
- Framer Motion animations: `page-transition.tsx` wraps the page — no new animation setup needed
- All copy in Romanian — no English except technical terms in parentheses
- Mobile: single-column stack; hero illustration hidden on `sm:`
- Tailwind only — no new CSS files

**Preserved from current page.tsx:**
```typescript
// This logic stays at the top of the RSC — do NOT remove
const supabase = createSupabaseServerClient();
const { data: { user } } = await supabase.auth.getUser();
if (user) redirect("/dashboard");
```

---

### 10.4 — OG Image Generation (Dynamic per Page)

**Goal:** When a user shares their portfolio or a course link on WhatsApp / LinkedIn / Twitter, a rich preview image appears with their name, level, badges, and course title.

**New files:**
- `src/app/og/route.tsx` — dynamic OG image generator using `next/og`
- `public/og/default.png` — static fallback OG (1200×630, hand-crafted or Figma export)

**src/app/og/route.tsx:**

```typescript
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "default"; // "default" | "portfolio" | "course"
  const title = searchParams.get("title") ?? "DevPath RO";
  const subtitle = searchParams.get("subtitle") ?? "Învață AI în Română";
  const level = searchParams.get("level") ?? "";
  const xp = searchParams.get("xp") ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0f0f1a 0%, #1a1040 100%)",
          padding: 60,
          fontFamily: "sans-serif",
          color: "#ffffff",
        }}
      >
        {/* Logo area */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            }}
          />
          <span style={{ fontSize: 24, fontWeight: 700, color: "#a78bfa" }}>
            DevPath RO
          </span>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <p style={{ fontSize: 18, color: "#8b5cf6", marginBottom: 12, textTransform: "uppercase", letterSpacing: 2 }}>
            {type === "portfolio" ? "Portofoliu Public" : type === "course" ? "Curs" : "Platformă AI"}
          </p>
          <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1, margin: 0, marginBottom: 20 }}>
            {title}
          </h1>
          <p style={{ fontSize: 22, color: "#c4b5fd", margin: 0 }}>
            {subtitle}
          </p>

          {/* Stats row — only for portfolio type */}
          {type === "portfolio" && level && (
            <div style={{ display: "flex", gap: 32, marginTop: 32 }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 14, color: "#6b7280", textTransform: "uppercase" }}>Nivel</span>
                <span style={{ fontSize: 28, fontWeight: 700, color: "#fbbf24" }}>{level}</span>
              </div>
              {xp && (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 14, color: "#6b7280", textTransform: "uppercase" }}>XP Total</span>
                  <span style={{ fontSize: 28, fontWeight: 700, color: "#34d399" }}>{xp} XP</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer strip */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 16, color: "#6b7280" }}>devpath.ro</span>
          <span style={{ fontSize: 16, color: "#6b7280" }}>Construit în România 🇷🇴</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

**Usage in portfolio page (src/app/u/[username]/page.tsx — modify generateMetadata):**

```typescript
export async function generateMetadata({ params }: { params: { username: string } }) {
  // ... fetch user data ...
  const ogUrl = new URL("/og", "https://devpath.ro");
  ogUrl.searchParams.set("type", "portfolio");
  ogUrl.searchParams.set("title", user.name);
  ogUrl.searchParams.set("subtitle", `Nivel ${user.level_name} · ${user.xp_total} XP`);
  ogUrl.searchParams.set("level", user.level_name);
  ogUrl.searchParams.set("xp", String(user.xp_total));

  return {
    openGraph: {
      images: [{ url: ogUrl.toString(), width: 1200, height: 630 }],
    },
  };
}
```

---

## PHASE 10 — Monetization (Stripe)

### 10.5 — Pricing Page /pricing

**Goal:** A clear, conversion-optimized pricing page accessible without login.

**New files:**
- `src/app/pricing/page.tsx` — RSC pricing page
- `src/app/pricing/loading.tsx` — loading state

**Plan definition (exact — mirrors vision.md §Platform Goals):**

| Feature | Free | Pro (99 lei/lună) | Lifetime (599 lei) |
|---|:---:|:---:|:---:|
| AI Fundamentals (Module 1–2) | ✅ | ✅ | ✅ |
| AI Fundamentals (Module 3–6) | ❌ | ✅ | ✅ |
| Prompt Engineering Practic | ❌ | ✅ | ✅ |
| Toate cursurile viitoare | ❌ | ✅ | ✅ |
| AI Coach (mesaje/zi) | 5 | Nelimitat | Nelimitat |
| Flashcarduri | ✅ | ✅ | ✅ |
| Certificat de finalizare | ❌ | ✅ | ✅ |
| Portofoliu public | ✅ | ✅ | ✅ |
| Suport prioritar | ❌ | ✅ | ✅ |
| Actualizări pe viață | ❌ | ❌ | ✅ |

**Environment variables needed (add to .env.example):**
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=          # monthly recurring price ID
STRIPE_LIFETIME_PRICE_ID=     # one-time price ID
```

**src/app/pricing/page.tsx skeleton:**

```typescript
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PricingCards } from "@/components/pricing/pricing-cards";

// No auth required — public page
export const metadata = {
  title: "Prețuri",
  description: "Alege planul potrivit pentru tine. Gratuit pentru început, Pro pentru cei serioși.",
};

export default async function PricingPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If logged in, fetch current plan to highlight it
  let currentPlan: string | null = null;
  if (user) {
    const { data } = await supabase
      .from("users")
      .select("plan")
      .eq("id", user.id)
      .single();
    currentPlan = data?.plan ?? null;
  }

  return (
    <main className="min-h-screen bg-background py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Alege planul tău</h1>
          <p className="text-muted-foreground text-lg">
            Începe gratuit. Upgradează când ești gata.
          </p>
        </div>
        <PricingCards currentPlan={currentPlan} isLoggedIn={!!user} />
      </div>
    </main>
  );
}
```

**New component: src/components/pricing/pricing-cards.tsx**

Client component — handles CTA button clicks (redirect to checkout or register).

Props: `{ currentPlan: string | null; isLoggedIn: boolean }`

Three plan cards with feature comparison table below. Free plan CTA: "Începe gratuit" → `/register`. Pro/Lifetime CTAs: call `POST /api/stripe/checkout` with plan type, redirect to Stripe Checkout.

---

### 10.6 — Stripe Checkout Flow

**New files:**
- `src/lib/stripe.ts` — Stripe singleton
- `src/app/api/stripe/checkout/route.ts` — create Checkout Session
- `src/app/pricing/success/page.tsx` — post-payment success page
- `src/app/pricing/cancel/page.tsx` — post-payment cancel page

**src/lib/stripe.ts:**

```typescript
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
  typescript: true,
});
```

**src/app/api/stripe/checkout/route.ts:**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "edge";

const schema = z.object({
  plan: z.enum(["pro", "lifetime"]),
});

export async function POST(req: NextRequest) {
  // Auth check
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Autentificare necesară" }, { status: 401 });
  }

  // Validate input
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Plan invalid" }, { status: 400 });
  }

  const { plan } = parsed.data;
  const priceId =
    plan === "pro"
      ? process.env.STRIPE_PRO_PRICE_ID!
      : process.env.STRIPE_LIFETIME_PRICE_ID!;

  const origin = req.headers.get("origin") ?? "https://devpath.ro";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: plan === "pro" ? "subscription" : "payment",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      metadata: { user_id: user.id, plan },
      success_url: `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing/cancel`,
      locale: "ro",
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Eroare la procesarea plății" }, { status: 502 });
  }
}
```

**Client-side call from pricing-cards.tsx:**

```typescript
async function handleCheckout(plan: "pro" | "lifetime") {
  setLoading(plan);
  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });
  const data = await res.json();
  if (data.url) {
    window.location.href = data.url; // redirect to Stripe Checkout
  } else {
    // show error toast
  }
  setLoading(null);
}
```

**Success page (src/app/pricing/success/page.tsx):**

RSC. Shows: "Plată reușită! Contul tău a fost upgradat." + link to Dashboard. Note: plan is upgraded by the webhook (section 10.7), not here — the page is display-only.

**Cancel page (src/app/pricing/cancel/page.tsx):**

RSC. Shows: "Plata a fost anulată. Poți reveni oricând." + link back to `/pricing`.

---

### 10.7 — Stripe Webhook Handler

**Goal:** When Stripe confirms payment, upgrade `users.plan` in the DB and clear any cached data.

**New file:**
- `src/app/api/stripe/webhook/route.ts`

**Critical notes:**
- Must use `export const runtime = "nodejs"` (NOT edge) — `stripe.webhooks.constructEvent()` requires raw body, not available on edge
- Use `req.text()` to get raw body before parsing
- Verify signature with `STRIPE_WEBHOOK_SECRET`

**src/app/api/stripe/webhook/route.ts:**

```typescript
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs"; // Raw body required for webhook signature

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle relevant events
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const plan = session.metadata?.plan as "pro" | "lifetime" | undefined;

      if (!userId || !plan) break;

      const supabaseAdmin = createSupabaseAdminClient();
      await supabaseAdmin
        .from("users")
        .update({
          plan,
          plan_activated_at: new Date().toISOString(),
          stripe_customer_id: session.customer as string,
          stripe_subscription_id:
            plan === "pro" ? (session.subscription as string) : null,
        })
        .eq("id", userId);

      revalidatePath("/dashboard");
      revalidatePath("/pricing");
      break;
    }

    case "customer.subscription.deleted": {
      // Pro plan cancelled — downgrade to free
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const supabaseAdmin = createSupabaseAdminClient();
      await supabaseAdmin
        .from("users")
        .update({
          plan: "free",
          stripe_subscription_id: null,
        })
        .eq("stripe_customer_id", customerId);

      revalidatePath("/dashboard");
      break;
    }

    // All other events ignored
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
```

**DB columns needed on users table (show SQL — wait for approval):**

```sql
-- PHASE 10 DB MIGRATION
-- Run after approval

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS plan_activated_at timestamptz;

-- Index for webhook lookup by customer ID
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id
  ON public.users (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;
```

Note: `users.plan` column already exists from Phase 0 with values `('free', 'pro', 'lifetime')`.

---

### 10.8 — Content Gates (Free Plan Restrictions)

**Goal:** Free users see only modules 1–2 of any course. On module 3+, they see an upgrade wall instead of the lesson content.

**Modified files:**
- `src/app/(dashboard)/courses/[courseSlug]/[lessonId]/page.tsx` — add gate check
- `src/types/index.ts` — ensure `Lesson` type includes `module_index`

**Gate logic in lesson RSC (add after fetching lesson data):**

```typescript
// After fetching lesson and user data
const isFreeUser = user.plan === "free";
const isGated = isFreeUser && lesson.module_index > 2;

if (isGated) {
  return (
    <UpgradeWall
      lessonTitle={lesson.title}
      moduleIndex={lesson.module_index}
    />
  );
}
// ... rest of lesson render
```

**New component: src/components/course/upgrade-wall.tsx**

Client component. Props: `{ lessonTitle: string; moduleIndex: number }`

Display:
- PixelMascot with `emotion="sad"`
- Heading: "Această lecție face parte din Modulul {moduleIndex}"
- Subtext: "Planul tău gratuit include Module 1 și 2. Upgradează pentru acces complet."
- Feature highlights: what Pro unlocks (bullets)
- CTA button: "Upgradează la Pro" → `/pricing`
- Secondary: "Continuă din ultimele lecții gratuite" → back to last free lesson

---

### 10.9 — AI Coach Rate Limit for Free Users

**Goal:** Free users get max 5 AI Coach messages per day. Counted from `ai_coach_sessions` table.

**Modified files:**
- `src/app/api/ai/chat/route.ts` — add rate limit check
- `src/components/course/ai-coach-chat.tsx` — show remaining messages count

**Rate limit check in /api/ai/chat/route.ts:**

```typescript
// Add after auth check, before streamText call
const supabase = createSupabaseServerClient();
const { data: userData } = await supabase
  .from("users")
  .select("plan")
  .eq("id", user.id)
  .single();

if (userData?.plan === "free") {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("ai_coach_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("started_at", todayStart.toISOString());

  const FREE_DAILY_LIMIT = 5;
  if ((count ?? 0) >= FREE_DAILY_LIMIT) {
    return NextResponse.json(
      {
        error: "RATE_LIMIT",
        message: `Ai atins limita de ${FREE_DAILY_LIMIT} conversații/zi pentru planul gratuit.`,
        upgradeUrl: "/pricing",
      },
      { status: 429 }
    );
  }
}
```

**Client-side handling in ai-coach-chat.tsx:**

On `429` response, show the `<UpgradeWall>` variant inline in the chat area:
- "Ai folosit cele 5 mesaje gratuite de azi."
- "Revine mâine sau upgradează la Pro pentru acces nelimitat."
- Button: "Upgradează" → `/pricing`

---

### 10.10 — Billing Portal (Manage Subscription)

**Goal:** Pro users can cancel or manage their subscription directly from their profile without contacting support.

**New files:**
- `src/app/api/stripe/portal/route.ts` — create Stripe Billing Portal session
- `src/components/profile/billing-section.tsx` — client component in profile page

**src/app/api/stripe/portal/route.ts:**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Autentificare necesară" }, { status: 401 });
  }

  const { data: userData } = await supabase
    .from("users")
    .select("stripe_customer_id, plan")
    .eq("id", user.id)
    .single();

  if (!userData?.stripe_customer_id) {
    return NextResponse.json({ error: "Niciun abonament activ" }, { status: 400 });
  }

  const origin = req.headers.get("origin") ?? "https://devpath.ro";

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: userData.stripe_customer_id,
      return_url: `${origin}/dashboard`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Billing portal error:", err);
    return NextResponse.json({ error: "Eroare la portal" }, { status: 502 });
  }
}
```

**src/components/profile/billing-section.tsx:**

Shown in user profile page only for `plan !== 'free'`. Shows:
- Current plan badge ("PRO" or "LIFETIME" in color)
- Plan activated date
- For Pro only: "Administrează abonamentul" button → calls `/api/stripe/portal` → redirects to Stripe portal
- For Lifetime: "Acces pe viață — Mulțumim!" — no manage button needed

---

## COMPLETE CHECKLIST

### Phase 10.0 — Prerequisites
- [ ] **P10.0.1** Request approval for `stripe@^16.x` (not yet in package.json) — describe as: Stripe Node.js SDK, server-side only, needed for Checkout + Webhook + Billing Portal
- [ ] **P10.0.2** Install `stripe` after approval: `npm install stripe`
- [ ] **P10.0.3** Add all 5 Stripe env vars to `.env.example` (keys, webhook secret, price IDs)
- [ ] **P10.0.4** Create Stripe products in dashboard: "Pro Lunar" (recurring 99 RON/month) + "Lifetime" (one-time 599 RON)
- [ ] **P10.0.5** Copy Price IDs from Stripe dashboard into `.env.local`
- [ ] **P10.0.6** Show Phase 10 DB migration SQL to user — wait for approval before running

### Phase 10.1 — Meta Tags + OG
- [ ] **P10.1.1** Add root metadata export to `src/app/layout.tsx`
- [ ] **P10.1.2** Add `metadataBase: new URL("https://devpath.ro")` to root metadata
- [ ] **P10.1.3** Add `robots: { index: false }` to dashboard layout metadata
- [ ] **P10.1.4** Add `generateMetadata()` function to lesson page RSC
- [ ] **P10.1.5** Add metadata to `/pricing` page (created in P10.5.1)

### Phase 10.2 — Sitemap + robots.txt
- [ ] **P10.2.1** Create `src/app/sitemap.ts` with static pages + portfolio pages + cert pages
- [ ] **P10.2.2** Create `src/app/robots.ts` with allow/disallow rules
- [ ] **P10.2.3** Verify `https://devpath.ro/sitemap.xml` returns valid XML in production
- [ ] **P10.2.4** Verify `https://devpath.ro/robots.txt` is reachable

### Phase 10.3 — Landing Page Redesign
- [ ] **P10.3.1** Read current `src/app/page.tsx` fully before editing
- [ ] **P10.3.2** Preserve auth redirect logic (`supabase.auth.getUser()` → redirect if logged in)
- [ ] **P10.3.3** Build navbar section (logo, nav links, two CTA buttons)
- [ ] **P10.3.4** Build hero section (H1, subtext, two CTAs, social proof strip)
- [ ] **P10.3.5** Build "For Whom" two-column section (Simple vs Technical entry paths)
- [ ] **P10.3.6** Build features grid (6 feature cards, icon + title + description)
- [ ] **P10.3.7** Build social proof section (3 testimonial cards)
- [ ] **P10.3.8** Build pricing preview section (3 plan cards, links to /pricing)
- [ ] **P10.3.9** Build final CTA section with PixelMascot `emotion="excited"`
- [ ] **P10.3.10** Build footer (logo, links, "Construit în România 🇷🇴")
- [ ] **P10.3.11** Verify mobile layout (single-column on sm:, hero illustration hidden)
- [ ] **P10.3.12** Run `npx tsc --noEmit` — zero errors

### Phase 10.4 — OG Image Generation
- [ ] **P10.4.1** Create `src/app/og/route.tsx` with `ImageResponse` from `next/og`
- [ ] **P10.4.2** Add `?type=default` rendering for landing page OG
- [ ] **P10.4.3** Add `?type=portfolio` rendering with name, level, XP params
- [ ] **P10.4.4** Add `?type=course` rendering with course title param
- [ ] **P10.4.5** Update `generateMetadata()` in `src/app/u/[username]/page.tsx` to use dynamic OG URL
- [ ] **P10.4.6** Add static `public/og/default.png` fallback (1200×630)
- [ ] **P10.4.7** Test OG preview with https://opengraph.xyz or LinkedIn post inspector

### Phase 10.5 — Pricing Page
- [ ] **P10.5.1** Create `src/app/pricing/page.tsx` (RSC — public, no auth required)
- [ ] **P10.5.2** Create `src/app/pricing/loading.tsx`
- [ ] **P10.5.3** Create `src/components/pricing/pricing-cards.tsx` (client component)
- [ ] **P10.5.4** Implement 3 plan cards (Free / Pro 99 lei/lună / Lifetime 599 lei)
- [ ] **P10.5.5** Implement feature comparison table below cards
- [ ] **P10.5.6** Highlight current plan if user is logged in
- [ ] **P10.5.7** Free CTA → `/register` (or `/dashboard` if logged in)
- [ ] **P10.5.8** Pro/Lifetime CTAs → call `/api/stripe/checkout` then redirect

### Phase 10.6 — Stripe Checkout
- [ ] **P10.6.1** Create `src/lib/stripe.ts` (singleton with API version pinned)
- [ ] **P10.6.2** Create `src/app/api/stripe/checkout/route.ts` (edge runtime)
- [ ] **P10.6.3** Validate input with Zod (`plan: z.enum(["pro", "lifetime"])`)
- [ ] **P10.6.4** Auth check — 401 if not logged in
- [ ] **P10.6.5** Create Checkout Session with `metadata: { user_id, plan }`
- [ ] **P10.6.6** Set `locale: "ro"` on Checkout Session
- [ ] **P10.6.7** Create `src/app/pricing/success/page.tsx`
- [ ] **P10.6.8** Create `src/app/pricing/cancel/page.tsx`
- [ ] **P10.6.9** Test with Stripe test card `4242 4242 4242 4242` in test mode

### Phase 10.7 — Stripe Webhook
- [ ] **P10.7.1** Run Phase 10 DB migration SQL (after approval): add `stripe_customer_id`, `stripe_subscription_id`, `plan_activated_at` columns
- [ ] **P10.7.2** Create `src/app/api/stripe/webhook/route.ts` (nodejs runtime — NOT edge)
- [ ] **P10.7.3** Use `req.text()` for raw body — required for signature verification
- [ ] **P10.7.4** Verify signature with `stripe.webhooks.constructEvent()`
- [ ] **P10.7.5** Handle `checkout.session.completed` — update `users.plan` via admin client
- [ ] **P10.7.6** Handle `customer.subscription.deleted` — downgrade to `free`
- [ ] **P10.7.7** Call `revalidatePath("/dashboard")` after plan upgrade
- [ ] **P10.7.8** Register webhook in Stripe dashboard: events `checkout.session.completed` + `customer.subscription.deleted`
- [ ] **P10.7.9** Test webhook locally with Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- [ ] **P10.7.10** Test Pro upgrade end-to-end: checkout → webhook → plan updated → dashboard reflects Pro

### Phase 10.8 — Content Gates
- [ ] **P10.8.1** Create `src/components/course/upgrade-wall.tsx` (client component)
- [ ] **P10.8.2** UpgradeWall uses `PixelMascot emotion="sad"` (already implemented)
- [ ] **P10.8.3** Add gate check in `src/app/(dashboard)/courses/[courseSlug]/[lessonId]/page.tsx`
- [ ] **P10.8.4** Gate condition: `plan === "free" && lesson.module_index > 2`
- [ ] **P10.8.5** Verify lesson sidebar still shows locked modules (grayed out, lock icon)
- [ ] **P10.8.6** Verify Pro user sees all lessons after plan upgrade
- [ ] **P10.8.7** Verify Lifetime user never hits gate

### Phase 10.9 — AI Coach Rate Limit
- [ ] **P10.9.1** Add free user rate limit check in `src/app/api/ai/chat/route.ts`
- [ ] **P10.9.2** Count today's `ai_coach_sessions` rows for user (no Redis — DB only)
- [ ] **P10.9.3** Return 429 with `{ error: "RATE_LIMIT", upgradeUrl: "/pricing" }` when limit hit
- [ ] **P10.9.4** Handle 429 in `src/components/course/ai-coach-chat.tsx` — show inline upgrade prompt
- [ ] **P10.9.5** Show remaining messages count for free users: "3/5 conversații folosite azi"

### Phase 10.10 — Billing Portal
- [ ] **P10.10.1** Create `src/app/api/stripe/portal/route.ts` (nodejs runtime)
- [ ] **P10.10.2** Auth check + verify `stripe_customer_id` exists before creating portal session
- [ ] **P10.10.3** Set `return_url` to `/dashboard`
- [ ] **P10.10.4** Create `src/components/profile/billing-section.tsx`
- [ ] **P10.10.5** Show "Administrează abonamentul" button only for Pro users (not Lifetime, not Free)
- [ ] **P10.10.6** Show "Acces pe viață" badge for Lifetime users
- [ ] **P10.10.7** Add BillingSection to user profile page
- [ ] **P10.10.8** Test Pro cancellation flow end-to-end: cancel in portal → webhook fires → plan downgraded to free

---

## FILE SUMMARY

### New files created in Phase 10

| File | Type | Notes |
|---|---|---|
| `src/lib/stripe.ts` | Server utility | Stripe singleton |
| `src/app/sitemap.ts` | Next.js API | Dynamic sitemap generator |
| `src/app/robots.ts` | Next.js API | robots.txt rules |
| `src/app/og/route.tsx` | Edge route | ImageResponse OG generator |
| `src/app/pricing/page.tsx` | RSC | Public pricing page |
| `src/app/pricing/loading.tsx` | RSC | Skeleton loader |
| `src/app/pricing/success/page.tsx` | RSC | Post-payment success |
| `src/app/pricing/cancel/page.tsx` | RSC | Post-payment cancel |
| `src/app/api/stripe/checkout/route.ts` | Edge route | Create Checkout Session |
| `src/app/api/stripe/webhook/route.ts` | Node route | Handle Stripe events |
| `src/app/api/stripe/portal/route.ts` | Node route | Billing Portal session |
| `src/components/pricing/pricing-cards.tsx` | Client | 3-plan comparison UI |
| `src/components/course/upgrade-wall.tsx` | Client | Free → paid gate UI |
| `src/components/profile/billing-section.tsx` | Client | Manage subscription |
| `public/og/default.png` | Static asset | Fallback OG image (1200×630) |

### Modified files in Phase 10

| File | Change |
|---|---|
| `src/app/layout.tsx` | Add root metadata export |
| `src/app/page.tsx` | Full visual redesign (auth logic preserved) |
| `src/app/(dashboard)/layout.tsx` | Add `robots: noindex` metadata |
| `src/app/(dashboard)/courses/[courseSlug]/[lessonId]/page.tsx` | Add content gate + generateMetadata |
| `src/app/(dashboard)/courses/[courseSlug]/page.tsx` | Add locked module styling in sidebar |
| `src/app/api/ai/chat/route.ts` | Add free user rate limit check |
| `src/app/u/[username]/page.tsx` | Add dynamic OG URL in generateMetadata |

---

## DB MIGRATION (Phase 10)

Show to user and wait for approval:

```sql
-- ============================================================
-- PHASE 10 DB MIGRATION — Stripe billing columns
-- ============================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS plan_activated_at timestamptz;

-- Index for fast webhook lookup by Stripe customer ID
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id
  ON public.users (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- RLS: user can read own billing fields, admins can read all
-- (existing "users can read own row" policy already covers this
--  since the new columns are on the same row)

-- No new tables. No new RLS policies needed.
```

---

## STRIPE LOCAL TESTING GUIDE

```bash
# 1. Install Stripe CLI (one-time)
brew install stripe/stripe-cli/stripe-cli   # macOS
# or download from https://stripe.com/docs/stripe-cli

# 2. Login
stripe login

# 3. Forward webhooks to local dev server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# 4. Copy the webhook signing secret printed by step 3
#    → set as STRIPE_WEBHOOK_SECRET in .env.local

# 5. Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.deleted

# 6. Test cards
# Success:  4242 4242 4242 4242
# Decline:  4000 0000 0000 0002
# 3D Secure: 4000 0025 0000 3155
```

---

*Phase 10 is the final phase. After completion, DevPath RO is a fully operational, SEO-indexed, monetized Romanian AI learning platform.*
