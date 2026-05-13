"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import {
  BookOpen, Brain, Flame, Zap, Star, Trophy,
  Code2, Shield, Server, Monitor, GitBranch,
  Layers, BarChart3, Users, Target, GraduationCap,
  Sun, Moon, Volume2, VolumeX,
} from "lucide-react";

import { AnimatedProgressRing } from "@/components/ui/animated-progress-ring";
import { StatCard } from "@/components/ui/stat-card";
import { StatusNode } from "@/components/ui/status-node";
import { SerpentinePath, type LessonNode } from "@/components/ui/serpentine-path";
import { PageHero } from "@/components/ui/page-hero";
import { EmptyState } from "@/components/ui/empty-state";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import { CategoryPill, CategoryPillGroup } from "@/components/ui/category-pill";
import { RewardToast } from "@/components/ui/reward-toast";
import { MeshGradientCard } from "@/components/ui/mesh-gradient-card";
import { AvatarLevelRing } from "@/components/ui/avatar-level-ring";
import { PageTransition } from "@/components/ui/page-transition";
import {
  Skeleton,
  StatCardSkeleton,
  CourseCardSkeleton,
} from "@/components/ui/skeleton-card";
import { CosmoShowcase } from "./_cosmo-showcase";

// ─── Showcase layout helpers ──────────────────────────────────────────────────

function Section({ title, children, description }: { title: string; children: React.ReactNode; description?: string }) {
  return (
    <section className="mb-16">
      <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
        <span className="h-1 w-4 rounded-full bg-aurora-primary-500 inline-block" />
        {title}
      </h2>
      <p className="text-xs text-muted-foreground mb-6">
        {description ?? <>Dev showcase — renders in <code className="font-mono">NODE_ENV=development</code> only</>}
      </p>
      <div>{children}</div>
    </section>
  );
}

function Row({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex flex-wrap gap-4 items-start ${className}`}>{children}</div>;
}

function IntensityToggle({
  value,
  onChange,
}: {
  value: "minimal" | "normal" | "spectacular";
  onChange: (v: "minimal" | "normal" | "spectacular") => void;
}) {
  return (
    <div className="flex gap-2 mb-4">
      {(["minimal", "normal", "spectacular"] as const).map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
            value === v
              ? "bg-aurora-primary-500 text-white border-aurora-primary-500"
              : "bg-transparent border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

// ─── Main showcase ────────────────────────────────────────────────────────────

export function ComponentShowcase() {
  const { theme, setTheme } = useTheme();
  const [activeCategory, setActiveCategory] = useState("all");
  const [toastType, setToastType] = useState<"xp" | "badge" | "levelup" | "streak" | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [serpentineIntensity, setSerpentineIntensity] = useState<"minimal" | "normal" | "spectacular">("normal");
  const [scrollToActive, setScrollToActive] = useState<string | undefined>(undefined);
  const [pageTransitionKey, setPageTransitionKey] = useState(0);

  // 36-node realistic AI course — statically defined, then wrapped in state for demo
  const sampleNodesStatic = [
    // ── Module 1: Bazele AI ──
    { id: "n1",  type: "lesson"     as const, status: "completed" as const, icon: Brain,         label: "Introducere AI",       sublabel: "12 lecții", moduleName: "Modul 1: Bazele AI" },
    { id: "n2",  type: "lesson"     as const, status: "completed" as const, icon: Layers,        label: "Cum gândesc mașinile", sublabel: "8 lecții",  moduleName: "Modul 1: Bazele AI" },
    { id: "n3",  type: "lesson"     as const, status: "completed" as const, icon: Code2,         label: "Python pentru AI",     sublabel: "10 lecții", moduleName: "Modul 1: Bazele AI" },
    { id: "n4",  type: "lesson"     as const, status: "completed" as const, icon: BarChart3,     label: "Date și statistică",   sublabel: "6 lecții",  moduleName: "Modul 1: Bazele AI" },
    { id: "n5",  type: "lesson"     as const, status: "completed" as const, icon: Server,        label: "Pandas & NumPy",       sublabel: "9 lecții",  moduleName: "Modul 1: Bazele AI" },
    { id: "n6",  type: "checkpoint" as const, status: "completed" as const, icon: Trophy,        label: "Modul 1 Complet",      sublabel: "5/5 lecții",moduleName: "Modul 1: Bazele AI" },
    // ── Module 2: Cum Învață Mașinile ──
    { id: "n7",  type: "lesson"     as const, status: "completed" as const, icon: GitBranch,     label: "Regresie liniară",     sublabel: "7 lecții",  moduleName: "Modul 2: ML" },
    { id: "n8",  type: "lesson"     as const, status: "completed" as const, icon: Target,        label: "Clasificare",          sublabel: "8 lecții",  moduleName: "Modul 2: ML" },
    { id: "n9",  type: "lesson"     as const, status: "completed" as const, icon: Layers,        label: "Clustering",           sublabel: "6 lecții",  moduleName: "Modul 2: ML" },
    { id: "n10", type: "lesson"     as const, status: "completed" as const, icon: BarChart3,     label: "Evaluare modele",      sublabel: "5 lecții",  moduleName: "Modul 2: ML" },
    { id: "n11", type: "lesson"     as const, status: "completed" as const, icon: Monitor,       label: "Scikit-learn",         sublabel: "9 lecții",  moduleName: "Modul 2: ML" },
    { id: "n12", type: "checkpoint" as const, status: "completed" as const, icon: Trophy,        label: "Modul 2 Complet",      sublabel: "5/5 lecții",moduleName: "Modul 2: ML" },
    // ── Module 3: Rețele Neurale ──
    { id: "n13", type: "lesson"     as const, status: "current"   as const, icon: Zap,           label: "Neuroni artificiali",  sublabel: "10 lecții", moduleName: "Modul 3: Neural" },
    { id: "n14", type: "lesson"     as const, status: "locked"    as const, icon: Code2,         label: "Backpropagation",      sublabel: "8 lecții",  moduleName: "Modul 3: Neural" },
    { id: "n15", type: "lesson"     as const, status: "locked"    as const, icon: GitBranch,     label: "Funcții activare",     sublabel: "6 lecții",  moduleName: "Modul 3: Neural" },
    { id: "n16", type: "lesson"     as const, status: "locked"    as const, icon: Server,        label: "TensorFlow basics",    sublabel: "11 lecții", moduleName: "Modul 3: Neural" },
    { id: "n17", type: "lesson"     as const, status: "locked"    as const, icon: Layers,        label: "PyTorch intro",        sublabel: "9 lecții",  moduleName: "Modul 3: Neural" },
    { id: "n18", type: "checkpoint" as const, status: "locked"    as const, icon: Shield,        label: "Modul 3 Checkpoint",   sublabel: "0/5 lecții",moduleName: "Modul 3: Neural" },
    // ── Module 4: Deep Learning ──
    { id: "n19", type: "lesson"     as const, status: "locked"    as const, icon: Brain,         label: "CNN — imagini",        sublabel: "12 lecții", moduleName: "Modul 4: Deep" },
    { id: "n20", type: "lesson"     as const, status: "locked"    as const, icon: Monitor,       label: "RNN — secvențe",       sublabel: "10 lecții", moduleName: "Modul 4: Deep" },
    { id: "n21", type: "lesson"     as const, status: "locked"    as const, icon: Zap,           label: "LSTM & GRU",           sublabel: "8 lecții",  moduleName: "Modul 4: Deep" },
    { id: "n22", type: "lesson"     as const, status: "locked"    as const, icon: Target,        label: "Transfer learning",    sublabel: "7 lecții",  moduleName: "Modul 4: Deep" },
    { id: "n23", type: "lesson"     as const, status: "locked"    as const, icon: BarChart3,     label: "Fine-tuning",          sublabel: "6 lecții",  moduleName: "Modul 4: Deep" },
    { id: "n24", type: "checkpoint" as const, status: "locked"    as const, icon: Shield,        label: "Modul 4 Checkpoint",   sublabel: "0/5 lecții",moduleName: "Modul 4: Deep" },
    // ── Module 5: NLP & Transformers ──
    { id: "n25", type: "lesson"     as const, status: "locked"    as const, icon: Users,         label: "Word embeddings",      sublabel: "8 lecții",  moduleName: "Modul 5: NLP" },
    { id: "n26", type: "lesson"     as const, status: "locked"    as const, icon: Code2,         label: "Attention mechanism",  sublabel: "10 lecții", moduleName: "Modul 5: NLP" },
    { id: "n27", type: "lesson"     as const, status: "locked"    as const, icon: Brain,         label: "BERT & GPT",           sublabel: "12 lecții", moduleName: "Modul 5: NLP" },
    { id: "n28", type: "lesson"     as const, status: "locked"    as const, icon: GitBranch,     label: "RAG Systems",          sublabel: "9 lecții",  moduleName: "Modul 5: NLP" },
    { id: "n29", type: "lesson"     as const, status: "locked"    as const, icon: Layers,        label: "LLM fine-tuning",      sublabel: "11 lecții", moduleName: "Modul 5: NLP" },
    { id: "n30", type: "checkpoint" as const, status: "locked"    as const, icon: Shield,        label: "Modul 5 Checkpoint",   sublabel: "0/5 lecții",moduleName: "Modul 5: NLP" },
    // ── Module 6: Proiecte Practice ──
    { id: "n31", type: "lesson"     as const, status: "locked"    as const, icon: Target,        label: "Proiect CV",           sublabel: "1 proiect", moduleName: "Modul 6: Practică" },
    { id: "n32", type: "lesson"     as const, status: "locked"    as const, icon: Monitor,       label: "Proiect NLP",          sublabel: "1 proiect", moduleName: "Modul 6: Practică" },
    { id: "n33", type: "lesson"     as const, status: "locked"    as const, icon: Server,        label: "MLOps pipeline",       sublabel: "1 proiect", moduleName: "Modul 6: Practică" },
    { id: "n34", type: "lesson"     as const, status: "locked"    as const, icon: Users,         label: "Deploy producție",     sublabel: "1 proiect", moduleName: "Modul 6: Practică" },
    { id: "n35", type: "lesson"     as const, status: "locked"    as const, icon: Star,          label: "Proiect capstone",     sublabel: "1 proiect", moduleName: "Modul 6: Practică" },
    { id: "n36", type: "checkpoint" as const, status: "locked"    as const, icon: GraduationCap, label: "Certificat Final",     sublabel: "0/5 lecții",moduleName: "Modul 6: Practică" },
  ];

  // Stateful copy of sampleNodes for completion animation demo
  const [demoNodes, setDemoNodes] = useState<LessonNode[]>(sampleNodesStatic);

  function simulateCompletion() {
    setDemoNodes(prev => {
      const currentIdx = prev.findIndex(n => n.status === "current");
      if (currentIdx === -1) return prev;
      return prev.map((n, i) => {
        if (i === currentIdx) return { ...n, status: "completed" as const };
        if (i === currentIdx + 1 && n.status === "locked") return { ...n, status: "current" as const };
        return n;
      });
    });
  }

  function resetDemo() {
    setDemoNodes(sampleNodesStatic);
  }

  // Alias for backward compat in the rest of the component
  const sampleNodes = demoNodes;

  // 10-node mini demo: 8 lessons + 2 checkpoints, 5 completed, 1 current
  const miniNodes = [
    { id: "m1",  type: "lesson"     as const, status: "completed" as const, icon: Brain,     label: "Bazele AI",          sublabel: "5 lecții" },
    { id: "m2",  type: "lesson"     as const, status: "completed" as const, icon: Code2,     label: "Python intro",       sublabel: "4 lecții" },
    { id: "m3",  type: "lesson"     as const, status: "completed" as const, icon: Layers,    label: "Date & structuri",   sublabel: "6 lecții" },
    { id: "m4",  type: "lesson"     as const, status: "completed" as const, icon: Target,    label: "Statistică",         sublabel: "5 lecții" },
    { id: "m5",  type: "checkpoint" as const, status: "completed" as const, icon: Trophy,    label: "Modul 1 Complet",    sublabel: "4/4 lecții" },
    { id: "m6",  type: "lesson"     as const, status: "current"   as const, icon: Zap,       label: "ML Basics",          sublabel: "8 lecții" },
    { id: "m7",  type: "lesson"     as const, status: "locked"    as const, icon: GitBranch, label: "Clasificare",        sublabel: "7 lecții" },
    { id: "m8",  type: "lesson"     as const, status: "locked"    as const, icon: Monitor,   label: "Evaluare modele",    sublabel: "5 lecții" },
    { id: "m9",  type: "lesson"     as const, status: "locked"    as const, icon: Star,      label: "Scikit-learn",       sublabel: "9 lecții" },
    { id: "m10", type: "checkpoint" as const, status: "locked"    as const, icon: Shield,    label: "Modul 2 Checkpoint", sublabel: "0/4 lecții" },
  ];

  const pillOptions = [
    { value: "all", label: "Toate", icon: Layers },
    { value: "frontend", label: "Frontend", icon: Monitor, color: "#3B82F6" },
    { value: "backend", label: "Backend", icon: Server, color: "#10B981" },
    { value: "ai", label: "AI & ML", icon: Brain, color: "#6C5CE7" },
    { value: "security", label: "Securitate", icon: Shield, color: "#EF4444" },
    { value: "devops", label: "DevOps", icon: GitBranch, color: "#F59E0B" },
  ];

  return (
    <div className="min-h-screen bg-[var(--aurora-bg-deepest)]">
      {/* ── Fixed theme + sound controls ── */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={() => setSoundEnabled((s) => !s)}
          className="flex items-center justify-center w-9 h-9 rounded-xl border border-border bg-card shadow-md text-muted-foreground hover:text-foreground transition-colors"
          aria-label={soundEnabled ? "Dezactivează sunetul" : "Activează sunetul"}
          title={soundEnabled ? "Sound ON" : "Sound OFF"}
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center justify-center w-9 h-9 rounded-xl border border-border bg-card shadow-md text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Comută tema"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      {/* Page hero */}
      <PageHero
        title="Component Showcase"
        subtitle="Toate componentele shared — testare vizuală în dark & light mode"
        icon={Layers}
        backgroundVariant="mesh"
        rightContent={
          <span className="text-xs font-mono bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border border-amber-200 dark:border-amber-900 px-2.5 py-1 rounded-full">
            DEV ONLY
          </span>
        }
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">

        {/* ── 0. Cosmo Mascot — 3D ── */}
        <Section
          title="Cosmo Mascot (3D)"
          description="Procedural Three.js golden retriever puppy. 8 emotions, idle animations, mouse-gaze interaction."
        >
          <CosmoShowcase />
        </Section>

        {/* ── 1. Progress Rings ── */}
        <Section title="AnimatedProgressRing">
          <Row>
            {(["sm", "md", "lg", "xl"] as const).map((size) => (
              <div key={size} className="flex flex-col items-center gap-2">
                <AnimatedProgressRing value={72} size={size} color="primary" showLabel />
                <span className="text-xs text-muted-foreground">{size}</span>
              </div>
            ))}
          </Row>
          <Row className="mt-6">
            {(["primary", "accent", "gold", "streak", "success"] as const).map((color) => (
              <div key={color} className="flex flex-col items-center gap-2">
                <AnimatedProgressRing value={65} size="md" color={color} showLabel />
                <span className="text-xs text-muted-foreground">{color}</span>
              </div>
            ))}
          </Row>
        </Section>

        {/* ── 2. AvatarLevelRing ── */}
        <Section title="AvatarLevelRing">
          <Row>
            {[20, 45, 70, 95].map((pct, i) => (
              <div key={pct} className="flex flex-col items-center gap-2">
                <AvatarLevelRing
                  src={null}
                  name={["Alex Ion", "Maria C", "Andrei P", "Elena D"][i]}
                  level={i + 2}
                  levelProgressPercent={pct}
                  size={80}
                />
                <span className="text-xs text-muted-foreground">{pct}%</span>
              </div>
            ))}
            <div className="flex flex-col items-center gap-2">
              <AvatarLevelRing src={null} name="Bogdan Dev" level={10} levelProgressPercent={100} size={100} />
              <span className="text-xs text-muted-foreground">100% — max</span>
            </div>
          </Row>
        </Section>

        {/* ── 3. Stat Cards ── */}
        <Section title="StatCard" description="Cards with colored top-border accents in light mode, glass in dark mode.">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <StatCard icon={Zap} label="XP total" value={4250} color="primary" trend="up" />
            <StatCard icon={Flame} label="Zile serie" value={14} color="streak" trend={12} />
            <StatCard icon={Trophy} label="Insigne" value={6} color="gold" subtitle="din 25 disponibile" />
            <StatCard icon={BookOpen} label="Lecții" value={47} color="accent" trend="up" />
            <StatCard icon={Target} label="Scor mediu" value={88} color="success" subtitle="la quiz-uri" />
            <StatCard icon={Users} label="Rang" value={3} color="muted" subtitle="în top 10" />
            <StatCard icon={BarChart3} label="Timp total" value="12h 30m" color="primary" animateValue={false} />
            <StatCard icon={GraduationCap} label="Cursuri" value={1} color="accent" subtitle="din 2 disponibile" size="sm" />
          </div>
        </Section>

        {/* ── 4. Status Nodes ── */}
        <Section title="StatusNode">
          <Row className="justify-center">
            <StatusNode status="completed" icon={BookOpen} label="Lecție 1" sublabel="Completat" size="sm" />
            <StatusNode status="completed" icon={Brain} label="Lecție 2" sublabel="Completat" size="md" />
            <StatusNode status="completed" icon={Code2} label="Lecție 3" sublabel="Completat" size="lg" />
          </Row>
          <Row className="justify-center mt-8">
            <StatusNode status="current" icon={Zap} label="Lecție 4" sublabel="În progres" size="sm" />
            <StatusNode status="current" icon={Star} label="Lecție 5" sublabel="În progres" size="md" />
            <StatusNode status="current" icon={Flame} label="Lecție 6" sublabel="În progres" size="lg" />
          </Row>
          <Row className="justify-center mt-8">
            <StatusNode status="locked" label="Lecție 7" sublabel="Blocat" size="sm" />
            <StatusNode status="locked" label="Lecție 8" sublabel="Blocat" size="md" />
            <StatusNode status="locked" label="Lecție 9" sublabel="Blocat" size="lg" />
          </Row>
        </Section>

        {/* ── 5. SerpentinePath — Duolingo-style Game Map ── */}
        <Section
          title="SerpentinePath — Duolingo-style Game Map"
          description="Organic S-curve layout with module-colored locked nodes, checkpoint progress arcs, completion burst animation, bouncing arrow on current node, glow rings, hover glow effects, and 'you are here' indicator. Click 'Simulate completion' to trigger the dopamine hit."
        >
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div>
              <p className="text-[10px] text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">Intensity</p>
              <IntensityToggle value={serpentineIntensity} onChange={setSerpentineIntensity} />
            </div>
            <div className="ml-auto flex items-end gap-2">
              <div>
                <p className="text-[10px] text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">Demo</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setScrollToActive(undefined);
                      requestAnimationFrame(() => setScrollToActive("n13"));
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-aurora-accent-500/40 text-aurora-accent-500 hover:bg-aurora-accent-500/10 transition-colors"
                  >
                    Scroll to current
                  </button>
                  <button
                    onClick={simulateCompletion}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                  >
                    Simulate completion
                  </button>
                  <button
                    onClick={resetDemo}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Full-width 36-node demo */}
          <div className="bg-card dark:bg-[var(--aurora-bg-card)] rounded-3xl border border-border p-6 shadow-[0_4px_24px_rgba(108,92,231,0.12)] mb-8">
            <p className="text-xs font-mono text-muted-foreground mb-6">
              intensity=&quot;{serpentineIntensity}&quot; — 36 nodes · progress arcs · module-colored locked · bouncing arrow · hover glow · completion burst
            </p>
            <SerpentinePath
              nodes={sampleNodes}
              onNodeClick={(id) => console.log(`Clicked: ${id}`)}
              intensity={serpentineIntensity}
              showModuleBackgrounds
              lessonsPerModule={6}
              activeNodeId={scrollToActive}
            />
          </div>

          {/* Mini 10-node demo */}
          <div className="bg-card dark:bg-[var(--aurora-bg-card)] rounded-3xl border border-border p-6 shadow-[0_4px_12px_rgba(108,92,231,0.08)]">
            <p className="text-xs font-mono text-muted-foreground mb-6">
              10 nodes: 8 lecții + 2 checkpoints — cum arată drumuri scurte
            </p>
            <div className="max-w-lg mx-auto">
              <SerpentinePath
                nodes={miniNodes}
                onNodeClick={(id) => console.log(`Mini clicked: ${id}`)}
                intensity={serpentineIntensity}
                showModuleBackgrounds
                lessonsPerModule={5}
              />
            </div>
          </div>
        </Section>

        {/* ── 6. Page Hero Variants ── */}
        <Section title="PageHero">
          <div className="space-y-4 rounded-2xl overflow-hidden border border-border">
            <PageHero title="Default variant" subtitle="Sub-titlu descriptiv" icon={BookOpen} />
            <PageHero title="Gradient variant" subtitle="Sub-titlu descriptiv" icon={Zap} backgroundVariant="gradient" />
            <PageHero title="Mesh variant" subtitle="Sub-titlu descriptiv" icon={Star} backgroundVariant="mesh" />
          </div>
        </Section>

        {/* ── 7. Empty State ── */}
        <Section title="EmptyState">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card dark:bg-[var(--aurora-bg-card)] rounded-2xl border border-border">
              <EmptyState
                icon={BookOpen}
                title="Niciun curs activ"
                description="Navighează la cursuri și alege primul tău curs pentru a începe călătoria."
                actionLabel="Explorează cursurile"
                actionHref="/courses"
              />
            </div>
            <div className="bg-card dark:bg-[var(--aurora-bg-card)] rounded-2xl border border-border">
              <EmptyState
                icon={Trophy}
                title="Nicio insignă încă"
                description="Completează lecții și obiective pentru a debloca insigne exclusive."
              />
            </div>
          </div>
        </Section>

        {/* ── 8. Difficulty Badges ── */}
        <Section title="DifficultyBadge">
          <Row>
            <DifficultyBadge level={2.0} />
            <DifficultyBadge level={3.0} />
            <DifficultyBadge level={4.0} />
            <DifficultyBadge level={2.0} showIcon={false} />
            <DifficultyBadge level={3.0} showIcon={false} />
            <DifficultyBadge level={4.0} showIcon={false} />
          </Row>
        </Section>

        {/* ── 9. Category Pills ── */}
        <Section title="CategoryPill + CategoryPillGroup">
          <div className="space-y-4">
            <CategoryPillGroup
              options={pillOptions}
              value={activeCategory}
              onChange={setActiveCategory}
              groupId="showcase-pills"
            />
            <Row>
              <CategoryPill label="Toate cursurile" isActive onClick={() => {}} color="#6C5CE7" layoutId="standalone" />
              <CategoryPill label="Inactive" isActive={false} onClick={() => {}} layoutId="standalone" />
              <CategoryPill label="Cu icon" icon={Star} isActive={false} onClick={() => {}} layoutId="standalone" />
            </Row>
          </div>
        </Section>

        {/* ── 10. Reward Toasts — with sounds ── */}
        <Section
          title="RewardToast — Dopamine Machine"
          description="Click a button to fire the toast. Hover to pause dismiss timer. Sound effects via Web Audio API."
        >
          <Row className="mb-4">
            {(["xp", "badge", "levelup", "streak"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setToastType(type)}
                className="px-4 py-2 rounded-xl bg-aurora-primary-500/10 border border-aurora-primary-500/25 text-aurora-primary-500 text-sm font-medium hover:bg-aurora-primary-500/20 transition-colors"
              >
                Test {type} toast
              </button>
            ))}
          </Row>
          <p className="text-xs text-muted-foreground mb-2">
            Som: <strong>{soundEnabled ? "ON" : "OFF"}</strong> — toggle din butonul din colțul dreapta sus.
          </p>
          {(["xp", "badge", "levelup", "streak"] as const).map((type) => (
            <RewardToast
              key={type}
              type={type}
              value={
                type === "xp" ? "+75 XP"
                : type === "badge" ? "Quiz Master"
                : type === "levelup" ? "Level 5 — Expert"
                : "🔥 14 zile serie!"
              }
              subtitle={type === "levelup" ? "Ai deblocat tema Premium!" : undefined}
              soundEnabled={soundEnabled}
              visible={toastType === type}
              onDismiss={() => setToastType(null)}
            />
          ))}
        </Section>

        {/* ── 11. Holographic Mesh Cards ── */}
        <Section
          title="MeshGradientCard — Holographic"
          description="Mișcă cursorul lent peste card. Observă shine-ul diagonal, refrația la margini, și tilting-ul 3D."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { colors: ["#6C5CE7", "#A29BFE", "#00CEC9"] as [string, string, string], title: "AI Fundamentals", slug: "ai" },
              { colors: ["#3B82F6", "#8B5CF6", "#06B6D4"] as [string, string, string], title: "Frontend Mastery", slug: "fe" },
              { colors: ["#10B981", "#059669", "#6C5CE7"] as [string, string, string], title: "Backend Engineering", slug: "be" },
            ].map(({ colors, title }) => (
              <MeshGradientCard key={title} colors={colors} intensity={0.15}>
                <div className="p-5">
                  <div className="text-lg font-bold mb-1">{title}</div>
                  <div className="text-sm text-muted-foreground mb-3">Hover pentru efect holografic</div>
                  <DifficultyBadge level={3.0} />
                </div>
              </MeshGradientCard>
            ))}
          </div>
        </Section>

        {/* ── 12. Page Transition ── */}
        <Section
          title="PageTransition"
          description="Click butonul pentru a remonta componenta și vedea animația fade+slide."
        >
          <button
            onClick={() => setPageTransitionKey((k) => k + 1)}
            className="mb-4 px-4 py-2 rounded-xl bg-aurora-primary-500/10 border border-aurora-primary-500/25 text-aurora-primary-500 text-sm font-medium hover:bg-aurora-primary-500/20 transition-colors"
          >
            Replay page transition
          </button>
          <PageTransition key={pageTransitionKey}>
            <div className="p-6 rounded-2xl border border-border bg-card">
              <p className="text-sm font-medium">Conținut de pagină</p>
              <p className="text-xs text-muted-foreground mt-1">
                Acesta intră cu fade + slide de la y=12px. Cheia este {pageTransitionKey}.
              </p>
            </div>
          </PageTransition>
        </Section>

        {/* ── 13. Loading Skeletons ── */}
        <Section title="Loading Skeletons">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <CourseCardSkeleton />
            <CourseCardSkeleton />
            <CourseCardSkeleton />
          </div>
          <div className="mt-6 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        </Section>

        {/* ── 14. Aurora Color Palette ── */}
        <Section title="Aurora Color Palette (theme check)">
          <div className="grid grid-cols-5 gap-3">
            {[
              { name: "primary-50", cls: "bg-aurora-primary-50" },
              { name: "primary-100", cls: "bg-aurora-primary-100" },
              { name: "primary-300", cls: "bg-aurora-primary-300" },
              { name: "primary-500", cls: "bg-aurora-primary-500" },
              { name: "primary-700", cls: "bg-aurora-primary-700" },
              { name: "accent-50", cls: "bg-aurora-accent-50" },
              { name: "accent-300", cls: "bg-aurora-accent-300" },
              { name: "accent-500", cls: "bg-aurora-accent-500" },
              { name: "accent-700", cls: "bg-aurora-accent-700" },
              { name: "gold-500", cls: "bg-aurora-gold-500" },
              { name: "streak-500", cls: "bg-aurora-streak-500" },
              { name: "bg-deepest", cls: "" },
              { name: "bg-card", cls: "" },
              { name: "bg-elevated", cls: "" },
              { name: "border", cls: "bg-border" },
            ].map(({ name, cls }) => (
              <div key={name} className="flex flex-col items-center gap-1.5">
                <div
                  className={`h-10 w-full rounded-lg border border-border ${cls}`}
                  style={
                    name === "bg-deepest" ? { background: "var(--aurora-bg-deepest)" }
                    : name === "bg-card" ? { background: "var(--aurora-bg-card)" }
                    : name === "bg-elevated" ? { background: "var(--aurora-bg-elevated)" }
                    : {}
                  }
                />
                <span className="text-[10px] text-muted-foreground text-center leading-tight">{name}</span>
              </div>
            ))}
          </div>
        </Section>

      </div>
    </div>
  );
}
