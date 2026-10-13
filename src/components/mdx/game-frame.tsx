"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { Maximize2, Minimize2, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFullscreen, usePortraitPhone } from "./use-fullscreen";
import { useGameCompletionHandler, type GameCompletionProps } from "./game-contract";

/**
 * GameFrame — the ONE wrapper every interactive lab/boss/game block is mounted in.
 *
 *  1. Full-bleed: the prose column stays 680px for reading, but the game breaks out
 *     of it, up to 1200px (and to the viewport minus a small gutter on phones).
 *  2. Fullscreen: shared toolbar (+ a hint banner on phones) and a fullscreen mode
 *     with a CSS-overlay fallback for browsers without element fullscreen (iPhone).
 *
 * `chrome="game"` is for a game that draws its own fullscreen button/hint in its
 * header (BinaryTranslator) — it reads the same state through `useGameFrame()`.
 */

interface GameFrameContextValue {
  isFullscreen: boolean;
  toggle: () => void;
  hintVisible: boolean;
  dismissHint: () => void;
}

const GameFrameContext = createContext<GameFrameContextValue | null>(null);

/** Fullscreen state of the surrounding frame, or null when rendered outside one. */
export function useGameFrame(): GameFrameContextValue | null {
  return useContext(GameFrameContext);
}

// ─── Shared fullscreen UI pieces ───────────────────────────────────────────────

export function FullscreenToggle({
  isFullscreen,
  onToggle,
  className,
  label,
}: {
  isFullscreen: boolean;
  onToggle: () => void;
  className?: string;
  label?: string;
}) {
  const Icon = isFullscreen ? Minimize2 : Maximize2;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isFullscreen ? "Ieși din fullscreen" : "Intră în fullscreen"}
      className={cn("text-[#9aa0b0] transition-colors hover:text-white", className)}
    >
      <Icon className="h-4 w-4" aria-hidden />
      {label ? <span className="ml-1.5 text-xs">{label}</span> : null}
    </button>
  );
}

export function FullscreenHint({
  onActivate,
  onDismiss,
  className,
  tone = "dark",
  children = "⛶ Pentru cea mai bună experiență, joacă în fullscreen",
}: {
  onActivate: () => void;
  onDismiss: () => void;
  className?: string;
  /** "dark": sits on an always-dark game surface. "page": sits on the themed page. */
  tone?: "dark" | "page";
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mb-3 flex items-center justify-between gap-3 rounded-lg border border-[#6C5CE7]/30 bg-[#6C5CE7]/10 px-4 py-2",
        className
      )}
    >
      <span
        className={cn(
          "font-mono text-xs",
          tone === "page" ? "text-foreground/80" : "text-[#b0b4c0]"
        )}
      >
        {children}
      </span>
      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={onActivate}
          className="rounded bg-[#6C5CE7] px-3 py-1 font-mono text-xs text-white transition-colors hover:bg-[#7d6ff0]"
        >
          Activează fullscreen
        </button>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Închide sugestia"
          className={cn(
            "font-mono text-xs transition-colors",
            tone === "page"
              ? "text-muted-foreground hover:text-foreground"
              : "text-[#9aa0b0] hover:text-[#b0b4c0]"
          )}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ─── The frame ─────────────────────────────────────────────────────────────────

export function GameFrame({
  children,
  chrome = "frame",
}: {
  children: ReactNode;
  chrome?: "frame" | "game";
}) {
  const fs = useFullscreen<HTMLDivElement>();
  const portraitPhone = usePortraitPhone();
  const [hintVisible, setHintVisible] = useState(true);
  const dismissHint = useCallback(() => setHintVisible(false), []);

  const { toggle: fsToggle } = fs;
  const toggle = useCallback(() => {
    setHintVisible(false);
    fsToggle();
  }, [fsToggle]);

  const value = useMemo<GameFrameContextValue>(
    () => ({ isFullscreen: fs.isFullscreen, toggle, hintVisible, dismissHint }),
    [fs.isFullscreen, toggle, hintVisible, dismissHint]
  );

  return (
    <GameFrameContext.Provider value={value}>
      <div
        ref={fs.ref}
        data-game-frame
        data-fullscreen={fs.isFullscreen ? "true" : undefined}
        className={cn(
          // Games draw their own text colours: opt out of the lesson's `.prose` typography
          // (prose-p/li/strong/… colours would otherwise override them, and in light theme
          // turn white-on-dark game text into dark-on-dark).
          "not-prose",
          fs.isFullscreen
            ? cn(
                "h-[100dvh] w-screen overflow-y-auto overflow-x-hidden bg-[#06060c] pt-0",
                // A game that draws its own fullscreen chrome (chrome="game") fills the
                // screen itself (w-screen) — padding here would push it sideways.
                chrome === "game" ? "px-0 pb-0" : "px-2 pb-6 sm:px-4",
                fs.isOverlay && "fixed inset-0 z-[9999] m-0 border-0"
              )
            : // Break out of the 680px prose column: centred on it, up to 1200px wide —
              // but at >=1360px the lesson shows circuit rails in the side margins
              // (lesson-content.tsx: 160px wide, 170px clear of the column), so there the
              // game stops 10px short of them (680 + 2*160 = 1000px).
              "relative left-1/2 w-[min(calc(100vw-1rem),1200px)] -translate-x-1/2 min-[1360px]:w-[1000px]"
        )}
      >
        {chrome === "frame" &&
          (fs.isFullscreen ? (
            <div className="sticky top-0 z-30 -mx-2 mb-2 flex items-center justify-between gap-3 bg-[#06060c]/95 px-3 py-2 backdrop-blur sm:-mx-4 sm:px-5">
              {portraitPhone ? (
                <span className="flex items-center gap-1.5 font-mono text-xs text-[#FDCB6E]">
                  <RotateCw className="h-3.5 w-3.5" aria-hidden />
                  Rotește telefonul (landscape) pentru a vedea jocul întreg
                </span>
              ) : (
                <span />
              )}
              <FullscreenToggle
                isFullscreen
                onToggle={toggle}
                label="Ieși"
                className="inline-flex items-center rounded border border-white/15 px-2.5 py-1 text-white/80"
              />
            </div>
          ) : (
            <>
              {hintVisible && (
                <FullscreenHint
                  tone="page"
                  onActivate={toggle}
                  onDismiss={dismissHint}
                  className="md:hidden"
                >
                  ⛶ Pe telefon, joacă în fullscreen (cu telefonul pe orizontală)
                </FullscreenHint>
              )}
              <div className="mb-2 flex justify-end">
                <FullscreenToggle
                  isFullscreen={false}
                  onToggle={toggle}
                  label="Fullscreen"
                  className="inline-flex items-center rounded border border-border px-2.5 py-1 font-mono text-muted-foreground hover:text-foreground"
                />
              </div>
            </>
          ))}
        {children}
      </div>
    </GameFrameContext.Provider>
  );
}

/**
 * Wrap a game component so every mount site gets the same frame, and so the game's
 * `onComplete` (see game-contract.ts) is wired to the surrounding lesson.
 */
export function withGameFrame(
  Game: ComponentType<GameCompletionProps>,
  chrome: "frame" | "game" = "frame"
): ComponentType {
  const Framed = () => {
    const onComplete = useGameCompletionHandler();
    return (
      <GameFrame chrome={chrome}>
        <Game onComplete={onComplete ?? undefined} />
      </GameFrame>
    );
  };
  Framed.displayName = `GameFrame(${Game.displayName ?? Game.name ?? "Game"})`;
  return Framed;
}
