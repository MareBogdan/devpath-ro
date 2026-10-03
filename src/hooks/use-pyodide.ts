"use client";

import { useCallback, useSyncExternalStore } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RunResult {
  stdout: string;
  stderr: string;
  plots: string[]; // base64 PNG strings
}

// ─── Config ───────────────────────────────────────────────────────────────────

/** Max time a single run may take before the worker is killed. */
export const PYTHON_RUN_TIMEOUT_MS = 10_000;

const TIMEOUT_MESSAGE =
  "Codul a rulat prea mult (posibil buclă infinită) — oprit după 10 secunde.";
const STOPPED_MESSAGE = "Execuție oprită.";
const LOAD_ERROR_MESSAGE = "Nu s-a putut încărca Pyodide de pe CDN.";

// ─── Module-level singleton ───────────────────────────────────────────────────
// One worker shared by every editor on the page; created lazily on the first
// run and replaced with a fresh one whenever it has to be killed.

let worker: Worker | null = null;
let readyPromise: Promise<Worker> | null = null;
let runCounter = 0;
// Runs are serialised: one shared Python interpreter means one run at a time,
// and a timeout kill must never take another editor's in-flight run with it.
let queue: Promise<unknown> = Promise.resolve();

interface PyodideState {
  isLoading: boolean; // true while the worker is fetching/initialising Pyodide
  isReady: boolean; // true once the worker has Pyodide loaded
}
const SERVER_STATE: PyodideState = { isLoading: false, isReady: false };
let state: PyodideState = SERVER_STATE;
const listeners = new Set<() => void>();

function setState(patch: Partial<PyodideState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Create the worker (if needed) and resolve once Pyodide is loaded in it. */
function ensureWorker(): Promise<Worker> {
  if (readyPromise) return readyPromise;

  const w = new Worker(new URL("../workers/pyodide.worker.ts", import.meta.url));
  worker = w;
  setState({ isLoading: true, isReady: false });

  const promise = new Promise<Worker>((resolve, reject) => {
    const cleanup = () => {
      w.removeEventListener("message", onMessage);
      w.removeEventListener("error", onError);
    };
    const fail = () => {
      cleanup();
      w.terminate();
      if (worker === w) {
        worker = null;
        readyPromise = null;
        setState({ isLoading: false, isReady: false });
      }
      reject(new Error(LOAD_ERROR_MESSAGE));
    };
    const onMessage = (e: MessageEvent) => {
      const type = (e.data as { type?: string } | undefined)?.type;
      if (type === "ready") {
        cleanup();
        if (worker === w) setState({ isLoading: false, isReady: true });
        resolve(w);
      } else if (type === "init-error") {
        fail();
      }
    };
    const onError = () => fail();
    w.addEventListener("message", onMessage);
    w.addEventListener("error", onError);
  });

  readyPromise = promise;
  return promise;
}

/** Kill a stuck/aborted worker and warm up a fresh one for the next run. */
function resetWorker(dead: Worker) {
  dead.terminate();
  if (worker !== dead) return;
  worker = null;
  readyPromise = null;
  setState({ isLoading: false, isReady: false });
  ensureWorker().catch(() => {
    // The next runCode() will retry and surface the load error.
  });
}

async function execute(code: string, signal?: AbortSignal): Promise<RunResult> {
  const stopped: RunResult = { stdout: "", stderr: STOPPED_MESSAGE, plots: [] };
  if (signal?.aborted) return stopped;

  const w = await ensureWorker();
  if (signal?.aborted) return stopped;

  const id = ++runCounter;

  return new Promise<RunResult>((resolve) => {
    let settled = false;

    const finish = (result: RunResult, kill: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      w.removeEventListener("message", onMessage);
      w.removeEventListener("error", onError);
      signal?.removeEventListener("abort", onAbort);
      if (kill) resetWorker(w);
      resolve(result);
    };

    const onMessage = (e: MessageEvent) => {
      const data = e.data as
        | {
            type: string;
            id?: number;
            stdout?: string;
            plots?: string[];
            message?: string;
          }
        | undefined;
      if (!data || data.id !== id) return;
      if (data.type === "result") {
        finish(
          { stdout: data.stdout ?? "", stderr: "", plots: data.plots ?? [] },
          false
        );
      } else if (data.type === "error") {
        finish({ stdout: "", stderr: data.message ?? "", plots: [] }, false);
      }
    };
    const onError = () =>
      finish(
        { stdout: "", stderr: "Eroare internă în rularea Python.", plots: [] },
        true
      );
    const onAbort = () => finish(stopped, true);

    // The clock starts now, after Pyodide has finished loading.
    const timer = setTimeout(
      () => finish({ stdout: "", stderr: TIMEOUT_MESSAGE, plots: [] }, true),
      PYTHON_RUN_TIMEOUT_MS
    );

    w.addEventListener("message", onMessage);
    w.addEventListener("error", onError);
    signal?.addEventListener("abort", onAbort);
    w.postMessage({ type: "run", id, code });
  });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UsePyodideReturn {
  /** Aborting `signal` (Stop button) terminates the worker, like a timeout. */
  runCode: (code: string, signal?: AbortSignal) => Promise<RunResult>;
  isLoading: boolean; // true while Pyodide CDN bundle is being fetched
  isReady: boolean; // true once Pyodide is initialised
}

export function usePyodide(): UsePyodideReturn {
  const { isLoading, isReady } = useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER_STATE
  );

  /** Run Python code in the worker and return { stdout, stderr, plots }. */
  const runCode = useCallback(
    (code: string, signal?: AbortSignal): Promise<RunResult> => {
      const job = queue.then(() => execute(code, signal));
      queue = job.catch(() => undefined);
      return job;
    },
    []
  );

  return { runCode, isLoading, isReady };
}
