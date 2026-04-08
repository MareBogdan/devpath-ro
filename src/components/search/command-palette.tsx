"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Search, X, BookOpen, Layers, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LessonResult {
  id: string;
  title: string;
  type: string;
  order_index: number;
  courses: { slug: string; title: string } | null;
}

interface CourseResult {
  id: string;
  slug: string;
  title: string;
  description: string | null;
}

interface SearchResults {
  lessons: LessonResult[];
  courses: CourseResult[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const lessonTypeLabels: Record<string, string> = {
  theory: "Teorie",
  quiz: "Quiz",
  exercise: "Exercițiu",
  project: "Proiect",
};

const lessonTypeColors: Record<string, string> = {
  theory: "bg-blue-500/15 text-blue-400",
  quiz: "bg-purple-500/15 text-purple-400",
  exercise: "bg-orange-500/15 text-orange-400",
  project: "bg-green-500/15 text-green-400",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Wait for client mount before using createPortal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Global Cmd+K / Ctrl+K + ESC listeners
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Focus input when opened; reset state when closed
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 30);
    } else {
      setQuery("");
      setResults(null);
      setIsLoading(false);
    }
  }, [open]);

  // Fetch search results
  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = (await res.json()) as SearchResults;
        setResults(data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  function handleInput(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void search(value), 300);
  }

  function clearQuery() {
    setQuery("");
    setResults(null);
    inputRef.current?.focus();
  }

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  const hasResults =
    results &&
    (results.lessons.length > 0 || results.courses.length > 0);
  const noResults =
    results &&
    results.lessons.length === 0 &&
    results.courses.length === 0;

  const palette = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-150"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Palette panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Caută lecții și cursuri"
        className={cn(
          "fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2",
          "rounded-xl border border-border bg-background shadow-2xl",
          "animate-in fade-in-0 zoom-in-95 slide-in-from-top-4 duration-150"
        )}
      >
        {/* Input bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          {isLoading ? (
            <span className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin shrink-0" />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="Caută lecții sau cursuri..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
          />
          {query ? (
            <button
              onClick={clearQuery}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Șterge"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex h-5 select-none items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
              ESC
            </kbd>
          )}
        </div>

        {/* Results area */}
        <div className="max-h-[400px] overflow-y-auto py-2">
          {/* Prompt state */}
          {(!query || query.length < 2) && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Scrie cel puțin 2 caractere...
            </p>
          )}

          {/* No results */}
          {noResults && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Niciun rezultat pentru{" "}
              <span className="text-foreground font-medium">«{query}»</span>
            </p>
          )}

          {/* Results */}
          {hasResults && (
            <>
              {/* Courses */}
              {results.courses.length > 0 && (
                <div className="mb-1">
                  <p className="px-4 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                    Cursuri
                  </p>
                  {results.courses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => navigate(`/courses/${course.slug}`)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-accent transition-colors group"
                    >
                      <Layers className="h-4 w-4 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {course.title}
                        </p>
                        {course.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {course.description}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Lessons */}
              {results.lessons.length > 0 && (
                <div>
                  <p className="px-4 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                    Lecții
                  </p>
                  {results.lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        if (lesson.courses?.slug) {
                          navigate(
                            `/courses/${lesson.courses.slug}/${lesson.id}`
                          );
                        }
                      }}
                      disabled={!lesson.courses?.slug}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-accent transition-colors group disabled:opacity-50"
                    >
                      <BookOpen className="h-4 w-4 text-primary/70 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <p className="text-sm font-medium text-foreground truncate">
                            {lesson.title}
                          </p>
                          {lesson.type && (
                            <span
                              className={cn(
                                "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                                lessonTypeColors[lesson.type] ??
                                  "bg-muted text-muted-foreground"
                              )}
                            >
                              {lessonTypeLabels[lesson.type] ?? lesson.type}
                            </span>
                          )}
                        </div>
                        {lesson.courses?.title && (
                          <p className="text-xs text-muted-foreground truncate">
                            {lesson.courses.title}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Trigger button rendered in navbar */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        aria-label="Caută (⌘K)"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline text-xs font-mono">⌘K</span>
      </button>

      {/* Portal — renders after client hydration */}
      {mounted && open && createPortal(palette, document.body)}
    </>
  );
}
