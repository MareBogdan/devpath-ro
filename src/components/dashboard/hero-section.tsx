"use client";

import { motion } from "framer-motion";
import { Flame, Trophy, BookOpen, Star } from "lucide-react";
import { LEVEL_NAMES, LEVEL_THRESHOLDS } from "@/lib/gamification-constants";
import { AbsenceMascot } from "@/components/dashboard/absence-mascot";
import { DotPattern } from "@/components/ui/dot-pattern";
import { Meteors } from "@/components/ui/meteors";
import { ShineBorder } from "@/components/ui/shine-border";
import { NumberTicker } from "@/components/ui/number-ticker";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { Tooltip } from "@/components/ui/tooltip";

interface HeroSectionProps {
  userName: string;
  xpPoints: number;
  level: number;
  streakCount: number;
  lessonsCompleted: number;
  totalLessons: number;
  daysAbsent: number;
  lastLessonTitle: string | null;
  lastLessonHref: string | null;
  weeklyDots: boolean[];
}

function getStreakSubtext(streak: number): string {
  if (streak === 0) return "Azi e ziua perfectă să începi.";
  if (streak <= 2) return "Ești pe drumul cel bun. Continuă!";
  if (streak <= 6) return `Impresionant! ${streak} zile la rând!`;
  return `Ești de neoprit! ${streak} zile consecutive!`;
}

const DAY_LABELS = ["L", "Ma", "Mi", "J", "V", "S", "D"];

const statCardVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

export function HeroSection(props: HeroSectionProps) {
  const {
    userName,
    xpPoints,
    level,
    streakCount,
    lessonsCompleted,
    totalLessons,
    daysAbsent,
    lastLessonTitle,
    lastLessonHref,
    weeklyDots,
  } = props;

  const streakSubtext = getStreakSubtext(streakCount);
  const levelName = LEVEL_NAMES[level] ?? "Curios";
  const currentThreshold = LEVEL_THRESHOLDS[level] ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[level + 1] ?? LEVEL_THRESHOLDS[10];
  const xpInLevel = xpPoints - currentThreshold;
  const xpNeeded = nextThreshold - currentThreshold;
  const progressPercent = xpNeeded > 0 ? Math.min(100, Math.round((xpInLevel / xpNeeded) * 100)) : 100;

  const stats = [
    { label: "XP", value: xpPoints, displayValue: xpPoints.toLocaleString(), color: "text-aurora-gold-500", bgColor: "bg-aurora-gold-500/10", icon: Trophy, useTicker: true, accent: "aurora-stat-accent-gold" },
    { label: "Streak", value: streakCount, displayValue: streakCount.toString(), color: "text-aurora-streak-500", bgColor: "bg-aurora-streak-500/10", icon: Flame, useTicker: true, accent: "aurora-stat-accent-streak" },
    { label: "Lecții", value: 0, displayValue: `${lessonsCompleted}/${totalLessons}`, color: "text-aurora-accent-500", bgColor: "bg-aurora-accent-500/10", icon: BookOpen, useTicker: false, accent: "aurora-stat-accent-accent" },
    { label: "Nivel", value: 0, displayValue: levelName, color: "text-aurora-primary-300", bgColor: "bg-aurora-primary-500/10", icon: Star, useTicker: false, accent: "aurora-stat-accent-primary" },
  ];

  return (
    <motion.section
      id="hero"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative min-h-[500px] flex items-center justify-center px-6 py-20 overflow-hidden"
    >
      {/* Aurora gradient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="aurora-blob-1"
          style={{ top: "-15%", left: "-10%", background: "rgba(108, 92, 231, 0.12)" }}
        />
        <div
          className="aurora-blob-2"
          style={{ bottom: "-10%", right: "-5%", background: "rgba(0, 206, 201, 0.10)" }}
        />
      </div>

      {/* MagicUI dot-pattern background */}
      <DotPattern
        width={20}
        height={20}
        cr={1}
        className="text-aurora-primary-500/20 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]"
      />

      {/* Constellation dot grid overlay */}
      <div className="constellation-dots" aria-hidden="true" />

      {/* MagicUI meteors — behind content */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <Meteors number={12} minDuration={3} maxDuration={8} className="opacity-30" />
      </div>

      {/* Floating particles — pure CSS */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className="absolute rounded-full bg-aurora-primary-300 animate-float-up"
            style={{
              width: `${3 + (i % 3)}px`,
              height: `${3 + (i % 3)}px`,
              left: `${10 + i * 15}%`,
              bottom: `-10px`,
              opacity: 0.15 + (i % 3) * 0.075,
              animationDuration: `${6 + i * 0.5}s`,
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}
      </div>

      <div className="w-full mx-auto relative z-10 max-sm:!max-w-full" style={{ maxWidth: "min(75%, 1000px)" }}>
        {/* Absence mascot */}
        <AbsenceMascot
          daysAbsent={daysAbsent}
          lastLessonTitle={lastLessonTitle}
          lastLessonHref={lastLessonHref}
        />

        {/* Streak-at-risk banner */}
        {streakCount > 0 && !weeklyDots[(new Date().getDay() + 6) % 7] && (
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-aurora-streak-500/10 border border-aurora-streak-500/25 text-aurora-streak-500 text-xs font-medium"
            style={{ animation: "pulse 2.5s ease-in-out infinite" }}>
            ⚡ Streak în pericol! Fă o lecție azi
          </div>
        )}

        {/* Greeting with animated gradient text */}
        <h2 className="text-3xl font-bold mb-2">
          <AnimatedGradientText
            speed={1.5}
            colorFrom="#A29BFE"
            colorTo="#00CEC9"
            className="text-3xl font-bold"
          >
            Hai să învățăm, {userName}!
          </AnimatedGradientText>
        </h2>
        <p className="text-sm text-aurora-text-secondary">{streakSubtext}</p>

        {/* Continue chip — shown for all users with a last lesson */}
        {lastLessonHref && lastLessonTitle && daysAbsent < 2 && (
          <div className="mt-3">
            <a
              href={lastLessonHref}
              className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 max-sm:py-2.5 rounded-full bg-aurora-primary-500/10 border border-aurora-primary-500/20 text-aurora-primary-300 hover:bg-aurora-primary-500/20 transition-colors"
            >
              ▶ Continuă:{" "}
              <span className="max-w-[180px] truncate">
                {lastLessonTitle}
              </span>
            </a>
          </div>
        )}

        {/* Stat cards with shine-border and number-ticker */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                custom={i}
                variants={statCardVariant}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className={`relative rounded-[14px] bg-aurora-bg-card border border-aurora-border-medium p-5 ${stat.accent}`}
              >
                <ShineBorder
                  shineColor={["#6C5CE7", "#00CEC9"]}
                  borderWidth={1}
                  duration={10}
                />
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor} ${stat.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium text-aurora-text-tertiary uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
                <p className={`text-2xl max-sm:text-xl font-bold ${stat.color}`}>
                  {stat.useTicker ? (
                    <NumberTicker value={stat.value} className={stat.color} />
                  ) : (
                    stat.displayValue
                  )}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* XP progress bar toward next level */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-aurora-text-tertiary">
              Nivel {level} — {levelName}
            </span>
            <div className="flex items-center gap-2">
              {progressPercent >= 80 && level < 10 && (
                <span className="text-[10px] font-semibold text-aurora-gold-500 px-1.5 py-0.5 rounded-full bg-aurora-gold-500/10">
                  🔥 Aproape de nivelul următor!
                </span>
              )}
              <span className="text-xs text-aurora-text-tertiary">
                {level < 10 ? `${xpPoints.toLocaleString()} / ${nextThreshold.toLocaleString()} XP` : "Max level"}
              </span>
            </div>
          </div>
          <div className="h-2 rounded-full bg-aurora-border-subtle overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-aurora-primary-500 to-aurora-accent-500 rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: `${progressPercent}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            />
          </div>
        </div>

        {/* Weekly streak dots with tooltips */}
        <div className="mt-6 flex items-center justify-center gap-3">
          {DAY_LABELS.map((day, i) => {
            const done = weeklyDots[i];
            const isToday = i === (new Date().getDay() + 6) % 7;
            const tipText = done ? "Lecție completată" : isToday ? "Azi — fă o lecție!" : "Zi ratată";
            return (
              <Tooltip key={day} content={tipText} delayDuration={300}>
                <div className="flex flex-col items-center gap-1.5 cursor-default">
                  <div
                    className={`h-7 w-7 rounded-full border-2 transition-colors ${
                      done
                        ? "bg-aurora-streak-500 border-aurora-streak-500"
                        : isToday
                        ? "bg-transparent border-aurora-primary-400"
                        : "bg-transparent border-aurora-text-tertiary/50"
                    }`}
                    style={isToday && !done ? { animation: "pulse-glow 2.5s ease-in-out infinite" } : undefined}
                  />
                  <span className={`text-[10px] font-medium ${isToday ? "text-aurora-primary-300" : "text-aurora-text-tertiary"}`}>{day}</span>
                </div>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
