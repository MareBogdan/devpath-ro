"use client";

import React, { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NeuronPosition {
  x: number;
  y: number;
}

interface NetworkSVGProps {
  layers: number[];
  layout: NeuronPosition[][];
  svgW: number;
  svgH: number;
  weights: number[][][];
  activations: number[][] | null;
  inputLabels?: string[];
  outputLabel?: string;
  children?: React.ReactNode;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const NEURON_R = 18;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function neuronFill(
  normalizedAct: number | null,
  isInput: boolean
): string {
  if (normalizedAct === null) {
    return isInput ? "#1d4ed8" : "#374151";
  }
  if (normalizedAct === 0) {
    return "hsl(0, 0%, 35%)"; // dead ReLU
  }
  const lightness = lerp(30, 80, Math.abs(normalizedAct));
  return `hsl(210, 80%, ${lightness}%)`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NetworkSVG({
  layers,
  layout,
  svgW,
  svgH,
  weights,
  activations,
  inputLabels = [],
  outputLabel = "ŷ",
  children,
}: NetworkSVGProps) {
  const [hoveredNeuron, setHoveredNeuron] = useState<{
    li: number;
    ni: number;
  } | null>(null);

  // Max abs weight per layer for normalising connection opacity
  const maxAbsWeights = weights.map((W) =>
    Math.max(1e-6, ...W.flatMap((row) => row.map(Math.abs)))
  );

  // Max abs activation per layer for normalising colour
  const maxActivations = activations
    ? activations.map((layer) => Math.max(1e-6, ...layer.map(Math.abs)))
    : null;

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      width={svgW}
      height={svgH}
      style={{ minWidth: svgW, display: "block" }}
      preserveAspectRatio="xMidYMid meet"
      aria-label="Vizualizator rețea neuronală interactivă"
    >
      {/* ── Connection lines ────────────────────────────────────────── */}
      {weights.map((W, li) =>
        W.map((row, j) =>
          row.map((w, i) => {
            const src = layout[li]?.[i];
            const dst = layout[li + 1]?.[j];
            if (!src || !dst) return null;

            const absW = Math.abs(w);
            const maxW = maxAbsWeights[li];
            const t = absW / maxW;
            const opacity = lerp(0.06, 0.45, t);
            const thickness = lerp(0.4, 2, t);
            const color =
              w >= 0
                ? `rgba(59, 130, 246, ${opacity})`
                : `rgba(249, 115, 22, ${opacity})`;

            return (
              <line
                key={`c-${li}-${i}-${j}`}
                x1={src.x}
                y1={src.y}
                x2={dst.x}
                y2={dst.y}
                stroke={color}
                strokeWidth={thickness}
              />
            );
          })
        )
      )}

      {/* ── Animation layer (particles from ForwardPassAnimation) ─── */}
      {children}

      {/* ── Neurons ─────────────────────────────────────────────────── */}
      {layout.map((layerPos, li) => {
        const isInput = li === 0;
        const isOutput = li === layers.length - 1;

        return layerPos.map((pos, ni) => {
          const rawAct = activations?.[li]?.[ni] ?? null;
          const normAct =
            rawAct !== null && maxActivations
              ? rawAct / maxActivations[li]
              : null;

          const fill = neuronFill(normAct, isInput);
          const isHov =
            hoveredNeuron?.li === li && hoveredNeuron?.ni === ni;

          const label =
            isInput && inputLabels[ni]
              ? inputLabels[ni]
              : isOutput
              ? outputLabel
              : null;

          const tooltipText =
            rawAct !== null
              ? `${rawAct >= 0 ? "+" : ""}${rawAct.toFixed(3)}`
              : "Run →";

          // Flip tooltip to left when near right edge
          const tooltipW = 90;
          const flipLeft = pos.x + NEURON_R + 8 + tooltipW > svgW - 8;
          const ttX = flipLeft
            ? pos.x - NEURON_R - 8 - tooltipW
            : pos.x + NEURON_R + 8;
          const ttY = pos.y - 12;

          return (
            <g
              key={`n-${li}-${ni}`}
              onMouseEnter={() => setHoveredNeuron({ li, ni })}
              onMouseLeave={() => setHoveredNeuron(null)}
              style={{ cursor: "default" }}
            >
              {/* Glow ring when activated */}
              {rawAct !== null && rawAct !== 0 && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={NEURON_R + 5}
                  fill="none"
                  stroke="rgba(96, 165, 250, 0.25)"
                  strokeWidth={3}
                />
              )}

              {/* Hover ring */}
              {isHov && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={NEURON_R + 8}
                  fill="none"
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth={2}
                />
              )}

              {/* Neuron body */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={NEURON_R}
                fill={fill}
                stroke={
                  activations
                    ? "rgba(255,255,255,0.28)"
                    : "rgba(255,255,255,0.12)"
                }
                strokeWidth={1.5}
              />

              {/* Label inside neuron (input/output only) */}
              {label && (
                <text
                  x={pos.x}
                  y={pos.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={9}
                  fontWeight="700"
                  fill="rgba(255,255,255,0.9)"
                  style={{ userSelect: "none", fontFamily: "monospace" }}
                >
                  {label}
                </text>
              )}

              {/* Hover tooltip */}
              {isHov && (
                <g>
                  <rect
                    x={ttX}
                    y={ttY}
                    width={tooltipW}
                    height={24}
                    rx={5}
                    fill="#1e293b"
                    stroke="rgba(148,163,184,0.3)"
                    strokeWidth={1}
                  />
                  <text
                    x={ttX + tooltipW / 2}
                    y={ttY + 12}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={10}
                    fill="#94a3b8"
                    style={{ userSelect: "none", fontFamily: "monospace" }}
                  >
                    {tooltipText}
                  </text>
                </g>
              )}
            </g>
          );
        });
      })}

      {/* ── Layer labels ────────────────────────────────────────────── */}
      {layers.map((_, li) => {
        const x = layout[li]?.[0]?.x ?? 0;
        const label =
          li === 0
            ? "Input"
            : li === layers.length - 1
            ? "Output"
            : `Hidden ${li}`;
        return (
          <text
            key={`lbl-${li}`}
            x={x}
            y={svgH - 10}
            textAnchor="middle"
            fontSize={9}
            fill="rgba(148,163,184,0.5)"
            style={{ userSelect: "none" }}
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
