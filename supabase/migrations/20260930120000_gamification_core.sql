-- ─────────────────────────────────────────────────────────────────────────────
-- 20260930120000_gamification_core.sql
-- Deploy-MVP Phase 2 — recreate DB objects the app depends on that never made it
-- to the fresh project (zgofeajewktwmswckgup):
--   1. public.xp_events                       (XP transaction log, RLS: own rows read-only)
--   2. RPC award_xp_and_check_level           (used by src/lib/gamification.ts, (auth)/actions.ts)
--   3. RPC get_weekly_leaderboard             (used by /leaderboard)
--   4. RPC get_admin_stats                    (used by /admin, admin-only)
--   5. public.lessons.module_index            (used by badges + portfolio + lesson completion)
--   6. public.wow_notes.side / .kind          (used by inline-loaders.ts + wow-note.tsx)
--
-- Scope: this migration does NOT change auth/RLS on existing tables (Phase 3).
-- Level curve (cumulative XP: 0, 200, 400, 700, 1000, 1400, 1800, 2300, 2900, 3500
-- for levels 1-10) is the one documented in devpath-docs/devpath-vision.md and
-- mirrors LEVEL_THRESHOLDS in src/lib/gamification-constants.ts;
-- allowed event types mirror XPEventType. Keep them in sync if either changes.
-- ─────────────────────────────────────────────────────────────────────────────


-- 1. xp_events ────────────────────────────────────────────────────────────────
create table if not exists public.xp_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  event_type  text not null,
  xp          integer not null check (xp > 0),
  -- Optional reference (e.g. the lesson id for lesson_complete). Together with
  -- (user_id, event_type) it makes an award idempotent — see the unique index.
  ref_id      uuid,
  created_at  timestamptz not null default now()
);

create index if not exists xp_events_user_created_idx
  on public.xp_events (user_id, created_at desc);
create index if not exists xp_events_created_idx
  on public.xp_events (created_at desc);

-- At most ONE xp_event per (user, event type, ref) when a ref is supplied →
-- completing the same lesson twice can only ever award XP once, even in a race.
create unique index if not exists xp_events_once_per_ref_uidx
  on public.xp_events (user_id, event_type, ref_id)
  where ref_id is not null;

alter table public.xp_events enable row level security;

-- Users may READ their own events. There are deliberately NO insert/update/delete
-- policies: rows are written only by award_xp_and_check_level (SECURITY DEFINER),
-- so a client can never forge XP history (which also feeds the leaderboard).
drop policy if exists "Users can read own xp events" on public.xp_events;
create policy "Users can read own xp events"
  on public.xp_events
  for select
  to authenticated
  using ((select auth.uid()) = user_id);


-- 2. award_xp_and_check_level ─────────────────────────────────────────────────
-- Inserts an xp_event, bumps users.xp_points, recomputes users.level (never
-- decreases). Returns {awarded, new_xp, old_level, new_level, leveled_up}.
-- `awarded` is false when p_ref_id was already recorded for this user+event
-- (idempotent no-op; state returned unchanged).
create or replace function public.award_xp_and_check_level(
  p_user_id    uuid,
  p_event_type text,
  p_xp         integer,
  p_ref_id     uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller    uuid := auth.uid();
  v_old_xp    integer;
  v_old_level integer;
  v_new_xp    integer;
  v_new_level integer;
  v_inserted  integer;
begin
  if p_event_type is null or p_event_type not in (
    'onboarding_complete', 'lesson_complete', 'gate_first_try', 'quiz_perfect',
    'quiz_good', 'streak_daily', 'streak_3_days', 'streak_7_days',
    'streak_30_days', 'course_complete', 'minigame_perfect', 'minigame_complete',
    'flashcard_session', 'referral_bonus', 'first_comment', 'comment_upvoted'
  ) then
    raise exception 'award_xp_and_check_level: unknown event type %', p_event_type
      using errcode = '22023';
  end if;

  -- Largest legitimate single award is 200 (streak_30_days).
  if p_xp is null or p_xp < 1 or p_xp > 200 then
    raise exception 'award_xp_and_check_level: xp out of range (1-200)'
      using errcode = '22023';
  end if;

  -- A signed-in caller may award XP only to themselves, except the upvote reward
  -- (paid to the comment's author). Server/service-role calls have no auth.uid()
  -- and are unrestricted (referral bonuses are granted this way at signup).
  if v_caller is not null
     and v_caller <> p_user_id
     and p_event_type <> 'comment_upvoted' then
    raise exception 'award_xp_and_check_level: not allowed' using errcode = '42501';
  end if;

  -- Lock the row so concurrent awards serialize and levels stay consistent.
  select xp_points, level
    into v_old_xp, v_old_level
    from public.users
   where id = p_user_id
     for update;

  if not found then
    raise exception 'award_xp_and_check_level: user not found' using errcode = 'P0002';
  end if;

  insert into public.xp_events (user_id, event_type, xp, ref_id)
  values (p_user_id, p_event_type, p_xp, p_ref_id)
  on conflict (user_id, event_type, ref_id) where ref_id is not null do nothing;

  get diagnostics v_inserted = row_count;

  if v_inserted = 0 then
    return jsonb_build_object(
      'awarded',    false,
      'new_xp',     v_old_xp,
      'old_level',  v_old_level,
      'new_level',  v_old_level,
      'leveled_up', false
    );
  end if;

  v_new_xp := v_old_xp + p_xp;
  v_new_level := greatest(
    v_old_level,
    case
      when v_new_xp >= 3500 then 10
      when v_new_xp >= 2900 then 9
      when v_new_xp >= 2300 then 8
      when v_new_xp >= 1800 then 7
      when v_new_xp >= 1400 then 6
      when v_new_xp >= 1000 then 5
      when v_new_xp >=  700 then 4
      when v_new_xp >=  400 then 3
      when v_new_xp >=  200 then 2
      else 1
    end
  );

  update public.users
     set xp_points = v_new_xp,
         level     = v_new_level
   where id = p_user_id;

  return jsonb_build_object(
    'awarded',    true,
    'new_xp',     v_new_xp,
    'old_level',  v_old_level,
    'new_level',  v_new_level,
    'leveled_up', v_new_level > v_old_level
  );
end;
$$;

revoke all on function public.award_xp_and_check_level(uuid, text, integer, uuid)
  from public, anon;
grant execute on function public.award_xp_and_check_level(uuid, text, integer, uuid)
  to authenticated, service_role;


-- 3. get_weekly_leaderboard ───────────────────────────────────────────────────
-- Top 10 users by XP earned since Monday 00:00 (Europe/Bucharest). SECURITY
-- DEFINER so it can aggregate every user's xp_events (RLS only exposes own rows)
-- while returning just the public leaderboard fields.
create or replace function public.get_weekly_leaderboard()
returns table (
  user_id    uuid,
  name       text,
  avatar_url text,
  level      integer,
  weekly_xp  bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select u.id,
         u.name,
         u.avatar_url,
         u.level,
         sum(e.xp)::bigint
    from public.xp_events e
    join public.users u on u.id = e.user_id
   where e.created_at >=
         (date_trunc('week', now() at time zone 'Europe/Bucharest')
            at time zone 'Europe/Bucharest')
   group by u.id, u.name, u.avatar_url, u.level
   order by sum(e.xp) desc, u.id
   limit 10;
$$;

revoke all on function public.get_weekly_leaderboard() from public, anon;
grant execute on function public.get_weekly_leaderboard() to authenticated, service_role;


-- 4. get_admin_stats ──────────────────────────────────────────────────────────
-- {total_users, active_today, total_completions, total_xp_awarded}. Admin-only
-- (or service role). `last_active` is written as a UTC date by the app, so
-- "today" is the UTC date too.
create or replace function public.get_admin_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if coalesce(auth.role(), '') <> 'service_role'
     and not exists (
       select 1 from public.users where id = auth.uid() and role = 'admin'
     ) then
    raise exception 'get_admin_stats: admin only' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'total_users',       (select count(*) from public.users),
    'active_today',      (select count(*) from public.users
                           where last_active = (now() at time zone 'UTC')::date),
    'total_completions', (select count(*) from public.user_progress where completed),
    'total_xp_awarded',  (select coalesce(sum(xp), 0) from public.xp_events)
  );
end;
$$;

revoke all on function public.get_admin_stats() from public, anon;
grant execute on function public.get_admin_stats() to authenticated, service_role;


-- 5. lessons.module_index ─────────────────────────────────────────────────────
-- 1-based module number. Backfilled from lesson position (5 lessons per module,
-- same cadence as MODULE_SIZE in src/lib/course-map.ts). Default 1 for future
-- inserts — importers/seeders should set it explicitly.
alter table public.lessons
  add column if not exists module_index integer not null default 1;

update public.lessons l
   set module_index = s.m
  from (
    select id,
           (((row_number() over (partition by course_id order by order_index) - 1) / 5) + 1)::integer as m
      from public.lessons
  ) s
 where s.id = l.id;


-- 6. wow_notes.side / kind ────────────────────────────────────────────────────
-- Values mirror WowNoteSide / WowNoteKind in src/types/index.ts.
alter table public.wow_notes
  add column if not exists side text not null default 'right'
    check (side in ('left', 'right'));

alter table public.wow_notes
  add column if not exists kind text not null default 'insight'
    check (kind in ('insight', 'term', 'analogy'));
