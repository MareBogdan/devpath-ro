"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────

const V_MIN = 0;
const V_MAX = 5;
const V_STEP = 0.1;
const V_THRESHOLD = 2.0;
const V_PARTIAL = 1.5;

// Geometry — viewBox 520 × 400.
const C = {
  topY: 80,
  botY: 340,
  leftX: 80,
  rightX: 430,
  // Battery
  batLeft: 60,
  batRight: 100,
  batTop: 90,
  batBot: 140,
  // Resistor box
  resLeft: 414,
  resRight: 446,
  resTop: 108,
  resBot: 152,
  // LED
  ledCx: 430,
  ledCy: 198,
  ledR: 18,
  // Transistor
  transCx: 430,
  transCy: 275,
  transR: 28,
  transBgR: 42,
  transBarX: 416,
  transBarTop: 260,
  transBarBot: 290,
  baseStubX: 402,
  // Base wire + probe
  baseEndX: 220,
  // Ground
  groundX: 255,
} as const;

// The current loop, used by both static wire rendering and the pulse paths.
const LOOP_PATH = `M ${C.leftX} ${C.topY} L ${C.rightX} ${C.topY} L ${C.rightX} ${C.botY} L ${C.leftX} ${C.botY} Z`;

// Perimeter: 2 * ((430-80) + (340-80)) = 2 * (350 + 260) = 1220
const LOOP_LENGTH = 1220;
const PULSE_GAP = 60;
const PULSE_INVISIBLE = LOOP_LENGTH - PULSE_GAP;
const PULSE_DURATION_S = 3;

// ─── Helpers ──────────────────────────────────────────────────────────────

type Region = "off" | "partial" | "on";

function classifyRegion(v: number): Region {
  if (v < V_PARTIAL) return "off";
  if (v < V_THRESHOLD) return "partial";
  return "on";
}

// ─── Sub-components ──────────────────────────────────────────────────────

function StatusIndicator({ isOn, reduced }: { isOn: boolean; reduced: boolean }) {
  return (
    <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em]">
      <span
        className={cn(
          "relative inline-flex h-2 w-2 rounded-full",
          isOn ? "bg-[#00FF94]" : "bg-[#FF6B6B]"
        )}
      >
        {!reduced && (
          <span
            aria-hidden
            className={cn(
              "absolute inset-0 rounded-full",
              isOn ? "bg-[#00FF94]" : "bg-[#FF6B6B]",
              "tl-blink"
            )}
          />
        )}
      </span>
      <span
        className={cn(
          "uppercase",
          isOn ? "text-[#00FF94]" : "text-[#FF6B6B]"
        )}
      >
        {isOn ? "Circuit Active" : "Circuit Open"}
      </span>
    </div>
  );
}

function CornerBrackets() {
  return (
    <g stroke="#6C5CE7" strokeWidth="1" fill="none" opacity="0.35">
      <path d="M 6 6 L 22 6 M 6 6 L 6 22" />
      <path d="M 514 6 L 498 6 M 514 6 L 514 22" />
      <path d="M 6 394 L 22 394 M 6 394 L 6 378" />
      <path d="M 514 394 L 498 394 M 514 394 L 514 378" />
    </g>
  );
}

function RegionBars({ region }: { region: Region }) {
  const items: { id: Region; label: string; color: string; glow: string }[] = [
    {
      id: "off",
      label: "OFF",
      color: "bg-[#FF6B6B]",
      glow: "shadow-[0_0_10px_rgba(255,107,107,0.7)]",
    },
    {
      id: "partial",
      label: "PARTIAL",
      color: "bg-[#FDCB6E]",
      glow: "shadow-[0_0_10px_rgba(253,203,110,0.7)]",
    },
    {
      id: "on",
      label: "SATURATION",
      color: "bg-[#00CEC9]",
      glow: "shadow-[0_0_10px_rgba(0,206,201,0.8)]",
    },
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((it) => {
        const active = it.id === region;
        return (
          <div key={it.id} className="flex flex-col gap-1.5">
            <div
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                active ? `${it.color} ${it.glow}` : "bg-white/[0.06]"
              )}
            />
            <p
              className={cn(
                "font-mono text-[9px] uppercase tracking-[0.18em] transition-colors duration-300",
                active
                  ? it.id === "off"
                    ? "text-[#FF6B6B]"
                    : it.id === "partial"
                    ? "text-[#FDCB6E]"
                    : "text-[#00CEC9]"
                  : "text-white/30"
              )}
            >
              {it.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function Oscilloscope({ isOn, reduced }: { isOn: boolean; reduced: boolean }) {
  // Square wave path repeats every 40 units. Path covers x = -40 to 240 so the
  // -40 → 0 translation hides the seam.
  const wavePath =
    "M -40 45 L -20 45 L -20 15 L 0 15 L 0 45 L 20 45 L 20 15 L 40 15 L 40 45 L 60 45 L 60 15 L 80 15 L 80 45 L 100 45 L 100 15 L 120 15 L 120 45 L 140 45 L 140 15 L 160 15 L 160 45 L 180 45 L 180 15 L 200 15 L 200 45 L 220 45 L 220 15 L 240 15";
  return (
    <div className="rounded-sm border border-[#6C5CE7]/30 bg-[#0a0a14] p-3">
      <div className="mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-[#6C5CE7]/70">
        <span className="flex items-center gap-1.5">
          <Activity className="h-3 w-3" aria-hidden />
          I_collector × T
        </span>
        <span>CH1</span>
      </div>
      <svg
        viewBox="0 0 200 60"
        className="block h-12 w-full overflow-hidden"
        preserveAspectRatio="none"
      >
        {/* Grid */}
        <g stroke="#6C5CE7" strokeWidth="0.3" opacity="0.18">
          {[0, 50, 100, 150, 200].map((x) => (
            <line key={x} x1={x} y1={0} x2={x} y2={60} />
          ))}
          {[15, 30, 45].map((y) => (
            <line key={y} x1={0} y1={y} x2={200} y2={y} />
          ))}
        </g>
        {/* Center reference */}
        <line
          x1={0}
          y1={30}
          x2={200}
          y2={30}
          stroke="#6C5CE7"
          strokeWidth="0.5"
          strokeDasharray="2 3"
          opacity="0.3"
        />
        {/* Flat line (OFF) */}
        <line
          x1={0}
          y1={45}
          x2={200}
          y2={45}
          stroke="#FF6B6B"
          strokeWidth="1.5"
          opacity={isOn ? 0 : 0.85}
          style={{ transition: "opacity 300ms" }}
        />
        {/* Square wave (ON) */}
        <g
          className={cn(!reduced && isOn ? "tl-osc-animate" : "")}
          style={{ opacity: isOn ? 1 : 0, transition: "opacity 300ms" }}
        >
          <path
            d={wavePath}
            fill="none"
            stroke="#00CEC9"
            strokeWidth="1.5"
            strokeLinejoin="miter"
            style={{ filter: "drop-shadow(0 0 3px rgba(0,206,201,0.7))" }}
          />
        </g>
      </svg>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────

export function TransistorLab() {
  const [voltage, setVoltage] = useState<number>(0);
  const reduced = useReducedMotion() ?? false;
  const uid = useId();

  const ids = useMemo(
    () => ({
      loop: `${uid}-loop`,
      grid: `${uid}-grid`,
      glow: `${uid}-glow`,
      ledRadial: `${uid}-led-radial`,
      probeRadial: `${uid}-probe-radial`,
    }),
    [uid]
  );

  const region = useMemo(() => classifyRegion(voltage), [voltage]);
  const isOn = region === "on";
  const voltageActive = voltage >= V_PARTIAL;

  // Track previous on-state for one-shot surge events.
  const wasOnRef = useRef<boolean>(false);
  const [surge, setSurge] = useState<{
    key: number;
    direction: "on" | "off";
  } | null>(null);

  useEffect(() => {
    if (wasOnRef.current === isOn) return;
    const prev = wasOnRef.current;
    wasOnRef.current = isOn;
    if (reduced) return;
    setSurge({ key: Date.now(), direction: isOn ? "on" : "off" });
    // No prior ON → no flicker on initial mount.
    if (!isOn && !prev) {
      setSurge(null);
    }
  }, [isOn, reduced]);

  // Auto-clear surge after the longest sub-animation finishes.
  useEffect(() => {
    if (!surge) return;
    const t = setTimeout(() => setSurge(null), 900);
    return () => clearTimeout(t);
  }, [surge]);

  const fillPct = ((voltage - V_MIN) / (V_MAX - V_MIN)) * 100;
  const thresholdPct = ((V_THRESHOLD - V_MIN) / (V_MAX - V_MIN)) * 100;

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setVoltage(Number(e.target.value));
  }, []);

  const readoutColor =
    region === "off"
      ? "#5a5e6e"
      : region === "partial"
      ? "#FDCB6E"
      : "#00CEC9";

  const stateLabel =
    region === "off"
      ? "STATE: BLOCKED  //  I_ce ≈ 0"
      : region === "partial"
      ? "STATE: TRANSITION  //  V_be < V_th"
      : "STATE: SATURATION  //  I_ce = MAX";

  return (
    <div className="my-10">
      <style>{CSS_STYLES}</style>

      <div
        className="relative border-y border-[#6C5CE7]/40 bg-[#080810] text-foreground"
        style={{ boxShadow: "0 0 40px rgba(108,92,231,0.15)" }}
      >
        {/* Scanlines overlay */}
        {!reduced && (
          <div
            aria-hidden
            className="tl-scanlines pointer-events-none absolute inset-0 z-0"
          />
        )}

        {/* Border flash on ON surge */}
        <AnimatePresence>
          {surge?.direction === "on" && (
            <motion.div
              key={`border-${surge.key}`}
              aria-hidden
              className="pointer-events-none absolute inset-0 z-30 border-2 border-[#00CEC9]"
              style={{
                boxShadow:
                  "0 0 60px rgba(0,206,201,0.55), inset 0 0 60px rgba(0,206,201,0.35)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.32, times: [0, 0.4, 1] }}
            />
          )}
        </AnimatePresence>

        {/* Header bar */}
        <div className="relative z-10 flex items-center justify-between gap-4 border-b border-[#6C5CE7]/20 bg-gradient-to-r from-[#6C5CE7]/[0.06] via-transparent to-[#00CEC9]/[0.04] px-5 py-2.5">
          <span className="font-mono text-[10px] tracking-[0.18em] text-[#6C5CE7]/70">
            LAB_008 // TRANSISTOR_NPN
          </span>
          <StatusIndicator isOn={isOn} reduced={reduced} />
        </div>

        {/* Main grid */}
        <div className="relative z-10 grid grid-cols-1 gap-6 px-5 pb-6 pt-5 lg:grid-cols-[1.4fr_1fr]">
          {/* ─── LEFT: SVG circuit ───────────────────────────────── */}
          <div className="relative overflow-hidden border border-[#6C5CE7]/20 bg-[#06060c]">
            <svg
              viewBox="0 0 520 400"
              className="block h-auto w-full"
              role="img"
              aria-label={`Circuit cu tranzistor, V_gate ${voltage.toFixed(1)} volți, ${isOn ? "saturat" : region === "partial" ? "tranziție" : "blocat"}`}
            >
              <defs>
                <pattern
                  id={ids.grid}
                  patternUnits="userSpaceOnUse"
                  width="26"
                  height="26"
                >
                  <circle cx="13" cy="13" r="0.8" fill="#1a1a26" />
                </pattern>

                <filter
                  id={ids.glow}
                  x="-100%"
                  y="-100%"
                  width="300%"
                  height="300%"
                >
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <radialGradient id={ids.ledRadial} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="35%" stopColor="#FDCB6E" stopOpacity="1" />
                  <stop offset="100%" stopColor="#F39C12" stopOpacity="0.85" />
                </radialGradient>

                <radialGradient
                  id={ids.probeRadial}
                  cx="50%"
                  cy="50%"
                  r="50%"
                >
                  <stop offset="0%" stopColor="#a89bf5" stopOpacity="1" />
                  <stop offset="100%" stopColor="#6C5CE7" stopOpacity="1" />
                </radialGradient>

                <path id={ids.loop} d={LOOP_PATH} />
              </defs>

              {/* Background grid */}
              <rect width="520" height="400" fill={`url(#${ids.grid})`} />

              {/* HUD corner brackets */}
              <CornerBrackets />

              {/* HUD coords */}
              <text
                x={12}
                y={36}
                fontSize="8"
                fontFamily="ui-monospace, monospace"
                fill="#6C5CE7"
                fillOpacity="0.5"
              >
                x:080  y:080
              </text>
              <text
                x={482}
                y={36}
                fontSize="8"
                fontFamily="ui-monospace, monospace"
                fill="#6C5CE7"
                fillOpacity="0.5"
              >
                x:430  y:080
              </text>

              {/* ─── Wires (single rectangular loop) ─── */}
              <path
                d={LOOP_PATH}
                fill="none"
                stroke={isOn ? "#00CEC9" : "#1a1a2e"}
                strokeWidth={2}
                style={{
                  filter: isOn
                    ? "drop-shadow(0 0 4px #00CEC9)"
                    : undefined,
                  transition:
                    "stroke 400ms ease, filter 400ms ease",
                }}
              />

              {/* Pulses — 3 staggered glowing segments traveling around the loop */}
              {!reduced &&
                [0, -1, -2].map((delay, i) => (
                  <path
                    key={i}
                    d={LOOP_PATH}
                    fill="none"
                    stroke="#00CEC9"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeDasharray={`${PULSE_GAP} ${PULSE_INVISIBLE}`}
                    style={{
                      animation: `tl-pulse-flow ${PULSE_DURATION_S}s linear infinite ${delay}s`,
                      filter: "drop-shadow(0 0 6px #00CEC9)",
                      opacity: isOn ? 1 : 0,
                      transition: "opacity 400ms ease",
                    }}
                  />
                ))}

              {/* ─── Base control wire (violet, distinct from current) ─── */}
              <line
                x1={C.baseStubX}
                y1={C.transCy}
                x2={C.baseEndX}
                y2={C.transCy}
                stroke={voltageActive ? "#6C5CE7" : "#1a1a2e"}
                strokeWidth={2}
                style={{
                  filter: voltageActive
                    ? "drop-shadow(0 0 4px #6C5CE7)"
                    : undefined,
                  transition:
                    "stroke 400ms ease, filter 400ms ease",
                }}
              />

              {/* ─── Battery ─── */}
              <g>
                <rect
                  x={C.batLeft}
                  y={C.batTop}
                  width={C.batRight - C.batLeft}
                  height={C.batBot - C.batTop}
                  rx={3}
                  fill="#0d0d18"
                  stroke="#FDCB6E"
                  strokeWidth={1.5}
                  strokeOpacity={0.55}
                />
                <text
                  x={(C.batLeft + C.batRight) / 2}
                  y={C.batTop + 18}
                  fontSize="11"
                  fontFamily="ui-monospace, monospace"
                  fill="#FDCB6E"
                  textAnchor="middle"
                  fontWeight={600}
                >
                  ⚡
                </text>
                <text
                  x={(C.batLeft + C.batRight) / 2}
                  y={C.batTop + 36}
                  fontSize="11"
                  fontFamily="ui-monospace, monospace"
                  fill="#FDCB6E"
                  textAnchor="middle"
                  fontWeight={700}
                >
                  5V
                </text>
                <text
                  x={C.batLeft - 4}
                  y={C.batTop - 4}
                  fontSize="8"
                  fontFamily="ui-monospace, monospace"
                  fill="#6C5CE7"
                  fillOpacity="0.6"
                  textAnchor="start"
                >
                  V_SRC
                </text>
              </g>

              {/* ─── Resistor box ─── */}
              <g>
                <rect
                  x={C.resLeft}
                  y={C.resTop}
                  width={C.resRight - C.resLeft}
                  height={C.resBot - C.resTop}
                  rx={2}
                  fill="#0d0d18"
                  stroke={isOn ? "#00CEC9" : "#3a3a48"}
                  strokeWidth={1.5}
                  style={{
                    filter: isOn
                      ? "drop-shadow(0 0 6px #00CEC9)"
                      : undefined,
                    transition:
                      "stroke 400ms ease, filter 400ms ease",
                  }}
                />
                <text
                  x={(C.resLeft + C.resRight) / 2}
                  y={(C.resTop + C.resBot) / 2 - 2}
                  fontSize="10"
                  fontFamily="ui-monospace, monospace"
                  fill={isOn ? "#00CEC9" : "#7a7d8a"}
                  textAnchor="middle"
                  fontWeight={600}
                  style={{ transition: "fill 400ms ease" }}
                >
                  R₁
                </text>
                <text
                  x={(C.resLeft + C.resRight) / 2}
                  y={(C.resTop + C.resBot) / 2 + 10}
                  fontSize="8"
                  fontFamily="ui-monospace, monospace"
                  fill={isOn ? "#00CEC9" : "#7a7d8a"}
                  textAnchor="middle"
                  style={{ transition: "fill 400ms ease" }}
                >
                  1kΩ
                </text>
              </g>

              {/* ─── LED ─── */}
              <g>
                {/* Outer halo — pulses when on */}
                <motion.circle
                  cx={C.ledCx}
                  cy={C.ledCy}
                  r={C.ledR + 14}
                  fill="#FDCB6E"
                  filter={isOn ? `url(#${ids.glow})` : undefined}
                  animate={
                    isOn && !reduced
                      ? { scale: [0.4, 1, 0.4], opacity: [0.4, 0.8, 0.4] }
                      : { scale: isOn ? 1 : 0.4, opacity: isOn ? 0.5 : 0 }
                  }
                  transition={
                    isOn && !reduced
                      ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
                      : { duration: 0.4 }
                  }
                  style={{
                    transformBox: "fill-box",
                    transformOrigin: "center",
                  }}
                />

                {/* Body */}
                <circle
                  cx={C.ledCx}
                  cy={C.ledCy}
                  r={C.ledR}
                  fill={isOn ? `url(#${ids.ledRadial})` : "#0d0d18"}
                  stroke={isOn ? "#FDCB6E" : "#3a3a48"}
                  strokeWidth={1.5}
                  style={{
                    transition: "fill 300ms ease, stroke 300ms ease",
                  }}
                />

                {/* OFF state — dim X marker */}
                {!isOn && (
                  <g
                    stroke="#3a3a48"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    opacity={voltage < V_PARTIAL ? 1 : 0.55}
                    style={{ transition: "opacity 300ms ease" }}
                  >
                    <line
                      x1={C.ledCx - 7}
                      y1={C.ledCy - 7}
                      x2={C.ledCx + 7}
                      y2={C.ledCy + 7}
                    />
                    <line
                      x1={C.ledCx - 7}
                      y1={C.ledCy + 7}
                      x2={C.ledCx + 7}
                      y2={C.ledCy - 7}
                    />
                  </g>
                )}

                {/* ON state — inner white core */}
                {isOn && (
                  <circle
                    cx={C.ledCx}
                    cy={C.ledCy}
                    r={6}
                    fill="#ffffff"
                    opacity={0.95}
                  />
                )}

                {/* ON-surge: snap-up scale */}
                {surge?.direction === "on" && (
                  <motion.circle
                    key={`led-pop-${surge.key}`}
                    cx={C.ledCx}
                    cy={C.ledCy}
                    r={C.ledR}
                    fill="#ffffff"
                    initial={{ scale: 1, opacity: 0.9 }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.9, 0.7, 0] }}
                    transition={{
                      duration: 0.5,
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                    style={{
                      transformBox: "fill-box",
                      transformOrigin: "center",
                    }}
                  />
                )}

                {/* OFF-surge: flicker fade */}
                {surge?.direction === "off" && (
                  <motion.circle
                    key={`led-flicker-${surge.key}`}
                    cx={C.ledCx}
                    cy={C.ledCy}
                    r={C.ledR}
                    fill="#FDCB6E"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: [1, 0.3, 0.7, 0] }}
                    transition={{ duration: 0.4, times: [0, 0.3, 0.55, 1] }}
                  />
                )}

                {/* Light rays */}
                <g
                  opacity={isOn ? 1 : 0}
                  style={{ transition: "opacity 300ms ease" }}
                >
                  {[0, 60, 120, 180, 240, 300].map((deg) => {
                    const r1 = C.ledR + 4;
                    const r2 = C.ledR + 14;
                    const rad = (deg * Math.PI) / 180;
                    return (
                      <line
                        key={deg}
                        x1={C.ledCx + Math.cos(rad) * r1}
                        y1={C.ledCy + Math.sin(rad) * r1}
                        x2={C.ledCx + Math.cos(rad) * r2}
                        y2={C.ledCy + Math.sin(rad) * r2}
                        stroke="#FDCB6E"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        opacity={0.8}
                      />
                    );
                  })}
                </g>

                <text
                  x={C.ledCx + C.ledR + 10}
                  y={C.ledCy - 4}
                  fontSize="9"
                  fontFamily="ui-monospace, monospace"
                  fill={isOn ? "#FDCB6E" : "#6C5CE7"}
                  fillOpacity={isOn ? 1 : 0.6}
                  style={{ transition: "fill 300ms ease" }}
                >
                  D₁
                </text>
                <text
                  x={C.ledCx + C.ledR + 10}
                  y={C.ledCy + 8}
                  fontSize="8"
                  fontFamily="ui-monospace, monospace"
                  fill="#6C5CE7"
                  fillOpacity="0.55"
                >
                  λ=580nm
                </text>
              </g>

              {/* ─── Transistor ─── */}
              <g>
                {/* Violet bg */}
                <circle
                  cx={C.transCx}
                  cy={C.transCy}
                  r={C.transBgR}
                  fill="#6C5CE7"
                  fillOpacity="0.06"
                  stroke="#6C5CE7"
                  strokeWidth="1"
                  strokeOpacity="0.3"
                />

                {/* Body */}
                <circle
                  cx={C.transCx}
                  cy={C.transCy}
                  r={C.transR}
                  fill="#0d0d18"
                  stroke="#6C5CE7"
                  strokeWidth={1.5}
                  strokeOpacity={0.55}
                />

                {/* Base bar */}
                <line
                  x1={C.transBarX}
                  y1={C.transBarTop}
                  x2={C.transBarX}
                  y2={C.transBarBot}
                  stroke="#e5e5ec"
                  strokeWidth={3}
                  strokeLinecap="round"
                />

                {/* Collector (top-right diagonal) */}
                <line
                  x1={C.transBarX}
                  y1={C.transBarTop + 2}
                  x2={C.transCx}
                  y2={C.transCy - C.transR}
                  stroke={isOn ? "#00CEC9" : "#7a7d8a"}
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  style={{
                    filter: isOn
                      ? "drop-shadow(0 0 3px #00CEC9)"
                      : undefined,
                    transition: "stroke 400ms ease, filter 400ms ease",
                  }}
                />

                {/* Emitter (bottom-right diagonal) */}
                <line
                  x1={C.transBarX}
                  y1={C.transBarBot - 2}
                  x2={C.transCx}
                  y2={C.transCy + C.transR}
                  stroke={isOn ? "#00CEC9" : "#7a7d8a"}
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  style={{
                    filter: isOn
                      ? "drop-shadow(0 0 3px #00CEC9)"
                      : undefined,
                    transition: "stroke 400ms ease, filter 400ms ease",
                  }}
                />

                {/* Emitter arrowhead */}
                <polygon
                  points={`
                    ${C.transCx},${C.transCy + C.transR}
                    ${C.transCx - 8},${C.transCy + C.transR - 5}
                    ${C.transCx - 4},${C.transCy + C.transR - 11}
                  `}
                  fill={isOn ? "#00CEC9" : "#7a7d8a"}
                  style={{ transition: "fill 400ms ease" }}
                />

                {/* Base inside-circle stub */}
                <line
                  x1={C.baseStubX}
                  y1={C.transCy}
                  x2={C.transBarX}
                  y2={C.transCy}
                  stroke={voltageActive ? "#6C5CE7" : "#7a7d8a"}
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  style={{
                    filter: voltageActive
                      ? "drop-shadow(0 0 3px #6C5CE7)"
                      : undefined,
                    transition: "stroke 400ms ease, filter 400ms ease",
                  }}
                />

                {/* Terminal labels */}
                <text
                  x={C.transCx + C.transR + 8}
                  y={C.transCy - C.transR + 4}
                  fontSize="9"
                  fontFamily="ui-monospace, monospace"
                  fill="#9aa0aa"
                >
                  C
                </text>
                <text
                  x={C.transCx + C.transR + 8}
                  y={C.transCy + C.transR + 2}
                  fontSize="9"
                  fontFamily="ui-monospace, monospace"
                  fill="#9aa0aa"
                >
                  E
                </text>
                <text
                  x={C.baseStubX - 12}
                  y={C.transCy - 5}
                  fontSize="9"
                  fontFamily="ui-monospace, monospace"
                  fill="#9aa0aa"
                >
                  B
                </text>

                {/* Component label */}
                <text
                  x={C.transCx}
                  y={C.transCy + C.transBgR + 14}
                  fontSize="9"
                  fontFamily="ui-monospace, monospace"
                  fill="#6C5CE7"
                  fillOpacity="0.7"
                  textAnchor="middle"
                  fontWeight={600}
                >
                  Q₁ // 2N2222
                </text>
              </g>

              {/* ─── V_gate probe (diamond + floating label) ─── */}
              <g>
                {/* Floating data label */}
                <rect
                  x={C.baseEndX - 38}
                  y={C.transCy - 38}
                  width={76}
                  height={22}
                  rx={2}
                  fill="#080810"
                  stroke="#6C5CE7"
                  strokeWidth={1}
                  strokeOpacity={voltageActive ? 0.9 : 0.5}
                  style={{ transition: "stroke-opacity 300ms ease" }}
                />
                <text
                  x={C.baseEndX}
                  y={C.transCy - 25}
                  fontSize="8"
                  fontFamily="ui-monospace, monospace"
                  fill="#6C5CE7"
                  fillOpacity="0.65"
                  textAnchor="middle"
                >
                  V_GATE
                </text>
                <text
                  x={C.baseEndX}
                  y={C.transCy - 18}
                  fontSize="10"
                  fontFamily="ui-monospace, monospace"
                  fill={voltageActive ? "#a89bf5" : "#6C5CE7"}
                  fontWeight={700}
                  textAnchor="middle"
                  style={{ transition: "fill 300ms ease" }}
                >
                  {voltage.toFixed(2)}V
                </text>

                {/* Connector tick */}
                <line
                  x1={C.baseEndX}
                  y1={C.transCy - 16}
                  x2={C.baseEndX}
                  y2={C.transCy - 9}
                  stroke="#6C5CE7"
                  strokeWidth={1}
                  strokeOpacity={0.5}
                />

                {/* Probe diamond */}
                <polygon
                  points={`
                    ${C.baseEndX},${C.transCy - 8}
                    ${C.baseEndX + 8},${C.transCy}
                    ${C.baseEndX},${C.transCy + 8}
                    ${C.baseEndX - 8},${C.transCy}
                  `}
                  fill={voltageActive ? `url(#${ids.probeRadial})` : "#15151e"}
                  stroke="#6C5CE7"
                  strokeWidth={1.5}
                  style={{
                    filter: voltageActive
                      ? "drop-shadow(0 0 5px #6C5CE7)"
                      : undefined,
                    transition: "fill 300ms ease, filter 300ms ease",
                  }}
                />
              </g>

              {/* ─── Node junction dots ─── */}
              {[
                [C.leftX, C.topY],
                [C.rightX, C.topY],
                [C.rightX, C.resTop],
                [C.rightX, C.resBot],
                [C.rightX, C.ledCy - C.ledR],
                [C.rightX, C.ledCy + C.ledR],
                [C.rightX, C.transCy - C.transR],
                [C.rightX, C.transCy + C.transR],
                [C.rightX, C.botY],
                [C.leftX, C.botY],
              ].map(([x, y], i) => (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={isOn ? 3 : 2.5}
                  fill={isOn ? "#00CEC9" : "#3a3a48"}
                  style={{
                    filter: isOn
                      ? "drop-shadow(0 0 4px #00CEC9)"
                      : undefined,
                    transition:
                      "fill 400ms ease, r 400ms ease, filter 400ms ease",
                  }}
                />
              ))}

              {/* ─── Ground symbol ─── */}
              <g
                stroke="#7a7d8a"
                strokeWidth={1.8}
                strokeLinecap="round"
                fill="none"
              >
                <line
                  x1={C.groundX}
                  y1={C.botY}
                  x2={C.groundX}
                  y2={C.botY + 10}
                />
                <line
                  x1={C.groundX - 16}
                  y1={C.botY + 10}
                  x2={C.groundX + 16}
                  y2={C.botY + 10}
                />
                <line
                  x1={C.groundX - 10}
                  y1={C.botY + 16}
                  x2={C.groundX + 10}
                  y2={C.botY + 16}
                />
                <line
                  x1={C.groundX - 4}
                  y1={C.botY + 22}
                  x2={C.groundX + 4}
                  y2={C.botY + 22}
                />
              </g>
              <text
                x={C.groundX + 22}
                y={C.botY + 16}
                fontSize="9"
                fontFamily="ui-monospace, monospace"
                fill="#7a7d8a"
              >
                GND
              </text>

              {/* ─── Surge ripple from transistor ─── */}
              <AnimatePresence>
                {surge?.direction === "on" && (
                  <motion.circle
                    key={`ripple-${surge.key}`}
                    cx={C.transCx}
                    cy={C.transCy}
                    r={C.transR}
                    fill="none"
                    stroke="#00CEC9"
                    strokeWidth={2}
                    initial={{ scale: 0.5, opacity: 0.9 }}
                    animate={{ scale: 6, opacity: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    style={{
                      transformBox: "fill-box",
                      transformOrigin: "center",
                      filter: "drop-shadow(0 0 8px #00CEC9)",
                    }}
                  />
                )}
              </AnimatePresence>
            </svg>
          </div>

          {/* ─── RIGHT: Control panel ────────────────────────────── */}
          <div className="flex flex-col gap-4">
            {/* Voltage readout */}
            <div className="border border-[#6C5CE7]/20 bg-[#0a0a14] p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#6C5CE7]/65">
                V_gate
              </p>
              <div className="flex items-baseline gap-2">
                <motion.span
                  className="font-mono text-6xl font-bold tabular-nums leading-none"
                  animate={{ color: readoutColor }}
                  transition={{ duration: 0.3 }}
                  style={{
                    textShadow: isOn
                      ? "0 0 18px rgba(0,206,201,0.6)"
                      : region === "partial"
                      ? "0 0 14px rgba(253,203,110,0.5)"
                      : "none",
                  }}
                >
                  {voltage.toFixed(1)}
                </motion.span>
                <span
                  className="font-mono text-2xl font-semibold opacity-50"
                  style={{ color: readoutColor }}
                >
                  V
                </span>
              </div>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
                {stateLabel}
              </p>
            </div>

            {/* Slider */}
            <div className="border border-[#6C5CE7]/20 bg-[#0a0a14] p-4">
              <div className="mb-3 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-[#6C5CE7]/65">
                <span>BIAS_CTRL</span>
                <span>0.0V — 5.0V</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min={V_MIN}
                  max={V_MAX}
                  step={V_STEP}
                  value={voltage}
                  onChange={onChange}
                  aria-label="Voltaj la base (V_gate)"
                  className="tl-slider block w-full"
                  style={
                    { "--tl-fill": `${fillPct}%` } as CSSProperties
                  }
                />
                {/* Threshold tick */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute"
                  style={{
                    left: `${thresholdPct}%`,
                    top: 0,
                    transform: "translateX(-1px)",
                  }}
                >
                  <div
                    className="h-5 w-[2px] rounded-full bg-[#FF6B6B]"
                    style={{
                      boxShadow: "0 0 6px rgba(255,107,107,0.85)",
                    }}
                  />
                </div>
                <div
                  aria-hidden
                  className="pointer-events-none absolute mt-1 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap font-mono text-[10px] text-[#FF6B6B]"
                  style={{ left: `${thresholdPct}%`, top: 24 }}
                >
                  <AlertTriangle className="h-2.5 w-2.5" aria-hidden />
                  <span>2.0V</span>
                </div>
              </div>
              <div className="mt-12 flex justify-between font-mono text-[9px] text-white/35">
                <span>0V</span>
                <span>2.5V</span>
                <span>5V</span>
              </div>
            </div>

            {/* Region bars */}
            <RegionBars region={region} />

            {/* Oscilloscope */}
            <Oscilloscope isOn={isOn} reduced={reduced} />

            {/* Static explainer */}
            <div className="border border-[#6C5CE7]/20 bg-[#0a0a14] p-4">
              <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.22em] text-[#6C5CE7]/65">
                Principiu // NPN
              </p>
              <ul className="space-y-1.5 text-xs text-white/70">
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#6C5CE7]" />
                  <span>
                    Sub <span className="font-mono text-[#FDCB6E]">~2V</span> pe
                    Base — joncțiunea nu conduce, I_ce = 0.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#6C5CE7]" />
                  <span>
                    Peste prag — Base deschide canalul C→E. Un curent mic pe B
                    controlează unul mare pe C→E.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#6C5CE7]" />
                  <span>
                    Tranzistorul = robinet electric: V_be = poziția, I_ce =
                    debitul.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CSS keyframes & slider styles ────────────────────────────────────────

const CSS_STYLES = `
@keyframes tl-pulse-flow {
  from { stroke-dashoffset: 0; }
  to { stroke-dashoffset: -${LOOP_LENGTH}; }
}

@keyframes tl-scanlines-scroll {
  from { background-position: 0 0; }
  to { background-position: 0 80px; }
}
.tl-scanlines {
  background-image: repeating-linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.03) 0,
    rgba(255, 255, 255, 0.03) 1px,
    transparent 1px,
    transparent 4px
  );
  animation: tl-scanlines-scroll 6s linear infinite;
  opacity: 0.85;
}

@keyframes tl-blink-kf {
  0%, 55%, 100% { opacity: 0; transform: scale(1.6); }
  10% { opacity: 0.7; transform: scale(1); }
}
.tl-blink {
  animation: tl-blink-kf 1.4s ease-out infinite;
  filter: blur(0.5px);
}

@keyframes tl-osc-scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-40px); }
}
.tl-osc-animate { animation: tl-osc-scroll 0.9s linear infinite; }

.tl-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 24px;
  background: transparent;
  outline: none;
  cursor: pointer;
}
.tl-slider:focus { outline: none; }

.tl-slider::-webkit-slider-runnable-track {
  height: 6px;
  border-radius: 9999px;
  background: linear-gradient(
    to right,
    #6C5CE7 0%,
    #00CEC9 var(--tl-fill),
    #12121f var(--tl-fill),
    #12121f 100%
  );
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.6), 0 0 8px rgba(108, 92, 231, 0.25);
  border: 1px solid rgba(108, 92, 231, 0.25);
}
.tl-slider::-moz-range-track {
  height: 6px;
  border-radius: 9999px;
  background: linear-gradient(
    to right,
    #6C5CE7 0%,
    #00CEC9 var(--tl-fill),
    #12121f var(--tl-fill),
    #12121f 100%
  );
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.6), 0 0 8px rgba(108, 92, 231, 0.25);
  border: 1px solid rgba(108, 92, 231, 0.25);
}

.tl-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  background: radial-gradient(circle at 50% 40%, #ffffff 0%, #ffffff 30%, #6C5CE7 31%, #6C5CE7 100%);
  border: 2px solid #ffffff;
  margin-top: -11px;
  cursor: grab;
  box-shadow:
    0 0 0 4px rgba(108, 92, 231, 0.15),
    0 0 18px rgba(108, 92, 231, 0.7),
    0 2px 6px rgba(0,0,0,0.5);
  transition: transform 140ms ease, box-shadow 140ms ease;
}
.tl-slider::-webkit-slider-thumb:hover,
.tl-slider::-webkit-slider-thumb:active {
  transform: scale(1.1);
  box-shadow:
    0 0 0 5px rgba(108, 92, 231, 0.22),
    0 0 24px rgba(108, 92, 231, 0.9),
    0 2px 6px rgba(0,0,0,0.5);
}
.tl-slider:active::-webkit-slider-thumb { cursor: grabbing; }

.tl-slider::-moz-range-thumb {
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  background: radial-gradient(circle at 50% 40%, #ffffff 0%, #ffffff 30%, #6C5CE7 31%, #6C5CE7 100%);
  border: 2px solid #ffffff;
  cursor: grab;
  box-shadow:
    0 0 0 4px rgba(108, 92, 231, 0.15),
    0 0 18px rgba(108, 92, 231, 0.7),
    0 2px 6px rgba(0,0,0,0.5);
  transition: transform 140ms ease, box-shadow 140ms ease;
}
.tl-slider::-moz-range-thumb:hover,
.tl-slider::-moz-range-thumb:active {
  transform: scale(1.1);
}
.tl-slider:active::-moz-range-thumb { cursor: grabbing; }

.tl-slider:focus-visible::-webkit-slider-thumb {
  box-shadow:
    0 0 0 5px rgba(108, 92, 231, 0.35),
    0 0 22px rgba(108, 92, 231, 0.9);
}
.tl-slider:focus-visible::-moz-range-thumb {
  box-shadow:
    0 0 0 5px rgba(108, 92, 231, 0.35),
    0 0 22px rgba(108, 92, 231, 0.9);
}

@media (prefers-reduced-motion: reduce) {
  .tl-scanlines, .tl-blink, .tl-osc-animate { animation: none !important; }
}
`;
