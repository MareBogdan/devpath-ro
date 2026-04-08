import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Users, Activity, BookCheck, Zap } from "lucide-react";

interface AdminStats {
  total_users: number;
  active_today: number;
  total_completions: number;
  total_xp_awarded: number;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export default async function AdminPage() {
  const supabase = createSupabaseServerClient();

  const { data: rpcData, error } = await supabase.rpc("get_admin_stats");

  const stats: AdminStats = error || !rpcData
    ? { total_users: 0, active_today: 0, total_completions: 0, total_xp_awarded: 0 }
    : (rpcData as AdminStats);

  const cards = [
    {
      label: "Total Useri",
      value: formatNumber(stats.total_users),
      raw: stats.total_users,
      sub: "înregistrați pe platformă",
      icon: Users,
      color: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
    },
    {
      label: "Activi Azi",
      value: formatNumber(stats.active_today),
      raw: stats.active_today,
      sub: "utilizatori activi astăzi",
      icon: Activity,
      color: "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-400",
    },
    {
      label: "Lecții Completate",
      value: formatNumber(stats.total_completions),
      raw: stats.total_completions,
      sub: "completări totale",
      icon: BookCheck,
      color: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400",
    },
    {
      label: "XP Total Acordat",
      value: formatNumber(stats.total_xp_awarded),
      raw: stats.total_xp_awarded,
      sub: "puncte XP distribuite",
      icon: Zap,
      color: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400",
    },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Statistici platformă</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Date în timp real din baza de date DevPath RO.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          Funcția RPC <code>get_admin_stats</code> nu a fost găsită. Rulează migrarea SQL mai întâi.
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, sub, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-xl bg-card border border-border p-5 hover:border-amber-200 dark:hover:border-amber-900 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-muted-foreground leading-tight">
                {label}
              </span>
            </div>
            <p className="text-3xl font-bold text-foreground tabular-nums">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Placeholder for future charts */}
      <div className="mt-8 rounded-xl border border-dashed border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Grafice și tabele detaliate disponibile în secțiunile din bara laterală.
        </p>
      </div>
    </div>
  );
}
