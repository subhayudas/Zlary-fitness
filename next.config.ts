import type { NextConfig } from "next";

/**
 * Security headers.
 *
 * No full Content-Security-Policy is set here: the site loads GTM / GA / Meta
 * Pixel conditionally at runtime, and a CSP written against tags that may or
 * may not be enabled is the kind that gets switched off the first time
 * something breaks. Once the analytics stack is fixed, add a nonce-based CSP —
 * see the README.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    // Modern formats first; Next negotiates the fallback automatically.
    formats: ["image/avif", "image/webp"],
    // Matches the breakpoints the layout actually uses.
    deviceSizes: [640, 768, 1024, 1280, 1536, 1920, 2560],
    imageSizes: [200, 256, 320, 384, 512],
    // Every `quality` passed to <Image> must be listed here or Next 16 refuses
    // it and silently falls back to 75. 82 is the foreground photography,
    // 55 the blurred background plates — see components/ui/MediaFrame.tsx.
    qualities: [55, 75, 82],
    // All photography is served from /public. Add a `remotePatterns` entry
    // here if images ever move to a CDN or a headless CMS.
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  /**
   * The application form used to be a page of its own. It is now a section of
   * the homepage, so /apply is a permanent redirect into that section rather
   * than a route — every ad, email and Instagram link already pointing at it
   * keeps working.
   *
   * Redirects run before `proxy.ts`, so the unprefixed French path is matched
   * here before the locale rewrite ever sees it. `/fr/apply` is listed because
   * that internal form is reachable directly if someone types it.
   *
   * Query strings are carried over by Next and re-attached ahead of the
   * fragment (`/apply?source=vsl` → `/?source=vsl#postuler`), which is what the
   * form's attribution capture reads.
   */
  async redirects() {
    return [
      { source: "/apply", destination: "/#postuler", permanent: true },
      { source: "/fr/apply", destination: "/#postuler", permanent: true },
      { source: "/en/apply", destination: "/en#postuler", permanent: true },
    ];
  },
};

export default nextConfig;
