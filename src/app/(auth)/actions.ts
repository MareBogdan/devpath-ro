"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { XP_VALUES } from "@/lib/gamification-constants";

export interface AuthResult {
  error: string | null;
}

export async function signInWithEmail(
  formData: FormData
): Promise<AuthResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email și parola sunt obligatorii." };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function signUpWithEmail(
  formData: FormData
): Promise<AuthResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!email || !password) {
    return { error: "Email și parola sunt obligatorii." };
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (error) {
    return { error: error.message };
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
    } catch {
      // Referral errors must never block registration
    }

    // Clear the cookie regardless of outcome
    cookieStore.delete("devpath_ref");
  }
  // ───────────────────────────────────────────────────────────────────────────

  redirect("/dashboard");
}

export async function signInWithOAuth(provider: "google" | "github") {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signOut() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
