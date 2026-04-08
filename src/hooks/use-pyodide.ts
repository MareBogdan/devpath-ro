"use client";

import { useRef, useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RunResult {
  stdout: string;
  stderr: string;
  plots: string[]; // base64 PNG strings
}

// ─── Module-level singleton ───────────────────────────────────────────────────
// Stored at module level so it persists across hook instances.

let pyodideInstance: unknown = null;
let loadingPromise: Promise<unknown> | null = null;

// ─── Matplotlib preamble ──────────────────────────────────────────────────────

const PREAMBLE = `
import sys, io, base64, builtins
_plots = []
_stdout_buf = io.StringIO()
sys.stdout = _stdout_buf
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as _plt_orig
def _patched_show(*a, **kw):
    buf = io.BytesIO()
    _plt_orig.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    _plots.append(base64.b64encode(buf.read()).decode('utf-8'))
    _plt_orig.clf()
_plt_orig.show = _patched_show
`.trim();

const POSTAMBLE = `
sys.stdout = sys.__stdout__
_stdout_val = _stdout_buf.getvalue()
`.trim();

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UsePyodideReturn {
  runCode: (code: string, signal?: AbortSignal) => Promise<RunResult>;
  isLoading: boolean; // true while Pyodide CDN bundle is being fetched
  isReady: boolean;   // true once Pyodide is initialised
}

export function usePyodide(): UsePyodideReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(!!pyodideInstance);
  const initRef = useRef(false);

  /** Ensure Pyodide is loaded — resolves to the pyodide instance. */
  const ensurePyodide = useCallback(async (): Promise<unknown> => {
    if (pyodideInstance) return pyodideInstance;

    // Another call may already be loading; share the same promise.
    if (loadingPromise) return loadingPromise;

    setIsLoading(true);
    loadingPromise = (async () => {
      // Load pyodide.js from CDN at runtime — never bundled.
      await new Promise<void>((resolve, reject) => {
        if (document.querySelector('script[data-pyodide]')) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src =
          "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/pyodide.js";
        script.dataset.pyodide = "1";
        script.onload = () => resolve();
        script.onerror = () =>
          reject(new Error("Nu s-a putut încărca Pyodide de pe CDN."));
        document.head.appendChild(script);
      });

      // @ts-expect-error — loadPyodide is injected by the CDN script
      const py = await globalThis.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/",
      });

      // Pre-load micropip and matplotlib so first run is faster
      await py.loadPackage(["micropip", "matplotlib"]);

      pyodideInstance = py;
      return py;
    })();

    try {
      const py = await loadingPromise;
      setIsLoading(false);
      setIsReady(true);
      initRef.current = true;
      return py;
    } catch (err) {
      loadingPromise = null;
      setIsLoading(false);
      throw err;
    }
  }, []);

  /** Run Python code and return { stdout, stderr, plots }. */
  const runCode = useCallback(
    async (code: string, signal?: AbortSignal): Promise<RunResult> => {
      const py = await ensurePyodide();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pyodide = py as any;

      if (signal?.aborted) {
        return { stdout: "", stderr: "Execuție oprită.", plots: [] };
      }

      const fullCode = `${PREAMBLE}\n${code}\n${POSTAMBLE}`;

      try {
        await pyodide.runPythonAsync(fullCode);

        const stdout: string =
          pyodide.globals.get("_stdout_val") ?? "";

        const plotsProxy = pyodide.globals.get("_plots");
        const plots: string[] = plotsProxy
          ? Array.from(plotsProxy.toJs() as string[])
          : [];

        // Clean up globals
        pyodide.globals.delete("_plots");
        pyodide.globals.delete("_stdout_buf");
        pyodide.globals.delete("_stdout_val");
        pyodide.globals.delete("_patched_show");
        pyodide.globals.delete("_plt_orig");

        return { stdout, stderr: "", plots };
      } catch (err: unknown) {
        // Restore stdout even on error
        try {
          await pyodide.runPythonAsync(
            "import sys; sys.stdout = sys.__stdout__"
          );
        } catch {
          // ignore secondary error
        }
        const msg =
          err instanceof Error ? err.message : String(err);
        return { stdout: "", stderr: msg, plots: [] };
      }
    },
    [ensurePyodide]
  );

  return { runCode, isLoading, isReady: isReady || !!pyodideInstance };
}
