import Link from "next/link";
import { BookOpen, CheckCircle2, Lock, ChevronRight, Trophy, UserCircle, BookMarked } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Course } from "@/types";
import {
  getDifficultyColor,
  getDifficultyLabel,
  type DifficultyColor,
} from "@/lib/difficulty";
interface CourseWithProgress extends Course {
  completedLessons: number;
  totalLessons: number;
}

interface SidebarProps {
  courses: CourseWithProgress[];
  totalCompleted: number;
  totalLessons: number;
}

const difficultyColor: Record<DifficultyColor, string> = {
  green:
    "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-900",
  yellow:
    "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-900",
  red:
    "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900",
};

export function Sidebar({
  courses,
  totalCompleted,
  totalLessons,
}: SidebarProps) {
  const overallPercent =
    totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-background flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Overall progress */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Progres general
          </p>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-foreground font-medium">{overallPercent}%</span>
            <span className="text-muted-foreground text-xs">
              {totalCompleted}/{totalLessons} lecții completate
            </span>
          </div>
          <Progress value={overallPercent} className="h-2" />
        </div>

        <Separator />

        {/* Navigation links */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Navigare
          </p>
          <Link
            href="/leaderboard"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Trophy className="h-4 w-4" />
            Clasament
          </Link>
          <Link
            href="/profile"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <UserCircle className="h-4 w-4" />
            Profilul meu
          </Link>
          <Link
            href="/glossar"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <BookMarked className="h-4 w-4" />
            Glosar
          </Link>
        </div>

        <Separator />

        {/* Courses list */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Cursurile mele
          </p>

          {courses.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <BookOpen className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Niciun curs disponibil momentan.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {courses.map((course) => {
                const percent =
                  course.totalLessons > 0
                    ? Math.round(
                        (course.completedLessons / course.totalLessons) * 100
                      )
                    : 0;
                const isCompleted = percent === 100;
                const isLocked = !course.is_free;

                return (
                  <Link
                    key={course.id}
                    href={isLocked ? "#" : `/courses/${course.slug}`}
                    onClick={isLocked ? (e) => e.preventDefault() : undefined}
                    className={cn(
                      "group flex flex-col gap-2 rounded-lg border p-3 transition-all",
                      isLocked
                        ? "cursor-not-allowed opacity-60 border-border"
                        : "border-border hover:border-primary/30 hover:bg-accent"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          {isCompleted ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                          ) : isLocked ? (
                            <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          ) : null}
                          <span className="text-sm font-medium text-foreground truncate leading-tight">
                            {course.title}
                          </span>
                        </div>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                            difficultyColor[getDifficultyColor(course.difficulty)]
                          )}
                        >
                          {getDifficultyLabel(course.difficulty)}
                        </span>
                      </div>
                      {!isLocked && (
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 group-hover:text-foreground transition-colors" />
                      )}
                    </div>

                    {/* Course progress */}
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{percent}% progres</span>
                        <span>{course.completedLessons}/{course.totalLessons}</span>
                      </div>
                      <Progress value={percent} className="h-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
