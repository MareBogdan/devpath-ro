# DevPath RO — Phase 8-9: Admin Dashboard & Second Course
**Status:** Not started
**Effort:** 2-3 weeks
**Depends on:** Phase 0-7 complete
**References:** devpath-vision.md (platform goals, gamification, dual-mode, badges)

---

## WHY THIS PHASE EXISTS

The platform has no visibility into whether it is working. Lessons could be silently confusing users, badges may never be earned, and mini-games might be producing zero engagement — but without an admin dashboard, there is no way to know. Phase 8 gives the team operational eyes: who is learning, which lessons lose users, which badges are too rare, which comments need moderation.

Phase 9 adds the second course "Prompt Engineering Practic" — the most practically valuable skill a non-technical Romanian can acquire in 2026. It follows the same dual-mode architecture as AI Fundamentals, with 30 lessons across 6 modules. This course is the one non-technical users (doctors, entrepreneurs, teachers) will find immediately actionable. Completing two courses unlocks the full portfolio system and builds meaningful XP for reaching levels 7-10.

---

## PHASE 8 — Admin Dashboard & Analytics

### 8.0 — DB Migrations

Show this SQL to the user and wait for approval before running.

```sql
-- ============================================================
-- PHASE 8 DB MIGRATIONS
-- ============================================================

-- 1. Role column on users (admin access control)
-- Phase 0 may have already added this column with CHECK ('student', 'admin').
-- This migration is safe to run regardless of Phase 0 status.

DO $$
BEGIN
  -- If column does not exist: create it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'users'
      AND column_name  = 'role'
  ) THEN
    ALTER TABLE public.users
      ADD COLUMN role text NOT NULL DEFAULT 'user'
      CHECK (role IN ('student', 'user', 'admin'));

  ELSE
    -- Column exists (added in Phase 0 with CHECK ('student','admin')).
    -- Drop the old constraint and replace with one that covers all three values.
    ALTER TABLE public.users
      DROP CONSTRAINT IF EXISTS users_role_check;

    ALTER TABLE public.users
      ADD CONSTRAINT users_role_check
      CHECK (role IN ('student', 'user', 'admin'));
  END IF;
END
$$;

-- Update RLS: admins can read all user rows
DROP POLICY IF EXISTS "Admin read all users" ON public.users;
CREATE POLICY "Admin read all users" ON public.users
  FOR SELECT TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')
    OR auth.uid() = id
  );

-- 2. Soft delete and moderation columns for lesson_comments
ALTER TABLE public.lesson_comments
  ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS report_count integer NOT NULL DEFAULT 0;

-- Hide deleted comments from regular users
DROP POLICY IF EXISTS "Users can read comments" ON public.lesson_comments;
CREATE POLICY "Users can read non-deleted comments" ON public.lesson_comments
  FOR SELECT TO authenticated
  USING (
    is_deleted = false
    OR auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')
  );

-- 3. Ban columns on users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_banned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ban_reason text,
  ADD COLUMN IF NOT EXISTS banned_at timestamptz;

-- Banned users cannot insert new comments
DROP POLICY IF EXISTS "Users can insert comments" ON public.lesson_comments;
CREATE POLICY "Non-banned users can insert comments" ON public.lesson_comments
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() NOT IN (SELECT id FROM public.users WHERE is_banned = true)
    AND auth.uid() = user_id
  );

-- ============================================================
-- ANALYTICS RPC FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_admin_user_stats()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'total_users',          (SELECT COUNT(*) FROM public.users),
    'dau',                  (
      SELECT COUNT(DISTINCT user_id)
      FROM public.user_progress
      WHERE updated_at >= NOW() - INTERVAL '1 day'
    ),
    'mau',                  (
      SELECT COUNT(DISTINCT user_id)
      FROM public.user_progress
      WHERE updated_at >= NOW() - INTERVAL '30 days'
    ),
    'simple_mode_users',    (SELECT COUNT(*) FROM public.users WHERE learning_mode = 'simple'),
    'technical_mode_users', (SELECT COUNT(*) FROM public.users WHERE learning_mode = 'technical'),
    'banned_users',         (SELECT COUNT(*) FROM public.users WHERE is_banned = true),
    'new_users_7d',         (
      SELECT COUNT(*) FROM public.users
      WHERE created_at >= NOW() - INTERVAL '7 days'
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.get_lesson_analytics()
RETURNS TABLE(
  lesson_id         uuid,
  lesson_title      text,
  order_index       integer,
  module_id         text,
  lesson_type       text,
  completion_count  bigint,
  avg_time_seconds  numeric,
  hard_feedback_count  bigint,
  clear_feedback_count bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    l.id,
    l.title,
    l.order_index,
    l.module_id,
    l.type,
    COUNT(up.id) FILTER (WHERE up.completed = true),
    ROUND(AVG(lf.time_spent_seconds), 0),
    COUNT(lf.id) FILTER (WHERE lf.rating = 'hard'),
    COUNT(lf.id) FILTER (WHERE lf.rating = 'clear')
  FROM public.lessons l
  LEFT JOIN public.user_progress up ON up.lesson_id = l.id
  LEFT JOIN public.lesson_feedback lf ON lf.lesson_id = l.id
  GROUP BY l.id, l.title, l.order_index, l.module_id, l.type
  ORDER BY l.order_index ASC;
$$;

CREATE OR REPLACE FUNCTION public.get_minigame_stats()
RETURNS TABLE(
  game_type      text,
  total_sessions bigint,
  avg_score      numeric,
  perfect_count  bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    game_type,
    COUNT(*),
    ROUND(AVG(score), 2),
    COUNT(*) FILTER (WHERE score = 30)
  FROM public.minigame_sessions
  GROUP BY game_type
  ORDER BY game_type;
$$;

CREATE OR REPLACE FUNCTION public.get_badge_stats()
RETURNS TABLE(
  badge_slug   text,
  earned_count bigint,
  total_users  bigint,
  rarity_pct   numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH total AS (SELECT COUNT(*) AS n FROM public.users)
  SELECT
    badge_slug,
    COUNT(*),
    total.n,
    ROUND(COUNT(*) * 100.0 / NULLIF(total.n, 0), 1)
  FROM public.user_badges, total
  GROUP BY badge_slug, total.n
  ORDER BY earned_count DESC;
$$;

-- RPC: Admin comment report increment (called from report button)
CREATE OR REPLACE FUNCTION public.report_comment(p_comment_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.lesson_comments
  SET report_count = report_count + 1
  WHERE id = p_comment_id;
$$;
```

**Update `schema.sql`** after running migrations.

---

### 8.1 — Admin Route Group

**New files:**
- `src/app/(admin)/layout.tsx` — RSC, auth + role check
- `src/app/(admin)/admin/page.tsx` — redirect to /admin/users
- `src/app/(admin)/admin/users/page.tsx`
- `src/app/(admin)/admin/lessons/page.tsx`
- `src/app/(admin)/admin/minigames/page.tsx`
- `src/app/(admin)/admin/comments/page.tsx`
- `src/app/(admin)/admin/badges/page.tsx`
- `src/components/admin/stat-card.tsx`
- `src/components/admin/css-bar-chart.tsx`
- `src/app/(admin)/admin/actions.ts` — server actions: deleteComment, banUser, unbanUser

**`src/app/(admin)/layout.tsx`:**
```typescript
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-3 flex items-center gap-6">
        <span className="font-semibold text-sm">DevPath Admin</span>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <a href="/admin/users"    className="hover:text-foreground transition">Utilizatori</a>
          <a href="/admin/lessons"  className="hover:text-foreground transition">Lecții</a>
          <a href="/admin/minigames" className="hover:text-foreground transition">Mini-jocuri</a>
          <a href="/admin/comments" className="hover:text-foreground transition">Comentarii</a>
          <a href="/admin/badges"   className="hover:text-foreground transition">Badge-uri</a>
        </nav>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
```

**`src/app/(admin)/admin/page.tsx`:**
```typescript
import { redirect } from "next/navigation";
export default function AdminRoot() {
  redirect("/admin/users");
}
```

---

### 8.2 — User Stats Page

**`src/app/(admin)/admin/users/page.tsx`:**
```typescript
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/admin/stat-card";

export default async function AdminUsersPage() {
  const supabase = createSupabaseServerClient();
  const { data: stats } = await supabase.rpc("get_admin_user_stats");

  const s = stats as {
    total_users: number; dau: number; mau: number;
    simple_mode_users: number; technical_mode_users: number;
    banned_users: number; new_users_7d: number;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Utilizatori</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total utilizatori"   value={s.total_users}        />
        <StatCard label="Activi azi (DAU)"    value={s.dau}                />
        <StatCard label="Activi 30 zile (MAU)" value={s.mau}              />
        <StatCard label="Noi (7 zile)"        value={s.new_users_7d}       />
        <StatCard label="Mod Simplu"          value={s.simple_mode_users}  />
        <StatCard label="Mod Tehnic"          value={s.technical_mode_users} />
        <StatCard label="Banați"              value={s.banned_users} variant="danger" />
      </div>
    </div>
  );
}
```

**`src/components/admin/stat-card.tsx`:**
```typescript
interface StatCardProps {
  label: string;
  value: number;
  variant?: "default" | "danger";
}

export function StatCard({ label, value, variant = "default" }: StatCardProps) {
  return (
    <div className={`rounded-xl border p-4 ${
      variant === "danger"
        ? "border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-950/20"
        : "border-border bg-card"
    }`}>
      <p className="text-2xl font-bold tabular-nums">{value.toLocaleString("ro-RO")}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
```

---

### 8.3 — Lesson Analytics Page

**`src/app/(admin)/admin/lessons/page.tsx`:**
```typescript
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CssBarChart } from "@/components/admin/css-bar-chart";

export default async function AdminLessonsPage() {
  const supabase = createSupabaseServerClient();
  const { data: lessons } = await supabase.rpc("get_lesson_analytics");

  const rows = (lessons ?? []) as Array<{
    lesson_id: string; lesson_title: string; order_index: number;
    lesson_type: string; completion_count: number; avg_time_seconds: number;
    hard_feedback_count: number; clear_feedback_count: number;
  }>;

  const maxCompletions = Math.max(...rows.map((r) => r.completion_count), 1);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Analiză Lecții</h1>
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">#</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Lecție</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Completări</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Timp mediu</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Dificil / Clar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.lesson_id} className="hover:bg-muted/30 transition">
                <td className="px-4 py-2 text-muted-foreground">{row.order_index}</td>
                <td className="px-4 py-2 font-medium">{row.lesson_title}</td>
                <td className="px-4 py-2 w-48">
                  <CssBarChart value={row.completion_count} max={maxCompletions}
                    label={String(row.completion_count)} />
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {row.avg_time_seconds
                    ? `${Math.round(row.avg_time_seconds / 60)} min`
                    : "—"}
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  <span className="text-red-500">{row.hard_feedback_count}</span>
                  {" / "}
                  <span className="text-green-600">{row.clear_feedback_count}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

**`src/components/admin/css-bar-chart.tsx`:**
```typescript
interface CssBarChartProps {
  value: number;
  max: number;
  label: string;
  color?: string;
}

export function CssBarChart({
  value, max, label, color = "bg-primary"
}: CssBarChartProps) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono w-8 text-right text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
```

> **recharts is NOT installed.** The CSS bar chart above replaces any need for it. Do NOT install recharts unless explicitly approved by the user. The pure-CSS approach is sufficient for admin analytics.

---

### 8.4 — Mini-Game Performance Page

**`src/app/(admin)/admin/minigames/page.tsx`:**
```typescript
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CssBarChart } from "@/components/admin/css-bar-chart";

const GAME_LABELS: Record<string, string> = {
  sort_concepts:  "Sortează Conceptele",
  fill_blank:     "Completează Propoziția",
  match_pairs:    "Potrivește Perechile",
  true_false:     "Adevărat sau Fals",
  build_network:  "Construiește Rețeaua",
  write_prompt:   "Scrie Promptul Perfect",
};

export default async function AdminMinigamesPage() {
  const supabase = createSupabaseServerClient();
  const { data: stats } = await supabase.rpc("get_minigame_stats");

  const rows = (stats ?? []) as Array<{
    game_type: string; total_sessions: number;
    avg_score: number; perfect_count: number;
  }>;

  const maxSessions = Math.max(...rows.map((r) => r.total_sessions), 1);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Performanță Mini-Jocuri</h1>
      <div className="grid gap-4">
        {rows.map((row) => (
          <div key={row.game_type}
            className="rounded-xl border border-border bg-card p-4 flex items-center gap-6">
            <div className="w-48 shrink-0">
              <p className="text-sm font-medium">{GAME_LABELS[row.game_type] ?? row.game_type}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {row.total_sessions} sesiuni
              </p>
            </div>
            <div className="flex-1">
              <CssBarChart value={row.total_sessions} max={maxSessions}
                label={`${row.total_sessions}`} />
            </div>
            <div className="w-28 text-right text-sm">
              <p className="font-mono">{row.avg_score} / 30</p>
              <p className="text-xs text-muted-foreground">
                {row.perfect_count} perfecte
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### 8.5 — Comment Moderation Panel

**`src/app/(admin)/admin/comments/page.tsx`:**

Fetches comments where `report_count > 0` OR `is_deleted = false` ordered by `report_count DESC`. Displays reported queue at top, full list below. Admin can soft-delete or ban user.

```typescript
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CommentModerationClient } from "@/components/admin/comment-moderation-client";

export default async function AdminCommentsPage() {
  const supabase = createSupabaseServerClient();

  const { data: comments } = await supabase
    .from("lesson_comments")
    .select(`
      id, content, created_at, is_deleted, report_count, deleted_at,
      user:users!lesson_comments_user_id_fkey(id, name, email, is_banned),
      lesson:lessons!lesson_comments_lesson_id_fkey(title)
    `)
    .order("report_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Moderare Comentarii</h1>
      <CommentModerationClient comments={comments ?? []} />
    </div>
  );
}
```

**`src/components/admin/comment-moderation-client.tsx`** — `"use client"`:

State: `optimisticDeleted: Set<string>`, `optimisticBanned: Set<string>`.

Two buttons per row: "Șterge comentariu" (calls `deleteComment` server action) and "Banează utilizator" (calls `banUser` server action).

**`src/app/(admin)/admin/actions.ts`:**
```typescript
"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data } = await supabase
    .from("users").select("role").eq("id", user.id).single();
  if (data?.role !== "admin") throw new Error("Forbidden");
  return supabase;
}

export async function deleteComment(commentId: string): Promise<{ error?: string }> {
  try {
    const supabase = await requireAdmin();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase
      .from("lesson_comments")
      .update({
        is_deleted: true,
        deleted_by: user!.id,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", commentId);
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function banUser(
  userId: string,
  reason: string
): Promise<{ error?: string }> {
  try {
    const supabase = await requireAdmin();
    await supabase
      .from("users")
      .update({
        is_banned: true,
        ban_reason: reason,
        banned_at: new Date().toISOString(),
      })
      .eq("id", userId);
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function unbanUser(userId: string): Promise<{ error?: string }> {
  try {
    const supabase = await requireAdmin();
    await supabase
      .from("users")
      .update({ is_banned: false, ban_reason: null, banned_at: null })
      .eq("id", userId);
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}
```

---

### 8.6 — Badge Analytics Page

**`src/app/(admin)/admin/badges/page.tsx`:**
```typescript
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CssBarChart } from "@/components/admin/css-bar-chart";

export default async function AdminBadgesPage() {
  const supabase = createSupabaseServerClient();
  const { data: badges } = await supabase.rpc("get_badge_stats");

  const rows = (badges ?? []) as Array<{
    badge_slug: string; earned_count: number;
    total_users: number; rarity_pct: number;
  }>;

  const max = Math.max(...rows.map((r) => r.earned_count), 1);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Badge Analytics</h1>
      <p className="text-sm text-muted-foreground">
        Total utilizatori: {rows[0]?.total_users ?? 0}
      </p>
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Badge</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Câștigat de</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground w-48">Distribuție</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Raritate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.badge_slug} className="hover:bg-muted/30">
                <td className="px-4 py-2 font-mono text-xs">{row.badge_slug}</td>
                <td className="px-4 py-2">{row.earned_count}</td>
                <td className="px-4 py-2">
                  <CssBarChart value={row.earned_count} max={max}
                    label={`${row.rarity_pct}%`} />
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {row.rarity_pct >= 50 ? "Comun" :
                   row.rarity_pct >= 20 ? "Rar" :
                   row.rarity_pct >= 5  ? "Foarte rar" : "Ultra rar"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## PHASE 9 — Second Course: Prompt Engineering Practic

### 9.0 — Course Design Principles

**Course name:** Prompt Engineering Practic
**Slug:** `prompt-engineering-practic`
**Target:** 80% non-technical users (doctors, entrepreneurs, teachers, students)
**Duration:** ~12 hours estimated
**Level:** `beginner`
**Lesson count:** 30 (24 theory + 4 exercise + 1 quiz×6 modules + 1 project)
Wait — structure is: each module has 5 lessons → 6 × 5 = 30.

**Dual-mode rules for this course:**
- All theory lessons: full Simple Mode (no code, Romanian analogies)
- Exercise lessons: Simple Mode shows walkthrough without code; Technical Mode shows code + API calls
- Quiz lessons: shared questions (same for both modes, prompt-focused)
- Project lesson: single version, no code in description (project has both tracks)

**Key difference from AI Fundamentals:** Every lesson in this course has immediate practical value. Users should be able to apply each lesson the same day. Analogies are drawn from the user's professional domain (medicine, business, education).

---

### 9.1 — Course Structure: 30 Lessons, 6 Modules

#### Module 1 — Bazele Prompt Engineering (Lessons 1–5)
| # | Title | Type | File |
|---|---|---|---|
| 1 | Ce este un Prompt? | theory | lesson-01-ce-este-un-prompt |
| 2 | Cum Gândește un Model AI | theory | lesson-02-cum-gandeste-un-model-ai |
| 3 | Anatomia unui Prompt Eficient | theory | lesson-03-anatomia-unui-prompt-eficient |
| 4 | Exercițiu: De la Prompt Slab la Prompt Bun | exercise | lesson-04-exercitiu-prompt-slab-bun |
| 5 | Quiz Modulul 1 | quiz | lesson-05-quiz-modulul-1 |

#### Module 2 — Tehnici Esențiale (Lessons 6–10)
| # | Title | Type | File |
|---|---|---|---|
| 6 | Zero-Shot Prompting | theory | lesson-06-zero-shot-prompting |
| 7 | Few-Shot Prompting cu Exemple | theory | lesson-07-few-shot-prompting |
| 8 | Chain-of-Thought: Gândire Pas cu Pas | theory | lesson-08-chain-of-thought |
| 9 | Exercițiu: Construiește un Prompt CoT | exercise | lesson-09-exercitiu-cot |
| 10 | Quiz Modulul 2 | quiz | lesson-10-quiz-modulul-2 |

#### Module 3 — System Prompts și Persona (Lessons 11–15)
| # | Title | Type | File |
|---|---|---|---|
| 11 | Ce este un System Prompt? | theory | lesson-11-ce-este-system-prompt |
| 12 | Crearea unui Persona AI | theory | lesson-12-crearea-unui-persona-ai |
| 13 | Injecția de Context și Instrucțiuni Persistente | theory | lesson-13-injectia-de-context |
| 14 | Exercițiu: Construiește un Asistent Personalizat | exercise | lesson-14-exercitiu-asistent |
| 15 | Quiz Modulul 3 | quiz | lesson-15-quiz-modulul-3 |

#### Module 4 — Tehnici Avansate (Lessons 16–20)
| # | Title | Type | File |
|---|---|---|---|
| 16 | Meta-Prompting | theory | lesson-16-meta-prompting |
| 17 | Prompturi Structurate: JSON, Liste, Tabele | theory | lesson-17-prompturi-structurate |
| 18 | Prompt Chaining: Lanțuri de Instrucțiuni | theory | lesson-18-prompt-chaining |
| 19 | Exercițiu: Automatizare cu Prompt Chaining | exercise | lesson-19-exercitiu-chaining |
| 20 | Quiz Modulul 4 | quiz | lesson-20-quiz-modulul-4 |

#### Module 5 — Aplicații pe Domenii (Lessons 21–25)
| # | Title | Type | File |
|---|---|---|---|
| 21 | Prompt Engineering pentru Redactare | theory | lesson-21-redactare |
| 22 | Prompt Engineering pentru Analiză | theory | lesson-22-analiza |
| 23 | Prompt Engineering pentru Antreprenori | theory | lesson-23-antreprenori |
| 24 | Exercițiu: Prompt Kit pentru Domeniul Tău | exercise | lesson-24-exercitiu-prompt-kit |
| 25 | Quiz Modulul 5 | quiz | lesson-25-quiz-modulul-5 |

#### Module 6 — Maestru al Prompturilor (Lessons 26–30)
| # | Title | Type | File |
|---|---|---|---|
| 26 | Greșeli Comune și Anti-Pattern-uri | theory | lesson-26-greseli-comune |
| 27 | Evaluarea Calității unui Prompt | theory | lesson-27-evaluarea-calitatii |
| 28 | Etica Prompt Engineering | theory | lesson-28-etica-prompt-engineering |
| 29 | Viitorul: De la Prompturi la Agenți | theory | lesson-29-viitorul-agenti |
| 30 | Proiect Final: Asistentul Tău AI | project | lesson-30-proiect-final |

---

### 9.2 — DB Setup

**Content directory:** `content/prompt-engineering-practic/`

All MDX files follow naming: `lesson-NN-slug.mdx` (technical mode) and `lesson-NN-slug-simple.mdx` (simple mode).

**Step 1 — Insert course row (run manually):**
```sql
INSERT INTO public.courses (
  id, title, slug, description, thumbnail_url, level, duration_hours, is_published
) VALUES (
  uuid_generate_v4(),
  'Prompt Engineering Practic',
  'prompt-engineering-practic',
  'Învață să comunici eficient cu AI-ul. 30 de lecții practice pentru a obține rezultate remarcabile din orice model AI — fără cod, fără matematică, cu aplicații reale pentru domeniul tău.',
  '/thumbnails/prompt-engineering-practic.jpg',
  'beginner',
  12,
  false
);
```

**Step 2 — Create MDX files (Section 9.3 below), then run sync-action** to populate lesson rows. The sync-action reads frontmatter and creates/updates `public.lessons` rows automatically.

**Step 3 — After sync, run gate question INSERTs** (Section 9.4).

**MDX frontmatter template for this course:**
```mdx
---
title: "Titlul Lecției"
description: "O propoziție care descrie ce înveți."
order: 1
type: theory
moduleId: modul-1
---
```

---

### 9.3 — All 30 Lessons

#### Lesson 1 — Ce este un Prompt?

**Files:** `lesson-01-ce-este-un-prompt-simple.mdx` + `lesson-01-ce-este-un-prompt.mdx`

**Simple Mode MDX (write full content):**

```mdx
---
title: "Ce este un Prompt?"
description: "Înțelege ce înseamnă un prompt și de ce calitatea instrucțiunii determină calitatea răspunsului AI."
order: 1
type: theory
moduleId: modul-1
---

# Ce este un Prompt?

Imaginează-ți că ai un prieten extrem de inteligent — cineva care știe despre medicină, drept, marketing,
psihologie și orice altceva poți imagina. A citit orice carte scrisă vreodată, are o memorie perfectă
și este disponibil oricând.

Singurul lucru pe care nu îl face singur? Nu ia inițiativa. Nu ghicește ce vrei. Dacă îl întrebi vag,
primești un răspuns vag. Dacă îl întrebi precis, primești exact ce ai nevoie.

**Aceasta este relația ta cu un model AI. Iar promptul este mesajul pe care i-l trimiți.**

## Ce Este, Mai Exact, un Prompt?

Un prompt este orice text pe care îl trimiți unui model AI pentru a obține un răspuns. Poate fi:

- O întrebare simplă: *"Ce este un Black Hole?"*
- O cerere: *"Scrie-mi un email de follow-up pentru o ofertă de vânzare"*
- O instrucțiune detaliată cu context, rol și format specificat

Toate sunt prompturi — dar produc rezultate dramatic diferite.

## Analogia Restaurantului

Gândește-te la cum funcționează o comandă la restaurant.

Dacă intri și spui *"dă-mi ceva bun"*, chelnerul are o problemă: nu știe dacă ești vegetarian,
ce buget ai, dacă ți-e cald sau frig, dacă ai timp sau ești grăbit.

Dacă spui: *"O ciorbă de legume fierbinte, fără fidea, fără carne, cu smântână pe lateral"* —
primești exact ce ai cerut.

AI-ul funcționează la fel, cu o diferență crucială: **nu te întreabă niciodată "Dar ce vrei mai exact?"**
Te ia de cuvânt. Instrucțiune vagă = răspuns vag. Instrucțiune precisă = răspuns precis.

## Trei Prompturi pentru Aceeași Sarcină

Să comparăm trei abordări pentru aceeași nevoie: vreau un email profesional pentru un client nou.

**Promptul 1 — slab:**
> Scrie un email.

Rezultat: un email generic, probabil în engleză, despre nimic specific.

**Promptul 2 — mediu:**
> Scrie un email de bun venit pentru un client nou.

Rezultat: mai bun, dar tot generic. Lipsesc detalii despre ton, industrie, scop.

**Promptul 3 — bun:**
> Scrie un email de bun venit pentru un client nou al firmei mele de contabilitate din Cluj.
> Tonul: profesional dar cald, nu formal rece. Include: urările de bun venit, procesul de onboarding
> (trimiterea documentelor necesare, prima întâlnire de cunoaștere în 7 zile), și contactul meu direct.
> Maxim 150 de cuvinte.

Rezultat: gata de trimis cu mici ajustări personale.

**Aceasta este esența prompt engineering-ului: arta de a formula instrucțiuni care produc exact rezultatele dorite.**

## Anatomia de Bază a unui Prompt Bun

Orice prompt eficient conține, de obicei, câteva componente:

**Context** — Cine ești tu, care e situația?
*"Sunt medic de familie într-o clinică privată din București..."*

**Sarcina** — Ce vrei să facă AI-ul?
*"...vreau să explic unui pacient anxios ce este tensiunea arterială normală..."*

**Formatul** — Cum vrei răspunsul?
*"...în maxim 5 propoziții simple, fără termeni medicali complecși."*

Nu ai nevoie de toate trei în fiecare prompt. Pentru întrebări simple, o propoziție clară e suficientă.
Pentru sarcini complexe, mai mult context = rezultate mai bune.

## Mitul "Cuvintelor Magice"

Un mit frecvent: prompt engineering înseamnă să "păcălești" AI-ul sau să găsești combinații speciale
de cuvinte care deblochează funcții ascunse.

**Fals.** Prompt engineering înseamnă să comunici clar. Exact cum comunici cu un om inteligent:
dacă ești clar, precis și îi dai contextul necesar, rezultatele sunt bune.

Un alt mit: trebuie să fii programator. La fel de fals. Cele mai bune prompturi sunt scrise de oameni
care știu exact ce vor — doctori care descriu un simptom precis, scriitori care știu ce ton caută,
antreprenori care înțeleg clientul lor. **Expertiza ta de domeniu este cel mai valoros ingredient.**

## De Ce Merită Să Înveți Asta

Trăim într-un moment în care accesul la un "expert" de talie mondială — fie el avocat, consultant de
strategie, sau specialist în marketing — este gratuit sau aproape gratuit prin AI.

Singura diferență între cineva care obține răspunsuri mediocre și cineva care obține răspunsuri
excepționale este promptul. Nu modelul folosit, nu abonamentul premium, nu experiența în IT.

Promptul.

În lecțiile acestui curs, vei învăța exact cum să scrii prompturi care produc rezultate remarcabile —
pentru orice domeniu, pentru orice nevoie profesională sau personală.
```

**Technical Mode** (`lesson-01-ce-este-un-prompt.mdx`): Same structure but adds OpenAI API message format (system/user/assistant roles), temperature parameter, JSON mode intro, and a `python-editor` block with a basic `openai.chat.completions.create()` call demonstrating the three example prompts above.

---

#### Lesson 2 — Cum Gândește un Model AI

**Simple Mode key points:**
- Analogie: "Modelul e un completator de propoziții extrem de bun — nu gândește, completează."
- Explică next-token prediction fără matematică: "Modelul a văzut miliarde de propoziții. Știe că după «Capitala României este» urmează «București» cu probabilitate foarte mare."
- Cum afectează asta prompturile: modele predicții + formulare clară = rezultate bune
- Temperatura explicată ca "nivelul de creativitate": 0 = răspuns fix, 1 = variabil/creativ
- Analogie: temperatura = cantitatea de sare în mâncare. 0 = fad predictibil, 1 = poate fi foarte bun sau neumâncat
- Concluzie: AI nu "înțelege" — recunoaște tipare. Dacă promptul tău seamănă cu tipare clare din antrenare, răspunsul e bun.
- ~800 cuvinte, fără formule, fără cod

**Technical Mode additions:** Log-probabilities, softmax function briefly, sampling strategies (greedy, top-p, top-k), Python snippet showing temperature effect.

**Gate questions:** (See Section 9.4)

---

#### Lesson 3 — Anatomia unui Prompt Eficient

**Simple Mode key points:**
- 5 componente opționale ale unui prompt complet: Rol, Context, Sarcina, Format, Constrângeri
- **Rol**: "Ești un avocat specializat în dreptul muncii din România."
- **Context**: "Am un angajat care a absentat 3 zile fără justificare."
- **Sarcina**: "Explică-mi pașii legali pe care îi am la dispoziție."
- **Format**: "O listă numerotată, maxim 5 pași, în termeni simpli."
- **Constrângeri**: "Fără referințe la legi specifice — trebuie să înțeleagă un nespecialist."
- Analogie: rețeta de bucătărie. Rețeta completă (ingrediente + cantități + pași + timp) = rezultat previzibil. Rețeta incompletă = ghici tu.
- Exercițiu mental: identifică cele 5 componente în 3 prompturi reale
- Când folosești toate 5, când te descurci cu 2: pentru sarcini simple nu ai nevoie de rol și format. Pentru sarcini profesionale complexe, toate 5 fac diferența.
- ~850 cuvinte

**Technical Mode:** Adds JSON structured output format, role distinction (system vs user), multi-turn conversation context.

---

#### Lesson 4 — Exercițiu: De la Prompt Slab la Prompt Bun

**Type:** exercise. **No Simple Mode MDX needed for exercise frame — same component renders differently.**

**Simple Mode:** Prezintă 8 perechi "prompt slab → prompt bun" cu explicație. Utilizatorul citește, compară, și încearcă să identifice ce s-a îmbunătățit. Fără cod. 4 domenii: medical, antreprenorial, educație, personal.

Exemplu pereche 1 (medical):
- Slab: "Ce medicamente am voie să iau pentru dureri de cap?"
- Bun: "Sunt un pacient adult de 35 de ani, fără boli cronice cunoscute, cu durere de cap tensională occasională. Ce opțiuni OTC am pentru ameliorare și când ar trebui să mă adresez medicului?"

Exemplu pereche 2 (business):
- Slab: "Ajută-mă cu marketingul firmei mele."
- Bun: "Dețin o florărie în Timișoara cu 3 angajați. Clientela principală: femei 30-55 ani, ocazii speciale. Buget marketing: 500 RON/lună. Propune 3 acțiuni concrete pentru luna februarie (Valentine's Day)."

**Technical Mode:** Aceleași perechi + python-editor cu un bloc de cod care trimite ambele prompturi la API și afișează răspunsurile side-by-side pentru comparație.

---

#### Lesson 5 — Quiz Modulul 1

**Type:** quiz. Uses existing `quiz-block.tsx`. 5 questions:

1. "Ce este un prompt?" → O instrucțiune sau întrebare trimisă unui model AI
2. "De ce un prompt vag produce un răspuns slab?" → AI-ul răspunde exact la ce întrebi — ambiguitatea din întrebare apare în răspuns
3. "Care dintre acestea este cel mai eficient prompt?" → [4 opțiuni, cea mai specifică e corectă]
4. "Ce este «temperatura» unui model AI?" → Parametru care controlează cât de variat/creativ e răspunsul
5. "Care componentă a unui prompt stabilește ce ROL joacă AI-ul?" → Rolul / Persona

---

#### Lesson 6 — Zero-Shot Prompting

**Files:** `lesson-06-zero-shot-prompting-simple.mdx` + technical

**Simple Mode MDX (write full content):**

```mdx
---
title: "Zero-Shot Prompting"
description: "Cum obții rezultate bune fără să dai exemple — și când funcționează această abordare."
order: 6
type: theory
moduleId: modul-2
---

# Zero-Shot Prompting

"Zero-shot" sună tehnic, dar ideea e simplă: **îi ceri AI-ului să facă ceva fără să îi arăți niciun
exemplu de cum ar trebui să arate rezultatul.**

Dai sarcina direct. Fără demonstrații. Fără "uite cum arată un răspuns bun, acum fă la fel."

## Analogia Primei Zile la Muncă

Imaginează-ți că ești angajat nou și șeful îți spune: "Trimite un email clientului Smith să îl informezi
că livrarea întârzie cu 2 zile."

Nu ți-a arătat cum arată un email bun din firma asta. Nu ți-a dat exemple. Ai instrucțiunea și experiența
ta generală de a scrie emailuri — și te descurci.

Asta e zero-shot. AI-ul are "experiența generală" din antrenare (miliarde de texte), primește instrucțiunea
ta, și produce un rezultat fără niciun exemplu specific.

## Când Funcționează Zero-Shot?

Zero-shot funcționează excelent pentru sarcini pe care AI-ul le-a "văzut" des în antrenare:

- **Traducere:** "Traduce în română: The meeting is postponed to Friday."
- **Rezumare:** "Rezumă textul următor în 3 propoziții: [text]"
- **Clasificare simplă:** "Această recenzie este pozitivă sau negativă? [text]"
- **Reformulare:** "Rescrie mai formal: [text informal]"
- **Email, scrisori, mesaje standard:** "Scrie un email de mulțumire pentru o întâlnire."

## Când Zero-Shot Nu Este Suficient?

Zero-shot are limitele lui. Când sarcina e ambiguă sau specifică domeniului tău, AI-ul "ghicește" ce
înseamnă "bun." Dacă nu știe standardele tale, va folosi standardele generale — care pot fi prea generice.

Exemple în care zero-shot produce rezultate mediocre:
- "Scrie o descriere de produs" — ce stil? ce lungime? ce ton? Pentru ce platformă?
- "Analizează contractul" — după ce criterii? Ce e important pentru tine?
- "Creează o postare pentru Instagram" — ce audiență? ce ton? ce obiectiv?

Pentru aceste cazuri, ai nevoie de few-shot (Lecția 7) sau un prompt mai detaliat.

## Îmbunătățind Zero-Shot: Adaugă Context

Chiar și fără exemple, poți îmbunătăți dramatic zero-shot adăugând context clar:

**Versiunea 1 (zero-shot simplu):**
> Scrie o descriere de produs.

**Versiunea 2 (zero-shot cu context):**
> Scrie o descriere de produs pentru o lumânare artizanală cu parfum de lavandă și lemn de cedru.
> Publicul: femei 30-50 ani care cumpără cadouri. Tonul: cald, poetic, nu comercial agresiv.
> Lungime: 80-100 cuvinte. Platforma: Etsy.

Versiunea 2 e tot zero-shot — nu dai niciun exemplu de cum arată o descriere bună. Dar contextul
adăugat ghidează modelul suficient de precis.

## Exercițiu Mental: Zero-Shot în Domeniul Tău

Gândește-te la 3 sarcini repetitive din activitatea ta zilnică:
- Un email pe care îl scrii des?
- Un document pe care îl pregătești regulat?
- O analiză sau rezumat pe care îl faci frecvent?

Fiecare dintre acestea este un candidat perfect pentru zero-shot prompting. Cu o instrucțiune bine
formulată, poți automatiza sau accelera dramatic aceste sarcini fără niciun exemplu.

## Concluzie: Zero-Shot e Punctul de Start

Zero-shot e cel mai simplu tip de prompting și, surprinzător, funcționează bine pentru o gamă largă
de sarcini comune. Înainte să complici un prompt cu exemple sau instrucțiuni elaborate, încearcă
zero-shot — s-ar putea să fie suficient.

Dacă rezultatul nu e la nivelul dorit, Lecția 7 îți arată cum să adaugi exemple (few-shot)
pentru a ghida și mai precis modelul.
```

**Technical Mode:** Adds classification examples with logprobs, direct prompting API patterns, comparison table zero-shot vs structured prompting quality, python-editor block.

---

#### Lesson 7 — Few-Shot Prompting cu Exemple

**Simple Mode key points:**
- Definiție: dai AI-ului 2-5 exemple de input → output înainte de sarcina reală
- Analogia profesorului: "Înainte să îți dau testul, uite 3 probleme rezolvate. Acum rezolvă a 4-a."
- Când few-shot bate zero-shot: ton specific, format neobișnuit, terminologie de domeniu
- Structura unui prompt few-shot: Exemplu 1 (input → output) / Exemplu 2 (input → output) / Acum: [sarcina reală]
- Câte exemple?: 2-3 e optim pentru sarcini simple. 5-10 pentru sarcini complexe sau cu format strict.
- Capcana: exemplele slabe = rezultate slabe. "Garbage in, garbage out."
- Cazuri de uz real: clasificare sentimente (3 exemple recenzii + clasificare), generare răspunsuri customer service (2 exemple ton firmei tele), reformulare în stilul tău (2 exemple din textele tale)
- ~800 cuvinte, fără cod

**Technical Mode:** Few-shot în OpenAI API ca mesaje `user`/`assistant` alternante, selection strategies pentru exemple relevante, impact pe tokens și costuri.

---

#### Lesson 8 — Chain-of-Thought: Gândire Pas cu Pas

**Simple Mode key points:**
- Definiție: ceri AI-ului să "gândească cu voce tare" înainte să dea răspunsul final
- Magia frazei "Gândește pas cu pas" — zero-shot CoT
- Analogia medicului: diagnosticul bun nu vine din prima impresie, ci din anamneza completă: simptome → istoricul pacientului → examinare → diferențiale → diagnostic. AI-ul face același lucru dacă îl ceri.
- Exemple: calcule logice, probleme de raționament, decizii cu mai mulți factori
- Comparație: răspuns direct vs CoT pentru o decizie de business (angajare candidat)
- Când NU e necesar CoT: traduceri, rezumări, sarcini creative simple — overhead inutil
- Formula: "Gândește pas cu pas înainte să răspunzi." sau "Explică raționamentul tău, apoi dă concluzia."
- ~850 cuvinte

**Technical Mode:** Formal CoT prompt structure, Tree of Thoughts briefly, Zero-shot vs Few-shot CoT, Python example.

---

#### Lesson 9 — Exercițiu: Construiește un Prompt CoT

**Type:** exercise.

**Simple Mode:** 5 scenarii date. Utilizatorul trebuie să reformuleze fiecare prompt simplu (zero-shot) adăugând o cerere de CoT. Comparație afișată după submit.

Scenariile: (1) analiza contractului de închiriere, (2) decizia de investiție mică, (3) diagnosticare problemă la mașină, (4) planificarea unui eveniment, (5) alegerea furnizorului.

**Technical Mode:** python-editor cu apeluri API side-by-side (cu și fără CoT), măsurare diferențe calitative.

---

#### Lesson 10 — Quiz Modulul 2

5 întrebări:
1. Ce este zero-shot prompting? → Cerere fără exemple, bazată doar pe instrucțiune
2. Când e recomandat few-shot? → Când vrei ton specific, format neobișnuit sau terminologie de domeniu
3. Ce face Chain-of-Thought? → Forțează modelul să explice pașii de raționament înainte de răspuns
4. Câte exemple sunt optime pentru few-shot simplu? → 2-3 exemple
5. "Gândește pas cu pas" e un exemplu de...? → Zero-shot Chain-of-Thought

---

#### Lesson 11 — Ce este un System Prompt?

**Files:** `lesson-11-ce-este-system-prompt-simple.mdx` + technical

**Simple Mode MDX (write full content):**

```mdx
---
title: "Ce este un System Prompt?"
description: "Cum să definești comportamentul de bază al unui asistent AI prin instrucțiuni permanente."
order: 11
type: theory
moduleId: modul-3
---

# Ce este un System Prompt?

Ai vorbit vreodată cu un angajat care, indiferent de situație, rămânea calm, profesionist și
consistent? Știa exact ce poate și ce nu poate face, cum să răspundă, ce ton să folosească.
Cineva l-a pregătit bine înainte să înceapă munca.

**System prompt-ul este această pregătire pentru un AI.**

## Instrucțiunea Invizibilă

Când vorbești cu ChatGPT pe chat.openai.com, există o instrucțiune pe care nu o vezi tu, dar pe care
modelul o primește înaintea oricărui mesaj al tău. Aceasta îi spune cine este, ce poate face, cum să
se comporte, ce limbă să folosească, ce să evite.

Acesta este system prompt-ul — o instrucțiune "de fundal" care setează regulile de comportament
pentru întreaga conversație.

Când construiești propriul asistent AI (pentru firma ta, pentru un site, pentru uz personal),
system prompt-ul e ceea ce definește identitatea și comportamentul acelui asistent.

## Analogia Fișei Postului

Gândește-te la un angajat nou. Înainte de prima zi, îi dai o fișă a postului:
- Cine ești tu și ce face firma
- Cui se adresează el (clientul tipic)
- Ce poate și ce nu poate promite
- Ce ton folosește (formal? prietenos?)
- Ce face dacă nu știe ceva

System prompt-ul e exact asta — fișa postului pentru asistentul tău AI.

**Fără fișa postului:** angajatul improvizează, uneori bine, uneori haotic.
**Cu o fișă clară:** comportament consistent, predictibil, profesional.

## Ce Poți Defini într-un System Prompt?

**Rolul și expertiza:**
> "Ești un consultant de nutriție cu 10 ani de experiență, specializat în diete pentru persoane cu
> diabet de tip 2."

**Publicul țintă:**
> "Răspunzi unor pacienți adulți, non-tehnici, fără background medical."

**Tonul:**
> "Folosești un ton cald, empatic, niciodată clinic sau intimidant."

**Limitele:**
> "Nu recomanzi medicamente specifice. Dacă întrebarea depășește nutriția, trimite la medic."

**Formatul:**
> "Răspunsurile tale sunt scurte — maxim 3 paragrafe. Dacă e necesar mai mult, propui o conversație."

**Limba:**
> "Răspunzi mereu în română, indiferent de limba în care ești întrebat."

## Efectul asupra Conversației

System prompt-ul persistă pe toată durata conversației. Fiecare mesaj al utilizatorului e procesat
în contextul acestor instrucțiuni. E ca și cum angajatul tău recitește fișa postului înainte de
fiecare răspuns.

Aceasta înseamnă că nu trebuie să repeți regulile la fiecare mesaj. Dai instrucțiunile o dată —
în system prompt — și ele se aplică consistent.

## Exemplu Complet: Asistent pentru o Clinică

Imaginează-ți că ești manager al unei clinici private și vrei un chatbot pe site care ajută pacienții:

```
Ești asistentul virtual al Clinicii MedCentru din Cluj-Napoca.
Ajuți pacienții cu: programări, informații despre servicii, întrebări generale despre proceduri.
Tonul tău: profesional, cald, empatic. Nu te grăbești niciodată.
Nu diagnostichezi și nu recomanzi tratamente — acestea sunt responsabilitatea medicilor.
Dacă pacientul descrie simptome urgente (durere în piept, dificultăți de respirație, pierdere
de conștiință), îi recomandă imediat să sune la 112.
Limba: română. Răspunsuri scurte și clare.
Programările se fac la telefon 0264-XXX-XXX sau pe site la sectiunea "Programări online".
```

Cu acest system prompt, asistentul AI al clinicii va fi consistent, util și sigur — indiferent
ce întreabă pacientul.

## De Ce Contează System Prompt-ul?

Fără un system prompt bine definit, AI-ul face presupuneri. Presupune ce ton e potrivit, ce e
relevant, ce limite are. Uneori ghicește bine — adesea nu.

Cu un system prompt clar:
- Comportament predictibil și consistent
- Identitate clară pentru asistentul tău
- Control asupra limitelor (ce poate și ce nu poate face)
- Personalizare completă pentru audiența ta

În lecția următoare, explorăm cum să construiești un persona AI complet — nu doar regulile,
ci și personalitatea.
```

**Technical Mode:** System message în OpenAI API, diferența system/user/assistant, constitutional AI basics, prompt injection risks și mitigare, python-editor cu ChatCompletion calls.

---

#### Lesson 12 — Crearea unui Persona AI

**Simple Mode key points:**
- Diferența rol vs persona: rolul = expertiza (consultant, medic, profesor). Persona = personalitatea completă (cum vorbește, cum reacționează la greșeli, ce expresii folosește)
- De ce funcționează persona: modelul recunoaște pattern-uri de comportament din antrenare. "Profesor răbdător pentru copii" activează un spațiu complet de comportamente.
- Anatomia unui persona: Nume + Profesie + Personalitate + Mod de comunicare + Expresii caracteristice + Limitele
- Exemplu complet: "Andrei, consultant startup" vs "Elena, doctoriță pediatru" — 2 persoane complete
- Când e util: chatboturi, asistenți specializați, generare conținut consistent în stilul unui brand
- Capcana: persona prea complex = instrucțiuni contradictorii. Keep it focused.
- ~800 cuvinte

---

#### Lesson 13 — Injecția de Context și Instrucțiuni Persistente

**Simple Mode key points:**
- Definiție: injectezi informații specifice în prompt ca "memorie temporară" pe care AI-ul le folosește
- Analogia briefing-ului: înainte de un pitch important, asistentul tău citește 2 pagini despre client. Aceea e injecția de context.
- Tipuri de context injectat: informații despre companie, documente, date, istoricul conversației
- Cum se face: bloc "Context:" urmat de informații, apoi instrucțiunea propriu-zisă
- Limitele: context window. Dacă documentul e prea lung, AI-ul "uită" primele informații (sliding window).
- Soluție simplă: rezumă documentul lung înainte să îl injectezi. Sau injectează doar secțiunile relevante.
- Instrucțiuni persistente vs mesaje normale: ce pui în system prompt durează tot. Ce pui în user message durează un schimb.
- ~850 cuvinte

---

#### Lesson 14 — Exercițiu: Construiește un Asistent Personalizat

**Type:** exercise.

**Simple Mode:** 3 scenarii de ales (clinică medicală, magazin online, firmă de consultanță). Utilizatorul completează un template de system prompt cu 5 câmpuri: Rol, Audiență, Ton, Limite, Format. Afișează preview-ul system prompt-ului construit.

**Technical Mode:** python-editor cu full API call folosind system prompt-ul construit, testare cu 5 întrebări de test.

---

#### Lesson 15 — Quiz Modulul 3

5 întrebări:
1. Ce este un system prompt? → Instrucțiune de fundal care definește comportamentul AI-ului pe toată conversația
2. Ce face injecția de context? → Adaugă informații specifice pe care AI-ul le folosește în răspunsuri
3. Care e diferența dintre rol și persona? → Rolul = expertiza. Persona = personalitatea și modul de comunicare complet.
4. Ce se întâmplă dacă nu definești un system prompt? → AI-ul face presupuneri despre ton, limite și audiență
5. Ce limitează injecția de context? → Dimensiunea context window (AI-ul nu poate procesa documente infinite)

---

#### Lesson 16 — Meta-Prompting

**Simple Mode key points:**
- Definiție: ceri AI-ului să genereze un prompt mai bun decât cel pe care îl ai tu
- Analogie: ceri unui expert să îți rescrie CV-ul. Tu știi ce vrei să comunici, el știe cum să îl formuleze optim.
- Cazuri de uz: "Am un prompt care produce rezultate mediocre. Îmbunătățește-l." sau "Generează cel mai bun prompt pentru [sarcina X]."
- Exemplu complet: prompt slab → cerere meta-prompting → prompt îmbunătățit → rezultate
- "Prompturi pentru a genera prompturi" — recursivitate utilă
- Limitele: meta-prompting nu compensează lipsa de claritate despre ce vrei. Dacă nu știi ce vrei, nici AI-ul nu poate optimiza.
- Varianta iterativă: generezi prompt → testezi → dai feedback → AI refinează → testezi din nou
- ~800 cuvinte

---

#### Lesson 17 — Prompturi Structurate: JSON, Liste, Tabele

**Simple Mode key points:**
- De ce să ceri format specific: AI-ul în mod implicit generează text liber. Dacă ai nevoie de date structurate (pentru un tabel, pentru o aplicație, pentru o listă), specifică formatul explicit.
- "Răspunde în format JSON cu câmpurile: nume, email, motiv" — produce date utilizabile direct
- Analogia formularului: un formular blank e mai util decât o pagină text cu aceleași informații — ușor de procesat, ușor de copiat, ușor de completat în altă aplicație
- Tipuri de formate: JSON, Markdown table, numbered list, bullet points, CSV
- Exemple pentru fiecare format cu cazuri de uz real (fără cod)
- Capcana: AI-ul poate "aluneca" din format dacă instrucțiunea e prea complexă. Reamintește formatul la finalul promptului.
- ~800 cuvinte

**Technical Mode:** JSON mode în OpenAI API (response_format), structured outputs, parsing cu Python.

---

#### Lesson 18 — Prompt Chaining: Lanțuri de Instrucțiuni

**Simple Mode key points:**
- Definiție: sarcina complexă = mai multe prompturi mici în secvență, unde outputul unuia devine inputul următorului
- Analogie: linie de asamblare. Fiecare stație face un singur lucru bine. Produsul trece prin toate stațiile.
- Exemplu complet (4 pași): (1) Generează date brute → (2) Clasifică datele → (3) Extrage insights → (4) Formatează raportul
- De ce funcționează: sarcini complexe într-un singur prompt = confuzie și calitate slabă. Sarcini simple succesive = calitate înaltă pe fiecare pas.
- Limitele unui singur prompt: context window, capacitate de raționament, calitate scăzută pentru multi-tasking
- Când e necesar: proiecte de cercetare, generare conținut lung, analize complexe cu mai mulți pași
- ~850 cuvinte

---

#### Lesson 19 — Exercițiu: Automatizare cu Prompt Chaining

**Type:** exercise.

**Simple Mode:** Un scenariu de business complet: analiza recenziilor unui produs (20 recenzii date). Utilizatorul urmărește un chain de 4 pași: (1) Extrage temele principale din recenzii → (2) Clasifică fiecare temă ca pozitivă/negativă → (3) Prioritizează problemele → (4) Generează un raport executiv de 1 pagină. Fiecare pas e un prompt dat, utilizatorul vede outputul și îl copiază în pasul următor.

**Technical Mode:** python-editor cu chain complet programatic, automatizare cu loop.

---

#### Lesson 20 — Quiz Modulul 4

5 întrebări:
1. Ce este meta-prompting? → Ceri AI-ului să genereze sau îmbunătățească un prompt
2. Când e util să ceri format JSON? → Când ai nevoie de date structurate utilizabile în alte aplicații
3. Ce este prompt chaining? → Secvență de prompturi în care outputul unuia devine inputul următorului
4. De ce funcționează mai bine chaining decât un singur prompt complex? → Sarcini simple succesive = calitate înaltă. Prompt complex multi-task = calitate slabă.
5. Ce face "alunecarea din format" mai puțin probabilă? → Repetarea instrucțiunii de format la finalul promptului

---

#### Lesson 21 — Prompt Engineering pentru Redactare

**Simple Mode key points:**
- AI-ul ca "co-autor ultra-rapid": nu înlocuiește vocea ta, accelerează procesul
- 4 tipuri de task-uri de redactare: generare din scratch, editare text existent, schimbare ton/stil, traducere + localizare
- Template-uri de prompturi pentru: email-uri business, postări social media, articole, documente oficiale, discursuri
- Exemplu detaliat: brief-ul complet pentru un articol de blog vs ce produce fără brief
- Cum să păstrezi vocea ta: "Iată 3 texte scrise de mine: [exemple]. Scrie în același stil."
- Redactare în mai mulți pași: outline → draft → edit → polish
- Cele mai frecvente use-case-uri pentru non-tehnici (cu prompturi gata de folosit)
- ~850 cuvinte

---

#### Lesson 22 — Prompt Engineering pentru Analiză

**Simple Mode key points:**
- AI-ul ca "analist instant": poate procesa date, documente, și produce insights rapid
- 4 tipuri de analiză: date tabulare (CSV), text (contracte, recenzii, articole), comparații, cercetare de piață
- Template: "Analizează [documentul] și identifică [ce anume], prezintă în [format]"
- Exemplu: analiza unui contract de furnizor — ce pericole, ce negociabil, ce lipsit
- Exemplu: analiza recenziilor concurenților — teme comune, puncte slabe exploatabile
- Limitele: AI-ul poate "halucina" date numerice. Verifică întotdeauna calculele cu sursa originală.
- Prompturi pentru analiză SWOT, comparații competitive, rezumate executive
- ~800 cuvinte

---

#### Lesson 23 — Prompt Engineering pentru Antreprenori

**Simple Mode key points:**
- Cel mai valoros use-case pentru antreprenori: viteza de execuție pe sarcini administrative și de comunicare
- Top 10 sarcini business rezolvate cu AI + prompt-uri gata de folosit:
  1. Propunere comercială
  2. Email de follow-up
  3. Descriere post LinkedIn
  4. Fișă de post
  5. Politică internă (RGPD, HR)
  6. Brief pentru furnizor/colaborator
  7. Script apel de vânzări
  8. Analiza unui contract (fără a înlocui avocatul)
  9. Plan de onboarding angajat nou
  10. Răspuns la recenzie negativă
- Formule de economie de timp: câte ore/săptămână economisești cu fiecare sarcină
- Concluzie: AI nu e un angajat — e un multiplicator al productivității tale
- ~900 cuvinte

---

#### Lesson 24 — Exercițiu: Prompt Kit pentru Domeniul Tău

**Type:** exercise.

**Simple Mode:** Utilizatorul completează un template pentru a construi un "prompt kit personal" — 5 prompturi de uz frecvent pentru domeniul/rolul propriu. Template-ul ghidează structurarea fiecărui prompt cu: context, sarcina, format, constrângeri. La final, utilizatorul are 5 prompturi salvabile gata de folosit.

**Technical Mode:** Aceleași 5 prompturi testate via python-editor cu OpenAI API, comparare rezultate.

---

#### Lesson 25 — Quiz Modulul 5

5 întrebări:
1. Cum păstrezi "vocea ta" când folosești AI pentru redactare? → Dai exemple din texte scrise de tine, ceri AI-ului să imite stilul
2. Ce limitare importantă are AI-ul pentru analize numerice? → Poate produce cifre incorecte ("halucinate") — verifică întotdeauna cu sursa originală
3. Care e cel mai valoros use-case al AI pentru un antreprenor? → Accelerarea sarcinilor administrative și de comunicare repetitive
4. Ce este un "prompt kit"? → O colecție de prompturi optimizate, gata de folosit, pentru sarcinile frecvente ale unui rol
5. Ce ai primit din exercițiul din Lecția 24? → 5 prompturi personalizate pentru domeniul propriu

---

#### Lesson 26 — Greșeli Comune și Anti-Pattern-uri

**Simple Mode key points:**
- Top 8 greșeli în prompt engineering (cu exemple și fix-uri):
  1. **Prea vag**: "Ajută-mă cu asta" → Specifică sarcina concret
  2. **Context lipsă**: "Rescrie mai bine" → Spune pentru ce audiență, ce ton vrei
  3. **Instrucțiuni contradictorii**: "Scurt dar complet" → Decide și specifică prioritatea
  4. **Așteptări nerealiste**: "Analizează toată piața românească de IT" → Restrânge la aspecte specifice
  5. **Prompts prea lungi**: 1500 cuvinte de instrucțiuni → AI-ul urmărește ultimele instrucțiuni mai atent
  6. **Acceptarea primului draft**: Nu revizuiești → Întotdeauna iterează
  7. **Fără format specificat**: Text liber când aveai nevoie de structură → Spune ce format vrei
  8. **Copierea fără verificare**: Date, statistici, referințe inventate de AI → Verifică sursele
- Analogie: greșelile de prompting sunt ca greșelile de briefing cu un freelancer. Ambele duc la iterații costisitoare.
- ~850 cuvinte

---

#### Lesson 27 — Evaluarea Calității unui Prompt

**Simple Mode key points:**
- Cum știi că un prompt e bun: 3 criterii — precizie (răspunde exact la ce ai cerut?), consistență (produce rezultate similare dacă îl repeți?), eficiență (obții rezultatul în max 2 iterații?)
- Framework simplu de evaluare: CARE (Clarity, Actionability, Relevance, Efficiency)
- Procesul de îmbunătățire: testezi → identifici ce lipsește → adaugi → retestezi
- Documentarea prompturilor bune: creează un "prompt library" personal în Notion, Google Docs sau text simplu
- Semnele că un prompt trebuie revizuit: răspunsuri prea generale, răspunsuri care includ întrebări înapoi, răspunsuri inconsistente la rulări multiple
- Prompturi "evergreen" vs situaționale: care merită să le salvezi, care nu
- ~800 cuvinte

---

#### Lesson 28 — Etica Prompt Engineering

**Simple Mode key points:**
- 4 riscuri etice principale: dezinformare, bias amplificat, confidențialitate, manipulare
- **Dezinformare**: AI-ul produce conținut convingător dar fals. Responsabilitatea verificării e a ta.
- **Bias**: dacă datele sau exemplele din prompt conțin prejudecăți, răspunsul le amplifică
- **Confidențialitate**: nu pui în prompt date personale ale clienților/pacienților/angajaților — datele intră în serverele OpenAI/Anthropic
- **Manipulare**: prompturi care generează conținut pentru a înșela oameni (fake reviews, phishing, dezinformare politică) — ilegal și imoral
- EU AI Act: responsabilitate la utilizator, nu doar la furnizor
- Regula simplă: dacă nu ai voie să faci ceva manual, nu ai voie să-l faci nici prin AI
- ~800 cuvinte

---

#### Lesson 29 — Viitorul: De la Prompturi la Agenți

**Simple Mode key points:**
- Evoluția: prompt simplu → prompt cu context → chain → agent care execută acțiuni autonome
- Ce e un agent AI: primește un obiectiv, planifică pașii, execută unele (caută pe web, citește fișiere, scrie email), raportează rezultatul
- Diferența față de prompt: un prompt cere un răspuns. Un agent rezolvă o sarcină multi-pas fără intervenție manuală.
- Exemple practice disponibile azi: ChatGPT cu "browsing + code interpreter + files", Perplexity AI, Zapier AI
- Ce se schimbă pentru tine: de la "eu scriu prompturi și citesc răspunsuri" la "eu dau obiective și verific rezultate"
- Abilitățile care rămân valoroase: gândire critică, evaluarea outputului, definirea corectă a obiectivelor
- Concluzie motivațională: prompt engineering e fundația. Cine stăpânește prompturile va stăpâni și agenții.
- ~850 cuvinte

---

#### Lesson 30 — Proiect Final: Asistentul Tău AI

**Type:** project. Single version (same for both modes, technical track has API calls).

```mdx
---
title: "Proiect Final: Asistentul Tău AI"
description: "Construiește un asistent AI complet personalizat pentru domeniul tău profesional."
order: 30
type: project
moduleId: modul-6
---

# Proiect Final: Asistentul Tău AI

Ai parcurs 29 de lecții. Acum construiești ceva real.

## Obiectivul Proiectului

Creează un asistent AI complet personalizat pentru domeniul tău profesional sau activitatea ta
de zi cu zi. Proiectul cuprinde 3 componente livrate.

---

## Componenta 1 — System Prompt-ul Asistentului (obligatorie)

Scrie un system prompt complet pentru asistentul tău. Trebuie să includă:

- **Identitate**: cine este asistentul, ce expertiză are
- **Audiența**: cui se adresează (descriere detaliată)
- **Tonul**: cum comunică (3-5 caracteristici specifice)
- **Limite**: ce NU poate/trebuie să facă
- **Format implicit**: cum arată un răspuns standard

**Criteriu de succes:** System prompt-ul tău produce comportament consistent și util în 5 conversații de test diferite.

---

## Componenta 2 — Prompt Kit Personal (obligatorie)

5 prompturi optimizate pentru sarcinile tale cele mai frecvente. Pentru fiecare prompt:
- Titlul sarcinii
- Promptul complet (copiat din lecția 24 sau nou creat)
- 1 exemplu de output bun produs de prompt

**Criteriu de succes:** Fiecare prompt produce un rezultat utilizabil cu maxim o iterație.

---

## Componenta 3 — Reflecție (obligatorie, min. 150 cuvinte)

Răspunde la:
1. Ce sarcini din activitatea ta economisesc cel mai mult timp cu AI-ul?
2. Ce greșeală de prompting ai corectat pe parcursul cursului?
3. Ce ai implementa în luna următoare din ce ai învățat?

---

## Cum Trimiți Proiectul

Completează toate cele 3 componente în câmpurile de mai jos.
Proiectul este salvat în portofoliu și vizibil pe profilul tău public după finalizare.

Succes — și felicitări pentru că ai ajuns până aici!
```

---

### 9.4 — Gate Questions SQL INSERT Statements

Run after sync-action populates lesson IDs. Fetch course ID first:
```sql
-- Get lesson IDs
SELECT id, order_index, title
FROM public.lessons
WHERE course_id = (SELECT id FROM courses WHERE slug = 'prompt-engineering-practic')
ORDER BY order_index;
-- Then replace $L01_ID, $L02_ID etc. with actual UUIDs
```

```sql
-- LESSON 1 — Ce este un Prompt?
INSERT INTO public.lesson_gate_questions
  (lesson_id, question, options, correct_answer, explanation, mode, display_order)
VALUES
(
  '$L01_ID',
  'Ce este un prompt?',
  '["Un program de calculator", "Instrucțiunea sau mesajul pe care îl trimiți unui model AI", "Un tip de model AI", "O bază de date cu răspunsuri"]',
  1,
  'Promptul e mesajul tău — instrucțiunea sau întrebarea pe care i-o dai AI-ului. Calitatea promptului determină calitatea răspunsului.',
  'both', 0
),
(
  '$L01_ID',
  'De ce un prompt vag produce un răspuns vag?',
  '["Modelul AI nu e suficient de inteligent", "AI-ul răspunde exact la ce ai cerut — ambiguitatea din întrebare apare în răspuns", "Modelul nu are suficiente date", "Prompt-ul a fost prea scurt"]',
  1,
  'AI-ul nu ghicește ce vrei. Dacă instrucțiunea nu e clară, nici răspunsul nu va fi. Promptul precis = răspunsul precis.',
  'both', 1
);

-- LESSON 2 — Cum Gândește un Model AI
INSERT INTO public.lesson_gate_questions
  (lesson_id, question, options, correct_answer, explanation, mode, display_order)
VALUES
(
  '$L02_ID',
  'Cum produce un model AI un răspuns?',
  '["Caută răspunsul în internet", "Prezice token cu token ce urmează, bazat pe tipare din antrenare", "Accesează o bază de date de răspunsuri corecte", "Calculează matematic soluția optimă"]',
  1,
  'Modelul completează text token cu token, bazat pe probabilitățile învățate din miliarde de texte. Nu "știe" răspunsul — îl construiește statistic.',
  'both', 0
),
(
  '$L02_ID',
  'Ce controlează parametrul "temperatură" al unui model AI?',
  '["Viteza de procesare", "Cât de variabile/creative sunt răspunsurile", "Lungimea răspunsului", "Limba de răspuns"]',
  1,
  'Temperatura 0 = răspunsuri predictibile, mereu similare. Temperatura 1 = răspunsuri mai variate și creative. Ajustezi în funcție de sarcină.',
  'both', 1
);

-- LESSON 3 — Anatomia unui Prompt Eficient
INSERT INTO public.lesson_gate_questions
  (lesson_id, question, options, correct_answer, explanation, mode, display_order)
VALUES
(
  '$L03_ID',
  'Care dintre acestea este o componentă a unui prompt bun?',
  '["Lungimea maximă posibilă", "Constrângeri clare (ce să nu facă)", "Cât mai multe întrebări simultan", "Răspunsul așteptat inclus din start"]',
  1,
  'Constrângerile definesc limitele: ce ton să evite, ce lungime să respecte, ce informații să omită. Fac promptul mai precis fără să îl complice inutil.',
  'both', 0
),
(
  '$L03_ID',
  'Câte componente trebuie să includă orice prompt?',
  '["Toate 5 mereu (rol, context, sarcina, format, constrângeri)", "Doar sarcina — restul sunt opționale", "Cel puțin 3 întotdeauna", "Depinde de complexitatea sarcinii"]',
  3,
  'Nu există un număr fix. O sarcină simplă se rezolvă cu o propoziție clară. Sarcinile complexe beneficiază de toate 5 componentele. Ajustezi în funcție de nevoie.',
  'both', 1
);

-- LESSON 6 — Zero-Shot Prompting
INSERT INTO public.lesson_gate_questions
  (lesson_id, question, options, correct_answer, explanation, mode, display_order)
VALUES
(
  '$L06_ID',
  'Ce înseamnă "zero-shot" prompting?',
  '["Prompt fără rezultate bune", "Cerere fără exemple, bazată doar pe instrucțiune și contextul general al modelului", "Prompt cu zero cuvinte", "Prompting fără context"]',
  1,
  'Zero-shot = dai sarcina direct, fără să arăți exemple de cum ar trebui să arate rezultatul. Modelul se bazează pe experiența din antrenare.',
  'both', 0
),
(
  '$L06_ID',
  'Când funcționează cel mai bine zero-shot prompting?',
  '["Când sarcina e specifică domeniului tău și ai ton strict", "Pentru sarcini comune și bine definite: traducere, rezumare, reformulare", "Întotdeauna e suficient", "Niciodată — few-shot e mereu mai bun"]',
  1,
  'Zero-shot funcționează excelent pentru sarcini pe care modelul le-a "văzut" des în antrenare. Pentru sarcini specifice sau cu ton strict, few-shot e mai potrivit.',
  'both', 1
);

-- LESSON 7 — Few-Shot Prompting
INSERT INTO public.lesson_gate_questions
  (lesson_id, question, options, correct_answer, explanation, mode, display_order)
VALUES
(
  '$L07_ID',
  'Ce adaugi în plus față de zero-shot când faci few-shot prompting?',
  '["Mai mult context despre tine", "Exemple de input → output înainte de sarcina reală", "O instrucțiune mai lungă", "Formatul dorit al răspunsului"]',
  1,
  'Few-shot înseamnă să dai 2-5 exemple de "input → output dorit" înainte de sarcina ta. Modelul înțelege ce aștepți și produce rezultate în același stil.',
  'both', 0
),
(
  '$L07_ID',
  'Câte exemple sunt optime pentru few-shot pe o sarcină simplă?',
  '["1 exemplu e suficient", "2-3 exemple", "10-15 exemple pentru siguranță", "Nu contează numărul"]',
  1,
  '2-3 exemple sunt suficiente pentru a ghida modelul fără să consume prea mulți tokeni. Mai mult de 5-10 e util doar pentru sarcini complexe cu format strict.',
  'both', 1
);

-- LESSON 8 — Chain-of-Thought
INSERT INTO public.lesson_gate_questions
  (lesson_id, question, options, correct_answer, explanation, mode, display_order)
VALUES
(
  '$L08_ID',
  'Ce efect are "Gândește pas cu pas" adăugat într-un prompt?',
  '["Face răspunsul mai scurt", "Forțează modelul să explice raționamentul înainte de concluzie, îmbunătățind calitatea", "Activează un mod special al modelului", "Nu are niciun efect semnificativ"]',
  1,
  'Chain-of-thought face modelul să "proceseze cu voce tare". Explicând pașii, face mai puțin probabil să sară la concluzii greșite.',
  'both', 0
),
(
  '$L08_ID',
  'Când NU e recomandat Chain-of-Thought?',
  '["Decizii complexe cu mai mulți factori", "Traduceri simple, rezumări, sarcini creative de bază", "Raționament logic și matematic", "Diagnosticarea unor probleme"]',
  1,
  'CoT adaugă overhead (tokeni, timp, cost). Pentru sarcini simple unde calitatea e deja bună fără explicații, e inutil. Folosești CoT când complexitatea o justifică.',
  'both', 1
);

-- LESSON 11 — Ce este un System Prompt?
INSERT INTO public.lesson_gate_questions
  (lesson_id, question, options, correct_answer, explanation, mode, display_order)
VALUES
(
  '$L11_ID',
  'Ce definește un system prompt?',
  '["Răspunsul la primul mesaj al utilizatorului", "Comportamentul, rolul și limitele AI-ului pe întreaga conversație", "Stilul vizual al interfeței", "Numărul maxim de mesaje permise"]',
  1,
  'System prompt-ul e "fișa postului" AI-ului — persistă pe toată conversația și definește cine e, cum răspunde și ce nu face.',
  'both', 0
),
(
  '$L11_ID',
  'De ce e util un system prompt clar pentru un chatbot de business?',
  '["Reduce costurile API", "Asigură comportament consistent, predictibil, adaptat audienței și brandului", "Face răspunsurile mai rapide", "Elimină nevoia de a testa chatbot-ul"]',
  1,
  'Fără system prompt, AI-ul improvizează tonul, limitele și stilul. Un system prompt clar produce un asistent consistent, sigur și aliniat cu valorile brandului.',
  'both', 1
);

-- LESSON 12 — Crearea unui Persona AI
INSERT INTO public.lesson_gate_questions
  (lesson_id, question, options, correct_answer, explanation, mode, display_order)
VALUES
(
  '$L12_ID',
  'Ce adaugă un persona față de simpla definire a rolului?',
  '["Cunoștințe tehnice suplimentare", "Personalitate, mod de comunicare și expresii caracteristice — nu doar expertiza", "Acces la date externe", "Memorie permanentă"]',
  1,
  'Rolul = ce știe. Persona = cum se comportă, cum vorbește, cum reacționează. Un persona complet produce răspunsuri cu identitate distinctă și consistentă.',
  'both', 0
),
(
  '$L12_ID',
  'Care e riscul unui persona prea complex?',
  '["Face modelul mai lent", "Instrucțiuni contradictorii care produc comportament inconsistent", "Costă mai mulți tokeni", "Nu există riscuri — mai mult e mai bun"]',
  1,
  'Un persona cu prea multe trăsături sau instrucțiuni contradictorii ("cald dar strict, informal dar profesional") produce confuzie. Keep it focused.',
  'both', 1
);

-- LESSON 13 — Injecția de Context
INSERT INTO public.lesson_gate_questions
  (lesson_id, question, options, correct_answer, explanation, mode, display_order)
VALUES
(
  '$L13_ID',
  'Ce este injecția de context?',
  '["Un atac de securitate asupra AI-ului", "Adăugarea de informații specifice în prompt pe care AI-ul le folosește ca "memorie temporară"", "Un tip de few-shot prompting", "Conectarea AI-ului la o bază de date externă"]',
  1,
  'Injecția de context = dai AI-ului informații (document, date, context situațional) direct în prompt, ca el să le folosească la răspuns fără să le fi "cunoscut" din antrenare.',
  'both', 0
),
(
  '$L13_ID',
  'Care e principala limitare a injecției de context?',
  '["Nu funcționează cu GPT-4", "Context window limitat — documente prea lungi depășesc capacitatea de procesare a modelului", "AI-ul nu poate procesa documente", "Costă prea mult"]',
  1,
  'Fiecare model are un context window (limita de text ce poate procesa simultan). Documente mari trebuie rezumate sau împărțite înainte de injectat.',
  'both', 1
);

-- LESSON 16 — Meta-Prompting
INSERT INTO public.lesson_gate_questions
  (lesson_id, question, options, correct_answer, explanation, mode, display_order)
VALUES
(
  '$L16_ID',
  'Ce este meta-prompting?',
  '["Un prompt despre filozofia AI", "Ceri AI-ului să genereze sau îmbunătățească un prompt", "Prompting la viteza maximă", "Folosirea a două modele simultan"]',
  1,
  'Meta-prompting = folosești AI-ul pentru a-ți îmbunătăți propriile prompturi. "Am un prompt care produce rezultate mediocre. Îmbunătățește-l și explică ce ai schimbat."',
  'both', 0
),
(
  '$L16_ID',
  'Ce limitare are meta-prompting?',
  '["Nu funcționează în practică", "Nu compensează lipsa de claritate despre ce vrei — dacă nu știi obiectivul, nici AI-ul nu poate optimiza", "E disponibil doar pentru programatori", "Produce prompturi prea lungi"]',
  1,
  'AI-ul optimizează spre un obiectiv. Dacă nu știi ce vrei (ton? format? audiență?), meta-prompting produce îmbunătățiri tehnice dar nu neapărat în direcția dorită.',
  'both', 1
);

-- LESSON 17 — Prompturi Structurate
INSERT INTO public.lesson_gate_questions
  (lesson_id, question, options, correct_answer, explanation, mode, display_order)
VALUES
(
  '$L17_ID',
  'Când e recomandat să ceri format JSON?',
  '["Întotdeauna — JSON e cel mai bun format", "Când ai nevoie de date structurate utilizabile în aplicații sau tabele", "Niciodată — AI-ul nu produce JSON corect", "Doar pentru programatori"]',
  1,
  'JSON e ideal când ai nevoie să procesezi datele în continuare (colezi în tabel, importezi în aplicație, compari structurat). Pentru text simplu, JSON e overhead inutil.',
  'both', 0
),
(
  '$L17_ID',
  'Cum previi "alunecarea din format" într-un prompt structurat?',
  '["Scrii promptul mai scurt", "Repeți instrucțiunea de format la finalul promptului", "Folosești majuscule", "Nu poți preveni — e inevitabil"]',
  1,
  'Modelele urmăresc mai atent instrucțiunile recente (de la finalul promptului). Repetarea formatului la final reduce riscul de a obține text liber în loc de structura cerută.',
  'both', 1
);

-- LESSON 18 — Prompt Chaining
INSERT INTO public.lesson_gate_questions
  (lesson_id, question, options, correct_answer, explanation, mode, display_order)
VALUES
(
  '$L18_ID',
  'Ce este prompt chaining?',
  '["Mai multe modele AI care lucrează simultan", "Secvență de prompturi în care outputul unuia devine inputul următorului", "Un prompt foarte lung împărțit în paragrafe", "Repetiția aceluiași prompt de mai multe ori"]',
  1,
  'Prompt chaining împarte o sarcină complexă în pași simpli, fiecare cu un prompt dedicat. Calitatea crește pentru că fiecare pas e focalizat pe o singură sub-sarcină.',
  'both', 0
),
(
  '$L18_ID',
  'De ce produce chaining rezultate mai bune decât un singur prompt complex?',
  '["Folosește mai mulți tokeni, deci mai multă putere", "Sarcini simple succesive = calitate înaltă per pas. Prompt complex multi-task = calitate slabă și confuzie", "Chaining e mai rapid", "Modelul e mai "treaz" la al doilea prompt"]',
  1,
  'Modelele AI funcționează mai bine pe sarcini focalizate. Un prompt complex cu 5 sarcini simultane le face pe fiecare mai slab decât 5 prompturi dedicate.',
  'both', 1
);

-- LESSON 21 — Redactare
INSERT INTO public.lesson_gate_questions
  (lesson_id, question, options, correct_answer, explanation, mode, display_order)
VALUES
(
  '$L21_ID',
  'Cum păstrezi "vocea ta" când folosești AI pentru redactare?',
  '["Editezi manual tot textul după generare", "Incluzi 2-3 texte scrise de tine ca exemple, ceri AI-ului să imite stilul", "Nu se poate — AI-ul are mereu propriul stil", "Specifici doar tonul (formal/informal)"]',
  1,
  'Few-shot cu propriile texte e cel mai eficient mod. AI-ul recunoaște tiparele stilistice din exemplele tale și le reproduce în noul text.',
  'both', 0
),
(
  '$L21_ID',
  'Care e abordarea optimă pentru redactarea unui articol lung?',
  '["Un singur prompt complet cu toate instrucțiunile", "Outline → draft pe secțiuni → editare → polish (mai mulți pași)", "Ceri tot textul dintr-o dată și îl publici direct", "Repeți același prompt până obții varianta dorită"]',
  1,
  'Prompt chaining aplicat la redactare. Fiecare pas are calitate mai bună când e focalizat. Articolul final e coeziv și controlat.',
  'both', 1
);

-- LESSON 22 — Analiză
INSERT INTO public.lesson_gate_questions
  (lesson_id, question, options, correct_answer, explanation, mode, display_order)
VALUES
(
  '$L22_ID',
  'Ce risc important există când folosești AI pentru analize numerice?',
  '["AI-ul refuză să proceseze cifre", "Poate produce cifre incorecte (halucinate) — verifică întotdeauna cu sursa originală", "AI-ul nu poate face matematică", "Analizele numerice costă mai mult"]',
  1,
  'Modelele AI nu sunt calculatoare. Pot produce statistici plauzibile dar incorecte. Verificarea cu sursa originală e obligatorie pentru orice cifre critice.',
  'both', 0
),
(
  '$L22_ID',
  'Ce e util să specifici într-un prompt de analiză a unui document?',
  '["Lungimea documentului original", "Ce anume să identifice, ce e relevant, formatul outputului", "Că documentul e important", "Câți ani de experiență are AI-ul"]',
  1,
  'Un prompt de analiză bun spune: "Analizează [documentul] și identifică [aspecte specifice], prezentate în [format]." Fără specificarea aspectelor, AI-ul alege ce consideră important — poate nu ce contează pentru tine.',
  'both', 1
);

-- LESSON 26 — Greșeli Comune
INSERT INTO public.lesson_gate_questions
  (lesson_id, question, options, correct_answer, explanation, mode, display_order)
VALUES
(
  '$L26_ID',
  'Care e cea mai frecventă greșeală în prompt engineering?',
  '["Promptul e prea lung", "Promptul e prea vag — lipsește contextul și specificitatea", "Folosirea de caractere speciale", "Scrierea în română în loc de engleză"]',
  1,
  'Vagul e dușmanul calității. "Ajută-mă cu asta" produce orice. "Scrie un email de follow-up pentru propunerea comercială trimisă acum 3 zile, ton profesional, maxim 100 cuvinte" produce exact ce vrei.',
  'both', 0
),
(
  '$L26_ID',
  'De ce e periculos să copiezi direct statistici și date din răspunsuri AI?',
  '["AI-ul are drepturi de autor", "AI-ul poate produce date incorecte (halucinate) care par reale și convingătoare", "AI-ul exagerează datele", "Nu e periculos — AI-ul e mereu corect"]',
  1,
  'Modelele AI produc text plauzibil, nu neapărat adevărat. Statistici, studii, referințe pot fi inventate convingător. Verificarea surselor e obligatorie.',
  'both', 1
);

-- LESSON 27 — Evaluarea Calității
INSERT INTO public.lesson_gate_questions
  (lesson_id, question, options, correct_answer, explanation, mode, display_order)
VALUES
(
  '$L27_ID',
  'Care e primul semn că un prompt trebuie îmbunătățit?',
  '["Răspunsul e prea scurt", "Răspunsul e prea general sau include întrebări înapoi (AI-ul cere clarificări)", "Răspunsul nu e în română", "AI-ul refuză sarcina"]',
  1,
  'Când AI-ul răspunde generic sau cere clarificări, înseamnă că prompt-ul tău nu i-a dat suficient context. Soluție: adaugă rol, context sau format specific.',
  'both', 0
),
(
  '$L27_ID',
  'Ce este o "prompt library"?',
  '["O platformă de cumpărat prompturi", "O colecție personală de prompturi optimizate, salvate pentru reutilizare", "Un tip de model AI specializat", "O funcție avansată disponibilă doar cu abonament Pro"]',
  1,
  'Prompt library = colecția ta personală de prompturi care funcționează. Le salvezi în Notion, Google Docs sau orice text editor. Economisești timp și obții calitate consistentă.',
  'both', 1
);

-- LESSON 28 — Etica
INSERT INTO public.lesson_gate_questions
  (lesson_id, question, options, correct_answer, explanation, mode, display_order)
VALUES
(
  '$L28_ID',
  'De ce nu trebuie incluse date personale ale clienților în prompturi?',
  '["E ilegal prin EU AI Act", "Datele intră în serverele furnizorului AI și pot fi folosite pentru antrenare", "AI-ul nu procesează date personale", "Nu e o problemă reală"]',
  1,
  'Datele trimise în prompturi ajung pe serverele OpenAI/Anthropic/Google. Date medicale, financiare, sau personale ale clienților nu trebuie trimise în prompturi fără consimțământ explicit și politici clare de confidențialitate.',
  'both', 0
),
(
  '$L28_ID',
  'Care e regula simplă pentru utilizarea etică a AI?',
  '["Dacă produce profit, e etic", "Dacă nu ai voie să faci ceva manual, nu ai voie să îl faci nici prin AI", "Dacă AI-ul îl face, nu ești responsabil", "E OK câtă vreme nu te prinde nimeni"]',
  1,
  'Responsabilitatea revine utilizatorului, nu modelului. EU AI Act și normele etice generale se aplică indiferent dacă execuția e umană sau automatizată.',
  'both', 1
);

-- LESSON 29 — Viitorul
INSERT INTO public.lesson_gate_questions
  (lesson_id, question, options, correct_answer, explanation, mode, display_order)
VALUES
(
  '$L29_ID',
  'Ce diferențiază un agent AI de un chatbot obișnuit?',
  '["Agentul e mai inteligent", "Agentul poate executa acțiuni multi-pas (căutare, scriere fișiere, trimitere email) nu doar răspunde", "Agentul e mai ieftin", "Nu există diferență reală"]',
  1,
  'Un chatbot răspunde. Un agent rezolvă. Agenții AI pot accesa internet, rula cod, trimite emailuri, citi documente — executând un obiectiv complet fără intervenție la fiecare pas.',
  'both', 0
),
(
  '$L29_ID',
  'Ce abilitate umană rămâne esențială în era agenților AI?',
  '["Viteza de tastare", "Gândirea critică — definirea corectă a obiectivelor și evaluarea outputului agentului", "Cunoașterea limbajelor de programare", "Capacitatea de a scrie prompt-uri manuale"]',
  1,
  'Agenții primesc obiective și le execută. Cine definește obiective clare, bune și evaluează critic dacă agentul a livrat ce trebuia — aceea rămâne o abilitate umană de neînlocuit.',
  'both', 1
);
```

---

### 9.5 — Flashcard Terms

Embed in MDX files as ```` ```flashcards ```` blocks (same pattern as AI Fundamentals course).

**Module 1 flashcards** (add to `lesson-03-anatomia-unui-prompt-eficient-simple.mdx`):
```json
[
  {"front": "Prompt", "back": "Orice text trimis unui model AI pentru a obține un răspuns — întrebare, cerere sau instrucțiune."},
  {"front": "Zero-Shot", "back": "Tip de prompting în care dai sarcina fără exemple, bazat pe cunoștințele generale ale modelului."},
  {"front": "Temperatură (AI)", "back": "Parametru care controlează variabilitatea răspunsului. 0 = predictibil, 1 = creativ/variat."},
  {"front": "Componente prompt", "back": "Rol, Context, Sarcina, Format, Constrângeri — 5 componente opționale ale unui prompt complet."},
  {"front": "Prompt Engineering", "back": "Arta de a formula instrucțiuni clare și precise pentru a obține rezultatele dorite de la un model AI."}
]
```

**Module 2 flashcards** (add to `lesson-08-chain-of-thought-simple.mdx`):
```json
[
  {"front": "Few-Shot Prompting", "back": "Furnizarea de 2-5 exemple (input → output) înainte de sarcina reală pentru a ghida stilul și formatul."},
  {"front": "Chain-of-Thought", "back": "Tehnică prin care ceri AI-ului să explice pașii de raționament înainte de concluzie. Fraza cheie: «Gândește pas cu pas»."},
  {"front": "Zero-Shot CoT", "back": "Adăugarea frazei «Gândește pas cu pas» fără exemple — activează raționamentul detaliat fără a da demonstrații."},
  {"front": "Token", "back": "Unitate de text procesată de model — poate fi un cuvânt, o silabă sau câteva litere."},
  {"front": "Context Window", "back": "Cantitatea maximă de text pe care un model o poate procesa simultan într-o conversație."}
]
```

**Module 3 flashcards** (add to `lesson-13-injectia-de-context-simple.mdx`):
```json
[
  {"front": "System Prompt", "back": "Instrucțiune de fundal care definește rolul, tonul și limitele AI-ului pe întreaga conversație."},
  {"front": "Persona AI", "back": "Identitate completă dată unui asistent AI: expertiza + personalitate + mod de comunicare + expresii caracteristice."},
  {"front": "Injecție de Context", "back": "Adăugarea de informații specifice (documente, date, situație) în prompt ca «memorie temporară» a modelului."},
  {"front": "Instrucțiuni Persistente", "back": "Reguli din system prompt care se aplică pe toată conversația, fără a fi repetate la fiecare mesaj."},
  {"front": "Fișa Postului AI", "back": "Analogie pentru system prompt: definește ce poate și ce nu poate face asistentul, ca fișa postului unui angajat."}
]
```

**Module 4 flashcards** (add to `lesson-18-prompt-chaining-simple.mdx`):
```json
[
  {"front": "Meta-Prompting", "back": "Utilizarea AI-ului pentru a genera sau îmbunătăți un prompt — recursivitate utilă."},
  {"front": "Format JSON", "back": "Format structurat de date (chei: valori) util când outputul AI trebuie procesat în aplicații sau tabele."},
  {"front": "Prompt Chaining", "back": "Secvență de prompturi în care outputul unuia devine inputul următorului — pentru sarcini complexe multi-pas."},
  {"front": "Prompt Library", "back": "Colecție personală de prompturi optimizate salvate pentru reutilizare."},
  {"front": "Alunecare din Format", "back": "Când AI-ul produce text liber în loc de formatul structurat cerut. Prevenit prin repetarea instrucțiunii de format la final."}
]
```

**Module 5 flashcards** (add to `lesson-23-antreprenori-simple.mdx`):
```json
[
  {"front": "Vocea Autorului", "back": "Stilul personal de scriere. Păstrat în prompturi AI prin furnizarea de exemple proprii (few-shot)."},
  {"front": "Hlucinare AI", "back": "Producerea de informații false dar plauzibile (date, statistici, referințe). Necesită verificare obligatorie a surselor."},
  {"front": "Prompt Kit", "back": "Set de prompturi optimizate pentru sarcinile frecvente ale unui rol sau domeniu specific."},
  {"front": "Automatizare cu AI", "back": "Folosirea prompturilor și lanțurilor de instrucțiuni pentru a executa sarcini repetitive fără intervenție manuală."},
  {"front": "CARE (Evaluare Prompt)", "back": "Framework: Clarity (claritate), Actionability (executableness), Relevance (relevanță), Efficiency (eficiență în iterații)."}
]
```

**Module 6 flashcards** (add to `lesson-27-evaluarea-calitatii-simple.mdx`):
```json
[
  {"front": "Anti-Pattern Prompting", "back": "Greșeală repetitivă în prompt engineering: vag, instrucțiuni contradictorii, copiere fără verificare."},
  {"front": "Consistența Promptului", "back": "Capacitatea unui prompt de a produce rezultate similare la rulări multiple — semn al calității."},
  {"front": "Agent AI", "back": "Sistem AI care poate executa acțiuni multi-pas (căutare, scriere fișiere, apeluri API) nu doar să răspundă."},
  {"front": "EU AI Act", "back": "Primul cadru legal european pentru reglementarea AI. Responsabilitatea utilizatorului e inclusă explicit."},
  {"front": "Prompt Iterativ", "back": "Procesul de îmbunătățire progresivă a unui prompt: testezi → identifici ce lipsește → adaugi → retestezi."}
]
```

---

## COMPLETE CHECKLIST

### Phase 8 — Admin Dashboard

- [ ] **P8.0.1** Show DB migration SQL to user, wait for approval
- [ ] **P8.0.2** Verify users.role column exists (added in Phase 0) — update CHECK constraint if needed
- [ ] **P8.0.3** Run `ALTER TABLE lesson_comments ADD COLUMN is_deleted, deleted_by, deleted_at, report_count`
- [ ] **P8.0.4** Update lesson_comments RLS to hide deleted comments from non-admins
- [ ] **P8.0.5** Run `ALTER TABLE users ADD COLUMN is_banned, ban_reason, banned_at`
- [ ] **P8.0.6** Add non-banned check to lesson_comments INSERT policy
- [ ] **P8.0.7** Create RPC `get_admin_user_stats()`
- [ ] **P8.0.8** Create RPC `get_lesson_analytics()`
- [ ] **P8.0.9** Create RPC `get_minigame_stats()`
- [ ] **P8.0.10** Create RPC `get_badge_stats()`
- [ ] **P8.0.11** Create RPC `report_comment()`
- [ ] **P8.0.12** Update `schema.sql` with all migrations
- [ ] **P8.1.1** Create `src/app/(admin)/layout.tsx` with role check + top nav
- [ ] **P8.1.2** Create `src/app/(admin)/admin/page.tsx` (redirect to /admin/users)
- [ ] **P8.2.1** Create `src/components/admin/stat-card.tsx`
- [ ] **P8.2.2** Create `src/app/(admin)/admin/users/page.tsx`
- [ ] **P8.3.1** Create `src/components/admin/css-bar-chart.tsx`
- [ ] **P8.3.2** Create `src/app/(admin)/admin/lessons/page.tsx`
- [ ] **P8.4.1** Create `src/app/(admin)/admin/minigames/page.tsx`
- [ ] **P8.5.1** Create `src/app/(admin)/admin/actions.ts` (deleteComment, banUser, unbanUser)
- [ ] **P8.5.2** Create `src/components/admin/comment-moderation-client.tsx`
- [ ] **P8.5.3** Create `src/app/(admin)/admin/comments/page.tsx`
- [ ] **P8.6.1** Create `src/app/(admin)/admin/badges/page.tsx`

### Phase 9 — Second Course

- [ ] **P9.0.1** Create `content/prompt-engineering-practic/` directory
- [ ] **P9.2.1** Show course INSERT SQL to user, wait for approval
- [ ] **P9.2.2** Run INSERT for `prompt-engineering-practic` course row
- [ ] **P9.3.1** Write `lesson-01-ce-este-un-prompt-simple.mdx` (full content above)
- [ ] **P9.3.2** Write `lesson-01-ce-este-un-prompt.mdx` (technical mode)
- [ ] **P9.3.3** Write `lesson-02-cum-gandeste-un-model-ai-simple.mdx`
- [ ] **P9.3.4** Write `lesson-02-cum-gandeste-un-model-ai.mdx`
- [ ] **P9.3.5** Write `lesson-03-anatomia-unui-prompt-eficient-simple.mdx`
- [ ] **P9.3.6** Write `lesson-03-anatomia-unui-prompt-eficient.mdx`
- [ ] **P9.3.7** Write `lesson-04-exercitiu-prompt-slab-bun-simple.mdx`
- [ ] **P9.3.8** Write `lesson-04-exercitiu-prompt-slab-bun.mdx` (technical with python-editor)
- [ ] **P9.3.9** Write `lesson-05-quiz-modulul-1.mdx` (quiz type — single file)
- [ ] **P9.3.10** Write `lesson-06-zero-shot-prompting-simple.mdx` (full content above)
- [ ] **P9.3.11** Write `lesson-06-zero-shot-prompting.mdx` (technical mode)
- [ ] **P9.3.12** Write `lesson-07-few-shot-prompting-simple.mdx`
- [ ] **P9.3.13** Write `lesson-07-few-shot-prompting.mdx`
- [ ] **P9.3.14** Write `lesson-08-chain-of-thought-simple.mdx`
- [ ] **P9.3.15** Write `lesson-08-chain-of-thought.mdx`
- [ ] **P9.3.16** Write `lesson-09-exercitiu-cot-simple.mdx`
- [ ] **P9.3.17** Write `lesson-09-exercitiu-cot.mdx` (technical with python-editor)
- [ ] **P9.3.18** Write `lesson-10-quiz-modulul-2.mdx` (quiz type)
- [ ] **P9.3.19** Write `lesson-11-ce-este-system-prompt-simple.mdx` (full content above)
- [ ] **P9.3.20** Write `lesson-11-ce-este-system-prompt.mdx` (technical mode)
- [ ] **P9.3.21** Write `lesson-12-crearea-unui-persona-ai-simple.mdx`
- [ ] **P9.3.22** Write `lesson-12-crearea-unui-persona-ai.mdx`
- [ ] **P9.3.23** Write `lesson-13-injectia-de-context-simple.mdx`
- [ ] **P9.3.24** Write `lesson-13-injectia-de-context.mdx`
- [ ] **P9.3.25** Write `lesson-14-exercitiu-asistent-simple.mdx`
- [ ] **P9.3.26** Write `lesson-14-exercitiu-asistent.mdx` (technical with python-editor)
- [ ] **P9.3.27** Write `lesson-15-quiz-modulul-3.mdx` (quiz type)
- [ ] **P9.3.28** Write `lesson-16-meta-prompting-simple.mdx`
- [ ] **P9.3.29** Write `lesson-16-meta-prompting.mdx`
- [ ] **P9.3.30** Write `lesson-17-prompturi-structurate-simple.mdx`
- [ ] **P9.3.31** Write `lesson-17-prompturi-structurate.mdx` (technical: JSON mode API)
- [ ] **P9.3.32** Write `lesson-18-prompt-chaining-simple.mdx`
- [ ] **P9.3.33** Write `lesson-18-prompt-chaining.mdx`
- [ ] **P9.3.34** Write `lesson-19-exercitiu-chaining-simple.mdx`
- [ ] **P9.3.35** Write `lesson-19-exercitiu-chaining.mdx` (technical with python-editor)
- [ ] **P9.3.36** Write `lesson-20-quiz-modulul-4.mdx` (quiz type)
- [ ] **P9.3.37** Write `lesson-21-redactare-simple.mdx`
- [ ] **P9.3.38** Write `lesson-21-redactare.mdx`
- [ ] **P9.3.39** Write `lesson-22-analiza-simple.mdx`
- [ ] **P9.3.40** Write `lesson-22-analiza.mdx`
- [ ] **P9.3.41** Write `lesson-23-antreprenori-simple.mdx`
- [ ] **P9.3.42** Write `lesson-23-antreprenori.mdx`
- [ ] **P9.3.43** Write `lesson-24-exercitiu-prompt-kit-simple.mdx`
- [ ] **P9.3.44** Write `lesson-24-exercitiu-prompt-kit.mdx` (technical with python-editor)
- [ ] **P9.3.45** Write `lesson-25-quiz-modulul-5.mdx` (quiz type)
- [ ] **P9.3.46** Write `lesson-26-greseli-comune-simple.mdx`
- [ ] **P9.3.47** Write `lesson-26-greseli-comune.mdx`
- [ ] **P9.3.48** Write `lesson-27-evaluarea-calitatii-simple.mdx`
- [ ] **P9.3.49** Write `lesson-27-evaluarea-calitatii.mdx`
- [ ] **P9.3.50** Write `lesson-28-etica-prompt-engineering-simple.mdx`
- [ ] **P9.3.51** Write `lesson-28-etica-prompt-engineering.mdx`
- [ ] **P9.3.52** Write `lesson-29-viitorul-agenti-simple.mdx`
- [ ] **P9.3.53** Write `lesson-29-viitorul-agenti.mdx`
- [ ] **P9.3.54** Write `lesson-30-proiect-final.mdx` (single version — content above)
- [ ] **P9.3.55** Run sync-action to populate all 30 lesson rows in DB
- [ ] **P9.4.1** Fetch lesson UUIDs from DB, replace `$L01_ID`…`$L29_ID` in gate SQL
- [ ] **P9.4.2** Run gate question INSERTs for all 24 theory lessons (48 questions total)
- [ ] **P9.5.1** Verify flashcard JSON blocks embedded in 6 module capstone lessons
- [ ] **P9.6.1** Run `npx tsc --noEmit` — fix any type errors
- [ ] **P9.6.2** Set `is_published = true` on course after all lessons verified
- [ ] **P9.6.3** Test course end-to-end: login → dashboard → new course card → lesson 1 → gate questions → progress tracking → XP

---

## NEW PACKAGES FLAG

**recharts** — NOT installed. The admin dashboard uses pure HTML/CSS bar charts via `<CssBarChart>` (defined in Section 8.3). This covers all analytics visualization needs without adding a dependency. If richer charts are needed in a future phase, flag `recharts@^2.12.7` for approval at that time.

No other new packages are required for Phase 8-9.
