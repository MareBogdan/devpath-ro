/**
 * seed-curriculum.mjs — restructure-safe curriculum seeder for Courses 4-12.
 *
 * Source of truth: devpath-docs/CURRICULUM-STRUCTURE.md (parsed at runtime).
 * Each lesson is written as an empty placeholder: content_md = "" (the column is
 * NOT NULL, so an empty string is the placeholder), is_published = false; the
 * title/type/order_index come from the curriculum doc.
 *
 * SCOPE — this seeder is HARD-SCOPED to Courses 4-12 (nine slugs). Courses 1-3
 * (hardware-fizica, sisteme-de-operare, retele-internet) are NEVER written: they
 * hold real user data (user_progress / comments / minigame sessions) and are
 * excluded from the loop AND blocked again inside the reseed_course_lessons() RPC.
 *
 * HOW IT REPLACES LESSONS
 *   Per in-scope course, it calls the reseed_course_lessons() SQL function, which
 *   runs delete-then-insert ATOMICALLY (a failure can't leave a course half-seeded)
 *   and refuses to touch any course whose lessons have child rows. Delete-then-insert
 *   is chosen over upsert+prune because Courses 4-12 have zero child rows today,
 *   which makes a full replace bulletproof and lets a future restructure freely
 *   rename/reorder/add/remove lessons with no orphan rows.
 *
 * SAFETY
 *   - Reads each course's own `total_lessons:` from the doc and aborts BEFORE any
 *     write if a parsed count doesn't match it (catches parse breakage without
 *     hardcoding a global total, so restructured totals are tolerated).
 *   - JS child-row guard across all 13 child tables of lessons.id before reseeding
 *     a course; the RPC re-checks the same guard atomically with the delete.
 *   - Requires migrations 20260701000001 (UNIQUE course_id, order_index) and
 *     20260701000002 (reseed_course_lessons fn) to be applied first.
 *
 * Usage:  node scripts/seed-curriculum.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ── Scope ────────────────────────────────────────────────────────────────────
// Courses 4-12 — the ONLY slugs this seeder is allowed to write.
const IN_SCOPE_SLUGS = [
  "python-inginerie-software",
  "algoritmi-structuri-date",
  "baze-date-ingineria-datelor",
  "matematica-ai",
  "machine-learning",
  "deep-learning-computer-vision",
  "ai-generativ-llms",
  "agentic-ai-mcp",
  "ai-in-productie",
];

// Courses 1-3 — must NEVER be written by this seeder (real user data lives here).
const PROTECTED_SLUGS = [
  "hardware-fizica",
  "sisteme-de-operare",
  "retele-internet",
];

// All 13 tables whose FK references lessons.id (ON DELETE CASCADE). The child-row
// guard checks every one before a course is reseeded.
const LESSON_CHILD_TABLES = [
  "ai_coach_sessions",
  "ai_generated_questions",
  "flashcards",
  "inline_questions",
  "lesson_bookmarks",
  "lesson_comments",
  "lesson_feedback",
  "lesson_scores",
  "minigame_sessions",
  "quiz_questions",
  "quiz_wrong_answers",
  "user_progress",
  "wow_notes",
];

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
    // Metadata is the first fenced block (slug/title/description/difficulty/order/total_lessons).
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
        // Declared count from the doc — used as the per-course parse assertion.
        total_lessons:
          meta.total_lessons != null ? Number(meta.total_lessons) : null,
        lessons,
      });
    }
  }
  return courses;
}

// ── Course row — look up, insert if missing (in-scope slugs only) ─────────────
async function ensureCourse(course) {
  const { data: existing, error: selErr } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", course.slug)
    .maybeSingle();
  if (selErr) throw new Error(`course lookup — ${selErr.message}`);
  if (existing) return { id: existing.id, created: false };

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
  if (error || !ins) throw new Error(`course insert — ${error?.message}`);
  return { id: ins.id, created: true };
}

// ── Child-row safety guard — abort if ANY of the 13 child tables has a row ────
// tied to this course's lessons. This is the net that makes it impossible to
// cascade-delete user data even if the scope were ever widened by mistake.
async function assertNoChildRows(courseId, slug) {
  const { data: lessons, error } = await supabase
    .from("lessons")
    .select("id")
    .eq("course_id", courseId);
  if (error) throw new Error(`${slug}: lesson lookup — ${error.message}`);

  const ids = (lessons ?? []).map((l) => l.id);
  if (ids.length === 0) return; // nothing to guard

  for (const table of LESSON_CHILD_TABLES) {
    const { count, error: cErr } = await supabase
      .from(table)
      .select("id", { count: "exact", head: true })
      .in("lesson_id", ids);
    if (cErr) throw new Error(`${slug}: child-guard on ${table} — ${cErr.message}`);
    if ((count ?? 0) > 0) {
      throw new Error(
        `${slug}: ABORT — ${count} child row(s) in ${table}; refusing to reseed.`
      );
    }
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱  Seeding curriculum — Courses 4-12 (restructure-safe)\n");

  const all = parseCurriculum();

  // Keep only the nine in-scope courses; protected slugs can never enter the loop.
  const inScope = all.filter((c) => IN_SCOPE_SLUGS.includes(c.slug));

  // Hard assertion: no protected slug may ever reach the write path.
  const leaked = inScope.filter((c) => PROTECTED_SLUGS.includes(c.slug));
  if (leaked.length > 0) {
    console.error(
      `❌  Protected slug(s) reached the write path: ${leaked
        .map((c) => c.slug)
        .join(", ")}. Aborting — no DB writes.`
    );
    process.exit(1);
  }

  // Every in-scope slug must be present in the doc.
  const missing = IN_SCOPE_SLUGS.filter(
    (s) => !inScope.some((c) => c.slug === s)
  );
  if (missing.length > 0) {
    console.error(
      `❌  In-scope slug(s) not found in CURRICULUM-STRUCTURE.md: ${missing.join(
        ", "
      )}. Aborting — no DB writes.`
    );
    process.exit(1);
  }

  // Per-course parse check — derived from each course's own total_lessons field.
  // Catches real parse breakage while tolerating restructured totals.
  const parseErrors = [];
  for (const c of inScope) {
    if (c.total_lessons == null) {
      parseErrors.push(`${c.slug}: missing 'total_lessons' in the doc`);
    } else if (c.lessons.length !== c.total_lessons) {
      parseErrors.push(
        `${c.slug}: parsed ${c.lessons.length} lessons but doc declares total_lessons=${c.total_lessons}`
      );
    }
  }
  if (parseErrors.length > 0) {
    console.error("❌  Parse check failed — no DB writes:");
    parseErrors.forEach((e) => console.error(`   • ${e}`));
    process.exit(1);
  }

  console.log(
    `📖  Parsed ${inScope.length} in-scope courses · ${inScope.reduce(
      (s, c) => s + c.lessons.length,
      0
    )} lessons (each matches its declared total_lessons)\n`
  );

  let coursesReseeded = 0;
  let lessonsWritten = 0;
  const errors = [];

  for (const course of inScope) {
    try {
      const { id: courseId, created } = await ensureCourse(course);
      if (created) console.log(`✅  ${course.slug} — course row inserted`);

      // Guard before any destructive write.
      await assertNoChildRows(courseId, course.slug);

      // Atomic delete-then-insert inside the DB (guard re-checked there too).
      const { data: inserted, error: rpcErr } = await supabase.rpc(
        "reseed_course_lessons",
        {
          p_slug: course.slug,
          p_lessons: course.lessons.map((l) => ({
            title: l.title,
            type: l.type,
            order: l.order,
          })),
        }
      );
      if (rpcErr) throw new Error(`reseed RPC — ${rpcErr.message}`);

      coursesReseeded++;
      lessonsWritten += inserted ?? 0;
      console.log(`    ↻ ${course.slug} — reseeded ${inserted} lessons`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${course.slug}: ${msg}`);
      console.log(`❌  ${course.slug} — ${msg}`);
    }
  }

  // ── Informational verify (per-course; no global 12/321 assertion) ──
  console.log(`\n─────────────────────────────────────────`);
  console.log(
    `Reseeded ${coursesReseeded}/${inScope.length} in-scope courses · ${lessonsWritten} lessons written this run`
  );

  const { data: liveCounts } = await supabase
    .from("courses")
    .select("slug, order_index, lessons(count)")
    .in("slug", IN_SCOPE_SLUGS)
    .order("order_index");
  if (liveCounts) {
    for (const c of liveCounts) {
      const n = Array.isArray(c.lessons) ? c.lessons[0]?.count ?? 0 : 0;
      console.log(`   ${String(c.order_index).padStart(2)}  ${c.slug} — ${n} lessons`);
    }
  }

  if (errors.length > 0) {
    console.log(`\n⚠  Errors (${errors.length}):`);
    errors.forEach((e) => console.log(`   • ${e}`));
    process.exit(1);
  }
  console.log(`\n🎉  Done — Courses 1-3 were not touched.`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
