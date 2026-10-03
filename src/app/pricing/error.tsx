"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

export default function PricingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[PricingError]", error);
  }, [error]);

  return (
    <ErrorState
      fullScreen
      onRetry={reset}
      digest={error.digest}
      title="Nu am putut încărca planurile"
      description="A apărut o eroare la încărcarea prețurilor. Încearcă din nou sau revino la pagina principală."
      homeHref="/"
      homeLabel="Pagina principală"
    />
  );
}
