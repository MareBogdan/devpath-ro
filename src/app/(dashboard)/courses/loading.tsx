import { Skeleton } from "@/components/ui/skeleton";

export default function CoursesLoading() {
  return (
    <div className="pb-20">
      {/* Mission Control hero */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10 border-b border-border bg-card">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-2xl" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-72" />
            </div>
          </div>
          <Skeleton className="h-24 w-24 rounded-full" />
        </div>
      </div>

      {/* Stats row */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-3">
            <div className="flex items-start justify-between">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Continue button placeholder */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <Skeleton className="h-16 w-72 rounded-2xl" />
      </div>

      {/* Course selector */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-6 flex items-start gap-4">
            <Skeleton className="h-16 w-16 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>

      {/* Serpentine placeholder */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <Skeleton className="h-[700px] w-full rounded-3xl" />
      </div>
    </div>
  );
}
