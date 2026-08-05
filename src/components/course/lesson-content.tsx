"use client";

import { useMemo } from "react";
import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import "highlight.js/styles/github-dark.css";
import { getMdxComponents } from "@/components/mdx/mdx-components";
import {
  InteractiveLessonProvider,
  emptyInteractiveState,
} from "@/components/interactive/interactive-lesson-context";
import { WowNotesProvider } from "@/components/interactive/wow-notes-context";
import type { LessonInteractiveState, LessonWowNotes } from "@/types";

// Circuit-trace margin motif, inlined as a data-URI (no external asset → never a
// stale cache or 404; always paints). Tiled vertically behind the reading column.
const CIRCUIT_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 140 300' fill='none'>" +
  "<g stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'>" +
  "<path d='M45 0 V300' stroke='#8b7ff5' opacity='0.85'/>" +
  "<path d='M110 0 V300' stroke='#2fded7' opacity='0.8'/>" +
  "<path d='M45 60 H85 V110' stroke='#8b7ff5' opacity='0.75'/>" +
  "<path d='M45 200 H110' stroke='#2fded7' opacity='0.7'/>" +
  "<path d='M45 255 H22' stroke='#8b7ff5' opacity='0.75'/>" +
  "<path d='M110 150 H128' stroke='#2fded7' opacity='0.7'/>" +
  "</g>" +
  "<circle cx='45' cy='60' r='5' fill='#0d0d18' stroke='#8b7ff5' stroke-width='2.5'/>" +
  "<circle cx='85' cy='110' r='5' fill='#0d0d18' stroke='#8b7ff5' stroke-width='2.5'/>" +
  "<circle cx='110' cy='200' r='5' fill='#0d0d18' stroke='#2fded7' stroke-width='2.5'/>" +
  "<circle cx='45' cy='200' r='4' fill='#8b7ff5'/>" +
  "<rect x='13' y='249' width='12' height='12' rx='2' fill='#0d0d18' stroke='#8b7ff5' stroke-width='2.5'/>" +
  "<rect x='125' y='144' width='12' height='12' rx='2' fill='#0d0d18' stroke='#2fded7' stroke-width='2.5'/>" +
  "<circle cx='110' cy='110' r='4' fill='#2fded7'/>" +
  "</svg>";
const CIRCUIT_URL = `url("data:image/svg+xml,${encodeURIComponent(CIRCUIT_SVG)}")`;

interface LessonContentProps {
  /** MDX compiled on the server via next-mdx-remote/serialize in the lesson page. */
  mdxSource: MDXRemoteSerializeResult;
  lessonType?: string;
  /** Lesson order number — used to determine Piston routing (lesson 13). */
  lessonOrder?: number;
  /** Per-user inline-question state (theory path); empty/omitted otherwise. */
  interactiveState?: LessonInteractiveState | null;
  /** Contextual Wow Notes (theory path); empty/omitted otherwise. */
  wowNotes?: LessonWowNotes | null;
  /** Desktop gutter switch (threaded from page.tsx; single source of truth). */
  hasWowNotes?: boolean;
  /** Lifts the Variant-A inline gating signal up to LessonPageClient. */
  onGatingChange?: (allAnswered: boolean) => void;
}

export function LessonContent({
  mdxSource,
  lessonType = "theory",
  lessonOrder,
  interactiveState,
  wowNotes,
  hasWowNotes = false,
  onGatingChange,
}: LessonContentProps) {
  const isExercise = lessonType === "exercise" || lessonType === "project";
  // Lesson 13 uses PyTorch/sklearn — must route through Piston server proxy.
  const executionMode: "pyodide" | "piston" =
    lessonOrder === 13 ? "piston" : "pyodide";

  const components = useMemo(
    () => getMdxComponents({ isExercise, executionMode }),
    [isExercise, executionMode]
  );

  // Stable empty state for lessons without inline questions (never blocks).
  const state = useMemo(
    () => interactiveState ?? emptyInteractiveState(),
    [interactiveState]
  );

  return (
    <div id="lesson-content" className="relative isolate">
      {/* Ambient margin decoration (wide screens only) — a circuit-trace motif (hardware
          theme) fills the side margins so empty stretches read as designed, not blank.
          The ?v= query busts stale browser cache of the SVG asset. Purely decorative. */}
      <div
        aria-hidden
        style={{
          backgroundImage: CIRCUIT_URL,
          backgroundRepeat: "repeat-y",
          backgroundPosition: "top center",
          maskImage:
            "linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)",
        }}
        className="pointer-events-none absolute inset-y-0 left-[-330px] -z-10 hidden w-[160px] opacity-90 min-[1360px]:block"
      />
      <div
        aria-hidden
        style={{
          backgroundImage: CIRCUIT_URL,
          backgroundRepeat: "repeat-y",
          backgroundPosition: "top center",
          transform: "scaleX(-1)",
          maskImage:
            "linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)",
        }}
        className="pointer-events-none absolute inset-y-0 right-[-330px] -z-10 hidden w-[160px] opacity-90 min-[1360px]:block"
      />
      <div
        className={`animate-in fade-in duration-300 prose prose-slate dark:prose-invert max-w-none
          prose-headings:font-bold prose-headings:tracking-tight
          prose-h2:text-[1.7rem] prose-h2:mt-12 prose-h2:mb-4
          [&_h2]:relative [&_h2]:pb-3
          [&_h2]:after:content-[''] [&_h2]:after:absolute [&_h2]:after:bottom-0 [&_h2]:after:left-0
          [&_h2]:after:h-[3px] [&_h2]:after:w-12 [&_h2]:after:rounded-full
          [&_h2]:after:bg-gradient-to-r [&_h2]:after:from-[#6C5CE7] [&_h2]:after:to-[#00CEC9]
          prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3 prose-h3:border-l-2
          prose-h3:border-l-[#6C5CE7] prose-h3:pl-3 prose-h3:text-foreground/80
          prose-p:text-[17px] prose-p:leading-[1.8] prose-p:my-5 prose-p:text-foreground/90
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-strong:text-[#E2DDFF] prose-strong:font-semibold
          prose-code:before:content-none prose-code:after:content-none
          prose-code:bg-[#6C5CE7]/[0.15] prose-code:text-[#A78BFA] prose-code:px-1.5
          prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
          prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-border
          prose-pre:rounded-xl prose-pre:p-0 prose-pre:overflow-hidden
          prose-hr:border-0 prose-hr:h-px prose-hr:my-8 prose-hr:bg-gradient-to-r
          prose-hr:from-transparent prose-hr:via-[#6C5CE7]/30 prose-hr:to-transparent
          [&_blockquote_p]:before:content-none [&_blockquote_p]:after:content-none
          [&_thead]:bg-[#6C5CE7]/25
          [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:font-bold [&_th]:text-[#E2DDFF]
          [&_th]:border [&_th]:border-[#6C5CE7]/[0.15]
          [&_td]:px-4 [&_td]:py-2.5 [&_td]:border [&_td]:border-[#6C5CE7]/[0.15]
          [&_tbody_tr:nth-child(odd)]:bg-white/[0.02]
          [&_tbody_tr:nth-child(even)]:bg-[#6C5CE7]/[0.05]
          prose-li:text-[17px] prose-li:leading-[1.8] prose-li:text-foreground/90 prose-li:marker:text-primary`}
      >
        <InteractiveLessonProvider
          interactiveState={state}
          onGatingChange={onGatingChange}
        >
          <WowNotesProvider notes={wowNotes?.notes ?? null}>
            <MDXRemote {...mdxSource} components={components} />
          </WowNotesProvider>
        </InteractiveLessonProvider>
      </div>
    </div>
  );
}
