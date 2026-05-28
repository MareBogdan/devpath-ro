"use client";

import { useState } from "react";
import { Download, Loader2, Award } from "lucide-react";

interface CertificateDownloadButtonProps {
  courseSlug: string;
  variant?: "card" | "banner";
}

export function CertificateDownloadButton({
  courseSlug,
  variant = "card",
}: CertificateDownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/certificate/${courseSlug}`);
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        setError(json.error ?? "Eroare la generarea certificatului");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificat-${courseSlug}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[certificate-download] Network error:", err);
      setError("Conexiune întreruptă. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  }

  if (variant === "banner") {
    return (
      <div className="rounded-xl border border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 p-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Curs complet! 🎓
            </p>
            <p className="text-xs text-muted-foreground">
              Descarcă certificatul tău de absolvire
            </p>
          </div>
        </div>
        <button
          onClick={handleDownload}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition shrink-0"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {loading ? "Se generează..." : "Descarcă Certificat PDF"}
        </button>
        {error && (
          <p className="w-full text-xs text-red-600 dark:text-red-400 mt-1">
            {error}
          </p>
        )}
      </div>
    );
  }

  // card variant — compact link style
  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleDownload}
        disabled={loading}
        className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Award className="h-4 w-4" />
        )}
        {loading ? "Se generează PDF..." : "Descarcă Certificat PDF"}
      </button>
      {error && (
        <p className="text-xs text-red-500 mt-0.5">{error}</p>
      )}
    </div>
  );
}
