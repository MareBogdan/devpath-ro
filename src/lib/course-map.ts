// ─── Course Map Helpers ───────────────────────────────────────────────────────
// Maps Supabase lesson rows + user progress into LessonNode[] for SerpentinePath.
//
// Module structure (both AI Fundamentals and Prompt Engineering Practic share
// this shape — 30 lessons, 5 quizzes + 1 final project = 6 natural checkpoints):
//
//   Module 1: lessons 1-4   (3 theory + quiz)
//   Module 2: lessons 5-9   (4 theory + quiz)
//   Module 3: lessons 10-14 (3 theory + 1 exercise + quiz)
//   Module 4: lessons 15-19 (4 theory + quiz)
//   Module 5: lessons 20-24 (3 theory + 1 exercise + quiz)
//   Module 6: lessons 25-30 (5 theory + final project)
//
// Quiz lessons + project lessons are rendered as checkpoint nodes (gold stars).
// Theory + exercise lessons are rendered as standard lesson nodes.

import {
  BookOpen,
  HelpCircle,
  Code2,
  Trophy,
  Brain,
  Target,
  Layers,
  Zap,
  GitBranch,
  Network,
  Sparkles,
  Bot,
  Cpu,
  Compass,
  type LucideIcon,
} from "lucide-react";
import type { LessonNode } from "@/components/ui/serpentine-path";

export interface RawLesson {
  id: string;
  title: string;
  type: string;
  order_index: number;
}

const MODULE_PALETTE = [
  "#6C5CE7", // violet  — module 1
  "#00CEC9", // teal    — module 2
  "#3B82F6", // blue    — module 3
  "#A29BFE", // light violet — module 4
  "#FDCB6E", // gold    — module 5
  "#10B981", // emerald — module 6
];

// ─── Per-course module names ──────────────────────────────────────────────────

// Module names — kept short (under ~22 chars) to avoid SerpentinePath
// zone-label overlap with adjacent lesson labels. Position implies module N.
export const MODULE_NAMES: Record<string, string[]> = {
  "ai-fundamentals": [
    "Bazele AI",
    "Machine Learning",
    "Rețele Neuronale",
    "LLM & Transformers",
    "Prompt Engineering",
    "Aplicații & Etică",
  ],
  "prompt-engineering-practic": [
    "Bazele Promptului",
    "Tehnici Avansate",
    "System & Format",
    "Reasoning Patterns",
    "Domain Prompting",
    "Agenți & Etică",
  ],
};

const FALLBACK_MODULE_NAMES = [
  "Modul 1",
  "Modul 2",
  "Modul 3",
  "Modul 4",
  "Modul 5",
  "Modul 6",
];

// ─── Icon assignment by lesson type + position ────────────────────────────────

// Lesson-type icon (used for theory + exercise nodes).
// We rotate through a small palette by order_index so adjacent nodes look distinct.
const THEORY_ICON_CYCLE: LucideIcon[] = [
  BookOpen,
  Brain,
  Layers,
  Network,
  Sparkles,
  Cpu,
  Target,
  Compass,
];

function lessonIcon(type: string, orderIndex: number): LucideIcon {
  if (type === "quiz") return HelpCircle;
  if (type === "exercise" || type === "lab") return Code2;
  if (type === "project" || type === "boss") return Trophy;
  // theory / lesson — rotate through the palette for visual variety
  return THEORY_ICON_CYCLE[(orderIndex - 1) % THEORY_ICON_CYCLE.length] ?? BookOpen;
}

// Special icons for the final project / a few thematic checkpoints
function checkpointIcon(orderIndex: number, lessonType: string, totalLessons: number): LucideIcon {
  if (lessonType === "project" || lessonType === "boss") return Trophy;
  if (orderIndex === totalLessons) return Trophy;
  // Vary checkpoint icons slightly
  if (orderIndex >= 25) return Bot;
  if (orderIndex >= 20) return GitBranch;
  if (orderIndex >= 15) return Zap;
  if (orderIndex >= 10) return Network;
  if (orderIndex >= 5) return Target;
  return Trophy;
}

// ─── Module index — derived from running checkpoint count ─────────────────────

/**
 * Compute the module index for each lesson by scanning left-to-right and
 * incrementing whenever we PASS a checkpoint (quiz or project).
 *
 * Result for a 30-lesson course with 5 quizzes (at 4, 9, 14, 19, 24) + final
 * project (at 30):
 *   Module 0: lessons 1-4   (ends with quiz)
 *   Module 1: lessons 5-9   (ends with quiz)
 *   Module 2: lessons 10-14 (ends with quiz)
 *   Module 3: lessons 15-19 (ends with quiz)
 *   Module 4: lessons 20-24 (ends with quiz)
 *   Module 5: lessons 25-30 (ends with final project)
 */
function computeModuleIndices(lessons: RawLesson[]): number[] {
  const out: number[] = [];
  let mi = 0;
  for (const lesson of lessons) {
    out.push(mi);
    if (
      lesson.type === "quiz" ||
      lesson.type === "project" ||
      lesson.type === "boss"
    ) {
      mi += 1;
    }
  }
  return out;
}

// ─── Main mapper ──────────────────────────────────────────────────────────────

export interface BuildNodesInput {
  courseSlug: string;
  lessons: RawLesson[];                  // already sorted by order_index ASC
  completedLessonIds: Set<string>;
}

export interface BuildNodesResult {
  nodes: LessonNode[];
  currentLessonId: string | null;        // first non-completed lesson, or null if course done
  completedCount: number;
  totalCount: number;
}

export function buildLessonNodes({
  courseSlug,
  lessons,
  completedLessonIds,
}: BuildNodesInput): BuildNodesResult {
  const sorted = [...lessons].sort((a, b) => a.order_index - b.order_index);
  const total = sorted.length;
  const moduleNames = MODULE_NAMES[courseSlug] ?? FALLBACK_MODULE_NAMES;
  const modIdxByLesson = computeModuleIndices(sorted);

  // Find the first non-completed lesson — that's "current"
  const currentIdx = sorted.findIndex((l) => !completedLessonIds.has(l.id));
  const currentLessonId = currentIdx === -1 ? null : sorted[currentIdx].id;

  const nodes: LessonNode[] = sorted.map((lesson, i) => {
    const isCompleted = completedLessonIds.has(lesson.id);
    const isCurrent = lesson.id === currentLessonId;
    const status: LessonNode["status"] = isCompleted
      ? "completed"
      : isCurrent
      ? "current"
      : "locked";

    const isCheckpoint =
      lesson.type === "quiz" ||
      lesson.type === "project" ||
      lesson.type === "boss";
    const moduleIndex = modIdxByLesson[i];
    const moduleName = moduleNames[moduleIndex] ?? `Modul ${moduleIndex + 1}`;
    const moduleColor = MODULE_PALETTE[moduleIndex % MODULE_PALETTE.length];

    const icon = isCheckpoint
      ? checkpointIcon(lesson.order_index, lesson.type, total)
      : lessonIcon(lesson.type, lesson.order_index);

    // Sublabel — short context. Quizzes show "Quiz" + module info, projects "Final".
    let sublabel: string;
    if (lesson.type === "quiz") {
      sublabel = `Quiz · Modul ${moduleIndex + 1}`;
    } else if (lesson.type === "project" || lesson.type === "boss") {
      sublabel = "Proiect Final";
    } else if (lesson.type === "exercise" || lesson.type === "lab") {
      sublabel = `Exercițiu · L${lesson.order_index}`;
    } else {
      sublabel = `Lecția ${lesson.order_index}/${total}`;
    }

    return {
      id: lesson.id,
      type: isCheckpoint ? "checkpoint" : "lesson",
      status,
      label: lesson.title,
      sublabel,
      moduleIndex,
      moduleName,
      moduleColor,
      icon,
    };
  });

  return {
    nodes,
    currentLessonId,
    completedCount: completedLessonIds.size,
    totalCount: total,
  };
}
