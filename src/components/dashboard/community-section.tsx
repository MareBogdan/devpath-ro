"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface CommunityCompletion {
  userName: string | null;
  lessonTitle: string | null;
  completedAt: string;
}

interface CommunitySectionProps {
  totalUsers: number;
  activeToday: number;
  recentCompletions: CommunityCompletion[];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `acum ${mins || 1} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `acum ${hrs} ${hrs === 1 ? "oră" : "ore"}`;
  const days = Math.floor(hrs / 24);
  return `acum ${days} ${days === 1 ? "zi" : "zile"}`;
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

export function CommunitySection({
  totalUsers,
  activeToday,
  recentCompletions,
}: CommunitySectionProps) {
  return (
    <motion.section
      id="comunitate"
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
          style={{ bottom: "0%", left: "-5%", background: "rgba(0, 206, 201, 0.06)" }}
        />
      </div>

      <div className="w-full mx-auto relative z-10" style={{ maxWidth: "min(75%, 1000px)" }}>
        <h2 className="text-2xl font-bold mb-8">
          <AnimatedGradientText speed={1} colorFrom="#00CEC9" colorTo="#6C5CE7" className="text-2xl font-bold">
            Comunitatea DevPath
          </AnimatedGradientText>
        </h2>

        {totalUsers < 5 ? (
          /* Early adopter state */
          <>
            <div className="rounded-[14px] bg-aurora-accent-500/10 border border-aurora-accent-500/25 p-6 mb-6 text-center">
              <p className="text-2xl mb-2">🌱</p>
              <p className="text-lg font-semibold text-aurora-primary-300 mb-1">
                Fii printre primii care învață pe DevPath RO!
              </p>
              <p className="text-sm text-aurora-text-secondary">
                Early Adopter — ești printre primii utilizatori ai platformei.
              </p>
            </div>
            <div className={`grid gap-4 mb-6 ${activeToday > 0 ? "grid-cols-2" : "grid-cols-1 max-w-xs mx-auto"}`}>
              <div className="rounded-[14px] bg-aurora-bg-card border border-aurora-border-medium p-5 text-center">
                <p className="text-2xl font-bold text-aurora-primary-300">
                  <NumberTicker value={totalUsers} className="text-2xl font-bold text-aurora-primary-300" />
                </p>
                <p className="text-xs text-aurora-text-tertiary mt-1">
                  {totalUsers === 1 ? "Utilizator" : "Utilizatori"}
                </p>
              </div>
              {activeToday > 0 && (
                <div className="rounded-[14px] bg-aurora-bg-card border border-aurora-border-medium p-5 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full bg-green-400 shrink-0"
                      style={{ boxShadow: "0 0 6px rgba(74,222,128,0.6)", animation: "pulse 2s ease-in-out infinite" }}
                    />
                    <p className="text-2xl font-bold text-green-400">
                      <NumberTicker value={activeToday} className="text-2xl font-bold text-green-400" />
                    </p>
                  </div>
                  <p className="text-xs text-aurora-text-tertiary mt-1">Activi azi</p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Normal stats row */
          <div className={`grid gap-4 mb-6 ${activeToday > 0 ? "grid-cols-3" : "grid-cols-2"}`}>
            <div className="rounded-[14px] bg-aurora-bg-card border border-aurora-border-medium p-5 text-center">
              <p className="text-2xl font-bold text-aurora-primary-300">
                <NumberTicker value={totalUsers} className="text-2xl font-bold text-aurora-primary-300" />
              </p>
              <p className="text-xs text-aurora-text-tertiary mt-1">
                {totalUsers === 1 ? "Utilizator" : "Utilizatori"}
              </p>
            </div>

            {activeToday > 0 && (
              <div className="rounded-[14px] bg-aurora-bg-card border border-aurora-border-medium p-5 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full bg-green-400 shrink-0"
                    style={{ boxShadow: "0 0 6px rgba(74,222,128,0.6)", animation: "pulse 2s ease-in-out infinite" }}
                  />
                  <p className="text-2xl font-bold text-green-400">
                    <NumberTicker value={activeToday} className="text-2xl font-bold text-green-400" />
                  </p>
                </div>
                <p className="text-xs text-aurora-text-tertiary mt-1">Activi azi</p>
              </div>
            )}

            <div className="rounded-[14px] bg-aurora-bg-card border border-aurora-border-medium p-5 text-center">
              <p className="text-2xl font-bold text-aurora-accent-500">
                <NumberTicker value={recentCompletions.length} className="text-2xl font-bold text-aurora-accent-500" />
              </p>
              <p className="text-xs text-aurora-text-tertiary mt-1">Lecții recent</p>
            </div>
          </div>
        )}

        {/* Live feed */}
        <div className="rounded-[14px] bg-aurora-bg-card border border-aurora-border-medium overflow-hidden">
          <div className="px-5 py-4 border-b border-aurora-border-subtle">
            <p className="text-xs font-semibold text-aurora-text-tertiary uppercase tracking-wider">
              Activitate live
            </p>
          </div>

          {recentCompletions.length === 0 ? (
            <div className="py-10 px-6 text-center text-sm text-aurora-text-tertiary">
              Pe măsură ce comunitatea crește, vei vedea aici activitatea celorlalți.
            </div>
          ) : (
            <div>
              {recentCompletions.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className={`flex items-center gap-3 px-5 py-3 ${
                    i !== recentCompletions.length - 1 ? "border-b border-aurora-border-subtle" : ""
                  }`}
                >
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="text-[10px] bg-aurora-primary-500/20 text-aurora-primary-300">
                      {getInitials(item.userName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-aurora-text-primary truncate">
                      <span className="font-medium">{item.userName ?? "Anonim"}</span>
                      {" a completat "}
                      <span className="text-aurora-text-secondary">{item.lessonTitle ?? "o lecție"}</span>
                    </p>
                    <p className="text-[10px] text-aurora-text-tertiary mt-0.5">
                      {timeAgo(item.completedAt)}
                    </p>
                  </div>

                  <div className="h-5 w-5 rounded-full bg-aurora-accent-500/15 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-aurora-accent-500" />
                  </div>
                </motion.div>
              ))}
              {recentCompletions.length < 3 && (
                <p className="px-5 py-3 text-xs text-aurora-text-tertiary border-t border-aurora-border-subtle">
                  Pe măsură ce comunitatea crește, vei vedea mai multă activitate aici.
                </p>
              )}
            </div>
          )}
        </div>

        <p className="text-xs text-aurora-text-tertiary text-center mt-4">
          Înveți împreună cu alți români pasionați de tech.
        </p>
      </div>
    </motion.section>
  );
}
