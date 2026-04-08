import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { Award } from "lucide-react";

// Static category mapping derived from badge slug groups
const BADGE_CATEGORY: Record<string, string> = {
  prima_lectie: "Progres",
  primul_modul: "Progres",
  primul_curs: "Progres",
  la_jumatate: "Progres",
  tocilarul: "Progres",
  maini_murdare: "Progres",
  constructor: "Progres",
  complet: "Progres",
  trei_zile: "Streak",
  o_saptamana: "Streak",
  doua_saptamani: "Streak",
  o_luna: "Streak",
  legenda: "Streak",
  perfect_primul: "Skill",
  geniu_in_formare: "Skill",
  cod_rulat: "Skill",
  jucaus_perfect: "Skill",
  cartele_dibace: "Skill",
  programator_in_formare: "Skill",
  vocea_comunitatii: "Social",
  ambasador: "Social",
  recrutorul: "Social",
  vitrina_deschisa: "Social",
  bufnita_de_noapte: "Secret",
  sarbatoare_cu_minte: "Secret",
};

const CATEGORY_COLOR: Record<string, string> = {
  Progres: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  Streak: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  Skill: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  Social: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  Secret: "bg-muted text-muted-foreground",
};

function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface BadgeRow {
  id: string;
  slug: string;
  name: string;
  icon: string;
  category: string;
  earnedCount: number;
  earnedPct: number | null;
  recentEarnerName: string | null;
  recentEarnerDate: string | null;
}

export default async function AdminBadgesPage() {
  const adminClient = createSupabaseAdminClient();

  // Fetch all badges
  const { data: badges, error: badgesError } = await adminClient
    .from("badges")
    .select("id, slug, name, icon");

  // Fetch total user count
  const { count: totalUsers } = await adminClient
    .from("users")
    .select("id", { count: "exact", head: true });

  // Fetch all user_badges with earner info, ordered by most recent first
  const { data: userBadges } = await adminClient
    .from("user_badges")
    .select("badge_id, earned_at, users(name)")
    .order("earned_at", { ascending: false });

  // Aggregate per badge: count + most recent earner
  const badgeStats = new Map<
    string,
    { count: number; recentName: string | null; recentDate: string | null }
  >();

  for (const ub of userBadges ?? []) {
    const existing = badgeStats.get(ub.badge_id) ?? {
      count: 0,
      recentName: null,
      recentDate: null,
    };
    existing.count += 1;

    // First entry per badge_id is the most recent (sorted desc)
    if (existing.recentDate === null) {
      const usersRaw = ub.users;
      const name = Array.isArray(usersRaw)
        ? (usersRaw[0] as { name: string | null } | undefined)?.name ?? null
        : (usersRaw as { name: string | null } | null)?.name ?? null;
      existing.recentName = name;
      existing.recentDate = ub.earned_at ?? null;
    }

    badgeStats.set(ub.badge_id, existing);
  }

  const total = totalUsers ?? 0;

  const rows: BadgeRow[] = (badges ?? [])
    .map((b) => {
      const stats = badgeStats.get(b.id) ?? {
        count: 0,
        recentName: null,
        recentDate: null,
      };
      return {
        id: b.id,
        slug: b.slug,
        name: b.name,
        icon: b.icon,
        category: BADGE_CATEGORY[b.slug] ?? "Altele",
        earnedCount: stats.count,
        earnedPct: total > 0 ? Math.round((stats.count / total) * 100) : null,
        recentEarnerName: stats.recentName,
        recentEarnerDate: stats.recentDate,
      };
    })
    .sort((a, b) => b.earnedCount - a.earnedCount);

  const totalEarned = rows.reduce((sum, r) => sum + r.earnedCount, 0);
  const mostEarned = rows[0] ?? null;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Badge-uri</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {rows.length} badge-uri · {totalEarned.toLocaleString("ro-RO")} acordări totale
        </p>
      </div>

      {badgesError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          Eroare la încărcarea badge-urilor: {badgesError.message}
        </div>
      )}

      {/* Summary cards */}
      {rows.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                <Award className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Total badge-uri</span>
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">{rows.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                <Award className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Total acordări</span>
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {totalEarned.toLocaleString("ro-RO")}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                <Award className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Cel mai câștigat</span>
            </div>
            <p className="text-sm font-bold text-foreground truncate">
              {mostEarned ? `${mostEarned.icon} ${mostEarned.name}` : "—"}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Badge</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Categorie</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Câștigat</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">% Useri</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ultimul câștigător</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    Niciun badge disponibil.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl leading-none">{row.icon}</span>
                        <div>
                          <p className="font-medium text-foreground">{row.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{row.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          CATEGORY_COLOR[row.category] ?? "bg-muted text-muted-foreground"
                        }`}
                      >
                        {row.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium text-foreground">
                      {row.earnedCount.toLocaleString("ro-RO")}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">
                      {row.earnedPct !== null ? `${row.earnedPct}%` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {row.recentEarnerName ? (
                        <div>
                          <p className="text-sm text-foreground font-medium truncate max-w-[140px]">
                            {row.recentEarnerName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(row.recentEarnerDate)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
