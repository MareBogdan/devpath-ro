// Node.js runtime required — uses fs module (not edge-compatible)
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

const COURSE_SLUG = "prompt-engineering-practic";
const CONTENT_DIR = path.join(
  process.cwd(),
  "content",
  "courses",
  "prompt-engineering-practic"
);

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface LessonFrontmatter {
  title: string;
  module: number;
  type: string;
  order: number;
  questions?: QuizQuestion[];
}

export async function POST(): Promise<NextResponse> {
  // Auth check — caller must be admin
  const authClient = createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();

  if (!user || authError) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await authClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Use admin client (service role) for all DB writes — bypasses RLS
  const supabase = createSupabaseAdminClient();

  // Get course
  const { data: course } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", COURSE_SLUG)
    .single();

  if (!course) {
    return NextResponse.json(
      {
        error: `Cursul '${COURSE_SLUG}' nu există în baza de date. Inserează cursul mai întâi cu SQL-ul furnizat.`,
      },
      { status: 400 }
    );
  }

  // Check content directory exists
  if (!fs.existsSync(CONTENT_DIR)) {
    return NextResponse.json(
      { error: `Directorul de conținut nu există: ${CONTENT_DIR}` },
      { status: 400 }
    );
  }

  // Read technical MDX files only (no -simple variants)
  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx") && !f.endsWith("-simple.mdx"))
    .sort();

  if (files.length === 0) {
    return NextResponse.json(
      { error: "Nu s-au găsit fișiere .mdx în directorul de conținut." },
      { status: 400 }
    );
  }

  let synced = 0;
  let quizzesSynced = 0;
  const errors: string[] = [];

  for (const file of files) {
    try {
      const filePath = path.join(CONTENT_DIR, file);
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(raw);
      const frontmatter = data as LessonFrontmatter;

      if (!frontmatter.title || !frontmatter.order || !frontmatter.type) {
        errors.push(`${file}: frontmatter incomplet (lipsă title/order/type)`);
        continue;
      }

      // Dual-mode retired: sync the standard content_md only.
      const lessonData = {
        course_id: course.id,
        title: frontmatter.title,
        content_md: content.trim(),
        type: frontmatter.type,
        order_index: frontmatter.order,
      };

      // Upsert by course_id + order_index
      const { data: existing } = await supabase
        .from("lessons")
        .select("id")
        .eq("course_id", course.id)
        .eq("order_index", frontmatter.order)
        .maybeSingle();

      let lessonId: string;

      if (existing) {
        await supabase.from("lessons").update(lessonData).eq("id", existing.id);
        lessonId = existing.id;
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from("lessons")
          .insert(lessonData)
          .select("id")
          .single();

        if (insertError || !inserted) {
          errors.push(`${file}: eroare la inserare — ${insertError?.message}`);
          continue;
        }
        lessonId = inserted.id;
      }

      // Handle quiz questions
      if (frontmatter.type === "quiz" && Array.isArray(frontmatter.questions)) {
        await supabase.from("quiz_questions").delete().eq("lesson_id", lessonId);

        const questionsToInsert = frontmatter.questions.map((q) => ({
          lesson_id: lessonId,
          question: q.question,
          options: q.options,
          correct_answer: q.correct,
          explanation: q.explanation,
        }));

        const { error: qError } = await supabase
          .from("quiz_questions")
          .insert(questionsToInsert);

        if (qError) {
          errors.push(`${file}: eroare la quiz_questions — ${qError.message}`);
        } else {
          quizzesSynced++;
        }
      }

      synced++;
    } catch (err) {
      errors.push(
        `${file}: ${err instanceof Error ? err.message : "eroare necunoscută"}`
      );
    }
  }

  revalidatePath("/courses", "layout");

  const summary = `Sincronizat ${synced}/${files.length} lecții${
    quizzesSynced > 0 ? `, ${quizzesSynced} quiz-uri` : ""
  }.`;
  const errorSummary =
    errors.length > 0 ? ` Erori: ${errors.join("; ")}` : "";

  return NextResponse.json({
    success: errors.length < files.length,
    message: summary + errorSummary,
    synced,
    total: files.length,
    errors,
  });
}
