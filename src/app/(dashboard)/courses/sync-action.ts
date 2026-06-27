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

// Legacy courses are never touched by the generic sync — their lessons stay
// is_published = false and their MDX folders are left alone.
const LEGACY_COURSE_SLUGS = ["ai-fundamentals", "prompt-engineering-practic"];

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

      // Dual-mode retired: sync the standard content_md only.
      const lessonData = {
        course_id: course.id,
        title: frontmatter.title,
        content_md: content.trim(),
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

/**
 * Generic MDX sync — works for every course, not just ai-fundamentals.
 *
 * Discovers all subdirectories under content/courses/, matches each one to a
 * `courses.slug`, and for every .mdx file found: parses frontmatter, matches
 * the pre-seeded lesson row by (course_id + order_index), writes content_md
 * and flips is_published = true.
 *
 * Lessons with no MDX file keep is_published = false. Legacy courses
 * (ai-fundamentals, prompt-engineering-practic) are skipped entirely, so
 * their lessons stay unpublished and their folders are never read.
 */
export async function syncAllCourses(): Promise<{ success: boolean; message: string }> {
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

  const coursesDir = path.join(process.cwd(), "content", "courses");
  if (!fs.existsSync(coursesDir)) {
    return { success: false, message: `Directorul de conținut nu există: ${coursesDir}` };
  }

  // Discover course subdirectories — skip legacy courses and the _archive folder
  const courseSlugs = fs
    .readdirSync(coursesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
    .map((d) => d.name)
    .filter((name) => !LEGACY_COURSE_SLUGS.includes(name))
    .sort();

  if (courseSlugs.length === 0) {
    return {
      success: false,
      message: "Nu s-au găsit directoare de curs (în afara celor legacy).",
    };
  }

  let totalSynced = 0;
  let totalQuizzes = 0;
  const perCourse: string[] = [];
  const errors: string[] = [];

  for (const slug of courseSlugs) {
    // Match subdirectory name to a course slug in the DB
    const { data: course } = await supabase
      .from("courses")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!course) {
      errors.push(`${slug}: niciun curs cu acest slug în DB — ignorat.`);
      continue;
    }

    const dir = path.join(coursesDir, slug);
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".mdx") && !f.endsWith("-simple.mdx"))
      .sort();

    let courseSynced = 0;

    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(dir, file), "utf-8");
        const { data, content } = matter(raw);
        const frontmatter = data as LessonFrontmatter;

        if (typeof frontmatter.order !== "number") {
          errors.push(`${slug}/${file}: frontmatter lipsă 'order' (număr).`);
          continue;
        }

        // Match the pre-seeded lesson row by course_id + order_index
        const { data: lesson } = await supabase
          .from("lessons")
          .select("id, type")
          .eq("course_id", course.id)
          .eq("order_index", frontmatter.order)
          .maybeSingle();

        if (!lesson) {
          errors.push(
            `${slug}/${file}: nicio lecție cu order_index=${frontmatter.order}.`
          );
          continue;
        }

        const { error: updateError } = await supabase
          .from("lessons")
          .update({ content_md: content.trim(), is_published: true })
          .eq("id", lesson.id);

        if (updateError) {
          errors.push(`${slug}/${file}: eroare la update — ${updateError.message}`);
          continue;
        }

        // Defensive quiz handling — the 12 new courses have no quiz lessons,
        // but support it if a quiz lesson with questions frontmatter appears.
        if (lesson.type === "quiz" && Array.isArray(frontmatter.questions)) {
          await supabase.from("quiz_questions").delete().eq("lesson_id", lesson.id);
          const questionsToInsert = frontmatter.questions.map((q) => ({
            lesson_id: lesson.id,
            question: q.question,
            options: q.options,
            correct_answer: q.correct,
            explanation: q.explanation,
          }));
          const { error: qError } = await supabase
            .from("quiz_questions")
            .insert(questionsToInsert);
          if (qError) {
            errors.push(`${slug}/${file}: eroare la quiz_questions — ${qError.message}`);
          } else {
            totalQuizzes++;
          }
        }

        courseSynced++;
        totalSynced++;
      } catch (err) {
        errors.push(
          `${slug}/${file}: ${err instanceof Error ? err.message : "eroare necunoscută"}`
        );
      }
    }

    if (files.length > 0) {
      perCourse.push(`${slug} ${courseSynced}/${files.length}`);
    }
  }

  revalidatePath("/courses", "layout");

  const summary =
    totalSynced > 0
      ? `Sincronizat ${totalSynced} lecții${
          totalQuizzes > 0 ? `, ${totalQuizzes} quiz-uri` : ""
        } [${perCourse.join(" · ")}].`
      : "Niciun fișier .mdx găsit în directoarele de curs.";
  const errorSummary =
    errors.length > 0 ? ` Avertismente: ${errors.join("; ")}` : "";

  return {
    // Success when at least one lesson synced, or when there was simply
    // nothing to do (no files yet) — only hard-fail on zero sync + errors.
    success: totalSynced > 0 || errors.length === 0,
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
