#!/usr/bin/env node
// Compile every lesson .mdx exactly as the lesson page does (tier 1: as written) and fail on any
// error. The validator does not compile MDX, so a stray "<B" or a mismatched <Sub>…</sub> passes it
// and then falls back to raw text on the live page (see src/lib/mdx-sanitize.ts).
//   node scripts/check-mdx-compile.mjs [course-slug | path/to/lesson.mdx]...   (default: every course)
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL, fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(root, "package.json"));
const { serialize } = require("next-mdx-remote/serialize");
const matter = require("gray-matter");
const load = async (name) => (await import(pathToFileURL(require.resolve(name)).href)).default;
const mdxOptions = {
  remarkPlugins: [await load("remark-gfm"), await load("remark-math")],
  rehypePlugins: [await load("rehype-highlight"), await load("rehype-katex")],
};

const coursesDir = path.join(root, "content", "courses");
const args = process.argv.slice(2);
const files = [];
const addDir = (d) => fs.readdirSync(d).filter((f) => f.endsWith(".mdx")).sort().forEach((f) => files.push(path.join(d, f)));
if (args.length === 0) fs.readdirSync(coursesDir).forEach((c) => fs.statSync(path.join(coursesDir, c)).isDirectory() && addDir(path.join(coursesDir, c)));
for (const a of args) {
  if (a.endsWith(".mdx")) files.push(path.resolve(a));
  else addDir(path.join(coursesDir, a));
}

let bad = 0;
for (const f of files) {
  const { content } = matter(fs.readFileSync(f, "utf8"));
  try {
    await serialize(content, { mdxOptions });
  } catch (e) {
    bad++;
    console.log(`FAIL ${path.relative(root, f)}\n     ${String(e).split("\n").slice(1, 3).join(" | ")}`);
  }
}
console.log(`${files.length} lesson(s) compiled · ${bad} failure(s)`);
process.exit(bad ? 1 : 0);
