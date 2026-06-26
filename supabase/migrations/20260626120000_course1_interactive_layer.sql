-- Migration: Course 1 interactive layer — inline questions, lesson scoring, Wow Notes
-- Date: 2026-06-26
--
-- PROBLEM
-- Course 1 is getting a new interactive layer: inline questions embedded in
-- lessons (6 locally-verifiable types + a reserved AI-graded essay type),
-- per-lesson scoring, and contextual "Wow Notes". No such structures exist yet.
--
-- FIX
-- Create four tables — inline_questions, inline_attempts, lesson_scores, wow_notes
-- — with constraints, indexes, RLS policies, and moddatetime updated_at triggers.
-- Scoring math (100/60/20) and total_questions stay in TypeScript Server Actions
-- (step 2); the DB stores only raw inputs: best_score per attempt, correct_questions
-- per lesson. RLS mirrors existing precedents: content tables (inline_questions,
-- wow_notes) are authenticated-read-only (like lesson_gate_questions/flashcards);
-- user-owned tables (inline_attempts, lesson_scores) follow the user_progress
-- template (own select/insert/update, no delete).
--
-- The legacy lesson_gate_* tables are deliberately LEFT UNTOUCHED — they are still
-- referenced by live code (page.tsx / lesson-gate.tsx / awardGateXP); a separate
-- cleanup pass handles them later.
--
-- Idempotent (create … if not exists / drop … if exists) and wrapped in a single
-- transaction — safe to re-run and all-or-nothing.
--
-- Apply via:  supabase db push
--        OR:  paste into Supabase SQL editor → Run

begin;

-- ── updated_at auto-refresh extension (same schema as uuid_generate_v4) ──────────
create extension if not exists moddatetime with schema extensions;

-- ============================================================
-- INLINE QUESTIONS  (content; authenticated-read-only)
-- ============================================================
create table if not exists public.inline_questions (
  id          uuid primary key default extensions.uuid_generate_v4(),
  lesson_id   uuid not null references public.lessons(id) on delete cascade,
  type        text not null check (type in (
                'single_choice', 'true_false', 'short_answer',
                'match_pairs', 'ordering', 'fill_blank', 'essay_ai')),
  order_index integer not null,
  content     jsonb not null,
  created_at  timestamptz not null default now(),
  constraint inline_questions_lesson_order_key
    unique (lesson_id, order_index) deferrable initially deferred
);

-- No explicit (lesson_id, order_index) index: the UNIQUE constraint above already
-- creates a usable btree index on exactly those columns.

alter table public.inline_questions enable row level security;

drop policy if exists "Inline questions viewable by authenticated users" on public.inline_questions;
create policy "Inline questions viewable by authenticated users"
  on public.inline_questions for select
  to authenticated
  using (true);

-- ============================================================
-- INLINE ATTEMPTS  (per-user, per-question; user-owned)
-- ============================================================
create table if not exists public.inline_attempts (
  id          uuid primary key default extensions.uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  question_id uuid not null references public.inline_questions(id) on delete cascade,
  best_score  smallint not null default 0 check (best_score between 0 and 100),
  attempts    integer not null default 0,
  revealed    boolean not null default false,
  updated_at  timestamptz not null default now(),
  constraint inline_attempts_user_question_key unique (user_id, question_id)
);

-- FK column is not auto-indexed — needed for cascade delete + per-question analytics.
-- No standalone user_id index: UNIQUE(user_id, question_id) already leads with user_id.
create index if not exists idx_inline_attempts_question
  on public.inline_attempts(question_id);

alter table public.inline_attempts enable row level security;

drop policy if exists "Users can view own inline attempts" on public.inline_attempts;
create policy "Users can view own inline attempts"
  on public.inline_attempts for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own inline attempts" on public.inline_attempts;
create policy "Users can insert own inline attempts"
  on public.inline_attempts for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own inline attempts" on public.inline_attempts;
create policy "Users can update own inline attempts"
  on public.inline_attempts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists set_updated_at on public.inline_attempts;
create trigger set_updated_at
  before update on public.inline_attempts
  for each row execute function extensions.moddatetime(updated_at);

-- ============================================================
-- LESSON SCORES  (per-user, per-lesson; user-owned)
-- ============================================================
create table if not exists public.lesson_scores (
  id                uuid primary key default extensions.uuid_generate_v4(),
  user_id           uuid not null references public.users(id) on delete cascade,
  lesson_id         uuid not null references public.lessons(id) on delete cascade,
  correct_questions integer not null default 0,
  updated_at        timestamptz not null default now(),
  constraint lesson_scores_user_lesson_key unique (user_id, lesson_id)
);

-- FK column is the 2nd column of the UNIQUE → not usable alone; index it explicitly.
-- No standalone user_id index: UNIQUE(user_id, lesson_id) already leads with user_id.
-- No score / total_questions columns — both computed live in code (step 2).
create index if not exists idx_lesson_scores_lesson
  on public.lesson_scores(lesson_id);

alter table public.lesson_scores enable row level security;

drop policy if exists "Users can view own lesson scores" on public.lesson_scores;
create policy "Users can view own lesson scores"
  on public.lesson_scores for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own lesson scores" on public.lesson_scores;
create policy "Users can insert own lesson scores"
  on public.lesson_scores for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own lesson scores" on public.lesson_scores;
create policy "Users can update own lesson scores"
  on public.lesson_scores for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists set_updated_at on public.lesson_scores;
create trigger set_updated_at
  before update on public.lesson_scores
  for each row execute function extensions.moddatetime(updated_at);

-- ============================================================
-- WOW NOTES  (contextual side-margin notes; authenticated-read-only)
-- ============================================================
create table if not exists public.wow_notes (
  id          uuid primary key default extensions.uuid_generate_v4(),
  lesson_id   uuid not null references public.lessons(id) on delete cascade,
  order_index integer not null,
  title       text not null,
  body        text,
  media_type  text not null default 'none' check (media_type in ('none', 'svg', 'component')),
  media_ref   text,
  created_at  timestamptz not null default now(),
  constraint wow_notes_media_ref_check check (media_type = 'none' or media_ref is not null),
  constraint wow_notes_lesson_order_key
    unique (lesson_id, order_index) deferrable initially deferred
);

-- No explicit (lesson_id, order_index) index: the UNIQUE constraint above already
-- creates a usable btree index on exactly those columns.

alter table public.wow_notes enable row level security;

drop policy if exists "Wow notes viewable by authenticated users" on public.wow_notes;
create policy "Wow notes viewable by authenticated users"
  on public.wow_notes for select
  to authenticated
  using (true);

commit;
