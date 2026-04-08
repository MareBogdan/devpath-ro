import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LEVEL_NAMES } from "@/lib/gamification-constants";

interface LeaderboardRow {
  user_id: string;
  name: string | null;
  avatar_url: string | null;
  level: number;
  weekly_xp: number;
}

export default async function LeaderboardPage() {
  const supabase = createSupabaseServerClient();
  const { data: rows } = await supabase.rpc("get_weekly_leaderboard");

  const topRows = (rows as LeaderboardRow[] | null) ?? [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Clasament săptămânal</h1>
      <p className="text-muted-foreground mb-8">
        Top 10 utilizatori după XP câștigat în această săptămână.
      </p>

      <div className="space-y-3">
        {topRows.map((row, idx) => (
          <div
            key={row.user_id}
            className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${
              idx === 0
                ? "border-yellow-400/60 bg-yellow-50/5"
                : idx === 1
                ? "border-slate-400/60 bg-slate-50/5"
                : idx === 2
                ? "border-orange-400/60 bg-orange-50/5"
                : "border-border bg-card"
            }`}
          >
            <span className="w-8 text-center font-bold text-lg text-muted-foreground">
              {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
            </span>
            <Avatar className="h-9 w-9">
              <AvatarImage src={row.avatar_url ?? ""} />
              <AvatarFallback>{(row.name ?? "?")[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{row.name ?? "Utilizator"}</p>
              <p className="text-xs text-muted-foreground">
                Nivel {row.level} — {LEVEL_NAMES[row.level] ?? "Necunoscut"}
              </p>
            </div>
            <span className="font-bold text-primary">{row.weekly_xp} XP</span>
          </div>
        ))}
        {topRows.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            Nimeni nu a câștigat XP această săptămână. Fii primul!
          </p>
        )}
      </div>
    </div>
  );
}
