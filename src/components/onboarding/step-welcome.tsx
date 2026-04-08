"use client";

import { useEffect, useState } from "react";
import { PixelMascot } from "@/components/mascot/pixel-mascot";
import { computeLearningMode } from "@/lib/onboarding-mapping";
import type { OnboardingState } from "./types";

interface StepWelcomeProps {
  userName: string;
  state: OnboardingState;
  onComplete: (welcomeMessage: string) => void;
}

export function StepWelcome({ userName, state, onComplete }: StepWelcomeProps) {
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const learningMode = computeLearningMode(
    state.profileType!,
    state.hasCodedBefore!,
    state.usedChatGPT!,
    state.knowsAPI!
  );

  useEffect(() => {
    fetch("/api/onboarding/welcome-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileType: state.profileType,
        learningGoal: state.learningGoal,
        learningMode,
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

  return (
    <div className="text-center">
      <div className="flex justify-center mb-6">
        <PixelMascot emotion="excited" size={120} />
      </div>
      <h1 className="text-2xl font-bold mb-4">
        {userName ? `Salut, ${userName}!` : "Salut!"}
      </h1>

      {loading ? (
        <div className="h-12 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : (
        <p className="text-muted-foreground mb-2 text-lg leading-relaxed">{message}</p>
      )}

      <p className="text-sm text-muted-foreground mb-8">
        Modul selectat:{" "}
        <span className="font-semibold text-foreground">
          {learningMode === "technical" ? "Tehnic" : "Simplu"}
        </span>
        {" — "}poți schimba oricând din orice lecție.
      </p>

      <button
        onClick={() => !loading && onComplete(message)}
        disabled={loading}
        className="w-full rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:opacity-40"
      >
        Să începem! 🚀
      </button>
    </div>
  );
}
