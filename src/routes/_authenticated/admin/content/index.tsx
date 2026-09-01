import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, CalendarDays, Eye, EyeOff, Layers, Plus, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseDialog, ConfirmDelete, type CourseValues } from "@/components/admin/content-dialogs";

export const Route = createFileRoute("/_authenticated/admin/content/")({ component: ContentPage });

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ContentPage() {
  const client = useQueryClient();
  const refresh = () => void client.invalidateQueries({ queryKey: ["admin-courses"] });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const [{ data: courses, error }, { data: lessons }, { data: modules }] = await Promise.all([
        supabase.from("courses").select("*").order("position"),
        supabase.from("lessons").select("id, course_id"),
        supabase.from("modules").select("id, lesson_id, duration_minutes"),
      ]);
      if (error) throw error;
      return {
        courses: courses ?? [],
        lessons: lessons ?? [],
        modules: modules ?? [],
      };
    },
  });

  const create = useMutation({
    mutationFn: async (values: CourseValues) => {
      const { error } = await supabase.from("courses").insert({
        title: values.title,
        description: values.description,
        start_date: values.start_date || null,
        end_date: values.end_date || null,
        facilitator_name: values.facilitator_name,
        position: (data?.courses.length ?? 0) + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      refresh();
      toast.success("Course created");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const mutate = async (id: string, values: Record<string, unknown>, message: string) => {
    const { error } = await (supabase.from("courses") as never as {
      update: (v: Record<string, unknown>) => {
        eq: (c: string, v: string) => Promise<{ error: Error | null }>;
      };
    })
      .update(values)
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success(message);
      refresh();
    }
  };

  const removeCourse = async (id: string) => {
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Course deleted");
      refresh();
    }
  };

  const stats = (courseId: string) => {
    const lessonIds = (data?.lessons ?? [])
      .filter((l) => l.course_id === courseId)
      .map((l) => l.id);
    const modules = (data?.modules ?? []).filter((m) => lessonIds.includes(m.lesson_id));
    return {
      lessons: lessonIds.length,
      modules: modules.length,
      minutes: modules.reduce((sum, m) => sum + (m.duration_minutes ?? 0), 0),
    };
  };

  return (
    <main>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 font-display text-3xl font-bold">
            <BookOpen className="h-7 w-7 text-accent" />
            Course content
          </h1>
          <p className="mt-2 text-muted-foreground">
            Create courses, then add lessons, modules and tasks inside each one.
          </p>
        </div>
        <CourseDialog
          title="New course"
          submitLabel="Create course"
          onSubmit={(values) => create.mutate(values)}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New course
            </Button>
          }
        />
      </div>

      {isLoading ? <p className="mt-8 text-muted-foreground">Loading courses…</p> : null}

      {data && data.courses.length === 0 ? (
        <Card className="mt-8 border-dashed">
          <CardContent className="py-12 text-center">
            <p className="font-medium">No courses yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first course to start building lessons.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {data?.courses.map((course) => {
          const s = stats(course.id);
          return (
            <Card key={course.id} className="flex flex-col transition-shadow hover:shadow-md">
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-lg leading-snug">
                    <Link
                      to="/admin/content/$courseId"
                      params={{ courseId: course.id }}
                      className="hover:text-primary"
                    >
                      {course.title}
                    </Link>
                  </CardTitle>
                  {course.is_hidden ? <Badge variant="secondary">Hidden</Badge> : null}
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
              </CardHeader>
              <CardContent className="mt-auto space-y-4">
                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  <span className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    {formatDate(course.start_date)} – {formatDate(course.end_date)}
                  </span>
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {course.facilitator_name || "No facilitator"}
                  </span>
                  <span className="flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    {s.lessons} lessons · {s.modules} modules
                  </span>
                  <span>{s.minutes} min total</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link to="/admin/content/$courseId" params={{ courseId: course.id }}>
                      Manage
                    </Link>
                  </Button>
                  <CourseDialog
                    title="Edit course"
                    submitLabel="Save changes"
                    initial={{
                      title: course.title,
                      description: course.description,
                      start_date: course.start_date ?? "",
                      end_date: course.end_date ?? "",
                      facilitator_name: course.facilitator_name,
                    }}
                    onSubmit={(values) =>
                      mutate(
                        course.id,
                        {
                          title: values.title,
                          description: values.description,
                          start_date: values.start_date || null,
                          end_date: values.end_date || null,
                          facilitator_name: values.facilitator_name,
                        },
                        "Course updated",
                      )
                    }
                    trigger={
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    }
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      void mutate(
                        course.id,
                        { is_hidden: !course.is_hidden },
                        course.is_hidden ? "Course visible" : "Course hidden",
                      )
                    }
                  >
                    {course.is_hidden ? (
                      <>
                        <Eye className="mr-1 h-4 w-4" />
                        Show
                      </>
                    ) : (
                      <>
                        <EyeOff className="mr-1 h-4 w-4" />
                        Hide
                      </>
                    )}
                  </Button>
                  <ConfirmDelete
                    label="course"
                    name={course.title}
                    onDelete={() => void removeCourse(course.id)}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
