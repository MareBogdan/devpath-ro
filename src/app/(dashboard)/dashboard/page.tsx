import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  BookOpen,
  Trophy,
  Flame,
  ArrowRight,
  CheckCircle2,
  PlayCircle,
  FileText,
  HelpCircle,
  Wrench,
  FolderOpen,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProgressRing } from "@/components/ui/progress-ring";
import Link from "next/link";
import { AbsenceMascot } from "@/components/dashboard/absence-mascot";
const lessonTypeIcon: Record<string, React.ElementType> = {
  theory: FileText,
  quiz: HelpCircle,
  exercise: Wrench,
  project: FolderOpen,
};

function getTimeGreeting(): string {
  // UTC hour — Romanian users are UTC+2/3, so shift by 2
  const hour = (new Date().getUTCHours() + 2) % 24;
  if (hour >= 5 && hour < 12) return "Bună dimineața";
  if (hour >= 12 && hour < 18) return "Bună ziua";
  if (hour >= 18 && hour < 22) return "Bună seara";
  return "Bună noaptea";
}

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 2) return "acum";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}z`;
  return new Date(dateStr).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "short",
  });
}

const planBadgeVariant: Record<string, "secondary" | "default" | "success"> = {
  free: "secondary",
  pro: "default",
  lifetime: "success",
};

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch user profile
  const { data: profile } = await supabase
    .from("users")
    .select("name, plan, streak_count, last_active")
    .eq("id", user.id)
    .single();

  const displayName =
    profile?.name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "Student";

  const plan = (profile?.plan ?? "free") as "free" | "pro" | "lifetime";

  // Fetch completed progress (with timestamps, sorted newest first)
  const { data: completedProgress } = await supabase
    .from("user_progress")
    .select("lesson_id, completed_at")
    .eq("user_id", user.id)
    .eq("completed", true)
    .order("completed_at", { ascending: false });

  // Fetch all lessons (for finding next lesson + total count)
  const { data: allLessons } = await supabase
    .from("lessons")
    .select("id, title, type, course_id, order_index")
    .order("order_index");

  // Fetch all courses (for resolving course info)
  const { data: allCourses } = await supabase
    .from("courses")
    .select("id, slug, title")
    .order("order_index");

  // Compute stats
  const completedIds = new Set(
    (completedProgress ?? []).map((p) => p.lesson_id)
  );
  const completedCount = completedIds.size;
  const totalLessons = allLessons?.length ?? 0;
  const overallPercent =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Next lesson to continue
  const nextLesson = (allLessons ?? []).find((l) => !completedIds.has(l.id));
  const nextLessonCourse = nextLesson
    ? (allCourses ?? []).find((c) => c.id === nextLesson.course_id)
    : null;

  // Recent activity (last 5 completed lessons)
  const recentActivity = (completedProgress ?? [])
    .slice(0, 5)
    .map((p) => {
      const lesson = (allLessons ?? []).find((l) => l.id === p.lesson_id);
      return lesson ? { ...p, lesson } : null;
    })
    .filter(Boolean) as Array<{
    lesson_id: string;
    completed_at: string | null;
    lesson: { id: string; title: string; type: string; course_id: string; order_index: number };
  }>;

  const greeting = getTimeGreeting();

  // Absence mascot data
  const lastActive = profile?.last_active ? new Date(profile.last_active) : null;
  const daysAbsent = lastActive
    ? Math.floor((Date.now() - lastActive.getTime()) / 86_400_000)
    : 0;
  const lastActivityLesson = recentActivity[0] ?? null;
  const lastLessonCourse = lastActivityLesson
    ? (allCourses ?? []).find((c) => c.id === lastActivityLesson.lesson.course_id)
    : null;
  const lastLessonHref = lastActivityLesson && lastLessonCourse
    ? `/courses/${lastLessonCourse.slug}/${lastActivityLesson.lesson_id}`
    : null;

  return (
    <div className="p-6 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Absence mascot (shows if >= 3 days absent) */}
        <AbsenceMascot
          daysAbsent={daysAbsent}
          lastLessonTitle={lastActivityLesson?.lesson.title ?? null}
          lastLessonHref={lastLessonHref}
        />

        {/* Hero greeting */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              {greeting}, {displayName}!
            </h2>
            <p className="mt-1 text-muted-foreground">
              {completedCount === 0
                ? "Începe prima ta lecție și descoperă lumea AI."
                : completedCount < 5
                ? "Faci progres grozav — continuă tot așa!"
                : "Ești pe calea cea bună spre expertiza AI!"}
            </p>
          </div>
          <Badge variant={planBadgeVariant[plan]} className="shrink-0 mt-1">
            {{ free: "Gratuit", pro: "Pro", lifetime: "Lifetime" }[plan] ?? plan}
          </Badge>
        </div>

        {/* Stats row — 4 cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Completed lessons */}
          <div className="rounded-xl bg-card border border-border p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400">
                <Trophy className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Lecții parcurse
              </span>
            </div>
            <p className="text-3xl font-bold text-foreground">{completedCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              din {totalLessons} totale
            </p>
          </div>

          {/* Overall progress with ring */}
          <div className="rounded-xl bg-card border border-border p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <TrendingUp className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Progres general
              </span>
            </div>
            <div className="flex items-center gap-3">
              <ProgressRing value={overallPercent} size={48} strokeWidth={5} />
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {overallPercent}
                  <span className="text-lg font-normal text-muted-foreground">%</span>
                </p>
              </div>
            </div>
          </div>

          {/* Streak (stubbed) */}
          <div className="rounded-xl bg-card border border-border p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400">
                <Flame className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Streak
              </span>
            </div>
            <p className="text-3xl font-bold text-foreground">{profile?.streak_count ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-0.5">zile consecutive</p>
          </div>

          {/* Courses enrolled */}
          <div className="rounded-xl bg-card border border-border p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Cursuri înscrise
              </span>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {(allCourses ?? []).length}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">disponibile</p>
          </div>
        </div>

        {/* Continue learning card */}
        {nextLesson && nextLessonCourse && (
          <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-blue-50 dark:from-primary/10 dark:to-blue-950/20 border border-primary/20 p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
              Continuă să înveți
            </p>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">
                  {nextLessonCourse.title}
                </p>
                <h3 className="text-xl font-bold text-foreground leading-tight">
                  {nextLesson.title}
                </h3>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Lecția {nextLesson.order_index}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <div className="flex items-center gap-1">
                    {(() => {
                      const Icon = lessonTypeIcon[nextLesson.type] ?? FileText;
                      return <Icon className="h-3.5 w-3.5 text-muted-foreground" />;
                    })()}
                    <span className="text-xs text-muted-foreground capitalize">
                      {nextLesson.type}
                    </span>
                  </div>
                </div>
                {/* Mini progress bar */}
                <div className="mt-3 flex items-center gap-2">
                  <Progress value={overallPercent} className="h-1.5 flex-1 max-w-48" />
                  <span className="text-xs text-muted-foreground">{overallPercent}%</span>
                </div>
              </div>
              <Link
                href={`/courses/${nextLessonCourse.slug}/${nextLesson.id}`}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-2.5 rounded-lg transition shrink-0"
              >
                <PlayCircle className="h-4 w-4" />
                Continuă
              </Link>
            </div>
          </div>
        )}

        {/* No lessons started yet */}
        {!nextLesson && completedCount === totalLessons && totalLessons > 0 && (
          <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 p-6 text-center">
            <Trophy className="h-10 w-10 text-green-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-foreground mb-1">
              Felicitări! Ai terminat toate lecțiile! 🎉
            </h3>
            <p className="text-muted-foreground">
              Ai parcurs întreg cursul. Urmărește noutățile pentru module noi.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent activity */}
          <div className="rounded-xl bg-card border border-border p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Activitate recentă
            </h3>
            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BookOpen className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nu ai completat nicio lecție încă.
                </p>
                <Link
                  href="/courses"
                  className="mt-3 text-sm font-medium text-primary hover:underline"
                >
                  Explorează cursurile →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((item) => {
                  const Icon = lessonTypeIcon[item.lesson.type] ?? FileText;
                  const course = (allCourses ?? []).find(
                    (c) => c.id === item.lesson.course_id
                  );
                  return (
                    <div
                      key={item.lesson_id}
                      className="flex items-center gap-3 group"
                    >
                      <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={
                            course
                              ? `/courses/${course.slug}/${item.lesson_id}`
                              : "#"
                          }
                          className="text-sm font-medium text-foreground truncate hover:text-primary transition block"
                        >
                          {item.lesson.title}
                        </Link>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Icon className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground capitalize">
                            {item.lesson.type}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {relativeTime(item.completed_at)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* CTA card */}
          <div className="rounded-xl bg-gradient-to-br from-primary to-blue-700 p-6 text-primary-foreground flex flex-col">
            <h3 className="text-lg font-bold mb-2">Începe primul curs</h3>
            <p className="text-primary-foreground/80 mb-5 flex-1 text-sm leading-relaxed">
              Cursul &quot;AI Fundamentals&quot; te așteaptă — 30 de lecții interactive despre inteligența artificială.
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-5 py-2.5 rounded-lg hover:bg-white/90 transition w-fit"
            >
              Explorează cursuri
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
