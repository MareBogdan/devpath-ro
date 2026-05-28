"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { Check, ArrowRight, Zap, Infinity as InfinityIcon, Gift, Loader2 } from "lucide-react";
import { CosmoMascot } from "@/components/mascot/cosmo-mascot";

interface PricingCardsProps {
  currentPlan?: string | null;
  isAuthenticated: boolean;
}

// ── Animation variants ─────────────────────────────────────────────────────────

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

// ── Plan data ─────────────────────────────────────────────────────────────────

type PlanType = "pro" | "lifetime";

const PLANS = [
  {
    id: "free" as const,
    name: "Gratuit",
    icon: Gift,
    price: "0",
    period: "",
    priceSuffix: "lei",
    description: "Totul ca să pornești și să vezi dacă îți place.",
    highlight: false,
    badge: null,
    planType: null as PlanType | null,
    priceEnvKey: null as string | null,
    features: [
      "Modulele 1-2 din orice curs",
      "5 mesaje AI Coach pe zi",
      "Portofoliu public",
      "Quiz-uri și exerciții",
      "Sistem de XP & badge-uri",
    ],
    cta: "Începe gratuit",
  },
  {
    id: "pro" as const,
    name: "Pro",
    icon: Zap,
    price: "99",
    period: "/lună",
    priceSuffix: "lei",
    description: "Pentru cei care vor să avanseze serios în IT și AI.",
    highlight: true,
    badge: "Cel mai popular",
    planType: "pro" as PlanType,
    priceEnvKey: "NEXT_PUBLIC_STRIPE_PRO_PRICE_ID",
    features: [
      "Toate cursurile, complet",
      "AI Coach nelimitat",
      "Certificate PDF verificabile",
      "Curriculum progresiv (de la zero la avansat)",
      "Suport prioritar",
      "Toate funcționalitățile viitoare",
    ],
    cta: "Alege Pro",
  },
  {
    id: "lifetime" as const,
    name: "Lifetime",
    icon: InfinityIcon,
    price: "599",
    period: " o singură dată",
    priceSuffix: "lei",
    description: "Plătești o dată, ai acces pentru totdeauna.",
    highlight: false,
    badge: null,
    planType: "lifetime" as PlanType,
    priceEnvKey: "NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID",
    features: [
      "Tot ce include Pro, pe viață",
      "Acces la toate cursurile viitoare",
      "Badge exclusiv \"Fondator\"",
      "AI Coach nelimitat",
      "Certificate PDF verificabile",
      "Suport prioritar pe viață",
    ],
    cta: "Acces pe viață",
  },
];

const FAQ = [
  {
    q: "Pot să încerc platforma înainte să plătesc?",
    a: "Da — planul gratuit îți dă acces permanent la modulele 1-2 din fiecare curs, AI Coach (5 mesaje/zi) și portofoliu public. Nicio perioadă de trial, nicio cartelă de credit necesară.",
  },
  {
    q: "Ce înseamnă \"curriculum progresiv\"?",
    a: "Cursurile sunt ordonate de la nivel 0 (matematică de bază, programare începători) până la avansat (rețele neuronale, transformere, LLM-uri). Fiecare curs presupune că l-ai parcurs pe cel anterior — nu sunt salturi bruște și nici redundanță.",
  },
  {
    q: "Pot anula abonamentul Pro oricând?",
    a: "Da, anulezi din setările contului în orice moment. Rămâi cu acces Pro până la sfârșitul perioadei plătite, fără taxe suplimentare.",
  },
  {
    q: "Certificatele sunt recunoscute de angajatori?",
    a: "Certificatele DevPath RO sunt verificabile public printr-un link unic. Sunt documente care demonstrează că ai parcurs și finalizat un curs — utile în CV și pe LinkedIn.",
  },
  {
    q: "Ce se întâmplă dacă apar cursuri noi?",
    a: "Utilizatorii Pro primesc acces la cursuri noi pe toată durata abonamentului. Utilizatorii Lifetime primesc automat acces la orice curs nou lansat, fără costuri extra.",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function PricingCards({ currentPlan, isAuthenticated }: PricingCardsProps) {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<PlanType | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(planType: PlanType, priceId: string) {
    if (!isAuthenticated) {
      router.push("/register?next=/pricing");
      return;
    }

    setLoadingPlan(planType);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, planType }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Eroare necunoscută");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "A apărut o eroare. Încearcă din nou.");
      setLoadingPlan(null);
    }
  }

  return (
    <div>
      {/* Mascot */}
      <div className="flex justify-center mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <CosmoMascot emotion="happy" size={80} />
          </motion.div>
        </motion.div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 max-w-md mx-auto bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-xl px-4 py-3 text-center">
          {error}
        </div>
      )}

      {/* Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {PLANS.map((plan) => {
          const isCurrentPlan = isAuthenticated && currentPlan === plan.id;
          const isLoading = loadingPlan === plan.planType;
          const Icon = plan.icon;

          // Resolve price ID from env at runtime on client
          const priceId =
            plan.priceEnvKey === "NEXT_PUBLIC_STRIPE_PRO_PRICE_ID"
              ? process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
              : plan.priceEnvKey === "NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID"
                ? process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID
                : null;

          return (
            <motion.div
              key={plan.id}
              variants={cardVariants}
              className={`relative rounded-2xl border p-8 flex flex-col ${
                plan.highlight
                  ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary shadow-xl shadow-primary/20 md:-mt-4 md:pb-12"
                  : "bg-card border-border"
              }`}
            >
              {/* "Cel mai popular" badge */}
              {plan.badge && !isCurrentPlan && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-primary-foreground text-primary text-xs font-bold px-4 py-1.5 rounded-full shadow-sm whitespace-nowrap">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* "Planul tău actual" badge */}
              {isCurrentPlan && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm whitespace-nowrap">
                    Planul tău actual
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="mb-6">
                <div
                  className={`p-2.5 rounded-xl w-fit mb-4 ${
                    plan.highlight ? "bg-primary-foreground/10" : "bg-primary/10"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      plan.highlight ? "text-primary-foreground" : "text-primary"
                    }`}
                  />
                </div>
                <p
                  className={`text-sm font-semibold mb-1 ${
                    plan.highlight ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span
                    className={`text-lg font-semibold ${
                      plan.highlight ? "text-primary-foreground/80" : "text-foreground"
                    }`}
                  >
                    {plan.priceSuffix}
                  </span>
                  <span
                    className={`text-sm ${
                      plan.highlight ? "text-primary-foreground/60" : "text-muted-foreground"
                    }`}
                  >
                    {plan.period}
                  </span>
                </div>
                <p
                  className={`text-sm leading-relaxed ${
                    plan.highlight ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  {plan.description}
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check
                      className={`h-4 w-4 mt-0.5 shrink-0 ${
                        plan.highlight ? "text-primary-foreground" : "text-primary"
                      }`}
                    />
                    <span
                      className={
                        plan.highlight ? "text-primary-foreground/90" : "text-foreground"
                      }
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isCurrentPlan ? (
                <div
                  className={`text-center text-sm font-semibold py-3 rounded-xl ${
                    plan.highlight
                      ? "bg-primary-foreground/10 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  Planul tău actual
                </div>
              ) : plan.planType === null ? (
                // Free plan — always a simple link
                <Link
                  href="/register"
                  className={`inline-flex items-center justify-center gap-2 font-semibold py-3 px-6 rounded-xl transition text-sm bg-primary text-primary-foreground hover:bg-primary/90`}
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                // Paid plan — triggers Stripe checkout
                <button
                  onClick={() =>
                    priceId && plan.planType
                      ? handleCheckout(plan.planType, priceId)
                      : router.push("/register?next=/pricing")
                  }
                  disabled={isLoading || loadingPlan !== null}
                  className={`inline-flex items-center justify-center gap-2 font-semibold py-3 px-6 rounded-xl transition text-sm disabled:opacity-60 disabled:cursor-not-allowed ${
                    plan.highlight
                      ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Se procesează...
                    </>
                  ) : (
                    <>
                      {plan.cta}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* FAQ */}
      <motion.div
        className="mt-24"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-foreground text-center mb-10">
          Întrebări frecvente
        </h2>
        <div className="max-w-2xl mx-auto space-y-6">
          {FAQ.map((item) => (
            <div key={item.q} className="bg-card border border-border rounded-xl p-6">
              <p className="font-semibold text-foreground mb-2">{item.q}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
