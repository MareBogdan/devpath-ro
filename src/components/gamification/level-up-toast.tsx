"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CosmoMascot } from "@/components/mascot/cosmo-mascot";

interface LevelUpToastProps {
  show: boolean;
  newLevel: number;
  newLevelName: string;
  unlockText: string;
  onDismiss: () => void;
}

export function LevelUpToast({
  show,
  newLevel,
  newLevelName,
  unlockText,
  onDismiss,
}: LevelUpToastProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-4 rounded-2xl bg-card border border-primary/40 shadow-xl px-5 py-4 max-w-sm"
        >
          <CosmoMascot emotion="celebrating" size={56} />
          <div>
            <p className="text-xs font-medium text-primary uppercase tracking-wide">
              Level {newLevel} atins!
            </p>
            <p className="text-lg font-bold text-foreground">{newLevelName}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{unlockText}</p>
          </div>
          <button
            onClick={onDismiss}
            className="ml-2 text-muted-foreground hover:text-foreground"
            aria-label="Închide"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
