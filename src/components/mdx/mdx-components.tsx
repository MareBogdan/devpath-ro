"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { MDXRemoteProps } from "next-mdx-remote";
import { FlashcardDeck } from "@/components/course/flashcard-deck";
import { FactBox } from "@/components/mdx/fact-box";
import { LabBox } from "@/components/mdx/lab-box";
import { CosmoHint } from "@/components/mdx/cosmo-hint";
import { ADCSimulator } from "@/components/mdx/stubs/ADCSimulator";
import { BinaryTranslator } from "@/components/mdx/games/BinaryTranslator";
import { TransistorLab } from "@/components/mdx/games/TransistorLab";
import { RAMGridGame } from "@/components/mdx/games/RAMGridGame";
import { BossFightAlarmaSef } from "@/components/mdx/games/boss-alarms/BossFightAlarmaSef";
import { BossFightAsambleazaCPU } from "@/components/mdx/games/boss-cpu/BossFightAsambleazaCPU";
import { InlineQuestion } from "@/components/interactive/inline-question";

// Monaco needs browser globals — never SSR it.
const CodeEditor = dynamic(
  () => import("@/components/course/code-editor").then((m) => m.CodeEditor),
  {
    ssr: false,
    loading: () => (
      <div className="my-6 flex h-[420px] items-center justify-center rounded-xl border border-border bg-[#1e1e1e]">
        <span className="animate-pulse font-mono text-sm text-muted-foreground">
          Se încarcă editorul...
        </span>
      </div>
    ),
  }
);

// Visualiser uses framer-motion + browser state.
const NeuralNetworkVisualiser = dynamic(
  () =>
    import("@/components/visualiser/neural-network-visualiser").then(
      (m) => m.NeuralNetworkVisualiser
    ),
  {
    ssr: false,
    loading: () => (
      <div className="my-8 flex h-64 items-center justify-center rounded-2xl border border-border bg-card">
        <span className="animate-pulse text-sm text-muted-foreground">
          Se încarcă vizualizatorul...
        </span>
      </div>
    ),
  }
);

export interface MdxComponentOptions {
  /** Whether the lesson is exercise-like — drives the embedded CodeEditor mode. */
  isExercise: boolean;
  /** Python execution backend for embedded editors. */
  executionMode: "pyodide" | "piston";
}

type MdxComponents = NonNullable<MDXRemoteProps["components"]>;

/**
 * Builds the component map handed to <MDXRemote />. It is a factory rather than
 * a bare object because the code-block interceptors close over per-lesson
 * options (isExercise / executionMode). Custom JSX tags — FactBox, CosmoHint,
 * LabBox — and the fenced-code-block interceptors all live here.
 */
export function getMdxComponents({
  isExercise,
  executionMode,
}: MdxComponentOptions): MdxComponents {
  return {
    // ── Custom MDX tags ──────────────────────────────────────────────
    FactBox,
    CosmoHint,
    LabBox,
    InlineQuestion,

    // ── Stub components (placeholders — real component not built yet) ──
    ADCSimulator,

    // ── Mini-games ──────────────────────────────────────────────────
    BinaryTranslator,
    TransistorLab,
    RAMGridGame,
    BossFightAlarmaSef,
    BossFightAsambleazaCPU,

    // ── <pre> — bypass the wrapper for custom block types ────────────
    pre: ({ children, ...props }: React.ComponentPropsWithoutRef<"pre">) => {
      const hasCustomBlock = React.Children.toArray(children).some((child) => {
        if (!React.isValidElement(child)) return false;
        const cls = (child.props as { className?: string }).className ?? "";
        return (
          cls.includes("language-python-editor") ||
          cls.includes("language-neural-network-viz")
        );
      });
      if (hasCustomBlock) return <>{children}</>;
      return (
        <pre {...props} className="overflow-x-auto p-5 text-sm leading-relaxed">
          {children}
        </pre>
      );
    },

    // ── <code> — CodeEditor / flashcards / visualiser / default ──────
    code: ({
      className,
      children,
      ...props
    }: React.ComponentPropsWithoutRef<"code">) => {
      if (className?.includes("language-neural-network-viz")) {
        try {
          const config = JSON.parse(String(children)) as {
            layers?: number[];
            inputLabels?: string[];
            outputLabel?: string;
          };
          return (
            <NeuralNetworkVisualiser
              layers={config.layers}
              inputLabels={config.inputLabels}
              outputLabel={config.outputLabel}
            />
          );
        } catch {
          return (
            <div className="my-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400">
              ⚠️ Eroare la parsarea configurației vizualizatorului. Verifică
              JSON-ul din blocul neural-network-viz.
            </div>
          );
        }
      }
      if (className?.includes("language-flashcards")) {
        try {
          const cards = JSON.parse(String(children)) as {
            front: string;
            back: string;
          }[];
          return <FlashcardDeck cards={cards} />;
        } catch {
          return null;
        }
      }
      if (className?.includes("language-python-editor")) {
        return (
          <CodeEditor
            defaultValue={String(children).trimEnd()}
            language="python"
            mode={isExercise ? "exercise" : "display"}
            executionMode={executionMode}
          />
        );
      }
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },

    // ── <table> — horizontal-scroll wrapper ──────────────────────────
    table: ({
      children,
      ...props
    }: React.ComponentPropsWithoutRef<"table">) => (
      <div className="my-6 overflow-x-auto rounded-xl border border-[#6C5CE7]/[0.15]">
        <table {...props} className="min-w-full border-collapse text-[15px]">
          {children}
        </table>
      </div>
    ),

    // ── <blockquote> — redesigned with a decorative quote mark ───────
    blockquote: ({
      children,
      ...props
    }: React.ComponentPropsWithoutRef<"blockquote">) => (
      <blockquote
        {...props}
        className="relative my-6 rounded-lg border-l-[3px] border-l-[#6C5CE7] bg-[#6C5CE7]/[0.06] px-6 py-4 italic text-[#C4B5FD]"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute left-2.5 top-1 select-none font-serif text-5xl leading-none text-[#6C5CE7]/30"
        >
          &ldquo;
        </span>
        {children}
      </blockquote>
    ),
  };
}
