"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { StepProfile } from "./step-profile";
import { StepGoal } from "./step-goal";
import { StepCalibration } from "./step-calibration";
import { StepWelcome } from "./step-welcome";
import { completeOnboarding } from "@/app/onboarding/actions";
import type { OnboardingState } from "./types";

interface OnboardingWizardProps {
  userName: string;
  userId: string;
}

const TOTAL_STEPS = 4;

const STEP_LABELS: Record<number, string> = {
  1: "Profilul tău",
  2: "Obiectivul tău",
  3: "Calibrare",
  4: "Bun venit",
};

export function OnboardingWizard({ userName }: OnboardingWizardProps) {
  const [state, setState] = useState<OnboardingState>({
    step: 1,
    profileType: null,
    learningGoal: null,
    usedChatGPT: null,
    hasCodedBefore: null,
    knowsAPI: null,
    dailyGoalMinutes: 15,
    welcomeMessage: "",
    isSubmitting: false,
  });

  function advance(updates: Partial<OnboardingState>) {
    setState((prev) => ({
      ...prev,
      ...updates,
      step: (prev.step + 1) as OnboardingState["step"],
    }));
  }

  async function handleComplete(welcomeMessage: string) {
    setState((prev) => ({ ...prev, isSubmitting: true, welcomeMessage }));
    await completeOnboarding({
      profileType: state.profileType!,
      learningGoal: state.learningGoal!,
      usedChatGPT: state.usedChatGPT!,
      hasCodedBefore: state.hasCodedBefore!,
      knowsAPI: state.knowsAPI!,
      dailyGoalMinutes: state.dailyGoalMinutes,
      welcomeMessage,
    });
    // completeOnboarding redirects to /dashboard
  }

  return (
    <div className="w-full max-w-xl">
      {/* Brand mark */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-center gap-2 mb-6"
      >
        <Sparkles className="h-4 w-4 text-aurora-primary-500" />
        <span className="text-sm font-medium tracking-tight">
          <span className="text-aurora-primary-300">DevPath</span>
          <span className="text-aurora-accent-500">.ro</span>
        </span>
      </motion.div>

      {/* Step header */}
      <div className="mb-6 text-center">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
          Pasul {state.step} din {TOTAL_STEPS}
        </p>
        <p className="text-sm text-aurora-primary-400 font-medium">
          {STEP_LABELS[state.step]}
        </p>
      </div>

      {/* Progress bar */}
      <div className="flex gap-2 mb-8 justify-center">
        {[1, 2, 3, 4].map((s) => (
          <motion.div
            key={s}
            initial={false}
            animate={{
              width: s === state.step ? 48 : s < state.step ? 24 : 24,
              backgroundColor:
                s <= state.step
                  ? "rgb(108, 92, 231)" // aurora-primary
                  : "var(--muted, rgb(229, 231, 235))",
            }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="h-1.5 rounded-full"
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {state.step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            <StepProfile
              onSelect={(profileType) => advance({ profileType })}
            />
          </motion.div>
        )}
        {state.step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            <StepGoal
              onSelect={(learningGoal) => advance({ learningGoal })}
            />
          </motion.div>
        )}
        {state.step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            <StepCalibration
              onComplete={(calibration) => advance(calibration)}
            />
          </motion.div>
        )}
        {state.step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            <StepWelcome
              userName={userName}
              state={state}
              onComplete={handleComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
