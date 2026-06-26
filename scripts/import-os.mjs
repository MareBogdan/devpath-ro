/**
 * import-os.mjs — validated one-shot importer for Course 2 (Sisteme de Operare).
 *
 * Mirrors syncAllCourses() matching (course_id + order_index === frontmatter.order)
 * and EXTENDS it to also write `title` and `module_index` (not just content_md +
 * is_published).
 *
 * Pipeline:
 *   1. Read every .mdx from the external authoring folder.
 *   2. VALIDATION GATE (aborts before ANY copy/write) — fails on:
 *        - missing / non-numeric `order`
 *        - duplicate `order`
 *        - `order` landing on an interactive slot (10 lab, 19 lab, 22 boss)
 *        - an unregistered JSX component used in PROSE (code spans are ignored)
 *   3. On pass: copy the files into content/courses/sisteme-de-operare/.
 *   4. UPDATE each matched OS row: content_md, title, module_index, is_published=true.
 *      Only `lesson`-type rows are ever written. ord10/18/19/22 are left untouched.
 *   5. Print before/after + confirm Course 1 (hardware-fizica) was not touched.
 *
 * Idempotent: UPDATE-by-(course_id, order_index), never inserts. Re-running rewrites
 * the same rows with the same content — no duplicates, no double-publish.
 *
 * Usage:  node scripts/import-os.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const EXTERNAL_BASE = "C:\\DEVPATH -LECTII-PE-CAPITOLE";
const COURSE_SLUG = "sisteme-de-operare";
const DEST_DIR = path.join(ROOT, "content", "courses", COURSE_SLUG);

// Interactive seed slots — no prose file may land here.
const INTERACTIVE_SLOTS = new Set([10, 19, 22]);

// JSX components registered in getMdxComponents() (src/components/mdx/mdx-components.tsx).
const REGISTERED = new Set([
  "FactBox", "CosmoHint", "LabBox", "ADCSimulator",
  "BinaryTranslator", "TransistorLab", "RAMGridGame",
  "BossFightAlarmaSef", "BossFightAsambleazaCPU",
]);

// Wrapper components that take children — every open MUST have a matching close.
// An unclosed one is a structural MDX error that makes serialize() throw at
// render time (the lesson page hits the error boundary). This is exactly the
// class of bug that shipped ord14/15/17 as broken.
const BALANCED_TAGS = ["CosmoHint", "FactBox", "LabBox"];

// Valid Cosmo emotions — src/components/mascot/cosmo-mascot.tsx (CosmoEmotion).
const VALID_EMOTIONS = new Set([
  "happy", "excited", "thinking", "encouraging",
  "celebrating", "sleeping", "waving", "sad",
]);

// ── Load .env.local (service role for writes) ────────────────────────────────
function loadEnv() {
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) { console.error("❌  .env.local not found"); process.exit(1); }
  for (const line of fs.readFileSync(envPath, "utf-8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const [k, ...rest] = t.split("=");
    if (k && rest.length) process.env[k.trim()] = rest.join("=").trim();
  }
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

// ── Locate the external Course 2 folder robustly ─────────────────────────────
function findCourse2Dir() {
  if (!fs.existsSync(EXTERNAL_BASE)) {
    console.error(`❌  External base not found: ${EXTERNAL_BASE}`);
    process.exit(1);
  }
  const sub = fs.readdirSync(EXTERNAL_BASE, { withFileTypes: true })
    .find((d) => d.isDirectory() && /^curs\s+2\b/i.test(d.name));
  if (!sub) { console.error("❌  No 'Curs 2' subfolder under external base."); process.exit(1); }
  return path.join(EXTERNAL_BASE, sub.name);
}

// ── Code-aware prose scan: strip fenced + inline code, then find JSX tags ─────
function unregisteredProseTags(body) {
  const prose = body
    .replace(/```[\s\S]*?```/g, "")   // fenced code blocks
    .replace(/`[^`]*`/g, "");          // inline code spans
  const found = new Set();
  for (const m of prose.matchAll(/<([A-Z][A-Za-z0-9]*)/g)) {
    if (!REGISTERED.has(m[1])) found.add(m[1]);
  }
  return [...found];
}

// Unbalanced wrapper components (open count !== close count). Self-closing
// `<Tag />` are subtracted from opens so they don't count as needing a close.
function tagBalanceProblems(body) {
  const out = [];
  for (const tag of BALANCED_TAGS) {
    const opens = (body.match(new RegExp(`<${tag}\\b`, "g")) || []).length;
    const selfClose = (body.match(new RegExp(`<${tag}\\b[^>]*/>`, "g")) || []).length;
    const closes = (body.match(new RegExp(`</${tag}>`, "g")) || []).length;
    const needClose = opens - selfClose;
    if (needClose !== closes) {
      out.push(`<${tag}> unbalanced — ${needClose} opening tag(s) need a close, found ${closes} </${tag}>`);
    }
  }
  return out;
}

// emotion="..." values not in the Cosmo enum (coerce to "encouraging" at runtime).
function invalidEmotionValues(body) {
  const bad = [];
  for (const m of body.matchAll(/emotion="([^"]*)"/g)) {
    if (!VALID_EMOTIONS.has(m[1])) bad.push(m[1]);
  }
  return bad;
}

// Shared validation gate. Returns { problems (FATAL → abort), warnings (non-fatal) }.
// Both unbalanced wrapper tags AND invalid Cosmo emotions are FATAL: the OS
// lessons were cleaned in both the repo and the external authoring source, so
// any future invalid emotion is a regression that must block the import.
function runGate(parsed) {
  const problems = [];
  const warnings = [];
  const seen = new Map();
  for (const p of parsed) {
    const o = p.fm.order;
    const n = Number(o);
    if (o == null || !Number.isInteger(n)) {
      problems.push(`${p.file}: missing/non-numeric 'order' (${JSON.stringify(o)})`);
      continue;
    }
    if (seen.has(n)) problems.push(`${p.file}: duplicate 'order' ${n} (also ${seen.get(n)})`);
    else seen.set(n, p.file);
    if (INTERACTIVE_SLOTS.has(n)) problems.push(`${p.file}: 'order' ${n} lands on an INTERACTIVE slot (lab/boss) — not allowed`);
    const badTags = unregisteredProseTags(p.body);
    if (badTags.length) problems.push(`${p.file}: unregistered JSX component(s) in prose: ${badTags.join(", ")}`);
    for (const t of tagBalanceProblems(p.body)) problems.push(`${p.file}: ${t}`);
    const emo = invalidEmotionValues(p.body);
    if (emo.length) {
      const uniq = [...new Set(emo)];
      problems.push(`${p.file}: invalid Cosmo emotion ${uniq.map((e) => `"${e}"`).join(", ")} (×${emo.length}) — must be one of ${[...VALID_EMOTIONS].join("/")}`);
    }
  }
  return { problems, warnings };
}

function reportGate({ problems, warnings }, { fatalLabel }) {
  if (warnings.length) {
    console.log(`⚠  ${warnings.length} emotion warning(s) (non-fatal):`);
    for (const w of warnings) console.log("   • " + w);
    console.log("");
  }
  if (problems.length) {
    console.error(`⛔ ${fatalLabel}\n`);
    for (const pr of problems) console.error("   • " + pr);
    process.exit(1);
  }
}

async function main() {
  // Dry-run mode: validate a folder of .mdx (no copy, no DB write).
  //   node scripts/import-os.mjs --validate-repo            (defaults to repo)
  //   node scripts/import-os.mjs --validate-repo "<dir>"    (any folder, e.g. external)
  if (process.argv.includes("--validate-repo")) {
    const idx = process.argv.indexOf("--validate-repo");
    const argDir = process.argv[idx + 1];
    const dir = argDir && !argDir.startsWith("--") ? argDir : DEST_DIR;
    const files = fs.readdirSync(dir)
      .filter((f) => f.toLowerCase().endsWith(".mdx") && !f.toLowerCase().endsWith("-simple.mdx"))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    const parsed = files.map((f) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, f), "utf-8"));
      return { file: f, fm: data, body: content.trim() };
    });
    console.log(`Validate-only: ${dir}`);
    console.log(`Files: ${files.length}\n`);
    const result = runGate(parsed);
    reportGate(result, { fatalLabel: "GATE FAILED" });
    console.log("✅ Gate PASSED — all files structurally valid (balanced wrapper tags, valid Cosmo emotions, no interactive collisions, no unregistered prose tags).");
    return;
  }

  const SRC_DIR = findCourse2Dir();
  console.log("DevPath RO — Course 2 import (Sisteme de Operare)");
  console.log("Source:     ", SRC_DIR);
  console.log("Dest (repo):", DEST_DIR);

  // ── Read + parse ──
  const files = fs.readdirSync(SRC_DIR)
    .filter((f) => f.toLowerCase().endsWith(".mdx") && !f.toLowerCase().endsWith("-simple.mdx"))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  if (files.length === 0) { console.error("❌  No .mdx files found. Aborting."); process.exit(1); }
  console.log(`\nFound ${files.length} .mdx files.\n`);

  const parsed = [];
  for (const f of files) {
    const raw = fs.readFileSync(path.join(SRC_DIR, f), "utf-8");
    const { data, content } = matter(raw);
    parsed.push({ file: f, fm: data, body: content.trim() });
  }

  // ── VALIDATION GATE (no writes yet) ──
  const result = runGate(parsed);
  reportGate(result, { fatalLabel: "VALIDATION FAILED — no files copied, no DB writes." });
  console.log("✅ Validation gate PASSED (order valid+unique, no interactive collisions, no unregistered prose tags, all wrapper components balanced, valid Cosmo emotions).\n");

  // ── Course id ──
  const { data: course, error: cErr } = await supabase
    .from("courses").select("id").eq("slug", COURSE_SLUG).single();
  if (cErr || !course) { console.error(`❌  Course '${COURSE_SLUG}' not found: ${cErr?.message}`); process.exit(1); }

  // ── BEFORE snapshot ──
  const { data: beforeRows } = await supabase
    .from("lessons").select("order_index,title,type,module_index,is_published,content_md")
    .eq("course_id", course.id).order("order_index");
  const beforeById = Object.fromEntries(beforeRows.map((r) => [r.order_index, r]));

  // Course 1 fingerprint (must stay identical)
  const { data: c1course } = await supabase.from("courses").select("id").eq("slug", "hardware-fizica").single();
  const c1Before = await supabase.from("lessons")
    .select("*", { count: "exact", head: true })
    .eq("course_id", c1course.id).eq("is_published", true);

  // ── Copy files into repo ──
  fs.mkdirSync(DEST_DIR, { recursive: true });
  let copied = 0;
  for (const p of parsed) {
    fs.copyFileSync(path.join(SRC_DIR, p.file), path.join(DEST_DIR, p.file));
    copied++;
  }
  console.log(`📁 Copied ${copied} files into ${path.relative(ROOT, DEST_DIR)}\n`);

  // ── DB writes (UPDATE matched lesson rows only) ──
  const results = [];
  for (const p of parsed) {
    const order = Number(p.fm.order);
    const { data: row } = await supabase
      .from("lessons").select("id,type,order_index")
      .eq("course_id", course.id).eq("order_index", order).maybeSingle();
    if (!row) { results.push({ order, status: "‼ no row", title: p.fm.title }); continue; }
    if (row.type !== "lesson") { results.push({ order, status: `‼ skipped (type=${row.type})`, title: p.fm.title }); continue; }

    const { error: upErr } = await supabase.from("lessons").update({
      content_md: p.body,
      title: p.fm.title,
      module_index: p.fm.module_index ?? 2,
      is_published: true,
    }).eq("id", row.id);
    results.push({ order, status: upErr ? `‼ ${upErr.message}` : "published", title: p.fm.title });
  }

  // ── AFTER snapshot ──
  const { data: afterRows } = await supabase
    .from("lessons").select("order_index,title,type,module_index,is_published,content_md")
    .eq("course_id", course.id).order("order_index");
  const c1After = await supabase.from("lessons")
    .select("*", { count: "exact", head: true })
    .eq("course_id", c1course.id).eq("is_published", true);

  // ── Report ──
  console.log("════════ BEFORE → AFTER (Sisteme de Operare) ════════");
  for (const r of afterRows) {
    const b = beforeById[r.order_index];
    const wasPub = b?.is_published ? "pub" : "unpub";
    const nowPub = r.is_published ? "pub" : "unpub";
    const changed = wasPub !== nowPub || (b?.title !== r.title) || (b?.module_index !== r.module_index);
    const mark = changed ? "✅" : "  ";
    const leftAlone = INTERACTIVE_SLOTS.has(r.order_index) || (r.order_index === 18);
    const note = leftAlone && !r.is_published ? "  ← left empty (expected)" : "";
    console.log(
      `${mark} ord${String(r.order_index).padStart(2)} [${r.type.padEnd(6)}] ${wasPub}→${nowPub}` +
      ` mod${b?.module_index ?? "-"}→${r.module_index ?? "-"} | ${r.title}${note}`
    );
  }

  const published = results.filter((r) => r.status === "published");
  console.log(`\n── Published this run: ${published.length} lessons ──`);
  for (const r of published.sort((a, b) => a.order - b.order)) {
    console.log(`   ord${String(r.order).padStart(2)}  ${r.title}`);
  }
  const failures = results.filter((r) => r.status !== "published");
  if (failures.length) {
    console.log(`\n⚠ Non-published results (${failures.length}):`);
    for (const r of failures) console.log(`   ord${r.order}: ${r.status}`);
  }

  // ── Untouched checks ──
  const osPublishedCount = afterRows.filter((r) => r.is_published).length;
  const stillEmpty = [10, 18, 19, 22].filter((o) => {
    const r = afterRows.find((x) => x.order_index === o);
    return r && r.is_published === false && (r.content_md ?? "").trim().length < 20;
  });
  console.log(`\n════════ INVARIANTS ════════`);
  console.log(`OS published now: ${osPublishedCount}/22 (expected 18)`);
  console.log(`Left empty/unpublished (expected 10,18,19,22): ${stillEmpty.join(", ") || "NONE — ‼ check"}`);
  console.log(`Course 1 (hardware-fizica) published rows: ${c1Before.count} → ${c1After.count} ${c1Before.count === c1After.count ? "✅ untouched" : "‼ CHANGED"}`);

  console.log(`\n🎉 Done.`);
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
