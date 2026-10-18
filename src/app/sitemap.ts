import type { MetadataRoute } from "next";
import { PUBLIC_STATUSES } from "@/lib/constants";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/site-url";
import { VISIBLE_SERVICES, serviceHref } from "@/content/services";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const vehicles = await db.vehicle.findMany({
    where: { status: { in: PUBLIC_STATUSES } },
    select: { slug: true, updatedAt: true },
    orderBy: { createdAt: "desc" },
  });
  const base = await siteUrl();
  const now = new Date();
  const pages = ["", "/inventory", "/services", ...VISIBLE_SERVICES.map(serviceHref), "/contact", "/privacy"].map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: (p === "" || p === "/inventory" ? "daily" : "monthly") as "daily" | "monthly",
    priority: p === "" ? 1 : p === "/inventory" ? 0.9 : p.startsWith("/services") ? 0.8 : 0.6,
  }));
  return [
    ...pages,
    ...vehicles.map((v) => ({
      url: `${base}/inventory/${v.slug}`,
      lastModified: v.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
