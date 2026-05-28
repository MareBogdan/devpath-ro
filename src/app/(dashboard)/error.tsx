"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[DashboardError]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
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
          <h2 className="text-xl font-bold text-aurora-text-primary">
            Ceva nu a funcționat corect
          </h2>
          <p className="text-sm text-aurora-text-tertiary leading-relaxed">
            A apărut o eroare la încărcarea acestei pagini. Poți încerca din
            nou sau te poți întoarce la dashboard.
          </p>
          {error.digest && (
            <p className="text-xs text-aurora-text-tertiary/50 font-mono mt-1">
              ID: {error.digest}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-xl bg-aurora-primary-500 text-white text-sm font-medium hover:bg-aurora-primary-600 transition-colors"
          >
            Încearcă din nou
          </button>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl border border-aurora-border-medium text-aurora-text-secondary text-sm font-medium hover:border-aurora-primary-500/40 hover:text-aurora-text-primary transition-colors"
          >
            Mergi la Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
