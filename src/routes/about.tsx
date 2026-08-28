import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About us — Hamonate LMS" },
      {
        name: "description",
        content:
          "Who we are: Hamonate LMS supports training programmes with structured courses, attendance and submission tracking for management, facilitators and trainees.",
      },
      { property: "og:title", content: "About Hamonate LMS" },
      {
        property: "og:description",
        content: "How Hamonate LMS supports management, facilitators and trainees.",
      },
    ],
  }),
  component: AboutPage,
});

const roles = [
  {
    title: "Management",
    body: "Builds courses, lessons and modules, sets dates and tasks, and reviews trainee performance, attendance and submissions.",
  },
  {
    title: "Facilitators",
    body: "Register trainees by email, create meetings, capture attendance registers and follow up on outstanding work.",
  },
  {
    title: "Trainees",
    body: "Work through markdown lessons and modules, track progress, and submit GitHub task links per lesson.",
  },
];

function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 md:py-20">
      <h1 className="text-4xl font-bold">About Hamonate LMS</h1>
      <p className="mt-5 text-base leading-relaxed text-muted-foreground">
        Hamonate LMS was built for skills-development programmes that need more than a folder of
        slides. It connects the people running a programme with the people learning in it: one
        curriculum, one attendance record, one place for every submission.
      </p>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        Content is organised as courses, which contain lessons, which contain modules. A module can
        be a video, written content or an uploaded document, and every completed module moves the
        trainee's progress forward. Lessons may carry a task with a due date, submitted as a GitHub
        link.
      </p>

      <h2 className="mt-12 text-2xl font-bold">Who uses it</h2>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {roles.map((r) => (
          <Card key={r.title} className="shadow-soft border-border/70">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="mt-12 text-2xl font-bold">Getting access</h2>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
        <li>Facilitators and management create an account with name, surname, email and password.</li>
        <li>Facilitators add their trainees using the trainees' email addresses.</li>
        <li>
          On first sign-in a trainee verifies that same email address, then completes their profile
          — a profile picture is optional.
        </li>
        <li>Everyone signs in afterwards with email and password.</li>
      </ol>
    </div>
  );
}
