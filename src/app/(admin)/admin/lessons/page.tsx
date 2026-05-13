import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { FileText, HelpCircle, Wrench, FolderOpen, ThumbsUp, ThumbsDown } from "lucide-react";

const TYPE_ICON: Record<string, React.ElementType> = {
  theory: FileText,
  quiz: HelpCircle,
  exercise: Wrench,
  project: FolderOpen,
  lesson: FileText,
  lab: Wrench,
  boss: FolderOpen,
};

const TYPE_LABEL: Record<string, string> = {
  theory: "Teorie",
  quiz: "Quiz",
  exercise: "Exercițiu",
  project: "Proiect",
  lesson: "Teorie",
  lab: "Exercițiu",
  boss: "Proiect",
};

const TYPE_COLOR: Record<string, string> = {
  theory: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  quiz: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  exercise: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  project: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  lesson: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  lab: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  boss: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
};

function percent(n: number, total: number): string {
  if (total === 0) return "—";
  return `${Math.round((n / total) * 100)}%`;
}

export default async function AdminLessonsPage() {
  const adminClient = createSupabaseAdminClient();

  // Fetch lessons with course info
  const { data: lessons, error: lessonsError } = await adminClient
    .from("lessons")
    .select("id, title, type, order_index, course_id, courses(title, slug)")
    .order("order_index");

  // Fetch all completed progress grouped by lesson
  const { data: progress } = await adminClient
    .from("user_progress")
    .select("lesson_id, completed, score")
    .eq("completed", true);

  // Fetch all feedback grouped by lesson
  const { data: feedback } = await adminClient
    .from("lesson_feedback")
    .select("lesson_id, rating");

  // Build aggregation maps
  const completionMap = new Map<string, { count: number; scoreSum: number; scoreCount: number }>();
  for (const p of progress ?? []) {
    const existing = completionMap.get(p.lesson_id) ?? { count: 0, scoreSum: 0, scoreCount: 0 };
    existing.count += 1;
    if (p.score !== null && p.score !== undefined) {
      existing.scoreSum += p.score;
      existing.scoreCount += 1;
    }
    completionMap.set(p.lesson_id, existing);
  }

  const feedbackMap = new Map<string, { clear: number; hard: number }>();
  for (const f of feedback ?? []) {
    const existing = feedbackMap.get(f.lesson_id) ?? { clear: 0, hard: 0 };
    if (f.rating === "clear") existing.clear += 1;
    else if (f.rating === "hard") existing.hard += 1;
    feedbackMap.set(f.lesson_id, existing);
  }

  // Build merged rows — sort by completions desc
  const rows = (lessons ?? [])
    .map((lesson) => {
      const comp = completionMap.get(lesson.id) ?? { count: 0, scoreSum: 0, scoreCount: 0 };
      const fb = feedbackMap.get(lesson.id) ?? { clear: 0, hard: 0 };
      const avgScore =
        comp.scoreCount > 0 ? Math.round(comp.scoreSum / comp.scoreCount) : null;
      const courseRaw = lesson.courses;
      const course = Array.isArray(courseRaw)
        ? (courseRaw[0] as { title: string; slug: string } | undefined) ?? null
        : (courseRaw as { title: string; slug: string } | null);
      return {
        id: lesson.id,
        title: lesson.title,
        type: lesson.type,
        order_index: lesson.order_index,
        courseTitle: course?.title ?? "—",
        completions: comp.count,
        avgScore,
        fbClear: fb.clear,
        fbHard: fb.hard,
      };
    })
    .sort((a, b) => b.completions - a.completions);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Lecții</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {rows.length} lecții · performanță și feedback
        </p>
      </div>

      {lessonsError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          Eroare la încărcarea lecțiilor: {lessonsError.message}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground w-8">#</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Lecție</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Curs</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tip</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Completări</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Scor mediu</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    Nicio lecție disponibilă.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const Icon = TYPE_ICON[row.type] ?? FileText;
                  const totalFb = row.fbClear + row.fbHard;
                  return (
                    <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground tabular-nums text-xs">
                        {row.order_index}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-foreground line-clamp-1">
                          {row.title}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs truncate max-w-[140px]">
                        {row.courseTitle}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            TYPE_COLOR[row.type] ?? "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon className="h-3 w-3" />
                          {TYPE_LABEL[row.type] ?? row.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium text-foreground">
                        {row.completions}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-foreground">
                        {row.avgScore !== null ? `${row.avgScore}%` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {totalFb === 0 ? (
                          <span className="block text-center text-xs text-muted-foreground">—</span>
                        ) : (
                          <div className="flex items-center justify-center gap-3">
                            <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                              <ThumbsUp className="h-3 w-3" />
                              {row.fbClear}
                              <span className="text-muted-foreground">
                                ({percent(row.fbClear, totalFb)})
                              </span>
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
                              <ThumbsDown className="h-3 w-3" />
                              {row.fbHard}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
