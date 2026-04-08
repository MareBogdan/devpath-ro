import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { Search, ShieldCheck, GraduationCap, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { toggleUserRole } from "./actions";

const PAGE_SIZE = 50;

const PLAN_BADGE: Record<string, string> = {
  free: "bg-muted text-muted-foreground",
  pro: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  lifetime: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
};

function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Initials({ name, email }: { name: string | null; email: string }) {
  const src = name ?? email;
  const letters = src
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-xs font-semibold text-amber-700 dark:text-amber-400 shrink-0">
      {letters || "?"}
    </div>
  );
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const q = (searchParams.q ?? "").trim();
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const adminClient = createSupabaseAdminClient();

  let query = adminClient
    .from("users")
    .select(
      "id, name, email, plan, role, level, xp, streak_count, last_active, onboarding_completed, avatar_url, created_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (q) {
    query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const { data: users, count, error } = await query;

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Useri</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {count ?? 0} utilizatori înregistrați
          </p>
        </div>
      </div>

      {/* Search */}
      <form method="GET" className="mb-5">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            name="q"
            type="text"
            defaultValue={q}
            placeholder="Caută după nume sau email..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-colors"
          />
        </div>
      </form>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          Eroare la încărcarea userilor: {error.message}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Utilizator</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plan</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Rol</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Nivel</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">XP</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Streak</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Activ</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Înregistrat</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {!users || users.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                    {q ? `Niciun user găsit pentru „${q}"` : "Niciun utilizator înregistrat."}
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {u.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={u.avatar_url}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <Initials name={u.name} email={u.email} />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate max-w-[160px]">
                            {u.name ?? "—"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                            {u.email}
                          </p>
                        </div>
                        {!u.onboarding_completed && (
                          <span className="text-[10px] bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400 rounded-full px-1.5 py-0.5 shrink-0">
                            onboarding
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          PLAN_BADGE[u.plan] ?? "bg-muted text-muted-foreground"
                        }`}
                      >
                        {u.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          u.role === "admin"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {u.role === "admin" ? (
                          <ShieldCheck className="h-3 w-3" />
                        ) : (
                          <GraduationCap className="h-3 w-3" />
                        )}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">
                      {u.level ?? 1}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">
                      {(u.xp ?? 0).toLocaleString("ro-RO")}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">
                      {u.streak_count ?? 0}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {formatDate(u.last_active)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <form
                        action={async () => {
                          "use server";
                          await toggleUserRole(
                            u.id,
                            u.role === "admin" ? "student" : "admin"
                          );
                        }}
                      >
                        <button
                          type="submit"
                          className="text-xs px-2.5 py-1 rounded-md border border-border hover:bg-accent hover:border-amber-300 transition-colors text-muted-foreground hover:text-foreground"
                        >
                          {u.role === "admin" ? "→ student" : "→ admin"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Pagina {page} din {totalPages}
          </p>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Link
                href={`/admin/users?${new URLSearchParams({ ...(q ? { q } : {}), page: String(page - 1) })}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/users?${new URLSearchParams({ ...(q ? { q } : {}), page: String(page + 1) })}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              >
                Următor
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
