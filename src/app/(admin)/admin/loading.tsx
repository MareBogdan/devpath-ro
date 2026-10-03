import { Skeleton } from "@/components/ui/skeleton";

// Light placeholder for the admin pages (rendered inside the admin shell, next to the
// sidebar): page title, a row of stat tiles and a table-like block.
export default function AdminLoading() {
  return (
    <div className="p-6 sm:p-8 space-y-6" aria-hidden>
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}
