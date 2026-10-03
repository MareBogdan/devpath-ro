-- ─────────────────────────────────────────────────────────────────────────────
-- 20260930140000_phase3_rls_hardening.sql
-- Deploy-MVP Phase 3 — close the privilege-escalation and data-exposure holes found
-- in the audit (PROGRESS.md P3-01, P3-02, P3-03, P3-13, P3-15).
--
-- Code that used to rely on the old open policies is changed in the same commit:
--   • badge / referral / XP writes go through the service-role client (server only)
--   • other users' public data is read through the SECURITY DEFINER functions below
--   • streak_count / last_active are written by the service-role client
-- ─────────────────────────────────────────────────────────────────────────────


-- 1. public.users ─────────────────────────────────────────────────────────────
-- Before: UPDATE allowed on ALL columns → any signed-in user could set their own
--   role='admin', plan='lifetime', xp_points, level, stripe_*.
--   SELECT was `true` for every signed-in user → every user's email / stripe ids.
--   INSERT allowed a self-inserted row with arbitrary role/plan.
-- After:  a user may UPDATE only safe profile columns of their OWN row, may not
--   INSERT (the on_auth_user_created trigger creates the row), and may SELECT only
--   their OWN row. Other users' public fields are exposed by functions in §4.

revoke insert, update, delete, truncate on public.users from anon, authenticated;

grant update (
  name, avatar_url, goal, learning_goal, profile_type,
  skill_level, daily_goal_minutes, onboarding_completed, referral_code
) on public.users to authenticated;

drop policy if exists "Users can insert own profile"          on public.users;
drop policy if exists "Authenticated users can read users"    on public.users;
drop policy if exists "Users can update own profile"          on public.users;

create policy "Users can update own profile"
  on public.users
  for update
  to authenticated
  using      ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
-- ("Users can view own profile" — SELECT USING (auth.uid() = id) — stays as is.)


-- 2. user_badges / referral_events — service role writes only ────────────────
-- Before: a user could insert ANY badge for themselves; anyone (even anon) could
--   insert referral_events rows.
drop policy if exists "Users can insert own badges"           on public.user_badges;
drop policy if exists "System can insert referral events"     on public.referral_events;

revoke insert, update, delete, truncate on public.user_badges     from anon, authenticated;
revoke insert, update, delete, truncate on public.referral_events from anon, authenticated;


-- 3. user_progress — stop exposing other users' progress ─────────────────────
-- Before: any signed-in user could read every user's completed progress rows
--   (lesson ids, scores, timestamps). The only consumer was the dashboard
--   "community feed", which now uses get_recent_completions() (§4).
drop policy if exists "Authenticated users can read completed progress" on public.user_progress;


-- 4. Safe read functions for other users' PUBLIC data ────────────────────────
-- SECURITY DEFINER so they can read across users; each returns only public fields
-- (never email, plan, role, stripe_*, referral data). Signed-in users only.

create or replace function public.get_public_profiles(p_ids uuid[])
returns table (
  id           uuid,
  name         text,
  avatar_url   text,
  xp_points    integer,
  level        integer,
  streak_count integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select u.id, u.name, u.avatar_url, u.xp_points, u.level, u.streak_count
    from public.users u
   where u.id = any (p_ids)
   limit 200;
$$;

create or replace function public.get_top_users(p_limit integer default 5)
returns table (
  id         uuid,
  name       text,
  avatar_url text,
  xp_points  integer,
  level      integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select u.id, u.name, u.avatar_url, u.xp_points, u.level
    from public.users u
   order by u.xp_points desc, u.id
   limit least(greatest(coalesce(p_limit, 5), 1), 50);
$$;

create or replace function public.get_community_stats()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'total_users',  (select count(*) from public.users),
    'active_today', (select count(*) from public.users
                      where last_active >= (now() at time zone 'UTC')::date)
  );
$$;

create or replace function public.get_recent_completions(p_limit integer default 8)
returns table (
  completed_at timestamptz,
  user_name    text,
  lesson_title text
)
language sql
stable
security definer
set search_path = ''
as $$
  select p.completed_at, u.name, l.title
    from public.user_progress p
    join public.users   u on u.id = p.user_id
    join public.lessons l on l.id = p.lesson_id and l.is_published
   where p.completed and p.completed_at is not null
   order by p.completed_at desc
   limit least(greatest(coalesce(p_limit, 8), 1), 50);
$$;

revoke all on function public.get_public_profiles(uuid[])      from public, anon;
revoke all on function public.get_top_users(integer)           from public, anon;
revoke all on function public.get_community_stats()            from public, anon;
revoke all on function public.get_recent_completions(integer)  from public, anon;
grant execute on function public.get_public_profiles(uuid[])      to authenticated, service_role;
grant execute on function public.get_top_users(integer)           to authenticated, service_role;
grant execute on function public.get_community_stats()            to authenticated, service_role;
grant execute on function public.get_recent_completions(integer)  to authenticated, service_role;


-- 5. XP can only be awarded server-side ──────────────────────────────────────
-- Before: any signed-in user could call award_xp_and_check_level directly
--   (supabase.rpc) and grant themselves XP. Now only the service-role client
--   (server actions) can execute it.
revoke execute on function public.award_xp_and_check_level(uuid, text, integer, uuid) from authenticated;
-- (already not executable by public / anon; service_role keeps EXECUTE)


-- 6. handle_new_user is a trigger function, not an API ───────────────────────
-- Advisor: it was callable through /rest/v1/rpc. The auth trigger keeps working
-- (trigger functions are not permission-checked when they fire).
revoke execute on function public.handle_new_user() from public, anon, authenticated;
