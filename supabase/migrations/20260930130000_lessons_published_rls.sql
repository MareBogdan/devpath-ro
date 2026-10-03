-- ─────────────────────────────────────────────────────────────────────────────
-- 20260930130000_lessons_published_rls.sql
-- Deploy-MVP Phase 4 — stop exposing unpublished lessons through the public API.
--
-- Before: policy "Lessons are viewable by everyone" USING (true) → anyone holding the
--   anon key could read every lesson row, including unpublished skeletons and any
--   draft content_md.
-- After:  only PUBLISHED lessons are readable by everyone; admins (users.role =
--   'admin') can still read drafts. Service-role code (seed/import scripts, admin
--   pages, the sync action) bypasses RLS and is unaffected.
--
-- Scope: SELECT on public.lessons only. Nothing else changes.
-- ─────────────────────────────────────────────────────────────────────────────

drop policy if exists "Lessons are viewable by everyone" on public.lessons;

create policy "Published lessons are viewable by everyone"
  on public.lessons
  for select
  to public
  using (
    is_published = true
    or exists (
      select 1
        from public.users u
       where u.id = (select auth.uid())
         and u.role = 'admin'
    )
  );
