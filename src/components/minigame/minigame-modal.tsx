"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Gamepad2 } from "lucide-react";
import type { MinigameType } from "@/app/(dashboard)/courses/actions";
import { recordMinigameSession } from "@/app/(dashboard)/courses/actions";
import { CosmoMascot } from "@/components/mascot/cosmo-mascot";
import { MinigameResultScreen } from "./minigame-result-screen";
import { GameSortConcepts } from "./game-sort-concepts";
import { GameFillBlank } from "./game-fill-blank";
import { GameMatchPairs } from "./game-match-pairs";
import { GameTrueFalse } from "./game-true-false";
import { GameBuildNetwork } from "./game-build-network";
import { GameWritePrompt } from "./game-write-prompt";
import { XP_VALUES } from "@/lib/gamification-constants";

const GAME_LABELS: Record<MinigameType, string> = {
  sort_concepts: "Sortează Conceptele",
  fill_blank: "Completează Spațiile",
  match_pairs: "Potrivește Perechile",
  true_false: "Adevărat sau Fals",
  build_network: "Construiește Rețeaua",
  write_prompt: "Scrie un Prompt",
};

interface MinigameModalProps {
  gameType: MinigameType;
  lessonId: string;
  onClose: () => void;
}

type Phase = "intro" | "game" | "result";

export function MinigameModal({ gameType, lessonId, onClose }: MinigameModalProps) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [score, setScore] = useState(0);
  const [isPerfect, setIsPerfect] = useState(false);
  const [, startTransition] = useTransition();

  const xpEarned = isPerfect
    ? XP_VALUES["minigame_perfect"]
    : XP_VALUES["minigame_complete"];

  function handleGameComplete(finalScore: number, perfect: boolean) {
    setScore(finalScore);
    setIsPerfect(perfect);
    startTransition(async () => {
      await recordMinigameSession({
        lessonId,
        gameType,
        score: finalScore,
        isPerfect: perfect,
      });
    });
    setPhase("result");
  }

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <AnimatePresence>
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
          className="relative w-full max-w-lg bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/40">
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5 text-primary" />
              <span className="font-bold text-sm">
                Mini-joc — {GAME_LABELS[gameType]}
              </span>
            </div>
            {phase !== "game" && (
              <button
                onClick={onClose}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition"
                aria-label="Închide"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="p-5">
            <AnimatePresence mode="wait">
              {phase === "intro" && (
                <motion.div
                  key="intro"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center gap-5 py-4 text-center"
                >
                  <CosmoMascot emotion="excited" size={90} />
                  <div>
                    <h2 className="text-xl font-bold">Mini-joc deblocat!</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      Ai terminat 3 lecții consecutive. Timp de un mic test rapid!
                    </p>
                  </div>
                  <div className="rounded-xl border border-primary/30 bg-primary/5 px-5 py-3 space-y-0.5">
                    <p className="font-semibold text-primary">{GAME_LABELS[gameType]}</p>
                    <p className="text-xs text-muted-foreground">
                      Completare → +{XP_VALUES["minigame_complete"]} XP &nbsp;·&nbsp;
                      Perfect → +{XP_VALUES["minigame_perfect"]} XP
                    </p>
                  </div>
                  <button
                    onClick={() => setPhase("game")}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition active:scale-[0.98]"
                  >
                    <Gamepad2 className="h-4 w-4" />
                    Să începem!
                  </button>
                </motion.div>
              )}

              {phase === "game" && (
                <motion.div
                  key="game"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <GameComponent gameType={gameType} onComplete={handleGameComplete} />
                </motion.div>
              )}

              {phase === "result" && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <MinigameResultScreen
                    score={score}
                    isPerfect={isPerfect}
                    xpEarned={xpEarned}
                    onClose={onClose}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Game dispatcher ───────────────────────────────────────────────────────────

interface GameComponentProps {
  gameType: MinigameType;
  onComplete: (score: number, isPerfect: boolean) => void;
}

function GameComponent({ gameType, onComplete }: GameComponentProps) {
  switch (gameType) {
    case "sort_concepts":  return <GameSortConcepts onComplete={onComplete} />;
    case "fill_blank":     return <GameFillBlank onComplete={onComplete} />;
    case "match_pairs":    return <GameMatchPairs onComplete={onComplete} />;
    case "true_false":     return <GameTrueFalse onComplete={onComplete} />;
    case "build_network":  return <GameBuildNetwork onComplete={onComplete} />;
    case "write_prompt":   return <GameWritePrompt onComplete={onComplete} />;
  }
}
