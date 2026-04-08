"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  RotateCcw,
  TrendingUp,
  AlertCircle,
  Brain,
  Layers,
  Sparkles,
  Mic,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SessionReportData {
  overall: number;
  categories: { name: string; score: number }[];
  puncte_tari: string[];
  de_imbunatatit: string[];
}

interface SessionReportProps {
  report: SessionReportData;
  onReset: () => void;
}

// Matches the order the AI always returns categories
const CAT_CONFIG = [
  { Icon: Brain, bar: "bg-violet-500", iconCls: "text-violet-500" },
  { Icon: TrendingUp, bar: "bg-blue-500", iconCls: "text-blue-500" },
  { Icon: Layers, bar: "bg-cyan-500", iconCls: "text-cyan-500" },
  { Icon: Sparkles, bar: "bg-indigo-500", iconCls: "text-indigo-500" },
  { Icon: Mic, bar: "bg-amber-500", iconCls: "text-amber-500" },
];

const CIRCUMFERENCE = 2 * Math.PI * 50; // r = 50

function scoreProfile(score: number) {
  if (score >= 70)
    return {
      label: "Pregătit pentru interviu",
      textColor: "text-emerald-600 dark:text-emerald-400",
      ringColor: "#10b981",
      badgeBg: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300",
    };
  if (score >= 50)
    return {
      label: "În progres — mai ai de lucrat",
      textColor: "text-amber-600 dark:text-amber-400",
      ringColor: "#f59e0b",
      badgeBg: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300",
    };
  return {
    label: "Continuă să înveți",
    textColor: "text-red-600 dark:text-red-400",
    ringColor: "#ef4444",
    badgeBg: "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300",
  };
}

function scoreTextColor(score: number) {
  if (score >= 70) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export function SessionReport({ report, onReset }: SessionReportProps) {
  const { label, textColor, ringColor, badgeBg } = scoreProfile(report.overall);
  const [displayScore, setDisplayScore] = useState(0);

  // Animated counter 0 → overall
  useEffect(() => {
    const target = report.overall;
    const duration = 1600;
    const startTime = performance.now();
    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplayScore(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [report.overall]);

  // Confetti for high score
  useEffect(() => {
    if (report.overall >= 70) {
      const timer = setTimeout(async () => {
        const confetti = (await import("canvas-confetti")).default;
        confetti({
          particleCount: 160,
          spread: 100,
          origin: { y: 0.5 },
          colors: ["#10b981", "#6366f1", "#f59e0b", "#06b6d4"],
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [report.overall]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      className="rounded-2xl bg-card border border-border overflow-hidden"
    >
      {/* ── Header: ring + score info ── */}
      <div className="p-6 sm:p-8 border-b border-border bg-gradient-to-br from-muted/50 via-muted/20 to-transparent">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* SVG ring */}
          <div className="relative shrink-0 w-[128px] h-[128px]">
            <svg width="128" height="128" viewBox="0 0 120 120" className="-rotate-90">
              {/* Track */}
              <circle
                cx="60" cy="60" r="50"
                fill="none"
                strokeWidth="9"
                className="stroke-muted-foreground/20"
              />
              {/* Animated arc */}
              <motion.circle
                cx="60" cy="60" r="50"
                fill="none"
                strokeWidth="9"
                strokeLinecap="round"
                stroke={ringColor}
                strokeDasharray={CIRCUMFERENCE}
                initial={{ strokeDashoffset: CIRCUMFERENCE }}
                animate={{
                  strokeDashoffset: CIRCUMFERENCE * (1 - report.overall / 100),
                }}
                transition={{ duration: 1.6, ease: "easeOut", delay: 0.25 }}
              />
            </svg>
            {/* Counter */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("text-3xl font-bold tabular-nums leading-none", textColor)}>
                {displayScore}
              </span>
              <span className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                / 100
              </span>
            </div>
          </div>

          {/* Text */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className={cn("inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full", badgeBg)}>
              {report.overall >= 70 ? "🎯" : report.overall >= 50 ? "📈" : "📚"}
              <span>{label}</span>
            </div>
            <h2 className="text-xl font-bold text-foreground">
              Raport sesiune interviu
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              Evaluare bazată pe cele 5 răspunsuri. Practică regulat pentru a-ți
              consolida zonele slabe.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* ── Category bars ── */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-5">
            Scor pe categorii
          </p>
          <div className="space-y-5">
            {report.categories.map((cat, i) => {
              const cfg = CAT_CONFIG[i] ?? CAT_CONFIG[0];
              const CatIcon = cfg.Icon;
              return (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CatIcon className={cn("h-3.5 w-3.5 shrink-0", cfg.iconCls)} />
                      <span className="text-sm font-medium text-foreground">{cat.name}</span>
                    </div>
                    <span className={cn("text-sm font-bold tabular-nums", scoreTextColor(cat.score))}>
                      {cat.score}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={cn("h-full rounded-full", cfg.bar)}
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.score}%` }}
                      transition={{
                        duration: 0.85,
                        ease: "easeOut",
                        delay: 0.4 + i * 0.12,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Insights ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Puncte tari */}
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-800/60 p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                Puncte tari
              </span>
            </div>
            <ul className="space-y-2.5">
              {report.puncte_tari.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.85 + i * 0.1 }}
                  className="flex gap-2 text-sm text-emerald-700 dark:text-emerald-300"
                >
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span className="leading-snug">{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* De îmbunătățit */}
          <div className="rounded-xl bg-orange-50 dark:bg-orange-950/25 border border-orange-200 dark:border-orange-800/60 p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 shrink-0" />
              <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                De îmbunătățit
              </span>
            </div>
            <ul className="space-y-2.5">
              {report.de_imbunatatit.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.95 + i * 0.1 }}
                  className="flex gap-2 text-sm text-orange-700 dark:text-orange-300"
                >
                  <span className="text-orange-500 shrink-0 font-bold">→</span>
                  <span className="leading-snug">{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Actions ── */}
        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-3 rounded-xl transition text-sm"
        >
          <RotateCcw className="h-4 w-4" />
          Interviu nou
        </button>
      </div>
    </motion.div>
  );
}
