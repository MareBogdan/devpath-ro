"use client";

import { motion } from "framer-motion";
import { BookOpen, Bot, MessageSquare, Briefcase, ArrowRight } from "lucide-react";
import { MagicCard } from "@/components/ui/magic-card";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";

interface FeatureCard {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  topBorder: string;
  title: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
  gradientColor: string;
  targetId: string;
}

const FEATURES: FeatureCard[] = [
  {
    icon: BookOpen,
    iconBg: "bg-aurora-primary-500/20",
    iconColor: "text-aurora-primary-300",
    topBorder: "from-aurora-primary-500 to-aurora-primary-400",
    title: "Cursuri Interactive",
    description:
      "Lecții cu explicații clare, quiz-uri și exerciții practice. Fără jargon, fără plictiseală.",
    gradientFrom: "#6C5CE7",
    gradientTo: "#A29BFE",
    gradientColor: "rgba(108, 92, 231, 0.12)",
    targetId: "cursuri",
  },
  {
    icon: Bot,
    iconBg: "bg-aurora-accent-500/20",
    iconColor: "text-aurora-accent-500",
    topBorder: "from-aurora-accent-500 to-[#81ECEC]",
    title: "AI Coach Personal",
    description:
      "Întreabă orice despre lecție. AI-ul îți răspunde în română, instant.",
    gradientFrom: "#00CEC9",
    gradientTo: "#81ECEC",
    gradientColor: "rgba(0, 206, 201, 0.12)",
    targetId: "cursuri",
  },
  {
    icon: MessageSquare,
    iconBg: "bg-aurora-gold-500/20",
    iconColor: "text-aurora-gold-500",
    topBorder: "from-aurora-gold-500 to-[#F9CA24]",
    title: "Pregătire Interviu",
    description:
      "Flashcarduri, simulări și exerciții pentru interviul tău tech.",
    gradientFrom: "#FDCB6E",
    gradientTo: "#F9CA24",
    gradientColor: "rgba(253, 203, 110, 0.12)",
    targetId: "interviu",
  },
  {
    icon: Briefcase,
    iconBg: "bg-aurora-primary-500/15",
    iconColor: "text-aurora-primary-400",
    topBorder: "from-[#A29BFE] to-aurora-accent-500",
    title: "Portofoliu Automat",
    description:
      "Pe măsură ce înveți, portofoliul tău se construiește singur. Gata de trimis la angajatori.",
    gradientFrom: "#A29BFE",
    gradientTo: "#00CEC9",
    gradientColor: "rgba(162, 155, 254, 0.12)",
    targetId: "portofoliu",
  },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function PresentationSection() {
  return (
    <motion.section
      id="prezentare"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative min-h-[500px] flex items-center justify-center px-6 py-20 overflow-hidden"
    >
      {/* Aurora bg */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="aurora-blob-2"
          style={{ top: "10%", right: "-10%", background: "rgba(0, 206, 201, 0.06)" }}
        />
      </div>

      <div className="w-full mx-auto relative z-10 max-sm:!max-w-full" style={{ maxWidth: "min(75%, 1000px)" }}>
        <h2 className="text-2xl font-bold mb-2">
          <AnimatedGradientText speed={1} colorFrom="#6C5CE7" colorTo="#00CEC9" className="text-2xl font-bold">
            Ce poți face pe DevPath
          </AnimatedGradientText>
        </h2>
        <p className="text-sm text-aurora-text-secondary mb-8">
          Tot ce ai nevoie ca să înțelegi tech-ul și să treci interviurile.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="h-full"
              >
                <button
                  onClick={() => scrollTo(feat.targetId)}
                  className="w-full h-full text-left cursor-pointer"
                >
                  <MagicCard
                    gradientSize={200}
                    gradientColor={feat.gradientColor}
                    gradientFrom={feat.gradientFrom}
                    gradientTo={feat.gradientTo}
                    className="rounded-[14px] bg-aurora-bg-card border border-aurora-border-medium h-full hover:border-aurora-border-strong transition-colors"
                  >
                    {/* Colored top border */}
                    <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${feat.topBorder} z-10`} />

                    <div className="p-6 pt-7 flex flex-col h-full">
                      {/* Icon circle — 48px */}
                      <div className={`inline-flex p-3.5 rounded-2xl ${feat.iconBg} mb-5 self-start`}>
                        <Icon className={`h-6 w-6 ${feat.iconColor}`} />
                      </div>

                      <h3 className="text-base font-bold text-aurora-text-primary mb-2">
                        {feat.title}
                      </h3>
                      <p className="text-sm text-aurora-text-secondary leading-relaxed flex-1">
                        {feat.description}
                      </p>

                      {/* Arrow hint */}
                      <div className="flex justify-end mt-4">
                        <ArrowRight className="h-4 w-4 text-aurora-text-tertiary" />
                      </div>
                    </div>
                  </MagicCard>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
