"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { SerpentinePath, type LessonNode } from "@/components/ui/serpentine-path";
import { EmptyState } from "@/components/ui/empty-state";

interface CourseMapProps {
  /** One continuous node list spanning every course (built by buildAllCoursesNodes). */
  nodes: LessonNode[];
  currentLessonId: string | null;
  /** Scroll target — the selector sets this to jump between course sections. */
  activeNodeId?: string;
  /** lessonId → course slug, for routing a node click to the right lesson URL. */
  nodeCourseSlug: Record<string, string>;
  completedCount: number;
  totalCount: number;
}

/**
 * Renders the unified 12-course serpentine. Every course is one colored
 * "world" in a single continuous path.
 */
export function CourseMap({
  nodes,
  currentLessonId,
  activeNodeId,
  nodeCourseSlug,
  completedCount,
  totalCount,
}: CourseMapProps) {
  const router = useRouter();

  function handleNodeClick(nodeId: string) {
    const node = nodes.find((n) => n.id === nodeId);
    // Locked nodes never navigate.
    if (!node || node.status === "locked") return;
    const slug = nodeCourseSlug[nodeId];
    if (slug) router.push(`/courses/${slug}/${nodeId}`);
  }

  if (nodes.length === 0) {
    return (
      <div className="py-20">
        <EmptyState
          icon={Sparkles}
          title="Niciun curs disponibil"
          description="Lecțiile vor apărea aici imediat ce sunt sincronizate. Verifică secțiunea de development pentru a sincroniza conținutul MDX."
        />
      </div>
    );
  }

  const isFreshStart = completedCount === 0;
  const isAllDone = totalCount > 0 && completedCount === totalCount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      {/* Welcome banner — brand-new student */}
      {isFreshStart && (
        <div className="mb-6 mx-auto max-w-md">
          <div className="rounded-2xl border border-aurora-primary-500/30 bg-gradient-to-br from-aurora-primary-500/10 to-aurora-accent-500/10 px-5 py-4 text-center">
            <p className="text-sm font-semibold text-foreground mb-1">
              Începe-ți călătoria!
            </p>
            <p className="text-xs text-muted-foreground">
              Nodul evidențiat de mai jos este prima ta lecție.
            </p>
          </div>
        </div>
      )}

      {/* Everything completed */}
      {isAllDone && (
        <div className="mb-6 mx-auto max-w-md">
          <div className="rounded-2xl border border-aurora-gold-500/30 bg-gradient-to-br from-aurora-gold-500/10 to-aurora-primary-500/10 px-5 py-4 text-center">
            <p className="text-sm font-bold text-aurora-gold-500 mb-1">
              🎉 Felicitări — toate lecțiile sunt complete!
            </p>
            <p className="text-xs text-muted-foreground">
              Ai parcurs toate cele {totalCount} lecții.
            </p>
          </div>
        </div>
      )}

      <SerpentinePath
        nodes={nodes}
        onNodeClick={handleNodeClick}
        activeNodeId={activeNodeId ?? currentLessonId ?? undefined}
        intensity="normal"
        showModuleBackgrounds
      />
    </motion.div>
  );
}
