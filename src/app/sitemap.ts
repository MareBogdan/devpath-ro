import { MetadataRoute } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const BASE_URL = "https://devpath.ro";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createSupabaseAdminClient();

  // ── Static routes ──────────────────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/courses`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // ── Dynamic /u/[username] — public portfolio pages ─────────────────────────
  const { data: users } = await supabase
    .from("users")
    .select("email, name, updated_at")
    .not("name", "is", null);

  const portfolioRoutes: MetadataRoute.Sitemap = (users ?? []).map((u) => {
    const username = (u.name as string)
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    return {
      url: `${BASE_URL}/u/${username}`,
      lastModified: new Date(u.updated_at ?? Date.now()),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    };
  });

  // ── Dynamic /verify/[code] — certificates ─────────────────────────────────
  let certificateRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data: certs } = await supabase
      .from("certificates")
      .select("code, issued_at");
    certificateRoutes = (certs ?? []).map((c) => ({
      url: `${BASE_URL}/verify/${c.code}`,
      lastModified: new Date(c.issued_at ?? Date.now()),
      changeFrequency: "never" as const,
      priority: 0.4,
    }));
  } catch {
    // certificates table not yet created — skip gracefully
  }

  return [...staticRoutes, ...portfolioRoutes, ...certificateRoutes];
}
