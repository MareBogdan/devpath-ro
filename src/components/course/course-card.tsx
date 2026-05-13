"use client";

import Link from "next/link";
import { BookOpen, Lock, CheckCircle2, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Course } from "@/types";
import { CertificateDownloadButton } from "@/components/course/certificate-download-button";
import {
  getDifficultyColor,
  getDifficultyLabel,
  type DifficultyColor,
} from "@/lib/difficulty";

interface CourseCardProps {
  course: Course;
  completedLessons: number;
  totalLessons: number;
}

const difficultyStyles: Record<DifficultyColor, string> = {
  green:
    "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-900",
  yellow:
    "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-900",
  red:
    "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900",
};

const difficultyIconColor: Record<DifficultyColor, string> = {
  green: "bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400",
  yellow: "bg-yellow-100 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400",
  red: "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400",
};

export function CourseCard({
  course,
  completedLessons,
  totalLessons,
}: CourseCardProps) {
  const percent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const isCompleted = percent === 100;
  const isStarted = completedLessons > 0;
  const isLocked = !course.is_free;

  const ctaLabel = isLocked
    ? "Necesită Pro"
    : isCompleted
    ? "✓ Continuă"
    : isStarted
    ? "Continuă"
    : "Începe cursul";

  return (
    <div
      className={cn(
        "group flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-all duration-200",
        !isLocked && "hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5",
        isLocked && "opacity-75"
      )}
    >
      {/* Card header with gradient */}
      <div
        className={cn(
          "p-6 pb-4",
          isCompleted
            ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40"
            : "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              "p-3 rounded-xl",
              isCompleted
                ? "bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400"
                : difficultyIconColor[getDifficultyColor(course.difficulty)]
            )}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-6 w-6" />
            ) : isLocked ? (
              <Lock className="h-6 w-6" />
            ) : (
              <BookOpen className="h-6 w-6" />
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {course.is_free && (
              <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-950 border border-green-200 dark:border-green-900 rounded-full px-2.5 py-0.5">
                Gratuit
              </span>
            )}
            <span
              className={cn(
                "text-xs font-medium border rounded-full px-2.5 py-0.5",
                difficultyStyles[getDifficultyColor(course.difficulty)]
              )}
            >
              {getDifficultyLabel(course.difficulty)}
            </span>
          </div>
        </div>

        <h3 className="mt-4 text-lg font-bold text-foreground leading-snug">
          {course.title}
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
          {course.description}
        </p>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-6 pt-4 gap-4">
        {/* Progress */}
        <Tooltip
          content={
            isCompleted
              ? "Toate lecțiile completate!"
              : `${totalLessons - completedLessons} lecții rămase`
          }
        >
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>
                {completedLessons}/{totalLessons} lecții
              </span>
              <span className="font-medium text-foreground">{percent}%</span>
            </div>
            <Progress value={percent} className="h-1.5" />
          </div>
        </Tooltip>

        {/* CTA */}
        <div className="mt-auto flex flex-col gap-3">
          {isLocked ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium py-2">
              <Lock className="h-4 w-4" />
              {ctaLabel}
            </div>
          ) : (
            <Link
              href={`/courses/${course.slug}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition group-hover:gap-3"
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
          {isCompleted && (
            <CertificateDownloadButton courseSlug={course.slug} />
          )}
        </div>
      </div>
    </div>
  );
}
