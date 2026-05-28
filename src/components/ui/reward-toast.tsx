"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { confettiBurst, prefersReducedMotion } from "@/lib/animations";

type RewardType = "xp" | "badge" | "levelup" | "streak";

interface RewardToastProps {
  type: RewardType;
  value: string;        // e.g. "+50 XP", "Quiz Master", "Level 5", "🔥 7 zile"
  visible: boolean;
  onDismiss: () => void;
  autoDismissMs?: number;
  subtitle?: string;
  soundEnabled?: boolean;
}

// ─── Audio singleton ──────────────────────────────────────────────────────────

let _audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!_audioCtx) {
    try {
      const AC = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AC) _audioCtx = new AC();
    } catch {
      return null;
    }
  }
  return _audioCtx;
}

function playTone(
  frequency: number,
  duration: number,
  gain = 0.15,
  type: OscillatorType = "sine"
): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  gainNode.gain.setValueAtTime(gain, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration + 0.05);
}

function playNoise(gain: number, duration: number): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();

  const sampleRate = ctx.sampleRate;
  const bufferSize = Math.ceil(sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const src = ctx.createBufferSource();
  src.buffer = buffer;

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(gain, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 3000;
  filter.Q.value = 0.8;

  src.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);
  src.start();
}

function playRewardSound(type: RewardType): void {
  if (prefersReducedMotion()) return;
  switch (type) {
    case "xp":
      playTone(880, 0.12, 0.14, "sine");
      break;
    case "badge":
      playTone(523, 0.15, 0.13, "sine");
      setTimeout(() => playTone(659, 0.22, 0.13, "sine"), 110);
      break;
    case "levelup":
      playTone(262, 0.55, 0.12, "sine");
      playTone(330, 0.55, 0.10, "sine");
      playTone(392, 0.65, 0.12, "sine");
      setTimeout(() => playTone(784, 0.4, 0.08, "sine"), 200);
      break;
    case "streak":
      playNoise(0.18, 0.18);
      setTimeout(() => playNoise(0.10, 0.12), 80);
      break;
  }
}

// ─── Configs ──────────────────────────────────────────────────────────────────

const CONFIGS: Record<RewardType, {
  emoji: string;
  label: string;
  bg: string;
  border: string;
  glow: string;
  textColor: string;
  barColor: string;
}> = {
  xp: {
    emoji: "⚡",
    label: "XP câștigat!",
    bg: "bg-gradient-to-br from-aurora-gold-50 to-amber-50 dark:from-aurora-gold-900/40 dark:to-amber-950/40",
    border: "border-aurora-gold-500/40",
    glow: "shadow-[0_0_24px_rgba(253,203,110,0.35)]",
    textColor: "text-aurora-gold-600 dark:text-aurora-gold-300",
    barColor: "#FDCB6E",
  },
  badge: {
    emoji: "🏅",
    label: "Insignă câștigată!",
    bg: "bg-gradient-to-br from-violet-50 to-aurora-primary-50 dark:from-violet-950/40 dark:to-aurora-primary-900/40",
    border: "border-aurora-primary-500/40",
    glow: "shadow-[0_0_24px_rgba(108,92,231,0.35)]",
    textColor: "text-aurora-primary-500",
    barColor: "#6C5CE7",
  },
  levelup: {
    emoji: "🎉",
    label: "Nivel nou!",
    bg: "bg-gradient-to-br from-aurora-primary-50 via-aurora-accent-50 to-aurora-gold-50 dark:from-aurora-primary-900/50 dark:via-aurora-accent-900/30 dark:to-aurora-gold-900/30",
    border: "border-aurora-accent-500/40",
    glow: "shadow-[0_0_32px_rgba(0,206,201,0.35)]",
    textColor: "text-aurora-accent-500",
    barColor: "#00CEC9",
  },
  streak: {
    emoji: "🔥",
    label: "Seria continuă!",
    bg: "bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/40 dark:to-red-950/40",
    border: "border-aurora-streak-500/40",
    glow: "shadow-[0_0_24px_rgba(255,107,107,0.35)]",
    textColor: "text-aurora-streak-500",
    barColor: "#FF6B6B",
  },
};

// ─── XP floating text ─────────────────────────────────────────────────────────

function XPFloatingText({ value }: { value: string }) {
  return (
    <motion.div
      className="absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap z-10"
      initial={{ opacity: 0, y: 0, scale: 0.8 }}
      animate={{ opacity: [0, 1, 1, 0], y: [-4, -12, -28, -40] }}
      transition={{ duration: 1.1, ease: "easeOut", times: [0, 0.2, 0.7, 1] }}
      aria-hidden
    >
      <span
        className="text-sm font-bold"
        style={{
          background: "linear-gradient(135deg, #FDCB6E, #F9A825)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          filter: "drop-shadow(0 0 4px rgba(253,203,110,0.6))",
        }}
      >
        {value}
      </span>
    </motion.div>
  );
}

// ─── Badge typewriter reveal ──────────────────────────────────────────────────

function BadgeValue({ value }: { value: string }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const id = setInterval(() => {
      setDisplayed(value.slice(0, ++i));
      if (i >= value.length) clearInterval(id);
    }, 45);
    return () => clearInterval(id);
  }, [value]);

  return (
    <motion.span
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 18 }}
      className="text-sm font-bold text-aurora-primary-500"
    >
      {displayed}
      {displayed.length < value.length && (
        <span
          className="inline-block w-0.5 h-3.5 ml-0.5 bg-aurora-primary-500 align-middle"
          style={{ animation: "blink-cursor 0.6s step-end infinite" }}
        />
      )}
    </motion.span>
  );
}

// ─── Level up flash overlay ───────────────────────────────────────────────────

function LevelUpFlash() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-[200] animate-levelup-flash"
      style={{ background: "rgba(255,255,255,0.08)" }}
      aria-hidden
    />
  );
}

// ─── Streak fire particles ────────────────────────────────────────────────────

function FireParticles() {
  const particles = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    left: `${10 + i * 14}%`,
    delay: i * 0.14,
    color: i % 2 === 0 ? "#FF6B6B" : "#FDCB6E",
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl" aria-hidden>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute bottom-1 w-1.5 h-1.5 rounded-full"
          style={{ left: p.left, backgroundColor: p.color }}
          animate={{ y: [0, -18, -34], opacity: [0.9, 0.5, 0], scale: [1, 0.7, 0.3] }}
          transition={{ duration: 0.9, delay: p.delay, repeat: Infinity, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

// ─── Level up particle burst ──────────────────────────────────────────────────

function ParticleBurst() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl" aria-hidden>
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            left: `${10 + (i % 5) * 18}%`,
            top: `${20 + Math.floor(i / 5) * 55}%`,
            backgroundColor: ["#6C5CE7", "#00CEC9", "#FDCB6E", "#A29BFE", "#FF6B6B"][i % 5],
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: [0, 1.5, 0], opacity: [1, 0.8, 0], y: [0, -20, -48] }}
          transition={{ duration: 0.9, delay: i * 0.04, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

// ─── RewardToast ──────────────────────────────────────────────────────────────

export function RewardToast({
  type,
  value,
  visible,
  onDismiss,
  autoDismissMs = 3500,
  subtitle,
  soundEnabled = true,
}: RewardToastProps) {
  const config = CONFIGS[type];
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingRef = useRef(autoDismissMs);
  const startedAtRef = useRef<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function startTimer(duration: number) {
    clearTimer();
    timerRef.current = setTimeout(onDismiss, duration);
    startedAtRef.current = Date.now();
  }

  function handleMouseEnter() {
    if (!startedAtRef.current) return;
    const elapsed = Date.now() - startedAtRef.current;
    remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    startedAtRef.current = null;
    clearTimer();
    setIsPaused(true);
  }

  function handleMouseLeave() {
    setIsPaused(false);
    startTimer(remainingRef.current);
  }

  useEffect(() => {
    if (visible) {
      remainingRef.current = autoDismissMs;
      if (soundEnabled) playRewardSound(type);
      if (type === "levelup" || type === "badge") {
        confettiBurst(type === "levelup" ? "levelup" : "badge").catch(() => {});
      }
      if (type === "levelup") {
        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 450);
      }
      startTimer(autoDismissMs);
    } else {
      remainingRef.current = autoDismissMs;
      clearTimer();
    }
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, type]);

  return (
    <>
      {showFlash && <LevelUpFlash />}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: -80, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -60, opacity: 0, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 340, damping: 24 }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={cn(
              "relative flex items-center gap-3 pl-4 pr-10 py-3 rounded-2xl border",
              "min-w-[240px] max-w-[340px]",
              config.bg,
              config.border,
              config.glow,
              "backdrop-blur-sm cursor-default select-none"
            )}
            role="alert"
            aria-live="assertive"
          >
            {type === "levelup" && <ParticleBurst />}
            {type === "streak" && <FireParticles />}
            {type === "xp" && <XPFloatingText value={value} />}

            {/* Emoji */}
            <motion.span
              initial={{ rotate: -20, scale: 0.6 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
              className="text-2xl shrink-0"
            >
              {config.emoji}
            </motion.span>

            {/* Text */}
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-muted-foreground">{config.label}</span>
              {type === "badge" ? (
                <BadgeValue value={value} />
              ) : (
                <span className={cn("text-sm font-bold leading-tight", config.textColor)}>
                  {value}
                </span>
              )}
              {subtitle && (
                <span className="text-xs text-muted-foreground mt-0.5">{subtitle}</span>
              )}
            </div>

            {/* Dismiss button */}
            <button
              onClick={onDismiss}
              className="absolute right-2 top-2 p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Închide notificarea"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {/* Progress bar — pauses on hover */}
            {!isPaused && (
              <motion.div
                key={`bar-${type}-${visible}`}
                className="absolute bottom-0 left-0 h-0.5 rounded-b-2xl"
                style={{ backgroundColor: config.barColor }}
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: remainingRef.current / 1000, ease: "linear" }}
              />
            )}
            {isPaused && (
              <div
                className="absolute bottom-0 left-0 h-0.5 rounded-b-2xl"
                style={{ backgroundColor: config.barColor, width: `${(remainingRef.current / autoDismissMs) * 100}%` }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── RewardToastStack: portal-style fixed container ──────────────────────────

interface ToastItem {
  id: string;
  type: RewardType;
  value: string;
  subtitle?: string;
}

interface RewardToastStackProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
  soundEnabled?: boolean;
}

export function RewardToastStack({ toasts, onDismiss, soundEnabled = true }: RewardToastStackProps) {
  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none"
      role="region"
      aria-label="Notificări recompense"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <RewardToast
            type={t.type}
            value={t.value}
            subtitle={t.subtitle}
            soundEnabled={soundEnabled}
            visible
            onDismiss={() => onDismiss(t.id)}
          />
        </div>
      ))}
    </div>
  );
}
