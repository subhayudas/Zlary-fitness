import { redirect } from "next/navigation";
import { applyHref } from "@/content/navigation";
import { resolveLocale } from "@/lib/route-locale";

/**
 * `/book` — kept only to land somewhere sensible.
 *
 * There is no separate booking page any more. Picking a time is step 6 of the
 * flow on the homepage, between the questions and the contact details, so a
 * second calendar living at its own URL would be a way to book a call without
 * ever answering the questions the call is prepared from.
 *
 * The route survives because it is printed in older confirmation emails and
 * still sits in the footer, and a dead link is worse than a redirect.
 */
export default async function BookPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  redirect(applyHref(locale, "book"));
}
