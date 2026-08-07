import type { MetadataRoute } from "next";
import { routeSeo } from "@/content/seo";
import { absoluteUrl } from "@/content/site";
import { localePath, locales } from "@/lib/i18n";

/**
 * robots.txt
 *
 * The API route and the two funnel steps are disallowed - they hold no content
 * worth indexing, and /book and /thank-you should never appear as an entry
 * point from search.
 *
 * The funnel paths are derived from the same `noindex` flags the pages set on
 * themselves, and expanded across every locale: hard-coding `/book` alone would
 * have left `/en/book` crawlable the moment English shipped.
 */
export default function robots(): MetadataRoute.Robots {
  const noindexPaths = Object.values(routeSeo)
    .filter((route) => "noindex" in route && route.noindex)
    .flatMap((route) => locales.map((locale) => localePath(route.path, locale)));

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", ...noindexPaths],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
