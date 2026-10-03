import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PricingCards } from "@/components/pricing/pricing-cards";

export const metadata: Metadata = {
  title: "Prețuri",
  description:
    "Planuri clare pentru fiecare etapă — Gratuit, Pro (99 lei/lună) sau Lifetime (599 lei). Pornești gratuit, upgradezi când ești gata.",
  openGraph: {
    title: "Prețuri — DevPath RO",
    description: "Planuri clare pentru fiecare etapă. Pornești gratuit, upgradezi când ești gata.",
    images: [
      {
        url: "/og?title=Preturi%20DevPath%20RO&description=Gratuit%2C%20Pro%2099%20lei%2Fluna%2C%20Lifetime%20599%20lei.",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default async function PricingPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let currentPlan: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("plan")
      .eq("id", user.id)
      .single();
    currentPlan = profile?.plan ?? "free";
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Simple top nav */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition text-sm max-sm:py-3">
            <ArrowLeft className="h-4 w-4" />
            <span className="max-sm:hidden">Înapoi la pagina principală</span>
            <span className="sm:hidden">Înapoi</span>
          </Link>
          <span className="text-lg font-bold text-foreground whitespace-nowrap">
            Dev<span className="text-primary">Path</span>{" "}
            <span className="text-muted-foreground font-normal text-sm">RO</span>
          </span>
          <div className="w-40 max-sm:hidden" /> {/* spacer (keeps the logo centred on ≥sm) */}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-20">
        {/* Page heading */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full mb-6">
            Prețuri transparente
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Alege planul potrivit pentru tine
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Pornești gratuit și fără cartelă de credit. Upgradezi oricând,
            anulezi oricând.
          </p>
        </div>

        <PricingCards currentPlan={currentPlan} isAuthenticated={!!user} />
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-24">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between flex-wrap gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} DevPath RO. Toate drepturile rezervate.
          </p>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition max-sm:py-2.5">
              Acasă
            </Link>
            <Link href="/courses" className="text-sm text-muted-foreground hover:text-foreground transition max-sm:py-2.5">
              Cursuri
            </Link>
            <Link href="mailto:contact@devpath.ro" className="text-sm text-muted-foreground hover:text-foreground transition max-sm:py-2.5">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
