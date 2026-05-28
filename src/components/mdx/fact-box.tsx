import type { ReactNode } from "react";
import { Zap } from "lucide-react";

/**
 * FactBox — evidențiază un fapt sau un număr de impact în MDX-ul lecției.
 * Card ușor ridicat, cu glow violet animat pe muchia din stânga.
 */
export function FactBox({ children }: { children?: ReactNode }) {
  return (
    <div className="relative my-7">
      {/* glow violet animat, aliniat cu muchia din stânga */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-3 left-0 w-[3px] rounded-full bg-gradient-to-b from-[#6C5CE7] via-[#a89bf5] to-[#6C5CE7] blur-[6px] animate-pulse motion-reduce:animate-none"
      />
      <div className="relative flex items-start gap-3.5 rounded-xl border border-border border-l-[3px] border-l-[#6C5CE7] bg-[#6C5CE7]/[0.08] p-5 shadow-[0_0_12px_2px_rgba(108,92,231,0.4)]">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FDCB6E]/10">
          <Zap
            className="h-[18px] w-[18px] text-[#FDCB6E]"
            fill="currentColor"
            aria-hidden
          />
        </span>
        <div className="min-w-0 space-y-2 text-foreground/90 [&>:first-child]:mt-0 [&>:last-child]:mb-0">
          {children}
        </div>
      </div>
    </div>
  );
}
