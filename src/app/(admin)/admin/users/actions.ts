"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const toggleRoleSchema = z.object({
  userId: z.string().uuid(),
  newRole: z.enum(["student", "admin"]),
});

export async function toggleUserRole(
  userId: string,
  newRole: "student" | "admin"
): Promise<{ error?: string }> {
  // Auth check — caller must be admin
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user || authError) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { error: "Forbidden" };

  // Validate input
  const parsed = toggleRoleSchema.safeParse({ userId, newRole });
  if (!parsed.success) return { error: "Invalid input" };

  // Safety: prevent admin from accidentally demoting themselves
  if (parsed.data.userId === user.id && newRole === "student") {
    return { error: "Nu îți poți schimba propriul rol." };
  }

  // Update via admin client to bypass RLS
  const adminClient = createSupabaseAdminClient();
  const { error: updateError } = await adminClient
    .from("users")
    .update({ role: parsed.data.newRole })
    .eq("id", parsed.data.userId);

  if (updateError) return { error: updateError.message };

  revalidatePath("/admin/users");
  return {};
}
