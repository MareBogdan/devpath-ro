"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CosmoMascot } from "@/components/mascot/cosmo-mascot";

const STREAK_MESSAGES: Record<number, string> = {
  3:   "3 zile la rând! Obișnuințele se formează în 21 de zile — ești la start.",
  7:   "7 zile la rând! Ești de neoprit!",
  14:  "14 zile consecutive. La această rată, în 6 luni vei ști mai mult despre AI decât 95% din România.",
  30:  "30 de zile la rând. Aceasta nu mai e o încercare — e cine ești tu acum.",
  100: "100 de zile consecutive. Într-un an de azi, vei privi înapoi la această zi.",
};

interface StreakToastProps {
  show: boolean;
  streakCount: number;
  onDismiss: () => void;
}

export function StreakToast({ show, streakCount, onDismiss }: StreakToastProps) {
  const message = STREAK_MESSAGES[streakCount] ?? `${streakCount} zile la rând!`;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-4 rounded-2xl bg-card border border-orange-400/40 shadow-xl px-5 py-4 max-w-sm"
        >
          <CosmoMascot emotion="excited" size={56} />
          <div className="flex-1">
            <p className="text-xs font-medium text-orange-500 uppercase tracking-wide">
              🔥 Streak {streakCount} zile
            </p>
            <p className="text-sm text-foreground mt-0.5">{message}</p>
          </div>
          <button
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Închide"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
