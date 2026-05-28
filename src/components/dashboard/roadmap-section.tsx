"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Lock, Zap, Clock, BookOpen, Hourglass } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";

interface RoadmapCourse {
  title: string;
  totalLessons: number;
  completedLessons: number;
}

interface RoadmapSectionProps {
  courses: RoadmapCourse[];
}

type NodeStatus = "done" | "current" | "locked";

function getStatus(course: RoadmapCourse, prevDone: boolean): NodeStatus {
  if (course.completedLessons === course.totalLessons && course.totalLessons > 0) return "done";
  if (course.completedLessons > 0) return "current";
  if (prevDone) return "current";
  return "locked";
}

export function RoadmapSection({ courses }: RoadmapSectionProps) {
  const statuses: NodeStatus[] = [];
  let prevDone = true;

  for (const course of courses) {
    const status = getStatus(course, prevDone);
    statuses.push(status);
    prevDone = status === "done";
  }

  // Overall progress is computed across REAL courses only — no fake "coming soon"
  // course names. The page-level /roadmap is the single source of truth for the
  // longer-term curriculum teaser.
  const completedCount = statuses.filter((s) => s === "done").length;
  const totalCount = courses.length;
  const overallPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const currentIdx = statuses.findIndex((s) => s === "current");
  const currentCourse = currentIdx >= 0 ? courses[currentIdx] : null;
  const remaining = currentCourse
    ? currentCourse.totalLessons - currentCourse.completedLessons
    : 0;
  const estDays = remaining > 0 ? Math.ceil(remaining / 2) : 0;

  return (
    <motion.section
      id="roadmap"
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
          style={{ top: "5%", left: "-10%", background: "rgba(108, 92, 231, 0.06)" }}
        />
      </div>

      <div className="w-full mx-auto relative z-10" style={{ maxWidth: "min(75%, 1000px)" }}>
        <h2 className="text-2xl font-bold mb-4">
          <AnimatedGradientText speed={1} colorFrom="#6C5CE7" colorTo="#00CEC9" className="text-2xl font-bold">
            Roadmap
          </AnimatedGradientText>
        </h2>

        {/* Journey overview */}
        <div className="mb-8 rounded-[14px] bg-aurora-bg-card border border-aurora-border-medium p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-aurora-text-primary">Progres total</span>
            <span className="text-sm font-bold text-aurora-primary-300">
              {completedCount}/{totalCount} cursuri
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-aurora-border-subtle overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-aurora-primary-500 to-aurora-accent-500"
              initial={{ width: 0 }}
              whileInView={{ width: `${overallPercent}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
            />
          </div>
          <p className="text-xs text-aurora-text-tertiary mt-2">
            {overallPercent}% din drumul tău spre Maestrul AI
          </p>
        </div>

        {/* Timeline */}
        <div className="relative space-y-3">
          <div
            className="absolute left-[19px] top-6 bottom-6 w-[2px] pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, rgba(108,92,231,0.4), rgba(0,206,201,0.25), rgba(108,92,231,0.05))",
            }}
            aria-hidden="true"
          />

          {courses.map((course, i) => {
            const status = statuses[i];
            const isClickable = status !== "locked";
            const percent =
              course.totalLessons > 0
                ? Math.round((course.completedLessons / course.totalLessons) * 100)
                : 0;
            const isCurrent = status === "current" && i === currentIdx;

            const cardContent = (
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="flex gap-4 items-start"
              >
                {/* Status dot */}
                <div className="shrink-0 mt-3 relative z-10">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full border-2 flex items-center justify-center",
                      status === "done"
                        ? "bg-aurora-accent-500 border-aurora-accent-500"
                        : status === "current"
                        ? "bg-aurora-primary-500 border-aurora-primary-500"
                        : "bg-aurora-bg-card border-aurora-border-subtle"
                    )}
                  >
                    {status === "done" ? (
                      <Check className="h-5 w-5 text-white" />
                    ) : status === "current" ? (
                      <div className="relative flex items-center justify-center">
                        <span
                          className="absolute h-3 w-3 rounded-full bg-white opacity-40"
                          style={{ animation: "pulse-glow 2s ease-in-out infinite" }}
                        />
                        <span className="h-2.5 w-2.5 rounded-full bg-white relative z-10" />
                      </div>
                    ) : (
                      <Lock className="h-4 w-4 text-aurora-text-tertiary" />
                    )}
                  </div>
                </div>

                {/* Card */}
                <div
                  className={cn(
                    "flex-1 rounded-[12px] p-4 transition-all duration-200",
                    status === "done"
                      ? "bg-aurora-bg-card border border-aurora-border-medium border-l-2 border-l-aurora-accent-500"
                      : status === "current"
                      ? "bg-aurora-bg-card border border-aurora-border-medium border-l-2 border-l-aurora-primary-500"
                      : "bg-aurora-bg-card border border-aurora-border-subtle opacity-50",
                    isClickable && "hover:border-aurora-border-strong cursor-pointer"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3
                        className={cn(
                          "text-sm font-semibold",
                          status === "locked" ? "text-aurora-text-tertiary" : "text-aurora-text-primary"
                        )}
                      >
                        {course.title}
                      </h3>
                      {status === "done" && (
                        <span className="text-[10px] font-medium text-aurora-accent-500 mt-0.5 inline-block">
                          ✓ Completat
                        </span>
                      )}
                      {status === "locked" && (
                        <span className="text-[10px] text-aurora-text-tertiary mt-0.5 inline-block">
                          Completează cursul anterior
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-aurora-gold-500 shrink-0">+ XP</span>
                  </div>

                  {status !== "locked" && (
                    <>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="h-1.5 flex-1 rounded-full bg-aurora-border-subtle overflow-hidden">
                          <motion.div
                            className={cn(
                              "h-full rounded-full",
                              status === "done" ? "bg-aurora-accent-500" : "bg-aurora-primary-500"
                            )}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${percent}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 + i * 0.05 }}
                          />
                        </div>
                        <span className="text-[10px] text-aurora-text-tertiary whitespace-nowrap">
                          {course.completedLessons}/{course.totalLessons} lecții
                        </span>
                      </div>
                      {isCurrent && estDays > 0 && (
                        <p className="text-[10px] text-aurora-text-tertiary flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          La 2 lecții/zi → gata în ~{estDays} zile
                        </p>
                      )}
                    </>
                  )}
                  {status === "locked" && (
                    <div className="flex items-center gap-1.5 text-[10px] text-aurora-text-tertiary">
                      <BookOpen className="h-3 w-3" />
                      {course.totalLessons} lecții
                    </div>
                  )}
                </div>
              </motion.div>
            );

            return isClickable ? (
              <Link key={i} href="/roadmap" className="block">
                {cardContent}
              </Link>
            ) : (
              <div key={i}>{cardContent}</div>
            );
          })}

          {/* Coming-soon teaser — neutral, no fake course names. The full
              curriculum will be announced after Block 2 research. */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: courses.length * 0.08, duration: 0.4 }}
            className="flex gap-4 items-start"
          >
            <div className="shrink-0 mt-3 relative z-10">
              <div className="h-10 w-10 rounded-full border-2 border-dashed border-aurora-border-subtle bg-aurora-bg-card flex items-center justify-center">
                <Hourglass className="h-4 w-4 text-aurora-text-tertiary" />
              </div>
            </div>

            <div className="flex-1 rounded-[12px] border-2 border-dashed border-aurora-border-subtle p-4">
              <p className="text-sm font-semibold text-aurora-text-secondary mb-1">
                Mai multe cursuri în curând
              </p>
              <p className="text-xs text-aurora-text-tertiary leading-relaxed">
                Curriculum-ul complet — de la matematică pentru AI până la transformere — este în dezvoltare.
              </p>
            </div>
          </motion.div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-2 text-sm font-medium text-aurora-text-secondary hover:text-aurora-primary-300 transition-colors"
          >
            <Zap className="h-4 w-4" />
            Vezi roadmap complet
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
