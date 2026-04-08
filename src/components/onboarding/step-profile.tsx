"use client";

import type { ProfileType } from "./types";

const PROFILES: { value: ProfileType; label: string; emoji: string; description: string }[] = [
  { value: "medical", label: "Medical / Sănătate", emoji: "🏥", description: "Doctor, asistent, farmacist, student la medicină" },
  { value: "entrepreneur", label: "Antreprenor / Manager", emoji: "🚀", description: "Construiești sau conduci o afacere" },
  { value: "student_non_cs", label: "Student (non-IT)", emoji: "🎓", description: "Studiezi altceva decât informatica" },
  { value: "student_cs", label: "Student IT / Developer", emoji: "💻", description: "Informatică, inginerie software, sau scrii cod" },
  { value: "developer", label: "Developer / Inginer", emoji: "⚙️", description: "Lucrezi profesional cu cod" },
  { value: "teacher", label: "Profesor / Educator", emoji: "📚", description: "Predai sau formezi alți oameni" },
  { value: "curious", label: "Pur și simplu curios", emoji: "🔍", description: "Vrei să înțelegi ce e cu AI-ul ăsta" },
];

interface StepProfileProps {
  onSelect: (profileType: ProfileType) => void;
}

export function StepProfile({ onSelect }: StepProfileProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Cine ești tu?</h1>
      <p className="text-muted-foreground mb-6">
        Ne ajută să adaptăm conținutul exact pentru tine.
      </p>
      <div className="grid grid-cols-1 gap-3">
        {PROFILES.map((p) => (
          <button
            key={p.value}
            onClick={() => onSelect(p.value)}
            className="flex items-center gap-4 rounded-xl border border-border bg-card hover:border-primary hover:bg-primary/5 p-4 text-left transition-all duration-150"
          >
            <span className="text-2xl">{p.emoji}</span>
            <div>
              <p className="font-medium text-foreground">{p.label}</p>
              <p className="text-sm text-muted-foreground">{p.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
