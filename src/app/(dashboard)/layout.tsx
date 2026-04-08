import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { PageTransition } from "@/components/layout/page-transition";
import { ClientProviders } from "@/components/layout/client-providers";
import type { Course } from "@/types";

interface CourseWithProgress extends Course {
  completedLessons: number;
  totalLessons: number;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get user profile — include role for RBAC and onboarding state
  const { data: profile } = await supabase
    .from("users")
    .select("name, plan, avatar_url, role, onboarding_completed")
    .eq("id", user.id)
    .single();

  if (profile && !profile.onboarding_completed) {
    redirect("/onboarding");
  }

  // Get courses with lesson counts
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .order("order_index");

  // Get user's completed lessons for each course
  const { data: progressData } = await supabase
    .from("user_progress")
    .select("lesson_id, completed")
    .eq("user_id", user.id)
    .eq("completed", true);

  // Get total lesson count per course
  const { data: lessonCounts } = await supabase
    .from("lessons")
    .select("id, course_id");

  // Build sidebar courses with progress
  const completedLessonIds = new Set(
    (progressData ?? []).map((p) => p.lesson_id)
  );

  const coursesWithProgress: CourseWithProgress[] = (courses ?? []).map(
    (course) => {
      const courseLessons = (lessonCounts ?? []).filter(
        (l) => l.course_id === course.id
      );
      const completed = courseLessons.filter((l) =>
        completedLessonIds.has(l.id)
      ).length;
      return {
        ...course,
        completedLessons: completed,
        totalLessons: courseLessons.length,
      };
    }
  );

  const totalLessons = (lessonCounts ?? []).length;
  const totalCompleted = completedLessonIds.size;

  const isAdmin = profile?.role === "admin";

  // Build nav user
  const navUser = {
    name: profile?.name ?? user.user_metadata?.name ?? null,
    email: user.email ?? "",
    avatar_url: profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null,
    plan: (profile?.plan ?? "free") as "free" | "pro" | "lifetime",
    isAdmin,
  };

  return (
    <ClientProviders>
      <div className="flex flex-col h-screen overflow-hidden">
        <Navbar user={navUser} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            courses={coursesWithProgress}
            totalCompleted={totalCompleted}
            totalLessons={totalLessons}
          />
          <main className="flex-1 min-w-0 overflow-y-auto bg-muted/30">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
    </ClientProviders>
  );
}
