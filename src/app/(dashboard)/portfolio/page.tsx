// src/app/(dashboard)/portfolio/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Briefcase, Star, Trophy, Heart, ExternalLink, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function PortfolioPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch user profile
  const { data: profile } = await supabase
    .from("users")
    .select("name, plan, xp_points, level, streak_count")
    .eq("id", user.id)
    .single();

  // Fetch completed progress
  const { data: progressData } = await supabase
    .from("user_progress")
    .select("lesson_id, completed_at, score")
    .eq("user_id", user.id)
    .eq("completed", true)
    .order("completed_at", { ascending: false });

  // Fetch all lessons for title resolution
  const { data: allLessons } = await supabase
    .from("lessons")
    .select("id, title, type, course_id");

  // Fetch all courses
  const { data: allCourses } = await supabase
    .from("courses")
    .select("id, slug, title");

  // Fetch projects
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, description, github_url, completed_at, course_id")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false });

  const completedCount = progressData?.length ?? 0;
  const displayName = profile?.name ?? user.email?.split("@")[0] ?? "Student";
  const username = user.email?.split("@")[0] ?? user.id.slice(0, 8);

  // Build completed courses (courses where ALL lessons are complete)
  const { data: allLessonsCount } = await supabase
    .from("lessons")
    .select("id, course_id");

  const completedIds = new Set((progressData ?? []).map((p) => p.lesson_id));
  const completedCourses = (allCourses ?? []).filter((course) => {
    const courseLessons = (allLessonsCount ?? []).filter(
      (l) => l.course_id === course.id
    );
    return courseLessons.length > 0 && courseLessons.every((l) => completedIds.has(l.id));
  });

  // Silence unused variable warning
  void allLessons;

  return (
    <div className="p-6 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Portofoliul tău</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Profilul tău public:</span>
            <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
              devpath.ro/u/{username}
            </code>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Portofoliu public complet</strong> — cu heatmap de activitate, Learning DNA radar și certificate
            vine în Phase 5. Deocamdată, această pagină îți arată progresul curent.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl bg-card border border-border p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{completedCourses.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Cursuri terminate</p>
          </div>
          <div className="rounded-xl bg-card border border-border p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{completedCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Lecții completate</p>
          </div>
          <div className="rounded-xl bg-card border border-border p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{profile?.xp_points ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">XP total</p>
          </div>
          <div className="rounded-xl bg-card border border-border p-4 text-center">
            <p className="text-2xl font-bold text-foreground">0</p>
            <p className="text-xs text-muted-foreground mt-1">Badge-uri</p>
          </div>
        </div>

        {/* Completed courses */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            Cursuri terminate
          </h3>
          {completedCourses.length === 0 ? (
            <div className="rounded-xl bg-card border border-border p-8 text-center">
              <Trophy className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Niciun curs terminat încă.</p>
              <Link
                href="/courses"
                className="mt-3 text-sm font-medium text-primary hover:underline inline-block"
              >
                Explorează cursurile
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {completedCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border"
                >
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{course.title}</p>
                  </div>
                  <Badge variant="default">Terminat</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Projects */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" />
            Proiectele tale
          </h3>
          {(projects ?? []).length === 0 ? (
            <div className="rounded-xl bg-card border border-border p-8 text-center">
              <Star className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Finalizează un curs pentru a trimite un proiect.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Proiectele apar automat în portofoliul tău public.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {projects?.map((project) => (
                <div key={project.id} className="p-4 rounded-xl bg-card border border-border">
                  <p className="font-medium text-foreground">{project.title}</p>
                  {project.description && (
                    <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                  )}
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1"
                    >
                      GitHub <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bookmarks */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" />
            Lecții salvate
          </h3>
          <div className="rounded-xl bg-card border border-border p-8 text-center">
            <Heart className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Apasă ♥ pe orice lecție pentru a o salva aici.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Funcția de bookmark vine în Phase 1.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
