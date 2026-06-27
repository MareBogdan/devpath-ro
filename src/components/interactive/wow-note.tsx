"use client";

// <WowNote n="1" /> — MDX-embedded contextual "wow" note. Resolves the note whose
// order_index === n from context (WowNotesProvider) and renders it as an inline
// card in the reading column — FactBox visual language, but a TEAL accent so notes
// read as their own thing. Read-only: no per-user state, no submit, no gating.
//
// AUTHORING: write the STRING form `n="1"`, NOT `n={1}` — next-mdx-remote v6's
// serialize() drops JSX expression-valued attributes at compile time (same caveat
// as <InlineQuestion>). Place each <WowNote> on its OWN line (block) in MDX.
//
// This slice renders the card inline in the single 680px reading column (which is
// ALSO the mobile presentation). The desktop lateral gutter is a separate layout
// task and is intentionally NOT done here — no width/grid changes live in here.

import { AlertTriangle, Sparkles } from "lucide-react";
import { useWowNotes } from "@/components/interactive/wow-notes-context";
import { WOW_NOTE_COMPONENTS } from "@/components/interactive/wow-note-components";
import type { WowNote as WowNoteRow } from "@/types";

// Coerce the `n` attribute to an order_index — accepts a number (1) or a string
// ("1"); extracts the first integer. Mirrors <InlineQuestion>'s resolveOrder so
// both forms resolve under any pipeline that delivers the prop.
function resolveOrder(n: number | string): number | null {
  if (typeof n === "number") return Number.isFinite(n) ? n : null;
  const match = String(n).match(/-?\d+/);
  return match ? parseInt(match[0], 10) : null;
}

export function WowNote({ n }: { n: number | string }) {
  const { getByOrder } = useWowNotes();
  const order = resolveOrder(n);
  const note = order !== null ? getByOrder(order) : undefined;

  if (!note) {
    return (
      <AuthoringErrorBox
        message={`Nu există niciun Wow Note cu order_index=${String(n)} în această lecție. Folosește forma cu ghilimele: <WowNote n="1" />.`}
      />
    );
  }

  return <WowNoteCard note={note} />;
}

function WowNoteCard({ note }: { note: WowNoteRow }) {
  return (
    // data-wow-note: on desktop-with-notes the prose div becomes a grid and this card
    // is excluded from the col-1 pin and lands in the right gutter (col 2). Below xl:
    // or outside a grid these classes are inert and the card renders inline as before.
    // self-start so a tall note doesn't stretch its grid row.
    <div data-wow-note className="relative my-7 xl:col-start-2 xl:self-start">
      {/* teal glow on the left edge — Wow Notes' accent (vs FactBox's violet) */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-3 left-0 w-[3px] rounded-full bg-gradient-to-b from-[#00CEC9] via-[#5fe9e0] to-[#00CEC9] blur-[6px] animate-pulse motion-reduce:animate-none"
      />
      <div className="relative rounded-xl border border-border border-l-[3px] border-l-[#00CEC9] bg-[#00CEC9]/[0.07] p-5 shadow-[0_0_12px_2px_rgba(0,206,201,0.28)]">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#00CEC9]">
          <Sparkles className="h-3.5 w-3.5" /> Wow
        </div>
        <p className="m-0 text-base font-semibold text-foreground">{note.title}</p>
        {note.body && (
          <p className="mb-0 mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/80">
            {note.body}
          </p>
        )}
        <WowNoteMedia note={note} />
      </div>
    </div>
  );
}

function WowNoteMedia({ note }: { note: WowNoteRow }) {
  // none, or media_ref absent (DB CHECK guarantees ref when type !== none): nothing.
  if (note.media_type === "none" || !note.media_ref) return null;

  if (note.media_type === "svg") {
    // media_ref is an asset path under /public (e.g. "/wow/atom.svg"). next/image
    // needs known dimensions; a static illustration path is fine as a plain <img>.
    return (
      // eslint-disable-next-line @next/next/no-img-element -- static /public asset, dims unknown
      <img
        src={note.media_ref}
        alt={note.title}
        loading="lazy"
        className="mt-3 max-h-48 w-auto rounded-lg"
      />
    );
  }

  if (note.media_type === "component") {
    const Comp = WOW_NOTE_COMPONENTS[note.media_ref];
    if (!Comp) {
      return (
        <AuthoringErrorBox
          message={`Componentă Wow Note necunoscută: „${note.media_ref}". Înregistreaz-o în WOW_NOTE_COMPONENTS.`}
        />
      );
    }
    return (
      <div className="mt-3">
        <Comp />
      </div>
    );
  }

  return null;
}

function AuthoringErrorBox({ message }: { message: string }) {
  return (
    <div className="my-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>⚠️ {message}</span>
    </div>
  );
}
