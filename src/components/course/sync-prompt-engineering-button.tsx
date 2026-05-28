"use client";

import { useState, useTransition } from "react";
import { RefreshCw, Loader2 } from "lucide-react";

export function SyncPromptEngineeringButton() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);

  function handleSync() {
    startTransition(async () => {
      setMessage(null);
      setSuccess(null);
      try {
        const res = await fetch("/api/admin/sync-prompt-engineering", {
          method: "POST",
        });
        const data = await res.json();
        setMessage(data.message ?? data.error ?? "Sincronizare finalizată.");
        setSuccess(res.ok && data.success !== false);
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Eroare necunoscută.");
        setSuccess(false);
      }
    });
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleSync}
        disabled={isPending}
        className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/80 disabled:opacity-60 disabled:cursor-not-allowed text-secondary-foreground font-semibold px-4 py-2 rounded-lg transition text-sm"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sincronizez Prompt Engineering...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4" />
            Sincronizează Prompt Engineering
          </>
        )}
      </button>
      {message && (
        <p
          className={`text-xs ${
            success ? "text-emerald-500" : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
