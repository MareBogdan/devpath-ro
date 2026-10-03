import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Composite skeletons that mirror the real card/hero shapes used across the app.
// They build on the single `Skeleton` primitive from `ui/skeleton.tsx`.
export { Skeleton };

interface SkeletonProps {
  className?: string;
}

/** Mirrors `StatCard`: icon chip, big number, label and (optional) sub-label. */
export function StatCardSkeleton({
  className,
  withSub = true,
}: SkeletonProps & { withSub?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-4 sm:p-5",
        "shadow-[0_1px_3px_rgba(108,92,231,0.08)]",
        className
      )}
      aria-hidden
    >
      <Skeleton className="h-9 w-9 rounded-xl" />
      <Skeleton className="mt-4 h-7 w-14" />
      <Skeleton className="mt-2 h-4 w-24" />
      {withSub && <Skeleton className="mt-1.5 h-3 w-20" />}
    </div>
  );
}

export function CourseCardSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card overflow-hidden",
        "shadow-[0_1px_3px_rgba(108,92,231,0.08)]",
        className
      )}
      aria-hidden
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      {/* Body */}
      <div className="p-6 pt-4">
        <Skeleton className="h-2 w-full rounded-full mb-1" />
        <div className="flex justify-between mt-1 mb-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
  );
}

/**
 * Mirrors `PageHero` (glossar / flashcards / roadmap): icon chip + title +
 * subtitle, and optionally the progress ring on the right.
 */
export function PageHeroSkeleton({
  className,
  ring = false,
}: SkeletonProps & { ring?: boolean }) {
  return (
    <div
      className={cn(
        "px-4 sm:px-6 lg:px-8 py-8 sm:py-10 border-b border-border bg-card",
        className
      )}
      aria-hidden
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
          <div>
            <Skeleton className="h-9 w-48 mb-2.5" />
            <Skeleton className="h-5 w-72 max-w-full" />
          </div>
        </div>
        {ring && <Skeleton className="h-24 w-24 rounded-full shrink-0" />}
      </div>
    </div>
  );
}

export function BadgeSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 p-3 rounded-2xl border border-border",
        className
      )}
      aria-hidden
    >
      <Skeleton className="h-12 w-12 rounded-2xl" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

/**
 * Body of the portfolio page (private `/portfolio` and public `/u/[username]`):
 * header, 4 stat tiles, activity heatmap, learning-DNA radar, then the
 * completed-courses / badges / saved-lessons sections. Spacing between blocks is
 * supplied by the caller's `space-y-8` wrapper.
 */
export function PortfolioSkeleton() {
  return (
    <>
      {/* Header: avatar + name/level, profile link, meta row */}
      <div className="flex items-start gap-5 flex-wrap" aria-hidden>
        <Skeleton className="h-20 w-20 rounded-full shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-4 w-44" />
          <div className="flex items-center gap-5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4" aria-hidden>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-5"
          >
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="mt-4 h-7 w-8" />
            <Skeleton className="mt-1.5 h-4 w-28" />
          </div>
        ))}
      </div>

      {/* Activity heatmap */}
      <div className="rounded-2xl border border-border bg-card p-6" aria-hidden>
        <Skeleton className="h-4 w-64 mb-4" />
        <Skeleton className="h-[130px] w-full rounded-md" />
        <Skeleton className="mt-4 h-3 w-40" />
      </div>

      {/* Learning DNA radar */}
      <div className="rounded-2xl border border-border bg-card p-6" aria-hidden>
        <Skeleton className="h-4 w-40 mb-2" />
        <Skeleton className="h-3 w-80 max-w-full mb-6" />
        <Skeleton className="mx-auto h-[400px] w-full max-w-md rounded-2xl" />
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-full rounded-full" />
          ))}
        </div>
      </div>

      {/* Completed courses */}
      <div className="space-y-3" aria-hidden>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-[118px] w-full rounded-xl" />
      </div>

      {/* Badges */}
      <div className="space-y-3" aria-hidden>
        <Skeleton className="h-4 w-36" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[88px] w-full rounded-xl" />
          ))}
        </div>
      </div>

      {/* Saved lessons */}
      <div className="space-y-3" aria-hidden>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-[125px] w-full rounded-xl" />
      </div>
    </>
  );
}
