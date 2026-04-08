import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs"; // Stripe SDK requires Node.js runtime

const schema = z.object({
  priceId: z.string().startsWith("price_"),
  planType: z.enum(["pro", "lifetime"]),
});

export async function POST(req: NextRequest) {
  // ── Auth ─────────────────────────────────────────────────────────────────
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Input validation ──────────────────────────────────────────────────────
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { priceId, planType } = parsed.data;

  // ── Fetch user profile ────────────────────────────────────────────────────
  const { data: profile } = await supabase
    .from("users")
    .select("stripe_customer_id, email, name")
    .eq("id", user.id)
    .single();

  const email = profile?.email ?? user.email ?? undefined;

  // ── Get or create Stripe customer ─────────────────────────────────────────
  let customerId: string | undefined = profile?.stripe_customer_id ?? undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email,
      name: profile?.name ?? undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;

    // Persist customer ID immediately so duplicate customers aren't created
    await supabase
      .from("users")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  // ── Create checkout session ───────────────────────────────────────────────
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const mode = planType === "pro" ? ("subscription" as const) : ("payment" as const);

  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_update: { address: "auto" },
      line_items: [{ price: priceId, quantity: 1 }],
      mode,
      success_url: `${siteUrl}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/pricing/cancel`,
      metadata: { userId: user.id, planType },
      allow_promotion_codes: true,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json(
      { error: "Nu am putut crea sesiunea de plată. Încearcă din nou." },
      { status: 502 }
    );
  }
}
