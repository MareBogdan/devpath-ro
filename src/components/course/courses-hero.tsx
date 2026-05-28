"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Check } from "lucide-react";
import { COURSE_PALETTE } from "@/lib/course-map";

// Curriculum constants — the full DevPath RO roadmap (see CURRICULUM-STRUCTURE.md).
// These describe the complete 12-course vision, independent of how many courses
// happen to be seeded in the DB right now.
const TOTAL_LESSONS = 321;
const TOTAL_COURSES = 12;

const STAT_PILLS: { icon: string; label: string }[] = [
  { icon: "🎓", label: "12 cursuri" },
  { icon: "📚", label: "321 lecții" },
  { icon: "⚡", label: "~60h de conținut" },
  { icon: "🏆", label: "12 Boss Fights" },
];

type CourseState = "completed" | "started" | "locked";

interface CoursesHeroProps {
  /** Real completed-lesson count across every course. */
  completedCount: number;
  /** Per-course state, in course order. Fewer than 12 → remaining badges locked. */
  courseStates: CourseState[];
  continueLessonHref: string | null;
  continueLessonTitle: string | null;
}

// Shared staggered fade-up entrance.
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** A title word painted with the animated violet→teal→gold gradient. */
function GradientWord({ children }: { children: ReactNode }) {
  return (
    <span
      className="animate-gradient bg-clip-text text-transparent"
      style={{
        // Start color repeated at the end so the scroll loop is seamless.
        backgroundImage: "linear-gradient(90deg,#6C5CE7,#00CEC9,#FDCB6E,#6C5CE7)",
        backgroundSize: "300% 100%",
      }}
    >
      {children}
    </span>
  );
}

/**
 * Motivational hero for the courses page — communicates the full roadmap
 * (12 courses · 321 lessons · one path). Replaces the old mission header; the
 * XP/Level/Streak/Lessons stat cards now live only on the Profile page.
 */
export function CoursesHero({
  completedCount,
  courseStates,
  continueLessonHref,
  continueLessonTitle,
}: CoursesHeroProps) {
  const pct = Math.min(100, Math.round((completedCount / TOTAL_LESSONS) * 100));

  return (
    <section className="relative overflow-hidden">
      {/* 8 — Background atmosphere — dark mode only, never affects light mode */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden dark:block"
      >
        <div className="absolute -left-24 -top-28 h-80 w-80 rounded-full bg-[#6C5CE7] opacity-[0.16] blur-[110px]" />
        <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-[#00CEC9] opacity-[0.16] blur-[110px]" />
        <div className="absolute -bottom-32 right-8 h-80 w-80 rounded-full bg-[#FDCB6E] opacity-[0.15] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-2 pt-10 sm:px-6 lg:px-8">
        {/* 1 — Eyebrow */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0, ease: EASE }}
          className="flex items-center gap-2"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00CEC9] opacity-75 motion-reduce:hidden" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00CEC9]" />
          </span>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#00CEC9]">
            Roadmap complet DevPath RO
          </span>
        </motion.div>

        {/* 2 — Title */}
        <motion.h1
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
          className="mt-4 text-balance text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl"
        >
          De la <GradientWord>electron</GradientWord> la{" "}
          <GradientWord>agenți autonomi</GradientWord>.
        </motion.h1>

        {/* 3 — Subtitle */}
        <motion.p
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
          className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base"
        >
          Un singur drum. Tot ce trebuie să știi ca inginer AI în 2026.
        </motion.p>

        {/* 4 — Stats pills + compact "Continuă" banner on the right */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
            className="flex flex-wrap gap-2"
          >
            {STAT_PILLS.map((pill) => (
              <span
                key={pill.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-foreground sm:text-sm"
              >
                <span aria-hidden>{pill.icon}</span>
                {pill.label}
              </span>
            ))}
          </motion.div>

          {continueLessonHref && continueLessonTitle && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.65 }}
              className="w-[320px] max-w-full shrink-0"
            >
              <a
                href={continueLessonHref}
                className="group flex w-full items-center gap-3 rounded-2xl border border-aurora-primary-500/30 bg-gradient-to-r from-aurora-primary-500/10 to-aurora-accent-500/10 px-4 py-2.5 transition-colors hover:from-aurora-primary-500/15 hover:to-aurora-accent-500/15"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-aurora-primary-500/15">
                  <BookOpen className="h-5 w-5 text-aurora-primary-500" />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Continuă de unde ai rămas
                  </p>
                  <p className="truncate text-sm font-semibold text-foreground">
                    {continueLessonTitle}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-aurora-primary-500 transition-transform group-hover:translate-x-0.5" />
              </a>
            </motion.div>
          )}
        </div>

        {/* 5 — Global progress bar */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.4, ease: EASE }}
          className="mt-6 max-w-xl"
        >
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">Progresul tău</span>
            <span className="font-semibold tabular-nums text-foreground">
              {completedCount} / {TOTAL_LESSONS} lecții
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg,#6C5CE7,#00CEC9)" }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, delay: 0.6, ease: EASE }}
            />
          </div>
        </motion.div>

        {/* 6 — Course badges — one circle per course in the spectral palette */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.5, ease: EASE }}
          className="mt-5 flex flex-wrap items-center gap-2"
          aria-label="Progres pe cursuri"
        >
          {Array.from({ length: TOTAL_COURSES }, (_, i) => {
            const state: CourseState = courseStates[i] ?? "locked";
            return (
              <div
                key={i}
                title={`Cursul ${i + 1}`}
                className="flex h-7 w-7 items-center justify-center rounded-full ring-1 ring-inset ring-white/15"
                style={{
                  background: COURSE_PALETTE[i],
                  opacity: state === "locked" ? 0.4 : 1,
                }}
              >
                {state === "completed" && (
                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                )}
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
