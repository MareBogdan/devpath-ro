// Pyodide web worker — runs user Python off the main thread so a runaway loop
// (`while True: pass`) can be stopped by terminating the worker instead of
// freezing the tab. Loaded from the CDN at runtime, never bundled.
//
// Pinned to v0.27.0: its classic `pyodide.js` loads fine via importScripts().
// (Newer Pyodide releases require a module worker — revisit when bumping.)

export {};

const PYODIDE_INDEX_URL = "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/";

declare function importScripts(...urls: string[]): void;
declare function loadPyodide(options: { indexURL: string }): Promise<PyodideLike>;

interface PyodideLike {
  loadPackage(names: string[]): Promise<unknown>;
  runPythonAsync(code: string): Promise<unknown>;
  globals: {
    get(name: string): unknown;
    delete(name: string): void;
  };
}

interface WorkerScope {
  postMessage(message: unknown): void;
  onmessage: ((event: MessageEvent) => void) | null;
}
const ctx = self as unknown as WorkerScope;

// ─── Matplotlib preamble / postamble (unchanged from the main-thread hook) ───

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

// ─── Init: load Pyodide once and preload packages ────────────────────────────

const pyodideReady: Promise<PyodideLike> = (async () => {
  importScripts(`${PYODIDE_INDEX_URL}pyodide.js`);
  const py = await loadPyodide({ indexURL: PYODIDE_INDEX_URL });
  // Pre-load so the first run is faster (numpy is a matplotlib dependency).
  await py.loadPackage(["micropip", "numpy", "matplotlib"]);
  return py;
})();

pyodideReady.then(
  () => ctx.postMessage({ type: "ready" }),
  (err: unknown) =>
    ctx.postMessage({
      type: "init-error",
      message: err instanceof Error ? err.message : String(err),
    })
);

// ─── Run requests ────────────────────────────────────────────────────────────

ctx.onmessage = async (event: MessageEvent) => {
  const { type, id, code } = event.data as {
    type: string;
    id: number;
    code: string;
  };
  if (type !== "run") return;

  let pyodide: PyodideLike;
  try {
    pyodide = await pyodideReady;
  } catch {
    return; // init-error was already reported
  }

  try {
    await pyodide.runPythonAsync(`${PREAMBLE}\n${code}\n${POSTAMBLE}`);

    const stdout = (pyodide.globals.get("_stdout_val") as string | undefined) ?? "";
    const plotsProxy = pyodide.globals.get("_plots") as
      | { toJs(): string[] }
      | undefined;
    const plots: string[] = plotsProxy ? Array.from(plotsProxy.toJs()) : [];

    for (const name of [
      "_plots",
      "_stdout_buf",
      "_stdout_val",
      "_patched_show",
      "_plt_orig",
    ]) {
      pyodide.globals.delete(name);
    }

    ctx.postMessage({ type: "result", id, stdout, plots });
  } catch (err: unknown) {
    // Restore stdout even on error
    try {
      await pyodide.runPythonAsync("import sys; sys.stdout = sys.__stdout__");
    } catch {
      // ignore secondary error
    }
    ctx.postMessage({
      type: "error",
      id,
      message: err instanceof Error ? err.message : String(err),
    });
  }
};
