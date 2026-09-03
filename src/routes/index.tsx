import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  CalendarCheck,
  ClipboardList,
  GraduationCap,
  LineChart,
  MapPin,
  Star,
  UploadCloud,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import heroImage from "@/assets/hero-learners.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hamonate LMS — Learning Management for Facilitators & Trainees" },
      {
        name: "description",
        content:
          "Hamonate LMS brings courses, lessons, modules, attendance and task submissions together for management, facilitators and trainees.",
      },
      { property: "og:title", content: "Hamonate LMS — Learning Management System" },
      {
        property: "og:description",
        content:
          "Courses, lessons, modules, attendance and GitHub task submissions in one learning platform.",
      },
    ],
  }),
  component: Index,
});

const highlights = [
  {
    icon: BookOpen,
    title: "Structured courses",
    body: "Courses hold lessons, lessons hold modules — with video, text or documents per module.",
  },
  {
    icon: LineChart,
    title: "Progress tracking",
    body: "Completed modules roll up into lesson and course progress for every trainee.",
  },
  {
    icon: CalendarCheck,
    title: "Attendance registers",
    body: "Facilitators create meetings with topics and mark who attended.",
  },
  {
    icon: UploadCloud,
    title: "Task submissions",
    body: "Trainees submit GitHub links per lesson; management reviews them per trainee.",
  },
  {
    icon: Users,
    title: "Three roles",
    body: "Management, facilitators and trainees each get a dedicated experience.",
  },
  {
    icon: ClipboardList,
    title: "Outstanding task alerts",
    body: "Trainees see exactly what is unsubmitted and when it is due.",
  },
];

const steps = [
  {
    step: "01",
    title: "Get registered",
    body: "Facilitators register their trainees by email. Management and facilitators sign up directly.",
  },
  {
    step: "02",
    title: "Verify & sign in",
    body: "On first login a trainee verifies the email their facilitator captured, then sets up their profile.",
  },
  {
    step: "03",
    title: "Learn & submit",
    body: "Work through modules, mark them complete and submit your task link per lesson.",
  },
];

const ratings = [
  { label: "Trainee satisfaction", value: "4.8/5" },
  { label: "Course completion", value: "92%" },
  { label: "Active trainees", value: "1 200+" },
  { label: "Partner facilitators", value: "45" },
];

function Index() {
  return (
    <div>
      {/* Hero */}
      <section className="surface-hero relative overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2">
          <div className="text-primary-foreground">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-medium">
              <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
              Learning Management System
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl">
              Everything your training programme needs, in one place.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-primary-foreground/80">
              Hamonate LMS is where management publishes courses, facilitators run attendance and
              review work, and trainees learn module by module — tracking progress and submitting
              tasks as they go.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to="/vacancies">View available vacancies</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link to="/about">Explore the platform</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link to="/location">Visit our campus</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <img
              src={heroImage}
              alt="Trainees collaborating on laptops during a Hamonate LMS training session"
              width={1600}
              height={1000}
              className="shadow-lift w-full rounded-2xl object-cover"
            />
          </div>
        </div>
      </section>

      {/* Ratings */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4">
          {ratings.map((r) => (
            <div key={r.label}>
              <p className="font-display text-3xl font-bold text-primary">{r.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{r.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What the system is about */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold sm:text-4xl">What is Hamonate LMS?</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Hamonate LMS digitises the full training cycle. Management builds the curriculum — courses
            with start and end dates, lessons, modules and optional tasks. Facilitators register
            their trainees, create meetings, capture attendance and review submissions. Trainees
            follow the content in markdown, complete modules to advance their progress, and submit
            their GitHub links per lesson before the deadline.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((h) => (
            <Card key={h.title} className="shadow-soft border-border/70">
              <CardContent className="p-6">
                <span className="surface-accent flex h-10 w-10 items-center justify-center rounded-xl text-accent-foreground">
                  <h.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{h.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{h.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Instructions */}
      <section className="bg-secondary/50">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <h2 className="text-3xl font-bold sm:text-4xl">How to get going</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.step} className="rounded-2xl border border-border bg-card p-6">
                <span className="font-display text-sm font-bold text-accent">{s.step}</span>
                <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews + location teaser */}
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-3">
        {[
          {
            quote:
              "Attendance registers and submission tracking used to live in spreadsheets. Now it is one screen.",
            name: "Naledi M.",
            role: "Facilitator",
          },
          {
            quote:
              "I can see exactly which modules are left and what tasks are still outstanding.",
            name: "Sipho D.",
            role: "Trainee",
          },
          {
            quote: "Per-trainee performance views make our monthly reporting effortless.",
            name: "Ayanda K.",
            role: "Programme Management",
          },
        ].map((t) => (
          <Card key={t.name} className="shadow-soft border-border/70">
            <CardContent className="p-6">
              <div className="flex gap-1 text-accent" aria-label="Rated 5 out of 5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" aria-hidden="true" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed">“{t.quote}”</p>
              <p className="mt-4 text-sm font-semibold">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Location strip */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <MapPin className="mt-1 h-5 w-5 text-accent" aria-hidden="true" />
            <div>
              <h2 className="text-xl font-semibold">Find us in Johannesburg</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                26 Sivewright Ave, Doornfontein, Johannesburg, 2094
              </p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link to="/location">See directions</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
