"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { awardXP, checkAndAwardBadges } from "@/lib/gamification";
import {
  type AwardedBadge,
  type XPEventType,
  XP_VALUES,
  LEVEL_NAMES,
} from "@/lib/gamification-constants";

// ─── Mini-game Types ──────────────────────────────────────────────────────────

export type MinigameType =
  | "sort_concepts"
  | "fill_blank"
  | "match_pairs"
  | "true_false"
  | "build_network"
  | "write_prompt";

const MINIGAME_CYCLE: MinigameType[] = [
  "sort_concepts",
  "fill_blank",
  "match_pairs",
  "true_false",
  "build_network",
  "write_prompt",
];

// ─── Mark Lesson Complete ────────────────────────────────────────────────────

export interface MarkCompleteResult {
  success: boolean;
  nextLessonId: string | null;
  error?: string;
  // Gamification:
  xpEarned: number;
  newTotalXP: number;
  leveledUp: boolean;
  newLevel: number;
  newLevelName: string;
  newBadges: AwardedBadge[];
  streakMilestone: number | null;
  // Mini-game:
  minigameReady: boolean;
  gameType: MinigameType | null;
  triggerLessonIndex: number | null;
}

export async function markLessonComplete(
  lessonId: string,
  courseSlug: string
): Promise<MarkCompleteResult> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const EMPTY_RESULT = {
    success: false as const,
    nextLessonId: null,
    xpEarned: 0,
    newTotalXP: 0,
    leveledUp: false,
    newLevel: 1,
    newLevelName: "",
    newBadges: [] as AwardedBadge[],
    streakMilestone: null,
    minigameReady: false,
    gameType: null as MinigameType | null,
    triggerLessonIndex: null as number | null,
  };

  if (!user) return { ...EMPTY_RESULT, error: "Not authenticated" };

  // Upsert progress record
  const { error } = await supabase.from("user_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      completed: true,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" }
  );

  if (error) return { ...EMPTY_RESULT, error: error.message };

  // Fetch user data (streak data)
  const { data: userData } = await supabase
    .from("users")
    .select("last_active, streak_count")
    .eq("id", user.id)
    .single();

  // ─── Lesson XP ────────────────────────────────────────────────────────────
  const xpEventType: XPEventType = "lesson_complete";

  const xpResult = await awardXP(user.id, xpEventType).catch(() => null);

  // Fetch lesson data (for badge check + next lesson)
  const { data: lessonData } = await supabase
    .from("lessons")
    .select("course_id, order_index, type, module_index")
    .eq("id", lessonId)
    .single();

  // Badge check for lesson completion
  const newBadges = await checkAndAwardBadges(user.id, {
    event: "lesson_complete",
    lessonType: lessonData?.type ?? "theory",
    courseId: lessonData?.course_id ?? "",
    moduleIndex: lessonData?.module_index ?? 1,
    completedAt: new Date(),
  }).catch((): AwardedBadge[] => []);
  // ─────────────────────────────────────────────────────────────────────────

  // ─── Streak + last_active update ─────────────────────────────────────────
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  let newStreak: number;
  if (userData?.last_active === today) {
    newStreak = userData.streak_count ?? 1;
  } else if (userData?.last_active === yesterday) {
    newStreak = (userData.streak_count ?? 0) + 1;
  } else {
    newStreak = 1;
  }

  const streakUpdatedToday = userData?.last_active !== today;

  await supabase
    .from("users")
    .update({ last_active: today, streak_count: newStreak })
    .eq("id", user.id);

  // Streak XP + badge awards
  if (streakUpdatedToday) {
    await awardXP(user.id, "streak_daily").catch(() => null);
    const streakXPType: XPEventType | null =
      newStreak === 3  ? "streak_3_days"  :
      newStreak === 7  ? "streak_7_days"  :
      newStreak === 30 ? "streak_30_days" : null;
    if (streakXPType) await awardXP(user.id, streakXPType).catch(() => null);
    await checkAndAwardBadges(user.id, {
      event: "streak_update",
      streakCount: newStreak,
    }).catch(() => null);
  }
  // ─────────────────────────────────────────────────────────────────────────

  const streakMilestone =
    streakUpdatedToday && [3, 7, 14, 30, 100].includes(newStreak)
      ? newStreak
      : null;

  // Find next lesson
  let nextLessonId: string | null = null;
  if (lessonData) {
    const { data: nextLesson } = await supabase
      .from("lessons")
      .select("id")
      .eq("course_id", lessonData.course_id)
      .gt("order_index", lessonData.order_index)
      .order("order_index", { ascending: true })
      .limit(1)
      .single();
    nextLessonId = nextLesson?.id ?? null;
  }

  // Revalidate sidebar + course pages
  revalidatePath("/dashboard");
  revalidatePath(`/courses/${courseSlug}`, "page");
  revalidatePath(`/courses/${courseSlug}/${lessonId}`, "page");

  // ─── Mini-game trigger ──────────────────────────────────────────────────
  const orderIndex = lessonData?.order_index ?? 0;
  const isMinigameTrigger = orderIndex > 0 && orderIndex % 3 === 0;
  const gameType: MinigameType | null = isMinigameTrigger
    ? MINIGAME_CYCLE[((orderIndex / 3) - 1) % MINIGAME_CYCLE.length]
    : null;

  return {
    success: true,
    nextLessonId,
    xpEarned: XP_VALUES[xpEventType],
    newTotalXP: xpResult?.newXP ?? 0,
    leveledUp: xpResult?.leveledUp ?? false,
    newLevel: xpResult?.newLevel ?? 1,
    newLevelName: xpResult?.newLevelName ?? LEVEL_NAMES[xpResult?.newLevel ?? 1] ?? "",
    newBadges,
    streakMilestone,
    minigameReady: isMinigameTrigger,
    gameType,
    triggerLessonIndex: isMinigameTrigger ? orderIndex : null,
  };
}

// ─── Award Gate XP ────────────────────────────────────────────────────────────

export async function awardGateXP(
  _questionId: string,
  lessonId: string
): Promise<void> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Increment score in user_progress for this lesson
  const { data: progress } = await supabase
    .from("user_progress")
    .select("score")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .single();

  const currentScore = progress?.score ?? 0;
  await supabase.from("user_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      score: currentScore + 5,
    },
    { onConflict: "user_id,lesson_id" }
  );

  // Increment user XP via Postgres function
  await supabase.rpc("increment_user_xp", {
    user_id_param: user.id,
    xp_amount: 5,
  });

}

// ─── Toggle Bookmark ──────────────────────────────────────────────────────────

export async function toggleBookmark(
  lessonId: string
): Promise<{ bookmarked: boolean; error?: string }> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { bookmarked: false, error: "Unauthorized" };

  const { data: existing } = await supabase
    .from("lesson_bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .single();

  if (existing) {
    await supabase.from("lesson_bookmarks").delete().eq("id", existing.id);
    return { bookmarked: false };
  } else {
    await supabase
      .from("lesson_bookmarks")
      .insert({ user_id: user.id, lesson_id: lessonId });
    return { bookmarked: true };
  }
}

// ─── Submit Lesson Feedback ───────────────────────────────────────────────────

export async function submitLessonFeedback(
  lessonId: string,
  rating: "clear" | "hard",
  timeSpentSeconds: number
): Promise<{ error?: string }> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  await supabase.from("lesson_feedback").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      rating,
      time_spent_seconds: timeSpentSeconds,
    },
    { onConflict: "user_id,lesson_id" }
  );

  return {};
}

// ─── Record Minigame Session ──────────────────────────────────────────────────

export async function recordMinigameSession(input: {
  lessonId: string;
  gameType: MinigameType;
  score: number;
  isPerfect: boolean;
}): Promise<{ error?: string }> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  await supabase.from("minigame_sessions").insert({
    user_id: user.id,
    lesson_id: input.lessonId,
    game_type: input.gameType,
    score: input.score,
    perfect: input.isPerfect,
  });

  const xpType: XPEventType = input.isPerfect ? "minigame_perfect" : "minigame_complete";
  await awardXP(user.id, xpType).catch(() => null);

  await checkAndAwardBadges(user.id, {
    event: "minigame_complete",
    isPerfect: input.isPerfect,
  }).catch(() => null);

  return {};
}

// ─── Save Wrong Quiz Answers ──────────────────────────────────────────────────

export interface WrongAnswer {
  questionId: string;
  selectedOption: number;
  correctOption: number;
}

export async function saveWrongAnswers(
  lessonId: string,
  wrongAnswers: WrongAnswer[]
): Promise<{ error?: string }> {
  if (wrongAnswers.length === 0) return {};

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const rows = wrongAnswers.map((wa) => ({
    user_id: user.id,
    lesson_id: lessonId,
    question_id: wa.questionId,
    selected_option: wa.selectedOption,
    correct_option: wa.correctOption,
  }));

  const { error } = await supabase.from("quiz_wrong_answers").insert(rows);
  if (error) return { error: error.message };
  return {};
}

// ─── Post Comment ─────────────────────────────────────────────────────────────

export async function postComment(input: {
  lessonId: string;
  content: string;
  parentId: string | null;
}): Promise<{ error?: string; commentId?: string }> {
  const schema = z.object({
    lessonId: z.string().uuid(),
    content: z.string().min(1).max(2000),
    parentId: z.string().uuid().nullable(),
  });
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Date invalide." };

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Neautentificat." };

  // Level gate: Level 3+ only
  const { data: profile } = await supabase
    .from("users")
    .select("level")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.level ?? 1) < 3) {
    return { error: "Nivel insuficient. Atinge Nivelul 3 pentru a posta comentarii." };
  }

  const { data: comment, error: insertError } = await supabase
    .from("lesson_comments")
    .insert({
      lesson_id: parsed.data.lessonId,
      user_id: user.id,
      parent_id: parsed.data.parentId,
      content: parsed.data.content,
    })
    .select("id")
    .single();

  if (insertError) return { error: insertError.message };

  // First comment → award XP + badge
  const { count } = await supabase
    .from("lesson_comments")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (count === 1) {
    await awardXP(user.id, "first_comment").catch(() => null);
    await checkAndAwardBadges(user.id, { event: "comment_posted" }).catch(() => null);
  }

  revalidatePath("/courses", "layout");
  return { commentId: comment?.id };
}

// ─── Upvote Comment ───────────────────────────────────────────────────────────

export async function upvoteComment(
  commentId: string
): Promise<{ error?: string; newCount?: number }> {
  if (!z.string().uuid().safeParse(commentId).success) {
    return { error: "ID invalid." };
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Neautentificat." };

  // Fetch current upvote count + author
  const { data: comment } = await supabase
    .from("lesson_comments")
    .select("upvote_count, user_id")
    .eq("id", commentId)
    .single();

  if (!comment) return { error: "Comentariu inexistent." };

  const newCount = (comment.upvote_count ?? 0) + 1;

  await supabase
    .from("lesson_comments")
    .update({ upvote_count: newCount })
    .eq("id", commentId);

  // Award XP to the comment author when they reach 5 upvotes milestone
  if (newCount === 5 && comment.user_id !== user.id) {
    await awardXP(comment.user_id, "comment_upvoted").catch(() => null);
  }

  return { newCount };
}

// ─── Submit Project ───────────────────────────────────────────────────────────

export interface SubmitProjectResult {
  error?: string;
  projectId?: string;
  newBadges?: AwardedBadge[];
}

export async function submitProject(input: {
  courseId: string;
  title: string;
  description: string;
  githubUrl: string;
}): Promise<SubmitProjectResult> {
  const schema = z.object({
    courseId: z.string().uuid(),
    title: z.string().min(1).max(200),
    description: z.string().max(2000),
    githubUrl: z.string().url().or(z.literal("")).optional(),
  });
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Date invalide." };

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Neautentificat." };

  const { data: project, error: insertError } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      course_id: parsed.data.courseId,
      title: parsed.data.title,
      description: parsed.data.description,
      github_url: parsed.data.githubUrl || null,
      completed_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (insertError) return { error: insertError.message };

  const newBadges = await checkAndAwardBadges(user.id, {
    event: "project_submit",
  }).catch((): AwardedBadge[] => []);

  revalidatePath("/dashboard");
  return { projectId: project?.id, newBadges };
}

// ─── Track Portfolio Share ────────────────────────────────────────────────────

export async function trackPortfolioShare(): Promise<void> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await checkAndAwardBadges(user.id, { event: "portfolio_share" }).catch(() => null);
}

// ─── Seed Database ───────────────────────────────────────────────────────────

export interface SeedResult {
  success: boolean;
  message: string;
}

export async function seedDatabase(): Promise<SeedResult> {
  const supabase = createSupabaseServerClient();

  // Server-side admin guard — UI check alone is insufficient
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Neautorizat." };

  const { data: callerProfile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (callerProfile?.role !== "admin") {
    return {
      success: false,
      message: "Acces interzis — doar administratorii pot efectua această acțiune.",
    };
  }

  // Check if already seeded
  const { data: existing } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", "ai-fundamentals")
    .single();

  if (existing) {
    return { success: false, message: "Cursul există deja în baza de date." };
  }

  // Insert course
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .insert({
      slug: "ai-fundamentals",
      title: "AI Fundamentals",
      description:
        "Înțelege inteligența artificială de la zero. De la definiții și istoric, la Machine Learning, Neural Networks și LLM-uri — totul explicat cu analogii clare și exemple practice în română.",
      difficulty: 2.0,
      is_free: true,
      order_index: 1,
    })
    .select()
    .single();

  if (courseError || !course) {
    return { success: false, message: courseError?.message ?? "Eroare la inserarea cursului." };
  }

  // Lesson content
  const lesson1Content = `## Ce este Inteligența Artificială?

Inteligența artificială (AI) este un domeniu al informaticii care se ocupă cu crearea de sisteme capabile să îndeplinească sarcini care, în mod normal, ar necesita inteligență umană.

### O definiție simplă

Gândește-te la AI ca la un **program care învață din exemple**, nu unul care urmează instrucțiuni fixe. Diferența fundamentală față de programarea clasică este aceasta:

- **Programare clasică:** Tu scrii regulile exacte. Calculatorul le urmează.
- **AI:** Tu oferi exemple. Calculatorul descoperă singur regulile.

### Un exemplu concret

Cum recunoaște un calculator o pisică dintr-o fotografie?

**Abordarea clasică** (imposibil de implementat complet):

\`\`\`python
# Programarea clasică ar arăta cam așa:
def este_pisica(imagine):
    if are_urechi_ascutite(imagine) and are_mustati(imagine):
        return True
    # Problema: Nu poți defini toate cazurile posibile!
\`\`\`

**Abordarea AI** — arăți exemple, modelul descoperă singur:

\`\`\`python
from sklearn.neighbors import KNeighborsClassifier

# Antrenezi cu mii de exemple etichetate
model = KNeighborsClassifier()
model.fit(features_imagini, etichete)  # etichete: "pisica" sau "nu_pisica"

# Modelul descoperă singur ce înseamnă "pisică"
predictie = model.predict([imagine_noua])
\`\`\`

### Unde vedem AI azi?

AI este deja parte din viața de zi cu zi:

| Aplicație | Exemplu AI |
|-----------|------------|
| Telefon | Recunoaștere vocală (Siri, Google Assistant) |
| Streaming | Recomandări Netflix, Spotify |
| Banking | Detectarea fraudelor |
| Medicină | Diagnosticarea din imagini medicale |
| Transport | Mașini autonome, optimizare GPS |

### Istoricul pe scurt

- **1950**: Alan Turing propune "Testul Turing" — poate un calculator să imite un om?
- **1956**: Termenul *"Artificial Intelligence"* este creat la Dartmouth Conference
- **1990s**: Machine Learning devine mainstream
- **2012**: Deep Learning revoluționează computer vision
- **2022-2023**: ChatGPT și LLM-urile devin accesibile publicului larg

> **Concluzie:** AI nu este magie — este matematică, date și putere de calcul. Și tu poți înțelege și construi cu ea!`;

  const lesson2Content = `## Cum "gândește" un calculator

Calculatoarele nu "gândesc" în sens uman — **procesează numere**. Totuși, AI reușește să simuleze raționamentul prin matematică aplicată pe date la scară masivă.

### Totul sunt numere

Un calculator nu vede o fotografie cu pisică. Vede o **matrice de numere**:

\`\`\`python
# O imagine 4x4 în grayscale (0 = negru, 255 = alb)
imagine = [
    [255, 200, 150, 100],
    [180, 210,  90,  60],
    [120, 170, 230, 200],
    [ 80, 100, 140, 190]
]

# O imagine color are 3 astfel de matrici (R, G, B)
# O fotografie 1920x1080 = 1920 × 1080 × 3 = 6.2 milioane de numere!
\`\`\`

### Diferența crucială: Reguli vs Patterns

**Programare clasică — IF/ELSE:**

\`\`\`python
def este_spam(email):
    if "câștigat" in email and "click" in email:
        return "SPAM"
    if "ofertă" in email and "URGENT" in email:
        return "SPAM"
    return "OK"
    # Problema: Spam-urile evoluează, regulile devin depășite rapid
\`\`\`

**Machine Learning — Pattern recognition:**

\`\`\`python
from sklearn.naive_bayes import MultinomialNB

# Antrenezi cu mii de exemple de spam și non-spam
model = MultinomialNB()
model.fit(email_features, labels)  # labels: 0 = OK, 1 = SPAM

# Modelul descoperă singur ce face un email să fie spam
predictie = model.predict([email_nou])
print(f"Spam? {bool(predictie[0])}")
\`\`\`

### Analogia cu creierul uman

| Creier uman | Rețea neuronală artificială |
|-------------|----------------------------|
| Neuroni (~86 miliarde) | Noduri matematice |
| Sinapse | Weights (ponderi numerice) |
| Experiență acumulată | Date de antrenament |
| Intuiție | Model antrenat |
| Uită cu timpul | Nu uită (dacă e salvat) |

### Ce înseamnă "a înțelege" pentru AI?

Un model de AI **nu înțelege concepte**. El recunoaște **pattern-uri statistice**:

\`\`\`python
# GPT nu "știe" că Paris e în Franța
# Știe că textul "Capitala Franței este" apare urmat de "Paris"
# în miliarde de texte de pe internet

completare = gpt("Capitala Franței este")
# Output: "Paris"
# Motiv: pattern-matching, nu înțelegere semantică reală

# De aceea AI poate "halucina":
completare2 = gpt("Populația orașului Zzzxyz este")
# Output: "34.521 de locuitori" — inventat cu încredere!
\`\`\`

> **Key insight:** AI-ul este excepțional de bun la găsit pattern-uri în volume imense de date. Exact aceasta este toată "inteligența" sa — și este suficient pentru a fi transformator.`;

  const lesson3Content = `## Tipuri de AI — Narrow AI vs General AI

Nu toate AI-urile sunt la fel. Există diferențe fundamentale între ce poate face un AI specializat și ceea ce vedem în filme science-fiction.

### Narrow AI (AI Îngust) — Ce există azi

**Narrow AI** face un singur lucru, dar îl face excepțional de bine:

\`\`\`python
# Fiecare AI de mai jos e "geniu" într-un domeniu, inutilizabil în altul

chess_ai    = StockfishEngine()    # Bate orice om la șah, nu poate juca dame
image_ai    = ImageClassifier()    # Recunoaște 1000+ obiecte, nu poate scrie cod
speech_ai   = WhisperModel()       # Transcrie audio perfect, nu poate "vedea"
gpt4        = LanguageModel()      # Scrie text excelent, nu poate rula cod nativ
alphafold   = ProteinFolder()      # Prezice structuri proteice, nu poate face altceva
\`\`\`

### General AI (AGI) — Ce nu există încă

**AGI (Artificial General Intelligence)** ar putea:
- Face **orice sarcină cognitivă** la nivel uman sau mai bun
- **Transfera cunoașterea** de la un domeniu la altul fără re-antrenare
- **Raționa** în situații complet noi, fără exemple anterioare

| Caracteristică | Narrow AI | AGI (teoretic) |
|---------------|-----------|----------------|
| Domeniu | Un task specific | Orice task |
| Transfer learning | Limitat | Complet |
| Adaptare spontană | Nu | Da |
| Raționament abstract | Parțial | Da |
| Exemple reale | ChatGPT, AlphaGo | **Nu există** |

### Unde se află modelele populare în 2024?

\`\`\`
Spectrul AI:

Narrow AI ←─────────────────────────────────────────→ AGI
    │                                                    │
  [Simplu]      [Capabil]      [Multi-modal]       [AGI?]
    │               │                │                │
  AlexNet        GPT-3.5          GPT-4o             ???
  (2012)          (2022)           (2024)

  "Vede imagini"  "Scrie text"  "Vede + scrie + cod"
\`\`\`

### Super AI — Ficțiune sau viitor?

**Super AI (ASI)** ar depăși inteligența umană în **toate** domeniile simultan.

Filozofi și cercetători ca Nick Bostrom ("Superintelligence") și Max Tegmark ("Life 3.0") au scris extensiv despre riscurile potențiale.

**Realitatea actuală (2024):**
- Suntem departe de AGI
- Cele mai avansate modele (GPT-4o, Claude 3, Gemini) sunt Narrow AI extrem de sofisticate
- Nu există consens științific despre când/dacă va apărea AGI

### De ce contează distincția?

\`\`\`python
# Înțelegând tipurile de AI, poți:

evaluari_realiste = [
    "ChatGPT nu 'știe' matematică, recunoaște pattern-uri în text",
    "Un AI de imagini nu poate auzi sunete",
    "Un AI de cod nu înțelege contextul business al codului",
]

oportunități = [
    "Unde Narrow AI creează valoare azi → acolo sunt joburile AI",
    "Fiecare domeniu are nevoie de AI specializat",
    "Tu poți construi Narrow AI cu tooluri accesibile",
]
\`\`\`

> **Takeaway:** Tot AI-ul pe care îl folosești azi — ChatGPT, GitHub Copilot, Midjourney, Stable Diffusion — este Narrow AI. Impresionant? Absolut. General? Departe de asta. Și asta e o veste bună: înseamnă că poți înțelege și folosi aceste sisteme.`;

  // Insert lessons
  const lessons = [
    {
      course_id: course.id,
      title: "Ce este Inteligența Artificială?",
      content_md: lesson1Content,
      type: "theory",
      order_index: 1,
    },
    {
      course_id: course.id,
      title: 'Cum "gândește" un calculator',
      content_md: lesson2Content,
      type: "theory",
      order_index: 2,
    },
    {
      course_id: course.id,
      title: "Tipuri de AI — Narrow vs General AI",
      content_md: lesson3Content,
      type: "theory",
      order_index: 3,
    },
  ];

  const { error: lessonsError } = await supabase.from("lessons").insert(lessons);

  if (lessonsError) {
    return { success: false, message: lessonsError.message };
  }

  revalidatePath("/courses");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: `Curs "AI Fundamentals" cu ${lessons.length} lecții a fost adăugat cu succes!`,
  };
}
