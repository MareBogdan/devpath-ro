import { NextResponse } from "next/server";

/**
 * MVP scope: payments (Stripe), email (Resend), cron jobs, web push and text AI
 * (Anthropic) ship DISABLED unless their keys are configured. These helpers let each
 * route degrade to a clean, explicit response instead of crashing at import time or
 * throwing mid-request.
 */

export type OptionalFeature = "payments" | "email" | "cron" | "push" | "ai";

/** 503 with a stable JSON shape: `{ ok:false, disabled:true, feature, error }`. */
export function disabledResponse(feature: OptionalFeature, message: string) {
  return NextResponse.json(
    { ok: false, disabled: true, feature, error: message },
    { status: 503 }
  );
}

export const isCronConfigured = () => Boolean(process.env.CRON_SECRET);

export const isVapidConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);

/** True when the request carries `Authorization: Bearer $CRON_SECRET`. */
export function hasValidCronSecret(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}
