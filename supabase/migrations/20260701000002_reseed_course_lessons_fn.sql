-- Migration: reseed_course_lessons() — atomic, guarded per-course lesson reseed
-- Date: 2026-07-01
--
-- PROBLEM
-- The restructure-safe seeder (scripts/seed-curriculum.mjs) needs to replace a
-- course's lessons with a delete-then-insert. @supabase/supabase-js speaks REST
-- and cannot run a client-side transaction, so two separate REST calls could
-- crash between DELETE and INSERT and leave a course half-populated (empty).
--
-- FIX
-- A SQL function whose body runs inside PostgREST's per-request transaction, so
-- the guard + delete + insert are atomic (any failure rolls the whole thing back).
-- No new npm dependency is introduced.
--
-- SAFETY (defense in depth — the seeder also scopes to Courses 4-12 in JS):
--   Guard 1  Refuses the 3 protected slugs (Courses 1-3) outright.
--   Guard 2  Refuses if ANY of the 13 child tables of lessons.id has a row tied
--            to this course. This makes it impossible to cascade-delete user data
--            (all 13 FKs are ON DELETE CASCADE) even if the scope were widened by
--            mistake. Verified live 2026-07-01: Courses 4-12 have 0 child rows.
--
-- EXECUTE is granted to service_role only (the seeder connects with the service
-- key); revoked from public/anon/authenticated so no logged-in user can call it.
--
-- Idempotent (create or replace) + transactional.

begin;

create or replace function public.reseed_course_lessons(p_slug text, p_lessons jsonb)
returns integer
language plpgsql
as $$
declare
  v_course_id uuid;
  v_children  bigint;
  v_inserted  integer;
begin
  -- Guard 1 — never operate on the protected Courses 1-3 (they hold real user data).
  if p_slug in ('hardware-fizica', 'sisteme-de-operare', 'retele-internet') then
    raise exception 'reseed_course_lessons: "%" is a protected course (1-3); refusing.', p_slug;
  end if;

  select id into v_course_id from public.courses where slug = p_slug;
  if v_course_id is null then
    raise exception 'reseed_course_lessons: course slug "%" not found.', p_slug;
  end if;

  -- Guard 2 — refuse if ANY of the 13 direct child tables of lessons.id has a row
  -- for this course. (Checking direct children also covers transitive children,
  -- e.g. inline_attempts -> inline_questions: if inline_questions is empty they are too.)
  select count(*) into v_children from (
    select 1 from public.ai_coach_sessions      x join public.lessons l on l.id = x.lesson_id where l.course_id = v_course_id
    union all select 1 from public.ai_generated_questions x join public.lessons l on l.id = x.lesson_id where l.course_id = v_course_id
    union all select 1 from public.flashcards            x join public.lessons l on l.id = x.lesson_id where l.course_id = v_course_id
    union all select 1 from public.inline_questions      x join public.lessons l on l.id = x.lesson_id where l.course_id = v_course_id
    union all select 1 from public.lesson_bookmarks      x join public.lessons l on l.id = x.lesson_id where l.course_id = v_course_id
    union all select 1 from public.lesson_comments       x join public.lessons l on l.id = x.lesson_id where l.course_id = v_course_id
    union all select 1 from public.lesson_feedback       x join public.lessons l on l.id = x.lesson_id where l.course_id = v_course_id
    union all select 1 from public.lesson_scores         x join public.lessons l on l.id = x.lesson_id where l.course_id = v_course_id
    union all select 1 from public.minigame_sessions     x join public.lessons l on l.id = x.lesson_id where l.course_id = v_course_id
    union all select 1 from public.quiz_questions        x join public.lessons l on l.id = x.lesson_id where l.course_id = v_course_id
    union all select 1 from public.quiz_wrong_answers    x join public.lessons l on l.id = x.lesson_id where l.course_id = v_course_id
    union all select 1 from public.user_progress         x join public.lessons l on l.id = x.lesson_id where l.course_id = v_course_id
    union all select 1 from public.wow_notes             x join public.lessons l on l.id = x.lesson_id where l.course_id = v_course_id
  ) s;

  if v_children > 0 then
    raise exception 'reseed_course_lessons: "%" has % child row(s) on its lessons; refusing to delete.', p_slug, v_children;
  end if;

  -- Atomic replace. UNIQUE(course_id, order_index) makes a duplicate order in the
  -- incoming payload fail here and roll the whole call back (fail-safe).
  delete from public.lessons where course_id = v_course_id;

  insert into public.lessons (course_id, title, type, order_index, content_md, is_published)
  select v_course_id,
         e ->> 'title',
         e ->> 'type',
         (e ->> 'order')::integer,
         '',      -- content_md placeholder (NOT NULL)
         false    -- is_published
  from jsonb_array_elements(p_lessons) e;

  get diagnostics v_inserted = row_count;
  return v_inserted;
end;
$$;

-- Lock down: only the service role (used by the seeder) may execute this.
revoke all on function public.reseed_course_lessons(text, jsonb) from public;
revoke all on function public.reseed_course_lessons(text, jsonb) from anon;
revoke all on function public.reseed_course_lessons(text, jsonb) from authenticated;
grant execute on function public.reseed_course_lessons(text, jsonb) to service_role;

commit;
