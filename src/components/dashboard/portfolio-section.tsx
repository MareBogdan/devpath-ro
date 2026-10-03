"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star, Flame, Trophy, Award } from "lucide-react";
import { MagicCard } from "@/components/ui/magic-card";
import { ShineBorder } from "@/components/ui/shine-border";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip } from "@/components/ui/tooltip";
import { LEVEL_NAMES } from "@/lib/gamification-constants";

interface EarnedBadgeIcon {
  slug: string;
  name: string;
  icon: string;
}

interface PortfolioSectionProps {
  userName: string;
  avatarUrl: string | null;
  level: number;
  xpPoints: number;
  streakCount: number;
  badgesEarned: number;
  totalBadges: number;
  earnedBadgeIcons?: EarnedBadgeIcon[];
  completedCourseNames?: string[];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function PortfolioSection(props: PortfolioSectionProps) {
  const {
    userName,
    avatarUrl,
    level,
    xpPoints,
    streakCount,
    badgesEarned,
    totalBadges,
    earnedBadgeIcons = [],
    completedCourseNames = [],
  } = props;
  const levelName = LEVEL_NAMES[level] ?? "Curios";

  return (
    <motion.section
      id="portofoliu"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative min-h-[500px] flex items-center justify-center px-6 py-20 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="aurora-blob-1"
          style={{ top: "20%", left: "-10%", background: "rgba(108, 92, 231, 0.06)" }}
        />
      </div>

      <div className="w-full mx-auto relative z-10 max-sm:!max-w-full" style={{ maxWidth: "min(75%, 1000px)" }}>
        <h2 className="text-2xl font-bold mb-8">
          <AnimatedGradientText speed={1} colorFrom="#6C5CE7" colorTo="#00CEC9" className="text-2xl font-bold">
            Portofoliu
          </AnimatedGradientText>
        </h2>

        <Link
          href="/profile"
          className="block relative rounded-[14px] overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.005]"
        >
          <MagicCard
            gradientSize={250}
            gradientColor="rgba(108, 92, 231, 0.15)"
            gradientFrom="#6C5CE7"
            gradientTo="#00CEC9"
            className="rounded-[14px] bg-aurora-bg-card border border-aurora-border-medium"
          >
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-aurora-primary-500 to-aurora-accent-500 z-50" />
            <ShineBorder shineColor={["#6C5CE7", "#00CEC9"]} borderWidth={1} duration={12} />

            <div className="p-6 pt-7">
              {/* Avatar + name */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="absolute inset-[-3px] rounded-full ring-2 ring-aurora-primary-500/30 ring-offset-2 ring-offset-aurora-bg-deepest pointer-events-none" />
                  <div
                    className="absolute inset-[-7px] rounded-full border-2 border-dashed border-aurora-accent-500/25 pointer-events-none"
                    style={{ animation: "avatar-ring-spin 20s linear infinite" }}
                  />
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={avatarUrl ?? undefined} alt={userName} />
                    <AvatarFallback className="text-lg bg-aurora-primary-500 text-white">
                      {getInitials(userName)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-semibold text-aurora-text-primary">{userName}</h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-aurora-primary-500/15 text-aurora-primary-300">
                      <Star className="h-3 w-3" />
                      Niv. {level}
                    </span>
                  </div>
                  <p className="text-sm text-aurora-primary-300 mt-0.5">{levelName}</p>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="rounded-[10px] bg-aurora-gold-500/8 border border-aurora-gold-500/15 p-3 text-center">
                  <Trophy className="h-4 w-4 text-aurora-gold-500 mx-auto mb-1" />
                  <p className="text-base font-bold text-aurora-text-primary">{xpPoints.toLocaleString()}</p>
                  <p className="text-[10px] text-aurora-text-tertiary">XP</p>
                </div>
                <div className="rounded-[10px] bg-aurora-streak-500/8 border border-aurora-streak-500/15 p-3 text-center">
                  <Flame className="h-4 w-4 text-aurora-streak-500 mx-auto mb-1" />
                  <p className="text-base font-bold text-aurora-text-primary">{streakCount}</p>
                  <p className="text-[10px] text-aurora-text-tertiary">Streak</p>
                </div>
                <div className="rounded-[10px] bg-aurora-accent-500/8 border border-aurora-accent-500/15 p-3 text-center">
                  <Award className="h-4 w-4 text-aurora-accent-500 mx-auto mb-1" />
                  <p className="text-base font-bold text-aurora-text-primary">
                    {badgesEarned}/{totalBadges}
                  </p>
                  <p className="text-[10px] text-aurora-text-tertiary">Badge-uri</p>
                </div>
                <div className="rounded-[10px] bg-aurora-primary-500/8 border border-aurora-primary-500/15 p-3 text-center">
                  <Star className="h-4 w-4 text-aurora-primary-300 mx-auto mb-1" />
                  <p className="text-base font-bold text-aurora-text-primary">{level}</p>
                  <p className="text-[10px] text-aurora-text-tertiary">Nivel</p>
                </div>
              </div>

              {/* Earned badge emojis */}
              {earnedBadgeIcons.length > 0 && (
                <div className="mb-5">
                  <p className="text-[10px] font-semibold text-aurora-text-tertiary uppercase tracking-wider mb-2">
                    Badge-uri câștigate
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {earnedBadgeIcons.slice(0, 8).map((badge) => (
                      <Tooltip key={badge.slug} content={badge.name} delayDuration={200}>
                        <div className="relative h-10 w-10 rounded-full bg-aurora-bg-deepest border border-aurora-border-medium flex items-center justify-center text-xl cursor-default overflow-hidden">
                          <ShineBorder shineColor={["#FDCB6E", "#A29BFE"]} borderWidth={1} duration={8} />
                          {badge.icon}
                        </div>
                      </Tooltip>
                    ))}
                    {badgesEarned > earnedBadgeIcons.slice(0, 8).length && (
                      <div className="h-10 w-10 rounded-full bg-aurora-bg-deepest border border-aurora-border-medium flex items-center justify-center text-xs font-semibold text-aurora-text-tertiary">
                        +{badgesEarned - earnedBadgeIcons.slice(0, 8).length}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Skills from completed courses */}
              {completedCourseNames.length > 0 && (
                <div className="mb-5">
                  <p className="text-[10px] font-semibold text-aurora-text-tertiary uppercase tracking-wider mb-2">
                    Skills dobândite
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {completedCourseNames.map((name) => (
                      <span
                        key={name}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-aurora-primary-500/10 border border-aurora-primary-500/20 text-aurora-primary-300 font-medium"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-center">
                <span className="inline-flex items-center gap-2 bg-aurora-primary-500 text-white font-semibold px-5 py-2.5 rounded-[10px]">
                  Deschide portofoliul
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </MagicCard>
        </Link>
      </div>
    </motion.section>
  );
}
