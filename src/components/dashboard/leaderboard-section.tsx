"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Crown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { NumberTicker } from "@/components/ui/number-ticker";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { MeshGradientCard } from "@/components/ui/mesh-gradient-card";

interface LeaderboardUser {
  id: string;
  name: string | null;
  xpPoints: number;
  level: number;
  avatarUrl: string | null;
}

interface LeaderboardSectionProps {
  topUsers: LeaderboardUser[];
  currentUserId: string;
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function LeaderboardSection({ topUsers, currentUserId }: LeaderboardSectionProps) {
  return (
    <motion.section
      id="clasament"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative min-h-[500px] flex items-center justify-center px-6 py-20 overflow-hidden"
    >
      {/* Aurora bg */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="aurora-blob-2"
          style={{ top: "-5%", left: "50%", background: "rgba(253, 203, 110, 0.05)" }}
        />
      </div>

      <div className="w-full mx-auto relative z-10" style={{ maxWidth: "min(75%, 1000px)" }}>
        <h2 className="text-2xl font-bold mb-8">
          <AnimatedGradientText speed={1} colorFrom="#FDCB6E" colorTo="#6C5CE7" className="text-2xl font-bold">
            Clasament
          </AnimatedGradientText>
        </h2>

        {topUsers.length < 3 ? (
          /* Motivational card — not enough users yet */
          <>
            <div className="rounded-[14px] bg-aurora-bg-card border border-aurora-border-medium p-8 text-center mb-4">
              <p className="text-3xl mb-4">🏆</p>
              {topUsers.length > 0 && (() => {
                const me = topUsers.find((u) => u.id === currentUserId);
                return me ? (
                  <p className="text-lg font-semibold text-aurora-primary-300 mb-2">
                    Tu ești pe locul #1 cu{" "}
                    <NumberTicker value={me.xpPoints} className="text-lg font-semibold text-aurora-gold-500" />
                    {" XP"}
                  </p>
                ) : null;
              })()}
              <p className="text-sm text-aurora-text-secondary mb-3">
                Clasamentul se populează pe măsură ce alți utilizatori se alătură.
              </p>
              <p className="text-xs text-aurora-text-tertiary">
                Invită prieteni pentru a face competiția mai interesantă!
              </p>
            </div>
          </>
        ) : (
          /* Normal leaderboard — #1 in gold MeshGradientCard, rest in regular list */
          <div className="space-y-3">
            {/* #1 user — premium gold card */}
            {(() => {
              const champion = topUsers[0];
              const isCurrentUser = champion.id === currentUserId;
              return (
                <Link href="/leaderboard" className="block">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <MeshGradientCard
                      colors={["#FDCB6E", "#F59E0B", "#6C5CE7"]}
                      intensity={0.18}
                      interactive
                      className="p-5 sm:p-6"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                          <span
                            className="absolute -top-3 left-1/2 -translate-x-1/2 text-base pointer-events-none"
                            style={{ animation: "crown-shimmer 2.5s ease-in-out infinite" }}
                            aria-hidden
                          >
                            👑
                          </span>
                          <Avatar className="h-14 w-14 ring-2 ring-aurora-gold-500/40">
                            <AvatarImage src={champion.avatarUrl ?? undefined} alt={champion.name ?? "User"} />
                            <AvatarFallback className="text-base bg-aurora-primary-500 text-white">
                              {getInitials(champion.name)}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-aurora-gold-500">
                              <Crown className="h-3 w-3" />
                              Locul 1
                            </span>
                            {isCurrentUser && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-aurora-accent-500">
                                Tu
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-aurora-text-primary truncate">
                            {champion.name ?? "Anonim"}
                          </h3>
                          <p className="text-xs text-aurora-text-tertiary">
                            Nivel {champion.level}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-2xl font-bold text-aurora-gold-500 tabular-nums leading-none">
                            <NumberTicker
                              value={champion.xpPoints}
                              className="text-2xl font-bold text-aurora-gold-500"
                            />
                          </p>
                          <p className="text-[10px] text-aurora-text-tertiary mt-1">XP</p>
                        </div>
                      </div>
                    </MeshGradientCard>
                  </motion.div>
                </Link>
              );
            })()}

            {/* Ranks 2-N — regular card list */}
            {topUsers.length > 1 && (
              <Link
                href="/leaderboard"
                className="block rounded-[14px] bg-aurora-bg-card border border-aurora-border-medium overflow-hidden cursor-pointer transition-all duration-200 hover:border-aurora-border-strong hover:scale-[1.005]"
              >
                {topUsers.slice(1).map((user, idx) => {
                  const i = idx + 1; // real rank index
                  const isCurrentUser = user.id === currentUserId;
                  return (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.08, duration: 0.4 }}
                      className={cn(
                        "flex items-center gap-4 px-6 py-4",
                        idx !== topUsers.length - 2 && "border-b border-aurora-border-subtle",
                        isCurrentUser && "bg-aurora-accent-500/10",
                        i === 1 && "border-l-2 border-l-[#b2bec3]",
                        i === 2 && "border-l-2 border-l-[#e17055]"
                      )}
                    >
                      <span className="text-lg font-bold text-aurora-text-tertiary w-8 text-center tabular-nums">
                        {i + 1}
                      </span>

                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name ?? "User"} />
                        <AvatarFallback className="text-xs bg-aurora-primary-500 text-white">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 flex items-center gap-2 min-w-0">
                        <span className={cn(
                          "text-sm font-medium truncate",
                          isCurrentUser ? "text-aurora-accent-500" : "text-aurora-text-primary"
                        )}>
                          {user.name ?? "Anonim"}
                          {isCurrentUser && " (tu)"}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-aurora-primary-500/10 text-aurora-primary-300 shrink-0">
                          Lv.{user.level}
                        </span>
                      </div>

                      <span className="text-sm font-semibold text-aurora-gold-500 tabular-nums">
                        <NumberTicker value={user.xpPoints} className="text-sm font-semibold text-aurora-gold-500" /> XP
                      </span>
                    </motion.div>
                  );
                })}
              </Link>
            )}
          </div>
        )}

        <p className="text-xs text-aurora-text-tertiary text-center mt-4">
          Resetare săptămânală
        </p>

        <div className="mt-4 text-center">
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-aurora-text-secondary hover:text-aurora-primary-300 transition-colors"
          >
            Vezi clasamentul complet
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
