// Pure logic-evaluation engine for the boss alarm puzzle.
// Zero React, zero DOM. Only types, pure functions, and circuit definitions.

export type BitValue = 0 | 1;

export type GateType = "AND" | "OR" | "NOT" | "NAND" | "XOR";

export type Gate = {
  id: string;
  type: GateType;
  /** 1 entry for NOT, 2 entries for everything else. */
  inputIds: string[];
};

export type CircuitInput = {
  id: string;
  label: string;
  /** Optional Romanian human-readable name (e.g. "Mișcare"). */
  subLabel?: string;
};

export type CircuitDefinition = {
  id: string;
  inputs: CircuitInput[];
  gates: Gate[];
  outputGateId: string;
};

// ─── Gate primitives ──────────────────────────────────────────────────────

function and(a: BitValue, b: BitValue): BitValue {
  return a === 1 && b === 1 ? 1 : 0;
}
function or(a: BitValue, b: BitValue): BitValue {
  return a === 1 || b === 1 ? 1 : 0;
}
function not(a: BitValue): BitValue {
  return a === 1 ? 0 : 1;
}
function nand(a: BitValue, b: BitValue): BitValue {
  return and(a, b) === 1 ? 0 : 1;
}
function xor(a: BitValue, b: BitValue): BitValue {
  return a !== b ? 1 : 0;
}

function evalGate(type: GateType, inputs: BitValue[]): BitValue {
  switch (type) {
    case "AND":
      return and(inputs[0], inputs[1]);
    case "OR":
      return or(inputs[0], inputs[1]);
    case "NOT":
      return not(inputs[0]);
    case "NAND":
      return nand(inputs[0], inputs[1]);
    case "XOR":
      return xor(inputs[0], inputs[1]);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────

/**
 * Evaluate every node in the circuit. Returns a map of node-id → bit value
 * containing all inputs AND all gates. Topological order is inferred — gates
 * without ready inputs are deferred to a later iteration.
 *
 * Pure. Same inputs → same outputs. No side effects.
 */
export function evaluateCircuit(
  def: CircuitDefinition,
  inputValues: Record<string, BitValue>
): Map<string, BitValue> {
  const values = new Map<string, BitValue>();

  for (const input of def.inputs) {
    values.set(input.id, inputValues[input.id] ?? 0);
  }

  const remaining = new Map(def.gates.map((g) => [g.id, g]));
  let safety = def.gates.length + 1;
  while (remaining.size > 0 && safety > 0) {
    safety--;
    for (const [id, gate] of Array.from(remaining)) {
      const bits: BitValue[] = [];
      let ready = true;
      for (const inputId of gate.inputIds) {
        const v = values.get(inputId);
        if (v === undefined) {
          ready = false;
          break;
        }
        bits.push(v);
      }
      if (!ready) continue;
      values.set(id, evalGate(gate.type, bits));
      remaining.delete(id);
    }
  }

  return values;
}

/**
 * Assign each node a propagation layer. Inputs are layer 0. A gate's layer is
 * max(input layers) + 1. Used by the renderer to cascade visual updates.
 */
export function computeLayers(def: CircuitDefinition): Map<string, number> {
  const layers = new Map<string, number>();

  for (const input of def.inputs) {
    layers.set(input.id, 0);
  }

  const remaining = new Map(def.gates.map((g) => [g.id, g]));
  let safety = def.gates.length + 1;
  while (remaining.size > 0 && safety > 0) {
    safety--;
    for (const [id, gate] of Array.from(remaining)) {
      const inputLayers: number[] = [];
      let ready = true;
      for (const inputId of gate.inputIds) {
        const l = layers.get(inputId);
        if (l === undefined) {
          ready = false;
          break;
        }
        inputLayers.push(l);
      }
      if (!ready) continue;
      layers.set(id, Math.max(...inputLayers) + 1);
      remaining.delete(id);
    }
  }

  return layers;
}

// ─── Prebuilt circuits (used in the boss fight) ───────────────────────────

/** Wave 1 — (A AND B) OR C — 3 inputs, 2 gates, 1 layer of depth-2. */
export const CIRCUIT_WAVE_1: CircuitDefinition = {
  id: "wave-1",
  inputs: [
    { id: "A", label: "A", subLabel: "Mișcare" },
    { id: "B", label: "B", subLabel: "Temperatură" },
    { id: "C", label: "C", subLabel: "Sunet" },
  ],
  gates: [
    { id: "G1", type: "AND", inputIds: ["A", "B"] },
    { id: "G2", type: "OR", inputIds: ["G1", "C"] },
  ],
  outputGateId: "G2",
};

/** Wave 2 — (NOT A) AND (B OR C) — 3 gates including a NOT. */
export const CIRCUIT_WAVE_2: CircuitDefinition = {
  id: "wave-2",
  inputs: [
    { id: "A", label: "A", subLabel: "Mișcare" },
    { id: "B", label: "B", subLabel: "Temperatură" },
    { id: "C", label: "C", subLabel: "Sunet" },
  ],
  gates: [
    { id: "G1", type: "NOT", inputIds: ["A"] },
    { id: "G2", type: "OR", inputIds: ["B", "C"] },
    { id: "G3", type: "AND", inputIds: ["G1", "G2"] },
  ],
  outputGateId: "G3",
};

/** Wave 3 — NAND(A, B) AND NAND(C, NOT B) — 4 gates, NAND as universal. */
export const CIRCUIT_WAVE_3: CircuitDefinition = {
  id: "wave-3",
  inputs: [
    { id: "A", label: "A", subLabel: "Mișcare" },
    { id: "B", label: "B", subLabel: "Temperatură" },
    { id: "C", label: "C", subLabel: "Sunet" },
  ],
  gates: [
    { id: "G1", type: "NAND", inputIds: ["A", "B"] },
    { id: "G2", type: "NOT", inputIds: ["B"] },
    { id: "G3", type: "NAND", inputIds: ["C", "G2"] },
    { id: "G4", type: "AND", inputIds: ["G1", "G3"] },
  ],
  outputGateId: "G4",
};
