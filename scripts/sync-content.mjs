/**
 * Content sync — MDX files → public.lessons. No Next.js server required.
 *
 *   node scripts/sync-content.mjs [course-slug] [--dry-run]
 *   node scripts/sync-content.mjs --all [--dry-run]
 *
 * Default course: hardware-fizica. Reads .env.local (service-role key), parses
 * content/courses/<slug>/*.mdx and makes the lessons table match the files.
 *
 * What a file controls (frontmatter + body):
 *   title, type, order (→ order_index), module_index, published (→ is_published,
 *   default true; write `published: false` to keep a drafted file invisible),
 *   and the body (→ content_md, CRLF normalised, trimmed).
 *   `duration` (→ estimated_minutes, the reading time shown in the lesson header) — ONLY for a converted
 *   lesson: type lesson/theory with a sibling <lesson>.questions.json. Every one of the 136 files carries a
 *   template `duration` (mostly 12), 1.1–1.9× the real prose reading time; syncing those would replace a
 *   computed estimate with a placeholder. A converted lesson's duration is set from the validator's
 *   estimate (validate-questions.mjs --stats), so it is deliberate. The other lessons keep estimated_minutes
 *   NULL and the page computes ~160 wpm over their prose (src/lib/reading-time.ts).
 * Not touched: is_free, video_url, starter/solution code, ids.
 *
 * Idempotent: every row is diffed against the DB first and only the columns that
 * differ are written, so a second run (or a run on an already-synced course) is a
 * no-op. `--dry-run` prints the same plan and writes nothing. Lessons that exist
 * in the DB but have no file are reported, never deleted. Quiz questions
 * (legacy `type: quiz` + `questions:` frontmatter) are replaced only when they
 * differ.
 *
 * Refuses to run against the retired Supabase project (umtecpbixdkumfjsvzcl).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OLD_PROJECT_REF = "umtecpbixdkumfjsvzcl";
const LESSON_TYPES = new Set(["lesson", "lab", "boss", "theory", "quiz", "exercise", "project"]);

// ── Args ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const ALL = args.includes("--all");
const slugArg = args.find((a) => !a.startsWith("--"));

// ── Load .env.local ──────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("❌  .env.local not found");
    process.exit(1);
  }
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
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
if (SUPABASE_URL.includes(OLD_PROJECT_REF)) {
  console.error(`❌  .env.local points at the retired project (${OLD_PROJECT_REF}). Refusing to run.`);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

// ── Helpers ──────────────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, "0");
const isInt = (v) => Number.isInteger(v) && v > 0;

/** Parse one file into the row it should produce, or an { error }. */
function parseLesson(file, dir) {
  // gray-matter caches by content; CRLF is normalised first so Windows checkouts
  // compare equal to the LF text stored in the DB.
  const raw = fs.readFileSync(path.join(dir, file), "utf-8").replace(/\r\n/g, "\n");
  const { data: fm, content } = matter(raw);

  if (!fm.title || !isInt(fm.order) || !fm.type) {
    return { error: "missing/invalid title, order or type" };
  }
  if (!LESSON_TYPES.has(fm.type)) return { error: `unknown type "${fm.type}"` };
  if (fm.module_index !== undefined && !isInt(fm.module_index)) {
    return { error: `invalid module_index "${fm.module_index}"` };
  }
  // Authored reading time — converted lessons only (see the header).
  const converted =
    (fm.type === "lesson" || fm.type === "theory") &&
    fs.existsSync(path.join(dir, file.replace(/\.mdx$/, ".questions.json")));
  let estimated_minutes; // undefined → not synced
  if (converted && fm.duration !== undefined) {
    if (!Number.isInteger(fm.duration) || fm.duration < 1 || fm.duration > 120) {
      return { error: `invalid duration "${fm.duration}" (whole minutes, 1–120)` };
    }
    estimated_minutes = fm.duration;
  }
  return {
    fm,
    placeholderDuration: !converted && (fm.type === "lesson" || fm.type === "theory") && fm.duration !== undefined,
    row: {
      title: String(fm.title),
      type: fm.type,
      order_index: fm.order,
      module_index: fm.module_index, // undefined → keep the DB value (insert needs it)
      is_published: fm.published === false ? false : true,
      content_md: content.trim(),
      estimated_minutes,
    },
  };
}

// Order-independent fingerprint of a question set.
const QUIZ_FIELDS = (qs) =>
  JSON.stringify(
    qs
      .map((q) => [q.question, q.options, q.correct_answer, q.explanation ?? null])
      .sort((a, b) => String(a[0]).localeCompare(String(b[0])))
  );

// ── One course ───────────────────────────────────────────────────────────────
async function syncCourse(slug) {
  const stats = { files: 0, unchanged: 0, inserted: 0, updated: 0, errors: [], orphans: [], placeholderDurations: 0 };

  const { data: course, error: courseErr } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", slug)
    .single();
  if (courseErr || !course) {
    stats.errors.push(`course '${slug}' not found: ${courseErr?.message ?? "no row"}`);
    return stats;
  }

  const dir = path.join(ROOT, "content", "courses", slug);
  if (!fs.existsSync(dir)) {
    stats.errors.push(`content directory not found: ${dir}`);
    return stats;
  }
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx") && !f.endsWith("-simple.mdx"))
    .sort();
  stats.files = files.length;

  const { data: existingRows, error: exErr } = await supabase
    .from("lessons")
    .select("id, order_index, title, type, module_index, is_published, content_md, estimated_minutes")
    .eq("course_id", course.id);
  if (exErr) {
    stats.errors.push(`reading lessons: ${exErr.message}`);
    return stats;
  }
  const byOrder = new Map(existingRows.map((r) => [r.order_index, r]));

  const seenOrders = new Set();
  for (const file of files) {
    const tag = `${slug} ${file}`;
    try {
      const parsed = parseLesson(file, dir);
      if (parsed.error) {
        stats.errors.push(`${tag}: ${parsed.error}`);
        continue;
      }
      const { fm, row } = parsed;
      if (parsed.placeholderDuration) stats.placeholderDurations++;
      if (seenOrders.has(row.order_index)) {
        stats.errors.push(`${tag}: duplicate order ${row.order_index}`);
        continue;
      }
      seenOrders.add(row.order_index);
      const label = `L${pad(row.order_index)} ${row.title}`;
      const existing = byOrder.get(row.order_index);

      let lessonId = existing?.id;

      if (!existing) {
        if (row.module_index === undefined) {
          stats.errors.push(`${tag}: new lesson needs a module_index in its frontmatter`);
          continue;
        }
        console.log(`  ➕  ${DRY_RUN ? "would insert" : "insert"}  ${label}  (module ${row.module_index}, published ${row.is_published})`);
        if (!DRY_RUN) {
          const { data: inserted, error } = await supabase
            .from("lessons")
            .insert({ course_id: course.id, ...row })
            .select("id")
            .single();
          if (error || !inserted) throw new Error(error?.message ?? "insert failed");
          lessonId = inserted.id;
        }
        stats.inserted++;
      } else {
        const patch = {};
        for (const col of ["title", "type", "module_index", "is_published", "content_md", "estimated_minutes"]) {
          if (row[col] !== undefined && row[col] !== existing[col]) patch[col] = row[col];
        }
        const changed = Object.keys(patch);
        if (changed.length === 0) {
          stats.unchanged++;
        } else {
          console.log(`  ✏️   ${DRY_RUN ? "would update" : "update"}  ${label}  [${changed.join(", ")}]`);
          if (!DRY_RUN) {
            const { error } = await supabase.from("lessons").update(patch).eq("id", existing.id);
            if (error) throw new Error(error.message);
          }
          stats.updated++;
        }
      }

      // Legacy quiz lessons — replace only when the questions actually differ.
      if (row.type === "quiz" && Array.isArray(fm.questions) && fm.questions.length > 0 && lessonId) {
        const wanted = fm.questions.map((q) => ({
          lesson_id: lessonId,
          question: q.question,
          options: q.options,
          correct_answer: q.correct,
          explanation: q.explanation,
        }));
        const { data: have } = await supabase
          .from("quiz_questions")
          .select("question, options, correct_answer, explanation")
          .eq("lesson_id", lessonId);
        if (QUIZ_FIELDS(have ?? []) !== QUIZ_FIELDS(wanted)) {
          console.log(`       🧩  ${DRY_RUN ? "would replace" : "replace"} ${wanted.length} quiz questions`);
          if (!DRY_RUN) {
            await supabase.from("quiz_questions").delete().eq("lesson_id", lessonId);
            const { error: qErr } = await supabase.from("quiz_questions").insert(wanted);
            if (qErr) stats.errors.push(`${tag}: quiz_questions — ${qErr.message}`);
          }
        }
      }
    } catch (err) {
      stats.errors.push(`${tag}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  for (const r of existingRows) {
    if (!seenOrders.has(r.order_index)) stats.orphans.push(`L${pad(r.order_index)} ${r.title}`);
  }
  return stats;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const host = new URL(SUPABASE_URL).host;
  console.log(`🔄  Content sync ${DRY_RUN ? "(DRY RUN — nothing is written) " : ""}→ ${host}\n`);

  const slugs = ALL
    ? fs
        .readdirSync(path.join(ROOT, "content", "courses"), { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .sort()
    : [slugArg ?? "hardware-fizica"];

  let changes = 0;
  let errorCount = 0;
  for (const slug of slugs) {
    console.log(`📚  ${slug}`);
    const s = await syncCourse(slug);
    changes += s.inserted + s.updated;
    errorCount += s.errors.length;
    console.log(
      `    ${s.files} files · ${s.unchanged} unchanged · ${s.updated} ${DRY_RUN ? "to update" : "updated"} · ${s.inserted} ${DRY_RUN ? "to insert" : "inserted"}`
    );
    if (s.placeholderDurations > 0) {
      console.log(`    ℹ️  ${s.placeholderDurations} unconverted lesson(s) carry a template \`duration\` — not synced (the page computes their reading time)`);
    }
    if (s.orphans.length > 0) {
      console.log(`    ℹ️  in DB but no file (left alone): ${s.orphans.join("; ")}`);
    }
    s.errors.forEach((e) => console.log(`    ❌  ${e}`));
    console.log("");
  }

  console.log("─────────────────────────────────────────");
  console.log(
    changes === 0 && errorCount === 0
      ? "✅  No-op: the database already matches the files."
      : `${DRY_RUN ? "Would change" : "Changed"} ${changes} lesson(s); ${errorCount} error(s).`
  );
  if (errorCount > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
