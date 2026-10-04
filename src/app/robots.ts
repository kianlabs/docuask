import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Allow crawlers on public pages; keep authenticated/app areas and API out of
 * the index. Sitemap location is advertised here so engines find it.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/app", "/account", "/admin"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
