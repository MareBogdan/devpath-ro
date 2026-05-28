"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { awardXP } from "@/lib/gamification";
import { computeSkillLevel } from "@/lib/onboarding-mapping";
import type {
  ProfileType,
  LearningGoal,
  CalibrationAnswer,
} from "@/components/onboarding/types";

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
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusable chars (0,O,1,I)
  return Array.from(
    { length: 8 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export async function completeOnboarding(
  input: CompleteOnboardingInput
): Promise<void> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const skillLevel = computeSkillLevel(input.hasCodedBefore, input.knowsAPI);

  // Generate unique referral code (retry once on collision)
  const referralCode = generateReferralCode();
  const { error: updateError } = await supabase
    .from("users")
    .update({
      onboarding_completed: true,
      profile_type: input.profileType,
      learning_goal: input.learningGoal,
      skill_level: skillLevel,
      daily_goal_minutes: input.dailyGoalMinutes,
      referral_code: referralCode,
    })
    .eq("id", user.id);

  if (updateError?.code === "23505") {
    // Unique violation on referral_code — retry with new code
    const newCode = generateReferralCode();
    const { error: retryError } = await supabase
      .from("users")
      .update({ referral_code: newCode })
      .eq("id", user.id);
    if (retryError) throw new Error(retryError.message);
  } else if (updateError) {
    throw new Error(updateError.message);
  }

  // Award 50 XP for completing onboarding (graceful failure)
  await awardXP(user.id, "onboarding_complete").catch(() => null);

  // Check if referred — award XP to both users (Phase 3 wires the XP side)
  const { data: profile } = await supabase
    .from("users")
    .select("referred_by")
    .eq("id", user.id)
    .single();

  if (profile?.referred_by) {
    await supabase
      .from("referral_events")
      .update({ xp_awarded: false }) // stays false until Phase 3 wires awardXP
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

  await supabase
    .from("users")
    .update({ referred_by: referrer.id })
    .eq("id", newUserId);

  await supabase.from("referral_events").insert({
    referrer_id: referrer.id,
    referred_id: newUserId,
    xp_awarded: false,
  });
}
