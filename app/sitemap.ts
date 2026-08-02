import type { MetadataRoute } from "next";
import { routeSeo } from "@/content/seo";
import { absoluteUrl } from "@/content/site";
import { localeMeta, localePath, locales } from "@/lib/i18n";

/**
 * Sitemap.
 *
 * Only indexable routes are listed: /book and /thank-you are funnel steps and
 * are explicitly `noindex`, so including them would contradict their own
 * robots meta tag.
 *
 * Each route appears once per language, and every entry carries the full
 * `alternates.languages` set. That is what tells Google the two URLs are
 * translations of one page rather than duplicates competing with each other —
 * and it has to be reciprocal, which is why both entries list both languages.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const indexable = Object.values(routeSeo).filter(
    (route) => !("noindex" in route && route.noindex),
  );

  return indexable.flatMap((route) => {
    const languages = Object.fromEntries(
      locales.map((locale) => [
        localeMeta[locale].hreflang,
        absoluteUrl(localePath(route.path, locale)),
      ]),
    );

    return locales.map((locale) => ({
      url: absoluteUrl(localePath(route.path, locale)),
      lastModified,
      changeFrequency:
        "changeFrequency" in route ? route.changeFrequency : "monthly",
      priority: "priority" in route ? route.priority : 0.5,
      alternates: { languages },
    }));
  });
}
