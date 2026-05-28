"use client";

import { useEffect, useId } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface AvatarLevelRingProps {
  src: string | null;
  name: string;
  level: number;
  levelProgressPercent: number;  // 0–100 within current level
  size?: number;                  // px, default 80
  strokeWidth?: number;
  className?: string;
  showLevelBadge?: boolean;
}

export function AvatarLevelRing({
  src,
  name,
  level,
  levelProgressPercent,
  size = 80,
  strokeWidth = 4,
  className,
  showLevelBadge = true,
}: AvatarLevelRingProps) {
  const gradId = useId().replace(/:/g, "");
  // The ring SVG is larger to fit the stroke cleanly
  const svgSize = size + strokeWidth * 2;
  const cx = svgSize / 2;
  const cy = svgSize / 2;
  const radius = size / 2;
  const circumference = 2 * Math.PI * radius;
  const targetOffset =
    circumference - (Math.min(100, Math.max(0, levelProgressPercent)) / 100) * circumference;

  const offset = useMotionValue(circumference);
  const springOffset = useSpring(offset, { stiffness: 70, damping: 20 });

  useEffect(() => {
    offset.set(targetOffset);
  }, [targetOffset, offset]);

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn("relative inline-flex items-center justify-center shrink-0", className)}
      style={{ width: svgSize, height: svgSize }}
    >
      {/* SVG ring sits on top of the avatar */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={svgSize}
        height={svgSize}
        style={{ transform: "rotate(-90deg)" }}
        aria-hidden
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6C5CE7" />
            <stop offset="100%" stopColor="#00CEC9" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="#6C5CE7"
          strokeOpacity={0.15}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Animated progress arc */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={springOffset}
          strokeLinecap="round"
        />
      </svg>

      {/* Avatar image / initials */}
      <div
        className="relative rounded-full overflow-hidden bg-muted flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {src ? (
          <Image
            src={src}
            alt={name}
            width={size}
            height={size}
            className="object-cover w-full h-full"
            unoptimized
          />
        ) : (
          <span
            className="font-bold text-aurora-primary-500 select-none"
            style={{ fontSize: size * 0.28 }}
          >
            {initials}
          </span>
        )}
      </div>

      {/* Level badge */}
      {showLevelBadge && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.5 }}
          className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full bg-aurora-primary-500 text-white font-bold shadow-lg"
          style={{
            width: Math.round(size * 0.32),
            height: Math.round(size * 0.32),
            fontSize: Math.round(size * 0.13),
            border: "2px solid hsl(var(--background))",
            minWidth: 18,
            minHeight: 18,
          }}
          aria-label={`Level ${level}`}
        >
          {level}
        </motion.div>
      )}
    </div>
  );
}
