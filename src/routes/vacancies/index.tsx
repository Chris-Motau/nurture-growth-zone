import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Briefcase, CalendarDays, Clock, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/vacancies/")({
  head: () => ({
    meta: [
      { title: "Available Vacancies — Hamonate LMS" },
      {
        name: "description",
        content:
          "Browse open Work Integrated Learning, Internship and Learnership vacancies at Hamonate and apply online.",
      },
      { property: "og:title", content: "Available Vacancies — Hamonate LMS" },
      {
        property: "og:description",
        content:
          "Open Work Integrated Learning, Internship and Learnership opportunities at Hamonate.",
      },
    ],
  }),
  component: VacanciesPage,
});

export const PROGRAMS = [
  {
    value: "work_integrated_learning" as const,
    label: "Work Integrated Learning",
    blurb: "Workplace hours for students completing a qualification.",
  },
  {
    value: "internship" as const,
    label: "Internship",
    blurb: "Fixed-term workplace experience for graduates.",
  },
  {
    value: "learnership" as const,
    label: "Learnership",
    blurb: "Accredited theory plus practical workplace learning.",
  },
];

function formatDate(value: string | null) {
  if (!value) return "Open until filled";
  return `Closes ${new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium" }).format(new Date(value))}`;
}

function VacanciesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["vacancies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vacancies")
        .select("*")
        .eq("is_open", true)
        .order("closing_date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6">
      <p className="text-sm font-semibold text-primary">Opportunities</p>
      <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">Available vacancies</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Vacancies are grouped by programme. Select a programme listing to complete the online
        application and upload your supporting documents.
      </p>

      {isLoading ? (
        <p className="mt-10 text-sm text-muted-foreground">Loading vacancies…</p>
      ) : (
        <div className="mt-10 space-y-12">
          {PROGRAMS.map((program) => {
            const items = (data ?? []).filter((v) => v.program === program.value);
            return (
              <section key={program.value} aria-labelledby={`program-${program.value}`}>
                <div className="flex items-start gap-3">
                  <span className="surface-accent flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-accent-foreground">
                    <Briefcase className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 id={`program-${program.value}`} className="text-xl font-semibold">
                      {program.label}
                    </h2>
                    <p className="text-sm text-muted-foreground">{program.blurb}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No open vacancies in this programme right now.
                    </p>
                  ) : (
                    items.map((vacancy) => (
                      <Card key={vacancy.id} className="shadow-soft border-border/70">
                        <CardContent className="flex h-full flex-col p-6">
                          <h3 className="text-lg font-semibold">{vacancy.title}</h3>
                          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                            {vacancy.description}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            {vacancy.duration ? (
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                                {vacancy.duration}
                              </span>
                            ) : null}
                            {vacancy.location ? (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                                {vacancy.location}
                              </span>
                            ) : null}
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                              {formatDate(vacancy.closing_date)}
                            </span>
                          </div>
                          <Button asChild className="mt-5 w-full sm:w-auto">
                            <Link
                              to="/vacancies/$vacancyId/apply"
                              params={{ vacancyId: vacancy.id }}
                            >
                              Apply now
                              <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
