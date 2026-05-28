"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type CSSProperties,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Heart,
  HeartCrack,
  Star,
  Timer,
  Trophy,
  Zap,
  AlertTriangle,
  Sparkles,
  Skull,
  Award,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Constants ───────────────────────────────────────────────────────────

const BIT_WEIGHTS = [128, 64, 32, 16, 8, 4, 2, 1] as const;
const BITS_LEN = 8;

type LevelId = 1 | 2 | 3;

type LevelConfig = {
  id: LevelId;
  name: string;
  flavor: string;
  rounds: number;
  min: number;
  max: number;
  timerMs: number;
  lives: number;
  untoggleKills: boolean;
};

const LEVELS: Record<LevelId, LevelConfig> = {
  1: {
    id: 1,
    name: "Recrut",
    flavor:
      "Începi cu numere mici. Ai timp să gândești, ai vieți să greșești. Învață să simți puterile lui 2.",
    rounds: 5,
    min: 1,
    max: 63,
    timerMs: 30_000,
    lives: 3,
    untoggleKills: false,
  },
  2: {
    id: 2,
    name: "Hacker",
    flavor:
      "Numere mai mari, timp mai puțin, vieți mai puține. Aici începi să gândești ca o mașinărie.",
    rounds: 4,
    min: 64,
    max: 191,
    timerMs: 20_000,
    lives: 2,
    untoggleKills: false,
  },
  3: {
    id: 3,
    name: "Architect",
    flavor:
      "O singură viață. O singură șansă. La acest nivel, fiecare bit contează. Și o atingere greșită — gata.",
    rounds: 3,
    min: 128,
    max: 255,
    timerMs: 15_000,
    lives: 1,
    untoggleKills: true,
  },
};

const FEEDBACK_DELAY_MS = 2200;
const SCREEN_EFFECT_CLEAR_MS = 650;
const HEART_BREAK_CLEAR_MS = 700;
const SPEED_BONUS_RATIO = 1 / 3;

// ─── Helpers ─────────────────────────────────────────────────────────────

function emptyBits(): boolean[] {
  return new Array<boolean>(BITS_LEN).fill(false);
}

function bitsToNumber(bits: readonly boolean[]): number {
  let n = 0;
  for (let i = 0; i < BITS_LEN; i++) if (bits[i]) n += BIT_WEIGHTS[i];
  return n;
}

function numberToBits(n: number): boolean[] {
  const bits: boolean[] = [];
  for (let i = 0; i < BITS_LEN; i++) {
    bits.push((n & BIT_WEIGHTS[i]) !== 0);
  }
  return bits;
}

function randomTarget(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function levelBonus(level: LevelId): number {
  return level * 10;
}

function computeStars(livesLeft: number, maxLives: number): number {
  if (maxLives <= 0) return 0;
  if (livesLeft >= maxLives) return 3;
  if (livesLeft >= Math.ceil(maxLives / 2)) return 2;
  return 1;
}

// ─── Types ───────────────────────────────────────────────────────────────

type Phase =
  | "level-intro"
  | "playing"
  | "feedback"
  | "level-complete"
  | "game-over"
  | "victory";

type LastResult = {
  kind: "correct" | "wrong" | "timeout";
  target: number;
  builtBits: boolean[];
  pointsEarned: number;
  elapsedMs: number;
};

type ScreenEffect = { type: "flash-green" | "shake-red"; key: number };

type State = {
  phase: Phase;
  currentLevel: LevelId;
  currentRound: number;
  lives: number;
  target: number;
  bits: boolean[];
  timeLeftMs: number;
  roundStartMs: number;
  totalScore: number;
  roundsWonThisLevel: number;
  roundsPlayedThisLevel: number;
  livesAtLevelStart: number;
  lastResult: LastResult | null;
  losingHeartIndex: number | null;
  losingHeartKey: number;
  screenEffect: ScreenEffect | null;
  diedOnLevel: LevelId;
  diedOnRound: number;
  levelComplete: {
    level: LevelId;
    livesLeft: number;
    livesAtStart: number;
    roundsWon: number;
    rounds: number;
  } | null;
};

type Action =
  | { type: "START_ROUND"; now: number }
  | { type: "TICK"; now: number }
  | { type: "TOGGLE_BIT"; index: number; now: number }
  | { type: "SUBMIT"; now: number }
  | { type: "TIMEOUT"; now: number }
  | { type: "NEXT_AFTER_FEEDBACK"; now: number }
  | { type: "NEXT_LEVEL" }
  | { type: "RETRY_LEVEL" }
  | { type: "RESET_FULL" }
  | { type: "CLEAR_EFFECT" }
  | { type: "CLEAR_LOSING_HEART" };

// ─── Initial state ───────────────────────────────────────────────────────

function initialState(): State {
  const cfg = LEVELS[1];
  return {
    phase: "level-intro",
    currentLevel: 1,
    currentRound: 0,
    lives: cfg.lives,
    target: 0,
    bits: emptyBits(),
    timeLeftMs: cfg.timerMs,
    roundStartMs: 0,
    totalScore: 0,
    roundsWonThisLevel: 0,
    roundsPlayedThisLevel: 0,
    livesAtLevelStart: cfg.lives,
    lastResult: null,
    losingHeartIndex: null,
    losingHeartKey: 0,
    screenEffect: null,
    diedOnLevel: 1,
    diedOnRound: 1,
    levelComplete: null,
  };
}

// ─── Reducer ─────────────────────────────────────────────────────────────

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "START_ROUND": {
      const cfg = LEVELS[state.currentLevel];
      return {
        ...state,
        phase: "playing",
        target: randomTarget(cfg.min, cfg.max),
        bits: emptyBits(),
        timeLeftMs: cfg.timerMs,
        roundStartMs: action.now,
        lastResult: null,
      };
    }

    case "TICK": {
      if (state.phase !== "playing") return state;
      const cfg = LEVELS[state.currentLevel];
      const elapsed = action.now - state.roundStartMs;
      const remaining = Math.max(0, cfg.timerMs - elapsed);
      if (remaining === state.timeLeftMs) return state;
      return { ...state, timeLeftMs: remaining };
    }

    case "TOGGLE_BIT": {
      if (state.phase !== "playing") return state;
      const i = action.index;
      const currentlyOn = state.bits[i];
      if (!currentlyOn) {
        return {
          ...state,
          bits: state.bits.map((b, idx) => (idx === i ? true : b)),
        };
      }
      const cfg = LEVELS[state.currentLevel];
      if (cfg.untoggleKills) {
        return {
          ...state,
          phase: "game-over",
          lives: 0,
          diedOnLevel: state.currentLevel,
          diedOnRound: state.currentRound + 1,
          losingHeartIndex: 0,
          losingHeartKey: action.now,
          screenEffect: { type: "shake-red", key: action.now },
        };
      }
      const newLives = state.lives - 1;
      if (newLives <= 0) {
        return {
          ...state,
          phase: "game-over",
          lives: 0,
          bits: state.bits.map((b, idx) => (idx === i ? false : b)),
          diedOnLevel: state.currentLevel,
          diedOnRound: state.currentRound + 1,
          losingHeartIndex: state.lives - 1,
          losingHeartKey: action.now,
          screenEffect: { type: "shake-red", key: action.now },
        };
      }
      return {
        ...state,
        lives: newLives,
        bits: state.bits.map((b, idx) => (idx === i ? false : b)),
        losingHeartIndex: state.lives - 1,
        losingHeartKey: action.now,
        screenEffect: { type: "shake-red", key: action.now },
      };
    }

    case "SUBMIT": {
      if (state.phase !== "playing") return state;
      const cfg = LEVELS[state.currentLevel];
      const elapsedMs = Math.min(cfg.timerMs, action.now - state.roundStartMs);
      const built = bitsToNumber(state.bits);
      const correct = built === state.target;

      if (correct) {
        const base = 10;
        const bonus = elapsedMs < cfg.timerMs * SPEED_BONUS_RATIO ? 5 : 0;
        const pointsEarned = base + bonus;
        return {
          ...state,
          phase: "feedback",
          lastResult: {
            kind: "correct",
            target: state.target,
            builtBits: state.bits,
            pointsEarned,
            elapsedMs,
          },
          totalScore: state.totalScore + pointsEarned,
          roundsWonThisLevel: state.roundsWonThisLevel + 1,
          roundsPlayedThisLevel: state.roundsPlayedThisLevel + 1,
          screenEffect: { type: "flash-green", key: action.now },
        };
      }

      const newLives = state.lives - 1;
      const losingIdx = state.lives - 1;
      if (newLives <= 0) {
        return {
          ...state,
          phase: "game-over",
          lives: 0,
          lastResult: {
            kind: "wrong",
            target: state.target,
            builtBits: state.bits,
            pointsEarned: 0,
            elapsedMs,
          },
          roundsPlayedThisLevel: state.roundsPlayedThisLevel + 1,
          diedOnLevel: state.currentLevel,
          diedOnRound: state.currentRound + 1,
          losingHeartIndex: losingIdx,
          losingHeartKey: action.now,
          screenEffect: { type: "shake-red", key: action.now },
        };
      }
      return {
        ...state,
        phase: "feedback",
        lives: newLives,
        lastResult: {
          kind: "wrong",
          target: state.target,
          builtBits: state.bits,
          pointsEarned: 0,
          elapsedMs,
        },
        roundsPlayedThisLevel: state.roundsPlayedThisLevel + 1,
        losingHeartIndex: losingIdx,
        losingHeartKey: action.now,
        screenEffect: { type: "shake-red", key: action.now },
      };
    }

    case "TIMEOUT": {
      if (state.phase !== "playing") return state;
      const cfg = LEVELS[state.currentLevel];
      const newLives = state.lives - 1;
      const losingIdx = state.lives - 1;
      if (newLives <= 0) {
        return {
          ...state,
          phase: "game-over",
          lives: 0,
          lastResult: {
            kind: "timeout",
            target: state.target,
            builtBits: state.bits,
            pointsEarned: 0,
            elapsedMs: cfg.timerMs,
          },
          roundsPlayedThisLevel: state.roundsPlayedThisLevel + 1,
          diedOnLevel: state.currentLevel,
          diedOnRound: state.currentRound + 1,
          losingHeartIndex: losingIdx,
          losingHeartKey: action.now,
          screenEffect: { type: "shake-red", key: action.now },
        };
      }
      return {
        ...state,
        phase: "feedback",
        lives: newLives,
        lastResult: {
          kind: "timeout",
          target: state.target,
          builtBits: state.bits,
          pointsEarned: 0,
          elapsedMs: cfg.timerMs,
        },
        roundsPlayedThisLevel: state.roundsPlayedThisLevel + 1,
        losingHeartIndex: losingIdx,
        losingHeartKey: action.now,
        screenEffect: { type: "shake-red", key: action.now },
      };
    }

    case "NEXT_AFTER_FEEDBACK": {
      if (state.phase !== "feedback") return state;
      const cfg = LEVELS[state.currentLevel];
      if (state.roundsPlayedThisLevel >= cfg.rounds) {
        const bonus = levelBonus(state.currentLevel);
        return {
          ...state,
          phase: "level-complete",
          totalScore: state.totalScore + bonus,
          levelComplete: {
            level: state.currentLevel,
            livesLeft: state.lives,
            livesAtStart: state.livesAtLevelStart,
            roundsWon: state.roundsWonThisLevel,
            rounds: cfg.rounds,
          },
        };
      }
      return {
        ...state,
        phase: "playing",
        currentRound: state.currentRound + 1,
        target: randomTarget(cfg.min, cfg.max),
        bits: emptyBits(),
        timeLeftMs: cfg.timerMs,
        roundStartMs: action.now,
        lastResult: null,
      };
    }

    case "NEXT_LEVEL": {
      if (state.currentLevel >= 3) {
        return { ...state, phase: "victory" };
      }
      const nextLevel = (state.currentLevel + 1) as LevelId;
      const cfg = LEVELS[nextLevel];
      return {
        ...state,
        phase: "level-intro",
        currentLevel: nextLevel,
        currentRound: 0,
        lives: cfg.lives,
        livesAtLevelStart: cfg.lives,
        bits: emptyBits(),
        timeLeftMs: cfg.timerMs,
        roundsWonThisLevel: 0,
        roundsPlayedThisLevel: 0,
        lastResult: null,
        losingHeartIndex: null,
        screenEffect: null,
        levelComplete: null,
      };
    }

    case "RETRY_LEVEL": {
      const cfg = LEVELS[state.currentLevel];
      return {
        ...state,
        phase: "level-intro",
        currentRound: 0,
        lives: cfg.lives,
        livesAtLevelStart: cfg.lives,
        bits: emptyBits(),
        timeLeftMs: cfg.timerMs,
        roundsWonThisLevel: 0,
        roundsPlayedThisLevel: 0,
        lastResult: null,
        losingHeartIndex: null,
        screenEffect: null,
        levelComplete: null,
      };
    }

    case "RESET_FULL":
      return initialState();

    case "CLEAR_EFFECT":
      return state.screenEffect === null ? state : { ...state, screenEffect: null };

    case "CLEAR_LOSING_HEART":
      return state.losingHeartIndex === null
        ? state
        : { ...state, losingHeartIndex: null };

    default:
      return state;
  }
}

// ─── Sub-components ──────────────────────────────────────────────────────

function LifeHearts({
  lives,
  maxLives,
  losingHeartIndex,
  losingHeartKey,
}: {
  lives: number;
  maxLives: number;
  losingHeartIndex: number | null;
  losingHeartKey: number;
}) {
  return (
    <div className="flex items-center gap-1" aria-label={`${lives} din ${maxLives} vieți`}>
      {Array.from({ length: maxLives }).map((_, i) => {
        const isFull = i < lives;
        const isBreaking = losingHeartIndex === i;
        if (isBreaking) {
          return (
            <span
              key={`break-${losingHeartKey}-${i}`}
              className="bt-heart-break"
              aria-hidden
            >
              <HeartCrack className="h-5 w-5 text-[#FF6B6B]" />
            </span>
          );
        }
        return (
          <span key={`life-${i}`} aria-hidden>
            {isFull ? (
              <Heart className="h-5 w-5 fill-[#FF6B6B] text-[#FF6B6B]" />
            ) : (
              <Heart className="h-5 w-5 text-muted-foreground/30" />
            )}
          </span>
        );
      })}
    </div>
  );
}

function TimerBar({
  timeLeftMs,
  totalMs,
}: {
  timeLeftMs: number;
  totalMs: number;
}) {
  const pct = Math.max(0, Math.min(100, (timeLeftMs / totalMs) * 100));
  const seconds = Math.ceil(timeLeftMs / 1000);
  const critical = timeLeftMs <= 5_000;
  const veryCritical = timeLeftMs <= 3_000;

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Timer className="h-3 w-3" aria-hidden />
          Timp rămas
        </span>
        <span
          className={cn(
            "font-mono tabular-nums",
            critical && "text-[#FF6B6B] font-semibold",
            veryCritical && "bt-pulse-fast"
          )}
        >
          {seconds}s
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-border/60">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-100 ease-linear",
            critical
              ? "bg-gradient-to-r from-[#FF6B6B] to-[#FFB199] shadow-[0_0_10px_rgba(255,107,107,0.7)]"
              : "bg-gradient-to-r from-[#00CEC9] to-[#5fe3df] shadow-[0_0_10px_rgba(0,206,201,0.6)]",
            veryCritical && "bt-pulse-fast"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function BitButton({
  weight,
  on,
  disabled,
  burst,
  onClick,
}: {
  weight: number;
  on: boolean;
  disabled: boolean;
  burst: boolean;
  onClick: () => void;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      whileTap={reduced || disabled ? undefined : { scale: 0.9 }}
      animate={
        on && !reduced
          ? { scale: [1, 1.14, 1] }
          : { scale: 1 }
      }
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={cn(
        "relative flex aspect-square w-[14vw] max-w-[68px] min-w-[44px] flex-col items-center justify-center rounded-xl border-2 font-mono font-bold transition-colors",
        on
          ? "border-[#6C5CE7] bg-[#6C5CE7] text-white shadow-[0_0_20px_3px_rgba(108,92,231,0.6)]"
          : "border-border/80 bg-muted/30 text-muted-foreground hover:border-[#6C5CE7]/50 hover:text-foreground",
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      )}
      aria-pressed={on}
      aria-label={`Bit cu valoarea ${weight}`}
    >
      <span className="text-xl leading-none sm:text-2xl">{on ? "1" : "0"}</span>
      <span
        className={cn(
          "mt-1 text-[10px] font-semibold leading-none sm:text-[11px]",
          on ? "text-white/85" : "text-muted-foreground/70"
        )}
      >
        {weight}
      </span>

      {burst && (
        <span className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden>
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            const dx = Math.cos(angle) * 40;
            const dy = Math.sin(angle) * 40;
            return (
              <span
                key={i}
                className="bt-particle"
                style={
                  {
                    "--bt-dx": `${dx}px`,
                    "--bt-dy": `${dy}px`,
                    animationDelay: `${i * 30}ms`,
                  } as CSSProperties
                }
              />
            );
          })}
        </span>
      )}
    </motion.button>
  );
}

function BinaryExplainer() {
  const example = 42;
  const exampleBits = numberToBits(example);
  return (
    <div className="rounded-xl border border-[#6C5CE7]/25 bg-[#6C5CE7]/[0.06] p-4">
      <div className="mb-2 flex items-baseline justify-center gap-2 font-mono text-sm">
        <span className="text-2xl font-bold text-foreground">{example}</span>
        <span className="text-muted-foreground">=</span>
        <span className="text-[#6C5CE7] font-semibold">32</span>
        <span className="text-muted-foreground">+</span>
        <span className="text-[#6C5CE7] font-semibold">8</span>
        <span className="text-muted-foreground">+</span>
        <span className="text-[#6C5CE7] font-semibold">2</span>
      </div>
      <div className="grid grid-cols-8 gap-1.5">
        {BIT_WEIGHTS.map((w, i) => {
          const on = exampleBits[i];
          return (
            <div
              key={w}
              className={cn(
                "flex aspect-square flex-col items-center justify-center rounded-md border text-xs font-mono",
                on
                  ? "border-[#6C5CE7] bg-[#6C5CE7] text-white shadow-[0_0_10px_rgba(108,92,231,0.45)]"
                  : "border-border bg-muted/30 text-muted-foreground"
              )}
            >
              <span className="text-sm font-bold leading-none">
                {on ? "1" : "0"}
              </span>
              <span
                className={cn(
                  "mt-0.5 text-[9px] leading-none",
                  on ? "text-white/80" : "text-muted-foreground/70"
                )}
              >
                {w}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Pornește biții ale căror valori se adună la numărul țintă.
      </p>
    </div>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5" aria-label={`${count} din 3 stele`}>
      {[0, 1, 2].map((i) => {
        const filled = i < count;
        return (
          <motion.span
            key={i}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.15 + i * 0.12,
              type: "spring",
              stiffness: 220,
              damping: 14,
            }}
          >
            <Star
              className={cn(
                "h-9 w-9",
                filled
                  ? "fill-[#FDCB6E] text-[#FDCB6E] drop-shadow-[0_0_10px_rgba(253,203,110,0.6)]"
                  : "text-muted-foreground/30"
              )}
            />
          </motion.span>
        );
      })}
    </div>
  );
}

function CorrectAnswerStrip({
  target,
  builtBits,
}: {
  target: number;
  builtBits: boolean[];
}) {
  const correctBits = numberToBits(target);
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Răspuns corect:
        </p>
        <div className="mt-2 flex items-center justify-center gap-1.5">
          {correctBits.map((b, i) => (
            <span
              key={i}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md border text-xs font-mono font-bold",
                b
                  ? "border-[#00CEC9] bg-[#00CEC9]/20 text-[#00CEC9]"
                  : "border-border bg-muted/30 text-muted-foreground"
              )}
            >
              {b ? "1" : "0"}
            </span>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Tu ai construit:
        </p>
        <div className="mt-2 flex items-center justify-center gap-1.5">
          {builtBits.map((b, i) => {
            const wrong = b !== correctBits[i];
            return (
              <span
                key={i}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md border text-xs font-mono font-bold",
                  wrong
                    ? "border-[#FF6B6B] bg-[#FF6B6B]/15 text-[#FF6B6B]"
                    : b
                    ? "border-[#00CEC9]/60 bg-[#00CEC9]/10 text-[#00CEC9]"
                    : "border-border bg-muted/30 text-muted-foreground"
                )}
              >
                {b ? "1" : "0"}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────

export function BinaryTranslator() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const reduced = useReducedMotion();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Timer interval — only ticks while playing.
  useEffect(() => {
    if (state.phase !== "playing") return;
    intervalRef.current = setInterval(() => {
      dispatch({ type: "TICK", now: performance.now() });
    }, 100);
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.phase]);

  // Timer expiration.
  useEffect(() => {
    if (state.phase === "playing" && state.timeLeftMs <= 0) {
      dispatch({ type: "TIMEOUT", now: performance.now() });
    }
  }, [state.phase, state.timeLeftMs]);

  // Auto-advance after feedback.
  useEffect(() => {
    if (state.phase !== "feedback") return;
    const t = setTimeout(() => {
      dispatch({ type: "NEXT_AFTER_FEEDBACK", now: performance.now() });
    }, FEEDBACK_DELAY_MS);
    return () => clearTimeout(t);
  }, [state.phase, state.currentRound, state.currentLevel]);

  // Clear screen effect after its duration.
  useEffect(() => {
    if (!state.screenEffect) return;
    const t = setTimeout(() => {
      dispatch({ type: "CLEAR_EFFECT" });
    }, SCREEN_EFFECT_CLEAR_MS);
    return () => clearTimeout(t);
  }, [state.screenEffect]);

  // Clear losing-heart marker after break animation.
  useEffect(() => {
    if (state.losingHeartIndex === null) return;
    const t = setTimeout(() => {
      dispatch({ type: "CLEAR_LOSING_HEART" });
    }, HEART_BREAK_CLEAR_MS);
    return () => clearTimeout(t);
  }, [state.losingHeartIndex, state.losingHeartKey]);

  // Imperatively run shake via WAAPI so it always retriggers on repeat events.
  useEffect(() => {
    if (
      !state.screenEffect ||
      state.screenEffect.type !== "shake-red" ||
      reduced ||
      !cardRef.current
    )
      return;
    const anim = cardRef.current.animate(
      [
        { transform: "translate3d(0,0,0)" },
        { transform: "translate3d(-7px,0,0)" },
        { transform: "translate3d(7px,0,0)" },
        { transform: "translate3d(-5px,0,0)" },
        { transform: "translate3d(5px,0,0)" },
        { transform: "translate3d(0,0,0)" },
      ],
      { duration: 480, easing: "ease-in-out" }
    );
    return () => anim.cancel();
  }, [state.screenEffect, reduced]);

  const levelCfg = LEVELS[state.currentLevel];

  const onToggleBit = useCallback(
    (i: number) => {
      dispatch({ type: "TOGGLE_BIT", index: i, now: performance.now() });
    },
    []
  );

  const onSubmit = useCallback(() => {
    dispatch({ type: "SUBMIT", now: performance.now() });
  }, []);

  const onStartLevel = useCallback(() => {
    dispatch({ type: "START_ROUND", now: performance.now() });
  }, []);

  const accuracy = useMemo(() => {
    if (!state.levelComplete) return 0;
    const { roundsWon, rounds } = state.levelComplete;
    if (rounds <= 0) return 0;
    return Math.round((roundsWon / rounds) * 100);
  }, [state.levelComplete]);

  const stars = state.levelComplete
    ? computeStars(state.levelComplete.livesLeft, state.levelComplete.livesAtStart)
    : 0;

  const correctBitsForBurst =
    state.phase === "feedback" && state.lastResult?.kind === "correct"
      ? state.lastResult.builtBits
      : null;

  const showFlash =
    state.screenEffect?.type === "flash-green" ? state.screenEffect.key : null;

  return (
    <div className="my-8">
      <style>{CSS_STYLES}</style>

      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-2xl border border-[#6C5CE7]/25 bg-[color:var(--aurora-bg-card)] shadow-[0_14px_44px_-20px_rgba(108,92,231,0.55)]"
      >
        {/* Flash overlay for correct submission */}
        {showFlash !== null && (
          <div
            key={`flash-${showFlash}`}
            className="bt-flash-overlay pointer-events-none absolute inset-0 z-20"
            aria-hidden
          />
        )}

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between gap-3 border-b border-border/60 bg-gradient-to-r from-[#6C5CE7]/15 via-transparent to-[#00CEC9]/10 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6C5CE7]/15 text-[#6C5CE7]">
              <Zap className="h-4 w-4" aria-hidden />
            </span>
            <div className="leading-tight">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Mini-joc · Nivelul {state.currentLevel}/3
              </p>
              <h3 className="text-sm font-semibold text-foreground">
                Traducătorul Binar · {levelCfg.name}
              </h3>
            </div>
          </div>

          {(state.phase === "playing" || state.phase === "feedback") && (
            <div className="flex items-center gap-4 text-right text-xs">
              <div>
                <p className="text-muted-foreground">Runda</p>
                <p className="font-mono text-foreground">
                  <span className="font-semibold">{state.currentRound + 1}</span>
                  <span className="opacity-50"> / {levelCfg.rounds}</span>
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Scor</p>
                <p className="font-mono font-semibold text-[#FDCB6E]">
                  {state.totalScore}
                </p>
              </div>
              <LifeHearts
                lives={state.lives}
                maxLives={levelCfg.lives}
                losingHeartIndex={state.losingHeartIndex}
                losingHeartKey={state.losingHeartKey}
              />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="relative min-h-[520px] p-6 sm:p-7">
          <AnimatePresence mode="wait">
            {state.phase === "level-intro" && (
              <motion.div
                key={`intro-${state.currentLevel}`}
                initial={reduced ? false : { opacity: 0, x: 36 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduced ? undefined : { opacity: 0, x: -36 }}
                transition={{ duration: 0.32, ease: "easeOut" }}
                className="flex flex-col items-center text-center"
              >
                <p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-[#6C5CE7]">
                  Nivelul {state.currentLevel}
                </p>
                <h4 className="mb-2 text-3xl font-bold text-foreground sm:text-4xl">
                  {levelCfg.name}
                </h4>
                <p className="mb-5 max-w-md text-sm text-muted-foreground">
                  {levelCfg.flavor}
                </p>

                <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-md">
                  <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Runde
                    </p>
                    <p className="mt-1 font-mono text-2xl font-bold text-foreground">
                      {levelCfg.rounds}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Timp/rundă
                    </p>
                    <p className="mt-1 font-mono text-2xl font-bold text-[#00CEC9]">
                      {Math.round(levelCfg.timerMs / 1000)}s
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Vieți
                    </p>
                    <div className="mt-1 flex items-center justify-center gap-1">
                      {Array.from({ length: levelCfg.lives }).map((_, i) => (
                        <Heart
                          key={i}
                          className="h-5 w-5 fill-[#FF6B6B] text-[#FF6B6B]"
                          aria-hidden
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mb-6 flex w-full max-w-md items-start gap-2.5 rounded-xl border border-[#FF6B6B]/40 bg-[#FF6B6B]/[0.08] p-3.5 text-left">
                  <AlertTriangle
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#FF6B6B]"
                    aria-hidden
                  />
                  <p className="text-xs text-[#FF6B6B]">
                    {levelCfg.untoggleKills ? (
                      <>
                        <span className="font-semibold">
                          Atenție — fără greșeli:
                        </span>{" "}
                        dacă închizi un bit pe care l-ai pornit deja, pierzi
                        instant. Gândește înainte de a apăsa.
                      </>
                    ) : (
                      <>
                        <span className="font-semibold">
                          Fără pași înapoi:
                        </span>{" "}
                        dacă închizi un bit pe care l-ai pornit deja, pierzi o
                        viață. Numerele țintă nu mai apar descompuse.
                      </>
                    )}
                  </p>
                </div>

                {state.currentLevel === 1 && (
                  <div className="mb-6 w-full max-w-md">
                    <BinaryExplainer />
                  </div>
                )}

                <button
                  type="button"
                  onClick={onStartLevel}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#8B7CFA] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-[#6C5CE7]/40 transition-transform hover:scale-[1.03] active:scale-[0.98]"
                >
                  Începe
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </button>
              </motion.div>
            )}

            {(state.phase === "playing" || state.phase === "feedback") && (
              <motion.div
                key={`round-${state.currentLevel}-${state.currentRound}`}
                initial={reduced ? false : { opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduced ? undefined : { opacity: 0, x: -40 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex flex-col items-center"
              >
                <div className="mb-7 w-full">
                  <TimerBar
                    timeLeftMs={state.timeLeftMs}
                    totalMs={levelCfg.timerMs}
                  />
                </div>

                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Construiește
                </p>
                <p className="mb-7 mt-1 font-mono text-7xl font-bold tabular-nums text-foreground drop-shadow-[0_2px_18px_rgba(108,92,231,0.35)] sm:text-8xl">
                  {state.target}
                </p>

                <div className="mb-7 grid grid-cols-8 gap-1.5 sm:gap-2.5">
                  {BIT_WEIGHTS.map((w, i) => (
                    <BitButton
                      key={w}
                      weight={w}
                      on={state.bits[i]}
                      disabled={state.phase === "feedback"}
                      burst={
                        correctBitsForBurst !== null && correctBitsForBurst[i]
                      }
                      onClick={() => onToggleBit(i)}
                    />
                  ))}
                </div>

                {state.phase === "playing" ? (
                  <button
                    type="button"
                    onClick={onSubmit}
                    className="rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#8B7CFA] px-7 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#6C5CE7]/40 transition-transform hover:scale-[1.03] active:scale-[0.98]"
                  >
                    Verifică
                  </button>
                ) : (
                  <motion.div
                    initial={reduced ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex w-full max-w-md flex-col items-center gap-4"
                  >
                    {state.lastResult?.kind === "correct" ? (
                      <div className="inline-flex items-center gap-2 rounded-xl bg-[#00CEC9]/15 px-5 py-2.5 text-sm font-semibold text-[#00CEC9]">
                        <Sparkles className="h-4 w-4" aria-hidden />
                        Corect! +{state.lastResult.pointsEarned} pct
                        {state.lastResult.pointsEarned === 15 && (
                          <span className="text-xs font-normal opacity-80">
                            (bonus viteză)
                          </span>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B6B]/15 px-5 py-2.5 text-sm font-semibold text-[#FF6B6B]">
                          {state.lastResult?.kind === "timeout"
                            ? "Timpul a expirat"
                            : "Greșit"}
                          {" — "}
                          <span className="font-mono">
                            {state.lastResult?.target}
                          </span>
                        </div>
                        {state.lastResult && (
                          <CorrectAnswerStrip
                            target={state.lastResult.target}
                            builtBits={state.lastResult.builtBits}
                          />
                        )}
                      </>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}

            {state.phase === "level-complete" && state.levelComplete && (
              <motion.div
                key="level-complete"
                initial={reduced ? false : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduced ? undefined : { opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center"
              >
                <motion.span
                  initial={reduced ? false : { scale: 0.6, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 220, damping: 14 }}
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6C5CE7] to-[#00CEC9] text-white shadow-lg shadow-[#6C5CE7]/40"
                >
                  <Award className="h-8 w-8" aria-hidden />
                </motion.span>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#00CEC9]">
                  Nivel finalizat
                </p>
                <h4 className="mb-3 text-3xl font-bold text-foreground">
                  {LEVELS[state.levelComplete.level].name} ✓
                </h4>

                <div className="mb-5">
                  <Stars count={stars} />
                </div>

                <div className="mb-6 grid w-full max-w-md grid-cols-3 gap-3">
                  <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Scor total
                    </p>
                    <p className="mt-1 font-mono text-2xl font-bold text-[#FDCB6E]">
                      {state.totalScore}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Acuratețe
                    </p>
                    <p className="mt-1 font-mono text-2xl font-bold text-[#00CEC9]">
                      {accuracy}%
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Vieți rămase
                    </p>
                    <div className="mt-1 flex items-center justify-center gap-1">
                      {Array.from({
                        length: state.levelComplete.livesAtStart,
                      }).map((_, i) => (
                        <Heart
                          key={i}
                          className={cn(
                            "h-5 w-5",
                            i < state.levelComplete!.livesLeft
                              ? "fill-[#FF6B6B] text-[#FF6B6B]"
                              : "text-muted-foreground/30"
                          )}
                          aria-hidden
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => dispatch({ type: "NEXT_LEVEL" })}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#8B7CFA] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-[#6C5CE7]/40 transition-transform hover:scale-[1.03] active:scale-[0.98]"
                >
                  {state.currentLevel < 3
                    ? "Nivelul următor"
                    : "Vezi rezultatul final"}
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </button>
              </motion.div>
            )}

            {state.phase === "game-over" && (
              <motion.div
                key="game-over"
                initial={reduced ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduced ? undefined : { opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
                className="relative flex flex-col items-center text-center"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -m-6 sm:-m-7 bg-[radial-gradient(ellipse_at_center,_rgba(255,107,107,0.18),_transparent_70%)]"
                />
                <motion.span
                  initial={reduced ? false : { scale: 0.5, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 12 }}
                  className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF6B6B] to-[#9b1d1d] text-white shadow-xl shadow-[#FF6B6B]/30"
                >
                  <Skull className="h-10 w-10" aria-hidden />
                </motion.span>

                <p className="text-[11px] uppercase tracking-[0.22em] text-[#FF6B6B]">
                  Game Over
                </p>
                <h4 className="mb-2 text-3xl font-bold text-foreground">
                  Ai pierdut
                </h4>
                <p className="mb-5 max-w-sm text-sm text-muted-foreground">
                  Ai căzut la{" "}
                  <span className="font-mono text-foreground">
                    {LEVELS[state.diedOnLevel].name}
                  </span>{" "}
                  · Runda{" "}
                  <span className="font-mono text-foreground">
                    {state.diedOnRound}
                  </span>
                  . Vine cu exercițiu — încearcă din nou.
                </p>

                <div className="mb-6 inline-flex items-baseline gap-2 font-mono">
                  <span className="text-4xl font-bold text-[#FDCB6E]">
                    {state.totalScore}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    puncte acumulate
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => dispatch({ type: "RETRY_LEVEL" })}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#8B7CFA] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-[#6C5CE7]/40 transition-transform hover:scale-[1.03] active:scale-[0.98]"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden />
                  Încearcă din nou
                </button>
              </motion.div>
            )}

            {state.phase === "victory" && (
              <motion.div
                key="victory"
                initial={reduced ? false : { opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.34 }}
                className="relative flex flex-col items-center text-center"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -m-6 sm:-m-7 bg-[radial-gradient(ellipse_at_center,_rgba(253,203,110,0.2),_transparent_70%)]"
                />
                <motion.span
                  initial={reduced ? false : { scale: 0.4, rotate: -25 }}
                  animate={
                    reduced
                      ? { scale: 1, rotate: 0 }
                      : { scale: [0.4, 1.15, 1], rotate: [-25, 10, 0] }
                  }
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="relative mb-5 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FDCB6E] to-[#F39C12] text-white shadow-2xl shadow-[#FDCB6E]/50"
                >
                  <Trophy className="h-12 w-12 drop-shadow-md" aria-hidden />
                </motion.span>

                <p className="text-[11px] uppercase tracking-[0.24em] text-[#FDCB6E]">
                  Toate cele 3 niveluri
                </p>
                <h4 className="mb-2 text-4xl font-extrabold text-foreground">
                  VICTORIE
                </h4>
                <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                  Ai stăpânit traducerea zecimal → binar pe toate cele 3
                  nivele. Creierul tău acum gândește în puteri ale lui 2.
                </p>

                <div className="mb-6 flex items-baseline gap-2 font-mono">
                  <span className="text-6xl font-bold tabular-nums text-[#FDCB6E] drop-shadow-[0_0_20px_rgba(253,203,110,0.5)]">
                    {state.totalScore}
                  </span>
                  <span className="text-lg text-muted-foreground">puncte</span>
                </div>

                <motion.div
                  initial={reduced ? false : { y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#FDCB6E]/40 bg-[#FDCB6E]/10 px-4 py-1.5 text-xs font-semibold text-[#FDCB6E]"
                >
                  <Award className="h-3.5 w-3.5" aria-hidden />
                  Badge: Traducător Binar
                </motion.div>

                <button
                  type="button"
                  onClick={() => dispatch({ type: "RESET_FULL" })}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#8B7CFA] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-[#6C5CE7]/40 transition-transform hover:scale-[1.03] active:scale-[0.98]"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden />
                  Joacă din nou
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
@keyframes bt-flash-green-kf {
  0% { background-color: rgba(0, 206, 201, 0); }
  35% { background-color: rgba(0, 206, 201, 0.22); }
  100% { background-color: rgba(0, 206, 201, 0); }
}
.bt-flash-overlay { animation: bt-flash-green-kf 0.6s ease-out forwards; }

@keyframes bt-particle-kf {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  100% {
    transform: translate(calc(-50% + var(--bt-dx)), calc(-50% + var(--bt-dy))) scale(0);
    opacity: 0;
  }
}
.bt-particle {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  background: #00CEC9;
  box-shadow: 0 0 6px rgba(0, 206, 201, 0.8);
  pointer-events: none;
  animation: bt-particle-kf 0.7s ease-out forwards;
}

@keyframes bt-heart-break-kf {
  0% { transform: scale(1) rotate(0); opacity: 1; }
  35% { transform: scale(1.4) rotate(-12deg); opacity: 1; }
  100% { transform: scale(0.5) rotate(18deg); opacity: 0; }
}
.bt-heart-break { animation: bt-heart-break-kf 0.65s ease-in forwards; display: inline-block; }

@keyframes bt-pulse-fast-kf {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}
.bt-pulse-fast { animation: bt-pulse-fast-kf 0.6s ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  .bt-flash-overlay, .bt-particle, .bt-heart-break, .bt-pulse-fast {
    animation: none !important;
  }
}
`;
