// ============================================
// DevPath RO — Core Type Definitions
// ============================================

export type UserPlan = "free" | "pro" | "lifetime";
export type UserRole = "student" | "admin";

export interface User {
  id: string;
  email: string;
  name: string | null;
  plan: UserPlan;
  role: UserRole;
  goal: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  is_free: boolean;
  order_index: number;
}

export type LessonType = "theory" | "quiz" | "exercise" | "project";

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content_md: string;
  type: LessonType;
  starter_code: string | null;
  solution_code: string | null;
  order_index: number;
  video_url: string | null;
}

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  score: number | null;
  time_spent: number;
  completed_at: string | null;
}

export interface QuizQuestion {
  id: string;
  lesson_id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export interface Project {
  id: string;
  user_id: string;
  course_id: string;
  title: string;
  description: string;
  github_url: string | null;
  completed_at: string | null;
}
