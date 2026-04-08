# DevPath RO — Phase 0: Cleanup & Security
**Status:** Not started
**Effort:** 2-3 days
**Must complete before:** Phase 1 — do not write a single line of feature code until all Phase 0 tasks are checked off
**References:** devpath-vision.md (implementation rules), devpath-master-context.md (codebase state)

---

## WHY PHASE 0 EXISTS

Every API call to `/api/ai/chat` and `/api/ai/tts` currently accepts requests from unauthenticated users with no validation — anyone with a browser can exhaust the project's OpenAI API credits without ever logging in. The next-intl library adds routing complexity, bundle overhead, and a cookie-based locale system that serves zero purpose for a Romanian-only platform. Three nav links (Roadmap, Portfolio, Interview) actively navigate to 404 pages, breaking user trust on first click. The streak counter has been hardcoded to 0 since day one, so users completing lessons daily see no recognition of their effort. Shipping features on top of these problems embeds them deeper: adding gamification before fixing the streak counter means two systems tracking conflicting data; adding more AI features before adding auth guards means each new endpoint inherits the same vulnerability.

---

## 0.1 — Remove next-intl Completely

**Why:** Platform is Romanian-only. next-intl adds ~30KB bundle, a cookie-based locale routing layer, and requires every text string to go through a translation lookup with zero benefit since only Romanian is needed.

**Run this verification command first to see all affected files:**
```bash
grep -r "next-intl" src/ --include="*.ts" --include="*.tsx" -l
```

**Expected output — exactly these files:**
```
src/app/layout.tsx
src/app/page.tsx
src/app/(auth)/set-locale-action.ts
src/components/lang-toggle.tsx
src/i18n/request.ts
src/lib/locale.ts
src/components/layout/navbar.tsx
src/app/(dashboard)/dashboard/page.tsx
```

**Important pre-check — middleware.ts is already clean:**
`src/middleware.ts` contains zero next-intl imports. It only calls `updateSession(request)`. Do NOT touch middleware.ts.

**Important pre-check — dashboard layout.tsx is already clean:**
`src/app/(dashboard)/layout.tsx` contains zero next-intl imports. Do NOT touch it.

---

### File 1: `next.config.mjs`

**Current state:**
```javascript
import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const nextConfig = {};
export default withNextIntl(nextConfig);
```

**Replace entire file with:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {};
export default nextConfig;
```

---

### File 2: `src/app/layout.tsx`

**Remove these imports (lines 3-4):**
```typescript
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
```

**Remove these lines inside the function body:**
```typescript
const locale = await getLocale();
const messages = await getMessages();
```

**Change `<html lang={locale}` to `<html lang="ro"`**

**Remove `<NextIntlClientProvider>` wrapper, keep only `<ThemeProvider>`:**

**Complete replacement for layout.tsx:**
```typescript
import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "DevPath RO — Invata IT & AI",
  description:
    "Platforma de invatare IT/AI pentru studenti romani. Cursuri interactive, AI Coach, si portofoliu automat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

---

### File 3: `src/app/page.tsx`

**Remove imports:**
```typescript
import { getTranslations } from "next-intl/server";  // REMOVE
import { LangToggle } from "@/components/lang-toggle";  // REMOVE
```

**Remove function call:**
```typescript
const t = await getTranslations("Landing");  // REMOVE
```

**Change function signature from `async` if it was only async for `getTranslations`:**
The function still needs to be async because it calls `supabase.auth.getUser()`. Keep `async`.

**Replace all `t("key")` calls with hardcoded Romanian strings (from messages/ro.json):**

| t() call | Replace with |
|---|---|
| `t("tagline")` | `"Platforma de invatare pentru studenti romani"` |
| `t("heroTitle")` | `"Invata IT & AI."` |
| `t("heroHighlight")` | `"Construieste-ti viitorul."` |
| `t("heroSubtitle")` | `"Cursuri interactive, AI Coach personal, si portofoliu generat automat. Tot ce ai nevoie ca sa faci tranzitia spre o cariera in tech."` |
| `t("ctaPrimary")` | `"Incepe gratuit"` |
| `t("ctaSecondary")` | `"Am deja cont"` |
| `t("features.courses.title")` | `"Cursuri structurate"` |
| `t("features.courses.desc")` | `"De la AI Fundamentals la Machine Learning — cursuri interactive cu teorie, quiz-uri si exercitii practice."` |
| `t("features.ai.title")` | `"AI Coach personal"` |
| `t("features.ai.desc")` | `"Asistentul tau AI in romana — explica erori, genereaza exercitii extra si te pregateste pentru interviuri."` |
| `t("features.portfolio.title")` | `"Portofoliu automat"` |
| `t("features.portfolio.desc")` | `"Pe masura ce termini cursuri, portofoliul tau public se construieste automat — gata de trimis la angajatori."` |
| `t("stats.lessons")` | `"lectii interactive"` |
| `t("stats.modules")` | `"module de AI"` |
| `t("stats.aiCoach")` | `"AI Coach disponibil"` |
| `t("footer.rights")` | `"Toate drepturile rezervate."` |
| `t("footer.moto")` | `"Construit pentru studentii romani din IT."` |

**Remove `<LangToggle />` from the header nav (line ~38).**

**The navbar in landing page should go from:**
```tsx
<LangToggle />
<ThemeToggle />
```
**to just:**
```tsx
<ThemeToggle />
```

---

### File 4: `src/components/layout/navbar.tsx`

**Remove imports:**
```typescript
import { useTranslations } from "next-intl";  // REMOVE
import { LangToggle } from "@/components/lang-toggle";  // REMOVE
```

**Replace the two `useTranslations` hooks:**
```typescript
// REMOVE these two lines:
const t = useTranslations("Nav");
const tPlans = useTranslations("Plans");
```

**Add a local lookup object at the top of the component function body:**
```typescript
const NAV_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  courses: "Cursuri",
  roadmap: "Roadmap",
  portfolio: "Portofoliu",
  interview: "Interviu",
  signOut: "Deconectare",
};

const PLAN_LABELS: Record<string, string> = {
  free: "Gratuit",
  pro: "Pro",
  lifetime: "Lifetime",
};
```

**Replace all `t(labelKey)` with `NAV_LABELS[labelKey]`**
**Replace all `t("signOut")` with `"Deconectare"`**
**Replace all `tPlans(user.plan)` with `PLAN_LABELS[user.plan] ?? user.plan`**

**Remove `<LangToggle />` from the right-side controls section.**

**IMPORTANT — also remove `soon: true` from the three nav links** since we are creating those pages in task 0.4:
```typescript
// CHANGE this navLinks array:
const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/courses", label: "Cursuri", icon: BookOpen },
  { href: "/roadmap", label: "Roadmap", icon: Map },        // remove soon: true
  { href: "/portfolio", label: "Portofoliu", icon: Briefcase },  // remove soon: true
  { href: "/interview", label: "Interviu", icon: MessageSquare }, // remove soon: true
];
```

**And update the link rendering to use the `label` field directly instead of `t(labelKey)`:**
```tsx
{navLinks.map(({ href, label, icon: Icon }) => {
  const isActive = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      key={href}
      href={href}
      className={cn(
        "relative flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
        isActive
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
})}
```

---

### File 5: `src/app/(dashboard)/dashboard/page.tsx`

**Remove import:**
```typescript
import { getTranslations } from "next-intl/server";  // REMOVE
```

**Remove these lines inside the function body:**
```typescript
const t = await getTranslations("Dashboard");    // REMOVE
const tPlans = await getTranslations("Plans");   // REMOVE
```

**Add a local plan labels lookup before the return statement:**
```typescript
const PLAN_LABELS: Record<string, string> = {
  free: "Gratuit",
  pro: "Pro",
  lifetime: "Lifetime",
};
```

**Replace t() and tPlans() usages:**
| Call | Replace with |
|---|---|
| `tPlans(plan)` | `PLAN_LABELS[plan] ?? plan` |
| `t("cta.title")` | `"Incepe primul curs"` |
| `t("cta.description")` | `"Cursul \"AI Fundamentals\" te asteapta — 30 de lectii interactive despre inteligenta artificiala."` |
| `t("cta.button")` | `"Exploreaza cursuri"` |

**Also update the users query to fetch `streak_count` for task 0.5:**
```typescript
// CHANGE this line (line 74):
const { data: profile } = await supabase
  .from("users")
  .select("name, plan")
  .eq("id", user.id)
  .single();

// TO:
const { data: profile } = await supabase
  .from("users")
  .select("name, plan, streak_count")
  .eq("id", user.id)
  .single();
```

**And change the hardcoded streak value (line 208):**
```tsx
// CHANGE:
<p className="text-3xl font-bold text-foreground">0</p>

// TO:
<p className="text-3xl font-bold text-foreground">{profile?.streak_count ?? 0}</p>
```

---

### File 6: DELETE `src/i18n/request.ts`

Delete this file entirely. It only serves next-intl.

---

### File 7: DELETE `src/lib/locale.ts`

Delete this file entirely. It only defines types for next-intl locale routing.

---

### File 8: DELETE `src/components/lang-toggle.tsx`

Delete this file entirely. It is the RO/EN toggle component that imports next-intl.

---

### File 9: DELETE `src/app/(auth)/set-locale-action.ts`

This file is imported by lang-toggle. Delete it. (It is a server action that sets the locale cookie — no longer needed.)

**Verify this file exists first:**
```bash
ls "src/app/(auth)/set-locale-action.ts"
```

---

### Package removal

```bash
npm uninstall next-intl
```

---

### Final verification

```bash
grep -r "next-intl" src/ --include="*.ts" --include="*.tsx"
# Must return zero results

grep -r "useTranslations\|useLocale\|getMessages\|getLocale\|NextIntlClientProvider\|LangToggle\|getTranslations\|set-locale-action" src/ --include="*.ts" --include="*.tsx"
# Must return zero results
```

**Done when:** `npm run build` completes without errors. All pages load in Romanian. Zero next-intl references.

---

## 0.2 — Security Fixes

### Task 0.2.1 — Add Zod + auth to `/api/ai/chat/route.ts`

**Current state (lines 1-44):** Route reads `req.json()` directly with no auth check and no validation. Any HTTP client can call it.

**The route uses `export const runtime = "edge"`. The Supabase server client works in edge runtime via `next/headers` cookies() API.**

**Complete replacement for `src/app/api/ai/chat/route.ts`:**
```typescript
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "edge";

const chatRequestSchema = z.object({
  lessonId: z.string().uuid().optional(),
  lessonTitle: z.string().max(200).optional(),
  lessonContent: z.string().max(8000).optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(10000),
      })
    )
    .min(1)
    .max(50),
});

export async function POST(req: Request) {
  // Auth check — always first, before anything else
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user || authError) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Validation
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "Invalid request", details: parsed.error.issues }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { messages, lessonTitle, lessonContent } = parsed.data;

  // Truncate lesson content to keep system prompt reasonable
  const contentSnippet =
    typeof lessonContent === "string" && lessonContent.length > 4000
      ? lessonContent.slice(0, 4000) + "\n\n[...continut trunchiat]"
      : lessonContent ?? "";

  const systemPrompt = `Esti **AI Coach** — asistentul prietenos si empatic al platformei **DevPath RO**, un curs de programare si AI in limba romana.

Rolul tau este sa ajuti cursantii sa inteleaga conceptele din lectiile de AI si programare. Raspunzi INTOTDEAUNA in **romana**, cu un ton cald, incurajator si clar.

---

**Lectia curenta:** ${lessonTitle ?? "Sesiune generala"}

**Continutul lectiei (context):**
${contentSnippet}

---

**Reguli de raspuns:**
- Raspunde NUMAI la intrebari legate de lectia curenta sau de programare/AI in general.
- Foloseste exemple simple si analogii pentru concepte complexe.
- Fii empatic si incurajator — cursantii pot fi la primul contact cu AI.
- Daca nu stii ceva, spune-o clar si sugereaza resurse.
- Pastreaza raspunsurile concise (3-5 propozitii daca nu e nevoie de mai mult).
- Foloseste markdown pentru cod, liste sau evidentieri cand ajuta la claritate.`;

  const result = await streamText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt,
    messages,
    maxTokens: 512,
  });

  return result.toDataStreamResponse();
}
```

**Done when:**
- `curl -X POST http://localhost:3000/api/ai/chat` returns `401 Unauthorized`
- Authenticated request with valid body still streams AI response
- Invalid body (e.g. missing `messages`) returns `400`

---

### Task 0.2.2 — Add Zod + auth to `/api/ai/tts/route.ts`

**Current state:** Has basic text/empty check but NO auth check. No Zod.

**Complete replacement for `src/app/api/ai/tts/route.ts`:**
```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ttsRequestSchema = z.object({
  text: z.string().min(1).max(4000),
});

export async function POST(req: NextRequest) {
  // Auth check — always first
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user || authError) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Validation
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ttsRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { text } = parsed.data;
  const trimmed = text.trim();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY not configured" },
      { status: 500 }
    );
  }

  const openaiRes = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1",
      voice: "nova",
      input: trimmed,
    }),
  });

  if (!openaiRes.ok) {
    const errText = await openaiRes.text();
    console.error("[/api/ai/tts] OpenAI error:", openaiRes.status, errText);
    return NextResponse.json({ error: "TTS generation failed" }, { status: 502 });
  }

  const audioBuffer = await openaiRes.arrayBuffer();

  return new NextResponse(audioBuffer, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
    },
  });
}
```

**Done when:** Unauthenticated request returns 401. Valid authenticated request returns audio.

---

## 0.3 — Database Schema Fixes & All New Tables

**IMPORTANT:** Run ALL migrations in this section in a single session in the Supabase SQL Editor. Run them in order. After all succeed, update `schema.sql`.

### Task 0.3.1 — Add `users.role` column

```sql
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'student'
CHECK (role IN ('student', 'admin'));

-- After running, set your own admin account:
-- UPDATE public.users SET role = 'admin' WHERE email = 'your-admin@email.com';
```

### Task 0.3.2 — Add all onboarding + gamification columns to users table

```sql
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS profile_type text CHECK (
    profile_type IN ('medical', 'entrepreneur', 'student_non_cs', 'student_cs', 'developer', 'teacher', 'curious')
  ),
  ADD COLUMN IF NOT EXISTS learning_goal text CHECK (
    learning_goal IN ('understand', 'build', 'career', 'curiosity')
  ),
  ADD COLUMN IF NOT EXISTS skill_level text CHECK (
    skill_level IN ('beginner', 'intermediate', 'advanced')
  ),
  ADD COLUMN IF NOT EXISTS learning_mode text DEFAULT 'simple' CHECK (
    learning_mode IN ('simple', 'technical')
  ),
  ADD COLUMN IF NOT EXISTS daily_goal_minutes integer DEFAULT 15,
  ADD COLUMN IF NOT EXISTS last_active date,
  ADD COLUMN IF NOT EXISTS streak_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS xp_points integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES public.users(id);
```

Also add `content_simple_md` to lessons table (needed for Phase 1 dual-mode):
```sql
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS content_simple_md text;
```

### Task 0.3.3 — Create all 15 new tables with RLS

Run this entire block in the Supabase SQL Editor:

```sql
-- ============================================
-- 1. LESSON GATE QUESTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.lesson_gate_questions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_answer integer NOT NULL,
  order_index integer NOT NULL DEFAULT 0
);
ALTER TABLE public.lesson_gate_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gate questions readable by authenticated users"
  ON public.lesson_gate_questions FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- 2. LESSON GATE ATTEMPTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.lesson_gate_attempts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  question_id uuid REFERENCES public.lesson_gate_questions(id) ON DELETE CASCADE NOT NULL,
  is_correct boolean NOT NULL,
  attempted_at timestamptz DEFAULT now()
);
ALTER TABLE public.lesson_gate_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gate attempts: user sees own rows"
  ON public.lesson_gate_attempts FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Gate attempts: user inserts own rows"
  ON public.lesson_gate_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 3. LESSON BOOKMARKS
-- ============================================
CREATE TABLE IF NOT EXISTS public.lesson_bookmarks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);
ALTER TABLE public.lesson_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bookmarks: user sees own rows"
  ON public.lesson_bookmarks FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Bookmarks: user inserts own rows"
  ON public.lesson_bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Bookmarks: user deletes own rows"
  ON public.lesson_bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. LESSON FEEDBACK
-- ============================================
CREATE TABLE IF NOT EXISTS public.lesson_feedback (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  is_helpful boolean NOT NULL,
  time_spent_seconds integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);
ALTER TABLE public.lesson_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Feedback: user sees own rows"
  ON public.lesson_feedback FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Feedback: user inserts own rows"
  ON public.lesson_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 5. XP EVENTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.xp_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL,
  xp_earned integer NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "XP events: user sees own rows"
  ON public.xp_events FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "XP events: user inserts own rows"
  ON public.xp_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_xp_events_user ON public.xp_events(user_id);

-- ============================================
-- 6. BADGES
-- ============================================
CREATE TABLE IF NOT EXISTS public.badges (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Badges: readable by all authenticated users"
  ON public.badges FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- 7. USER BADGES
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  badge_id uuid REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User badges: user sees own rows"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "User badges: readable for public portfolio"
  ON public.user_badges FOR SELECT
  TO authenticated
  USING (true);
CREATE POLICY "User badges: user inserts own rows"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 8. REFERRAL EVENTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.referral_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  referred_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  xp_awarded boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Referral events: referrer sees own rows"
  ON public.referral_events FOR SELECT
  USING (auth.uid() = referrer_id);
CREATE POLICY "Referral events: insert allowed"
  ON public.referral_events FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 9. QUIZ WRONG ANSWERS
-- ============================================
CREATE TABLE IF NOT EXISTS public.quiz_wrong_answers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  question_id uuid REFERENCES public.quiz_questions(id) ON DELETE CASCADE NOT NULL,
  selected_option integer NOT NULL,
  correct_option integer NOT NULL,
  attempt_at timestamptz DEFAULT now()
);
ALTER TABLE public.quiz_wrong_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quiz wrong answers: user sees own rows"
  ON public.quiz_wrong_answers FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Quiz wrong answers: user inserts own rows"
  ON public.quiz_wrong_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_wrong_user ON public.quiz_wrong_answers(user_id, lesson_id);

-- ============================================
-- 10. AI GENERATED QUESTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.ai_generated_questions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  source_question_ids uuid[] NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_answer integer NOT NULL,
  explanation text NOT NULL,
  generated_at timestamptz DEFAULT now()
);
ALTER TABLE public.ai_generated_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "AI questions: user sees own rows"
  ON public.ai_generated_questions FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "AI questions: user inserts own rows"
  ON public.ai_generated_questions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 11. FLASHCARDS
-- ============================================
CREATE TABLE IF NOT EXISTS public.flashcards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  front text NOT NULL,
  back text NOT NULL,
  auto_generated boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Flashcards: readable by all authenticated users"
  ON public.flashcards FOR SELECT
  TO authenticated
  USING (true);
CREATE INDEX IF NOT EXISTS idx_flashcards_lesson ON public.flashcards(lesson_id);

-- ============================================
-- 12. USER FLASHCARD PROGRESS
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_flashcard_progress (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  flashcard_id uuid REFERENCES public.flashcards(id) ON DELETE CASCADE NOT NULL,
  next_review_at timestamptz DEFAULT now(),
  interval_days integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, flashcard_id)
);
ALTER TABLE public.user_flashcard_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Flashcard progress: user sees own rows"
  ON public.user_flashcard_progress FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Flashcard progress: user inserts own rows"
  ON public.user_flashcard_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Flashcard progress: user updates own rows"
  ON public.user_flashcard_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 13. LESSON COMMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.lesson_comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  parent_id uuid REFERENCES public.lesson_comments(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (length(content) >= 1 AND length(content) <= 2000),
  upvotes integer DEFAULT 0,
  is_reported boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.lesson_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments: readable by all authenticated users"
  ON public.lesson_comments FOR SELECT
  TO authenticated
  USING (true);
CREATE POLICY "Comments: user inserts own rows"
  ON public.lesson_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Comments: user updates own rows"
  ON public.lesson_comments FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Comments: user deletes own rows"
  ON public.lesson_comments FOR DELETE
  USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_comments_lesson ON public.lesson_comments(lesson_id);

-- ============================================
-- 14. PUSH SUBSCRIPTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  endpoint text NOT NULL,
  keys jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, endpoint)
);
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Push subscriptions: user sees own rows"
  ON public.push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Push subscriptions: user inserts own rows"
  ON public.push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Push subscriptions: user deletes own rows"
  ON public.push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 15. AI COACH SESSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.ai_coach_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  summary text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.ai_coach_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "AI coach sessions: user sees own rows"
  ON public.ai_coach_sessions FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "AI coach sessions: user inserts own rows"
  ON public.ai_coach_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_user ON public.ai_coach_sessions(user_id, lesson_id);
```

### Task 0.3.4 — Seed badges table

Run this in Supabase SQL Editor after the tables are created:

```sql
INSERT INTO public.badges (slug, name, description, icon) VALUES
-- PROGRESS badges
('prima_lectie', 'Prima Lectie', 'Ai completat prima ta lectie pe DevPath RO. Totul incepe cu un singur pas.', '🌱'),
('primul_modul', 'Primul Modul', 'Ai terminat toate lectiile dintr-un modul intreg. Structura incepe sa apara.', '📦'),
('primul_curs', 'Primul Curs', 'Un curs intreg completat. Aceasta e o realizare reala — nu oricine ajunge aici.', '🎓'),
('la_jumatate', 'La Jumatate', 'Ai terminat jumatate dintr-un curs. Cea mai grea parte e depasita.', '⚡'),
('tocilarul', 'Tocilarul', 'Ai trecut toate quiz-urile dintr-un curs. Se vede ca ai citit cu atentie.', '📚'),
('maini_murdare', 'Maini Murdare', 'Ai completat primul tau exercitiu practic. Teoria e buna — practica e mai buna.', '🛠️'),
('constructor', 'Constructor', 'Ai trimis primul tau proiect. Ai construit ceva cu propriile maini.', '🏗️'),
('complet', 'Complet!', 'Ai terminat toate modulele unui curs. Nu multi pot spune asta.', '✅'),
-- STREAK badges
('trei_zile', 'Trei Zile La Rand', 'Trei zile consecutive de invatare. Obisnuintele se formeaza in 21 de zile — esti la start.', '🔥'),
('o_saptamana', 'O Saptamana', 'Sapte zile la rand. Saptamana asta a contat.', '🔥'),
('doua_saptamani', 'Doua Saptamani', '14 zile consecutive. La aceasta rata, in 6 luni vei sti mai mult despre AI decat 95% din Romania.', '⚡'),
('o_luna', 'O Luna', '30 de zile la rand. Aceasta nu mai e o incercare — e cine esti tu acum.', '🏆'),
('legenda', 'Legenda', '100 de zile consecutive. Intr-un an de azi, vei privi inapoi la aceasta zi.', '👑'),
-- SKILL badges
('perfect_primul', 'Perfect!', 'Primul quiz cu scor 100%. Se poate — si tu ai demonstrat-o.', '💯'),
('geniu_in_formare', 'Geniu in Formare', 'Cinci quiz-uri cu scor perfect. Nu e noroc — e cunoastere reala.', '🧠'),
('cod_rulat', 'Cod Rulat', 'Primul tau cod Python executat in browser. Bun venit in lumea programatorilor.', '💻'),
('jucaus_perfect', 'Jucaus Perfect', 'Scor perfect la un mini-joc. Reflexele tale de invatare sunt ascutite.', '🎮'),
('cartele_dibace', 'Cartele Dibace', 'Prima sesiune de flashcarduri completata. Memoria ta multumeste.', '🃏'),
('programator_in_formare', 'Programator in Formare', 'Ai activat Modul Tehnic. Vrei sa mergi mai adanc — respectabil.', '⚙️'),
-- SOCIAL badges
('vocea_comunitatii', 'Vocea Comunitatii', 'Primul comentariu postat. Cunoasterea ta ajuta acum si pe altii.', '💬'),
('ambasador', 'Ambasador', 'Primul prieten adus pe platforma. Cel mai bun lucru pe care il poti face pentru cineva drag.', '🤝'),
('recrutorul', 'Recrutorul', 'Trei prieteni adusi pe platforma. Construiesti o comunitate.', '🌐'),
('vitrina_deschisa', 'Vitrina Deschisa', 'Profilul tau public e in lume. Invatarea ta e acum vizibila pentru oricine.', '🌟'),
-- SECRET badges
('bufnita_de_noapte', 'Bufnita de Noapte', 'Ai completat o lectie intre miezul noptii si 4 dimineata. Unii invata cand lumea doarme.', '🦉'),
('sarbatoare_cu_minte', 'Sarbatoare cu Minte', 'Ai invatat intr-o zi de sarbatoare nationala. Mintea ta nu ia vacanta.', '🎊')
ON CONFLICT (slug) DO NOTHING;
```

### Task 0.3.5 — Update `schema.sql`

After all migrations succeed in Supabase, update `schema.sql` in the project root:

1. Add all new columns to the `public.users` CREATE TABLE block
2. Add `content_simple_md text` to the `public.lessons` CREATE TABLE block
3. Append all 15 new CREATE TABLE statements with their RLS policies
4. Add all new indexes

`schema.sql` must always match the live database exactly. It is the reference for all future migrations.

---

## 0.4 — Fix Broken Navigation Links

All three links currently have `soon: true` in navbar.tsx which calls `e.preventDefault()` — they never navigate. Task 0.1 (navbar cleanup) removes `soon: true` from all links. Tasks 0.4.1–0.4.3 create the pages those links now point to.

---

### Task 0.4.1 — Create `/dashboard/roadmap/page.tsx`

Create the file `src/app/(dashboard)/dashboard/roadmap/page.tsx`:

Note: The current nav links go to `/roadmap` and `/portfolio` and `/interview` (without `/dashboard` prefix). Check `navbar.tsx` navLinks hrefs carefully — they use `/roadmap` not `/dashboard/roadmap`. The dashboard layout wraps everything under `(dashboard)` group. In Next.js App Router, the `(dashboard)` folder is a route group — routes inside it are served at the path without the group name. So `src/app/(dashboard)/dashboard/roadmap/page.tsx` serves at `/dashboard/roadmap`.

But navbar links say `href: "/roadmap"` — that would be outside the dashboard layout. Check this: if the navbar links use `/roadmap`, create the pages at `src/app/(dashboard)/roadmap/page.tsx`. If they use `/dashboard/roadmap`, create at `src/app/(dashboard)/dashboard/roadmap/page.tsx`.

Looking at navbar.tsx: `{ href: "/roadmap", labelKey: "roadmap" as const, icon: Map, soon: true }` — href is `/roadmap`. So create at `src/app/(dashboard)/roadmap/page.tsx`.

```typescript
// src/app/(dashboard)/roadmap/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Map, BookOpen, PlayCircle, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function RoadmapPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch user profile for daily goal
  const { data: profile } = await supabase
    .from("users")
    .select("name, daily_goal_minutes, level, xp_points")
    .eq("id", user.id)
    .single();

  // Fetch all courses
  const { data: allCourses } = await supabase
    .from("courses")
    .select("id, slug, title, description, difficulty")
    .order("order_index");

  // Fetch all lessons (for counting)
  const { data: allLessons } = await supabase
    .from("lessons")
    .select("id, course_id, order_index, title, type")
    .order("order_index");

  // Fetch completed progress
  const { data: progressData } = await supabase
    .from("user_progress")
    .select("lesson_id, completed_at")
    .eq("user_id", user.id)
    .eq("completed", true);

  const completedIds = new Set((progressData ?? []).map((p) => p.lesson_id));
  const dailyGoal = profile?.daily_goal_minutes ?? 15;

  // Per-course stats
  const courseStats = (allCourses ?? []).map((course) => {
    const courseLessons = (allLessons ?? []).filter(
      (l) => l.course_id === course.id
    );
    const completed = courseLessons.filter((l) => completedIds.has(l.id)).length;
    const total = courseLessons.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const remaining = total - completed;
    // Estimate: avg lesson ~10 min for simple mode
    const daysRemaining =
      dailyGoal > 0 ? Math.ceil((remaining * 10) / dailyGoal) : null;
    const nextLesson = courseLessons.find((l) => !completedIds.has(l.id));
    return { ...course, completed, total, percent, remaining, daysRemaining, nextLesson };
  });

  const activeCourse = courseStats.find((c) => c.percent > 0 && c.percent < 100) ?? courseStats[0];

  return (
    <div className="p-6 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Map className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Drumul tau de invatare</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Progresul tau prin toate cursurile DevPath RO
            </p>
          </div>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Roadmap personalizat complet</strong> — disponibil dupa completarea onboarding-ului (Phase 2).
            Acesta va include recomandari AI bazate pe profilul tau, obiective zilnice si o harta vizuala a progresului.
          </p>
        </div>

        {/* Current course card */}
        {activeCourse && (
          <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                  Curs curent
                </p>
                <h2 className="text-xl font-bold text-foreground">{activeCourse.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{activeCourse.description}</p>
              </div>
              <Badge variant="outline">{activeCourse.difficulty}</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {activeCourse.completed} din {activeCourse.total} lectii completate
                </span>
                <span className="font-semibold text-foreground">{activeCourse.percent}%</span>
              </div>
              <Progress value={activeCourse.percent} className="h-2" />
            </div>
            {activeCourse.daysRemaining !== null && activeCourse.remaining > 0 && (
              <p className="text-sm text-muted-foreground">
                La ritmul actual de <strong>{dailyGoal} minute/zi</strong>, termini in aproximativ{" "}
                <strong>{activeCourse.daysRemaining} zile</strong>.
              </p>
            )}
            {activeCourse.nextLesson && (
              <Link
                href={`/courses/${activeCourse.slug}/${activeCourse.nextLesson.id}`}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-5 py-2.5 rounded-lg transition"
              >
                <PlayCircle className="h-4 w-4" />
                Continua: {activeCourse.nextLesson.title}
              </Link>
            )}
          </div>
        )}

        {/* All courses timeline */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Parcursul complet</h3>
          <div className="space-y-3">
            {courseStats.map((course, idx) => (
              <div
                key={course.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground text-sm font-bold shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-foreground truncate">{course.title}</p>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {course.completed}/{course.total} lectii
                    </span>
                  </div>
                  <Progress value={course.percent} className="h-1 mt-2" />
                </div>
                {course.percent === 100 && (
                  <Badge variant="default" className="shrink-0">Terminat</Badge>
                )}
                {course.percent === 0 && idx > 0 && (
                  <Badge variant="secondary" className="shrink-0">Urmeaza</Badge>
                )}
              </div>
            ))}
            {/* Upcoming courses placeholder */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-dashed border-border opacity-60">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground text-sm font-bold shrink-0">
                <BookOpen className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-muted-foreground">Mai multe cursuri in curand...</p>
                <p className="text-xs text-muted-foreground mt-0.5">ML Practic, Computer Vision, NLP cu Transformers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### Task 0.4.2 — Create `/dashboard/portfolio/page.tsx`

Create the file `src/app/(dashboard)/portfolio/page.tsx`:

```typescript
// src/app/(dashboard)/portfolio/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Briefcase, BookOpen, Trophy, Star, Heart, ExternalLink, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function PortfolioPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch user profile
  const { data: profile } = await supabase
    .from("users")
    .select("name, plan, xp_points, level, streak_count")
    .eq("id", user.id)
    .single();

  // Fetch completed progress joined with lessons and courses
  const { data: progressData } = await supabase
    .from("user_progress")
    .select("lesson_id, completed_at, score")
    .eq("user_id", user.id)
    .eq("completed", true)
    .order("completed_at", { ascending: false });

  // Fetch all lessons for title resolution
  const { data: allLessons } = await supabase
    .from("lessons")
    .select("id, title, type, course_id");

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

  const completedCount = progressData?.length ?? 0;
  const displayName = profile?.name ?? user.email?.split("@")[0] ?? "Student";
  const username = user.email?.split("@")[0] ?? user.id.slice(0, 8);

  // Build completed courses (courses where ALL lessons are complete)
  const { data: allLessonsCount } = await supabase
    .from("lessons")
    .select("id, course_id");

  const completedIds = new Set((progressData ?? []).map((p) => p.lesson_id));
  const completedCourses = (allCourses ?? []).filter((course) => {
    const courseLessons = (allLessonsCount ?? []).filter(
      (l) => l.course_id === course.id
    );
    return courseLessons.length > 0 && courseLessons.every((l) => completedIds.has(l.id));
  });

  return (
    <div className="p-6 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Portofoliul tau</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Profilul tau public:</span>
            <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
              devpath.ro/u/{username}
            </code>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Portofoliu public complet</strong> — cu heatmap de activitate, Learning DNA radar si certificate
            vine in Phase 5. Deocamdata, aceasta pagina iti arata progresul curent.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl bg-card border border-border p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{completedCourses.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Cursuri terminate</p>
          </div>
          <div className="rounded-xl bg-card border border-border p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{completedCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Lectii completate</p>
          </div>
          <div className="rounded-xl bg-card border border-border p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{profile?.xp_points ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">XP total</p>
          </div>
          <div className="rounded-xl bg-card border border-border p-4 text-center">
            <p className="text-2xl font-bold text-foreground">0</p>
            <p className="text-xs text-muted-foreground mt-1">Badge-uri</p>
          </div>
        </div>

        {/* Completed courses */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            Cursuri terminate
          </h3>
          {completedCourses.length === 0 ? (
            <div className="rounded-xl bg-card border border-border p-8 text-center">
              <Trophy className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Niciun curs terminat inca.</p>
              <Link
                href="/courses"
                className="mt-3 text-sm font-medium text-primary hover:underline inline-block"
              >
                Exploreaza cursurile
              </Link>
            </div>
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
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{course.title}</p>
                  </div>
                  <Badge variant="default">Terminat</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Projects */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" />
            Proiectele tale
          </h3>
          {(projects ?? []).length === 0 ? (
            <div className="rounded-xl bg-card border border-border p-8 text-center">
              <Star className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Finalizeaza un curs pentru a trimite un proiect.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Proiectele apar automat in portofoliul tau public.
              </p>
            </div>
          ) : (
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
          )}
        </div>

        {/* Bookmarks */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" />
            Lectii salvate
          </h3>
          <div className="rounded-xl bg-card border border-border p-8 text-center">
            <Heart className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Apasa ♥ pe orice lectie pentru a o salva aici.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Functia de bookmark vine in Phase 1.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### Task 0.4.3 — Create `/dashboard/interview/page.tsx`

Create the file `src/app/(dashboard)/interview/page.tsx`:

Note: This is a Client Component because it uses state and event handlers. It uses the existing `/api/ai/chat` endpoint (which will have auth by then) with a specialized context. Uses the `useChat` hook pattern from `@ai-sdk/react` with a custom `body` to pass interview context.

```typescript
// src/app/(dashboard)/interview/page.tsx
"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import { MessageSquare, RotateCcw, Send, Info, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

const INTERVIEW_LESSON_TITLE = "Sesiune de Pregatire Interviu AI";
const INTERVIEW_LESSON_CONTENT = `Aceasta este o sesiune de pregatire pentru interviuri tehnice in domeniul AI/ML.
Rolul tau: Esti un intervievator experimentat pentru roluri entry-level in AI/ML in Romania.
Comportament:
- Pune cate o intrebare pe rand
- Dupa fiecare raspuns al utilizatorului, da feedback constructiv in 2-3 propozitii
- Adapteaza dificultatea la raspunsurile primite
- Daca raspunsul e bun, spune clar de ce e bun si treci mai departe
- Daca raspunsul e incomplet, explica ce lipseste si ofera un indiciu
- Intrebarile se bazeaza pe conceptele din cursul AI Fundamentals (ce este AI, ML, neural networks, LLM-uri, prompting)
- Vorbeste intotdeauna in romana
- Dupa 5 intrebari, ofera un scurt rezumat al sesiunii si puncte tari/slabe`;

export default function InterviewPage() {
  const [sessionStarted, setSessionStarted] = useState(false);

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } =
    useChat({
      api: "/api/ai/chat",
      body: {
        lessonTitle: INTERVIEW_LESSON_TITLE,
        lessonContent: INTERVIEW_LESSON_CONTENT,
      },
    });

  function startSession() {
    setSessionStarted(true);
    // Trigger first AI message by submitting an empty user message that starts the interview
    const fakeEvent = {
      preventDefault: () => {},
    } as React.FormEvent<HTMLFormElement>;

    // We manually append a hidden trigger message
    setMessages([
      {
        id: "start",
        role: "user",
        content: "Incepe interviul. Pune-mi prima intrebare.",
      },
    ]);
  }

  function resetSession() {
    setMessages([]);
    setSessionStarted(false);
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Pregatire Interviu AI</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Practica cu un intervievator AI in romana
              </p>
            </div>
          </div>
          {sessionStarted && (
            <button
              onClick={resetSession}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition px-3 py-1.5 rounded-lg hover:bg-accent"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Interviu nou
            </button>
          )}
        </div>

        {/* Info card */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <p>
              <strong>Cum functioneaza:</strong> AI-ul joaca rolul unui intervievator pentru
              roluri entry-level in AI/ML. Raspunzi la intrebari in romana, primesti feedback imediat.
            </p>
            <p className="text-blue-600 dark:text-blue-400">
              Versiunea completa cu scoring pe categorii si raport de pregatire vine in Phase 7.
            </p>
          </div>
        </div>

        {/* Start screen */}
        {!sessionStarted && (
          <div className="rounded-2xl bg-card border border-border p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Gata pentru interviu?
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Intervievatorul AI iti va pune 5 intrebari despre conceptele din AI Fundamentals
                si iti va da feedback dupa fiecare raspuns.
              </p>
            </div>
            <button
              onClick={startSession}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 py-3 rounded-lg transition"
            >
              <MessageSquare className="h-4 w-4" />
              Incepe Interviul
            </button>
          </div>
        )}

        {/* Chat interface */}
        {sessionStarted && (
          <div className="rounded-2xl bg-card border border-border overflow-hidden">
            {/* Messages */}
            <div className="p-4 space-y-4 min-h-[400px] max-h-[500px] overflow-y-auto">
              {messages
                .filter((m) => m.id !== "start")
                .map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      )}
                    >
                      {message.content}
                    </div>
                    {message.role === "user" && (
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2.5">
                    <div className="flex gap-1 items-center h-5">
                      <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Scrie raspunsul tau..."
                  disabled={isLoading}
                  className="flex-1 bg-background border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 0.5 — Fix Streak Counter

### Task 0.5.1 — Real streak calculation in `markLessonComplete()`

File: `src/app/(dashboard)/courses/actions.ts`

**After the successful `user_progress` upsert (line 36: `if (error) return...`), add:**

```typescript
  // ─── Streak + last_active update ─────────────────────────────────────────
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const { data: userData } = await supabase
    .from("users")
    .select("last_active, streak_count")
    .eq("id", user.id)
    .single();

  let newStreak: number;

  if (userData?.last_active === today) {
    // Already completed a lesson today — no streak change
    newStreak = userData.streak_count ?? 1;
  } else if (userData?.last_active === yesterday) {
    // Consecutive day — increment streak
    newStreak = (userData.streak_count ?? 0) + 1;
  } else {
    // Either first ever lesson or streak broken — reset to 1
    newStreak = 1;
  }

  await supabase
    .from("users")
    .update({
      last_active: today,
      streak_count: newStreak,
    })
    .eq("id", user.id);
  // ─────────────────────────────────────────────────────────────────────────
```

This code goes BEFORE the `revalidatePath` calls at the bottom of `markLessonComplete`.

**Task 0.5.2 is covered in task 0.1 (dashboard/page.tsx changes):** The query already selects `streak_count` and the hardcoded `0` is replaced with `{profile?.streak_count ?? 0}`.

**Done when:**
- Complete a lesson → dashboard shows streak = 1
- Complete another lesson same day → streak stays 1 (no double-increment)
- The next day, complete a lesson → streak becomes 2
- Skip a day, then complete a lesson → streak resets to 1

---

## 0.6 — Update CLAUDE.md

### Task 0.6.1 — Key additions to CLAUDE.md

**These sections need to be updated or added in CLAUDE.md. Do NOT rewrite the entire file — use Edit to update specific sections.**

**Section to UPDATE: "Database Schema Summary" table**
Add all 15 new tables to the table:
```
| public.lesson_gate_questions | Gate completion questions per lesson | Public read (auth) |
| public.lesson_gate_attempts  | User gate question attempts | User owns own rows |
| public.lesson_bookmarks      | Saved lessons per user | User owns own rows |
| public.lesson_feedback       | Thumbs up/down per lesson | User owns own rows |
| public.xp_events             | XP transaction log | User owns own rows |
| public.badges                | Badge catalog | Public read (auth) |
| public.user_badges           | Badges earned per user | User owns own rows |
| public.referral_events       | Referral tracking | Referrer sees own |
| public.quiz_wrong_answers    | Wrong quiz answers for F2 | User owns own rows |
| public.ai_generated_questions| F2 adaptive quiz output | User owns own rows |
| public.flashcards            | Flashcard definitions | Public read (auth) |
| public.user_flashcard_progress | Spaced repetition state | User owns own rows |
| public.lesson_comments       | Lesson comments (threaded) | Public read (auth) |
| public.push_subscriptions    | Browser push endpoints | User owns own rows |
| public.ai_coach_sessions     | AI coach summaries | User owns own rows |
```

**Section to ADD: just before "Development Priorities"**
```markdown
## Language
Platform is Romanian-only. next-intl has been removed entirely. Do not add any i18n library.
All user-facing text is hardcoded in Romanian directly in component files.
Messages are stored in messages/ro.json for reference only — not imported at runtime.

## Dual Content Modes
Lessons have two content columns:
- `content_md` = Mod Tehnic (existing, technical with code)
- `content_simple_md` = Mod Simplu (new, no code, analogies only)
Always check `users.learning_mode` to determine which column to render.
If `content_simple_md` is null, fall back to `content_md` with a notice.

## Security Reference Implementation
`/api/ai/chat/route.ts` is the reference for all new API routes.
Pattern: auth check first → Zod validation → business logic.
Never skip either step. Edge runtime supports createSupabaseServerClient() via next/headers cookies().
```

**Section to UPDATE: "5 High-Tech Features" table**
Change F2 status to reflect that DB tables now exist:
```
| F2 | Adaptive AI Quiz Generation | Database tables created in Phase 0. API route and UI components: Phase 4 |
```

---

## PHASE 0 — COMPLETE CHECKLIST

### 0.1 Remove next-intl
- [ ] P0.1.1 — Run verification grep: `grep -r "next-intl" src/ --include="*.ts" --include="*.tsx" -l`
- [ ] P0.1.2 — Update next.config.mjs (remove withNextIntl wrapper, export nextConfig directly)
- [ ] P0.1.3 — Verify src/middleware.ts is already clean (no changes needed)
- [ ] P0.1.4 — Update src/app/layout.tsx (remove NextIntlClientProvider, getMessages, getLocale)
- [ ] P0.1.5 — Verify src/app/(dashboard)/layout.tsx is already clean (no changes needed)
- [ ] P0.1.6 — Update src/app/page.tsx (hardcode all Romanian strings, remove LangToggle, remove getTranslations)
- [ ] P0.1.7 — Update src/components/layout/navbar.tsx (remove useTranslations, remove LangToggle, remove soon:true flags)
- [ ] P0.1.8 — Update src/app/(dashboard)/dashboard/page.tsx (remove getTranslations, hardcode strings)
- [ ] P0.1.9 — Delete src/i18n/request.ts
- [ ] P0.1.10 — Delete src/lib/locale.ts
- [ ] P0.1.11 — Delete src/components/lang-toggle.tsx
- [ ] P0.1.12 — Delete src/app/(auth)/set-locale-action.ts (check exists first)
- [ ] P0.1.13 — Run `npm uninstall next-intl`
- [ ] P0.1.14 — Run final grep: `grep -r "next-intl\|useTranslations\|getTranslations\|LangToggle" src/` — must return zero results
- [ ] P0.1.15 — Run `npm run build` — must complete without errors

### 0.2 Security Fixes
- [ ] P0.2.1 — Replace /api/ai/chat/route.ts with auth + Zod version
- [ ] P0.2.2 — Replace /api/ai/tts/route.ts with auth + Zod version
- [ ] P0.2.3 — Test chat: unauthenticated POST returns 401
- [ ] P0.2.4 — Test tts: unauthenticated POST returns 401
- [ ] P0.2.5 — Test both: invalid body returns 400
- [ ] P0.2.6 — Test both: valid authenticated request still works correctly

### 0.3 Database Migrations
- [ ] P0.3.1 — Run Task 0.3.1 SQL in Supabase dashboard (users.role column)
- [ ] P0.3.2 — Run Task 0.3.2 SQL in Supabase dashboard (all onboarding + gamification columns)
- [ ] P0.3.3 — Run Task 0.3.3 SQL in Supabase dashboard (all 15 new tables + RLS)
- [ ] P0.3.4 — Run Task 0.3.4 SQL in Supabase dashboard (seed all 25 badges)
- [ ] P0.3.5 — Verify in Supabase Table Editor: all new tables exist, badges table has 25 rows
- [ ] P0.3.6 — Update schema.sql in project root to reflect all new columns and tables
- [ ] P0.3.7 — Run `npx tsc --noEmit` — zero TypeScript errors

### 0.4 Fix Broken Nav Links
- [ ] P0.4.1 — Create src/app/(dashboard)/roadmap/page.tsx (RSC with real data)
- [ ] P0.4.2 — Create src/app/(dashboard)/portfolio/page.tsx (RSC with real data)
- [ ] P0.4.3 — Create src/app/(dashboard)/interview/page.tsx (Client Component with AI chat)
- [ ] P0.4.4 — Navigate to /roadmap in browser — must load without 404
- [ ] P0.4.5 — Navigate to /portfolio — must load without 404
- [ ] P0.4.6 — Navigate to /interview — must load without 404 and show Start button

### 0.5 Fix Streak
- [ ] P0.5.1 — Add streak calculation to markLessonComplete() in courses/actions.ts
- [ ] P0.5.2 — Verify dashboard/page.tsx reads profile.streak_count (covered in P0.1.8)
- [ ] P0.5.3 — Complete a lesson — dashboard streak increments to 1
- [ ] P0.5.4 — Complete another lesson same day — streak stays at 1

### 0.6 Update CLAUDE.md
- [ ] P0.6.1 — Update Database Schema Summary table with 15 new tables
- [ ] P0.6.2 — Add Language section
- [ ] P0.6.3 — Add Dual Content Modes section
- [ ] P0.6.4 — Add Security Reference Implementation section
- [ ] P0.6.5 — Update Feature 2 status in High-Tech Features table

---

**PHASE 0 TOTAL: 30 tasks**
**Completed: 0 | Remaining: 30**

---

*After all 30 tasks are checked off — move to devpath-plan-phase1.md*
*Phase 1 scope: Dual-Mode content architecture, lesson gate questions, scroll tracking, content rewrites for lessons 1-14 in Mod Simplu, lesson briefs for lessons 15-30.*
