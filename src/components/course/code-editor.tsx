"use client";

import { useState, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Copy, Check, Terminal, Play, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { OutputPanel } from "./output-panel";
import { usePyodide } from "@/hooks/use-pyodide";
import type { RunResult } from "@/hooks/use-pyodide";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CodeEditorProps {
  defaultValue?: string;
  language?: string;
  height?: string;
  /** "display" = read-only Monaco with copy button (default).
   *  "exercise" = editable Monaco + Run button + OutputPanel. */
  mode?: "display" | "exercise";
  /** Only applies when mode="exercise".
   *  "pyodide" = run in-browser via Pyodide (default).
   *  "piston"  = proxy to Piston API (for PyTorch/sklearn). */
  executionMode?: "pyodide" | "piston";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CodeEditor({
  defaultValue = "",
  language = "python",
  height = "420px",
  mode = "display",
  executionMode = "pyodide",
}: CodeEditorProps) {
  const [value, setValue] = useState(defaultValue);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const editorRef = useRef<unknown>(null);
  const abortRef = useRef<AbortController | null>(null);
  const confettiFiredRef = useRef(false);

  const { runCode, isLoading, isReady } = usePyodide();

  function handleEditorDidMount(editor: unknown) {
    editorRef.current = editor;
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const fireConfetti = useCallback(async () => {
    if (confettiFiredRef.current) return;
    confettiFiredRef.current = true;
    const confetti = (await import("canvas-confetti")).default;
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
  }, []);

  async function handleRun() {
    if (isRunning) {
      abortRef.current?.abort();
      setIsRunning(false);
      return;
    }

    setIsRunning(true);
    setResult(null);

    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    try {
      let output: RunResult;

      if (executionMode === "piston") {
        // Route through server-side Piston proxy
        const res = await fetch("/api/execute-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: value }),
          signal,
        });
        if (!res.ok) {
          const err = (await res.json()) as { error?: string };
          output = {
            stdout: "",
            stderr: err.error ?? "Eroare la execuție.",
            plots: [],
          };
        } else {
          const data = (await res.json()) as {
            stdout: string;
            stderr: string;
          };
          output = { ...data, plots: [] };
        }
      } else {
        // Run in-browser via Pyodide
        output = await runCode(value, signal);
      }

      setResult(output);

      // Fire confetti on first successful run (no stderr)
      if (!output.stderr && (output.stdout || output.plots.length > 0)) {
        await fireConfetti();
      }
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        setResult({
          stdout: "",
          stderr: `Eroare: ${(err as Error).message}`,
          plots: [],
        });
      }
    } finally {
      setIsRunning(false);
    }
  }

  const isExercise = mode === "exercise";
  const showRunButton = isExercise && language === "python";

  return (
    <div className="my-6">
      <div
        className={cn(
          "rounded-xl overflow-hidden border border-border shadow-md",
          isExercise && result && "rounded-b-none border-b-0"
        )}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#1e1e1e] border-b border-[#3c3c3c]">
          <div className="flex items-center gap-2 text-[#858585]">
            <Terminal className="h-3.5 w-3.5" />
            <span className="text-xs font-mono font-medium">{language}</span>
            {isExercise && (
              <span className="ml-1 rounded bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-orange-400 uppercase tracking-wide">
                exercițiu
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Copy button */}
            <button
              onClick={handleCopy}
              className={cn(
                "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-all",
                copied
                  ? "text-green-400 bg-green-400/10"
                  : "text-[#858585] hover:text-white hover:bg-white/10"
              )}
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" />
                  Copiat!
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copiază
                </>
              )}
            </button>

            {/* Run button */}
            {showRunButton && (
              <button
                onClick={handleRun}
                disabled={executionMode === "pyodide" && isLoading && !isRunning}
                className={cn(
                  "flex items-center gap-1.5 text-xs px-3 py-1 rounded-md font-semibold transition-all",
                  isRunning
                    ? "bg-red-600/80 hover:bg-red-600 text-white"
                    : executionMode === "pyodide" && isLoading
                    ? "bg-blue-800/50 text-blue-300 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-500 text-white"
                )}
                title={
                  isRunning
                    ? "Oprește execuția"
                    : executionMode === "pyodide" && isLoading
                    ? "Se încarcă Python..."
                    : "Rulează codul"
                }
              >
                {isRunning ? (
                  <>
                    <Square className="h-3 w-3 fill-current" />
                    Stop
                  </>
                ) : executionMode === "pyodide" && isLoading ? (
                  <>
                    <span className="h-3 w-3 rounded-full border-2 border-blue-300/40 border-t-blue-300 animate-spin" />
                    Python...
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 fill-current" />
                    Run
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Monaco Editor */}
        <Editor
          height={height}
          defaultLanguage={language}
          value={value}
          onChange={(v) => setValue(v ?? "")}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            readOnly: !isExercise,
            minimap: { enabled: false },
            fontSize: 14,
            lineHeight: 22,
            fontFamily:
              "'Geist Mono', 'Fira Code', 'Cascadia Code', monospace",
            fontLigatures: true,
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            renderLineHighlight: isExercise ? "line" : "gutter",
            cursorStyle: isExercise ? "line" : "underline",
            scrollbar: {
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
            },
          }}
        />
      </div>

      {/* Output panel — only in exercise mode */}
      {isExercise && (
        <OutputPanel
          stdout={result?.stdout ?? ""}
          stderr={result?.stderr ?? ""}
          plots={result?.plots ?? []}
          isRunning={isRunning}
          isLoading={isLoading && !isReady}
        />
      )}
    </div>
  );
}
