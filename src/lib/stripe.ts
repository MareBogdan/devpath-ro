import Stripe from "stripe";

// Lazy + optional: payments ship disabled for the MVP. Nothing may run at import time
// that needs STRIPE_SECRET_KEY — routes call getStripe() and answer with a clean
// "disabled" response when it returns null.
let client: Stripe | null | undefined;

export function getStripe(): Stripe | null {
  if (client === undefined) {
    const key = process.env.STRIPE_SECRET_KEY;
    client = key ? new Stripe(key, { apiVersion: "2024-06-20" }) : null;
  }
  return client;
}
