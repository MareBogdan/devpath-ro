"use client";

import { useState } from "react";
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

const DAILY_GOALS: { value: 5 | 15 | 30 | 0; label: string }[] = [
  { value: 5, label: "5 minute" },
  { value: 15, label: "15 minute" },
  { value: 30, label: "30 minute" },
  { value: 0, label: "Când am timp" },
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
      <h1 className="text-2xl font-bold text-foreground mb-2">Cât știi despre tehnologie?</h1>
      <p className="text-muted-foreground mb-6">3 întrebări rapide — nu există răspunsuri greșite.</p>

      <div className="space-y-6">
        <QuestionRow
          question="Ai folosit vreodată ChatGPT sau un asistent AI?"
          options={ANSWERS}
          value={answers.usedChatGPT}
          onChange={(v) => set("usedChatGPT", v as CalibrationAnswer)}
        />
        <QuestionRow
          question="Ai scris vreodată cod?"
          options={ANSWERS}
          value={answers.hasCodedBefore}
          onChange={(v) => set("hasCodedBefore", v as CalibrationAnswer)}
        />
        <QuestionRow
          question="Știi ce este un API?"
          options={ANSWERS}
          value={answers.knowsAPI}
          onChange={(v) => set("knowsAPI", v as CalibrationAnswer)}
        />

        <div>
          <p className="text-sm font-medium text-foreground mb-3">Obiectiv zilnic de învățare:</p>
          <div className="grid grid-cols-4 gap-2">
            {DAILY_GOALS.map((g) => (
              <button
                key={g.value}
                onClick={() => set("dailyGoalMinutes", g.value)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                  answers.dailyGoalMinutes === g.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => allAnswered && onComplete(answers as CalibrationState)}
          disabled={!allAnswered}
          className="w-full rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
        >
          Continuă
        </button>
      </div>
    </div>
  );
}

function QuestionRow({
  question,
  options,
  value,
  onChange,
}: {
  question: string;
  options: { value: string; label: string }[];
  value: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-foreground mb-2">{question}</p>
      <div className="grid grid-cols-3 gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`rounded-lg border px-3 py-2 text-sm transition-all ${
              value === o.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:border-primary"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
