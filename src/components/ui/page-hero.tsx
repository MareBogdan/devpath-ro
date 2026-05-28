"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { staggerContainer, itemFadeUp } from "@/lib/animations";

type HeroVariant = "default" | "gradient" | "mesh";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  rightContent?: React.ReactNode;
  backgroundVariant?: HeroVariant;
  className?: string;
  titleGradient?: boolean;
}

const BG_STYLES: Record<HeroVariant, string> = {
  default: "bg-card dark:bg-[var(--aurora-bg-card)] border-b border-border",
  gradient:
    "bg-gradient-to-br from-aurora-primary-50 to-aurora-accent-50 dark:from-aurora-primary-900/30 dark:to-aurora-accent-900/20 border-b border-border",
  mesh:
    "relative overflow-hidden bg-card dark:bg-[var(--aurora-bg-card)] border-b border-border",
};

function MeshBlobs() {
  return (
    <>
      <div
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(108,92,231,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
        aria-hidden
      />
      <div
        className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(0,206,201,0.10) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
        aria-hidden
      />
    </>
  );
}

export function PageHero({
  title,
  subtitle,
  icon: Icon,
  rightContent,
  backgroundVariant = "default",
  className,
  titleGradient = true,
}: PageHeroProps) {
  return (
    <div className={cn(BG_STYLES[backgroundVariant], "px-4 sm:px-6 lg:px-8 py-8 sm:py-10", className)}>
      {backgroundVariant === "mesh" && <MeshBlobs />}

      <div className="relative max-w-5xl mx-auto">
        <motion.div
          variants={staggerContainer(0.08, 0.05)}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          {/* Left: icon + text */}
          <div className="flex items-center gap-4">
            {Icon && (
              <motion.div
                variants={itemFadeUp}
                className="shrink-0 p-3 rounded-2xl bg-aurora-primary-500/10 border border-aurora-primary-500/20"
              >
                <Icon className="h-7 w-7 text-aurora-primary-500" />
              </motion.div>
            )}

            <div>
              <motion.h1
                variants={itemFadeUp}
                className={cn(
                  "text-2xl sm:text-3xl font-bold tracking-tight leading-tight",
                  titleGradient
                    ? "aurora-gradient-text"
                    : "text-foreground"
                )}
              >
                {title}
              </motion.h1>
              {subtitle && (
                <motion.p
                  variants={itemFadeUp}
                  className="mt-1 text-muted-foreground text-sm sm:text-base"
                >
                  {subtitle}
                </motion.p>
              )}
            </div>
          </div>

          {/* Right: slot */}
          {rightContent && (
            <motion.div variants={itemFadeUp} className="shrink-0">
              {rightContent}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
