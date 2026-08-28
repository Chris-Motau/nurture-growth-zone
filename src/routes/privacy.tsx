import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Hamonate LMS" },
      {
        name: "description",
        content:
          "How Hamonate LMS collects, uses, stores and protects personal information of trainees, facilitators and management.",
      },
      { property: "og:title", content: "Privacy Policy — Hamonate LMS" },
      {
        property: "og:description",
        content: "Our approach to personal information, data storage and your rights.",
      },
    ],
  }),
  component: PrivacyPage,
});

const sections = [
  {
    title: "1. Information we collect",
    body: "Your name, surname, email address, optional profile picture, and the learning activity you generate on the platform — module completions, attendance records and task submission links.",
  },
  {
    title: "2. How we use it",
    body: "To create and secure your account, to show your progress, to record attendance, and to let facilitators and management review submissions and performance for the programme you are enrolled in.",
  },
  {
    title: "3. Sharing",
    body: "Your learning records are visible to the facilitators and management responsible for your programme. We do not sell personal information or share it with advertisers.",
  },
  {
    title: "4. Storage and security",
    body: "Data is stored with our authentication and database provider using encryption in transit. Passwords are never stored in readable form. Access is limited to authorised staff.",
  },
  {
    title: "5. Your rights",
    body: "You may view and edit your registration information from your profile at any time, and request correction or deletion of your account by contacting us.",
  },
  {
    title: "6. Contact",
    body: "Questions about this policy can be sent to hello@hamonatelms.co.za.",
  },
];

function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 md:py-20">
      <h1 className="text-4xl font-bold">Privacy Policy</h1>
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
