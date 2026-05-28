import type { CalibrationAnswer } from "@/components/onboarding/types";

export function computeSkillLevel(
  hasCodedBefore: CalibrationAnswer,
  knowsAPI: CalibrationAnswer
): "beginner" | "intermediate" | "advanced" {
  if (hasCodedBefore === "yes" && knowsAPI === "yes") return "advanced";
  if (hasCodedBefore === "yes" || knowsAPI === "sometimes_or_a_little")
    return "intermediate";
  return "beginner";
}
