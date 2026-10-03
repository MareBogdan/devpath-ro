import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateText } from "ai";
import { z } from "zod";
import { aiModel, isAIConfigured } from "@/lib/ai/model";
import { disabledResponse } from "@/lib/optional-features";

export const runtime = "edge";

const bodySchema = z.object({
  profileType: z.enum([
    "medical",
    "entrepreneur",
    "student_non_cs",
    "student_cs",
    "developer",
    "teacher",
    "curious",
  ]),
  learningGoal: z.enum(["understand", "build", "career", "curiosity"]),
  userName: z.string().max(100),
});

const PROFILE_LABELS: Record<string, string> = {
  medical: "din domeniul medical",
  entrepreneur: "antreprenor sau manager",
  student_non_cs: "student la o facultate non-IT",
  student_cs: "student IT sau developer în formare",
  developer: "developer profesionist",
  teacher: "profesor sau educator",
  curious: "curios, fără un background tehnic specific",
};

const GOAL_LABELS: Record<string, string> = {
  understand: "vrea să înțeleagă cum funcționează AI-ul",
  build: "vrea să construiască lucruri cu AI",
  career: "vrea să avanseze în carieră cu ajutorul AI",
  curiosity: "vrea să rămână informat și curios",
};

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Neautentificat" }, { status: 401 });

  // Text AI is optional: onboarding falls back to a static welcome when this is 503.
  if (!isAIConfigured()) {
    return disabledResponse("ai", "AI indisponibil momentan.");
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Date invalide" }, { status: 400 });

  const { profileType, learningGoal, userName } = parsed.data;

  try {
    const { text } = await generateText({
      model: aiModel,
      system: `Ești Cosmo, mascota prietenoasă a platformei DevPath RO.
Scrie un mesaj de bun venit în română, cald și personal, de exact 2 propoziții.
Folosești "tu", nu "dumneavoastră".
Nu folosi emoji în text.
Maxim 55 de cuvinte total.
Referă-te la profilul și obiectivul utilizatorului în mod natural.`,
      prompt: `Utilizatorul ${userName ? `"${userName}"` : "nou"} este ${PROFILE_LABELS[profileType]} și ${GOAL_LABELS[learningGoal]}.`,
    });

    return NextResponse.json({ message: text });
  } catch (err) {
    // The onboarding UI falls back to a static welcome when there is no `message`.
    console.error("[api/onboarding/welcome-message] generateText error:", err);
    return NextResponse.json({ error: "AI generation failed" }, { status: 502 });
  }
}
