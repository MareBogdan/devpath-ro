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

// Which page margin the hint floats into on wide screens (mirror of <WowNote>).
// Below 1440px it renders inline full-width (identical on mobile).
const SIDE_FLOAT: Record<"left" | "right", string> = {
  right:
    "min-[1360px]:float-right min-[1360px]:clear-right min-[1360px]:-mr-[336px]",
  left: "min-[1360px]:float-left min-[1360px]:clear-left min-[1360px]:-ml-[336px]",
};

/**
 * CosmoHint — un sfat livrat de mascota Cosmo, direct în MDX-ul lecției. Pe ecrane
 * late plutește într-o margine (ca notele contextuale), ca să umple lateralul și să
 * dea viață paginii; sub 1440px devine card inline pe toată lățimea.
 *
 * AUTHORING: `side="left"` / `side="right"` (implicit right). Formă string, pe linia
 * proprie în MDX.
 */
export function CosmoHint({
  emotion,
  side = "right",
  children,
}: {
  emotion?: string;
  side?: string;
  children?: ReactNode;
}) {
  const reduced = useReducedMotion();
  const float = SIDE_FLOAT[side === "left" ? "left" : "right"];

  return (
    <div className={`relative my-6 min-[1360px]:my-3 min-[1360px]:w-[300px] ${float}`}>
      <div className="relative rounded-2xl border border-[#6C5CE7]/30 bg-[color:var(--aurora-bg-card)] p-4 shadow-[0_8px_24px_-12px_rgba(108,92,231,0.5)]">
        <div className="mb-1.5 flex items-center gap-2">
          <motion.div
            className="shrink-0"
            initial={reduced ? false : { y: 8, scale: 0.85, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 14 }}
          >
            <CosmoMascot emotion={resolveEmotion(emotion)} size={58} />
          </motion.div>
          <span className="text-xs font-semibold uppercase tracking-wide text-[#A78BFA]">
            Cosmo
          </span>
        </div>
        <div className="text-sm leading-relaxed text-foreground/90 [&>:first-child]:mt-0 [&>:last-child]:mb-0">
          {children}
        </div>
      </div>
    </div>
  );
}
