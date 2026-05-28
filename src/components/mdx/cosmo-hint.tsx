"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CosmoMascot,
  type CosmoEmotion,
} from "@/components/mascot/cosmo-mascot";

const COSMO_EMOTIONS: readonly CosmoEmotion[] = [
  "happy",
  "excited",
  "thinking",
  "encouraging",
  "celebrating",
  "sleeping",
  "waving",
  "sad",
];

/** Coerces an arbitrary MDX string prop to a valid CosmoEmotion. */
function resolveEmotion(value?: string): CosmoEmotion {
  return COSMO_EMOTIONS.includes(value as CosmoEmotion)
    ? (value as CosmoEmotion)
    : "encouraging";
}

/**
 * CosmoHint — un sfat livrat de mascota Cosmo în MDX-ul lecției.
 * Cosmo face un mic bounce la montare; bula de dialog are o codiță
 * care arată spre mascotă.
 */
export function CosmoHint({
  emotion,
  children,
}: {
  emotion?: string;
  children?: ReactNode;
}) {
  const reduced = useReducedMotion();

  return (
    <div className="mt-7 mb-6 flex items-start gap-3">
      <motion.div
        className="shrink-0"
        initial={reduced ? false : { y: 10, scale: 0.85, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 14 }}
      >
        <CosmoMascot emotion={resolveEmotion(emotion)} size={84} />
      </motion.div>

      <div className="relative mt-3 min-w-0 flex-1 rounded-2xl border border-[#6C5CE7]/25 bg-[color:var(--aurora-bg-card)] p-4 text-foreground/90 shadow-[0_8px_24px_-12px_rgba(108,92,231,0.5)] [&>:first-child]:mt-0 [&>:last-child]:mb-0">
        {/* codiță triunghiulară, centrată vertical, îndreptată spre Cosmo */}
        <span
          aria-hidden
          className="absolute -left-2 top-1/2 h-0 w-0 -translate-y-1/2 border-y-8 border-r-8 border-y-transparent border-r-[color:var(--aurora-bg-card)]"
        />
        {children}
      </div>
    </div>
  );
}
