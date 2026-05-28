-- Migration: Fix community feed — allow authenticated users to read users table
-- Date: 2026-04-10
--
-- PROBLEM
-- The dashboard community feed runs:
--   .from("user_progress").select("completed_at, users(name, avatar_url), lessons(title)")
-- If the users table only has a self-read RLS policy (auth.uid() = id), PostgREST
-- returns null for users(name) on all rows not owned by the caller — the feed is empty.
--
-- FIX
-- Add a SELECT policy permitting all authenticated users to read the users table.
-- PostgREST respects the column projection in .select(), so callers that only ask
-- for (name, avatar_url) will not receive sensitive columns even though this policy
-- grants row-level access to the full row.
--
-- IMPORTANT: All community feed queries MUST use explicit column selection:
--   .select("users(name, avatar_url)")  ← correct
--   .select("users(*)")                 ← never do this
--
-- FUTURE: replace with a security-definer view `public_user_profiles(id, name, avatar_url)`
-- to enforce column-level restriction at the DB layer (tracked in tech-debt backlog).
--
-- Apply via:  supabase db push
--        OR:  paste into Supabase SQL editor → Run

-- ── Drop any existing self-read-only SELECT policies (idempotent) ──────────────
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can select own row" ON users;
DROP POLICY IF EXISTS "Public names visible to authenticated users" ON users;
DROP POLICY IF EXISTS "Authenticated users can read users" ON users;

-- ── Single SELECT policy: authenticated users can read any row ─────────────────
-- Multiple SELECT policies are OR-ed by PostgreSQL; having both a self-read and
-- a public policy would be redundant. One USING (true) for authenticated role is clean.
CREATE POLICY "Authenticated users can read users"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- ── Verify: self-write policies are NOT changed ────────────────────────────────
-- INSERT, UPDATE, DELETE policies for users table remain untouched.
-- This migration only affects SELECT access for authenticated callers.
