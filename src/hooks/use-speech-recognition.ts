"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ── Minimal Web Speech API typings ───────────────────────────────────────────
// TypeScript's DOM lib does not ship SpeechRecognition, so declare just what we use.
interface SpeechRecognitionAlternativeLike {
  transcript: string;
}
interface SpeechRecognitionResultLike {
  readonly length: number;
  readonly isFinal: boolean;
  [index: number]: SpeechRecognitionAlternativeLike;
}
interface SpeechRecognitionEventLike {
  readonly results: {
    readonly length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}
interface SpeechRecognitionErrorEventLike {
  readonly error: string;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Romanian, user-facing explanation for a Web Speech error code. `null` = nothing to show. */
function messageForError(code: string): string | null {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "Accesul la microfon a fost refuzat. Permite microfonul în browser.";
    case "audio-capture":
      return "Nu am găsit niciun microfon.";
    case "no-speech":
      return "Nu te-am auzit. Încearcă din nou.";
    case "network":
      return "Recunoașterea vocală are nevoie de conexiune la internet.";
    case "aborted":
      return null; // we stopped it ourselves
    default:
      return "Recunoașterea vocală nu a funcționat. Poți scrie întrebarea.";
  }
}

export interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  /** Romanian message for the last failure (permission denied, no speech, …); null otherwise. */
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

// After stop() Chrome normally delivers the final result and `onend` quickly. If it
// never does (a known desktop-Chrome failure mode), force the session closed so the
// UI can't stay stuck on "listening".
const STOP_TIMEOUT_MS = 2500;

/**
 * Speech-to-text through the browser's built-in Web Speech API (Romanian, `ro-RO`).
 * No audio leaves the app for our servers and no API key is involved. The browser
 * (Chrome/Edge/Safari) sends audio to its own recognition service, so it needs a
 * network connection and, outside localhost, HTTPS. `isSupported` is false in
 * browsers without the API (e.g. Firefox).
 *
 * Push-to-talk contract used by the coach: `isListening` flips true → false when the
 * utterance ends (the user stopped, or paused speaking) and `transcript` already holds
 * the final text at that moment.
 */
export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detected after mount so the server render and the first client render agree
  // (both false) — no hydration mismatch.
  const [isSupported, setIsSupported] = useState(false);
  useEffect(() => {
    setIsSupported(getRecognitionCtor() !== null);
  }, []);

  const clearStopTimer = () => {
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
  };

  const startListening = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor || recognitionRef.current) return;

    const recognition = new Ctor();
    recognition.lang = "ro-RO";
    recognition.continuous = false; // one utterance; ends on a natural pause
    recognition.interimResults = true; // live text while speaking
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) {
        text += (i > 0 ? " " : "") + (e.results[i][0]?.transcript ?? "");
      }
      setTranscript(text.trim());
    };

    recognition.onerror = (e) => {
      console.warn("[useSpeechRecognition] error:", e.error);
      setError(messageForError(e.error));
    };

    recognition.onend = () => {
      clearStopTimer();
      recognitionRef.current = null;
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setTranscript("");
    setError(null);

    try {
      recognition.start();
    } catch (err) {
      // e.g. InvalidStateError if a previous session is still winding down
      console.warn("[useSpeechRecognition] start() failed:", err);
      recognitionRef.current = null;
      setIsListening(false);
      setError("Recunoașterea vocală nu a putut porni. Încearcă din nou.");
    }
  }, []);

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    try {
      recognition.stop(); // delivers the final result, then onend
    } catch {
      /* already stopped */
    }
    clearStopTimer();
    stopTimerRef.current = setTimeout(() => {
      // onend never came — abort and reset so the UI recovers.
      try {
        recognition.abort();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
      setIsListening(false);
    }, STOP_TIMEOUT_MS);
  }, []);

  const resetTranscript = useCallback(() => setTranscript(""), []);

  // Release the microphone if the component unmounts mid-recording.
  useEffect(() => {
    return () => {
      clearStopTimer();
      const recognition = recognitionRef.current;
      if (recognition) {
        recognition.onend = null;
        recognition.onerror = null;
        recognition.onresult = null;
        try {
          recognition.abort();
        } catch {
          /* ignore */
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
