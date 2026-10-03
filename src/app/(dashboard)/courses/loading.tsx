"use client";

import { usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import LessonLoading from "./[courseSlug]/[lessonId]/loading";

// This boundary also wraps every route below /courses. When a lesson is opened from
// OUTSIDE /courses/* (dashboard, roadmap, …) Next shows the outermost new loading
// boundary — this one — instead of [lessonId]/loading.tsx, so pick the silhouette that
// matches the destination URL. (usePathname already reflects the target while loading.)
//
// Mirrors courses/page.tsx: CoursesHero (eyebrow, big headline, subtitle, stat pills +
// "continue" card, progress bar, course dots) above the CourseMap (a course card on a
// winding path of lesson nodes).
const PILL_WIDTHS = ["w-[115px]", "w-[105px]", "w-[165px]", "w-[135px]"];
// Horizontal position (% of the map width) of each node on the winding path.
const NODE_X = [18, 38, 56, 74, 60, 42, 24, 40];

export default function CoursesLoading() {
  const pathname = usePathname();
  // /courses/<courseSlug>/<lessonId> → the lesson page, not the course hub.
  if (/^\/courses\/[^/]+\/[^/]+/.test(pathname)) return <LessonLoading />;
  return <CoursesHubSkeleton />;
}

function CoursesHubSkeleton() {
  return (
    <div className="pb-20" aria-hidden>
      {/* Hero */}
      <section>
        <div className="mx-auto max-w-5xl px-4 pb-2 pt-10 sm:px-6 lg:px-8">
          {/* Eyebrow */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-2 w-2 rounded-full" />
            <Skeleton className="h-3.5 w-56" />
          </div>
          {/* Headline + subtitle */}
          <Skeleton className="mt-4 h-[53px] w-4/5" />
          <Skeleton className="mt-3 h-5 w-[430px] max-w-full" />

          {/* Stat pills + continue card */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {PILL_WIDTHS.map((w, i) => (
                <Skeleton key={i} className={`h-[34px] ${w} rounded-full`} />
              ))}
            </div>
            <Skeleton className="h-[62px] w-[320px] max-w-full rounded-2xl" />
          </div>

          {/* Progress */}
          <div className="mt-6 max-w-xl">
            <div className="mb-1.5 flex items-center justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-1 w-full rounded-full" />
          </div>

          {/* Course dots */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-7 rounded-full" />
            ))}
          </div>
        </div>
      </section>

      {/* Course map */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mt-8">
        <Skeleton className="mx-auto h-[195px] w-full max-w-[440px] rounded-2xl" />
        <div className="mt-10 space-y-12">
          {NODE_X.map((x, i) => (
            <div key={i} style={{ marginLeft: `${x}%` }}>
              <Skeleton
                className={i === 3 ? "h-[72px] w-[72px] rounded-full" : "h-10 w-10 rounded-full"}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
