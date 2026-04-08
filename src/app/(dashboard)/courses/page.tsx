import { createSupabaseServerClient } from "@/lib/supabase/server";
import { BookOpen, FlaskConical } from "lucide-react";
import { CourseCard } from "@/components/course/course-card";
import { SeedButton } from "@/components/course/seed-button";
import { SyncButton } from "@/components/course/sync-button";
import { ResetProgressButton } from "@/components/course/reset-progress-button";
import type { Course } from "@/types";

interface CourseWithProgress extends Course {
  completedLessons: number;
  totalLessons: number;
}

export default async function CoursesPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check admin role
  const { data: profile } = user
    ? await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single()
    : { data: null };

  const isAdmin = profile?.role === "admin";

  // Fetch all courses
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .order("order_index");

  // Fetch all lessons (for counts)
  const { data: allLessons } = await supabase
    .from("lessons")
    .select("id, course_id");

  // Fetch user progress
  const { data: progress } = user
    ? await supabase
        .from("user_progress")
        .select("lesson_id")
        .eq("user_id", user.id)
        .eq("completed", true)
    : { data: [] };

  const completedIds = new Set((progress ?? []).map((p) => p.lesson_id));

  const coursesWithProgress: CourseWithProgress[] = (courses ?? []).map(
    (course) => {
      const courseLessons = (allLessons ?? []).filter(
        (l) => l.course_id === course.id
      );
      return {
        ...course,
        completedLessons: courseLessons.filter((l) => completedIds.has(l.id))
          .length,
        totalLessons: courseLessons.length,
      };
    }
  );

  const isEmpty = coursesWithProgress.length === 0;

  return (
    <div className="p-6 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">Cursuri</h2>
          <p className="mt-1 text-muted-foreground">Alege un curs și începe să înveți</p>
        </div>

        {/* Empty state with seed button */}
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-6">
            <div className="p-5 rounded-2xl bg-muted">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Baza de date este goală
              </h3>
              <p className="text-muted-foreground max-w-md">Inserează date de test pentru a putea explora sistemul de cursuri.</p>
            </div>
            {isAdmin && (
              <SeedButton
                labels={{
                  seedButton: "Inserează date de test",
                  seeding: "Se inserează datele...",
                  seedSuccess: "Date inserate cu succes!",
                }}
              />
            )}
          </div>
        ) : (
          <>
            {/* Course grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {coursesWithProgress.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  completedLessons={course.completedLessons}
                  totalLessons={course.totalLessons}
                />
              ))}
            </div>

            {/* Dev options — admin only */}
            {isAdmin && (
              <div className="mt-12 pt-8 border-t border-border">
                <details className="group">
                  <summary className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground list-none">
                    <FlaskConical className="h-4 w-4" />
                    <span>Opțiuni development</span>
                  </summary>
                  <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border space-y-6">
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">
                        Sincronizare conținut MDX → Supabase
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Citește fișierele din{" "}
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          content/courses/ai-fundamentals/
                        </code>{" "}
                        și upsertează lecțiile în baza de date.
                      </p>
                      <SyncButton />
                    </div>
                    <div className="border-t border-border pt-4">
                      <p className="text-sm font-medium text-foreground mb-1">
                        Resetează progresul
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Șterge tot progresul tău din{" "}
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          user_progress
                        </code>{" "}
                        pentru a retesta fluxul de la 0%.
                      </p>
                      <ResetProgressButton />
                    </div>
                    <div className="border-t border-border pt-4">
                      <p className="text-sm font-medium text-foreground mb-1">
                        Seed date de test
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Inserează din nou datele de test (va returna eroare dacă
                        există deja).
                      </p>
                      <SeedButton
                        labels={{
                          seedButton: "Inserează date de test",
                          seeding: "Se inserează datele...",
                          seedSuccess: "Date inserate cu succes!",
                        }}
                      />
                    </div>
                  </div>
                </details>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
