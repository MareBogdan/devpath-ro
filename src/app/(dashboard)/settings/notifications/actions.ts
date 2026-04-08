"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const fieldSchema = z.enum([
  "email_weekly_progress",
  "email_streak_lost",
  "email_course_complete",
  "push_enabled",
]);

export async function updateNotificationPreference(
  field: z.infer<typeof fieldSchema>,
  value: boolean
): Promise<{ error?: string }> {
  const parsedField = fieldSchema.safeParse(field);
  if (!parsedField.success) return { error: "Câmp invalid" };

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Neautorizat" };

  const { error } = await supabase
    .from("notification_preferences")
    .upsert(
      { user_id: user.id, [parsedField.data]: value },
      { onConflict: "user_id" }
    );

  if (error) return { error: error.message };
  return {};
}
