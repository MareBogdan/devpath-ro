"use client";

import { useState } from "react";
import { FolderOpen, Github, CheckCircle2, Loader2 } from "lucide-react";
import { submitProject } from "@/app/(dashboard)/courses/actions";

interface ProjectSubmissionFormProps {
  courseId: string;
  existingProjectId: string | null;
}

export function ProjectSubmissionForm({
  courseId,
  existingProjectId,
}: ProjectSubmissionFormProps) {
  const [submitted, setSubmitted] = useState(!!existingProjectId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");

  if (submitted) {
    return (
      <div className="mt-8 rounded-2xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30 p-6 flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-green-800 dark:text-green-300">
            Proiect trimis cu succes!
          </p>
          <p className="text-sm text-green-700 dark:text-green-400 mt-0.5">
            Proiectul tău a fost salvat și apare pe profilul tău public.
          </p>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await submitProject({ courseId, title, description, githubUrl });

    if (result.error) {
      setError(result.error);
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  }

  return (
    <div className="mt-8 rounded-2xl border border-border bg-card p-6 space-y-5">
      <div className="flex items-center gap-2">
        <FolderOpen className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Trimite proiectul tău</h2>
      </div>

      <p className="text-sm text-muted-foreground">
        Descrie ce ai construit. Proiectul tău va fi vizibil pe profilul tău
        public ca parte din portofoliu.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground" htmlFor="proj-title">
            Titlu <span className="text-destructive">*</span>
          </label>
          <input
            id="proj-title"
            type="text"
            required
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ex. Clasificator de imagini cu CNN"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground" htmlFor="proj-desc">
            Descriere
          </label>
          <textarea
            id="proj-desc"
            rows={3}
            maxLength={2000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ce ai construit? Ce ai învățat? Ce tehnologii ai folosit?"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
          />
        </div>

        {/* GitHub URL */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground" htmlFor="proj-github">
            <span className="inline-flex items-center gap-1">
              <Github className="h-3.5 w-3.5" />
              Link GitHub (opțional)
            </span>
          </label>
          <input
            id="proj-github"
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/username/repo"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Se trimite...
            </>
          ) : (
            <>
              <FolderOpen className="h-3.5 w-3.5" />
              Trimite proiectul
            </>
          )}
        </button>
      </form>
    </div>
  );
}
