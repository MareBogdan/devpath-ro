"use client";

import { motion } from "framer-motion";
import {
  Layers,
  Clock,
  CheckCircle2,
  Sparkles,
  Flame,
  PartyPopper,
} from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { StatCard } from "@/components/ui/stat-card";
import { AnimatedProgressRing } from "@/components/ui/animated-progress-ring";
import { EmptyState } from "@/components/ui/empty-state";
import { FlashcardReview } from "@/components/flashcards/flashcard-review";
import type { ReviewCard } from "@/app/(dashboard)/flashcards/page";

interface FlashcardsContentProps {
  cards: ReviewCard[];
  dueCount: number;
  newCount: number;
  totalReviewed: number;
  totalMastered: number;
  totalCatalog: number;
  streakCount: number;
}

export function FlashcardsContent({
  cards,
  dueCount,
  newCount,
  totalReviewed,
  totalMastered,
  totalCatalog,
  streakCount,
}: FlashcardsContentProps) {
  const masteryPercent =
    totalCatalog > 0 ? Math.round((totalMastered / totalCatalog) * 100) : 0;

  return (
    <div className="pb-20">
      <PageHero
        title="Flashcards"
        subtitle="Repetă și memorează cu spaced repetition (SM-2)."
        icon={Layers}
        backgroundVariant="mesh"
        rightContent={
          <AnimatedProgressRing
            value={masteryPercent}
            size="lg"
            color={masteryPercent === 100 ? "success" : "primary"}
            showLabel
            labelContent={
              <div className="text-center">
                <div className="text-lg font-bold text-foreground tabular-nums">
                  {masteryPercent}%
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Stăpânite
                </div>
              </div>
            }
          />
        }
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Stats banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            icon={Clock}
            label="Scadente azi"
            value={dueCount}
            color="streak"
            size="md"
            subtitle={dueCount === 1 ? "card de revizuit" : "carduri de revizuit"}
          />
          <StatCard
            icon={Sparkles}
            label="Carduri noi"
            value={newCount}
            color="accent"
            size="md"
            subtitle="disponibile"
          />
          <StatCard
            icon={CheckCircle2}
            label="Stăpânite"
            value={totalMastered}
            color="primary"
            size="md"
            subtitle={`din ${totalCatalog} total`}
          />
          <StatCard
            icon={Flame}
            label="Streak"
            value={streakCount}
            color="gold"
            size="md"
            subtitle={streakCount === 1 ? "zi consecutivă" : "zile consecutive"}
          />
        </div>

        {/* Review surface or empty state */}
        {cards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-border bg-card"
          >
            <EmptyState
              icon={PartyPopper}
              title="Felicitări — totul e revizuit!"
              description={
                totalReviewed > 0
                  ? `Ai parcurs ${totalReviewed} ${totalReviewed === 1 ? "card" : "carduri"} până acum. Revino mâine pentru următoarea sesiune SM-2.`
                  : "Nu există carduri de revizuit momentan. Completează lecții pentru a debloca flashcards noi."
              }
              actionLabel="Înapoi la dashboard"
              actionHref="/dashboard"
            />
          </motion.div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <FlashcardReview cards={cards} />
          </div>
        )}
      </div>
    </div>
  );
}
