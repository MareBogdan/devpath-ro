# PROGRESS.md — Deploy MVP (Vercel)

> Source of truth for the "deploy-ready MVP" push. Update after every prompt.
> Started: 2026-09-30 · Target Supabase project: **`zgofeajewktwmswckgup`** (`devpath-ro`, eu-central-1, PG 17) · Old project: **do not touch**.
> Visual/text polish is the LAST step and is decided by the owner — nothing in this file is cosmetic unless tagged `[polish]`.

**Status legend:** `[ ]` open · `[x]` done & verified · `[~]` code/SQL written, waiting on an approval or apply step (see note on the item)
**Severity:** 🔴 BLOCKER (app broken / build fails / security hole) · 🟠 HIGH · 🟡 MEDIUM · ⚪ LOW
**Rules that apply to every fix:** show exact SQL and get approval before any schema change · RLS on every new table · never edit `.env.local`/`.env.example` · no new npm packages without approval · run `npx tsc --noEmit` + `npm run build` after code changes.
**Supabase MCP:** use ONLY `mcp__claude_ai_Supabase__*` with `project_id="zgofeajewktwmswckgup"`. The project-bound `mcp__supabase__*` server points at the OLD project (`umtecpbixdkumfjsvzcl`) — never use it.

---

## Decisions — ✅ RESOLVED 2026-09-30 (Phase 2 prompt)

> D1 keep OLD slugs + content for C4–6 · D2 email confirmation OFF · D3 MVP auth = Google + email/password; GitHub login, Stripe, Resend, crons, push ship disabled/graceful · D4/D5 Pyodide only (Piston fallback dropped in Phase 6) · D6 the DB is the source of truth (210 lesson rows; C7–12 are empty skeletons shown as “În curând”). Original questions kept below for the record.

- [x] **D1 — Courses 4–6 strategy.** Live DB holds the OLD v5 curriculum for C4–C6 (slugs `python-inginerie-software` 26 lessons, `algoritmi-structuri-date` 16, `matematica-ai` 21; all 63 published with content). C7–C12 already have the NEW ML/PyTorch slugs/titles (empty). The untracked rename migration would put new slugs over old content. Options: (a) keep old C4–6 content + old slugs for the MVP (rename nothing, fix `course-map.ts` keys) — fastest; (b) rename + reseed C4–6 with new curriculum (content doesn't exist yet). **Recommendation: (a)**, revisit after MVP.
- [x] **D2 — Email confirmation ON or OFF** in Supabase Auth for the MVP (OFF = no SMTP needed; ON = needs custom SMTP + code changes, see P3-05).
- [x] **D3 — Providers:** enable Google (needed) and GitHub (needed, or remove the button)?
- [x] **D4 — Stripe / Resend / push in MVP?** Payments, emails, crons, push can all be shipped disabled (graceful) — confirm which are in scope.
- [x] **D5 — Piston fallback:** public Piston is whitelist-only since 2026-02-15 → remove fallback (Pyodide only) or self-host?
- [x] **D6 — Lesson count sanity:** live DB has 210 lessons (C1 25, C2 19, C3 24, C4 26, C5 16, C6 21 published = 131; C7–12 79 unpublished); PROJECT-STATE says 205 and C3 = 26/0 published. Confirm live state is the intended one; docs to be updated after D1.

---

## Phase 1 — Audit  ✅ DONE (2026-09-30)

- [x] Confirmed target ref `zgofeajewktwmswckgup` (URL + project via MCP); `.env.local` points to it.
- [x] Auth audit · [x] DB/schema-drift audit · [x] Core-flow audit · [x] Secondary pages + F1–F5 audit · [x] `tsc` / lint / `build`
- [x] PROGRESS.md created · [x] CLAUDE.md "Deploy MVP" section added
- Build baseline: `tsc --noEmit` = **0 errors**. `npm run lint` = **1 error**, 2 warnings. `npm run build` **FAILS** on that 1 lint error; `next build --no-lint` passes (41/41 pages).
- Live DB baseline: 27 public tables, RLS enabled on all; only 2 functions (`handle_new_user`, `reseed_course_lessons`); 2 migrations applied (`base_schema`, `interactive_layer_and_migrations`); `users`=1 row (owner, `onboarding_completed=false`, role `student`); `badges`, `glossar_terms`, `flashcards`, `quiz_questions`, `inline_questions`, `wow_notes`, `user_progress` = 0 rows.
- Note: repo `schema.sql` is stale (23 tables, no RPCs) and repo migrations (Apr–Aug) don't match the live 2-migration history. **Do not re-run repo migrations blindly.** The live DB is the truth; `PROJECT-STATE.md` claims about RPCs are not reflected in the repo or the live DB.

---

## Phase 2 — Schema drift & data bugs

Everything here needs SQL shown to the owner first.

### 🔴 Blockers
- [x] **P2-01 `xp_events` table + RPC `award_xp_and_check_level(p_user_id uuid, p_event_type text, p_xp int) → jsonb {new_xp, old_level, new_level, leveled_up}`** are missing. Code: `src/lib/gamification.ts:27`, `(auth)/actions.ts:90,97`, `onboarding/actions.ts:69`. Effect today: every XP award fails silently (callers `.catch`) → XP/level never change, XP toast shows fake numbers, comment level‑3 gate blocks all comments. Fix: new migration (table + RLS + SECURITY DEFINER RPC with `set search_path=''`), derive event types and level thresholds from `src/lib/gamification*.ts`. Track it in `supabase/migrations/` this time.
- [x] **P2-02 RPCs `get_weekly_leaderboard`, `get_admin_stats` missing** (`leaderboard/page.tsx:15`, `admin/page.tsx:20`) → empty leaderboard, admin shows error. Depends on P2-01.
- [x] **P2-03 `lessons.module_index` missing** (`courses/actions.ts:107`, `gamification.ts:106`, `portfolio/page.tsx:45`, `u/[username]/page.tsx:128`, `types/index.ts:49`, `scripts/import-os.mjs`). Effect: lesson-complete can't find next lesson, course/module badges never fire, portfolio/public profile queries fail. Fix: `add column module_index int` + backfill (derive `ceil(order_index/5)` per `course-map.ts` MODULE_SIZE) **or** drop from code.
- [x] **P2-04 Seed data missing** *(DONE for badges + glossary only; `flashcards` / `quiz_questions` / `inline_questions` / `wow_notes` were deliberately NOT seeded — deferred)*: `badges`=0 (code needs 24 slugs via `tryAward`; no badge seed exists anywhere in repo — must be authored), `glossar_terms`=0 (`/api/admin/seed-glossar` can't fix it: RLS SELECT-only for the user client → needs service role/SQL), `flashcards`=0, `inline_questions`=0, `wow_notes`=0, `quiz_questions`=0.

### 🟠 High
- [ ] **P2-05 Search broken:** `/api/search` uses `textSearch("search_vector")` but neither `lessons` nor `courses` has that column (errors swallowed → always empty). Fix: generated tsvector + GIN index (`simple` config) or `ilike`.
- [x] **P2-06 Interactive layer not migrated** *(DONE = anchors without rows now render nothing; the actual Course 1 content re-import is still DEFERRED)*: C1 L1 has 5 `<InlineQuestion>` + 13 `<WowNote>` anchors, 0 rows → 18 author-error boxes on the first lesson a new user opens. Fix: re-import inline questions/wow notes for C1 (find source data / import script) **or** strip anchors for MVP.
- [x] **P2-07 C4–6 slug/content mismatch** — see **D1**. (`course-map.ts` COURSE_BANNERS/DESCRIPTIONS keyed by new slugs; live has old → no banner/tagline for C4–6. The rename migration is unsafe as written.)

### 🟡 Medium
- [x] **P2-08 `wow_notes.side` / `wow_notes.kind` missing** (`inline-loaders.ts:99` selects them; `types/index.ts:211-212`) → Wow Notes never load. Add columns (check component types for CHECK values) or drop from select.
- [x] **P2-09 `users.updated_at` missing** (`sitemap.ts:34`) → sitemap loses user pages. Add column or drop from select (sitemap also hardcodes `devpath.ro`, and `/u/<slug>` URLs 404 — see P5).
- [x] **P2-10 `users.xp` vs `xp_points`** (`(admin)/admin/users/page.tsx:51,180`) → admin users list empty. Code fix.
- [x] **P2-11 Non-existent `id` columns:** `lesson_bookmarks` and `lesson_feedback` have no `id` (`lessons/[lessonId]/page.tsx:186,196`, `courses/actions.ts:216,222`) → bookmark state always false, un-bookmark impossible, feedback prompt repeats; `user_badges` has no `id` (`dashboard/page.tsx:76-79`) → badge count 0. Code fix: select `user_id` / `badge_id`, delete by composite key.
- [ ] **P2-12 Perf advisors:** 33 RLS policies use bare `auth.uid()` (wrap in `(select auth.uid())`); 11 FKs without covering index (`ai_coach_sessions.lesson_id`, `certificates.course_id`, `lesson_bookmarks.lesson_id`, `lesson_feedback.lesson_id`, `minigame_sessions.lesson_id`, `quiz_wrong_answers.{lesson_id,question_id}`, `user_flashcard_progress.flashcard_id`, `users.referred_by`, `push_subscriptions.user_id`, `ai_generated_questions.lesson_id`). Not MVP-blocking; do if time.

### ⚪ Low
- [ ] **P2-13** `lessons.order_index` has gaps (C1 max 30 w/ 25 lessons…) → labels like "Lecția 30/25". Cosmetic `[polish]` or renumber.
- [ ] **P2-14** `reseed_course_lessons` has mutable `search_path` (advisor).
- [ ] **P2-15** Update `schema.sql`/docs to match live DB after fixes (or generate types via MCP `generate_typescript_types`).

### Phase 2 — change log (2026-09-30, "make the app WORK")

**Status (2026-09-30): Phase 2 DONE except the browser click-through.** Code verified locally (`tsc` 0 errors · `npm run lint` 0 errors · `npm run build` passes with lint ON, 41/41 pages). Both migrations were APPLIED to `zgofeajewktwmswckgup` on owner approval (DB versions `20260930084018 gamification_core`, `20260930084057 seed_badges_glossar`; repo filenames use `20260930120000/120100` — same SQL). DB verification (read-only queries + a rolled-back test transaction, nothing persisted): 25 badges (all 23 slugs referenced by `tryAward()` present) · 50 glossary terms in 6 categories · `xp_events` RLS on with one own-row SELECT policy · `lessons.module_index` backfilled, 0 nulls · `wow_notes.side/kind` present with CHECKs · the 3 RPCs are `SECURITY DEFINER`, `search_path=''`, EXECUTE for `authenticated` + `service_role` only (not `anon`). RPC behavior verified in-transaction: first `lesson_complete` awards, repeating the same `ref_id` returns `awarded:false` with exactly 1 event row; all 9 level boundaries correct both at threshold−1 and at the threshold (`leveled_up` true on each crossing); level stays 10 past 3500; `get_weekly_leaderboard()` and `get_admin_stats()` return correct data; bad event type / xp > 200 rejected; a signed-in caller can't award another user except `comment_upvoted`; `get_admin_stats()` rejects non-admins. **Not yet done: a real browser click-through (onboarding → complete a lesson → XP/level → leaderboard)** — needs a logged-in session (Google OAuth isn't configured yet, Phase 3).

*Migrations (in `supabase/migrations/`, apply to `zgofeajewktwmswckgup` only):*
- `20260930120000_gamification_core.sql` — `xp_events` (+RLS: own-row SELECT only; writes only via the RPC) · `award_xp_and_check_level(p_user_id, p_event_type, p_xp, p_ref_id default null) → jsonb {awarded,new_xp,old_level,new_level,leveled_up}` (SECURITY DEFINER, idempotent per `(user, event, ref_id)` via partial unique index) · `get_weekly_leaderboard()` · `get_admin_stats()` (admin/service-role only) · `lessons.module_index` (backfilled 5 lessons/module, default 1) · `wow_notes.side` / `.kind` (CHECK + defaults).
- `20260930120100_seed_badges_glossar.sql` — 25 badges (from the vision doc; slugs = `tryAward()` = admin `BADGE_CATEGORY`) + 50 glossary terms (curated list from the seed-glossar route). Idempotent. **No quiz/inline-question/wow-note rows seeded.**
- Rename migration `20260804120000_rename_courses_4_12_slugs.sql` moved OUT of `supabase/migrations/` → `devpath-docs/archive/20260804120000_rename_courses_4_12_slugs.sql.SKIPPED` (D1; can no longer run/overwrite C4–6 content).

*Code aligned to the existing schema (no redundant columns added):*
- `users.xp` → `users.xp_points`: `(admin)/admin/users/page.tsx` (select + render).
- `id` selects on tables without `id`: `lesson_bookmarks` + `lesson_feedback` (`courses/[courseSlug]/[lessonId]/page.tsx` → select `user_id`, `.maybeSingle()`), `toggleBookmark` (`courses/actions.ts` → lookup by `user_id`, delete by `(user_id, lesson_id)`), `user_badges` count (`dashboard/page.tsx` → `badge_id`).
- `users.updated_at` dropped from `sitemap.ts` (`lastModified: new Date()`).
- Slug alignment (D1): `src/lib/course-map.ts` COURSE_BANNERS / COURSE_DESCRIPTIONS / palette comments → `python-inginerie-software`, `algoritmi-structuri-date`, `matematica-ai`; `scripts/seed-curriculum.mjs` scope reduced to C7–12 and the 3 old C4–6 slugs added to `PROTECTED_SLUGS` (it can no longer create duplicate C4–6 courses). `scripts/import-all-content.mjs` already used the old slugs.

*Behavior changes:*
- **Idempotent completion** (`markLessonComplete`): pre-checks `user_progress.completed`; already-completed → no upsert, no XP, no badges; first completion passes `lessonId` as `refId` so the DB guard also blocks a concurrent double-submit. `awardXP(userId, event, xpOverride?, refId?)` now returns `awarded`. `xpEarned` is now the truthful amount (0 if the RPC failed or was a duplicate) instead of a constant. Client skips the "+0 XP" toast.
- **Graceful empty anchors:** `<InlineQuestion>` / `<WowNote>` with no matching row now render nothing (dev-only `console.warn`); removed dead `AuthoringErrorBox` from `inline-question.tsx`. (Unknown wow-note *component* refs still show an error box — that's an authoring bug, not empty data.)
- **C7–12 “În curând” (D6):** learner-facing lesson lists now filter `is_published = true` (courses page/map/totals/“continue”, dashboard, roadmap, profile count, next-lesson-after-complete). Courses with 0 published lessons are shown as locked “În curând” cards under the map (`courses-page-client.tsx`) instead of as skeleton nodes.
- **Build:** removed unused `hasWowNotes` destructure (`lesson-content.tsx`); renamed `c3-l6-tcp-vs-udp (2).mdx` → `c3-l6-tcp-vs-udp.mdx` (it is lesson 6, `order: 6` — not a duplicate; importer keys on frontmatter `order`); `.gitignore` now covers the root CV PDFs + portfolio PNGs.

*Deferred / open questions from this phase:*
- **Not done (out of Phase 2 scope):** P2-05 search (`search_vector`), P2-12 perf advisors, P2-14 `reseed_course_lessons` search_path, P2-15 schema.sql/docs refresh, inline-question / wow-note **content** for Course 1 (P2-06 only made the *absence* graceful; the 5 questions + 13 notes must be re-imported or authored), flashcards / quiz_questions seeds.
- **Course 3 has no lesson 7** (files jump l6 → l8; live DB has 24 lessons) — content gap to fill or renumber.
- **`lessons.module_index` defaults to 1 for future inserts** — `reseed_course_lessons` / `seed-curriculum.mjs` / import scripts don't set it (only `import-os.mjs` does). Set it in the seeder when C7–12 are authored.
- ✅ **Level curve fixed (owner, 2026-09-30):** the code's old curve (200/250/500/1000/1750/2750/4000/5500/7500) is replaced by the documented one from `devpath-vision.md` — cumulative XP **0, 200, 400, 700, 1000, 1400, 1800, 2300, 2900, 3500** for levels 1–10. Applied in `LEVEL_THRESHOLDS` (`src/lib/gamification-constants.ts`, which feeds `dashboard/hero-section.tsx` + `profile/profile-hero.tsx`; stale `?? 7500` fallback removed) **and** in `award_xp_and_check_level`. These two copies must stay in sync. Existing users keep their stored `level` (it never decreases; only 1 user, 0 XP).
- `cod_rulat` and `programator_in_formare` badges are seeded (25-badge spec) but nothing awards them yet (`programator_in_formare` depended on the retired `learning_mode`). `course_complete` XP is never awarded either.
- The untracked `devpath-public/` mirror is picked up by the root `tsc`/`next build` type check (it imports `@/lib/*` from `src/`). Any change to shared types can break it — exclude it in `tsconfig.json` or delete it (Phase 7).
- `graphify-out/` is now gitignored (owner, 2026-09-30). `devpath-public/` is still untracked and not gitignored (deferred with the tsconfig exclude).

---

## Phase 3 — Auth

> ✅ **2026-09-30: Phase 3 DONE** (RLS/auth hardening applied and re-tested in a real browser — see "Phase 3 — results & change log" below). It had wrongly been described as done before this date; it was actually run on 2026-09-30. **One open item needs the owner: turn "Confirm email" OFF in the Supabase dashboard (check S1).**

### 🔴 Blockers (security)
- [x] **P3-01 Privilege escalation:** `users` UPDATE policy `USING (auth.uid()=id)` with no `WITH CHECK`, and `authenticated` has UPDATE on every column → any user can `update({role:'admin', plan:'lifetime', xp_points:…})` from the browser (unlocks `/admin`, admin API routes, fake paid plan). Fix: `REVOKE UPDATE ON public.users FROM authenticated, anon` + `GRANT UPDATE (name, avatar_url, goal, learning_goal, profile_type, skill_level, daily_goal_minutes, onboarding_completed, referral_code)` (verify list vs `profile/actions.ts` + `onboarding/actions.ts`); privileged writes via service role/SECURITY DEFINER only. Also revoke INSERT on `users` for anon/authenticated (trigger handles it). Then promote the owner to `admin` via SQL.

### 🟠 High
- [x] **P3-02 PII leak:** policy "Authenticated users can read users" `USING (true)` exposes every user's email, `stripe_customer_id`, `stripe_subscription_id`, role. Fix: restrict to own row; expose leaderboard/public fields via view/RPC (leaderboard RPC from P2-02 can be SECURITY DEFINER).
- [x] **P3-03 Self-award / forge:** `user_badges` INSERT is self-service (any badge); `referral_events` INSERT `WITH CHECK (true)` for public (anon can forge). Fix: drop those insert policies (server uses admin client).
- [x] **P3-15 `award_xp_and_check_level` is client-callable** (new in Phase 2): a signed-in user can call the RPC directly (`supabase.rpc(...)`) to award *themselves* any of the 16 event types repeatedly (each ≤ 200 XP, event type + XP range are validated, awarding to others is blocked except `comment_upvoted`). **Also (found in Phase 4):** `awardXP` / `checkAndAwardBadges` are exported from `src/lib/gamification.ts`, a `"use server"` file, so they are directly callable from the browser as server actions — do NOT "fix" P3-15 by switching them to the service-role client inside that file (any client could then award any user XP); move them to a plain server-only module first. Fix in this phase: revoke `authenticated` EXECUTE and call it only via the service-role client from server actions (or make the one-time events idempotent with `ref_id`), and stop trusting the client-suppliable `p_xp`.
- [~] **P3-04 OAuth setup** (manual dashboard steps, see below) — Google not usable until configured.

### 🟡 Medium
- [~] **P3-05 Email-confirmation not handled:** `signUpWithEmail` (`(auth)/actions.ts:47-54,138`) has no `emailRedirectTo` and always `redirect("/dashboard")`; with confirm-email ON → session null → bounced to `/login` with no message and the link never hits `/auth/callback`. Fix: pass `emailRedirectTo`, show "verifică emailul" when `!data.session`; or turn confirm-email OFF for MVP (D2).
- [x] **P3-06 OAuth errors invisible:** `oauth-buttons.tsx:21,28` ignore the action's `{error}`; `login/page.tsx` never reads `?error=auth_callback_error`. Fix: surface errors (Romanian copy).
- [ ] **P3-07 `NEXT_PUBLIC_SITE_URL`** falls back to localhost (`actions.ts:147`); must be prod URL on Vercel; previews will redirect to wrong host unless derived from request origin.
- [ ] **P3-08 `handle_new_user` fails for OAuth users with null email** (NOT NULL `email`) → "Database error saving new user". Fix: `coalesce(new.email,'')` (or nullable) + `on conflict (id) do nothing`.

### ⚪ Low
- [x] **P3-09** `/auth/callback` open-redirect quirk (`route.ts:13`, `next=@evil.com`) → require `startsWith("/") && !startsWith("//")`.
- [x] **P3-10** `signInWithEmail`/`signUpWithEmail` have no Zod validation; raw English Supabase errors in a Romanian UI; no forgot/reset-password flow.
- [ ] **P3-11** Dashboard guard `if (profile && !onboarding_completed)` skips onboarding when profile is null → use `!profile ||`.
- [ ] **P3-12** Middleware: throws (500 on all routes) if Supabase env missing; redirects to `/login` have no `?next=`; `/admin` not in `PROTECTED_PREFIXES` (layout role check only — safe only after P3-01).
- [x] **P3-13** Advisors: `REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated`; leaked-password protection off (Pro plan only).
- [ ] **P3-14** OAuth signups skip the `devpath_ref` referral cookie (only email path reads it).

**Manual dashboard steps (owner):** Supabase → Auth → URL Configuration: Site URL = prod URL; Redirect URLs: `http://localhost:3000/auth/callback`, `https://<prod-domain>/auth/callback`, `https://*-<team>.vercel.app/auth/callback`. Providers: Google (client ID/secret; Google Cloud redirect URI `https://zgofeajewktwmswckgup.supabase.co/auth/v1/callback`, JS origins localhost + prod); GitHub same callback (or remove button); decide confirm-email (D2).

### Phase 3 — results & change log (2026-09-30)

**Status: DONE, with ONE open item that only the owner can fix — Supabase "Confirm email" is still ON for `zgofeajewktwmswckgup`** (see check S1). Migrations applied on owner approval: `lessons_published_rls` (`20260930130000`) and `phase3_rls_hardening` (`20260930140000`). Code gate: `tsc` 0 errors · lint 0 errors (2 pre-existing warnings) · `npm run build` passes with lint ON, 41/41 pages (built in an isolated copy so the owner's dev server was never touched).

**Security re-test** — run in Playwright as a signed-in NON-admin user, calling PostgREST directly with the user's own access token (exactly what the Supabase browser client does). Evidence: `.qa-screenshots/phase3/01-security-retest.png`. **23 / 23 PASS**, and a follow-up DB query proved nothing changed (role `student`, plan `free`, xp 115 = sum of events, 0 referral rows).

| # | Attack / check | Result |
|---|---|---|
| A1–A7 | PATCH own `users` row: `role='admin'`, `plan='lifetime'`, `xp_points=999999`, `level=10`, `stripe_customer_id`, `streak_count=500`, `referred_by=<other user>` | ✅ all **403** |
| A8 | control: PATCH own `name` (a safe column) | ✅ **200** — the block is targeted, not a blanket break |
| B1 | GET all `users` (`id,email,plan,role,stripe_customer_id`) | ✅ only own row (1) |
| B2 | GET another user's row incl. email | ✅ 0 rows |
| B3 | email-enumeration probe (`ilike` on `email`) | ✅ only own row |
| B4 | GET other users' `user_progress` (lesson ids, scores) | ✅ 0 rows |
| B5 | public-profile RPC for another user | ✅ exactly `id, name, avatar_url, xp_points, level, streak_count` — no email/plan/role |
| C1 | `rpc award_xp_and_check_level` (self-award 200 XP), signed-in | ✅ **403** |
| C2 | same RPC with the anon key | ✅ **401** |
| C3 | INSERT `user_badges` for self | ✅ **403** |
| C4 / C5 | INSERT `referral_events` (signed-in / anon) | ✅ **403 / 401** |
| C6 | INSERT `users` row with `role='admin'` | ✅ **403** |
| C7 | DELETE own `users` row | ✅ **403** |
| C8 | `rpc get_admin_stats` as non-admin | ✅ **403** |
| D1 / D2 | anon: GET `users` / GET unpublished lessons | ✅ 0 rows / 0 rows |
| L1 | anon-key read of unpublished lessons (Phase 4 baseline was **79**) | ✅ **0** (131 published still readable); signed-in user opening an unpublished lesson URL → 404 |

**App still works under the hardened policies (fresh user #2, UI):** login → onboarding wrote all 6 allowed columns via the user session (`skill_level='beginner'`, referral code…) and awarded +50 XP server-side → lesson 1 Complete: XP 50→70 (+15 lesson, +5 streak), streak written server-side, badge `prima_lectie` awarded server-side, auto-advance to lesson 2. The `handle_new_user` trigger still creates the profile row after its EXECUTE was revoked. Dashboard leaderboard / community counts / activity feed and comment authors work through the new RPCs (verified over the API and in the rendered page; the dashboard counters animate up from 0 when scrolled into view).

**Auth UX:**
| # | Check | Result |
|---|---|---|
| S1 | Email + password sign-up gives an immediate session and lands in the app | ❌ **BLOCKED — owner action.** Supabase still requires confirmation: the new user was created **unconfirmed** with `confirmation_sent_at` set and no session (also why the earlier attempt hit "email rate limit exceeded" — built-in SMTP). The code path is ready: with a session it redirects to `/dashboard`; without one it now shows "Ți-am trimis un email de confirmare…" instead of bouncing to `/login`. **To fix: Supabase Dashboard → project `devpath-ro` (ref `zgofeajewktwmswckgup` — check the URL; the old project is `umtecpbixdkumfjsvzcl`) → Authentication → Sign In / Providers → Email → turn "Confirm email" OFF → Save**, then register once more to confirm. |
| S2 | Login with a wrong password | ✅ "Email sau parolă incorecte." (Romanian); shot `02-login-wrong-password.png` |
| S3 | Sign-up server validation (bypassing browser checks) | ✅ Zod message in Romanian ("Numele trebuie să aibă între 2 și 80 de caractere.") |
| S4 | OAuth callback failure surfaces on `/login?error=…` | ✅ "Autentificarea nu a reușit. Încearcă din nou." |
| S5 | Google | ✅ button starts the flow and lands on `accounts.google.com` with the right client, the Supabase callback URI and `/auth/callback` as return. **Not verified: completing a real Google login** (needs the owner's Google credentials). The owner's account already has the `google` provider linked. |
| S6 | GitHub | button removed (D3: GitHub login ships disabled — it could only ever fail) |

**What changed**
- **DB (`20260930140000_phase3_rls_hardening.sql`):** `users` — UPDATE only on `name, avatar_url, goal, learning_goal, profile_type, skill_level, daily_goal_minutes, onboarding_completed, referral_code` (own row, with `WITH CHECK`); no client INSERT/DELETE/TRUNCATE; SELECT own row only (the `USING (true)` policy is gone). `user_badges` / `referral_events` — no client write path. `user_progress` — dropped the policy that let any signed-in user read everyone's progress. New `SECURITY DEFINER` reads for other users' public data: `get_public_profiles(uuid[])`, `get_top_users(int)`, `get_community_stats()`, `get_recent_completions(int)`. `award_xp_and_check_level` — EXECUTE revoked from `authenticated` (service role only). `handle_new_user` — EXECUTE revoked from public/anon/authenticated.
- **Code:** `src/lib/gamification.ts` is no longer a `"use server"` file (its exports were browser-callable server actions with arbitrary arguments) and now writes XP + badges with the service-role client; streak writes (`last_active`, `streak_count`) and the Stripe customer id write also use the service role; removed the unused, browser-callable `applyReferralCode` action; dashboard and comments read other users through the RPCs; `signInWithEmail` / `signUpWithEmail` / `signInWithOAuth` validate with Zod and return Romanian errors (`src/lib/auth-errors.ts`); OAuth buttons show errors and a pending state; `/auth/callback` only redirects to same-site paths; sign-up shows a notice when there is no session.

**Still open / deferred (not part of this prompt):**
- **S1 above (owner: turn "Confirm email" off).**
- P3-07 `NEXT_PUBLIC_SITE_URL` must be the production URL on Vercel; P3-08 `handle_new_user` fails for OAuth users with a null email (only relevant if GitHub is ever enabled); P3-11 dashboard guard when the profile row is missing; P3-12 middleware edge cases; P3-14 OAuth sign-ups skip the referral cookie.
- Other client-writable tables are unchanged and can still be forged by their own owner (no XP/role impact): `user_progress` (`completed`, `score`), `lesson_scores`, `inline_attempts`.
- `pw0930a` / `pw0930b@…` test users (owner's Gmail plus-aliases) and their rows are still in the DB — delete when done. `pw0930b` was marked confirmed via SQL to continue the test.
- Advisors now show only: 6 intentional read-only public-data functions callable by `authenticated`, `reseed_course_lessons` mutable `search_path` (P2-14), and leaked-password protection (Pro plan).

---

## Phase 4 — Core learning flow

Verdict today: browse ✅ · read ⚠️ (C1 L1 shows 18 error boxes) · complete ⚠️ "succeeds" but no XP/level/badges/next-lesson.

### 🔴 Blockers
- [x] **P4-01** *(VERIFIED end-to-end with Playwright 2026-09-30 — see the results below)* Lesson completion is functionally broken → fixed by **P2-01 + P2-03** (+ P2-04 for badges). DB objects are now applied (2026-09-30) and the RPC/idempotency/level logic is verified in SQL; **the browser end-to-end click-through is still pending.**

### 🟠 High
- [x] **P4-02 Double XP on re-completion** (`courses/actions.ts:80-102`): upsert has no "already completed" check → `awardXP` + badge checks run on every call (second tab / double-click). Fix: read existing `user_progress.completed` first, skip XP if true (or make RPC idempotent per user+lesson).
- [x] **P4-03 First-lesson experience** — see **P2-06** (anchors without rows).
- [x] **P4-04** *(no live paywall exists: `Sidebar` / `CourseCard` are not rendered anywhere and `is_free` gates nothing; every published course and lesson is open — MVP decision)* **Free-tier/paywall is UI-only and wrong:** sidebar/course card lock on `!course.is_free` ignoring `user.plan` (Pro/Lifetime buyers stay locked); `lessons` RLS `true` for anon incl. unpublished + `content_md`; `lessons.is_free` false everywhere. MVP decision needed: ship everything free (remove lock UI) vs. implement gating. **Recommendation:** for MVP, unlock everything published; hide unpublished from RLS.

### 🟡 Medium
- [~] **P4-05** *(learner-facing lists, next-lesson and counts are now published-only; the RLS migration `supabase/migrations/20260930130000_lessons_published_rls.sql` is WRITTEN but NOT APPLIED — awaiting owner approval; baseline: the anon key can read all 79 unpublished lessons)* **Unpublished lessons with content are reachable by URL** (RLS public read); "continue"/"next lesson" fallbacks (`courses/page.tsx:144`, `dashboard/page.tsx:199`) can point at unpublished lessons; C7–12 lessons counted in totals. Fix: RLS `is_published = true` (admin bypass) + filter counts.
- [x] **P4-06** `course-map.ts` slug keys — see **P2-07/D1**.

### ⚪ Low
- [ ] **P4-07** Sequential locking in course map is UI-only (URL bypass) — acceptable for MVP.
- [ ] **P4-08** `sync-action.ts` is admin-gated but only useful in dev; legacy slugs (`ai-fundamentals`, `prompt-engineering-practic`) no longer exist → remove/update (also `api/admin/sync-prompt-engineering`).

**Verified OK:** dashboard/courses/lesson-viewer render for a zero-progress user (no `.single()` crashes, division guarded); 404 for bad slug/uuid; prev/next edges; RLS present on `user_progress` (insert/update + UNIQUE(user_id, lesson_id)); onboarding columns match (`skill_level` text).

### Phase 4 — results & change log (2026-09-30)

**Test setup.** Dev server = the owner's own `next dev` on :3000 (reused, not restarted; the production build was verified in an isolated copy so `.next` was never touched). Playwright MCP against `http://localhost:3000`. Screenshots: `.qa-screenshots/phase4/*.png` (gitignored). **Sign-up through the UI could not be tested**: Supabase answered "email rate limit exceeded" (built-in SMTP; see the Phase 3 note) — so the test user (`pw0930a@…`, id `75b000e5-…`) was created pre-confirmed via the Admin API against `zgofeajewktwmswckgup`, and everything else went through the UI (login → onboarding → lessons). **The test user and its rows are still in the DB — delete when done** (`auth.admin.deleteUser`; rows cascade).

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | Login (email/password); dashboard guard sends a fresh user to onboarding | ✅ PASS | `/login` → `/dashboard` → `/onboarding` |
| 2 | Onboarding, 4 steps incl. AI welcome message, "Să începem!" → dashboard | ✅ PASS | `users`: onboarding_completed, profile_type, learning_goal, skill_level='beginner' (text), referral_code set; `xp_events`: onboarding_complete +50 (the RPC call that used to fail silently) |
| 3 | Dashboard reads real data | ✅ PASS | XP, "Nivel 1 — Curios 100 / 200 XP" (corrected curve), streak, lessons N/131 (published only), weekly dot on today (Wed), per-course % + "Începe: …" (0%) / "Continuă: …" (progress), badge count; shots 03, 10, 11 |
| 4 | Course map: order, completed vs remaining, hero CTA | ✅ PASS (fixed) | hero said "Continuă de unde ai rămas" at 0 progress → now "Începe prima lecție" until progress > 0; shot 04 |
| 5 | Locked courses 7–12 | ✅ PASS | dashboard: 6 inert "În curând" cards (no link, no %) + 6 link cards; map: "În curând" section, no skeleton nodes |
| 6 | Lesson viewer renders Course 1 L1 (18 anchors with no rows) | ✅ PASS | 0 error boxes, 0 console errors (dev-only "rendering nothing" warnings now deduped to once per anchor); shot 05 |
| 7 | Complete is gated on read-to-end, then click works | ✅ PASS | button disabled until ≥90% scroll; celebration overlay; shot 07 |
| 8 | XP / streak / badge / progress after Complete | ✅ PASS | XP 50→70 (+15 `lesson_complete` with the lesson as `ref_id`, +5 `streak_daily`); streak 1, last_active today; `user_progress` row; badge `prima_lectie`; `primul_modul` also fired later (lesson 21 is alone in module 5 — proves `module_index`) |
| 9 | Exactly-once XP | ✅ PASS | double-click Complete on L2: XP +15 once, 1 event for that lesson, no 2nd `streak_daily`; final tally: 4 completions = 4 `lesson_complete` events, 0 duplicated `ref_id`, sum(events) = xp_points = 115 |
| 10 | Next lesson within a course | ✅ PASS | auto-advance L1 → L2 → L3 |
| 11 | Next lesson across a course boundary | ✅ PASS (new) | last C1 lesson: CTA, button and auto-advance → `/courses/sisteme-de-operare/<first lesson>` |
| 12 | End of the published curriculum | ✅ PASS (new) | last C6 lesson: no "next" link (skips coming-soon C7–12); follow-up button → `/courses?c=matematica-ai` |
| 13 | Leaderboard shows the user | ✅ PASS | "Phase4 Tester — 85 XP" (weekly RPC); shot 06 |
| 14 | ALL 131 published lessons (C1–6) render | ✅ PASS after fix | in-browser crawl with a real session: 128/131 clean on the first pass; **3 Course-3 lessons failed MDX compile** ("Unexpected character `1` before name" — a literal `<1ms` / `<5` in prose) and would have been **500 crashes** on the old code → now repaired automatically (see changes); re-crawl 131/131: HTTP 200 + title, 0 error pages, 0 raw-text fallbacks |
| 15 | Real-browser render of sampled C4 / C5 / C6 lessons | ✅ PASS | C4 "Sintaxa…" (7 code blocks, 2 tables), C5 "Grafuri…" (KaTeX), C6 "Derivata…" (30 KaTeX, 0 KaTeX errors); 0 console errors; shots 08, 09 |
| 16 | Anon must not see unpublished lessons | ⏳ PENDING APPROVAL | baseline with the anon key: sees all 79 unpublished lessons, direct read by id = VISIBLE. Migration written, not applied |
| 17 | `tsc` / lint / `npm run build` | ✅ PASS | tsc 0 errors · lint 0 errors (2 pre-existing warnings) · build passes with lint ON, 41/41 pages (built in an isolated copy) |

**Changes made:**
- `src/lib/next-lesson.ts` (new): next published lesson, else the first published lesson of the next course that has any. Used by the lesson page and by `markLessonComplete`, which now also returns `nextCourseSlug`; plumbed through `complete-button`, `lesson-page-client`, `lesson-keyboard-nav`.
- Lesson page: 3-tier MDX compile (as written → `escapeStrayAngleBrackets` retry in `src/lib/mdx-sanitize.ts`, prose only, code untouched → raw-text fallback with a notice); published-only prev/next.
- `LessonErrorBoundary` (new) around the MDX renderer: if a custom component throws, the Complete button and navigation stay usable.
- Dashboard `courses-section`: coming-soon cards are inert, "Începe"/"Continuă" wording, cards link straight to the learner's next lesson. Courses hero wording. Dev-only anchor warnings deduped.
- Migration `supabase/migrations/20260930130000_lessons_published_rls.sql` — written, NOT applied.

**Findings / not changed (owner decisions or later phases):**
- **Map progression lock:** the course map still shows sequential "🔒 Blocat" on later lessons and course gates until earlier ones are done (pre-existing progression design). Every published lesson is reachable through the dashboard "Începe" links and by URL. If "free courses fully open" should also mean an unlocked map, that is a product change — say so.
- Hero pills hardcode "12 cursuri" / "12 Boss Fights" (`TOTAL_COURSES`) although 6 courses are coming soon; the dashboard Roadmap section shows C7–12 as "0 lecții / Completează cursul anterior" `[polish]`.
- `primul_modul` fires for a module that consists of a single lesson (lesson 21 of C6 is module 5 on its own). Cosmetic.
- Sign-up/login errors are raw English Supabase strings; Supabase rejects `example.com` / `.test` email domains — use a real domain for QA.
- The level-3 comment gate is now reachable (400 XP); comments were not exercised this phase.

---

## Phase 5 — Secondary pages & gamification

### 🔴 Blockers
- [x] **P5-01** Badges/XP/level/leaderboard/admin stats — covered by **P2-01/02/04**. DB objects applied 2026-09-30 (RPC logic + seeds verified in SQL); re-verify the pages in the browser.

### 🟠 High
- [ ] **P5-02 Stripe checkout trusts client `planType`** (`api/stripe/checkout/route.ts:9-12`): user can pay the cheap price ID with `planType:"lifetime"`; webhook trusts `metadata.planType`. Fix: map `planType` → server-side price ID, ignore client `priceId`. (Only if payments are in MVP — D4.)
- [ ] **P5-03 Search (Cmd+K)** — see **P2-05**.

### 🟡 Medium
- [x] **P5-04 Public profile `/u/[username]`:** `resolveUser` (`page.tsx:60`) falls back to `ilike email '${username}@%'` with unescaped `%`/`_` → `/u/%25` matches first user; exposes email-derived names with no opt-in. Fix: match `referral_code` only / escape wildcards.
- [x] **P5-05 Module-load throws:** `api/push/send/route.ts:10-25` throws at import if VAPID keys missing → can fail Vercel build ("collect page data"). Make lazy. `lib/stripe.ts` uses `new Stripe(process.env.STRIPE_SECRET_KEY!)` at top level (every call fails if unset). Resend is lazy but cron routes 500 without `RESEND_API_KEY` (not in try/catch).
- [ ] **P5-06 Stripe webhook** handles only `checkout.session.completed` + `customer.subscription.deleted`; needs prod `STRIPE_WEBHOOK_SECRET` (local one is CLI's). No billing portal (known).
- [x] **P5-07 Crons:** need `CRON_SECRET` in Vercel (fail closed 401 otherwise); `streak-check` emails only users with a `notification_preferences` row (rows aren't auto-created); crons need `RESEND_API_KEY`. Consider disabling crons in `vercel.json` for MVP.
- [ ] **P5-08 Sitemap** — hardcoded `devpath.ro`, broken user URLs (see P2-09).
- [x] **P5-09 `glossar` seeding route can't work** (RLS) — see P2-04; flashcards/interview/dashboard flashcard stats empty until seeded.

### ⚪ Low
- [ ] **P5-10** `/pricing/success` doesn't verify the session (cosmetic); `sync-prompt-engineering` route useless in prod (delete).
- [ ] **P5-11** `/dev/components` correctly redirects outside development (but page still ships in the bundle: 191 kB — fine).

**Verified OK:** middleware protection matrix; `/verify/[code]` (admin client + UUID validation); `/admin` gated by layout role check (after P3-01); Cosmo/toasts fail safe; pricing price IDs inlined.

### Phase 5 — results & change log (2026-09-30)

**Status: DONE.** Code gate: `tsc` 0 errors · lint 0 errors (2 pre-existing warnings) · `npm run build` passes with lint ON, 41/41 pages — built in an isolated copy whose `.env.local` had **only** the required vars (Supabase, site URL, OpenAI), i.e. with Stripe / VAPID / Resend / `CRON_SECRET` all absent, so it also proves nothing needs those keys at import or build time. The owner's `next dev` on :3000 was reused and never restarted. Screenshots: `.qa-screenshots/phase5/*.png` (gitignored).

**Playwright run** — signed in through the UI as test user `pw0930a` (Phase4 Tester: 115 XP, 4 lessons, 2/25 badges), plus `pw0930b` for the streak/badge moment. **Every page: 0 console errors** (the only console "errors" in the run are the browser logging the deliberate 404 / 403 responses from probe requests).

| # | Page / check | Result | Evidence |
|---|---|---|---|
| 1 | `/dashboard` | ✅ PASS | real XP / level / streak / 4-of-131 lessons, 6 link cards + 6 "În curând", community + leaderboard sections; shot 01 |
| 2 | `/courses` | ✅ PASS | "4 / 131 lecții", hero CTA, 6 coming-soon cards; shot 02 |
| 3 | a lesson (C4) | ✅ PASS | 7 code blocks, Complete button; shot 03 |
| 4 | Badges (section on `/profile`) | ✅ PASS | all **25** badges: 2 earned in colour (🌱 Prima Lecție, 📦 Primul Modul), **23 locked** greyed with lock icons, all 25 names unique + all icons present, header "2/25 câștigate"; shot 05 |
| 5 | `/profile` | ✅ PASS | level/XP/streak/"2 din 25 insigne"/"4 din 131 lecții", activity heatmap from `user_progress`, **Learning DNA radar (6 course axes)**, **"Cursuri terminate: 0 din 6 disponibile"**; shot 04 |
| 6 | `/leaderboard` | ✅ PASS | weekly RPC: Phase4 Tester 115 (🥇, highlighted "TU", `aria-current`) / Bogdan 100 / Phase3 Tester 70; shot 06. Empty-state and RPC-error branches are code-verified only (data was non-empty) |
| 7 | `/glossar` | ✅ PASS | **50** terms (stat card = 50), search "gradient" → 2 (ReLU, Gradient Descent), nonsense query → empty state, Python filter → 5, "Toate" → 50, expanding a term shows its definition; shot 07 |
| 8 | Public `/u/V69D7E33` **signed out** | ✅ PASS | no login redirect; level/XP/streak, stats, heatmap, 6-axis radar, "Badge-uri câștigate (2/25)", no email leaked; shot 08 |
| 9 | `/u/…` LIKE-wildcard probes | ✅ PASS | `/u/%25`, `/u/marebogdan%2503`, `/u/marebogd_n03`, `/u/marebogdan03%25`, backslash, spaces → all **404** (previously `/u/%25` matched the first user); valid handles (referral code, email local-part incl. `+` literal and `%2B`, owner's) → **200**; unknown → 404; malformed `%E0%A4%A` → Next itself answers 400 |
| 10 | XP toast + Cosmo celebration | ✅ PASS | "+15 XP" toast and "Știam eu că poți!" overlay with Cosmo + confetti on completion |
| 11 | Streak toast | ✅ PASS | user with a 2-day streak → completing today: "🔥 STREAK 3 ZILE" toast (Cosmo excited); DB: streak 3, `streak_3_days` +20 XP, badge `trei_zile`; shot 09 |
| 12 | Badge toast | ✅ PASS | "BADGE DEBLOCAT! Primul Modul" toast; DB shows `primul_modul` + `trei_zile` awarded server-side; shot 09 |
| 13 | Level-up at the correct threshold | ✅ PASS | 175 XP → complete → **190 XP: level 1, no level-up shown**; complete again → **205 XP: level 2**, overlay "LEVEL UP! Explorator — Mintea ta a început să exploreze. Continuă!" with Cosmo celebrating; DB level 2, Σ events = xp; shot 10 |
| 14 | Optional features with keys missing | ✅ PASS | see table below |
| 15 | `tsc` / lint / `npm run build` | ✅ PASS | as above |

**Optional features with NO Stripe / VAPID / Resend / CRON_SECRET** (production build served on a separate port; then a second instance with only `CRON_SECRET` set):

| Request | Result |
|---|---|
| `POST /api/stripe/checkout` (anon) | **503** `{disabled:true, feature:"payments", error:"Plățile nu sunt disponibile momentan."}` — the pricing UI already shows `data.error` |
| `POST /api/stripe/webhook` | **503** payments disabled |
| `POST /api/push/send` | **503** push disabled (no `CRON_SECRET`) |
| `GET /api/cron/streak-check`, `/weekly-email` | **503** cron disabled |
| `POST /api/push/subscribe` (anon) | 401 (unchanged — needs no VAPID) |
| `/pricing`, `/`, `/login` pages | 200 |
| with `CRON_SECRET` set: cron, wrong secret | 401 |
| with `CRON_SECRET` set: cron, right secret, no Resend | **200** `{ok:true, skipped:"email_disabled"}` (a Vercel cron won't show as failing) |
| with `CRON_SECRET` set: `push/send`, right secret, no VAPID | **503** push disabled (VAPID keys missing) |
| with `CRON_SECRET` set: `push/send`, wrong secret | 401 |

**What changed**
- **Optional features can't crash anything:** new `src/lib/optional-features.ts` (`disabledResponse`, `isCronConfigured`, `hasValidCronSecret`); `src/lib/stripe.ts` is now a lazy `getStripe()` (returns `null` without a key); `src/lib/email/resend.ts` gained `isResendConfigured()`; `push/send` no longer throws at import (VAPID is checked per request — this was a Vercel-build risk, P5-05); checkout answers "disabled" before auth and no longer 500s on a bad JSON body; both cron routes check config first.
- **Public portfolio `/u/[username]`:** handle is decoded once and must match `[A-Za-z0-9._+-]{1,64}`; the email-local-part fallback escapes `\ % _` in the `ilike` and requires exactly ONE match (an ambiguous local-part now 404s instead of showing a random account); radar + completed courses are now **per course** (the old radar grouped lessons by a stale 6-module scheme — "Bazele AI"… — that no longer matches the curriculum); only **published** lessons count; badge section always shows "earned/total".
- **`/profile`:** added the Learning DNA radar and the completed-courses card (shared logic in `src/lib/portfolio-data.ts`); lesson totals count published lessons only.
- **`/leaderboard`:** highlights the current user ("TU"), shows an RPC-error banner separately from the empty state, and a hint when the user isn't in the top 10.
- **Gamification never crashes a page:** new `GamificationBoundary` wraps the celebration overlay and the XP / streak / badge toasts (a failure is dropped silently, lesson + Complete button keep working); both `canvas-confetti` calls go through `safeConfetti()`.
- `tsconfig.json` now excludes the untracked `devpath-public/` mirror (it imports `@/lib/stripe` from the real `src/` and broke `tsc` / `next build` once Stripe became lazy). This was a deferred item, pulled forward because it was blocking the clean gate.

**Left open / notes**
- `LevelUpToast` (`components/gamification/level-up-toast.tsx`) is still unused — the level-up moment is the celebration overlay's "LEVEL UP!" card, which fires at the right thresholds; nothing else needed.
- `[polish]` The bottom-right streak toast is partly covered by the floating "AI Coach" button; the hero pills still say "12 cursuri / 12 Boss Fights".
- **`vercel.json` still registers the two crons.** Until `CRON_SECRET` is set they will answer 503 daily (harmless, but noisy in Vercel's cron log) — either set `CRON_SECRET` (+ `RESEND_API_KEY` to actually send) or remove the `crons` block for the MVP. Owner decision.
- P5-02 (Stripe checkout trusts the client's `planType`) is untouched — Stripe is out of MVP scope; fix before ever enabling payments. P5-03 Cmd+K search (`search_vector` missing) and P5-06 webhook events are also untouched. Public profiles are still opt-out-less: anyone with a referral code / email local-part can view the public page (P5-04's privacy opt-in is not built; the wildcard bug is fixed).
- Test-data manipulation on test users (not real users): `pw0930b` streak set to 2 / `last_active` yesterday; `pw0930a` got one synthetic `quiz_perfect` +60 XP event (xp_points and the event log stay consistent). Both test users and their rows remain in the DB — delete when done.

---

## Phase 6 — AI provider switch (OpenAI → Anthropic)  ✅ DONE (2026-09-30)

**Result:** all text AI runs on Claude through the Vercel AI SDK; voice is 100% browser-side. The app needs **only `ANTHROPIC_API_KEY`** — nothing needs `OPENAI_API_KEY` at import, build or runtime.

**Model & package**
- Single source of truth: `src/lib/ai/model.ts` → `AI_MODEL = "claude-haiku-4-5"`, `aiModel = anthropic(AI_MODEL)`, `isAIConfigured()` (`Boolean(process.env.ANTHROPIC_API_KEY)`). To change model, edit that one constant. The key is read lazily by the SDK at request time, so import/build never needs it.
- Installed `@ai-sdk/anthropic@^0.0.56` (0.0.x line; its `@ai-sdk/provider` 0.0.26 / `provider-utils` 1.0.22 are the same ones `ai@3.4.33` uses). `ai`, `@ai-sdk/react`, `@ai-sdk/openai` untouched (`@ai-sdk/openai` is still in `package.json`, now unused).
- Owner asked for the AI-SDK provider + Haiku; I followed that (not the official `@anthropic-ai/sdk` / Opus default). `claude-haiku-4-5` is an alias (no date suffix) and supports forced tool use, which `generateObject` needs.

**Routes** (`"ai"` added to `OptionalFeature`; each returns `disabledResponse("ai", "AI indisponibil momentan.")` = 503 before calling the model when the key is missing; each keeps its `runtime`)
- `api/ai/chat` — `streamText({ model: aiModel, … })`; upstream failure → 502.
- `api/ai/coach-session` — `generateText` in try/catch → 502.
- `api/ai/generate-quiz` — `generateObject` + Zod kept, now in try/catch → clean JSON 502 ("Nu am putut genera întrebările acum…"). The AI-off guard sits *after* the cached-questions lookup, so an already-generated quiz is still served with AI off.
- `api/onboarding/welcome-message` — `generateText` in try/catch → 502; bad JSON body no longer 500s. The onboarding step already falls back to a static greeting.
- `api/ai/coach-sessions` (GET) now also returns `aiEnabled`, so the coach shows its disabled state up front.

**Voice → browser** (`window.speechSynthesis` / Web Speech API)
- `hooks/use-speech-synthesis.ts` rewritten: `ro-RO`, prefers an installed `ro` voice, strips markdown/code, speaks sentence-sized chunks (Chrome cuts long utterances at ~15 s), token guard so a cancelled utterance can't flip state. Same public interface (`speak/stop/isSpeaking/isSupported`).
- ⚠ **Premise correction:** the prompt said STT was already browser-based. It wasn't — `use-speech-recognition.ts` recorded audio and posted it to `/api/ai/stt` (OpenAI Whisper). Deleting that route would have broken the mic, so the hook was **reimplemented on the browser Web Speech API** (`ro-RO`, push-to-talk contract kept, new `error` field with Romanian messages, forced-stop timeout so the UI can't stay stuck on "listening"). Caveat: recognition quality/availability depends on the browser (Chrome/Edge/Safari OK; Firefox has none → mic hidden).
- Both hooks detect support after mount (server and first client render agree → no hydration mismatch).
- Deleted `src/app/api/ai/tts/route.ts` and `src/app/api/ai/stt/route.ts`.
- `ai-coach-chat.tsx` (minimal): friendly banner "AI Coach este indisponibil momentan…", input / send / mic / quick-actions disabled when AI is off, generic error text no longer mentions OpenAI keys, voice-error line under the mic.

**Verification**
| Check | Result |
|---|---|
| `npx tsc --noEmit` | 0 errors |
| `npm run lint` | 0 errors (2 pre-existing warnings: coach `useEffect` dep, certificate `<img alt>`) |
| `npm run build` (isolated copy, lint ON, env = Supabase vars only — **no** `ANTHROPIC_API_KEY`, **no** `OPENAI_API_KEY`) | passes |
| `grep` in `src/` for `OPENAI_API_KEY`, `@ai-sdk/openai`, `openai(`, `/api/ai/tts`, `/api/ai/stt`, `gpt-4o` | 0 matches |
| Key absent, browser: 4 AI routes | 503 `{ok:false,disabled:true,feature:"ai",error:"AI indisponibil momentan."}`; `/api/ai/tts` + `/stt` → 404 |
| Key absent, coach UI | disabled banner, disabled input/mic, no crash (`.qa-screenshots/phase6/01-coach-disabled-state.png`) |
| Direct SDK call with a deliberately invalid key | Anthropic answers **401 "API key is invalid"** → provider, model id and SDK wiring reach the real API |
| TTS hook (real `speechSynthesis`, utterances intercepted) | chunks ≤ 147 chars, markdown/code stripped, all `ro-RO`, stale `onend` ignored, `stop()` resets, 0 network requests |
| STT hook (fake `SpeechRecognition`) | interim → final transcript, `lang=ro-RO`, stop → end resets, stuck-stop force-aborts after 2.5 s, `not-allowed` / `no-speech` → Romanian messages, `aborted` silent |

**Follow-up fix (2026-09-30): coach 400 on long lessons.** `api/ai/chat` capped `lessonContent` at `.max(8000)` although the prompt only ever uses the first 4000 chars (`contentSnippet`), so real lessons >8000 chars (e.g. "Cum funcționează ecranul telefonului tău?", 9740) got 400 `too_big`. Now the route accepts `.max(50000)` (internal 4000-char slice unchanged) and `ai-coach-chat.tsx` sends `lessonContent.slice(0, 8000)`. Verified with the owner's `ANTHROPIC_API_KEY` in place: 20 000-char payload → 200 + streamed Claude reply; 50 001 chars → still 400; UI on the 9740-char lesson, "salut" → real Romanian reply that references the lesson. tsc 0 · lint 0 errors · isolated build passes with lint on.

**Still not verified (needs the owner)**
- Real quiz generation and welcome message with the key (the coach reply is confirmed working).
- Real microphone recognition and a real Romanian voice — test manually in Chrome (needs mic permission + internet for recognition).

**Owner to-do**
- Add `ANTHROPIC_API_KEY` to `.env.local` and to Vercel env.
- `.env.example` still lists `OPENAI_API_KEY` (rule: file not modified) — swap that line for `ANTHROPIC_API_KEY` when convenient.
- `@ai-sdk/openai` can be uninstalled whenever you like.
- Scratch build folder `C:\DevPath-RO-build6` (outside the repo) could not be removed by me (path protected) — delete it manually. Its `.env.local` copy was already deleted.

---

## Phase 6b — 5 features stability (original checklist)

- [x] **F1 Python exec ✅ (2026-10-01):** Pyodide only (D5). Runs in a Web Worker (`src/workers/pyodide.worker.ts`, loaded via `new Worker(new URL(...))`, Pyodide v0.27.0 from the CDN, micropip/numpy/matplotlib preloaded once). `use-pyodide.ts` enforces a 10 s run timeout (`PYTHON_RUN_TIMEOUT_MS`, clock starts after Pyodide has loaded) → `worker.terminate()` + a fresh worker warmed up for the next run, message “Codul a rulat prea mult (posibil buclă infinită) — oprit după 10 secunde.”. The editor's Stop button (AbortSignal) now terminates the worker too. Runs are serialised through one queue. Piston route `api/execute-code` + `executionMode`/lesson-13 routing removed. `CodeEditor` was already `dynamic(..., {ssr:false})` in `mdx-components.tsx`. Browser-tested: print/loops, matplotlib plot, Python error, `while True: pass` (stopped at 10.0 s, tab stayed responsive, next run OK), Stop.
- [x] **F2 Adaptive quiz ✅ (2026-10-01):** `generateObject` is guarded (502) and the regenerate button is `disabled={loading}`. New: a generation failure (non-2xx/network) **or an empty/malformed question list** now shows “Nu am putut genera întrebări acum. Încearcă din nou.” + a “Încearcă din nou” button (retries the same mode that failed); only well-formed questions are rendered. ⚠ Still dormant in the live app: no `quiz` lesson type / 0 `quiz_questions`, so `QuizSection` (the only mount point) is unreachable — decide hide-vs-seed later. ⚠ With no wrong answers the prompt is a fixed generic one and **regenerate returns the same 3 questions** (really calls Claude, ~14 s) — product call, not changed.
- [x] **F3 NN visualizer ✅ (2026-10-01):** renders, neuron-count and input sliders work, “Run Forward Pass” updates the activations; 0 console errors (QA'd on a harness page — no DB lesson contains a `neural-network-viz` block).
- [x] **F4 Voice coach:** now fully browser-side (Phase 6 above) — no server routes, no file-size/API-failure concerns left. Needs a manual Chrome check with a real mic.
- [x] **F4 spoken output removed (2026-10-01, owner request):** no TTS/sound in the AI Coach — speaker/mute button, auto-read of replies and stop-on-close removed from `ai-coach-chat.tsx`; `hooks/use-speech-synthesis.ts` deleted. Mic (speech-to-text via `use-speech-recognition`) kept: voice question → text reply.
- [x] **F5 Presence ✅ resilient (2026-10-01):** `lesson-presence.tsx` now guards subscribe/track/send/callbacks, ignores late callbacks after unmount, removes the channel on failure (stops supabase-js's reconnect loop) and on unmount, warns once, and renders nothing on failure. Also fixed a real bug found in QA: the same user on 2 tabs produced duplicate presence entries → React “two children with the same key” console error; the list is now de-duplicated by `user_id`. 2-user test OK (each sees “1 student studiază acum”, avatars shown, drops to “Ești singurul online” when the other leaves).
- [ ] **AI Coach 🟠 (cost) — STILL DEFERRED by the owner:** no rate limiting on `ai/chat`, `ai/generate-quiz`, `coach-session`, `onboarding/welcome-message` (open Anthropic spend once public; tts/stt routes no longer exist). Add a simple per-user daily counter (DB) at minimum. (The old `execute-code` limiter is gone with the route.)
- [ ] **API robustness 🟡:** bare `await req.json()` (checkout, welcome-message; execute-code route removed) → 500 on bad JSON; AI-call try/catch → 502 ✅ done in Phase 6 (chat, coach-session, generate-quiz, welcome-message); `checkout` bad-JSON still open.
- [ ] **Latent 🟡:** `@ai-sdk/react ^3.0.136` paired with `ai ^3.4.33` (mismatched major lines; builds, but risky) — do not change without approval.

### Phase 6 — CLOSED ✅ (2026-10-01) — end-to-end QA on the new env (Claude key set)

Playwright against an isolated copy (`next dev -p 3100`; your `.next` untouched), signed in through the UI. QA users `marebogdan03+qa1001a/b` were created pre-confirmed via the Admin API and **deleted afterwards** (+ their rows).

| Feature | Result |
|---|---|
| F1 Python | ✅ print/loop, matplotlib plot (PNG rendered), Python traceback, `while True: pass` killed at 10.0 s with the Romanian message (tab stayed responsive), Stop → “Execuție oprită.”, next run OK. 0 console errors |
| F2 Quiz | ✅ questions generated by Claude (~15 s), answer + explanation, regenerate works (disabled while loading); forced 502 and forced empty list → friendly fallback, retry recovers. Only console “errors” = the browser's own “Failed to load resource 502” line for the 502 I injected |
| F3 NN visualizer | ✅ renders, controls work, 0 errors |
| F4 AI Coach | ✅ Claude text reply (~4 s), **no** speaker/mute button, 0 `speechSynthesis.speak` calls, 0 audio plays; mic button present. ⚠ Headless Chromium has no speech backend (`start()` fires neither `onstart` nor `onerror`), so the mic → transcript → auto-submit → Claude-reply path was verified with a **stubbed** `SpeechRecognition`; a real-mic check in Chrome is still the owner's to do |
| F5 Presence | ✅ 2 users see each other; same user in 2 tabs OK (after the dedupe fix); Realtime unavailable (server closes the socket / WebSocket constructor throws) → lesson fully renders, presence renders nothing, exactly 1 warning, 0 errors, 1 connection attempt in 15 s (no reconnect loop) |
| Onboarding welcome | ✅ Claude message (200, ~3 s, personalised), 0 errors, wizard completes → dashboard |

Gate: `npx tsc --noEmit` 0 · `npm run lint` 0 errors (2 pre-existing warnings) · `npm run build` passes with lint ON (isolated copy).
Docs refreshed: `CLAUDE.md`, `PROJECT-STATE.md` (no Piston / OpenAI-TTS; Anthropic text AI; Pyodide-only in a Web Worker; no TTS, mic kept). Stale mentions remain only in `.claude/skills/devpath-ro-patterns/SKILL.md` (not touched).
Leftover test data: 3 `ai_generated_questions` + 1 `ai_coach_sessions` row on test user `pw0930a` (harmless; goes away when that user is deleted).
**AI rate-limiting remains deferred (owner decision).**


---

## Phase 7 — Error/loading states + mobile + production build

### 🔴 Blockers
- [x] **P7-01 `npm run build` fails** on ESLint error `src/components/course/lesson-content.tsx:58` — `'hasWowNotes' is assigned a value but never used`. Fix: drop from destructuring (or `_hasWowNotes`). Vercel would fail the deploy. *(Highest-value 1-line fix — do first in Phase 7 or earlier.)*

### 🟠 High
- [x] **P7-02** `content/courses/retele-internet/c3-l6-tcp-vs-udp (2).mdx` — duplicate/badly named file (space + "(2)"), and `c3-l7` is missing (l6 → l8). Rename/dedupe before any import; check import scripts.
- [x] **P7-03** Repo root clutter untracked (`*.png`, `*.pdf` CVs, `graphify-out/`, `devpath-public/`, `edunext-work.png`…) → `.gitignore` or delete so they don't get committed/deployed (personal CVs must not go public).

### 🟡 Medium
- [x] **P7-04 ✅ (Phase 7A, 2026-10-01)** `global-error.tsx` added; `error.tsx` added to `(admin)`, `(auth)`, `/onboarding`, `/pricing`, `/u/[username]`, `/verify/[code]` (all via the shared `components/ui/error-state.tsx`); `loading.tsx` added for `/u/[username]`, `/pricing`, `/onboarding`, `(admin)/admin`. Details + QA below.
- [x] **P7-05 ✅ (Phase 7B, 2026-10-01)** Mobile pass at 375px done — see "Phase 7B" below (landing, login, register, dashboard, courses/course map, lesson incl. AI Coach + code editor + table, profile, leaderboard, glossar, pricing, /u/[username]; also interview, portfolio, roadmap, flashcards, notifications).
- [x] **P7-06 ✅ already in place (verified 2026-10-01)** `CodeEditor` (Monaco + Pyodide worker client) and `NeuralNetworkVisualiser` are `dynamic(..., { ssr:false })` with loading fallbacks in `components/mdx/mdx-components.tsx`; Pyodide itself is loaded in a worker from the CDN. Nothing further needed. (Lesson First Load JS 361 kB unchanged.)
- [ ] **P7-07** `content/` read via `fs` in `sync-action.ts` and `api/admin/sync-prompt-engineering` — not traced on Vercel (needs `outputFileTracingIncludes`), but lesson viewer reads DB only. Remove or ignore these dev-only paths.
- [ ] **P7-08** `/api/certificate/[courseSlug]` uses `@react-pdf/renderer` (Node) — watch Vercel function size (250 MB unzipped) after first deploy.


### Phase 7A — loading skeletons + error boundaries ✅ DONE (2026-10-01)

**Skeletons realigned to the CURRENT layouts** (real page vs skeleton compared side by side at 1440×1000, dark). The old ones were written for an older design: dashboard (had a "continue" card + list grid that no longer exist; real page = full-height hero + "Ce poți face" section), courses (stat row + course selector + serpentine that no longer exist; real = CoursesHero + CourseMap), interview (showed the in-progress card; real landing = one card with intro + 5 categories + CTA), portfolio (2-col radar/badges; real = single column, 4:1 sections), notifications (one card; real = 2 sections of toggle rows), lesson (680px column, sticky bottom bar removed). Profile, glossar, flashcards, roadmap, leaderboard were close and were tuned to the real sizes (stat card = icon/number/label/sub ≈ 165px, hero ≈ 145/185px, rows 46/66px, …).
- Primitives: `ui/skeleton-card.tsx` now builds on the single `ui/skeleton.tsx` `Skeleton` (it had its own shimmer duplicate) and holds the shared composites `StatCardSkeleton` (real StatCard shape), `PageHeroSkeleton` (+`ring`), `PortfolioSkeleton` (private /portfolio **and** public /u/[username]). Used by glossar/flashcards/roadmap/profile/portfolio/u. ⚠ the dev showcase's `StatCardSkeleton` look changed accordingly.
- **Real finding fixed:** Next shows the *outermost new* `loading.tsx` when entering a subtree, and `<Link>` prefetch stops at the first loading boundary → opening a lesson from outside `/courses/*` (dashboard, roadmap, …) showed the **courses-map skeleton**, never `[lessonId]/loading.tsx` (that one only wins lesson→lesson). `courses/loading.tsx` is now a tiny client component that picks the lesson skeleton when `usePathname()` matches `/courses/<slug>/<lessonId>`, else the hub skeleton. (Real `courses/page.tsx` left where it is.)
- New: `/u/[username]`, `/pricing` (heading + mascot slot + 3 plan cards, middle taller), `/onboarding` (centered card), `(admin)/admin` (title + 4 tiles + table) skeletons.

**Error boundaries.** Shared `components/ui/error-state.tsx` (Aurora icon tile, Romanian copy, "Încearcă din nou" = `reset()`, home link, digest; `fullScreen` for pages without the dashboard shell). `global-error.tsx` renders its own `<html lang="ro"><body>` with **inline** Aurora-dark styles (it replaces the root layout, so Tailwind/theme CSS isn't guaranteed) and a full "Reîncarcă pagina" (`location.reload()`, since re-rendering a crashed root layout would just fail again).
- ⚠ Pre-existing bug fixed on the way: `src/app/error.tsx` was actually a *global-error* clone (it rendered `<html><body>` itself). As a segment boundary that nests `<html>` inside `<body>`. Its content moved to `global-error.tsx`; `error.tsx` is now a normal root-segment boundary using `ErrorState`. The existing `(dashboard)/error.tsx` is untouched.

**QA (Playwright, signed in as the Phase 4 test user).**
| Check | Result |
|---|---|
| Real loading state, network throttled — **production build** (Link-style *auto* prefetch, the page's RSC request held 6 s): dashboard, courses hub, lesson (from outside /courses and from /courses), profile, /u/[username], /pricing | ✅ skeleton shows in the real shell and mirrors the page that follows (dashboard: pill, headline, 4 stat cards, XP bar, week dots, 2nd section all within a few px) |
| Side-by-side skeleton vs loaded page: leaderboard, glossar, flashcards, interview, portfolio, roadmap, notifications | ✅ same silhouette (leaderboard shows 10 rows = the max; real data may have fewer) |
| Error thrown in each segment (deliberately throwing pages added to a *scratch copy only*): root, (dashboard), (auth), /pricing, /onboarding, /u/[username], /verify/[code] | ✅ styled Romanian card, retry + home, single `<html>`; retry click keeps the boundary |
| Root layout crash (scratch copy, cookie switch) → `global-error` | ✅ renders (lang=ro, dark), "Reîncarcă pagina" recovers once the fault is cleared |
| `(admin)` boundary | ⚠ compiled/built but not exercised visually — the test user isn't an admin (the layout redirects to /dashboard) |

Notes: (1) in `next dev` there is no prefetch, so the skeleton only appears once the server starts responding; the throttled test therefore needs a production build. (2) Mobile (375px) pass + lazy-loading remain **7B** (P7-05/P7-06). The skeletons already use responsive grids but were only verified at desktop width.
Gate: `npx tsc --noEmit` 0 · `npm run lint` 0 errors (2 pre-existing warnings, P7-09) · `npm run build` passes with lint ON (clean isolated copy; scratch copies/servers deleted).

### Phase 7B — mobile pass (375px) + build hygiene ✅ DONE (2026-10-01)

**Method.** Playwright, 375×812 @2x, dark, touch + mobile emulation, signed in as the Phase 4 test user. For every page: `document.scrollWidth <= clientWidth`, list of elements sticking out of the viewport, text spilling out of its box, tap targets < 34px, and — at the end of each page — whether the last content sits behind the floating `BottomNav`. Also checked at 768px. All changes are mobile-only (`max-sm:` / `sm:` prefixes or phone-only elements), so ≥ sm is untouched.

**What the baseline showed.** No page actually overflowed horizontally (tables already scroll in their own container). The real problems were cramped/hidden content:
- **Dashboard**: all 11 sections used an inline `maxWidth: min(75%, 1000px)` → on a phone the content was squeezed to 281px (stat cards spilling "Explorator"/"STREAK", 40px-wide cells in "Realizările tale"). Now `max-sm:!max-w-full` (inline style kept, so ≥ sm is identical); the "Explorator" value is `max-sm:text-xl`.
- **BottomNav covered the end of every dashboard-shell page** (leaderboard, profile, portfolio, interview, notifications had only 32–40px bottom padding). `BottomNav` now renders a phone-only `h-20` spacer (so nothing is added where the nav is hidden, e.g. lessons), is full-width minus 24px on phones (was 75vw ≈ 281px with 5×52px buttons) and respects `env(safe-area-inset-bottom)`.
- **Landing header**: logo wrapped ("RO" on a 2nd line), two-line buttons. Logo `whitespace-nowrap`; on phones the header keeps logo + theme toggle + "Începe gratuit" (the hero already has "Am deja cont"). **Pricing header**: wrapping back link + fixed `w-40` spacer → "Înapoi" label and spacer hidden on phones.
- **AI Coach**: panel is now `w-full` and `h-[100dvh]` on phones (was 95vw), the question input is 16px (iOS no longer zooms on focus), close button 40×40.
- **Tap targets**: navbar back arrow/logo, lesson breadcrumb + bookmark + feedback buttons, code-editor Run/Copy/Stop, copy-link buttons, footer/"Vezi toate…" links, auth links raised to ≥ 36–44px on phones. Course-map node labels: `overflow-wrap:anywhere` so a long word can't spill. Glossar search 16px on phones.

**Result at 375px (16 pages: /, /login, /register, /dashboard, /courses, lesson, /profile, /leaderboard, /glossar, /pricing, /u/[username], /interview, /portfolio, /roadmap, /flashcards, /settings/notifications):** no horizontal scroll on any (also none at 768), 0 text spills, nothing hidden behind the BottomNav. Lesson: table scrolls inside its own container (344px in a 326px scroller, page stays 375); AI Coach opens full-screen, replies from Claude, 0 console errors; code editor + output + plot fit (output panel wraps, plot 294px wide, 0 console errors; the editor was exercised on a harness page — no DB lesson contains a python-editor block).
**Desktop unchanged:** 1440×1000 screenshots of pricing/profile/glossar/leaderboard/flashcards pixel-diffed against the pre-7B captures → same layout, ≤ 0.25% pixels differ and only in animated areas (mascot, gradient titles, progress ring); leaderboard 0%.
Left as is (judgement calls): glossar category chips 32px high, notification switches 44×24 (standard toggle), an inline text link in the /u footer, a 16px icon link inside lesson content.

**Build hygiene.** `.gitignore` now also ignores `/devpath-public/` (it was untracked and NOT ignored; the CVs/PNGs/`graphify-out/`/`.qa-screenshots/`/`.playwright-mcp/` were already covered; `.next` too). Scratch build copies live outside the repo and were deleted. Remaining untracked files are intentional work (PROGRESS.md, supabase migrations, content, scripts). Gate: `npx tsc --noEmit` 0 · `npm run lint` 0 errors (the 2 P7-09 warnings) · `npm run build` passes with lint ON (clean isolated copy).


### ⚪ Low
- [ ] **P7-09** Lint warnings: `ai-coach-chat.tsx:170` missing dep `recognition`; `pdf/certificate-document.tsx:262` alt (likely false positive → eslint-disable).
- [x] **P7-10 ✅** `"engines": { "node": ">=20" }` added to `package.json` (`package-lock.json` untouched — run `npm install --package-lock-only` if you want the lock's root entry to mirror it).
- [ ] **P7-11** Edge-runtime "disables static generation" build warning — harmless.

---

## Phase 8 — Vercel deploy

- [ ] **P8-01** Pre-flight: `tsc` 0 errors, `npm run lint` 0 errors, `npm run build` passes locally (P7-01), git tree clean of clutter (P7-03), commit state agreed with owner.
- [ ] **P8-02** Create Vercel project (GitHub repo → import); Node version; framework preset Next.js.
- [ ] **P8-03** Vercel env vars (Production + Preview): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `NEXT_PUBLIC_SITE_URL` (= prod URL). Optional per D4: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (prod endpoint's), `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_STRIPE_{PRO,LIFETIME}_PRICE_ID`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `CRON_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`. (Unused: `GITHUB_PERSONAL_ACCESS_TOKEN`, non-public `STRIPE_*_PRICE_ID` — don't upload.)
- [ ] **P8-04** Supabase Auth: Site URL + redirect allow-list to prod/preview URLs; Google (and GitHub) providers; confirm-email decision applied (see Phase 3 manual steps).
- [ ] **P8-05** Stripe (if in scope): create prod webhook endpoint → `https://<prod>/api/stripe/webhook`, copy its signing secret.
- [ ] **P8-06** Post-deploy smoke test on prod URL: signup (email) → onboarding → dashboard → open lesson → complete (XP + next lesson) → leaderboard → AI coach reply → Python run → logout/login → Google OAuth → 404 page.
- [ ] **P8-07** Promote owner to admin via SQL (service role); verify a normal user can NOT reach `/admin` nor escalate via PostgREST (re-test P3-01).
- [ ] **P8-08** Re-run Supabase advisors (security) on the new project; fix anything new.
- [ ] **P8-09** Update `PROJECT-STATE.md` (real counts: 210 lessons, actual slugs, live RPC list) and this file; final `[polish]` list handed to owner.

### Phase 8 — owner review fixes: landing (2026-10-03) ✅
- **Cosmo legs** (`mascot/cosmo-mascot.tsx`): in `waving` the whole right front leg was the waving limb, so only the left foot stayed down (lower/farther from the back legs) and looked "dropped". The right front leg is now always planted beside the left one (same level); the wave is a separate arm (`pawWaveRef`, same pivot/angles as before) that is `visibility:hidden` unless `pawWaveAmp > 0.05`. Other emotions unchanged (arm hidden, both legs as before).
- **Hero button sweep** (`landing-page.tsx`): root cause is that `BorderBeam`'s border-only mask is not clipping in the browser tested (Chrome 154 — computed mask props are as coded, yet the full 80px gradient square paints over the label). Hero CTA (both the "Mergi la Dashboard" and the logged-out "Începe gratuit" variants): beam `size` 80→28, `opacity-50`, label wrapped in `relative z-10` so it paints above the sweep. Shared `ui/border-beam.tsx` untouched. ⚠ The same mask leak still exists on the other `BorderBeam` buttons (final CTA, highlighted pricing card) — not touched (out of scope); worth a look in the polish pass.
- **Real landing stats**: `app/page.tsx` counts `lessons` with `is_published = true` (explicit filter — the RLS policy also exposes unpublished rows to admins) and distinct `course_id`s, passes `lessonCount`/`courseCount` to `LandingPage`. Labels "{n} lecții", "{n} cursuri", "24/7 — AI Coach în română". Live now: **131 lecții · 6 cursuri** (matches DB). One cheap select of `course_id` (≈131 tiny rows) per request.
- QA: Playwright @4x on the mascot (8 frames before/after: legs side by side in every frame, arm still waves), 12 frames over the beam loop on the button (label fully visible in all), stats text read from the page = 131 / 6 / 24/7. Screenshots in `.qa-screenshots/p8-review/`. The logged-in "Mergi la Dashboard" variant could not be rendered (no session in the test browser) — it uses the identical markup/classes as the verified logged-out button.
- Gate: `npx tsc --noEmit` 0 · `npm run lint` 0 errors (2 P7-09 warnings) · `npm run build` passes with lint ON (isolated copy, deleted; :3000 not touched).

### Phase 8 — owner review fix #2: stray orange limb under Cosmo (2026-10-03) ✅
- **Root cause:** the "floating pill" was the **waving arm itself**, ~200px below the dog (under the "Cosmo te ajută!" caption). The arm `<g>` had `style={{ transformOrigin: "118px 188px" }}` **and** `transform="rotate(a 118 188)"` — the pivot was applied twice, so at the wave angle (≈ −51…−79°) the arm was thrown far down-left (measured bbox top ≈ 340–445 in a 230-unit viewBox). It was also the original "leg drops away and keeps moving" bug. (What looked like the raised arm at the upper right is Cosmo's tail.) My previous screenshots clipped to the SVG box, so they missed it.
- **Fix** (`cosmo-mascot.tsx`, one line): dropped the redundant `transformOrigin` from the arm group. The arm is now re-attached — it rotates around its own shoulder pivot and stays inside the SVG (bbox ≈ y 107–137 of ~140). Front legs, head, ears, tail, eyes untouched.
- **QA:** zoomed Playwright frames incl. the caption area and below — nothing floats, just Cosmo, its shadow and the caption; other emotions on public pages (`encouraging` /pricing/cancel, `celebrating` /pricing/success, `happy` /pricing + landing final CTA) render whole, arm `visibility:hidden`. The dashboard hero/toasts need a session and were not rendered, but only `waving` ever shows the arm (`pawWaveAmp` is 0 in every other emotion).
- Gate: `tsc` 0 · `lint` 0 errors (2 P7-09 warnings) · `build` passes with lint ON (isolated copy, deleted).

### Phase 8 — BorderBeam root fix + real course counts in the courses hero (2026-10-03) ✅
- **BorderBeam root cause** (`ui/border-beam.tsx`): the "border only" mask was an XOR/`exclude` of a **`transparent` (alpha 0) layer clipped to the padding box** with an opaque layer over the border box. Excluding something with zero alpha removes nothing, so current Chrome painted the beam over the whole element — label included (visible on hero/final CTA, pricing "Pro" card, dashboard course cards' corner). Fix: both mask layers are now opaque (`linear-gradient(#000 0 0)` ×2) with `mask-clip`/`mask-origin: padding-box, border-box` and `mask-composite: exclude` (+ `-webkit-` `xor`), i.e. the standard ring technique; props/API unchanged. Fixes every usage at once (landing hero + final CTA, pricing card, dashboard course cards).
- **Hero hacks removed** (`landing-page.tsx`): the per-instance patch on both hero CTAs (`size={28}`, `opacity-50`, label wrapped in `relative z-10`) is gone; they are back to the original markup (`size={80}`) and now show a beam running along the border only, same as the final CTA. Other `BorderBeam` call sites untouched.
- **Courses hero** (`course/courses-hero.tsx` + `courses/page.tsx`): new prop `publishedCourses` = number of courses with ≥ 1 published lesson (computed in the page from `selectorOptions[].publishedLessons`). "N cursuri" and "N Boss Fights" use it (live DB: **6**; lessons pill still 131). `TOTAL_COURSES = 12` now only sizes the 12-badge roadmap row (coming-soon courses stay locked/"În curând"); no other "12 cursuri" text exists in `src`.
- **QA (Playwright @3x):** landing hero CTA (8 frames over the loop), final CTA (8) and the highlighted Pro card (3): label fully visible in every frame, thin gradient streak only on the border. Courses hero checked in an isolated scratch copy (real `CoursesHero`, deleted) because the real page needs a login: pills read "6 cursuri · 131 lecții · ~60h de conținut · 6 Boss Fights", 12 roadmap badges unchanged. DB cross-check: 6 courses / 131 published lessons.
- ⚠ Not touched (not asked): the **"~60h de conținut"** pill is still a hardcoded claim (131 lessons ≈ 22 h at the ~10 min/lesson the dashboard uses) — worth correcting or deriving before it goes on a CV.
- Gate: `npx tsc --noEmit` 0 · `npm run lint` 0 errors (2 P7-09 warnings) · `npm run build` passes with lint ON (isolated copy, deleted; :3000 not touched).

### Phase 8 — LIVE smoke test of https://devpath-ro.vercel.app (2026-10-03) ✅ (4 fixes pending redeploy)
Playwright against the live URL (+ Supabase `zgofeajewktwmswckgup` via MCP). Throwaway user `devpath.smoketest.<ts>@example.com` created through the normal signup flow, **deleted afterwards (0 rows left in all 17 user-linked tables)**. ⚠ The DB is **not** at 0 users: your real Google account (`marebogdan03@gmail.com`, signed up 13:31 UTC during the test) exists and was deliberately NOT touched. Early on I misread its row as mine (unfiltered "latest user" query) and briefly suspected an XP bug — false alarm; every later check filtered by id.

**PASS**
- **Landing:** 200, 0 console errors, real stats (131 lecții · 6 cursuri · 24/7), Cosmo without stray limb, beam mask fix live (hero / final CTA / Pro card: labels readable, ring on border only).
- **Signup (email) → onboarding (4 steps) → dashboard:** confirm-email off lands straight in onboarding; trigger created the `users` row; +50 XP, referral code generated.
- **Google OAuth:** start verified (→ accounts.google.com, `redirect_uri` = supabase callback, `redirect_to` = live `/auth/callback`, no `redirect_uri_mismatch`); end-to-end proven by your own account (`google` identity, confirmed, onboarded, +50 XP).
- **Dashboard / map:** XP/level/streak cards, 6 course cards → `/courses/<slug>` → map scrolled to the course's first lesson; "Vezi toate cursurile" top + bottom; 131 nodes (125 available + 6 current), all pointer-clickable, none locked; hero pills **6 cursuri · 131 lecții · ~22h · 6 Boss Fights** (not 60h).
- **All 131 published lessons** fetched as a signed-in user: 131/131 → 200, heading present, no MDX-fallback/error markers (min HTML 110 KB).
- **Lesson flow:** content, AI Coach answers via Claude (200 from `/api/ai/chat`, Romanian, ~6 s — not the disabled state), opt-in quiz (0 requests on load; 3 on-topic questions generated in ~18 s; answers + explanations work; 3 rows cached; reload → same questions, no new rows), Complete → "+15 XP", badge `prima_lectie`, streak +5, auto-advance to the next lesson.
- **Other pages** (profile, leaderboard, glossar [50 terms], pricing, interview [Claude-powered, feedback works], flashcards, roadmap, portfolio, notifications, courses): all 200, no console/network errors.
- **Public profile `/u/<referral>` signed out:** renders, **no email anywhere in the HTML/RSC**; unknown/malformed handles → not-found view; malformed escapes → 400.
- **Mobile 375px:** landing, dashboard, courses, lesson, profile, leaderboard, pricing — no horizontal scroll.
- **404:** real 404 page (HTTP 404); protected routes → `/login`; `/admin` + `/api/admin/*` as student → redirect / 403; removed routes (`/api/execute-code`, `/api/ai/tts`) 404; Stripe → clean 503 `payments disabled`; cron → 503; unauth AI/search/certificate APIs → 401; no 5xx on malformed URLs; open-redirect attempts neutralised.
- **Auth lifecycle:** logout, wrong password ("Email sau parolă incorecte"), login restores state.
- **Security re-check on prod (student JWT + anon key via PostgREST):** PATCH own `role` / `plan` / `xp_points` / `stripe_customer_id` → 403 `42501`; own safe column (`name`) → OK; PATCH another user's row → 0 rows; `select=*` on `users` → only own row (no other emails); INSERT `xp_events` / `user_badges` → 403; RPC `award_xp_and_check_level` → 403; `get_admin_stats` → 403 "admin only"; `user_progress`/`xp_events`/`ai_generated_questions` → own rows only; `get_top_users` / `get_public_profiles` → public columns only; unpublished lessons → 0 rows; anon: `users`/`user_progress` → empty, leaderboard + XP RPCs denied.

**FIXED in this commit (live after the next deploy)**
1. **Privacy: public sitemap listed every user's name** (`/u/<name-slug>`, which also 404'd) **and every certificate code.** `sitemap.ts` now lists only `/`, `/pricing`, `/courses`.
2. **Wrong canonical domain:** `robots.txt`, `sitemap.xml`, `metadataBase`/OpenGraph and the **certificate QR/verify URL** were hardcoded to `https://devpath.ro` (not this app). New `src/lib/site.ts` (`SITE_URL` = `NEXT_PUBLIC_SITE_URL`, fallback the vercel.app URL) is used in all of them. (Static brand text "devpath.ro" in the PDF/portfolio header/landing copy is unchanged.)
3. **Performance — functions ran in `iad1` (US East) while Supabase is in eu-central-1**: lesson pages 2–5 s (median 1.9 s under load), cached quiz read 5 s. `vercel.json` → `"regions": ["fra1"]`. Re-measure after redeploy.
4. **Pricing "Alege Pro" silently bounced a signed-in user to the dashboard** (no `NEXT_PUBLIC_STRIPE_*_PRICE_ID` → fell through to `/register?next=` → middleware → `/dashboard`). It now shows "Plățile nu sunt disponibile momentan. Revino în curând."
5. Landing hero copy no longer advertises the retired "mod simplu și tehnic".

**OPEN — proposed follow-ups (not fixed here)**
- 🟠 **Python editor is unreachable**: no published lesson contains a `python-editor` block (all Python is static code fences), so F1 (Pyodide, timeout, Stop) could not be exercised on prod and is invisible to learners.
- 🟠 **Interactive layer is empty**: `flashcards`, `inline_questions`, `wow_notes`, `quiz_questions` all have 0 rows → `/flashcards` can never unlock; no inline questions/Wow Notes in any lesson.
- 🟡 **Interview content mismatch**: fixed categories (Concepte AI / ML / Rețele Neuronale / LLM) while the live curriculum is Hardware → OS → Networks → Python → Algorithms → Math.
- 🟡 **Logout is only at the bottom of the dashboard** (not in navbar/profile).
- 🟡 **Soft 404s**: unknown `/u/<handle>` and non-existent lesson ids return HTTP 200 (streaming + `loading.tsx`) with a not-found body, `robots: index`; titles read "… — DevPath RO — DevPath RO" (duplicated template suffix).
- 🟡 `/u/<email-local-part>` still resolves (account-existence enumeration); consider referral-code only.
- ⚪ Closed AI Coach panel's buttons stay in the tab order (off-screen); "1 zile streak" grammar; quiz first generation ~18 s (re-measure post-region-fix); `NEXT_PUBLIC_STRIPE_*` unset by design (payments off).
- **Not exercised:** certificate PDF (needs a completed course), Stripe/Resend/cron/push (disabled by design), complete Google consent screen (needs a human).

### Phase 8 — pre-deploy cleanup + push to GitHub `main` (2026-10-03) ✅
- **Repo audit (before touching anything):** 146 working-tree entries (96 modified, 4 deleted, 46 untracked → ~373 files). **No personal file is, or ever was, in git:** `git ls-files` shows none of the CV PDFs / `edunext-work.png` / `calorie-tracker-showcase.png` / `football-platform-cover.png` / `linkedin-banner*.png` / `devpath-public/` / `graphify-out/` tracked, and `git log --all` finds none of them (nor `.env*`) in any commit — so no history rewrite is needed. They were already root-anchored in `.gitignore` (Phase 7B); `.env*.local` ignored (`.env.local` confirmed untracked). `devpath-public/` is a separate nested git repo with its own `.claude/settings.local.json`. Secret-pattern scan over every changed/untracked text file: no hits; `.env.example` holds a placeholder.
- **Removed:** `.qa-screenshots/` (137 files) and `.playwright-mcp/` (2) — gitignored QA scratch. No `*-build*` copies in the repo (isolated builds live in `%TEMP%` and were deleted each time).
- **Kept on purpose:** `.next/` (the owner's dev server on :3000 is using it) and `graphify-out/` (gitignored, never pushed; deleting it only destroys a costly-to-rebuild knowledge graph) — both deviate from the "remove" suggestion; delete by hand if wanted.
- **Archived (not deleted):** `devpath-docs/dailylog.code-workspace` → `devpath-docs/archive/` (tracked, and it listed paths of the owner's other local projects); `archive/README.md` updated (also lists the `.SKIPPED` slug migration, now committed).
- **`.claude/skills/devpath-ro-patterns/SKILL.md` rewritten** from the actual code: Anthropic `claude-haiku-4-5` via `src/lib/ai/model.ts`, text-only AI, browser STT input only / no TTS, opt-in AI quiz, Pyodide-only in a Web Worker (no Piston), Romanian-only (no next-intl), unlocked course map, current lesson-page structure and security rules. The `.claude/skills/vercel-*` files read fine (no reparse-point problem; nothing skipped).
- **Final gate:** `npx tsc --noEmit` 0 · `npm run lint` 0 errors (2 P7-09 warnings) · `npm run build` passes with lint ON (isolated copy incl. `content/`, 39/39 static pages; deleted; :3000 not touched).
- **Commit + push:** all work is committed in 8 logical groups on local `main` (config · DB migrations · server hardening/gamification · AI · Python worker · UI/UX · content · docs), working tree clean, 8 commits ahead / 0 behind `origin/main` (pure fast-forward). ⚠ **The `git push origin main` itself was blocked by the Claude Code permission layer (denied twice), so it has NOT been pushed yet** — run `git push origin main` (no force needed) from a normal terminal, then Vercel can import `MareBogdan/devpath-ro` (next: P8-02…P8-09 — env vars, Supabase auth URLs, smoke test). ⚠ The GitHub repo is **public**: only code/docs go out; the test-user alias was redacted from this file before committing.

### Phase 8 — courses-hero content-hours pill derived from real lessons (2026-10-03) ✅
- **Problem:** the "⚡ ~60h de conținut" pill was a hardcoded literal (131 published lessons ≈ 22 h).
- **Fix:** the "dashboard estimate" was two inline `* 10` literals in `dashboard/courses-section.tsx`, not a shared constant — extracted as `MINUTES_PER_LESSON = 10` (+ `estimateContentHours()`) in the new `src/lib/lesson-time.ts`; the dashboard course cards now import it (same numbers as before) and `courses-hero.tsx` renders `~{estimateContentHours(totalLessons)}h de conținut`. `totalLessons` is the prop that already feeds the "lecții" pill (published lessons, from the existing courses-page query) → no new fetch or prop. Result: **~22h** (131 × 10 min = 21.8 h → 22); the other pills (6 cursuri · 131 lecții · 6 Boss Fights) and the 12-badge roadmap are unchanged. Changing the constant moves the hero and the dashboard together.
- **QA:** real `CoursesHero` rendered in an isolated scratch copy (the real page needs a login; copy + :3100 server deleted): pills read "6 cursuri · 131 lecții · ~22h de conținut · 6 Boss Fights", 12 roadmap badges, 0 page errors. Screenshot `.qa-screenshots/p8-review/courses-hero-hours.png`.
- ⚠ Other per-lesson time guesses still disagree and were NOT touched (out of scope): the serpentine world-gate card (`ui/serpentine-path.tsx`, 5 min/lesson → "~N h") and `/roadmap` (`AVG_MINUTES_PER_LESSON = 12`). Pointing them at `MINUTES_PER_LESSON` would make every figure consistent.
- Gate: `npx tsc --noEmit` 0 · `npm run lint` 0 errors (2 P7-09 warnings) · `npm run build` passes with lint ON (isolated copy, deleted; :3000 not touched).

### Phase 8 — F2 AI quiz surfaced on published lessons (2026-10-03) ✅ (code) / ⏳ live check pending
- **Where:** `LessonPageClient` now renders `<AdaptiveQuizSection lessonId>` between the lesson content and the completion row (it must be BEFORE "Marchează completat": completing navigates to the next lesson). New prop `showAiQuiz`, set by `[lessonId]/page.tsx` to `lesson.is_published === true` for both client usages (theory/lesson and exercise/lab/project/boss). Unpublished lessons (C7–12 skeletons / admin drafts) and coming-soon placeholders get no quiz. `type: "quiz"` lessons keep their own `QuizSection` (adaptive practice after a failed quiz — now passed `autoStart`, so that flow is unchanged). The section is wrapped in `GamificationBoundary`, so a render failure can't take the lesson down.
- **Opt-in, no cost on load:** `adaptive-quiz-section.tsx` has a new `started` state (`autoStart` prop, default `false`). First render = intro ("Vrei să vezi cât ai reținut? … doar când apeși butonul") + button **"Testează-te cu un quiz"**; the 3 questions are requested only on click. Header subtitle is now "Întrebări generate de AI pe baza lecției". The Phase 6C fetch / validation / failure fallback ("Nu am putut genera întrebări acum" + "Încearcă din nou" retrying the same call) is unchanged; "Generează alte întrebări" is shown after the first start and keeps `disabled={loading}`.
- **Route fix (found on the way):** `api/ai/generate-quiz` ignored the lesson — with no wrong answers it asked Claude for generic "introductory AI" questions, i.e. off-topic on the OS / networking lessons. It now loads the **published** lesson (title + first 8 000 chars of `content_md`; 404 for unknown/unpublished, before any Claude call) and asks for 3 questions strictly about it (still merging the learner's wrong answers when present). Auth → Zod → cache lookup → lesson load → Claude order kept; model/provider (`@/lib/ai/model`), caching rules and table untouched. Cache is per user + lesson (`ai_generated_questions`, RLS "own rows" confirmed on the live DB): the first generation is stored, a normal re-open returns the stored rows without calling Claude; only "Generează alte" (`forceRegenerate`) replaces them.
- **QA done** (isolated scratch copy, port 3100, deleted; `/api/ai/generate-quiz` mocked in Playwright, so no Claude call/DB): 0 requests on page load; intro + button shown, no regenerate button before start; click with a forced 502 → fallback with retry; retry → 3 questions; wrong answer → "✗ Răspuns greșit." + explanation, right answer → "✓ Corect!"; "Generează alte" sends `forceRegenerate:true`, is `disabled` while loading and re-enabled after. Screenshots `.qa-screenshots/p8-review/quiz-*.png`.
- **NOT verified (needs a signed-in session + `ANTHROPIC_API_KEY`; I could not sign in — minting a test-user session was blocked):** the real lesson page showing the section, real Claude output being about the lesson, and the cache hit on a second open (check `ai_generated_questions` has 3 rows for the user+lesson after one click and that re-clicking adds none).
- Gate: `npx tsc --noEmit` 0 · `npm run lint` 0 errors (2 P7-09 warnings) · `npm run build` passes with lint ON (isolated copy, deleted).

### Phase 8 — owner review fix #4: course navigation + serpentine unlocked (2026-10-03) ✅
- **Sequential lesson locking removed for MVP — every published lesson is open, in any order.** `lib/course-map.ts` (`buildAllCoursesNodes`) no longer emits `"locked"`: a node is `completed` (green ✓), `current` (= first not-done lesson **of each course**, the highlighted "continue here" node) or the new `available`. World gates are `available` (was `locked` after the first current). The server never gated lessons (checked `[lessonId]/page.tsx` + `completeLesson`), so this was purely a map/UI lock. Unpublished courses are untouched (still filtered out of the map, listed under "În curând").
- **`ui/serpentine-path.tsx`:** new `NodeStatus` `"available"` (kept `"locked"` in the union for other callers, e.g. the dev showcase) — light course-colored disc + solid rim + course-colored icon (lesson) / softer gradient disc (checkpoint), tooltip "Deschide →", clickable, no pulse; sizes added to `LESSON_SIZES`/`CP_SIZES`/mobile sizes; `available → completed` also fires the completion burst; world-gate badge says "○ Începe" instead of "🔒 Blocat" when a course has open lessons. Nodes now carry `data-node-id` / `data-status` (test hooks). `MobileMap` now registers node refs, so the scroll-to-node works on phones too (it silently didn't before).
- **Scroll on load** (`course-map` flow via `courses-page-client.tsx`): the existing `scrollIntoView({block:"center"})` effect is now aimed at the **first not-completed lesson of the requested course** (`built.nextLessonByCourse`), falling back to the course's first lesson when it's finished/untouched, then the global current. Previously it jumped to the course's first node regardless of progress.
- **Dashboard "Cursurile tale"** (`dashboard/courses-section.tsx`): card links go to `/courses/${slug}` (which redirects to `/courses?c=<slug>` — the unified map — so the user lands on the map scrolled to their next lesson, then opens a lesson from there); "În curând" cards stay non-links. Added a "Vezi toate cursurile → /courses" link at the **top** of the section (right of the title); the bottom one stays. The card CTA text ("Continuă: <lesson>") is unchanged and still accurate (the map is scrolled to that lesson).
- **QA** (Playwright): could **not** log in — the test-user session needed the service-role key, which the harness blocked, so nothing was verified against the live DB. Instead, an isolated scratch copy (port 3100, deleted; repo/:3000/DB untouched) with a public QA page fed synthetic data to the **real** `CoursesPageClient` + `CoursesSection`: 4 courses (untouched / partial with non-contiguous done 1-4,6,9 / finished / unpublished). Results @1440: land on `?c=alpha` → `alpha-l1`; `?c=beta` → `beta-l5` (first not-done, skipping done 6 and 9); `?c=gamma` (all done) → `gamma-l1`; all 36 nodes `cursor:pointer`, 0 locked (14 completed ✓ / 2 current / 20 available); real clicks on available, current, checkpoint and completed nodes each push `/courses/<slug>/<lessonId>`. Cards: hrefs `/courses/alpha|beta|gamma`, "În curând" card has no link, "Vezi toate cursurile" present top + bottom. @375: lands on `beta-l5`, no horizontal overflow. Screenshots: `.qa-screenshots/p8-review/map-*.png`, `cards.png`.
- ⚠ **Still to eyeball in the real app (needs a logged-in session):** `/dashboard` → card → `/courses` with the real 131 lessons. Logic is covered by the synthetic run; the real page just feeds it DB rows. Also noted (not touched): the BorderBeam mask leak is visible on the course cards' top-right corner too (same root cause as the landing button).
- Gate: `npx tsc --noEmit` 0 · `npm run lint` 0 errors (2 P7-09 warnings) · `npm run build` passes with lint ON (isolated copy, deleted).

### Phase 8 — owner review fix #3: waving arm no longer reads as an extra leg (2026-10-03) ✅
- **Problem:** after fix #2 the re-attached arm stuck out sideways at hip height and read as a third leg. Raising it clear of the body isn't viable with the current art: the hanging right ear and the tail occupy the space beside the head and the arm (same 40-unit leg path) is too short to clear them without redrawing it.
- **Fix** (`cosmo-mascot.tsx` only): removed the waving-arm limb entirely — its `<g>`, the `pawWaveRef`, the per-frame rotate block, and the now-dead `pawWaveAmp` field (type, 8 emotion entries, lerp). `waving` keeps its face (smile/mouth shape), tail, head, ears, eyes and wand sparkle; both front legs unchanged. `emotion="waving"` is still valid for landing (hero) and onboarding (`step-welcome.tsx`), so no call sites changed. Nothing renders outside the body any more.
- ⚠ Cosmetic leftovers outside the mascot file (not touched, out of scope): the dev showcase `(dashboard)/dev/components/_cosmo-showcase.tsx` still describes `waving` as "One paw raised — friendly hello", and `CLAUDE.md`'s emotion table still lists a waving paw. Update the copy if desired.
- **QA:** Playwright @3x, 6 frames of the landing hero Cosmo (+ caption area): two front legs, back legs peeking behind, no limb sticking out low or floating; /pricing/cancel (`encouraging`), /pricing/success (`celebrating`, bouncing + confetti), /pricing (`happy`) and the landing final CTA (`happy`) render whole, 0 console/page errors. Dashboard hero/toasts need a session (not rendered) — they use emotions that never had the arm.
- Gate: `tsc` 0 · `lint` 0 errors (2 P7-09 warnings) · `build` passes with lint ON (isolated copy, deleted).

---

## Suggested execution order (8 prompts)

1. **(this one)** Audit ✅
2. Phase 2 DB migration set (P2-01…P2-04, P2-08…P2-11, P3-01…P3-03/P3-08 SQL) — SQL shown for approval first, tracked in `supabase/migrations/` — + code fixes for P2-10/P2-11 + P7-01 build fix (after D1 for slugs).
3. Phase 3 auth code + dashboard steps (P3-05…P3-12)
4. Phase 4 core flow re-test + P4-02/04/05 + C1 L1 anchors (P2-06)
5. Phase 5 secondary pages/gamification (search, badges seed, Stripe hardening, lazy module-load)
6. Phase 6 features (Piston decision, rate limits, error handling)
7. Phase 7 error/loading states + mobile + prod build cleanliness
8. Phase 8 Vercel deploy + smoke test; then owner-led `[polish]` pass
