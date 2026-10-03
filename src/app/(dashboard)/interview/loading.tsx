import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the interview landing screen: header, then ONE card holding the intro
// (mascot, heading, blurb, 3 pills), the 5 evaluated categories and the start button.
export default function InterviewLoading() {
  return (
    <div className="p-6 sm:p-8" aria-hidden>
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-60" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {/* Intro */}
          <div className="flex flex-col items-center gap-4 border-b border-border px-8 pb-10 pt-10">
            <Skeleton className="h-[72px] w-[72px] rounded-2xl" />
            <Skeleton className="h-8 w-64 max-w-full" />
            <div className="w-full max-w-sm space-y-2.5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mx-auto h-4 w-1/2" />
            </div>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <Skeleton className="h-[26px] w-[100px] rounded-full" />
              <Skeleton className="h-[26px] w-[96px] rounded-full" />
              <Skeleton className="h-[26px] w-[124px] rounded-full" />
            </div>
          </div>

          {/* Categories + CTA */}
          <div className="p-8 pt-7 space-y-5">
            <Skeleton className="h-3 w-36" />
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[124px] rounded-xl border border-border p-3 space-y-2"
                >
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="h-2.5 w-full" />
                  <Skeleton className="h-2.5 w-3/4" />
                </div>
              ))}
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
