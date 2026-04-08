// src/app/(dashboard)/interview/page.tsx
"use client";

import { useChat } from "ai/react";
import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  RotateCcw,
  Send,
  Bot,
  User,
  Brain,
  TrendingUp,
  Layers,
  Sparkles,
  Mic,
  Clock,
  ChevronRight,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SessionReport,
  type SessionReportData,
} from "@/components/interview/session-report";

// ── Category config ──────────────────────────────────────────────────────────

interface Category {
  name: string;
  desc: string;
  Icon: React.ComponentType<{ className?: string }>;
  pill: string;
  bar: string;
}

const CATEGORIES: Category[] = [
  {
    name: "Concepte AI",
    desc: "Definiții de bază ale inteligenței artificiale",
    Icon: Brain,
    pill: "bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800",
    bar: "bg-violet-500",
  },
  {
    name: "Machine Learning",
    desc: "Tipuri de ML, antrenare, overfitting",
    Icon: TrendingUp,
    pill: "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
    bar: "bg-blue-500",
  },
  {
    name: "Rețele Neuronale",
    desc: "Neuroni artificiali, straturi, deep learning",
    Icon: Layers,
    pill: "bg-cyan-100 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800",
    bar: "bg-cyan-500",
  },
  {
    name: "LLM & Prompting",
    desc: "Modele de limbaj, tokenizare, context",
    Icon: Sparkles,
    pill: "bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800",
    bar: "bg-indigo-500",
  },
  {
    name: "Comunicare Tehnică",
    desc: "Claritate, structură și precizie",
    Icon: Mic,
    pill: "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
    bar: "bg-amber-500",
  },
];

// Static first question — appears instantly, no loading wait
const STATIC_FIRST_QUESTION =
  "Bun venit la sesiunea de pregătire! 👋\n\nHai să începem cu prima întrebare.\n\n**Întrebarea 1 — Concepte AI:**\nCe este inteligența artificială? Explică pe scurt diferența dintre AI îngust (Narrow AI) și inteligența artificială generală (AGI) și dă un exemplu concret pentru fiecare.";

// ── System prompt ────────────────────────────────────────────────────────────

const INTERVIEW_LESSON_TITLE = "Sesiune de Pregătire Interviu AI";

const INTERVIEW_LESSON_CONTENT = `Ești un intervievator expert pentru roluri entry-level în AI/ML în România. Conduci sesiuni de pregătire profesionale și prietenoase.

CONTEXT: Prima întrebare (despre Concepte AI) a fost deja afișată utilizatorului și el tocmai a răspuns. Continuă interviul de la întrebarea 2.

REGULI STRICTE:
- Pune câte o întrebare pe rând
- După fiecare răspuns, oferă feedback constructiv în 2-3 propoziții (ce a fost bun, ce lipsea)
- Dacă răspunsul e excelent, felicită scurt și treci mai departe
- Dacă răspunsul e incomplet, explică ce lipsea cu un indiciu util
- Adaptează dificultatea ușor în funcție de calitatea răspunsurilor
- Vorbește ÎNTOTDEAUNA în română
- Fii profesional dar și încurajator — tonul este de mentor, nu de judecător
- Întrebările se bazează pe conceptele din cursul AI Fundamentals

CATEGORII DE EVALUARE (0-100):
1. Concepte AI — definițiile de bază ale inteligenței artificiale (Q1 — deja pusă)
2. Machine Learning — tipuri de ML, antrenare, overfitting (Q2 — a ta)
3. Rețele Neuronale — neuroni artificiali, straturi, deep learning (Q3 — a ta)
4. LLM și Prompting — modele de limbaj, tokenizare, context (Q4 — a ta)
5. Comunicare Tehnică — claritate, structură și precizie în răspunsuri (Q5 — a ta)

STRUCTURA SESIUNII:
- Pune întrebările Q2, Q3, Q4, Q5 (în această ordine, câte una pe rând)
- Formatează fiecare întrebare bold: **Întrebarea N — Categoria:**
- După al 4-lea răspuns al tău (adică după Q5 din punctul tău de vedere): oferă un rezumat textual al sesiunii (2-3 propoziții motivante)
- Apoi, OBLIGATORIU pe o linie separată, adaugă exact: RAPORT:{"overall":N,"categories":[{"name":"Concepte AI","score":N},{"name":"Machine Learning","score":N},{"name":"Retele Neuronale","score":N},{"name":"LLM si Prompting","score":N},{"name":"Comunicare Tehnica","score":N}],"puncte_tari":["...","..."],"de_imbunatatit":["...","..."]}
- N este un număr întreg între 0 și 100; overall este media categoriilor
- puncte_tari: 2-3 aspecte pozitive concrete din răspunsurile utilizatorului
- de_imbunatatit: 2-3 zone specifice de îmbunătățit cu exemple concrete`;

// ── Helpers ──────────────────────────────────────────────────────────────────

function extractReport(content: string): SessionReportData | null {
  const match = content.match(/RAPORT:(\{[\s\S]+\})/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]) as SessionReportData;
  } catch {
    return null;
  }
}

function stripReport(content: string): string {
  return content.replace(/\s*RAPORT:\{[\s\S]+\}/, "").trim();
}

// ── Component ────────────────────────────────────────────────────────────────

export default function InterviewPage() {
  const [sessionStarted, setSessionStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
  } = useChat({
    api: "/api/ai/chat",
    body: {
      lessonTitle: INTERVIEW_LESSON_TITLE,
      lessonContent: INTERVIEW_LESSON_CONTENT,
    },
  });

  // Preprocess: attach categoryIndex to each AI message
  const visibleMessages = useMemo(() => {
    let aiCount = 0;
    return messages.map((m) => ({
      ...m,
      categoryIndex: m.role === "assistant" ? aiCount++ : -1,
    }));
  }, [messages]);

  // Count user answers
  const userAnswerCount = useMemo(
    () => messages.filter((m) => m.role === "user").length,
    [messages]
  );

  // Total AI messages shown (static Q1 counts as index 0)
  const aiMessageCount = useMemo(
    () => messages.filter((m) => m.role === "assistant").length,
    [messages]
  );

  // Detect session end from last AI message
  const sessionReport = useMemo<SessionReportData | null>(() => {
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    return last ? extractReport(last.content) : null;
  }, [messages]);

  const sessionEnded = sessionReport !== null;

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  function startSession() {
    setSessionStarted(true);
    // Immediately show static Q1 — no API call needed yet
    setMessages([
      {
        id: "q1-static",
        role: "assistant",
        content: STATIC_FIRST_QUESTION,
      },
    ]);
  }

  function resetSession() {
    setMessages([]);
    setSessionStarted(false);
  }

  // Current category: based on how many AI messages we've seen
  // AI message 0 → Concepte AI, 1 → ML, etc.
  const currentCatIndex = Math.min(aiMessageCount - 1, 4);
  const currentCat = sessionStarted && !sessionEnded ? CATEGORIES[currentCatIndex] ?? null : null;

  // Which step stepper shows as done (user answered it)
  // userAnswerCount = 0 → no step done; 1 → step 0 done; etc.
  const stepperDoneCount = userAnswerCount;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-5">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
                Pregătire Interviu AI
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                5 întrebări · scoring pe categorii · raport detaliat
              </p>
            </div>
          </div>
          {sessionStarted && !sessionEnded && (
            <button
              onClick={resetSession}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-accent shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Interviu nou</span>
            </button>
          )}
        </div>

        {/* ── Start screen ── */}
        <AnimatePresence mode="wait">
          {!sessionStarted && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="rounded-2xl bg-card border border-border overflow-hidden"
            >
              {/* Hero top */}
              <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border-b border-border p-8 sm:p-10 text-center">
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-blue-500/5 to-transparent pointer-events-none" />

                <div className="relative space-y-5">
                  {/* Bot avatar */}
                  <div className="relative mx-auto w-fit">
                    <div className="w-18 h-18 w-[72px] h-[72px] rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg">
                      <Bot className="h-9 w-9 text-primary" />
                    </div>
                    <div className="absolute -top-1 -right-1 flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      Online
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">
                      Gata pentru interviu?
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                      Intervievatorul AI îți va pune câte o întrebare din fiecare
                      categorie, oferă feedback imediat și generează un raport
                      complet la final.
                    </p>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center justify-center gap-3 flex-wrap text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5 bg-muted/60 border border-border px-2.5 py-1 rounded-full">
                      <Clock className="h-3 w-3" />
                      <span>~10-15 min</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-muted/60 border border-border px-2.5 py-1 rounded-full">
                      <MessageSquare className="h-3 w-3" />
                      <span>5 întrebări</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-muted/60 border border-border px-2.5 py-1 rounded-full">
                      <Zap className="h-3 w-3 text-amber-500" />
                      <span>Raport detaliat</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category grid */}
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
                    Categorii evaluate
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    {CATEGORIES.map((cat, i) => {
                      const CatIcon = cat.Icon;
                      return (
                        <motion.div
                          key={cat.name}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 * i, duration: 0.3 }}
                          className="rounded-xl bg-muted/40 border border-border p-3 flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2"
                        >
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", cat.pill)}>
                            <CatIcon className="h-4 w-4" />
                          </div>
                          <div className="sm:space-y-0.5">
                            <p className="text-xs font-semibold text-foreground leading-tight">
                              {cat.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground leading-tight hidden sm:block">
                              {cat.desc}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={startSession}
                  className="w-full flex items-center justify-center gap-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3.5 rounded-xl transition text-sm shadow-sm"
                >
                  <MessageSquare className="h-4 w-4" />
                  Începe Interviul
                  <ChevronRight className="h-4 w-4 opacity-70" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Session UI ── */}
        <AnimatePresence>
          {sessionStarted && !sessionEnded && (
            <motion.div
              key="session"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-4"
            >
              {/* Progress bar */}
              <div className="rounded-xl bg-card border border-border px-4 py-4 space-y-3">
                {/* Steps */}
                <div className="flex items-center">
                  {CATEGORIES.map((cat, i) => {
                    const done = i < stepperDoneCount;
                    const active = i === currentCatIndex;
                    const CatIcon = cat.Icon;
                    return (
                      <div key={cat.name} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center gap-1">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-400 shrink-0",
                              done
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : active
                                ? "bg-background border-2 border-primary text-primary shadow-sm"
                                : "bg-muted text-muted-foreground/40 border border-border"
                            )}
                          >
                            {done ? (
                              <svg className="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none">
                                <path d="M2.5 7l3.5 3.5 5.5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            ) : (
                              <CatIcon className="h-3.5 w-3.5" />
                            )}
                          </div>
                        </div>
                        {i < 4 && (
                          <div className={cn(
                            "flex-1 h-0.5 mx-1 transition-all duration-500",
                            done ? "bg-primary" : "bg-border"
                          )} />
                        )}
                      </div>
                    );
                  })}
                  <span className="ml-3 text-xs font-semibold text-muted-foreground tabular-nums">
                    {stepperDoneCount}/5
                  </span>
                </div>

                {/* Current category pill */}
                <div className="flex items-center justify-between gap-2">
                  <AnimatePresence mode="wait">
                    {currentCat && !isLoading && (
                      <motion.div
                        key={`cat-${currentCatIndex}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full",
                          currentCat.pill
                        )}
                      >
                        <currentCat.Icon className="h-3 w-3" />
                        <span>Întrebarea {currentCatIndex + 1} din 5 — {currentCat.name}</span>
                      </motion.div>
                    )}
                    {isLoading && userAnswerCount >= 5 && (
                      <motion.div
                        key="generating"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                        <span>Generez raportul tău personalizat...</span>
                      </motion.div>
                    )}
                    {isLoading && userAnswerCount < 5 && (
                      <motion.div
                        key="thinking"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground"
                      >
                        <Bot className="h-3 w-3 text-primary" />
                        <span>Intervievatorul se gândește...</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Chat window */}
              <div className="rounded-2xl bg-card border border-border overflow-hidden">
                {/* Messages */}
                <div className="p-4 sm:p-5 space-y-4 min-h-[360px] max-h-[500px] overflow-y-auto scroll-smooth">
                  <AnimatePresence initial={false}>
                    {visibleMessages.map((message) => {
                      const catIdx = message.categoryIndex;
                      const cat = catIdx >= 0 && catIdx < 5 ? CATEGORIES[catIdx] : null;
                      const CatIcon = cat?.Icon;
                      const isUser = message.role === "user";
                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 12, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          className={cn("flex gap-2.5", isUser ? "justify-end" : "justify-start")}
                        >
                          {/* AI avatar */}
                          {!isUser && (
                            <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-auto mb-0.5">
                              <Bot className="h-3.5 w-3.5 text-primary" />
                            </div>
                          )}

                          <div className={cn("flex flex-col max-w-[82%]", isUser ? "items-end" : "items-start")}>
                            {/* Category badge */}
                            {cat && CatIcon && (
                              <div className={cn(
                                "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mb-1.5",
                                cat.pill
                              )}>
                                <CatIcon className="h-2.5 w-2.5" />
                                <span>Î{catIdx + 1} — {cat.name}</span>
                              </div>
                            )}

                            {/* Bubble */}
                            <div className={cn(
                              "rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                              isUser
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : "bg-muted/80 text-foreground rounded-bl-sm border border-border/50"
                            )}>
                              {isUser
                                ? message.content
                                : stripReport(message.content)}
                            </div>
                          </div>

                          {/* User avatar */}
                          {isUser && (
                            <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center shrink-0 mt-auto mb-0.5">
                              <User className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {/* Typing indicator */}
                  <AnimatePresence>
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="flex gap-2.5 justify-start"
                      >
                        <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <Bot className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="bg-muted/80 border border-border/50 rounded-2xl rounded-bl-sm px-4 py-3">
                          <div className="flex gap-1.5 items-center">
                            <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0ms]" />
                            <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:150ms]" />
                            <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:300ms]" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-border p-3 sm:p-4 bg-muted/20">
                  {userAnswerCount >= 5 ? (
                    <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span>Sesiunea s-a încheiat · raportul se generează...</span>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="flex gap-2">
                      <input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Scrie răspunsul tău în română..."
                        disabled={isLoading}
                        autoFocus
                        className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-muted-foreground/50"
                      />
                      <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground w-10 h-10 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Session report ── */}
        <AnimatePresence>
          {sessionEnded && sessionReport && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <SessionReport report={sessionReport} onReset={resetSession} />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
