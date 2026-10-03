"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  X,
  BookOpen,
  Sparkles,
  Brain,
  Layers,
  MessageSquare,
  Code2,
  Wrench,
  Library,
  type LucideIcon,
} from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { StatCard } from "@/components/ui/stat-card";
import { CategoryPillGroup } from "@/components/ui/category-pill";
import { MagicCard } from "@/components/ui/magic-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { GlossarTerm } from "@/app/(dashboard)/glossar/page";

const ALL_VALUE = "all";

// ─── Category configuration ───────────────────────────────────────────────────

interface CategoryMeta {
  value: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

const CATEGORY_META: CategoryMeta[] = [
  { value: "AI General", label: "AI General", icon: Brain, color: "#8B5CF6" },
  { value: "ML", label: "ML", icon: Layers, color: "#3B82F6" },
  { value: "DL", label: "DL", icon: Sparkles, color: "#6366F1" },
  { value: "NLP", label: "NLP", icon: MessageSquare, color: "#06B6D4" },
  { value: "Python", label: "Python", icon: Code2, color: "#F59E0B" },
  { value: "Tools", label: "Tools", icon: Wrench, color: "#10B981" },
];

const CATEGORY_BY_VALUE: Record<string, CategoryMeta> = Object.fromEntries(
  CATEGORY_META.map((c) => [c.value, c])
);

function colorForCategory(category: string): string {
  return CATEGORY_BY_VALUE[category]?.color ?? "#6C5CE7";
}

interface GlossarClientProps {
  terms: GlossarTerm[];
}

export function GlossarClient({ terms }: GlossarClientProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(ALL_VALUE);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  // ─── Derived stats ───────────────────────────────────────────────────────
  const totalTerms = terms.length;
  const categoryCount = useMemo(() => {
    const set = new Set(terms.map((t) => t.category));
    return set.size;
  }, [terms]);
  const longestCategory = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of terms) {
      counts.set(t.category, (counts.get(t.category) ?? 0) + 1);
    }
    return Array.from(counts.values()).reduce((max, c) => (c > max ? c : max), 0);
  }, [terms]);

  // ─── Filtering ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return terms.filter((t) => {
      const matchesCategory =
        activeCategory === ALL_VALUE || t.category === activeCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q)
      );
    });
  }, [terms, query, activeCategory]);

  // Build pill options: "Toate" + categories that exist in the data
  const pillOptions = useMemo(() => {
    const presentCategories = new Set(terms.map((t) => t.category));
    const options = [
      {
        value: ALL_VALUE,
        label: "Toate",
        icon: Library,
        color: "#6C5CE7",
      },
      ...CATEGORY_META.filter((c) => presentCategories.has(c.value)).map(
        (c) => ({
          value: c.value,
          label: c.label,
          icon: c.icon,
          color: c.color,
        })
      ),
    ];
    return options;
  }, [terms]);

  function toggleTerm(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="pb-20">
      <PageHero
        title="Glosar AI"
        subtitle="Toți termenii importanți, explicați simplu — pe înțelesul oricui."
        icon={BookOpen}
        backgroundVariant="mesh"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <StatCard
            icon={BookOpen}
            label="Termeni"
            value={totalTerms}
            color="primary"
            size="md"
            subtitle="în glosar"
          />
          <StatCard
            icon={Layers}
            label="Categorii"
            value={categoryCount}
            color="accent"
            size="md"
            subtitle="domenii AI/ML"
          />
          <StatCard
            icon={Sparkles}
            label="Cea mai mare categorie"
            value={longestCategory}
            color="gold"
            size="md"
            subtitle="termeni"
          />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Caută un termen sau o definiție..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-border bg-card text-sm max-sm:text-base focus:outline-none focus:ring-2 focus:ring-aurora-primary-500/30 focus:border-aurora-primary-500 transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Șterge căutarea"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Category pills */}
        <CategoryPillGroup
          options={pillOptions}
          value={activeCategory}
          onChange={setActiveCategory}
          groupId="glossar-category"
          className="flex-wrap"
        />

        {/* Result count when filtering */}
        {(query || activeCategory !== ALL_VALUE) && filtered.length > 0 && (
          <p className="text-sm text-muted-foreground -mt-4">
            {filtered.length}{" "}
            {filtered.length === 1 ? "termen găsit" : "termeni găsiți"}
            {activeCategory !== ALL_VALUE && (
              <span className="text-muted-foreground/70">
                {" "}în {CATEGORY_BY_VALUE[activeCategory]?.label ?? activeCategory}
              </span>
            )}
          </p>
        )}

        {/* Terms grid */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Niciun termen găsit"
            description={
              query
                ? `Niciun termen nu corespunde căutării "${query}". Încearcă altă cheie sau resetează filtrul.`
                : "Nu există termeni în această categorie momentan."
            }
            actionLabel="Resetează filtrul"
            onAction={() => {
              setQuery("");
              setActiveCategory(ALL_VALUE);
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((term) => {
              const isOpen = openIds.has(term.id);
              const accent = colorForCategory(term.category);
              return (
                <MagicCard
                  key={term.id}
                  className="p-0 border border-border bg-card transition-all"
                  gradientFrom={accent}
                  gradientTo="#00CEC9"
                  gradientOpacity={0.5}
                  gradientSize={180}
                >
                  <button
                    onClick={() => toggleTerm(term.id)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-semibold text-sm text-foreground truncate">
                        {term.term}
                      </span>
                      <span
                        className="hidden sm:inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium shrink-0"
                        style={{
                          backgroundColor: `${accent}14`,
                          borderColor: `${accent}30`,
                          color: accent,
                        }}
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

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-1 border-t border-border bg-muted/30">
                          <p className="text-sm text-foreground leading-relaxed">
                            {term.definition}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </MagicCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
