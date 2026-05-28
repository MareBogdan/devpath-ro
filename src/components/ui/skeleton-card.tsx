import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("shimmer-loading rounded-md", className)}
      aria-hidden="true"
    />
  );
}

export function StatCardSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-4 sm:p-5",
        "shadow-[0_1px_3px_rgba(108,92,231,0.08)]",
        className
      )}
      aria-hidden
    >
      <div className="flex items-start justify-between">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <div className="mt-3">
        <Skeleton className="h-7 w-20 mb-1.5" />
        <Skeleton className="h-4 w-28" />
      </div>
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

export function PageHeroSkeleton({ className }: SkeletonProps) {
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
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-10 w-28 rounded-xl" />
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
