"use client";

import { motion } from "framer-motion";
import { Trophy, Flame, Award } from "lucide-react";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { ShineBorder } from "@/components/ui/shine-border";
import { Tooltip } from "@/components/ui/tooltip";
import { StatCard } from "@/components/ui/stat-card";

interface EarnedBadge {
  slug: string;
  name: string;
  icon: string;
}

interface RecentLesson {
  lessonTitle: string;
  courseTitle: string;
  completedAt: string;
}

interface AchievementsSectionProps {
  badgesEarned: EarnedBadge[];
  recentLessons: RecentLesson[];
  totalXp: number;
  currentStreak: number;
  nextBadgeName?: string;
  lessonsUntilNextBadge?: number;
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

export function AchievementsSection({
  badgesEarned,
  recentLessons,
  totalXp,
  currentStreak,
  nextBadgeName,
  lessonsUntilNextBadge,
}: AchievementsSectionProps) {
  const isEmpty = badgesEarned.length === 0 && recentLessons.length === 0;

  return (
    <motion.section
      id="realizari"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative min-h-[500px] flex items-center justify-center px-6 py-20 overflow-hidden"
    >
      {/* Aurora bg */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="aurora-blob-1"
          style={{ top: "5%", left: "-10%", background: "rgba(253, 203, 110, 0.06)" }}
        />
      </div>

      <div className="w-full mx-auto relative z-10 max-sm:!max-w-full" style={{ maxWidth: "min(75%, 1000px)" }}>
        <h2 className="text-2xl font-bold mb-8">
          <AnimatedGradientText speed={1} colorFrom="#FDCB6E" colorTo="#6C5CE7" className="text-2xl font-bold">
            Realizările tale
          </AnimatedGradientText>
        </h2>

        {/* 3 highlight stat cards — shared StatCard */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          <StatCard
            icon={Trophy}
            label="Total XP"
            value={totalXp}
            color="gold"
            size="md"
          />
          <StatCard
            icon={Flame}
            label="Streak curent"
            value={currentStreak}
            color="streak"
            size="md"
            subtitle={currentStreak === 1 ? "zi consecutivă" : "zile consecutive"}
          />
          <StatCard
            icon={Award}
            label="Insigne"
            value={badgesEarned.length}
            color="accent"
            size="md"
          />
        </div>

        {isEmpty ? (
          /* Empty state */
          <div className="rounded-[14px] bg-aurora-bg-card border border-aurora-border-medium p-10 text-center">
            <p className="text-3xl mb-3">🏆</p>
            <p className="text-sm font-medium text-aurora-text-primary mb-1">
              Începe primul curs!
            </p>
            <p className="text-xs text-aurora-text-tertiary">
              Completează lecții și badge-urile vor apărea aici.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
            {/* Badge showcase */}
            <div className="rounded-[14px] bg-aurora-bg-card border border-aurora-border-medium p-5 flex flex-col">
              <p className="text-xs font-semibold text-aurora-text-tertiary uppercase tracking-wider mb-4">
                Badge-uri câștigate
              </p>
              {badgesEarned.length > 0 ? (
                <>
                  <div className="flex flex-wrap gap-3 flex-1">
                    {badgesEarned.map((badge) => (
                      <Tooltip key={badge.slug} content={badge.name} delayDuration={200}>
                        <div className="relative h-12 w-12 rounded-full bg-aurora-bg-deepest border border-aurora-border-medium flex items-center justify-center text-2xl cursor-default overflow-hidden">
                          <ShineBorder shineColor={["#FDCB6E", "#A29BFE"]} borderWidth={1.5} duration={8} />
                          {badge.icon}
                        </div>
                      </Tooltip>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-aurora-border-subtle">
                    {nextBadgeName && lessonsUntilNextBadge ? (
                      <p className="text-xs text-aurora-text-tertiary">
                        🔒 <span className="text-aurora-text-secondary font-medium">{nextBadgeName}</span>
                        {" — mai ai "}
                        <span className="text-aurora-primary-300 font-medium">{lessonsUntilNextBadge} lecții</span>
                      </p>
                    ) : (
                      <p className="text-xs text-aurora-text-tertiary">
                        🔒 Continuă să înveți pentru a debloca badge-uri noi.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col justify-between">
                  <p className="text-sm text-aurora-text-tertiary">
                    Completează lecții pentru a debloca badge-uri.
                  </p>
                  <div className="mt-4 pt-4 border-t border-aurora-border-subtle">
                    <p className="text-xs text-aurora-text-tertiary">
                      🔒 Primul badge te așteaptă după prima lecție!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Recent activity timeline */}
            <div className="rounded-[14px] bg-aurora-bg-card border border-aurora-border-medium p-5 flex flex-col">
              <p className="text-xs font-semibold text-aurora-text-tertiary uppercase tracking-wider mb-4">
                Activitate recentă
              </p>
              {recentLessons.length > 0 ? (
                <div className="relative flex-1">
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-aurora-border-subtle" aria-hidden="true" />
                  <div className="space-y-4">
                    {recentLessons.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.06, duration: 0.3 }}
                        className="flex gap-3 items-start"
                      >
                        <div className="h-3.5 w-3.5 rounded-full bg-aurora-accent-500 shrink-0 mt-0.5 relative z-10" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-aurora-text-primary truncate">
                            {item.lessonTitle}
                          </p>
                          <p className="text-[10px] text-aurora-text-tertiary mt-0.5">
                            {timeAgo(item.completedAt)} · {item.courseTitle}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {recentLessons.length < 3 && (
                    <p className="text-xs text-aurora-text-tertiary mt-5">
                      ✨ Continuă să înveți — activitatea ta apare aici!
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-aurora-text-tertiary flex-1">
                  Nicio lecție completată încă.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}
