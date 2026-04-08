import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "DevPath RO — Învață IT & AI",
  description:
    "Platformă de învățare IT/AI pentru studenți români. Cursuri interactive, AI Coach personal, și portofoliu automat. Începe gratuit azi.",
  openGraph: {
    title: "DevPath RO — Învață IT & AI",
    description:
      "Platformă de învățare IT/AI pentru studenți români. Cursuri interactive, AI Coach personal, și portofoliu automat. Începe gratuit azi.",
    images: [
      {
        url: "/og?title=Invata%20IT%20%26%20AI%20in%20romana&description=Cursuri%20interactive%2C%20AI%20Coach%20personal%2C%20portofoliu%20automat.",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default async function HomePage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <LandingPage isAuthenticated={!!user} />;
}
