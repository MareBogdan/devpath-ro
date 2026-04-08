"use client";

import { useState, useTransition } from "react";
import { FlaskConical, Loader2, CheckCircle2 } from "lucide-react";
import { seedDatabase } from "@/app/(dashboard)/courses/actions";

interface SeedButtonProps {
  labels: {
    seedButton: string;
    seeding: string;
    seedSuccess: string;
  };
}

export function SeedButton({ labels }: SeedButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSeed() {
    startTransition(async () => {
      const result = await seedDatabase();
      setMessage(result.message);
      setSuccess(result.success);
    });
  }

  if (success) {
    return (
      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
        <CheckCircle2 className="h-5 w-5" />
        {message ?? labels.seedSuccess}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleSeed}
        disabled={isPending}
        className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-primary-foreground font-semibold px-6 py-3 rounded-lg transition"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {labels.seeding}
          </>
        ) : (
          <>
            <FlaskConical className="h-4 w-4" />
            {labels.seedButton}
          </>
        )}
      </button>
      {message && !success && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}
