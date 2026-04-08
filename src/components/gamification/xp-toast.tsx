"use client";

import { motion, AnimatePresence } from "framer-motion";

interface XPToastProps {
  xp: number;
  show: boolean;
}

export function XPToast({ xp, show }: XPToastProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.8 }}
          animate={{ opacity: 1, y: -30, scale: 1 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.6 }}
          className="fixed bottom-24 right-8 z-50 pointer-events-none"
        >
          <span className="text-2xl font-black text-primary drop-shadow-lg">
            +{xp} XP
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
