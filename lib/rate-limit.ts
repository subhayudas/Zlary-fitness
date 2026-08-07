import { createHash } from "node:crypto";

/**
 * Minimal in-memory sliding-window rate limiter.
 *
 * SCOPE / LIMITATIONS - read before relying on this.
 * On Vercel each serverless instance keeps its own map, so the effective limit
 * is per-instance rather than global. That is deliberate: for a coaching
 * application form this is enough to stop naive scripted abuse, and it costs
 * nothing. If the form ever becomes a real target, swap the `hit()` body for
 * Upstash Redis or Vercel KV - the call site does not need to change.
 *
 * IPs are hashed before being used as a key so no raw address is retained.
 */

type Bucket = { timestamps: number[] };

const buckets = new Map<string, Bucket>();

/** Hard cap on tracked keys - prevents an unbounded map under a flood. */
const MAX_KEYS = 5_000;

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  /** Seconds until the caller may retry. Only meaningful when blocked. */
  retryAfter: number;
};

export function hashKey(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;

  if (buckets.size > MAX_KEYS) {
    // Cheap eviction: drop everything and start over rather than grow forever.
    buckets.clear();
  }

  const bucket = buckets.get(key) ?? { timestamps: [] };
  const recent = bucket.timestamps.filter((t) => t > cutoff);

  if (recent.length >= limit) {
    const oldest = recent[0];
    buckets.set(key, { timestamps: recent });
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
    };
  }

  recent.push(now);
  buckets.set(key, { timestamps: recent });

  return { allowed: true, remaining: limit - recent.length, retryAfter: 0 };
}

/**
 * Best-effort client IP. Vercel sets `x-forwarded-for`; we take the left-most
 * entry, which is the original client.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}
