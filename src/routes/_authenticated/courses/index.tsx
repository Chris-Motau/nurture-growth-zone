import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CompletionBar } from "@/components/LearningContent";

export const Route = createFileRoute("/_authenticated/courses/")({ component: CoursesPage });

function CoursesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["courses-with-progress"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];
      const [{ data: courses, error }, { data: modules }, { data: completions }] =
        await Promise.all([
          supabase.from("courses").select("*").order("position"),
          supabase.from("modules").select("id, lesson_id, lessons!inner(course_id)"),
          supabase.from("module_completions").select("module_id").eq("user_id", user.user.id),
        ]);
      if (error) throw error;
      const complete = new Set((completions ?? []).map((item) => item.module_id));
      return (courses ?? []).map((course) => {
        const items = (modules ?? []).filter((module) => module.lessons.course_id === course.id);
        return {
          course,
          total: items.length,
          completed: items.filter((module) => complete.has(module.id)).length,
        };
      });
    },
  });
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div>
        <p className="text-sm font-semibold text-primary">Learning space</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Your courses</h1>
        <p className="mt-2 text-muted-foreground">
          Pick up where you left off and keep building your skills.
        </p>
      </div>
      {isLoading ? (
        <p className="mt-8 text-muted-foreground">Loading courses…</p>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {data?.map(({ course, completed, total }) => (
            <Card key={course.id} className="flex flex-col shadow-soft">
              <CardHeader>
                <BookOpen className="h-6 w-6 text-accent" />
                <CardTitle className="mt-3 text-xl">{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto space-y-5">
                <CompletionBar completed={completed} total={total} />
                <Link
                  to="/courses/$courseId"
                  params={{ courseId: course.id }}
                  className="flex items-center text-sm font-semibold text-primary"
                >
                  Open course <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
