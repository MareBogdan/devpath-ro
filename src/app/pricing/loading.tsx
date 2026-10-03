import { Skeleton } from "@/components/ui/skeleton";

// Mirrors pricing/page.tsx: the simple top bar (back link, centered logo), the centered
// heading block (pill, big title, 2-line subtitle) and the 3 plan cards — the middle
// ("popular") one a little taller — each with icon, price, blurb, feature list and CTA.
function PlanCard({ tall = false, features }: { tall?: boolean; features: number }) {
  return (
    <div
      className={`rounded-2xl border bg-card p-8 ${
        tall ? "border-primary/30 min-h-[520px]" : "border-border min-h-[470px]"
      }`}
    >
      <Skeleton className="h-10 w-10 rounded-xl mb-6" />
      <Skeleton className="h-4 w-16 mb-3" />
      <Skeleton className="h-10 w-32 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mb-6" />
      <div className="space-y-3.5 mb-8">
        {Array.from({ length: features }).map((_, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <Skeleton className="h-4 w-4 rounded-full shrink-0" />
            <Skeleton className="h-4 w-48 max-w-full" />
          </div>
        ))}
      </div>
      <Skeleton className="h-11 w-full rounded-xl" />
    </div>
  );
}

export default function PricingLoading() {
  return (
    <div className="min-h-screen bg-background" aria-hidden>
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-6 w-28" />
          <div className="w-40" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-20">
        {/* Heading */}
        <div className="flex flex-col items-center text-center mb-16">
          <Skeleton className="h-7 w-40 rounded-full mb-6" />
          <Skeleton className="h-12 w-[640px] max-w-full mb-4" />
          <Skeleton className="h-6 w-[560px] max-w-full mb-2" />
          <Skeleton className="h-6 w-40" />
        </div>

        {/* Mascot perched above the middle card */}
        <div className="flex justify-center mb-8">
          <Skeleton className="h-[88px] w-[72px] rounded-2xl" />
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <PlanCard features={5} />
          <PlanCard features={6} tall />
          <PlanCard features={6} />
        </div>
      </main>
    </div>
  );
}
