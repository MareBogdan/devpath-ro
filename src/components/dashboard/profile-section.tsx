"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Settings,
  Award,
  BookOpen,
  Bell,
  LogOut,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut } from "@/app/(auth)/actions";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";

interface ProfileSectionProps {
  badgesEarned: number;
  totalBadges: number;
  lastActive?: string | null;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "acum câteva secunde";
  if (mins < 60) return `acum ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `acum ${hrs} ${hrs === 1 ? "oră" : "ore"}`;
  const days = Math.floor(hrs / 24);
  return `acum ${days} ${days === 1 ? "zi" : "zile"}`;
}

interface GridCard {
  label: string;
  href?: string;
  icon: React.ElementType;
  detail?: string;
  iconBg: string;
  iconColor: string;
  cardBg: string;
}

export function ProfileSection({ badgesEarned, totalBadges, lastActive }: ProfileSectionProps) {
  const gridCards: GridCard[] = [
    {
      label: "Setări profil",
      href: "/profile",
      icon: Settings,
      iconBg: "bg-aurora-primary-500/10",
      iconColor: "text-aurora-primary-300",
      cardBg: "bg-aurora-primary-500/5",
    },
    {
      label: "Badge-uri",
      href: "/profile",
      icon: Award,
      detail: `${badgesEarned}/${totalBadges}`,
      iconBg: "bg-aurora-gold-500/10",
      iconColor: "text-aurora-gold-500",
      cardBg: "bg-aurora-gold-500/5",
    },
    {
      label: "Glosar",
      href: "/glossar",
      icon: BookOpen,
      iconBg: "bg-aurora-accent-500/10",
      iconColor: "text-aurora-accent-500",
      cardBg: "bg-aurora-accent-500/5",
    },
    {
      label: "Notificări",
      href: "/settings/notifications",
      icon: Bell,
      iconBg: "bg-aurora-primary-500/10",
      iconColor: "text-aurora-primary-300",
      cardBg: "bg-aurora-primary-500/5",
    },
  ];

  return (
    <motion.section
      id="profil"
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
          style={{ bottom: "5%", right: "-10%", background: "rgba(108, 92, 231, 0.05)" }}
        />
      </div>

      <div className="w-full mx-auto relative z-10 max-sm:!max-w-full" style={{ maxWidth: "min(75%, 1000px)" }}>
        <h2 className="text-2xl font-bold mb-8">
          <AnimatedGradientText speed={1} colorFrom="#6C5CE7" colorTo="#00CEC9" className="text-2xl font-bold">
            Profil & Setări
          </AnimatedGradientText>
        </h2>

        {/* 2-column grid */}
        <div className="grid grid-cols-2 gap-3">
          {gridCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
              >
                <Link
                  href={card.href!}
                  className={`flex items-center gap-3 rounded-[14px] ${card.cardBg} border border-aurora-border-medium p-4 transition-all duration-200 hover:border-aurora-border-strong hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(108,92,231,0.1)] cursor-pointer`}
                >
                  <div className={`p-2 rounded-lg ${card.iconBg} ${card.iconColor} shrink-0`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-aurora-text-primary block truncate">
                      {card.label}
                    </span>
                    {card.detail && (
                      <span className="text-xs text-aurora-text-tertiary">{card.detail} câștigate</span>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}

          {/* Theme toggle card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: gridCards.length * 0.06, duration: 0.3 }}
            className="flex items-center gap-3 rounded-[14px] bg-aurora-bg-card border border-aurora-border-medium p-4 transition-all duration-200 hover:border-aurora-border-strong hover:-translate-y-0.5"
          >
            <div className="p-2 rounded-lg bg-aurora-primary-500/10 text-aurora-primary-300 shrink-0">
              {/* Theme swatches */}
              <div className="flex gap-1 items-center">
                <div className="h-3 w-3 rounded-full bg-[#0F0B1E] border border-aurora-border-subtle" />
                <div className="h-3 w-3 rounded-full bg-[#FAFAFE] border border-aurora-border-subtle" />
              </div>
            </div>
            <span className="flex-1 text-sm font-medium text-aurora-text-primary">Temă</span>
            <ThemeToggle />
          </motion.div>

          {/* Deconectare card — red tinted */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (gridCards.length + 1) * 0.06, duration: 0.3 }}
          >
            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 rounded-[14px] bg-red-500/5 border border-aurora-border-medium p-4 transition-all duration-200 hover:border-red-500/40 hover:bg-red-500/10 hover:-translate-y-0.5 cursor-pointer text-left"
            >
              <div className="p-2 rounded-lg bg-red-500/10 text-red-400 shrink-0">
                <LogOut className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-red-400">Deconectare</span>
            </button>
          </motion.div>
        </div>

        {/* Ultima sesiune */}
        {lastActive && (
          <p className="text-xs text-aurora-text-tertiary text-center mt-5">
            Ultima sesiune: {timeAgo(lastActive)}
          </p>
        )}
      </div>
    </motion.section>
  );
}
