// Pure types + component/slot/connection definitions for the CPU assembly
// puzzle. Zero React, zero DOM access — safe to import from any layer.

export type CPUComponentId =
  | "alu"
  | "control-unit"
  | "program-counter"
  | "registers"
  | "ram"
  | "system-bus";

export type IconKind = "alu" | "cu" | "pc" | "reg" | "ram" | "bus";

export type SlotId =
  | "slot-pc"
  | "slot-cu"
  | "slot-alu"
  | "slot-reg"
  | "slot-ram"
  | "slot-bus";

export type CPUComponent = {
  id: CPUComponentId;
  /** Short symbol (e.g. "ALU"). */
  label: string;
  /** Spelled-out name (e.g. "Arithmetic Logic Unit"). */
  fullName: string;
  /** Romanian one-liner description. */
  romanianDesc: string;
  icon: IconKind;
  /** Dominant color used for stroke/fill. */
  color: string;
  /** Hex used for the drop-shadow glow. */
  glowColor: string;
  /** Which slot this piece belongs in. */
  slotId: SlotId;
  /** Two short facts. The first one is shown on the card. */
  facts: [string, string];
};

export const CPU_COMPONENTS: Record<CPUComponentId, CPUComponent> = {
  alu: {
    id: "alu",
    label: "ALU",
    fullName: "Arithmetic Logic Unit",
    romanianDesc: "Efectuează toate operațiile matematice și logice",
    icon: "alu",
    color: "#6C5CE7",
    glowColor: "#6C5CE7",
    slotId: "slot-alu",
    facts: ["Adunare, scădere, AND, OR", "Inima calculatorului"],
  },
  "control-unit": {
    id: "control-unit",
    label: "CU",
    fullName: "Control Unit",
    romanianDesc: "Citește și decodifică instrucțiunile din memorie",
    icon: "cu",
    color: "#00CEC9",
    glowColor: "#00CEC9",
    slotId: "slot-cu",
    facts: ["Fetch → Decode → Execute", "Dirijorul orchestrei"],
  },
  "program-counter": {
    id: "program-counter",
    label: "PC",
    fullName: "Program Counter",
    romanianDesc: "Ține minte adresa următoarei instrucțiuni",
    icon: "pc",
    color: "#FDCB6E",
    glowColor: "#FDCB6E",
    slotId: "slot-pc",
    facts: ["Adresa următorului pas", "Incrementează pas cu pas"],
  },
  registers: {
    id: "registers",
    label: "REG",
    fullName: "Registers",
    romanianDesc: "Stocare ultra-rapidă direct în CPU",
    icon: "reg",
    color: "#a29bfe",
    glowColor: "#a29bfe",
    slotId: "slot-reg",
    facts: ["Acces sub 1 ns", "Doar câțiva octeți"],
  },
  ram: {
    id: "ram",
    label: "RAM",
    fullName: "Random Access Memory",
    romanianDesc: "Memoria de lucru — programele și datele active",
    icon: "ram",
    color: "#55efc4",
    glowColor: "#55efc4",
    slotId: "slot-ram",
    facts: ["Gigabytes de spațiu", "Volatilă — se șterge la oprire"],
  },
  "system-bus": {
    id: "system-bus",
    label: "BUS",
    fullName: "System Bus",
    romanianDesc: "Autostrada de date între toate componentele",
    icon: "bus",
    color: "#fd79a8",
    glowColor: "#fd79a8",
    slotId: "slot-bus",
    facts: ["Address + Data + Control", "Lățimea îi dictează viteza"],
  },
};

/** Render order in the tray. */
export const ALL_COMPONENT_IDS: readonly CPUComponentId[] = [
  "program-counter",
  "control-unit",
  "alu",
  "registers",
  "ram",
  "system-bus",
];

// ─── Slot layout ─────────────────────────────────────────────────────────

export const BOARD_WIDTH = 700;
export const BOARD_HEIGHT = 420;

export type SlotDefinition = {
  id: SlotId;
  componentId: CPUComponentId;
  /** Absolute pixel position inside the board's SVG/CSS plane. */
  x: number;
  y: number;
  w: number;
  h: number;
};

/**
 * Slots are positioned absolutely inside a 700×420 board so the SVG overlay
 * (which draws the connecting lines) can use the same coordinate space.
 *
 *      ┌─────────────────────────────────────────┐
 *      │            [   PC   ]                   │
 *      │  [  CU  ]  [  ALU  ]  [  REG  ]         │
 *      │            [  RAM   ]                   │
 *      │ [          SYSTEM BUS              ]    │
 *      └─────────────────────────────────────────┘
 */
export const SLOT_LAYOUT: readonly SlotDefinition[] = [
  { id: "slot-pc", componentId: "program-counter", x: 250, y: 22, w: 200, h: 70 },
  { id: "slot-cu", componentId: "control-unit", x: 20, y: 110, w: 200, h: 95 },
  { id: "slot-alu", componentId: "alu", x: 250, y: 110, w: 200, h: 95 },
  { id: "slot-reg", componentId: "registers", x: 480, y: 110, w: 200, h: 95 },
  { id: "slot-ram", componentId: "ram", x: 250, y: 222, w: 200, h: 70 },
  { id: "slot-bus", componentId: "system-bus", x: 20, y: 312, w: 660, h: 70 },
];

/** Map from slot ID → expected component ID (fast lookup). */
export const SLOT_TO_COMPONENT: Record<SlotId, CPUComponentId> =
  SLOT_LAYOUT.reduce(
    (acc, s) => ({ ...acc, [s.id]: s.componentId }),
    {} as Record<SlotId, CPUComponentId>
  );

// ─── Connections ─────────────────────────────────────────────────────────

export type Connection = {
  id: string;
  fromSlot: SlotId;
  toSlot: SlotId;
  /** Orthogonal SVG path d string. */
  path: string;
  bidirectional?: boolean;
};

/**
 * Connections between slots. Each path is hand-routed to match the slot
 * positions above; orthogonal segments only (horizontal + vertical).
 */
export const CONNECTIONS: readonly Connection[] = [
  // PC → CU (instruction address)
  {
    id: "pc-cu",
    fromSlot: "slot-pc",
    toSlot: "slot-cu",
    path: "M 350 92 L 350 102 L 120 102 L 120 110",
  },
  // CU ↔ ALU (control + status)
  {
    id: "cu-alu",
    fromSlot: "slot-cu",
    toSlot: "slot-alu",
    path: "M 220 158 L 250 158",
    bidirectional: true,
  },
  // ALU ↔ REG (operands + result)
  {
    id: "alu-reg",
    fromSlot: "slot-alu",
    toSlot: "slot-reg",
    path: "M 450 158 L 480 158",
    bidirectional: true,
  },
  // ALU → RAM (through center column)
  {
    id: "alu-ram",
    fromSlot: "slot-alu",
    toSlot: "slot-ram",
    path: "M 350 205 L 350 222",
  },
  // RAM → BUS (vertical)
  {
    id: "ram-bus",
    fromSlot: "slot-ram",
    toSlot: "slot-bus",
    path: "M 350 292 L 350 312",
  },
  // CU stub → BUS (left)
  {
    id: "cu-bus",
    fromSlot: "slot-cu",
    toSlot: "slot-bus",
    path: "M 120 205 L 120 312",
  },
  // REG stub → BUS (right)
  {
    id: "reg-bus",
    fromSlot: "slot-reg",
    toSlot: "slot-bus",
    path: "M 580 205 L 580 312",
  },
];
