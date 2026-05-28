import { Skeleton } from "@/components/ui/skeleton";

export default function GlossarLoading() {
  return (
    <div className="pb-20">
      {/* PageHero */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10 border-b border-border bg-card">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <div>
            <Skeleton className="h-8 w-44 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-3"
            >
              <Skeleton className="h-9 w-9 rounded-xl" />
              <Skeleton className="h-7 w-12" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>

        {/* Search */}
        <Skeleton className="h-12 w-full rounded-xl" />

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>

        {/* Term grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-4 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-4 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
