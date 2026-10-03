import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Only same-site paths: "/dashboard" is fine, "//evil.com" or "@evil.com" are not
// (`${origin}${next}` would otherwise be redirected to another host).
function safeNextPath(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\")) {
    return next;
  }
  return "/dashboard";
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  // The provider reports a denied / failed sign-in with ?error=… and no code.
  if (searchParams.get("error")) {
    return NextResponse.redirect(`${origin}/login?error=oauth_denied`);
  }

  if (code) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to login with an error if code exchange failed
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
