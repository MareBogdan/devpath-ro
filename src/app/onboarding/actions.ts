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

  // Referral tracking is handled at sign-up (signUpWithEmail, service role). The
  // former `applyReferralCode` action was removed: it was unused and, as an
  // exported server action, let any caller link arbitrary user ids.

  redirect("/dashboard");
}
