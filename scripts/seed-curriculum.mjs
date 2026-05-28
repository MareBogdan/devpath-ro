/**
 * seed-curriculum.mjs — seeds all 12 courses + 321 lessons as empty placeholders.
 *
 * Source of truth: devpath-docs/CURRICULUM-STRUCTURE.md (parsed at runtime).
 * Each lesson is inserted as an empty placeholder: content_md = "" (the column
 * is NOT NULL, so an empty string is the placeholder), is_published = false;
 * the title/type/order_index come from the curriculum doc.
 *
 * SAFETY:
 *   - Idempotent. Courses are skipped if a row with that slug already exists.
 *   - Lessons are skipped if a row with that (course_id, order_index) exists,
 *     so existing Course 1 lessons (and their content) are NEVER modified.
 *   - Aborts before any DB write if the parse doesn't yield exactly 12/321.
 *
 * Usage:  node scripts/seed-curriculum.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ── Load .env.local ──────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("❌  .env.local not found");
    process.exit(1);
  }
  for (const line of fs.readFileSync(envPath, "utf-8").split(/\r?\n/)) {
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
  console.error(
    "❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// ── Parse CURRICULUM-STRUCTURE.md ────────────────────────────────────────────
function parseCurriculum() {
  const mdPath = path.join(ROOT, "devpath-docs", "CURRICULUM-STRUCTURE.md");
  if (!fs.existsSync(mdPath)) {
    console.error(`❌  Curriculum doc not found: ${mdPath}`);
    process.exit(1);
  }
  const md = fs.readFileSync(mdPath, "utf-8");
  const courses = [];

  // Each course is a "## CURSUL N" section.
  for (const sec of md.split(/^## CURSUL /m).slice(1)) {
    // Metadata is the first fenced block (slug/title/description/difficulty/order).
    const fence = sec.match(/```\r?\n([\s\S]*?)\r?\n```/);
    if (!fence) continue;
    const meta = {};
    for (const line of fence[1].split(/\r?\n/)) {
      const m = line.match(/^(\w+):\s*(.+)$/);
      if (m) meta[m[1]] = m[2].trim();
    }

    // Lessons are the table rows: | <order> | <title> | <type> |
    const lessons = [];
    for (const line of sec.split(/\r?\n/)) {
      const m = line.match(
        /^\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*(lesson|lab|boss)\s*\|/
      );
      if (m) {
        lessons.push({ order: Number(m[1]), title: m[2].trim(), type: m[3] });
      }
    }

    if (meta.slug && lessons.length > 0) {
      courses.push({
        slug: meta.slug,
        title: meta.title,
        description: meta.description ?? "",
        difficulty: Number(meta.difficulty),
        order_index: Number(meta.order),
        lessons,
      });
    }
  }
  return courses;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱  Seeding curriculum (12 courses · 321 lessons)\n");

  const courses = parseCurriculum();
  const parsedLessons = courses.reduce((s, c) => s + c.lessons.length, 0);
  console.log(
    `📖  Parsed ${courses.length} courses · ${parsedLessons} lessons from CURRICULUM-STRUCTURE.md\n`
  );

  // Sanity gate — never write to the DB if the parse looks wrong.
  if (courses.length !== 12 || parsedLessons !== 321) {
    console.error(
      `❌  Expected 12 courses / 321 lessons, parsed ${courses.length} / ${parsedLessons}. Aborting — no DB writes.`
    );
    process.exit(1);
  }

  let coursesInserted = 0;
  let lessonsInserted = 0;
  const errors = [];

  for (const course of courses) {
    // ── Course row — skip if it already exists ──
    let courseId;
    const { data: existingCourse, error: cErr } = await supabase
      .from("courses")
      .select("id")
      .eq("slug", course.slug)
      .maybeSingle();
    if (cErr) {
      errors.push(`course ${course.slug}: lookup — ${cErr.message}`);
      console.log(`❌  ${course.slug}: lookup failed — ${cErr.message}`);
      continue;
    }

    if (existingCourse) {
      courseId = existingCourse.id;
      console.log(`•   ${course.slug} — course exists, kept`);
    } else {
      const { data: ins, error } = await supabase
        .from("courses")
        .insert({
          slug: course.slug,
          title: course.title,
          description: course.description,
          difficulty: course.difficulty,
          order_index: course.order_index,
        })
        .select("id")
        .single();
      if (error || !ins) {
        errors.push(`course ${course.slug}: insert — ${error?.message}`);
        console.log(`❌  ${course.slug}: insert failed — ${error?.message}`);
        continue;
      }
      courseId = ins.id;
      coursesInserted++;
      console.log(`✅  ${course.slug} — course inserted`);
    }

    // ── Lessons — skip any (course_id, order_index) that already exists ──
    const { data: existingLessons, error: lErr } = await supabase
      .from("lessons")
      .select("order_index")
      .eq("course_id", courseId);
    if (lErr) {
      errors.push(`lessons ${course.slug}: lookup — ${lErr.message}`);
      console.log(`❌  ${course.slug}: lesson lookup failed — ${lErr.message}`);
      continue;
    }
    const have = new Set((existingLessons ?? []).map((l) => l.order_index));

    const toInsert = course.lessons
      .filter((l) => !have.has(l.order))
      .map((l) => ({
        course_id: courseId,
        title: l.title,
        type: l.type,
        order_index: l.order,
        content_md: "", // column is NOT NULL — empty string = placeholder
        is_published: false,
      }));

    if (toInsert.length === 0) {
      console.log(`    all ${course.lessons.length} lessons already present`);
      continue;
    }

    const { error: insErr } = await supabase.from("lessons").insert(toInsert);
    if (insErr) {
      errors.push(`lessons ${course.slug}: insert — ${insErr.message}`);
      console.log(`❌  ${course.slug}: lesson insert failed — ${insErr.message}`);
    } else {
      lessonsInserted += toInsert.length;
      console.log(
        `    +${toInsert.length} lessons (${course.lessons.length - toInsert.length} kept)`
      );
    }
  }

  // ── Verify ──
  const { count: courseCount } = await supabase
    .from("courses")
    .select("*", { count: "exact", head: true });
  const { count: lessonCount } = await supabase
    .from("lessons")
    .select("*", { count: "exact", head: true });

  console.log(`\n─────────────────────────────────────────`);
  console.log(`Inserted this run: ${coursesInserted} courses · ${lessonsInserted} lessons`);
  console.log(`DB total:          ${courseCount} courses · ${lessonCount} lessons`);
  if (errors.length > 0) {
    console.log(`\n⚠  Errors (${errors.length}):`);
    errors.forEach((e) => console.log(`   • ${e}`));
  }
  console.log(
    courseCount === 12 && lessonCount === 321
      ? `\n🎉  Verified: 12 courses + 321 lessons in the database.`
      : `\n⚠  Expected 12 courses / 321 lessons — see counts above.`
  );
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
