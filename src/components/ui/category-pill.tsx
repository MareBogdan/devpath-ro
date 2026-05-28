"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryPillProps {
  label: string;
  icon?: LucideIcon;
  isActive: boolean;
  onClick: () => void;
  color?: string;     // hex color for active tint
  className?: string;
  layoutId?: string;  // shared layout ID for animated underline group
}

export function CategoryPill({
  label,
  icon: Icon,
  isActive,
  onClick,
  color = "#6C5CE7",
  className,
  layoutId = "category-pill-indicator",
}: CategoryPillProps) {
  return (
    <button
      onClick={onClick}
      aria-pressed={isActive}
      className={cn(
        "relative inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium",
        "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "select-none whitespace-nowrap",
        isActive
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
      style={{
        backgroundColor: isActive ? `${color}18` : undefined,
      }}
    >
      {/* Active indicator background */}
      {isActive && (
        <motion.span
          layoutId={layoutId}
          className="absolute inset-0 rounded-full"
          style={{
            backgroundColor: `${color}14`,
            border: `1.5px solid ${color}30`,
          }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
        />
      )}

      {/* Icon */}
      {Icon && (
        <Icon
          className={cn(
            "h-3.5 w-3.5 relative z-10 transition-colors duration-200",
            isActive ? "opacity-100" : "opacity-60"
          )}
          style={{ color: isActive ? color : undefined }}
        />
      )}

      {/* Label */}
      <span
        className="relative z-10 transition-colors duration-200"
        style={{ color: isActive ? color : undefined }}
      >
        {label}
      </span>

      {/* Animated underline */}
      {isActive && (
        <motion.span
          layoutId={`${layoutId}-underline`}
          className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
          style={{ backgroundColor: color }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
        />
      )}
    </button>
  );
}

// ─── CategoryPillGroup convenience wrapper ────────────────────────────────────

interface PillOption {
  value: string;
  label: string;
  icon?: LucideIcon;
  color?: string;
}

interface CategoryPillGroupProps {
  options: PillOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  groupId?: string;
}

export function CategoryPillGroup({
  options,
  value,
  onChange,
  className,
  groupId = "pill-group",
}: CategoryPillGroupProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5",
        className
      )}
      role="tablist"
    >
      {options.map((opt) => (
        <CategoryPill
          key={opt.value}
          label={opt.label}
          icon={opt.icon}
          isActive={value === opt.value}
          onClick={() => onChange(opt.value)}
          color={opt.color}
          layoutId={groupId}
        />
      ))}
    </div>
  );
}
