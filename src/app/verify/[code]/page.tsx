import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle, Award, Calendar, BookOpen, Hash } from "lucide-react";

interface PageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(code);
  if (!isValidUuid) {
    return { title: "Certificat invalid — DevPath RO" };
  }
  return { title: `Verificare certificat — DevPath RO` };
}

function formatRoDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function VerifyCertificatePage({ params }: PageProps) {
  const { code } = await params;

  // Validate UUID format before hitting DB
  const isValidUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      code
    );

  type CertRow = {
    code: string;
    created_at: string;
    users: { name: string | null; email: string } | null;
    courses: { title: string; slug: string } | null;
  };

  let cert: CertRow | null = null;

  if (isValidUuid) {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("certificates")
      .select("code, created_at, users(name, email), courses(title, slug)")
      .eq("code", code)
      .maybeSingle();
    cert = data as CertRow | null;
  }

  const isValid = !!cert;

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-foreground">
            Dev<span className="text-primary">Path</span>{" "}
            <span className="text-muted-foreground font-normal text-sm">RO</span>
          </Link>
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Intră în cont
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        {isValid && cert ? (
          <>
            {/* Valid certificate */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-950 mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Certificat autentic ✓
              </h1>
              <p className="text-muted-foreground mt-2">
                Acest certificat a fost emis de DevPath RO și este valid.
              </p>
            </div>

            {/* Certificate card */}
            <div className="rounded-2xl border-2 border-green-200 dark:border-green-800 bg-card overflow-hidden">
              {/* Header strip */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-5 text-white">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 opacity-90" />
                  <div>
                    <p className="text-sm font-medium opacity-80">
                      CERTIFICAT DE ABSOLVIRE
                    </p>
                    <p className="text-xl font-bold">DevPath RO</p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="p-8 space-y-5">
                {/* Student name */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Student
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {cert.users?.name ?? cert.users?.email?.split("@")[0] ?? "Student"}
                  </p>
                </div>

                {/* Course */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                      Curs absolvit
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {cert.courses?.title ?? "Curs DevPath RO"}
                    </p>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                      Data emiterii
                    </p>
                    <p className="text-base font-medium text-foreground">
                      {formatRoDate(cert.created_at)}
                    </p>
                  </div>
                </div>

                {/* Certificate ID */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted shrink-0 mt-0.5">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                      ID certificat
                    </p>
                    <p className="text-xs font-mono text-muted-foreground break-all">
                      {cert.code}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-border px-8 py-4 bg-muted/30 flex items-center justify-between gap-4 flex-wrap">
                <p className="text-xs text-muted-foreground">
                  Emis de platforma DevPath RO — devpath.ro
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verificat
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Vrei să înveți și tu AI? Platforma DevPath RO oferă cursuri interactive în română.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-lg hover:bg-primary/90 transition text-sm"
              >
                Descoperă DevPath RO
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Invalid certificate */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-950 mb-4">
                <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-3">
                Certificat invalid
              </h1>
              <p className="text-muted-foreground max-w-sm mx-auto mb-2">
                Codul furnizat nu corespunde niciunui certificat emis de DevPath RO.
              </p>
              {!isValidUuid && (
                <p className="text-xs text-muted-foreground">
                  Formatul codului este incorect.
                </p>
              )}
            </div>

            <div className="mt-8 rounded-xl border border-border bg-card p-6 space-y-3">
              <p className="text-sm font-semibold text-foreground">
                Posibile cauze:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground">
                <li>Codul a fost introdus greșit — verifică URL-ul</li>
                <li>Certificatul nu a fost generat pe această platformă</li>
                <li>Eroare la copierea link-ului de verificare</li>
              </ul>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/"
                className="text-sm text-primary hover:underline font-medium"
              >
                ← Înapoi la DevPath RO
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
