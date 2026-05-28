import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CosmoMascot } from "@/components/mascot/cosmo-mascot";

export const metadata: Metadata = {
  title: "Plată anulată",
  robots: { index: false, follow: false },
};

export default function PricingCancelPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* Mascot */}
        <div className="flex justify-center mb-6">
          <CosmoMascot emotion="encouraging" size={100} />
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-3">
          Plata a fost anulată.
        </h1>
        <p className="text-muted-foreground text-lg mb-2">
          Nu a fost efectuată nicio tranzacție.
        </p>
        <p className="text-muted-foreground mb-10">
          Dacă ai întâmpinat o problemă sau ai o întrebare, ne poți scrie la{" "}
          <a
            href="mailto:contact@devpath.ro"
            className="text-primary hover:underline"
          >
            contact@devpath.ro
          </a>
          .
        </p>

        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3.5 rounded-xl transition text-lg"
        >
          <ArrowLeft className="h-5 w-5" />
          Înapoi la Pricing
        </Link>
      </div>
    </div>
  );
}
