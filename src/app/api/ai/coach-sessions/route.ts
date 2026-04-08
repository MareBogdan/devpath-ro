// src/app/api/ai/coach-sessions/route.ts
// GET — return last N session summaries for the current user as a single context string
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "edge";

export async function GET(req: Request) {
  // Auth first
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "3", 10), 5);

  const { data, error } = await supabase
    .from("ai_coach_sessions")
    .select("summary, ended_at")
    .eq("user_id", user.id)
    .order("ended_at", { ascending: false })
    .limit(limit);

  if (error) {
    return Response.json({ context: "" });
  }

  // Build a single string for injection into the system prompt
  const context = (data ?? [])
    .map(
      (s) =>
        `[${new Date(s.ended_at).toLocaleDateString("ro-RO")}] ${s.summary}`
    )
    .join("\n");

  return Response.json({ context });
}
