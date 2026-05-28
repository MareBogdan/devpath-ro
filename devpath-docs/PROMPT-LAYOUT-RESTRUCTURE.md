# Layout Restructure Prompt — Final Version
# Copy everything below the line to Claude Code
---

---START PROMPT---
CONTEXT
Major layout restructure. Read DESIGN-SYSTEM.md and PROJECT-STATE.md first. Current layout: top navbar + left sidebar + content area. New layout: simplified top bar + full-width scroll sections + fixed bottom nav. This affects the dashboard page and the overall navigation system.

STEP 1 — ANALYZE AND PROPOSE (do NOT write code yet)

Read these files and understand the current architecture:
- src/app/(dashboard)/layout.tsx
- src/components/layout/navbar.tsx
- src/components/layout/sidebar.tsx
- src/app/(dashboard)/dashboard/page.tsx
- src/app/(dashboard)/courses/[courseSlug]/[lessonId]/page.tsx

Also run:
```bash
grep -r "Sidebar\|sidebar" src/ --include="*.tsx" -l
grep -r "Navbar\|navbar" src/ --include="*.tsx" -l
```

Then answer ONLY these 7 questions (2-3 sentences each):

1. **Sidebar removal scope:** Which files import the sidebar? Can we remove it from the (dashboard) layout.tsx without breaking sub-pages like /courses/[slug]/[lessonId]? Does the lesson page have its own navigation needs that the sidebar currently serves?

2. **Layout strategy:** Should we modify the existing (dashboard) layout.tsx or create a new route group? What's cleaner given the current structure?

3. **Bottom nav on sub-pages:** The bottom nav should appear on the dashboard AND on top-level sub-pages (/courses, /interview, /leaderboard). But on lesson pages (/courses/[slug]/[lessonId]) it should be HIDDEN to maximize reading space. How would you implement this conditional visibility?

4. **Data flow:** The current dashboard/page.tsx fetches user data, progress, courses. The new scroll page needs this data PLUS: top 5 leaderboard users (new query), badges earned count (new query), and per-day completion data for weekly streak dots (derivable from existing user_progress). What's your data fetching approach?

5. **Back navigation:** Sub-pages need a back arrow in the top bar. The top bar is shared across all pages. How do you conditionally show the back arrow and determine its destination (e.g., /courses/[slug]/lesson → /dashboard#cursuri)?

6. **Existing UI elements:** Current navbar has CommandPalette (Cmd+K) and ThemeToggle. The new top bar drops these from the visible UI. Proposal: keep Cmd+K working via keyboard shortcut only (render CommandPalette invisibly), move ThemeToggle into the #profil section settings. Do you see issues with this approach?

7. **Anything I'm missing:** Circular dependencies, breaking changes, edge cases?

⛔ STOP after answering. Do NOT proceed to implementation until I say "approved".

---

STEP 2 — IMPLEMENT (only after approval)

The new layout system has 3 layers:

### Layer 1 — Simplified top bar (ALL pages)

- Height: 48px, position: sticky top-0, z-50
- Left: logo — "DevPath" in aurora-primary-300 + ".ro" in aurora-accent-500
- Right: XP badge (text-aurora-gold-500, shows xp_points), avatar with existing dropdown logic (keep sign-out, keep settings link, add admin link for admin users)
- No navigation links — bottom nav handles this
- Background: aurora-bg-deepest with border-b aurora-border-subtle
- Invisible CommandPalette still rendered (Cmd+K works, no visible button)
- **On sub-pages:** show a back arrow (← icon) to the left of the logo. Back arrow links to /dashboard (or /dashboard#cursuri when coming from course pages). Use `usePathname()` to detect if we're on a sub-page (anything other than /dashboard).

Modify: src/components/layout/navbar.tsx

### Layer 2 — Fixed bottom nav (conditionally visible)

New component: `src/components/layout/bottom-nav.tsx`

- Position: fixed, bottom 0, full width, height 64px, z-50
- Background: aurora-bg-deepest/95 with backdrop-blur-xl, border-t aurora-border-subtle
- 5 items: Acasa (Home icon), Cursuri (BookOpen icon), Interviu (MessageSquare icon), Clasament (BarChart3 icon), Profil (User icon)
- Each item: icon (20px) + label below (text-[10px])
- Active: aurora-primary-300 with aurora-bg-interactive pill (rounded-xl)
- Inactive: aurora-text-tertiary

**Dual behavior:**
- When on `/dashboard`: clicking nav items calls `document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })` and updates URL hash via `history.replaceState`
- When on ANY other route: clicking nav items does `router.push('/dashboard#section-name')`
- Active state on `/dashboard`: determined by IntersectionObserver
- Active state on other routes: determined by route prefix matching

**Visibility rules:**
- SHOWN on: /dashboard, /courses (list page), /interview, /leaderboard, /portfolio, /profile, /roadmap, /glossar, /flashcards, /settings/*
- HIDDEN on: /courses/[slug]/[lessonId] (lesson view — maximize reading space), /onboarding, /admin/*
- Use `usePathname()` to check. Hide if pathname matches `/courses/*/` with 2+ segments after /courses/.

### Layer 3 — Dashboard scroll page (/dashboard)

`src/app/(dashboard)/dashboard/page.tsx` — server component, fetches ALL data (existing queries + new ones below).

**New queries to add (server-side in page component):**
```
// Top 5 users by XP for leaderboard
const { data: topUsers } = await supabase
  .from('users')
  .select('id, name, xp_points, level, avatar_url')
  .order('xp_points', { ascending: false })
  .limit(5);

// Current user's badge count
const { data: userBadges } = await supabase
  .from('user_badges')
  .select('id')
  .eq('user_id', user.id);

// Total badges available
const { data: allBadges } = await supabase
  .from('badges')
  .select('id');
```

Weekly streak dots: derive from existing `completedProgress` — group by day of week for the current week.

**7 section components in src/components/dashboard/:**

Each section is a `"use client"` component receiving data as props.
Page has `pb-20` (bottom nav space) and `pt-14` (top bar space).
Each section wraps content in:
```tsx
<motion.section
  id="section-name"
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.2 }}
  transition={{ duration: 0.5, ease: 'easeOut' }}
  className="min-h-[500px] flex items-center justify-center px-6 py-16"
>
  <div className="w-full max-w-[800px]">
    {/* section content */}
  </div>
</motion.section>
```

Sections should NOT have a fixed height or use scroll-snap. Free scrolling, natural browser behavior. Content determines height.

---

### Section 1 — #hero (hero-section.tsx)
**Props:** `{ userName, xpPoints, level, streakCount, lessonsCompleted, totalLessons, daysAbsent, lastLessonTitle, lastLessonHref }`

Content:
- AbsenceMascot (keep existing component — render if daysAbsent >= 3)
- Greeting: "Buna [time], [name]!" — name in aurora-primary-300
- 4 stat cards in a row (same Aurora styling as current dashboard):
  - XP: value in aurora-gold-500
  - Streak: value in aurora-streak-500
  - Lessons: value in aurora-accent-500 (show completed/total)
  - Level: value in aurora-primary-300 (show level name from LEVEL_NAMES)
- XP progress bar toward next level: gradient from-aurora-primary-500 to-aurora-accent-500
  - Import level thresholds from src/lib/gamification-constants.ts
- Weekly streak dots: 7 circles (Mon–Sun), filled in aurora-accent-500 if user completed a lesson that day, empty in aurora-border-subtle
- Background: 6 small circles (3-5px), pure CSS @keyframes floating upward at different speeds (6-9s), opacity 0.15-0.3, pointer-events: none, absolute positioned behind content

### Section 2 — #cursuri (courses-section.tsx)
**Props:** `{ courses: Array<{ id, slug, title, description, difficulty, totalLessons, completedLessons, nextLessonId?, nextLessonTitle? }> }`

Content:
- Section title: "Cursurile tale"
- Course cards: bg-aurora-bg-card, border-aurora-border-medium, rounded-[14px]
  - Top 3px gradient border (from-aurora-primary-500 to-aurora-accent-500)
  - Title, description (2 lines max), difficulty badge
  - Progress bar: gradient fill, show "X/Y lecții"
  - "Continuă lecția Y →" button if nextLessonId exists → links to /courses/[slug]/[lessonId]
  - "Începe cursul →" button if no progress yet → links to /courses/[slug]
- Ghost button at bottom: "Vezi toate cursurile →" → /courses

### Section 3 — #roadmap (roadmap-section.tsx)
**Props:** `{ courses: Array<{ title, totalLessons, completedLessons }> }`

Note: modules don't exist as DB entities. Use courses as the roadmap items. Each course is a roadmap node with status derived from:
- `done` = completedLessons === totalLessons
- `current` = completedLessons > 0 && completedLessons < totalLessons
- `locked` = completedLessons === 0 AND previous course not done (or first course is never locked)

Content:
- Vertical timeline with connector lines
- Each node: dot (teal=done, violet=current, gray=locked) + course title + progress text
- Ghost button: "Vezi roadmap complet →" → /roadmap

### Section 4 — #interviu (interview-section.tsx)
**Props:** `{ }` (no dynamic data needed — this is a CTA section)

Content:
- Interview simulator CTA card with large icon + description text
- "Începe interviul →" primary button → /interview
- 2 static preview flashcard cards (hardcoded Romanian AI terms — these are teasers, not real data)
- If you can easily query flashcard count from the page component, show "X flashcarduri disponibile"

### Section 5 — #clasament (leaderboard-section.tsx)
**Props:** `{ topUsers: Array<{ id, name, xpPoints, level, avatarUrl }>, currentUserId: string }`

Content:
- Top 5 rows with rank number, avatar, name, XP value (aurora-gold-500)
- Current user's row highlighted with aurora-accent-500/10 background
- If current user is not in top 5, show them at the bottom with their actual rank (you'd need a count query — optional, skip if complex)
- "Resetare săptămânală" small note at bottom in text-aurora-text-tertiary

### Section 6 — #portofoliu (portfolio-section.tsx)
**Props:** `{ userName, avatarUrl, level, xpPoints, streakCount, badgesEarned, totalBadges }`

Content:
- Preview card mimicking the public portfolio layout
- Avatar, name, level badge, XP, streak, "X/Y badge-uri"
- "Deschide portofoliul →" button → /profile (own profile) or /u/[username] if portfolio is public

### Section 7 — #profil (profile-section.tsx)
**Props:** `{ badgesEarned, totalBadges }`

Content:
- Menu items as clickable cards (bg-aurora-bg-card, border-aurora-border-medium, rounded-[14px]):
  - Setări profil → /profile
  - Badge-uri (shows "X câștigate") → /profile#badges (or just /profile)
  - Glosar → /glossar
  - Notificări → /settings/notifications
  - Tema (☀️/🌙 toggle) — renders ThemeToggle component here
  - Deconectare → triggers existing signOut() action (with confirmation? optional)

---

### Animation specs (framer-motion)
- Section entrance: as described in the motion.section template above
- Stat cards: staggered children with `transition={{ delay: index * 0.08 }}`
- Progress bar fills: `transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}`
- Course cards: hover `scale(1.01)` + border-aurora-border-strong, `transition={{ duration: 0.15 }}`
- Hero particles: pure CSS only, no framer-motion
- Bottom nav and top bar: NO animations — static, instant

---

### Files to create:
- `src/components/layout/bottom-nav.tsx`
- `src/components/dashboard/hero-section.tsx`
- `src/components/dashboard/courses-section.tsx`
- `src/components/dashboard/roadmap-section.tsx`
- `src/components/dashboard/interview-section.tsx`
- `src/components/dashboard/leaderboard-section.tsx`
- `src/components/dashboard/portfolio-section.tsx`
- `src/components/dashboard/profile-section.tsx`

### Files to modify:
- `src/app/(dashboard)/layout.tsx` — remove Sidebar import/render, add BottomNav, adjust padding
- `src/app/(dashboard)/dashboard/page.tsx` — rewrite render to use section components, add new queries, keep all existing queries
- `src/components/layout/navbar.tsx` — simplify to slim top bar (logo + XP + avatar + conditional back arrow)

### Files to NOT touch:
- `src/components/layout/sidebar.tsx` — do NOT delete, just stop importing it
- Any file in `src/app/(dashboard)/courses/`
- Any file in `src/app/api/`
- Any server actions (actions.ts, sync-action.ts)
- `src/components/course/*`, `src/components/minigame/*`, `src/components/gamification/*`
- content/, DESIGN-SYSTEM.md, CLAUDE.md, PROJECT-STATE.md
- tailwind.config.ts, globals.css, package.json

---

### DO NOT
- Do not use scroll-snap — free scrolling only
- Do not update URL hash on scroll — only on nav click (prevents history pollution)
- Do not delete sidebar component file — just remove from layout
- Do not modify any existing Supabase queries — only ADD new ones in dashboard/page.tsx
- Do not modify any course/lesson page components
- Do not install any new npm packages
- Do not change auth logic or middleware
- Do not change database schema

### EXPECTED RESULT
**Step 1:** Claude Code answers 7 architecture questions, waits for approval
**Step 2 (after approval):**
- /dashboard shows 7 scrollable Aurora-themed sections with real data
- Fixed bottom nav on all pages EXCEPT lesson view pages
- Slim top bar on all pages with conditional back arrow on sub-pages
- Sidebar removed from dashboard layout (file kept, just unused)
- Sections animate in on scroll (framer-motion whileInView)
- Bottom nav highlights active section (scroll page) or active route (sub-pages)
- Cmd+K still works via keyboard shortcut
- Theme toggle accessible in #profil section
- All existing routes still work unchanged
- npx tsc --noEmit passes
---END PROMPT---
