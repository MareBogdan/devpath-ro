"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { XP_VALUES } from "@/lib/gamification-constants";
import { mapAuthError } from "@/lib/auth-errors";

export interface AuthResult {
  error: string | null;
  /** Non-error information to show the user (e.g. "check your email"). */
  notice?: string;
}

const emailSchema = z
  .string({ required_error: "Emailul este obligatoriu.", invalid_type_error: "Emailul este obligatoriu." })
  .trim()
  .max(254, "Adresa de email este prea lungă.")
  .email("Introdu o adresă de email validă.");

const signInSchema = z.object({
  email: emailSchema,
  password: z
    .string({ required_error: "Parola este obligatorie.", invalid_type_error: "Parola este obligatorie." })
    .min(1, "Parola este obligatorie.")
    .max(200),
});

const signUpSchema = z.object({
  name: z
    .string({ required_error: "Numele este obligatoriu.", invalid_type_error: "Numele este obligatoriu." })
    .trim()
    .min(2, "Numele trebuie să aibă între 2 și 80 de caractere.")
    .max(80, "Numele trebuie să aibă între 2 și 80 de caractere."),
  email: emailSchema,
  password: z
    .string({ required_error: "Parola este obligatorie.", invalid_type_error: "Parola este obligatorie." })
    .min(6, "Parola trebuie să aibă cel puțin 6 caractere.")
    .max(72, "Parola poate avea cel mult 72 de caractere."),
});

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function signInWithEmail(
  formData: FormData
): Promise<AuthResult> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Date invalide." };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  redirect("/dashboard");
}

export async function signUpWithEmail(
  formData: FormData
): Promise<AuthResult> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Date invalide." };
  }
  const { name, email, password } = parsed.data;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      // Only used if "Confirm email" is ever switched back on in the dashboard.
      emailRedirectTo: `${siteUrl()}/auth/callback`,
    },
  });

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  // ─── Process referral cookie ────────────────────────────────────────────────
  const cookieStore = cookies();
  const refCookie = cookieStore.get("devpath_ref");

  if (refCookie?.value && data.user) {
    const newUserId = data.user.id;
    try {
      const admin = createSupabaseAdminClient();

      // Find referrer by referral_code
      const { data: referrer } = await admin
        .from("users")
        .select("id")
        .eq("referral_code", refCookie.value)
        .maybeSingle();

      if (referrer && referrer.id !== newUserId) {
        // Record the referral event
        await admin.from("referral_events").insert({
          referrer_id: referrer.id,
          referred_id: newUserId,
        });

        // Link new user to referrer
        await admin
          .from("users")
          .update({ referred_by: referrer.id })
          .eq("id", newUserId);

        // Award XP to new user via RPC (runs as admin → SECURITY DEFINER)
        await admin.rpc("award_xp_and_check_level", {
          p_user_id: newUserId,
          p_event_type: "referral_bonus",
          p_xp: XP_VALUES.referral_bonus,
        });

        // Award XP to referrer
        await admin.rpc("award_xp_and_check_level", {
          p_user_id: referrer.id,
          p_event_type: "referral_bonus",
          p_xp: XP_VALUES.referral_bonus,
        });

        // Check badge milestones for the referrer
        const { count } = await admin
          .from("referral_events")
          .select("id", { count: "exact", head: true })
          .eq("referrer_id", referrer.id);

        const referralCount = count ?? 1;
        const badgeSlugs: string[] = [];
        if (referralCount === 1) badgeSlugs.push("ambasador");
        if (referralCount >= 3) badgeSlugs.push("recrutorul");

        for (const slug of badgeSlugs) {
          const { data: badge } = await admin
            .from("badges")
            .select("id")
            .eq("slug", slug)
            .single();
          if (badge) {
            await admin.from("user_badges").insert({
              user_id: referrer.id,
              badge_id: badge.id,
            });
          }
        }
      }
    } catch (err) {
      // Referral errors must never block registration
      console.error("[auth/referral] Referral tracking failed (non-blocking):", err);
    }

    // Clear the cookie regardless of outcome
    cookieStore.delete("devpath_ref");
  }
  // ───────────────────────────────────────────────────────────────────────────

  // "Confirm email" is OFF for the MVP, so signUp returns a session and the user is
  // signed in immediately. If it is ever switched back on there is no session yet:
  // tell the user to confirm instead of bouncing them to /login with no message.
  if (!data.session) {
    return {
      error: null,
      notice: "Ți-am trimis un email de confirmare. Deschide linkul din el ca să-ți activezi contul.",
    };
  }

  redirect("/dashboard");
}

export async function signInWithOAuth(
  provider: "google" | "github"
): Promise<{ error: string } | void> {
  const parsedProvider = z.enum(["google", "github"]).safeParse(provider);
  if (!parsedProvider.success) {
    return { error: mapAuthError("unsupported provider") };
  }

  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: parsedProvider.data,
    options: {
      redirectTo: `${siteUrl()}/auth/callback`,
    },
  });

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  if (!data.url) {
    return { error: "Nu am putut porni autentificarea. Încearcă din nou." };
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
