"use server";

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

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

export async function syncContent(): Promise<{ success: boolean; message: string }> {
  // Verify user is authenticated
  const authClient = createSupabaseServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) return { success: false, message: "Neautentificat." };

  // Admin-only action
  const { data: profile } = await authClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { success: false, message: "Acces interzis. Doar adminii pot sincroniza conținut." };
  }

  // Use admin client (service role) for all DB writes — bypasses RLS
  const supabase = createSupabaseAdminClient();

  // Get the course
  const { data: course } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", "ai-fundamentals")
    .single();

  if (!course) {
    return {
      success: false,
      message: "Cursul 'ai-fundamentals' nu există în baza de date. Inserează cursul mai întâi.",
    };
  }

  // Read MDX files
  const contentDir = path.join(process.cwd(), "content", "courses", "ai-fundamentals");

  if (!fs.existsSync(contentDir)) {
    return { success: false, message: `Directorul de conținut nu există: ${contentDir}` };
  }

  const files = fs
    .readdirSync(contentDir)
    .filter((f) => f.endsWith(".mdx") && !f.endsWith("-simple.mdx"))
    .sort(); // alphabetical = lesson-01, lesson-02, ...

  if (files.length === 0) {
    return { success: false, message: "Nu s-au găsit fișiere .mdx în directorul de conținut." };
  }

  let synced = 0;
  let quizzesSynced = 0;
  const errors: string[] = [];

  for (const file of files) {
    try {
      const filePath = path.join(contentDir, file);
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(raw);
      const frontmatter = data as LessonFrontmatter;

      if (!frontmatter.title || !frontmatter.order || !frontmatter.type) {
        errors.push(`${file}: frontmatter incomplet (lipsă title/order/type)`);
        continue;
      }

      // Look for simple mode variant: lesson-XX-slug-simple.mdx
      const simpleFile = file.replace(/\.mdx$/, "-simple.mdx");
      const simplePath = path.join(contentDir, simpleFile);
      let simpleContent: string | null = null;
      try {
        const rawSimple = fs.readFileSync(simplePath, "utf-8");
        simpleContent = matter(rawSimple).content.trim();
      } catch {
        // No simple version exists — content_simple_md stays null
      }

      const lessonData = {
        course_id: course.id,
        title: frontmatter.title,
        content_md: content.trim(),
        content_simple_md: simpleContent,
        type: frontmatter.type,
        order_index: frontmatter.order,
      };

      // Check if lesson with this order_index already exists
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
        const { data: inserted, error } = await supabase
          .from("lessons")
          .insert(lessonData)
          .select("id")
          .single();
        if (error || !inserted) {
          errors.push(`${file}: eroare la inserare — ${error?.message}`);
          continue;
        }
        lessonId = inserted.id;
      }

      // Handle quiz questions
      if (frontmatter.type === "quiz" && Array.isArray(frontmatter.questions)) {
        // Delete existing questions for this lesson
        await supabase.from("quiz_questions").delete().eq("lesson_id", lessonId);

        // Insert new questions
        const questionsToInsert = frontmatter.questions.map((q) => ({
          lesson_id: lessonId,
          question: q.question,
          options: q.options, // jsonb column
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
      errors.push(`${file}: ${err instanceof Error ? err.message : "eroare necunoscută"}`);
    }
  }

  revalidatePath("/courses", "layout");

  const summary = `Sincronizat ${synced}/${files.length} lecții${quizzesSynced > 0 ? `, ${quizzesSynced} quiz-uri` : ""}.`;
  const errorSummary = errors.length > 0 ? ` Erori: ${errors.join("; ")}` : "";

  return {
    success: errors.length < files.length,
    message: summary + errorSummary,
  };
}

export async function resetProgress(): Promise<{ success: boolean; message: string }> {
  const authClient = createSupabaseServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) return { success: false, message: "Neautentificat." };

  // Admin-only action
  const { data: profile } = await authClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { success: false, message: "Acces interzis. Doar adminii pot reseta progresul." };
  }

  // No DELETE RLS policy on user_progress → use admin client
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("user_progress")
    .delete()
    .eq("user_id", user.id);

  if (error) return { success: false, message: `Eroare: ${error.message}` };

  revalidatePath("/", "layout");
  return { success: true, message: "Progresul a fost resetat." };
}
