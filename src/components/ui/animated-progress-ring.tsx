"use client";

import { useEffect, useId } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

type RingSize = "sm" | "md" | "lg" | "xl";
type RingColor = "primary" | "accent" | "gold" | "streak" | "success";

interface AnimatedProgressRingProps {
  value: number;             // 0–100
  size?: RingSize | number;  // preset or exact px
  strokeWidth?: number;
  color?: RingColor;
  showLabel?: boolean;
  labelContent?: React.ReactNode; // overrides default percentage label
  animate?: boolean;
  className?: string;
  trackOpacity?: number;     // 0–1, default 0.15
}

const SIZES: Record<RingSize, number> = { sm: 40, md: 64, lg: 96, xl: 128 };

const COLOR_MAP: Record<RingColor, { from: string; to: string }> = {
  primary: { from: "#6C5CE7", to: "#A29BFE" },
  accent:  { from: "#00CEC9", to: "#81ECEC" },
  gold:    { from: "#FDCB6E", to: "#E17055" },
  streak:  { from: "#FF6B6B", to: "#EB4D4B" },
  success: { from: "#10B981", to: "#34D399" },
};

export function AnimatedProgressRing({
  value,
  size = "md",
  strokeWidth,
  color = "primary",
  showLabel = false,
  labelContent,
  animate = true,
  className,
  trackOpacity = 0.15,
}: AnimatedProgressRingProps) {
  const px = typeof size === "number" ? size : SIZES[size];
  const sw = strokeWidth ?? Math.max(3, px * 0.07);
  const radius = (px - sw) / 2;
  const circumference = 2 * Math.PI * radius;
  const gradientId = useId().replace(/:/g, "");

  // Animated dashoffset via spring
  const targetOffset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;
  const offset = useMotionValue(animate ? circumference : targetOffset);
  const springOffset = useSpring(offset, { stiffness: 80, damping: 20, mass: 0.8 });

  useEffect(() => {
    offset.set(targetOffset);
  }, [targetOffset, offset]);

  const { from, to } = COLOR_MAP[color];

  const fontSize =
    typeof size === "number"
      ? Math.max(10, size * 0.22)
      : { sm: 10, md: 14, lg: 20, xl: 28 }[size];

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: px, height: px }}
    >
      <svg
        width={px}
        height={px}
        viewBox={`0 0 ${px} ${px}`}
        style={{ transform: "rotate(-90deg)" }}
        aria-label={`Progress: ${Math.round(value)}%`}
        role="img"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>

        {/* Track */}
        <circle
          cx={px / 2}
          cy={px / 2}
          r={radius}
          stroke={from}
          strokeOpacity={trackOpacity}
          strokeWidth={sw}
          fill="none"
        />

        {/* Animated fill */}
        <motion.circle
          cx={px / 2}
          cy={px / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={sw}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={springOffset}
          strokeLinecap="round"
        />
      </svg>

      {/* Center label */}
      {showLabel && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ fontSize, fontWeight: 700, color: from, lineHeight: 1 }}
        >
          {labelContent ?? `${Math.round(value)}%`}
        </div>
      )}
    </div>
  );
}
