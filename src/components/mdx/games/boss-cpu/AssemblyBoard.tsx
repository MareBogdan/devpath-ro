"use client";

import {
  useCallback,
  useEffect,
  useId,
  type CSSProperties,
  type DragEvent as ReactDragEvent,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CPUIcon } from "./CPUPiece";
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  CONNECTIONS,
  CPU_COMPONENTS,
  SLOT_LAYOUT,
  SLOT_TO_COMPONENT,
  type CPUComponentId,
  type Connection,
  type SlotId,
} from "./cpu-types";

// ─── Props ────────────────────────────────────────────────────────────────

type AssemblyBoardProps = {
  placedPieces: Partial<Record<CPUComponentId, boolean>>;
  /** Slot currently being hovered during a drag, if any. */
  dragOverSlot: SlotId | null;
  /** Slot that just received an invalid drop — drives shake/flash. */
  wrongSlot: SlotId | null;
  /** ID of the piece currently being dragged (so we can preview the right slot). */
  draggingId: CPUComponentId | null;
  /** Slot lit up during the active boot-sequence step. */
  activeBootSlot?: SlotId | null;
  /** When true, all placed slots pulse gold (boot cycle complete). */
  bootComplete?: boolean;
  onDrop: (slotId: SlotId) => void;
  onDragOver: (slotId: SlotId) => void;
  onDragLeave: () => void;
};

// ─── Connection underlay ─────────────────────────────────────────────────

function ConnectionLine({
  conn,
  active,
  arrowMarkerId,
  reduced,
}: {
  conn: Connection;
  active: boolean;
  arrowMarkerId: string;
  reduced: boolean;
}) {
  return (
    <g>
      {/* Dashed underlay (visible until both ends are placed) */}
      <path
        d={conn.path}
        fill="none"
        stroke="#2a2a3e"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeDasharray="4 4"
        opacity={active ? 0 : 0.6}
        style={{ transition: "opacity 400ms ease" }}
      />

      {/* Active line — draws in via stroke-dashoffset */}
      {active && (
        <motion.path
          d={conn.path}
          fill="none"
          stroke="#00CEC9"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={reduced ? undefined : "600"}
          initial={reduced ? false : { strokeDashoffset: 600 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: reduced ? 0 : 0.9, ease: "easeOut" }}
          markerEnd={`url(#${arrowMarkerId})`}
          markerStart={
            conn.bidirectional ? `url(#${arrowMarkerId})` : undefined
          }
          style={{ filter: "drop-shadow(0 0 4px #00CEC9)" }}
        />
      )}
    </g>
  );
}

// ─── Board ───────────────────────────────────────────────────────────────

/**
 * The Von Neumann assembly board. Renders 6 drop-zone slots over a PCB-style
 * grid background and an SVG overlay that draws connecting lines between
 * placed components.
 *
 * This is a controlled component — the parent owns the placedPieces /
 * dragOverSlot / draggingId / wrongSlot state. The board fires
 * `onDragOver` / `onDragLeave` / `onDrop` for desktop drag events AND
 * forwards touch-drag custom events from `<CPUPiece>` to the same callbacks.
 */
export default function AssemblyBoard({
  placedPieces,
  dragOverSlot,
  wrongSlot,
  draggingId,
  activeBootSlot = null,
  bootComplete = false,
  onDrop,
  onDragOver,
  onDragLeave,
}: AssemblyBoardProps) {
  const reduced = useReducedMotion() ?? false;
  const uid = useId();
  const gridPatternId = `cpu-pcb-grid-${uid}`;
  const arrowMarkerId = `cpu-arrow-${uid}`;

  // Forward touch-drag custom events from <CPUPiece> to the parent's
  // controlled callbacks. <CPUPiece> dispatches these on window when the
  // user touch-drags; we resolve them to slot IDs via elementFromPoint
  // inside the piece itself, then call the right handler here.
  useEffect(() => {
    const handleTouchDrag = (e: Event) => {
      const detail = (e as CustomEvent<{ slotId: string | null }>).detail;
      if (detail.slotId) {
        onDragOver(detail.slotId as SlotId);
      } else {
        onDragLeave();
      }
    };
    const handleTouchDrop = (e: Event) => {
      const detail = (e as CustomEvent<{ slotId: string | null }>).detail;
      if (detail.slotId) {
        onDrop(detail.slotId as SlotId);
      } else {
        onDragLeave();
      }
    };
    window.addEventListener("cpu-piece-touch-drag", handleTouchDrag);
    window.addEventListener("cpu-piece-touch-drop", handleTouchDrop);
    return () => {
      window.removeEventListener("cpu-piece-touch-drag", handleTouchDrag);
      window.removeEventListener("cpu-piece-touch-drop", handleTouchDrop);
    };
  }, [onDragOver, onDrop, onDragLeave]);

  // ── HTML5 drag handlers (mouse) ─────────────────────────────────────
  const handleSlotDragOver = useCallback(
    (slotId: SlotId, e: ReactDragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (dragOverSlot !== slotId) onDragOver(slotId);
    },
    [dragOverSlot, onDragOver]
  );

  const handleSlotDrop = useCallback(
    (slotId: SlotId, e: ReactDragEvent<HTMLDivElement>) => {
      e.preventDefault();
      onDrop(slotId);
    },
    [onDrop]
  );

  /** Clear the highlight only when the drag genuinely leaves the board. */
  const handleBoardDragLeave = useCallback(
    (e: ReactDragEvent<HTMLDivElement>) => {
      const related = e.relatedTarget as Node | null;
      if (!related || !e.currentTarget.contains(related)) {
        onDragLeave();
      }
    },
    [onDragLeave]
  );

  const draggingComponent = draggingId ? CPU_COMPONENTS[draggingId] : null;

  return (
    <div className="overflow-x-auto">
      <div
        className="relative mx-auto"
        style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT }}
        onDragLeave={handleBoardDragLeave}
      >
        {/* ── SVG underlay: PCB grid + connections ─────────────────── */}
        <svg
          className="pointer-events-none absolute inset-0"
          viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
          aria-hidden
        >
          <defs>
            <pattern
              id={gridPatternId}
              patternUnits="userSpaceOnUse"
              width={20}
              height={20}
            >
              <path
                d="M 20 0 L 0 0 0 20"
                stroke="rgba(0,206,201,0.05)"
                strokeWidth={0.5}
                fill="none"
              />
            </pattern>
            <marker
              id={arrowMarkerId}
              viewBox="0 0 10 10"
              refX={9}
              refY={5}
              markerWidth={6}
              markerHeight={6}
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 Z" fill="#00CEC9" />
            </marker>
          </defs>

          {/* PCB grid background */}
          <rect
            width={BOARD_WIDTH}
            height={BOARD_HEIGHT}
            fill={`url(#${gridPatternId})`}
          />

          {/* HUD coordinate tags */}
          <g fontFamily="ui-monospace, monospace" fontSize="8" fill="#00CEC9" fillOpacity="0.5">
            <text x={8} y={14}>x:000 y:000</text>
            <text x={BOARD_WIDTH - 90} y={14}>VON_NEUMANN_v1</text>
            <text x={8} y={BOARD_HEIGHT - 6}>BOARD/ASM</text>
            <text x={BOARD_WIDTH - 92} y={BOARD_HEIGHT - 6}>
              x:{BOARD_WIDTH} y:{BOARD_HEIGHT}
            </text>
          </g>

          {/* Corner brackets — sci-fi HUD frame */}
          <g stroke="#00CEC9" strokeWidth={1} fill="none" opacity={0.35}>
            <path d="M 6 6 L 24 6 M 6 6 L 6 24" />
            <path
              d={`M ${BOARD_WIDTH - 6} 6 L ${BOARD_WIDTH - 24} 6 M ${BOARD_WIDTH - 6} 6 L ${BOARD_WIDTH - 6} 24`}
            />
            <path
              d={`M 6 ${BOARD_HEIGHT - 6} L 24 ${BOARD_HEIGHT - 6} M 6 ${BOARD_HEIGHT - 6} L 6 ${BOARD_HEIGHT - 24}`}
            />
            <path
              d={`M ${BOARD_WIDTH - 6} ${BOARD_HEIGHT - 6} L ${BOARD_WIDTH - 24} ${BOARD_HEIGHT - 6} M ${BOARD_WIDTH - 6} ${BOARD_HEIGHT - 6} L ${BOARD_WIDTH - 6} ${BOARD_HEIGHT - 24}`}
            />
          </g>

          {/* Connecting lines */}
          {CONNECTIONS.map((conn) => {
            const fromComponentId = SLOT_TO_COMPONENT[conn.fromSlot];
            const toComponentId = SLOT_TO_COMPONENT[conn.toSlot];
            const active =
              !!placedPieces[fromComponentId] &&
              !!placedPieces[toComponentId];
            return (
              <ConnectionLine
                key={conn.id}
                conn={conn}
                active={active}
                arrowMarkerId={arrowMarkerId}
                reduced={reduced}
              />
            );
          })}
        </svg>

        {/* ── Drop-zone slots (HTML, positioned absolutely) ────────── */}
        {SLOT_LAYOUT.map((slot) => {
          const component = CPU_COMPONENTS[slot.componentId];
          const isSlotPlaced = !!placedPieces[slot.componentId];
          const isThisDragOver = dragOverSlot === slot.id;
          const isThisWrong = wrongSlot === slot.id;
          const matchesDragging =
            draggingComponent != null &&
            draggingComponent.slotId === slot.id;
          const showCorrectHint = isThisDragOver && matchesDragging;
          const isActiveBoot = activeBootSlot === slot.id && isSlotPlaced;
          const isAllComplete = bootComplete && isSlotPlaced;

          // Border / background / glow — boot states override placed/drag visuals.
          let borderColor: string;
          let bg: string;
          let glow: string | undefined;
          let pulseColor: string | null = null;

          if (isActiveBoot) {
            borderColor = component.color;
            bg = `${component.color}24`;
            pulseColor = component.glowColor;
            glow = undefined; // animation drives box-shadow
          } else if (isAllComplete) {
            borderColor = "#FDCB6E";
            bg = `${component.color}12`;
            pulseColor = "#FDCB6E";
            glow = undefined;
          } else if (isSlotPlaced) {
            borderColor = `${component.color}aa`;
            bg = `${component.color}10`;
            glow = `0 0 14px ${component.glowColor}33`;
          } else if (showCorrectHint) {
            borderColor = component.color;
            bg = `${component.color}14`;
            glow = `0 0 22px ${component.glowColor}66`;
          } else if (isThisDragOver) {
            borderColor = "#FF6B6B";
            bg = "rgba(255,107,107,0.06)";
            glow = "none";
          } else if (isThisWrong) {
            borderColor = "#FF6B6B";
            bg = "rgba(8,8,16,0.75)";
            glow = "0 0 18px rgba(255,107,107,0.55)";
          } else {
            borderColor = "#2a2a3e";
            bg = "rgba(8,8,16,0.75)";
            glow = "none";
          }

          return (
            <motion.div
              key={slot.id}
              data-cpu-slot={slot.id}
              onDragOver={(e) => handleSlotDragOver(slot.id, e)}
              onDrop={(e) => handleSlotDrop(slot.id, e)}
              className={cn(
                "absolute flex flex-col items-center justify-center rounded-md transition-[border-color,background,box-shadow,transform] duration-200",
                isSlotPlaced ? "border-2 border-solid" : "border-2 border-dashed",
                isThisWrong && "boss-cpu-shake",
                pulseColor !== null && "boss-cpu-boot-glow"
              )}
              style={
                {
                  left: slot.x,
                  top: slot.y,
                  width: slot.w,
                  height: slot.h,
                  borderColor,
                  background: bg,
                  ...(glow !== undefined ? { boxShadow: glow } : {}),
                  transform: showCorrectHint ? "scale(1.02)" : "scale(1)",
                  ...(pulseColor !== null
                    ? { "--cpu-pulse-color": pulseColor }
                    : {}),
                } as CSSProperties
              }
            >
              {isSlotPlaced ? (
                <PlacedGhost
                  label={component.label}
                  icon={component.icon}
                  color={component.color}
                  fullName={component.fullName}
                />
              ) : (
                <EmptyHint
                  label={component.label}
                  color={
                    showCorrectHint ? component.color : "#5a5e6e"
                  }
                  highlighted={showCorrectHint}
                />
              )}
            </motion.div>
          );
        })}

        <style>{CSS_STYLES}</style>
      </div>
    </div>
  );
}

// ─── Slot inner pieces ───────────────────────────────────────────────────

function PlacedGhost({
  label,
  icon,
  color,
  fullName,
}: {
  label: string;
  icon: Parameters<typeof CPUIcon>[0]["kind"];
  color: string;
  fullName: string;
}) {
  return (
    <div className="relative flex flex-col items-center gap-1 py-1">
      <span
        aria-hidden
        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-[#00FF94]/55 bg-[#00FF94]/15"
      >
        <Check
          className="h-3 w-3 text-[#00FF94]"
          strokeWidth={3}
          style={{ filter: "drop-shadow(0 0 4px #00FF94)" }}
        />
      </span>
      <CPUIcon kind={icon} color={color} size={26} />
      <span
        className="font-mono text-sm font-bold leading-none"
        style={{ color }}
      >
        {label}
      </span>
      <span className="font-mono text-[8.5px] uppercase leading-tight tracking-wider text-white/45">
        {fullName}
      </span>
    </div>
  );
}

function EmptyHint({
  label,
  color,
  highlighted,
}: {
  label: string;
  color: string;
  highlighted: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={cn(
          "font-mono text-[10px] uppercase tracking-[0.18em] transition-colors duration-200",
          highlighted ? "font-bold" : "opacity-65"
        )}
        style={{ color }}
      >
        ↓ Plasează
      </span>
      <span
        className="font-mono text-base font-bold leading-none transition-colors duration-200"
        style={{ color, opacity: highlighted ? 1 : 0.6 }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── CSS keyframes ───────────────────────────────────────────────────────

const CSS_STYLES = `
@keyframes boss-cpu-shake-kf {
  0%, 100% { transform: translateX(0) scale(1); }
  15%, 45%, 75% { transform: translateX(-5px) scale(1); }
  30%, 60%, 90% { transform: translateX(5px) scale(1); }
}
.boss-cpu-shake { animation: boss-cpu-shake-kf 0.45s ease-in-out; }

@keyframes boss-cpu-boot-glow-kf {
  0%, 100% { box-shadow: 0 0 18px var(--cpu-pulse-color, #00CEC9); }
  50% { box-shadow: 0 0 38px var(--cpu-pulse-color, #00CEC9); }
}
.boss-cpu-boot-glow { animation: boss-cpu-boot-glow-kf 1.1s ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  .boss-cpu-shake, .boss-cpu-boot-glow { animation: none !important; }
}
`;
