import { Resend } from "resend";

// Singleton — instantiated once per cold start
let _client: Resend | null = null;

export function getResendClient(): Resend {
  if (!_client) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY is not set");
    _client = new Resend(apiKey);
  }
  return _client;
}

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "noreply@devpath.ro";
