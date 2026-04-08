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
