"use client";

import { useState, useRef } from "react";

interface ActivityHeatmapProps {
  completionDates: string[]; // "YYYY-MM-DD" strings
}

const CELL = 13;
const GAP = 2;
const STEP = CELL + GAP;
const WEEKS = 52;
const DAYS = 7;
const DAY_LABEL_W = 24;
const MONTH_ROW_H = 18;

const DAY_LABELS = ["", "Lun", "", "Mie", "", "Vin", ""];
const MONTH_ABBR = [
  "Ian", "Feb", "Mar", "Apr", "Mai", "Iun",
  "Iul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

type CellData = { date: string; count: number; future: boolean };

function buildGrid(dateCountMap: Map<string, number>): {
  cells: CellData[][];
  monthLabels: { col: number; label: string }[];
} {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  // Start from Sunday 52 weeks ago
  const start = new Date(today);
  start.setDate(start.getDate() - WEEKS * DAYS + 1);
  start.setDate(start.getDate() - start.getDay()); // rewind to Sunday

  const cells: CellData[][] = [];
  const monthLabels: { col: number; label: string }[] = [];

  for (let col = 0; col < WEEKS; col++) {
    cells[col] = [];
    for (let row = 0; row < DAYS; row++) {
      const d = new Date(start);
      d.setDate(start.getDate() + col * 7 + row);
      const dateStr = d.toISOString().split("T")[0];
      cells[col][row] = {
        date: dateStr,
        count: dateCountMap.get(dateStr) ?? 0,
        future: d > today,
      };
    }
    // Month label at first day of each column
    const colStart = new Date(cells[col][0].date);
    if (colStart.getDate() <= 7) {
      const label = MONTH_ABBR[colStart.getMonth()];
      const last = monthLabels[monthLabels.length - 1];
      if (!last || last.label !== label) {
        monthLabels.push({ col, label });
      }
    }
  }

  return { cells, monthLabels };
}

function cellFill(count: number, future: boolean): string {
  if (future) return "hsl(var(--border))";
  if (count === 0) return "hsl(var(--border))";
  if (count === 1) return "hsl(142, 60%, 75%)";
  if (count === 2) return "hsl(142, 70%, 55%)";
  return "hsl(142, 80%, 35%)";
}

function cellOpacity(future: boolean): number {
  return future ? 0.35 : 1;
}

export function ActivityHeatmap({ completionDates }: ActivityHeatmapProps) {
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const dateCountMap = new Map<string, number>();
  for (const d of completionDates) {
    dateCountMap.set(d, (dateCountMap.get(d) ?? 0) + 1);
  }

  const { cells, monthLabels } = buildGrid(dateCountMap);
  const svgW = DAY_LABEL_W + WEEKS * STEP;
  const svgH = MONTH_ROW_H + DAYS * STEP;

  function handleMouseEnter(
    e: React.MouseEvent<SVGRectElement>,
    cell: CellData
  ) {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const el = e.currentTarget.getBoundingClientRect();
    const count = cell.count;
    const text =
      count === 0
        ? `${cell.date}: nicio activitate`
        : `${cell.date}: ${count} lecție${count !== 1 ? "i" : ""}`;
    setTooltip({
      text,
      x: el.left - rect.left + CELL / 2,
      y: el.top - rect.top,
    });
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          width={svgW}
          height={svgH}
          style={{ maxWidth: "100%", display: "block" }}
        >
          {/* Month labels */}
          {monthLabels.map(({ col, label }) => (
            <text
              key={`m-${col}`}
              x={DAY_LABEL_W + col * STEP}
              y={MONTH_ROW_H - 5}
              fontSize={9}
              style={{ fill: "hsl(var(--muted-foreground))" }}
            >
              {label}
            </text>
          ))}

          {/* Day labels */}
          {DAY_LABELS.map(
            (label, row) =>
              label && (
                <text
                  key={`d-${row}`}
                  x={0}
                  y={MONTH_ROW_H + row * STEP + CELL - 1}
                  fontSize={9}
                  style={{ fill: "hsl(var(--muted-foreground))" }}
                >
                  {label}
                </text>
              )
          )}

          {/* Cells */}
          {cells.map((col, colIdx) =>
            col.map((cell, rowIdx) => (
              <rect
                key={`${colIdx}-${rowIdx}`}
                x={DAY_LABEL_W + colIdx * STEP}
                y={MONTH_ROW_H + rowIdx * STEP}
                width={CELL}
                height={CELL}
                rx={2}
                ry={2}
                fill={cellFill(cell.count, cell.future)}
                opacity={cellOpacity(cell.future)}
                className="cursor-default"
                onMouseEnter={(e) => handleMouseEnter(e, cell)}
                onMouseLeave={() => setTooltip(null)}
              />
            ))
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground select-none">
        <span>Mai puțin</span>
        {[
          "hsl(var(--border))",
          "hsl(142,60%,75%)",
          "hsl(142,70%,55%)",
          "hsl(142,80%,35%)",
        ].map((color) => (
          <svg key={color} width={13} height={13} style={{ flexShrink: 0 }}>
            <rect width={13} height={13} rx={2} fill={color} />
          </svg>
        ))}
        <span>Mai mult</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full px-2 py-1 rounded text-xs bg-popover text-popover-foreground border border-border shadow-md whitespace-nowrap"
          style={{ left: tooltip.x, top: tooltip.y - 6 }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
