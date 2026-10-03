// SERVER-ONLY module — deliberately NOT a "use server" file.
//
// Every export of a "use server" file becomes a server action that the browser can
// call with arbitrary arguments. XP and badges are written here with the SERVICE-ROLE
// client, so these functions must only ever be reachable from other server code
// (server actions / route handlers that have already authenticated the user and
// decided which userId + event to award). Never add "use server" here, and never
// import this module from a client component.

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isRomanianHoliday } from "@/lib/holiday-helpers";
import {
  type XPEventType,
  type AwardXPResult,
  type AwardedBadge,
  type BadgeTrigger,
  XP_VALUES,
  LEVEL_NAMES,
} from "@/lib/gamification-constants";

// Re-export types only (erased at runtime)
export type { XPEventType, AwardXPResult, AwardedBadge, BadgeTrigger };

// ─── awardXP ─────────────────────────────────────────────────────────────────

/**
 * Award XP through the `award_xp_and_check_level` RPC.
 *
 * `refId` makes the award idempotent: the DB records at most one xp_event per
 * (user, eventType, refId), so repeating the same call (double-click, second
 * tab) returns `awarded: false` instead of granting XP again.
 *
 * Uses the service-role client: EXECUTE on the RPC is revoked from `authenticated`,
 * so a signed-in user cannot grant themselves XP by calling it directly.
 */
export async function awardXP(
  userId: string,
  eventType: XPEventType,
  xpOverride?: number,
  refId?: string
): Promise<AwardXPResult & { awarded: boolean }> {
  const supabase = createSupabaseAdminClient();
  const xp = xpOverride ?? XP_VALUES[eventType];

  const { data, error } = await supabase.rpc("award_xp_and_check_level", {
    p_user_id: userId,
    p_event_type: eventType,
    p_xp: xp,
    p_ref_id: refId ?? null,
  });

  if (error) throw new Error(error.message);

  const result = data as {
    awarded: boolean;
    new_xp: number;
    old_level: number;
    new_level: number;
    leveled_up: boolean;
  };

  return {
    awarded: result.awarded,
    newXP: result.new_xp,
    oldLevel: result.old_level,
    newLevel: result.new_level,
    leveledUp: result.leveled_up,
    newLevelName: result.leveled_up ? LEVEL_NAMES[result.new_level] : undefined,
  };
}

// ─── Badge System ─────────────────────────────────────────────────────────────

export async function checkAndAwardBadges(
  userId: string,
  trigger: BadgeTrigger
): Promise<AwardedBadge[]> {
  const supabase = createSupabaseServerClient();
  const awarded: AwardedBadge[] = [];

  async function tryAward(slug: string): Promise<boolean> {
    const { data: badge } = await supabase
      .from("badges")
      .select("id, name, description, icon")
      .eq("slug", slug)
      .single();
    if (!badge) return false;

    // Service role: clients have no INSERT path on user_badges.
    const { error } = await createSupabaseAdminClient().from("user_badges").insert({
      user_id: userId,
      badge_id: badge.id,
    });
    if (error) return false; // duplicate → already earned (UNIQUE constraint)
    awarded.push({ slug, name: badge.name, description: badge.description, icon: badge.icon });
    return true;
  }

  if (trigger.event === "lesson_complete") {
    // prima_lectie — first completed lesson ever
    const { count: lessonCount } = await supabase
      .from("user_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("completed", true);
    if (lessonCount === 1) await tryAward("prima_lectie");

    // maini_murdare — first exercise lesson completed
    if (trigger.lessonType === "exercise") {
      const { data: exerciseLessons } = await supabase
        .from("lessons")
        .select("id")
        .eq("type", "exercise");
      const { count: exerciseCount } = await supabase
        .from("user_progress")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("completed", true)
        .in("lesson_id", (exerciseLessons ?? []).map((l) => l.id));
      if ((exerciseCount ?? 0) === 1) await tryAward("maini_murdare");
    }

    // primul_modul — all lessons in a module complete
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

    // primul_curs + complet — all lessons in course done; la_jumatate — 50%+
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

      if ((courseCompleted ?? 0) >= courseLessons.length / 2) {
        await tryAward("la_jumatate");
      }
    }

    // bufnita_de_noapte — lesson completed 00:00–03:59 Bucharest time
    const bucHour = new Date(
      trigger.completedAt.toLocaleString("en-US", { timeZone: "Europe/Bucharest" })
    ).getHours();
    if (bucHour >= 0 && bucHour < 4) await tryAward("bufnita_de_noapte");

    // sarbatoare_cu_minte — completed on a Romanian national holiday
    if (isRomanianHoliday(trigger.completedAt)) await tryAward("sarbatoare_cu_minte");
  }

  if (trigger.event === "quiz_complete") {
    // tocilarul — all quiz lessons in course passed (score >= 60)
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

    // perfect_primul — first perfect quiz; geniu_in_formare — 5th perfect
    if (trigger.score === 100) {
      const { data: allQuizLessons } = await supabase
        .from("lessons")
        .select("id")
        .eq("type", "quiz");
      const { count: perfectCount } = await supabase
        .from("user_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("score", 100)
        .in("lesson_id", (allQuizLessons ?? []).map((l) => l.id));
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
