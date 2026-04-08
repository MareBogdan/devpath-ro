"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// The Web Speech API is not fully typed in all TypeScript DOM lib versions.
// Declare the minimal surface we need so this compiles on any tsconfig target.
interface SpeechRecognitionResultItem {
  readonly transcript: string;
  readonly confidence: number;
}
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionResultItem;
  [index: number]: SpeechRecognitionResultItem;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
interface SpeechRecognitionCtor {
  new(): SpeechRecognitionInstance;
}
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

export interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    // Resolve vendor-prefixed constructor (Safari uses webkitSpeechRecognition)
    const Ctor =
      typeof window !== "undefined"
        ? (window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null)
        : null;

    if (!Ctor) return; // browser does not support Speech API

    setIsSupported(true);

    const recognition = new Ctor();
    recognition.continuous = false; // single utterance per push-to-talk press
    recognition.interimResults = true; // stream transcript while speaking
    recognition.lang = "ro-RO";
    recognition.maxAlternatives = 1;

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let interimText = "";
      let finalText = "";

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const chunk = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalText += chunk;
        } else {
          interimText += chunk;
        }
      }

      // Prefer final result; fall back to streaming interim so the input
      // field updates live while the user speaks
      setTranscript(finalText || interimText);
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      // "aborted" fires when we call recognition.stop() ourselves — ignore it
      if (e.error !== "aborted") {
        console.warn("[useSpeechRecognition] error:", e.error);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      recognitionRef.current = null;
    };
  }, []);

  const startListening = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec || isListening) return;
    setTranscript("");
    setIsListening(true);
    try {
      rec.start();
    } catch {
      // Throws if already started — safe to ignore
      setIsListening(false);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec || !isListening) return;
    // stop() (not abort()) allows the engine to return a final result
    // before onend fires and sets isListening → false
    rec.stop();
  }, [isListening]);

  const resetTranscript = useCallback(() => setTranscript(""), []);

  return {
    isSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
  };
}
