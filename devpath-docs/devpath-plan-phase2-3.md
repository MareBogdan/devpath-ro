# DevPath RO — Phase 2-3: Onboarding & Gamification
**Status:** Not started
**Effort:** 1-2 weeks
**Depends on:** Phase 0 + Phase 1 fully complete
**References:** devpath-vision.md (all gamification tables, mascot spec, XP values, badge list)

---

## WHY THIS PHASE EXISTS

A user who completes registration lands directly on a dashboard with no context about who they are, what they want, or what mode suits them. The platform cannot personalize anything — it does not know if the user is a doctor or a developer, so it defaults to technical content that alienates 80% of its audience. Without onboarding, `users.learning_mode` stays at its default 'simple' but was never consciously chosen, and `users.referral_code` is never generated, making the referral system permanently inactive.

Phase 3 gamification exists because learning without feedback loops is inherently fragile. Every completed lesson currently gives the same silent checkmark. XP, levels, badges, and the Pixel mascot transform individual lessons into a progression narrative — the user is not completing "Lesson 7," they are becoming a "Descoperitor" who earned a crown. This is the difference between a course and a platform.

---

## PHASE 2 — Onboarding Wizard

### 2.1 — Route, Components, State Machine

**New files:**
- `src/app/onboarding/page.tsx` — RSC shell (auth check + completed check)
- `src/app/onboarding/actions.ts` — server actions
- `src/components/onboarding/onboarding-wizard.tsx` — main client state machine
- `src/components/onboarding/step-profile.tsx`
- `src/components/onboarding/step-goal.tsx`
- `src/components/onboarding/step-calibration.tsx`
- `src/components/onboarding/step-welcome.tsx`

**Modified files:**
- `src/app/(dashboard)/layout.tsx` — add redirect to `/onboarding` if not completed

---

#### `src/app/onboarding/page.tsx`

```typescript
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export default async function OnboardingPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("onboarding_completed, name")
    .eq("id", user.id)
    .single();

  if (profile?.onboarding_completed) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <OnboardingWizard userName={profile?.name ?? ""} userId={user.id} />
    </div>
  );
}
```

---

#### Dashboard layout redirect (modify `src/app/(dashboard)/layout.tsx`)

After the existing auth check and profile fetch, add:

```typescript
// After: const { data: profile } = await supabase.from("users").select(...).eq("id", user.id).single();
if (profile && !profile.onboarding_completed) {
  redirect("/onboarding");
}
```

The `select` on users must include `onboarding_completed` in the existing query.

---

#### State machine types (define at top of `onboarding-wizard.tsx`)

```typescript
"use client";

export type ProfileType =
  | "medical"
  | "entrepreneur"
  | "student_non_cs"
  | "student_cs"
  | "developer"
  | "teacher"
  | "curious";

export type LearningGoal = "understand" | "build" | "career" | "curiosity";
export type CalibrationAnswer = "yes" | "sometimes_or_a_little" | "no";

export interface OnboardingState {
  step: 1 | 2 | 3 | 4;
  profileType: ProfileType | null;
  learningGoal: LearningGoal | null;
  usedChatGPT: CalibrationAnswer | null;
  hasCodedBefore: CalibrationAnswer | null;
  knowsAPI: CalibrationAnswer | null;
  dailyGoalMinutes: 5 | 15 | 30 | 0; // 0 = "Când am timp"
  welcomeMessage: string;
  isSubmitting: boolean;
}
```

---

#### `src/components/onboarding/onboarding-wizard.tsx` (full skeleton)

```typescript
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StepProfile } from "./step-profile";
import { StepGoal } from "./step-goal";
import { StepCalibration } from "./step-calibration";
import { StepWelcome } from "./step-welcome";
import { completeOnboarding } from "@/app/onboarding/actions";
import type { OnboardingState } from "./types";

interface OnboardingWizardProps {
  userName: string;
  userId: string;
}

export function OnboardingWizard({ userName, userId }: OnboardingWizardProps) {
  const [state, setState] = useState<OnboardingState>({
    step: 1,
    profileType: null,
    learningGoal: null,
    usedChatGPT: null,
    hasCodedBefore: null,
    knowsAPI: null,
    dailyGoalMinutes: 15,
    welcomeMessage: "",
    isSubmitting: false,
  });

  function advance(updates: Partial<OnboardingState>) {
    setState((prev) => ({
      ...prev,
      ...updates,
      step: (prev.step + 1) as OnboardingState["step"],
    }));
  }

  async function handleComplete(welcomeMessage: string) {
    setState((prev) => ({ ...prev, isSubmitting: true, welcomeMessage }));
    await completeOnboarding({
      profileType: state.profileType!,
      learningGoal: state.learningGoal!,
      usedChatGPT: state.usedChatGPT!,
      hasCodedBefore: state.hasCodedBefore!,
      knowsAPI: state.knowsAPI!,
      dailyGoalMinutes: state.dailyGoalMinutes,
      welcomeMessage,
    });
    // completeOnboarding redirects to /dashboard — no need to navigate here
  }

  return (
    <div className="w-full max-w-xl">
      {/* Progress indicator */}
      <div className="flex gap-2 mb-8 justify-center">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              s <= state.step ? "bg-primary w-12" : "bg-muted w-6"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {state.step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            <StepProfile
              onSelect={(profileType) => advance({ profileType })}
            />
          </motion.div>
        )}
        {state.step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            <StepGoal
              onSelect={(learningGoal) => advance({ learningGoal })}
            />
          </motion.div>
        )}
        {state.step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            <StepCalibration
              onComplete={(calibration) => advance(calibration)}
            />
          </motion.div>
        )}
        {state.step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            <StepWelcome
              userName={userName}
              state={state}
              onComplete={handleComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

---

#### `src/components/onboarding/step-profile.tsx`

```typescript
"use client";

import type { ProfileType } from "./types";

const PROFILES: { value: ProfileType; label: string; emoji: string; description: string }[] = [
  { value: "medical", label: "Medical / Sănătate", emoji: "🏥", description: "Doctor, asistent, farmacist, student la medicină" },
  { value: "entrepreneur", label: "Antreprenor / Manager", emoji: "🚀", description: "Construiești sau conduci o afacere" },
  { value: "student_non_cs", label: "Student (non-IT)", emoji: "🎓", description: "Studiezi altceva decât informatica" },
  { value: "student_cs", label: "Student IT / Developer", emoji: "💻", description: "Informatică, inginerie software, sau scrii cod" },
  { value: "developer", label: "Developer / Inginer", emoji: "⚙️", description: "Lucrezi profesional cu cod" },
  { value: "teacher", label: "Profesor / Educator", emoji: "📚", description: "Predai sau formezi alți oameni" },
  { value: "curious", label: "Pur și simplu curios", emoji: "🔍", description: "Vrei să înțelegi ce e cu AI-ul ăsta" },
];

interface StepProfileProps {
  onSelect: (profileType: ProfileType) => void;
}

export function StepProfile({ onSelect }: StepProfileProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Cine ești tu?</h1>
      <p className="text-muted-foreground mb-6">
        Ne ajută să adaptăm conținutul exact pentru tine.
      </p>
      <div className="grid grid-cols-1 gap-3">
        {PROFILES.map((p) => (
          <button
            key={p.value}
            onClick={() => onSelect(p.value)}
            className="flex items-center gap-4 rounded-xl border border-border bg-card hover:border-primary hover:bg-primary/5 p-4 text-left transition-all duration-150"
          >
            <span className="text-2xl">{p.emoji}</span>
            <div>
              <p className="font-medium text-foreground">{p.label}</p>
              <p className="text-sm text-muted-foreground">{p.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

#### `src/components/onboarding/step-goal.tsx`

```typescript
"use client";

import type { LearningGoal } from "./types";

const GOALS: { value: LearningGoal; label: string; description: string }[] = [
  { value: "understand", label: "Să înțeleg cum funcționează AI", description: "Fără intenția de a programa — vreau să știu ce se întâmplă" },
  { value: "build", label: "Să construiesc cu AI", description: "Vreau să fac aplicații, automatizări, proiecte reale" },
  { value: "career", label: "Să avansez în carieră", description: "Vreau să fiu relevant pe piața muncii în era AI" },
  { value: "curiosity", label: "Curiozitate generală", description: "Să fiu informat, să pot vorbi inteligent despre subiect" },
];

interface StepGoalProps {
  onSelect: (learningGoal: LearningGoal) => void;
}

export function StepGoal({ onSelect }: StepGoalProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Ce vrei să obții?</h1>
      <p className="text-muted-foreground mb-6">Vom adapta ordinea lecțiilor și exemplele la obiectivul tău.</p>
      <div className="grid grid-cols-1 gap-3">
        {GOALS.map((g) => (
          <button
            key={g.value}
            onClick={() => onSelect(g.value)}
            className="flex flex-col gap-1 rounded-xl border border-border bg-card hover:border-primary hover:bg-primary/5 p-4 text-left transition-all duration-150"
          >
            <p className="font-medium text-foreground">{g.label}</p>
            <p className="text-sm text-muted-foreground">{g.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

#### `src/components/onboarding/step-calibration.tsx`

```typescript
"use client";

import { useState } from "react";
import type { CalibrationAnswer } from "./types";

interface CalibrationState {
  usedChatGPT: CalibrationAnswer | null;
  hasCodedBefore: CalibrationAnswer | null;
  knowsAPI: CalibrationAnswer | null;
  dailyGoalMinutes: 5 | 15 | 30 | 0;
}

interface StepCalibrationProps {
  onComplete: (answers: Omit<CalibrationState, "">) => void;
}

const ANSWERS: { value: CalibrationAnswer; label: string }[] = [
  { value: "yes", label: "Da" },
  { value: "sometimes_or_a_little", label: "Puțin / uneori" },
  { value: "no", label: "Niciodată" },
];

const DAILY_GOALS: { value: 5 | 15 | 30 | 0; label: string }[] = [
  { value: 5, label: "5 minute" },
  { value: 15, label: "15 minute" },
  { value: 30, label: "30 minute" },
  { value: 0, label: "Când am timp" },
];

export function StepCalibration({ onComplete }: StepCalibrationProps) {
  const [answers, setAnswers] = useState<CalibrationState>({
    usedChatGPT: null,
    hasCodedBefore: null,
    knowsAPI: null,
    dailyGoalMinutes: 15,
  });

  function set<K extends keyof CalibrationState>(key: K, value: CalibrationState[K]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  const allAnswered =
    answers.usedChatGPT !== null &&
    answers.hasCodedBefore !== null &&
    answers.knowsAPI !== null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Cât știi despre tehnologie?</h1>
      <p className="text-muted-foreground mb-6">3 întrebări rapide — nu există răspunsuri greșite.</p>

      <div className="space-y-6">
        {/* Q1 */}
        <QuestionRow
          question="Ai folosit vreodată ChatGPT sau un asistent AI?"
          options={ANSWERS}
          value={answers.usedChatGPT}
          onChange={(v) => set("usedChatGPT", v as CalibrationAnswer)}
        />
        {/* Q2 */}
        <QuestionRow
          question="Ai scris vreodată cod?"
          options={ANSWERS}
          value={answers.hasCodedBefore}
          onChange={(v) => set("hasCodedBefore", v as CalibrationAnswer)}
        />
        {/* Q3 */}
        <QuestionRow
          question="Știi ce este un API?"
          options={ANSWERS}
          value={answers.knowsAPI}
          onChange={(v) => set("knowsAPI", v as CalibrationAnswer)}
        />

        {/* Daily goal */}
        <div>
          <p className="text-sm font-medium text-foreground mb-3">Obiectiv zilnic de învățare:</p>
          <div className="grid grid-cols-4 gap-2">
            {DAILY_GOALS.map((g) => (
              <button
                key={g.value}
                onClick={() => set("dailyGoalMinutes", g.value)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                  answers.dailyGoalMinutes === g.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => allAnswered && onComplete(answers)}
          disabled={!allAnswered}
          className="w-full rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
        >
          Continuă
        </button>
      </div>
    </div>
  );
}

function QuestionRow({
  question,
  options,
  value,
  onChange,
}: {
  question: string;
  options: { value: string; label: string }[];
  value: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-foreground mb-2">{question}</p>
      <div className="grid grid-cols-3 gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`rounded-lg border px-3 py-2 text-sm transition-all ${
              value === o.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:border-primary"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

### 2.2 — Profile-to-Mode Mapping Logic

**File:** `src/lib/onboarding-mapping.ts` (new)

```typescript
import type { ProfileType, CalibrationAnswer } from "@/components/onboarding/types";

export function computeLearningMode(
  profileType: ProfileType,
  hasCodedBefore: CalibrationAnswer,
  usedChatGPT: CalibrationAnswer,
  knowsAPI: CalibrationAnswer
): "simple" | "technical" {
  if (profileType === "developer") return "technical";
  if (
    profileType === "student_cs" &&
    usedChatGPT === "yes" &&
    hasCodedBefore === "yes"
  )
    return "technical";
  return "simple";
}

export function shouldShowToggleHint(
  profileType: ProfileType,
  hasCodedBefore: CalibrationAnswer
): boolean {
  return (
    profileType === "student_cs" &&
    (hasCodedBefore === "yes" || hasCodedBefore === "sometimes_or_a_little")
  );
}

export function computeSkillLevel(
  hasCodedBefore: CalibrationAnswer,
  knowsAPI: CalibrationAnswer
): "beginner" | "intermediate" | "advanced" {
  if (hasCodedBefore === "yes" && knowsAPI === "yes") return "advanced";
  if (hasCodedBefore === "yes" || knowsAPI === "sometimes_or_a_little")
    return "intermediate";
  return "beginner";
}

// Returns the first lesson order_index to start from
// Developer + technical → Module 3 start (order_index = 10 for AI Fundamentals)
// Everyone else → Lesson 1
export function computeStartingLessonIndex(
  profileType: ProfileType,
  learningMode: "simple" | "technical"
): number {
  if (profileType === "developer" && learningMode === "technical") return 10;
  return 1;
}
```

---

### 2.3 — Referral Code Generation

Referral code is generated server-side in the `completeOnboarding` server action. 8 uppercase alphanumeric characters, unique via DB constraint retry.

```typescript
// Inside src/app/onboarding/actions.ts

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusable chars (0,O,1,I)
  return Array.from(
    { length: 8 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}
```

Collision handling: DB has `UNIQUE` on `users.referral_code`. On insert conflict, retry once with a new code. If referral_code already exists for this user (idempotent re-run), skip generation.

---

### 2.4 — Welcome Message via GPT-4o-mini

**Called in `StepWelcome` client component** — it fetches from a new API route before rendering the final step.

**New file:** `src/app/api/onboarding/welcome-message/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { z } from "zod";

export const runtime = "edge";

const bodySchema = z.object({
  profileType: z.enum([
    "medical","entrepreneur","student_non_cs","student_cs",
    "developer","teacher","curious",
  ]),
  learningGoal: z.enum(["understand","build","career","curiosity"]),
  learningMode: z.enum(["simple","technical"]),
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Neautentificat" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Date invalide" }, { status: 400 });

  const { profileType, learningGoal, userName } = parsed.data;

  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    system: `Ești Pixel, mascota prietenoasă a platformei DevPath RO.
Scrie un mesaj de bun venit în română, cald și personal, de exact 2 propoziții.
Folosești "tu", nu "dumneavoastră".
Nu folosi emoji în text.
Maxim 55 de cuvinte total.
Referă-te la profilul și obiectivul utilizatorului în mod natural.`,
    prompt: `Utilizatorul ${userName ? `"${userName}"` : "nou"} este ${PROFILE_LABELS[profileType]} și ${GOAL_LABELS[learningGoal]}.`,
  });

  return NextResponse.json({ message: text });
}
```

**In `StepWelcome`** (called at mount with `useEffect`):

```typescript
useEffect(() => {
  fetch("/api/onboarding/welcome-message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profileType, learningGoal, learningMode, userName }),
  })
    .then((r) => r.json())
    .then((d) => setWelcomeMessage(d.message ?? "Bine ai venit pe DevPath RO!"))
    .catch(() => setWelcomeMessage("Bine ai venit pe DevPath RO!"));
}, []);
```

---

#### `src/app/onboarding/actions.ts`

```typescript
"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { computeLearningMode, computeSkillLevel, shouldShowToggleHint } from "@/lib/onboarding-mapping";
import type { ProfileType, LearningGoal, CalibrationAnswer } from "@/components/onboarding/types";
import { awardXP } from "@/lib/gamification";

interface CompleteOnboardingInput {
  profileType: ProfileType;
  learningGoal: LearningGoal;
  usedChatGPT: CalibrationAnswer;
  hasCodedBefore: CalibrationAnswer;
  knowsAPI: CalibrationAnswer;
  dailyGoalMinutes: 5 | 15 | 30 | 0;
  welcomeMessage: string;
}

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function completeOnboarding(input: CompleteOnboardingInput): Promise<void> {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const learningMode = computeLearningMode(
    input.profileType,
    input.hasCodedBefore,
    input.usedChatGPT,
    input.knowsAPI
  );
  const skillLevel = computeSkillLevel(input.hasCodedBefore, input.knowsAPI);

  // Generate unique referral code (retry once on collision)
  let referralCode = generateReferralCode();
  let { error: updateError } = await supabase
    .from("users")
    .update({
      onboarding_completed: true,
      profile_type: input.profileType,
      learning_goal: input.learningGoal,
      skill_level: skillLevel,
      learning_mode: learningMode,
      daily_goal_minutes: input.dailyGoalMinutes,
      referral_code: referralCode,
    })
    .eq("id", user.id);

  if (updateError?.code === "23505") {
    // Unique violation on referral_code — retry with new code
    referralCode = generateReferralCode();
    const { error: retryError } = await supabase
      .from("users")
      .update({ referral_code: referralCode })
      .eq("id", user.id);
    if (retryError) throw new Error(retryError.message);
  } else if (updateError) {
    throw new Error(updateError.message);
  }

  // Award welcome bonus XP (50 XP — "First lesson ever" is different; this is onboarding bonus)
  await awardXP(user.id, "onboarding_complete", 50);

  // Check if referred — if users.referred_by is set, award both users 40 XP
  const { data: profile } = await supabase
    .from("users")
    .select("referred_by")
    .eq("id", user.id)
    .single();

  if (profile?.referred_by) {
    // Award XP to new user
    await awardXP(user.id, "referral_bonus", 40);
    // Award XP to referrer
    await awardXP(profile.referred_by, "referral_bonus", 40);
    // Mark referral event as xp_awarded
    await supabase
      .from("referral_events")
      .update({ xp_awarded: true })
      .eq("referred_id", user.id);
  }

  redirect("/dashboard");
}

// Called when user registers with a referral link (/join?ref=XXXXXXXX)
export async function applyReferralCode(
  newUserId: string,
  refCode: string
): Promise<void> {
  const supabase = createSupabaseServerClient();
  const { data: referrer } = await supabase
    .from("users")
    .select("id")
    .eq("referral_code", refCode)
    .single();

  if (!referrer || referrer.id === newUserId) return; // invalid or self-referral

  // Set referred_by on new user
  await supabase
    .from("users")
    .update({ referred_by: referrer.id })
    .eq("id", newUserId);

  // Insert referral event (xp awarded later in completeOnboarding)
  await supabase.from("referral_events").insert({
    referrer_id: referrer.id,
    referred_id: newUserId,
    xp_awarded: false,
  });
}
```

**Note:** `applyReferralCode` must be called from the registration server action (`src/app/(auth)/actions.ts`) when `searchParams.get("ref")` is present after successful signup.

---

#### `src/components/onboarding/step-welcome.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import { PixelMascot } from "@/components/mascot/pixel-mascot";
import type { OnboardingState } from "./types";

interface StepWelcomeProps {
  userName: string;
  state: OnboardingState;
  onComplete: (welcomeMessage: string) => void;
}

export function StepWelcome({ userName, state, onComplete }: StepWelcomeProps) {
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const learningMode = computeLearningModeFromState(state); // use lib function

  useEffect(() => {
    fetch("/api/onboarding/welcome-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileType: state.profileType,
        learningGoal: state.learningGoal,
        learningMode,
        userName,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        setMessage(d.message ?? "Bine ai venit pe DevPath RO!");
        setLoading(false);
      })
      .catch(() => {
        setMessage("Bine ai venit pe DevPath RO!");
        setLoading(false);
      });
  }, []);

  return (
    <div className="text-center">
      <div className="flex justify-center mb-6">
        <PixelMascot emotion="excited" size={120} />
      </div>
      <h1 className="text-2xl font-bold mb-4">
        {userName ? `Salut, ${userName}!` : "Salut!"}
      </h1>

      {loading ? (
        <div className="h-12 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : (
        <p className="text-muted-foreground mb-2 text-lg leading-relaxed">{message}</p>
      )}

      <p className="text-sm text-muted-foreground mb-8">
        Modul selectat:{" "}
        <span className="font-semibold text-foreground">
          {learningMode === "technical" ? "Tehnic" : "Simplu"}
        </span>
        {" — "}poți schimba oricând din orice lecție.
      </p>

      <button
        onClick={() => !loading && onComplete(message)}
        disabled={loading}
        className="w-full rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:opacity-40"
      >
        Să începem! 🚀
      </button>
    </div>
  );
}
```

---

## PHASE 3 — Gamification

### 3.1 — XP Award System

**New file:** `src/lib/gamification.ts`

All XP awards go through one entry point: `awardXP`. It calls a Postgres RPC that atomically inserts the event, updates the total, and computes the new level.

#### New SQL function (run in Supabase SQL Editor before implementing):

```sql
CREATE OR REPLACE FUNCTION public.award_xp_and_check_level(
  p_user_id uuid,
  p_event_type text,
  p_xp integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_level integer;
  v_new_xp    integer;
  v_new_level integer;
BEGIN
  SELECT level INTO v_old_level FROM users WHERE id = p_user_id FOR UPDATE;

  INSERT INTO xp_events (user_id, event_type, xp_earned)
  VALUES (p_user_id, p_event_type, p_xp);

  UPDATE users
  SET xp_points = xp_points + p_xp
  WHERE id = p_user_id
  RETURNING xp_points INTO v_new_xp;

  v_new_level := CASE
    WHEN v_new_xp >= 3500 THEN 10
    WHEN v_new_xp >= 2900 THEN 9
    WHEN v_new_xp >= 2300 THEN 8
    WHEN v_new_xp >= 1800 THEN 7
    WHEN v_new_xp >= 1400 THEN 6
    WHEN v_new_xp >= 1000 THEN 5
    WHEN v_new_xp >= 700  THEN 4
    WHEN v_new_xp >= 400  THEN 3
    WHEN v_new_xp >= 200  THEN 2
    ELSE 1
  END;

  IF v_new_level != v_old_level THEN
    UPDATE users SET level = v_new_level WHERE id = p_user_id;
  END IF;

  RETURN jsonb_build_object(
    'new_xp',     v_new_xp,
    'old_level',  v_old_level,
    'new_level',  v_new_level,
    'leveled_up', v_new_level > v_old_level
  );
END;
$$;
```

#### TypeScript XP types and `awardXP` function:

```typescript
// src/lib/gamification.ts

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type XPEventType =
  | "onboarding_complete"
  | "lesson_complete_simple"
  | "lesson_complete_technical"
  | "gate_first_try"
  | "quiz_perfect"
  | "quiz_good"
  | "streak_daily"
  | "streak_3_days"
  | "streak_7_days"
  | "streak_30_days"
  | "course_complete"
  | "minigame_perfect"
  | "minigame_complete"
  | "flashcard_session"
  | "referral_bonus"
  | "first_comment"
  | "comment_upvoted";

export const XP_VALUES: Record<XPEventType, number> = {
  onboarding_complete: 50,
  lesson_complete_simple: 10,
  lesson_complete_technical: 15,
  gate_first_try: 5,
  quiz_perfect: 25,
  quiz_good: 10,
  streak_daily: 5,
  streak_3_days: 20,
  streak_7_days: 50,
  streak_30_days: 200,
  course_complete: 100,
  minigame_perfect: 30,
  minigame_complete: 15,
  flashcard_session: 10,
  referral_bonus: 40,
  first_comment: 5,
  comment_upvoted: 10,
};

export interface AwardXPResult {
  newXP: number;
  oldLevel: number;
  newLevel: number;
  leveledUp: boolean;
  newLevelName?: string;
}

export const LEVEL_NAMES: Record<number, string> = {
  1: "Curios",
  2: "Explorator",
  3: "Învățăcel",
  4: "Descoperitor",
  5: "Practician",
  6: "Meșteșugat",
  7: "Cunoscător",
  8: "Inovator",
  9: "Vizionar",
  10: "Maestrul AI",
};

export const LEVEL_UNLOCK_TEXT: Record<number, string> = {
  2: "Mintea ta a început să exploreze. Continuă!",
  3: "Conexiunile se formează. Ești pe drumul cel bun, Învățăcel!",
  4: "Ai descoperit ceva real. Descoperitorul merge mai departe!",
  5: "Cunoașterea ta devine practică. Felicitări, Practician!",
  6: "Meșteșugarul știe că practica face maiestrie. Continuă!",
  7: "Cunoscătorul e cel pe care alții îl întreabă. Ești acolo!",
  8: "Inovatorul vede dincolo de ce e. Extraordinar!",
  9: "Vizionarul îți aparține acum. Puțini ajung aici.",
  10: "Ai ajuns. Maestrul AI — titlu câștigat, nu dat. Extraordinar!",
};

export async function awardXP(
  userId: string,
  eventType: XPEventType,
  xpOverride?: number
): Promise<AwardXPResult> {
  const supabase = createSupabaseServerClient();
  const xp = xpOverride ?? XP_VALUES[eventType];

  const { data, error } = await supabase.rpc("award_xp_and_check_level", {
    p_user_id: userId,
    p_event_type: eventType,
    p_xp: xp,
  });

  if (error) throw new Error(error.message);

  const result = data as {
    new_xp: number;
    old_level: number;
    new_level: number;
    leveled_up: boolean;
  };

  return {
    newXP: result.new_xp,
    oldLevel: result.old_level,
    newLevel: result.new_level,
    leveledUp: result.leveled_up,
    newLevelName: result.leveled_up ? LEVEL_NAMES[result.new_level] : undefined,
  };
}
```

---

### 3.2 — Level-Up Detection + Toast Notification

Level-up is detected automatically inside `awardXP` (via the Postgres function). The server action that calls `awardXP` receives `AwardXPResult` and must pass it back to the client. The client checks `leveledUp === true` and shows the toast.

**New file:** `src/components/gamification/level-up-toast.tsx`

```typescript
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PixelMascot } from "@/components/mascot/pixel-mascot";

interface LevelUpToastProps {
  show: boolean;
  newLevel: number;
  newLevelName: string;
  unlockText: string;
  onDismiss: () => void;
}

export function LevelUpToast({
  show, newLevel, newLevelName, unlockText, onDismiss
}: LevelUpToastProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-4 rounded-2xl bg-card border border-primary/40 shadow-xl px-5 py-4 max-w-sm"
        >
          <PixelMascot emotion="proud" size={56} />
          <div>
            <p className="text-xs font-medium text-primary uppercase tracking-wide">
              Level {newLevel} atins!
            </p>
            <p className="text-lg font-bold text-foreground">{newLevelName}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{unlockText}</p>
          </div>
          <button
            onClick={onDismiss}
            className="ml-2 text-muted-foreground hover:text-foreground"
            aria-label="Închide"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

**XP Toast** (shown on every XP gain, simpler):

**New file:** `src/components/gamification/xp-toast.tsx`

```typescript
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface XPToastProps {
  xp: number;
  show: boolean;
}

export function XPToast({ xp, show }: XPToastProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.8 }}
          animate={{ opacity: 1, y: -30, scale: 1 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.6 }}
          className="fixed bottom-24 right-8 z-50 pointer-events-none"
        >
          <span className="text-2xl font-black text-primary drop-shadow-lg">
            +{xp} XP
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

### 3.3 — Badge Award Engine

**Add to `src/lib/gamification.ts`:**

```typescript
export interface AwardedBadge {
  slug: string;
  name: string;
  description: string;
  icon: string;
}

export type BadgeTrigger =
  | { event: "lesson_complete"; lessonType: string; courseId: string; moduleIndex: number; completedAt: Date }
  | { event: "quiz_complete"; score: number; courseId: string }
  | { event: "streak_update"; streakCount: number }
  | { event: "mode_change"; newMode: "simple" | "technical" }
  | { event: "project_submit" }
  | { event: "referral_complete"; referralCount: number }
  | { event: "flashcard_session"; cardCount: number }
  | { event: "minigame_complete"; isPerfect: boolean }
  | { event: "portfolio_share" }
  | { event: "comment_posted" };

export async function checkAndAwardBadges(
  userId: string,
  trigger: BadgeTrigger
): Promise<AwardedBadge[]> {
  const supabase = createSupabaseServerClient();
  const awarded: AwardedBadge[] = [];

  // Helper: try to award a badge by slug, skip if already awarded
  async function tryAward(slug: string): Promise<boolean> {
    const { data: badge } = await supabase
      .from("badges")
      .select("id, name, description, icon")
      .eq("slug", slug)
      .single();
    if (!badge) return false;

    const { error } = await supabase.from("user_badges").insert({
      user_id: userId,
      badge_id: badge.id,
    });
    if (error) return false; // duplicate → already earned, UNIQUE constraint
    awarded.push({ slug, name: badge.name, description: badge.description, icon: badge.icon });
    return true;
  }

  if (trigger.event === "lesson_complete") {
    // 1. prima_lectie — first completed lesson
    const { count: lessonCount } = await supabase
      .from("user_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("completed", true);
    if (lessonCount === 1) await tryAward("prima_lectie");

    // 6. maini_murdare — first exercise lesson
    if (trigger.lessonType === "exercise") {
      const { count: exerciseCount } = await supabase
        .from("user_progress")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("completed", true)
        .in(
          "lesson_id",
          (
            await supabase
              .from("lessons")
              .select("id")
              .eq("type", "exercise")
          ).data?.map((l) => l.id) ?? []
        );
      if ((exerciseCount ?? 0) === 1) await tryAward("maini_murdare");
    }

    // 2. primul_modul — all lessons in a module complete
    // Query: lessons in same course + same module_index
    const { data: moduleLessons } = await supabase
      .from("lessons")
      .select("id")
      .eq("course_id", trigger.courseId)
      .eq("module_index", trigger.moduleIndex);

    if (moduleLessons && moduleLessons.length > 0) {
      const { count: moduleCompleted } = await supabase
        .from("user_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("completed", true)
        .in("lesson_id", moduleLessons.map((l) => l.id));
      if (moduleCompleted === moduleLessons.length) await tryAward("primul_modul");
    }

    // 3 + 8. primul_curs + complet — all lessons in course complete
    const { data: courseLessons } = await supabase
      .from("lessons")
      .select("id")
      .eq("course_id", trigger.courseId);

    if (courseLessons && courseLessons.length > 0) {
      const { count: courseCompleted } = await supabase
        .from("user_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("completed", true)
        .in("lesson_id", courseLessons.map((l) => l.id));
      if (courseCompleted === courseLessons.length) {
        await tryAward("primul_curs");
        await tryAward("complet");
      }

      // 4. la_jumatate — 50%+ lessons in course complete
      if ((courseCompleted ?? 0) >= courseLessons.length / 2) {
        await tryAward("la_jumatate");
      }
    }

    // 24. bufnita_de_noapte — completed between 00:00 and 03:59 Bucharest time
    const bucHour = new Date(
      trigger.completedAt.toLocaleString("en-US", { timeZone: "Europe/Bucharest" })
    ).getHours();
    if (bucHour >= 0 && bucHour < 4) await tryAward("bufnita_de_noapte");

    // 25. sarbatoare_cu_minte — completed on Romanian national holiday
    if (isRomanianHoliday(trigger.completedAt)) await tryAward("sarbatoare_cu_minte");
  }

  if (trigger.event === "quiz_complete") {
    // 5. tocilarul — all quiz lessons in a course with score >= 60%
    const { data: quizLessons } = await supabase
      .from("lessons")
      .select("id")
      .eq("course_id", trigger.courseId)
      .eq("type", "quiz");

    if (quizLessons && quizLessons.length > 0) {
      const { count: passedQuizzes } = await supabase
        .from("user_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("completed", true)
        .gte("score", 60)
        .in("lesson_id", quizLessons.map((l) => l.id));
      if (passedQuizzes === quizLessons.length) await tryAward("tocilarul");
    }

    // 14. perfect_primul — first perfect quiz
    if (trigger.score === 100) {
      const { count: perfectCount } = await supabase
        .from("user_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("score", 100)
        .in(
          "lesson_id",
          (await supabase.from("lessons").select("id").eq("type", "quiz")).data?.map((l) => l.id) ?? []
        );
      if ((perfectCount ?? 0) === 1) await tryAward("perfect_primul");
      if ((perfectCount ?? 0) === 5) await tryAward("geniu_in_formare");
    }
  }

  if (trigger.event === "streak_update") {
    const { streakCount } = trigger;
    if (streakCount === 3) await tryAward("trei_zile");
    if (streakCount === 7) await tryAward("o_saptamana");
    if (streakCount === 14) await tryAward("doua_saptamani");
    if (streakCount === 30) await tryAward("o_luna");
    if (streakCount === 100) await tryAward("legenda");
  }

  if (trigger.event === "mode_change" && trigger.newMode === "technical") {
    await tryAward("programator_in_formare");
  }

  if (trigger.event === "project_submit") {
    await tryAward("constructor");
  }

  if (trigger.event === "referral_complete") {
    if (trigger.referralCount === 1) await tryAward("ambasador");
    if (trigger.referralCount === 3) await tryAward("recrutorul");
  }

  if (trigger.event === "flashcard_session" && trigger.cardCount >= 10) {
    await tryAward("cartele_dibace");
  }

  if (trigger.event === "minigame_complete" && trigger.isPerfect) {
    await tryAward("jucaus_perfect");
  }

  if (trigger.event === "portfolio_share") {
    await tryAward("vitrina_deschisa");
  }

  if (trigger.event === "comment_posted") {
    await tryAward("vocea_comunitatii");
  }

  return awarded;
}

// Helper: detect Romanian national holidays (fixed + Easter-relative)
function isRomanianHoliday(date: Date): boolean {
  const bucStr = date.toLocaleString("en-US", { timeZone: "Europe/Bucharest" });
  const buc = new Date(bucStr);
  const month = buc.getMonth() + 1; // 1-12
  const day = buc.getDate();
  const year = buc.getFullYear();

  // Fixed holidays
  const fixed = [
    [1, 1], [1, 2], [1, 24], [5, 1], [6, 1],
    [8, 15], [11, 30], [12, 1], [12, 25], [12, 26],
  ];
  if (fixed.some(([m, d]) => m === month && d === day)) return true;

  // Easter Monday (Orthodox Easter, Meeus/Jones/Butcher algorithm adapted for Julian calendar)
  const easterMonday = getOrthodoxEasterMonday(year);
  if (
    easterMonday.getMonth() + 1 === month &&
    easterMonday.getDate() === day
  )
    return true;

  return false;
}

function getOrthodoxEasterMonday(year: number): Date {
  // Orthodox Easter (Julian calendar, converted to Gregorian)
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31);
  const day = ((d + e + 114) % 31) + 1;
  // Add 13 days for Julian → Gregorian conversion (20th-21st century)
  const julian = new Date(year, month - 1, day + 13);
  // Add 1 day for Easter Monday
  return new Date(julian.getFullYear(), julian.getMonth(), julian.getDate() + 1);
}
```

---

### 3.4 — Streak Milestone Rewards

Streak logic already exists from Phase 0 (`src/app/(dashboard)/courses/actions.ts` or `markLessonComplete`). After the streak is updated, call XP award and badge check.

**Modify `markLessonComplete` in `src/app/(dashboard)/courses/actions.ts`** to add after the existing streak update:

```typescript
// After updating streak_count:
const streakXPType: XPEventType | null =
  newStreak === 3 ? "streak_3_days" :
  newStreak === 7 ? "streak_7_days" :
  newStreak === 30 ? "streak_30_days" : null;

if (streakXPType) {
  await awardXP(user.id, streakXPType);
}

// Daily streak XP (every day, not just milestones)
if (streakUpdatedToday) {
  await awardXP(user.id, "streak_daily");
}

// Badge check for streak
const streakBadges = await checkAndAwardBadges(user.id, {
  event: "streak_update",
  streakCount: newStreak,
});
```

**Streak milestone toast component:**

```typescript
// src/components/gamification/streak-toast.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PixelMascot } from "@/components/mascot/pixel-mascot";

const STREAK_MESSAGES: Record<number, string> = {
  3:  "3 zile la rând! Obișnuințele se formează în 21 de zile — ești la start.",
  7:  "7 zile la rând! Ești de neoprit!",
  14: "14 zile consecutive. La această rată, în 6 luni vei ști mai mult despre AI decât 95% din România.",
  30: "30 de zile la rând. Aceasta nu mai e o încercare — e cine ești tu acum.",
  100: "100 de zile consecutive. Într-un an de azi, vei privi înapoi la această zi.",
};

interface StreakToastProps {
  show: boolean;
  streakCount: number;
  onDismiss: () => void;
}

export function StreakToast({ show, streakCount, onDismiss }: StreakToastProps) {
  const message = STREAK_MESSAGES[streakCount] ?? `${streakCount} zile la rând!`;
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-4 rounded-2xl bg-card border border-orange-400/40 shadow-xl px-5 py-4 max-w-sm"
        >
          <PixelMascot emotion="proud" size={56} />
          <div className="flex-1">
            <p className="text-xs font-medium text-orange-500 uppercase tracking-wide">
              🔥 Streak {streakCount} zile
            </p>
            <p className="text-sm text-foreground mt-0.5">{message}</p>
          </div>
          <button onClick={onDismiss} className="text-muted-foreground" aria-label="Închide">✕</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

### 3.5 — Weekly Leaderboard

**New SQL function** (run in Supabase SQL Editor):

```sql
CREATE OR REPLACE FUNCTION public.get_weekly_leaderboard()
RETURNS TABLE (
  user_id    uuid,
  name       text,
  avatar_url text,
  level      integer,
  weekly_xp  bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.name,
    u.avatar_url,
    u.level,
    COALESCE(SUM(xe.xp_earned), 0)::bigint AS weekly_xp
  FROM public.users u
  LEFT JOIN public.xp_events xe
    ON xe.user_id = u.id
    AND xe.created_at >= date_trunc('week', now() AT TIME ZONE 'Europe/Bucharest')
  WHERE u.onboarding_completed = true
  GROUP BY u.id, u.name, u.avatar_url, u.level
  ORDER BY weekly_xp DESC
  LIMIT 10;
END;
$$;
```

No new table needed — computed from `xp_events` on the fly.

**New file:** `src/app/(dashboard)/leaderboard/page.tsx`

```typescript
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LEVEL_NAMES } from "@/lib/gamification";

interface LeaderboardRow {
  user_id: string;
  name: string | null;
  avatar_url: string | null;
  level: number;
  weekly_xp: number;
}

export default async function LeaderboardPage() {
  const supabase = createSupabaseServerClient();
  const { data: rows } = await supabase.rpc("get_weekly_leaderboard");

  const topRows = (rows as LeaderboardRow[] | null) ?? [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Clasament săptămânal</h1>
      <p className="text-muted-foreground mb-8">Top 10 utilizatori după XP câștigat în această săptămână.</p>

      <div className="space-y-3">
        {topRows.map((row, idx) => (
          <div
            key={row.user_id}
            className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${
              idx === 0 ? "border-yellow-400/60 bg-yellow-50/5" :
              idx === 1 ? "border-slate-400/60 bg-slate-50/5" :
              idx === 2 ? "border-orange-400/60 bg-orange-50/5" :
              "border-border bg-card"
            }`}
          >
            <span className="w-8 text-center font-bold text-lg text-muted-foreground">
              {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
            </span>
            <Avatar className="h-9 w-9">
              <AvatarImage src={row.avatar_url ?? ""} />
              <AvatarFallback>{(row.name ?? "?")[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{row.name ?? "Utilizator"}</p>
              <p className="text-xs text-muted-foreground">
                Nivel {row.level} — {LEVEL_NAMES[row.level]}
              </p>
            </div>
            <span className="font-bold text-primary">{row.weekly_xp} XP</span>
          </div>
        ))}
        {topRows.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            Nimeni nu a câștigat XP această săptămână. Fii primul!
          </p>
        )}
      </div>
    </div>
  );
}
```

---

### 3.6 — Mascot Component (PIXEL)

**New file:** `src/components/mascot/pixel-mascot.tsx`

Pixel is a rounded droplet/blob shape — SVG with Framer Motion. Blue-violet default, emotion controls color and animation.

```typescript
"use client";

import { motion, AnimatePresence } from "framer-motion";
import React from "react";

export type PixelEmotion = "happy" | "sad" | "thinking" | "excited" | "proud" | "idle";

interface PixelMascotProps {
  emotion?: PixelEmotion;
  size?: number;
  withSparks?: boolean;
  className?: string;
}

const EMOTION_COLORS: Record<PixelEmotion, { body: string; glow: string; eyeY: number }> = {
  happy:    { body: "#22c55e", glow: "rgba(34,197,94,0.45)",    eyeY: 0 },
  sad:      { body: "#94a3b8", glow: "rgba(148,163,184,0.2)",   eyeY: 4 },
  thinking: { body: "#4f46e5", glow: "rgba(79,70,229,0.45)",    eyeY: -2 },
  excited:  { body: "#f59e0b", glow: "rgba(245,158,11,0.55)",   eyeY: -3 },
  proud:    { body: "#8b5cf6", glow: "rgba(139,92,246,0.45)",   eyeY: 0 },
  idle:     { body: "#6366f1", glow: "rgba(99,102,241,0.35)",   eyeY: 0 },
};

// 12 spark directions for explosion
const SPARK_ANGLES = Array.from({ length: 12 }, (_, i) => (i * 30 * Math.PI) / 180);

export function PixelMascot({
  emotion = "idle",
  size = 80,
  withSparks = false,
  className,
}: PixelMascotProps) {
  const { body, glow, eyeY } = EMOTION_COLORS[emotion];
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;

  // Eye positions
  const eyeR = size * 0.07;
  const eyeOffsetX = size * 0.13;
  const eyeOffsetY = size * 0.04 + eyeY;

  // Drooping offset for sad
  const dropY = emotion === "sad" ? size * 0.05 : 0;

  return (
    <div className={className} style={{ position: "relative", width: size, height: size }}>
      <motion.svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-label={`Pixel mascota — ${emotion}`}
        animate={{
          y: emotion === "sad" ? dropY : emotion === "excited" ? [0, -size * 0.05, 0] : 0,
          scale: emotion === "excited" ? [1, 1.05, 1] : 1,
          rotate: emotion === "happy" ? [0, -5, 5, -3, 3, 0] : 0,
        }}
        transition={{
          y: emotion === "excited" ? { repeat: Infinity, duration: 0.6 } : { duration: 0.3 },
          scale: emotion === "excited" ? { repeat: Infinity, duration: 0.6 } : {},
          rotate: { duration: 0.5 },
        }}
      >
        <defs>
          <filter id={`glow-${emotion}-${size}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={size * 0.08} result="blur" />
            <feFlood floodColor={glow} result="color" />
            <feComposite in="color" in2="blur" operator="in" result="shadow" />
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Body blob */}
        <motion.ellipse
          cx={cx}
          cy={cy + dropY * 0.3}
          rx={r}
          ry={r * 1.1}
          animate={{ fill: body }}
          transition={{ duration: 0.4 }}
          filter={`url(#glow-${emotion}-${size})`}
        />

        {/* Eyes */}
        <motion.circle
          cx={cx - eyeOffsetX}
          cy={cy - eyeOffsetY + dropY * 0.2}
          r={eyeR}
          fill="white"
          animate={{ scaleY: emotion === "thinking" ? 0.5 : 1 }}
          transition={{ duration: 0.2 }}
        />
        <motion.circle
          cx={cx + eyeOffsetX}
          cy={cy - eyeOffsetY + dropY * 0.2}
          r={eyeR}
          fill="white"
          animate={{ scaleY: emotion === "thinking" ? 0.5 : 1 }}
          transition={{ duration: 0.2 }}
        />

        {/* Pupils */}
        <circle
          cx={cx - eyeOffsetX + (emotion === "thinking" ? 2 : 0)}
          cy={cy - eyeOffsetY + eyeR * 0.3 + dropY * 0.2}
          r={eyeR * 0.5}
          fill="#1e1b4b"
        />
        <circle
          cx={cx + eyeOffsetX + (emotion === "thinking" ? 2 : 0)}
          cy={cy - eyeOffsetY + eyeR * 0.3 + dropY * 0.2}
          r={eyeR * 0.5}
          fill="#1e1b4b"
        />

        {/* Thinking sparkles */}
        {emotion === "thinking" && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.circle
                key={i}
                cx={cx + (i - 1) * size * 0.15}
                cy={cy - r - size * 0.06}
                r={size * 0.025}
                fill={body}
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.3 }}
              />
            ))}
          </>
        )}

        {/* Crown for proud */}
        {emotion === "proud" && (
          <motion.path
            d={`M${cx - r * 0.5},${cy - r * 0.85} L${cx - r * 0.25},${cy - r * 1.05} L${cx},${cy - r * 0.9} L${cx + r * 0.25},${cy - r * 1.05} L${cx + r * 0.5},${cy - r * 0.85} Z`}
            fill="#f59e0b"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          />
        )}
      </motion.svg>

      {/* Sparks explosion (lesson completion) */}
      <AnimatePresence>
        {withSparks && (
          <>
            {SPARK_ANGLES.map((angle, i) => (
              <motion.div
                key={i}
                style={{
                  position: "absolute",
                  left: size / 2,
                  top: size / 2,
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: i % 3 === 0 ? "#f59e0b" : i % 3 === 1 ? "#6366f1" : "#22c55e",
                  transformOrigin: "center",
                }}
                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                animate={{
                  scale: [0, 1.5, 0],
                  x: Math.cos(angle) * size * 0.85,
                  y: Math.sin(angle) * size * 0.85,
                  opacity: [1, 1, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, delay: i * 0.03 }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
```

---

**Badge Toast component:**

**New file:** `src/components/gamification/badge-toast.tsx`

```typescript
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PixelMascot } from "@/components/mascot/pixel-mascot";
import type { AwardedBadge } from "@/lib/gamification";

interface BadgeToastProps {
  badge: AwardedBadge | null;
  onDismiss: () => void;
}

export function BadgeToast({ badge, onDismiss }: BadgeToastProps) {
  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 80 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="fixed top-6 right-6 z-50 flex items-center gap-4 rounded-2xl bg-card border border-yellow-400/40 shadow-xl px-5 py-4 max-w-sm"
        >
          <PixelMascot emotion="proud" size={52} />
          <div className="flex-1">
            <p className="text-xs font-medium text-yellow-600 uppercase tracking-wide">
              Badge nou câștigat!
            </p>
            <p className="font-bold text-foreground">
              {badge.icon} {badge.name}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{badge.description}</p>
          </div>
          <button onClick={onDismiss} className="text-muted-foreground" aria-label="Închide">✕</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

### 3.7 — Mascot Integration in All 9 Moments

All 9 mascot moments are triggered from client components. The pattern: server action returns result data → client component shows appropriate mascot state.

#### Moment 1 — Lesson Completion

**Modify `src/components/course/lesson-page-client.tsx`** (created in Phase 1).

Add to state:
```typescript
const [celebrationState, setCelebrationState] = useState<{
  show: boolean;
  xp: number;
  leveledUp: boolean;
  newLevel: number;
  newLevelName: string;
  badges: AwardedBadge[];
} | null>(null);
```

In the `onComplete` callback passed to `<CompleteButton>`:
```typescript
async function handleLessonComplete(result: MarkCompleteResult) {
  setCelebrationState({
    show: true,
    xp: result.xpEarned,
    leveledUp: result.leveledUp,
    newLevel: result.newLevel,
    newLevelName: result.newLevelName ?? "",
    badges: result.newBadges,
  });
}
```

Add overlay render at the bottom of the JSX:
```typescript
<MascotCelebrationOverlay
  show={celebrationState?.show ?? false}
  xp={celebrationState?.xp ?? 0}
  leveledUp={celebrationState?.leveledUp ?? false}
  newLevel={celebrationState?.newLevel ?? 1}
  newLevelName={celebrationState?.newLevelName ?? ""}
  badges={celebrationState?.badges ?? []}
  onDismiss={() => {
    setCelebrationState(null);
    if (nextLessonId) router.push(`/courses/${courseSlug}/${nextLessonId}`);
  }}
/>
```

**New file:** `src/components/mascot/mascot-celebration-overlay.tsx`

```typescript
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import confetti from "canvas-confetti";
import { PixelMascot } from "./pixel-mascot";
import type { AwardedBadge } from "@/lib/gamification";
import { LEVEL_NAMES, LEVEL_UNLOCK_TEXT } from "@/lib/gamification";

interface MascotCelebrationOverlayProps {
  show: boolean;
  xp: number;
  leveledUp: boolean;
  newLevel: number;
  newLevelName: string;
  badges: AwardedBadge[];
  onDismiss: () => void;
}

export function MascotCelebrationOverlay({
  show, xp, leveledUp, newLevel, newLevelName, badges, onDismiss,
}: MascotCelebrationOverlayProps) {
  useEffect(() => {
    if (!show) return;
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={onDismiss}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 20 }}
            className="flex flex-col items-center gap-4 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <PixelMascot emotion="excited" size={160} withSparks />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <p className="text-4xl font-black text-foreground">Știam eu că poți!</p>
              <p className="text-primary font-bold text-xl mt-1">+{xp} XP</p>
            </motion.div>

            {leveledUp && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="rounded-2xl border border-primary bg-primary/10 px-6 py-3 text-center"
              >
                <p className="text-xs uppercase tracking-widest text-primary font-medium">
                  Level Up!
                </p>
                <p className="text-2xl font-black text-foreground mt-1">{newLevelName}</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {LEVEL_UNLOCK_TEXT[newLevel]}
                </p>
              </motion.div>
            )}

            {badges.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex gap-2 flex-wrap justify-center"
              >
                {badges.map((b) => (
                  <div
                    key={b.slug}
                    className="flex items-center gap-2 rounded-xl border border-yellow-400/40 bg-yellow-50/10 px-3 py-1.5"
                  >
                    <span>{b.icon}</span>
                    <span className="text-sm font-medium">{b.name}</span>
                  </div>
                ))}
              </motion.div>
            )}

            <button
              onClick={onDismiss}
              className="mt-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Continuă →
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

#### Moment 2 — Wrong Gate Answer

**Modify `src/components/course/lesson-gate.tsx`** (Phase 1). When `isCorrect === false` after answer submission:

```typescript
// Show Pixel sad + speech bubble inline in the gate component
{lastAnswerWrong && (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-start gap-3 rounded-xl bg-red-50/10 border border-red-200/20 p-3"
  >
    <PixelMascot emotion="sad" size={44} />
    <p className="text-sm text-muted-foreground pt-1">
      Nu-i bai! Citește din nou lecția și încearcă din nou — poți!
    </p>
  </motion.div>
)}
```

---

#### Moment 3 — Mini-Game Host

This is Phase 4. The `<MiniGameScreen>` component (Phase 4) will accept a `mascotEmotion` prop and render `<PixelMascot>` in the corner with `idle` → `happy`/`sad` reactions in real time.

---

#### Moment 4 — Streak Milestone

Rendered via `<StreakToast>` (defined in 3.4). Called from `markLessonComplete` result handling in `lesson-page-client.tsx`.

```typescript
// In lesson-page-client.tsx state:
const [streakMilestone, setStreakMilestone] = useState<number | null>(null);

// In onComplete callback:
if (result.streakMilestone) setStreakMilestone(result.streakMilestone);

// In JSX:
<StreakToast
  show={streakMilestone !== null}
  streakCount={streakMilestone ?? 0}
  onDismiss={() => setStreakMilestone(null)}
/>
```

---

#### Moment 5 — Badge Earned

`<BadgeToast>` (defined in 3.3). Rendered in `lesson-page-client.tsx`. If multiple badges earned in one session, show them sequentially — queue in state:

```typescript
const [badgeQueue, setBadgeQueue] = useState<AwardedBadge[]>([]);

// In onComplete: setBadgeQueue(result.newBadges);

<BadgeToast
  badge={badgeQueue[0] ?? null}
  onDismiss={() => setBadgeQueue((prev) => prev.slice(1))}
/>
```

---

#### Moment 6 — 3+ Days Absent (Dashboard)

**Modify `src/app/(dashboard)/dashboard/page.tsx`** RSC to compute days since `last_active`. Pass `daysAbsent` prop to a client component `<AbsenceMascot>`.

```typescript
// In dashboard page RSC:
const lastActive = profile?.last_active ? new Date(profile.last_active) : null;
const daysAbsent = lastActive
  ? Math.floor((Date.now() - lastActive.getTime()) / 86_400_000)
  : 0;
```

```typescript
// New: src/components/dashboard/absence-mascot.tsx
"use client";
// Show if daysAbsent >= 3
// Pixel emotion="sad", speech: "Mi-a fost dor de tine! Ultima lecție: [title]. Revii?"
// Dismissible — stored in sessionStorage so it shows once per browser session
```

---

#### Moment 7 — Certificate Generated

Phase 8. The certificate page will render `<PixelMascot emotion="proud" size={120} />` with graduation cap CSS overlay and speech bubble: "Oficial certificat de Pixel!"

---

#### Moment 8 — Onboarding Welcome

Already wired in `<StepWelcome>` (section 2.4). Renders `<PixelMascot emotion="excited" size={120} />` with a spring bounce-in animation on mount.

Add to StepWelcome:
```typescript
<motion.div
  initial={{ y: -80, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
>
  <PixelMascot emotion="excited" size={120} />
</motion.div>
```

---

#### Moment 9 — XP Gain

`<XPToast>` is shown in `lesson-page-client.tsx` immediately after any XP-awarding action. Use a 2-second auto-dismiss timeout.

```typescript
// State: const [xpToast, setXPToast] = useState<{ amount: number; visible: boolean }>({ amount: 0, visible: false });

// After any XP award:
setXPToast({ amount: result.xpEarned, visible: true });
setTimeout(() => setXPToast((p) => ({ ...p, visible: false })), 2000);
```

---

#### `markLessonComplete` full updated return type

**Modify `src/app/(dashboard)/courses/actions.ts`** to return all gamification data:

```typescript
export interface MarkCompleteResult {
  success: boolean;
  nextLessonId: string | null;
  error?: string;
  // Gamification (new fields):
  xpEarned: number;
  newTotalXP: number;
  leveledUp: boolean;
  newLevel: number;
  newLevelName: string;
  newBadges: AwardedBadge[];
  streakMilestone: number | null; // 3, 7, 14, 30, 100 or null
}
```

Inside `markLessonComplete`, after the completion upsert:

```typescript
// 1. Award XP
const learningMode = (await supabase.from("users").select("learning_mode").eq("id", user.id).single())
  .data?.learning_mode ?? "simple";
const xpResult = await awardXP(
  user.id,
  learningMode === "technical" ? "lesson_complete_technical" : "lesson_complete_simple"
);

// 2. Check badges
const lessonData = await supabase.from("lessons").select("type, course_id, module_index, order_index").eq("id", lessonId).single();
const newBadges = await checkAndAwardBadges(user.id, {
  event: "lesson_complete",
  lessonType: lessonData.data?.type ?? "theory",
  courseId: lessonData.data?.course_id ?? "",
  moduleIndex: lessonData.data?.module_index ?? 1,
  completedAt: new Date(),
});

// 3. Update streak
// (existing streak logic from Phase 0) → returns newStreak, streakUpdatedToday
const streakMilestone = [3, 7, 14, 30, 100].includes(newStreak) ? newStreak : null;

return {
  success: true,
  nextLessonId,
  xpEarned: xpResult.newXP - (xpResult.newXP - XP_VALUES[learningMode === "technical" ? "lesson_complete_technical" : "lesson_complete_simple"]),
  newTotalXP: xpResult.newXP,
  leveledUp: xpResult.leveledUp,
  newLevel: xpResult.newLevel,
  newLevelName: xpResult.newLevelName ?? "",
  newBadges,
  streakMilestone,
};
```

---

## COMPLETE CHECKLIST

### Phase 2 — Onboarding

- [ ] P2.1.1 — Create `src/app/onboarding/page.tsx` (RSC: auth check, completed check, render wizard)
- [ ] P2.1.2 — Create `src/components/onboarding/types.ts` (ProfileType, LearningGoal, CalibrationAnswer, OnboardingState interfaces)
- [ ] P2.1.3 — Create `src/components/onboarding/onboarding-wizard.tsx` (4-step AnimatePresence state machine)
- [ ] P2.1.4 — Create `src/components/onboarding/step-profile.tsx` (7 profile cards)
- [ ] P2.1.5 — Create `src/components/onboarding/step-goal.tsx` (4 goal cards)
- [ ] P2.1.6 — Create `src/components/onboarding/step-calibration.tsx` (3 calibration questions + daily goal)
- [ ] P2.1.7 — Create `src/components/onboarding/step-welcome.tsx` (Pixel + welcome message fetch + complete button)
- [ ] P2.2.1 — Create `src/lib/onboarding-mapping.ts` (computeLearningMode, shouldShowToggleHint, computeSkillLevel, computeStartingLessonIndex)
- [ ] P2.3.1 — Create `src/app/onboarding/actions.ts` (completeOnboarding server action with referral code generation)
- [ ] P2.3.2 — Modify `src/app/(auth)/actions.ts` signUp handler: call `applyReferralCode` when `?ref=` query param present
- [ ] P2.3.3 — Modify `src/app/(dashboard)/layout.tsx`: add `onboarding_completed` to users select, add redirect to `/onboarding` if false
- [ ] P2.4.1 — Create `src/app/api/onboarding/welcome-message/route.ts` (edge route, Zod validated, GPT-4o-mini 2-sentence personalized message)
- [ ] P2.4.2 — Verify welcome message API: test with each of the 7 profile types, confirm response is in Romanian and under 55 words
- [ ] P2.4.3 — Add `/onboarding` link exception in dashboard layout: must NOT redirect users who are ON `/onboarding` (not needed since onboarding is outside `(dashboard)` group)
- [ ] P2.5.1 — Manual test: register new user → confirm redirect to `/onboarding` → complete all 4 steps → confirm redirect to `/dashboard` → confirm `users` row has all onboarding fields populated
- [ ] P2.5.2 — Test referral: register with `?ref=TESTCODE` in URL → complete onboarding → confirm both users receive 40 XP in `xp_events`
- [ ] P2.5.3 — Test mode assignment: developer profile + all "yes" answers → confirm `users.learning_mode = 'technical'`
- [ ] P2.5.4 — Test mode assignment: medical profile → confirm `users.learning_mode = 'simple'` regardless of calibration answers

### Phase 3 — Gamification

- [ ] P3.0.1 — Run `award_xp_and_check_level` Postgres function SQL in Supabase SQL Editor
- [ ] P3.0.2 — Run `get_weekly_leaderboard` Postgres function SQL in Supabase SQL Editor
- [ ] P3.0.3 — Verify `lessons` table has `module_index` column (added in Phase 1 sync-action); if missing, run: `ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS module_index integer DEFAULT 1;` and update sync-action to populate it from MDX `module` frontmatter
- [ ] P3.1.1 — Create `src/lib/gamification.ts` with `XPEventType`, `XP_VALUES`, `LEVEL_NAMES`, `LEVEL_UNLOCK_TEXT`, and `awardXP` function
- [ ] P3.1.2 — Verify `awardXP` works: call manually from a test server action, confirm row inserted in `xp_events` and `users.xp_points` incremented
- [ ] P3.2.1 — Create `src/components/gamification/level-up-toast.tsx`
- [ ] P3.2.2 — Create `src/components/gamification/xp-toast.tsx`
- [ ] P3.3.1 — Add `checkAndAwardBadges` and `isRomanianHoliday` and `getOrthodoxEasterMonday` to `src/lib/gamification.ts`
- [ ] P3.3.2 — Create `src/components/gamification/badge-toast.tsx`
- [ ] P3.3.3 — Verify badge table has all 25 rows (seeded in Phase 0 Task 0.3.4)
- [ ] P3.3.4 — Test badge award: complete first lesson → confirm `prima_lectie` badge inserted in `user_badges`
- [ ] P3.3.5 — Test secret badge: set server time to 01:00 Bucharest in test and complete a lesson → confirm `bufnita_de_noapte` badge awarded
- [ ] P3.4.1 — Create `src/components/gamification/streak-toast.tsx`
- [ ] P3.4.2 — Modify `markLessonComplete` to call `awardXP("streak_daily")` when streak updated, and `awardXP("streak_3_days")` etc. on milestones
- [ ] P3.5.1 — Create `src/app/(dashboard)/leaderboard/page.tsx` (RSC, calls `get_weekly_leaderboard` RPC)
- [ ] P3.5.2 — Add "Clasament" link to sidebar navigation
- [ ] P3.5.3 — Test leaderboard: complete lessons with 2 test accounts, verify both appear with correct weekly XP
- [ ] P3.6.1 — Create `src/components/mascot/pixel-mascot.tsx` (SVG + Framer Motion, all 6 emotions, optional sparks)
- [ ] P3.6.2 — Visual check all 6 emotions at 80px and 160px size
- [ ] P3.7.1 — Create `src/components/mascot/mascot-celebration-overlay.tsx` (full-screen, confetti, sparks, level-up panel, badge list)
- [ ] P3.7.2 — Modify `src/app/(dashboard)/courses/actions.ts` `markLessonComplete` to return full `MarkCompleteResult` with XP + level + badge data
- [ ] P3.7.3 — Modify `src/components/course/lesson-page-client.tsx` to handle celebration overlay, XP toast, streak toast, badge queue
- [ ] P3.7.4 — Modify `src/components/course/lesson-gate.tsx` to show Pixel sad + speech bubble on wrong answer
- [ ] P3.7.5 — Create `src/components/dashboard/absence-mascot.tsx` (shows Pixel sad if daysAbsent >= 3, dismissible via sessionStorage)
- [ ] P3.7.6 — Modify `src/app/(dashboard)/dashboard/page.tsx` to compute `daysAbsent` and render `<AbsenceMascot>`
- [ ] P3.7.7 — Confirm Moment 8 (onboarding welcome) is wired in `step-welcome.tsx` with spring bounce-in animation
- [ ] P3.8.1 — End-to-end test: complete a lesson → celebration overlay appears → XP toast shows → badge toast shows if earned → dismiss → navigate to next lesson
- [ ] P3.8.2 — Confirm lesson-page-client's `onComplete` handler passes `MarkCompleteResult` gamification fields to all toast/overlay components
- [ ] P3.8.3 — Run `npx tsc --noEmit` — zero TypeScript errors
- [ ] P3.8.4 — Update `schema.sql` with the two new Postgres functions
