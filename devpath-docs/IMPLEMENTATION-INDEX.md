# DevPath RO — Implementation Index
# READ THIS FIRST. Then read ONLY the files listed for your current phase.

## CURRENT IMPLEMENTATION ORDER
Phase 0 → Phase 1 → Phase 2-3 → Phase 4-5 → Phase 6-7 → Phase 8-9 → Phase 10

## FILE MAP — Read only what your phase needs

| Phase | Plan File | Reference Files |
|---|---|---|
| Phase 0 | devpath-plan-phase0.md | devpath-vision.md §TECH-STACK only |
| Phase 1 | devpath-plan-phase1.md | devpath-vision.md §SIMPLE-TECHNICAL-MODE |
| Phase 2-3 | devpath-plan-phase2-3.md | devpath-vision.md §ONBOARDING + §GAMIFICATION + §MASCOT-PIXEL |
| Phase 4-5 | devpath-plan-phase4-5.md | devpath-vision.md §MINI-GAMES + §PORTFOLIO-SOCIAL |
| Phase 6-7 | devpath-plan-phase6-7.md | devpath-vision.md §NOTIFICATIONS |
| Phase 8-9 | devpath-plan-phase8-9.md | devpath-vision.md §PLATFORM-GOALS |
| Phase 10 | devpath-plan-phase10.md | devpath-vision.md §PLATFORM-GOALS |

## QUICK REFERENCE — DB Tables by Phase

### Exist before Phase 0 (original schema):
users, courses, lessons, user_progress, quiz_questions, projects

### Added in Phase 0:
lesson_gate_questions, lesson_gate_attempts, lesson_bookmarks, lesson_feedback,
xp_events, badges(seeded 25), user_badges, referral_events,
quiz_wrong_answers, ai_generated_questions, flashcards,
user_flashcard_progress, lesson_comments, push_subscriptions, ai_coach_sessions

### Added in Phase 4:
minigame_sessions, (search_vector columns on lessons+courses)

### Added in Phase 6:
notification_preferences, push_subscriptions(extended)

### Added in Phase 8:
(columns: users.is_banned, users.ban_reason, lesson_comments.is_deleted)

### Added in Phase 9:
course row: prompt-engineering-practic + its 30 lessons

### Added in Phase 10:
(columns: users.stripe_customer_id, stripe_subscription_id, plan_activated_at)
certificates table

## QUICK REFERENCE — New npm Packages by Phase

| Phase | Package | Approved |
|---|---|---|
| Phase 4 | pyodide@0.27.0 | ✅ |
| Phase 5 | @react-pdf/renderer@^4.1.6 | requires approval at task P5.4 |
| Phase 5 | qrcode@^1.5.4 | requires approval at task P5.4 |
| Phase 6 | resend@^4.5.1 | requires approval at task P6.1 |
| Phase 6 | web-push@^3.6.7 | requires approval at task P6.2 |
| Phase 6 | @react-email/components@^0.0.35 | requires approval at task P6.1 |
| Phase 6 | @react-email/render@^1.0.5 | requires approval at task P6.1 |
| Phase 10 | stripe@^16.x | requires approval at task P10.5 |

## GOLDEN RULES (always active)
1. Auth check (supabase.auth.getUser()) + Zod on EVERY new API route
2. RLS policy on EVERY new DB table
3. Zero `any` TypeScript types
4. All user-facing text in Romanian
5. schema.sql must be updated after every DB migration
6. Check devpath-progress.md after each task and mark complete
