"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

// Boundary for root-level pages (landing, etc.). It renders INSIDE the root layout, so it
// must not output <html>/<body> — layout-level crashes are handled by `global-error.tsx`.
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[RootError]", error);
  }, [error]);

  return (
    <ErrorState
      fullScreen
      onRetry={reset}
      digest={error.digest}
      description="A apărut o eroare neașteptată. Poți încerca din nou sau te poți întoarce la pagina principală."
    />
  );
}
