/**
 * Booking copy — English.
 *
 * `reviewNotice` is load-bearing: an application is not an acceptance, and the
 * English wording has to stay as careful about that as the French does.
 */

export const bookingContent = {
  eyebrow: "STEP 2 OF 2",
  heading: "Book your transformation call.",
  body: "Pick the time that works for you to talk through your goals, where you are now and how the coaching could help.",
  openCalendarLabel: "Open the calendar",
  reviewNotice:
    "Your application has been recorded. Zach reads it before the call — booking a slot does not constitute acceptance into the program.",
  callDetails: {
    heading: "What happens on the call",
    items: [
      {
        index: "01",
        title: "Where you are now",
        body: "Your starting point, your experience and what you've already tried.",
      },
      {
        index: "02",
        title: "Your goal and your schedule",
        body: "What you want to achieve, and the time you actually have.",
      },
      {
        index: "03",
        title: "The obstacles",
        body: "What derailed your previous attempts, so we avoid repeating them.",
      },
      {
        index: "04",
        title: "What comes next",
        body: "If the coaching fits your situation, Zach explains how it would work. If it doesn't, he'll say so plainly.",
      },
    ],
  },
  prepare: {
    heading: "Before the call",
    items: [
      "Find a quiet place where you can speak freely.",
      "Have a sense of how many sessions realistically fit your week.",
      "Write down the questions you want to ask.",
    ],
  },
  fallback: {
    heading: "The calendar isn't connected yet",
    body: "The booking link hasn't been configured. In the meantime, message Zach on Instagram to arrange a time — your application is already on file.",
    adminHint:
      "Administrator: add NEXT_PUBLIC_BOOKING_URL to the environment variables (Vercel → Settings → Environment Variables), then redeploy.",
  },
};
