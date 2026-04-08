"use client";

interface OutputPanelProps {
  stdout: string;
  stderr: string;
  plots: string[];
  isRunning: boolean;
  isLoading: boolean; // Pyodide CDN loading
}

export function OutputPanel({
  stdout,
  stderr,
  plots,
  isRunning,
  isLoading,
}: OutputPanelProps) {
  const hasOutput = stdout || stderr || plots.length > 0;
  const showPanel = isRunning || isLoading || hasOutput;

  if (!showPanel) return null;

  return (
    <div className="mt-2 rounded-b-xl border border-t-0 border-border bg-[#0d1117] overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-xs font-mono text-[#8b949e]">output</span>
        {isRunning && (
          <span className="ml-auto flex items-center gap-1.5 text-xs text-[#8b949e]">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            rulează...
          </span>
        )}
      </div>

      {/* Loading state (Pyodide CDN init) */}
      {isLoading && !isRunning && (
        <div className="px-4 py-6 flex items-center gap-3">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2 w-2 rounded-full bg-blue-500 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <span className="text-sm text-[#8b949e] font-mono">
            Se pregătește mediul Python...
          </span>
        </div>
      )}

      {/* Stdout */}
      {stdout && (
        <pre className="px-4 py-3 text-sm font-mono text-[#e6edf3] whitespace-pre-wrap leading-relaxed overflow-x-auto">
          {stdout}
        </pre>
      )}

      {/* Stderr */}
      {stderr && (
        <pre className="px-4 py-3 text-sm font-mono text-[#f85149] whitespace-pre-wrap leading-relaxed overflow-x-auto border-t border-[#30363d]">
          {stderr}
        </pre>
      )}

      {/* Matplotlib plots */}
      {plots.map((b64, i) => (
        <div key={i} className="px-4 py-3 border-t border-[#30363d]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:image/png;base64,${b64}`}
            alt={`Grafic ${i + 1}`}
            className="max-w-full rounded-lg"
            style={{ background: "#fff" }}
          />
        </div>
      ))}

      {/* Empty running state */}
      {isRunning && !stdout && !stderr && !isLoading && (
        <div className="px-4 py-4 text-sm font-mono text-[#8b949e] italic">
          Așteptăm output...
        </div>
      )}
    </div>
  );
}
