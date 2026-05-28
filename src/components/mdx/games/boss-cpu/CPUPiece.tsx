"use client";

import {
  useCallback,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type DragEvent as ReactDragEvent,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CPUComponent, CPUComponentId, IconKind } from "./cpu-types";

// ─── Icon ────────────────────────────────────────────────────────────────

/**
 * Custom inline SVG glyph per CPU component kind. Drawn as paths so the
 * stroke/fill color follows the component theme. Exported so the board can
 * reuse the same shapes inside placed-slot ghosts.
 */
export function CPUIcon({
  kind,
  color,
  size = 28,
}: {
  kind: IconKind;
  color: string;
  size?: number;
}) {
  const strokeProps = {
    stroke: color,
    strokeWidth: 1.4,
    fill: "none" as const,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (kind) {
    case "alu":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
          <polygon points="12,3 21,12 12,21 3,12" {...strokeProps} />
          <text
            x={12}
            y={8.5}
            textAnchor="middle"
            fontSize="5"
            fontFamily="ui-monospace, monospace"
            fontWeight={700}
            fill={color}
          >
            +
          </text>
          <text
            x={18}
            y={13.6}
            textAnchor="middle"
            fontSize="5"
            fontFamily="ui-monospace, monospace"
            fontWeight={700}
            fill={color}
          >
            −
          </text>
          <text
            x={12}
            y={19}
            textAnchor="middle"
            fontSize="5"
            fontFamily="ui-monospace, monospace"
            fontWeight={700}
            fill={color}
          >
            ×
          </text>
          <text
            x={6}
            y={13.6}
            textAnchor="middle"
            fontSize="5"
            fontFamily="ui-monospace, monospace"
            fontWeight={700}
            fill={color}
          >
            ÷
          </text>
        </svg>
      );

    case "cu":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
          <rect x={7} y={7} width={10} height={10} rx={1} {...strokeProps} />
          {[9.5, 12, 14.5].map((y) => (
            <line key={`l${y}`} x1={2} y1={y} x2={7} y2={y} {...strokeProps} />
          ))}
          {[9.5, 12, 14.5].map((y) => (
            <line key={`r${y}`} x1={17} y1={y} x2={22} y2={y} {...strokeProps} />
          ))}
          <circle cx={12} cy={12} r={1.6} fill={color} />
        </svg>
      );

    case "pc":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
          <line x1={3} y1={17} x2={21} y2={17} {...strokeProps} />
          {[6, 11, 16, 21].map((x) => (
            <line key={x} x1={x} y1={15} x2={x} y2={19} {...strokeProps} />
          ))}
          <polygon points="9,8 15,8 12,13" fill={color} />
          <line x1={12} y1={13} x2={12} y2={15} {...strokeProps} />
        </svg>
      );

    case "reg":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
          {[5, 9, 13, 17].map((y, i) => (
            <rect
              key={y}
              x={4}
              y={y}
              width={16}
              height={2.5}
              rx={0.5}
              fill={color}
              opacity={1 - i * 0.13}
            />
          ))}
        </svg>
      );

    case "ram":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
          {[0, 1, 2, 3].flatMap((col) =>
            [0, 1, 2].map((row) => (
              <rect
                key={`${col}-${row}`}
                x={4 + col * 4.2}
                y={5 + row * 4.5}
                width={3.4}
                height={3.4}
                rx={0.3}
                fill={color}
                opacity={(col + row * 2) % 3 === 0 ? 0.95 : 0.6}
              />
            ))
          )}
        </svg>
      );

    case "bus":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
          <line x1={2} y1={12} x2={22} y2={12} {...strokeProps} strokeWidth={2} />
          {[5, 9, 13, 17].map((x) => (
            <g key={x}>
              <line x1={x} y1={6} x2={x} y2={12} {...strokeProps} />
              <line x1={x} y1={12} x2={x} y2={18} {...strokeProps} />
            </g>
          ))}
        </svg>
      );
  }
}

// ─── Piece component ─────────────────────────────────────────────────────

type CPUPieceProps = {
  component: CPUComponent;
  /** Controlled from parent — true while this piece is being dragged. */
  isDragging?: boolean;
  /** Already placed correctly on the board. */
  isPlaced?: boolean;
  /** Cannot be dragged (e.g. game state locks pieces). */
  isDisabled?: boolean;
  onDragStart: (id: CPUComponentId) => void;
  onDragEnd: () => void;
};

/**
 * A draggable CPU component card. Uses native HTML5 drag for desktop, and
 * pointer events for touch. Touch drags dispatch window-level custom events
 * (`cpu-piece-touch-drag` / `cpu-piece-touch-drop`) so the `AssemblyBoard`
 * can resolve drop slots via `elementFromPoint`.
 */
export default function CPUPiece({
  component,
  isDragging = false,
  isPlaced = false,
  isDisabled = false,
  onDragStart,
  onDragEnd,
}: CPUPieceProps) {
  const reduced = useReducedMotion() ?? false;
  const [touchDragging, setTouchDragging] = useState(false);
  const [touchPos, setTouchPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const startRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const locked = isDisabled || isPlaced;

  // ── HTML5 drag (desktop) ────────────────────────────────────────────
  const handleDragStart = useCallback(
    (e: ReactDragEvent<HTMLDivElement>) => {
      if (locked) {
        e.preventDefault();
        return;
      }
      e.dataTransfer.setData("text/plain", component.id);
      e.dataTransfer.effectAllowed = "move";
      onDragStart(component.id);
    },
    [component.id, locked, onDragStart]
  );

  const handleDragEnd = useCallback(() => {
    onDragEnd();
  }, [onDragEnd]);

  // ── Pointer events (touch) ──────────────────────────────────────────
  const elementUnderPoint = (
    target: HTMLElement,
    clientX: number,
    clientY: number
  ): string | null => {
    const prevPE = target.style.pointerEvents;
    target.style.pointerEvents = "none";
    const el = document.elementFromPoint(clientX, clientY);
    target.style.pointerEvents = prevPE;
    const slotEl = el?.closest("[data-cpu-slot]") as HTMLElement | null;
    return slotEl?.dataset.cpuSlot ?? null;
  };

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.pointerType !== "touch") return; // mouse handled by HTML5 drag
      if (locked) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      startRef.current = { x: e.clientX, y: e.clientY };
      setTouchPos({ x: 0, y: 0 });
      setTouchDragging(true);
      onDragStart(component.id);
    },
    [component.id, locked, onDragStart]
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!touchDragging) return;
      setTouchPos({
        x: e.clientX - startRef.current.x,
        y: e.clientY - startRef.current.y,
      });
      const slotId = elementUnderPoint(
        e.currentTarget,
        e.clientX,
        e.clientY
      );
      window.dispatchEvent(
        new CustomEvent("cpu-piece-touch-drag", {
          detail: { componentId: component.id, slotId },
        })
      );
    },
    [touchDragging, component.id]
  );

  const handlePointerUp = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!touchDragging) return;
      const slotId = elementUnderPoint(
        e.currentTarget,
        e.clientX,
        e.clientY
      );
      window.dispatchEvent(
        new CustomEvent("cpu-piece-touch-drop", {
          detail: { componentId: component.id, slotId },
        })
      );
      setTouchDragging(false);
      setTouchPos({ x: 0, y: 0 });
      onDragEnd();
    },
    [touchDragging, component.id, onDragEnd]
  );

  const handlePointerCancel = useCallback(() => {
    if (!touchDragging) return;
    setTouchDragging(false);
    setTouchPos({ x: 0, y: 0 });
    onDragEnd();
  }, [touchDragging, onDragEnd]);

  const lifted = isDragging || touchDragging;

  // Outer plain div carries native HTML5 drag handlers (framer-motion
  // overrides onDragStart/onDragEnd for its own gesture system, so we keep
  // those at the DOM layer). Inner motion.div handles animations.
  return (
    <div
      draggable={!locked}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      data-cpu-piece-id={component.id}
      aria-label={`${component.fullName} — ${component.romanianDesc}`}
      className={cn(
        "relative h-[100px] w-[140px] shrink-0 select-none",
        locked ? "cursor-default" : "cursor-grab active:cursor-grabbing",
        isPlaced && "pointer-events-none"
      )}
      style={{
        zIndex: lifted ? 50 : undefined,
        touchAction: "none",
      }}
    >
      <motion.div
        className="relative flex h-full w-full flex-col rounded-md border-2 bg-[#0d0d1a] p-2.5"
        style={{
          borderColor: `${component.color}99`,
          boxShadow: lifted
            ? `0 12px 28px -8px ${component.glowColor}cc, 0 0 22px ${component.glowColor}77`
            : `0 0 10px ${component.glowColor}26`,
          transition: "border-color 200ms ease, box-shadow 200ms ease",
        }}
        whileHover={
          locked || lifted || reduced ? undefined : { scale: 1.03 }
        }
        animate={{
          x: touchDragging ? touchPos.x : 0,
          y: touchDragging ? touchPos.y : 0,
          scale: lifted && !reduced ? 1.05 : 1,
          rotate: lifted && !reduced ? 2 : 0,
          opacity: isPlaced ? 0.45 : lifted ? 0.92 : 1,
        }}
        transition={
          touchDragging
            ? { duration: 0 }
            : { duration: 0.18, ease: "easeOut" }
        }
      >
        {/* Header: label + icon */}
        <div className="flex items-start justify-between gap-2">
          <span
            className="font-mono text-2xl font-bold leading-none tracking-tight"
            style={{ color: component.color }}
          >
            {component.label}
          </span>
          <span
            style={{
              filter: `drop-shadow(0 0 4px ${component.glowColor}99)`,
            }}
          >
            <CPUIcon kind={component.icon} color={component.color} size={26} />
          </span>
        </div>

        {/* Full name */}
        <span className="mt-1 font-mono text-[8.5px] uppercase leading-tight tracking-[0.12em] text-white/50">
          {component.fullName}
        </span>

        {/* Fact */}
        <span
          className="mt-auto font-mono text-[9px] leading-tight"
          style={{ color: `${component.color}dd` }}
        >
          {component.facts[0]}
        </span>

        {/* Placed ✓ overlay */}
        {isPlaced && (
          <span
            aria-hidden
            className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-[#00FF94]/55 bg-[#00FF94]/15"
          >
            <Check
              className="h-3 w-3 text-[#00FF94]"
              strokeWidth={3}
              style={{ filter: "drop-shadow(0 0 4px #00FF94)" }}
              aria-hidden
            />
          </span>
        )}
      </motion.div>
    </div>
  );
}
