"use client";

import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NetworkControlsProps {
  layers: number[];
  inputValues: number[];
  inputLabels: string[];
  isAnimating: boolean;
  onLayersChange: (layers: number[]) => void;
  onInputValuesChange: (values: number[]) => void;
  onRunForwardPass: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NetworkControls({
  layers,
  inputValues,
  inputLabels,
  isAnimating,
  onLayersChange,
  onInputValuesChange,
  onRunForwardPass,
}: NetworkControlsProps) {
  function updateNeuronCount(li: number, value: number) {
    const next = [...layers];
    next[li] = value;
    onLayersChange(next);
  }

  function updateInputValue(ni: number, value: number) {
    const next = [...inputValues];
    next[ni] = value;
    onInputValuesChange(next);
  }

  return (
    <div className="p-5 space-y-5 bg-card">
      {/* Architecture sliders */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Arhitectura rețelei (neuroni/strat)
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {layers.map((count, li) => {
            const isInput = li === 0;
            const isOutput = li === layers.length - 1;
            const label = isInput
              ? "Input"
              : isOutput
              ? "Output"
              : `Hidden ${li}`;
            return (
              <div key={li} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-xs font-bold tabular-nums text-foreground">
                    {count}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={8}
                  value={count}
                  onChange={(e) =>
                    updateNeuronCount(li, Number(e.target.value))
                  }
                  className="w-full h-1.5 accent-blue-500 cursor-pointer"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Input value sliders */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Valori input (0 – 1)
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {inputValues.map((val, ni) => {
            const label = inputLabels[ni] ?? `x${ni + 1}`;
            return (
              <div key={ni} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs text-muted-foreground font-mono"
                    title={label}
                  >
                    {label}
                  </span>
                  <span className="text-xs font-bold tabular-nums text-foreground">
                    {val.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={val}
                  onChange={(e) =>
                    updateInputValue(ni, Number(e.target.value))
                  }
                  className="w-full h-1.5 accent-blue-500 cursor-pointer"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Run button */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onRunForwardPass}
          disabled={isAnimating}
          className={cn(
            "inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all select-none",
            isAnimating
              ? "bg-blue-700/70 text-white/70 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white"
          )}
        >
          {isAnimating ? (
            <>
              <span className="h-3 w-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              Se animează...
            </>
          ) : (
            "▶ Run Forward Pass"
          )}
        </button>
        <p className="text-xs text-muted-foreground">
          Modifică arhitectura sau input-urile, apoi apasă Run.
        </p>
      </div>
    </div>
  );
}
