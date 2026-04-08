"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Briefcase,
  Check,
  Code2,
  GraduationCap,
  LayoutDashboard,
  Layers,
  MessageSquare,
  ScrollText,
  Shield,
  Terminal,
  Trophy,
  Users,
  Stethoscope,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { PixelMascot } from "@/components/mascot/pixel-mascot";

interface LandingPageProps {
  isAuthenticated: boolean;
}

// ── Animation variants ────────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ── Section wrapper with scroll-triggered entrance ────────────────────────────

function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={stagger}
    >
      {children}
    </motion.section>
  );
}

// ── Data ─────────────────────────────────────────────────────────────────────

const FOR_WHOM = [
  {
    icon: Stethoscope,
    color: "text-rose-500",
    bg: "bg-rose-100 dark:bg-rose-950",
    title: "Medici & Profesioniști",
    desc: "Înțelege AI-ul medical, automatizează rapoarte și folosește LLM-uri în domeniul tău — fără background tehnic.",
  },
  {
    icon: Lightbulb,
    color: "text-amber-500",
    bg: "bg-amber-100 dark:bg-amber-950",
    title: "Antreprenori",
    desc: "Integrează AI în procesele tale, scrie prompt-uri profesionale și construiește produse AI fără să angajezi ingineri.",
  },
  {
    icon: GraduationCap,
    color: "text-blue-500",
    bg: "bg-blue-100 dark:bg-blue-950",
    title: "Studenți & Curioși",
    desc: "Pornește de la zero, parcurge cursuri structurate și termini cu un portofoliu real gata de CV.",
  },
];

const FEATURES = [
  {
    icon: Layers,
    color: "text-violet-500",
    bg: "bg-violet-100 dark:bg-violet-950",
    title: "Mod Simplu & Tehnic",
    desc: "Comută între explicații cu analogii și conținut cu cod — același subiect, adâncimea ta.",
  },
  {
    icon: Brain,
    color: "text-purple-500",
    bg: "bg-purple-100 dark:bg-purple-950",
    title: "AI Coach Personal",
    desc: "Asistentul tău în română: explică erori, generează exerciții extra și te pregătește pentru interviuri.",
  },
  {
    icon: Trophy,
    color: "text-amber-500",
    bg: "bg-amber-100 dark:bg-amber-950",
    title: "Gamificare Completă",
    desc: "XP, nivele, streak-uri zilnice și 25+ badge-uri. Progresul tău este vizibil și motivant.",
  },
  {
    icon: Briefcase,
    color: "text-green-500",
    bg: "bg-green-100 dark:bg-green-950",
    title: "Portofoliu Public",
    desc: "Pe măsură ce termini cursuri, portofoliul tău la devpath.ro/u/tu se construiește automat.",
  },
  {
    icon: ScrollText,
    color: "text-blue-500",
    bg: "bg-blue-100 dark:bg-blue-950",
    title: "Certificate PDF",
    desc: "La finalul fiecărui curs primești un certificat verificabil — link public cu QR, gata de LinkedIn.",
  },
  {
    icon: Terminal,
    color: "text-emerald-500",
    bg: "bg-emerald-100 dark:bg-emerald-950",
    title: "Execuție Python în Browser",
    desc: "Rulezi cod Python direct în lecție, fără setup local. Feedback instant, fără întreruperea fluxului.",
  },
];

const STATS = [
  { icon: BookOpen, value: "30+", label: "lecții interactive" },
  { icon: Code2, value: "2", label: "cursuri complete" },
  { icon: MessageSquare, value: "24/7", label: "AI Coach în română" },
];

const PLANS = [
  {
    name: "Gratuit",
    price: "0 lei",
    period: "",
    highlight: false,
    features: ["Modul 1 & 2 din fiecare curs", "AI Coach (5 mesaje/zi)", "Portofoliu public"],
  },
  {
    name: "Pro",
    price: "99 lei",
    period: "/lună",
    highlight: true,
    features: ["Toate cursurile complete", "AI Coach nelimitat", "Certificate PDF", "Mod Simplu & Tehnic"],
  },
  {
    name: "Lifetime",
    price: "599 lei",
    period: " o singură dată",
    highlight: false,
    features: ["Tot ce include Pro", "Acces pe viață", "Toate cursurile viitoare", "Prioritate la suport"],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function LandingPage({ isAuthenticated }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-foreground">
            Dev<span className="text-primary">Path</span>{" "}
            <span className="text-muted-foreground font-normal text-base">RO</span>
          </span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="w-px h-5 bg-border mx-1" />
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition px-3 py-2 rounded-md hover:bg-accent"
                >
                  Intră în cont
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition"
                >
                  Începe gratuit
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 relative overflow-hidden">
        <div className="flex items-center justify-between gap-8">
          {/* Left content */}
          <motion.div
            className="max-w-2xl"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full mb-6"
            >
              <Sparkles className="h-4 w-4" />
              Platformă de învățare IT/AI în română
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl lg:text-6xl font-bold text-foreground leading-[1.08] tracking-tight"
            >
              Înțelege AI-ul.
              <br />
              <span className="text-primary">Indiferent de background.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 text-xl text-muted-foreground leading-relaxed"
            >
              Cursuri interactive cu mod simplu și tehnic, AI Coach personal în română,
              și portofoliu generat automat. Pornești de la zero — ajungi angajabil.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex items-center gap-4 flex-wrap">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-7 py-3.5 rounded-xl transition text-lg"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Mergi la Dashboard
                  <ArrowRight className="h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-7 py-3.5 rounded-xl transition text-lg"
                  >
                    Începe gratuit
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium px-6 py-3.5 transition text-lg"
                  >
                    Am deja cont
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>

          {/* Mascot float */}
          <motion.div
            className="hidden lg:flex flex-col items-center shrink-0"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <PixelMascot emotion="excited" size={120} withSparks />
            </motion.div>
            <p className="mt-3 text-sm text-muted-foreground font-medium">Pixel te ajută!</p>
          </motion.div>
        </div>
      </section>

      {/* ── For Whom ── */}
      <Section className="max-w-7xl mx-auto px-6 pb-24">
        <motion.h2
          variants={fadeUp}
          className="text-3xl font-bold text-foreground text-center mb-3"
        >
          Pentru cine este DevPath RO?
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="text-muted-foreground text-center mb-12 text-lg"
        >
          Nu trebuie să fii programator. Trebuie doar să fii curios.
        </motion.p>
        <motion.div
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {FOR_WHOM.map((card) => (
            <motion.div
              key={card.title}
              variants={fadeUp}
              className="bg-card rounded-2xl border border-border p-8 hover:border-primary/30 transition-colors"
            >
              <div className={`p-3 rounded-xl ${card.bg} ${card.color} w-fit mb-4`}>
                <card.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{card.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* ── Features Grid ── */}
      <Section className="bg-muted/30 border-y border-border py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            variants={fadeUp}
            className="text-3xl font-bold text-foreground text-center mb-3"
          >
            Tot ce ai nevoie, într-un singur loc
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-muted-foreground text-center mb-12 text-lg"
          >
            De la teorie la cod real — fără tab-uri extra, fără frustrare.
          </motion.p>
          <motion.div
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                className="bg-card rounded-2xl border border-border p-7 hover:border-primary/30 transition-colors"
              >
                <div className={`p-3 rounded-xl ${f.bg} ${f.color} w-fit mb-4`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ── Social Proof / Stats ── */}
      <Section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
        >
          {STATS.map((s) => (
            <motion.div key={s.label} variants={fadeUp}>
              <div className="flex items-center justify-center gap-3 mb-2">
                <s.icon className="h-6 w-6 text-primary" />
                <span className="text-5xl font-bold text-foreground">{s.value}</span>
              </div>
              <p className="text-muted-foreground text-lg">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* ── Pricing Preview ── */}
      <Section className="bg-muted/30 border-y border-border py-24">
        <div className="max-w-5xl mx-auto px-6">
          <motion.h2
            variants={fadeUp}
            className="text-3xl font-bold text-foreground text-center mb-3"
          >
            Prețuri clare, fără surprize
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-muted-foreground text-center mb-12 text-lg"
          >
            Pornești gratuit. Upgradezi când ești gata.
          </motion.p>
          <motion.div
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {PLANS.map((plan) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                className={`rounded-2xl border p-8 flex flex-col ${
                  plan.highlight
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-[1.03]"
                    : "bg-card border-border"
                }`}
              >
                <div className="mb-6">
                  <p className={`text-sm font-medium mb-1 ${plan.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {plan.name}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className={`text-sm ${plan.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {plan.period}
                    </span>
                  </div>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className={`h-4 w-4 mt-0.5 shrink-0 ${plan.highlight ? "text-primary-foreground" : "text-primary"}`} />
                      <span className={plan.highlight ? "text-primary-foreground/90" : "text-foreground"}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
          <motion.div variants={fadeUp} className="text-center mt-10">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:underline text-lg"
            >
              Vezi toate planurile
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </Section>

      {/* ── Final CTA ── */}
      <Section className="max-w-3xl mx-auto px-6 py-28 text-center">
        <motion.div variants={fadeUp} className="flex justify-center mb-6">
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <PixelMascot emotion="happy" size={80} />
          </motion.div>
        </motion.div>
        <motion.h2
          variants={fadeUp}
          className="text-4xl font-bold text-foreground mb-4"
        >
          Gata să începi?
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="text-muted-foreground text-xl mb-10"
        >
          Alătură-te platformei unde AI-ul devine accesibil pentru toată lumea — în română.
        </motion.p>
        <motion.div variants={fadeUp}>
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 rounded-xl text-lg transition"
            >
              <LayoutDashboard className="h-5 w-5" />
              Mergi la Dashboard
              <ArrowRight className="h-5 w-5" />
            </Link>
          ) : (
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 rounded-xl text-lg transition"
            >
              Creează cont gratuit
              <ArrowRight className="h-5 w-5" />
            </Link>
          )}
        </motion.div>
      </Section>

      {/* ── Footer ── */}
      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-lg font-bold text-foreground">
            Dev<span className="text-primary">Path</span>{" "}
            <span className="text-muted-foreground font-normal text-sm">RO</span>
          </span>
          <nav className="flex items-center gap-6">
            <Link href="/courses" className="text-sm text-muted-foreground hover:text-foreground transition">
              Cursuri
            </Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition">
              Pricing
            </Link>
            <Link href="mailto:contact@devpath.ro" className="text-sm text-muted-foreground hover:text-foreground transition">
              Contact
            </Link>
          </nav>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} DevPath RO. Toate drepturile rezervate.
          </p>
        </div>
      </footer>
    </div>
  );
}
