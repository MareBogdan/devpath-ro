import { Skeleton } from "@/components/ui/skeleton";

export default function FlashcardsLoading() {
  return (
    <div className="pb-20">
      {/* PageHero */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10 border-b border-border bg-card">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-2xl" />
            <div>
              <Skeleton className="h-8 w-40 mb-2" />
              <Skeleton className="h-4 w-72" />
            </div>
          </div>
          <Skeleton className="h-24 w-24 rounded-full" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Stats banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
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

        {/* Review surface */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-56 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
