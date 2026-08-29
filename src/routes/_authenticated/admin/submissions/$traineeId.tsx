import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchTrainees, traineeName } from "@/lib/admin-queries";
import { supabase } from "@/integrations/supabase/client";
export const Route = createFileRoute("/_authenticated/admin/submissions/$traineeId")({
  component: SubmissionDetail,
});
function SubmissionDetail() {
  const { traineeId } = Route.useParams();
  const { data } = useQuery({
    queryKey: ["admin-submissions", traineeId],
    queryFn: async () => {
      const [trainees, { data: submissions }] = await Promise.all([
        fetchTrainees(),
        supabase
          .from("task_submissions")
          .select("submission_url, submitted_at, tasks(topic, lessons(topic))")
          .eq("user_id", traineeId)
          .order("submitted_at", { ascending: false }),
      ]);
      return {
        trainee: trainees.find((item) => item.id === traineeId),
        submissions: submissions ?? [],
      };
    },
  });
  return (
    <main>
      <Link to="/admin/submissions" className="text-sm font-medium text-primary">
        ← All submissions
      </Link>
      <h1 className="mt-5 font-display text-3xl font-bold">
        {data?.trainee ? traineeName(data.trainee) : "Trainee"}
      </h1>
      <div className="mt-7 space-y-3">
        {data?.submissions.map((submission, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{submission.tasks.topic}</CardTitle>
              <p className="text-sm text-muted-foreground">{submission.tasks.lessons.topic}</p>
            </CardHeader>
            <CardContent>
              <a
                href={submission.submission_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary underline"
              >
                Open GitHub submission <ExternalLink className="h-4 w-4" />
              </a>
            </CardContent>
          </Card>
        ))}
        {data && data.submissions.length === 0 && (
          <p className="text-muted-foreground">No submissions yet.</p>
        )}
      </div>
    </main>
  );
}
