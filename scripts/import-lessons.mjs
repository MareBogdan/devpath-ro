/**
 * import-lessons.mjs — importă lecțiile MDX pentru Cursul 1 (Hardware & Fizică).
 *
 * Citește toate fișierele .mdx din SRC_DIR, extrage `order` și `title` din
 * frontmatter (gray-matter) și le copiază în DEST_DIR redenumite după modelul
 *   l{order:02d}-{slug}.mdx
 *
 * Slug: title lowercase, diacritice RO normalizate (ă/â→a, î→i, ș→s, ț→t),
 * iar orice secvență de caractere care nu e [a-z0-9] (spații, punctuație) →
 * cratimă. Punctuația trebuie eliminată: titlurile conțin `?`, `:`, `(`, `)`,
 * iar `?` și `:` sunt ilegale în nume de fișier pe Windows.
 *
 * Reguli: sare fișierele fără `order` (cu avertisment); nu suprascrie fișiere
 * existente. Idempotent — sigur de rulat de mai multe ori.
 *
 * Rulează:  node scripts/import-lessons.mjs
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const SRC_DIR = "C:/DevPATH-LECTII";
const DEST_DIR = "C:/DevPath RO/content/courses/hardware-fizica";

/** Transformă un titlu într-un slug sigur pentru nume de fișier. */
function slugify(title) {
  return String(title)
    .toLowerCase()
    .replace(/[ăâ]/g, "a")
    .replace(/î/g, "i")
    .replace(/[șş]/g, "s") // U+0219 (virgulă) și U+015F (sedilă)
    .replace(/[țţ]/g, "t") // U+021B (virgulă) și U+0163 (sedilă)
    .replace(/[^a-z0-9]+/g, "-") // spații + orice altă punctuație → cratimă
    .replace(/^-+|-+$/g, ""); // fără cratime la capete
}

function printTable(rows) {
  const headers = {
    order: "ORDER",
    src: "FISIER SURSA",
    dest: "FISIER DESTINATIE",
    status: "STATUS",
  };
  const cols = ["order", "src", "dest", "status"];
  const width = {};
  for (const c of cols) {
    width[c] = Math.max(
      headers[c].length,
      ...rows.map((r) => String(r[c]).length)
    );
  }
  const fmt = (r) => cols.map((c) => String(r[c]).padEnd(width[c])).join("  ");
  console.log("\n" + fmt(headers));
  console.log(cols.map((c) => "-".repeat(width[c])).join("  "));
  for (const r of rows) console.log(fmt(r));
}

function main() {
  console.log("DevPath RO — import lecții Cursul 1 (Hardware & Fizică)");
  console.log(`Sursă:      ${SRC_DIR}`);
  console.log(`Destinație: ${DEST_DIR}`);

  if (!fs.existsSync(SRC_DIR) || !fs.statSync(SRC_DIR).isDirectory()) {
    console.error(`\nEROARE: directorul sursă nu există: ${SRC_DIR}`);
    process.exit(1);
  }
  fs.mkdirSync(DEST_DIR, { recursive: true });

  const files = fs
    .readdirSync(SRC_DIR)
    .filter((f) => f.toLowerCase().endsWith(".mdx"))
    .sort();

  if (files.length === 0) {
    console.log(`\nNiciun fișier .mdx găsit în ${SRC_DIR}.`);
    return;
  }

  const rows = [];
  let copied = 0;
  let skippedExisting = 0;
  let skippedNoOrder = 0;
  let errors = 0;

  for (const file of files) {
    const srcPath = path.join(SRC_DIR, file);

    let data;
    try {
      ({ data } = matter(fs.readFileSync(srcPath, "utf-8")));
    } catch (err) {
      console.warn(`⚠  ${file}: frontmatter invalid — ${err.message}`);
      rows.push({ order: "?", src: file, dest: "—", status: "EROARE parsare" });
      errors++;
      continue;
    }

    const order = data.order;
    if (order == null || !Number.isFinite(Number(order))) {
      console.warn(`⚠  ${file}: câmpul 'order' lipsește sau e invalid — sărit.`);
      rows.push({
        order: "?",
        src: file,
        dest: "—",
        status: "SARIT (lipsa order)",
      });
      skippedNoOrder++;
      continue;
    }

    const padded = String(Number(order)).padStart(2, "0");

    const title = data.title;
    if (title == null || String(title).trim() === "") {
      console.warn(`⚠  ${file}: 'title' lipsește — folosesc slug 'fara-titlu'.`);
    }
    const slug = slugify(title ?? "fara-titlu") || "fara-titlu";
    const destName = `l${padded}-${slug}.mdx`;
    const destPath = path.join(DEST_DIR, destName);

    if (fs.existsSync(destPath)) {
      console.warn(`⚠  ${destName}: există deja — nu suprascriu.`);
      rows.push({
        order: padded,
        src: file,
        dest: destName,
        status: "SARIT (exista deja)",
      });
      skippedExisting++;
      continue;
    }

    fs.copyFileSync(srcPath, destPath);
    rows.push({ order: padded, src: file, dest: destName, status: "copiat" });
    copied++;
  }

  rows.sort((a, b) => String(a.order).localeCompare(String(b.order)));
  printTable(rows);

  console.log(
    `\nRezumat: ${copied} copiate · ${skippedExisting} sărite (există deja) · ` +
      `${skippedNoOrder} sărite (lipsă order)` +
      (errors ? ` · ${errors} erori` : "") +
      ` · ${files.length} fișiere .mdx procesate.`
  );
}

main();
