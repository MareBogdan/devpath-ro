# DevPath RO — Pages Redesign Proposal
**Date:** 2026-04-10
**Scope:** Courses, Interview, Roadmap, Profile
**Goal:** World-class learning platform UI — Duolingo gamification × Notion clarity × RPG depth

---

## Table of Contents

1. [Courses Page](#1-courses-page)
2. [Interview Page](#2-interview-page)
3. [Roadmap Page](#3-roadmap-page)
4. [Profile Page](#4-profile-page)
5. [Recommended Build Order](#5-recommended-build-order)
6. [Interview RAG Architecture](#6-interview-rag-architecture)
7. [Course Map Rendering — Canvas vs SVG vs CSS](#7-course-map-rendering)
8. [Skill Tree Rendering — Technology Decision](#8-skill-tree-rendering)

---

## 1. Courses Page

### 1.1 Visual Concept

The current courses page is a flat 3-column grid. The redesign transforms it into a **cinematic course universe** — each course feels like a portal you're about to enter.

**Above the fold — "Mission Control" header:**
A full-width banner with a subtle animated gradient (aurora-primary → aurora-accent at 15% opacity). Left side: "Cursurile Tale" title, a streak flame badge, XP count. Right side: a horizontal XP progress bar styled as a "mission fuel gauge" with tick marks at level thresholds.

**Course cards — "Portal" design:**
Each card is 400px tall (on desktop), with:
- A unique generative gradient header (not a photo — a CSS mesh gradient unique per course slug, deterministic from the slug string)
- Course difficulty encoded as a colored "signal ring" border (green=beginner, amber=intermediate, red=advanced) that animates a slow pulse
- A circular progress dial (SVG, not a bar) in the top-right corner of the header — fills clockwise as lessons complete
- Below the header: course title (xl bold), a 2-line description, a row of "tech pill" tags (e.g. "Python", "Neural Networks"), and a "Continue" / "Start" CTA button
- The CTA button shifts appearance: empty progress = solid violet "Începe"; partial = teal "Continuă" with a "→" arrow; complete = gold "Reia" with a star icon
- On hover: the card lifts (translateY -4px), the gradient header subtly rotates 3°, and the progress dial emits a short pulse animation
- "Completed" courses get a gold shimmer overlay on the header (CSS `background: linear-gradient(135deg, transparent 40%, rgba(253,203,110,0.3) 60%, transparent 80%)` looping)

**Empty state:**
A centered illustration (SVG inline, not a raster image) of an astronaut floating near a planet. Text: "Niciun curs disponibil momentan." No admin seed button visible in production.

**Filtering row:**
Below the header, a sticky row with 3 filter chips: "Toate", "În progres", "Completate" — styled as pill toggles. On mobile: horizontal scroll, no wrapping. Framer Motion `layout` prop so they resize smoothly.

---

### 1.2 Component Architecture

```
app/(dashboard)/courses/page.tsx          [RSC]
  └── CoursesClientShell.tsx             [Client — filter state]
      ├── CoursesMissionHeader.tsx        [Client — XP fuel gauge animation]
      │   └── XpFuelGauge.tsx            [Client — SVG animated bar]
      ├── CourseFilterTabs.tsx            [Client — "Toate / În progres / Completate"]
      └── CoursePortalGrid.tsx           [Client — AnimatePresence filtered grid]
          └── CoursePortalCard.tsx       [Client — hover, progress dial, CTA]
              ├── CourseMeshGradient.tsx [Client — deterministic CSS gradient from slug]
              ├── CourseProgressDial.tsx [Client — SVG circular progress]
              └── CourseDifficultyRing.tsx [Client — pulsing border ring]
```

**Props:**
```typescript
// CoursePortalCard
interface CoursePortalCardProps {
  id: string
  slug: string
  title: string
  description: string
  difficulty: "beginner" | "intermediate" | "advanced"
  totalLessons: number
  completedLessons: number
  nextLessonId: string | null
  isFree: boolean
}

// CourseProgressDial
interface CourseProgressDialProps {
  percent: number        // 0–100
  size?: number          // default 56
  animate?: boolean      // pulse on mount
}
```

**RSC vs Client split:**
- `page.tsx` fetches data server-side (same queries as today, keep parallelized Promise.all)
- `CoursesClientShell` receives the full array and owns filter state
- All card sub-components are client (animation, hover, onClick)

---

### 1.3 Data Model

No new tables needed. Existing queries suffice:
```typescript
// Already fetched in page.tsx (keep as-is from parallelized version)
courses: { id, slug, title, description, difficulty, is_free, order_index }
user_progress: { lesson_id, completed_at }
lessons: { id, course_id, order_index }
```

New derived data needed (computed in RSC, passed as props):
```typescript
interface CourseCardData {
  ...course,
  totalLessons: number
  completedLessons: number
  nextLessonId: string | null
  progressPercent: number    // 0–100
}
```

---

### 1.4 Dummy Content Plan

Currently 1 course (AI Fundamentals). For the redesign to look populated:
- **3 dummy course stubs** with `is_published = false` that still appear in the UI as "Coming Soon" cards with a lock icon overlay and blur effect
- Suggested stubs:
  1. "Machine Learning Practic" — intermediate, 24 estimated lessons
  2. "Computer Vision cu PyTorch" — advanced, 18 estimated lessons
  3. "NLP cu Transformers" — advanced, 20 estimated lessons
- These need only a row in `courses` table — no lessons needed
- The card renders normally but CTA becomes "În curând" (disabled button, grey)

---

### 1.5 Animation Spec

```typescript
// CoursePortalCard — mount stagger
const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.07, duration: 0.4, ease: "easeOut" }
  })
}

// CoursePortalCard — hover
whileHover={{ y: -4, transition: { duration: 0.2 } }}

// CourseProgressDial — SVG stroke-dashoffset animation
// strokeDasharray = circumference (2πr)
// On mount: animate from strokeDashoffset = circumference → (1 - percent/100) * circumference
// Duration 0.8s ease-out, delay = card index * 0.1

// CourseDifficultyRing — pulse
// CSS animation: opacity 0.6 → 1 → 0.6, 2s infinite
// Color: beginner = aurora-accent, intermediate = amber-400, advanced = red-500

// Filter tab switch — AnimatePresence layout
// Cards that leave: opacity 0, scale 0.9, transition 0.2s
// Cards that enter: opacity 1, scale 1, delay per index

// CTA button — hover micro-interaction
whileHover={{ scale: 1.03 }}
whileTap={{ scale: 0.97 }}
```

---

### 1.6 Technical Challenges

**Deterministic mesh gradients:** Generate a gradient from slug string using a simple hash. The hash maps to 2 aurora palette stops. Pure CSS — no canvas needed.

```typescript
function slugToGradient(slug: string): string {
  const hash = slug.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const stops = GRADIENT_PRESETS[hash % GRADIENT_PRESETS.length]
  return `linear-gradient(135deg, ${stops[0]}, ${stops[1]})`
}
```

**SVG progress dial performance:** Use `stroke-dashoffset` on a `<circle>` — 60fps guaranteed, no JS animation library needed. Only use Framer Motion for the number counting up.

**Mobile:** 1 column on mobile, 2 on md, 3 on xl. Cards are full-width on mobile (no horizontal scroll trap). Progress dial shrinks to 40px.

---

## 2. Interview Page

### 2.1 Visual Concept

The current interview page is a chat UI with a start screen. The redesign creates an **immersive assessment chamber** — think a dark room, a single spotlight on the "examiner", pulse effects as questions load.

**Pre-session screen — "Sala de Examinare":**
- Full dark surface (aurora-surface-deepest), not the standard page background
- Center: an animated 3D-style "AI examiner" avatar — NOT a 3D mesh, but a CSS-animated hexagonal container with a gradient face (aurora-primary gradient, animated slow rotation)
- Below avatar: 5 category "nodes" arranged in a pentagon (not a grid). Each node is a circle with an icon and label. Connecting lines between them (SVG) light up one-by-one on page load (staggered 0.15s each)
- Bottom: "Începe Simularea" button — large, violet, with a subtle scan-line animation on hover
- Difficulty selector above the button: 3 pills — Junior / Mid / Senior — selected state = filled primary

**Session screen — "The Chamber":**
- Left panel (30% width on desktop): The AI examiner "avatar" (same hexagonal container), now showing which category is being evaluated. Below it: a vertical timeline of the 5 questions — dots that fill in green as questions are answered.
- Right panel (70%): The conversation area. Messages styled differently:
  - AI messages: dark card with a subtle violet left border, small "DevPath AI" label + category badge in top-left
  - User messages: aurora-surface-elevated, right-aligned, aurora-accent text
- Bottom: Textarea + Submit. After submitting, the textarea shows a "Se evaluează..." shimmer state.
- Progress bar at top: thin, aurora-primary → teal gradient, fills across 5 steps

**Post-session report — "Raport de Misiune":**
- The examiner avatar "nods" (short keyframe animation: translateY -4px → 0px, repeat 2x)
- Score breakdown: 5 hexagonal gauges in a row (one per category), each fills with a radial gradient from 0 to score%
- Two columns: "Puncte forte" (green bullets), "De îmbunătățit" (amber bullets)
- Large CTA: "Încearcă din nou" + secondary "Vezi Roadmap-ul" linking to /roadmap
- A shareable "result card" — similar to Wordle share — that generates a text summary of scores

---

### 2.2 Component Architecture

```
app/(dashboard)/interview/page.tsx         [RSC — loads session history]
  └── InterviewChamber.tsx                [Client — full session state machine]
      ├── ExaminerAvatar.tsx              [Client — CSS animated hexagonal avatar]
      ├── PreSessionScreen.tsx            [Client — pentagon categories, start CTA]
      │   ├── CategoryPentagon.tsx        [Client — SVG pentagon + animated lines]
      │   └── DifficultySelector.tsx      [Client — Junior/Mid/Senior pills]
      ├── SessionScreen.tsx               [Client — split layout, chat, progress]
      │   ├── QuestionTimeline.tsx        [Client — 5-dot vertical tracker]
      │   ├── ChatPane.tsx               [Client — message bubbles]
      │   │   ├── AIMessage.tsx          [Client — category badge, formatted text]
      │   │   └── UserMessage.tsx        [Client — right-aligned bubble]
      │   └── AnswerInput.tsx            [Client — textarea, submit, shimmer]
      └── SessionReport.tsx              [Client — hexagonal score gauges]
          ├── HexScoreGauge.tsx          [Client — SVG radial fill gauge]
          ├── FeedbackColumns.tsx        [Client — strengths / improvements]
          └── ShareButton.tsx            [Client — copy text summary]
```

**State machine (in `InterviewChamber.tsx`):**
```typescript
type Phase = "pre" | "loading" | "session" | "evaluating" | "report"
```

---

### 2.3 Data Model

**Existing table:** No `interview_sessions` table exists. The current implementation is stateless (no persistence). For the redesign, add:

```sql
CREATE TABLE interview_sessions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  difficulty  text NOT NULL CHECK (difficulty IN ('junior', 'mid', 'senior')),
  scores      jsonb NOT NULL DEFAULT '{}',   -- { category: score, ... }
  report      jsonb,                          -- { strong_points: [], improvements: [] }
  started_at  timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own sessions" ON interview_sessions
  FOR ALL USING (auth.uid() = user_id);
```

**New migration file:** `supabase/migrations/20260410000003_interview_sessions.sql`

**Query pattern:**
```typescript
// Load last 3 session reports for "Your history" panel
const { data: pastSessions } = await supabase
  .from("interview_sessions")
  .select("difficulty, scores, completed_at")
  .eq("user_id", user.id)
  .not("completed_at", "is", null)
  .order("completed_at", { ascending: false })
  .limit(3)
```

---

### 2.4 Dummy Content Plan

**5 categories with 3 questions each per difficulty level (45 questions total):**

| Category | Icon | Junior sample | Senior sample |
|----------|------|--------------|---------------|
| Concepte AI | 🧠 | "Ce este un model de limbaj?" | "Compară RLHF cu DPO pentru alinierea LLM-urilor." |
| Machine Learning | ⚙️ | "Explică overfitting." | "Descrie gradient descent stochastic vs. Adam." |
| Rețele Neuronale | 🔗 | "Ce este backpropagation?" | "Explică attention mechanism în Transformers." |
| LLM & Prompting | 💬 | "Ce este prompt engineering?" | "Designează un chain-of-thought prompt pentru raționament multi-pas." |
| Comunicare | 🎤 | "Cum explici AI unui non-tehnic?" | "Prezintă un proiect ML unui board executiv." |

Store questions in a new `interview_questions` table (part of the RAG architecture — see Section 6).

---

### 2.5 Animation Spec

```typescript
// ExaminerAvatar — idle breathing
// CSS: transform: scale(1) → scale(1.02) → scale(1), 3s ease-in-out infinite

// ExaminerAvatar — "nodding" on report
const nod = { y: [0, -6, 0, -4, 0], transition: { duration: 0.8, ease: "easeInOut" } }

// CategoryPentagon — connecting lines (SVG strokeDashoffset trick)
// Each line: strokeDasharray = length, animate strokeDashoffset from length → 0
// Stagger: 0.15s between lines

// PreSessionScreen — category node entrance
const nodeVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (i: number) => ({
    scale: 1, opacity: 1,
    transition: { delay: i * 0.1, type: "spring", stiffness: 300, damping: 20 }
  })
}

// AIMessage entrance
{ initial: { x: -16, opacity: 0 }, animate: { x: 0, opacity: 1 }, transition: { duration: 0.3 } }

// UserMessage entrance
{ initial: { x: 16, opacity: 0 }, animate: { x: 0, opacity: 1 }, transition: { duration: 0.3 } }

// HexScoreGauge — radial fill (SVG arc)
// Animate stroke-dashoffset from circumference → (1 - score/100) * circumference
// Duration 1s, delay = category index * 0.15s, ease "easeOut"

// AnswerInput — evaluating shimmer
// CSS shimmer sweep left→right on the textarea border
// Duration 1.5s, loop while isEvaluating = true
```

---

### 2.6 Technical Challenges

**Pentagon layout:** Use SVG `<polygon>` with computed vertices from center + radius + angle offset (72° per node). Node circles are positioned with absolute CSS using the same math. Not D3 — pure SVG + CSS.

**Score gauge (hexagonal):** Use a regular hexagon clip-path with a fill percentage. Simpler than a circular arc for a hexagonal aesthetic. CSS clip-path: `polygon(...)` with JS-computed vertices based on score.

**Difficulty-specific question routing:** The RAG pipeline (Section 6) handles this. The frontend only sends `{ difficulty, category, previousAnswers }` to the API.

**Mobile:** On mobile, the split layout collapses. The examiner avatar hides (or minimizes to a small icon in the header). The category pentagon becomes a horizontal scroll strip.

---

## 3. Roadmap Page

### 3.1 Visual Concept

The current roadmap is a vertical list. The redesign creates a **serpentine learning map** — a literal path through a landscape, like Duolingo's world map but with a darker, space-journey aesthetic.

**The Map:**
- Full-page scrollable canvas area (not a literal `<canvas>` — see Section 7)
- Background: subtle starfield (CSS radial gradients, no animation to keep it performant)
- Courses are rendered as **"stations"** on a winding path
  - The path winds left → right → left (serpentine), one course per "row" of the zigzag
  - Path is an SVG `<path>` with a `stroke-dashoffset` animation that draws the line from start to the user's current progress
  - Completed stations: filled circle with course icon, aurora-accent color, gold glow shadow
  - Current station: larger circle, animated pulse ring (like a heartbeat), "YOU ARE HERE" label
  - Future stations: dimmer circle, dashed outline, subtle blur on the label
- Between stations: small "milestone" nodes (lesson count markers at 25%, 50%, 75%)
- Floating "XP bubbles" along the path show how much XP is earned per course

**Side panel (desktop):**
- 40% width right panel (or bottom sheet on mobile)
- When no station is selected: shows overall stats — total lessons completed, total XP, estimated completion date
- When a station is selected: course detail view slides in — title, description, progress bar, "Continue" CTA, lesson list collapsed (expandable)

**Active course highlight:**
- The currently-active course station pulses continuously
- A small animated character (CSS sprite or Lottie — see notes) "runs" along the path toward the active station on page load

---

### 3.2 Component Architecture

```
app/(dashboard)/roadmap/page.tsx           [RSC — fetch courses + progress]
  └── RoadmapExplorer.tsx                 [Client — full interactive map]
      ├── StarfieldBackground.tsx         [Client — CSS pure background layer]
      ├── LearningPathSVG.tsx             [Client — SVG path + station nodes]
      │   ├── PathDrawAnimation.tsx       [Client — stroke-dashoffset draw effect]
      │   ├── CourseStationNode.tsx       [Client — per-course circle + label]
      │   │   ├── StationPulseRing.tsx   [Client — heartbeat animation, current only]
      │   │   └── StationProgressArc.tsx [Client — small SVG arc around circle]
      │   └── XpBubble.tsx               [Client — floating XP label on path]
      └── RoadmapDetailPanel.tsx         [Client — selected course detail]
          ├── CourseDetailCard.tsx        [Client — title, description, progress]
          ├── EstimatedCompletion.tsx     [Client — days/weeks estimate]
          └── LessonListAccordion.tsx     [Client — expandable lesson list]
```

**Props:**
```typescript
// RoadmapExplorer receives:
interface RoadmapCourse {
  id: string
  slug: string
  title: string
  description: string
  difficulty: string
  totalLessons: number
  completedLessons: number
  nextLessonId: string | null
  estimatedMinutes: number     // sum of lessons.estimated_minutes
  xpReward: number             // totalLessons * 100 (or a course-level field)
}

interface RoadmapExplorerProps {
  courses: RoadmapCourse[]
  dailyGoalMinutes: number     // from user profile
  totalXp: number
  currentLevel: number
}
```

---

### 3.3 Data Model

**Existing tables suffice.** One addition needed:

```sql
-- Add xp_reward column to courses (optional — can compute as totalLessons * 100)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS xp_reward integer DEFAULT 0;

-- Add icon_emoji column to courses (for station node rendering)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS icon_emoji text DEFAULT '🤖';
```

**New query additions:**
```typescript
// Sum estimated_minutes per course for completion estimate
supabase
  .from("lessons")
  .select("course_id, estimated_minutes")
  // grouped in JS after fetch
```

---

### 3.4 Dummy Content Plan

With only 1 real course, the map looks sparse. Add 3 "coming soon" courses (locked stations) to make the path feel like a journey:

```
Station 1: AI Fundamentals (real, playable)
Station 2: Machine Learning Practic (locked — "2026 Q3")
Station 3: Computer Vision (locked — "2026 Q4")
Station 4: NLP cu Transformers (locked — "2027 Q1")
```

Locked stations render with:
- A lock icon overlay
- Release date label
- No CTA, no progress arc
- Slightly desaturated + blurred text

---

### 3.5 Animation Spec

```typescript
// LearningPathSVG — path draw on mount
// SVG path: stroke-dasharray = pathLength, stroke-dashoffset starts at pathLength
// Animate dashoffset → (1 - overallProgress) * pathLength
// Duration 1.5s, ease "easeInOut", delay 0.3s

// CourseStationNode — mount stagger
const stationVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (i: number) => ({
    scale: 1, opacity: 1,
    transition: { delay: i * 0.12, type: "spring", stiffness: 260, damping: 18 }
  })
}

// StationPulseRing (current station only)
// CSS: scale(1) → scale(1.5) → scale(1), opacity 1 → 0, 2s infinite
// Two rings with 1s offset for a heartbeat effect

// RoadmapDetailPanel — slide in from right
{ initial: { x: 40, opacity: 0 }, animate: { x: 0, opacity: 1 }, transition: { duration: 0.3, ease: "easeOut" } }

// XpBubble — float up gently
// CSS: translateY(0) → translateY(-6px) → translateY(0), 3s ease-in-out infinite
// Stagger by bubble index

// Character run animation (optional — use Lottie JSON of a running figure)
// Moves from station 0 to current station along a pre-computed path
// Speed: cover path in 1.2s
```

---

### 3.6 Technical Challenges

**SVG path math for serpentine:** Compute waypoints in JS, generate a cubic bezier SVG path. The path must be responsive — recompute on container resize using `ResizeObserver`. Use `useRef` on the container, `useState` for path `d` attribute.

```typescript
function buildSerpenginePath(stations: { x: number; y: number }[]): string {
  // Returns cubic bezier path string
  // Every 2 stations form one "zigzag row"
  // Control points offset horizontally from midpoint
}
```

**Performance:** The SVG is static once computed. Only `stroke-dashoffset` animates. No layout thrashing. Target 60fps on mobile.

**Responsive:** On mobile, the map becomes a vertical scroll (single column, stations stack top-to-bottom). The serpentine path becomes a straight vertical line with stations on alternating left/right sides.

See Section 7 for full Canvas vs SVG vs CSS analysis.

---

## 4. Profile Page

### 4.1 Visual Concept

The current profile page is minimal — an avatar, some stats, a referral section. The redesign creates a **"Pilot Dossier"** — a mission control view of everything the user has accomplished, with depth and pride.

**Hero section — "Identity Card":**
- Full-width card with a meshed gradient background (unique per user, derived from user ID)
- Large avatar (80px) with a level ring around it (SVG arc, aurora-primary color, fills to level%)
- Right of avatar: name (2xl bold), email (sm muted), plan badge ("Pro" / "Free" in gold/violet)
- Below name: 3 stat pills in a row — "🔥 {streak} zile", "⚡ {xp} XP", "🏅 {badges} insigne"
- The level ring number is shown inside the avatar as a floating badge (bottom-right)

**Learning DNA section:**
- Section title: "ADN-ul tău de învățare"
- `LearningDnaRadar` component (already built) — prominent, full width, or half-width with stats on the right
- Below it: a 2-column grid of per-module completion percentages with colored progress bars

**Activity section:**
- Section title: "Activitate"
- `ActivityHeatmap` component (already built) — full width
- Below it: 3 quick stats — "Total zile active", "Cea mai bună serie", "Zile active luna aceasta"

**Achievements section:**
- Section title: "Insigne câștigate"
- Badge grid: earned badges with gold glow, unearned badges with lock icon + blur
- Clicking a badge: tooltip/popover showing badge name, description, earn condition, date earned

**Referral section:**
- Redesigned as an "invite card" rather than a form field
- Left: a "send invitation" graphic (simple SVG illustration)
- Right: the referral link with copy button + share on Twitter/LinkedIn buttons
- Below: referral progress bar ("X din 3 prieteni invitați" → unlocks badge)

**Public profile CTA:**
- Prominent card at the bottom: "Arată lumii ce ai construit" — shows a preview thumbnail of their public profile card, with a "Copiați link-ul" + "Deschide" button

---

### 4.2 Component Architecture

```
app/(dashboard)/profile/page.tsx           [RSC — fetch profile + all stats]
  ├── ProfileHeroCard.tsx                  [Client — identity card, animated stats]
  │   ├── AvatarWithLevelRing.tsx          [Client — SVG level arc around avatar]
  │   └── UserStatPills.tsx               [Client — streak/XP/badges pills]
  ├── LearningDnaSection.tsx               [Client — radar + module breakdown]
  │   └── LearningDnaRadar.tsx            [Client — EXISTING, reuse as-is]
  ├── ActivitySection.tsx                  [Client — heatmap + quick stats]
  │   ├── ActivityHeatmap.tsx             [Client — EXISTING, reuse as-is]
  │   └── ActivityQuickStats.tsx          [Client — 3 stat cards below heatmap]
  ├── AchievementsSection.tsx             [Client — badge grid with lock state]
  │   ├── BadgeCard.tsx                   [Client — earned vs. locked variant]
  │   └── BadgeTooltip.tsx               [Client — popover on click]
  ├── ReferralInviteCard.tsx              [Client — invite graphic + share buttons]
  │   └── ReferralProgressBar.tsx        [Client — "X of 3 friends invited"]
  └── PublicProfileCTA.tsx               [Client — preview + link buttons]
```

**New components (all client):**
- `AvatarWithLevelRing` — wraps `next/image` with an SVG arc overlay
- `BadgeCard` — earned (gold glow, icon visible) vs locked (blur, lock icon, tooltip shows unlock condition)
- `ReferralInviteCard` — replaces the current form-field style referral section
- `ActivityQuickStats` — 3 stat cards derived from the heatmap data

**Reused components:**
- `LearningDnaRadar` (already integerated in profile from the low-severity fix)
- `ActivityHeatmap` (same)

---

### 4.3 Data Model

**New column needed:**
```sql
ALTER TABLE badges ADD COLUMN IF NOT EXISTS unlock_condition text;
-- e.g. "Completează primul curs", "Invită 3 prieteni"

ALTER TABLE badges ADD COLUMN IF NOT EXISTS description text;
-- Human-readable description shown in badge tooltip
```

**New queries needed:**
```typescript
// All badges (earned + unearned) for the full badge grid
const [earnedBadges, allBadges] = await Promise.all([
  supabase.from("user_badges").select("badge_id, earned_at, badges(*)").eq("user_id", user.id),
  supabase.from("badges").select("*")
])
// Merge: allBadges mapped to { ...badge, earned: earnedBadges.some(e => e.badge_id === badge.id), earnedAt }

// Activity stats for quick-stats panel
// Derived from user_progress data already fetched (completed_at timestamps)
// Compute in RSC: totalActiveDays, bestStreak (longest consecutive), thisMonthDays
```

---

### 4.4 Dummy Content Plan

**Badges:** The badge system needs pre-populated badge definitions:

| Slug | Name | Icon | Unlock Condition |
|------|------|------|-----------------|
| `first-lesson` | Prima Lecție | 🌱 | Completează prima lecție |
| `first-course` | Primul Curs | 🏆 | Completează primul curs |
| `streak-7` | Seria de 7 Zile | 🔥 | 7 zile consecutive de activitate |
| `streak-30` | Maestrul Lunii | ⚡ | 30 zile consecutive |
| `ambassador` | Ambasador | 🤝 | Invită 1 prieten |
| `recruiter` | Recrutorul | 🌐 | Invită 3 prieteni |
| `quiz-master` | Quiz Master | 🎯 | 10 quiz-uri perfecte |
| `night-owl` | Bufniță de Noapte | 🦉 | Completează lecție după 23:00 |
| `speed-learner` | Învățăcel Rapid | ⚡ | Completează 5 lecții într-o zi |

**Activity heatmap dummy data:** The heatmap needs at least 3 months of `user_progress` entries to look meaningful. Seed the dev DB with ~60 entries spread across the last 90 days for the test user.

---

### 4.5 Animation Spec

```typescript
// ProfileHeroCard — entrance
{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } }

// AvatarWithLevelRing — level arc draw
// SVG circle stroke-dashoffset: circumference → (1 - levelPercent/100) * circumference
// Duration 1s, delay 0.3s, ease "easeOut"

// UserStatPills — stagger entrance
const pillVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: (i: number) => ({
    scale: 1, opacity: 1,
    transition: { delay: i * 0.1, type: "spring", stiffness: 400, damping: 15 }
  })
}

// BadgeCard (earned) — hover
whileHover={{ scale: 1.08, rotate: [-1, 1, 0], transition: { duration: 0.2 } }}

// BadgeCard (locked) — hover shows tooltip
// No scale/rotate — keeps it visually "dead" to reinforce locked state

// ReferralProgressBar — fill animation
// On mount: width: 0% → actualPercent, duration 0.8s ease-out

// Section entrances — use IntersectionObserver (via Framer Motion whileInView)
{ initial: { opacity: 0, y: 32 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } }
```

---

### 4.6 Technical Challenges

**Level percentage:** XP thresholds per level must be defined. Recommend a formula: `xpForLevel(n) = 100 * n^1.5` (level 1 = 100XP, level 5 = 1118XP, level 10 = 3162XP). Store in a `lib/utils/levels.ts` utility.

**Badge grid layout:** Mixed earned/unearned states. Use `grid-cols-4 md:grid-cols-6` with a fixed card size (80px). Unearned cards are visually greyed out but not hidden — showing locked badges motivates the user.

**Heatmap data aggregation:** The heatmap needs one entry per active day. Aggregate in the RSC:
```typescript
const activeDays = new Set(completedProgress.map(p => p.completed_at?.split("T")[0]))
```
Pass the Set to ActivityHeatmap (it already accepts this format).

**Mobile:** The hero card stacks vertically. The radar chart shrinks to 280px. The activity heatmap scrolls horizontally (already handles this). Badge grid goes to 4 columns.

---

## 5. Recommended Build Order

### Phase A — Foundation (1–2 days)
Build shared components first — these are reused across all 4 pages:

1. `CourseProgressDial.tsx` — reused in Courses + Roadmap
2. `AvatarWithLevelRing.tsx` — reused in Profile + future leaderboard
3. `BadgeCard.tsx` — reused in Profile + Dashboard achievements

### Phase B — Courses Page (2–3 days)
Highest-impact, most-visited page. Also de-risks the course card pattern before Roadmap.

1. `CourseMeshGradient.tsx` (hash → gradient logic)
2. `CoursePortalCard.tsx` (hover, progress dial, CTA state)
3. `CourseFilterTabs.tsx` + `CoursePortalGrid.tsx` (filter + AnimatePresence)
4. `CoursesMissionHeader.tsx` + `XpFuelGauge.tsx`
5. Add 3 dummy "coming soon" courses to DB

### Phase C — Roadmap Page (3–4 days)
Most technically complex (SVG math). Build after Courses so the course data model is stable.

1. `buildSerpentinePath()` utility — pure math, testable in isolation
2. `CourseStationNode.tsx` (all variants: completed, active, locked)
3. `LearningPathSVG.tsx` (compose nodes onto path)
4. `RoadmapDetailPanel.tsx` (slide-in panel on station click)
5. `RoadmapExplorer.tsx` (wire everything together)

### Phase D — Profile Page (2–3 days)
Additive — mostly composing existing components with new styling.

1. `AvatarWithLevelRing.tsx` (if not already done in Phase A)
2. `ProfileHeroCard.tsx`
3. `ActivitySection.tsx` + `LearningDnaSection.tsx` (wrap existing components)
4. `AchievementsSection.tsx` + `BadgeCard.tsx`
5. `ReferralInviteCard.tsx`
6. DB: add `unlock_condition` + `description` to badges, seed badge definitions

### Phase E — Interview Page (3–4 days)
Most product complexity (RAG, scoring, sessions). Build last when infra is stable.

1. DB migration for `interview_sessions`
2. API route: `/api/interview/start` + `/api/interview/answer` + `/api/interview/finish`
3. `ExaminerAvatar.tsx` (CSS-only animated hexagon)
4. `CategoryPentagon.tsx` (SVG pentagon)
5. `PreSessionScreen.tsx` + `DifficultySelector.tsx`
6. `SessionScreen.tsx` (ChatPane + AnswerInput + QuestionTimeline)
7. `SessionReport.tsx` + `HexScoreGauge.tsx`
8. `InterviewChamber.tsx` (state machine wiring)

### Critical path / shared dependencies

```
BadgeCard ──────────────────────────────── Profile
CourseProgressDial ────┬─────────────────── Courses
                       └─────────────────── Roadmap
buildSerpentinePath ──────────────────────── Roadmap
LevelUtils ──────────────────────────────── Profile + all pages
```

---

## 6. Interview RAG Architecture

### 6.1 Overview

The current interview uses a monolithic system prompt with hardcoded question logic. The redesign uses a **Retrieval-Augmented Generation** pipeline where questions are sourced from a curated knowledge base, and AI evaluation is grounded in domain-specific rubrics.

### 6.2 Knowledge Base Structure

**Format:** Each knowledge base entry is a structured document:

```typescript
interface InterviewKBEntry {
  id: string
  category: "concepte-ai" | "machine-learning" | "retele-neuronale" | "llm-prompting" | "comunicare"
  difficulty: "junior" | "mid" | "senior"
  question: string
  ideal_answer_points: string[]    // bullet points the ideal answer should cover
  evaluation_rubric: string        // natural language rubric for AI scoring
  keywords: string[]               // expected technical terms
  follow_up: string | null         // optional follow-up if answer is shallow
}
```

**Sources:**
1. Manually curated question bank (primary) — 45 questions as described in Section 2.4
2. Lesson content extraction — run an indexing job that extracts key concepts from each lesson's `content_md` and generates Q&A pairs
3. External references (optional, future) — arXiv abstracts, ML paper summaries

**Volume for launch:** 45 questions across 5 categories × 3 difficulty levels.

### 6.3 Embedding Model Choice

**Recommendation: `text-embedding-3-small` (OpenAI)**

Rationale:
- 1536 dimensions, excellent semantic search quality
- $0.02/1M tokens — negligible cost for a knowledge base of ~45 entries
- Native integration with Supabase `pgvector` via the existing OpenAI client
- Already in the project's dependency graph (`@ai-sdk/openai`)

**Alternative:** `nomic-embed-text` (via Ollama for local dev) — useful for development to avoid API costs, with parity on Romanian text.

### 6.4 Vector Store — pgvector in Supabase

**Decision: pgvector in Supabase (not external Pinecone/Weaviate)**

Rationale:
- Zero additional services — Supabase already supports the `pgvector` extension
- RLS-aware — can filter by user's difficulty level and category in the same query
- No additional API keys, pricing, or infrastructure complexity

**Migration:**
```sql
-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Knowledge base table
CREATE TABLE interview_questions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category    text NOT NULL,
  difficulty  text NOT NULL CHECK (difficulty IN ('junior', 'mid', 'senior')),
  question    text NOT NULL,
  ideal_points jsonb NOT NULL DEFAULT '[]',
  rubric      text NOT NULL,
  keywords    text[] NOT NULL DEFAULT '{}',
  follow_up   text,
  embedding   vector(1536),
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX ON interview_questions USING ivfflat (embedding vector_cosine_ops);
```

**New migration file:** `supabase/migrations/20260410000004_interview_rag.sql`

### 6.5 Retrieval Strategy

**Per-question retrieval flow:**
```
1. User selects difficulty + starts session
2. For each of 5 categories:
   a. Generate a "topic seed" embedding from the category name + previous answers
   b. Query pgvector: SELECT * FROM interview_questions
      WHERE category = $category AND difficulty = $difficulty
      ORDER BY embedding <-> $query_embedding LIMIT 3
   c. Pick the question not yet used in this session (exclude answered IDs)
3. Retrieve the matching question + its rubric + ideal_points
4. Inject into the system prompt as grounding context
```

**Context injection into system prompt:**
```
CURRENT QUESTION CONTEXT:
Question: {question}
Ideal answer should cover: {ideal_points.join(", ")}
Evaluation rubric: {rubric}
Expected technical terms: {keywords.join(", ")}

User's answer: {userAnswer}

Score the answer 0–100 based on the rubric above. Return JSON: { score: number, feedback: string, strong_points: string[], improvements: string[] }
```

This grounds the AI evaluation in domain-specific criteria rather than general knowledge.

### 6.6 Indexing Pipeline

**One-time script:** `scripts/index-interview-questions.ts`
```typescript
// For each question in the knowledge base:
// 1. Generate embedding: await openai.embeddings.create({ model: "text-embedding-3-small", input: question })
// 2. Upsert into interview_questions table with the embedding vector
// Run: npx tsx scripts/index-interview-questions.ts
```

**Incremental updates:** When new questions are added, re-run the indexing script. It uses `upsert` on the `id` field — idempotent.

### 6.7 API Route Design

```
POST /api/interview/start    — creates session, returns session_id
POST /api/interview/answer   — { session_id, category, answer } → retrieves rubric, evaluates, returns { feedback, score }
POST /api/interview/finish   — { session_id } → generates final report, saves to DB
GET  /api/interview/sessions — returns last 5 completed sessions for the history panel
```

**Cost estimate per session:**
- 5 embeddings for retrieval (5 × ~50 tokens) = 250 tokens = $0.000005
- 5 evaluation calls (5 × ~800 tokens) = 4000 tokens = ~$0.006
- Total per session: ~$0.006 (negligible)

---

## 7. Course Map Rendering

### 7.1 Options Analysis

**Option A: HTML/CSS (current-style, vertical list)**
- Pros: Zero complexity, accessible, fast
- Cons: No visual path, no spatial sense of progression, zero "wow" factor
- Verdict: ❌ Reject — doesn't achieve the visual goal

**Option B: `<canvas>` (2D Canvas API or Three.js)**
- Pros: Unlimited visual complexity, smooth animations, pixel-perfect control
- Cons: Not accessible (no DOM nodes for screen readers), no CSS styling, no click events on drawn elements (must manually compute hit areas), hard to make responsive, Three.js adds ~500KB to bundle
- Verdict: ❌ Reject for primary map — overkill, accessibility non-starter

**Option C: D3.js**
- Pros: Powerful graph layout algorithms, force-directed positioning, path math utilities
- Cons: 90KB bundle size, steep learning curve, fighting against React's rendering model, d3-selection conflicts with React's virtual DOM
- Verdict: ❌ Reject — bundle cost not justified for a simple serpentine path

**Option D: React Flow**
- Pros: Purpose-built for node graphs, handles drag/pan/zoom, TypeScript-native, React-native
- Cons: 180KB+ bundle, designed for directed graphs (flowcharts), heavy for a linear learning map, visual style requires significant override work to match Aurora design system
- Verdict: ❌ Reject — wrong tool for a linear path with no branch logic

**Option E: Pure SVG (React)**
- Pros: DOM nodes (full accessibility, CSS, click events), Framer Motion animates SVG attributes natively, responsive (viewBox + preserveAspectRatio), zero additional dependencies, inline in React JSX
- Cons: Math-heavy for path generation (but manageable), SVG coordinate system requires care on resize
- Verdict: ✅ **RECOMMENDED**

### 7.2 Chosen Approach: Inline React SVG

**Path generation:**
```typescript
// Compute station (x, y) positions in a serpentine layout
function computeStationPositions(
  courseCount: number,
  containerWidth: number,
  rowHeight: number = 180
): { x: number; y: number }[] {
  const margin = 80
  const positions: { x: number; y: number }[] = []
  for (let i = 0; i < courseCount; i++) {
    const row = Math.floor(i / 2)
    const isEven = i % 2 === 0
    const x = isEven ? margin : containerWidth - margin
    const y = row * rowHeight + rowHeight / 2
    positions.push({ x, y })
  }
  return positions
}

// Generate cubic bezier SVG path through all stations
function stationsToPath(stations: { x: number; y: number }[]): string {
  // Returns: "M x0,y0 C cx1,cy1 cx2,cy2 x1,y1 C ..."
}
```

**Accessibility:** Each station node is a `<g role="button" tabIndex={0}>` with `aria-label={courseName + " — " + progressText}`. The SVG itself has `role="img" aria-label="Harta de învățare"`.

**Responsive:** The SVG uses `viewBox="0 0 400 {totalHeight}"` with `width="100%"`. Positions are computed relative to 400 units wide. On resize, the SVG scales automatically.

---

## 8. Skill Tree Rendering

### 8.1 Context

"Skill tree" in the context of this roadmap means the **courses as connected nodes** — not a branching RPG skill tree (which would require a different data model). The current roadmap is linear (one course → next course). This analysis addresses the current linear path rendering. A true skill tree with branches is a future feature (when multiple learning tracks are introduced).

### 8.2 Options Analysis

**Option A: D3-Hierarchy / D3-Force**
- Best for: branching trees, force-directed graphs
- For a linear path: massive overkill
- Verdict: ❌ future consideration only (when branching tracks exist)

**Option B: React Flow (node graph)**
- Best for: interactive flowcharts, editable graphs
- For a read-only linear path: heavy bundle for no gain
- Verdict: ❌ same as Section 7

**Option C: Pure SVG (same as course map)**
- Works perfectly for the linear case
- Same math applies (just no serpentine — straight vertical line with alternating sides on mobile)
- Verdict: ✅ **Use the same SVG approach as course map**

**Option D: CSS-only (no SVG)**
- Use CSS `::before`/`::after` pseudo-elements for the connecting line
- Stations are `<div>` elements with `position: relative`
- Pros: simplest, no math, fully accessible
- Cons: limited animation options (only CSS transitions), hard to draw a curved path, no Framer Motion path animation
- Verdict: ✅ **Acceptable fallback** for mobile where the serpentine becomes a straight vertical line

### 8.3 Recommendation

**Desktop:** Pure React SVG (same approach as Section 7). The serpentine path is the key visual differentiator.

**Mobile (< 768px):** Switch to CSS-only vertical stack. The SVG path hides, stations become `<div>` elements with a thin vertical `border-left` line. Much simpler, faster, and touch-friendly.

```typescript
// In RoadmapExplorer.tsx:
const isMobile = useMediaQuery("(max-width: 768px)")
return isMobile ? <RoadmapMobileStack courses={courses} /> : <LearningPathSVG courses={courses} />
```

### 8.4 Future: True Branching Skill Tree

When multiple learning tracks exist (e.g., "AI Track" → branches into "Vision Track" + "NLP Track"):
- **Then** use React Flow with `@xyflow/react` — it's the right tool for DAG rendering
- Aurora-style custom node components slot into React Flow's node renderer
- Keep the `buildSerpentinePath` logic for linear sequences within each track

---

## Appendix: Animation Library Usage Summary

| Use case | Library | Why |
|----------|---------|-----|
| Card entrance stagger | Framer Motion | `variants` + `staggerChildren` |
| SVG path draw | Framer Motion `animate` on `strokeDashoffset` | Native SVG attribute support |
| SVG arc (progress dials) | Framer Motion `animate` on `strokeDashoffset` | Same pattern, composable |
| Hover micro-interactions | Framer Motion `whileHover` | Co-located with component |
| CSS pulse rings | Tailwind `animate-ping` | Zero JS overhead |
| Shimmer loading states | Tailwind `animate-pulse` | Zero JS overhead |
| Scroll-triggered sections | Framer Motion `whileInView` | `viewport: { once: true }` |
| Avatar level ring | Framer Motion on SVG | Consistent with other arcs |
| Count-up numbers | Framer Motion `useSpring` → display value | Smooth, no dependency |

**Rule:** Use Tailwind CSS animations for simple, looping effects (pulse, ping, shimmer). Use Framer Motion for entrance/exit and interaction animations. Never use both on the same element.

---

*End of proposal — ready for implementation.*
