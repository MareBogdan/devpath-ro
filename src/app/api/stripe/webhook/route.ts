import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs"; // raw body reading requires Node.js runtime

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  // ── Verify webhook signature ───────────────────────────────────────────────
  let event: ReturnType<typeof stripe.webhooks.constructEvent>;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[stripe/webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  // ── Handle events ──────────────────────────────────────────────────────────
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const planType = session.metadata?.planType;

      if (!userId || !planType) {
        console.error("[stripe/webhook] Missing userId or planType in session metadata", session.id);
        break;
      }

      const updatePayload: Record<string, unknown> = {
        plan: planType,
        plan_activated_at: new Date().toISOString(),
      };

      // Persist subscription ID for Pro (subscription mode)
      if (session.mode === "subscription" && session.subscription) {
        updatePayload.stripe_subscription_id =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;
      }

      const { error } = await supabase
        .from("users")
        .update(updatePayload)
        .eq("id", userId);

      if (error) {
        console.error("[stripe/webhook] Failed to update user plan:", error);
        // Return 500 so Stripe retries the event
        return NextResponse.json({ error: "DB update failed" }, { status: 500 });
      }

      console.log(`[stripe/webhook] Plan activated: userId=${userId} plan=${planType}`);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      const { error } = await supabase
        .from("users")
        .update({
          plan: "free",
          stripe_subscription_id: null,
        })
        .eq("stripe_customer_id", customerId);

      if (error) {
        console.error("[stripe/webhook] Failed to downgrade user plan:", error);
        return NextResponse.json({ error: "DB update failed" }, { status: 500 });
      }

      console.log(`[stripe/webhook] Subscription cancelled: customerId=${customerId}`);
      break;
    }

    default:
      // Acknowledge unhandled event types immediately
      break;
  }

  return NextResponse.json({ received: true });
}
