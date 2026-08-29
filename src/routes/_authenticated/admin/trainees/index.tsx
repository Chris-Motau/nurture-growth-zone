import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { fetchTraineeOverview, traineeName } from "@/lib/admin-queries";
import { performanceGrade } from "@/lib/admin-static";

export const Route = createFileRoute("/_authenticated/admin/trainees/")({
  head: () => ({
    meta: [
      { title: "Registered trainees — Hamonate LMS admin" },
      {
        name: "description",
        content:
          "View every trainee registered on Hamonate LMS with attendance, submission and performance status.",
      },
      { property: "og:title", content: "Registered trainees — Hamonate LMS admin" },
      {
        property: "og:description",
        content: "Attendance, submissions and performance per trainee.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TraineesPage,
});

function TraineesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-trainees"],
    queryFn: fetchTraineeOverview,
  });

  return (
    <main>
      <h1 className="flex items-center gap-2 font-display text-3xl font-bold tracking-tight">
        <Users className="h-7 w-7 text-accent" aria-hidden="true" />
        Registered trainees
      </h1>
      <p className="mt-2 text-muted-foreground">
        Select a trainee to view their attendance, submissions and overall performance.
      </p>

      {isLoading ? (
        <p className="mt-8 text-muted-foreground">Loading trainees…</p>
      ) : (data?.length ?? 0) === 0 ? (
        <p className="mt-8 text-muted-foreground">No trainees have registered yet.</p>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {data!.map((row) => {
            const grade = performanceGrade(row.performance);
            return (
              <Link
                key={row.trainee.id}
                to="/admin/trainees/$traineeId"
                params={{ traineeId: row.trainee.id }}
              >
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg">{traineeName(row.trainee)}</CardTitle>
                        <CardDescription>{row.trainee.email}</CardDescription>
                      </div>
                      <Badge variant="secondary">{row.attendance.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Module progress</span>
                        <span>
                          {row.completed}/{row.totalModules}
                        </span>
                      </div>
                      <Progress className="mt-1.5" value={row.progressRate} />
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-muted-foreground">
                      <span>
                        Attendance{" "}
                        <strong className="text-foreground">{row.attendance.rate}%</strong>
                      </span>
                      <span>
                        Submissions{" "}
                        <strong className="text-foreground">
                          {row.submitted}/{row.totalTasks}
                        </strong>
                      </span>
                      <span>
                        Performance{" "}
                        <strong className={grade.tone}>
                          {row.performance}% · {grade.label}
                        </strong>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
