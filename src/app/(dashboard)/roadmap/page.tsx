// src/app/(dashboard)/roadmap/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Map, BookOpen, PlayCircle, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function RoadmapPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch user profile for daily goal
  const { data: profile } = await supabase
    .from("users")
    .select("name, daily_goal_minutes, level, xp_points")
    .eq("id", user.id)
    .single();

  // Fetch all courses
  const { data: allCourses } = await supabase
    .from("courses")
    .select("id, slug, title, description, difficulty")
    .order("order_index");

  // Fetch all lessons (for counting)
  const { data: allLessons } = await supabase
    .from("lessons")
    .select("id, course_id, order_index, title, type")
    .order("order_index");

  // Fetch completed progress
  const { data: progressData } = await supabase
    .from("user_progress")
    .select("lesson_id, completed_at")
    .eq("user_id", user.id)
    .eq("completed", true);

  const completedIds = new Set((progressData ?? []).map((p) => p.lesson_id));
  const dailyGoal = profile?.daily_goal_minutes ?? 15;

  // Per-course stats
  const courseStats = (allCourses ?? []).map((course) => {
    const courseLessons = (allLessons ?? []).filter(
      (l) => l.course_id === course.id
    );
    const completed = courseLessons.filter((l) => completedIds.has(l.id)).length;
    const total = courseLessons.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const remaining = total - completed;
    // Estimate: avg lesson ~10 min for simple mode
    const daysRemaining =
      dailyGoal > 0 ? Math.ceil((remaining * 10) / dailyGoal) : null;
    const nextLesson = courseLessons.find((l) => !completedIds.has(l.id));
    return { ...course, completed, total, percent, remaining, daysRemaining, nextLesson };
  });

  const activeCourse = courseStats.find((c) => c.percent > 0 && c.percent < 100) ?? courseStats[0];

  return (
    <div className="p-6 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Map className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Drumul tău de învățare</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Progresul tău prin toate cursurile DevPath RO
            </p>
          </div>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Roadmap personalizat complet</strong> — disponibil după completarea onboarding-ului (Phase 2).
            Acesta va include recomandări AI bazate pe profilul tău, obiective zilnice și o hartă vizuală a progresului.
          </p>
        </div>

        {/* Current course card */}
        {activeCourse && (
          <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                  Curs curent
                </p>
                <h2 className="text-xl font-bold text-foreground">{activeCourse.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{activeCourse.description}</p>
              </div>
              <Badge variant="outline">{activeCourse.difficulty}</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {activeCourse.completed} din {activeCourse.total} lecții completate
                </span>
                <span className="font-semibold text-foreground">{activeCourse.percent}%</span>
              </div>
              <Progress value={activeCourse.percent} className="h-2" />
            </div>
            {activeCourse.daysRemaining !== null && activeCourse.remaining > 0 && (
              <p className="text-sm text-muted-foreground">
                La ritmul actual de <strong>{dailyGoal} minute/zi</strong>, termini în aproximativ{" "}
                <strong>{activeCourse.daysRemaining} zile</strong>.
              </p>
            )}
            {activeCourse.nextLesson && (
              <Link
                href={`/courses/${activeCourse.slug}/${activeCourse.nextLesson.id}`}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-5 py-2.5 rounded-lg transition"
              >
                <PlayCircle className="h-4 w-4" />
                Continuă: {activeCourse.nextLesson.title}
              </Link>
            )}
          </div>
        )}

        {/* All courses timeline */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Parcursul complet</h3>
          <div className="space-y-3">
            {courseStats.map((course, idx) => (
              <div
                key={course.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground text-sm font-bold shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-foreground truncate">{course.title}</p>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {course.completed}/{course.total} lecții
                    </span>
                  </div>
                  <Progress value={course.percent} className="h-1 mt-2" />
                </div>
                {course.percent === 100 && (
                  <Badge variant="default" className="shrink-0">Terminat</Badge>
                )}
                {course.percent === 0 && idx > 0 && (
                  <Badge variant="secondary" className="shrink-0">Urmează</Badge>
                )}
              </div>
            ))}
            {/* Upcoming courses placeholder */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-dashed border-border opacity-60">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground text-sm font-bold shrink-0">
                <BookOpen className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-muted-foreground">Mai multe cursuri în curând...</p>
                <p className="text-xs text-muted-foreground mt-0.5">ML Practic, Computer Vision, NLP cu Transformers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
