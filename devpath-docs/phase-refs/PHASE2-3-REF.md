# Phase 2-3 Quick Reference
# Read devpath-plan-phase2-3.md sections only when needed for that task group.

## GOAL: Onboarding wizard + Full gamification + Pixel mascot
## ESTIMATED TASKS: ~45 (P2.x.x + P3.x.x)

## TASK GROUPS — implement in this exact order:

### GROUP A — Onboarding Wizard (P2.1.x through P2.4.x)
New route: src/app/onboarding/page.tsx (RSC — outside dashboard group)
New action: src/app/onboarding/actions.ts (completeOnboarding)
New components:
  src/components/onboarding/onboarding-wizard.tsx (state machine)
  src/components/onboarding/step-profile.tsx (7 profile cards)
  src/components/onboarding/step-goal.tsx (4 goal cards)
  src/components/onboarding/step-calibration.tsx (3 questions + daily goal)
  src/components/onboarding/step-welcome.tsx (Pixel + GPT message + done)
  src/components/onboarding/types.ts (all interfaces)
New lib: src/lib/onboarding-mapping.ts (computeLearningMode function)
New API: src/app/api/onboarding/welcome-message/route.ts (edge, GPT-4o-mini)
Modify: src/app/(dashboard)/layout.tsx → redirect to /onboarding if not completed

PROFILE → MODE MAPPING (exact logic):
- medical/entrepreneur/student_non_cs/teacher/curious → always simple
- student_cs + yes+yes → technical
- developer + yes+yes+yes → technical (start from module 3)
- developer + yes+yes+heard-of → technical (start from module 1)
- all others → simple

### GROUP B — Postgres Functions (P3.0.x) — run in Supabase SQL Editor
1. award_xp_and_check_level() function
2. get_weekly_leaderboard() function
Verify lessons table has module_index column (add if missing)

### GROUP C — XP + Level System (P3.1.x + P3.2.x)
New lib: src/lib/gamification.ts
New components: xp-toast.tsx, level-up-toast.tsx, badge-toast.tsx, streak-toast.tsx

XP VALUES (exact — never change):
lesson_complete_simple=10, lesson_complete_technical=15,
gate_correct_first_try=5, quiz_perfect=25, quiz_good=10,
streak_daily=5, streak_3=20, streak_7=50, streak_30=200,
course_complete=100, minigame_perfect=30, minigame_complete=15,
flashcard_session=10, referral=40, first_comment=5

### GROUP D — Badge Engine (P3.3.x)
checkAndAwardBadges() in gamification.ts — 25 badges
isRomanianHoliday() + getOrthodoxEasterMonday() helpers

### GROUP E — Leaderboard (P3.5.x)
New page: src/app/(dashboard)/leaderboard/page.tsx
Add "Clasament" to sidebar nav

### GROUP F — Pixel Mascot (P3.6.x + P3.7.x)
New: src/components/mascot/pixel-mascot.tsx
  emotion: "happy"|"sad"|"thinking"|"excited"|"proud", size?: number
New: src/components/mascot/mascot-celebration-overlay.tsx

PIXEL 9 MOMENTS:
1. Lesson complete → overlay + confetti
2. Wrong gate answer → sad Pixel in lesson-gate.tsx
3. Mini-game host → excited Pixel (Phase 4)
4. Streak milestone → proud Pixel + crown
5. Badge earned → badge-toast with Pixel
6. 3+ days absent → sad Pixel in absence-mascot.tsx
7. Certificate generated → proud Pixel (Phase 5)
8. Onboarding welcome → excited Pixel bounce-in
9. XP gain → xp-toast mini Pixel

### GROUP G — Wire markLessonComplete (P3.7.x)
Extend MarkCompleteResult: xpEarned, newTotalXP, leveledUp, newLevel,
  newLevelName, newBadges, streakMilestone

## DONE WHEN:
- New user → /onboarding → dashboard with correct learning_mode
- Complete lesson → XP + possible level-up + possible badge
- Pixel appears in all 9 moments
- npx tsc --noEmit passes
