-- ============================================================
-- DevPath RO — Complete Database Schema
-- Auto-generated from live Supabase schema — 2026-04-10
-- ============================================================
-- Apply via Supabase SQL Editor (run once on a fresh project)
-- or use supabase/migrations/ for incremental changes.
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS TABLE
-- ============================================================
-- Extends Supabase auth.users with app-specific profile data.
create table public.users (
  id                     uuid references auth.users(id) on delete cascade primary key,
  email                  text not null,
  name                   text,
  plan                   text not null default 'free' check (plan in ('free', 'pro', 'lifetime')),
  goal                   text,
  avatar_url             text,
  -- Gamification
  xp_points              integer not null default 0,
  level                  integer not null default 1,
  streak_count           integer not null default 0,
  last_active            date,
  -- Role / access
  role                   text not null default 'student' check (role in ('student', 'admin')),
  -- Onboarding
  onboarding_completed   boolean not null default false,
  learning_mode          text not null default 'simple' check (learning_mode in ('simple', 'technical')),
  profile_type           text,
  learning_goal          text,
  skill_level            integer,
  daily_goal_minutes     integer not null default 15 check (daily_goal_minutes in (0, 5, 15, 30)),
  -- Referral
  referral_code          text unique,
  referred_by            uuid references public.users(id),
  -- Stripe / billing
  stripe_customer_id     text,
  stripe_subscription_id text,
  plan_activated_at      timestamptz,
  -- Metadata
  created_at             timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Authenticated users can read users"
  on public.users for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.users for insert
  with check (auth.uid() = id);

-- ============================================================
-- COURSES TABLE
-- ============================================================
create table public.courses (
  id           uuid primary key default uuid_generate_v4(),
  slug         text unique not null,
  title        text not null,
  description  text not null,
  difficulty   text not null default 'beginner' check (difficulty in ('beginner', 'intermediate', 'advanced')),
  is_free      boolean not null default false,
  order_index  integer not null default 0
);

alter table public.courses enable row level security;

create policy "Courses are viewable by everyone"
  on public.courses for select
  using (true);

-- ============================================================
-- LESSONS TABLE
-- ============================================================
create table public.lessons (
  id            uuid primary key default uuid_generate_v4(),
  course_id     uuid references public.courses(id) on delete cascade not null,
  title         text not null,
  content_md    text not null default '',
  type          text not null default 'theory' check (type in ('theory', 'quiz', 'exercise', 'project')),
  starter_code  text,
  solution_code text,
  order_index   integer not null default 0,
  video_url     text,
  is_free       boolean not null default false,
  estimated_minutes integer
);

alter table public.lessons enable row level security;

create policy "Lessons are viewable by everyone"
  on public.lessons for select
  using (true);

-- ============================================================
-- USER PROGRESS TABLE
-- ============================================================
create table public.user_progress (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references public.users(id) on delete cascade not null,
  lesson_id    uuid references public.lessons(id) on delete cascade not null,
  completed    boolean not null default false,
  score        integer,
  time_spent   integer not null default 0,
  completed_at timestamptz,
  unique(user_id, lesson_id)
);

alter table public.user_progress enable row level security;

create policy "Users can view own progress"
  on public.user_progress for select
  using (auth.uid() = user_id);

-- Community feed needs to read other users' progress (completed_at, lesson join)
create policy "Authenticated users can read completed progress"
  on public.user_progress for select
  to authenticated
  using (completed = true);

create policy "Users can insert own progress"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on public.user_progress for update
  using (auth.uid() = user_id);

-- ============================================================
-- QUIZ QUESTIONS TABLE
-- ============================================================
create table public.quiz_questions (
  id             uuid primary key default uuid_generate_v4(),
  lesson_id      uuid references public.lessons(id) on delete cascade not null,
  question       text not null,
  options        jsonb not null default '[]'::jsonb,
  correct_answer text not null,
  explanation    text not null default ''
);

alter table public.quiz_questions enable row level security;

create policy "Quiz questions are viewable by everyone"
  on public.quiz_questions for select
  using (true);

-- ============================================================
-- PROJECTS TABLE
-- ============================================================
create table public.projects (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references public.users(id) on delete cascade not null,
  course_id    uuid references public.courses(id) on delete cascade not null,
  title        text not null,
  description  text not null default '',
  github_url   text,
  completed_at timestamptz
);

alter table public.projects enable row level security;

create policy "Users can view own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Anyone can view completed projects"
  on public.projects for select
  using (completed_at is not null);

-- ============================================================
-- BADGES TABLE
-- ============================================================
create table public.badges (
  id          uuid primary key default uuid_generate_v4(),
  slug        text unique not null,
  name        text not null,
  icon        text not null,
  description text,
  xp_reward   integer not null default 0
);

alter table public.badges enable row level security;

create policy "Badges are viewable by everyone"
  on public.badges for select
  using (true);

-- ============================================================
-- USER BADGES TABLE
-- ============================================================
create table public.user_badges (
  user_id   uuid references public.users(id) on delete cascade not null,
  badge_id  uuid references public.badges(id) on delete cascade not null,
  earned_at timestamptz default now(),
  primary key (user_id, badge_id)
);

alter table public.user_badges enable row level security;

create policy "Users can view own badges"
  on public.user_badges for select
  using (auth.uid() = user_id);

create policy "Users can insert own badges"
  on public.user_badges for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- LESSON BOOKMARKS TABLE
-- ============================================================
create table public.lesson_bookmarks (
  user_id   uuid references public.users(id) on delete cascade not null,
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  primary key (user_id, lesson_id)
);

alter table public.lesson_bookmarks enable row level security;

create policy "Users can manage own bookmarks"
  on public.lesson_bookmarks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- LESSON COMMENTS TABLE
-- ============================================================
create table public.lesson_comments (
  id           uuid primary key default uuid_generate_v4(),
  lesson_id    uuid references public.lessons(id) on delete cascade not null,
  user_id      uuid references public.users(id) on delete cascade not null,
  content      text not null,
  parent_id    uuid references public.lesson_comments(id) on delete cascade,
  upvote_count integer not null default 0,
  is_reported  boolean,
  is_hidden    boolean,
  moderated_at timestamptz,
  created_at   timestamptz not null default now()
);

alter table public.lesson_comments enable row level security;

create policy "Anyone authenticated can view visible comments"
  on public.lesson_comments for select
  to authenticated
  using (is_hidden is not true);

create policy "Users can insert own comments"
  on public.lesson_comments for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own comments"
  on public.lesson_comments for update
  using (auth.uid() = user_id);

create policy "Users can delete own comments"
  on public.lesson_comments for delete
  using (auth.uid() = user_id);

-- ============================================================
-- LESSON FEEDBACK TABLE
-- ============================================================
create table public.lesson_feedback (
  user_id             uuid references public.users(id) on delete cascade not null,
  lesson_id           uuid references public.lessons(id) on delete cascade not null,
  rating              text not null check (rating in ('clear', 'hard')),
  time_spent_seconds  integer not null default 0,
  learning_mode       text,
  primary key (user_id, lesson_id)
);

alter table public.lesson_feedback enable row level security;

create policy "Users can manage own feedback"
  on public.lesson_feedback for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- LESSON GATE QUESTIONS TABLE
-- ============================================================
create table public.lesson_gate_questions (
  id            uuid primary key default uuid_generate_v4(),
  lesson_id     uuid references public.lessons(id) on delete cascade not null,
  question      text not null,
  options       jsonb not null default '[]'::jsonb,
  correct_answer integer not null,
  explanation   text not null default '',
  mode          text not null default 'both' check (mode in ('simple', 'technical', 'both')),
  display_order integer not null default 0
);

alter table public.lesson_gate_questions enable row level security;

create policy "Gate questions viewable by authenticated users"
  on public.lesson_gate_questions for select
  to authenticated
  using (true);

-- ============================================================
-- FLASHCARDS TABLE
-- ============================================================
create table public.flashcards (
  id          uuid primary key default uuid_generate_v4(),
  lesson_id   uuid references public.lessons(id) on delete cascade not null,
  front_text  text not null,
  back_text   text not null,
  order_index integer not null default 0
);

alter table public.flashcards enable row level security;

create policy "Flashcards viewable by authenticated users"
  on public.flashcards for select
  to authenticated
  using (true);

-- ============================================================
-- USER FLASHCARD PROGRESS TABLE  (SM-2 spaced repetition)
-- ============================================================
create table public.user_flashcard_progress (
  user_id         uuid references public.users(id) on delete cascade not null,
  flashcard_id    uuid references public.flashcards(id) on delete cascade not null,
  ease_factor     numeric not null default 2.5,
  interval_days   integer not null default 1,
  repetitions     integer not null default 0,
  due_date        timestamptz not null default now(),
  last_reviewed_at timestamptz,
  primary key (user_id, flashcard_id)
);

alter table public.user_flashcard_progress enable row level security;

create policy "Users can manage own flashcard progress"
  on public.user_flashcard_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- GLOSSAR TERMS TABLE
-- ============================================================
create table public.glossar_terms (
  id         uuid primary key default uuid_generate_v4(),
  term       text not null,
  definition text not null,
  category   text,
  created_at timestamptz not null default now()
);

alter table public.glossar_terms enable row level security;

create policy "Glossar terms viewable by everyone"
  on public.glossar_terms for select
  using (true);

-- ============================================================
-- MINIGAME SESSIONS TABLE
-- ============================================================
create table public.minigame_sessions (
  id        uuid primary key default uuid_generate_v4(),
  user_id   uuid references public.users(id) on delete cascade not null,
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  game_type text not null check (game_type in (
    'sort_concepts', 'fill_blank', 'match_pairs',
    'true_false', 'build_network', 'write_prompt'
  )),
  score     integer not null default 0,
  perfect   boolean not null default false,
  played_at timestamptz not null default now()
);

alter table public.minigame_sessions enable row level security;

create policy "Users can view own minigame sessions"
  on public.minigame_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own minigame sessions"
  on public.minigame_sessions for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- NOTIFICATION PREFERENCES TABLE
-- ============================================================
create table public.notification_preferences (
  user_id                  uuid references public.users(id) on delete cascade primary key,
  email_weekly_progress    boolean default true,
  email_streak_lost        boolean default true,
  email_course_complete    boolean default true,
  push_enabled             boolean default false
);

alter table public.notification_preferences enable row level security;

create policy "Users can manage own notification preferences"
  on public.notification_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- PUSH SUBSCRIPTIONS TABLE
-- ============================================================
create table public.push_subscriptions (
  id       uuid primary key default uuid_generate_v4(),
  user_id  uuid references public.users(id) on delete cascade not null,
  endpoint text unique not null,
  p256dh   text not null,
  auth     text not null
);

alter table public.push_subscriptions enable row level security;

create policy "Users can manage own push subscriptions"
  on public.push_subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- REFERRAL EVENTS TABLE
-- ============================================================
create table public.referral_events (
  id          uuid primary key default uuid_generate_v4(),
  referrer_id uuid references public.users(id) on delete cascade not null,
  referred_id uuid references public.users(id) on delete cascade not null,
  xp_awarded  boolean default false,
  created_at  timestamptz not null default now(),
  unique(referred_id) -- each user can only be referred once
);

alter table public.referral_events enable row level security;

create policy "Users can view referrals they made"
  on public.referral_events for select
  using (auth.uid() = referrer_id);

create policy "System can insert referral events"
  on public.referral_events for insert
  with check (true); -- service role only in practice

-- ============================================================
-- AI COACH SESSIONS TABLE
-- ============================================================
create table public.ai_coach_sessions (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references public.users(id) on delete cascade not null,
  lesson_id     uuid references public.lessons(id),
  summary       text not null default '',
  message_count integer not null default 0,
  started_at    timestamptz not null default now(),
  ended_at      timestamptz
);

alter table public.ai_coach_sessions enable row level security;

create policy "Users can manage own AI coach sessions"
  on public.ai_coach_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- AI GENERATED QUESTIONS TABLE
-- ============================================================
create table public.ai_generated_questions (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid references public.users(id) on delete cascade not null,
  lesson_id           uuid references public.lessons(id) on delete cascade not null,
  source_question_ids uuid[],
  question            text not null,
  options             jsonb not null default '[]'::jsonb,
  correct_answer      integer not null,
  explanation         text not null default '',
  generated_at        timestamptz not null default now()
);

alter table public.ai_generated_questions enable row level security;

create policy "Users can manage own generated questions"
  on public.ai_generated_questions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- QUIZ WRONG ANSWERS TABLE
-- ============================================================
create table public.quiz_wrong_answers (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid references public.users(id) on delete cascade not null,
  lesson_id      uuid references public.lessons(id) on delete cascade not null,
  question_id    uuid references public.quiz_questions(id) on delete cascade not null,
  selected_option integer not null,
  correct_option  integer not null,
  recorded_at     timestamptz not null default now()
);

alter table public.quiz_wrong_answers enable row level security;

create policy "Users can manage own wrong answers"
  on public.quiz_wrong_answers for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- CERTIFICATES TABLE
-- ============================================================
create table public.certificates (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references public.users(id) on delete cascade not null,
  course_id  uuid references public.courses(id) on delete cascade not null,
  code       text unique not null,
  issued_at  timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(user_id, course_id)
);

alter table public.certificates enable row level security;

create policy "Users can view own certificates"
  on public.certificates for select
  using (auth.uid() = user_id);

-- Public certificate verification (via QR code / share link)
create policy "Anyone can verify a certificate by code"
  on public.certificates for select
  using (true);

create policy "Users can insert own certificates"
  on public.certificates for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- FUNCTION: Auto-create user profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- INDEXES
-- ============================================================

-- lessons
create index idx_lessons_course_id     on public.lessons(course_id);
create index idx_lessons_order         on public.lessons(course_id, order_index);

-- user_progress
create index idx_user_progress_user    on public.user_progress(user_id);
create index idx_user_progress_lesson  on public.user_progress(lesson_id);

-- quiz_questions
create index idx_quiz_questions_lesson on public.quiz_questions(lesson_id);

-- projects
create index idx_projects_user         on public.projects(user_id);
create index idx_projects_course       on public.projects(course_id);

-- user_badges
create index idx_user_badges_user      on public.user_badges(user_id);
create index idx_user_badges_badge     on public.user_badges(badge_id);

-- lesson_comments
create index idx_lesson_comments_lesson on public.lesson_comments(lesson_id);
create index idx_lesson_comments_user   on public.lesson_comments(user_id);
create index idx_lesson_comments_parent on public.lesson_comments(parent_id);

-- flashcards
create index idx_flashcards_lesson     on public.flashcards(lesson_id);

-- user_flashcard_progress
create index idx_ufp_user              on public.user_flashcard_progress(user_id);
create index idx_ufp_due               on public.user_flashcard_progress(user_id, due_date);

-- minigame_sessions
create index idx_minigame_user         on public.minigame_sessions(user_id);

-- ai_coach_sessions
create index idx_ai_coach_user         on public.ai_coach_sessions(user_id, ended_at desc);

-- ai_generated_questions
create index idx_ai_questions_user     on public.ai_generated_questions(user_id, lesson_id);

-- quiz_wrong_answers
create index idx_wrong_answers_user    on public.quiz_wrong_answers(user_id, lesson_id);

-- push_subscriptions
create index idx_push_subs_user        on public.push_subscriptions(user_id);

-- notification_preferences (PK = user_id, no extra index needed)

-- referral_events
create index idx_referral_referrer     on public.referral_events(referrer_id);

-- certificates
create index idx_certificates_user     on public.certificates(user_id);
create index idx_certificates_code     on public.certificates(code);
