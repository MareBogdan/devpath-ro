"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Skull,
  Trophy,
  Zap,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { CircuitBoard } from "./CircuitBoard";
import {
  CIRCUIT_WAVE_1,
  CIRCUIT_WAVE_2,
  CIRCUIT_WAVE_3,
  evaluateCircuit,
  type BitValue,
  type CircuitDefinition,
} from "./logic-engine";

// ─── Constants ────────────────────────────────────────────────────────────

const WAVE_CIRCUITS: readonly CircuitDefinition[] = [
  CIRCUIT_WAVE_1,
  CIRCUIT_WAVE_2,
  CIRCUIT_WAVE_3,
];
const WAVE_DAMAGE: readonly number[] = [34, 33, 33];
const TOTAL_HP = 100;
const TOTAL_TIME_S = 180;
const WAVE_OVERLAY_MS = 2200;
const DAMAGE_FLOAT_MS = 1500;
const FIRST_SOLVE_BONUS = 50;
const FINAL_BONUS_THRESHOLD = 10;
const FINAL_BONUS = 100;
const ROW_DISCOVERY_POINTS = 5;
const VAULT_OPEN_MS = 1800;
const VAULT_OPEN_MS_REDUCED = 220;

const WAVE_FLAVOR: readonly string[] = [
  "NIVEL 1 // AND + OR — Combinația de bază. Găsește calea.",
  "NIVEL 2 // NOT + OR — Inversorul schimbă tot. Gândește invers.",
  "NIVEL 3 // NAND UNIVERSAL — Orice poartă poate fi construită din NAND. Acesta e nucleul.",
];

const WAVE_SOLVE_TEXT: readonly { text: string; color: string }[] = [
  { text: "Stratul 1 spart!", color: "#00FF94" },
  { text: "Stratul 2 penetrat!", color: "#00CEC9" },
  { text: "Strat final eliminat!", color: "#FDCB6E" },
];

// ─── Types ────────────────────────────────────────────────────────────────

type GamePhase =
  | "intro"
  | "wave-active"
  | "wave-solved"
  | "all-waves-solved"
  | "alarm-triggered";

type TruthTableRow = {
  inputs: Record<string, BitValue>;
  output: BitValue;
  discovered: boolean;
};

type GameState = {
  phase: GamePhase;
  currentWave: 1 | 2 | 3;
  hp: number;
  inputValues: Record<string, BitValue>;
  truthTable: TruthTableRow[][];
  waveSolvedFlags: boolean[];
  attemptCount: number;
  score: number;
  lastDamage: { amount: number; key: number } | null;
  wrongAttemptsThisWave: number;
  finalBonusAwarded: boolean;
  timeRemaining: number;
};

type Action =
  | { type: "START_GAME" }
  | { type: "TOGGLE_INPUT"; inputId: string }
  | { type: "NEXT_WAVE" }
  | { type: "RETRY_WAVE" }
  | { type: "RESET" }
  | { type: "CLEAR_DAMAGE_FLOAT" }
  | { type: "TICK_TIMER" };

// ─── Helpers ──────────────────────────────────────────────────────────────

function generateTruthTable(circuit: CircuitDefinition): TruthTableRow[] {
  const rows: TruthTableRow[] = [];
  const inputIds = circuit.inputs.map((i) => i.id);
  const n = inputIds.length;
  for (let i = 0; i < 1 << n; i++) {
    const inputs: Record<string, BitValue> = {};
    for (let j = 0; j < n; j++) {
      const bit = ((i >> (n - 1 - j)) & 1) as BitValue;
      inputs[inputIds[j]] = bit;
    }
    const values = evaluateCircuit(circuit, inputs);
    const output = (values.get(circuit.outputGateId) ?? 0) as BitValue;
    rows.push({ inputs, output, discovered: false });
  }
  return rows;
}

function computeRowIdx(
  inputs: Record<string, BitValue>,
  inputIds: string[]
): number {
  let idx = 0;
  for (let j = 0; j < inputIds.length; j++) {
    if (inputs[inputIds[j]] === 1) {
      idx |= 1 << (inputIds.length - 1 - j);
    }
  }
  return idx;
}

function totalDiscovered(table: TruthTableRow[][]): number {
  return table.reduce(
    (sum, wave) => sum + wave.filter((r) => r.discovered).length,
    0
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function initialState(): GameState {
  return {
    phase: "intro",
    currentWave: 1,
    hp: TOTAL_HP,
    inputValues: { A: 0, B: 0, C: 0 },
    truthTable: WAVE_CIRCUITS.map(generateTruthTable),
    waveSolvedFlags: [false, false, false],
    attemptCount: 0,
    score: 0,
    lastDamage: null,
    wrongAttemptsThisWave: 0,
    finalBonusAwarded: false,
    timeRemaining: TOTAL_TIME_S,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "START_GAME":
      return { ...initialState(), phase: "wave-active" };

    case "TOGGLE_INPUT": {
      if (state.phase !== "wave-active") return state;

      const currentValue = state.inputValues[action.inputId] ?? 0;
      const newValue: BitValue = currentValue === 1 ? 0 : 1;
      const newInputs: Record<string, BitValue> = {
        ...state.inputValues,
        [action.inputId]: newValue,
      };

      const waveIdx = state.currentWave - 1;
      const circuit = WAVE_CIRCUITS[waveIdx];
      const rows = state.truthTable[waveIdx];
      const inputIds = circuit.inputs.map((i) => i.id);
      const rowIdx = computeRowIdx(newInputs, inputIds);
      const row = rows[rowIdx];
      if (!row) return { ...state, inputValues: newInputs };

      if (row.discovered) {
        return { ...state, inputValues: newInputs };
      }

      const newRows = rows.map((r, i) =>
        i === rowIdx ? { ...r, discovered: true } : r
      );
      const newTruthTable = state.truthTable.map((wt, i) =>
        i === waveIdx ? newRows : wt
      );

      let newScore = state.score + ROW_DISCOVERY_POINTS;
      let newPhase: GamePhase = state.phase;
      let newHp = state.hp;
      let lastDamage = state.lastDamage;
      let newWrongAttempts = state.wrongAttemptsThisWave;
      let newWaveSolvedFlags = state.waveSolvedFlags;

      if (row.output === 1) {
        const isFirstAttempt = state.wrongAttemptsThisWave === 0;
        if (isFirstAttempt) newScore += FIRST_SOLVE_BONUS;

        const damage = WAVE_DAMAGE[waveIdx];
        newHp = Math.max(0, state.hp - damage);
        lastDamage = { amount: damage, key: performance.now() };
        newPhase = "wave-solved";
        newWaveSolvedFlags = state.waveSolvedFlags.map((f, i) =>
          i === waveIdx ? true : f
        );
      } else {
        newWrongAttempts = state.wrongAttemptsThisWave + 1;
      }

      return {
        ...state,
        inputValues: newInputs,
        truthTable: newTruthTable,
        score: newScore,
        phase: newPhase,
        hp: newHp,
        lastDamage,
        wrongAttemptsThisWave: newWrongAttempts,
        waveSolvedFlags: newWaveSolvedFlags,
        attemptCount: state.attemptCount + 1,
      };
    }

    case "NEXT_WAVE": {
      if (state.phase !== "wave-solved") return state;
      const next = state.currentWave + 1;
      if (next > 3) {
        const discovered = totalDiscovered(state.truthTable);
        const bonus = discovered < FINAL_BONUS_THRESHOLD ? FINAL_BONUS : 0;
        return {
          ...state,
          phase: "all-waves-solved",
          score: state.score + bonus,
          finalBonusAwarded: bonus > 0,
        };
      }
      return {
        ...state,
        phase: "wave-active",
        currentWave: next as 1 | 2 | 3,
        inputValues: { A: 0, B: 0, C: 0 },
        wrongAttemptsThisWave: 0,
        lastDamage: null,
      };
    }

    case "RETRY_WAVE": {
      const waveIdx = state.currentWave - 1;
      const newRows = state.truthTable[waveIdx].map((r) => ({
        ...r,
        discovered: false,
      }));
      return {
        ...state,
        truthTable: state.truthTable.map((wt, i) =>
          i === waveIdx ? newRows : wt
        ),
        inputValues: { A: 0, B: 0, C: 0 },
        wrongAttemptsThisWave: 0,
        phase: "wave-active",
      };
    }

    case "CLEAR_DAMAGE_FLOAT":
      return state.lastDamage === null
        ? state
        : { ...state, lastDamage: null };

    case "TICK_TIMER": {
      if (state.phase !== "wave-active") return state;
      const next = state.timeRemaining - 1;
      if (next <= 0) {
        return { ...state, timeRemaining: 0, phase: "alarm-triggered" };
      }
      return { ...state, timeRemaining: next };
    }

    case "RESET":
      return initialState();

    default:
      return state;
  }
}

// ─── Sub-components: HUD bits ────────────────────────────────────────────

function CornerBrackets() {
  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute left-2 top-2 z-20 h-3 w-3 border-l border-t border-[#00CEC9]/40"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute right-2 top-2 z-20 h-3 w-3 border-r border-t border-[#00CEC9]/40"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-2 left-2 z-20 h-3 w-3 border-b border-l border-[#00CEC9]/40"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-2 right-2 z-20 h-3 w-3 border-b border-r border-[#00CEC9]/40"
      />
    </>
  );
}

function StatusIndicator({
  phase,
  reduced,
}: {
  phase: GamePhase;
  reduced: boolean;
}) {
  const map: Record<
    GamePhase,
    { label: string; color: string; blink: boolean }
  > = {
    intro: { label: "STANDBY", color: "#6C5CE7", blink: false },
    "wave-active": {
      label: "BREACH ATTEMPT ACTIVE",
      color: "#FF6B6B",
      blink: true,
    },
    "wave-solved": {
      label: "LAYER BREACHED",
      color: "#00FF94",
      blink: false,
    },
    "all-waves-solved": {
      label: "ACCESS GRANTED",
      color: "#00FF94",
      blink: false,
    },
    "alarm-triggered": {
      label: "ALARM TRIGGERED",
      color: "#FF6B6B",
      blink: true,
    },
  };
  const cfg = map[phase];
  return (
    <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em]">
      <span
        className="relative inline-flex h-2 w-2 rounded-full"
        style={{ background: cfg.color }}
      >
        {cfg.blink && !reduced && (
          <span
            aria-hidden
            className="boss-blink absolute inset-0 rounded-full"
            style={{ background: cfg.color }}
          />
        )}
      </span>
      <span style={{ color: cfg.color }} className="uppercase">
        {cfg.label}
      </span>
    </div>
  );
}

// ─── Sub-components: VaultDoor ───────────────────────────────────────────

function VaultDoor({
  isOpen,
  isSpinning,
  size = 200,
  onOpenComplete,
  reduced,
}: {
  isOpen: boolean;
  isSpinning: boolean;
  size?: number;
  onOpenComplete?: () => void;
  reduced: boolean;
}) {
  useEffect(() => {
    if (!isOpen || !onOpenComplete) return;
    const delay = reduced ? VAULT_OPEN_MS_REDUCED : VAULT_OPEN_MS;
    const t = setTimeout(() => onOpenComplete(), delay);
    return () => clearTimeout(t);
  }, [isOpen, onOpenComplete, reduced]);

  type Bolt = {
    base: { x: number; y: number; w: number; h: number };
    /** retracted position (one of x/y changes) */
    retract: { axis: "x" | "y"; value: number };
  };

  const bolts: Bolt[] = [
    { base: { x: 92, y: 14, w: 16, h: 22 }, retract: { axis: "y", value: 76 } },
    { base: { x: 164, y: 92, w: 22, h: 16 }, retract: { axis: "x", value: 102 } },
    { base: { x: 92, y: 164, w: 16, h: 22 }, retract: { axis: "y", value: 102 } },
    { base: { x: 14, y: 92, w: 22, h: 16 }, retract: { axis: "x", value: 76 } },
  ];

  const wheelAnimate = reduced
    ? { rotate: isOpen ? 540 : 0 }
    : isOpen
    ? { rotate: 720 }
    : isSpinning
    ? { rotate: 360 }
    : { rotate: 0 };

  const wheelTransition = reduced
    ? { duration: 0 }
    : isOpen
    ? { duration: 0.5, ease: "easeOut" as const }
    : isSpinning
    ? { repeat: Infinity, duration: 3, ease: "linear" as const }
    : { duration: 0.4 };

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label={isOpen ? "Vault open" : "Vault sealed"}
      style={{ filter: isOpen ? "drop-shadow(0 0 24px rgba(253,203,110,0.4))" : undefined }}
    >
      <defs>
        <radialGradient id="vault-gold-flood">
          <stop offset="0%" stopColor="#fff7d6" stopOpacity="1" />
          <stop offset="40%" stopColor="#FDCB6E" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FDCB6E" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer ring */}
      <circle cx={100} cy={100} r={95} fill="#1a1a1a" stroke="#2a2a2a" strokeWidth={5} />
      <circle cx={100} cy={100} r={91} fill="none" stroke="#3a3a48" strokeWidth={1} opacity={0.5} />

      {/* 8 rivets on outer ring */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * 45 - 90) * (Math.PI / 180);
        const rx = 100 + Math.cos(a) * 88;
        const ry = 100 + Math.sin(a) * 88;
        return (
          <circle key={i} cx={rx} cy={ry} r={2} fill="#4a4a5e" />
        );
      })}

      {/* Inner door — scaleX shrinks on open */}
      <motion.g
        initial={false}
        animate={{ scaleX: isOpen ? 0.06 : 1 }}
        transition={
          reduced
            ? { duration: 0 }
            : { duration: 0.8, delay: 0.6, ease: "easeIn" }
        }
        style={{
          transformOrigin: "100px 100px",
          transformBox: "view-box",
        }}
      >
        <circle cx={100} cy={100} r={80} fill="#12121f" stroke="#2a2a3e" strokeWidth={2} />

        {/* Combination wheel — rotates */}
        <motion.g
          initial={false}
          animate={wheelAnimate}
          transition={wheelTransition}
          style={{
            transformOrigin: "100px 100px",
            transformBox: "view-box",
          }}
        >
          <circle cx={100} cy={100} r={32} fill="#1a1a26" stroke="#4a4a5e" strokeWidth={2} />
          <circle cx={100} cy={100} r={22} fill="none" stroke="#3a3a48" strokeWidth={1} />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = ((i * 30) - 90) * (Math.PI / 180);
            const x1 = 100 + Math.cos(a) * 26;
            const y1 = 100 + Math.sin(a) * 26;
            const x2 = 100 + Math.cos(a) * 32;
            const y2 = 100 + Math.sin(a) * 32;
            const isCardinal = i % 3 === 0;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isCardinal ? "#9aa0aa" : "#6a6a7e"}
                strokeWidth={isCardinal ? 1.8 : 1.2}
              />
            );
          })}
          {/* Pointer */}
          <line
            x1={100}
            y1={100}
            x2={100}
            y2={72}
            stroke="#FF6B6B"
            strokeWidth={2.4}
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 3px #FF6B6B)" }}
          />
          <circle cx={100} cy={100} r={3.5} fill="#FF6B6B" />
        </motion.g>
      </motion.g>

      {/* Bolts — retract on open */}
      {bolts.map((bolt, i) => {
        const targetX =
          bolt.retract.axis === "x"
            ? isOpen
              ? bolt.retract.value
              : bolt.base.x
            : bolt.base.x;
        const targetY =
          bolt.retract.axis === "y"
            ? isOpen
              ? bolt.retract.value
              : bolt.base.y
            : bolt.base.y;
        return (
          <motion.rect
            key={i}
            width={bolt.base.w}
            height={bolt.base.h}
            fill="#3a3a48"
            stroke="#5a5a6e"
            strokeWidth={1}
            rx={2}
            initial={false}
            animate={{ x: targetX, y: targetY }}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: 0.55, delay: 0.15 * i, ease: "easeIn" }
            }
          />
        );
      })}

      {/* Gold light flood */}
      <motion.circle
        cx={100}
        cy={100}
        fill="url(#vault-gold-flood)"
        initial={false}
        animate={{ r: isOpen ? 105 : 0, opacity: isOpen ? 1 : 0 }}
        transition={
          reduced
            ? { duration: 0 }
            : { duration: 0.7, delay: 1.0, ease: "easeOut" }
        }
      />
    </svg>
  );
}

// ─── Sub-components: GlitchText ──────────────────────────────────────────

function GlitchText({
  children,
  color,
  className,
  reduced,
}: {
  children: ReactNode;
  color: string;
  className?: string;
  reduced: boolean;
}) {
  if (reduced) {
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
        className="boss-glitch-r absolute inset-0"
        style={{ color: "#FF6B6B", mixBlendMode: "screen" }}
      >
        {children}
      </span>
      <span
        aria-hidden
        className="boss-glitch-b absolute inset-0"
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

// ─── Sub-components: BinaryConfetti ──────────────────────────────────────

// Deterministic seeded data — same render every time, no hydration mismatch.
const CONFETTI_DATA: ReadonlyArray<{
  char: "0" | "1";
  leftPct: number;
  duration: number;
  delay: number;
  size: number;
  color: string;
}> = Array.from({ length: 20 }, (_, i) => {
  const seed = (i * 9301 + 49297) & 0xffff;
  const r1 = (seed * 31 + 17) & 0xffff;
  const r2 = (seed * 53 + 89) & 0xffff;
  const r3 = (seed * 71 + 113) & 0xffff;
  const colors = ["#00CEC9", "#6C5CE7", "#FDCB6E"];
  return {
    char: i % 2 === 0 ? "0" : "1",
    leftPct: (r1 % 100),
    duration: 2 + (r2 % 200) / 100,
    delay: (r3 % 250) / 100,
    size: 12 + (r1 % 16),
    color: colors[i % 3],
  };
});

function BinaryConfetti({ reduced }: { reduced: boolean }) {
  if (reduced) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {CONFETTI_DATA.map((el, i) => (
        <span
          key={i}
          className="absolute -top-4 font-mono font-bold"
          style={{
            left: `${el.leftPct}%`,
            color: el.color,
            fontSize: `${el.size}px`,
            animation: `boss-binary-fall ${el.duration}s linear ${el.delay}s infinite`,
            textShadow: `0 0 6px ${el.color}`,
          }}
        >
          {el.char}
        </span>
      ))}
    </div>
  );
}

// ─── Sub-components: TruthRow ────────────────────────────────────────────

function TruthRow({
  row,
  isCurrent,
  reduced,
}: {
  row: TruthTableRow;
  isCurrent: boolean;
  reduced: boolean;
}) {
  const inputCells: BitValue[] = ["A", "B", "C"].map(
    (k) => row.inputs[k] ?? 0
  );
  const isWinning = row.discovered && row.output === 1;

  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_1fr_1fr_1.3fr] items-center gap-1 rounded px-2 py-1.5 font-mono text-xs transition-all duration-300",
        row.discovered ? "opacity-100" : "opacity-45",
        isCurrent && "ring-1 ring-[#00CEC9]/45 bg-[#00CEC9]/[0.05]",
        isWinning &&
          "border border-[#FDCB6E]/55 bg-[#FDCB6E]/[0.08] boss-winning-pulse"
      )}
    >
      {row.discovered ? (
        <>
          {inputCells.map((v, i) => (
            <span
              key={i}
              className={cn(
                "text-center font-bold tabular-nums",
                v === 1 ? "text-[#00FF94]" : "text-[#FF6B6B]/70"
              )}
            >
              {v}
            </span>
          ))}
          <motion.span
            initial={reduced ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "text-center font-bold tabular-nums",
              row.output === 1 ? "text-[#FDCB6E]" : "text-white/35"
            )}
          >
            {row.output}
          </motion.span>
        </>
      ) : (
        <>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="text-center text-white/25">
              ?
            </span>
          ))}
        </>
      )}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────

export function BossFightAlarmaSef() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const reduced = useReducedMotion() ?? false;
  const [vaultOpened, setVaultOpened] = useState(false);

  // Auto-advance after wave-solved.
  useEffect(() => {
    if (state.phase !== "wave-solved") return;
    const t = setTimeout(
      () => dispatch({ type: "NEXT_WAVE" }),
      reduced ? 900 : WAVE_OVERLAY_MS
    );
    return () => clearTimeout(t);
  }, [state.phase, state.currentWave, reduced]);

  // Damage float self-clear so the next event mounts fresh via key.
  useEffect(() => {
    if (state.lastDamage === null) return;
    const t = setTimeout(
      () => dispatch({ type: "CLEAR_DAMAGE_FLOAT" }),
      DAMAGE_FLOAT_MS
    );
    return () => clearTimeout(t);
  }, [state.lastDamage]);

  // Countdown timer — runs only during wave-active.
  useEffect(() => {
    if (state.phase !== "wave-active") return;
    const id = setInterval(() => dispatch({ type: "TICK_TIMER" }), 1000);
    return () => clearInterval(id);
  }, [state.phase]);

  // Reset vaultOpened whenever we leave the victory screen.
  useEffect(() => {
    if (state.phase !== "all-waves-solved") setVaultOpened(false);
  }, [state.phase]);

  const currentCircuit = useMemo(
    () => WAVE_CIRCUITS[state.currentWave - 1],
    [state.currentWave]
  );
  const currentRows = state.truthTable[state.currentWave - 1];
  const discoveredCount = currentRows.filter((r) => r.discovered).length;
  const currentRowIdx = computeRowIdx(
    state.inputValues,
    currentCircuit.inputs.map((i) => i.id)
  );

  const handleInputToggle = useCallback((inputId: string) => {
    dispatch({ type: "TOGGLE_INPUT", inputId });
  }, []);

  // Derived for the various screens.
  const waveIdx = state.currentWave - 1;
  const hpPct = (state.hp / TOTAL_HP) * 100;
  const hpColor =
    state.hp > 60 ? "#00FF94" : state.hp > 30 ? "#FDCB6E" : "#FF6B6B";
  const lowHp = state.hp > 0 && state.hp < 30;
  const finalHpFlash = state.hp === 0 && state.phase === "wave-solved";
  const timerCritical = state.timeRemaining < 30;
  const timerCriticalRapid = state.timeRemaining < 10;
  const solveText = WAVE_SOLVE_TEXT[waveIdx];
  const winningRow = currentRows.find(
    (r) => r.discovered && r.output === 1
  );
  const showWaveCounter =
    state.phase !== "intro" && state.phase !== "alarm-triggered";

  // Score pill breakdown for victory.
  const discoveryScore = totalDiscovered(state.truthTable) * ROW_DISCOVERY_POINTS;
  const finalScore = state.finalBonusAwarded ? FINAL_BONUS : 0;
  const firstSolveBonusScore = Math.max(
    0,
    state.score - discoveryScore - finalScore
  );

  return (
    <div className="my-10">
      <style>{CSS_STYLES}</style>

      <div
        className={cn(
          "relative border-y bg-[#080810] text-foreground transition-colors duration-500",
          finalHpFlash
            ? "border-[#FDCB6E]/70"
            : lowHp
            ? "boss-low-hp-pulse border-[#FF6B6B]/55"
            : "border-[#FF6B6B]/50"
        )}
        style={{
          boxShadow: finalHpFlash
            ? "0 0 80px rgba(253,203,110,0.3)"
            : "0 0 60px rgba(255,107,107,0.12)",
        }}
      >
        {/* Scrolling scanlines */}
        {!reduced && (
          <div
            aria-hidden
            className="boss-scanlines pointer-events-none absolute inset-0 z-0"
          />
        )}

        {/* Slow radial pulse */}
        {!reduced && (
          <div
            aria-hidden
            className="boss-radial-pulse pointer-events-none absolute inset-0 z-0"
            style={{
              background:
                "radial-gradient(circle at center, rgba(255,107,107,0.06), transparent 60%)",
            }}
          />
        )}

        <CornerBrackets />

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between gap-4 border-b border-[#FF6B6B]/15 bg-gradient-to-r from-[#FF6B6B]/[0.05] via-transparent to-[#6C5CE7]/[0.05] px-5 py-2.5">
          <span className="font-mono text-[10px] tracking-[0.18em] text-[#6C5CE7]/75">
            VAULT_SEC_SYS // LEVEL_3_CLEARANCE
          </span>
          {showWaveCounter && (
            <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-white/85">
              WAVE{" "}
              <span className="text-white">{state.currentWave}</span>
              <span className="text-white/40">/3</span>
            </span>
          )}
          <StatusIndicator phase={state.phase} reduced={reduced} />
        </div>

        {/* Inner phase content */}
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {/* ─── INTRO ─────────────────────────────────────────────── */}
            {state.phase === "intro" && (
              <motion.div
                key="intro"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={
                  reduced ? undefined : { opacity: 0, y: -28 }
                }
                transition={{ duration: 0.45 }}
                className="mx-auto flex max-w-2xl flex-col items-center px-6 py-12 text-center"
              >
                <VaultDoor
                  isOpen={false}
                  isSpinning={true}
                  size={180}
                  reduced={reduced}
                />

                <motion.p
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="mt-6 font-mono text-[11px] uppercase tracking-[0.32em] text-[#FF6B6B]"
                >
                  BOSS FIGHT
                </motion.p>

                <h2 className="mt-2 text-5xl font-extrabold tracking-tight text-white">
                  {Array.from("ALARMA DE SEIF").map((char, i) => (
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
                      {char === " " ? " " : char}
                    </motion.span>
                  ))}
                </h2>

                <motion.div
                  initial={reduced ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5, duration: 0.45 }}
                  className="mt-5 flex flex-wrap items-center justify-center gap-2"
                >
                  <span className="border border-[#FF6B6B]/40 bg-[#FF6B6B]/[0.08] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#FF6B6B]">
                    3 straturi de securitate
                  </span>
                  <span className="border border-[#6C5CE7]/40 bg-[#6C5CE7]/[0.08] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#a89bf5]">
                    Logică booleană
                  </span>
                  <span className="border border-[#00CEC9]/40 bg-[#00CEC9]/[0.08] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#00CEC9]">
                    NAND universal
                  </span>
                </motion.div>

                <motion.p
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.85, duration: 0.45 }}
                  className="mt-5 max-w-md text-sm text-white/65"
                >
                  Sistemul de securitate folosește 3 straturi de porți logice.
                  Fiecare strat e mai complex decât precedentul. Găsește
                  combinația care deschide seiful.{" "}
                  <span className="text-[#FF6B6B]/85">3 minute pe ceas.</span>
                </motion.p>

                <motion.button
                  type="button"
                  initial={reduced ? false : { opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2.25, duration: 0.4 }}
                  whileHover={reduced ? undefined : { scale: 1.05 }}
                  whileTap={reduced ? undefined : { scale: 0.97 }}
                  onClick={() => dispatch({ type: "START_GAME" })}
                  className="boss-button-pulse mt-7 inline-flex items-center gap-2 border-2 border-[#FF6B6B] bg-[#FF6B6B]/[0.08] px-7 py-3 font-mono text-sm font-bold uppercase tracking-[0.18em] text-[#FF6B6B]"
                >
                  <Zap className="h-4 w-4" aria-hidden />
                  Începe Infiltrarea
                </motion.button>
              </motion.div>
            )}

            {/* ─── GAME (wave-active or wave-solved) ────────────────── */}
            {(state.phase === "wave-active" ||
              state.phase === "wave-solved") && (
              <motion.div
                key="game"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduced ? undefined : { opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="relative px-5 pb-6 pt-5"
              >
                {/* Status row + HP */}
                <div className="mb-5">
                  <div className="mb-2 flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.18em]">
                    <span className="text-[#00CEC9]/75">
                      SECURITATE:{" "}
                      <span className="font-bold tabular-nums text-[#00CEC9]">
                        {state.hp}
                      </span>
                      /{TOTAL_HP}
                    </span>
                    <span
                      className={cn(
                        "font-mono tabular-nums",
                        timerCriticalRapid && !reduced && "boss-blink"
                      )}
                      style={{
                        color: timerCritical ? "#FF6B6B" : "#00CEC9",
                      }}
                    >
                      ⏱ {formatTime(state.timeRemaining)}
                    </span>
                    <span className="text-[#FDCB6E]/85">
                      SCOR:{" "}
                      <motion.span
                        key={state.score}
                        initial={
                          reduced
                            ? false
                            : { scale: 1.4, color: "#00FF94" }
                        }
                        animate={{ scale: 1, color: "#FDCB6E" }}
                        transition={{ duration: 0.45 }}
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
                        transition={{
                          duration: 0.65,
                          ease: "easeOut",
                        }}
                        style={{
                          backgroundColor: hpColor,
                          boxShadow: `0 0 8px ${hpColor}`,
                          transition:
                            "background-color 600ms ease, box-shadow 600ms ease",
                        }}
                      />
                      {/* Threshold markers @ 33 / 66 */}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute top-0 bottom-0 w-px bg-white/30"
                        style={{ left: "33%" }}
                      />
                      <span
                        aria-hidden
                        className="pointer-events-none absolute top-0 bottom-0 w-px bg-white/30"
                        style={{ left: "66%" }}
                      />

                      <AnimatePresence>
                        {state.lastDamage && !reduced && (
                          <motion.div
                            key={`flash-${state.lastDamage.key}`}
                            aria-hidden
                            className="pointer-events-none absolute inset-0 bg-[#FF6B6B]"
                            initial={{ opacity: 0.7 }}
                            animate={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
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
                            textShadow:
                              "0 0 8px rgba(255,107,107,0.6)",
                          }}
                        >
                          -{state.lastDamage.amount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Main grid */}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.5fr_1fr]">
                  <div className="overflow-hidden rounded border border-[#6C5CE7]/20 bg-[#06060c]">
                    <CircuitBoard
                      circuit={currentCircuit}
                      inputValues={state.inputValues}
                      onInputToggle={handleInputToggle}
                      highlightOutput={state.phase === "wave-solved"}
                    />
                  </div>

                  <div className="rounded border border-[#6C5CE7]/20 bg-[#0a0a14] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#6C5CE7]/75">
                        TABEL DE ADEVĂR
                      </h3>
                      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/45">
                        {currentCircuit.id}
                      </span>
                    </div>

                    <div className="mb-2 grid grid-cols-[1fr_1fr_1fr_1.3fr] gap-1 border-b border-white/10 pb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-white/55">
                      <span className="text-center">A</span>
                      <span className="text-center">B</span>
                      <span className="text-center">C</span>
                      <span className="text-center">OUT</span>
                    </div>

                    <div className="space-y-1">
                      {currentRows.map((row, idx) => (
                        <TruthRow
                          key={idx}
                          row={row}
                          isCurrent={idx === currentRowIdx}
                          reduced={reduced}
                        />
                      ))}
                    </div>

                    <div className="mt-3 border-t border-white/10 pt-2 font-mono text-[10px] text-white/55">
                      <span className="font-bold text-[#00CEC9]">
                        {discoveredCount}
                      </span>
                      <span>/8 combinații descoperite</span>
                      {state.wrongAttemptsThisWave > 0 && (
                        <span className="ml-3 text-[#FF6B6B]/70">
                          · {state.wrongAttemptsThisWave} ratate
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom row */}
                <div className="mt-5 flex items-center justify-between gap-3 font-mono text-[10px]">
                  <span className="italic text-white/55">
                    {WAVE_FLAVOR[waveIdx]}
                  </span>
                  <span className="shrink-0 uppercase tracking-[0.18em] text-white/40">
                    ATTEMPTS:{" "}
                    <span className="text-white tabular-nums">
                      {state.attemptCount}
                    </span>
                  </span>
                </div>

                {/* Wave-solved overlay */}
                <AnimatePresence>
                  {state.phase === "wave-solved" && (
                    <motion.div
                      key={`solved-${state.currentWave}`}
                      className="absolute inset-0 z-30 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.28 }}
                    >
                      <div
                        aria-hidden
                        className="absolute inset-0 bg-[#080810]/72 backdrop-blur-[3px]"
                      />

                      {/* Circuit traces racing across */}
                      {!reduced && (
                        <div className="absolute inset-0 overflow-hidden">
                          {[0.22, 0.42, 0.62, 0.82].map((y, i) => (
                            <motion.div
                              key={`trace-${state.currentWave}-${i}`}
                              className="absolute h-px"
                              style={{
                                top: `${y * 100}%`,
                                width: "35%",
                                background:
                                  "linear-gradient(to right, transparent, #00CEC9 50%, transparent)",
                                boxShadow: "0 0 5px #00CEC9",
                              }}
                              initial={{ x: "-40%" }}
                              animate={{ x: "300%" }}
                              transition={{
                                duration: 1.4,
                                delay: i * 0.18,
                                ease: "easeOut",
                              }}
                            />
                          ))}
                        </div>
                      )}

                      <motion.div
                        initial={
                          reduced ? false : { scale: 0.72, opacity: 0 }
                        }
                        animate={{ scale: 1, opacity: 1 }}
                        exit={
                          reduced
                            ? undefined
                            : { scale: 0.94, opacity: 0 }
                        }
                        transition={{
                          type: "spring",
                          stiffness: 220,
                          damping: 18,
                        }}
                        className="relative z-10 border-2 bg-[#080810] px-8 py-6 text-center"
                        style={{
                          borderColor: solveText.color,
                          boxShadow: `0 0 40px ${solveText.color}40`,
                        }}
                      >
                        <motion.div
                          initial={
                            reduced
                              ? false
                              : { scale: 0.4, rotate: -10 }
                          }
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 220,
                            damping: 14,
                            delay: 0.1,
                          }}
                          className="mb-3 flex justify-center"
                        >
                          {waveIdx === 0 ? (
                            <ShieldCheck
                              className="h-10 w-10"
                              style={{
                                color: solveText.color,
                                filter: `drop-shadow(0 0 8px ${solveText.color})`,
                              }}
                              aria-hidden
                            />
                          ) : waveIdx === 1 ? (
                            <Zap
                              className="h-10 w-10"
                              style={{
                                color: solveText.color,
                                filter: `drop-shadow(0 0 8px ${solveText.color})`,
                              }}
                              aria-hidden
                            />
                          ) : (
                            <Skull
                              className="h-10 w-10"
                              style={{
                                color: solveText.color,
                                filter: `drop-shadow(0 0 8px ${solveText.color})`,
                              }}
                              aria-hidden
                            />
                          )}
                        </motion.div>

                        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">
                          LAYER {state.currentWave} BREACHED
                        </p>

                        <GlitchText
                          color={solveText.color}
                          reduced={reduced}
                          className="font-mono text-2xl font-bold"
                        >
                          {solveText.text}
                        </GlitchText>

                        <p className="mt-2 font-mono text-sm text-white/70">
                          Sistem:{" "}
                          <span className="font-bold text-[#FF6B6B]">
                            -{WAVE_DAMAGE[waveIdx]} HP
                          </span>
                        </p>

                        {winningRow && (
                          <motion.div
                            initial={
                              reduced
                                ? false
                                : { opacity: 0, y: 6 }
                            }
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mt-3 font-mono text-xs text-white/55"
                          >
                            Combinația câștigătoare:{" "}
                            <span className="ml-1 text-[#00FF94]">
                              A={winningRow.inputs.A}
                            </span>{" "}
                            <span className="text-[#00FF94]">
                              B={winningRow.inputs.B}
                            </span>{" "}
                            <span className="text-[#00FF94]">
                              C={winningRow.inputs.C}
                            </span>
                          </motion.div>
                        )}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ─── ALARM TRIGGERED ──────────────────────────────────── */}
            {state.phase === "alarm-triggered" && (
              <motion.div
                key="alarm"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduced ? undefined : { opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="relative mx-auto flex max-w-2xl flex-col items-center px-6 py-14 text-center"
              >
                <div
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute inset-0",
                    !reduced && "boss-alarm-bg"
                  )}
                />

                <motion.div
                  initial={reduced ? false : { scale: 0.4, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 12,
                  }}
                  className="relative"
                >
                  <AlertTriangle
                    className="h-16 w-16 text-[#FF6B6B]"
                    style={{
                      filter:
                        "drop-shadow(0 0 14px rgba(255,107,107,0.7))",
                    }}
                    aria-hidden
                  />
                </motion.div>

                <p className="relative mt-5 font-mono text-[11px] uppercase tracking-[0.3em] text-[#FF6B6B]">
                  Intrusion detected
                </p>

                <div className="relative mt-2">
                  <GlitchText
                    color="#FF6B6B"
                    reduced={reduced}
                    className="font-mono text-4xl font-extrabold tracking-wider sm:text-5xl"
                  >
                    ALARMĂ ACTIVATĂ
                  </GlitchText>
                </div>

                <p className="relative mt-3 max-w-md text-sm text-white/65">
                  Timpul a expirat. Sistemul de securitate a detectat
                  intruziunea. Toate straturile rămase au fost sigilate.
                </p>

                {/* Sine wave wail */}
                <svg
                  viewBox="0 0 200 60"
                  className="relative mt-6 h-12 w-56"
                  aria-hidden
                >
                  <motion.path
                    fill="none"
                    stroke="#FF6B6B"
                    strokeWidth={2}
                    strokeLinecap="round"
                    style={{
                      filter:
                        "drop-shadow(0 0 5px rgba(255,107,107,0.7))",
                    }}
                    animate={
                      reduced
                        ? {
                            d: "M 0 30 Q 25 30 50 30 T 100 30 T 150 30 T 200 30",
                          }
                        : {
                            d: [
                              "M 0 30 Q 25 5 50 30 T 100 30 T 150 30 T 200 30",
                              "M 0 30 Q 25 55 50 30 T 100 30 T 150 30 T 200 30",
                            ],
                          }
                    }
                    transition={
                      reduced
                        ? { duration: 0 }
                        : {
                            duration: 0.5,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut",
                          }
                    }
                  />
                </svg>

                <p className="relative mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
                  Straturi sparte:{" "}
                  <span className="text-white">
                    {state.waveSolvedFlags.filter(Boolean).length}
                  </span>
                  /3 · Scor:{" "}
                  <span className="text-[#FDCB6E]">{state.score}</span>
                </p>

                <button
                  type="button"
                  onClick={() => dispatch({ type: "RESET" })}
                  className="relative mt-6 inline-flex items-center gap-2 border-2 border-[#FF6B6B] bg-[#FF6B6B]/[0.1] px-6 py-3 font-mono text-sm font-bold uppercase tracking-[0.18em] text-[#FF6B6B] transition-transform hover:scale-105 active:scale-95"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden />
                  Resetează
                </button>
              </motion.div>
            )}

            {/* ─── VICTORY ──────────────────────────────────────────── */}
            {state.phase === "all-waves-solved" && (
              <motion.div
                key="victory"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35 }}
                className="relative px-6 py-12"
              >
                <BinaryConfetti reduced={reduced} />

                <div className="relative mx-auto flex max-w-2xl flex-col items-center text-center">
                  <VaultDoor
                    isOpen={true}
                    isSpinning={false}
                    size={240}
                    onOpenComplete={() => setVaultOpened(true)}
                    reduced={reduced}
                  />

                  <AnimatePresence>
                    {vaultOpened && (
                      <motion.div
                        key="victory-body"
                        initial={
                          reduced
                            ? false
                            : { opacity: 0, y: 24 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="mt-6 flex flex-col items-center"
                      >
                        <GlitchText
                          color="#00FF94"
                          reduced={reduced}
                          className="font-mono text-3xl font-extrabold tracking-[0.18em] sm:text-4xl"
                        >
                          ACCESS GRANTED
                        </GlitchText>
                        <h2 className="mt-2 text-2xl font-bold text-white">
                          VAULT BREACHED
                        </h2>

                        <motion.div
                          initial={
                            reduced
                              ? false
                              : { scale: 0.4, rotate: -25 }
                          }
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{
                            delay: 0.3,
                            type: "spring",
                            stiffness: 220,
                            damping: 14,
                          }}
                          className="mt-4"
                        >
                          <Trophy
                            className="h-14 w-14 text-[#FDCB6E]"
                            style={{
                              filter:
                                "drop-shadow(0 0 16px rgba(253,203,110,0.55))",
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
                          transition={{ delay: 0.45 }}
                          className="mt-3 font-mono text-6xl font-bold tabular-nums text-[#FDCB6E]"
                          style={{
                            textShadow:
                              "0 0 24px rgba(253,203,110,0.5)",
                          }}
                        >
                          {state.score}
                        </motion.p>

                        {/* Score pills */}
                        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                          {[
                            {
                              label: `+${discoveryScore} DISCOVERIES`,
                              color: "#00CEC9",
                              show: discoveryScore > 0,
                            },
                            {
                              label: `+${firstSolveBonusScore} FIRST-SOLVE`,
                              color: "#6C5CE7",
                              show: firstSolveBonusScore > 0,
                            },
                            {
                              label: `+${FINAL_BONUS} PERFECT SPRINT`,
                              color: "#FDCB6E",
                              show: state.finalBonusAwarded,
                            },
                          ]
                            .filter((p) => p.show)
                            .map((p, i) => (
                              <motion.span
                                key={p.label}
                                initial={
                                  reduced
                                    ? false
                                    : { opacity: 0, x: -12 }
                                }
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  delay: 0.6 + i * 0.12,
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

                        {/* Badge */}
                        <motion.div
                          initial={
                            reduced
                              ? false
                              : { opacity: 0, y: 12 }
                          }
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.0 }}
                          className="mt-5 inline-flex items-center gap-2 border border-[#FDCB6E]/40 bg-[#FDCB6E]/[0.08] px-4 py-1.5"
                        >
                          <span aria-hidden className="text-base">
                            🔐
                          </span>
                          <span
                            className={cn(
                              "font-mono text-xs font-bold uppercase tracking-[0.18em]",
                              !reduced && "boss-shimmer-text"
                            )}
                            style={
                              reduced ? { color: "#FDCB6E" } : undefined
                            }
                          >
                            Logic Master
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
                          transition={{ delay: 1.2 }}
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
@keyframes boss-scanlines-scroll {
  from { background-position: 0 0; }
  to { background-position: 0 80px; }
}
.boss-scanlines {
  background-image: repeating-linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.03) 0,
    rgba(255, 255, 255, 0.03) 1px,
    transparent 1px,
    transparent 4px
  );
  animation: boss-scanlines-scroll 6s linear infinite;
  opacity: 0.85;
}

@keyframes boss-radial-pulse-kf {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 1; }
}
.boss-radial-pulse { animation: boss-radial-pulse-kf 4s ease-in-out infinite; }

@keyframes boss-blink-kf {
  0%, 55%, 100% { opacity: 0; transform: scale(1.6); }
  10% { opacity: 0.7; transform: scale(1); }
}
.boss-blink {
  animation: boss-blink-kf 1.4s ease-out infinite;
  filter: blur(0.5px);
}

@keyframes boss-winning-pulse-kf {
  0%, 100% { box-shadow: 0 0 0px rgba(253, 203, 110, 0.2); }
  50% { box-shadow: 0 0 14px rgba(253, 203, 110, 0.65); }
}
.boss-winning-pulse { animation: boss-winning-pulse-kf 1.7s ease-in-out infinite; }

@keyframes boss-button-pulse-kf {
  0%, 100% { box-shadow: 0 0 12px rgba(255, 107, 107, 0.35); }
  50% { box-shadow: 0 0 28px rgba(255, 107, 107, 0.7); }
}
.boss-button-pulse { animation: boss-button-pulse-kf 1.5s ease-in-out infinite; }

@keyframes boss-low-hp-pulse-kf {
  0%, 100% {
    border-color: rgba(255, 107, 107, 0.5);
    box-shadow: 0 0 60px rgba(255, 107, 107, 0.12);
  }
  50% {
    border-color: rgba(255, 107, 107, 0.9);
    box-shadow: 0 0 90px rgba(255, 107, 107, 0.32);
  }
}
.boss-low-hp-pulse { animation: boss-low-hp-pulse-kf 1.6s ease-in-out infinite; }

@keyframes boss-glitch-r-kf {
  0%, 100% { transform: translate(0, 0); }
  20% { transform: translate(-2px, 1px); }
  40% { transform: translate(1px, -1px); }
  60% { transform: translate(-1px, 2px); }
  80% { transform: translate(2px, 0); }
}
@keyframes boss-glitch-b-kf {
  0%, 100% { transform: translate(0, 0); }
  20% { transform: translate(2px, -1px); }
  40% { transform: translate(-1px, 1px); }
  60% { transform: translate(1px, -2px); }
  80% { transform: translate(-2px, 0); }
}
.boss-glitch-r { animation: boss-glitch-r-kf 2.4s steps(1, end) infinite; }
.boss-glitch-b { animation: boss-glitch-b-kf 2.4s steps(1, end) infinite; }

@keyframes boss-binary-fall {
  from { transform: translateY(-20px); opacity: 1; }
  to { transform: translateY(100vh); opacity: 0; }
}

@keyframes boss-alarm-pulse-kf {
  0%, 100% { background: rgba(255, 107, 107, 0); }
  50% { background: rgba(255, 107, 107, 0.15); }
}
.boss-alarm-bg { animation: boss-alarm-pulse-kf 1s ease-in-out infinite; }

@keyframes boss-shimmer-kf {
  from { background-position: -200% center; }
  to { background-position: 200% center; }
}
.boss-shimmer-text {
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
  animation: boss-shimmer-kf 2.4s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .boss-scanlines, .boss-radial-pulse, .boss-blink, .boss-winning-pulse,
  .boss-button-pulse, .boss-low-hp-pulse, .boss-glitch-r, .boss-glitch-b,
  .boss-alarm-bg, .boss-shimmer-text {
    animation: none !important;
  }
}
`;
