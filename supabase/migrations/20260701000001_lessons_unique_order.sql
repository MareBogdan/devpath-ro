-- Migration: enforce one lesson per (course_id, order_index)
-- Date: 2026-07-01
--
-- PROBLEM
-- public.lessons has no UNIQUE(course_id, order_index). The curriculum seeders
-- were INSERT-only, so a reorder or a re-run could silently duplicate rows. Only
-- a plain (non-unique) index idx_lessons_order covers those two columns today.
--
-- FIX
-- Add a UNIQUE constraint on (course_id, order_index) and drop the now-redundant
-- non-unique index (the constraint creates its own backing btree on the same
-- columns). This makes duplicate (course, order) rows impossible and gives the
-- restructure-safe seeder a hard guarantee to lean on.
--
-- PRE-FLIGHT (verified live 2026-07-01 via Supabase MCP):
--   SELECT course_id, order_index FROM public.lessons
--   GROUP BY 1,2 HAVING count(*) > 1;   ->  0 rows
-- so the constraint applies cleanly with no data cleanup required.
--
-- Idempotent + transactional (all-or-nothing, safe to re-run).

begin;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.lessons'::regclass
      and conname  = 'lessons_course_id_order_index_key'
  ) then
    alter table public.lessons
      add constraint lessons_course_id_order_index_key unique (course_id, order_index);
  end if;
end $$;

-- Redundant once the UNIQUE constraint exists (its index leads with the same cols).
drop index if exists public.idx_lessons_order;

commit;
