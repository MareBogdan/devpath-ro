"use client";

import { useRef, useEffect, useState } from "react";
import { useChat } from "ai/react";
import { Bot, X, Send, Loader2, Zap, ShieldCheck, Mic, MicOff } from "lucide-react";
import { CosmoMascot } from "@/components/mascot/cosmo-mascot";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";

interface AICoachChatProps {
  lessonTitle: string;
  lessonContent: string;
  lessonId?: string;
  isExercise?: boolean;
}

const WAVEFORM_BARS = [0, 1, 2, 3, 4];

export function AICoachChat({
  lessonTitle,
  lessonContent,
  lessonId,
  isExercise = false,
}: AICoachChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Memory: context string built from past sessions, injected into system prompt
  const [sessionContext, setSessionContext] = useState("");
  // False when the server has no ANTHROPIC_API_KEY: the coach shows a friendly
  // disabled state up front instead of failing on the first message.
  const [aiEnabled, setAiEnabled] = useState(true);
  // Defer all browser-API-dependent UI (mic button) until after hydration.
  // Server render and first client render must match — `recognition.isSupported`
  // is `false` on SSR (no window object) but flips to `true` on the client,
  // which would otherwise mismatch.
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Memory refs ───────────────────────────────────────────────────────────
  const lessonIdRef = useRef(lessonId);
  lessonIdRef.current = lessonId;
  // When the panel was first opened this session
  const startedAtRef = useRef<string>(new Date().toISOString());
  // Prevent saving the same session twice
  const sessionSavedRef = useRef(false);
  // Track isOpen transitions (open → save on close)
  const prevIsOpenRef = useRef(false);

  const {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    append,
    isLoading,
    error,
  } = useChat({
    api: "/api/ai/chat",
    body: {
      lessonTitle,
      // The server only uses the first 4000 chars; cap the payload well above that.
      lessonContent: lessonContent.slice(0, 8000),
      ...(sessionContext ? { sessionContext } : {}),
    },
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: `Bună! Sunt **AI Coach**-ul tău pentru lecția **"${lessonTitle}"**. Pune-mi orice întrebare despre ce citești! 😊`,
      },
    ],
  });

  const recognition = useSpeechRecognition();

  // AI is "off" when the server said so up front (coach-sessions → aiEnabled) or when
  // the chat route answered 503 { disabled: true }. useChat exposes the response body
  // as the error message.
  const chatReportedDisabled = Boolean(
    error && /"disabled"\s*:\s*true/.test(error.message)
  );
  const aiOff = !aiEnabled || chatReportedDisabled;

  // Flip `mounted` after first paint so SSR / first client render show the same
  // tree (no mic button). Voice input UI then appears on the next
  // render once we know the browser supports it.
  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Log errors and loading state changes ─────────────────────────────────
  useEffect(() => {
    if (error) {
      console.error("[CHAT] useChat error:", error);
    }
  }, [error]);

  useEffect(() => {
    console.log("[CHAT] isLoading changed:", isLoading, "messages count:", messages.length);
  }, [isLoading, messages.length]);

  // ── Scroll to bottom on new messages ─────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // ── Fetch recent session summaries on mount (memory context) ──────────────
  useEffect(() => {
    fetch("/api/ai/coach-sessions?limit=3")
      .then((r) => r.json())
      .then((data: { context?: string; aiEnabled?: boolean }) => {
        if (data.context) setSessionContext(data.context);
        if (data.aiEnabled === false) setAiEnabled(false);
      })
      .catch(() => {});
  }, []);

  // ── Save session on panel close (true → false transition) ─────────────────
  useEffect(() => {
    if (!prevIsOpenRef.current && isOpen) {
      // Panel just opened — reset session timer and save guard
      startedAtRef.current = new Date().toISOString();
      sessionSavedRef.current = false;
    } else if (prevIsOpenRef.current && !isOpen) {
      // Panel just closed — fire-and-forget save
      saveCoachSession();
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Save session on component unmount (user navigates away) ──────────────
  useEffect(() => {
    return () => {
      saveCoachSession();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Focus input when panel opens ──────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // ── Mirror transcript into input field ────────────────────────────────────
  useEffect(() => {
    if (recognition.isListening) {
      setInput(recognition.transcript);
    }
  }, [recognition.isListening, recognition.transcript, setInput]);

  // ── Auto-submit voice message when speech recognition ends ───────────────
  // Browser Web Speech API: isListening goes true → false when the utterance ends
  // (the user stopped, or paused), with the final transcript already set.
  const prevIsListeningRef = useRef(false);
  useEffect(() => {
    if (prevIsListeningRef.current && !recognition.isListening) {
      // Speech recognition just finished
      const text = recognition.transcript.trim();
      console.log("[CHAT] STT done — text:", JSON.stringify(text));
      if (text && !aiOff) {
        console.log("[CHAT] calling append with:", text);
        append({ role: "user", content: text });
        recognition.resetTranscript();
        setInput("");
      }
    }
    prevIsListeningRef.current = recognition.isListening;
  }, [recognition.isListening, recognition.transcript, append, recognition.resetTranscript, setInput, aiOff]);

  // ── Save coach session to DB (fire-and-forget, uses only refs) ───────────
  // Reads the latest messages via ref so close/unmount saves see current state.
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // Called on close and on unmount — sessionSavedRef prevents double-saving.
  function saveCoachSession() {
    const msgs = messagesRef.current.filter((m) => m.id !== "welcome");
    if (msgs.length < 2 || sessionSavedRef.current) return;
    sessionSavedRef.current = true;
    fetch("/api/ai/coach-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lessonId: lessonIdRef.current ?? null,
        messages: msgs.slice(-10).map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        startedAt: startedAtRef.current,
      }),
    }).catch(() => {});
  }

  // ── Toggle mic handler (click to start, click to stop) ───────────────────
  function handleMicToggle() {
    if (recognition.isListening) {
      console.log("[CHAT] handleMicToggle STOP — transcript so far:", JSON.stringify(recognition.transcript));
      recognition.stopListening();
    } else {
      console.log("[CHAT] handleMicToggle START");
      recognition.startListening();
    }
  }

  // ── Quick Actions ─────────────────────────────────────────────────────────
  function handleExplainError() {
    const template =
      "Am o eroare la codul meu din acest exercițiu. Eroarea este: [LIPEȘTE EROAREA AICI]. Te rog explică-mi pe înțelesul meu ce am greșit.";
    setInput(template);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 50);
  }

  function handleCheckSolution() {
    append({
      role: "user",
      content:
        "Te rog să îmi verifici soluția la acest exercițiu și să îmi dai feedback despre ce am făcut bine și ce aș putea îmbunătăți.",
    });
  }

  return (
    <>
      {/* Backdrop overlay */}
      <div
        onClick={() => setIsOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity duration-300",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        aria-hidden="true"
      />

      {/* Full-height side panel */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex flex-col w-[420px] max-w-[95vw] max-sm:w-full max-sm:max-w-none max-sm:h-[100dvh] bg-background border-l border-border shadow-2xl transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        aria-label="AI Coach"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-primary text-primary-foreground shrink-0">
          <div className="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center shrink-0">
            <Bot className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-tight">AI Coach</p>
            <p className="text-xs opacity-70 truncate leading-tight mt-0.5">
              {lessonTitle}
            </p>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 max-sm:p-3 max-sm:-mr-2 rounded-lg hover:bg-primary-foreground/10 transition shrink-0"
            aria-label="Închide AI Coach"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Actions — shown only for exercise lessons */}
        {isExercise && (
          <div className="flex gap-2 px-4 py-3 border-b border-border bg-muted/30 shrink-0">
            <button
              onClick={handleExplainError}
              disabled={aiOff || isLoading}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted transition disabled:opacity-50"
            >
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              Explică eroarea
            </button>
            <button
              onClick={handleCheckSolution}
              disabled={aiOff || isLoading}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted transition disabled:opacity-50"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
              Verifică soluția
            </button>
          </div>
        )}

        {/* Messages — scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex items-start gap-2 animate-in slide-in-from-bottom-2 fade-in duration-200",
                m.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {m.role === "assistant" && (
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-muted text-foreground rounded-bl-none"
                )}
              >
                {m.role === "assistant" ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => (
                        <p className="mb-1 last:mb-0">{children}</p>
                      ),
                      code: ({ children }) => (
                        <code className="bg-background/60 rounded px-1 py-0.5 text-xs font-mono">
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className="bg-background/60 rounded-lg p-2 overflow-x-auto text-xs font-mono mt-1 mb-1">
                          {children}
                        </pre>
                      ),
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                ) : (
                  m.content
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator — Cosmo in "thinking" state */}
          {isLoading && (
            <div className="flex items-start gap-2 justify-start">
              <div className="shrink-0 -ml-1 -mt-1">
                <CosmoMascot emotion="thinking" size={32} />
              </div>
              <div className="bg-muted rounded-2xl rounded-bl-none px-3.5 py-2.5 mt-1">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}

          {/* Disabled state — no ANTHROPIC_API_KEY configured on the server */}
          {aiOff && (
            <div
              role="status"
              className="mx-auto max-w-[90%] rounded-xl border border-border bg-muted/40 px-4 py-3 text-center text-sm text-muted-foreground"
            >
              AI Coach este indisponibil momentan. Poți continua lecția — revino puțin mai târziu.
            </div>
          )}

          {/* Error state (a real failure, not the disabled state) */}
          {error && !aiOff && (
            <p className="text-xs text-red-500 text-center px-2">
              Nu am putut obține un răspuns acum. Încearcă din nou.
            </p>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Waveform recording indicator */}
        <AnimatePresence>
          {recognition.isListening && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center gap-1 px-4 py-2.5 bg-red-50 dark:bg-red-950/20 border-t border-red-200 dark:border-red-900/40 shrink-0 overflow-hidden"
            >
              {WAVEFORM_BARS.map((i) => (
                <motion.div
                  key={i}
                  className="w-[3px] bg-red-500 rounded-full"
                  animate={{ height: ["5px", "20px", "5px"] }}
                  transition={{
                    duration: 0.65,
                    repeat: Infinity,
                    delay: i * 0.09,
                    ease: "easeInOut",
                  }}
                />
              ))}
              <span className="text-xs font-medium text-red-600 dark:text-red-400 ml-2">
                Ascultare...
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voice problem (permission denied, nothing heard, offline, …) */}
        {recognition.error && !recognition.isListening && (
          <p
            role="status"
            className="px-4 pt-2 text-xs text-amber-600 dark:text-amber-400 shrink-0"
          >
            {recognition.error}
          </p>
        )}

        {/* Input form */}
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 p-4 border-t border-border shrink-0"
        >
          <input
            ref={inputRef}
            value={recognition.isListening ? recognition.transcript : input}
            onChange={recognition.isListening ? undefined : handleInputChange}
            placeholder={
              aiOff
                ? "AI indisponibil momentan"
                : recognition.isListening
                  ? "Vorbește acum..."
                  : "Pune o întrebare..."
            }
            disabled={aiOff || isLoading || recognition.isListening}
            className={cn(
              "flex-1 min-w-0 text-sm max-sm:text-base px-3.5 py-2.5 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-70 transition-colors",
              recognition.isListening
                ? "border-red-300 dark:border-red-800"
                : "border-border"
            )}
          />

          {/* Toggle mic button — gated by `mounted` to avoid SSR/client mismatch */}
          {mounted && recognition.isSupported && (
            <button
              type="button"
              onClick={handleMicToggle}
              disabled={aiOff || isLoading}
              aria-label={recognition.isListening ? "Oprește înregistrarea" : "Vorbește cu AI Coach"}
              title={recognition.isListening ? "Click pentru a opri" : "Click pentru a vorbi"}
              className={cn(
                "shrink-0 p-2.5 rounded-xl transition-all select-none",
                recognition.isListening
                  ? "bg-red-500 text-white scale-110 shadow-lg shadow-red-200 dark:shadow-red-900/30"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-40"
              )}
            >
              {recognition.isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </button>
          )}

          <button
            type="submit"
            disabled={
              aiOff ||
              (!input.trim() && !recognition.transcript.trim()) ||
              isLoading ||
              recognition.isListening
            }
            className="shrink-0 p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Floating toggle button — fixed bottom-right pill */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Închide AI Coach" : "Deschide AI Coach"}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg font-semibold text-sm transition-all duration-200",
          isOpen
            ? "opacity-0 pointer-events-none scale-90"
            : "opacity-100 pointer-events-auto scale-100 bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        <Bot className="h-4 w-4" />
        AI Coach
      </button>
    </>
  );
}
