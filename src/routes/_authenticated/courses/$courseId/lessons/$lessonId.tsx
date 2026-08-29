import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ChevronRight, Circle, Clock, ListTodo } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownContent } from "@/components/LearningContent";

export const Route = createFileRoute("/_authenticated/courses/$courseId/lessons/$lessonId")({
  component: LessonPage,
});
function LessonPage() {
  const { courseId, lessonId } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      const [{ data: lesson, error }, { data: modules }, { data: tasks }, { data: completions }] =
        await Promise.all([
          supabase.from("lessons").select("*").eq("id", lessonId).single(),
          supabase.from("modules").select("*").eq("lesson_id", lessonId).order("position"),
          supabase.from("tasks").select("*").eq("lesson_id", lessonId),
          user.user
            ? supabase.from("module_completions").select("module_id").eq("user_id", user.user.id)
            : Promise.resolve({ data: [] }),
        ]);
      if (error) throw error;
      return {
        lesson,
        modules: modules ?? [],
        tasks: tasks ?? [],
        completed: new Set((completions ?? []).map((item) => item.module_id)),
      };
    },
  });
  if (isLoading)
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-muted-foreground">Loading lesson…</div>
    );
  if (!data) return null;
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link
        to="/courses/$courseId"
        params={{ courseId }}
        className="text-sm font-medium text-primary"
      >
        ← Back to course
      </Link>
      <div className="mt-5">
        <p className="text-sm font-semibold text-primary">
          Lesson {data.lesson.lesson_number} · {data.lesson.duration_minutes} minutes
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold">{data.lesson.topic}</h1>
      </div>
      <Card className="mt-7">
        <CardContent className="pt-6">
          <MarkdownContent content={data.lesson.overview_md} />
        </CardContent>
      </Card>
      <section className="mt-8">
        <h2 className="font-display text-2xl font-bold">Modules</h2>
        <div className="mt-4 space-y-3">
          {data.modules.map((module) => (
            <Link
              key={module.id}
              to="/courses/$courseId/lessons/$lessonId/modules/$moduleId"
              params={{ courseId, lessonId, moduleId: module.id }}
            >
              <Card className="transition-colors hover:bg-secondary">
                <CardHeader className="flex-row items-center gap-3 space-y-0">
                  <span className="text-primary">
                    {data.completed.has(module.id) ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </span>
                  <div className="flex-1">
                    <CardTitle className="text-base">
                      {module.position}. {module.topic}
                    </CardTitle>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {module.duration_minutes} minutes
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>
      {data.tasks.length > 0 && (
        <section className="mt-8">
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
            <ListTodo className="h-5 w-5 text-accent" />
            Lesson task
          </h2>
          {data.tasks.map((task) => (
            <Link key={task.id} to="/tasks/$taskId" params={{ taskId: task.id }}>
              <Card className="mt-4 transition-colors hover:bg-secondary">
                <CardHeader>
                  <CardTitle className="text-base">{task.topic}</CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
