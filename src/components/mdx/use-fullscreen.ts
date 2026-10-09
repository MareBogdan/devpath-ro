"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Shared fullscreen behaviour for interactive lesson blocks (extracted from the
 * BinaryTranslator, which used to carry its own copy).
 *
 * - Uses the native Fullscreen API on the target element when the browser has it.
 * - Falls back to an overlay (`isOverlay`) where it doesn't — notably iPhone Safari,
 *   which has no element fullscreen. The overlay element is promoted to the browser's
 *   TOP LAYER with the Popover API (same DOM node → game state survives, and nothing
 *   later in the page — sticky nav, chat bubble, other stacking contexts — can paint
 *   over it). Browsers without Popover get a plain `fixed inset-0 z-[9999]` overlay
 *   (the consumer styles that). The hook tracks state, Escape, and the scroll lock.
 * - On phones it asks for a landscape orientation lock (Android Chrome honours it
 *   while fullscreen; elsewhere the request is silently ignored).
 */

type ScreenOrientationLock = {
  lock?: (orientation: string) => Promise<void>;
  unlock?: () => void;
};

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

function orientation(): ScreenOrientationLock | null {
  if (typeof screen === "undefined") return null;
  return (screen.orientation as unknown as ScreenOrientationLock) ?? null;
}

type PopoverElement = HTMLElement & {
  showPopover?: () => void;
  hidePopover?: () => void;
};

function supportsPopover(el: HTMLElement): boolean {
  return typeof (el as PopoverElement).showPopover === "function";
}

function isPhoneLike(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 900px) and (pointer: coarse)").matches
  );
}

export function useFullscreen<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isNative, setIsNative] = useState(false);
  const [isOverlay, setIsOverlay] = useState(false);
  const isFullscreen = isNative || isOverlay;

  const lockLandscape = useCallback(() => {
    if (!isPhoneLike()) return;
    void orientation()?.lock?.("landscape")?.catch(() => undefined);
  }, []);

  const unlockOrientation = useCallback(() => {
    try {
      orientation()?.unlock?.();
    } catch {
      /* not locked / unsupported */
    }
  }, []);

  // Keep state in sync with the browser (covers ESC and F11 exits).
  useEffect(() => {
    const handler = () => {
      const active = document.fullscreenElement === ref.current;
      setIsNative(active);
      if (!active) unlockOrientation();
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, [unlockOrientation]);

  const closePopover = useCallback(() => {
    const el = ref.current as PopoverElement | null;
    if (!el || !el.hasAttribute("popover")) return;
    try {
      el.hidePopover?.();
    } catch {
      /* already hidden */
    }
    el.removeAttribute("popover");
  }, []);

  const exit = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    closePopover();
    setIsOverlay(false);
    unlockOrientation();
  }, [closePopover, unlockOrientation]);

  const enter = useCallback(async () => {
    const el = ref.current as FullscreenElement | null;
    if (!el) return;
    const request = el.requestFullscreen ?? el.webkitRequestFullscreen;
    if (request) {
      try {
        await request.call(el);
        lockLandscape();
        return;
      } catch {
        /* denied / unsupported → fall through to the overlay */
      }
    }
    // Overlay: top layer via Popover where available (attribute + show in the same
    // task, so the element never flashes hidden), plain fixed overlay otherwise.
    if (supportsPopover(el)) {
      try {
        el.setAttribute("popover", "manual");
        (el as PopoverElement).showPopover?.();
      } catch {
        el.removeAttribute("popover");
      }
    }
    setIsOverlay(true);
    lockLandscape();
  }, [lockLandscape]);

  const toggle = useCallback(() => {
    if (isFullscreen) exit();
    else void enter();
  }, [isFullscreen, enter, exit]);

  // Overlay fallback: Escape closes it, and the page behind must not scroll.
  useEffect(() => {
    if (!isOverlay) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") exit();
    };
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      root.style.overflow = prev;
    };
  }, [isOverlay, exit]);

  // Never leave the element stuck in the top layer if the frame unmounts mid-overlay.
  useEffect(() => closePopover, [closePopover]);

  return { ref, isFullscreen, isOverlay, enter, exit, toggle };
}

/** True on a phone held upright — where the boards are too narrow to read. */
export function usePortraitPhone(): boolean {
  const [portraitPhone, setPortraitPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(orientation: portrait) and (max-width: 767px)");
    const update = () => setPortraitPhone(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return portraitPhone;
}
