import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const url = await siteUrl();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: `${url}/sitemap.xml`,
    host: url,
  };
}
