import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Flame, Zap, Calendar } from "lucide-react";
import { LEVEL_NAMES } from "@/lib/gamification-constants";

interface PortfolioHeaderProps {
  name: string;
  avatarUrl: string | null;
  level: number;
  xp: number;
  streak: number;
  joinDate: string;
  username: string;
}

function getInitials(name: string): string {
  return (
    name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "?"
  );
}

function formatJoinDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ro-RO", {
    month: "long",
    year: "numeric",
  });
}

export function PortfolioHeader({
  name,
  avatarUrl,
  level,
  xp,
  streak,
  joinDate,
  username,
}: PortfolioHeaderProps) {
  const levelName = LEVEL_NAMES[level] ?? "Curios";

  return (
    <div className="flex items-start gap-5 flex-wrap">
      <Avatar className="h-20 w-20 shrink-0 border-2 border-border">
        <AvatarImage src={avatarUrl ?? undefined} alt={name} />
        <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold text-foreground">{name}</h1>
          <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
            Niv. {level} · {levelName}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          devpath.ro/u/{username}
        </p>

        <div className="flex items-center gap-5 mt-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="font-semibold text-foreground">
              {xp.toLocaleString("ro-RO")}
            </span>
            <span className="text-muted-foreground">XP</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="font-semibold text-foreground">{streak}</span>
            <span className="text-muted-foreground">zile streak</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>Membru din {formatJoinDate(joinDate)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
