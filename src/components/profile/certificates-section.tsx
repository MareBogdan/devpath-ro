"use client";

import { motion } from "framer-motion";
import { Award, GraduationCap } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { CertificateDownloadButton } from "@/components/course/certificate-download-button";

export interface CertificateRow {
  id: string;
  courseSlug: string;
  courseTitle: string;
  issuedAt: string;
  code: string;
}

interface CertificatesSectionProps {
  certificates: CertificateRow[];
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("ro-RO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function CertificatesSection({ certificates }: CertificatesSectionProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-aurora-gold-500/10">
          <GraduationCap className="h-4 w-4 text-aurora-gold-500" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Certificate</h2>
      </div>

      {certificates.length === 0 ? (
        <EmptyState
          icon={Award}
          title="Niciun certificat încă"
          description="Completează un curs pentru a obține certificatul tău în format PDF, verificabil printr-un cod unic."
          actionLabel="Vezi cursurile"
          actionHref="/courses"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {certificates.map((cert, i) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              className="rounded-xl border border-aurora-gold-500/30 bg-gradient-to-br from-aurora-gold-500/10 to-aurora-primary-500/5 p-4"
            >
              <div className="flex items-start gap-3 mb-3">
                <Award className="h-5 w-5 text-aurora-gold-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm leading-tight">
                    {cert.courseTitle}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Eliberat {formatDate(cert.issuedAt)}
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground/80 mt-0.5">
                    Cod: {cert.code}
                  </p>
                </div>
              </div>
              <CertificateDownloadButton courseSlug={cert.courseSlug} variant="card" />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
