"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Check, Clock, Lock, Play, Star, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type NodeStatus = "completed" | "current" | "locked";
type NodeType = "lesson" | "checkpoint" | "world-gate";
type Intensity = "minimal" | "normal" | "spectacular";

/** New interface — Duolingo-style game map node */
export interface LessonNode {
  id: string;
  type?: NodeType;          // default "lesson"
  status: NodeStatus;
  label: string;
  sublabel?: string;
  moduleIndex?: number;     // auto-computed from position if omitted
  moduleName?: string;
  moduleColor?: string;     // per-node color (course color in the unified path)
  courseIndex?: number;     // which course — drives the atmospheric zones
  courseName?: string;      // course title — shown on the course banner card
  courseBullets?: string[]; // "what you'll learn" keywords for the banner card
  icon?: LucideIcon;
  metadata?: Record<string, string>;
}

/** Backward-compatible alias */
export type PathNode = LessonNode;

export interface SerpentinePathProps {
  nodes: LessonNode[];
  onNodeClick?: (id: string) => void;
  activeNodeId?: string;
  intensity?: Intensity;
  showModuleBackgrounds?: boolean;
  lessonsPerModule?: number;
  className?: string;
  // Legacy props — accepted but ignored or mapped
  showAmbient?: boolean;
  colorScheme?: "default" | "warm" | "cool";
  onNodeComplete?: (id: string) => void;
  playSounds?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const VW = 500;

// Serpentine edge bounds — nodes span ~85% of VW (48–452)
const EDGE_L = 48;
const EDGE_R = 452;

const MODULE_COLORS = [
  "#8B5CF6", // violet
  "#14B8A6", // teal
  "#3B82F6", // blue
  "#6366F1", // indigo
  "#10B981", // emerald
  "#F59E0B", // amber
];

// Per-course difficulty (1–5), shown on World Gate cards. Index = course
// position. Values from devpath-docs/CURRICULUM-STRUCTURE.md.
const COURSE_DIFFICULTY = [
  2.0, 2.5, 2.5, 2.5, 3.0, 3.0, 3.0, 3.5, 4.0, 4.0, 4.5, 4.0,
];

// Per-course serpentine geometry, so the 12-course path reads as varied terrain
// rather than one loop repeated. Hand-tuned (deterministic, not random):
//   amp       — horizontal swing as a fraction of the max edge span (0–1)
//   modH      — vertical-spacing multiplier on the base module height
//   startLeft — the course's first sweep goes right→left instead of left→right
// Index = course position. Long courses (C4, C10 — 38 lessons) are kept tighter
// so they don't sprawl; C11 (hardest) is the widest, most dramatic.
const COURSE_GEOMETRY = [
  { amp: 1.0, modH: 1.06, startLeft: false }, // C1  Hardware — wide, classic
  { amp: 0.81, modH: 0.96, startLeft: true }, // C2  OS — tight, flipped
  { amp: 0.95, modH: 1.11, startLeft: false }, // C3  Rețele — wide, tall
  { amp: 0.84, modH: 0.97, startLeft: false }, // C4  Python (38) — kept tight
  { amp: 1.0, modH: 1.08, startLeft: true }, // C5  Algoritmi — wide
  { amp: 0.88, modH: 1.0, startLeft: true }, // C6  Baze de Date — medium
  { amp: 0.93, modH: 1.1, startLeft: false }, // C7  Matematică — wide-ish
  { amp: 0.8, modH: 0.95, startLeft: true }, // C8  ML — tight, snappy
  { amp: 0.99, modH: 1.07, startLeft: false }, // C9  Deep Learning — wide
  { amp: 0.85, modH: 0.96, startLeft: false }, // C10 LLMs (38) — kept tight
  { amp: 1.0, modH: 1.12, startLeft: true }, // C11 Agentic — widest, dramatic
  { amp: 0.9, modH: 1.02, startLeft: false }, // C12 Producție — moderate finale
];

const LESSON_SIZES = { completed: 38, current: 46, locked: 32 } as const;
const CP_SIZES = { completed: 50, current: 52, locked: 44 } as const;

/** Minimum center-to-center distance between a checkpoint and adjacent lesson nodes */
const CP_MIN_GAP = 50;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ntype(n: LessonNode): NodeType { return n.type ?? "lesson"; }

function resolveModIdx(n: LessonNode, i: number, lpm: number): number {
  return n.moduleIndex ?? Math.floor(i / lpm);
}

function resolveColor(n: LessonNode, modIdx: number): string {
  return n.moduleColor ?? MODULE_COLORS[modIdx % MODULE_COLORS.length];
}

/** Serpentine wave layout — wide S-curves across the page, like a river winding
 *  through a landscape. Each module traces a quadratic bézier from one side to the
 *  other, alternating direction. Odd modules arc slightly upward for variety.
 *  Checkpoints sit at curve endpoints (turnaround points).
 *  ~85% horizontal spread, ~700px height for 36 nodes. No Math.random — SSR-safe. */
function computeRealPositions(nodes: LessonNode[]): { x: number; y: number }[] {
  type Pt = { x: number; y: number };
  const pos: Pt[] = [];
  if (nodes.length === 0) return pos;

  // ── Detect modules (each checkpoint ends a module) + their course ──
  const lessonsPerMod: number[] = [];
  const modCourse: number[] = []; // course index each module belongs to
  let tmp = 0;
  let curCourse = nodes[0]?.courseIndex ?? 0;
  for (const n of nodes) {
    if (n.courseIndex != null) curCourse = n.courseIndex;
    if (ntype(n) === "checkpoint") {
      lessonsPerMod.push(tmp);
      modCourse.push(curCourse);
      tmp = 0;
    } else {
      tmp++;
    }
  }
  if (tmp > 0) {
    lessonsPerMod.push(tmp); // trailing lessons without checkpoint
    modCourse.push(curCourse);
  }
  const numMods = lessonsPerMod.length;

  // Module index WITHIN each course — drives per-course direction alternation.
  const modLocalIdx: number[] = [];
  const courseModSeen = new Map<number, number>();
  for (let m = 0; m < numMods; m++) {
    const k = courseModSeen.get(modCourse[m]) ?? 0;
    modLocalIdx.push(k);
    courseModSeen.set(modCourse[m], k + 1);
  }

  // ── Serpentine curve geometry ──
  const TOP = 55;
  // Comfortable base per-module height for the long unified 12-course path.
  const baseModH = Math.max(118, Math.min(150, 680 / Math.max(numMods, 1)));
  const SPAN = EDGE_R - EDGE_L;
  const MID = (EDGE_L + EDGE_R) / 2;

  // Build one quadratic bézier per module: S → C → E. Each course applies its
  // own geometry profile (amplitude, vertical spacing, starting direction) so
  // the path reads as varied terrain, not one loop repeated 12 times.
  const curves: { s: Pt; c: Pt; e: Pt }[] = [];
  let yCursor = TOP;
  for (let m = 0; m < numMods; m++) {
    const geo = COURSE_GEOMETRY[modCourse[m] % COURSE_GEOMETRY.length];
    const modH = baseModH * geo.modH;

    // Per-course amplitude — edges contract toward the center as amp shrinks.
    const half = (SPAN / 2) * geo.amp;
    const local = modLocalIdx[m];
    const upArc = local % 2 === 1; // alternating modules get a gentle up-arc
    // Direction alternates within a course; the first module follows startLeft.
    const goRight = geo.startLeft ? local % 2 === 1 : local % 2 === 0;
    const sx = goRight ? MID - half : MID + half;
    const ex = goRight ? MID + half : MID - half;

    const dropFrac = upArc ? 0.62 : 0.75;
    const sy = yCursor;
    const ey = yCursor + modH * dropFrac;

    // Control point — center X with slight horizontal wobble.
    const cx = MID + Math.sin(m * 2.1 + 0.7) * 18;
    const cy = upArc
      ? yCursor - modH * 0.18 + Math.cos(m * 1.7) * 8
      : (sy + ey) / 2 + modH * 0.06 + Math.cos(m * 1.7) * 8;

    curves.push({ s: { x: sx, y: sy }, c: { x: cx, y: cy }, e: { x: ex, y: ey } });
    yCursor += modH;
  }

  // ── Place each node along its module's bézier ──
  let modIdx = 0;
  let lessonInMod = 0;

  for (let i = 0; i < nodes.length; i++) {
    const isCP = ntype(nodes[i]) === "checkpoint";
    const mi = Math.min(modIdx, curves.length - 1);
    const curve = curves[mi];
    const nLessons = lessonsPerMod[mi] || 1;

    let x: number, y: number;

    if (isCP) {
      // Checkpoint at curve endpoint with tiny jitter
      x = curve.e.x + Math.sin(i * 1.3) * 6;
      y = curve.e.y + Math.cos(i * 0.9) * 4;
      modIdx++;
      lessonInMod = 0;
    } else {
      // Lessons spread from t=0 to t=0.88 along the bézier
      const t = nLessons <= 1
        ? 0.42
        : (lessonInMod / (nLessons - 1)) * 0.88;
      const mt = 1 - t;
      x = mt * mt * curve.s.x + 2 * mt * t * curve.c.x + t * t * curve.e.x;
      y = mt * mt * curve.s.y + 2 * mt * t * curve.c.y + t * t * curve.e.y;

      // Organic jitter (±10px X, ±8px Y) — never enough to reverse flow
      x += Math.sin(i * 3.7) * 10;
      y += Math.cos(i * 2.3) * 8;
      lessonInMod++;
    }

    pos.push({ x: Math.max(30, Math.min(470, x)), y: Math.max(30, y) });
  }

  // ── Post-process: enforce minimum gap around checkpoints ──
  for (let i = 0; i < nodes.length; i++) {
    if (ntype(nodes[i]) !== "checkpoint") continue;
    const cp = pos[i];
    // Push previous lesson away if too close
    if (i > 0 && ntype(nodes[i - 1]) !== "checkpoint") {
      const prev = pos[i - 1];
      const dx = cp.x - prev.x;
      const dy = cp.y - prev.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CP_MIN_GAP && dist > 0) {
        const scale = CP_MIN_GAP / dist;
        prev.x = cp.x - dx * scale;
        prev.y = cp.y - dy * scale;
      }
    }
    // Push next lesson away if too close
    if (i < nodes.length - 1 && ntype(nodes[i + 1]) !== "checkpoint") {
      const next = pos[i + 1];
      const dx = next.x - cp.x;
      const dy = next.y - cp.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CP_MIN_GAP && dist > 0) {
        const scale = CP_MIN_GAP / dist;
        next.x = cp.x + dx * scale;
        next.y = cp.y + dy * scale;
      }
    }
  }

  return pos;
}

/** Lays out the serpentine. World-gate nodes skip the bézier — they're slotted
 *  in afterwards, reserving GATE_SLOT of vertical space (≈80px above + card +
 *  ≈80px below) and sitting centered horizontally so the path threads through. */
function computePositions(nodes: LessonNode[]): { x: number; y: number }[] {
  if (nodes.length === 0) return [];
  const GATE_SLOT = 210; // SVG units reserved per world gate (fits the large card)
  const realNodes = nodes.filter((n) => ntype(n) !== "world-gate");
  const realPos = computeRealPositions(realNodes);

  const out: { x: number; y: number }[] = [];
  let realIdx = 0;
  let offset = 0;
  for (let i = 0; i < nodes.length; i++) {
    if (ntype(nodes[i]) === "world-gate") {
      if (i === 0) {
        // First gate sits as high as the (center-anchored) card allows without
        // its top overflowing above the serpentine into the hero above.
        out.push({ x: VW / 2, y: 60 });
        offset += 130;
      } else {
        const prev = out[i - 1] ?? { x: VW / 2, y: 0 };
        const next = realPos[realIdx] ?? prev;
        const nextY = next.y + offset + GATE_SLOT;
        out.push({ x: VW / 2, y: (prev.y + nextY) / 2 });
        offset += GATE_SLOT;
      }
    } else {
      const p = realPos[realIdx];
      out.push({ x: p.x, y: p.y + offset });
      realIdx++;
    }
  }
  return out;
}

/** Quadratic bézier between two stepping stones — gentle curve
 *  [1e] Reduced perpendicular offset from 0.14 to 0.09 for subtler curves */
function segPath(
  p0: { x: number; y: number },
  p1: { x: number; y: number }
): string {
  const cpX = (p0.x + p1.x) / 2;
  const cpY = (p0.y + p1.y) / 2;
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const perp = 0.09 * len;
  const nx = -dy / len;
  const ny = dx / len;
  return `M ${p0.x} ${p0.y} Q ${cpX + nx * perp} ${cpY + ny * perp} ${p1.x} ${p1.y}`;
}

/** Full path through a set of points (for particle animateMotion)
 *  [1e] Reduced perpendicular offset from 0.14 to 0.09 for subtler curves */
function buildPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const cpX = (p0.x + p1.x) / 2;
    const cpY = (p0.y + p1.y) / 2;
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const perp = 0.09 * len;
    d += ` Q ${cpX + (-dy / len) * perp} ${cpY + (dx / len) * perp} ${p1.x} ${p1.y}`;
  }
  return d;
}

// ─── Ambient layers ───────────────────────────────────────────────────────────

function AmbientStars({ h, intensity }: { h: number; intensity: Intensity }) {
  const cnt = intensity === "spectacular" ? 36 : 22;
  return (
    <g className="ambient-stars-group">
      {Array.from({ length: cnt }, (_, i) => (
        <circle
          key={i}
          cx={(i * 73 + 11) % VW}
          cy={(i * 137 + 29) % h}
          r={i % 6 === 0 ? 2.0 : i % 3 === 0 ? 1.4 : 0.9}
          fill={i % 4 === 0 ? "#FFD166" : i % 3 === 0 ? "#14B8A6" : "#8B5CF6"}
        >
          <animate
            attributeName="opacity"
            values="0.04;0.5;0.04"
            dur={`${1.8 + (i % 5) * 0.7}s`}
            begin={`${(i * 0.4) % 4.5}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </g>
  );
}

function AmbientShapes({ h }: { h: number }) {
  return (
    <g className="ambient-light-shapes">
      {Array.from({ length: 8 }, (_, i) => (
        <circle
          key={i}
          cx={(i * 91 + 35) % VW}
          cy={(i * 163 + 55) % h}
          r={2 + (i % 3)}
          fill="#6366F1"
          opacity={0.04}
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values={`0 0;${i % 2 === 0 ? 20 : -20} 0;0 0`}
            dur={`${45 + i * 7}s`}
            begin={`${i * 5}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </g>
  );
}

// ─── Checkpoint SVG effects ───────────────────────────────────────────────────

/** [2c] Reduced orbital radii: 46→38, 54→44, 40→34 */
function CPOrbits({
  cx,
  cy,
  color,
  intensity,
}: {
  cx: number;
  cy: number;
  color: string;
  intensity: Intensity;
}) {
  const cnt = intensity === "spectacular" ? 3 : 2;
  const orbits = [
    { r: 28, dur: "5s", dir: 1, fill: "#FFD166", sz: 3 },
    { r: 32, dur: "8s", dir: -1, fill: color, sz: 2.5 },
    { r: 26, dur: "11s", dir: 1, fill: "#FFD166", sz: 2 },
  ].slice(0, cnt);
  return (
    <g>
      {orbits.map((o, i) => (
        <g key={i} transform={`translate(${cx},${cy})`}>
          <g>
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0"
              to={String(o.dir * 360)}
              dur={o.dur}
              repeatCount="indefinite"
            />
            <circle cx={o.r} cy={0} r={o.sz} fill={o.fill} opacity={0.85}>
              <animate
                attributeName="opacity"
                values="0.85;0.28;0.85"
                dur="2.2s"
                begin={`${i * 0.7}s`}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        </g>
      ))}
    </g>
  );
}

/** [2c] Reduced ping radii: r from 36→65 (was 44→90) */
function CPPing({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g>
      {[0, 2, 4].map((delay, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={28}
          fill="none"
          stroke={color}
          strokeWidth={i === 0 ? 1.5 : 1}
        >
          <animate attributeName="r" values="28;48;28" dur="4s" begin={`${delay}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.55;0;0.55" dur="4s" begin={`${delay}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </g>
  );
}

// ─── Completion burst particles (6d) ─────────────────────────────────────────

function CompletionBurst({ color }: { color: string }) {
  return (
    <>
      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const x = Math.cos(angle) * 30;
        const y = Math.sin(angle) * 30;
        return (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full sp-burst-particle pointer-events-none"
            style={{
              background: i % 2 === 0 ? "#FFD166" : color,
              "--burst-x": `${x}px`,
              "--burst-y": `${y}px`,
              animationDelay: `${i * 0.03}s`,
            } as React.CSSProperties}
          />
        );
      })}
    </>
  );
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function GameTooltip({
  node,
  visible,
  isCP,
  color,
}: {
  node: LessonNode;
  visible: boolean;
  isCP: boolean;
  color: string;
}) {
  const ct = (() => {
    if (isCP) {
      if (node.status === "completed")
        return { pre: "⭐", title: `${node.moduleName ?? node.label} completat!`, sub: node.sublabel ?? "Toate lecțiile", c: "#F59E0B" };
      if (node.status === "current")
        return { pre: "🎯", title: node.label, sub: "Începe provocarea →", c: color };
      return { pre: "🔒", title: node.label, sub: "Completează toate lecțiile", c: "#9CA3AF" };
    }
    if (node.status === "completed")
      return { pre: "✓", title: node.label, sub: node.sublabel, c: "#10B981" };
    if (node.status === "current")
      return { pre: null, title: node.label, sub: "Continuă →", c: color };
    return { pre: "🔒", title: node.label, sub: "Completează lecția anterioară", c: "#9CA3AF" };
  })();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.93 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 3, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 440, damping: 28 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-50 pointer-events-none"
          style={{ minWidth: isCP ? 168 : 138, maxWidth: 200 }}
        >
          <div className="relative bg-white/96 dark:bg-[rgba(14,10,36,0.97)] backdrop-blur-xl border border-black/[0.08] dark:border-white/10 rounded-xl px-3.5 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.14)]">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 leading-snug">
              {ct.pre && <span className="mr-1">{ct.pre}</span>}
              {ct.title}
            </p>
            {ct.sub && (
              <p className="text-[10px] mt-0.5" style={{ color: ct.c }}>
                {ct.sub}
              </p>
            )}
            {/* Light mode caret */}
            <div
              className="absolute top-full left-1/2 -translate-x-1/2 dark:hidden"
              style={{ width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "5px solid rgba(255,255,255,0.96)" }}
            />
            {/* Dark mode caret */}
            <div
              className="absolute top-full left-1/2 -translate-x-1/2 hidden dark:block"
              style={{ width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "5px solid rgba(14,10,36,0.97)" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Game Node (HTML) ─────────────────────────────────────────────────────────

interface GameNodeProps {
  node: LessonNode;
  pos: { x: number; y: number };
  totalH: number;
  onClick?: (id: string) => void;
  idx: number;
  intensity: Intensity;
  color: string;
  setRef: (id: string, el: HTMLDivElement | null) => void;
  justCompleted: boolean;
  justUnlocked: boolean;
}

function GameNode({
  node, pos, totalH, onClick, idx, intensity, color, setRef,
  justCompleted, justUnlocked,
}: GameNodeProps) {
  const [tip, setTip] = useState(false);
  const [shake, setShake] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isCP = ntype(node) === "checkpoint";
  const sz = (isCP ? CP_SIZES : LESSON_SIZES)[node.status];
  const canClick = node.status !== "locked" && !!onClick;
  const Icon = node.icon;

  function onEnter() {
    setTip(true);
    setHovered(true);
    if (node.status === "locked" && !shake) {
      setShake(true);
      setTimeout(() => setShake(false), 300);
    }
  }

  function onLeave() {
    setTip(false);
    setHovered(false);
  }

  // [1a+3a] Locked nodes use module colors instead of hardcoded gray
  // [4a] Hover glow on lesson nodes
  const nodeStyle = (() => {
    const base: Record<string, unknown> = {
      width: sz,
      height: sz,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "visible",
      cursor: canClick ? "pointer" : node.status === "locked" ? "not-allowed" : "default",
      flexShrink: 0,
      transition: "box-shadow 0.2s ease",
    };
    if (isCP) {
      if (node.status === "completed")
        // Course-colored circle with a gold rim — keeps the "milestone" feel
        // while still belonging to its course's color world.
        return { ...base, background: `linear-gradient(135deg,${color},${color}bb)`, border: "2px solid #FDCB6E", boxShadow: `0 0 22px ${color}77,0 0 8px #FDCB6E55,0 4px 12px rgba(0,0,0,0.18)` };
      if (node.status === "current")
        return { ...base, background: `linear-gradient(135deg,${color},${color}cc)`, boxShadow: `0 0 28px ${color}88,0 4px 16px rgba(0,0,0,0.2)` };
      // Locked checkpoint — course color at ~35% so the atmosphere reads through
      return { ...base, background: `${color}59`, border: `2px solid ${color}8c` };
    }
    if (node.status === "completed") {
      const shadow = hovered
        ? `0 0 16px ${color}55,0 0 10px ${color}55,0 2px 6px rgba(0,0,0,0.12)`
        : `0 0 10px ${color}55,0 2px 6px rgba(0,0,0,0.12)`;
      return { ...base, background: color, boxShadow: shadow };
    }
    if (node.status === "current") {
      const shadow = hovered
        ? `0 0 20px ${color}66,0 0 14px ${color}66`
        : `0 0 14px ${color}66`;
      return { ...base, background: `${color}dd`, border: `2px solid ${color}`, boxShadow: shadow };
    }
    // Locked lesson — course color at ~35% (not flat gray) so the path stays
    // cohesive through unvisited course zones.
    const shadow = hovered ? `0 0 12px ${color}55` : undefined;
    return { ...base, background: `${color}59`, border: `2px solid ${color}80`, boxShadow: shadow };
  })();

  const iconSz = isCP
    ? node.status === "current" ? 22 : 20
    : node.status === "current" ? 18 : node.status === "locked" ? 12 : 14;

  // [6c] Completed lessons show original icon with ✓ badge
  const iconEl = isCP ? (
    node.status === "completed" ? (
      <Star style={{ width: iconSz, height: iconSz, color: "white", fill: "white" }} />
    ) : node.status === "current" ? (
      Icon
        ? <Icon style={{ width: iconSz, height: iconSz, color: "white" }} />
        : <Shield style={{ width: iconSz, height: iconSz, color: "white" }} />
    ) : (
      <Lock style={{ width: iconSz, height: iconSz, color: `${color}88` }} />
    )
  ) : (
    node.status === "completed" ? (
      Icon ? (
        <div className="relative flex items-center justify-center">
          <Icon style={{ width: iconSz, height: iconSz, color: "white" }} />
          <div
            className="absolute flex items-center justify-center rounded-full bg-emerald-500"
            style={{
              width: 11, height: 11,
              bottom: -2, right: -3,
              boxShadow: "0 0 4px rgba(16,185,129,0.6)",
            }}
          >
            <Check style={{ width: 7, height: 7, color: "white", strokeWidth: 3 }} />
          </div>
        </div>
      ) : (
        <Check style={{ width: iconSz, height: iconSz, color: "white", strokeWidth: 3 }} />
      )
    ) : node.status === "current" ? (
      Icon
        ? <Icon style={{ width: iconSz, height: iconSz, color: "white" }} />
        : <Play style={{ width: iconSz, height: iconSz, color: "white", fill: "white" }} />
    ) : (
      <Lock style={{ width: iconSz, height: iconSz, color: `${color}88` }} />
    )
  );

  // [2d] Non-linear stagger: locked fast, completed normal, current slow
  const staggerDelay = node.status === "locked"
    ? idx * 0.016
    : node.status === "completed"
      ? idx * 0.026
      : idx * 0.04;

  const pulseClass = !isCP && node.status === "current" && intensity !== "minimal"
    ? "sp-lesson-pulse"
    : "";

  return (
    <div
      ref={(el) => setRef(node.id, el)}
      className="absolute pointer-events-auto"
      style={{
        left: `${(pos.x / VW) * 100}%`,
        top: `${(pos.y / totalH) * 100}%`,
        transform: "translate(-50%,-50%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: node.status === "current" ? 0.35 : 0.72 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={
          node.status === "current"
            ? { delay: staggerDelay, type: "spring", stiffness: 255, damping: 15 }
            : { delay: staggerDelay, type: "spring", stiffness: 340, damping: 22 }
        }
        className="relative"
      >
        <motion.div
          animate={shake ? { x: [0, -4, 4, -3, 3, 0] } : { x: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div
            className="relative flex flex-col items-center"
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
          >
            {/* [6b] "You are here" bouncing arrow */}
            {!isCP && node.status === "current" && intensity !== "minimal" && (
              <div
                className="absolute sp-arrow-float pointer-events-none z-10"
                style={{ bottom: sz + 6, left: "50%", transform: "translateX(-50%)" }}
              >
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: "5px solid transparent",
                    borderRight: "5px solid transparent",
                    borderTop: `7px solid ${color}`,
                    filter: `drop-shadow(0 0 3px ${color}66)`,
                  }}
                />
              </div>
            )}

            {intensity !== "minimal" && (
              <GameTooltip node={node} visible={tip} isCP={isCP} color={color} />
            )}

            {/* Node wrapper — positions glow ring, cp ring, shockwave relative to node */}
            <div className="relative">
              {/* Rotating gradient ring — checkpoint current */}
              {isCP && node.status === "current" && intensity !== "minimal" && (
                <div
                  className="absolute rounded-full sp-cp-ring"
                  style={{
                    width: sz + 10,
                    height: sz + 10,
                    top: -5,
                    left: -5,
                    background: `conic-gradient(${color} 0deg, transparent 160deg, ${color} 360deg)`,
                    opacity: 0.65,
                  }}
                />
              )}

              {/* [2a] Current lesson glow ring */}
              {!isCP && node.status === "current" && intensity !== "minimal" && (
                <div
                  className="absolute inset-0 rounded-full sp-lesson-glow pointer-events-none"
                  style={{ "--sp-glow-color": `${color}55` } as React.CSSProperties}
                />
              )}

              {/* [7a] Checkpoint unlock shockwave */}
              {justUnlocked && isCP && (
                <div
                  className="absolute rounded-full sp-shockwave-ring pointer-events-none"
                  style={{
                    width: sz + 8,
                    height: sz + 8,
                    top: -4,
                    left: -4,
                    border: `2px solid ${color}`,
                  }}
                />
              )}

              {/* Node circle */}
              <motion.div
                className={cn(
                  "flex items-center justify-center",
                  pulseClass,
                  justCompleted && "sp-just-completed",
                  justUnlocked && isCP && "sp-just-unlocked",
                )}
                style={{
                  ...nodeStyle,
                  ...(justUnlocked && isCP ? { "--sp-unlock-color": color } as React.CSSProperties : {}),
                }}
                whileHover={canClick ? { scale: isCP ? 1.07 : 1.12 } : undefined}
                whileTap={canClick ? { scale: 0.94 } : undefined}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={canClick ? () => onClick!(node.id) : undefined}
              >
                {iconEl}
                {/* [6d] Completion burst particles */}
                {justCompleted && <CompletionBurst color={color} />}
              </motion.div>
            </div>

            {/* Checkpoint labels removed — star + progress arc + module zone label is sufficient */}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─── Desktop map ──────────────────────────────────────────────────────────────

function DesktopMap({
  nodes,
  onClick,
  intensity,
  showModBgs,
  lpm,
  setRef,
  colors,
  positions,
  justCompletedIds,
  justUnlockedIds,
}: {
  nodes: LessonNode[];
  onClick?: (id: string) => void;
  intensity: Intensity;
  showModBgs: boolean;
  lpm: number;
  setRef: (id: string, el: HTMLDivElement | null) => void;
  colors: string[];
  positions: { x: number; y: number }[];
  justCompletedIds: Set<string>;
  justUnlockedIds: Set<string>;
}) {
  const uid = useId().replace(/:/g, "");
  const totalH = positions.length > 0 ? positions[positions.length - 1].y + 70 : 400;

  // SVG-unit offset where the path connects to a gate card's top edge.
  const GATE_HALF = 36;
  // Approx half-height of a gate card in SVG units — the bottom connector to
  // the first lesson starts here (the card's bottom-center). The card is a
  // CSS-px overlay, so this is an estimate tuned to typical desktop scale.
  const GATE_CARD_HALF = 60;

  // Per-course atmospheric zones — one soft radial-gradient band per course.
  // Grouped by courseIndex; falls back to module index when nodes carry no
  // course info (e.g. the dev component showcase).
  const courseZones = showModBgs
    ? (() => {
        const map = new Map<
          number,
          { color: string; minY: number; maxY: number }
        >();
        nodes.forEach((n, i) => {
          if (ntype(n) === "world-gate") return;
          const key = n.courseIndex ?? resolveModIdx(n, i, lpm);
          const y = positions[i].y;
          const existing = map.get(key);
          if (!existing) {
            map.set(key, { color: colors[i], minY: y, maxY: y });
          } else {
            existing.minY = Math.min(existing.minY, y);
            existing.maxY = Math.max(existing.maxY, y);
          }
        });
        return Array.from(map.entries())
          .map(([idx, z]) => ({ idx, ...z }))
          .sort((a, b) => a.idx - b.idx);
      })()
    : [];

  // Particle path — completed + current portion
  const currentIdx = nodes.findIndex((n) => n.status === "current");
  const upTo = currentIdx >= 0 ? currentIdx + 1 : nodes.filter((n) => n.status === "completed").length;
  const pPath = buildPath(positions.slice(0, upTo));

  const particleCnt = { minimal: 0, normal: 7, spectacular: 14 }[intensity];
  const particleDur = { minimal: 20, normal: 20, spectacular: 15 }[intensity];

  // [6a] Compute checkpoint progress arcs
  const cpProgress = new Map<string, { completed: number; total: number }>();
  {
    let completed = 0;
    let total = 0;
    for (let i = 0; i < nodes.length; i++) {
      if (ntype(nodes[i]) === "world-gate") continue;
      if (ntype(nodes[i]) === "checkpoint") {
        cpProgress.set(nodes[i].id, { completed, total });
        completed = 0;
        total = 0;
      } else {
        total++;
        if (nodes[i].status === "completed") completed++;
      }
    }
  }

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${VW} ${totalH}`}
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        aria-label="Hartă de lecții"
        role="img"
        style={{ overflow: "visible" }}
      >
        <defs>
          {/* Per-course atmospheric radial gradients — ~12% peak, fading to 0 */}
          {courseZones.map((z) => (
            <radialGradient key={z.idx} id={`zg-${z.idx}-${uid}`} cx="50%" cy="50%" r="62%">
              <stop offset="0%" stopColor={z.color} stopOpacity={0.12} />
              <stop offset="55%" stopColor={z.color} stopOpacity={0.06} />
              <stop offset="100%" stopColor={z.color} stopOpacity={0} />
            </radialGradient>
          ))}
          {/* Course-boundary connector gradients — interpolate color N → N+1 */}
          {nodes.map((n, i) => {
            if (i === 0 || colors[i] === colors[i - 1]) return null;
            const a = positions[i - 1];
            const b = positions[i];
            return (
              <linearGradient
                key={`bnd-${i}`}
                id={`bnd-${i}-${uid}`}
                gradientUnits="userSpaceOnUse"
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
              >
                <stop offset="0%" stopColor={colors[i - 1]} />
                <stop offset="100%" stopColor={colors[i]} />
              </linearGradient>
            );
          })}
          {/* Blur — feathers the atmospheric zones into each other */}
          <filter id={`zbf-${uid}`} x="-40%" y="-50%" width="180%" height="200%">
            <feGaussianBlur stdDeviation="22" />
          </filter>
          <filter id={`cpg-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
          {particleCnt > 0 && pPath && (
            <path id={`pp-${uid}`} d={pPath} style={{ display: "none" }} />
          )}
        </defs>

        {/* Ambient */}
        {intensity !== "minimal" && (
          <>
            <AmbientStars h={totalH} intensity={intensity} />
            <AmbientShapes h={totalH} />
          </>
        )}

        {/* Atmospheric per-course background zones — full-width bands that
            bleed into their neighbours for a gradual color shift on scroll */}
        {courseZones.length > 0 && (
          <g filter={`url(#zbf-${uid})`} className="sp-zone-group">
            {courseZones.map((z) => {
              const BLEED = 130; // vertical overlap into adjacent course zones
              return (
                <rect
                  key={z.idx}
                  x={-40}
                  y={z.minY - BLEED}
                  width={VW + 80}
                  height={z.maxY - z.minY + BLEED * 2}
                  fill={`url(#zg-${z.idx}-${uid})`}
                />
              );
            })}
          </g>
        )}

        {/* Path segments — per pair of nodes. At a course boundary the stroke
            uses an interpolating gradient so the color hand-off is smooth. */}
        {nodes.map((n, i) => {
          if (i === 0) return null;
          // The gate → first-lesson link is drawn as a straight connector below.
          if (ntype(nodes[i - 1]) === "world-gate") return null;
          // The segment into a gate routes to the gate card's top edge.
          const p0 = positions[i - 1];
          const p1 =
            ntype(nodes[i]) === "world-gate"
              ? { x: positions[i].x, y: positions[i].y - GATE_HALF }
              : positions[i];
          const seg = segPath(p0, p1);
          const done =
            nodes[i - 1].status === "completed" || nodes[i - 1].status === "current";
          const isBoundary = colors[i] !== colors[i - 1];
          const paint = isBoundary ? `url(#bnd-${i}-${uid})` : colors[i];
          return (
            <g key={`s${i}`}>
              {/* [3b] sp-path-glow class for light mode visibility */}
              {done && intensity !== "minimal" && (
                <path
                  d={seg}
                  fill="none"
                  stroke={paint}
                  strokeWidth={9}
                  strokeLinecap="round"
                  opacity={0.14}
                  filter={`url(#cpg-${uid})`}
                  className="sp-path-glow"
                />
              )}
              <path
                d={seg}
                fill="none"
                stroke={done ? paint : "hsl(var(--border))"}
                strokeWidth={done ? 3.5 : 3}
                strokeLinecap="round"
                strokeDasharray={done ? undefined : "5 9"}
                opacity={done ? 1 : 0.48}
              />
            </g>
          );
        })}

        {/* Gate → first-lesson connector — from the card's bottom-center */}
        {nodes.map((n, i) => {
          if (ntype(n) !== "world-gate") return null;
          const gate = positions[i];
          const node = positions[i + 1];
          if (!node) return null;
          const col = colors[i];
          return (
            <g key={`gate-link-${i}`}>
              <line
                x1={gate.x}
                y1={gate.y + GATE_CARD_HALF}
                x2={node.x}
                y2={node.y}
                stroke={col}
                strokeWidth={2.5}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                opacity={0.85}
              />
              <circle cx={node.x} cy={node.y} r={4} fill={col} />
            </g>
          );
        })}

        {/* [6a] Checkpoint progress arcs */}
        {intensity !== "minimal" &&
          nodes.map((n, i) => {
            if (ntype(n) !== "checkpoint") return null;
            const p = positions[i];
            const col = colors[i];
            const progress = cpProgress.get(n.id);
            if (!progress || progress.total === 0) return null;

            // Arc sits 4px outside the golden circle — thin 3px stroke
            const cpSz = CP_SIZES[n.status];
            const arcR = cpSz / 2 + 4;
            const circ = 2 * Math.PI * arcR;
            const fraction = progress.completed / progress.total;
            const offset = circ * (1 - fraction);
            const isComplete = n.status === "completed";

            return (
              <g key={`arc${i}`}>
                {/* Track ring */}
                <circle
                  cx={p.x} cy={p.y} r={arcR}
                  fill="none" stroke={col} strokeWidth={3} opacity={0.15}
                />
                {/* Progress fill */}
                {fraction > 0 && (
                  <circle
                    cx={p.x} cy={p.y} r={arcR}
                    fill="none"
                    stroke={isComplete ? "#F59E0B" : col}
                    strokeWidth={3}
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${p.x} ${p.y})`}
                    opacity={0.8}
                  />
                )}
              </g>
            );
          })}

        {/* Checkpoint SVG effects */}
        {intensity !== "minimal" &&
          nodes.map((n, i) => {
            if (ntype(n) !== "checkpoint") return null;
            const p = positions[i];
            const col = colors[i];
            if (n.status === "completed")
              return (
                <g key={`cpfx${i}`}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={30}
                    fill="#F59E0B"
                    opacity={0.1}
                    filter={`url(#cpg-${uid})`}
                  />
                  <CPOrbits cx={p.x} cy={p.y} color={col} intensity={intensity} />
                </g>
              );
            if (n.status === "current")
              return <CPPing key={`cpfx${i}`} cx={p.x} cy={p.y} color={col} />;
            return null;
          })}

        {/* [5b] Flow particles — no filter wrapper, larger radius + lower opacity */}
        {/* [2b] Particle colors use all 6 module colors */}
        {particleCnt > 0 && pPath && (
          <g>
            {Array.from({ length: particleCnt }, (_, i) => {
              const pc = MODULE_COLORS[i % MODULE_COLORS.length];
              return (
                <circle
                  key={i}
                  r={intensity === "spectacular" && i % 3 === 0 ? 6 : 5}
                  fill={pc}
                  opacity={0.65}
                >
                  <animateMotion
                    dur={`${particleDur + (i % 4) * 2}s`}
                    repeatCount="indefinite"
                    begin={`${-(i * (particleDur / particleCnt))}s`}
                    rotate="auto"
                  >
                    <mpath href={`#pp-${uid}`} />
                  </animateMotion>
                </circle>
              );
            })}
          </g>
        )}

      </svg>

      {/* World Gate cards — large portal cards announcing each course world */}
      {showModBgs &&
        nodes.map((n, i) => {
          if (ntype(n) !== "world-gate") return null;
          const p = positions[i];
          const color = colors[i];
          const courseIdx = n.courseIndex ?? 0;
          const courseNum = courseIdx + 1;
          const keywords = n.courseBullets ?? [];
          const description = n.metadata?.description ?? "";
          const lessonCount = Number(n.metadata?.lessonCount ?? 0);
          const difficulty = COURSE_DIFFICULTY[courseIdx] ?? 3;
          const estHours = Math.round(((lessonCount * 5) / 60) * 10) / 10;
          // Status badge — derived from this course's lesson nodes.
          const courseLessons = nodes.filter(
            (x) => (x.courseIndex ?? -1) === courseIdx && ntype(x) !== "world-gate"
          );
          const doneCount = courseLessons.filter(
            (x) => x.status === "completed"
          ).length;
          const courseTotal = courseLessons.length;
          const courseHasCurrent = courseLessons.some(
            (x) => x.status === "current"
          );
          const badge =
            courseTotal > 0 && doneCount === courseTotal
              ? { text: "✓ Completat", bg: "rgba(52,211,153,0.2)", fg: "#34d399" }
              : doneCount > 0
              ? {
                  text: `▶ ${doneCount}/${courseTotal} lecții`,
                  bg: `${color}33`,
                  fg: color,
                }
              : courseHasCurrent
              ? { text: "○ Începe", bg: `${color}26`, fg: color }
              : { text: "🔒 Blocat", bg: "rgba(148,163,184,0.15)", fg: "#94a3b8" };
          return (
            <div
              key={n.id}
              className="absolute z-20 select-none pointer-events-none"
              style={{
                left: `${(p.x / VW) * 100}%`,
                top: `${(p.y / totalH) * 100}%`,
                width: 440,
                transform: "translate(-50%, -50%)",
              }}
            >
              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.84, y: 12 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Entrance pulse ring */}
                <motion.div
                  aria-hidden
                  className="absolute inset-0 rounded-2xl"
                  style={{ border: `2px solid ${color}` }}
                  initial={{ opacity: 0, scale: 1 }}
                  whileInView={{ opacity: [0, 0.8, 0], scale: [1, 1.18, 1.45] }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />

                {/* Connector — top: line + dot meeting the card edge */}
                <div
                  aria-hidden
                  className="absolute bottom-full left-1/2 flex -translate-x-1/2 flex-col items-center"
                >
                  <div
                    className="h-7 w-[3px]"
                    style={{ background: `linear-gradient(${color}00, ${color})` }}
                  />
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                  />
                </div>
                {/* Corner badge — course number */}
                <div
                  aria-hidden
                  className="absolute -right-3.5 -top-3.5 z-10 flex h-12 w-12 items-center justify-center rounded-full text-[17px] font-extrabold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${color}, ${color}aa)`,
                    boxShadow: `0 0 18px ${color}aa, inset 0 0 0 2px rgba(255,255,255,0.18)`,
                  }}
                >
                  {courseNum}
                </div>

                {/* Status badge — top-left, opposite the course-number badge */}
                <div
                  className="absolute -top-3 left-4 z-10 inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold"
                  style={{ background: badge.bg, color: badge.fg }}
                >
                  {badge.text}
                </div>

                {/* ── The card ── */}
                <motion.div
                  className="pointer-events-auto relative overflow-hidden rounded-2xl backdrop-blur-xl"
                  style={{
                    background: `${color}1f`,
                    border: `1px solid ${color}80`,
                  }}
                  animate={{
                    boxShadow: [
                      `0 0 22px -6px ${color}66`,
                      `0 0 46px 2px ${color}aa`,
                      `0 0 22px -6px ${color}66`,
                    ],
                  }}
                  transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
                  whileHover={{ scale: 1.025 }}
                >
                  {/* Subtle inner glow */}
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(circle at 82% 0%, ${color}33, transparent 62%)`,
                    }}
                  />
                  {/* Animated shimmer line across the top */}
                  <div
                    aria-hidden
                    className="animate-gradient absolute inset-x-5 top-0 h-[2px] rounded-full"
                    style={{
                      backgroundImage: `linear-gradient(90deg, ${color}, ${color}, #ffffff, ${color}, ${color})`,
                      backgroundSize: "200% 100%",
                    }}
                  />

                  <div className="relative p-5">
                    {/* Eyebrow */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: color, boxShadow: `0 0 6px ${color}` }}
                      />
                      <span
                        className="text-[11px] font-bold uppercase tracking-[0.18em]"
                        style={{ color }}
                      >
                        Cursul {courseNum}
                      </span>
                    </div>

                    {/* Title */}
                    <motion.h3
                      className="mt-1.5 pr-8 text-[26px] font-extrabold leading-[1.12] text-white"
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.4, delay: 0.12, ease: "easeOut" }}
                    >
                      {n.courseName}
                    </motion.h3>

                    {/* Description */}
                    <p className="mt-1.5 text-[12.5px] leading-snug text-white/70">
                      {description}
                    </p>

                    {/* Meta row */}
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-medium text-white/65">
                      <span className="inline-flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5" style={{ color }} />
                        {lessonCount} lecții
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" style={{ color }} />
                        ~{estHours}h
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Star className="h-3.5 w-3.5" style={{ color }} />
                        Nivel {difficulty.toFixed(1)}
                      </span>
                    </div>

                    {/* Divider */}
                    <div
                      className="my-3 h-px w-full"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${color}66, transparent)`,
                      }}
                    />

                    {/* Keyword pills */}
                    <motion.div
                      className="flex flex-wrap gap-1.5"
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.4, delay: 0.22, ease: "easeOut" }}
                    >
                      {keywords.map((kw) => (
                        <span
                          key={kw}
                          className="rounded-full px-2.5 py-1 text-[11px] font-medium text-white"
                          style={{
                            background: `${color}2e`,
                            border: `1px solid ${color}55`,
                          }}
                        >
                          {kw}
                        </span>
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          );
        })}

      {/* Node HTML overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {nodes.map((n, i) =>
          ntype(n) === "world-gate" ? null : (
            <GameNode
              key={n.id}
              node={n}
              pos={positions[i]}
              totalH={totalH}
              onClick={onClick}
              idx={i}
              intensity={intensity}
              color={colors[i]}
              setRef={setRef}
              justCompleted={justCompletedIds.has(n.id)}
              justUnlocked={justUnlockedIds.has(n.id)}
            />
          )
        )}
      </div>
    </div>
  );
}

// ─── Mobile layout ────────────────────────────────────────────────────────────
// [8b] All nodes show labels, not just checkpoints. Current node shows sublabel.

function MobileMap({
  nodes,
  onClick,
  colors,
}: {
  nodes: LessonNode[];
  onClick?: (id: string) => void;
  colors: string[];
}) {
  return (
    <div className="relative flex flex-col items-center">
      {nodes.map((n, i) => {
        if (ntype(n) === "world-gate") return null; // gates are desktop-only
        const isCP = ntype(n) === "checkpoint";
        const col = colors[i];
        const isLast = i === nodes.length - 1;
        const canClick = n.status !== "locked" && !!onClick;
        const sz = isCP
          ? { completed: 48, current: 50, locked: 42 }[n.status]
          : { completed: 36, current: 44, locked: 30 }[n.status];
        const iconSz = isCP ? 20 : n.status === "locked" ? 12 : 14;
        const Icon = n.icon;
        const offset = isCP ? 0 : i % 2 === 0 ? -28 : 28;

        return (
          <div key={n.id} className="flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.024, type: "spring", stiffness: 340, damping: 22 }}
              style={{ marginLeft: offset }}
            >
              <motion.div
                style={{
                  width: sz,
                  height: sz,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: canClick ? "pointer" : "default",
                  // [1a+3a] Locked nodes use module color
                  background:
                    n.status === "completed"
                      ? isCP ? "linear-gradient(135deg,#FFD166,#F59E0B)" : col
                      : n.status === "current" ? col
                      : `${col}18`,
                  border: n.status === "locked" ? `2px solid ${col}30` : undefined,
                  opacity: n.status === "locked" ? 0.55 : 1,
                  boxShadow:
                    n.status !== "locked" ? `0 0 ${isCP ? 20 : 8}px ${col}55` : undefined,
                }}
                whileHover={canClick ? { scale: 1.08 } : undefined}
                whileTap={canClick ? { scale: 0.94 } : undefined}
                onClick={canClick ? () => onClick!(n.id) : undefined}
              >
                {/* [6c] Completed lessons show original icon with badge */}
                {n.status === "completed" ? (
                  !isCP && Icon ? (
                    <div className="relative flex items-center justify-center">
                      <Icon style={{ width: 14, height: 14, color: "white" }} />
                      <div
                        className="absolute flex items-center justify-center rounded-full bg-emerald-500"
                        style={{ width: 9, height: 9, bottom: -1, right: -2 }}
                      >
                        <Check style={{ width: 6, height: 6, color: "white", strokeWidth: 3 }} />
                      </div>
                    </div>
                  ) : (
                    <Check style={{ width: isCP ? 20 : 14, height: isCP ? 20 : 14, color: "white", strokeWidth: 3 }} />
                  )
                ) : n.status === "current" ? (
                  Icon
                    ? <Icon style={{ width: iconSz, height: iconSz, color: "white" }} />
                    : <Play style={{ width: iconSz, height: iconSz, color: "white", fill: "white" }} />
                ) : (
                  <Lock style={{ width: isCP ? 18 : 12, height: isCP ? 18 : 12, color: `${col}88` }} />
                )}
              </motion.div>

              {/* [8b] Labels for ALL nodes — larger text for checkpoints */}
              <p
                className={cn(
                  "text-center mt-1 leading-tight",
                  isCP ? "text-[12px] font-bold" : "text-[10px] font-medium"
                )}
                style={{
                  color: n.status === "locked" ? `${col}88` : col,
                  maxWidth: isCP ? 90 : 80,
                }}
              >
                {n.label}
              </p>
              {/* Show sublabel for current node */}
              {n.status === "current" && n.sublabel && (
                <p className="text-[9px] text-center mt-0.5" style={{ color: "#9CA3AF" }}>
                  {n.sublabel}
                </p>
              )}
            </motion.div>
            {!isLast && (
              <div
                style={{
                  width: 2,
                  height: isCP ? 18 : 10,
                  background: n.status === "completed" ? col : `${col}35`,
                  borderRadius: 1,
                  margin: "3px 0",
                  opacity: n.status === "locked" ? 0.4 : 0.75,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function SerpentinePath({
  nodes,
  onNodeClick,
  activeNodeId,
  intensity = "normal",
  showModuleBackgrounds = true,
  lessonsPerModule = 6,
  className,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showAmbient,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  colorScheme,
  onNodeComplete,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  playSounds,
}: SerpentinePathProps) {
  const [isMobile, setIsMobile] = useState(false);
  const rafRef = useRef<number | null>(null);
  const nodeEls = useRef<Record<string, HTMLDivElement | null>>({});
  const prevStatuses = useRef<Record<string, NodeStatus>>({});

  // [6d, 7a] Track status transitions for animations
  const [justCompletedIds, setJustCompletedIds] = useState<Set<string>>(new Set());
  const [justUnlockedIds, setJustUnlockedIds] = useState<Set<string>>(new Set());

  const checkMobile = useCallback(() => setIsMobile(window.innerWidth < 768), []);

  useEffect(() => {
    checkMobile();
    const handler = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(checkMobile);
    };
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("resize", handler);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [checkMobile]);

  // Detect status transitions: current→completed (6d) and locked→current checkpoint (7a)
  useEffect(() => {
    const newCompleted = new Set<string>();
    const newUnlocked = new Set<string>();

    nodes.forEach((n) => {
      const prev = prevStatuses.current[n.id];
      if (prev && prev !== n.status) {
        if (prev === "current" && n.status === "completed") {
          newCompleted.add(n.id);
          onNodeComplete?.(n.id);
        }
        if (prev === "locked" && n.status === "current" && ntype(n) === "checkpoint") {
          newUnlocked.add(n.id);
        }
      }
      prevStatuses.current[n.id] = n.status;
    });

    const timers: ReturnType<typeof setTimeout>[] = [];

    if (newCompleted.size > 0) {
      setJustCompletedIds(newCompleted);
      timers.push(setTimeout(() => setJustCompletedIds(new Set()), 800));
    }
    if (newUnlocked.size > 0) {
      setJustUnlockedIds(newUnlocked);
      timers.push(setTimeout(() => setJustUnlockedIds(new Set()), 1000));
    }

    return () => timers.forEach(clearTimeout);
  }, [nodes, onNodeComplete]);

  // Scroll active node into view
  useEffect(() => {
    if (!activeNodeId) return;
    const el = nodeEls.current[activeNodeId];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeNodeId, isMobile]);

  const setRef = useCallback((id: string, el: HTMLDivElement | null) => {
    nodeEls.current[id] = el;
  }, []);

  if (nodes.length === 0) return null;

  const positions = computePositions(nodes);
  const colors = nodes.map((n, i) => resolveColor(n, resolveModIdx(n, i, lessonsPerModule)));

  return (
    <div className={cn("w-full", className)}>
      {isMobile ? (
        <MobileMap nodes={nodes} onClick={onNodeClick} colors={colors} />
      ) : (
        <DesktopMap
          nodes={nodes}
          onClick={onNodeClick}
          intensity={intensity}
          showModBgs={showModuleBackgrounds}
          lpm={lessonsPerModule}
          setRef={setRef}
          colors={colors}
          positions={positions}
          justCompletedIds={justCompletedIds}
          justUnlockedIds={justUnlockedIds}
        />
      )}
    </div>
  );
}

/*
🔧 Architect Decisions

1. TWO NODE TYPES: "lesson" (small stepping stones, 32-46px) and "checkpoint" (larger
   milestones, 44-52px). Checkpoints center horizontally; lessons zigzag in groups of 4.

2. DETERMINISTIC LAYOUT: Math.sin/cos with fixed seeds produce organic offsets without
   Math.random(). Safe for SSR hydration. Checkpoints always appear centered.

3. CSS ANIMATION FOR LESSON PULSE: sp-lesson-pulse in globals.css — not framer-motion.
   With 30+ nodes, CSS @keyframes is zero-JS and GPU-accelerated.

4. FRAMER-MOTION SCOPE: Only stagger entrance, tooltips, checkpoint ring rotation,
   shake on locked hover, and whileHover/whileTap. Total instances scale with viewport.

5. SVG EFFECTS ONLY ON CHECKPOINTS: CPOrbits (SVG animateTransform) and CPPing only
   render on checkpoint nodes — at most 6 per path. Lesson nodes have zero SVG effects.

6. SEGMENT-BASED PATHS: One <path> per adjacent pair rather than a clipped full path.
   35 segments for 36 nodes. Allows per-segment module-color coloring.

7. PARTICLE SPEED: 20s traversal (normal), 15s (spectacular). Slow, meditative flow.
   7-14 particles total, completed path portion only. No filter wrapper (5b).

8. MODULE BACKGROUNDS: Bounding-box rects per module with radialGradient fill.
   Zone labels anchored at first node per module (1c). Single <g> blur pass (5a).

9. BACKWARD COMPATIBILITY: PathNode = LessonNode alias. Old props (showAmbient, colorScheme,
   playSounds) accepted but unused. Old node arrays (type="lesson" by default, moduleColor
   auto-assigned) work without any modification.

10. STATUS TRANSITIONS: prevStatuses ref detects current→completed (6d completion burst)
    and locked→current checkpoint (7a unlock shockwave). Animations auto-clear after timeout.

11. MODULE-COLORED LOCKED NODES (1a+3a): Locked nodes use module color at low opacity
    instead of hardcoded gray. Path feels cohesive even through locked zones.

12. PROGRESS ARCS (6a): Each checkpoint shows a stroke-dasharray ring indicating
    lesson completion fraction. Gold for completed modules, module color for in-progress.
*/
