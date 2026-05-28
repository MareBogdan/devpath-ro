"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="ro">
      <body className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-[#6c5ce7]/10 border border-[#6c5ce7]/20 flex items-center justify-center">
              <svg
                className="w-9 h-9 text-[#6c5ce7]"
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
            <h1 className="text-2xl font-bold text-white">
              Ceva nu a funcționat corect
            </h1>
            <p className="text-sm text-[#a0a0b0] leading-relaxed">
              A apărut o eroare neașteptată. Echipa a fost notificată automat.
            </p>
            {error.digest && (
              <p className="text-xs text-[#666680] font-mono mt-1">
                ID eroare: {error.digest}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="px-5 py-2.5 rounded-xl bg-[#6c5ce7] text-white text-sm font-medium hover:bg-[#5a4dd0] transition-colors"
            >
              Încearcă din nou
            </button>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl border border-[#2a2a3d] text-[#a0a0b0] text-sm font-medium hover:border-[#6c5ce7]/40 hover:text-white transition-colors"
            >
              Mergi acasă
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
