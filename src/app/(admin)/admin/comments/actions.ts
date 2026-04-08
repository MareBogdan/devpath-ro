"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const idSchema = z.string().uuid();

async function checkAdmin(): Promise<{ error: string | null; userId: string | null }> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user || authError) return { error: "Unauthorized", userId: null };

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { error: "Forbidden", userId: null };
  return { error: null, userId: user.id };
}

export async function hideComment(id: string): Promise<{ error?: string }> {
  const { error: authError, userId } = await checkAdmin();
  if (authError || !userId) return { error: authError ?? "Unauthorized" };

  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { error: "Invalid ID" };

  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient
    .from("lesson_comments")
    .update({
      is_hidden: true,
      moderated_at: new Date().toISOString(),
      moderated_by: userId,
    })
    .eq("id", parsed.data);

  if (error) return { error: error.message };
  revalidatePath("/admin/comments");
  return {};
}

export async function unhideComment(id: string): Promise<{ error?: string }> {
  const { error: authError } = await checkAdmin();
  if (authError) return { error: authError };

  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { error: "Invalid ID" };

  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient
    .from("lesson_comments")
    .update({ is_hidden: false })
    .eq("id", parsed.data);

  if (error) return { error: error.message };
  revalidatePath("/admin/comments");
  return {};
}

export async function deleteComment(id: string): Promise<{ error?: string }> {
  const { error: authError } = await checkAdmin();
  if (authError) return { error: authError };

  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { error: "Invalid ID" };

  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient
    .from("lesson_comments")
    .delete()
    .eq("id", parsed.data);

  if (error) return { error: error.message };
  revalidatePath("/admin/comments");
  return {};
}
