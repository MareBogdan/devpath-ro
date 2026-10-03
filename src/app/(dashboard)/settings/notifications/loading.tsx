import { Skeleton } from "@/components/ui/skeleton";

// Mirrors settings/notifications: header (icon + title + subtitle) then two sections
// ("email" with 2 toggle rows, "push" with 1), each row = label/description + toggle.
function Row() {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-72 max-w-full" />
      </div>
      <Skeleton className="h-6 w-11 rounded-full shrink-0" />
    </div>
  );
}

export default function NotificationsSettingsLoading() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-8" aria-hidden>
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
      </div>

      {/* Email */}
      <section>
        <Skeleton className="h-5 w-40 mb-2" />
        <Skeleton className="h-4 w-72 max-w-full mb-4" />
        <Row />
        <Row />
      </section>

      {/* Push */}
      <section>
        <Skeleton className="h-5 w-36 mb-2" />
        <Skeleton className="h-4 w-96 max-w-full mb-4" />
        <Row />
      </section>
    </div>
  );
}
