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
  // Presence is a nice-to-have: any failure here (Realtime disabled, WebSocket
  // blocked, thrown error) ends in `channelStatus = "error"` → the component
  // renders nothing and the lesson page is unaffected.
  useEffect(() => {
    let active = true; // false after cleanup → late callbacks are ignored
    let failed = false;
    let subscribed = false;
    let channel: RealtimeChannel | null = null;
    let timeoutId: number | undefined;
    let celebrationTimer: number | undefined;
    const supabase = getSupabaseBrowserClient();

    /** Remove the channel (also stops supabase-js's reconnect/rejoin loop). */
    const teardown = () => {
      const ch = channel;
      channel = null;
      if (!ch) return;
      if (channelRef.current === ch) channelRef.current = null;
      try {
        supabase.removeChannel(ch).catch(() => {});
      } catch {
        // already torn down
      }
    };

    /** Give up on presence for this lesson: warn once, show nothing. */
    const fail = (reason: string) => {
      if (!active || failed) return;
      failed = true;
      console.warn(
        `[LessonPresence] Presence unavailable (${reason}) — check Supabase → Project Settings → Realtime is enabled.`
      );
      setChannelStatus("error");
      setPresenceList([]);
      teardown();
    };

    setChannelStatus("connecting");
    setPresenceList([]);

    try {
      const ch = supabase.channel(`lesson-presence:${lessonId}`, {
        config: { presence: { key: userId } },
      });
      channel = ch;
      channelRef.current = ch;

      // Register event listeners now (before subscribe — no WebSocket needed yet).
      ch.on("presence", { event: "sync" }, () => {
        if (!active) return;
        try {
          const state = ch.presenceState() as Record<string, PresenceUser[]>;
          // One entry per user: the same account in two tabs (or a reload whose old
          // socket hasn't timed out yet) yields several metas with the same user_id.
          const byUser = new Map<string, PresenceUser>();
          for (const u of Object.values(state).flat()) {
            if (u?.user_id && !byUser.has(u.user_id)) byUser.set(u.user_id, u);
          }
          setPresenceList(Array.from(byUser.values()));
        } catch {
          // ignore a malformed presence state
        }
      }).on(
        "broadcast",
        { event: "lesson_complete" },
        ({ payload }: { payload: unknown }) => {
          if (!active) return;
          const ev = payload as Partial<CelebrationEvent> | null;
          if (!ev?.display_name || ev.display_name === displayName) return;
          setCelebration({
            display_name: ev.display_name,
            lesson_title: ev.lesson_title ?? "",
          });
          window.clearTimeout(celebrationTimer);
          celebrationTimer = window.setTimeout(() => setCelebration(null), 4500);
        }
      );

      // ── React 18 Strict Mode fix ───────────────────────────────────────────
      // Strict Mode's fake unmount fires synchronously (< 1 ms after mount).
      // By deferring subscribe() by 200 ms we guarantee: if cleanup runs before
      // the timer fires, clearTimeout() cancels it and the WebSocket is NEVER
      // opened — no "WebSocket closed before connection established" error.
      timeoutId = window.setTimeout(() => {
        if (!channel) return;
        try {
          subscribed = true;
          channel.subscribe(async (status: string) => {
            if (!active || failed) return;
            if (status === "SUBSCRIBED") {
              setChannelStatus("connected");
              try {
                await channel?.track({
                  user_id: userId,
                  display_name: displayName,
                  avatar_url: avatarUrl ?? null,
                  online_at: new Date().toISOString(),
                });
              } catch {
                fail("track failed");
              }
            } else if (
              status === "CHANNEL_ERROR" ||
              status === "TIMED_OUT" ||
              status === "CLOSED"
            ) {
              fail(status);
            }
          });
        } catch {
          fail("subscribe threw");
        }
      }, 200);
    } catch {
      fail("setup threw");
    }

    return () => {
      // Order matters: flip `active` first so the CLOSED callback fired by
      // removeChannel() is ignored. If cleanup ran before the 200 ms timer,
      // subscribe() was never called and there is no socket to close.
      active = false;
      window.clearTimeout(timeoutId);
      window.clearTimeout(celebrationTimer);
      const ch = channel;
      if (subscribed) teardown();
      else channel = null;
      if (ch && channelRef.current === ch) channelRef.current = null;
    };
  }, [lessonId, userId, displayName, avatarUrl]);

  // ── Listen for local complete event → broadcast to other students ─────────
  useEffect(() => {
    const handler = (e: Event) => {
      const { lessonId: evId } = (
        e as CustomEvent<{ lessonId: string }>
      ).detail;
      if (evId !== lessonId || !channelRef.current) return;

      try {
        channelRef.current
          .send({
            type: "broadcast",
            event: "lesson_complete",
            payload: {
              display_name: displayName,
              lesson_title: lessonTitle,
            } as CelebrationEvent,
          })
          .catch(() => {});
      } catch {
        // presence is best-effort — never block lesson completion
      }
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

  // ── Error: show nothing (the one warning is logged in the effect) ────────
  if (channelStatus === "error") return null;

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
