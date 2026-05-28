-- Migration: Add missing indexes identified in codebase audit
-- Date: 2026-04-10
--
-- These indexes cover the most heavily-filtered columns across the app.
-- All use CREATE INDEX IF NOT EXISTS for idempotency.
--
-- Apply via:  supabase db push
--        OR:  paste into Supabase SQL editor → Run

-- ── user_badges ───────────────────────────────────────────────────────────────
-- Queried on every dashboard load for badge count + recent earned badges
CREATE INDEX IF NOT EXISTS idx_user_badges_user    ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge   ON public.user_badges(badge_id);

-- ── lesson_comments ───────────────────────────────────────────────────────────
-- Queried + realtime-subscribed on every lesson page load
CREATE INDEX IF NOT EXISTS idx_lesson_comments_lesson  ON public.lesson_comments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_comments_user    ON public.lesson_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_comments_parent  ON public.lesson_comments(parent_id);

-- ── ai_coach_sessions ─────────────────────────────────────────────────────────
-- Queried on every AI coach interaction (user_id + ended_at filter)
CREATE INDEX IF NOT EXISTS idx_ai_coach_sessions_user  ON public.ai_coach_sessions(user_id, ended_at DESC);

-- ── notification_preferences ──────────────────────────────────────────────────
-- Queried in cron jobs (weekly email, streak check) and settings page
-- PK is user_id so lookup is O(1) via PK — no extra index needed.
-- But if querying by push_enabled for bulk push sends:
CREATE INDEX IF NOT EXISTS idx_notification_prefs_push ON public.notification_preferences(push_enabled) WHERE push_enabled = true;

-- ── push_subscriptions ────────────────────────────────────────────────────────
-- Queried on every push notification send (JOIN from notification_preferences)
CREATE INDEX IF NOT EXISTS idx_push_subs_user          ON public.push_subscriptions(user_id);

-- ── referral_events ───────────────────────────────────────────────────────────
-- Queried on profile page for referral count
CREATE INDEX IF NOT EXISTS idx_referral_events_referrer ON public.referral_events(referrer_id);

-- ── flashcards ────────────────────────────────────────────────────────────────
-- Queried when loading a flashcard deck for a lesson
CREATE INDEX IF NOT EXISTS idx_flashcards_lesson        ON public.flashcards(lesson_id);

-- ── user_flashcard_progress ───────────────────────────────────────────────────
-- Queried for spaced repetition scheduling (due cards for user)
CREATE INDEX IF NOT EXISTS idx_ufp_user_due             ON public.user_flashcard_progress(user_id, due_date);

-- ── minigame_sessions ─────────────────────────────────────────────────────────
-- Queried for per-lesson game completion checks
CREATE INDEX IF NOT EXISTS idx_minigame_user_lesson     ON public.minigame_sessions(user_id, lesson_id);

-- ── quiz_wrong_answers ────────────────────────────────────────────────────────
-- Queried to seed adaptive quiz question generation
CREATE INDEX IF NOT EXISTS idx_wrong_answers_user_lesson ON public.quiz_wrong_answers(user_id, lesson_id);

-- ── certificates ─────────────────────────────────────────────────────────────
-- Queried for QR verification (by code) and user certificate list
CREATE INDEX IF NOT EXISTS idx_certificates_user        ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_code        ON public.certificates(code);
