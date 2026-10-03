"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

export default function VerifyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[VerifyError]", error);
  }, [error]);

  return (
    <ErrorState
      fullScreen
      onRetry={reset}
      digest={error.digest}
      title="Nu am putut verifica certificatul"
      description="A apărut o eroare la verificare. Încearcă din nou sau revino la pagina principală."
      homeHref="/"
      homeLabel="Pagina principală"
    />
  );
}
