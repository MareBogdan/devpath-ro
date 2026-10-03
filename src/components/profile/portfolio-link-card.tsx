"use client";

import Link from "next/link";
import { ExternalLink, ArrowRight } from "lucide-react";
import { CopyButton } from "@/components/profile/copy-button";

interface PortfolioLinkCardProps {
  username: string;
  portfolioLink: string;
}

export function PortfolioLinkCard({ username, portfolioLink }: PortfolioLinkCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-foreground leading-tight">
            Profilul tău public
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pagina ta de portfolio este publică — distribuie oricui fără autentificare.
          </p>
        </div>
        <Link
          href={`/u/${username}`}
          className="group inline-flex items-center gap-2 rounded-xl bg-aurora-primary-500 hover:bg-aurora-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors"
        >
          Vezi portofoliul
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="space-y-3">
        <CopyButton value={portfolioLink} />
        <Link
          href={`/u/${username}`}
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors max-sm:py-3"
        >
          <ExternalLink className="h-3 w-3" />
          Deschide în tab nou
        </Link>
      </div>
    </div>
  );
}
