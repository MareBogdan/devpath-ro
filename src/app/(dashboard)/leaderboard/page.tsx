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

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const currentUserId = user?.id ?? null;

  // Weekly top 10 via SECURITY DEFINER RPC (other users' rows are not readable directly).
  const { data: rows, error } = await supabase.rpc("get_weekly_leaderboard");

  const topRows = (rows as LeaderboardRow[] | null) ?? [];
  const meInTop = currentUserId
    ? topRows.some((r) => r.user_id === currentUserId)
    : false;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Clasament săptămânal</h1>
      <p className="text-muted-foreground mb-8">
        Top 10 utilizatori după XP câștigat în această săptămână.
      </p>

      {error && (
        <p
          role="alert"
          className="mb-6 rounded-lg border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300"
        >
          Clasamentul nu a putut fi încărcat acum. Încearcă din nou puțin mai târziu.
        </p>
      )}

      <div className="space-y-3" data-testid="leaderboard-list">
        {topRows.map((row, idx) => {
          const isMe = row.user_id === currentUserId;
          return (
            <div
              key={row.user_id}
              data-current-user={isMe ? "true" : undefined}
              aria-current={isMe ? "true" : undefined}
              className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${
                isMe
                  ? "border-primary bg-primary/10 ring-2 ring-primary/40"
                  : idx === 0
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
                <p className="font-medium truncate">
                  {row.name ?? "Utilizator"}
                  {isMe && (
                    <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                      Tu
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  Nivel {row.level} — {LEVEL_NAMES[row.level] ?? "Necunoscut"}
                </p>
              </div>
              <span className="font-bold text-primary">{row.weekly_xp} XP</span>
            </div>
          );
        })}

        {!error && topRows.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            Nimeni nu a câștigat XP această săptămână. Fii primul!
          </p>
        )}
      </div>

      {/* The current user earned nothing this week (or isn't in the top 10) */}
      {!error && currentUserId && !meInTop && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {topRows.length === 0
            ? "Completează o lecție ca să apari în clasament."
            : "Nu ești încă în top 10 săptămâna aceasta — completează o lecție ca să urci."}
        </p>
      )}
    </div>
  );
}
