"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

export default function OnboardingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[OnboardingError]", error);
  }, [error]);

  return (
    <ErrorState
      fullScreen
      onRetry={reset}
      digest={error.digest}
      title="Nu am putut încărca configurarea contului"
      description="A apărut o eroare neașteptată în timpul configurării contului. Încearcă din nou sau revino la pagina principală."
      homeHref="/"
      homeLabel="Pagina principală"
    />
  );
}
