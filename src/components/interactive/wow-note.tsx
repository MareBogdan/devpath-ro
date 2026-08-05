"use client";

// <WowNote n="1" /> — MDX-embedded contextual side-note. Resolves the note whose
// order_index === n from context (WowNotesProvider) and floats it into the LEFT or
// RIGHT page margin (per note.side) on wide screens; inline full-width otherwise.
// Read-only: no per-user state, no submit, no gating.
//
// Three visual KINDS (note.kind) give variety so notes don't all look the same:
//   • insight  — teal  "Wow"      (a surprising takeaway / aha)
//   • term     — violet "Termen"  (definition of a niche word, placed near it)
//   • analogy  — amber "Analogie" (a real-life comparison)
//
// AUTHORING: write the STRING form `n="1"`, NOT `n={1}` — next-mdx-remote v6's
// serialize() drops JSX expression-valued attributes at compile time. Place each
// <WowNote> on its OWN line (block) in MDX, right after the sentence it explains.

import { AlertTriangle, Sparkles, BookOpen, Lightbulb } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useWowNotes } from "@/components/interactive/wow-notes-context";
import { WOW_NOTE_COMPONENTS } from "@/components/interactive/wow-note-components";
import type { WowNote as WowNoteRow, WowNoteKind, WowNoteSide } from "@/types";

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

// Per-kind visual config. Literal Tailwind class strings (JIT-safe — no dynamic
// interpolation of color tokens).
const KIND_STYLE: Record<
  WowNoteKind,
  { label: string; Icon: LucideIcon; wrap: string; glow: string; chip: string }
> = {
  insight: {
    label: "Wow",
    Icon: Sparkles,
    wrap: "border-l-[#00CEC9] bg-[color:var(--aurora-bg-card)] bg-[linear-gradient(rgba(0,206,201,0.07),rgba(0,206,201,0.07))] shadow-[0_0_12px_2px_rgba(0,206,201,0.26)]",
    glow: "from-[#00CEC9] via-[#5fe9e0] to-[#00CEC9]",
    chip: "text-[#00CEC9]",
  },
  term: {
    label: "Termen",
    Icon: BookOpen,
    wrap: "border-l-[#6C5CE7] bg-[color:var(--aurora-bg-card)] bg-[linear-gradient(rgba(108,92,231,0.07),rgba(108,92,231,0.07))] shadow-[0_0_12px_2px_rgba(108,92,231,0.26)]",
    glow: "from-[#6C5CE7] via-[#a78bfa] to-[#6C5CE7]",
    chip: "text-[#A78BFA]",
  },
  analogy: {
    label: "Analogie",
    Icon: Lightbulb,
    wrap: "border-l-[#F5A623] bg-[color:var(--aurora-bg-card)] bg-[linear-gradient(rgba(245,166,35,0.07),rgba(245,166,35,0.07))] shadow-[0_0_12px_2px_rgba(245,166,35,0.22)]",
    glow: "from-[#F5A623] via-[#ffcf7a] to-[#F5A623]",
    chip: "text-[#F5A623]",
  },
};

// Which page margin the note floats into on wide screens (>=1360px). Below that
// it renders inline full-width (identical on mobile). Negative margin pulls the
// card entirely into the margin so the reading text keeps its full width (no gap).
const SIDE_FLOAT: Record<WowNoteSide, string> = {
  right:
    "min-[1360px]:float-right min-[1360px]:clear-right min-[1360px]:-mr-[336px]",
  left: "min-[1360px]:float-left min-[1360px]:clear-left min-[1360px]:-ml-[336px]",
};

function WowNoteCard({ note }: { note: WowNoteRow }) {
  const k = KIND_STYLE[note.kind] ?? KIND_STYLE.insight;
  const side = SIDE_FLOAT[note.side] ?? SIDE_FLOAT.right;
  const Icon = k.Icon;

  return (
    <div className={`relative my-6 min-[1360px]:my-3 min-[1360px]:w-[300px] ${side}`}>
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-y-3 left-0 w-[3px] rounded-full bg-gradient-to-b ${k.glow} blur-[6px] animate-pulse motion-reduce:animate-none`}
      />
      <div className={`relative rounded-xl border border-border border-l-[3px] p-5 ${k.wrap}`}>
        <div className={`mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${k.chip}`}>
          <Icon className="h-3.5 w-3.5" /> {k.label}
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
  if (note.media_type === "none" || !note.media_ref) return null;

  if (note.media_type === "svg") {
    // media_ref is an asset path under /public (e.g. "/wow/atom.svg"). Rendered at
    // full card width so the diagram + its labels stay legible.
    return (
      // eslint-disable-next-line @next/next/no-img-element -- static /public asset, dims unknown
      <img
        src={note.media_ref}
        alt={note.title}
        loading="lazy"
        className="mt-3 w-full rounded-lg"
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
