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
