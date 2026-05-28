import type { ReactNode } from "react";
import { FlaskConical } from "lucide-react";

/**
 * LabBox — încadrează un exercițiu practic în MDX-ul lecției.
 * Card ușor ridicat, cu glow teal animat pe muchia din stânga.
 */
export function LabBox({ children }: { children?: ReactNode }) {
  return (
    <div className="relative my-7">
      {/* glow teal animat, aliniat cu muchia din stânga */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-3 left-0 w-[3px] rounded-full bg-gradient-to-b from-[#00CEC9] via-[#5fe3df] to-[#00CEC9] blur-[6px] animate-pulse motion-reduce:animate-none"
      />
      <div className="relative flex items-start gap-3.5 rounded-xl border border-border border-l-[3px] border-l-[#00CEC9] bg-[#00CEC9]/[0.08] p-5 shadow-[0_0_12px_2px_rgba(0,206,201,0.4)]">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00CEC9]/10">
          <FlaskConical
            className="h-[18px] w-[18px] text-[#00CEC9]"
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
