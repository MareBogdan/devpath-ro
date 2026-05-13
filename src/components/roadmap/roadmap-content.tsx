"use client";

import Link from "next/link";
import {
  Compass,
  Flame,
  Target,
  CalendarDays,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Hourglass,
} from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { StatCard } from "@/components/ui/stat-card";
import { AnimatedProgressRing } from "@/components/ui/animated-progress-ring";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import {
  MeshGradientCard,
  slugToGradientColors,
} from "@/components/ui/mesh-gradient-card";

// ─── Types — fully serializable from RSC → client ────────────────────────────

export interface CourseStat {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: number;
  orderIndex: number;
  total: number;
  completedCount: number;
  percent: number;
  remaining: number;
  daysRemaining: number | null;
  /** ISO string — Date objects can't cross the RSC boundary cleanly. */
  estimatedFinishDateIso: string | null;
  isComplete: boolean;
  isStarted: boolean;
}

interface RoadmapContentProps {
  dailyGoal: number;
  streakCount: number;
  totalCompleted: number;
  totalAvailable: number;
  overallPercent: number;
  courses: CourseStat[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRomanianDate(iso: string): string {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

function pluralLessons(n: number): string {
  return n === 1 ? "lecție" : "lecții";
}

function pluralDays(n: number): string {
  return n === 1 ? "zi" : "zile";
}

function motivationalLine(streak: number, dailyGoal: number): string {
  if (streak === 0 && dailyGoal === 0) {
    return "Setează-ți un obiectiv zilnic și începe primul streak.";
  }
  if (streak === 0) {
    return `Începe astăzi un streak de ${dailyGoal} ${dailyGoal === 1 ? "minut" : "minute"} pe zi.`;
  }
  if (streak < 3) {
    return "Continuă! La 3 zile primești primul bonus de XP.";
  }
  if (streak < 7) {
    return "Streak solid. La 7 zile câștigi badge-ul săptămânal.";
  }
  if (streak < 30) {
    return "Excelent. La 30 de zile devii membru al cercului dedicat.";
  }
  return "Ești o forță. Continuă fără pauză.";
}

// ─── Main client component ────────────────────────────────────────────────────

export function RoadmapContent({
  dailyGoal,
  streakCount,
  totalCompleted,
  totalAvailable,
  overallPercent,
  courses,
}: RoadmapContentProps) {
  return (
    <div className="pb-20">
      <PageHero
        title="Drumul Tău în AI"
        subtitle="De la zero la transformere — un curs, o lecție, o zi deodată."
        icon={Compass}
        backgroundVariant="mesh"
        rightContent={
          <AnimatedProgressRing
            value={overallPercent}
            size="lg"
            color="primary"
            showLabel
            labelContent={
              <div className="text-center">
                <div className="text-lg font-bold text-foreground tabular-nums">
                  {overallPercent}%
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Progres
                </div>
              </div>
            }
          />
        }
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Daily Goal & Streak strip */}
        <DailyGoalStreakCard
          dailyGoal={dailyGoal}
          streakCount={streakCount}
          totalCompleted={totalCompleted}
          totalAvailable={totalAvailable}
        />

        {/* Course Journey — vertical timeline */}
        <section aria-labelledby="course-journey-heading">
          <div className="flex items-baseline justify-between mb-5">
            <h2
              id="course-journey-heading"
              className="text-lg font-bold text-foreground"
            >
              Parcursul tău
            </h2>
            <p className="text-xs text-muted-foreground">
              {courses.length}{" "}
              {courses.length === 1 ? "curs disponibil" : "cursuri disponibile"}
            </p>
          </div>

          <ol className="relative space-y-5">
            {courses.map((course, idx) => (
              <CourseTimelineCard
                key={course.id}
                course={course}
                index={idx}
                isLast={idx === courses.length - 1}
                dailyGoal={dailyGoal}
              />
            ))}

            {/* Coming-soon teaser — neutral, no fake course names */}
            <ComingSoonTeaser />
          </ol>
        </section>
      </div>
    </div>
  );
}

// ─── Daily goal + streak card ────────────────────────────────────────────────

interface DailyGoalStreakCardProps {
  dailyGoal: number;
  streakCount: number;
  totalCompleted: number;
  totalAvailable: number;
}

function DailyGoalStreakCard({
  dailyGoal,
  streakCount,
  totalCompleted,
  totalAvailable,
}: DailyGoalStreakCardProps) {
  const goalLabel = dailyGoal === 0 ? "Flexibil" : `${dailyGoal} min`;
  const message = motivationalLine(streakCount, dailyGoal);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      <StatCard
        icon={Target}
        label="Obiectiv zilnic"
        value={goalLabel}
        color="primary"
        size="md"
        animateValue={false}
        subtitle={message}
      />
      <StatCard
        icon={Flame}
        label="Streak"
        value={streakCount}
        color="streak"
        size="md"
        subtitle={streakCount === 1 ? "zi consecutivă" : "zile consecutive"}
      />
      <StatCard
        icon={Sparkles}
        label="Lecții completate"
        value={totalCompleted}
        color="accent"
        size="md"
        subtitle={`din ${totalAvailable}`}
      />
    </div>
  );
}

// ─── Single course timeline card ─────────────────────────────────────────────

interface CourseTimelineCardProps {
  course: CourseStat;
  index: number;
  isLast: boolean;
  dailyGoal: number;
}

function CourseTimelineCard({
  course,
  index,
  isLast,
  dailyGoal,
}: CourseTimelineCardProps) {
  const colors = slugToGradientColors(course.slug);
  const ctaLabel = course.isComplete
    ? "Reia cursul"
    : course.isStarted
    ? "Continuă"
    : "Începe";
  const ctaHref = `/courses?c=${course.slug}`;

  return (
    <li className="relative">
      {/* Vertical connector line to next item */}
      {!isLast && (
        <span
          className="absolute left-[18px] top-12 bottom-[-20px] w-0.5 bg-gradient-to-b from-border via-border to-transparent"
          aria-hidden
        />
      )}

      <div className="flex items-stretch gap-4">
        {/* Numbered milestone marker */}
        <div className="shrink-0 flex flex-col items-center">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold tabular-nums shadow-sm ${
              course.isComplete
                ? "bg-emerald-500 border-emerald-500 text-white"
                : course.isStarted
                ? "bg-aurora-primary-500 border-aurora-primary-500 text-white"
                : "bg-card border-border text-muted-foreground"
            }`}
          >
            {course.isComplete ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              index + 1
            )}
          </div>
        </div>

        {/* Course card */}
        <MeshGradientCard
          colors={colors}
          intensity={course.isStarted || course.isComplete ? 0.16 : 0.08}
          interactive
          className="flex-1 p-5 sm:p-6"
        >
          <div className="flex items-start gap-4">
            {/* Progress ring */}
            <div className="shrink-0">
              <AnimatedProgressRing
                value={course.percent}
                size={68}
                strokeWidth={5}
                color={course.isComplete ? "success" : "primary"}
                showLabel
                labelContent={
                  course.isComplete ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  ) : (
                    <div className="text-sm font-bold text-foreground tabular-nums">
                      {course.percent}%
                    </div>
                  )
                }
              />
            </div>

            {/* Title + meta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <DifficultyBadge level={course.difficulty} />
                {course.isComplete && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                    <CheckCircle2 className="h-3 w-3" />
                    Terminat
                  </span>
                )}
                {course.isStarted && !course.isComplete && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-aurora-primary-400">
                    <Sparkles className="h-3 w-3" />
                    În progres
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-foreground leading-tight">
                {course.title}
              </h3>
              {course.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {course.description}
                </p>
              )}

              {/* Stats row */}
              <div className="flex items-center gap-3 sm:gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  {course.completedCount}/{course.total} {pluralLessons(course.total)}
                </span>
                {course.estimatedFinishDateIso && course.daysRemaining !== null && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Termini în ~{course.daysRemaining} {pluralDays(course.daysRemaining)}
                    <span className="text-muted-foreground/70">
                      · {formatRomanianDate(course.estimatedFinishDateIso)}
                    </span>
                  </span>
                )}
                {dailyGoal === 0 && course.remaining > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground/80">
                    <Hourglass className="h-3.5 w-3.5" />
                    Ritm flexibil
                  </span>
                )}
              </div>

              {/* CTA */}
              <div className="mt-4">
                <Link
                  href={ctaHref}
                  className="group/cta inline-flex items-center gap-2 rounded-xl bg-aurora-primary-500 hover:bg-aurora-primary-600 text-white font-semibold px-4 py-2 text-sm transition-colors"
                >
                  {ctaLabel}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/cta:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </MeshGradientCard>
      </div>
    </li>
  );
}

// ─── Coming-soon teaser ───────────────────────────────────────────────────────

function ComingSoonTeaser() {
  return (
    <li className="relative">
      <div className="flex items-stretch gap-4">
        <div className="shrink-0 flex flex-col items-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-dashed border-border bg-card text-muted-foreground">
            <Hourglass className="h-4 w-4" />
          </div>
        </div>

        <div className="flex-1 rounded-2xl border border-dashed border-border bg-muted/30 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-aurora-primary-500/10 shrink-0">
              <Compass className="h-4 w-4 text-aurora-primary-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Mai multe cursuri în curând
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Curriculum-ul complet este în dezvoltare — de la matematică pentru AI până la transformere și aplicații LLM. Anunțăm fiecare curs nou direct în dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
