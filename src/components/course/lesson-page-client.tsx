"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LessonContent } from "@/components/course/lesson-content";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import { LessonGate } from "@/components/course/lesson-gate";
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

interface GateQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

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
  gateQuestions: GateQuestion[];
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
  gateQuestions,
  userId,
  displayName,
  avatarUrl,
  lessonTitle,
  feedbackAlreadySubmitted,
  isGameOnly = false,
}: LessonPageClientProps) {
  const router = useRouter();
  const { hasReachedEnd } = useReadingProgress();
  const { requestPermissionAfterComplete } = usePushNotifications();
  const [gateComplete, setGateComplete] = useState(
    gateQuestions.length === 0
  );
  const [lessonCompleted, setLessonCompleted] = useState(isCompleted);

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
  const effectiveGateComplete = isTheory ? gateComplete : true;

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
      />

      {isTheory && (
        <LessonGate
          questions={gateQuestions}
          lessonId={lessonId}
          visible={hasReachedEnd}
          onAllCorrect={() => setGateComplete(true)}
        />
      )}

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
          isGateComplete={effectiveGateComplete}
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
