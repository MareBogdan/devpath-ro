import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function loadEnv() {
  const p = path.join(ROOT, ".env.local");
  if (!fs.existsSync(p)) { console.error("No .env.local"); process.exit(1); }
  for (const line of fs.readFileSync(p, "utf-8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const [k, ...r] = t.split("=");
    if (k && r.length) process.env[k.trim()] = r.join("=").trim();
  }
}
loadEnv();
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) { console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY"); process.exit(1); }
const supabase = createClient(URL, KEY, { auth: { persistSession: false } });

const FOLDERS = [
  "hardware-fizica",
  "sisteme-de-operare",
  "retele-internet",
  "python-inginerie-software",
  "algoritmi-structuri-date",
  "matematica-ai",
];

async function main() {
  console.log("Importing all authored content...\n");
  let grand = 0;
  const summary = [];
  for (const slug of FOLDERS) {
    const { data: course } = await supabase.from("courses").select("id").eq("slug", slug).single();
    if (!course) { console.log(`SKIP ${slug} (course not found in DB)`); summary.push([slug, 0]); continue; }
    const dir = path.join(ROOT, "content", "courses", slug);
    if (!fs.existsSync(dir)) { console.log(`${slug}: 0 (no folder)`); summary.push([slug, 0]); continue; }
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".mdx") && !f.endsWith("-simple.mdx")).sort();
    let n = 0;
    for (const file of files) {
      try {
        const { data: fm, content } = matter(fs.readFileSync(path.join(dir, file), "utf-8"));
        if (!fm.title || fm.order == null || !fm.type) { console.log(`  skip ${file} (frontmatter title/order/type)`); continue; }
        const row = { course_id: course.id, title: fm.title, content_md: content.trim(), type: fm.type, order_index: fm.order, is_published: true };
        const { data: ex } = await supabase.from("lessons").select("id").eq("course_id", course.id).eq("order_index", fm.order).maybeSingle();
        if (ex) { const { error } = await supabase.from("lessons").update(row).eq("id", ex.id); if (error) throw new Error(error.message); }
        else { const { error } = await supabase.from("lessons").insert(row); if (error) throw new Error(error.message); }
        n++;
      } catch (e) { console.log(`  ERR ${file}: ${e.message}`); }
    }
    console.log(`${slug}: ${n} lessons`);
    summary.push([slug, n]); grand += n;
  }
  console.log("\n─────────────");
  summary.forEach(([s, n]) => console.log(`  ${s}: ${n}`));
  console.log(`TOTAL: ${grand} lessons imported`);
}
main().catch(e => { console.error(e); process.exit(1); });
