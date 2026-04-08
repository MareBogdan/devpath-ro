import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "edge";

const querySchema = z.object({
  q: z.string().min(2).max(100),
});

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Auth guard
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Neautentificat" }, { status: 401 });
  }

  // Validate query param
  const { searchParams } = new URL(req.url);
  const parsed = querySchema.safeParse({ q: searchParams.get("q") ?? "" });
  if (!parsed.success) {
    return NextResponse.json({ error: "Minim 2 caractere" }, { status: 400 });
  }

  const { q } = parsed.data;

  // Search lessons via full-text on search_vector
  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, title, type, order_index, courses(slug, title)")
    .textSearch("search_vector", q, { type: "websearch", config: "simple" })
    .limit(8);

  // Search courses via full-text on search_vector
  const { data: courses } = await supabase
    .from("courses")
    .select("id, slug, title, description")
    .textSearch("search_vector", q, { type: "websearch", config: "simple" })
    .limit(4);

  return NextResponse.json({
    lessons: lessons ?? [],
    courses: courses ?? [],
  });
}
