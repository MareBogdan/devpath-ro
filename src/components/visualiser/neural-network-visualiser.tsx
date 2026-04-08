"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { NetworkSVG } from "./network-svg";
import { ForwardPassAnimation } from "./forward-pass-animation";
import { NetworkControls } from "./network-controls";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NeuronPosition {
  x: number;
  y: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_NEURONS = 8;
const MAX_LAYERS = 6;
const NEURON_SPACING = 70;
const PADDING_X = 60;
const PADDING_Y = 50;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

function createRand(seed: number): () => number {
  let s = seed;
  return function rand(): number {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

/** He initialisation with seeded PRNG — deterministic per layer config */
export function initWeights(layers: number[]): number[][][] {
  const rand = createRand(hashString(JSON.stringify(layers)));
  return layers.slice(0, -1).map((inSize, l) => {
    const outSize = layers[l + 1];
    const scale = Math.sqrt(2 / inSize);
    return Array.from({ length: outSize }, () =>
      Array.from({ length: inSize }, () => (rand() * 2 - 1) * scale)
    );
  });
}

/** Run a forward pass; returns activations per layer (input layer included) */
export function forwardPass(
  layers: number[],
  weights: number[][][],
  inputs: number[]
): number[][] {
  const activations: number[][] = [inputs.slice(0, layers[0])];
  for (let l = 0; l < weights.length; l++) {
    const prev = activations[l];
    const W = weights[l];
    const isOutput = l === weights.length - 1;
    activations.push(
      W.map((row) => {
        const z = row.reduce((sum, w, i) => sum + w * (prev[i] ?? 0), 0);
        return isOutput ? z : Math.max(0, z); // ReLU on hidden, linear on output
      })
    );
  }
  return activations;
}

/** Compute SVG dimensions based on layer config */
export function getSvgDimensions(layers: number[]): { w: number; h: number } {
  const maxNeurons = Math.max(...layers);
  return {
    w: Math.max(420, layers.length * 140 + PADDING_X * 2),
    h: Math.max(280, maxNeurons * NEURON_SPACING + PADDING_Y * 2),
  };
}

/** Compute neuron (x, y) positions in SVG space */
export function computeLayout(layers: number[]): NeuronPosition[][] {
  const { w: svgW, h: svgH } = getSvgDimensions(layers);
  const colGap =
    layers.length > 1 ? (svgW - PADDING_X * 2) / (layers.length - 1) : 0;

  return layers.map((count, li) => {
    const x = PADDING_X + li * colGap;
    const totalH = (count - 1) * NEURON_SPACING;
    const startY = (svgH - totalH) / 2;
    return Array.from({ length: count }, (_, ni) => ({
      x,
      y: startY + ni * NEURON_SPACING,
    }));
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

interface NeuralNetworkVisualiserProps {
  layers?: number[];
  inputLabels?: string[];
  outputLabel?: string;
}

export function NeuralNetworkVisualiser({
  layers: initialLayers = [2, 4, 1],
  inputLabels = [],
  outputLabel = "ŷ",
}: NeuralNetworkVisualiserProps) {
  const clamped = useMemo(() => {
    const base = initialLayers.length >= 2 ? initialLayers : [...initialLayers, 1];
    return base
      .slice(0, MAX_LAYERS)
      .map((n) => Math.min(Math.max(1, n), MAX_NEURONS));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [layers, setLayers] = useState<number[]>(clamped);
  const [inputValues, setInputValues] = useState<number[]>(() =>
    Array<number>(clamped[0]).fill(0.5)
  );
  const [activations, setActivations] = useState<number[][] | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const weights = useMemo(() => initWeights(layers), [JSON.stringify(layers)]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const layout = useMemo(() => computeLayout(layers), [JSON.stringify(layers)]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { w: svgW, h: svgH } = useMemo(() => getSvgDimensions(layers), [JSON.stringify(layers)]);

  const handleLayersChange = useCallback((newLayers: number[]) => {
    const c = newLayers
      .slice(0, MAX_LAYERS)
      .map((n) => Math.min(Math.max(1, n), MAX_NEURONS));
    setLayers(c);
    setInputValues(Array<number>(c[0]).fill(0.5));
    setActivations(null);
    setIsAnimating(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  function handleRunForwardPass() {
    if (isAnimating) return;
    const result = forwardPass(layers, weights, inputValues);
    setActivations(result);
    setIsAnimating(true);
    setAnimKey((k) => k + 1);
    const totalMs = (layers.length - 1) * 500 + 1000;
    timeoutRef.current = setTimeout(() => setIsAnimating(false), totalMs);
  }

  return (
    <div className="my-8 rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-muted/40">
        <span className="text-sm font-semibold text-foreground">
          Vizualizator Rețea Neuronală
        </span>
        <span className="rounded-full bg-blue-100 dark:bg-blue-950/40 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
          Interactiv
        </span>
      </div>

      {/* SVG Canvas */}
      <div className="overflow-x-auto bg-[#0d1117]">
        <NetworkSVG
          layers={layers}
          layout={layout}
          svgW={svgW}
          svgH={svgH}
          weights={weights}
          activations={activations}
          inputLabels={inputLabels}
          outputLabel={outputLabel}
        >
          {isAnimating && (
            <ForwardPassAnimation
              key={animKey}
              layout={layout}
              weights={weights}
            />
          )}
        </NetworkSVG>
      </div>

      {/* Controls */}
      <div className="border-t border-border">
        <NetworkControls
          layers={layers}
          inputValues={inputValues}
          inputLabels={inputLabels}
          isAnimating={isAnimating}
          onLayersChange={handleLayersChange}
          onInputValuesChange={setInputValues}
          onRunForwardPass={handleRunForwardPass}
        />
      </div>
    </div>
  );
}
