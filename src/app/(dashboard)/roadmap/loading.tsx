import { Skeleton } from "@/components/ui/skeleton";
import { PageHeroSkeleton, StatCardSkeleton } from "@/components/ui/skeleton-card";

// Mirrors roadmap/page.tsx: PageHero with the progress ring, 3 stat tiles, the
// "Parcursul tău" header, then the numbered course timeline (progress ring + info + CTA)
// and the dashed "coming soon" teaser.
export default function RoadmapLoading() {
  return (
    <div className="pb-20" aria-hidden>
      <PageHeroSkeleton ring />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Daily goal / streak / lessons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        {/* Section header */}
        <div className="flex items-baseline justify-between">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-3 w-28" />
        </div>

        {/* Timeline */}
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-stretch gap-4">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="flex-1 rounded-2xl border border-border bg-card p-5 sm:p-6 min-h-[200px]">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-[72px] w-[72px] rounded-full shrink-0" />
                  <div className="flex-1 space-y-2.5">
                    <Skeleton className="h-5 w-40 rounded-full" />
                    <Skeleton className="h-6 w-56 max-w-full" />
                    <Skeleton className="h-4 w-full max-w-md" />
                    <Skeleton className="h-4 w-2/3 max-w-sm" />
                    <Skeleton className="h-9 w-28 rounded-xl mt-2" />
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
