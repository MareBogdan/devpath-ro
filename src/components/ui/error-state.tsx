"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  /** Next.js `reset()` — re-renders the failed segment. */
  onRetry?: () => void;
  /** Error digest from Next (shown small, helps support find the server log). */
  digest?: string;
  title?: string;
  description?: string;
  homeHref?: string;
  homeLabel?: string;
  /** Takes the full viewport (pages without the dashboard shell) vs. a block inside a layout. */
  fullScreen?: boolean;
}

/**
 * The styled Romanian error card used by every `error.tsx` boundary. Same look as
 * `(dashboard)/error.tsx`: Aurora icon tile, title, description, retry + home actions.
 */
export function ErrorState({
  onRetry,
  digest,
  title = "Ceva nu a funcționat corect",
  description = "A apărut o eroare neașteptată. Poți încerca din nou sau te poți întoarce la pagina principală.",
  homeHref = "/",
  homeLabel = "Mergi acasă",
  fullScreen = false,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-center justify-center p-6",
        fullScreen ? "min-h-screen bg-background" : "min-h-[60vh]"
      )}
    >
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-aurora-primary-500/10 border border-aurora-primary-500/20 flex items-center justify-center">
            <svg
              className="w-7 h-7 text-aurora-primary-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-aurora-text-primary">{title}</h2>
          <p className="text-sm text-aurora-text-tertiary leading-relaxed">
            {description}
          </p>
          {digest && (
            <p className="text-xs text-aurora-text-tertiary/50 font-mono mt-1">
              ID: {digest}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-5 py-2.5 rounded-xl bg-aurora-primary-500 text-white text-sm font-medium hover:bg-aurora-primary-600 transition-colors"
            >
              Încearcă din nou
            </button>
          )}
          <Link
            href={homeHref}
            className="px-5 py-2.5 rounded-xl border border-aurora-border-medium text-aurora-text-secondary text-sm font-medium hover:border-aurora-primary-500/40 hover:text-aurora-text-primary transition-colors"
          >
            {homeLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
