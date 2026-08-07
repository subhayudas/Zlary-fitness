import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";

/**
 * Narrows a route's `params.locale` from `string` to `Locale`.
 *
 * Every page under `app/[locale]/` receives the segment as an unvalidated
 * string. The layout already rejects unknown values, but each page still has to
 * narrow the type before it can index a dictionary - doing that here keeps the
 * `notFound()` in one place instead of nine.
 */
export async function resolveLocale(
  params: Promise<{ locale: string }>,
): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}
