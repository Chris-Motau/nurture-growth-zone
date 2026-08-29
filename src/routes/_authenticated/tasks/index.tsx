import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/tasks/")({ component: TasksPage });
function TasksPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["outstanding-tasks"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];
      const [{ data: tasks, error }, { data: submissions }] = await Promise.all([
        supabase.from("tasks").select("*, lessons(topic, course_id)").order("due_date"),
        supabase.from("task_submissions").select("task_id").eq("user_id", user.user.id),
      ]);
      if (error) throw error;
      const completed = new Set((submissions ?? []).map((item) => item.task_id));
      return (tasks ?? []).map((task) => ({ ...task, submitted: completed.has(task.id) }));
    },
  });
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-1 h-6 w-6 text-accent" />
        <div>
          <p className="text-sm font-semibold text-primary">Tasks</p>
          <h1 className="font-display text-3xl font-bold">Outstanding work</h1>
          <p className="mt-2 text-muted-foreground">
            {isLoading
              ? "Loading tasks…"
              : `${data?.filter((task) => !task.submitted).length ?? 0} task(s) still need your submission.`}
          </p>
        </div>
      </div>
      <div className="mt-8 space-y-3">
        {data?.map((task) => (
          <Link key={task.id} to="/tasks/$taskId" params={{ taskId: task.id }}>
            <Card className="transition-colors hover:bg-secondary">
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <span className={task.submitted ? "text-primary" : "text-accent"}>
                  {task.submitted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                </span>
                <div className="flex-1">
                  <CardTitle className="text-lg">{task.topic}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {task.lessons.topic} ·{" "}
                    {task.due_date
                      ? `Due ${new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium" }).format(new Date(task.due_date))}`
                      : "No due date"}
                  </p>
                </div>
                <span className="text-sm font-medium">{task.submitted ? "Submitted" : "Open"}</span>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
