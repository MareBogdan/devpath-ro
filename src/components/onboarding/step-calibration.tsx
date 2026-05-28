"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Coffee, Zap, Hourglass } from "lucide-react";
import { CategoryPillGroup } from "@/components/ui/category-pill";
import type { CalibrationAnswer } from "./types";

interface CalibrationState {
  usedChatGPT: CalibrationAnswer | null;
  hasCodedBefore: CalibrationAnswer | null;
  knowsAPI: CalibrationAnswer | null;
  dailyGoalMinutes: 5 | 15 | 30 | 0;
}

interface StepCalibrationProps {
  onComplete: (answers: CalibrationState) => void;
}

const ANSWERS: { value: CalibrationAnswer; label: string }[] = [
  { value: "yes", label: "Da" },
  { value: "sometimes_or_a_little", label: "Puțin / uneori" },
  { value: "no", label: "Niciodată" },
];

const DAILY_GOAL_OPTIONS = [
  { value: "5", label: "5 min", icon: Coffee, color: "#00CEC9" },
  { value: "15", label: "15 min", icon: Clock, color: "#6C5CE7" },
  { value: "30", label: "30 min", icon: Zap, color: "#FDCB6E" },
  { value: "0", label: "Când am timp", icon: Hourglass, color: "#888888" },
];

export function StepCalibration({ onComplete }: StepCalibrationProps) {
  const [answers, setAnswers] = useState<CalibrationState>({
    usedChatGPT: null,
    hasCodedBefore: null,
    knowsAPI: null,
    dailyGoalMinutes: 15,
  });

  function set<K extends keyof CalibrationState>(key: K, value: CalibrationState[K]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  const allAnswered =
    answers.usedChatGPT !== null &&
    answers.hasCodedBefore !== null &&
    answers.knowsAPI !== null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2 aurora-gradient-text">
        Cât știi despre tehnologie?
      </h1>
      <p className="text-muted-foreground mb-6">3 întrebări rapide — nu există răspunsuri greșite.</p>

      <div className="space-y-6">
        <QuestionRow
          index={0}
          question="Ai folosit vreodată ChatGPT sau un asistent AI?"
          options={ANSWERS}
          value={answers.usedChatGPT}
          onChange={(v) => set("usedChatGPT", v as CalibrationAnswer)}
        />
        <QuestionRow
          index={1}
          question="Ai scris vreodată cod?"
          options={ANSWERS}
          value={answers.hasCodedBefore}
          onChange={(v) => set("hasCodedBefore", v as CalibrationAnswer)}
        />
        <QuestionRow
          index={2}
          question="Știi ce este un API?"
          options={ANSWERS}
          value={answers.knowsAPI}
          onChange={(v) => set("knowsAPI", v as CalibrationAnswer)}
        />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.18 }}
        >
          <p className="text-sm font-medium text-foreground mb-3">Obiectiv zilnic de învățare:</p>
          <CategoryPillGroup
            options={DAILY_GOAL_OPTIONS}
            value={String(answers.dailyGoalMinutes)}
            onChange={(v) =>
              set("dailyGoalMinutes", Number(v) as CalibrationState["dailyGoalMinutes"])
            }
            groupId="onboarding-daily-goal"
            className="flex-wrap"
          />
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.24 }}
          whileTap={allAnswered ? { scale: 0.98 } : undefined}
          onClick={() => allAnswered && onComplete(answers as CalibrationState)}
          disabled={!allAnswered}
          className="w-full rounded-xl bg-aurora-primary-500 px-6 py-3 font-semibold text-white transition-opacity disabled:opacity-40 hover:bg-aurora-primary-600"
        >
          Continuă
        </motion.button>
      </div>
    </div>
  );
}

function QuestionRow({
  index,
  question,
  options,
  value,
  onChange,
}: {
  index: number;
  question: string;
  options: { value: string; label: string }[];
  value: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <p className="text-sm font-medium text-foreground mb-2">{question}</p>
      <div className="grid grid-cols-3 gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`rounded-lg border px-3 py-2 text-sm transition-all ${
              value === o.value
                ? "border-aurora-primary-500 bg-aurora-primary-500 text-white"
                : "border-border bg-card hover:border-aurora-primary-500"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
