/**
 * Canonical public origin of the app (no trailing slash). Single source of truth for
 * metadata, sitemap/robots and links baked into artefacts (certificate QR codes).
 *
 * Set NEXT_PUBLIC_SITE_URL in the deployment (e.g. https://devpath.ro once that domain
 * points here); the fallback is the Vercel production URL so a missing variable never
 * leaks a domain the app isn't served from.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://devpath-ro.vercel.app"
).replace(/\/+$/, "");
