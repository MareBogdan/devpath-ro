# Phase 0 Quick Reference
# DO NOT read devpath-plan-phase0.md in full. Use this file + plan sections as needed.

## GOAL: Cleanup, Security, DB, Nav fixes, Streak fix
## ESTIMATED TASKS: 30 (P0.1.x through P0.6.x)

## TASK GROUPS — implement in this exact order:

### GROUP A — Remove next-intl (P0.1.x)
Files to change: next.config.mjs, src/app/layout.tsx, src/app/page.tsx,
  src/components/layout/navbar.tsx, src/app/(dashboard)/dashboard/page.tsx
Files to DELETE: src/i18n/request.ts, src/lib/locale.ts,
  src/components/lang-toggle.tsx, src/app/(auth)/set-locale-action.ts
Command: npm uninstall next-intl
Verify: grep -r "next-intl" src/ → must return zero results

### GROUP B — Security (P0.2.x)
Files: src/app/api/ai/chat/route.ts, src/app/api/ai/tts/route.ts
Pattern: auth check first → Zod validation → business logic
Both routes: unauthenticated POST must return 401

### GROUP C — Database (P0.3.x) — RUN IN SUPABASE SQL EDITOR
1. ADD columns to users: role, onboarding_completed, profile_type, learning_goal,
   skill_level, learning_mode, daily_goal_minutes, last_active, streak_count,
   xp_points, level, referral_code, referred_by
2. ADD column to lessons: content_simple_md
3. CREATE 15 new tables (all with RLS) — see plan section 0.3.3
4. SEED badges table with 25 rows — see plan section 0.3.4
5. UPDATE schema.sql to match live DB

### GROUP D — Nav Pages (P0.4.x)
Create: src/app/(dashboard)/roadmap/page.tsx (RSC)
Create: src/app/(dashboard)/portfolio/page.tsx (RSC)
Create: src/app/(dashboard)/interview/page.tsx (Client Component)
All three: auth-protected, no 404

### GROUP E — Streak Fix (P0.5.x)
File: src/app/(dashboard)/courses/actions.ts
Add streak calculation after lesson completion upsert
Dashboard must show real streak_count from DB (not hardcoded 0)

### GROUP F — CLAUDE.md Update (P0.6.x)
Add: 15 new tables to schema summary
Add: Language section (Romanian only, next-intl removed)
Add: Dual Content Modes section
Add: Security reference implementation section

## DONE WHEN:
- npm run build passes with zero errors
- curl unauthenticated to /api/ai/chat returns 401
- All 15 new tables visible in Supabase
- badges table has 25 rows
- /roadmap, /portfolio, /interview load without 404
- streak increments after lesson completion
