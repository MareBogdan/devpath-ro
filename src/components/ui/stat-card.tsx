"use client";

import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCountUp } from "@/lib/animations";

type StatColor = "primary" | "accent" | "gold" | "streak" | "success" | "muted";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: StatColor;
  trend?: "up" | "down" | number; // number = percentage delta
  subtitle?: string;
  className?: string;
  animateValue?: boolean;
  size?: "sm" | "md" | "lg";
}

const COLOR_STYLES: Record<StatColor, { icon: string; value: string; bg: string; glow: string }> = {
  primary: {
    icon: "text-aurora-primary-500",
    value: "text-aurora-primary-500",
    bg: "bg-aurora-primary-500/10",
    glow: "hover:shadow-[0_4px_20px_rgba(108,92,231,0.2)]",
  },
  accent: {
    icon: "text-aurora-accent-500",
    value: "text-aurora-accent-500",
    bg: "bg-aurora-accent-500/10",
    glow: "hover:shadow-[0_4px_20px_rgba(0,206,201,0.2)]",
  },
  gold: {
    icon: "text-aurora-gold-500",
    value: "text-aurora-gold-500",
    bg: "bg-aurora-gold-500/10",
    glow: "hover:shadow-[0_4px_20px_rgba(253,203,110,0.25)]",
  },
  streak: {
    icon: "text-aurora-streak-500",
    value: "text-aurora-streak-500",
    bg: "bg-aurora-streak-500/10",
    glow: "hover:shadow-[0_4px_20px_rgba(255,107,107,0.2)]",
  },
  success: {
    icon: "text-emerald-500",
    value: "text-emerald-500",
    bg: "bg-emerald-500/10",
    glow: "hover:shadow-[0_4px_20px_rgba(16,185,129,0.2)]",
  },
  muted: {
    icon: "text-muted-foreground",
    value: "text-foreground",
    bg: "bg-muted",
    glow: "hover:shadow-md",
  },
};

const SIZE_STYLES = {
  sm: { card: "p-3", icon: "h-4 w-4", iconWrap: "p-1.5", label: "text-xs", value: "text-lg", trend: "text-xs" },
  md: { card: "p-4 sm:p-5", icon: "h-5 w-5", iconWrap: "p-2", label: "text-sm", value: "text-2xl", trend: "text-xs" },
  lg: { card: "p-5 sm:p-6", icon: "h-6 w-6", iconWrap: "p-2.5", label: "text-sm", value: "text-3xl", trend: "text-sm" },
};

function TrendBadge({ trend, className }: { trend: "up" | "down" | number; className?: string }) {
  const isUp = trend === "up" || (typeof trend === "number" && trend > 0);
  const isDown = trend === "down" || (typeof trend === "number" && trend < 0);
  const label = typeof trend === "number"
    ? `${trend > 0 ? "+" : ""}${trend}%`
    : trend === "up" ? "↑" : "↓";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium",
        isUp && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
        isDown && "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
        className
      )}
    >
      {isUp && <TrendingUp className="h-3 w-3" />}
      {isDown && <TrendingDown className="h-3 w-3" />}
      {label}
    </span>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  color = "primary",
  trend,
  subtitle,
  className,
  animateValue = true,
  size = "md",
}: StatCardProps) {
  const styles = COLOR_STYLES[color];
  const s = SIZE_STYLES[size];

  // Count-up for numeric values
  const numericValue = typeof value === "number" ? value : parseFloat(String(value));
  const isNumeric = !isNaN(numericValue);
  // Detect whether the source value is an integer — never display ".0" on integers.
  const isInteger =
    isNumeric && typeof value === "number" && Number.isInteger(value);
  const animatedNum = useCountUp(isNumeric && animateValue ? numericValue : 0, {
    duration: 900,
    delay: 150,
  });

  const displayValue = isNumeric && animateValue
    ? isInteger
      ? Math.round(animatedNum).toLocaleString("ro-RO")
      : // Genuine fractional value (e.g. 4.7 rating) — keep one decimal
      typeof value === "number" && value < 10
      ? animatedNum.toFixed(1)
      : Math.round(animatedNum).toLocaleString("ro-RO")
    : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn(
        "group relative rounded-2xl border border-border",
        // Light mode: white card + shadow on warm lavender bg
        "bg-card shadow-[0_1px_3px_rgba(108,92,231,0.08),0_1px_2px_rgba(0,0,0,0.04)]",
        // Dark mode: glass
        "dark:bg-[var(--aurora-bg-card)] dark:border-[var(--aurora-border-subtle)]",
        "transition-all duration-200",
        styles.glow,
        s.card,
        className
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className={cn("rounded-xl", styles.bg, s.iconWrap)}>
          <Icon className={cn(styles.icon, s.icon)} />
        </div>
        {trend !== undefined && <TrendBadge trend={trend} className={s.trend} />}
      </div>

      {/* Value */}
      <div className="mt-3">
        <div
          className={cn(
            "font-bold tabular-nums leading-none tracking-tight",
            styles.value,
            s.value
          )}
        >
          {displayValue}
        </div>
        <div className={cn("mt-1 font-medium text-muted-foreground", s.label)}>
          {label}
        </div>
        {subtitle && (
          <div className="mt-0.5 text-xs text-muted-foreground/70">{subtitle}</div>
        )}
      </div>
    </motion.div>
  );
}
