"use client";

import dynamic from "next/dynamic";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { AlertTriangle } from "lucide-react";
import { FlashcardDeck } from "@/components/course/flashcard-deck";

// Dynamic import with ssr:false — Monaco requires browser globals
const CodeEditor = dynamic(
  () => import("@/components/course/code-editor").then((m) => m.CodeEditor),
  {
    ssr: false,
    loading: () => (
      <div className="my-6 rounded-xl border border-border bg-[#1e1e1e] h-[420px] flex items-center justify-center">
        <span className="text-sm text-muted-foreground font-mono animate-pulse">
          Se încarcă editorul...
        </span>
      </div>
    ),
  }
);

// Dynamic import with ssr:false — visualiser uses framer-motion + browser state
const NeuralNetworkVisualiser = dynamic(
  () =>
    import("@/components/visualiser/neural-network-visualiser").then(
      (m) => m.NeuralNetworkVisualiser
    ),
  {
    ssr: false,
    loading: () => (
      <div className="my-8 rounded-2xl border border-border bg-card h-64 flex items-center justify-center">
        <span className="text-sm text-muted-foreground animate-pulse">
          Se încarcă vizualizatorul...
        </span>
      </div>
    ),
  }
);

interface LessonContentProps {
  content: string;
  contentSimpleMd?: string | null;
  learningMode?: "simple" | "technical";
  lessonType?: string;
  /** Lesson order number — used to determine Piston routing (lesson 13). */
  lessonOrder?: number;
}

export function LessonContent({
  content,
  contentSimpleMd,
  learningMode = "technical",
  lessonType = "theory",
  lessonOrder,
}: LessonContentProps) {
  const isSimple = learningMode === "simple";
  const isExercise = lessonType === "exercise" || lessonType === "project";
  // Lesson 13 uses PyTorch/sklearn — must route through Piston server proxy
  const executionMode: "pyodide" | "piston" = lessonOrder === 13 ? "piston" : "pyodide";
  const activeContent =
    isSimple && contentSimpleMd ? contentSimpleMd : content;
  const showFallbackBanner = isSimple && !contentSimpleMd;

  return (
    <div id="lesson-content">
      {showFallbackBanner && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-900/40 dark:bg-yellow-950/20 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            Versiunea simplificată a acestei lecții este în curs de pregătire.
            Afișăm varianta completă momentan.
          </p>
        </div>
      )}
      <div
        className="animate-in fade-in duration-300 prose prose-slate dark:prose-invert max-w-none
          prose-headings:font-bold prose-headings:tracking-tight
          prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
          prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
          prose-p:leading-relaxed prose-p:text-foreground/90
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-strong:text-foreground prose-strong:font-semibold
          prose-blockquote:border-l-primary prose-blockquote:bg-muted/50
          prose-blockquote:py-1 prose-blockquote:rounded-r-md
          prose-code:before:content-none prose-code:after:content-none
          prose-code:bg-muted prose-code:text-foreground prose-code:px-1.5
          prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
          prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-border
          prose-pre:rounded-xl prose-pre:p-0 prose-pre:overflow-hidden
          prose-table:border-collapse
          prose-th:bg-muted prose-th:text-foreground
          prose-td:border-border prose-th:border-border
          prose-li:text-foreground/90 prose-li:marker:text-primary"
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            // Intercept <pre> — bypass wrapper for custom block types
            pre: ({ children, ...props }) => {
              const hasCustomBlock = React.Children.toArray(children).some(
                (child) => {
                  if (!React.isValidElement(child)) return false;
                  const cls = (child.props as { className?: string }).className ?? "";
                  return (
                    cls.includes("language-python-editor") ||
                    cls.includes("language-neural-network-viz")
                  );
                }
              );
              if (hasCustomBlock) return <>{children}</>;
              return (
                <pre
                  {...props}
                  className="overflow-x-auto text-sm leading-relaxed p-5"
                >
                  {children}
                </pre>
              );
            },

            // Intercept <code> — render CodeEditor, flashcards, viz, or simple-mode placeholder
            code: ({ className, children, ...props }) => {
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
                    <div className="my-8 p-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 text-sm text-red-600 dark:text-red-400">
                      ⚠️ Eroare la parsarea configurației vizualizatorului. Verifică JSON-ul din blocul neural-network-viz.
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
                if (!isSimple) {
                  return (
                    <CodeEditor
                      defaultValue={String(children).trimEnd()}
                      language="python"
                      mode={isExercise ? "exercise" : "display"}
                      executionMode={executionMode}
                    />
                  );
                }
                // Simple Mode: show placeholder instead of interactive editor
                return (
                  <div className="my-6 rounded-xl border border-border bg-muted/30 p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      ⚙️ Exercițiul de cod este disponibil în{" "}
                      <strong>Modul Tehnic</strong>. Activează-l din butonul de
                      sus-dreapta.
                    </p>
                  </div>
                );
              }
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },

            // Table wrapper for horizontal scroll
            table: ({ children, ...props }) => (
              <div className="overflow-x-auto my-6">
                <table {...props} className="min-w-full">
                  {children}
                </table>
              </div>
            ),

            // Blockquote custom styling
            blockquote: ({ children, ...props }) => (
              <blockquote
                {...props}
                className="border-l-4 border-primary pl-4 pr-4 py-2 my-4 bg-muted/50 rounded-r-md italic text-muted-foreground"
              >
                {children}
              </blockquote>
            ),
          }}
        >
          {activeContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}
