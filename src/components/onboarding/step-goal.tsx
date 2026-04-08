"use client";

import type { LearningGoal } from "./types";

const GOALS: { value: LearningGoal; label: string; description: string }[] = [
  { value: "understand", label: "Să înțeleg cum funcționează AI", description: "Fără intenția de a programa — vreau să știu ce se întâmplă" },
  { value: "build", label: "Să construiesc cu AI", description: "Vreau să fac aplicații, automatizări, proiecte reale" },
  { value: "career", label: "Să avansez în carieră", description: "Vreau să fiu relevant pe piața muncii în era AI" },
  { value: "curiosity", label: "Curiozitate generală", description: "Să fiu informat, să pot vorbi inteligent despre subiect" },
];

interface StepGoalProps {
  onSelect: (learningGoal: LearningGoal) => void;
}

export function StepGoal({ onSelect }: StepGoalProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Ce vrei să obții?</h1>
      <p className="text-muted-foreground mb-6">Vom adapta ordinea lecțiilor și exemplele la obiectivul tău.</p>
      <div className="grid grid-cols-1 gap-3">
        {GOALS.map((g) => (
          <button
            key={g.value}
            onClick={() => onSelect(g.value)}
            className="flex flex-col gap-1 rounded-xl border border-border bg-card hover:border-primary hover:bg-primary/5 p-4 text-left transition-all duration-150"
          >
            <p className="font-medium text-foreground">{g.label}</p>
            <p className="text-sm text-muted-foreground">{g.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
