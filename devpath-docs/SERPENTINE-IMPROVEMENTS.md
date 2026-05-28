# Serpentine Path — Improvement Proposal

> Analysis of `src/components/ui/serpentine-path.tsx` (960 lines)
> Date: 2026-04-11

---

## 1. Visual Polish

### 1a. Locked lesson nodes are nearly invisible
- **Current:** Locked lessons have `opacity: 0.42` and `background: #E5E7EB` — they almost disappear against white backgrounds and feel disconnected from the path.
- **Better:** Use the module color at low saturation (e.g., `${color}22` background with `${color}44` border) so locked nodes still feel "part of" their module, just dimmed. Opacity 0.55 minimum.
- **Implement:** In `nodeStyle()`, change the locked branch to derive from `color` instead of hardcoded gray.
- **Priority:** 🔴 Must-have

### 1b. Checkpoint labels can clip at page edges
- **Current:** Checkpoint labels are positioned with `maxWidth: 110` centered under the node. When a checkpoint sits near EDGE_L (48) or EDGE_R (452), the label can extend beyond the SVG/container boundary.
- **Better:** Detect when a checkpoint is within 60px of an edge and shift the label inward (text-align left/right) instead of centering.
- **Implement:** Add `const labelAlign` logic in GameNode based on `pos.x < 100 ? "left" : pos.x > 400 ? "right" : "center"`.
- **Priority:** 🟡 Nice-to-have

### 1c. Module zone labels overlap with nodes on left-going modules
- **Current:** Zone labels are anchored at `(minX - 36, minY - 22)`. For right-to-left modules, `minX` is the rightmost lesson (at EDGE_L), so the label ends up far-left — but the module's first node is far-right. The label floats disconnected from the module start.
- **Better:** Anchor zone labels at the module's first node position, not the bounding box corner. For right-going modules, top-left is correct. For left-going modules, use top-right.
- **Implement:** Store `firstX/firstY` in the zone data and compute label position based on module sweep direction.
- **Priority:** 🔴 Must-have

### 1d. No visual distinction between lesson nodes within a module
- **Current:** All completed lessons look identical (solid circle + checkmark). You can't tell which lesson is #1 vs #5 without hovering for the tooltip.
- **Better:** Show a tiny lesson number (1–5) below each lesson node in a `text-[8px]` label, similar to how checkpoints always show labels. Only show for non-locked nodes to avoid visual clutter.
- **Implement:** Add a small `<span>` in GameNode showing `lessonInMod + 1` below lesson nodes (completed/current only).
- **Priority:** 🟢 Future

### 1e. Connecting path bézier perp offset can look odd on horizontal segments
- **Current:** `segPath()` uses `0.14 * len` perpendicular offset. For mostly-horizontal lesson-to-lesson connections (~80px apart, ~20px vertical), this creates a 12px upward or downward bulge. The arc direction alternates depending on the perpendicular normal, which can look slightly random.
- **Better:** Reduce the perpendicular factor to `0.08 * len` for a subtler curve. Or make the arc always bulge "outward" from the module center (upward for modules on the top half, downward for bottom half).
- **Implement:** Change `const perp = 0.14 * len` to `0.09 * len` in `segPath()`.
- **Priority:** 🟡 Nice-to-have

---

## 2. Animation Quality

### 2a. Current node pulse feels subtle — could be more "magnetic"
- **Current:** `sp-lesson-pulse` scales 1→1.06→1 over 2s. The 6% scale change is barely noticeable at 46px.
- **Better:** Add a soft glowing ring that expands and fades (CSS `box-shadow` animation) alongside the scale pulse. The glow should use the module color. Scale could increase to 1.08.
- **Implement:** Add a `::before` pseudo-element with CSS `@keyframes sp-lesson-glow { 0%,100% { box-shadow: 0 0 0 0 ${color}44 } 50% { box-shadow: 0 0 0 8px ${color}00 } }`. Alternatively, an SVG ring expanding/fading (like CPPing but smaller, single ring).
- **Priority:** 🔴 Must-have

### 2b. Particle colors don't match module colors
- **Current:** Particles use a fixed 5-color palette: `["#FFD166", "#8B5CF6", "#14B8A6", "#F59E0B", "#3B82F6"]` regardless of which module they're flowing through.
- **Better:** Particles could gradually shift color as they flow through different module zones. Or at minimum, the particle palette should include all 6 module colors.
- **Implement:** Add `"#6366F1"` (indigo) and `"#10B981"` (emerald) to the palette. Full module-aware coloring would require splitting the particle path per module — lower priority.
- **Priority:** 🟡 Nice-to-have

### 2c. Checkpoint orbital radius too large for compact layout
- **Current:** CPOrbits uses radii of 46, 54, 40. CPPing expands from r=44 to r=90. With the compact serpentine layout (~40px between nodes vertically), the 90px ping radius will visually overlap neighboring lesson nodes.
- **Better:** Scale orbital/ping radii down: CPOrbits to 38, 44, 34. CPPing from r=36 to r=65.
- **Implement:** Reduce hardcoded radius values in CPOrbits and CPPing.
- **Priority:** 🔴 Must-have

### 2d. Stagger entrance could be faster on locked nodes
- **Current:** All nodes stagger at `idx * 0.026s`. For 36 nodes, the last node appears at 0.94s after the first. The completed/current nodes are the interesting ones, but they stagger at the same rate as locked ones.
- **Better:** Use a non-linear stagger: fast for locked nodes (0.016s), normal for completed (0.026s), slightly slower for current (0.04s). This makes completed nodes "roll in" with weight while locked nodes quickly fill in the background.
- **Implement:** Compute `staggerDelay` based on `node.status` instead of flat `idx * 0.026`.
- **Priority:** 🟡 Nice-to-have

---

## 3. Light Mode

### 3a. Locked node background `#E5E7EB` is almost invisible on white
- **Current:** Locked lessons use `background: #E5E7EB` (gray-200) and `border: 1.5px solid #D1D5DB` (gray-300) — on white backgrounds these are barely visible even at full opacity, and at 0.42 opacity they nearly vanish.
- **Better:** Use `background: #F3F4F6` (gray-100) with `border: 2px solid #D1D5DB` (gray-300) at opacity 0.6. Or use the module color at very low opacity.
- **Implement:** In `nodeStyle()`, change the locked styles for light mode. Best approach: derive from module color like `background: ${color}15, border: 2px solid ${color}30, opacity: 0.55`.
- **Priority:** 🔴 Must-have (same as 1a — fix together)

### 3b. Completed path glow is invisible in light mode
- **Current:** The glow path (`strokeWidth={9}, opacity={0.14}`) with `feGaussianBlur(9)` is barely perceptible on white. The glow effect essentially only works in dark mode.
- **Better:** Increase light-mode glow opacity to 0.22 or add a dedicated CSS class that adjusts opacity based on theme.
- **Implement:** Add `className="sp-path-glow"` to the glow path. In globals.css: `:root:not(.dark) .sp-path-glow { opacity: 0.22 }`.
- **Priority:** 🟡 Nice-to-have

### 3c. Module zone backgrounds are barely visible in light mode
- **Current:** Zone gradients peak at 13% opacity, which is fine on dark backgrounds but nearly invisible on white.
- **Better:** Use CSS `color-scheme` awareness in the gradient or increase light-mode zone opacity. A `<style>` block in the SVG could adjust `stop-opacity` based on a CSS variable.
- **Implement:** Create two gradient variants per zone — one for dark (current), one for light (0.18 center opacity). Switch based on a `data-theme` attribute or CSS custom property.
- **Priority:** 🟡 Nice-to-have

---

## 4. Hover/Interaction

### 4a. No hover glow on lesson nodes
- **Current:** Hovering a completed/current lesson only shows a tooltip and a subtle framer-motion scale (1.12). There's no color feedback — the node doesn't "light up."
- **Better:** On hover, add a soft `box-shadow` glow in the module color. Like: `0 0 16px ${color}55` expanding from 0 on mouseEnter.
- **Implement:** Add `onMouseEnter` style change via state, or use CSS `:hover` with a `transition: box-shadow 0.2s`. Since `nodeStyle` is inline, the simplest approach is adding a hover class.
- **Priority:** 🟡 Nice-to-have

### 4b. Locked node shake feels punitive
- **Current:** Hovering a locked node triggers a shake animation `x: [0, -4, 4, -3, 3, 0]` plus a 🔒 tooltip. The shake feels like "you did something wrong."
- **Better:** Replace the shake with a gentler "nudge" — a single subtle left-right motion (2px) plus a slight opacity dip. The tooltip alone communicates "locked." The shake should only trigger on CLICK, not hover.
- **Implement:** Move the shake trigger from `onEnter` to `onClick` for locked nodes. Reduce amplitude to `[-2, 2, 0]`.
- **Priority:** 🟡 Nice-to-have

### 4c. Tooltip position doesn't adapt to viewport edges
- **Current:** Tooltips always render `bottom-full left-1/2 -translate-x-1/2` (centered above the node). For nodes near the left or right edge, the tooltip may extend off-screen.
- **Better:** Detect when the node is within 100px of a container edge and shift the tooltip horizontally. Use `left-0` for left-edge nodes, `right-0` for right-edge nodes.
- **Implement:** In GameTooltip, receive `pos.x` as a prop and conditionally adjust the CSS positioning. Adjust the caret position to match.
- **Priority:** 🟡 Nice-to-have

---

## 5. Performance

### 5a. SVG zone blur filter renders 6 times
- **Current:** Each of the 6 zone `<rect>` elements has `filter={url(#zbf-...)}` applying `feGaussianBlur(18)`. Blur filters are expensive — this means 6 independent blur passes per frame on paint.
- **Better:** Group all zone rects into a single `<g>` with one filter application. The blur will feather all zones' edges simultaneously in one pass. Visually identical, half the GPU cost.
- **Implement:** Wrap zone rects in `<g filter={...}>` and remove individual rect filters.
- **Priority:** 🔴 Must-have

### 5b. AmbientStars creates 22-36 SMIL `<animate>` elements
- **Current:** Each ambient star has its own `<animate>` for opacity. With 22 stars (normal) or 36 (spectacular), that's 22-36 independent SMIL animations running indefinitely.
- **Better:** Use a single CSS `@keyframes` animation with varying `animation-delay` per star. CSS animations are GPU-composited; SMIL animations force SVG repaints.
- **Implement:** Add `.ambient-star { animation: star-twinkle var(--dur) var(--delay) infinite }` and set CSS custom properties per star via `style` attribute. Remove `<animate>` elements.
- **Priority:** 🟢 Future (impact is low — these are simple opacity animations)

### 5c. Particle filter group wraps all particles
- **Current:** `<g filter={url(#pf-...)}>` wraps all 7-14 particles. The filter includes `feGaussianBlur(1.8)` + `feMerge`. Since particles are `animateMotion` elements constantly moving, this filter re-evaluates every frame.
- **Better:** Apply the glow filter to individual particles or (better) skip the filter entirely and use `fill-opacity` plus a slightly larger radius to simulate the glow effect. The visual difference is negligible at r=4.
- **Implement:** Remove the `<g filter>` wrapper. Increase particle `r` by 1 and reduce `opacity` to 0.65 to approximate the glow look without a filter.
- **Priority:** 🟡 Nice-to-have

---

## 6. Missing Details

### 6a. No visual progress indicator per module
- **Current:** You can only tell module completion by counting completed lesson nodes. There's no at-a-glance progress bar or fraction indicator.
- **Better:** Add a thin progress arc around each checkpoint node showing `completedLessons / totalLessons`. For completed checkpoints: full ring in gold. For current/locked: partial ring showing progress fraction.
- **Implement:** SVG `<circle>` with `stroke-dasharray` and `stroke-dashoffset` to create a progress arc. Positioned behind the checkpoint node. Requires passing lesson completion count to the checkpoint.
- **Priority:** 🔴 Must-have

### 6b. No "you are here" indicator beyond the pulse
- **Current:** The current lesson node has `sp-lesson-pulse` (subtle scale), and the current checkpoint has `sp-cp-ring` (rotating ring) + CPPing (expanding circles). For lessons, the pulse alone may not draw the eye on a busy map.
- **Better:** Add a small bouncing arrow or chevron pointing at the current lesson node. Like the classic "▼" marker that games use to show your current position. Should be animated — gentle float up-down.
- **Implement:** In GameNode, when `node.status === "current" && !isCP`, render an absolutely positioned `<div>` above the node with a CSS `@keyframes sp-arrow-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }`.
- **Priority:** 🟡 Nice-to-have

### 6c. Completed lesson icons are all checkmarks — no memory of original icon
- **Current:** Once a lesson is completed, the icon changes to `<Check>`. The original icon (Brain, Code2, etc.) is lost visually.
- **Better:** Show the original icon instead of the checkmark, with a small ✓ badge in the corner (like a "done" overlay). This preserves the visual identity of each lesson.
- **Implement:** In `iconEl`, when `!isCP && status === "completed" && Icon`, render the original icon with a `<div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center"><Check className="w-2 h-2 text-white" /></div>` overlay.
- **Priority:** 🟡 Nice-to-have

### 6d. No node completion micro-animation
- **Current:** When `onNodeComplete` fires (status changes from current → completed), nothing visual happens. The node just instantly switches from "current" to "completed" styling.
- **Better:** Trigger a brief burst animation: the node scales up to 1.3, flashes white, then settles to completed state. Gold particles burst outward (3-5 particles). This is the "dopamine hit" moment.
- **Implement:** Track `justCompleted` state via `prevStatuses` ref. When detected, apply a CSS class `sp-just-completed` with a 600ms animation. Add particle burst via temporary SVG circles with `animateTransform` that auto-remove after 1s.
- **Priority:** 🔴 Must-have — this is the single most impactful "game feel" feature missing

---

## 7. The Checkpoint Experience

### 7a. No checkpoint unlock sequence
- **Current:** When the last lesson in a module completes and the checkpoint becomes "current," there's no fanfare. The checkpoint just silently gains the rotating ring and radar ping.
- **Better:** When a checkpoint transitions from locked → current, trigger a brief "unlock" animation sequence:
  1. The lock icon inside the checkpoint shrinks and fades (200ms)
  2. The checkpoint border flashes the module color (300ms)
  3. A circular shockwave expands from the checkpoint (like CPPing but once, 500ms)
  4. The checkpoint reveals its unlocked icon/ring
- **Implement:** Track checkpoint status transitions in the `onNodeComplete` effect. Add a `justUnlocked` state to GameNode for checkpoints. Apply a one-shot CSS animation class.
- **Priority:** 🟡 Nice-to-have

### 7b. Completed checkpoint could show module stats
- **Current:** Completed checkpoint tooltip shows "⭐ {moduleName} completat!" and the sublabel.
- **Better:** The tooltip could show richer data: total XP earned, time spent, or a star rating (1-3 stars based on performance). This requires `metadata` prop support.
- **Implement:** Read from `node.metadata` fields like `xp`, `stars`, `time` and render in the tooltip. No layout changes needed — just enriched tooltip content.
- **Priority:** 🟢 Future

---

## 8. Mobile Experience

### 8a. Mobile layout is too simple — just a vertical list
- **Current:** MobileMap renders a straight vertical column of nodes with ±28px alternating offset. No SVG paths, no particles, no zone backgrounds. Feels like a completely different (inferior) component.
- **Better:** Keep the vertical layout but add:
  1. Thin SVG connecting lines between nodes (straight, not bézier)
  2. Module color dividers between modules
  3. Subtle zone background tints behind each module group
  4. Lesson labels visible (not just checkpoints)
- **Implement:** Wrap MobileMap in a `<div className="relative">` with colored background bands per module. Add thin colored `<div>` connectors between nodes.
- **Priority:** 🟡 Nice-to-have

### 8b. No tooltips on mobile
- **Current:** The GameTooltip only renders on desktop (hover-triggered). Mobile has no way to see lesson details — no tap-to-reveal, no inline labels.
- **Better:** On mobile, show lesson labels inline (below each lesson node, like checkpoints already do). For the "current" node, show the sublabel too.
- **Implement:** In MobileMap, add a label `<p>` for all nodes (not just checkpoints). Use smaller text for lessons (8px) vs checkpoints (10px).
- **Priority:** 🔴 Must-have

### 8c. Mobile connector lines are bare divs
- **Current:** The `<div>` connector between mobile nodes is a simple 2px-wide bar. It doesn't show module colors or completion status effectively.
- **Better:** Use the module color for completed connectors. Add a subtle gradient transition between connectors of different modules.
- **Implement:** Already partially done — connectors use `col` for completed. Could enhance with `background: linear-gradient(${prevCol}, ${nextCol})` at module boundaries.
- **Priority:** 🟢 Future

---

## Top 5 Recommendations (by visual impact)

### 1. 🔴 Node completion micro-animation (6d)
The single highest-impact addition. When a lesson transitions from current → completed, trigger a scale-up + flash + particle burst. This is the "game feel" dopamine hit that makes users want to keep going. Without it, completion feels anticlimactic.

### 2. 🔴 Module progress arc on checkpoints (6a)
A thin `stroke-dasharray` ring around each checkpoint showing `3/5 lessons done`. Instantly communicates progress at a glance without hovering. Makes the map feel alive and goal-oriented.

### 3. 🔴 Fix locked nodes using module colors (1a + 3a)
Locked nodes should use their module color at low opacity, not hardcoded gray. This makes the entire path feel cohesive — you can "see" the color zones through the locked nodes. Fixes both dark and light mode visibility.

### 4. 🔴 Group zone blur filters for performance (5a)
Wrapping all zone rects in a single `<g filter>` instead of 6 individual filter applications. Zero visual change, significant GPU savings. Easy win.

### 5. 🔴 Fix zone label positioning for left-going modules (1c)
Zone labels currently float disconnected from their module on odd-numbered modules. Anchoring them to the module's first node makes the map immediately more readable.
