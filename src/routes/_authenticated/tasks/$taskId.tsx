import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MarkdownContent } from "@/components/LearningContent";

export const Route = createFileRoute("/_authenticated/tasks/$taskId")({ component: TaskPage });
function TaskPage() {
  const { taskId } = Route.useParams();
  const client = useQueryClient();
  const [url, setUrl] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      const [{ data: task, error }, { data: submission }] = await Promise.all([
        supabase.from("tasks").select("*, lessons(course_id, topic)").eq("id", taskId).single(),
        user.user
          ? supabase
              .from("task_submissions")
              .select("*")
              .eq("task_id", taskId)
              .eq("user_id", user.user.id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      if (error) throw error;
      return { task, submission };
    },
  });
  const submit = useMutation({
    mutationFn: async () => {
      const parsed = new URL(url);
      if (!/github\.com$/i.test(parsed.hostname) && !/www\.github\.com$/i.test(parsed.hostname))
        throw new Error("Please enter a GitHub URL.");
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Please sign in again.");
      const { error } = await supabase
        .from("task_submissions")
        .upsert(
          { task_id: taskId, user_id: user.user.id, submission_url: url },
          { onConflict: "user_id,task_id" },
        );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("GitHub link submitted");
      void client.invalidateQueries({ queryKey: ["task", taskId] });
      void client.invalidateQueries({ queryKey: ["outstanding-tasks"] });
    },
    onError: (error) => toast.error(error.message),
  });
  if (isLoading)
    return <div className="mx-auto max-w-3xl px-4 py-12 text-muted-foreground">Loading task…</div>;
  if (!data) return null;
  const due = data.task.due_date
    ? new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium" }).format(new Date(data.task.due_date))
    : "No due date";
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        to="/courses/$courseId/lessons/$lessonId"
        params={{ courseId: data.task.lessons.course_id, lessonId: data.task.lesson_id }}
        className="text-sm font-medium text-primary"
      >
        ← Back to lesson
      </Link>
      <p className="mt-6 text-sm font-semibold text-accent">Due {due}</p>
      <h1 className="mt-1 font-display text-3xl font-bold">{data.task.topic}</h1>
      <Card className="mt-7">
        <CardContent className="pt-6">
          <MarkdownContent content={data.task.instructions_md} />
        </CardContent>
      </Card>
      <section className="mt-7 rounded-xl border bg-card p-5">
        <h2 className="font-display text-xl font-bold">Submit your work</h2>
        {data.submission ? (
          <p className="mt-3 text-sm">
            Submitted:{" "}
            <a
              className="inline-flex items-center gap-1 text-primary underline"
              href={data.submission.submission_url}
              target="_blank"
              rel="noreferrer"
            >
              {data.submission.submission_url}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              Paste your GitHub repository or fork link.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://github.com/your-name/project"
                type="url"
              />
              <Button disabled={submit.isPending || !url} onClick={() => submit.mutate()}>
                Submit link
              </Button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
