"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, BookOpen } from "lucide-react";
import { MeshGradientCard, slugToGradientColors } from "@/components/ui/mesh-gradient-card";
import { AnimatedProgressRing } from "@/components/ui/animated-progress-ring";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import { cn } from "@/lib/utils";

export interface CourseSelectorOption {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: number;
  totalLessons: number;
  completedLessons: number;
}

interface CourseSelectorProps {
  courses: CourseSelectorOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function CourseSelector({ courses, selectedId, onSelect }: CourseSelectorProps) {
  if (courses.length === 0) return null;

  return (
    <div
      className={cn(
        "grid gap-4",
        courses.length === 1
          ? "grid-cols-1 max-w-xl mx-auto"
          : "grid-cols-1 md:grid-cols-2"
      )}
    >
      {courses.map((course) => {
        const isActive = course.id === selectedId;
        const percent =
          course.totalLessons > 0
            ? Math.round((course.completedLessons / course.totalLessons) * 100)
            : 0;
        const isComplete = percent === 100;
        const colors = slugToGradientColors(course.slug);
        const accent = colors[0]; // primary gradient color drives the glow

        return (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            whileHover={
              isActive
                ? { y: -3, transition: { duration: 0.18 } }
                : { y: -4, scale: 1.02, transition: { duration: 0.18 } }
            }
            whileTap={!isActive ? { scale: 0.99 } : undefined}
            className={cn(
              "transition-opacity",
              !isActive && "opacity-80 hover:opacity-100"
            )}
            style={
              {
                // Per-card accent CSS var so the glow inherits the gradient color
                "--course-accent": accent,
              } as React.CSSProperties
            }
          >
            <MeshGradientCard
              colors={colors}
              intensity={isActive ? 0.22 : 0.12}
              interactive={!isActive}
              onClick={() => !isActive && onSelect(course.id)}
              className={cn(
                "cursor-pointer p-5 sm:p-6 transition-all duration-200",
                // Active state — strong outline + permanent glow in course accent
                isActive
                  ? [
                      "outline outline-2 outline-offset-2",
                      "outline-[var(--course-accent)]",
                      "shadow-[0_8px_32px_-8px_var(--course-accent)]",
                    ]
                  : [
                      // Inactive: subtle border, deepen on hover with course-colored glow
                      "ring-1 ring-border",
                      "hover:outline hover:outline-2 hover:outline-offset-2",
                      "hover:outline-[var(--course-accent)]",
                      "hover:shadow-[0_12px_36px_-8px_var(--course-accent)]",
                    ]
              )}
            >
              <div className="flex items-start gap-4">
                {/* Progress ring */}
                <div className="shrink-0 relative">
                  <AnimatedProgressRing
                    value={percent}
                    size={64}
                    strokeWidth={5}
                    color={isComplete ? "success" : "primary"}
                    showLabel
                    labelContent={
                      isComplete ? (
                        <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                      ) : (
                        <div className="text-sm font-bold text-foreground tabular-nums">
                          {percent}%
                        </div>
                      )
                    }
                  />
                </div>

                {/* Title + meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <DifficultyBadge level={course.difficulty} />
                    {isActive && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-aurora-primary-400">
                        <Sparkles className="h-3 w-3" />
                        Activ
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-foreground leading-tight mb-1 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {course.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {course.completedLessons}/{course.totalLessons} lecții
                    </span>
                  </div>
                </div>
              </div>
            </MeshGradientCard>
          </motion.div>
        );
      })}
    </div>
  );
}
