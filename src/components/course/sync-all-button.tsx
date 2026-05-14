"use client";

import { useTransition } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { syncAllCourses } from "@/app/(dashboard)/courses/sync-action";
import { useToast } from "@/components/ui/toast";

export function SyncAllCoursesButton() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  function handleSync() {
    startTransition(async () => {
      const res = await syncAllCourses();
      toast(res.message, res.success ? "success" : "error");
    });
  }

  return (
    <button
      onClick={handleSync}
      disabled={isPending}
      className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/80 disabled:opacity-60 disabled:cursor-not-allowed text-secondary-foreground font-semibold px-4 py-2 rounded-lg transition text-sm"
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Sincronizez toate cursurile...
        </>
      ) : (
        <>
          <RefreshCw className="h-4 w-4" />
          Sincronizează toate cursurile
        </>
      )}
    </button>
  );
}
