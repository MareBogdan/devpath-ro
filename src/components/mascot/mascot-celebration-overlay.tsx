"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import confetti from "canvas-confetti";
import { CosmoMascot } from "./cosmo-mascot";
import type { AwardedBadge } from "@/lib/gamification-constants";
import { LEVEL_UNLOCK_TEXT } from "@/lib/gamification-constants";
import { safeConfetti } from "@/components/gamification/gamification-boundary";

interface MascotCelebrationOverlayProps {
  show: boolean;
  xp: number;
  leveledUp: boolean;
  newLevel: number;
  newLevelName: string;
  badges: AwardedBadge[];
  onDismiss: () => void;
}

export function MascotCelebrationOverlay({
  show,
  xp,
  leveledUp,
  newLevel,
  newLevelName,
  badges,
  onDismiss,
}: MascotCelebrationOverlayProps) {
  useEffect(() => {
    if (!show) return;
    safeConfetti(() => confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } }));
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={onDismiss}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 20 }}
            className="flex flex-col items-center gap-4 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <CosmoMascot
              emotion={leveledUp ? "celebrating" : "excited"}
              size={160}
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <p className="text-4xl font-black text-foreground">Știam eu că poți!</p>
              <p className="text-primary font-bold text-xl mt-1">+{xp} XP</p>
            </motion.div>

            {leveledUp && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="rounded-2xl border border-primary bg-primary/10 px-6 py-3 text-center"
              >
                <p className="text-xs uppercase tracking-widest text-primary font-medium">
                  Level Up!
                </p>
                <p className="text-2xl font-black text-foreground mt-1">{newLevelName}</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {LEVEL_UNLOCK_TEXT[newLevel]}
                </p>
              </motion.div>
            )}

            {badges.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex gap-2 flex-wrap justify-center"
              >
                {badges.map((b) => (
                  <div
                    key={b.slug}
                    className="flex items-center gap-2 rounded-xl border border-yellow-400/40 bg-yellow-50/10 px-3 py-1.5"
                  >
                    <span>{b.icon}</span>
                    <span className="text-sm font-medium">{b.name}</span>
                  </div>
                ))}
              </motion.div>
            )}

            <button
              onClick={onDismiss}
              className="mt-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Continuă →
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
