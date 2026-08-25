import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Kaelo LMS" },
      {
        name: "description",
        content:
          "The terms governing use of Kaelo LMS accounts, course content, submissions and acceptable conduct.",
      },
      { property: "og:title", content: "Terms & Conditions — Kaelo LMS" },
      {
        property: "og:description",
        content: "Account rules, content ownership and acceptable use of Kaelo LMS.",
      },
    ],
  }),
  component: TermsPage,
});

const sections = [
  {
    title: "1. Accounts",
    body: "Accounts are personal. You are responsible for keeping your password confidential and for all activity under your account. Trainee accounts are created against the email address supplied by a facilitator and must be verified on first sign-in.",
  },
  {
    title: "2. Acceptable use",
    body: "Do not share course material outside your programme, submit work that is not your own, or attempt to access records belonging to other users.",
  },
  {
    title: "3. Course content",
    body: "Courses, lessons, modules and tasks remain the intellectual property of Kaelo LMS and its partner facilitators, and are licensed to you for the duration of your programme.",
  },
  {
    title: "4. Submissions",
    body: "Task submission links you provide may be reviewed by facilitators and management for assessment and reporting purposes. Late or missing submissions are recorded as outstanding.",
  },
  {
    title: "5. Availability",
    body: "We aim for continuous availability but may suspend the service for maintenance or updates without prior notice.",
  },
  {
    title: "6. Changes",
    body: "These terms may be updated. Continued use of the platform after an update means you accept the revised terms.",
  },
];

function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 md:py-20">
      <h1 className="text-4xl font-bold">Terms &amp; Conditions</h1>
      <p className="mt-3 text-sm text-muted-foreground">Last updated: 25 August 2026</p>
      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="text-xl font-semibold">{s.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
