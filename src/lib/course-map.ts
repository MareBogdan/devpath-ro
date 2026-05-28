// ─── Course Map Helpers ───────────────────────────────────────────────────────
// Aggregates every Supabase course + its lessons into ONE continuous
// LessonNode[] for the unified 12-course SerpentinePath. Each course is one
// "world": its lessons are chunked into fixed-size modules, all share that
// course's single color, and form a contiguous, atmospherically-tinted section
// of the path.

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

export interface RawCourse {
  id: string;
  slug: string;
  title: string;
}

// ─── 12-course palette — spectral sweep violet → gold ─────────────────────────
//
// A genuine spectral progression: each hue sits ~19° from its neighbour, so no
// two adjacent courses look alike and the full path reads as one cohesive
// rainbow (C1 violet → C12 gold).
//
// The originally-suggested palette is replaced: it had a hard duplicate (C2 and
// C7 were both #8B5CF6) and several warm/cool zigzags (C6 blue between emerald
// and indigo; C11 purple wedged between pink and gold). Red/pink are omitted on
// purpose — they sit opposite violet on the colour wheel, so including them
// would force a hue reversal and break the smooth, single-direction sweep.
//
// Index = course position (course 1 → COURSE_PALETTE[0]).
export const COURSE_PALETTE = [
  "#6C5CE7", // C1  Hardware & Fizică       — violet
  "#5C6FEC", // C2  Sisteme de Operare      — indigo
  "#4A8FE8", // C3  Rețele & Internet       — blue
  "#2BA8E0", // C4  Python                  — sky
  "#1FBFC9", // C5  Algoritmi               — cyan
  "#1ECCA0", // C6  Baze de Date            — teal
  "#2BCE78", // C7  Matematică pentru AI    — green
  "#4FCB54", // C8  Machine Learning        — spring green
  "#84C93C", // C9  Deep Learning           — lime
  "#AFC52E", // C10 AI Generativ & LLMs     — yellow-lime
  "#DCBB2A", // C11 Agentic AI & MCP        — amber
  "#FDCB6E", // C12 AI în Producție         — gold
] as const;

/** Course color by 0-based course position, wrapping past 12. */
export function courseColor(courseIndex: number): string {
  const n = COURSE_PALETTE.length;
  return COURSE_PALETTE[((courseIndex % n) + n) % n];
}

// ─── Course banner keywords ───────────────────────────────────────────────────
// Short "what you'll learn" keywords per course, shown in the serpentine's
// floating course banner cards. Sourced verbatim from CURRICULUM-STRUCTURE.md,
// keyed by course slug.
export const COURSE_BANNERS: Record<string, string[]> = {
  "hardware-fizica": ["Electroni", "tranzistori", "CPU", "Assembly"],
  "sisteme-de-operare": ["Boot", "procese", "memorie", "containere"],
  "retele-internet": ["TCP/IP", "DNS", "HTTP", "securitate"],
  "python-inginerie-software": ["Sintaxă", "OOP", "async", "FastAPI"],
  "algoritmi-structuri-date": ["Big O", "sortare", "grafuri", "DP"],
  "baze-date-ingineria-datelor": ["SQL", "NoSQL", "Redis", "pgvector"],
  "matematica-ai": ["Algebră liniară", "calcul", "statistică"],
  "machine-learning": ["Regresie", "clasificare", "RL", "GPU"],
  "deep-learning-computer-vision": ["CNN", "Transformers", "ViT", "HuggingFace"],
  "ai-generativ-llms": ["RAG", "fine-tuning", "Ollama", "Gradio"],
  "agentic-ai-mcp": ["Tool calling", "LangGraph", "MCP", "A2A"],
  "ai-in-productie": ["MLOps", "vLLM", "evals", "securitate AI"],
};

// ─── Course one-line descriptions ─────────────────────────────────────────────
// Shown on the World Gate cards between courses. Verbatim from the curriculum.
const COURSE_DESCRIPTIONS: Record<string, string> = {
  "hardware-fizica": "De la electron la primul tău procesor",
  "sisteme-de-operare": "Ce se întâmplă când apeși butonul de pornire",
  "retele-internet": "Cum ajunge un pachet de la tine la Tokyo",
  "python-inginerie-software": "Codul care face totul să funcționeze",
  "algoritmi-structuri-date": "Diferența dintre cod care merge și cod care scalează",
  "baze-date-ingineria-datelor": "De la Excel la pipeline-ul unui model AI",
  "matematica-ai": "Ecuațiile care stau în spatele inteligenței",
  "machine-learning": "Primul model care învață din date",
  "deep-learning-computer-vision": "De la perceptron la arhitecturile care au schimbat lumea",
  "ai-generativ-llms": "Cum gândește și creează un model de limbaj",
  "agentic-ai-mcp": "Modele care planifică și acționează singure",
  "ai-in-productie": "De la experiment la sistem care rulează 24/7",
};

// ─── Module cadence ───────────────────────────────────────────────────────────
// Lessons within a course are chunked into modules of this size; the last node
// of each chunk becomes a checkpoint. Drives the serpentine's wave turnarounds.
const MODULE_SIZE = 5;

// ─── Icon assignment ──────────────────────────────────────────────────────────

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
  return THEORY_ICON_CYCLE[(orderIndex - 1) % THEORY_ICON_CYCLE.length] ?? BookOpen;
}

function checkpointIcon(
  orderIndex: number,
  lessonType: string,
  totalLessons: number
): LucideIcon {
  if (lessonType === "project" || lessonType === "boss") return Trophy;
  if (orderIndex === totalLessons) return Trophy;
  if (orderIndex >= 25) return Bot;
  if (orderIndex >= 20) return GitBranch;
  if (orderIndex >= 15) return Zap;
  if (orderIndex >= 10) return Network;
  if (orderIndex >= 5) return Target;
  return Trophy;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CourseSection {
  courseIndex: number;
  courseId: string;
  slug: string;
  title: string;
  color: string;
  /** First node of the course — selector clicks scroll the path here. */
  firstNodeId: string | null;
}

export interface BuildAllInput {
  courses: RawCourse[]; // ordered by order_index ASC
  lessonsByCourse: Record<string, RawLesson[]>;
  completedLessonIds: Set<string>;
}

export interface BuildAllResult {
  nodes: LessonNode[];
  /** First non-completed lesson across ALL courses, or null when everything is done. */
  currentLessonId: string | null;
  /** lessonId → course slug, for building lesson URLs from a node click. */
  nodeCourseSlug: Record<string, string>;
  sections: CourseSection[];
  completedCount: number;
  totalCount: number;
}

// ─── Builder ──────────────────────────────────────────────────────────────────

/**
 * Build one continuous LessonNode[] spanning every course. Courses appear in
 * order_index order; the first non-completed lesson across all courses is the
 * single "current" node — everything before it is "completed", everything
 * after is "locked". Every node carries its course color + course identity so
 * the serpentine can paint per-course nodes, paths and atmospheric zones.
 */
export function buildAllCoursesNodes({
  courses,
  lessonsByCourse,
  completedLessonIds,
}: BuildAllInput): BuildAllResult {
  const nodes: LessonNode[] = [];
  const nodeCourseSlug: Record<string, string> = {};
  const sections: CourseSection[] = [];
  let currentLessonId: string | null = null;
  let foundCurrent = false;
  let totalCount = 0;

  courses.forEach((course, courseIndex) => {
    const color = courseColor(courseIndex);
    const bullets = COURSE_BANNERS[course.slug] ?? [];
    const lessons = [...(lessonsByCourse[course.id] ?? [])].sort(
      (a, b) => a.order_index - b.order_index
    );
    const courseTotal = lessons.length;
    totalCount += courseTotal;

    sections.push({
      courseIndex,
      courseId: course.id,
      slug: course.slug,
      title: course.title,
      color,
      firstNodeId: lessons[0]?.id ?? null,
    });

    // World Gate — a portal card announcing this course, inserted right before
    // the course's first lesson. EVERY course gets one, including the first, so
    // a gate is always visible even when only Course 1 is seeded.
    if (courseTotal > 0) {
      nodes.push({
        id: `world-gate-${course.slug}`,
        type: "world-gate",
        status: foundCurrent ? "locked" : "completed",
        label: course.title,
        moduleColor: color,
        courseIndex,
        courseName: course.title,
        courseBullets: bullets,
        metadata: {
          description: COURSE_DESCRIPTIONS[course.slug] ?? "",
          lessonCount: String(courseTotal),
        },
      });
    }

    lessons.forEach((lesson, i) => {
      const isCompleted = completedLessonIds.has(lesson.id);
      let status: LessonNode["status"];
      if (isCompleted) {
        status = "completed";
      } else if (!foundCurrent) {
        status = "current";
        foundCurrent = true;
        currentLessonId = lesson.id;
      } else {
        status = "locked";
      }

      // Fixed-cadence modules — last node of each chunk (and the final node of
      // the course) is a checkpoint, so each course renders as a clean snake.
      const moduleIndex = Math.floor(i / MODULE_SIZE);
      const isCheckpoint =
        (i + 1) % MODULE_SIZE === 0 || i === courseTotal - 1;

      const icon = isCheckpoint
        ? checkpointIcon(lesson.order_index, lesson.type, courseTotal)
        : lessonIcon(lesson.type, lesson.order_index);

      let sublabel: string;
      if (isCheckpoint) {
        sublabel = course.title;
      } else if (lesson.type === "exercise" || lesson.type === "lab") {
        sublabel = `Exercițiu · L${lesson.order_index}`;
      } else {
        sublabel = `Lecția ${lesson.order_index}/${courseTotal}`;
      }

      nodes.push({
        id: lesson.id,
        type: isCheckpoint ? "checkpoint" : "lesson",
        status,
        label: lesson.title,
        sublabel,
        moduleIndex,
        moduleName: `Modul ${moduleIndex + 1}`,
        moduleColor: color, // single course color drives node + path painting
        courseIndex,
        courseName: course.title,
        courseBullets: bullets,
        icon,
      });
      nodeCourseSlug[lesson.id] = course.slug;
    });
  });

  return {
    nodes,
    currentLessonId,
    nodeCourseSlug,
    sections,
    completedCount: completedLessonIds.size,
    totalCount,
  };
}
