// ============================================
// DevPath RO — fill_blank prompt parser (pure)
// ============================================
// fill_blank prompts embed numbered markers `{{1}}`, `{{2}}`, … (1-based in
// text) that map to `content.blanks[n-1]` (0-based array). Markers are mapped by
// NUMBER, not by order of appearance: `{{2}}` always targets blanks[1] even if
// it is written before `{{1}}`. v1 prompt text is plain (no markdown inside).
//
// Pure, no-DOM, unit-testable.

export type FillBlankSegment =
  | { kind: "text"; text: string }
  | { kind: "blank"; index: number };

// Capturing split → even indices are text, odd indices are the captured number.
// (No /g flag: split doesn't use lastIndex, and a shared /g object would carry
// state into matchAll below.)
const SPLIT_RE = /\{\{(\d+)\}\}/;
const SCAN_RE = /\{\{(\d+)\}\}/g;

/**
 * Split a prompt into ordered text/blank segments. `blank.index` is 0-based
 * (marker number minus 1). Empty text segments are preserved for adjacent
 * blanks (`{{1}}{{2}}` → "" between) and leading/trailing blanks (empty edge),
 * so callers can render faithfully; renderers may skip empty text.
 */
export function parseFillBlankPrompt(prompt: string): FillBlankSegment[] {
  const parts = prompt.split(SPLIT_RE);
  const segments: FillBlankSegment[] = [];
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      segments.push({ kind: "text", text: parts[i] });
    } else {
      segments.push({ kind: "blank", index: parseInt(parts[i], 10) - 1 });
    }
  }
  return segments;
}

/**
 * Validate that a prompt's `{{n}}` markers form exactly {1..blankCount}: right
 * count, unique, no gaps, none out of range. On failure returns a human-readable
 * (Romanian) error so the renderer can show an authoring-error box instead of
 * silently dropping a blank.
 */
export function validateFillBlankMarkers(
  prompt: string,
  blankCount: number
): { ok: true } | { ok: false; error: string } {
  const nums = Array.from(prompt.matchAll(SCAN_RE), (m) => parseInt(m[1], 10));

  if (nums.length !== blankCount) {
    return {
      ok: false,
      error: `Număr de marcaje {{n}} (${nums.length}) ≠ număr de blank-uri definite (${blankCount}).`,
    };
  }

  const seen = new Set<number>();
  for (const n of nums) {
    if (n < 1 || n > blankCount) {
      return { ok: false, error: `Marcaj {{${n}}} în afara intervalului 1..${blankCount}.` };
    }
    if (seen.has(n)) {
      return { ok: false, error: `Marcaj duplicat {{${n}}}.` };
    }
    seen.add(n);
  }

  for (let i = 1; i <= blankCount; i++) {
    if (!seen.has(i)) {
      return { ok: false, error: `Lipsește marcajul {{${i}}}.` };
    }
  }

  return { ok: true };
}
