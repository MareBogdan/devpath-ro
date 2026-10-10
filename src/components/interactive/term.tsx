"use client";

// <Term def="…">cuvânt</Term> — a word in running text that opens a short, contextual
// definition on demand. The definition lives in the MDX next to the word (decision
// D1), not in glossar_terms.
//
// Behaviour
//  • Click / tap / Enter / Space opens the card; click or tap outside, Esc, or scrolling
//    a container that holds the term closes it. Only one card is open at a time.
//    No hover state anywhere, so it behaves identically on touch.
//  • Findable by eye (standard §4a), still text rather than a button: a 2px dotted underline at
//    full violet, a permanently visible faint tint (so it reads as a region, not a stray
//    underline) and a small dot after the word as the affordance marker. It wraps across lines
//    like any inline text (it is a <span>, not a <button> — a button would be an unbreakable
//    inline-block); box-decoration-break:clone repeats the tint padding on every line.
//  • The card is portalled to <body> and positioned in document coordinates, so it
//    is never clipped by a table's overflow-x wrapper and never changes the layout of
//    the paragraph, list item or table cell the term sits in.
//  • Hydration-safe: the server and the first client render are the same (just the span,
//    no ids, no randomness); the card exists only after a click, in a component that
//    is mounted client-side only.
//
// Visual language: the card reuses WowNote's "term" kind (violet accent, BookOpen,
// "Termen" chip, Aurora card background) — one look for term cards across the app.
//
// AUTHORING: always the string form def="…" (next-mdx-remote drops expression-valued
// attributes), one or two sentences, no straight double quotes inside the value (use
// „…” or a single quote).

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { KIND_STYLE } from "@/components/interactive/wow-note";

const OPEN_EVENT = "devpath:term-open";
const CARD_MAX_WIDTH = 320;
const GUTTER = 12;
const GAP = 8;

interface TermProps {
  def?: string;
  children?: ReactNode;
}

export function Term({ def, children }: TermProps) {
  const id = useId();
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  // Only one card at a time: opening another term (or this one) announces itself.
  useEffect(() => {
    if (!open) return;
    function onOtherOpened(e: Event) {
      if ((e as CustomEvent<string>).detail !== id) setOpen(false);
    }
    window.addEventListener(OPEN_EVENT, onOtherOpened);
    return () => window.removeEventListener(OPEN_EVENT, onOtherOpened);
  }, [open, id]);

  // No definition authored → behave as plain text rather than a dead control.
  if (!def) return <>{children}</>;

  function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: id }));
    setOpen(true);
  }

  function onKeyDown(e: KeyboardEvent<HTMLSpanElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  }

  return (
    <>
      <span
        ref={anchorRef}
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        data-open={open ? "true" : undefined}
        onClick={toggle}
        onKeyDown={onKeyDown}
        className="cursor-pointer rounded-[3px] bg-[#6C5CE7]/[0.06] pl-[0.15em] pr-[0.08em] underline decoration-[#6C5CE7] decoration-dotted decoration-2 underline-offset-[5px] [box-decoration-break:clone] transition-colors after:ml-[0.16em] after:inline-block after:h-[0.4em] after:w-[0.4em] after:rounded-full after:bg-[#6C5CE7] after:align-[0.5em] after:content-[''] hover:bg-[#6C5CE7]/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7]/60 data-[open=true]:bg-[#6C5CE7]/[0.2] dark:bg-[#A78BFA]/[0.08] dark:decoration-[#A78BFA] dark:after:bg-[#A78BFA] dark:hover:bg-[#A78BFA]/[0.16] dark:data-[open=true]:bg-[#A78BFA]/[0.22]"
      >
        {children}
      </span>
      {open && (
        <TermCard id={id} anchorRef={anchorRef} def={def} onClose={close}>
          {children}
        </TermCard>
      )}
    </>
  );
}

function TermCard({
  id,
  anchorRef,
  def,
  onClose,
  children,
}: {
  id: string;
  anchorRef: React.RefObject<HTMLSpanElement>;
  def: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const k = KIND_STYLE.term;
  const Icon = k.Icon;

  // Position in DOCUMENT coordinates (so the card scrolls with the page): centred under
  // the term, clamped to the viewport, flipped above when there is no room below.
  const place = useCallback(() => {
    const anchor = anchorRef.current;
    const card = cardRef.current;
    if (!anchor || !card) return;
    const r = anchor.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const width = Math.min(CARD_MAX_WIDTH, vw - GUTTER * 2);
    const left = Math.max(
      GUTTER,
      Math.min(r.left + r.width / 2 - width / 2, vw - width - GUTTER)
    );
    const h = card.offsetHeight;
    const roomBelow = window.innerHeight - r.bottom;
    const flip = roomBelow < h + GAP + GUTTER && r.top > h + GAP + GUTTER;
    const top = flip ? r.top - h - GAP : r.bottom + GAP;
    setPos({ top: top + window.scrollY, left: left + window.scrollX, width });
  }, [anchorRef]);

  useLayoutEffect(() => {
    place();
  }, [place]);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      const t = e.target as Node | null;
      if (!t) return;
      if (cardRef.current?.contains(t) || anchorRef.current?.contains(t)) return;
      onClose();
    }
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key !== "Escape") return;
      onClose();
      // Hand focus back to the word if it was in play.
      if (document.activeElement === document.body || cardRef.current?.contains(document.activeElement)) {
        anchorRef.current?.focus();
      }
    }
    function onScroll(e: Event) {
      // Page scroll moves card and term together; a scrollable ancestor (e.g. a wide
      // table) moves only the term — close in that case.
      const t = e.target;
      if (t instanceof Node && t !== document && !cardRef.current?.contains(t)) onClose();
    }
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKey);
    document.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", place);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", place);
    };
  }, [anchorRef, onClose, place]);

  return createPortal(
    <div
      ref={cardRef}
      id={id}
      role="dialog"
      aria-modal="false"
      aria-label="Definiție"
      style={{
        position: "absolute",
        top: pos?.top ?? 0,
        left: pos?.left ?? 0,
        width: pos?.width ?? CARD_MAX_WIDTH,
        visibility: pos ? "visible" : "hidden",
      }}
      className="z-50 rounded-xl border border-border border-l-[3px] border-l-[#6C5CE7] bg-[color:var(--aurora-bg-card)] bg-[linear-gradient(rgba(108,92,231,0.07),rgba(108,92,231,0.07))] p-4 text-left shadow-[var(--aurora-shadow-lg)] animate-in fade-in-0 zoom-in-95 duration-150 motion-reduce:animate-none"
    >
      {/* chip colour: WowNote's pale violet is for its own card; on the white light-mode card it needs the deeper Aurora violet */}
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#5B4BD6] dark:text-[#A78BFA]">
        <Icon className="h-3.5 w-3.5" aria-hidden /> {k.label}
      </div>
      <p className="m-0 text-sm font-semibold leading-snug text-foreground">{children}</p>
      <p className="mb-0 mt-1.5 text-sm leading-relaxed text-foreground/80">{def}</p>
    </div>,
    document.body
  );
}
