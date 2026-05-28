import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { PageTransition } from "@/components/layout/page-transition";
import { ClientProviders } from "@/components/layout/client-providers";

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
    .select("name, plan, avatar_url, role, onboarding_completed, xp_points")
    .eq("id", user.id)
    .single();

  if (profile && !profile.onboarding_completed) {
    redirect("/onboarding");
  }

  const isAdmin = profile?.role === "admin";

  // Build nav user
  const navUser = {
    name: profile?.name ?? user.user_metadata?.name ?? null,
    email: user.email ?? "",
    avatar_url: profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null,
    plan: (profile?.plan ?? "free") as "free" | "pro" | "lifetime",
    isAdmin,
    xpPoints: (profile?.xp_points as number | null) ?? 0,
  };

  return (
    <ClientProviders>
      <div className="flex flex-col min-h-screen bg-aurora-bg-deepest">
        <Navbar user={navUser} />
        <main className="flex-1 overflow-y-auto">
          <PageTransition>{children}</PageTransition>
        </main>
        <BottomNav />
      </div>
    </ClientProviders>
  );
}
