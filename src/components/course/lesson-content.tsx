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
    <div id="lesson-content">
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
