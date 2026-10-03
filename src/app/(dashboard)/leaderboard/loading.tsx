import { Skeleton } from "@/components/ui/skeleton";

// Mirrors leaderboard/page.tsx: heading + subtitle, then the top-10 rows
// (medal, avatar, name + level, XP).
export default function LeaderboardLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8" aria-hidden>
      <Skeleton className="h-8 w-72 max-w-full mb-2" />
      <Skeleton className="h-5 w-96 max-w-full mb-8" />

      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex h-[66px] items-center gap-4 rounded-xl border border-border bg-card px-4"
          >
            <Skeleton className="h-6 w-6 rounded-full shrink-0" />
            <Skeleton className="h-9 w-9 rounded-full shrink-0" />
            <div className="flex-1 min-w-0 space-y-1.5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-5 w-16 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
