"use client";

import { motion } from "framer-motion";
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
      <h1 className="text-2xl font-bold text-foreground mb-2 aurora-gradient-text">
        Cine ești tu?
      </h1>
      <p className="text-muted-foreground mb-6">
        Ne ajută să adaptăm conținutul exact pentru tine.
      </p>
      <div className="grid grid-cols-1 gap-3">
        {PROFILES.map((p, i) => (
          <motion.button
            key={p.value}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -1, transition: { duration: 0.15 } }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelect(p.value)}
            className="flex items-center gap-4 rounded-xl border border-border bg-card hover:border-aurora-primary-500 hover:bg-aurora-primary-500/5 p-4 text-left transition-colors duration-150"
          >
            <span className="text-2xl">{p.emoji}</span>
            <div>
              <p className="font-medium text-foreground">{p.label}</p>
              <p className="text-sm text-muted-foreground">{p.description}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
