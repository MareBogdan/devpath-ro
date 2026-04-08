"use client";

import { motion } from "framer-motion";

interface RadarModule {
  name: string;
  value: number; // 0–1
}

interface LearningDnaRadarProps {
  modules: RadarModule[];
}

const CX = 240;
const CY = 200;
const R = 130;
const LABEL_R = 170;
const GRID_LEVELS = [0.2, 0.4, 0.6, 0.8, 1];

function angle(i: number): number {
  return ((i * 60 - 90) * Math.PI) / 180;
}

function point(r: number, i: number): [number, number] {
  return [CX + r * Math.cos(angle(i)), CY + r * Math.sin(angle(i))];
}

function hexPoints(scale: number): string {
  return Array.from({ length: 6 }, (_, i) => point(R * scale, i))
    .map(([x, y]) => `${x},${y}`)
    .join(" ");
}

function labelAnchor(i: number): "start" | "middle" | "end" {
  // 6 positions: 0=top, 1=top-right, 2=bottom-right, 3=bottom, 4=bottom-left, 5=top-left
  if (i === 1 || i === 2) return "start";
  if (i === 4 || i === 5) return "end";
  return "middle";
}

function splitLabel(name: string): string[] {
  const words = name.split(" ");
  if (words.length <= 1 || name.length <= 10) return [name];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

export function LearningDnaRadar({ modules }: LearningDnaRadarProps) {
  const count = modules.length;

  const dataPoints = Array.from({ length: count }, (_, i) => {
    const [x, y] = point(R * Math.max(0, modules[i]?.value ?? 0), i);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        viewBox="0 0 480 400"
        className="w-full max-w-md"
        style={{ overflow: "visible" }}
      >
        {/* Background grid */}
        {GRID_LEVELS.map((scale) => (
          <polygon
            key={scale}
            points={hexPoints(scale)}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={scale === 1 ? 1 : 0.5}
          />
        ))}

        {/* Axis lines */}
        {Array.from({ length: count }, (_, i) => {
          const [x, y] = point(R, i);
          return (
            <line
              key={i}
              x1={CX}
              y1={CY}
              x2={x}
              y2={y}
              stroke="hsl(var(--border))"
              strokeWidth={0.5}
            />
          );
        })}

        {/* Grid scale labels */}
        {GRID_LEVELS.map((scale) => (
          <text
            key={scale}
            x={CX + 3}
            y={CY - R * scale + 4}
            fontSize={8}
            style={{ fill: "hsl(var(--muted-foreground))" }}
          >
            {Math.round(scale * 100)}%
          </text>
        ))}

        {/* Animated data polygon */}
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.15,
          }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        >
          <polygon
            points={dataPoints}
            fill="hsl(var(--primary) / 0.15)"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            strokeLinejoin="round"
          />
          {/* Data point dots */}
          {Array.from({ length: count }, (_, i) => {
            const [x, y] = point(R * Math.max(0, modules[i]?.value ?? 0), i);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={3.5}
                fill="hsl(var(--primary))"
              />
            );
          })}
        </motion.g>

        {/* Axis labels */}
        {modules.map((module, i) => {
          const [x, y] = point(LABEL_R, i);
          const anchor = labelAnchor(i);
          const lines = splitLabel(module.name);
          const lineHeight = 13;
          const totalH = lines.length * lineHeight;
          const startY = y - totalH / 2 + lineHeight / 2;

          return (
            <text
              key={i}
              x={x}
              y={startY}
              textAnchor={anchor}
              fontSize={10}
              fontWeight={500}
              style={{ fill: "hsl(var(--foreground))" }}
            >
              {lines.map((line, li) => (
                <tspan key={li} x={x} dy={li === 0 ? 0 : lineHeight}>
                  {line}
                </tspan>
              ))}
            </text>
          );
        })}

        {/* Center label */}
        <text
          x={CX}
          y={CY + 4}
          textAnchor="middle"
          fontSize={8}
          style={{ fill: "hsl(var(--muted-foreground))" }}
        >
          ADN
        </text>
      </svg>

      {/* Module completion percentages */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-w-md">
        {modules.map((m) => (
          <div key={m.name} className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground truncate">{m.name}</p>
              <div className="mt-0.5 h-1.5 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${Math.round(m.value * 100)}%` }}
                />
              </div>
            </div>
            <span className="text-xs font-medium text-muted-foreground shrink-0">
              {Math.round(m.value * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
