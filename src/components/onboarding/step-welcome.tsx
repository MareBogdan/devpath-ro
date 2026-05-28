"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Clock, Sparkles, Target } from "lucide-react";
import { CosmoMascot } from "@/components/mascot/cosmo-mascot";
import { StatCard } from "@/components/ui/stat-card";
import { computeSkillLevel } from "@/lib/onboarding-mapping";
import type { OnboardingState } from "./types";

interface StepWelcomeProps {
  userName: string;
  state: OnboardingState;
  onComplete: (welcomeMessage: string) => void;
}

const GOAL_LABELS: Record<string, string> = {
  understand: "Să înțeleg AI",
  build: "Să construiesc",
  career: "Carieră",
  curiosity: "Curiozitate",
};

const SKILL_LABELS: Record<"beginner" | "intermediate" | "advanced", string> = {
  beginner: "Începător",
  intermediate: "Intermediar",
  advanced: "Avansat",
};

export function StepWelcome({ userName, state, onComplete }: StepWelcomeProps) {
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const skillLevel = computeSkillLevel(state.hasCodedBefore!, state.knowsAPI!);

  const dailyGoalDisplay =
    state.dailyGoalMinutes === 0 ? "Flexibil" : `${state.dailyGoalMinutes} min/zi`;
  const goalLabel = state.learningGoal ? GOAL_LABELS[state.learningGoal] : "—";

  useEffect(() => {
    fetch("/api/onboarding/welcome-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileType: state.profileType,
        learningGoal: state.learningGoal,
        userName,
      }),
    })
      .then((r) => r.json())
      .then((d: { message?: string }) => {
        setMessage(d.message ?? "Bine ai venit pe DevPath RO!");
        setLoading(false);
      })
      .catch(() => {
        setMessage("Bine ai venit pe DevPath RO!");
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClick() {
    if (loading) return;
    // Brief celebration before redirect
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#6C5CE7", "#00CEC9", "#FDCB6E"],
    });
    // Small delay so the user sees the burst before navigation
    setTimeout(() => onComplete(message), 250);
  }

  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        className="flex justify-center mb-6"
      >
        <CosmoMascot emotion="waving" size={120} enableInteraction />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-2xl font-bold mb-4 aurora-gradient-text"
      >
        {userName ? `Salut, ${userName}!` : "Salut!"}
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.18 }}
        className="min-h-[68px] flex items-center justify-center mb-6"
      >
        {loading ? (
          <div className="w-6 h-6 rounded-full border-2 border-aurora-primary-500 border-t-transparent animate-spin" />
        ) : (
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">{message}</p>
        )}
      </motion.div>

      {/* Choice preview */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.28 }}
        className="grid grid-cols-3 gap-2 mb-6 text-left"
      >
        <StatCard
          icon={Clock}
          label="Ritm zilnic"
          value={dailyGoalDisplay}
          color="accent"
          size="sm"
          animateValue={false}
        />
        <StatCard
          icon={Target}
          label="Obiectiv"
          value={goalLabel}
          color="primary"
          size="sm"
          animateValue={false}
        />
        <StatCard
          icon={Sparkles}
          label="Nivel"
          value={SKILL_LABELS[skillLevel]}
          color="gold"
          size="sm"
          animateValue={false}
        />
      </motion.div>

      <p className="text-xs text-muted-foreground mb-6">
        Cursurile vor adapta dificultatea la nivelul tău.
      </p>

      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        whileTap={!loading ? { scale: 0.98 } : undefined}
        onClick={handleClick}
        disabled={loading}
        className="w-full rounded-xl bg-aurora-primary-500 hover:bg-aurora-primary-600 px-6 py-3 font-semibold text-white disabled:opacity-40 transition-colors"
      >
        Să începem! 🚀
      </motion.button>
    </div>
  );
}
