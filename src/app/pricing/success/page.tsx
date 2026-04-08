import type { Metadata } from "next";
import Link from "next/link";
import { LayoutDashboard, PartyPopper } from "lucide-react";
import { PixelMascot } from "@/components/mascot/pixel-mascot";

export const metadata: Metadata = {
  title: "Plată reușită",
  robots: { index: false, follow: false },
};

export default function PricingSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* Mascot */}
        <div className="flex justify-center mb-6">
          <PixelMascot emotion="excited" size={100} withSparks />
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400">
            <PartyPopper className="h-8 w-8" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-3">
          Felicitări! Planul tău a fost activat.
        </h1>
        <p className="text-muted-foreground text-lg mb-2">
          Plata a fost procesată cu succes.
        </p>
        <p className="text-muted-foreground mb-10">
          Accesul tău extins este activ — poți începe să explorezi toate cursurile și funcționalitățile Pro chiar acum.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3.5 rounded-xl transition text-lg"
        >
          <LayoutDashboard className="h-5 w-5" />
          Mergi la Dashboard
        </Link>
      </div>
    </div>
  );
}
