"use client";

import { motion } from "framer-motion";
import { Trophy, Star, Zap } from "lucide-react";
import { CosmoMascot } from "@/components/mascot/cosmo-mascot";
import { cn } from "@/lib/utils";

interface MinigameResultScreenProps {
  score: number;
  isPerfect: boolean;
  xpEarned: number;
  onClose: () => void;
}

export function MinigameResultScreen({
  score,
  isPerfect,
  xpEarned,
  onClose,
}: MinigameResultScreenProps) {
  const passed = score >= 60;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="flex flex-col items-center gap-6 py-6 text-center"
    >
      <CosmoMascot
        emotion={isPerfect ? "celebrating" : passed ? "celebrating" : "encouraging"}
        size={100}
      />

      <div>
        <h3 className={cn(
          "text-2xl font-bold",
          isPerfect ? "text-amber-500" : passed ? "text-green-600 dark:text-green-400" : "text-foreground"
        )}>
          {isPerfect ? "Perfect! 🎉" : passed ? "Bine făcut!" : "Continuă să exersezi!"}
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          {isPerfect
            ? "Ai răspuns corect la tot — impresionant!"
            : passed
            ? "Ai trecut mini-jocul cu succes."
            : "Nu ai atins 60% — mai încearcă după lecție!"}
        </p>
      </div>

      {/* Score display */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center gap-1">
          <div className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold border-2",
            isPerfect
              ? "bg-amber-50 border-amber-400 text-amber-600 dark:bg-amber-950/40"
              : passed
              ? "bg-green-50 border-green-400 text-green-600 dark:bg-green-950/40"
              : "bg-muted border-border text-foreground"
          )}>
            {score}
          </div>
          <span className="text-xs text-muted-foreground">Scor %</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/30 text-primary font-bold text-xl gap-0.5">
            <Zap className="h-4 w-4" />
            {xpEarned}
          </div>
          <span className="text-xs text-muted-foreground">XP câștigat</span>
        </div>

        {isPerfect && (
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 border-2 border-amber-400 dark:bg-amber-950/40">
              <Star className="h-7 w-7 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-xs text-muted-foreground">Perfect!</span>
          </div>
        )}
      </div>

      <button
        onClick={onClose}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 active:scale-[0.98]"
      >
        <Trophy className="h-4 w-4" />
        Continuă lecția
      </button>
    </motion.div>
  );
}
