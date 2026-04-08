"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { resetProgress } from "@/app/(dashboard)/courses/sync-action";
import { useToast } from "@/components/ui/toast";

export function ResetProgressButton() {
  const [isPending, startTransition] = useTransition();
  const [confirmed, setConfirmed] = useState(false);
  const { toast } = useToast();

  function handleClick() {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }
    setConfirmed(false);
    startTransition(async () => {
      const res = await resetProgress();
      toast(res.message, res.success ? "success" : "error");
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleClick}
        disabled={isPending}
        className={`inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed font-semibold px-4 py-2 rounded-lg transition text-sm ${
          confirmed
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
        }`}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Se resetează...
          </>
        ) : (
          <>
            <Trash2 className="h-4 w-4" />
            {confirmed ? "Confirmă — șterge tot progresul" : "Resetează progresul"}
          </>
        )}
      </button>
      {confirmed && !isPending && (
        <p className="text-xs text-muted-foreground">
          Click din nou pentru a confirma. Aceasta va șterge tot progresul tău din baza de date.
        </p>
      )}
    </div>
  );
}
