"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative flex flex-col items-center justify-center text-center py-16 px-6",
        className
      )}
    >
      {/* Gradient blob behind icon */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(108,92,231,0.12) 0%, transparent 70%)",
          filter: "blur(32px)",
        }}
        aria-hidden
      />

      {/* Floating icon */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative z-10 p-5 rounded-3xl bg-aurora-primary-500/10 border border-aurora-primary-500/15 mb-6"
      >
        <Icon className="h-10 w-10 text-aurora-primary-500" />
      </motion.div>

      <h3 className="relative z-10 text-xl font-bold text-foreground mb-2">
        {title}
      </h3>
      <p className="relative z-10 text-muted-foreground text-sm max-w-sm mb-6">
        {description}
      </p>

      {/* CTA */}
      {actionLabel && (actionHref || onAction) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-2 rounded-xl bg-aurora-primary-500 text-white px-5 py-2.5 text-sm font-semibold hover:bg-aurora-primary-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 rounded-xl bg-aurora-primary-500 text-white px-5 py-2.5 text-sm font-semibold hover:bg-aurora-primary-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {actionLabel}
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
