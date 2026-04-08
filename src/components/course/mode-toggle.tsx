"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { updateLearningMode } from "@/app/(dashboard)/courses/actions";

interface ModeToggleProps {
  currentMode: "simple" | "technical";
  hasSimpleContent: boolean;
}

export function ModeToggle({ currentMode, hasSimpleContent }: ModeToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const newMode = currentMode === "simple" ? "technical" : "simple";
    if (newMode === "simple" && !hasSimpleContent) return;

    startTransition(async () => {
      await updateLearningMode(newMode);
      router.refresh();
    });
  }

  const isSimple = currentMode === "simple";
  const wouldSwitchToSimple = currentMode === "technical";
  const isDisabled = isPending || (wouldSwitchToSimple && !hasSimpleContent);

  return (
    <div className="relative group">
      <motion.button
        onClick={handleToggle}
        disabled={isDisabled}
        whileHover={isDisabled ? {} : { scale: 1.02 }}
        whileTap={isDisabled ? {} : { scale: 0.97 }}
        className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition
          ${
            isSimple
              ? "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300"
              : "bg-indigo-50 border-indigo-200 text-indigo-800 dark:bg-indigo-950/30 dark:border-indigo-800 dark:text-indigo-300"
          }
          disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span>{isSimple ? "🥔" : "⚙️"}</span>
        <span>{isSimple ? "Mod Simplu" : "Mod Tehnic"}</span>
      </motion.button>

      {/* Tooltip */}
      <div className="absolute right-0 top-full mt-1.5 w-52 text-xs bg-popover border border-border rounded-lg shadow-lg px-3 py-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
        {isDisabled && wouldSwitchToSimple
          ? "Varianta simplificată pentru această lecție este în pregătire."
          : "Schimbă modul de afișare al lecțiilor. Se aplică pe tot cursul."}
      </div>
    </div>
  );
}
