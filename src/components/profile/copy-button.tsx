"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  value: string;
  label?: string;
  showValue?: boolean;
}

export function CopyButton({ value, label = "Copiază", showValue = true }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select text
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
      {showValue && (
        <span className="flex-1 text-sm text-foreground font-mono truncate select-all">
          {value}
        </span>
      )}
      <button
        onClick={handleCopy}
        className="shrink-0 inline-flex items-center gap-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary px-2.5 py-1 text-xs font-medium transition-colors"
      >
        {copied ? (
          <>
            <Check className="h-3 w-3" />
            Copiat!
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" />
            {label}
          </>
        )}
      </button>
    </div>
  );
}
