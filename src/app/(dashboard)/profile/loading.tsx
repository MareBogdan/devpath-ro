import { Skeleton } from "@/components/ui/skeleton";
import { StatCardSkeleton } from "@/components/ui/skeleton-card";

// Mirrors profile/page.tsx: hero card, 4 stat tiles, "Editează profilul" row,
// activity heatmap, [learning-DNA radar | completed courses], then
// [badges (2/3) | invite + public-profile cards (1/3)].
function CardHeader() {
  return (
    <div className="flex items-center gap-3 mb-6">
      <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-56 max-w-full" />
      </div>
    </div>
  );
}

export default function ProfileLoading() {
  return (
    <div
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8"
      aria-hidden
    >
      {/* Hero card */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <Skeleton className="h-[108px] w-[108px] rounded-full shrink-0" />
        <div className="flex-1 w-full space-y-2.5">
          <Skeleton className="h-9 w-56 mx-auto sm:mx-0" />
          <Skeleton className="h-4 w-64 max-w-full mx-auto sm:mx-0" />
          <div className="flex gap-2 justify-center sm:justify-start">
            <Skeleton className="h-7 w-36 rounded-full" />
            <Skeleton className="h-7 w-16 rounded-full" />
          </div>
          <div className="flex items-center justify-between pt-1">
            <Skeleton className="h-3 w-44" />
            <Skeleton className="h-3 w-14" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Edit-profile row */}
      <div className="flex h-[70px] items-center gap-3 rounded-2xl border border-border bg-card px-5">
        <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-52 max-w-full" />
        </div>
        <Skeleton className="h-4 w-4" />
      </div>

      {/* Activity heatmap */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <CardHeader />
        <Skeleton className="h-[110px] w-full rounded-md" />
        <Skeleton className="mt-5 h-3 w-48" />
      </div>

      {/* Radar | completed courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6 h-[510px]">
          <Skeleton className="h-6 w-44 mb-2" />
          <Skeleton className="h-3 w-64 max-w-full mb-8" />
          <Skeleton className="mx-auto h-[300px] w-[300px] max-w-full rounded-full" />
          <div className="mt-6 grid grid-cols-3 gap-x-3 gap-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-full rounded-full" />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 h-[510px]">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-44" />
          </div>
          <Skeleton className="h-3 w-32 mb-8" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>

      {/* Badges | invite + public profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-4 w-8" />
          </div>
          <Skeleton className="h-2 w-full rounded-full mb-6" />
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-[70px] w-full rounded-md" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 h-[285px] space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
            <Skeleton className="h-8 w-36 rounded-full" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-3 w-5/6" />
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 h-[170px] space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
