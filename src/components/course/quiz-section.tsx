"use client";

import { useState } from "react";
import { QuizBlock } from "./quiz-block";
import { AdaptiveQuizSection } from "./adaptive-quiz-section";

interface QuizSectionProps {
  lessonId: string;
  courseSlug: string;
  questions: {
    id: string;
    question: string;
    options: string[];
    correct_answer: number;
    explanation: string;
  }[];
  isCompleted: boolean;
}

export function QuizSection({
  lessonId,
  courseSlug,
  questions,
  isCompleted,
}: QuizSectionProps) {
  const [showAdaptive, setShowAdaptive] = useState(false);

  return (
    <>
      <QuizBlock
        lessonId={lessonId}
        courseSlug={courseSlug}
        questions={questions}
        isCompleted={isCompleted}
        onQuizFailed={() => setShowAdaptive(true)}
      />
      {showAdaptive && <AdaptiveQuizSection lessonId={lessonId} autoStart />}
    </>
  );
}
