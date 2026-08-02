import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.brand} — Coaching fitness et nutrition en ligne`,
    short_name: site.brand,
    description: site.positioning,
    start_url: "/",
    display: "standalone",
    background_color: "#E7E9E1",
    theme_color: "#E7E9E1",
    lang: site.locale,
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
