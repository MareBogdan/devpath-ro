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
import { CosmoMascot } from "@/components/mascot/cosmo-mascot";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { BorderBeam } from "@/components/ui/border-beam";
import { Meteors } from "@/components/ui/meteors";
import { DotPattern } from "@/components/ui/dot-pattern";

// Suppress unused import warnings for icons kept for parity
void Shield;
void Users;

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

// ── Section wrapper ───────────────────────────────────────────────────────────

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

// ── Data ──────────────────────────────────────────────────────────────────────

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
    title: "Curriculum Progresiv",
    desc: "Cursurile sunt organizate de la zero la avansat — fiecare curs construiește pe cel anterior, fără salturi bruște.",
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
    features: ["Toate cursurile complete", "AI Coach nelimitat", "Certificate PDF", "Curriculum progresiv"],
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
    <div className="min-h-screen bg-aurora-bg-deepest">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-aurora-bg-deepest/80 backdrop-blur-md border-b border-aurora-border-subtle">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-aurora-text-primary">
            Dev<span className="text-aurora-primary-300">Path</span>{" "}
            <span className="text-aurora-text-tertiary font-normal text-base">RO</span>
          </span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="w-px h-5 bg-aurora-border-medium mx-1" />
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm font-medium bg-aurora-primary-500 hover:bg-aurora-primary-500/90 text-white px-4 py-2 rounded-lg transition"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-aurora-text-secondary hover:text-aurora-text-primary transition px-3 py-2 rounded-md hover:bg-aurora-bg-interactive"
                >
                  Intră în cont
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium bg-aurora-primary-500 hover:bg-aurora-primary-500/90 text-white px-4 py-2 rounded-lg transition"
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
        {/* Aurora background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div
            className="aurora-blob-1"
            style={{ top: "-20%", right: "0%", background: "rgba(108,92,231,0.10)" }}
          />
          <div
            className="aurora-blob-2"
            style={{ bottom: "-15%", left: "10%", background: "rgba(0,206,201,0.07)" }}
          />
        </div>

        {/* Dot pattern — fades toward right where mascot lives */}
        <DotPattern
          width={28}
          height={28}
          cr={1}
          className="text-aurora-primary-500/10 [mask-image:radial-gradient(ellipse_at_top_left,black_15%,transparent_65%)]"
        />

        {/* Meteors — behind all content */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <Meteors number={10} minDuration={5} maxDuration={12} className="opacity-20" />
        </div>

        <div className="flex items-center justify-between gap-8 relative z-10">
          {/* Left content */}
          <motion.div
            className="max-w-2xl"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 bg-aurora-primary-500/10 text-aurora-primary-300 text-sm font-medium px-3 py-1 rounded-full mb-6 border border-aurora-primary-500/20"
            >
              <Sparkles className="h-4 w-4" />
              Platformă de învățare IT/AI în română
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl lg:text-6xl font-bold text-aurora-text-primary leading-[1.08] tracking-tight"
            >
              Înțelege AI-ul.
              <br />
              <AnimatedGradientText
                speed={1.2}
                colorFrom="#A29BFE"
                colorTo="#00CEC9"
                className="text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight"
              >
                Indiferent de background.
              </AnimatedGradientText>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 text-xl text-aurora-text-secondary leading-relaxed"
            >
              Cursuri interactive cu mod simplu și tehnic, AI Coach personal în română,
              și portofoliu generat automat. Pornești de la zero — ajungi angajabil.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex items-center gap-4 flex-wrap">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="relative inline-flex items-center gap-2 overflow-hidden bg-aurora-primary-500 hover:bg-aurora-primary-500/90 text-white font-semibold px-7 py-3.5 rounded-xl transition text-lg"
                >
                  <BorderBeam
                    colorFrom="#A29BFE"
                    colorTo="#00CEC9"
                    size={80}
                    duration={6}
                    borderWidth={2}
                  />
                  <LayoutDashboard className="h-5 w-5" />
                  Mergi la Dashboard
                  <ArrowRight className="h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="relative inline-flex items-center gap-2 overflow-hidden bg-aurora-primary-500 hover:bg-aurora-primary-500/90 text-white font-semibold px-7 py-3.5 rounded-xl transition text-lg"
                  >
                    <BorderBeam
                      colorFrom="#A29BFE"
                      colorTo="#00CEC9"
                      size={80}
                      duration={6}
                      borderWidth={2}
                    />
                    Începe gratuit
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-aurora-text-secondary hover:text-aurora-text-primary font-medium px-6 py-3.5 transition text-lg"
                  >
                    Am deja cont
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>

          {/* Mascot — enhanced float + scale pulse */}
          <motion.div
            className="hidden lg:flex flex-col items-center shrink-0"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <motion.div
              animate={{ y: [0, -12, 0], scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <CosmoMascot emotion="waving" size={120} enableInteraction />
            </motion.div>
            <p className="mt-3 text-sm text-aurora-text-tertiary font-medium">Cosmo te ajută!</p>
          </motion.div>
        </div>
      </section>

      {/* ── For Whom ── */}
      <Section className="max-w-7xl mx-auto px-6 pb-24">
        <motion.h2
          variants={fadeUp}
          className="text-3xl font-bold text-center mb-3"
        >
          <AnimatedGradientText speed={0.8} colorFrom="#A29BFE" colorTo="#6C5CE7" className="text-3xl font-bold">
            Pentru cine este DevPath RO?
          </AnimatedGradientText>
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="text-aurora-text-secondary text-center mb-12 text-lg"
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
              className="bg-aurora-bg-card rounded-2xl border border-aurora-border-medium p-8 hover:border-aurora-border-strong transition-colors"
            >
              <div className={`p-3 rounded-xl ${card.bg} ${card.color} w-fit mb-4`}>
                <card.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-aurora-text-primary mb-2">{card.title}</h3>
              <p className="text-aurora-text-secondary leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* ── Features Grid ── */}
      <Section className="bg-aurora-bg-card/20 border-y border-aurora-border-subtle py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            variants={fadeUp}
            className="text-3xl font-bold text-center mb-3"
          >
            <AnimatedGradientText speed={0.8} colorFrom="#6C5CE7" colorTo="#00CEC9" className="text-3xl font-bold">
              Tot ce ai nevoie, într-un singur loc
            </AnimatedGradientText>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-aurora-text-secondary text-center mb-12 text-lg"
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
                className="bg-aurora-bg-card rounded-2xl border border-aurora-border-medium p-7 hover:border-aurora-border-strong transition-colors"
              >
                <div className={`p-3 rounded-xl ${f.bg} ${f.color} w-fit mb-4`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-aurora-text-primary mb-2">{f.title}</h3>
                <p className="text-sm text-aurora-text-secondary leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ── Stats ── */}
      <Section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
        >
          {STATS.map((s) => (
            <motion.div key={s.label} variants={fadeUp}>
              <div className="flex items-center justify-center gap-3 mb-2">
                <s.icon className="h-6 w-6 text-aurora-primary-300" />
                <span className="text-5xl font-bold text-aurora-text-primary">{s.value}</span>
              </div>
              <p className="text-aurora-text-secondary text-lg">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* ── Pricing Preview ── */}
      <Section className="bg-aurora-bg-card/20 border-y border-aurora-border-subtle py-24">
        <div className="max-w-5xl mx-auto px-6">
          <motion.h2
            variants={fadeUp}
            className="text-3xl font-bold text-center mb-3"
          >
            <AnimatedGradientText speed={0.8} colorFrom="#FDCB6E" colorTo="#6C5CE7" className="text-3xl font-bold">
              Prețuri clare, fără surprize
            </AnimatedGradientText>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-aurora-text-secondary text-center mb-12 text-lg"
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
                    ? "relative overflow-hidden bg-aurora-primary-500 text-white border-aurora-primary-500 shadow-[0_0_40px_rgba(108,92,231,0.3)] scale-[1.03]"
                    : "bg-aurora-bg-card border-aurora-border-medium"
                }`}
              >
                {plan.highlight && (
                  <BorderBeam
                    colorFrom="#A29BFE"
                    colorTo="#00CEC9"
                    size={100}
                    duration={8}
                    borderWidth={2}
                  />
                )}
                <div className="mb-6">
                  <p className={`text-sm font-medium mb-1 ${plan.highlight ? "text-white/70" : "text-aurora-text-tertiary"}`}>
                    {plan.name}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className={`text-sm ${plan.highlight ? "text-white/70" : "text-aurora-text-tertiary"}`}>
                      {plan.period}
                    </span>
                  </div>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check
                        className={`h-4 w-4 mt-0.5 shrink-0 ${
                          plan.highlight ? "text-white" : "text-aurora-accent-500"
                        }`}
                      />
                      <span className={plan.highlight ? "text-white/90" : "text-aurora-text-primary"}>
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
              className="inline-flex items-center gap-2 text-aurora-primary-300 font-semibold hover:underline text-lg"
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
            animate={{ y: [0, -12, 0], scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <CosmoMascot emotion="happy" size={80} />
          </motion.div>
        </motion.div>
        <motion.h2
          variants={fadeUp}
          className="text-4xl font-bold mb-4"
        >
          <AnimatedGradientText speed={1} colorFrom="#A29BFE" colorTo="#00CEC9" className="text-4xl font-bold">
            Gata să începi?
          </AnimatedGradientText>
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="text-aurora-text-secondary text-xl mb-10"
        >
          Alătură-te platformei unde AI-ul devine accesibil pentru toată lumea — în română.
        </motion.p>
        <motion.div variants={fadeUp}>
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="relative inline-flex items-center gap-2 overflow-hidden bg-aurora-primary-500 hover:bg-aurora-primary-500/90 text-white font-semibold px-8 py-4 rounded-xl text-lg transition"
            >
              <BorderBeam
                colorFrom="#A29BFE"
                colorTo="#00CEC9"
                size={100}
                duration={6}
                borderWidth={2}
              />
              <LayoutDashboard className="h-5 w-5" />
              Mergi la Dashboard
              <ArrowRight className="h-5 w-5" />
            </Link>
          ) : (
            <Link
              href="/register"
              className="relative inline-flex items-center gap-2 overflow-hidden bg-aurora-primary-500 hover:bg-aurora-primary-500/90 text-white font-semibold px-8 py-4 rounded-xl text-lg transition"
            >
              <BorderBeam
                colorFrom="#A29BFE"
                colorTo="#00CEC9"
                size={100}
                duration={6}
                borderWidth={2}
              />
              Creează cont gratuit
              <ArrowRight className="h-5 w-5" />
            </Link>
          )}
        </motion.div>
      </Section>

      {/* ── Footer ── */}
      <footer className="border-t border-aurora-border-subtle">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-lg font-bold text-aurora-text-primary">
            Dev<span className="text-aurora-primary-300">Path</span>{" "}
            <span className="text-aurora-text-tertiary font-normal text-sm">RO</span>
          </span>
          <nav className="flex items-center gap-6">
            <Link href="/courses" className="text-sm text-aurora-text-secondary hover:text-aurora-text-primary transition">
              Cursuri
            </Link>
            <Link href="/pricing" className="text-sm text-aurora-text-secondary hover:text-aurora-text-primary transition">
              Pricing
            </Link>
            <Link href="mailto:contact@devpath.ro" className="text-sm text-aurora-text-secondary hover:text-aurora-text-primary transition">
              Contact
            </Link>
          </nav>
          <p className="text-sm text-aurora-text-tertiary">
            &copy; {new Date().getFullYear()} DevPath RO. Toate drepturile rezervate.
          </p>
        </div>
      </footer>
    </div>
  );
}
