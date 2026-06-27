/**
 * Standalone sync script — no Next.js server required.
 * Reads .env.local, parses all MDX files, upserts to Supabase.
 * Usage: node scripts/sync-content.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ── Load .env.local ──────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("❌  .env.local not found");
    process.exit(1);
  }
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// Use gray-matter (already installed in the project) for reliable YAML parsing
function parseFrontmatter(raw) {
  const { data, content } = matter(raw);
  return { data, content };
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🔄  Starting content sync...\n");

  // Get course
  const { data: course, error: courseErr } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", "hardware-fizica")
    .single();

  if (courseErr || !course) {
    console.error("❌  Course 'hardware-fizica' not found:", courseErr?.message);
    process.exit(1);
  }

  const contentDir = path.join(ROOT, "content", "courses", "hardware-fizica");
  if (!fs.existsSync(contentDir)) {
    console.error("❌  Content directory not found:", contentDir);
    process.exit(1);
  }

  const files = fs
    .readdirSync(contentDir)
    .filter((f) => f.endsWith(".mdx") && !f.endsWith("-simple.mdx"))
    .sort();

  console.log(`📚  Found ${files.length} technical MDX files\n`);

  let synced = 0;
  let quizzesSynced = 0;
  const errors = [];

  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(contentDir, file), "utf-8");
      const { data: fm, content } = parseFrontmatter(raw);

      if (!fm.title || !fm.order || !fm.type) {
        errors.push(`${file}: missing title/order/type`);
        console.log(`  ⚠️  ${file}: incomplete frontmatter`);
        continue;
      }

      const lessonData = {
        course_id: course.id,
        title: fm.title,
        content_md: content.trim(),
        type: fm.type,
        order_index: fm.order,
      };

      // Upsert via order_index
      const { data: existing } = await supabase
        .from("lessons")
        .select("id")
        .eq("course_id", course.id)
        .eq("order_index", fm.order)
        .maybeSingle();

      let lessonId;

      if (existing) {
        const { error: upErr } = await supabase
          .from("lessons")
          .update(lessonData)
          .eq("id", existing.id);
        if (upErr) throw new Error(upErr.message);
        lessonId = existing.id;
        console.log(`  ✅  Updated  L${String(fm.order).padStart(2, "0")} — ${fm.title}`);
      } else {
        const { data: inserted, error: insErr } = await supabase
          .from("lessons")
          .insert(lessonData)
          .select("id")
          .single();
        if (insErr || !inserted) throw new Error(insErr?.message ?? "insert failed");
        lessonId = inserted.id;
        console.log(`  ✅  Inserted L${String(fm.order).padStart(2, "0")} — ${fm.title}`);
      }

      // Quiz questions
      if (fm.type === "quiz" && Array.isArray(fm.questions) && fm.questions.length > 0) {
        await supabase.from("quiz_questions").delete().eq("lesson_id", lessonId);

        const qs = fm.questions.map((q) => ({
          lesson_id: lessonId,
          question: q.question,
          options: q.options,
          correct_answer: q.correct,
          explanation: q.explanation,
        }));

        const { error: qErr } = await supabase.from("quiz_questions").insert(qs);
        if (qErr) {
          errors.push(`${file}: quiz_questions — ${qErr.message}`);
        } else {
          quizzesSynced++;
          console.log(`       🧩  Synced ${qs.length} quiz questions`);
        }
      }

      synced++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${file}: ${msg}`);
      console.log(`  ❌  ${file}: ${msg}`);
    }
  }

  console.log(`\n─────────────────────────────────────────`);
  console.log(`✅  Synced: ${synced}/${files.length} lessons`);
  if (quizzesSynced > 0) console.log(`🧩  Quiz sets synced: ${quizzesSynced}`);
  if (errors.length > 0) {
    console.log(`\n⚠️  Errors (${errors.length}):`);
    errors.forEach((e) => console.log(`   • ${e}`));
  } else {
    console.log(`\n🎉  All done — zero errors!`);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
