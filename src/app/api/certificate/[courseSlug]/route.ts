import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import QRCode from "qrcode";
import React from "react";
import { CertificateDocument } from "@/components/pdf/certificate-document";
import { SITE_URL } from "@/lib/site";

// Node.js runtime — PDF generation requires canvas (not supported on edge)
export const runtime = "nodejs";

const paramsSchema = z.object({
  courseSlug: z.string().min(1).max(100),
});

function formatRoDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { courseSlug: string } }
): Promise<NextResponse> {
  // ─── 1. Auth ──────────────────────────────────────────────────────────────
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Neautentificat" }, { status: 401 });
  }

  // ─── 2. Validate params ───────────────────────────────────────────────────
  const parsed = paramsSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: "Parametru invalid" }, { status: 400 });
  }
  const { courseSlug } = parsed.data;

  // ─── 3. Fetch course ──────────────────────────────────────────────────────
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, title, slug")
    .eq("slug", courseSlug)
    .single();

  if (courseError || !course) {
    return NextResponse.json({ error: "Curs negăsit" }, { status: 404 });
  }

  // ─── 4. Verify all lessons are complete ───────────────────────────────────
  const { data: allLessons } = await supabase
    .from("lessons")
    .select("id")
    .eq("course_id", course.id);

  const lessonIds = (allLessons ?? []).map((l) => l.id);

  const { data: completedProgress } = await supabase
    .from("user_progress")
    .select("lesson_id")
    .eq("user_id", user.id)
    .eq("completed", true)
    .in("lesson_id", lessonIds.length > 0 ? lessonIds : ["none"]);

  const totalLessons = lessonIds.length;
  const completedCount = completedProgress?.length ?? 0;

  if (totalLessons === 0 || completedCount < totalLessons) {
    return NextResponse.json(
      {
        error: `Cursul nu este complet. Ai completat ${completedCount}/${totalLessons} lecții.`,
      },
      { status: 403 }
    );
  }

  // ─── 5. Upsert certificate record (keep existing code if already issued) ──
  const adminSupabase = createSupabaseAdminClient();

  // Check if certificate already exists to preserve its code + date
  const { data: existing } = await adminSupabase
    .from("certificates")
    .select("code, created_at")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .maybeSingle();

  let certCode: string;
  let certCreatedAt: string;

  if (existing) {
    certCode = existing.code as string;
    certCreatedAt = existing.created_at as string;
  } else {
    const { data: newCert, error: insertError } = await adminSupabase
      .from("certificates")
      .insert({ user_id: user.id, course_id: course.id })
      .select("code, created_at")
      .single();

    if (insertError || !newCert) {
      return NextResponse.json(
        { error: "Eroare la crearea certificatului" },
        { status: 500 }
      );
    }
    certCode = newCert.code as string;
    certCreatedAt = newCert.created_at as string;
  }

  // ─── 6. Fetch student name ────────────────────────────────────────────────
  const { data: profile } = await adminSupabase
    .from("users")
    .select("name, email")
    .eq("id", user.id)
    .single();

  const studentName =
    profile?.name ??
    profile?.email?.split("@")[0] ??
    "Student";

  // ─── 7. Generate QR code ──────────────────────────────────────────────────
  const verifyUrl = `${SITE_URL}/verify/${certCode}`;
  const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
    width: 200,
    margin: 1,
    color: { dark: "#1e293b", light: "#ffffff" },
  });

  // ─── 8. Render PDF ────────────────────────────────────────────────────────
  const pdfElement = React.createElement(CertificateDocument, {
    studentName,
    courseTitle: course.title,
    completedDate: formatRoDate(certCreatedAt),
    certificateCode: certCode,
    qrCodeDataUrl,
  }) as unknown as React.ReactElement<DocumentProps>;

  const pdfBuffer = await renderToBuffer(pdfElement);

  // ─── 9. Return PDF stream ─────────────────────────────────────────────────
  const safeName = studentName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificat-${courseSlug}-${safeName}.pdf"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
