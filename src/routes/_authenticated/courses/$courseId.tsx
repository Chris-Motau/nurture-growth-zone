import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ChevronRight, Clock, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompletionBar } from "@/components/LearningContent";

export const Route = createFileRoute("/_authenticated/courses/$courseId")({
  component: CoursePage,
});
const date = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "short", year: "numeric" }).format(
        new Date(value),
      )
    : "Dates to be confirmed";

function CoursePage() {
  const { courseId } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      const [{ data: course, error }, { data: lessons }, { data: modules }, { data: completions }] =
        await Promise.all([
          supabase.from("courses").select("*").eq("id", courseId).single(),
          supabase.from("lessons").select("*").eq("course_id", courseId).order("lesson_number"),
          supabase.from("modules").select("id, lesson_id"),
          user.user
            ? supabase.from("module_completions").select("module_id").eq("user_id", user.user.id)
            : Promise.resolve({ data: [] }),
        ]);
      if (error) throw error;
      const moduleIds = new Set(
        (modules ?? [])
          .filter((item) => (lessons ?? []).some((lesson) => lesson.id === item.lesson_id))
          .map((item) => item.id),
      );
      const done = (completions ?? []).filter((item) => moduleIds.has(item.module_id)).length;
      return { course, lessons: lessons ?? [], total: moduleIds.size, done };
    },
  });
  if (isLoading)
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-muted-foreground">Loading course…</div>
    );
  if (!data) return null;
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link to="/courses" className="text-sm font-medium text-primary">
        ← All courses
      </Link>
      <section className="mt-5 rounded-2xl surface-hero p-7 text-primary-foreground">
        <h1 className="font-display text-3xl font-bold">{data.course.title}</h1>
        <p className="mt-3 max-w-2xl opacity-90">{data.course.description}</p>
        <div className="mt-5 flex flex-wrap gap-4 text-sm opacity-90">
          <span className="flex items-center gap-1">
            <UserRound className="h-4 w-4" />
            {data.course.facilitator_name}
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays className="h-4 w-4" />
            {date(data.course.start_date)} – {date(data.course.end_date)}
          </span>
        </div>
      </section>
      <section className="mt-8">
        <h2 className="font-display text-2xl font-bold">Your progress</h2>
        <div className="mt-3 max-w-md">
          <CompletionBar completed={data.done} total={data.total} />
          {data.total > 0 && data.done === data.total && <p className="mt-2 text-sm font-semibold text-primary">Course complete</p>}
        </div>
      </section>
      <section className="mt-9">
        <h2 className="font-display text-2xl font-bold">Lessons</h2>
        <div className="mt-4 space-y-3">
          {data.lessons.map((lesson) => (
            <Link
              key={lesson.id}
              to="/courses/$courseId/lessons/$lessonId"
              params={{ courseId, lessonId: lesson.id }}
            >
              <Card className="transition-colors hover:bg-secondary">
                <CardHeader className="flex-row items-center gap-4 space-y-0">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                    {lesson.lesson_number}
                  </span>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg">{lesson.topic}</CardTitle>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {lesson.duration_minutes} minutes
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
