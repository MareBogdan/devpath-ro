"use client";

import { motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NeuronPosition {
  x: number;
  y: number;
}

interface ForwardPassAnimationProps {
  layout: NeuronPosition[][];
  weights: number[][][];
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Renders animated particles along each connection, travelling layer by layer.
 * Rendered inside the parent <svg> element via NetworkSVG's children prop.
 * The component is remounted (via key) on each "Run Forward Pass" to restart.
 */
export function ForwardPassAnimation({
  layout,
  weights,
}: ForwardPassAnimationProps) {
  return (
    <>
      {weights.map((W, li) => {
        const layerDelay = li * 0.45;

        // Per-layer: find max abs weight for opacity normalisation
        const maxAbsW = Math.max(
          1e-6,
          ...W.flatMap((row) => row.map(Math.abs))
        );

        return W.map((row, j) =>
          row.map((w, i) => {
            const src = layout[li]?.[i];
            const dst = layout[li + 1]?.[j];
            if (!src || !dst) return null;

            const absW = Math.abs(w);
            // Only draw particles for connections with meaningful weight
            if (absW < maxAbsW * 0.15) return null;

            const opacity = 0.3 + 0.6 * (absW / maxAbsW);
            const color = w >= 0 ? "#60a5fa" : "#fb923c";

            return (
              <motion.circle
                key={`p-${li}-${i}-${j}`}
                r={2.5}
                fill={color}
                initial={{ cx: src.x, cy: src.y, opacity }}
                animate={{ cx: dst.x, cy: dst.y, opacity: 0 }}
                transition={{
                  duration: 0.38,
                  delay: layerDelay,
                  ease: "easeIn",
                }}
              />
            );
          })
        );
      })}
    </>
  );
}
