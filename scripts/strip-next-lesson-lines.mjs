/**
 * strip-next-lesson-lines.mjs — elimină pointer-ul redundant către lecția
 * următoare din fișierele MDX ale Cursului 1 (Hardware & Fizică).
 *
 * Fiecare lecție se termina cu o linie bold de forma "**Lecția N: titlu**".
 * CTA-ul către lecția următoare e acum un card în UI (lesson-page-client.tsx),
 * deci linia din conținut e redundantă.
 *
 * SIGURANȚĂ:
 *   - Elimină DOAR ultima linie ne-goală, și doar dacă se potrivește exact
 *     modelul bold "Lecția N: ...". Nimic altceva nu e atins.
 *   - Dacă rămâne un separator "---" agățat la final, îl elimină și pe el.
 *   - Idempotent — re-rularea nu mai are ce elimina.
 *   - Păstrează stilul de sfârșit de linie (LF/CRLF) al fișierului.
 *   - Originalele rămân intacte în C:\DevPATH-LECTII\ (recuperare: re-import).
 *
 * Rulează:        node scripts/strip-next-lesson-lines.mjs
 * Doar simulare:  node scripts/strip-next-lesson-lines.mjs --dry
 */

import fs from "node:fs";
import path from "node:path";

const DIR = "C:/DevPath RO/content/courses/hardware-fizica";
const DRY = process.argv.includes("--dry");

// Linie care e în întregime un bold "Lecția <număr>: <titlu>".
// Acceptă ț (U+021B), ţ (U+0163) și t simplu.
const NEXT_LESSON_RE = /^\s*\*\*\s*Lec[țtţ]ia\s+\d+\s*:.*\*\*\s*$/iu;
// Separator orizontal Markdown (---, ***, ___).
const HR_RE = /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/;

function dropTrailingBlank(lines) {
  while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
    lines.pop();
  }
}

function main() {
  if (!fs.existsSync(DIR)) {
    console.error(`EROARE: directorul nu există: ${DIR}`);
    process.exit(1);
  }

  console.log(
    `Curățare pointer "Lecția următoare"${DRY ? "  [DRY-RUN]" : ""}\n` +
      `Director: ${DIR}\n`
  );

  const files = fs
    .readdirSync(DIR)
    .filter((f) => f.toLowerCase().endsWith(".mdx"))
    .sort();

  let stripped = 0;
  let untouched = 0;

  for (const file of files) {
    const filePath = path.join(DIR, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const eol = raw.includes("\r\n") ? "\r\n" : "\n";
    const lines = raw.split(/\r?\n/);

    dropTrailingBlank(lines);
    const removed = [];

    // 1) linia bold "Lecția N: ..."
    if (lines.length > 0 && NEXT_LESSON_RE.test(lines[lines.length - 1])) {
      removed.push(lines.pop());
      dropTrailingBlank(lines);
      // 2) un separator "---" rămas agățat la final devine inutil
      if (lines.length > 0 && HR_RE.test(lines[lines.length - 1])) {
        removed.push(lines.pop());
        dropTrailingBlank(lines);
      }
    }

    if (removed.length === 0) {
      console.log(`-  ${file} — nicio linie finală "Lecția N: ...", neschimbat`);
      untouched++;
      continue;
    }

    if (!DRY) {
      fs.writeFileSync(filePath, lines.join(eol) + eol, "utf-8");
    }
    stripped++;
    console.log(`✓  ${file}`);
    for (const r of removed) console.log(`     eliminat:   ${r.trim()}`);
    console.log(`     final nou:  ${lines[lines.length - 1]?.trim() ?? "(gol)"}`);
  }

  console.log(
    `\nRezumat: ${stripped} curățate · ${untouched} neschimbate · ${files.length} fișiere.`
  );
  if (stripped > 0 && !DRY) {
    console.log(
      "\n⚠  Re-rulează sincronizarea — DB-ul are încă vechiul content_md."
    );
  }
}

main();
