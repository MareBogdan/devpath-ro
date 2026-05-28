import { Skeleton } from "@/components/ui/skeleton";
import { BadgeSkeleton } from "@/components/ui/skeleton-card";

export default function PortfolioLoading() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
      {/* Header: avatar + name + meta */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <Skeleton className="h-24 w-24 rounded-full shrink-0" />
        <div className="space-y-2 flex-1 text-center sm:text-left">
          <Skeleton className="h-8 w-48 mx-auto sm:mx-0" />
          <Skeleton className="h-4 w-32 mx-auto sm:mx-0" />
          <div className="flex gap-2 justify-center sm:justify-start mt-3">
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-12" />
          </div>
        ))}
      </div>

      {/* Activity heatmap */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>

      {/* Radar + Badges grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <Skeleton className="h-5 w-36" />
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <BadgeSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
