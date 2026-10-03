import { Skeleton } from "@/components/ui/skeleton";

// Mirrors dashboard/page.tsx: a full-height hero (streak pill, greeting, "continue"
// pill, 4 stat cards, XP bar, week dots) followed by the "Ce poți face" section
// with the two feature cards. Same 500px section rhythm as the real sections.
export default function DashboardLoading() {
  return (
    <div className="pt-4 pb-16" aria-hidden>
      {/* Hero */}
      <section className="min-h-[500px] flex items-center justify-center px-6 py-20">
        <div className="w-full mx-auto max-sm:!max-w-full" style={{ maxWidth: "min(75%, 1000px)" }}>
          {/* Streak pill */}
          <Skeleton className="mb-4 h-7 w-56 rounded-full" />
          {/* Greeting + subtitle */}
          <Skeleton className="h-9 w-[420px] max-w-full mb-2" />
          <Skeleton className="h-5 w-52" />
          {/* "Continuă" pill */}
          <Skeleton className="mt-3 h-8 w-72 max-w-full rounded-full" />

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="relative rounded-[14px] border border-border bg-card p-5"
              >
                <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-[14px] bg-muted-foreground/20" />
                <div className="flex items-center gap-3 mb-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-3 w-14" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>

          {/* XP progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>

          {/* Week dots */}
          <div className="mt-6 flex items-center justify-center gap-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-2.5 w-3" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* "Ce poți face pe DevPath" */}
      <section className="min-h-[500px] flex items-center justify-center px-6 py-20">
        <div className="w-full mx-auto max-sm:!max-w-full" style={{ maxWidth: "min(75%, 1000px)" }}>
          <Skeleton className="h-8 w-72 max-w-full mb-2" />
          <Skeleton className="h-4 w-[420px] max-w-full mb-8" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="relative rounded-[14px] border border-border bg-card p-6 pt-7"
              >
                <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-[14px] bg-muted-foreground/20" />
                <Skeleton className="h-[52px] w-[52px] rounded-2xl mb-5" />
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-full mb-1.5" />
                <Skeleton className="h-4 w-4/5" />
                <div className="flex justify-end mt-4">
                  <Skeleton className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
