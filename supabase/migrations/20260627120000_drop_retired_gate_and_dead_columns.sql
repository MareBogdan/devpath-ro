-- ============================================================
-- Drop retired gate system + dead columns
-- ============================================================
-- The old answer-gate (lesson_gate_*) was replaced by the inline-question
-- engagement gate (Pieces 3-4) and unmounted from every render path; both tables
-- are empty (0 rows) and unreferenced by code. content_simple_md (retired Mod
-- Simplu / Mod Tehnic) has 0 non-empty values and no code reference after the
-- dual-mode cleanup in sync-content.mjs. users.learning_mode is unused.
--
-- Dependency-checked clean before drop: no views/matviews, no functions/triggers,
-- and no inbound foreign keys (other than the two gate tables referencing each
-- other) reference any of these objects.
--
-- INTENTIONALLY NOT TOUCHED:
--   * user_progress.score        -- live: read by gamification badges, profile, admin
--   * lesson_feedback.learning_mode -- out of scope (separate column, not requested)

-- gate tables: drop attempts first (it FKs -> lesson_gate_questions)
drop table if exists public.lesson_gate_attempts;
drop table if exists public.lesson_gate_questions;

-- retired dual-mode column (Mod Simplu / Mod Tehnic)
alter table public.lessons drop column if exists content_simple_md;

-- unused legacy onboarding column
alter table public.users drop column if exists learning_mode;
