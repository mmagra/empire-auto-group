import "server-only";
import { headers } from "next/headers";
import { site } from "@/config/site";

/**
 * The site's public address, taken from the incoming request so it is right on
 * any domain without configuration. Falls back to site.url outside a request.
 */
export async function siteUrl() {
  try {
    const h = await headers();
    const host = (h.get("x-forwarded-host") ?? h.get("host"))?.split(",")[0].trim();
    if (!host) return site.url;
    const local = /^(localhost|127\.|\[::1\])/.test(host);
    const proto = h.get("x-forwarded-proto")?.split(",")[0].trim() || (local ? "http" : "https");
    return `${proto}://${host}`;
  } catch {
    return site.url;
  }
}
