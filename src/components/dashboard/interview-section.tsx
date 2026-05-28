"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  MessageSquare,
  ArrowRight,
  Zap,
  Brain,
  Code2,
  Layers,
  Database,
  Eye,
  type LucideIcon,
} from "lucide-react";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";

interface InterviewSectionProps {
  flashcardCount: number;
  simulationCount: number;
  domainCount: number;
}

interface TopicChip {
  label: string;
  icon: LucideIcon;
  color: string;
}

const TOPIC_CHIPS: TopicChip[] = [
  { label: "Python", icon: Code2, color: "#F59E0B" },
  { label: "Machine Learning", icon: Brain, color: "#6C5CE7" },
  { label: "React", icon: Layers, color: "#06B6D4" },
  { label: "SQL", icon: Database, color: "#10B981" },
  { label: "Computer Vision", icon: Eye, color: "#A29BFE" },
];

export function InterviewSection({
  flashcardCount,
  simulationCount,
  domainCount,
}: InterviewSectionProps) {
  const stats = [
    { label: "Flashcarduri", value: flashcardCount, color: "text-aurora-primary-300" },
    { label: "Simulări", value: simulationCount, color: "text-aurora-accent-500" },
    { label: "Domenii", value: domainCount, color: "text-aurora-gold-500" },
  ];

  return (
    <motion.section
      id="interviu"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative min-h-[500px] flex items-center justify-center px-6 py-20 overflow-hidden"
    >
      {/* Aurora bg */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="aurora-blob-1"
          style={{ bottom: "0%", right: "-10%", background: "rgba(0, 206, 201, 0.06)" }}
        />
      </div>

      <div className="w-full mx-auto relative z-10" style={{ maxWidth: "min(75%, 1000px)" }}>
        <h2 className="text-2xl font-bold mb-8">
          <AnimatedGradientText speed={1} colorFrom="#6C5CE7" colorTo="#00CEC9" className="text-2xl font-bold">
            Simulare interviu
          </AnimatedGradientText>
        </h2>

        {/* 3-column stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-[12px] bg-aurora-bg-card border border-aurora-border-medium p-3 text-center">
              <p className={`text-xl font-bold ${stat.color} tabular-nums`}>{stat.value}</p>
              <p className="text-[10px] text-aurora-text-tertiary mt-0.5">{stat.label}</p>
              {stat.value === 0 && (
                <Link
                  href="/interview"
                  className="mt-1 inline-block text-[10px] text-aurora-primary-300 hover:text-aurora-primary-400 font-medium"
                >
                  Începe →
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* CTA card — entire card is clickable */}
        <Link
          href="/interview"
          className="block rounded-[14px] bg-aurora-bg-card border border-aurora-border-medium p-8 relative overflow-hidden cursor-pointer transition-all duration-200 hover:border-aurora-border-strong hover:scale-[1.005]"
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-aurora-primary-500 to-aurora-accent-500" />

          <div className="flex items-start gap-6">
            <div className="relative p-4 rounded-2xl bg-aurora-primary-500/10 shrink-0">
              <div
                className="absolute inset-0 rounded-2xl bg-aurora-primary-500/10 pointer-events-none"
                style={{ animation: "pulse-glow 3s ease-in-out infinite" }}
              />
              <MessageSquare className="relative h-8 w-8 text-aurora-primary-300" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-aurora-text-primary mb-2">
                Pregătește-te pentru interviu
              </h3>
              <p className="text-sm text-aurora-text-secondary leading-relaxed mb-6">
                Simulează un interviu tehnic AI cu asistentul nostru. Primești întrebări reale
                din domeniul inteligenței artificiale și feedback instant pe răspunsuri.
              </p>
              <span className="inline-flex items-center gap-2 bg-aurora-primary-500 text-white font-semibold px-5 py-2.5 rounded-[10px]">
                Începe interviul
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </Link>

        {/* Topic domain chips — styled like CategoryPill (visual consistency
            with /glossar and /onboarding). Display-only — clicking goes to /interview. */}
        <div className="flex flex-wrap gap-1.5 mt-4 mb-2">
          {TOPIC_CHIPS.map(({ label, icon: Icon, color }) => (
            <Link
              key={label}
              href="/interview"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors"
              style={{
                backgroundColor: `${color}14`,
                borderColor: `${color}30`,
                color: color,
              }}
            >
              <Icon className="h-3 w-3" />
              {label}
            </Link>
          ))}
        </div>

        {/* Preview flashcards — clickable */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <Link
            href="/interview"
            className="rounded-[14px] bg-aurora-bg-card border border-aurora-border-medium p-5 cursor-pointer transition-all duration-200 hover:border-aurora-border-strong hover:scale-[1.005]"
          >
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-aurora-gold-500" />
              <span className="text-xs font-medium text-aurora-text-tertiary uppercase tracking-wider">
                Flashcard
              </span>
            </div>
            <p className="text-sm font-medium text-aurora-text-primary">
              Ce este un &quot;transformer&quot; în contextul NLP?
            </p>
          </Link>

          <Link
            href="/interview"
            className="rounded-[14px] bg-aurora-bg-card border border-aurora-border-medium p-5 cursor-pointer transition-all duration-200 hover:border-aurora-border-strong hover:scale-[1.005]"
          >
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-4 w-4 text-aurora-accent-500" />
              <span className="text-xs font-medium text-aurora-text-tertiary uppercase tracking-wider">
                Flashcard
              </span>
            </div>
            <p className="text-sm font-medium text-aurora-text-primary">
              Explică diferența între supervised și unsupervised learning.
            </p>
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
