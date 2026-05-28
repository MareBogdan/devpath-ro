"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Schema mirrors the DB constraint: daily_goal_minutes IN (0, 5, 15, 30)
const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(80),
  avatarUrl: z
    .string()
    .trim()
    .max(500)
    .url()
    .or(z.literal(""))
    .optional()
    .nullable(),
  dailyGoalMinutes: z.union([
    z.literal(0),
    z.literal(5),
    z.literal(15),
    z.literal(30),
  ]),
});

export interface UpdateProfileInput {
  name: string;
  avatarUrl: string | null;
  dailyGoalMinutes: 0 | 5 | 15 | 30;
}

export interface UpdateProfileResult {
  success: boolean;
  error?: string;
}

export async function updateProfile(
  input: UpdateProfileInput
): Promise<UpdateProfileResult> {
  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Date invalide. Verifică numele și URL-ul avatarului." };
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Neautentificat." };

  const { name, avatarUrl, dailyGoalMinutes } = parsed.data;

  const { error } = await supabase
    .from("users")
    .update({
      name: name,
      avatar_url: avatarUrl && avatarUrl.length > 0 ? avatarUrl : null,
      daily_goal_minutes: dailyGoalMinutes,
    })
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: true };
}
