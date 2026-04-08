"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { AwardedBadge } from "@/lib/gamification-constants";

interface BadgeToastProps {
  badge: AwardedBadge | null;
  onDismiss: () => void;
}

export function BadgeToast({ badge, onDismiss }: BadgeToastProps) {
  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-6 left-6 z-50 flex items-center gap-4 rounded-2xl bg-card border border-yellow-400/40 shadow-xl px-5 py-4 max-w-sm"
        >
          <span className="text-4xl select-none" aria-hidden="true">
            {badge.icon}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-yellow-500 uppercase tracking-wide">
              Badge deblocat!
            </p>
            <p className="text-base font-bold text-foreground truncate">{badge.name}</p>
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
              {badge.description}
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="ml-2 text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Închide"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
