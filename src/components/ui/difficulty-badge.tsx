import { Flame, Sprout, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getDifficultyColor,
  getDifficultyLabel,
  type DifficultyColor,
} from "@/lib/difficulty";

interface DifficultyBadgeProps {
  level: number;
  className?: string;
  showIcon?: boolean;
}

const DIFFICULTY_CONFIG: Record<DifficultyColor, {
  icon: typeof Sprout;
  className: string;
}> = {
  green: {
    icon: Sprout,
    className:
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900",
  },
  yellow: {
    icon: Flame,
    className:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-900",
  },
  red: {
    icon: Zap,
    className:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900",
  },
};

export function DifficultyBadge({ level, className, showIcon = true }: DifficultyBadgeProps) {
  const config = DIFFICULTY_CONFIG[getDifficultyColor(level)];
  const Icon = config.icon;
  const label = getDifficultyLabel(level);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        config.className,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {label}
    </span>
  );
}
