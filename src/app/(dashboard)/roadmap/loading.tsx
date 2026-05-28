import { Skeleton } from "@/components/ui/skeleton";

export default function RoadmapLoading() {
  return (
    <div className="pb-20">
      {/* PageHero */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10 border-b border-border bg-card">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-2xl" />
            <div>
              <Skeleton className="h-8 w-56 mb-2" />
              <Skeleton className="h-4 w-72" />
            </div>
          </div>
          <Skeleton className="h-24 w-24 rounded-full" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Daily goal + streak strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-3"
            >
              <Skeleton className="h-9 w-9 rounded-xl" />
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>

        {/* Section header */}
        <div className="flex items-baseline justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-3 w-32" />
        </div>

        {/* Course cards */}
        <div className="space-y-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-stretch gap-4">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="flex-1 rounded-2xl border border-border bg-card p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-16 w-16 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full max-w-md" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                    <Skeleton className="h-9 w-24 rounded-xl mt-3" />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Coming-soon teaser */}
          <div className="flex items-stretch gap-4">
            <Skeleton className="h-9 w-9 rounded-full shrink-0" />
            <div className="flex-1 rounded-2xl border border-dashed border-border bg-muted/30 p-5 sm:p-6 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-full max-w-md" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
