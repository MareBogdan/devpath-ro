/**
 * Maps raw Supabase Auth error text (English, sometimes technical) to a short,
 * user-safe Romanian message. Unknown errors get a generic message — the raw text
 * is never shown to the learner.
 */
export function mapAuthError(message: string | null | undefined): string {
  const m = (message ?? "").toLowerCase();

  if (m.includes("invalid login credentials")) return "Email sau parolă incorecte.";
  if (m.includes("email not confirmed"))
    return "Emailul nu a fost confirmat încă. Verifică-ți inboxul.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Există deja un cont cu acest email. Încearcă să te conectezi.";
  if (m.includes("rate limit") || m.includes("too many") || m.includes("security purposes"))
    return "Prea multe încercări. Așteaptă câteva minute și încearcă din nou.";
  if (m.includes("password") && (m.includes("at least") || m.includes("short") || m.includes("weak")))
    return "Parola este prea scurtă sau prea slabă. Folosește cel puțin 6 caractere.";
  if (m.includes("email") && m.includes("invalid"))
    return "Adresa de email nu este validă.";
  if (m.includes("signups not allowed") || m.includes("signup is disabled"))
    return "Înregistrarea este dezactivată momentan.";
  if (m.includes("provider is not enabled") || m.includes("unsupported provider"))
    return "Această metodă de autentificare nu este disponibilă momentan.";

  return "A apărut o eroare. Încearcă din nou.";
}

/** Error codes the OAuth callback puts in `/login?error=…`. */
const CALLBACK_ERRORS: Record<string, string> = {
  auth_callback_error: "Autentificarea nu a reușit. Încearcă din nou.",
  oauth_denied: "Ai anulat autentificarea.",
};

export function messageForCallbackError(code: string | null | undefined): string | null {
  if (!code) return null;
  return CALLBACK_ERRORS[code] ?? "Autentificarea nu a reușit. Încearcă din nou.";
}
