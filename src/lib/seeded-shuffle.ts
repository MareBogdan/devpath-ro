// ============================================
// DevPath RO — Deterministic seeded shuffle (pure)
// ============================================
// Used to randomize display order of `ordering` items and `match_pairs` right
// column WITHOUT a hydration mismatch: the same (array, seed) always yields the
// same permutation on server and client. Seed with the question id so each
// question shuffles stably across SSR + hydration and across reloads.
//
// NEVER use Math.random() for display order — it differs between server render
// and client render and triggers a React hydration error.

// xmur3 string hash → a 32-bit seed generator.
function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

// mulberry32 — small fast deterministic PRNG in [0, 1).
function mulberry32(a: number): () => number {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministic Fisher–Yates shuffle. Returns a NEW array (input untouched).
 * Same `seed` → same permutation, on server and client alike.
 */
export function seededShuffle<T>(array: T[], seed: string): T[] {
  const rand = mulberry32(xmur3(seed)());
  const out = array.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}
