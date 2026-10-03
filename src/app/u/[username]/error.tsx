"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

export default function PublicProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[PublicProfileError]", error);
  }, [error]);

  return (
    <ErrorState
      fullScreen
      onRetry={reset}
      digest={error.digest}
      title="Nu am putut încărca acest profil"
      description="A apărut o eroare la încărcarea portofoliului. Încearcă din nou sau revino la pagina principală."
      homeHref="/"
      homeLabel="Pagina principală"
    />
  );
}
