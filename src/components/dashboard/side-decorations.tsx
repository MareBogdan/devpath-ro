"use client";

import dynamic from "next/dynamic";

const SideDecorationsCanvas = dynamic(
  () =>
    import("./three/side-decorations-canvas").then((m) => ({
      default: m.SideDecorationsCanvas,
    })),
  { ssr: false, loading: () => null }
);

export function SideDecorations() {
  return (
    <div
      className="hidden xl:block pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <SideDecorationsCanvas />
    </div>
  );
}
