"use client";

import { Users, Gift } from "lucide-react";
import { MeshGradientCard } from "@/components/ui/mesh-gradient-card";
import { CopyButton } from "@/components/profile/copy-button";

interface ReferralSectionProps {
  referralCode: string;
  referralLink: string;
  referralCount: number;
}

const GOLD_PALETTE: [string, string, string] = ["#FDCB6E", "#F59E0B", "#6C5CE7"];

export function ReferralSection({
  referralCode,
  referralLink,
  referralCount,
}: ReferralSectionProps) {
  return (
    <MeshGradientCard
      colors={GOLD_PALETTE}
      intensity={0.16}
      interactive={false}
      className="p-5 sm:p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-aurora-gold-500/15 border border-aurora-gold-500/25">
          <Gift className="h-5 w-5 text-aurora-gold-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground leading-tight">
            Invită prieteni, câștigă XP
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tu și prietenul tău primiți câte 40 XP la fiecare invitație reușită.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-full bg-aurora-gold-500/10 border border-aurora-gold-500/20 px-3 py-1.5 mb-4 w-fit">
        <Users className="h-3.5 w-3.5 text-aurora-gold-500" />
        <span className="text-sm font-semibold text-aurora-gold-500 tabular-nums">
          {referralCount} {referralCount === 1 ? "prieten invitat" : "prieteni invitați"}
        </span>
      </div>

      {referralCode ? (
        <div>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
            Link-ul tău de invitație
          </p>
          <CopyButton value={referralLink} />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          Finalizează onboarding-ul pentru a genera codul tău de invitație.
        </p>
      )}

      <p className="text-[11px] text-muted-foreground mt-4">
        La 1 prieten câștigi badge-ul <strong className="text-foreground">Ambasador 🤝</strong>, la 3 câștigi <strong className="text-foreground">Recrutorul 🌐</strong>.
      </p>
    </MeshGradientCard>
  );
}
