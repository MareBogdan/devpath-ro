"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Lightbulb, RotateCcw, Trophy, Zap } from "lucide-react";

import { cn } from "@/lib/utils";
import AssemblyBoard from "./AssemblyBoard";
import CPUPiece, { CPUIcon } from "./CPUPiece";
import {
  ALL_COMPONENT_IDS,
  BOARD_HEIGHT,
  BOARD_WIDTH,
  CONNECTIONS,
  CPU_COMPONENTS,
  SLOT_LAYOUT,
  SLOT_TO_COMPONENT,
  type CPUComponentId,
  type SlotId,
} from "./cpu-types";

// ─── Constants ────────────────────────────────────────────────────────────

const TOTAL_HP = 100;
const FIRST_DAMAGE = 20;
const NORMAL_DAMAGE = 16;
const FIRST_TRY_POINTS = 30;
const RETRY_POINTS = 20;
const HINT_COST = 15;
const MAX_HINTS = 3;
const BOOT_BONUS = 100;
const NO_HINTS_BONUS = 50;
const NO_WRONG_BONUS = 75;
const BOOT_STEP_MS = 1200;
const FINAL_STEP_MS = 800;
const WRONG_CLEAR_MS = 600;
const FACT_AUTO_DISMISS_MS = 4000;
const HINT_DURATION_MS = 2000;
const DAMAGE_CLEAR_MS = 1500;
const ALL_PLACED_DELAY_MS = 700;
const HINT_IDLE_MS = 30_000;
const VICTORY_REVEAL_DELAY_MS = 800;

type BootStep = {
  label: string;
  slotId: SlotId | null;
  color: string;
};

const BOOT_STEPS: readonly BootStep[] = [
  { label: "BOOT INIȚIAT", slotId: null, color: "#a29bfe" },
  { label: "FETCH", slotId: "slot-pc", color: "#FDCB6E" },
  { label: "DECODE", slotId: "slot-cu", color: "#00CEC9" },
  { label: "EXECUTE", slotId: "slot-alu", color: "#6C5CE7" },
  { label: "WRITE BACK", slotId: "slot-reg", color: "#a29bfe" },
  { label: "CYCLE COMPLETE", slotId: null, color: "#FDCB6E" },
];

/** Step → connection IDs along which a one-shot signal pulse should travel. */
const STEP_SIGNAL_CONNECTIONS: Record<number, readonly string[]> = {
  2: ["pc-cu"],
  3: ["cu-alu"],
  4: ["alu-reg"],
};

const FUN_FACTS: Record<CPUComponentId, string> = {
  alu: "Un ALU modern execută miliarde de operații pe secundă.",
  "control-unit":
    "Control Unit-ul citește Assembly și îl traduce în semnale electrice.",
  "program-counter":
    "Program Counter-ul avansează cu 4 bytes la fiecare instrucțiune x86.",
  registers: "Registrele sunt de ~100× mai rapide decât RAM-ul.",
  ram: "RAM-ul este volatil — se șterge complet când oprești curentul.",
  "system-bus":
    "System Bus-ul din primele PC-uri rula la 8 MHz. Azi: 3200+ MHz.",
};

// ─── Types ────────────────────────────────────────────────────────────────

type GamePhase =
  | "intro"
  | "assembling"
  | "all-placed"
  | "boot-sequence"
  | "victory";

type PlacementRecord = {
  componentId: CPUComponentId;
  placedAt: number;
  wasFirstTry: boolean;
};

type GameState = {
  phase: GamePhase;
  placedPieces: Partial<Record<CPUComponentId, boolean>>;
  draggingId: CPUComponentId | null;
  hintTargetId: CPUComponentId | null;
  dragOverSlot: SlotId | null;
  wrongSlot: SlotId | null;
  placements: PlacementRecord[];
  hp: number;
  score: number;
  hintsUsed: number;
  wrongAttemptsBySlot: Partial<Record<SlotId, number>>;
  currentFactId: CPUComponentId | null;
  bootStep: number;
  lastDamage: { amount: number; key: number } | null;
};

type Action =
  | { type: "START_GAME" }
  | { type: "DRAG_START"; id: CPUComponentId }
  | { type: "DRAG_OVER"; slotId: SlotId }
  | { type: "DRAG_LEAVE" }
  | { type: "DRAG_END" }
  | { type: "DROP"; slotId: SlotId; now: number }
  | { type: "CLEAR_WRONG" }
  | { type: "DISMISS_FACT" }
  | { type: "USE_HINT" }
  | { type: "HINT_END" }
  | { type: "START_BOOT_SEQUENCE" }
  | { type: "NEXT_BOOT_STEP" }
  | { type: "CLEAR_DAMAGE" }
  | { type: "RESET" };

// ─── Helpers ──────────────────────────────────────────────────────────────

function totalWrong(map: Partial<Record<SlotId, number>>): number {
  return Object.values(map).reduce((sum, v) => sum + (v ?? 0), 0);
}

function pickRandomUnplaced(
  placed: Partial<Record<CPUComponentId, boolean>>
): CPUComponentId | null {
  const remaining = ALL_COMPONENT_IDS.filter((id) => !placed[id]);
  if (remaining.length === 0) return null;
  const i = Math.floor(Math.random() * remaining.length);
  return remaining[i];
}

function bootStateFor(phase: GamePhase, step: number): {
  activeBootSlot: SlotId | null;
  bootComplete: boolean;
} {
  if (phase !== "boot-sequence") {
    return { activeBootSlot: null, bootComplete: false };
  }
  if (step >= 5) return { activeBootSlot: null, bootComplete: true };
  const slot = BOOT_STEPS[step]?.slotId ?? null;
  return { activeBootSlot: slot, bootComplete: false };
}

function statusForPhase(phase: GamePhase, placedCount: number): string {
  switch (phase) {
    case "intro":
      return "AWAITING ASSEMBLY";
    case "assembling":
      return `ASSEMBLY IN PROGRESS · ${placedCount}/6`;
    case "all-placed":
      return "ASSEMBLY COMPLETE";
    case "boot-sequence":
      return "BOOT SEQUENCE ACTIVE";
    case "victory":
      return "CPU ONLINE";
  }
}

function componentCountInfo(
  phase: GamePhase,
  placedCount: number
): { text: string; color: string } {
  if (
    placedCount >= 6 ||
    phase === "victory" ||
    phase === "boot-sequence" ||
    phase === "all-placed"
  ) {
    return { text: "ALL SYSTEMS GO", color: "#FDCB6E" };
  }
  return {
    text: `COMPONENTS: ${placedCount}/6`,
    color: "#00CEC9",
  };
}

function initialState(): GameState {
  return {
    phase: "intro",
    placedPieces: {},
    draggingId: null,
    hintTargetId: null,
    dragOverSlot: null,
    wrongSlot: null,
    placements: [],
    hp: TOTAL_HP,
    score: 0,
    hintsUsed: 0,
    wrongAttemptsBySlot: {},
    currentFactId: null,
    bootStep: 0,
    lastDamage: null,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "START_GAME":
      return { ...initialState(), phase: "assembling" };

    case "DRAG_START": {
      if (state.phase !== "assembling") return state;
      return {
        ...state,
        draggingId: action.id,
        hintTargetId: null,
        dragOverSlot: null,
      };
    }

    case "DRAG_OVER": {
      if (state.phase !== "assembling") return state;
      if (state.dragOverSlot === action.slotId) return state;
      return { ...state, dragOverSlot: action.slotId };
    }

    case "DRAG_LEAVE": {
      if (state.dragOverSlot === null) return state;
      return { ...state, dragOverSlot: null };
    }

    case "DRAG_END": {
      if (state.draggingId === null && state.dragOverSlot === null)
        return state;
      return { ...state, draggingId: null, dragOverSlot: null };
    }

    case "DROP": {
      if (state.phase !== "assembling") return state;
      const componentId = state.draggingId;
      if (!componentId) return state;
      const correctId = SLOT_TO_COMPONENT[action.slotId];

      // Wrong slot
      if (componentId !== correctId) {
        const prev = state.wrongAttemptsBySlot[action.slotId] ?? 0;
        return {
          ...state,
          wrongSlot: action.slotId,
          wrongAttemptsBySlot: {
            ...state.wrongAttemptsBySlot,
            [action.slotId]: prev + 1,
          },
          draggingId: null,
          dragOverSlot: null,
        };
      }

      // Correct slot
      const placedCount = Object.keys(state.placedPieces).length;
      const wasFirstTry =
        (state.wrongAttemptsBySlot[action.slotId] ?? 0) === 0;
      const damage = placedCount === 0 ? FIRST_DAMAGE : NORMAL_DAMAGE;
      const points = wasFirstTry ? FIRST_TRY_POINTS : RETRY_POINTS;
      const newPlacements: PlacementRecord[] = [
        ...state.placements,
        { componentId, placedAt: action.now, wasFirstTry },
      ];
      const newPlaced = {
        ...state.placedPieces,
        [componentId]: true,
      };
      const newHp = Math.max(0, state.hp - damage);
      const isLast = newPlacements.length >= 6;

      return {
        ...state,
        placedPieces: newPlaced,
        placements: newPlacements,
        hp: newHp,
        score: state.score + points,
        draggingId: null,
        dragOverSlot: null,
        lastDamage: { amount: damage, key: action.now },
        currentFactId: componentId,
        phase: isLast ? "all-placed" : "assembling",
      };
    }

    case "CLEAR_WRONG":
      if (state.wrongSlot === null) return state;
      return { ...state, wrongSlot: null };

    case "DISMISS_FACT":
      if (state.currentFactId === null) return state;
      return { ...state, currentFactId: null };

    case "USE_HINT": {
      if (state.phase !== "assembling") return state;
      if (state.hintsUsed >= MAX_HINTS) return state;
      if (state.draggingId !== null) return state;
      const target = pickRandomUnplaced(state.placedPieces);
      if (target === null) return state;
      const slotId = CPU_COMPONENTS[target].slotId;
      return {
        ...state,
        hintTargetId: target,
        dragOverSlot: slotId,
        hintsUsed: state.hintsUsed + 1,
        score: Math.max(0, state.score - HINT_COST),
      };
    }

    case "HINT_END":
      if (state.hintTargetId === null) return state;
      return { ...state, hintTargetId: null, dragOverSlot: null };

    case "START_BOOT_SEQUENCE": {
      if (state.phase !== "all-placed") return state;
      return { ...state, phase: "boot-sequence", bootStep: 0 };
    }

    case "NEXT_BOOT_STEP": {
      if (state.phase !== "boot-sequence") return state;
      const next = state.bootStep + 1;
      if (next > 5) {
        const noHints = state.hintsUsed === 0 ? NO_HINTS_BONUS : 0;
        const noWrong =
          totalWrong(state.wrongAttemptsBySlot) === 0 ? NO_WRONG_BONUS : 0;
        return {
          ...state,
          phase: "victory",
          bootStep: 5,
          score: state.score + BOOT_BONUS + noHints + noWrong,
        };
      }
      return { ...state, bootStep: next };
    }

    case "CLEAR_DAMAGE":
      if (state.lastDamage === null) return state;
      return { ...state, lastDamage: null };

    case "RESET":
      return initialState();

    default:
      return state;
  }
}

// ─── Confetti seed data (deterministic — no SSR mismatch) ────────────────

type ConfettiItem = {
  char: "0" | "1";
  leftPct: number;
  duration: number;
  delay: number;
  size: number;
  color: string;
};

const CONFETTI_COLORS = ["#00CEC9", "#6C5CE7", "#FDCB6E"];

const CONFETTI_DATA: ReadonlyArray<ConfettiItem> = Array.from(
  { length: 20 },
  (_, i) => {
    const seed = (i * 9301 + 49297) & 0xffff;
    const r1 = (seed * 31 + 17) & 0xffff;
    const r2 = (seed * 53 + 89) & 0xffff;
    const r3 = (seed * 71 + 113) & 0xffff;
    return {
      char: (i % 2 === 0 ? "0" : "1") as "0" | "1",
      leftPct: r1 % 100,
      duration: 2 + (r2 % 150) / 100,
      delay: (r3 % 150) / 100,
      size: 12 + (r1 % 16),
      color: CONFETTI_COLORS[i % 3],
    };
  }
);

// ─── Sub-components: HUD ─────────────────────────────────────────────────

function CornerBrackets() {
  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute left-2 top-2 z-20 h-3 w-3 border-l border-t border-[#6C5CE7]/45"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute right-2 top-2 z-20 h-3 w-3 border-r border-t border-[#6C5CE7]/45"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-2 left-2 z-20 h-3 w-3 border-b border-l border-[#6C5CE7]/45"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-2 right-2 z-20 h-3 w-3 border-b border-r border-[#6C5CE7]/45"
      />
    </>
  );
}

function PCBTraceLines() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      <line
        x1="0"
        y1="22"
        x2="100"
        y2="38"
        stroke="#6C5CE7"
        strokeWidth="0.18"
        opacity="0.5"
      />
      <line
        x1="0"
        y1="68"
        x2="100"
        y2="52"
        stroke="#00CEC9"
        strokeWidth="0.18"
        opacity="0.45"
      />
      <line
        x1="18"
        y1="0"
        x2="34"
        y2="100"
        stroke="#6C5CE7"
        strokeWidth="0.18"
        opacity="0.45"
      />
    </svg>
  );
}

// ─── Sub-component: CPUBootAnimation ─────────────────────────────────────

type CPUBootAnimationProps = {
  size: number;
  isAnimating: boolean;
  reduced: boolean;
};

const CHIP_PINS: readonly string[] = [
  // top
  "M 60 25 L 60 45",
  "M 90 25 L 90 45",
  "M 120 25 L 120 45",
  // right
  "M 135 60 L 155 60",
  "M 135 90 L 155 90",
  "M 135 120 L 155 120",
  // bottom
  "M 60 135 L 60 155",
  "M 90 135 L 90 155",
  "M 120 135 L 120 155",
  // left
  "M 25 60 L 45 60",
  "M 25 90 L 45 90",
  "M 25 120 L 45 120",
];

function CPUBootAnimation({
  size,
  isAnimating,
  reduced,
}: CPUBootAnimationProps) {
  const animate = isAnimating && !reduced;

  // 4×4 grid of inner dots, indexed in a spiral-ish stagger order.
  const gridDots = useMemo(() => {
    const out: { cx: number; cy: number; idx: number }[] = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        out.push({ cx: 55 + col * 22, cy: 55 + row * 22, idx: row * 4 + col });
      }
    }
    return out;
  }, []);

  return (
    <svg
      viewBox="0 0 180 180"
      width={size}
      height={size}
      aria-hidden
      style={{ display: "block" }}
    >
      {/* Pin lines (static dim) */}
      <g
        stroke="#6C5CE7"
        strokeWidth={1.4}
        fill="none"
        strokeLinecap="round"
        opacity={0.6}
      >
        {CHIP_PINS.map((p, i) => (
          <path key={i} d={p} />
        ))}
      </g>

      {/* Pin endpoint pads */}
      <g fill="#6C5CE7" opacity={0.5}>
        {[
          { cx: 60, cy: 23 },
          { cx: 90, cy: 23 },
          { cx: 120, cy: 23 },
          { cx: 157, cy: 60 },
          { cx: 157, cy: 90 },
          { cx: 157, cy: 120 },
          { cx: 60, cy: 157 },
          { cx: 90, cy: 157 },
          { cx: 120, cy: 157 },
          { cx: 23, cy: 60 },
          { cx: 23, cy: 90 },
          { cx: 23, cy: 120 },
        ].map((p, i) => (
          <rect
            key={i}
            x={p.cx - 2}
            y={p.cy - 2}
            width={4}
            height={4}
            rx={0.5}
          />
        ))}
      </g>

      {/* Chip body */}
      <rect
        x={45}
        y={45}
        width={90}
        height={90}
        rx={4}
        fill="#0a0a14"
        stroke="#6C5CE7"
        strokeWidth={2}
        style={{
          filter: animate
            ? "drop-shadow(0 0 14px rgba(108,92,231,0.65))"
            : "drop-shadow(0 0 7px rgba(108,92,231,0.3))",
          transition: "filter 500ms ease",
        }}
        className={!reduced ? "boss-cpu-chip-pulse" : undefined}
      />

      {/* Inner transistor grid */}
      {gridDots.map((d) => (
        <motion.circle
          key={d.idx}
          cx={d.cx}
          cy={d.cy}
          r={2}
          fill="#6C5CE7"
          initial={false}
          animate={
            animate
              ? { opacity: [0.25, 1, 0.25] }
              : { opacity: 0.4 }
          }
          transition={
            animate
              ? {
                  duration: 1.6,
                  delay: (d.idx * 0.07) % 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
              : { duration: 0.3 }
          }
          style={{
            filter: animate
              ? "drop-shadow(0 0 3px #6C5CE7)"
              : undefined,
          }}
        />
      ))}

      {/* CPU label */}
      <text
        x={90}
        y={95}
        textAnchor="middle"
        fontSize={11}
        fontFamily="ui-monospace, monospace"
        fontWeight={700}
        fill="#a89bf5"
        opacity={0.9}
      >
        CPU
      </text>

      {/* Animated dots traveling along pins (only when active) */}
      {animate &&
        CHIP_PINS.map((p, i) => (
          <circle
            key={`pin-dot-${i}`}
            r={2.5}
            fill="#00CEC9"
            style={{ filter: "drop-shadow(0 0 4px #00CEC9)" }}
          >
            <animateMotion
              dur="1.6s"
              begin={`${(i % 4) * -0.4}s`}
              repeatCount="indefinite"
              path={p}
            />
          </circle>
        ))}
    </svg>
  );
}

// ─── Sub-component: GlitchText ───────────────────────────────────────────

function GlitchText({
  children,
  color,
  className,
  reduced,
  settleAfterMs,
}: {
  children: ReactNode;
  color: string;
  className?: string;
  reduced: boolean;
  settleAfterMs?: number;
}) {
  const [glitching, setGlitching] = useState(true);
  useEffect(() => {
    if (settleAfterMs === undefined) return;
    const t = setTimeout(() => setGlitching(false), settleAfterMs);
    return () => clearTimeout(t);
  }, [settleAfterMs]);

  if (reduced || !glitching) {
    return (
      <span className={className} style={{ color }}>
        {children}
      </span>
    );
  }
  return (
    <span className={cn("relative inline-block", className)}>
      <span
        aria-hidden
        className="boss-cpu-glitch-r absolute inset-0"
        style={{ color: "#FF6B6B", mixBlendMode: "screen" }}
      >
        {children}
      </span>
      <span
        aria-hidden
        className="boss-cpu-glitch-b absolute inset-0"
        style={{ color: "#00CEC9", mixBlendMode: "screen" }}
      >
        {children}
      </span>
      <span className="relative" style={{ color }}>
        {children}
      </span>
    </span>
  );
}

// ─── Sub-component: BinaryConfetti ───────────────────────────────────────

function BinaryConfetti({
  count = 15,
  scale = 1,
  loop = true,
  reduced,
}: {
  count?: number;
  scale?: number;
  loop?: boolean;
  reduced: boolean;
}) {
  if (reduced) return null;
  const items = CONFETTI_DATA.slice(0, count);
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
    >
      {items.map((el, i) => (
        <span
          key={i}
          className="absolute -top-4 font-mono font-bold"
          style={{
            left: `${el.leftPct}%`,
            color: el.color,
            fontSize: `${el.size}px`,
            textShadow: `0 0 6px ${el.color}`,
            animation: `boss-cpu-binary-fall ${el.duration * scale}s linear ${el.delay * scale}s ${loop ? "infinite" : "forwards"}`,
          }}
        >
          {el.char}
        </span>
      ))}
    </div>
  );
}

// ─── Sub-component: PostPlacementEffects ─────────────────────────────────

function PostPlacementEffects({
  componentId,
  placedPieces,
  reduced,
}: {
  componentId: CPUComponentId;
  placedPieces: Partial<Record<CPUComponentId, boolean>>;
  reduced: boolean;
}) {
  if (reduced) return null;

  const slot = SLOT_LAYOUT.find((s) => s.componentId === componentId);
  if (!slot) return null;

  const cx = slot.x + slot.w / 2;
  const cy = slot.y + slot.h / 2;

  // Find connections that just lit up (involving this component, both ends placed).
  const newConnections = CONNECTIONS.filter((conn) => {
    const fromId = SLOT_TO_COMPONENT[conn.fromSlot];
    const toId = SLOT_TO_COMPONENT[conn.toSlot];
    return (
      (fromId === componentId || toId === componentId) &&
      !!placedPieces[fromId] &&
      !!placedPieces[toId]
    );
  });

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-x-auto">
      <div
        className="relative mx-auto"
        style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT }}
      >
        {/* Particle burst (6 violet sparks radiating from slot center) */}
        <div
          className="absolute"
          style={{
            left: cx,
            top: cy,
            width: 0,
            height: 0,
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className="boss-cpu-particle absolute"
              style={
                {
                  left: -3,
                  top: -3,
                  width: 6,
                  height: 6,
                  borderRadius: "9999px",
                  background: "#6C5CE7",
                  boxShadow: "0 0 8px #6C5CE7",
                  "--cpu-angle": `${i * 60}deg`,
                } as CSSProperties
              }
            />
          ))}
        </div>

        {/* Power-surge white flash along newly-active connections */}
        {newConnections.length > 0 && (
          <svg
            className="pointer-events-none absolute inset-0"
            viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
            style={{ overflow: "visible" }}
          >
            {newConnections.map((conn) => (
              <g key={conn.id}>
                <circle
                  r={5}
                  fill="#ffffff"
                  opacity={0}
                  style={{ filter: "drop-shadow(0 0 8px #ffffff)" }}
                >
                  <animate
                    attributeName="opacity"
                    values="0;1;1;0"
                    keyTimes="0;0.15;0.85;1"
                    dur="0.75s"
                    begin="0s"
                    repeatCount="1"
                    fill="freeze"
                  />
                  <animateMotion
                    dur="0.75s"
                    begin="0s"
                    repeatCount="1"
                    path={conn.path}
                    fill="freeze"
                  />
                </circle>
              </g>
            ))}
          </svg>
        )}
      </div>
    </div>
  );
}

// ─── Sub-component: SignalPulseOverlay (boot sequence) ──────────────────

function SignalPulseOverlay({
  step,
  reduced,
}: {
  step: number;
  reduced: boolean;
}) {
  if (reduced) return null;
  const connIds = STEP_SIGNAL_CONNECTIONS[step];
  if (!connIds) return null;
  const conns = CONNECTIONS.filter((c) => connIds.includes(c.id));
  if (conns.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-x-auto">
      <div
        className="relative mx-auto"
        style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT }}
      >
        <svg
          className="pointer-events-none absolute inset-0"
          viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
          style={{ overflow: "visible" }}
        >
          {conns.map((conn) => (
            <g key={`${step}-${conn.id}`}>
              <circle
                r={6}
                fill="#00CEC9"
                opacity={0}
                style={{
                  filter:
                    "drop-shadow(0 0 10px #00CEC9) drop-shadow(0 0 18px #00CEC9)",
                }}
              >
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  keyTimes="0;0.12;0.88;1"
                  dur="0.7s"
                  begin="0s"
                  repeatCount="1"
                  fill="freeze"
                />
                <animateMotion
                  dur="0.7s"
                  begin="0s"
                  repeatCount="1"
                  path={conn.path}
                  fill="freeze"
                />
              </circle>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

// ─── Sub-component: FactOverlay ──────────────────────────────────────────

function FactOverlay({
  componentId,
  onDismiss,
  reduced,
}: {
  componentId: CPUComponentId;
  onDismiss: () => void;
  reduced: boolean;
}) {
  const component = CPU_COMPONENTS[componentId];
  return (
    <motion.div
      className="absolute inset-0 z-30 flex items-center justify-center px-4"
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduced ? undefined : { opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[#080810]/72 backdrop-blur-[2px]"
      />

      {/* Horizontal scan line sweeps down before card appears */}
      {!reduced && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 h-px"
          style={{
            background: `linear-gradient(to right, transparent, ${component.color}, transparent)`,
            boxShadow: `0 0 10px ${component.glowColor}`,
          }}
          initial={{ top: 0, opacity: 0 }}
          animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 0.45,
            ease: "easeOut",
            times: [0, 0.1, 0.9, 1],
          }}
        />
      )}

      <motion.div
        initial={reduced ? false : { scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={reduced ? undefined : { scale: 0.92, opacity: 0 }}
        transition={{
          type: "spring",
          stiffness: 220,
          damping: 20,
          delay: reduced ? 0 : 0.3,
        }}
        className="relative z-10 w-full max-w-md rounded-lg border-2 bg-[#0a0a14] p-6 text-center"
        style={{
          borderColor: component.color,
          boxShadow: `0 0 30px ${component.glowColor}66`,
        }}
      >
        <div
          className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-md"
          style={{
            background: `${component.color}1a`,
            border: `1px solid ${component.color}66`,
            filter: `drop-shadow(0 0 10px ${component.glowColor}77)`,
          }}
        >
          <CPUIcon kind={component.icon} color={component.color} size={36} />
        </div>

        <p
          className="font-mono text-3xl font-bold leading-none"
          style={{ color: component.color }}
        >
          {component.label}
        </p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">
          {component.fullName}
        </p>

        <ul className="mt-4 flex flex-col gap-1.5 text-left text-sm text-white/80">
          {component.facts.map((f, i) => (
            <li key={i} className="flex items-start gap-2">
              <span
                className="mt-1 h-1 w-1 shrink-0 rounded-full"
                style={{ background: component.color }}
              />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <p
          className="mt-4 border-l-2 pl-3 text-left text-xs italic text-white/65"
          style={{ borderColor: `${component.color}88` }}
        >
          {FUN_FACTS[componentId]}
        </p>

        <button
          type="button"
          onClick={onDismiss}
          className="mt-5 inline-flex items-center gap-2 border-2 px-5 py-2 font-mono text-sm font-bold uppercase tracking-wider transition-transform hover:scale-105 active:scale-95"
          style={{
            borderColor: component.color,
            color: component.color,
            background: `${component.color}14`,
          }}
        >
          Înțeles!
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────

export function BossFightAsambleazaCPU() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const reduced = useReducedMotion() ?? false;

  const [hintIdle, setHintIdle] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [victoryRevealed, setVictoryRevealed] = useState(false);

  // ── Side effects (timers) ───────────────────────────────────────────

  useEffect(() => {
    if (!state.wrongSlot) return;
    const t = setTimeout(() => dispatch({ type: "CLEAR_WRONG" }), WRONG_CLEAR_MS);
    return () => clearTimeout(t);
  }, [state.wrongSlot]);

  useEffect(() => {
    if (!state.lastDamage) return;
    const t = setTimeout(() => dispatch({ type: "CLEAR_DAMAGE" }), DAMAGE_CLEAR_MS);
    return () => clearTimeout(t);
  }, [state.lastDamage]);

  useEffect(() => {
    if (!state.currentFactId) return;
    const t = setTimeout(
      () => dispatch({ type: "DISMISS_FACT" }),
      FACT_AUTO_DISMISS_MS
    );
    return () => clearTimeout(t);
  }, [state.currentFactId]);

  useEffect(() => {
    if (!state.hintTargetId) return;
    const t = setTimeout(() => dispatch({ type: "HINT_END" }), HINT_DURATION_MS);
    return () => clearTimeout(t);
  }, [state.hintTargetId]);

  useEffect(() => {
    if (state.phase !== "all-placed") return;
    const t = setTimeout(
      () => dispatch({ type: "START_BOOT_SEQUENCE" }),
      ALL_PLACED_DELAY_MS
    );
    return () => clearTimeout(t);
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== "boot-sequence") return;
    const delay = state.bootStep === 5 ? FINAL_STEP_MS : BOOT_STEP_MS;
    const t = setTimeout(
      () => dispatch({ type: "NEXT_BOOT_STEP" }),
      reduced ? Math.min(delay, 400) : delay
    );
    return () => clearTimeout(t);
  }, [state.phase, state.bootStep, reduced]);

  useEffect(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    setHintIdle(false);
    if (
      state.phase === "assembling" &&
      state.hintsUsed < MAX_HINTS &&
      state.draggingId === null
    ) {
      idleTimerRef.current = setTimeout(() => setHintIdle(true), HINT_IDLE_MS);
    }
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [
    state.phase,
    state.placements.length,
    state.hintsUsed,
    state.wrongSlot,
    state.draggingId,
  ]);

  // Victory: wait 800ms after entering victory before revealing content
  useEffect(() => {
    if (state.phase !== "victory") {
      setVictoryRevealed(false);
      return;
    }
    const t = setTimeout(
      () => setVictoryRevealed(true),
      reduced ? 250 : VICTORY_REVEAL_DELAY_MS
    );
    return () => clearTimeout(t);
  }, [state.phase, reduced]);

  // ── Memoized derivations ────────────────────────────────────────────

  const availablePieces = useMemo(
    () =>
      ALL_COMPONENT_IDS.filter((id) => !state.placedPieces[id]).map(
        (id) => CPU_COMPONENTS[id]
      ),
    [state.placedPieces]
  );
  const placedCount = useMemo(
    () => Object.keys(state.placedPieces).length,
    [state.placedPieces]
  );

  const effectiveDraggingId = state.draggingId ?? state.hintTargetId;
  const { activeBootSlot, bootComplete } = bootStateFor(
    state.phase,
    state.bootStep
  );

  const lastPlacement = state.placements.at(-1) ?? null;

  // ── Callbacks ───────────────────────────────────────────────────────

  const handleDragStart = useCallback((id: CPUComponentId) => {
    dispatch({ type: "DRAG_START", id });
  }, []);
  const handleDragEnd = useCallback(() => {
    dispatch({ type: "DRAG_END" });
  }, []);
  const handleDragOver = useCallback((slotId: SlotId) => {
    dispatch({ type: "DRAG_OVER", slotId });
  }, []);
  const handleDragLeave = useCallback(() => {
    dispatch({ type: "DRAG_LEAVE" });
  }, []);
  const handleDrop = useCallback((slotId: SlotId) => {
    dispatch({ type: "DROP", slotId, now: performance.now() });
  }, []);
  const handleHint = useCallback(() => {
    dispatch({ type: "USE_HINT" });
  }, []);

  // ── Status text ─────────────────────────────────────────────────────

  const statusText = statusForPhase(state.phase, placedCount);
  const countInfo = componentCountInfo(state.phase, placedCount);
  const inBoot = state.phase === "boot-sequence";
  const currentBootStep = inBoot ? BOOT_STEPS[state.bootStep] : null;
  const showStep5Flash =
    inBoot && state.bootStep === 5 && !reduced;
  const totalWrongCount = totalWrong(state.wrongAttemptsBySlot);
  const hpPct = (state.hp / TOTAL_HP) * 100;

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div className="my-10">
      <style>{CSS_STYLES}</style>

      <div
        className="relative border-y border-[#6C5CE7]/50 bg-[#080810] text-foreground"
        style={{ boxShadow: "0 0 60px rgba(108,92,231,0.12)" }}
      >
        {/* PCB trace lines (static) */}
        <PCBTraceLines />

        {/* Scrolling scanlines */}
        {!reduced && (
          <div
            aria-hidden
            className="boss-cpu-scanlines pointer-events-none absolute inset-0 z-0"
          />
        )}

        {/* Ambient radial pulse */}
        {!reduced && (
          <div
            aria-hidden
            className="boss-cpu-radial-pulse pointer-events-none absolute inset-0 z-0"
            style={{
              background:
                "radial-gradient(circle at center, rgba(108,92,231,0.06), transparent 60%)",
            }}
          />
        )}

        <CornerBrackets />

        {/* Step-5 board flash overlay */}
        <AnimatePresence>
          {showStep5Flash && (
            <motion.div
              key={`step5-flash-${state.bootStep}`}
              aria-hidden
              className="pointer-events-none absolute inset-0 z-30 border-2 border-[#FDCB6E]"
              style={{
                boxShadow:
                  "0 0 50px rgba(253,203,110,0.55), inset 0 0 50px rgba(253,203,110,0.35)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.65, times: [0, 0.4, 1] }}
            />
          )}
        </AnimatePresence>

        {/* Step-5 confetti (brief) */}
        {showStep5Flash && (
          <BinaryConfetti count={10} scale={0.5} loop={false} reduced={reduced} />
        )}

        {/* Top header bar */}
        <div className="relative z-10 flex items-center justify-between gap-4 border-b border-[#6C5CE7]/15 bg-gradient-to-r from-[#6C5CE7]/[0.06] via-transparent to-[#00CEC9]/[0.04] px-5 py-2.5">
          <span className="font-mono text-[10px] tracking-[0.18em] text-[#6C5CE7]/75">
            CPU_ASSEMBLY_SYS // VON_NEUMANN_ARCH
          </span>
          <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-white/85">
            {statusText}
          </span>
          <div className="flex items-center gap-2.5">
            <span
              className="font-mono text-[10px] tracking-[0.18em]"
              style={{ color: countInfo.color }}
            >
              {countInfo.text}
            </span>
            {state.phase !== "intro" && (
              <span
                className="shrink-0"
                style={{
                  filter: "drop-shadow(0 0 4px rgba(108,92,231,0.5))",
                }}
              >
                <CPUBootAnimation
                  size={26}
                  isAnimating={true}
                  reduced={reduced}
                />
              </span>
            )}
          </div>
        </div>

        {/* Phase content */}
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {/* ─── INTRO ─────────────────────────────────────────── */}
            {state.phase === "intro" && (
              <motion.div
                key="intro"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduced ? undefined : { opacity: 0, y: -28 }}
                transition={{ duration: 0.45 }}
                className="mx-auto flex max-w-2xl flex-col items-center px-6 py-10 text-center"
              >
                <motion.div
                  initial={reduced ? false : { scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 18,
                  }}
                >
                  <CPUBootAnimation
                    size={170}
                    isAnimating={false}
                    reduced={reduced}
                  />
                </motion.div>

                <motion.p
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 font-mono text-[11px] uppercase tracking-[0.32em] text-[#FF6B6B]"
                >
                  BOSS FIGHT
                </motion.p>

                <h2 className="mt-2 text-5xl font-extrabold tracking-tight text-white">
                  {Array.from("ASAMBLEAZĂ CPU").map((char, i) => (
                    <motion.span
                      key={i}
                      initial={reduced ? false : { opacity: 0, y: -16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: reduced ? 0 : 0.55 + i * 0.05,
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                      style={{
                        display: "inline-block",
                        whiteSpace: "pre",
                      }}
                    >
                      {char === " " ? " " : char}
                    </motion.span>
                  ))}
                </h2>

                <motion.div
                  initial={reduced ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.45 }}
                  className="mt-5 flex flex-wrap items-center justify-center gap-2"
                >
                  <span className="border border-[#6C5CE7]/40 bg-[#6C5CE7]/[0.08] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#a89bf5]">
                    6 COMPONENTE
                  </span>
                  <span className="border border-[#00CEC9]/40 bg-[#00CEC9]/[0.08] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#00CEC9]">
                    VON NEUMANN
                  </span>
                  <span className="border border-[#FDCB6E]/40 bg-[#FDCB6E]/[0.08] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#FDCB6E]">
                    FETCH → DECODE → EXECUTE
                  </span>
                </motion.div>

                <motion.p
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8 }}
                  className="mt-5 max-w-md text-sm text-white/65"
                >
                  CPU-ul tău e în bucăți. Fiecare componentă are un slot exact
                  în arhitectura Von Neumann. Asamblează totul corect și
                  pornește primul ciclu de instrucțiuni.
                </motion.p>

                <motion.button
                  type="button"
                  initial={reduced ? false : { opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2.2 }}
                  whileHover={reduced ? undefined : { scale: 1.05 }}
                  whileTap={reduced ? undefined : { scale: 0.97 }}
                  onClick={() => dispatch({ type: "START_GAME" })}
                  className="boss-cpu-btn-pulse mt-7 inline-flex items-center gap-2 border-2 border-[#6C5CE7] bg-[#6C5CE7]/[0.1] px-7 py-3 font-mono text-sm font-bold uppercase tracking-[0.18em] text-[#a89bf5]"
                >
                  <Zap className="h-4 w-4" aria-hidden />
                  Începe Asamblarea
                </motion.button>
              </motion.div>
            )}

            {/* ─── GAME (assembling / all-placed / boot-sequence) ── */}
            {(state.phase === "assembling" ||
              state.phase === "all-placed" ||
              state.phase === "boot-sequence") && (
              <motion.div
                key="game"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduced ? undefined : { opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="px-5 pb-6 pt-5"
              >
                {/* HP / score row */}
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.18em]">
                    <span className="text-[#FF6B6B]/85">
                      CPU DEFECT:{" "}
                      <span className="font-bold tabular-nums text-[#FF6B6B]">
                        {state.hp}
                      </span>
                      /{TOTAL_HP}
                    </span>
                    <span className="text-white/45">
                      PIESE:{" "}
                      <span className="font-bold text-white tabular-nums">
                        {placedCount}
                      </span>
                      /6
                    </span>
                    <span className="text-[#FDCB6E]/85">
                      SCOR:{" "}
                      <motion.span
                        key={state.score}
                        initial={
                          reduced ? false : { scale: 1.4, color: "#00FF94" }
                        }
                        animate={{ scale: 1, color: "#FDCB6E" }}
                        transition={{ duration: 0.4 }}
                        className="font-bold tabular-nums"
                      >
                        {state.score}
                      </motion.span>
                    </span>
                  </div>

                  <div className="relative">
                    <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/[0.06]">
                      <motion.div
                        className="h-full rounded-full"
                        initial={false}
                        animate={{ width: `${hpPct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        style={{
                          backgroundColor: "#FF6B6B",
                          boxShadow: "0 0 8px #FF6B6B",
                        }}
                      />
                      <AnimatePresence>
                        {state.lastDamage && !reduced && (
                          <motion.div
                            key={`flash-${state.lastDamage.key}`}
                            aria-hidden
                            className="pointer-events-none absolute inset-0 bg-[#FFE2E2]"
                            initial={{ opacity: 0.55 }}
                            animate={{ opacity: 0 }}
                            transition={{ duration: 0.45 }}
                          />
                        )}
                      </AnimatePresence>
                    </div>

                    <AnimatePresence>
                      {state.lastDamage && !reduced && (
                        <motion.span
                          key={`dmg-${state.lastDamage.key}`}
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: [1, 1, 0], y: -28 }}
                          transition={{ duration: 1.2 }}
                          className="pointer-events-none absolute right-2 top-0 font-mono text-base font-bold text-[#FF6B6B]"
                          style={{
                            textShadow: "0 0 8px rgba(255,107,107,0.6)",
                          }}
                        >
                          -{state.lastDamage.amount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Boot step label */}
                <div className="mb-3 flex h-7 items-center justify-center">
                  <AnimatePresence mode="wait">
                    {currentBootStep !== null && (
                      <motion.span
                        key={`bs-${state.bootStep}`}
                        initial={reduced ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduced ? undefined : { opacity: 0, y: -6 }}
                        transition={{ duration: 0.25 }}
                        style={{
                          textShadow: `0 0 14px ${currentBootStep.color}77`,
                        }}
                        className="font-mono text-lg font-bold uppercase tracking-[0.32em]"
                      >
                        <GlitchText
                          color={currentBootStep.color}
                          reduced={reduced}
                          settleAfterMs={400}
                        >
                          {currentBootStep.label}
                        </GlitchText>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {/* Board + overlays */}
                <div className="relative">
                  <AssemblyBoard
                    placedPieces={state.placedPieces}
                    dragOverSlot={state.dragOverSlot}
                    wrongSlot={state.wrongSlot}
                    draggingId={effectiveDraggingId}
                    activeBootSlot={activeBootSlot}
                    bootComplete={bootComplete}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  />

                  {/* One-shot post-placement effects (particles + line surge) */}
                  {lastPlacement && (
                    <PostPlacementEffects
                      key={lastPlacement.placedAt}
                      componentId={lastPlacement.componentId}
                      placedPieces={state.placedPieces}
                      reduced={reduced}
                    />
                  )}

                  {/* Boot-step signal pulse */}
                  {inBoot && (
                    <SignalPulseOverlay
                      key={`pulse-${state.bootStep}`}
                      step={state.bootStep}
                      reduced={reduced}
                    />
                  )}

                  {/* Fact overlay */}
                  <AnimatePresence>
                    {state.currentFactId && (
                      <FactOverlay
                        key={state.currentFactId}
                        componentId={state.currentFactId}
                        onDismiss={() => dispatch({ type: "DISMISS_FACT" })}
                        reduced={reduced}
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* Boot progress bar */}
                {inBoot && (
                  <div className="mt-4 grid grid-cols-6 gap-1.5">
                    {BOOT_STEPS.map((step, i) => {
                      const active = i <= state.bootStep;
                      return (
                        <div
                          key={step.label}
                          className="h-1 rounded-full"
                          style={{
                            background: active
                              ? step.color
                              : "rgba(255,255,255,0.06)",
                            boxShadow: active
                              ? `0 0 6px ${step.color}`
                              : "none",
                            transition:
                              "background 300ms ease, box-shadow 300ms ease",
                          }}
                        />
                      );
                    })}
                  </div>
                )}

                {/* Tray + hint */}
                <div className="mt-6">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#6C5CE7]/75">
                      COMPONENTE DISPONIBILE{" "}
                      <span className="text-white/45">
                        · {availablePieces.length}/6
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={handleHint}
                      disabled={
                        state.hintsUsed >= MAX_HINTS ||
                        state.draggingId !== null ||
                        state.phase !== "assembling"
                      }
                      className={cn(
                        "inline-flex items-center gap-1.5 border px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] transition-colors",
                        state.hintsUsed >= MAX_HINTS ||
                          state.phase !== "assembling"
                          ? "cursor-not-allowed border-white/15 bg-white/[0.02] text-white/30"
                          : "cursor-pointer border-[#FDCB6E]/45 bg-[#FDCB6E]/[0.08] text-[#FDCB6E] hover:bg-[#FDCB6E]/[0.15]",
                        hintIdle &&
                          state.phase === "assembling" &&
                          "boss-cpu-hint-pulse"
                      )}
                    >
                      <Lightbulb className="h-3 w-3" aria-hidden />
                      Hint ({MAX_HINTS - state.hintsUsed} rămase)
                    </button>
                  </div>

                  <div className="flex min-h-[120px] flex-wrap items-center gap-3 rounded border border-[#6C5CE7]/15 bg-[#0a0a14] p-3">
                    <AnimatePresence mode="popLayout">
                      {availablePieces.map((component) => (
                        <motion.div
                          key={component.id}
                          layout
                          initial={
                            reduced ? false : { opacity: 0, scale: 0.8 }
                          }
                          animate={{ opacity: 1, scale: 1 }}
                          exit={
                            reduced
                              ? undefined
                              : {
                                  opacity: 0,
                                  scale: 0.5,
                                  transition: { duration: 0.3 },
                                }
                          }
                          transition={{
                            layout: {
                              type: "spring",
                              stiffness: 220,
                              damping: 22,
                            },
                            duration: 0.25,
                          }}
                        >
                          <CPUPiece
                            component={component}
                            isDragging={state.draggingId === component.id}
                            isPlaced={false}
                            isDisabled={state.phase !== "assembling"}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {availablePieces.length === 0 && (
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
                        ✓ Toate componentele sunt la locul lor
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── VICTORY ─────────────────────────────────────── */}
            {state.phase === "victory" && (
              <motion.div
                key="victory"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="relative px-6 py-10"
              >
                <BinaryConfetti
                  count={15}
                  scale={1}
                  loop={true}
                  reduced={reduced}
                />

                <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center">
                  <motion.div
                    initial={reduced ? false : { scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 16,
                    }}
                    style={{
                      filter: "drop-shadow(0 0 22px rgba(108,92,231,0.55))",
                    }}
                  >
                    <CPUBootAnimation
                      size={200}
                      isAnimating={true}
                      reduced={reduced}
                    />
                  </motion.div>

                  <AnimatePresence>
                    {victoryRevealed && (
                      <motion.div
                        key="victory-body"
                        initial={
                          reduced ? false : { opacity: 0, y: 20 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="flex flex-col items-center"
                      >
                        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.3em] text-[#00CEC9]/85">
                          VON_NEUMANN_ONLINE
                        </p>
                        <h2 className="mt-2 text-5xl font-extrabold tracking-tight">
                          <GlitchText
                            color="#00FF94"
                            reduced={reduced}
                            settleAfterMs={1000}
                          >
                            CPU OPERAȚIONAL
                          </GlitchText>
                        </h2>

                        <motion.div
                          initial={
                            reduced
                              ? false
                              : { scale: 0.5, rotate: -15 }
                          }
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{
                            delay: 0.4,
                            type: "spring",
                            stiffness: 220,
                            damping: 14,
                          }}
                          className="mt-4"
                        >
                          <Trophy
                            className="h-12 w-12 text-[#FDCB6E]"
                            style={{
                              filter:
                                "drop-shadow(0 0 18px rgba(253,203,110,0.6))",
                            }}
                            aria-hidden
                          />
                        </motion.div>

                        <motion.p
                          initial={
                            reduced
                              ? false
                              : { opacity: 0, scale: 0.85 }
                          }
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.55 }}
                          className="mt-3 font-mono text-6xl font-bold tabular-nums text-[#FDCB6E]"
                          style={{
                            textShadow:
                              "0 0 20px rgba(253,203,110,0.55)",
                          }}
                        >
                          {state.score}
                        </motion.p>

                        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                          {[
                            {
                              label: `+${BOOT_BONUS} BOOT CYCLE`,
                              color: "#00CEC9",
                              show: true,
                            },
                            {
                              label: `+${NO_HINTS_BONUS} NO HINTS`,
                              color: "#6C5CE7",
                              show: state.hintsUsed === 0,
                            },
                            {
                              label: `+${NO_WRONG_BONUS} FLAWLESS`,
                              color: "#FDCB6E",
                              show: totalWrongCount === 0,
                            },
                          ]
                            .filter((p) => p.show)
                            .map((p, i) => (
                              <motion.span
                                key={p.label}
                                initial={
                                  reduced
                                    ? false
                                    : { opacity: 0, x: -10 }
                                }
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  delay: 0.7 + i * 0.12,
                                  duration: 0.3,
                                }}
                                className="border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider"
                                style={{
                                  color: p.color,
                                  borderColor: `${p.color}66`,
                                  background: `${p.color}14`,
                                }}
                              >
                                {p.label}
                              </motion.span>
                            ))}
                        </div>

                        <motion.div
                          initial={
                            reduced
                              ? false
                              : { opacity: 0, y: 12 }
                          }
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.1 }}
                          className="mt-5 inline-flex items-center gap-2 border border-[#FDCB6E]/40 bg-[#FDCB6E]/[0.08] px-4 py-1.5"
                        >
                          <span aria-hidden className="text-base">
                            ⚙️
                          </span>
                          <span
                            className={cn(
                              "font-mono text-xs font-bold uppercase tracking-[0.2em]",
                              !reduced && "boss-cpu-shimmer-text"
                            )}
                            style={
                              reduced ? { color: "#FDCB6E" } : undefined
                            }
                          >
                            CPU Architect
                          </span>
                        </motion.div>

                        <motion.button
                          type="button"
                          initial={
                            reduced
                              ? false
                              : { opacity: 0, scale: 0.94 }
                          }
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1.3 }}
                          whileHover={
                            reduced ? undefined : { scale: 1.05 }
                          }
                          whileTap={
                            reduced ? undefined : { scale: 0.97 }
                          }
                          onClick={() => dispatch({ type: "RESET" })}
                          className="mt-6 inline-flex items-center gap-2 border-2 border-[#FDCB6E] bg-[#FDCB6E]/[0.1] px-6 py-3 font-mono text-sm font-bold uppercase tracking-[0.18em] text-[#FDCB6E]"
                        >
                          <RotateCcw className="h-4 w-4" aria-hidden />
                          Continuă
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── CSS keyframes ───────────────────────────────────────────────────────

const CSS_STYLES = `
@keyframes boss-cpu-scanlines-scroll {
  from { background-position: 0 0; }
  to { background-position: 0 80px; }
}
.boss-cpu-scanlines {
  background-image: repeating-linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.03) 0,
    rgba(255, 255, 255, 0.03) 1px,
    transparent 1px,
    transparent 4px
  );
  animation: boss-cpu-scanlines-scroll 6s linear infinite;
  opacity: 0.85;
}

@keyframes boss-cpu-radial-pulse-kf {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
.boss-cpu-radial-pulse { animation: boss-cpu-radial-pulse-kf 5s ease-in-out infinite; }

@keyframes boss-cpu-btn-pulse-kf {
  0%, 100% { box-shadow: 0 0 12px rgba(108, 92, 231, 0.35); }
  50% { box-shadow: 0 0 28px rgba(108, 92, 231, 0.75); }
}
.boss-cpu-btn-pulse { animation: boss-cpu-btn-pulse-kf 1.5s ease-in-out infinite; }

@keyframes boss-cpu-hint-pulse-kf {
  0%, 100% { box-shadow: 0 0 0px rgba(253, 203, 110, 0); }
  50% { box-shadow: 0 0 16px rgba(253, 203, 110, 0.55); }
}
.boss-cpu-hint-pulse { animation: boss-cpu-hint-pulse-kf 1.6s ease-in-out infinite; }

@keyframes boss-cpu-particle-kf {
  0% {
    transform: rotate(var(--cpu-angle, 0deg)) translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: rotate(var(--cpu-angle, 0deg)) translateY(-44px) scale(0.2);
    opacity: 0;
  }
}
.boss-cpu-particle { animation: boss-cpu-particle-kf 0.6s ease-out forwards; }

@keyframes boss-cpu-binary-fall {
  from { transform: translateY(-20px); opacity: 1; }
  to { transform: translateY(100vh); opacity: 0; }
}

@keyframes boss-cpu-shimmer-kf {
  from { background-position: -200% center; }
  to { background-position: 200% center; }
}
.boss-cpu-shimmer-text {
  background-image: linear-gradient(
    90deg,
    #FDCB6E 0%,
    #FDCB6E 35%,
    #fff7d6 50%,
    #FDCB6E 65%,
    #FDCB6E 100%
  );
  background-size: 200% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  animation: boss-cpu-shimmer-kf 2.4s linear infinite;
}

@keyframes boss-cpu-chip-pulse-kf {
  0%, 100% { stroke-opacity: 0.75; }
  50% { stroke-opacity: 1; }
}
.boss-cpu-chip-pulse { animation: boss-cpu-chip-pulse-kf 2s ease-in-out infinite; }

@keyframes boss-cpu-glitch-r-kf {
  0%, 100% { transform: translate(0, 0); }
  20% { transform: translate(-2px, 1px); }
  40% { transform: translate(1px, -1px); }
  60% { transform: translate(-1px, 2px); }
  80% { transform: translate(2px, 0); }
}
@keyframes boss-cpu-glitch-b-kf {
  0%, 100% { transform: translate(0, 0); }
  20% { transform: translate(2px, -1px); }
  40% { transform: translate(-1px, 1px); }
  60% { transform: translate(1px, -2px); }
  80% { transform: translate(-2px, 0); }
}
.boss-cpu-glitch-r { animation: boss-cpu-glitch-r-kf 0.4s steps(1, end) infinite; }
.boss-cpu-glitch-b { animation: boss-cpu-glitch-b-kf 0.4s steps(1, end) infinite; }

@media (prefers-reduced-motion: reduce) {
  .boss-cpu-scanlines,
  .boss-cpu-radial-pulse,
  .boss-cpu-btn-pulse,
  .boss-cpu-hint-pulse,
  .boss-cpu-particle,
  .boss-cpu-shimmer-text,
  .boss-cpu-chip-pulse,
  .boss-cpu-glitch-r,
  .boss-cpu-glitch-b {
    animation: none !important;
  }
}
`;
