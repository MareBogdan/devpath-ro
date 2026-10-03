import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the lesson page: a sticky header (breadcrumb on the left; "n din N", type pill,
// reading time, bookmark on the right), a centered 680px reading column (gradient h1,
// paragraphs at ~30px line pitch, an h2 with its accent bar, a table/figure block).
// The real page's sticky bottom bar (just a "previous lesson" link) is not drawn: it isn't
// visible in the first viewport, so a skeleton for it would flash a bar that then vanishes.
function Paragraph({ lines }: { lines: number }) {
  return (
    <div className="my-5 space-y-3.5">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 && lines > 1 ? "w-3/5" : "w-full"}`}
        />
      ))}
    </div>
  );
}

export default function LessonLoading() {
  return (
    <div className="flex flex-col min-h-full" aria-hidden>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-6 py-3">
        <div className="max-w-[680px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 min-w-0">
            <Skeleton className="h-3.5 w-3.5" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3.5 w-3.5 opacity-50" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Skeleton className="hidden sm:block h-3 w-12" />
            <Skeleton className="h-[22px] w-16 rounded-full" />
            <Skeleton className="hidden sm:block h-3.5 w-14" />
            <Skeleton className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Lesson content */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-[680px] mx-auto">
          <Skeleton className="mb-8 h-[35px] w-[88%]" />

          <Paragraph lines={3} />
          <Paragraph lines={2} />
          <Paragraph lines={2} />
          <Paragraph lines={1} />

          {/* h2 + accent bar */}
          <div className="mt-12 mb-4 pb-3 relative">
            <Skeleton className="h-8 w-72 max-w-full" />
            <Skeleton className="mt-3 h-[3px] w-12 rounded-full" />
          </div>
          <Paragraph lines={2} />

          {/* Table / figure */}
          <Skeleton className="mt-6 h-[210px] w-full rounded-xl" />

          <Paragraph lines={3} />
          <Paragraph lines={2} />
        </div>
      </div>
    </div>
  );
}
