import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsSettingsLoading() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Toggle rows */}
      <div className="rounded-2xl border border-border bg-card divide-y divide-border">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-5 gap-4">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full max-w-md" />
            </div>
            <Skeleton className="h-6 w-11 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
