import type { ReactNode } from "react";

// <Sub> — a real subscript for physics/maths notation in lesson MDX: V<Sub>GS</Sub>, V<Sub>th</Sub>.
//
// Deliberately an explicit tag and NOT an automatic `X_Y` → subscript transform: a regex over the
// prose would mangle code blocks, file names and identifiers (`content_md`, `order_index`, …).
// Authoring rule (LESSON-STANDARD.md §4d): every subscripted quantity in a lesson is written with
// <Sub>, including in headings and table cells; plain `_` stays for code.
//
// Renders a native <sub>: Tailwind's preflight already sizes it (75%) and lowers it without
// disturbing the line height, so a paragraph with subscripts keeps its rhythm. Server-safe (no
// hooks), so it adds nothing to the client bundle beyond the registry entry.
export function Sub({ children }: { children?: ReactNode }) {
  return <sub>{children}</sub>;
}
