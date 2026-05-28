"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  computeLayers,
  evaluateCircuit,
  type BitValue,
  type CircuitDefinition,
  type GateType,
} from "./logic-engine";

// ─── Layout types ────────────────────────────────────────────────────────

type Point = { x: number; y: number };
type IconKind = "motion" | "temp" | "sound";
type WireRender = { fromNodeId: string; d: string };
type JunctionRender = { x: number; y: number; fromNodeId: string };

type CircuitLayout = {
  inputs: Record<string, Point & { icon: IconKind }>;
  gates: Record<string, Point>;
  output: Point;
  wires: WireRender[];
  junctions: JunctionRender[];
};

// ─── Layouts (hardcoded per circuit id) ──────────────────────────────────
//
// viewBox 700 × 420.
// Layers from left to right:
//   Inputs ............ x = 70
//   Gate column 1 ..... x ≈ 250–350 (varies per circuit)
//   Gate column 2 ..... x ≈ 420–520 (Wave 2 / 3)
//   Gate column 3 ..... x ≈ 570     (Wave 3 only)
//   Output ............ x ≈ 610–660
//
// Gate centers are positioned so wires can route orthogonally without
// awkward overlaps. Pin offsets:
//   AND / OR / XOR / NAND inputs:  (-30, ±10) from gate center
//   NOT input:                     (-22, 0)
//   AND output:                    (+30, 0)
//   OR / XOR output:               (+28, 0)
//   NOT output (past bubble):      (+26, 0)
//   NAND output (past bubble):     (+36, 0)

const LAYOUT_WAVE_1: CircuitLayout = {
  inputs: {
    A: { x: 70, y: 100, icon: "motion" },
    B: { x: 70, y: 210, icon: "temp" },
    C: { x: 70, y: 320, icon: "sound" },
  },
  gates: {
    G1: { x: 350, y: 155 }, // AND(A, B)
    G2: { x: 520, y: 240 }, // OR(G1, C)
  },
  output: { x: 610, y: 240 },
  wires: [
    { fromNodeId: "A", d: "M 92 100 L 270 100 L 270 145 L 320 145" },
    { fromNodeId: "B", d: "M 92 210 L 270 210 L 270 165 L 320 165" },
    { fromNodeId: "G1", d: "M 380 155 L 440 155 L 440 230 L 490 230" },
    { fromNodeId: "C", d: "M 92 320 L 440 320 L 440 250 L 490 250" },
    { fromNodeId: "G2", d: "M 548 240 L 610 240" },
  ],
  junctions: [],
};

const LAYOUT_WAVE_2: CircuitLayout = {
  inputs: {
    A: { x: 70, y: 100, icon: "motion" },
    B: { x: 70, y: 210, icon: "temp" },
    C: { x: 70, y: 320, icon: "sound" },
  },
  gates: {
    G1: { x: 290, y: 100 }, // NOT(A)
    G2: { x: 290, y: 265 }, // OR(B, C)
    G3: { x: 490, y: 180 }, // AND(G1, G2)
  },
  output: { x: 610, y: 180 },
  wires: [
    { fromNodeId: "A", d: "M 92 100 L 268 100" },
    { fromNodeId: "B", d: "M 92 210 L 220 210 L 220 255 L 260 255" },
    { fromNodeId: "C", d: "M 92 320 L 220 320 L 220 275 L 260 275" },
    { fromNodeId: "G1", d: "M 316 100 L 410 100 L 410 170 L 460 170" },
    { fromNodeId: "G2", d: "M 318 265 L 410 265 L 410 190 L 460 190" },
    { fromNodeId: "G3", d: "M 520 180 L 610 180" },
  ],
  junctions: [],
};

const LAYOUT_WAVE_3: CircuitLayout = {
  inputs: {
    A: { x: 70, y: 100, icon: "motion" },
    B: { x: 70, y: 210, icon: "temp" },
    C: { x: 70, y: 320, icon: "sound" },
  },
  gates: {
    G1: { x: 250, y: 130 }, // NAND(A, B)
    G2: { x: 250, y: 240 }, // NOT(B)
    G3: { x: 420, y: 295 }, // NAND(C, G2)
    G4: { x: 570, y: 200 }, // AND(G1, G3)
  },
  output: { x: 630, y: 200 },
  wires: [
    { fromNodeId: "A", d: "M 92 100 L 180 100 L 180 120 L 220 120" },
    // B → G1 bottom input
    { fromNodeId: "B", d: "M 92 210 L 170 210 L 170 140 L 220 140" },
    // B branches at the (170, 210) junction → continues down to G2
    { fromNodeId: "B", d: "M 170 210 L 170 240 L 228 240" },
    { fromNodeId: "C", d: "M 92 320 L 360 320 L 360 305 L 390 305" },
    { fromNodeId: "G2", d: "M 276 240 L 340 240 L 340 285 L 390 285" },
    { fromNodeId: "G1", d: "M 286 130 L 510 130 L 510 190 L 540 190" },
    { fromNodeId: "G3", d: "M 456 295 L 510 295 L 510 210 L 540 210" },
    { fromNodeId: "G4", d: "M 600 200 L 630 200" },
  ],
  junctions: [{ x: 170, y: 210, fromNodeId: "B" }],
};

const LAYOUTS: Record<string, CircuitLayout> = {
  "wave-1": LAYOUT_WAVE_1,
  "wave-2": LAYOUT_WAVE_2,
  "wave-3": LAYOUT_WAVE_3,
};

// ─── Gate shape geometry ─────────────────────────────────────────────────

const GATE_PATHS: Record<GateType, string> = {
  // D-shape: flat left edge (-30..-30), top to bottom (-20..20), right half-circle to (30, 0).
  AND: "M -30 -20 L 10 -20 A 20 20 0 0 1 10 20 L -30 20 Z",
  // OR: concave left (curves rightward), pointed right tip at (28, 0).
  OR: "M -28 -18 Q 0 -18 28 0 Q 0 18 -28 18 Q -8 0 -28 -18 Z",
  // NOT: triangle pointing right. Bubble drawn separately.
  NOT: "M -22 -16 L 18 0 L -22 16 Z",
  // NAND: AND body, bubble drawn separately.
  NAND: "M -30 -20 L 10 -20 A 20 20 0 0 1 10 20 L -30 20 Z",
  // XOR: OR body. Extra curve drawn separately in the renderer.
  XOR: "M -28 -18 Q 0 -18 28 0 Q 0 18 -28 18 Q -8 0 -28 -18 Z",
};

const GATE_BUBBLE: Partial<Record<GateType, { cx: number; cy: number; r: number }>> = {
  NOT: { cx: 22, cy: 0, r: 4 },
  NAND: { cx: 32, cy: 0, r: 4 },
};

const GATE_LABEL_X: Record<GateType, number> = {
  AND: -6,
  OR: -2,
  NOT: -8,
  NAND: -6,
  XOR: -2,
};

// ─── Sub-components ──────────────────────────────────────────────────────

function InputIcon({ kind, on }: { kind: IconKind; on: boolean }) {
  const color = on ? "#00ff88" : "#FF6B6B";
  const common = {
    stroke: color,
    strokeWidth: 1.5,
    fill: "none",
    strokeLinecap: "round" as const,
    style: { transition: "stroke 300ms ease" },
  };
  switch (kind) {
    case "motion":
      return (
        <g {...common}>
          <circle cx={-5} cy={0} r={1.8} fill={color} stroke="none" />
          <path d="M -2 -5 Q 2 0 -2 5" />
          <path d="M 1 -8 Q 6 0 1 8" />
          <path d="M 4 -11 Q 10 0 4 11" />
        </g>
      );
    case "temp":
      return (
        <g {...common}>
          <line x1={0} y1={-10} x2={0} y2={4} />
          <circle cx={0} cy={6} r={3.5} fill={color} stroke="none" />
          <line x1={-3.5} y1={-7} x2={-1.5} y2={-7} />
          <line x1={-3.5} y1={-3} x2={-1.5} y2={-3} />
        </g>
      );
    case "sound":
      return (
        <g {...common}>
          <polygon
            points="-7,-3 -3,-3 1,-8 1,8 -3,3 -7,3"
            fill={color}
            stroke="none"
          />
          <path d="M 4 -5 Q 8 0 4 5" />
          <path d="M 7 -9 Q 13 0 7 9" />
        </g>
      );
  }
}

function InputNode({
  id,
  x,
  y,
  label,
  subLabel,
  icon,
  value,
  rippleKey,
  onToggle,
  reduced,
}: {
  id: string;
  x: number;
  y: number;
  label: string;
  subLabel: string | undefined;
  icon: IconKind;
  value: BitValue;
  rippleKey: number;
  onToggle: (id: string) => void;
  reduced: boolean;
}) {
  const isOn = value === 1;
  return (
    <g
      transform={`translate(${x}, ${y})`}
      style={{ cursor: "pointer" }}
      onClick={() => onToggle(id)}
    >
      {/* Invisible larger hit target */}
      <circle cx={0} cy={0} r={30} fill="transparent" />

      {/* Click ripple */}
      {rippleKey > 0 && !reduced && (
        <motion.circle
          key={rippleKey}
          cx={0}
          cy={0}
          r={22}
          fill="none"
          stroke={isOn ? "#00ff88" : "#FF6B6B"}
          strokeWidth={2}
          initial={{ scale: 1, opacity: 0.7 }}
          animate={{ scale: 2.4, opacity: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          style={{
            pointerEvents: "none",
            transformOrigin: "center",
            transformBox: "fill-box",
          }}
        />
      )}

      {/* Main visible circle */}
      <circle
        cx={0}
        cy={0}
        r={22}
        fill={isOn ? "#062a1d" : "#0d0d18"}
        stroke={isOn ? "#00ff88" : "#FF6B6B"}
        strokeWidth={2.5}
        style={{
          filter: isOn ? "drop-shadow(0 0 8px #00ff88)" : undefined,
          transition: "fill 300ms ease, stroke 300ms ease, filter 300ms ease",
        }}
      />

      {/* Icon centered in circle */}
      <InputIcon kind={icon} on={isOn} />

      {/* Big label "A" to the left of the circle */}
      <text
        x={-30}
        y={5}
        fontSize="14"
        fontFamily="ui-monospace, monospace"
        fontWeight={700}
        fill={isOn ? "#00ff88" : "#FF6B6B"}
        textAnchor="end"
        style={{ transition: "fill 300ms ease" }}
      >
        {label}
      </text>

      {/* Bit value to the right of the circle */}
      <text
        x={30}
        y={5}
        fontSize="13"
        fontFamily="ui-monospace, monospace"
        fontWeight={700}
        fill={isOn ? "#00ff88" : "#5a5e6e"}
        textAnchor="start"
        style={{ transition: "fill 300ms ease" }}
      >
        {isOn ? "1" : "0"}
      </text>

      {/* Sub-label below */}
      {subLabel && (
        <text
          x={0}
          y={42}
          fontSize="10"
          fontFamily="ui-monospace, monospace"
          fontWeight={500}
          fill="#7a7d8a"
          textAnchor="middle"
          letterSpacing={0.4}
        >
          {subLabel}
        </text>
      )}
    </g>
  );
}

function GateSymbol({
  type,
  cx,
  cy,
  value,
}: {
  type: GateType;
  cx: number;
  cy: number;
  value: BitValue;
}) {
  const isOn = value === 1;
  const borderColor = isOn ? "#00CEC9" : "#3a3a48";
  const bubble = GATE_BUBBLE[type];

  return (
    <g transform={`translate(${cx}, ${cy})`}>
      <path
        d={GATE_PATHS[type]}
        fill="#12121f"
        stroke={borderColor}
        strokeWidth={1.8}
        strokeLinejoin="round"
        style={{
          filter: isOn ? "drop-shadow(0 0 6px #00CEC9)" : undefined,
          transition: "stroke 300ms ease, filter 300ms ease",
        }}
      />

      {type === "XOR" && (
        <path
          d="M -34 -18 Q -14 0 -34 18"
          fill="none"
          stroke={borderColor}
          strokeWidth={1.8}
          strokeLinecap="round"
          style={{ transition: "stroke 300ms ease" }}
        />
      )}

      {bubble && (
        <circle
          cx={bubble.cx}
          cy={bubble.cy}
          r={bubble.r}
          fill="#12121f"
          stroke={borderColor}
          strokeWidth={1.8}
          style={{
            filter: isOn ? "drop-shadow(0 0 5px #00CEC9)" : undefined,
            transition: "stroke 300ms ease, filter 300ms ease",
          }}
        />
      )}

      <text
        x={GATE_LABEL_X[type]}
        y={3}
        fontSize="9"
        fontFamily="ui-monospace, monospace"
        fontWeight={700}
        fill={isOn ? "#00CEC9" : "#9aa0aa"}
        textAnchor="middle"
        letterSpacing={0.5}
        style={{ transition: "fill 300ms ease" }}
      >
        {type}
      </text>
    </g>
  );
}

function OutputNode({
  x,
  y,
  value,
  highlight,
  reduced,
}: {
  x: number;
  y: number;
  value: BitValue;
  highlight: boolean;
  reduced: boolean;
}) {
  const isOn = value === 1;
  const W = 70;
  const H = 56;

  return (
    <g transform={`translate(${x}, ${y})`}>
      <text
        x={W / 2}
        y={-H / 2 - 8}
        fontSize="9"
        fontFamily="ui-monospace, monospace"
        fontWeight={700}
        fill="#7a7d8a"
        textAnchor="middle"
        letterSpacing={1.4}
      >
        OUTPUT
      </text>

      <motion.rect
        x={0}
        y={-H / 2}
        width={W}
        height={H}
        rx={3}
        fill={isOn ? "#FDCB6E" : "#0d0d18"}
        fillOpacity={isOn ? 0.18 : 1}
        stroke={isOn ? "#FDCB6E" : "#3a3a48"}
        strokeWidth={2}
        initial={false}
        animate={
          (highlight || isOn) && !reduced
            ? { scale: [1, 1.06, 1] }
            : { scale: 1 }
        }
        transition={{
          duration: highlight ? 0.9 : 1.6,
          repeat: highlight || isOn ? Infinity : 0,
          ease: "easeInOut",
        }}
        style={{
          filter: isOn ? "drop-shadow(0 0 14px #FDCB6E)" : undefined,
          transition: "fill 400ms ease, stroke 400ms ease, filter 400ms ease",
          transformOrigin: `${W / 2}px 0px`,
          transformBox: "fill-box",
        }}
      />

      <text
        x={W / 2}
        y={-3}
        fontSize="14"
        textAnchor="middle"
        style={{ transition: "fill 400ms ease" }}
      >
        {isOn ? "🔓" : "🔒"}
      </text>
      <text
        x={W / 2}
        y={14}
        fontSize="9"
        fontFamily="ui-monospace, monospace"
        fontWeight={700}
        fill={isOn ? "#FDCB6E" : "#FF6B6B"}
        textAnchor="middle"
        letterSpacing={1}
        style={{ transition: "fill 400ms ease" }}
      >
        {isOn ? "UNLOCKED" : "LOCKED"}
      </text>
    </g>
  );
}

function Wire({
  d,
  value,
  reduced,
  particleBegin,
}: {
  d: string;
  value: BitValue;
  reduced: boolean;
  particleBegin: string;
}) {
  const isOn = value === 1;
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={isOn ? "#00CEC9" : "#1a1a2e"}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          filter: isOn ? "drop-shadow(0 0 3px #00CEC9)" : undefined,
          transition: "stroke 300ms ease, filter 300ms ease",
        }}
      />

      {/* Signal particles — only mounted when wire is hot */}
      {isOn && !reduced && (
        <g style={{ pointerEvents: "none" }}>
          <circle
            r={3}
            fill="#00CEC9"
            style={{ filter: "drop-shadow(0 0 4px #00CEC9)" }}
          >
            <animateMotion
              dur="2.5s"
              begin={particleBegin}
              repeatCount="indefinite"
              path={d}
            />
          </circle>
          <circle
            r={3}
            fill="#00CEC9"
            style={{ filter: "drop-shadow(0 0 4px #00CEC9)" }}
          >
            <animateMotion
              dur="2.5s"
              begin={`${particleBegin};-1.25s`}
              repeatCount="indefinite"
              path={d}
            />
          </circle>
        </g>
      )}
    </g>
  );
}

// ─── Main component ──────────────────────────────────────────────────────

export type CircuitBoardProps = {
  circuit: CircuitDefinition;
  inputValues: Record<string, BitValue>;
  onInputToggle: (inputId: string) => void;
  /** Pulses the output node — game uses this to celebrate a win. */
  highlightOutput?: boolean;
};

export function CircuitBoard({
  circuit,
  inputValues,
  onInputToggle,
  highlightOutput = false,
}: CircuitBoardProps) {
  const reduced = useReducedMotion() ?? false;
  const layout = LAYOUTS[circuit.id];

  const trueValues = useMemo(
    () => evaluateCircuit(circuit, inputValues),
    [circuit, inputValues]
  );
  const layers = useMemo(() => computeLayers(circuit), [circuit]);
  const maxLayer = useMemo(() => {
    let m = 0;
    Array.from(layers.values()).forEach((v) => {
      if (v > m) m = v;
    });
    return m;
  }, [layers]);

  // Display values may lag behind true values during cascade.
  const [displayValues, setDisplayValues] = useState<Map<string, BitValue>>(
    () => trueValues
  );
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      setDisplayValues(trueValues);
      return;
    }

    if (reduced) {
      setDisplayValues(trueValues);
      return;
    }

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    for (let layer = 0; layer <= maxLayer; layer++) {
      const delay = layer * 200;
      const t = setTimeout(() => {
        setDisplayValues((prev) => {
          const next = new Map(prev);
          Array.from(layers.entries()).forEach(([id, l]) => {
            if (l === layer) {
              next.set(id, trueValues.get(id) ?? 0);
            }
          });
          return next;
        });
      }, delay);
      timeouts.push(t);
    }

    return () => timeouts.forEach(clearTimeout);
  }, [trueValues, layers, maxLayer, reduced]);

  const [rippleKeys, setRippleKeys] = useState<Record<string, number>>({});
  const handleToggle = useCallback(
    (id: string) => {
      setRippleKeys((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
      onInputToggle(id);
    },
    [onInputToggle]
  );

  if (!layout) {
    return (
      <div className="my-6 rounded border border-[#FF6B6B]/40 bg-[#FF6B6B]/[0.08] p-4 font-mono text-sm text-[#FF6B6B]">
        Circuit layout missing for id: {circuit.id}
      </div>
    );
  }

  const outputValue = displayValues.get(circuit.outputGateId) ?? 0;
  const gridPatternId = `circuit-grid-${circuit.id}`;

  return (
    <div className="w-full">
      <svg
        viewBox="0 0 700 420"
        className="block h-auto w-full"
        role="img"
        aria-label={`Circuit logic board pentru ${circuit.id}, ieșire ${outputValue === 1 ? "deblocată" : "blocată"}`}
      >
        <defs>
          <pattern
            id={gridPatternId}
            patternUnits="userSpaceOnUse"
            width="24"
            height="24"
          >
            <circle cx="12" cy="12" r="0.8" fill="#1a1a26" />
          </pattern>
        </defs>

        {/* Background */}
        <rect width="700" height="420" fill="#080810" />
        <rect width="700" height="420" fill={`url(#${gridPatternId})`} />

        {/* Wires (drawn first, behind nodes) */}
        {layout.wires.map((wire, i) => {
          const value = displayValues.get(wire.fromNodeId) ?? 0;
          return (
            <Wire
              key={i}
              d={wire.d}
              value={value}
              reduced={reduced}
              particleBegin={`${(i % 3) * -0.4}s`}
            />
          );
        })}

        {/* Junction dots (e.g. where one wire fans out to two gates) */}
        {layout.junctions.map((j, i) => {
          const value = displayValues.get(j.fromNodeId) ?? 0;
          const isOn = value === 1;
          return (
            <circle
              key={`j-${i}`}
              cx={j.x}
              cy={j.y}
              r={3.5}
              fill={isOn ? "#00CEC9" : "#3a3a48"}
              style={{
                filter: isOn ? "drop-shadow(0 0 3px #00CEC9)" : undefined,
                transition: "fill 300ms ease, filter 300ms ease",
              }}
            />
          );
        })}

        {/* Inputs */}
        {circuit.inputs.map((input) => {
          const il = layout.inputs[input.id];
          if (!il) return null;
          return (
            <InputNode
              key={input.id}
              id={input.id}
              x={il.x}
              y={il.y}
              label={input.label}
              subLabel={input.subLabel}
              icon={il.icon}
              value={inputValues[input.id] ?? 0}
              rippleKey={rippleKeys[input.id] ?? 0}
              onToggle={handleToggle}
              reduced={reduced}
            />
          );
        })}

        {/* Gates */}
        {circuit.gates.map((gate) => {
          const gl = layout.gates[gate.id];
          if (!gl) return null;
          const value = displayValues.get(gate.id) ?? 0;
          return (
            <GateSymbol
              key={gate.id}
              type={gate.type}
              cx={gl.x}
              cy={gl.y}
              value={value}
            />
          );
        })}

        {/* Output */}
        <OutputNode
          x={layout.output.x}
          y={layout.output.y}
          value={outputValue}
          highlight={highlightOutput}
          reduced={reduced}
        />
      </svg>
    </div>
  );
}
