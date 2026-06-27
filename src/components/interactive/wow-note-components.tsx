import type { FC } from "react";

/**
 * Registry of components a Wow Note may embed via `media_type = "component"`.
 * `wow_notes.media_ref` is the KEY; the value is the React component rendered
 * inside the note card. Mirrors the by-name resolution of the MDX component map.
 *
 * EMPTY for now — real components are added here as the manual Wow-Note content
 * is authored, e.g.:
 *
 *   import { AtomDiagram } from "@/components/wow/atom-diagram";
 *   export const WOW_NOTE_COMPONENTS: Record<string, FC> = {
 *     "atom-diagram": AtomDiagram,
 *   };
 *
 * An unknown key is handled gracefully by <WowNote> (an authoring-error box),
 * never a crash.
 */
export const WOW_NOTE_COMPONENTS: Record<string, FC> = {
  // (no components registered yet)
};
