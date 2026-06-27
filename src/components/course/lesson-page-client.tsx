"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LessonContent } from "@/components/course/lesson-content";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import type { LessonInteractiveState, LessonWowNotes } from "@/types";
import { CompleteButton } from "@/components/course/complete-button";
import { LessonFeedback } from "@/components/course/lesson-feedback";
import {
  ReadingProgressBar,
  useReadingProgress,
} from "@/components/course/reading-progress";
import { LessonPresence } from "@/components/course/lesson-presence";
import { MascotCelebrationOverlay } from "@/components/mascot/mascot-celebration-overlay";
import { XPToast } from "@/components/gamification/xp-toast";
import { StreakToast } from "@/components/gamification/streak-toast";
import { BadgeToast } from "@/components/gamification/badge-toast";
import { MinigameModal } from "@/components/minigame/minigame-modal";
import type { MarkCompleteResult, MinigameType } from "@/app/(dashboard)/courses/actions";
import type { AwardedBadge } from "@/lib/gamification-constants";
import { usePushNotifications } from "@/hooks/use-push-notifications";

interface CelebrationState {
  show: boolean;
  xp: number;
  leveledUp: boolean;
  newLevel: number;
  newLevelName: string;
  badges: AwardedBadge[];
  nextLessonId: string | null;
}

interface LessonPageClientProps {
  lessonId: string;
  courseSlug: string;
  isCompleted: boolean;
  nextLessonId: string | null;
  nextLessonTitle: string | null;
  mdxSource: MDXRemoteSerializeResult;
  lessonType: string;
  lessonOrder?: number;
  // Presence
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  lessonTitle: string;
  // Feedback
  feedbackAlreadySubmitted: boolean;
  /**
   * True when `content_md` is a single self-closing MDX component (e.g.
   * `<BinaryTranslator />`) — no prose to scroll through, so the read-gate
   * on the "Marchează completat" button must be skipped.
   */
  isGameOnly?: boolean;
  /**
   * Per-user inline-question state (theory path only). Drives the MDX-embedded
   * <InlineQuestion> components and the Variant-A engagement gate.
   */
  interactiveState?: LessonInteractiveState | null;
  /**
   * Contextual Wow Notes (theory path; auth-read, no per-user state). Rendered as
   * inline cards by the MDX-embedded <WowNote> components.
   */
  wowNotes?: LessonWowNotes | null;
  /**
   * Desktop gutter switch (threaded from page.tsx as the single source of truth).
   * When true AND at xl:, the reading chrome below the prose is held to the 680px
   * reading column so it stays aligned with the text (the gutter sits to its right).
   */
  hasWowNotes?: boolean;
}

export function LessonPageClient({
  lessonId,
  courseSlug,
  isCompleted,
  nextLessonId,
  nextLessonTitle,
  mdxSource,
  lessonType,
  lessonOrder,
  userId,
  displayName,
  avatarUrl,
  lessonTitle,
  feedbackAlreadySubmitted,
  isGameOnly = false,
  interactiveState,
  wowNotes,
  hasWowNotes = false,
}: LessonPageClientProps) {
  const router = useRouter();
  const { hasReachedEnd } = useReadingProgress();
  const { requestPermissionAfterComplete } = usePushNotifications();
  const [lessonCompleted, setLessonCompleted] = useState(isCompleted);

  // Variant-A inline gating: complete when every non-essay_ai question has been
  // attempted (>= 1), regardless of correctness. Seed from prior attempts so a
  // returning user (or a lesson with no inline questions) isn't forced to act.
  const initialInlineComplete = (interactiveState?.questions ?? [])
    .filter((q) => q.type !== "essay_ai")
    .every((q) => (interactiveState?.attempts[q.id]?.attempts ?? 0) >= 1);
  const [inlineComplete, setInlineComplete] = useState(initialInlineComplete);

  // ─── Celebration state ────────────────────────────────────────────────────
  const [celebrationState, setCelebrationState] =
    useState<CelebrationState | null>(null);
  const [streakMilestone, setStreakMilestone] = useState<number | null>(null);
  const [badgeQueue, setBadgeQueue] = useState<AwardedBadge[]>([]);
  const [xpToast, setXpToast] = useState<{ amount: number; visible: boolean }>(
    { amount: 0, visible: false }
  );

  // ─── Minigame state ───────────────────────────────────────────────────────
  const [minigame, setMinigame] = useState<{ gameType: MinigameType } | null>(null);
  const [postGameNextId, setPostGameNextId] = useState<string | null>(null);

  const isTheory = lessonType === "theory" || lessonType === "lesson";
  // Game-only lessons (single self-closing MDX component, no prose) skip the
  // scroll-to-end read gate — there's nothing to read.
  const effectiveReadingComplete =
    isTheory && !isGameOnly ? hasReachedEnd : true;
  // Inline questions are the engagement gate now (the old <LessonGate> is retired).
  const effectiveInlineComplete = isTheory ? inlineComplete : true;

  function handleLessonComplete(result: MarkCompleteResult) {
    setLessonCompleted(true);
    // XP toast (2s auto-dismiss)
    setXpToast({ amount: result.xpEarned, visible: true });
    setTimeout(() => setXpToast((p) => ({ ...p, visible: false })), 2000);
    // Streak milestone
    if (result.streakMilestone) setStreakMilestone(result.streakMilestone);
    // Full celebration overlay
    setCelebrationState({
      show: true,
      xp: result.xpEarned,
      leveledUp: result.leveledUp,
      newLevel: result.newLevel,
      newLevelName: result.newLevelName,
      badges: result.newBadges,
      nextLessonId: result.nextLessonId,
    });
    // TODO: re-enable after new minigame system is built
    // Minigame trigger (shown after celebration is dismissed).
    // Disabled: the 6 old minigames are AI/ML-themed and do not fit
    // Course 1 (Hardware & Fizică). 5 new Course 1 components are pending.
    // if (result.minigameReady && result.gameType) {
    //   setMinigame({ gameType: result.gameType });
    //   setPostGameNextId(result.nextLessonId);
    // }
    // Push permission — fires once, after first lesson complete, never on page load
    requestPermissionAfterComplete();
  }

  return (
    <>
      <ReadingProgressBar />

      <LessonContent
        mdxSource={mdxSource}
        lessonType={lessonType}
        lessonOrder={lessonOrder}
        interactiveState={interactiveState}
        wowNotes={wowNotes}
        hasWowNotes={hasWowNotes}
        onGatingChange={setInlineComplete}
      />

      {/* Reading chrome below the prose. On desktop-with-notes it is held to the
          680px reading column (xl:pr-[332px] reserves the gutter) so the complete
          button / next-CTA stay aligned with the text, not floated under the gutter.
          Below xl: or 0-note lessons => no padding, identical to before. */}
      <div className={hasWowNotes ? "xl:pr-[332px]" : undefined}>
      {/* Completion row */}
      <div className="mt-8 pt-6 border-t border-border flex items-center justify-between gap-4 flex-wrap">
        <LessonPresence
          lessonId={lessonId}
          lessonTitle={lessonTitle}
          userId={userId}
          displayName={displayName}
          avatarUrl={avatarUrl}
        />
        <CompleteButton
          lessonId={lessonId}
          courseSlug={courseSlug}
          isCompleted={lessonCompleted}
          nextLessonId={nextLessonId}
          isReadingComplete={effectiveReadingComplete}
          isInlineComplete={effectiveInlineComplete}
          onCompleted={handleLessonComplete}
        />
      </div>

      <LessonFeedback
        lessonId={lessonId}
        show={lessonCompleted}
        alreadySubmitted={feedbackAlreadySubmitted}
      />

      {/* Next-lesson CTA card — replaces the footer "next" link */}
      {nextLessonId && (
        <Link
          href={`/courses/${courseSlug}/${nextLessonId}`}
          className="group mt-8 flex items-center gap-4 rounded-xl border border-[#6C5CE7]/30 bg-[#6C5CE7]/[0.06] p-5 transition-all duration-200 hover:border-[#6C5CE7] hover:bg-[#6C5CE7]/[0.1] hover:shadow-[0_0_16px_2px_rgba(108,92,231,0.35)]"
        >
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#A78BFA]">
              Lecția următoare
            </p>
            <p className="mt-0.5 truncate text-base font-semibold text-foreground">
              {nextLessonTitle ?? "Continuă"}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-[#6C5CE7] transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      )}
      </div>

      {/* ─── Celebration layer ──────────────────────────────────────────── */}
      <MascotCelebrationOverlay
        show={celebrationState?.show ?? false}
        xp={celebrationState?.xp ?? 0}
        leveledUp={celebrationState?.leveledUp ?? false}
        newLevel={celebrationState?.newLevel ?? 1}
        newLevelName={celebrationState?.newLevelName ?? ""}
        badges={celebrationState?.badges ?? []}
        onDismiss={() => {
          const nextId = celebrationState?.nextLessonId;
          const hasPendingMinigame = !!minigame;
          setBadgeQueue(celebrationState?.badges ?? []);
          setCelebrationState(null);
          // Navigate immediately only when no minigame is pending
          if (!hasPendingMinigame && nextId) router.push(`/courses/${courseSlug}/${nextId}`);
        }}
      />

      {/* Mini-game modal — shown after celebration overlay dismisses, before navigation */}
      {minigame && !celebrationState?.show && (
        <MinigameModal
          gameType={minigame.gameType}
          lessonId={lessonId}
          onClose={() => {
            setMinigame(null);
            if (postGameNextId) router.push(`/courses/${courseSlug}/${postGameNextId}`);
            setPostGameNextId(null);
          }}
        />
      )}

      <XPToast xp={xpToast.amount} show={xpToast.visible} />

      <StreakToast
        show={streakMilestone !== null}
        streakCount={streakMilestone ?? 0}
        onDismiss={() => setStreakMilestone(null)}
      />

      <BadgeToast
        badge={badgeQueue[0] ?? null}
        onDismiss={() => setBadgeQueue((prev) => prev.slice(1))}
      />
    </>
  );
}
