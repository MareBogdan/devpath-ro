import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { Eye, EyeOff, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { hideComment, unhideComment, deleteComment } from "./actions";

const PAGE_SIZE = 50;

function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface CommentRow {
  id: string;
  content: string;
  created_at: string;
  is_reported: boolean | null;
  is_hidden: boolean | null;
  userName: string;
  lessonTitle: string;
}

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: { filter?: string; page?: string };
}) {
  const filter = searchParams.filter ?? "all";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const adminClient = createSupabaseAdminClient();

  let query = adminClient
    .from("lesson_comments")
    .select(
      "id, content, created_at, is_reported, is_hidden, users(name), lessons(title)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filter === "reported") {
    query = query.eq("is_reported", true);
  } else if (filter === "hidden") {
    query = query.eq("is_hidden", true);
  }

  const { data: comments, count, error } = await query;

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  const rows: CommentRow[] = (comments ?? []).map((c) => {
    const usersRaw = c.users;
    const userName = Array.isArray(usersRaw)
      ? (usersRaw[0] as { name: string | null } | undefined)?.name ?? "—"
      : (usersRaw as { name: string | null } | null)?.name ?? "—";

    const lessonsRaw = c.lessons;
    const lessonTitle = Array.isArray(lessonsRaw)
      ? (lessonsRaw[0] as { title: string } | undefined)?.title ?? "—"
      : (lessonsRaw as { title: string } | null)?.title ?? "—";

    return {
      id: c.id,
      content: c.content,
      created_at: c.created_at,
      is_reported: c.is_reported ?? false,
      is_hidden: c.is_hidden ?? false,
      userName,
      lessonTitle,
    };
  });

  const tabs = [
    { key: "all", label: "Toate" },
    { key: "reported", label: "Raportate" },
    { key: "hidden", label: "Ascunse" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Comentarii</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {count ?? 0} comentarii · moderare conținut
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          Eroare la încărcarea comentariilor: {error.message}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 border-b border-border">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/comments?filter=${tab.key}`}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              filter === tab.key
                ? "bg-card border border-b-card border-border text-foreground -mb-px"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Utilizator</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Lecție</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Conținut</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Data</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    Niciun comentariu în această categorie.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`transition-colors ${
                      row.is_reported
                        ? "bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100/60 dark:hover:bg-amber-950/30"
                        : row.is_hidden
                        ? "opacity-50 hover:opacity-70 hover:bg-muted/20"
                        : "hover:bg-muted/20"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-xs font-semibold text-amber-700 dark:text-amber-400 shrink-0">
                          {row.userName[0]?.toUpperCase() ?? "?"}
                        </div>
                        <span className="font-medium text-foreground truncate max-w-[120px]">
                          {row.userName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground truncate max-w-[160px]">
                      {row.lessonTitle}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      <p className="max-w-xs truncate text-sm">
                        {row.content.slice(0, 100)}
                        {row.content.length > 100 ? "…" : ""}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(row.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {row.is_reported && (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                            <AlertTriangle className="h-3 w-3" />
                            Raportat
                          </span>
                        )}
                        {row.is_hidden && (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium bg-muted text-muted-foreground">
                            <EyeOff className="h-3 w-3" />
                            Ascuns
                          </span>
                        )}
                        {!row.is_reported && !row.is_hidden && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {/* Hide / Unhide */}
                        {row.is_hidden ? (
                          <form
                            action={async () => {
                              "use server";
                              await unhideComment(row.id);
                            }}
                          >
                            <button
                              type="submit"
                              title="Afișează"
                              className="p-1.5 rounded-md hover:bg-green-100 dark:hover:bg-green-950/40 text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                          </form>
                        ) : (
                          <form
                            action={async () => {
                              "use server";
                              await hideComment(row.id);
                            }}
                          >
                            <button
                              type="submit"
                              title="Ascunde"
                              className="p-1.5 rounded-md hover:bg-amber-100 dark:hover:bg-amber-950/40 text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                            >
                              <EyeOff className="h-3.5 w-3.5" />
                            </button>
                          </form>
                        )}
                        {/* Delete */}
                        <form
                          action={async () => {
                            "use server";
                            await deleteComment(row.id);
                          }}
                        >
                          <button
                            type="submit"
                            title="Șterge"
                            className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-950/40 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Pagina {page} din {totalPages}
          </p>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Link
                href={`/admin/comments?${new URLSearchParams({
                  filter,
                  page: String(page - 1),
                })}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              >
                Anterior
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/comments?${new URLSearchParams({
                  filter,
                  page: String(page + 1),
                })}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              >
                Următor
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
