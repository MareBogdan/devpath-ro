"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

export function OnboardingWizard({ userName, userId: _userId }: OnboardingWizardProps) {
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
      {/* Progress indicator */}
      <div className="flex gap-2 mb-8 justify-center">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              s <= state.step ? "bg-primary w-12" : "bg-muted w-6"
            }`}
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
