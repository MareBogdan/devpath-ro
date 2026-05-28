"use client";

import { Trophy, Flame, Award, BookOpen } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";

interface ProfileStatsRowProps {
  totalXP: number;
  streakCount: number;
  badgesEarned: number;
  totalBadges: number;
  lessonsCompleted: number;
  totalLessons: number;
}

export function ProfileStatsRow({
  totalXP,
  streakCount,
  badgesEarned,
  totalBadges,
  lessonsCompleted,
  totalLessons,
}: ProfileStatsRowProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <StatCard
        icon={Trophy}
        label="XP Total"
        value={totalXP}
        color="gold"
        size="md"
      />
      <StatCard
        icon={Flame}
        label="Streak"
        value={streakCount}
        color="streak"
        size="md"
        subtitle={streakCount === 1 ? "zi consecutivă" : "zile consecutive"}
      />
      <StatCard
        icon={Award}
        label="Insigne"
        value={badgesEarned}
        color="accent"
        size="md"
        subtitle={`din ${totalBadges}`}
      />
      <StatCard
        icon={BookOpen}
        label="Lecții"
        value={lessonsCompleted}
        color="primary"
        size="md"
        subtitle={`din ${totalLessons}`}
      />
    </div>
  );
}
