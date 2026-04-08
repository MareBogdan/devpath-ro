# Phase 6-7 Quick Reference

## GOAL: Email notifications + Push + Interview upgrade + AI memory + Glossar

### NEW PACKAGES (request approval before installing):
resend@^4.5.1, web-push@^3.6.7,
@react-email/components@^0.0.35, @react-email/render@^1.0.5

### NEW ENV VARS:
RESEND_API_KEY, RESEND_FROM_EMAIL,
NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT

### GROUP A — DB Migration (P6.0)
New tables: notification_preferences (with auto-create trigger), push_subscriptions

### GROUP B — Email (P6.1.x)
New lib: src/lib/email/resend.ts + 4 templates in src/lib/email/templates/
  weekly-progress.tsx, streak-lost.tsx, course-complete.tsx, referral-success.tsx
New routes: src/app/api/cron/weekly-email/route.ts (Mon 09:00 EET)
           src/app/api/cron/streak-check/route.ts (daily 07:00 EET)
New file: vercel.json (cron schedule config)

### GROUP C — Web Push (P6.2.x)
Generate VAPID keys once: npx web-push generate-vapid-keys
Service worker: public/sw.js
New API: src/app/api/push/subscribe/route.ts
         src/app/api/push/send/route.ts
Permission request: AFTER first lesson complete (never on page load)

### GROUP D — Notification Preferences UI (P6.3.x)
New page: src/app/(dashboard)/settings/notifications/page.tsx

### GROUP E — Interview Simulator Upgrade (P7.1.x)
Upgrade existing: src/app/(dashboard)/interview/page.tsx
Add scoring rubric system prompt, category breakdown, session report
Add: src/components/interview/session-report.tsx

### GROUP F — AI Coach Memory (P7.2.x)
After session ends → summarize last 10 messages via GPT-4o-mini
Save summary to ai_coach_sessions table (exists from Phase 0)
On next session start → fetch last summary and inject as context

### GROUP G — Glossar (P7.3.x)
New table: glossar_terms (id, term, definition, category, created_at)
Seed with 50 AI/ML terms (generate once via admin action)
New page: src/app/(dashboard)/glossar/page.tsx (searchable)
Add "Glossar" to sidebar nav

---

# Phase 8-9 Quick Reference

## GOAL: Admin dashboard + Second course (Prompt Engineering Practic)

### GROUP A — DB Migration (P8.0)
IMPORTANT: users.role column may exist from Phase 0 — use safe DO $$ migration
Add: users.is_banned, users.ban_reason, users.banned_at
Add: lesson_comments.is_deleted, deleted_by, deleted_at, report_count
Create RPC functions: get_admin_user_stats(), get_lesson_analytics(),
  get_minigame_stats(), get_badge_stats(), report_comment()

### GROUP B — Admin Route Group (P8.1.x through P8.6.x)
New route group: src/app/(admin)/
  layout.tsx → requireAdmin() check (users.role === 'admin')
  admin/page.tsx → redirect to /admin/users
  admin/users/page.tsx → user stats + DAU/MAU
  admin/lessons/page.tsx → completion rates, drop-off
  admin/minigames/page.tsx → scores per game type
  admin/comments/page.tsx → moderation panel
  admin/badges/page.tsx → rarity table
New shared components: src/components/admin/
  stat-card.tsx, css-bar-chart.tsx, comment-moderation-client.tsx
New actions: src/app/(admin)/admin/actions.ts (deleteComment, banUser, unbanUser)
NO recharts — use CssBarChart (pure HTML/CSS)

### GROUP C — Second Course Setup (P9.1.x + P9.2.x)
Course slug: prompt-engineering-practic
Directory: content/prompt-engineering-practic/
30 lessons, 6 modules (5 lessons each)
Run sync-action after writing MDX files

### GROUP D — 30 Lessons MDX (P9.3.x)
60 files total: lesson-NN-slug.mdx + lesson-NN-slug-simple.mdx
Quiz lessons: single file (no simple variant)
Exercise lessons: simple = walkthrough without code
All simple mode: immediate practical value, domain-specific analogies

### GROUP E — Gate Questions + Flashcards (P9.4.x + P9.5.x)
24 theory lessons × 2 questions = 48 gate questions
6 flashcard sets (one per module capstone lesson)

---

# Phase 10 Quick Reference

## GOAL: SEO + Landing page redesign + Stripe monetization

### NEW PACKAGE (request approval):
stripe@^16.x (may already be installed — check package.json first)

### NEW ENV VARS:
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRO_PRICE_ID,
STRIPE_LIFETIME_PRICE_ID, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

### GROUP A — DB Migration (P10.7.1)
Add to users: stripe_customer_id, stripe_subscription_id, plan_activated_at
Add: certificates table (needed for sitemap + verify pages)

### GROUP B — SEO (P10.1.x + P10.2.x)
Modify: layout.tsx, page.tsx, dashboard pages → add metadata exports
New: src/app/sitemap.ts (dynamic — includes /u/[username] + /verify/[code])
New: src/app/robots.ts (disallow /dashboard, /api, /admin)
New: src/app/og/route.tsx (ImageResponse — next/og, zero new packages)
New: public/og/default.png (static fallback 1200×630)

### GROUP C — Landing Page (P10.3.x)
Redesign src/app/page.tsx — keep auth logic, replace visual layout
Sections: navbar, hero, for-whom, features grid, social proof, pricing preview,
  final CTA with PixelMascot emotion="excited", footer

### GROUP D — Pricing Page (P10.5.x)
New: src/app/pricing/page.tsx (public, no auth required)
Plans: Free / Pro (99 lei/lună) / Lifetime (599 lei)
New: src/components/pricing/pricing-cards.tsx

### GROUP E — Stripe Checkout (P10.6.x)
New: src/lib/stripe.ts (singleton)
New: src/app/api/stripe/checkout/route.ts (edge, Zod, auth)
New: src/app/pricing/success/page.tsx + cancel/page.tsx

### GROUP F — Webhook (P10.7.x)
New: src/app/api/stripe/webhook/route.ts (nodejs runtime — NOT edge)
Use req.text() for raw body (required for signature verification)
Handle: checkout.session.completed → update users.plan
Handle: customer.subscription.deleted → downgrade to free
Test: stripe listen --forward-to localhost:3000/api/stripe/webhook

### GROUP G — Content Gates (P10.8.x + P10.9.x)
New: src/components/course/upgrade-wall.tsx (Pixel emotion="sad")
Gate condition in lesson page RSC: plan === "free" && module_index > 2
AI Coach rate limit: count today's ai_coach_sessions rows, limit 5/day for free
Return 429 with { error: "RATE_LIMIT", upgradeUrl: "/pricing" }

### GROUP H — Billing Portal (P10.10.x)
New: src/app/api/stripe/portal/route.ts (nodejs runtime)
New: src/components/profile/billing-section.tsx
Show "Administrează abonamentul" for Pro only
Show "Acces pe viață" badge for Lifetime

## STRIPE TEST CARDS:
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002

## DONE WHEN:
- devpath.ro/sitemap.xml returns valid XML
- Stripe checkout flow works end-to-end in test mode
- Free users hit upgrade wall on module 3+
- Free users hit rate limit after 5 AI Coach messages
- npx tsc --noEmit passes
