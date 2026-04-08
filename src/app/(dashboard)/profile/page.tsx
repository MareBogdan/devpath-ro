import { redirect } from "next/navigation";
import Link from "next/link";
import { UserCircle, Users, ExternalLink, Share2 } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CopyButton } from "@/components/profile/copy-button";

export default async function ProfilePage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("name, email, referral_code, xp_points, level, streak_count, avatar_url")
    .eq("id", user.id)
    .single();

  const { count: referralCount } = await supabase
    .from("referral_events")
    .select("id", { count: "exact", head: true })
    .eq("referrer_id", user.id);

  const referralCode = profile?.referral_code ?? "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://devpath.ro";
  const referralLink = `${siteUrl}/join?ref=${referralCode}`;
  const portfolioUsername = referralCode || (user.email?.split("@")[0] ?? "");
  const portfolioLink = `${siteUrl}/u/${portfolioUsername}`;
  const displayName = profile?.name ?? user.email?.split("@")[0] ?? "Student";

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profilul meu</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Invită prieteni și distribuie-ți progresul.
        </p>
      </div>

      {/* Profile card */}
      <div className="rounded-2xl border border-border bg-card p-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary/10 text-primary text-xl font-bold flex items-center justify-center shrink-0 overflow-hidden">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={displayName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            displayName.charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <p className="font-semibold text-foreground">{displayName}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span>Nivel {profile?.level ?? 1}</span>
            <span>·</span>
            <span>{(profile?.xp_points ?? 0).toLocaleString("ro-RO")} XP</span>
            <span>·</span>
            <span>{profile?.streak_count ?? 0} zile streak</span>
          </div>
        </div>
      </div>

      {/* Referral section */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            Invită prieteni
          </h2>
        </div>

        <p className="text-sm text-muted-foreground">
          Tu și prietenul tău primiți fiecare{" "}
          <strong className="text-foreground">40 XP</strong> când se
          înregistrează cu link-ul tău. La 1 invitat câștigi badge-ul{" "}
          <strong className="text-foreground">Ambasador 🤝</strong>, la 3
          câștigi <strong className="text-foreground">Recrutorul 🌐</strong>.
        </p>

        {/* Referral count */}
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm">
          <Users className="h-3.5 w-3.5 text-primary" />
          <span className="font-medium text-primary">
            {referralCount ?? 0}{" "}
            {(referralCount ?? 0) === 1
              ? "prieten invitat"
              : "prieteni invitați"}
          </span>
        </div>

        {/* Referral link */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">
            Link-ul tău de invitație
          </p>
          {referralCode ? (
            <CopyButton value={referralLink} />
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Finalizează onboarding-ul pentru a genera codul tău de invitație.
            </p>
          )}
        </div>
      </div>

      {/* Portfolio link */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <UserCircle className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            Profilul meu public
          </h2>
        </div>

        <p className="text-sm text-muted-foreground">
          Pagina ta de portfolio este publică — o poți distribui oricui fără
          autentificare.
        </p>

        <div className="flex flex-col gap-3">
          <CopyButton value={portfolioLink} />
          <Link
            href={`/u/${portfolioUsername}`}
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Deschide profilul
          </Link>
        </div>
      </div>

      {/* Share hint */}
      <div className="flex items-start gap-3 rounded-xl bg-muted/40 border border-border px-4 py-3">
        <Share2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Distribuie-ți profilul pe LinkedIn sau oricui vrei să îi arăți
          progresul tău. Butonul{" "}
          <strong className="text-foreground">Distribuie profilul</strong> se
          află pe pagina ta de portfolio.
        </p>
      </div>
    </div>
  );
}
