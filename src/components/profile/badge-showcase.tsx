"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { MagicCard } from "@/components/ui/magic-card";
import { cn } from "@/lib/utils";

export interface BadgeRow {
  slug: string;
  name: string;
  icon: string;
  description: string | null;
  earned: boolean;
  earnedAt: string | null;
}

interface BadgeShowcaseProps {
  badges: BadgeRow[];
}

export function BadgeShowcase({ badges }: BadgeShowcaseProps) {
  const earnedCount = badges.filter((b) => b.earned).length;
  const totalCount = badges.length;
  const percent = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  // Earned badges first, then locked
  const sorted = [...badges].sort((a, b) => {
    if (a.earned !== b.earned) return a.earned ? -1 : 1;
    return a.name.localeCompare(b.name, "ro");
  });

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
        <div>
          <h2 className="text-lg font-bold text-foreground">Insigne</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {earnedCount}/{totalCount} câștigate
          </p>
        </div>
        <span className="text-sm font-semibold text-aurora-primary-400 tabular-nums">
          {percent}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden mb-6">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-aurora-primary-500 to-aurora-accent-500"
        />
      </div>

      {totalCount === 0 ? (
        <p className="text-sm text-muted-foreground italic text-center py-8">
          Niciun badge disponibil momentan.
        </p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {sorted.map((badge, i) => (
            <motion.div
              key={badge.slug}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.3,
                delay: Math.min(i * 0.02, 0.6),
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative"
              title={
                badge.earned
                  ? badge.description ?? badge.name
                  : "Blocat — completează acțiunea pentru a debloca"
              }
            >
              <MagicCard
                className={cn(
                  "p-3 flex flex-col items-center text-center gap-1.5 transition-all",
                  badge.earned
                    ? "bg-card border border-aurora-primary-500/15 hover:border-aurora-primary-500/40"
                    : "bg-muted/30 border border-border opacity-50 hover:opacity-70"
                )}
                gradientSize={120}
                gradientFrom={badge.earned ? "#6C5CE7" : "#888888"}
                gradientTo={badge.earned ? "#00CEC9" : "#666666"}
                gradientOpacity={badge.earned ? 0.6 : 0.2}
              >
                <div
                  className={cn(
                    "text-3xl leading-none transition-all",
                    badge.earned ? "" : "grayscale opacity-50"
                  )}
                  aria-hidden
                >
                  {badge.icon}
                </div>
                <p
                  className={cn(
                    "text-[10px] font-semibold leading-tight line-clamp-2 mt-0.5",
                    badge.earned ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {badge.name}
                </p>
                {!badge.earned && (
                  <Lock className="absolute top-1.5 right-1.5 h-3 w-3 text-muted-foreground/60" />
                )}
              </MagicCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
