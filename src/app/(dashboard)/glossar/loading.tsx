import { Skeleton } from "@/components/ui/skeleton";
import { PageHeroSkeleton, StatCardSkeleton } from "@/components/ui/skeleton-card";

// Mirrors glossar/page.tsx: PageHero (no ring), 3 stat tiles, search box, category tabs,
// then the two-column list of collapsed term rows.
const TAB_WIDTHS = [
  "w-[86px]",
  "w-[108px]",
  "w-[72px]",
  "w-[72px]",
  "w-[78px]",
  "w-[88px]",
  "w-[72px]",
];

export default function GlossarLoading() {
  return (
    <div className="pb-20" aria-hidden>
      <PageHeroSkeleton />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        {/* Search */}
        <Skeleton className="h-[46px] w-full rounded-xl" />

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2">
          {TAB_WIDTHS.map((w, i) => (
            <Skeleton key={i} className={`h-8 ${w} rounded-full`} />
          ))}
        </div>

        {/* Term rows */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className="flex h-[46px] items-center justify-between gap-3 rounded-md border border-border bg-card px-4"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-28" />
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
