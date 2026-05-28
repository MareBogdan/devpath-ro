"use client";

import type { Variants, Transition } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Reduced-motion guard
// ─────────────────────────────────────────────────────────────────────────────

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// ─────────────────────────────────────────────────────────────────────────────
// Transition presets
// ─────────────────────────────────────────────────────────────────────────────

export const springBouncy: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 17,
  mass: 0.8,
};

export const springGentle: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 22,
  mass: 1,
};

export const smoothEase: Transition = {
  duration: 0.4,
  ease: [0.25, 0.46, 0.45, 0.94],
};

export const snappy: Transition = {
  duration: 0.2,
  ease: [0.16, 1, 0.3, 1],
};

export const slowFloat: Transition = {
  duration: 0.7,
  ease: [0.22, 1, 0.36, 1],
};

// ─────────────────────────────────────────────────────────────────────────────
// Fade variants
// ─────────────────────────────────────────────────────────────────────────────

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: prefersReducedMotion()
      ? { duration: 0 }
      : { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, y: 12, transition: snappy },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: prefersReducedMotion() ? { duration: 0 } : smoothEase,
  },
  exit: { opacity: 0, y: -12, transition: snappy },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: prefersReducedMotion() ? { duration: 0 } : smoothEase,
  },
  exit: { opacity: 0, x: -16, transition: snappy },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: prefersReducedMotion() ? { duration: 0 } : smoothEase,
  },
  exit: { opacity: 0, x: 16, transition: snappy },
};

// ─────────────────────────────────────────────────────────────────────────────
// Scale variants
// ─────────────────────────────────────────────────────────────────────────────

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: prefersReducedMotion() ? { duration: 0 } : smoothEase,
  },
  exit: { opacity: 0, scale: 0.92, transition: snappy },
};

export const scaleInBounce: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: prefersReducedMotion() ? { duration: 0 } : springBouncy,
  },
  exit: { opacity: 0, scale: 0.85, transition: snappy },
};

// ─────────────────────────────────────────────────────────────────────────────
// Slide variants
// ─────────────────────────────────────────────────────────────────────────────

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 48 },
  visible: {
    opacity: 1,
    x: 0,
    transition: prefersReducedMotion() ? { duration: 0 } : smoothEase,
  },
  exit: { opacity: 0, x: 32, transition: snappy },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -48 },
  visible: {
    opacity: 1,
    x: 0,
    transition: prefersReducedMotion() ? { duration: 0 } : smoothEase,
  },
  exit: { opacity: 0, x: -32, transition: snappy },
};

// ─────────────────────────────────────────────────────────────────────────────
// Stagger container
// ─────────────────────────────────────────────────────────────────────────────

export function staggerContainer(
  staggerDelay = 0.07,
  delayChildren = 0.1
): Variants {
  return {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: prefersReducedMotion()
        ? { staggerChildren: 0 }
        : { staggerChildren: staggerDelay, delayChildren },
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Pulse glow (infinite)
// ─────────────────────────────────────────────────────────────────────────────

export const pulseGlow: Variants = {
  animate: {
    boxShadow: [
      "0 0 0px rgba(108,92,231,0)",
      "0 0 16px rgba(108,92,231,0.4)",
      "0 0 0px rgba(108,92,231,0)",
    ],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Shimmer CSS string (for inline style use)
// ─────────────────────────────────────────────────────────────────────────────

export const shimmerStyle = {
  background:
    "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
  backgroundSize: "200% 100%",
  animation: "shimmer-sweep 1.5s ease-in-out infinite",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Confetti burst (uses canvas-confetti — already installed)
// ─────────────────────────────────────────────────────────────────────────────

export async function confettiBurst(
  variant: "xp" | "levelup" | "badge" | "streak" = "xp"
): Promise<void> {
  if (prefersReducedMotion()) return;

  const confetti = (await import("canvas-confetti")).default;

  const configs: Record<typeof variant, Parameters<typeof confetti>[0]> = {
    xp: {
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#FDCB6E", "#A29BFE", "#00CEC9"],
      scalar: 0.9,
    },
    badge: {
      particleCount: 100,
      spread: 80,
      origin: { y: 0.55 },
      colors: ["#FDCB6E", "#FFF8E7", "#E17055"],
      scalar: 1.1,
    },
    levelup: {
      particleCount: 150,
      spread: 120,
      origin: { y: 0.5 },
      colors: ["#6C5CE7", "#A29BFE", "#00CEC9", "#FDCB6E"],
      scalar: 1.2,
      startVelocity: 35,
    },
    streak: {
      particleCount: 80,
      spread: 60,
      angle: 90,
      origin: { y: 0.7, x: 0.5 },
      colors: ["#FF6B6B", "#EB4D4B", "#FDCB6E"],
      scalar: 0.95,
    },
  };

  confetti(configs[variant]);
}

// ─────────────────────────────────────────────────────────────────────────────
// useCountUp hook
// ─────────────────────────────────────────────────────────────────────────────

export function useCountUp(
  target: number,
  options: {
    duration?: number;
    delay?: number;
    decimals?: number;
    start?: number;
  } = {}
): number {
  const { duration = 1200, delay = 0, decimals = 0, start = 0 } = options;
  const [value, setValue] = useState(start);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }

    function startAnimation() {
      startTimeRef.current = null;

      function tick(now: number) {
        if (startTimeRef.current === null) startTimeRef.current = now;
        const elapsed = now - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = start + (target - start) * eased;
        setValue(Number(current.toFixed(decimals)));

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(tick);
        }
      }

      frameRef.current = requestAnimationFrame(tick);
    }

    const timeoutId = setTimeout(startAnimation, delay);

    return () => {
      clearTimeout(timeoutId);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration, delay, decimals, start]);

  return value;
}

// ─────────────────────────────────────────────────────────────────────────────
// Item variants (reusable child for stagger containers)
// ─────────────────────────────────────────────────────────────────────────────

export const itemFadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: prefersReducedMotion()
      ? { duration: 0 }
      : { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

export const itemScaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: prefersReducedMotion() ? { duration: 0 } : springBouncy,
  },
};
