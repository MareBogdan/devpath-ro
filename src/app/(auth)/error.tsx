"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AuthError]", error);
  }, [error]);

  return (
    <ErrorState
      fullScreen
      onRetry={reset}
      digest={error.digest}
      title="Nu am putut încărca pagina de autentificare"
      description="A apărut o eroare neașteptată. Încearcă din nou sau revino la pagina principală."
      homeHref="/"
      homeLabel="Pagina principală"
    />
  );
}
