import { Fragment, type ReactNode } from "react";

/**
 * Inline-question strings (prompt, options, pairs, explanation…) are plain text in the DB.
 * The one piece of markup they may carry is an explicit `<Sub>…</Sub>` subscript — the same
 * tag the MDX lessons use (`V<Sub>GS</Sub>`) — never an automatic `X_Y` transform.
 * Parsed here into real <sub> elements; no HTML is ever injected.
 */
const SUB_RE = /<Sub>([^<]{1,12})<\/Sub>/g;

export function RichText({ text }: { text: string }): ReactNode {
  if (!text.includes("<Sub>")) return text;
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of Array.from(text.matchAll(SUB_RE))) {
    const at = m.index ?? 0;
    if (at > last) out.push(<Fragment key={key++}>{text.slice(last, at)}</Fragment>);
    out.push(<sub key={key++}>{m[1]}</sub>);
    last = at + m[0].length;
  }
  if (last < text.length) out.push(<Fragment key={key++}>{text.slice(last)}</Fragment>);
  return <>{out}</>;
}

/** The same string with the markup removed — for aria-labels and live-region announcements. */
export function plainText(text: string): string {
  return text.replace(SUB_RE, "$1");
}
