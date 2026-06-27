"use client";

import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Award,
  Check,
  ChevronRight,
  Cpu,
  Layers,
  Play,
  RotateCcw,
  Skull,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────

const TOTAL_CELLS = 16;
const MAX_STRIKES = 3;
const TOTAL_ROUNDS = 3;
const LABEL_FADE_DELAY_MS = 3000;
const EFFECT_CLEAR_MS = 900;
const CELL_SIZE = 76;
const CELL_GAP = 10;
const GRID_SIZE = 4 * CELL_SIZE + 3 * CELL_GAP;

// ─── Types ────────────────────────────────────────────────────────────────

type Instruction =
  | { kind: "write"; address: number; value: number }
  | { kind: "read"; address: number };

type CellState = { value: number | null };

type Phase =
  | "intro"
  | "playing"
  | "round-complete"
  | "round-failed"
  | "victory";

type CellEffect = {
  address: number;
  kind: "write" | "read" | "wrong";
  key: number;
};

type RoundStats = {
  strikesUsed: number;
  writesCompleted: number;
  readsCorrect: number;
  readsTotal: number;
};

type State = {
  phase: Phase;
  roundIndex: number;
  cells: CellState[];
  visualOrder: number[];
  instructions: Instruction[];
  currentInstructionIdx: number;
  strikes: number;
  outputReg: { address: number; value: number; key: number } | null;
  cellEffect: CellEffect | null;
  addressLabelsVisible: boolean;
  totalScore: number;
  roundStats: RoundStats;
};

type Action =
  | { type: "START_ROUND"; round: number }
  | { type: "CLICK_CELL"; gridPos: number; now: number }
  | { type: "FADE_LABELS" }
  | { type: "CLEAR_EFFECT" }
  | { type: "NEXT_ROUND" }
  | { type: "RETRY_ROUND" }
  | { type: "RESET_FULL" };

// ─── Instructions (deterministic per round) ───────────────────────────────

const ROUND_INSTRUCTIONS: readonly Instruction[][] = [
  // Round 1 — 4 instructions, labels visible
  [
    { kind: "write", address: 0x03, value: 42 },
    { kind: "write", address: 0x0a, value: 187 },
    { kind: "read", address: 0x03 },
    { kind: "read", address: 0x0a },
  ],
  // Round 2 — 5 instructions, labels fade after 3s
  [
    { kind: "write", address: 0x05, value: 73 },
    { kind: "write", address: 0x0d, value: 200 },
    { kind: "read", address: 0x05 },
    { kind: "write", address: 0x02, value: 12 },
    { kind: "read", address: 0x0d },
  ],
  // Round 3 — 6 instructions, labels hidden + scramble
  [
    { kind: "write", address: 0x01, value: 99 },
    { kind: "write", address: 0x0f, value: 165 },
    { kind: "read", address: 0x01 },
    { kind: "write", address: 0x07, value: 33 },
    { kind: "read", address: 0x0f },
    { kind: "read", address: 0x07 },
  ],
];

const ROUND_NAMES = ["BOOT_SECTOR", "STREAM_DECODE", "GHOST_MEMORY"] as const;
const ROUND_FLAVOR = [
  "Etichetele de adrese sunt vizibile. Învață cum se face WRITE și READ.",
  "Etichetele dispar după 3 secunde. Reține-le din timp.",
  "Etichetele lipsesc. Celulele se rearanjează după fiecare instrucțiune.",
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────

function emptyCells(): CellState[] {
  return Array.from({ length: TOTAL_CELLS }, () => ({ value: null }));
}

function identityOrder(): number[] {
  return Array.from({ length: TOTAL_CELLS }, (_, i) => i);
}

function shuffleOrder(seed: number): number[] {
  const arr = identityOrder();
  let s = (seed | 0) >>> 0;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatHexAddr(addr: number): string {
  return "0x" + addr.toString(16).toUpperCase().padStart(2, "0");
}

function formatBinary(value: number): string {
  return value.toString(2).padStart(8, "0");
}

function formatHexValue(value: number): string {
  return "0x" + value.toString(16).toUpperCase().padStart(2, "0");
}

function computeStars(strikesUsed: number): number {
  if (strikesUsed <= 0) return 3;
  if (strikesUsed === 1) return 2;
  return 1;
}

function emptyStats(): RoundStats {
  return {
    strikesUsed: 0,
    writesCompleted: 0,
    readsCorrect: 0,
    readsTotal: 0,
  };
}

function startingState(): State {
  return {
    phase: "intro",
    roundIndex: 0,
    cells: emptyCells(),
    visualOrder: identityOrder(),
    instructions: ROUND_INSTRUCTIONS[0],
    currentInstructionIdx: 0,
    strikes: 0,
    outputReg: null,
    cellEffect: null,
    addressLabelsVisible: true,
    totalScore: 0,
    roundStats: emptyStats(),
  };
}

function roundInitialState(round: number, state: State): State {
  const instructions = ROUND_INSTRUCTIONS[round];
  return {
    ...state,
    phase: "playing",
    roundIndex: round,
    cells: emptyCells(),
    visualOrder: round === 2 ? shuffleOrder(round * 7919 + 31) : identityOrder(),
    instructions,
    currentInstructionIdx: 0,
    strikes: 0,
    outputReg: null,
    cellEffect: null,
    addressLabelsVisible: round < 2,
    roundStats: emptyStats(),
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "START_ROUND":
      return roundInitialState(action.round, state);

    case "FADE_LABELS":
      if (state.addressLabelsVisible === false) return state;
      return { ...state, addressLabelsVisible: false };

    case "CLICK_CELL": {
      if (state.phase !== "playing") return state;
      const gridPos = action.gridPos;
      const clickedAddress = state.visualOrder[gridPos];
      const instr = state.instructions[state.currentInstructionIdx];
      if (!instr) return state;

      // Wrong cell
      if (clickedAddress !== instr.address) {
        const newStrikes = state.strikes + 1;
        const newStats: RoundStats = {
          ...state.roundStats,
          strikesUsed: state.roundStats.strikesUsed + 1,
          readsTotal:
            instr.kind === "read"
              ? state.roundStats.readsTotal + 1
              : state.roundStats.readsTotal,
        };
        const effect: CellEffect = {
          address: clickedAddress,
          kind: "wrong",
          key: action.now,
        };
        if (newStrikes >= MAX_STRIKES) {
          return {
            ...state,
            strikes: newStrikes,
            phase: "round-failed",
            cellEffect: effect,
            roundStats: newStats,
          };
        }
        return {
          ...state,
          strikes: newStrikes,
          cellEffect: effect,
          roundStats: newStats,
        };
      }

      // Correct cell
      const nextIdx = state.currentInstructionIdx + 1;
      const isLast = nextIdx >= state.instructions.length;
      const nextVisualOrder =
        state.roundIndex === 2
          ? shuffleOrder(action.now ^ (nextIdx * 1009))
          : state.visualOrder;

      if (instr.kind === "write") {
        const newCells = state.cells.map((c, i) =>
          i === instr.address ? { value: instr.value } : c
        );
        const newStats: RoundStats = {
          ...state.roundStats,
          writesCompleted: state.roundStats.writesCompleted + 1,
        };
        const baseScore = state.totalScore + 10;
        const effect: CellEffect = {
          address: instr.address,
          kind: "write",
          key: action.now,
        };
        if (isLast) {
          return {
            ...state,
            cells: newCells,
            currentInstructionIdx: nextIdx,
            visualOrder: nextVisualOrder,
            cellEffect: effect,
            phase: "round-complete",
            totalScore: baseScore + 20,
            roundStats: newStats,
          };
        }
        return {
          ...state,
          cells: newCells,
          currentInstructionIdx: nextIdx,
          visualOrder: nextVisualOrder,
          cellEffect: effect,
          totalScore: baseScore,
          roundStats: newStats,
        };
      }

      // READ
      const cellValue = state.cells[instr.address].value;
      if (cellValue === null) return state; // shouldn't happen
      const newStats: RoundStats = {
        ...state.roundStats,
        readsCorrect: state.roundStats.readsCorrect + 1,
        readsTotal: state.roundStats.readsTotal + 1,
      };
      const baseScore = state.totalScore + 15;
      const effect: CellEffect = {
        address: instr.address,
        kind: "read",
        key: action.now,
      };
      const newOutputReg = {
        address: instr.address,
        value: cellValue,
        key: action.now,
      };
      if (isLast) {
        return {
          ...state,
          currentInstructionIdx: nextIdx,
          visualOrder: nextVisualOrder,
          outputReg: newOutputReg,
          cellEffect: effect,
          phase: "round-complete",
          totalScore: baseScore + 20,
          roundStats: newStats,
        };
      }
      return {
        ...state,
        currentInstructionIdx: nextIdx,
        visualOrder: nextVisualOrder,
        outputReg: newOutputReg,
        cellEffect: effect,
        totalScore: baseScore,
        roundStats: newStats,
      };
    }

    case "CLEAR_EFFECT":
      return state.cellEffect === null ? state : { ...state, cellEffect: null };

    case "NEXT_ROUND":
      if (state.roundIndex >= TOTAL_ROUNDS - 1) {
        return { ...state, phase: "victory" };
      }
      return roundInitialState(state.roundIndex + 1, state);

    case "RETRY_ROUND":
      return roundInitialState(state.roundIndex, state);

    case "RESET_FULL":
      return startingState();

    default:
      return state;
  }
}

// ─── Sub-components ──────────────────────────────────────────────────────

function ClockCounter({ reduced }: { reduced: boolean }) {
  const [hz, setHz] = useState<number>(3.6);
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      setHz(3.55 + Math.random() * 0.12);
    }, 280);
    return () => clearInterval(id);
  }, [reduced]);
  return (
    <span className="font-mono text-[10px] tracking-[0.18em] text-[#00CEC9]/75">
      CLOCK: {hz.toFixed(2)} GHz
    </span>
  );
}

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

function StrikeChips({
  strikes,
  reduced,
}: {
  strikes: number;
  reduced: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] tracking-[0.18em] text-white/40">
        ECC_FAULTS
      </span>
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => {
          const used = i < strikes;
          return (
            <div key={i} className="relative">
              <Cpu
                className={cn(
                  "h-5 w-5 transition-colors duration-200",
                  used
                    ? "text-[#FF6B6B]"
                    : "text-[#00CEC9]/70"
                )}
                aria-label={used ? "Defect" : "Operațional"}
              />
              {used && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-1/2 top-1/2 h-[2px] w-7 -translate-x-1/2 -translate-y-1/2 rotate-12 bg-[#FF6B6B]",
                    !reduced && "ram-crack-flash"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InstructionLine({
  instr,
  index,
  state,
  cells,
}: {
  instr: Instruction;
  index: number;
  state: State;
  cells: CellState[];
}) {
  const isCompleted = index < state.currentInstructionIdx;
  const isCurrent = index === state.currentInstructionIdx && state.phase === "playing";
  const isPending = index > state.currentInstructionIdx;

  const addr = formatHexAddr(instr.address);
  const valueText =
    instr.kind === "write"
      ? `${instr.value}`
      : isCompleted
      ? `${cells[instr.address].value ?? "?"}`
      : "?";

  return (
    <div
      className={cn(
        "rounded-sm border px-3 py-2 font-mono text-xs transition-all duration-300",
        isCurrent &&
          "border-[#6C5CE7] bg-[#6C5CE7]/[0.12] shadow-[0_0_14px_rgba(108,92,231,0.35)] ram-instr-pulse",
        isCompleted &&
          "border-[#00FF94]/30 bg-[#00FF94]/[0.04] text-[#00FF94]/85",
        isPending && "border-white/[0.08] bg-transparent text-white/30"
      )}
    >
      <div className="flex items-center gap-2">
        {isCompleted ? (
          <Check className="h-3.5 w-3.5 shrink-0 text-[#00FF94]" aria-hidden />
        ) : isCurrent ? (
          <ChevronRight
            className="h-3.5 w-3.5 shrink-0 animate-pulse text-[#6C5CE7]"
            aria-hidden
          />
        ) : (
          <span className="w-3.5 text-center text-[10px] text-white/30">
            {index + 1}
          </span>
        )}
        <span
          className={cn(
            "shrink-0 font-bold uppercase tracking-wider",
            instr.kind === "write"
              ? isCurrent || isCompleted
                ? "text-[#00CEC9]"
                : "text-[#00CEC9]/40"
              : isCurrent || isCompleted
              ? "text-[#6C5CE7]"
              : "text-[#6C5CE7]/40"
          )}
        >
          {instr.kind === "write" ? "WRITE" : "READ "}
        </span>
        <span className="text-white/70">{addr}</span>
        <span className="text-white/40">→</span>
        <span
          className={cn(
            "tabular-nums",
            isCompleted
              ? "text-[#00FF94]"
              : isCurrent
              ? "text-white"
              : "text-white/40"
          )}
        >
          {valueText}
        </span>
      </div>
    </div>
  );
}

function OutputRegister({
  outputReg,
  reduced,
}: {
  outputReg: { address: number; value: number; key: number } | null;
  reduced: boolean;
}) {
  return (
    <div className="border border-[#6C5CE7]/25 bg-[#0a0a14] px-4 py-3">
      <div className="mb-1 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.22em] text-[#6C5CE7]/65">
        <span className="flex items-center gap-1.5">
          <Zap className="h-3 w-3" aria-hidden />
          REG_OUT
        </span>
        <span>DATA_BUS</span>
      </div>
      <div className="font-mono text-base tabular-nums">
        <AnimatePresence mode="wait">
          {outputReg ? (
            <motion.div
              key={outputReg.key}
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduced ? undefined : { opacity: 0 }}
              className="flex flex-wrap items-baseline gap-2 whitespace-pre"
            >
              {[
                ...formatBinary(outputReg.value).split(""),
                " ",
                "(",
                ...formatHexValue(outputReg.value).split(""),
                ")",
                " ",
                "@",
                " ",
                ...formatHexAddr(outputReg.address).split(""),
              ].map((ch, i) => (
                <motion.span
                  key={i}
                  initial={reduced ? false : { opacity: 0, y: -3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: reduced ? 0 : i * 0.022,
                    duration: 0.16,
                  }}
                  className={cn(
                    ch === " "
                      ? ""
                      : ch === "0" || ch === "1"
                      ? "text-[#00CEC9]"
                      : ch === "(" || ch === ")" || ch === "@"
                      ? "text-white/40"
                      : "text-[#FDCB6E]"
                  )}
                  style={{ display: "inline-block" }}
                >
                  {ch}
                </motion.span>
              ))}
            </motion.div>
          ) : (
            <div className="font-mono text-base text-white/25 tabular-nums">
              -------- (0x--) @ 0x--
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MemoryCell({
  address,
  value,
  cellEffect,
  isCurrentWriteTarget,
  showAddress,
  disabled,
  onClick,
  reduced,
}: {
  address: number;
  value: number | null;
  cellEffect: CellEffect | null;
  isCurrentWriteTarget: boolean;
  showAddress: boolean;
  disabled: boolean;
  onClick: () => void;
  reduced: boolean;
}) {
  const effect = cellEffect?.address === address ? cellEffect : null;
  const isWriting = effect?.kind === "write";
  const isReading = effect?.kind === "read";
  const isWrong = effect?.kind === "wrong";
  const filled = value !== null;

  const borderClass =
    isWriting || isCurrentWriteTarget
      ? "border-[#00CEC9] shadow-[0_0_18px_rgba(0,206,201,0.55)]"
      : isReading
      ? "border-[#6C5CE7] shadow-[0_0_18px_rgba(108,92,231,0.55)]"
      : isWrong
      ? "border-[#FF6B6B] shadow-[0_0_18px_rgba(255,107,107,0.55)]"
      : filled
      ? "border-[#00CEC9]/35"
      : "border-[#1a1a2e]";

  const pulseClass =
    isWriting && !reduced
      ? "ram-flash-teal"
      : isReading && !reduced
      ? "ram-flash-violet"
      : isCurrentWriteTarget && !reduced
      ? "ram-target-pulse"
      : "";

  const shakeClass = isWrong && !reduced ? "ram-shake-anim" : "";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Celulă ${formatHexAddr(address)}${value === null ? " goală" : ` valoare ${value}`}`}
      className={cn(
        "group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-md border-2 bg-[#0d0d1a] p-2 text-left transition-[border-color,box-shadow,transform] duration-200",
        "focus:outline-none focus-visible:border-[#6C5CE7] focus-visible:shadow-[0_0_12px_rgba(108,92,231,0.5)]",
        disabled ? "cursor-default" : "cursor-pointer hover:scale-[1.03] hover:border-white/30",
        borderClass,
        pulseClass,
        shakeClass
      )}
    >
      {/* Address label (top-left) */}
      <div className="flex items-start justify-between">
        <span
          className={cn(
            "font-mono text-[9px] leading-none tracking-wider transition-opacity duration-500",
            filled ? "text-[#00CEC9]/80" : "text-white/30",
            showAddress ? "opacity-100" : "opacity-0"
          )}
        >
          {formatHexAddr(address)}
        </span>
        {filled && (
          <span className="font-mono text-[8px] leading-none text-white/30">
            ●
          </span>
        )}
      </div>

      {/* Binary value (center) */}
      <div className="flex items-center justify-center py-1">
        {filled ? (
          isWriting && !reduced ? (
            <motion.div
              key={`rain-${effect!.key}`}
              className="flex gap-[1px] font-mono text-[10px] font-bold tracking-tight"
            >
              {formatBinary(value).split("").map((digit, i) => (
                <motion.span
                  key={i}
                  initial={{ y: -14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: i * 0.06,
                    duration: 0.18,
                    ease: "easeOut",
                  }}
                  className="text-[#00CEC9]"
                >
                  {digit}
                </motion.span>
              ))}
            </motion.div>
          ) : (
            <span
              className={cn(
                "font-mono text-[10px] font-bold tracking-tight tabular-nums transition-colors duration-200",
                isReading ? "text-[#a89bf5]" : "text-[#00CEC9]/90"
              )}
            >
              {formatBinary(value)}
            </span>
          )
        ) : (
          <span className="font-mono text-[10px] tracking-widest text-white/15">
            --------
          </span>
        )}
      </div>

      {/* Hex value (bottom-right) */}
      <div className="flex items-end justify-end">
        <span
          className={cn(
            "font-mono text-[9px] leading-none tabular-nums",
            filled ? "text-[#FDCB6E]/85" : "text-white/15"
          )}
        >
          {filled ? formatHexValue(value) : "0x--"}
        </span>
      </div>

      {/* Laser scan overlay during READ */}
      {isReading && !reduced && (
        <span
          key={`laser-${effect!.key}`}
          aria-hidden
          className="ram-laser pointer-events-none absolute inset-0 overflow-hidden"
        />
      )}

      {/* Correct-read checkmark burst */}
      {isReading && (
        <motion.span
          key={`check-${effect!.key}`}
          aria-hidden
          initial={reduced ? false : { scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.7, times: [0, 0.2, 0.7, 1] }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <Check
            className="h-6 w-6 text-[#00FF94]"
            strokeWidth={3}
            style={{ filter: "drop-shadow(0 0 8px #00FF94)" }}
          />
        </motion.span>
      )}
    </button>
  );
}

function StarsRow({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {[0, 1, 2].map((i) => {
        const filled = i < count;
        return (
          <motion.span
            key={i}
            initial={{ scale: 0, rotate: -25 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.18 + i * 0.12,
              type: "spring",
              stiffness: 220,
              damping: 14,
            }}
          >
            <Star
              className={cn(
                "h-9 w-9",
                filled
                  ? "fill-[#FDCB6E] text-[#FDCB6E] drop-shadow-[0_0_12px_rgba(253,203,110,0.55)]"
                  : "text-white/15"
              )}
            />
          </motion.span>
        );
      })}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────

export function RAMGridGame() {
  const [state, dispatch] = useReducer(reducer, undefined, startingState);
  const reduced = useReducedMotion() ?? false;

  // Label fade for round 2.
  useEffect(() => {
    if (state.phase !== "playing") return;
    if (state.roundIndex !== 1) return;
    if (!state.addressLabelsVisible) return;
    const t = setTimeout(
      () => dispatch({ type: "FADE_LABELS" }),
      LABEL_FADE_DELAY_MS
    );
    return () => clearTimeout(t);
  }, [state.phase, state.roundIndex, state.addressLabelsVisible]);

  // Clear cell effect.
  useEffect(() => {
    if (!state.cellEffect) return;
    const t = setTimeout(
      () => dispatch({ type: "CLEAR_EFFECT" }),
      EFFECT_CLEAR_MS
    );
    return () => clearTimeout(t);
  }, [state.cellEffect]);

  const currentInstr = useMemo<Instruction | null>(
    () =>
      state.phase === "playing"
        ? state.instructions[state.currentInstructionIdx] ?? null
        : null,
    [state.phase, state.instructions, state.currentInstructionIdx]
  );

  const onCellClick = useCallback((gridPos: number) => {
    dispatch({ type: "CLICK_CELL", gridPos, now: performance.now() });
  }, []);

  const accuracyPct = useMemo(() => {
    const { readsTotal, readsCorrect, writesCompleted, strikesUsed } =
      state.roundStats;
    const total = readsTotal + writesCompleted + strikesUsed;
    if (total === 0) return 0;
    return Math.round(((readsCorrect + writesCompleted) / total) * 100);
  }, [state.roundStats]);

  const stars = computeStars(state.roundStats.strikesUsed);

  return (
    <div className="my-10">
      <style>{CSS_STYLES}</style>

      <div
        className="relative border-y border-[#00CEC9]/40 bg-[#080810]"
        style={{ boxShadow: "0 0 40px rgba(0,206,201,0.1)" }}
      >
        {!reduced && (
          <div
            aria-hidden
            className="ram-scanlines pointer-events-none absolute inset-0 z-0"
          />
        )}

        <CornerBrackets />

        {/* Top header */}
        <div className="relative z-10 flex items-center justify-between gap-4 border-b border-[#00CEC9]/15 bg-gradient-to-r from-[#00CEC9]/[0.04] via-transparent to-[#6C5CE7]/[0.05] px-5 py-2.5">
          <span className="font-mono text-[10px] tracking-[0.18em] text-[#00CEC9]/70">
            MEM_UNIT_01 // 16-CELL DRAM
          </span>
          <ClockCounter reduced={reduced} />
        </div>

        {/* Body */}
        <div className="relative z-10 px-5 pb-6 pt-5">
          <AnimatePresence mode="wait">
            {state.phase === "intro" && (
              <motion.div
                key="intro"
                initial={reduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="mx-auto flex max-w-2xl flex-col items-center text-center"
              >
                <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-md border border-[#00CEC9]/40 bg-[#00CEC9]/[0.08] text-[#00CEC9]">
                  <Layers className="h-7 w-7" aria-hidden />
                </span>
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#00CEC9]/70">
                  Memory simulator
                </p>
                <h3 className="mb-3 mt-1 text-3xl font-bold text-white">
                  Grila Memoriei RAM
                </h3>
                <p className="mb-6 max-w-md text-sm text-white/65">
                  Tu ești CPU-ul. Procesorul îți dă instrucțiuni{" "}
                  <span className="font-mono text-[#00CEC9]">WRITE</span> și{" "}
                  <span className="font-mono text-[#6C5CE7]">READ</span> peste o
                  matrice de 16 adrese. Execută-le în ordine. 3 greșeli =
                  runda picată.
                </p>

                <div className="mb-6 grid w-full max-w-md grid-cols-3 gap-2 font-mono text-[10px]">
                  {ROUND_NAMES.map((name, i) => (
                    <div
                      key={name}
                      className="border border-white/10 bg-white/[0.02] p-2 text-left"
                    >
                      <p className="text-[#6C5CE7]/70">RND_{i + 1}</p>
                      <p className="mt-0.5 text-white/80">{name}</p>
                      <p className="mt-1 text-[9px] text-white/40 leading-snug">
                        {ROUND_FLAVOR[i]}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => dispatch({ type: "START_ROUND", round: 0 })}
                  className="inline-flex items-center gap-2 border border-[#00CEC9] bg-[#00CEC9]/15 px-6 py-2.5 font-mono text-sm font-semibold uppercase tracking-wider text-[#00CEC9] shadow-[0_0_18px_rgba(0,206,201,0.35)] transition-transform hover:scale-[1.03] active:scale-[0.98]"
                >
                  <Play className="h-4 w-4 fill-current" aria-hidden />
                  Boot Sequence
                </button>
              </motion.div>
            )}

            {state.phase === "playing" && (
              <motion.div
                key={`play-${state.roundIndex}`}
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduced ? undefined : { opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {/* Round header + strikes */}
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#6C5CE7]/65">
                      Runda {state.roundIndex + 1} / {TOTAL_ROUNDS}
                    </p>
                    <p className="font-mono text-sm font-bold uppercase tracking-wider text-white/85">
                      {ROUND_NAMES[state.roundIndex]}
                    </p>
                  </div>
                  <StrikeChips strikes={state.strikes} reduced={reduced} />
                </div>

                {/* Output register */}
                <div className="mb-5">
                  <OutputRegister
                    outputReg={state.outputReg}
                    reduced={reduced}
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[auto_1fr]">
                  {/* Grid */}
                  <div className="flex flex-col items-center">
                    <div
                      className="relative"
                      style={{ width: GRID_SIZE, height: GRID_SIZE }}
                    >
                      {Array.from({ length: TOTAL_CELLS }).map((_, address) => {
                        const gridPos = state.visualOrder.indexOf(address);
                        const row = Math.floor(gridPos / 4);
                        const col = gridPos % 4;
                        const isCurrentWriteTarget =
                          currentInstr?.kind === "write" &&
                          currentInstr.address === address;
                        return (
                          <motion.div
                            key={address}
                            initial={false}
                            animate={{
                              x: col * (CELL_SIZE + CELL_GAP),
                              y: row * (CELL_SIZE + CELL_GAP),
                            }}
                            transition={
                              reduced
                                ? { duration: 0 }
                                : {
                                    type: "spring",
                                    stiffness: 220,
                                    damping: 24,
                                  }
                            }
                            className="absolute"
                            style={{ width: CELL_SIZE, height: CELL_SIZE }}
                          >
                            <MemoryCell
                              address={address}
                              value={state.cells[address].value}
                              cellEffect={state.cellEffect}
                              isCurrentWriteTarget={isCurrentWriteTarget}
                              showAddress={state.addressLabelsVisible}
                              disabled={false}
                              onClick={() => onCellClick(gridPos)}
                              reduced={reduced}
                            />
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Grid footer — coordinate axis */}
                    <div className="mt-3 flex w-full max-w-[334px] items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-[#6C5CE7]/45">
                      <span>0x00</span>
                      <span className="text-[#6C5CE7]/60">
                        DRAM_BANK_A
                      </span>
                      <span>0x0F</span>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="flex flex-col gap-3">
                    <div className="border border-[#6C5CE7]/25 bg-[#0a0a14] p-3">
                      <div className="mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.22em] text-[#6C5CE7]/65">
                        <span>CPU_QUEUE</span>
                        <span>
                          {state.currentInstructionIdx} /{" "}
                          {state.instructions.length}
                        </span>
                      </div>
                      <div className="mb-3 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full bg-gradient-to-r from-[#6C5CE7] to-[#00CEC9] transition-[width] duration-300"
                          style={{
                            width: `${
                              (state.currentInstructionIdx /
                                state.instructions.length) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {state.instructions.map((instr, i) => (
                          <InstructionLine
                            key={i}
                            instr={instr}
                            index={i}
                            state={state}
                            cells={state.cells}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Hint card */}
                    <div className="border border-white/[0.08] bg-white/[0.02] p-3 font-mono text-[10px] text-white/55 leading-relaxed">
                      {currentInstr?.kind === "write" ? (
                        <>
                          <span className="text-[#00CEC9]">{"// WRITE"}</span> —
                          click pe celula evidențiată în teal.
                        </>
                      ) : currentInstr?.kind === "read" ? (
                        <>
                          <span className="text-[#6C5CE7]">{"// READ"}</span> —
                          găsește celula de la adresa{" "}
                          <span className="text-white">
                            {formatHexAddr(currentInstr.address)}
                          </span>{" "}
                          și fă click.
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {state.phase === "round-complete" && (
              <motion.div
                key={`rc-${state.roundIndex}`}
                initial={reduced ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduced ? undefined : { opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
                className="mx-auto flex max-w-2xl flex-col items-center text-center"
              >
                <motion.span
                  initial={reduced ? false : { scale: 0.5, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 220, damping: 14 }}
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-md border border-[#00FF94]/40 bg-[#00FF94]/[0.08] text-[#00FF94]"
                >
                  <Check className="h-7 w-7" strokeWidth={3} aria-hidden />
                </motion.span>

                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#00FF94]/85">
                  Round {state.roundIndex + 1} ◯ Complete
                </p>
                <h3 className="mb-3 mt-1 text-3xl font-bold text-white">
                  {ROUND_NAMES[state.roundIndex]} ✓
                </h3>

                <div className="mb-5">
                  <StarsRow count={stars} />
                </div>

                <div className="mb-6 grid w-full max-w-md grid-cols-3 gap-2 font-mono text-[11px]">
                  <div className="border border-white/10 bg-white/[0.02] p-3">
                    <p className="text-[10px] uppercase tracking-wider text-white/40">
                      Acuratețe
                    </p>
                    <p className="mt-1 text-lg font-bold tabular-nums text-[#00CEC9]">
                      {accuracyPct}%
                    </p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.02] p-3">
                    <p className="text-[10px] uppercase tracking-wider text-white/40">
                      Scor total
                    </p>
                    <p className="mt-1 text-lg font-bold tabular-nums text-[#FDCB6E]">
                      {state.totalScore}
                    </p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.02] p-3">
                    <p className="text-[10px] uppercase tracking-wider text-white/40">
                      ECC_faults
                    </p>
                    <p className="mt-1 text-lg font-bold tabular-nums text-[#FF6B6B]">
                      {state.roundStats.strikesUsed} / {MAX_STRIKES}
                    </p>
                  </div>
                </div>

                {state.roundIndex < TOTAL_ROUNDS - 1 && (
                  <div className="mb-5 max-w-md border border-[#6C5CE7]/30 bg-[#6C5CE7]/[0.05] p-3 text-left font-mono text-[11px] text-white/70">
                    <p className="mb-1 text-[#6C5CE7]/75 uppercase tracking-wider text-[9px]">
                      Next: {ROUND_NAMES[state.roundIndex + 1]}
                    </p>
                    <p>{ROUND_FLAVOR[state.roundIndex + 1]}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => dispatch({ type: "NEXT_ROUND" })}
                  className="inline-flex items-center gap-2 border border-[#00CEC9] bg-[#00CEC9]/15 px-6 py-2.5 font-mono text-sm font-semibold uppercase tracking-wider text-[#00CEC9] shadow-[0_0_18px_rgba(0,206,201,0.35)] transition-transform hover:scale-[1.03] active:scale-[0.98]"
                >
                  {state.roundIndex < TOTAL_ROUNDS - 1 ? (
                    <>
                      Următorul nivel
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </>
                  ) : (
                    <>
                      Memory Dump
                      <Trophy className="h-4 w-4" aria-hidden />
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {state.phase === "round-failed" && (
              <motion.div
                key="failed"
                initial={reduced ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduced ? undefined : { opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
                className="relative mx-auto flex max-w-2xl flex-col items-center text-center"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -m-6 bg-[radial-gradient(ellipse_at_center,_rgba(255,107,107,0.16),_transparent_70%)]"
                />
                <motion.span
                  initial={reduced ? false : { scale: 0.5, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 12 }}
                  className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-md border border-[#FF6B6B]/40 bg-[#FF6B6B]/[0.08] text-[#FF6B6B]"
                >
                  <Skull className="h-8 w-8" aria-hidden />
                </motion.span>
                <p className="relative font-mono text-[10px] uppercase tracking-[0.24em] text-[#FF6B6B]">
                  Memory Fault // segfault
                </p>
                <h3 className="relative mb-3 mt-1 text-3xl font-bold text-white">
                  Bloc corupt
                </h3>
                <p className="relative mb-5 max-w-sm text-sm text-white/65">
                  Ai consumat toate{" "}
                  <span className="font-mono text-[#FF6B6B]">3 ECC_faults</span>{" "}
                  pe runda{" "}
                  <span className="font-mono text-white">
                    {ROUND_NAMES[state.roundIndex]}
                  </span>
                  . Reîncearcă — memoria nu se învață altfel.
                </p>
                <button
                  type="button"
                  onClick={() => dispatch({ type: "RETRY_ROUND" })}
                  className="inline-flex items-center gap-2 border border-[#6C5CE7] bg-[#6C5CE7]/15 px-6 py-2.5 font-mono text-sm font-semibold uppercase tracking-wider text-[#a89bf5] shadow-[0_0_18px_rgba(108,92,231,0.35)] transition-transform hover:scale-[1.03] active:scale-[0.98]"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden />
                  Reîncearcă runda
                </button>
              </motion.div>
            )}

            {state.phase === "victory" && (
              <motion.div
                key="victory"
                initial={reduced ? false : { opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                className="relative mx-auto flex max-w-2xl flex-col items-center text-center"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -m-6 bg-[radial-gradient(ellipse_at_center,_rgba(253,203,110,0.18),_transparent_70%)]"
                />
                <motion.span
                  initial={reduced ? false : { scale: 0.4, rotate: -25 }}
                  animate={
                    reduced
                      ? { scale: 1, rotate: 0 }
                      : { scale: [0.4, 1.15, 1], rotate: [-25, 8, 0] }
                  }
                  transition={{ duration: 0.7 }}
                  className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-md bg-gradient-to-br from-[#FDCB6E] to-[#F39C12] text-white shadow-[0_0_38px_rgba(253,203,110,0.5)]"
                >
                  <Trophy className="h-10 w-10" aria-hidden />
                </motion.span>

                <div className="relative mb-2 inline-block">
                  <span
                    aria-hidden
                    className={cn(
                      "ram-glitch-r absolute inset-0 font-mono text-3xl font-extrabold tracking-wider text-[#FF6B6B]",
                      reduced && "hidden"
                    )}
                  >
                    MEMORY DUMP COMPLETE
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "ram-glitch-b absolute inset-0 font-mono text-3xl font-extrabold tracking-wider text-[#00CEC9]",
                      reduced && "hidden"
                    )}
                  >
                    MEMORY DUMP COMPLETE
                  </span>
                  <h3 className="relative font-mono text-3xl font-extrabold tracking-wider text-white">
                    MEMORY DUMP COMPLETE
                  </h3>
                </div>

                <p className="relative mb-6 max-w-sm text-sm text-white/65">
                  Ai parcurs toate cele 3 runde — citire, scriere, scramble.
                  CPU-ul te respectă acum.
                </p>

                <div className="relative mb-6 flex items-baseline gap-2 font-mono">
                  <span className="text-6xl font-bold tabular-nums text-[#FDCB6E] drop-shadow-[0_0_18px_rgba(253,203,110,0.5)]">
                    {state.totalScore}
                  </span>
                  <span className="text-lg text-white/55">puncte</span>
                </div>

                <motion.div
                  initial={reduced ? false : { y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="relative mb-6 inline-flex items-center gap-2 rounded-full border border-[#FDCB6E]/40 bg-[#FDCB6E]/10 px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-[#FDCB6E]"
                >
                  <Award className="h-3.5 w-3.5" aria-hidden />
                  Badge unlocked: RAM Architect
                </motion.div>

                <button
                  type="button"
                  onClick={() => dispatch({ type: "RESET_FULL" })}
                  className="relative inline-flex items-center gap-2 border border-[#00CEC9] bg-[#00CEC9]/15 px-6 py-2.5 font-mono text-sm font-semibold uppercase tracking-wider text-[#00CEC9] shadow-[0_0_18px_rgba(0,206,201,0.35)] transition-transform hover:scale-[1.03] active:scale-[0.98]"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden />
                  Reboot
                </button>
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
@keyframes ram-scanlines-scroll {
  from { background-position: 0 0; }
  to { background-position: 0 80px; }
}
.ram-scanlines {
  background-image: repeating-linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.03) 0,
    rgba(255, 255, 255, 0.03) 1px,
    transparent 1px,
    transparent 4px
  );
  animation: ram-scanlines-scroll 6s linear infinite;
  opacity: 0.85;
}

@keyframes ram-target-pulse-kf {
  0%, 100% {
    border-color: rgba(0, 206, 201, 0.55);
    box-shadow: 0 0 10px rgba(0, 206, 201, 0.25);
  }
  50% {
    border-color: #00CEC9;
    box-shadow: 0 0 22px rgba(0, 206, 201, 0.75);
  }
}
.ram-target-pulse { animation: ram-target-pulse-kf 1.4s ease-in-out infinite; }

@keyframes ram-flash-teal-kf {
  0% { box-shadow: 0 0 30px rgba(0, 206, 201, 0.9); }
  100% { box-shadow: 0 0 18px rgba(0, 206, 201, 0.55); }
}
.ram-flash-teal { animation: ram-flash-teal-kf 0.5s ease-out; }

@keyframes ram-flash-violet-kf {
  0% { box-shadow: 0 0 30px rgba(108, 92, 231, 0.9); }
  100% { box-shadow: 0 0 18px rgba(108, 92, 231, 0.55); }
}
.ram-flash-violet { animation: ram-flash-violet-kf 0.5s ease-out; }

@keyframes ram-shake-kf {
  0%, 100% { transform: translateX(0); }
  15%, 45%, 75% { transform: translateX(-5px); }
  30%, 60%, 90% { transform: translateX(5px); }
}
.ram-shake-anim { animation: ram-shake-kf 0.45s ease-in-out; }

@keyframes ram-laser-kf {
  0% { top: -8px; opacity: 0; }
  18% { opacity: 1; }
  82% { opacity: 1; }
  100% { top: calc(100% + 4px); opacity: 0; }
}
.ram-laser::before {
  content: "";
  position: absolute;
  left: -3px;
  right: -3px;
  top: 0;
  height: 3px;
  background: linear-gradient(to right, transparent, #c4b5fd 30%, #ffffff 50%, #c4b5fd 70%, transparent);
  box-shadow: 0 0 12px #6C5CE7, 0 0 4px #ffffff;
  animation: ram-laser-kf 0.65s ease-out forwards;
}

@keyframes ram-instr-pulse-kf {
  0%, 100% {
    box-shadow: 0 0 10px rgba(108, 92, 231, 0.25);
  }
  50% {
    box-shadow: 0 0 18px rgba(108, 92, 231, 0.55);
  }
}
.ram-instr-pulse { animation: ram-instr-pulse-kf 1.8s ease-in-out infinite; }

@keyframes ram-crack-flash-kf {
  0% { opacity: 0; }
  30% { opacity: 1; }
  100% { opacity: 1; }
}
.ram-crack-flash { animation: ram-crack-flash-kf 0.4s ease-out; }

@keyframes ram-glitch-r-kf {
  0%, 100% { transform: translate(0, 0); opacity: 0.55; }
  20% { transform: translate(-2px, 1px); }
  40% { transform: translate(1px, -1px); }
  60% { transform: translate(-1px, 2px); }
  80% { transform: translate(2px, 0); }
}
@keyframes ram-glitch-b-kf {
  0%, 100% { transform: translate(0, 0); opacity: 0.55; }
  20% { transform: translate(2px, -1px); }
  40% { transform: translate(-1px, 1px); }
  60% { transform: translate(1px, -2px); }
  80% { transform: translate(-2px, 0); }
}
.ram-glitch-r { animation: ram-glitch-r-kf 2.4s steps(1, end) infinite; mix-blend-mode: screen; }
.ram-glitch-b { animation: ram-glitch-b-kf 2.4s steps(1, end) infinite; mix-blend-mode: screen; }

@media (prefers-reduced-motion: reduce) {
  .ram-scanlines, .ram-target-pulse, .ram-flash-teal, .ram-flash-violet,
  .ram-shake-anim, .ram-instr-pulse, .ram-glitch-r, .ram-glitch-b,
  .ram-crack-flash {
    animation: none !important;
  }
  .ram-laser::before { animation: none !important; opacity: 0 !important; }
}
`;
