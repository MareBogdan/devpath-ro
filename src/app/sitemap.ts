import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Public, non-personal pages only. Deliberately NOT listed: /u/[handle] portfolios
 * (users never opted into being indexed, and a name-slug list leaks every account's
 * name) and /verify/[code] certificates (the code is the secret that gates the page).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/courses`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}
