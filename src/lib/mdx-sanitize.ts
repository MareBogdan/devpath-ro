/**
 * Repair for a common MDX authoring slip: a literal "<" in prose that is not the
 * start of a JSX tag — "<1ms", "<5 secunde", "x <= y" — which MDX rejects with
 * "Unexpected character `1` before name".
 *
 * Escapes those "<" as `&lt;` in PROSE only. Fenced code blocks (``` / ~~~) and
 * inline code spans are left untouched (MDX never parses JSX inside them), and
 * real JSX / fragments (`<Comp`, `</Comp`, `<>`) are preserved.
 *
 * Used as a retry step when the original lesson fails to compile — valid lessons
 * are never rewritten.
 */
export function escapeStrayAngleBrackets(markdown: string): string {
  let fence: string | null = null; // the opening fence marker while inside a code block

  return markdown
    .split("\n")
    .map((line) => {
      const fenceMatch = line.match(/^\s{0,3}(`{3,}|~{3,})/);
      if (fenceMatch) {
        const marker = fenceMatch[1];
        if (fence === null) fence = marker;
        else if (marker[0] === fence[0] && marker.length >= fence.length) fence = null;
        return line;
      }
      if (fence !== null) return line;

      // Odd indices of the split are inline-code spans — keep them verbatim.
      return line
        .split(/(`+[^`]*`+)/)
        .map((part, i) =>
          i % 2 === 1 ? part : part.replace(/<(?![A-Za-z/>_$])/g, "&lt;")
        )
        .join("");
    })
    .join("\n");
}
