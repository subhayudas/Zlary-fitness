import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getHome } from "@/content/home";
import { getNav } from "@/content/navigation";
import { site } from "@/content/site";
import { isLocale, defaultLocale, locales } from "@/lib/i18n";

/**
 * Default social share image, generated at build time - one per language.
 *
 * Typography leads and the photograph supports it: feeds render this card at
 * thumbnail size, where a full-bleed photo turns to mush and the headline is
 * the only thing that survives. The portrait occupies the right third, which
 * is enough to read as a person at 300px wide without displacing the copy.
 *
 * The photograph is inlined as a data URI because Satori cannot fetch relative
 * URLs - there is no origin at build time. It is read from /assets rather than
 * /public so the build is the only thing that ever loads it.
 */

export const alt = site.brand;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;

  const { hero } = getHome(locale);
  const { navCta } = getNav(locale);

  const photo = await readFile(join(process.cwd(), "assets/og-portrait.jpg"));
  const photoSrc = `data:image/jpeg;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#E7E9E1",
          padding: 56,
        }}
      >
        {/* The same double-bezel construction the site uses: canvas enclosure,
            concentric white core. */}
        <div
          style={{
            display: "flex",
            flex: 1,
            background: "#FFFFFF",
            borderRadius: 40,
            padding: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              flex: 1,
              padding: 48,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  display: "flex",
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  background: "#E6FF4D",
                }}
              />
              <div
                style={{
                  fontSize: 20,
                  letterSpacing: 4,
                  textTransform: "uppercase",
                  color: "#5A686E",
                }}
              >
                {hero.eyebrow}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 64,
                lineHeight: 1.05,
                letterSpacing: -2.5,
                color: "#102D3A",
              }}
            >
              {hero.headline}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 32,
                  letterSpacing: -1,
                  color: "#102D3A",
                }}
              >
                {site.wordmark.primary}
                <span style={{ color: "#8D979B", marginLeft: 10 }}>
                  {site.wordmark.secondary}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  background: "#E6FF4D",
                  color: "#092532",
                  borderRadius: 999,
                  padding: "14px 28px",
                  fontSize: 20,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                {navCta.label}
              </div>
            </div>
          </div>

          {/* A raw <img>: Satori renders plain HTML, and next/image has no
              meaning inside an OG card. */}
          <img
            src={photoSrc}
            alt=""
            width={340}
            height={486}
            style={{ borderRadius: 26, objectFit: "cover" }}
          />
        </div>
      </div>
    ),
    size,
  );
}
