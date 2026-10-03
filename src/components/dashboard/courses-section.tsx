"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, CheckCircle2, Clock } from "lucide-react";
import { MagicCard } from "@/components/ui/magic-card";
import { BorderBeam } from "@/components/ui/border-beam";
import { ShineBorder } from "@/components/ui/shine-border";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { cn } from "@/lib/utils";
import { MINUTES_PER_LESSON } from "@/lib/lesson-time";
import {
  getDifficultyColor,
  getDifficultyLabel,
  type DifficultyColor,
} from "@/lib/difficulty";

interface CourseCardData {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: number;
  totalLessons: number;
  completedLessons: number;
  nextLessonId?: string;
  nextLessonTitle?: string;
}

interface CoursesSectionProps {
  courses: CourseCardData[];
}

// Difficulty dots: green=1, yellow=3, red=5 out of 5
const difficultyDotCount: Record<DifficultyColor, number> = {
  green: 1,
  yellow: 3,
  red: 5,
};

const difficultyColors: Record<DifficultyColor, string> = {
  green: "bg-green-500/15 text-green-400",
  yellow: "bg-yellow-500/15 text-yellow-400",
  red: "bg-red-500/15 text-red-400",
};

// Top-border gradient per card index — differentiates cards visually
const cardGradients = [
  { from: "#6C5CE7", to: "#A29BFE", gradientColor: "rgba(108, 92, 231, 0.15)" },
  { from: "#00CEC9", to: "#81ECEC", gradientColor: "rgba(0, 206, 201, 0.15)" },
];

function DifficultyDots({ difficulty }: { difficulty: number }) {
  const filled = difficultyDotCount[getDifficultyColor(difficulty)];
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            i < filled ? "bg-aurora-primary-400" : "bg-aurora-border-subtle"
          )}
        />
      ))}
    </div>
  );
}

// Card wrapper: a link for openable courses, an inert block for "În curând" ones
// (href === null) so a course without lessons can never be opened into an empty page.
function CardShell({
  href,
  children,
}: {
  href: string | null;
  children: React.ReactNode;
}) {
  const base = "block relative rounded-[14px] overflow-hidden transition-all duration-200";
  if (!href) return <div className={cn(base, "opacity-70")}>{children}</div>;
  return (
    <Link href={href} className={cn(base, "cursor-pointer hover:scale-[1.005]")}>
      {children}
    </Link>
  );
}

export function CoursesSection({ courses }: CoursesSectionProps) {
  return (
    <motion.section
      id="cursuri"
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
          style={{ top: "10%", right: "-15%", background: "rgba(0, 206, 201, 0.06)" }}
        />
      </div>

      <div className="w-full mx-auto relative z-10 max-sm:!max-w-full" style={{ maxWidth: "min(75%, 1000px)" }}>
        <div className="flex items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-bold">
            <AnimatedGradientText speed={1} colorFrom="#6C5CE7" colorTo="#00CEC9" className="text-2xl font-bold">
              Cursurile tale
            </AnimatedGradientText>
          </h2>
          <Link
            href="/courses"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-aurora-text-secondary hover:text-aurora-primary-300 transition-colors max-sm:py-3"
          >
            Vezi toate cursurile
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className={cn(
          "grid gap-4",
          courses.length === 1 ? "grid-cols-1 max-w-[60%] mx-auto" : "grid-cols-1 lg:grid-cols-2"
        )}>
          {courses.map((course, i) => {
            const percent =
              course.totalLessons > 0
                ? Math.round((course.completedLessons / course.totalLessons) * 100)
                : 0;
            const isCompleted = percent === 100 && course.totalLessons > 0;
            const hasNoProgress = course.completedLessons === 0;
            const remaining = course.totalLessons - course.completedLessons;
            const estMinutes = remaining * MINUTES_PER_LESSON;
            const estHours = Math.floor(estMinutes / 60);
            const estTimeLabel =
              estMinutes < 60 ? `~${estMinutes} min rămase` : `~${estHours}h rămase`;

            const gradient = cardGradients[i % cardGradients.length];

            // No published lessons yet → locked "În curând" card (not a link).
            const isComingSoon = course.totalLessons === 0;
            // Land on the course map (it scrolls to the learner's next lesson);
            // the lesson is opened from there.
            const cardHref = isComingSoon ? null : `/courses/${course.slug}`;

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <CardShell href={cardHref}>
                  <MagicCard
                    gradientSize={250}
                    gradientColor={gradient.gradientColor}
                    gradientFrom={gradient.from}
                    gradientTo={gradient.to}
                    className="rounded-[14px] bg-aurora-bg-card border border-aurora-border-medium"
                  >
                    {/* Top gradient accent — unique per card */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[3px] z-50"
                      style={{
                        background: `linear-gradient(to right, ${gradient.from}, ${gradient.to})`,
                      }}
                    />

                    {isCompleted ? (
                      <ShineBorder shineColor={["#FDCB6E", "#F9CA24"]} borderWidth={1} duration={8} />
                    ) : (
                      <BorderBeam colorFrom={gradient.from} colorTo={gradient.to} size={80} duration={8} borderWidth={1} />
                    )}

                    <div className="p-6 pt-7">
                      {/* Title row */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="text-lg font-bold text-aurora-text-primary">
                              {course.title}
                            </h3>
                            {isCompleted && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-aurora-gold-500/15 text-aurora-gold-500">
                                <CheckCircle2 className="h-3 w-3" />
                                Completat
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                difficultyColors[getDifficultyColor(course.difficulty)]
                              }`}
                            >
                              {getDifficultyLabel(course.difficulty)}
                            </span>
                            <DifficultyDots difficulty={course.difficulty} />
                          </div>
                        </div>

                        {/* Progress % — large */}
                        {!isComingSoon && (
                          <div className="shrink-0 text-right">
                            <p className="text-2xl font-bold text-aurora-primary-300 leading-none">
                              {percent}%
                            </p>
                            <p className="text-[10px] text-aurora-text-tertiary mt-0.5">completat</p>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-sm text-aurora-text-secondary line-clamp-2 mb-3">
                        {course.description}
                      </p>

                      {/* Metadata row */}
                      <div className="flex items-center gap-3 text-[11px] text-aurora-text-tertiary mb-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-aurora-border-subtle/50">
                          {isComingSoon
                            ? "Lecții în pregătire"
                            : `${course.completedLessons}/${course.totalLessons} lecții`}
                        </span>
                        {!isCompleted && !hasNoProgress && !isComingSoon && (
                          <span>{estTimeLabel}</span>
                        )}
                        {hasNoProgress && !isComingSoon && (
                          <span>
                            ~{Math.round(course.totalLessons * MINUTES_PER_LESSON / 60 * 10) / 10}h total · {getDifficultyLabel(course.difficulty)}
                          </span>
                        )}
                      </div>

                      {/* Progress bar */}
                      {!isComingSoon && (
                        <div className="h-1.5 w-full rounded-full bg-aurora-border-subtle overflow-hidden mb-4">
                          <motion.div
                            className="h-full rounded-full"
                            style={{
                              background: `linear-gradient(to right, ${gradient.from}, ${gradient.to})`,
                            }}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${percent}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                          />
                        </div>
                      )}

                      {/* CTA */}
                      {isComingSoon ? (
                        <span className="inline-flex items-center gap-2 rounded-[10px] bg-amber-500/15 px-4 py-2 text-sm font-semibold text-amber-400">
                          <Clock className="h-4 w-4" />
                          În curând
                        </span>
                      ) : isCompleted ? (
                        <span className="inline-flex items-center gap-2 bg-aurora-gold-500/15 text-aurora-gold-500 font-semibold px-4 py-2 rounded-[10px] text-sm">
                          <CheckCircle2 className="h-4 w-4" />
                          Curs finalizat
                        </span>
                      ) : course.nextLessonId ? (
                        <span className="inline-flex items-center gap-2 bg-aurora-primary-500 text-white font-semibold px-4 py-2 rounded-[10px] text-sm max-w-full">
                          <PlayCircle className="h-4 w-4 shrink-0" />
                          <span className="truncate">
                            {hasNoProgress ? "Începe" : "Continuă"}:{" "}
                            {course.nextLessonTitle
                              ? course.nextLessonTitle.length > 28
                                ? course.nextLessonTitle.slice(0, 28) + "…"
                                : course.nextLessonTitle
                              : "Lecția următoare"}
                          </span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 bg-aurora-primary-500 text-white font-semibold px-4 py-2 rounded-[10px] text-sm">
                          Începe cursul
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                  </MagicCard>
                </CardShell>
              </motion.div>
            );
          })}
        </div>

        {/* Ghost button */}
        <div className="mt-8 text-center">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-sm font-medium text-aurora-text-secondary hover:text-aurora-primary-300 transition-colors max-sm:py-3"
          >
            Vezi toate cursurile
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
