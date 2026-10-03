import { Skeleton } from "@/components/ui/skeleton";
import { PortfolioSkeleton } from "@/components/ui/skeleton-card";

// Mirrors u/[username]/page.tsx: the minimal public header (logo left, "Intră în cont"
// right) above the same portfolio body as the private /portfolio page.
export default function PublicProfileLoading() {
  return (
    <div className="min-h-screen bg-background" aria-hidden>
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        <PortfolioSkeleton />
      </main>
    </div>
  );
}
