"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";

interface ActivityHeatmapCardProps {
  completionDates: string[]; // ISO timestamps
}

const DAYS_PER_WEEK = 7;
const WEEKS = 52;

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function intensityClass(count: number): string {
  if (count === 0) return "bg-muted";
  if (count === 1) return "bg-aurora-primary-500/30";
  if (count === 2) return "bg-aurora-primary-500/55";
  if (count <= 4) return "bg-aurora-primary-500/80";
  return "bg-aurora-primary-500";
}

export function ActivityHeatmapCard({ completionDates }: ActivityHeatmapCardProps) {
  // Build a map: date string → completion count
  const counts = new Map<string, number>();
  for (const iso of completionDates) {
    const k = dateKey(new Date(iso));
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }

  // Walk back 52 weeks * 7 days from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cells: { date: string; count: number }[] = [];
  const start = new Date(today);
  start.setDate(start.getDate() - (WEEKS * DAYS_PER_WEEK - 1));

  for (let i = 0; i < WEEKS * DAYS_PER_WEEK; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const k = dateKey(d);
    cells.push({ date: k, count: counts.get(k) ?? 0 });
  }

  // Group into weeks (columns)
  const columns: { date: string; count: number }[][] = [];
  for (let w = 0; w < WEEKS; w++) {
    columns.push(cells.slice(w * DAYS_PER_WEEK, (w + 1) * DAYS_PER_WEEK));
  }

  const total = completionDates.length;
  const activeDays = Array.from(counts.values()).filter((c) => c > 0).length;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-aurora-accent-500/10">
          <Activity className="h-4 w-4 text-aurora-accent-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground leading-tight">
            Activitate
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ultimele 52 săptămâni · {total} lecții completate · {activeDays} zile active
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex gap-[3px] min-w-fit"
          aria-label="Calendar activitate ultimele 52 săptămâni"
        >
          {columns.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((cell) => (
                <div
                  key={cell.date}
                  className={`h-3 w-3 rounded-sm ${intensityClass(cell.count)}`}
                  title={`${cell.date} — ${cell.count} ${cell.count === 1 ? "lecție" : "lecții"}`}
                />
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
        <span>Mai puțin</span>
        <div className="h-3 w-3 rounded-sm bg-muted" />
        <div className="h-3 w-3 rounded-sm bg-aurora-primary-500/30" />
        <div className="h-3 w-3 rounded-sm bg-aurora-primary-500/55" />
        <div className="h-3 w-3 rounded-sm bg-aurora-primary-500/80" />
        <div className="h-3 w-3 rounded-sm bg-aurora-primary-500" />
        <span>Mai mult</span>
      </div>
    </div>
  );
}
