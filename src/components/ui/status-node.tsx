"use client";

import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type NodeStatus = "completed" | "current" | "locked";
type NodeSize = "sm" | "md" | "lg";

interface StatusNodeProps {
  status: NodeStatus;
  icon?: LucideIcon;
  label?: string;
  sublabel?: string;
  onClick?: () => void;
  size?: NodeSize;
  className?: string;
  index?: number; // for stagger delay
}

const SIZE_CONFIG = {
  sm: { circle: 40, iconSize: 16, fontSize: "text-xs", labelGap: "mt-1.5" },
  md: { circle: 56, iconSize: 22, fontSize: "text-sm", labelGap: "mt-2" },
  lg: { circle: 72, iconSize: 28, fontSize: "text-base", labelGap: "mt-2.5" },
};

// Sparkle particle positions around the node
const SPARKLE_POSITIONS = [
  { x: -18, y: -18, delay: 0 },
  { x: 18, y: -18, delay: 0.1 },
  { x: -20, y: 4, delay: 0.05 },
  { x: 20, y: 4, delay: 0.15 },
  { x: 0, y: -22, delay: 0.08 },
];

function SparkleParticle({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: "50%", top: "50%", marginLeft: x, marginTop: y }}
      initial={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration: 0.3, ease: "backOut" }}
    >
      <div
        className="w-1.5 h-1.5 rounded-full bg-aurora-gold-500"
        style={{
          boxShadow: "0 0 4px rgba(253,203,110,0.8)",
        }}
      />
    </motion.div>
  );
}

export function StatusNode({
  status,
  icon: Icon,
  label,
  sublabel,
  onClick,
  size = "md",
  className,
  index = 0,
}: StatusNodeProps) {
  const config = SIZE_CONFIG[size];
  const isClickable = status !== "locked" && !!onClick;

  return (
    <motion.div
      className={cn("relative flex flex-col items-center", className)}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: index * 0.08,
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
    >
      {/* Pulse rings for current status */}
      {status === "current" && (
        <>
          <motion.div
            className="absolute rounded-full border-2 border-aurora-primary-500/40"
            style={{
              width: config.circle + 16,
              height: config.circle + 16,
              top: -8,
              left: "50%",
              x: "-50%",
            }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute rounded-full border-2 border-aurora-primary-500/25"
            style={{
              width: config.circle + 32,
              height: config.circle + 32,
              top: -16,
              left: "50%",
              x: "-50%",
            }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2, delay: 0.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      {/* Main circle */}
      <motion.button
        onClick={isClickable ? onClick : undefined}
        disabled={status === "locked"}
        className={cn(
          "relative flex items-center justify-center rounded-full border-2 transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          status === "completed" && [
            "border-aurora-gold-500 bg-aurora-gold-500/15",
            "dark:bg-aurora-gold-500/20",
            isClickable && "cursor-pointer hover:scale-105 active:scale-95",
          ],
          status === "current" && [
            "border-aurora-primary-500 bg-aurora-primary-500/15",
            "dark:bg-aurora-primary-500/20",
            "scale-110",
            isClickable && "cursor-pointer active:scale-100",
          ],
          status === "locked" && [
            "border-border bg-muted/50 cursor-not-allowed opacity-60",
          ]
        )}
        style={{ width: config.circle, height: config.circle }}
        whileHover={
          isClickable
            ? { scale: status === "current" ? 1.15 : 1.08 }
            : undefined
        }
        whileTap={isClickable ? { scale: 0.95 } : undefined}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        aria-label={label}
      >
        {/* Sparkle particles (completed, on hover) */}
        {status === "completed" &&
          SPARKLE_POSITIONS.map((pos, i) => (
            <SparkleParticle key={i} {...pos} />
          ))}

        {/* Gold shimmer overlay for completed */}
        {status === "completed" && (
          <div
            className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
            aria-hidden
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background:
                  "linear-gradient(135deg, transparent 30%, rgba(253,203,110,0.35) 60%, transparent 80%)",
              }}
            />
          </div>
        )}

        {/* Icon */}
        {status === "completed" ? (
          <Check
            style={{ width: config.iconSize, height: config.iconSize }}
            className="text-aurora-gold-500 stroke-[2.5]"
          />
        ) : status === "locked" ? (
          <Lock
            style={{ width: config.iconSize, height: config.iconSize }}
            className="text-muted-foreground"
          />
        ) : Icon ? (
          <Icon
            style={{ width: config.iconSize, height: config.iconSize }}
            className="text-aurora-primary-500"
          />
        ) : (
          <div
            style={{ width: config.iconSize * 0.4, height: config.iconSize * 0.4 }}
            className="rounded-full bg-aurora-primary-500"
          />
        )}
      </motion.button>

      {/* Label */}
      {label && (
        <div className={cn("text-center", config.labelGap)}>
          <p
            className={cn(
              "font-semibold leading-snug",
              config.fontSize,
              status === "completed" && "text-foreground",
              status === "current" && "text-aurora-primary-500",
              status === "locked" && "text-muted-foreground"
            )}
          >
            {label}
          </p>
          {sublabel && (
            <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>
          )}
        </div>
      )}
    </motion.div>
  );
}
