import { redirect } from "next/navigation";

interface PageProps {
  params: { courseSlug: string };
}

/**
 * Course-level page is retired in Block 1 — the new /courses page renders
 * a SerpentinePath that already shows every lesson. Any inbound link to
 * /courses/[slug] redirects to /courses with the slug echoed in the `c`
 * query param so CoursesPageClient can pre-select that course.
 *
 * Lesson URLs (/courses/[slug]/[lessonId]) are unaffected — they live in
 * the [lessonId] sub-route.
 */
export default function CourseDetailRedirect({ params }: PageProps) {
  redirect(`/courses?c=${encodeURIComponent(params.courseSlug)}`);
}
