import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { GitBranch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchTrainees, traineeName } from "@/lib/admin-queries";
import { supabase } from "@/integrations/supabase/client";
export const Route = createFileRoute("/_authenticated/admin/submissions/")({
  component: SubmissionsPage,
});
function SubmissionsPage() {
  const { data } = useQuery({
    queryKey: ["admin-submission-list"],
    queryFn: async () => {
      const [trainees, { data: submissions }] = await Promise.all([
        fetchTrainees(),
        supabase.from("task_submissions").select("user_id"),
      ]);
      const counts = new Map<string, number>();
      (submissions ?? []).forEach((item) =>
        counts.set(item.user_id, (counts.get(item.user_id) ?? 0) + 1),
      );
      return trainees.map((trainee) => ({ trainee, count: counts.get(trainee.id) ?? 0 }));
    },
  });
  return (
    <main>
      <h1 className="flex items-center gap-2 font-display text-3xl font-bold">
        <GitBranch className="h-7 w-7 text-accent" />
        Submissions
      </h1>
      <p className="mt-2 text-muted-foreground">GitHub work submitted by each trainee.</p>
      <div className="mt-7 grid gap-3 md:grid-cols-2">
        {data?.map(({ trainee, count }) => (
          <Link
            key={trainee.id}
            to="/admin/submissions/$traineeId"
            params={{ traineeId: trainee.id }}
          >
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg">{traineeName(trainee)}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">{trainee.email}</p>
                </div>
                <span className="font-display text-2xl font-bold text-primary">{count}</span>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
