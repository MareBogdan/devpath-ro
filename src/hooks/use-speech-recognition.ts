"use client";

import { useCallback, useRef, useState } from "react";

export interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

/**
 * Records audio via MediaRecorder, sends to /api/ai/stt (OpenAI Whisper),
 * and returns the transcribed text.
 *
 * Replaces the previous Web Speech API implementation which was unreliable
 * on desktop Chrome (onresult never fired).
 */
export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // MediaRecorder is available in all modern browsers
  const isSupported =
    typeof window !== "undefined" && typeof MediaRecorder !== "undefined";

  const startListening = useCallback(async () => {
    if (isListening) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Prefer webm/opus, fall back to whatever the browser supports
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "";

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        // Release microphone
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        const blob = new Blob(chunksRef.current, {
          type: mimeType || "audio/webm",
        });
        chunksRef.current = [];

        console.log("[VOICE] recorded blob size:", blob.size, "bytes");
        if (blob.size < 1000) {
          // Too short / empty recording
          console.log("[VOICE] recording too short (" + blob.size + " bytes), skipping STT");
          setIsListening(false);
          return;
        }

        // Send to Whisper endpoint
        setTranscript("Se transcrie...");
        try {
          const formData = new FormData();
          formData.append("audio", blob, "audio.webm");

          const res = await fetch("/api/ai/stt", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            const err = await res.text();
            console.error("[VOICE] STT error:", res.status, err);
            setTranscript("");
            setIsListening(false);
            return;
          }

          const data = (await res.json()) as { text: string };
          const text = data.text?.trim() ?? "";
          console.log("[VOICE] STT result:", text);
          setTranscript(text);
        } catch (err) {
          console.error("[VOICE] STT fetch error:", err);
          setTranscript("");
        }
        setIsListening(false);
      };

      recorder.onerror = () => {
        console.error("[VOICE] MediaRecorder error");
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setIsListening(false);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setTranscript("");
      setIsListening(true);
      console.log("[VOICE] recording started");
    } catch (err) {
      console.error("[VOICE] getUserMedia failed:", err);
      setIsListening(false);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording") return;
    console.log("[VOICE] stopping recording...");
    recorder.stop();
    // isListening will be set to false in recorder.onstop after STT completes
  }, []);

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
