import { Skeleton } from "@/components/ui/skeleton";

// Light placeholder for the onboarding wizard: a centered card with a step label,
// a title and a few option rows.
export default function OnboardingLoading() {
  return (
    <div
      className="min-h-screen bg-background flex items-center justify-center p-4"
      aria-hidden
    >
      <div className="w-full max-w-xl space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
        <div className="rounded-2xl border border-border bg-card p-8 space-y-6">
          <div className="space-y-2 text-center">
            <Skeleton className="mx-auto h-8 w-56" />
            <Skeleton className="mx-auto h-4 w-72 max-w-full" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
