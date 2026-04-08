"use client";

import { useState, useMemo } from "react";
import { Search, ChevronDown } from "lucide-react";
import type { GlossarTerm } from "@/app/(dashboard)/glossar/page";

const CATEGORY_ORDER = [
  "AI General",
  "ML",
  "DL",
  "NLP",
  "Python",
  "Tools",
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  "AI General":
    "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-900",
  ML: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-900",
  DL: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-400 dark:border-indigo-900",
  NLP: "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-400 dark:border-cyan-900",
  Python:
    "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-900",
  Tools:
    "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-900",
};

interface GlossarClientProps {
  terms: GlossarTerm[];
}

export function GlossarClient({ terms }: GlossarClientProps) {
  const [query, setQuery] = useState("");
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return terms;
    return terms.filter(
      (t) =>
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q)
    );
  }, [terms, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, GlossarTerm[]>();
    for (const cat of CATEGORY_ORDER) {
      const items = filtered.filter((t) => t.category === cat);
      if (items.length > 0) map.set(cat, items);
    }
    // Any category not in CATEGORY_ORDER goes at the end
    for (const t of filtered) {
      if (!CATEGORY_ORDER.includes(t.category as (typeof CATEGORY_ORDER)[number])) {
        const existing = map.get(t.category) ?? [];
        map.set(t.category, [...existing, t]);
      }
    }
    return map;
  }, [filtered]);

  function toggleTerm(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="space-y-8">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Caută un termen sau o definiție..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Result count when searching */}
      {query && (
        <p className="text-sm text-muted-foreground -mt-4">
          {filtered.length === 0
            ? "Niciun termen găsit."
            : `${filtered.length} ${filtered.length === 1 ? "termen găsit" : "termeni găsiți"}`}
        </p>
      )}

      {/* Grouped terms */}
      {grouped.size === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          Niciun termen nu corespunde căutării.
        </div>
      ) : (
        Array.from(grouped.entries()).map(([category, catTerms]) => (
          <section key={category}>
            {/* Category header */}
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-base font-semibold text-foreground">
                {category}
              </h2>
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                  CATEGORY_COLORS[category] ?? "bg-muted text-muted-foreground border-border"
                }`}
              >
                {catTerms.length} {catTerms.length === 1 ? "termen" : "termeni"}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Accordion items */}
            <div className="space-y-1.5">
              {catTerms.map((term) => {
                const isOpen = openIds.has(term.id);
                return (
                  <div
                    key={term.id}
                    className="rounded-lg border border-border bg-background overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => toggleTerm(term.id)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-accent transition-colors"
                      aria-expanded={isOpen}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-medium text-sm text-foreground">
                          {term.term}
                        </span>
                        <span
                          className={`hidden sm:inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium shrink-0 ${
                            CATEGORY_COLORS[term.category] ??
                            "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          {term.category}
                        </span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 border-t border-border bg-muted/20">
                        <p className="text-sm text-foreground leading-relaxed">
                          {term.definition}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
