import { type NextRequest, NextResponse } from "next/server";

/**
 * GET /join?ref=CODE
 * Sets a httpOnly referral cookie and redirects to /register.
 * The cookie is read by signUpWithEmail() in (auth)/actions.ts.
 */
export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get("ref");
  const response = NextResponse.redirect(new URL("/register", request.url));

  if (ref && ref.length > 0 && ref.length <= 64) {
    response.cookies.set("devpath_ref", ref, {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  }

  return response;
}
