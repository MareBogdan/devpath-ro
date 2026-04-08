"use client";

import { Share2 } from "lucide-react";
import { trackPortfolioShare } from "@/app/(dashboard)/courses/actions";

interface ShareButtonProps {
  username: string;
  userName: string;
}

export function ShareButton({ username, userName }: ShareButtonProps) {
  async function handleShare() {
    const shareUrl = `${window.location.origin}/u/${username}`;
    const shareText = `Urmărește progresul meu în AI pe DevPath RO: ${shareUrl}`;

    let shared = false;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${userName} — DevPath RO Portfolio`,
          text: shareText,
          url: shareUrl,
        });
        shared = true;
      } catch {
        // User cancelled — do not track
        return;
      }
    } else {
      // Fallback: LinkedIn share
      const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`;
      window.open(linkedInUrl, "_blank", "noopener,noreferrer");
      shared = true;
    }

    if (shared) {
      // Fire-and-forget: award vitrina_deschisa badge
      await trackPortfolioShare();
    }
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
    >
      <Share2 className="h-4 w-4" />
      Distribuie profilul
    </button>
  );
}
