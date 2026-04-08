"use client";

// Game 6 — Write a Prompt
// Lesson 18: Context Window / Tokenization
// Student writes a prompt for a task; /api/ai/chat scores it 1-10.

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MinigameProps {
  onComplete: (score: number, isPerfect: boolean) => void;
}

const TASK = {
  title: "Explică Machine Learning unui copil de 10 ani",
  description:
    "Scrie un prompt pentru un asistent AI care să explice conceptul de Machine Learning unui copil de 10 ani, fără termeni tehnici, cu analogii simple.",
  hint: "Gândește-te la: ton, audiență, restricții, lungime așteptată.",
};

const SCORING_SYSTEM_PROMPT = `Ești un evaluator strict de prompt-uri scrise de studenți.
Sarcina dată studentului: "${TASK.title}"
Criterii de evaluare (0-10):
- Claritatea instrucțiunii pentru AI (0-3p)
- Specificarea audienței și tonului (0-3p)
- Restricții utile (fără jargon, exemple, analogii) (0-2p)
- Lungimea și completitudinea promptului (0-2p)
Răspunde DOAR cu JSON valid: {"score": number, "feedback": "string (maxim 2 propoziții în română)"}`;

export function GameWritePrompt({ onComplete }: MinigameProps) {
  const [prompt, setPrompt] = useState("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ score: number; feedback: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const charCount = prompt.trim().length;
  const canSubmit = charCount >= 30 && !isPending && !result;

  function handleSubmit() {
    if (!canSubmit) return;
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: `Evaluează acest prompt de student:\n\n"${prompt}"`,
              },
            ],
            systemPrompt: SCORING_SYSTEM_PROMPT,
          }),
        });

        if (!res.ok) throw new Error("Eroare server");

        // The chat route streams data. Read the full stream and parse last data chunk.
        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let fullText = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
        }

        // Extract JSON from streamed Vercel AI SDK format
        // Lines look like: 0:"text chunk"
        const textChunks = fullText
          .split("\n")
          .filter((l) => l.startsWith('0:"'))
          .map((l) => {
            try {
              return JSON.parse(l.slice(2));
            } catch {
              return "";
            }
          })
          .join("");

        const jsonMatch = textChunks.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Răspuns invalid de la AI");

        const parsed = JSON.parse(jsonMatch[0]) as { score: number; feedback: string };
        const aiScore = Math.max(1, Math.min(10, Math.round(parsed.score)));
        const finalScore = Math.round((aiScore / 10) * 100);

        setResult({ score: aiScore, feedback: parsed.feedback });
        setTimeout(() => onComplete(finalScore, aiScore >= 9), 2000);
      } catch {
        setError("Nu am putut evalua promptul. Încearcă din nou.");
      }
    });
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h3 className="font-bold text-lg">Scrie un Prompt</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Redactează un prompt bun pentru sarcina de mai jos.
        </p>
      </div>

      {/* Task card */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-1">
        <p className="text-sm font-bold text-primary">{TASK.title}</p>
        <p className="text-sm text-muted-foreground">{TASK.description}</p>
        <p className="text-xs text-muted-foreground/70 italic">{TASK.hint}</p>
      </div>

      {/* Text area */}
      <div className="space-y-1">
        <textarea
          value={prompt}
          onChange={(e) => !result && setPrompt(e.target.value)}
          placeholder="Scrie promptul tău aici…"
          rows={5}
          disabled={!!result || isPending}
          className={cn(
            "w-full rounded-xl border px-4 py-3 text-sm resize-none transition focus:outline-none focus:ring-2 focus:ring-primary/40",
            result ? "opacity-60 cursor-default" : "bg-background border-border"
          )}
        />
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>{charCount} caractere {charCount < 30 && "(minim 30)"}</span>
          {result && (
            <span className={cn(
              "font-semibold",
              result.score >= 7 ? "text-green-600" : result.score >= 5 ? "text-amber-600" : "text-red-600"
            )}>
              Scor AI: {result.score}/10
            </span>
          )}
        </div>
      </div>

      {/* AI Feedback */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "rounded-xl border p-4 text-sm",
            result.score >= 7
              ? "bg-green-50 border-green-400 text-green-800 dark:bg-green-950/30 dark:text-green-200"
              : result.score >= 5
              ? "bg-amber-50 border-amber-400 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200"
              : "bg-red-50 border-red-400 text-red-800 dark:bg-red-950/30 dark:text-red-200"
          )}
        >
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{result.feedback}</p>
          </div>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-xs underline">
            Reîncearcă
          </button>
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={cn(
            "inline-flex items-center gap-2 px-8 py-2.5 rounded-lg text-sm font-semibold transition",
            canSubmit
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending
            ? "Evaluare AI…"
            : result
            ? "Evaluat!"
            : charCount < 30
            ? `Mai scrie ${30 - charCount} caractere`
            : "Trimite pentru evaluare"}
        </button>
      </div>
    </div>
  );
}
