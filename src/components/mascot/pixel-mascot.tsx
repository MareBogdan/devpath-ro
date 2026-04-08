"use client";

import { motion, AnimatePresence } from "framer-motion";

export type PixelEmotion = "happy" | "sad" | "thinking" | "excited" | "proud" | "idle";

interface PixelMascotProps {
  emotion?: PixelEmotion;
  size?: number;
  withSparks?: boolean;
  className?: string;
}

const EMOTION_COLORS: Record<PixelEmotion, { body: string; glow: string; eyeY: number }> = {
  happy:    { body: "#22c55e", glow: "rgba(34,197,94,0.45)",    eyeY: 0  },
  sad:      { body: "#94a3b8", glow: "rgba(148,163,184,0.2)",   eyeY: 4  },
  thinking: { body: "#4f46e5", glow: "rgba(79,70,229,0.45)",    eyeY: -2 },
  excited:  { body: "#f59e0b", glow: "rgba(245,158,11,0.55)",   eyeY: -3 },
  proud:    { body: "#8b5cf6", glow: "rgba(139,92,246,0.45)",   eyeY: 0  },
  idle:     { body: "#6366f1", glow: "rgba(99,102,241,0.35)",   eyeY: 0  },
};

// 12 spark directions for explosion
const SPARK_ANGLES = Array.from({ length: 12 }, (_, i) => (i * 30 * Math.PI) / 180);

export function PixelMascot({
  emotion = "idle",
  size = 80,
  withSparks = false,
  className,
}: PixelMascotProps) {
  const { body, glow, eyeY } = EMOTION_COLORS[emotion];
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;

  // Eye positions
  const eyeR = size * 0.07;
  const eyeOffsetX = size * 0.13;
  const eyeOffsetY = size * 0.04 + eyeY;

  // Drooping offset for sad
  const dropY = emotion === "sad" ? size * 0.05 : 0;

  return (
    <div className={className} style={{ position: "relative", width: size, height: size }}>
      <motion.svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-label={`Pixel mascota — ${emotion}`}
        animate={{
          y: emotion === "sad"
            ? dropY
            : emotion === "excited"
            ? [0, -size * 0.05, 0]
            : 0,
          scale: emotion === "excited" ? [1, 1.05, 1] : 1,
          rotate: emotion === "happy" ? [0, -5, 5, -3, 3, 0] : 0,
        }}
        transition={{
          y: emotion === "excited"
            ? { repeat: Infinity, duration: 0.6 }
            : { duration: 0.3 },
          scale: emotion === "excited" ? { repeat: Infinity, duration: 0.6 } : {},
          rotate: { duration: 0.5 },
        }}
      >
        <defs>
          <filter id={`glow-${emotion}-${size}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={size * 0.08} result="blur" />
            <feFlood floodColor={glow} result="color" />
            <feComposite in="color" in2="blur" operator="in" result="shadow" />
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Body blob */}
        <motion.ellipse
          cx={cx}
          cy={cy + dropY * 0.3}
          rx={r}
          ry={r * 1.1}
          animate={{ fill: body }}
          transition={{ duration: 0.4 }}
          filter={`url(#glow-${emotion}-${size})`}
        />

        {/* Eyes */}
        <motion.circle
          cx={cx - eyeOffsetX}
          cy={cy - eyeOffsetY + dropY * 0.2}
          r={eyeR}
          fill="white"
          animate={{ scaleY: emotion === "thinking" ? 0.5 : 1 }}
          transition={{ duration: 0.2 }}
        />
        <motion.circle
          cx={cx + eyeOffsetX}
          cy={cy - eyeOffsetY + dropY * 0.2}
          r={eyeR}
          fill="white"
          animate={{ scaleY: emotion === "thinking" ? 0.5 : 1 }}
          transition={{ duration: 0.2 }}
        />

        {/* Pupils */}
        <circle
          cx={cx - eyeOffsetX + (emotion === "thinking" ? 2 : 0)}
          cy={cy - eyeOffsetY + eyeR * 0.3 + dropY * 0.2}
          r={eyeR * 0.5}
          fill="#1e1b4b"
        />
        <circle
          cx={cx + eyeOffsetX + (emotion === "thinking" ? 2 : 0)}
          cy={cy - eyeOffsetY + eyeR * 0.3 + dropY * 0.2}
          r={eyeR * 0.5}
          fill="#1e1b4b"
        />

        {/* Thinking sparkles */}
        {emotion === "thinking" && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.circle
                key={i}
                cx={cx + (i - 1) * size * 0.15}
                cy={cy - r - size * 0.06}
                r={size * 0.025}
                fill={body}
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.3 }}
              />
            ))}
          </>
        )}

        {/* Crown for proud */}
        {emotion === "proud" && (
          <motion.path
            d={`M${cx - r * 0.5},${cy - r * 0.85} L${cx - r * 0.25},${cy - r * 1.05} L${cx},${cy - r * 0.9} L${cx + r * 0.25},${cy - r * 1.05} L${cx + r * 0.5},${cy - r * 0.85} Z`}
            fill="#f59e0b"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          />
        )}
      </motion.svg>

      {/* Sparks explosion (lesson completion) */}
      <AnimatePresence>
        {withSparks && (
          <>
            {SPARK_ANGLES.map((angle, i) => (
              <motion.div
                key={i}
                style={{
                  position: "absolute",
                  left: size / 2,
                  top: size / 2,
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor:
                    i % 3 === 0 ? "#f59e0b" : i % 3 === 1 ? "#6366f1" : "#22c55e",
                  transformOrigin: "center",
                }}
                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                animate={{
                  scale: [0, 1.5, 0],
                  x: Math.cos(angle) * size * 0.85,
                  y: Math.sin(angle) * size * 0.85,
                  opacity: [1, 1, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, delay: i * 0.03 }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
