"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Wifi } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface PresenceUser {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  online_at: string;
}

interface CelebrationEvent {
  display_name: string;
  lesson_title: string;
}

export interface LessonPresenceProps {
  lessonId: string;
  lessonTitle: string;
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const AVATAR_COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-orange-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-amber-500",
  "bg-pink-500",
] as const;

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getAvatarColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) & 0xffff;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type ChannelStatus = "connecting" | "connected" | "error";

export function LessonPresence({
  lessonId,
  lessonTitle,
  userId,
  displayName,
  avatarUrl,
}: LessonPresenceProps) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [presenceList, setPresenceList] = useState<PresenceUser[]>([]);
  const [channelStatus, setChannelStatus] = useState<ChannelStatus>("connecting");
  const [celebration, setCelebration] = useState<CelebrationEvent | null>(null);

  // ── Supabase Realtime: presence tracking ──────────────────────────────────
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const channel = supabase.channel(`lesson-presence:${lessonId}`, {
      config: { presence: { key: userId } },
    });

    channelRef.current = channel;
    setChannelStatus("connecting");
    setPresenceList([]);

    // Register event listeners now (before subscribe — no WebSocket needed yet).
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState() as Record<string, PresenceUser[]>;
        const users = Object.values(state).flat() as PresenceUser[];
        setPresenceList(users);
      })
      .on("broadcast", { event: "lesson_complete" }, ({ payload }: { payload: unknown }) => {
        const ev = payload as CelebrationEvent;
        if (ev.display_name !== displayName) {
          setCelebration(ev);
          setTimeout(() => setCelebration(null), 4500);
        }
      });

    // ── React 18 Strict Mode fix ─────────────────────────────────────────────
    // Strict Mode's fake unmount fires synchronously (< 1 ms after mount).
    // By deferring subscribe() by 200 ms we guarantee: if cleanup runs before
    // the timer fires, clearTimeout() cancels it and the WebSocket is NEVER
    // opened — no "WebSocket closed before connection established" error.
    // On a real unmount (navigation) the 200 ms have already elapsed,
    // `subscribed` is true, and we call removeChannel() for proper teardown.
    let subscribed = false;

    const timeoutId = window.setTimeout(async () => {
      subscribed = true;
      channel.subscribe(async (status: string) => {
        if (status === "SUBSCRIBED") {
          setChannelStatus("connected");
          await channel.track({
            user_id: userId,
            display_name: displayName,
            avatar_url: avatarUrl ?? null,
            online_at: new Date().toISOString(),
          });
        } else if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        ) {
          console.warn(
            "[LessonPresence] Channel error — check Supabase → Project Settings → Realtime is enabled."
          );
          setChannelStatus("error");
        }
      });
    }, 200);

    return () => {
      // If Strict Mode cleanup fires before 200 ms: timer is cancelled,
      // subscribe() was never called, nothing to tear down.
      clearTimeout(timeoutId);
      if (subscribed) {
        supabase.removeChannel(channel);
      }
    };
  }, [lessonId, userId, displayName, avatarUrl]);

  // ── Listen for local complete event → broadcast to other students ─────────
  useEffect(() => {
    const handler = (e: Event) => {
      const { lessonId: evId } = (
        e as CustomEvent<{ lessonId: string }>
      ).detail;
      if (evId !== lessonId || !channelRef.current) return;

      channelRef.current.send({
        type: "broadcast",
        event: "lesson_complete",
        payload: {
          display_name: displayName,
          lesson_title: lessonTitle,
        } as CelebrationEvent,
      });
    };

    window.addEventListener("lesson-presence:complete", handler);
    return () => window.removeEventListener("lesson-presence:complete", handler);
  }, [lessonId, displayName, lessonTitle]);

  // ── Derived state ─────────────────────────────────────────────────────────
  const visibleUsers = presenceList.slice(0, 3);
  const extraCount = Math.max(0, presenceList.length - 3);
  const othersCount = presenceList.filter((u) => u.user_id !== userId).length;

  // ── Loading state: always visible while connecting ────────────────────────
  if (channelStatus === "connecting") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
        <Wifi className="h-3 w-3 animate-pulse" />
        <span className="hidden sm:inline">conectare...</span>
      </div>
    );
  }

  // ── Error: fail silently (no UI clutter in production) ───────────────────
  if (channelStatus === "error") {
    console.warn(
      "[LessonPresence] Channel error — check Supabase → Project Settings → Realtime is enabled."
    );
    return null;
  }

  // ── Connected ─────────────────────────────────────────────────────────────
  return (
    <>
      {/* Avatar stack + live counter */}
      <div className="flex items-center gap-2">
        {visibleUsers.length > 0 && (
          <div className="flex -space-x-2">
            {visibleUsers.map((u) => (
              <div
                key={u.user_id}
                title={u.display_name}
                className="h-7 w-7 rounded-full ring-2 ring-background overflow-hidden shrink-0"
              >
                {u.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={u.avatar_url}
                    alt={u.display_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className={`h-full w-full flex items-center justify-center text-white text-[10px] font-bold ${getAvatarColor(u.user_id)}`}
                  >
                    {getInitials(u.display_name)}
                  </div>
                )}
              </div>
            ))}

            {extraCount > 0 && (
              <div className="h-7 w-7 rounded-full ring-2 ring-background bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                +{extraCount}
              </div>
            )}
          </div>
        )}

        <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:flex items-center gap-1.5">
          {othersCount > 0 ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              {othersCount === 1
                ? "1 student studiază acum"
                : `${othersCount} studenți studiază acum`}
            </>
          ) : (
            <>
              <Users className="h-3 w-3" />
              Ești singurul online
            </>
          )}
        </span>
      </div>

      {/* Celebration toast — framer-motion, centered above bottom bar */}
      <AnimatePresence>
        {celebration && (
          <motion.div
            key="celebration"
            initial={{ opacity: 0, y: 50, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-3 px-5 py-3.5 rounded-2xl border border-violet-200 dark:border-violet-800 bg-background shadow-2xl shadow-violet-100 dark:shadow-violet-950/30 pointer-events-none min-w-[280px] max-w-sm"
          >
            <motion.div
              animate={{ rotate: [0, -12, 12, -8, 8, 0] }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-2xl select-none"
            >
              🎉
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground leading-snug">
                {celebration.display_name} a terminat lecția!
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {celebration.lesson_title}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center shrink-0 text-base select-none">
              🏆
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
