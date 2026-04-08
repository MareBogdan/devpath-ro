import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { Gamepad2, Star, Trophy, Zap } from "lucide-react";

const GAME_LABELS: Record<string, string> = {
  sort_concepts: "Sortează Conceptele",
  fill_blank: "Completează Spațiile",
  match_pairs: "Potrivește Perechile",
  true_false: "Adevărat sau Fals",
  build_network: "Construiește Rețeaua",
  write_prompt: "Scrie un Prompt",
};

// Ordered display list (known game types first)
const GAME_ORDER = [
  "sort_concepts",
  "fill_blank",
  "match_pairs",
  "true_false",
  "build_network",
  "write_prompt",
];

interface GameStats {
  gameType: string;
  totalSessions: number;
  avgScore: number | null;
  perfectCount: number;
  perfectRate: number | null;
}

export default async function AdminMinigamesPage() {
  const adminClient = createSupabaseAdminClient();

  const { data: sessions, error } = await adminClient
    .from("minigame_sessions")
    .select("game_type, score, perfect");

  // Aggregate by game_type in JS
  const statsMap = new Map<string, { scores: number[]; perfect: number; total: number }>();

  for (const s of sessions ?? []) {
    const existing = statsMap.get(s.game_type) ?? { scores: [], perfect: 0, total: 0 };
    existing.total += 1;
    if (typeof s.score === "number") existing.scores.push(s.score);
    if (s.perfect) existing.perfect += 1;
    statsMap.set(s.game_type, existing);
  }

  // Build rows — ordered by known game types first, then any unknown ones
  const knownRows: GameStats[] = GAME_ORDER.filter((gt) => statsMap.has(gt)).map((gt) => {
    const d = statsMap.get(gt)!;
    const avgScore =
      d.scores.length > 0
        ? Math.round(d.scores.reduce((a: number, b: number) => a + b, 0) / d.scores.length)
        : null;
    return {
      gameType: gt,
      totalSessions: d.total,
      avgScore,
      perfectCount: d.perfect,
      perfectRate: d.total > 0 ? Math.round((d.perfect / d.total) * 100) : null,
    };
  });

  // Any unknown game types not in GAME_ORDER
  const unknownRows: GameStats[] = Array.from(statsMap.entries())
    .filter(([gt]) => !GAME_ORDER.includes(gt))
    .map(([gt, d]) => {
      const avgScore =
        d.scores.length > 0
          ? Math.round(d.scores.reduce((a: number, b: number) => a + b, 0) / d.scores.length)
          : null;
      return {
        gameType: gt,
        totalSessions: d.total,
        avgScore,
        perfectCount: d.perfect,
        perfectRate: d.total > 0 ? Math.round((d.perfect / d.total) * 100) : null,
      };
    });

  const rows = [...knownRows, ...unknownRows];

  const totalSessions = rows.reduce((sum, r) => sum + r.totalSessions, 0);
  const totalPerfect = rows.reduce((sum, r) => sum + r.perfectCount, 0);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Mini-jocuri</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Statistici per tip de joc · {totalSessions.toLocaleString("ro-RO")} sesiuni totale
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          Eroare la încărcarea sesiunilor: {error.message}
        </div>
      )}

      {/* Summary cards */}
      {totalSessions > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                <Gamepad2 className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Total sesiuni</span>
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {totalSessions.toLocaleString("ro-RO")}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-yellow-100 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-400">
                <Star className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Scoruri perfecte</span>
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {totalPerfect.toLocaleString("ro-RO")}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400">
                <Zap className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Tipuri de jocuri</span>
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">{rows.length}</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Joc</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Sesiuni</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Scor mediu</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Perfecte</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Rată perfect</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground w-40">Distribuție</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    Nicio sesiune de mini-joc înregistrată.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const barWidth = totalSessions > 0
                    ? Math.round((row.totalSessions / totalSessions) * 100)
                    : 0;
                  return (
                    <tr key={row.gameType} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 shrink-0">
                            <Gamepad2 className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium text-foreground">
                            {GAME_LABELS[row.gameType] ?? row.gameType}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium text-foreground">
                        {row.totalSessions.toLocaleString("ro-RO")}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-foreground">
                        {row.avgScore !== null ? `${row.avgScore}%` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Trophy className="h-3 w-3 text-yellow-500" />
                          {row.perfectCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-foreground">
                        {row.perfectRate !== null ? `${row.perfectRate}%` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {/* CSS bar chart */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-amber-400 dark:bg-amber-500 transition-all"
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">
                            {barWidth}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
