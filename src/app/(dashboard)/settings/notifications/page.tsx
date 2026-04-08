import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NotificationPreferences } from "@/components/settings/notification-preferences";
import { Bell } from "lucide-react";

export default async function NotificationsSettingsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: prefs } = await supabase
    .from("notification_preferences")
    .select(
      "email_weekly_progress, email_streak_lost, email_course_complete, push_enabled"
    )
    .eq("user_id", user.id)
    .single();

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-lg bg-primary/10">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notificări</h1>
          <p className="text-sm text-muted-foreground">
            Controlează cum și când primești notificări de la DevPath RO
          </p>
        </div>
      </div>

      <NotificationPreferences
        emailWeeklyProgress={prefs?.email_weekly_progress ?? true}
        emailStreakLost={prefs?.email_streak_lost ?? true}
        pushEnabled={prefs?.push_enabled ?? false}
      />
    </div>
  );
}
