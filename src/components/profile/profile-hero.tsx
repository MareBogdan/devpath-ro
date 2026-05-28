"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { AvatarLevelRing } from "@/components/ui/avatar-level-ring";
import { LEVEL_NAMES, LEVEL_THRESHOLDS } from "@/lib/gamification-constants";

interface ProfileHeroProps {
  name: string;
  email: string;
  avatarUrl: string | null;
  level: number;
  xpPoints: number;
  streakCount: number;
}

function computeLevelProgress(xp: number, level: number) {
  const currentThreshold = LEVEL_THRESHOLDS[level] ?? 0;
  const nextLevel = level + 1;
  const nextThreshold = LEVEL_THRESHOLDS[nextLevel];

  // Max level reached
  if (!nextThreshold) {
    return {
      percent: 100,
      xpInLevel: 0,
      xpNeededForLevel: 0,
      isMaxLevel: true,
      nextLevelName: "",
    };
  }

  const span = nextThreshold - currentThreshold;
  const progress = Math.max(0, Math.min(span, xp - currentThreshold));
  const percent = span > 0 ? Math.round((progress / span) * 100) : 0;

  return {
    percent,
    xpInLevel: progress,
    xpNeededForLevel: span,
    isMaxLevel: false,
    nextLevelName: LEVEL_NAMES[nextLevel] ?? "",
  };
}

export function ProfileHero({
  name,
  email,
  avatarUrl,
  level,
  xpPoints,
  streakCount,
}: ProfileHeroProps) {
  const levelName = LEVEL_NAMES[level] ?? "Curios";
  const { percent, xpInLevel, xpNeededForLevel, isMaxLevel, nextLevelName } =
    computeLevelProgress(xpPoints, level);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8"
    >
      {/* Aurora background blobs */}
      <div
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(108,92,231,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
        aria-hidden
      />
      <div
        className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(0,206,201,0.10) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
        aria-hidden
      />

      <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <AvatarLevelRing
          src={avatarUrl}
          name={name}
          level={level}
          levelProgressPercent={percent}
          size={104}
          strokeWidth={5}
        />

        <div className="flex-1 min-w-0 text-center sm:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-2xl sm:text-3xl font-bold leading-tight aurora-gradient-text"
          >
            {name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="text-sm text-muted-foreground mt-0.5 truncate"
          >
            {email}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-3 flex items-center gap-2 flex-wrap justify-center sm:justify-start"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-aurora-primary-500/10 border border-aurora-primary-500/20 px-3 py-1 text-xs font-semibold text-aurora-primary-400">
              {levelName} — Nivel {level}
            </span>
            {streakCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-aurora-streak-500/10 border border-aurora-streak-500/20 px-3 py-1 text-xs font-semibold text-aurora-streak-500">
                <Flame className="h-3.5 w-3.5" />
                {streakCount} {streakCount === 1 ? "zi" : "zile"}
              </span>
            )}
          </motion.div>

          {/* XP progress bar to next level */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.28 }}
            className="mt-5"
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">
                {isMaxLevel ? (
                  "Nivel maxim atins!"
                ) : (
                  <>
                    {xpInLevel.toLocaleString("ro-RO")} / {xpNeededForLevel.toLocaleString("ro-RO")} XP
                    <span className="text-muted-foreground/70"> către {nextLevelName}</span>
                  </>
                )}
              </span>
              <span className="font-semibold text-foreground tabular-nums">
                {xpPoints.toLocaleString("ro-RO")} XP
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-aurora-primary-500 to-aurora-accent-500"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
