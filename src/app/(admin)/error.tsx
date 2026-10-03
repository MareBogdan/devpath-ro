"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

// Renders inside the admin shell (sidebar stays usable), so it is a block, not full-screen.
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AdminError]", error);
  }, [error]);

  return (
    <ErrorState
      onRetry={reset}
      digest={error.digest}
      description="A apărut o eroare la încărcarea acestei pagini de administrare. Poți încerca din nou sau te poți întoarce la dashboard."
      homeHref="/dashboard"
      homeLabel="Mergi la Dashboard"
    />
  );
}
