-- ============================================
-- DevPath RO — Complete Database Schema
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- after creating the project.
-- ============================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
-- Extends Supabase auth.users with app-specific data
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  name text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'lifetime')),
  goal text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.users enable row level security;

-- Users can read their own data
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

-- Users can update their own data
create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- Users can insert their own data (on signup)
create policy "Users can insert own profile"
  on public.users for insert
  with check (auth.uid() = id);

-- ============================================
-- COURSES TABLE
-- ============================================
create table public.courses (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  description text not null,
  difficulty text not null default 'beginner' check (difficulty in ('beginner', 'intermediate', 'advanced')),
  is_free boolean not null default false,
  order_index integer not null default 0
);

alter table public.courses enable row level security;

-- Courses are publicly readable
create policy "Courses are viewable by everyone"
  on public.courses for select
  using (true);

-- ============================================
-- LESSONS TABLE
-- ============================================
create table public.lessons (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  content_md text not null default '',
  type text not null default 'theory' check (type in ('theory', 'quiz', 'exercise', 'project')),
  starter_code text,
  solution_code text,
  order_index integer not null default 0,
  video_url text
);

alter table public.lessons enable row level security;

-- Lessons are publicly readable
create policy "Lessons are viewable by everyone"
  on public.lessons for select
  using (true);

-- ============================================
-- USER PROGRESS TABLE
-- ============================================
create table public.user_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  completed boolean not null default false,
  score integer,
  time_spent integer not null default 0,
  completed_at timestamptz,
  unique(user_id, lesson_id)
);

alter table public.user_progress enable row level security;

-- Users can read their own progress
create policy "Users can view own progress"
  on public.user_progress for select
  using (auth.uid() = user_id);

-- Users can insert their own progress
create policy "Users can insert own progress"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

-- Users can update their own progress
create policy "Users can update own progress"
  on public.user_progress for update
  using (auth.uid() = user_id);

-- ============================================
-- QUIZ QUESTIONS TABLE
-- ============================================
create table public.quiz_questions (
  id uuid primary key default uuid_generate_v4(),
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  question text not null,
  options jsonb not null default '[]'::jsonb,
  correct_answer text not null,
  explanation text not null default ''
);

alter table public.quiz_questions enable row level security;

-- Quiz questions are publicly readable
create policy "Quiz questions are viewable by everyone"
  on public.quiz_questions for select
  using (true);

-- ============================================
-- PROJECTS TABLE
-- ============================================
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  description text not null default '',
  github_url text,
  completed_at timestamptz
);

alter table public.projects enable row level security;

-- Users can read their own projects
create policy "Users can view own projects"
  on public.projects for select
  using (auth.uid() = user_id);

-- Users can insert their own projects
create policy "Users can insert own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

-- Users can update their own projects
create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id);

-- Public portfolios: anyone can see completed projects
create policy "Anyone can view completed projects"
  on public.projects for select
  using (completed_at is not null);

-- ============================================
-- FUNCTION: Auto-create user profile on signup
-- ============================================
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

-- Trigger: run after each new auth signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- INDEXES for performance
-- ============================================
create index idx_lessons_course_id on public.lessons(course_id);
create index idx_lessons_order on public.lessons(course_id, order_index);
create index idx_user_progress_user on public.user_progress(user_id);
create index idx_user_progress_lesson on public.user_progress(lesson_id);
create index idx_quiz_questions_lesson on public.quiz_questions(lesson_id);
create index idx_projects_user on public.projects(user_id);
create index idx_projects_course on public.projects(course_id);
