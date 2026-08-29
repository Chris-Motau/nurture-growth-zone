import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, CalendarCheck, GitBranch, Users } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchTraineeOverview } from "@/lib/admin-queries";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Admin overview — Hamonate LMS" },
      {
        name: "description",
        content:
          "Admin overview for Hamonate LMS: trainees, submissions, attendance meetings and course content at a glance.",
      },
      { property: "og:title", content: "Admin overview — Hamonate LMS" },
      { property: "og:description", content: "Manage trainees, attendance and course content." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminOverview,
});

function AdminOverview() {
  const { data } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [overview, meetings, courses] = await Promise.all([
        fetchTraineeOverview(),
        supabase.from("meetings").select("id", { count: "exact", head: true }),
        supabase.from("courses").select("id", { count: "exact", head: true }),
      ]);
      const submissions = overview.reduce((sum, row) => sum + row.submitted, 0);
      const avg = overview.length
        ? Math.round(overview.reduce((s, r) => s + r.performance, 0) / overview.length)
        : 0;
      return {
        trainees: overview.length,
        submissions,
        meetings: meetings.count ?? 0,
        courses: courses.count ?? 0,
        avg,
      };
    },
  });

  const cards = [
    {
      to: "/admin/trainees",
      label: "Registered trainees",
      value: data?.trainees ?? 0,
      icon: Users,
    },
    {
      to: "/admin/submissions",
      label: "Task submissions",
      value: data?.submissions ?? 0,
      icon: GitBranch,
    },
    {
      to: "/admin/attendance",
      label: "Meetings created",
      value: data?.meetings ?? 0,
      icon: CalendarCheck,
    },
    { to: "/admin/content", label: "Courses published", value: data?.courses ?? 0, icon: BookOpen },
  ] as const;

  return (
    <main>
      <h1 className="font-display text-3xl font-bold tracking-tight">Admin workspace</h1>
      <p className="mt-2 text-muted-foreground">
        Track trainees, capture attendance and manage learning content.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.to} to={card.to}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <card.icon className="h-5 w-5 text-accent" aria-hidden="true" />
                <CardDescription>{card.label}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-display text-3xl font-bold">{card.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Cohort performance</CardTitle>
          <CardDescription>
            Average score across attendance, submissions and module progress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-display text-4xl font-bold text-primary">{data?.avg ?? 0}%</p>
        </CardContent>
      </Card>
    </main>
  );
}
