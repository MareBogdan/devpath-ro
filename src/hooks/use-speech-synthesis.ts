"use client";

import { useCallback, useRef, useState } from "react";

// ── Markdown stripper ────────────────────────────────────────────────────────
// Removes formatting syntax so TTS reads clean, natural-sounding prose.
// Also saves tokens — we only send plain text to the API.
function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "cod omis") // fenced code blocks → brief label
    .replace(/`[^`\n]+`/g, "") // inline code
    .replace(/^#{1,6}\s+/gm, "") // ATX headings
    .replace(/\*\*([^*]+)\*\*/g, "$1") // **bold**
    .replace(/\*([^*\n]+)\*/g, "$1") // *italic*
    .replace(/_([^_\n]+)_/g, "$1") // _italic_
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [link text](url)
    .replace(/^[-*+]\s+/gm, "") // unordered list bullets
    .replace(/^\d+\.\s+/gm, "") // ordered list numbers
    .replace(/^>\s+/gm, "") // blockquotes
    .replace(/\n{2,}/g, ". ") // paragraph breaks → natural pause
    .replace(/\n/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export interface UseSpeechSynthesisReturn {
  isSupported: boolean;
  isSpeaking: boolean;
  speak: (text: string) => void;
  stop: () => void;
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  // AbortController for the in-flight fetch — lets stop() cancel it immediately
  const abortControllerRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    // 1. Cancel any in-flight /api/ai/tts fetch so its resolved blob never plays
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    // 2. Stop and detach the current Audio element
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onplay = null;
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }
    // 3. Revoke the blob URL to free memory
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    async (text: string) => {
      // Always stop + abort previous call before starting a new one.
      // This prevents the race condition where two concurrent speak() calls
      // both resolve their fetches and fight over audioRef.current.
      stop();

      const clean = stripMarkdown(text);
      if (!clean) return;

      // Create a new AbortController for this specific request
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const res = await fetch("/api/ai/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: clean }),
          signal: controller.signal,
        });

        // If stop() was called while the fetch was in flight, bail out
        if (controller.signal.aborted) return;

        if (!res.ok) {
          console.error("[useSpeechSynthesis] TTS API error:", res.status);
          return;
        }

        const blob = await res.blob();

        // Check again after the blob read (async microtask gap)
        if (controller.signal.aborted) return;

        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onplay = () => setIsSpeaking(true);

        audio.onended = () => {
          setIsSpeaking(false);
          audioRef.current = null; // clear ref so stop() skips the pause() call
          if (objectUrlRef.current === url) {
            URL.revokeObjectURL(url);
            objectUrlRef.current = null;
          }
        };

        audio.onerror = () => {
          console.error("[useSpeechSynthesis] Audio playback error");
          setIsSpeaking(false);
          audioRef.current = null;
          if (objectUrlRef.current === url) {
            URL.revokeObjectURL(url);
            objectUrlRef.current = null;
          }
        };

        await audio.play();
      } catch (err) {
        // AbortError is expected when stop() cancels the fetch — not an error
        if (err instanceof Error && err.name === "AbortError") return;
        console.error("[useSpeechSynthesis] Failed to play TTS audio:", err);
        setIsSpeaking(false);
      }
    },
    [stop]
  );

  return {
    isSupported: true, // HTML5 Audio + fetch work in every modern browser
    isSpeaking,
    speak,
    stop,
  };
}
