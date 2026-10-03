import { Skeleton } from "@/components/ui/skeleton";
import { PageHeroSkeleton, StatCardSkeleton } from "@/components/ui/skeleton-card";

// Mirrors flashcards/page.tsx: PageHero with the mastery ring, 4 stat tiles, then the
// review surface (progress header + card) in the narrower 3xl column.
export default function FlashcardsLoading() {
  return (
    <div className="pb-20" aria-hidden>
      <PageHeroSkeleton ring />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-5 min-h-[375px]">
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
