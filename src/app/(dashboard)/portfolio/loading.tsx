import { PortfolioSkeleton } from "@/components/ui/skeleton-card";

// Mirrors portfolio/page.tsx (header, stats, heatmap, radar, courses, badges, saved lessons).
export default function PortfolioLoading() {
  return (
    <div className="p-6 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <PortfolioSkeleton />
      </div>
    </div>
  );
}
