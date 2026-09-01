import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Eye,
  EyeOff,
  FileText,
  ListChecks,
  Plus,
  Upload,
  User,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ConfirmDelete,
  CourseDialog,
  LessonDialog,
  ModuleDialog,
  TaskDialog,
} from "@/components/admin/content-dialogs";

export const Route = createFileRoute("/_authenticated/admin/content/$courseId")({
  component: CourseEditor,
});

type Table = "courses" | "lessons" | "modules" | "tasks";

type Lesson = {
  id: string;
  topic: string;
  lesson_number: number;
  overview_md: string;
  duration_minutes: number;
  is_hidden: boolean;
};

type Module = {
  id: string;
  lesson_id: string;
  topic: string;
  content_md: string;
  video_url: string | null;
  duration_minutes: number;
  is_hidden: boolean;
  document_path: string | null;
  position: number;
};

type Task = {
  id: string;
  lesson_id: string;
  topic: string;
  instructions_md: string;
  due_date: string | null;
  is_hidden: boolean;
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function CourseEditor() {
  const { courseId } = Route.useParams();
  const client = useQueryClient();
  const refresh = () => void client.invalidateQueries({ queryKey: ["admin-course", courseId] });

  const { data } = useQuery({
    queryKey: ["admin-course", courseId],
    queryFn: async () => {
      const { data: course, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();
      if (error) throw error;
      const { data: lessons } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", courseId)
        .order("lesson_number");
      const lessonIds = (lessons ?? []).map((l) => l.id);
      const [{ data: modules }, { data: tasks }] = await Promise.all([
        lessonIds.length
          ? supabase.from("modules").select("*").in("lesson_id", lessonIds).order("position")
          : Promise.resolve({ data: [] as Module[] }),
        lessonIds.length
          ? supabase.from("tasks").select("*").in("lesson_id", lessonIds)
          : Promise.resolve({ data: [] as Task[] }),
      ]);
      return {
        course,
        lessons: (lessons ?? []) as Lesson[],
        modules: (modules ?? []) as Module[],
        tasks: (tasks ?? []) as Task[],
      };
    },
  });

  const update = async (table: Table, id: string, values: Record<string, unknown>) => {
    const { error } = await (supabase.from(table) as never as {
      update: (v: Record<string, unknown>) => {
        eq: (c: string, v: string) => Promise<{ error: Error | null }>;
      };
    })
      .update(values)
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Saved");
      refresh();
    }
  };

  const insert = async (table: "lessons" | "modules" | "tasks", values: Record<string, unknown>) => {
    const { error } = await supabase.from(table).insert(values as never);
    if (error) toast.error(error.message);
    else {
      toast.success("Added");
      refresh();
    }
  };

  const remove = async (table: Table, id: string) => {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      if (table === "courses") window.history.back();
      else refresh();
    }
  };

  if (!data) return <p className="text-muted-foreground">Loading course…</p>;

  const totalModules = data.modules.length;
  const totalMinutes = data.modules.reduce((sum, m) => sum + (m.duration_minutes ?? 0), 0);

  return (
    <main>
      <Link
        to="/admin/content"
        className="inline-flex items-center gap-1 text-sm font-medium text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        All courses
      </Link>

      <Card className="mt-5">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-bold">{data.course.title}</h1>
              <p className="mt-1 max-w-2xl text-muted-foreground">{data.course.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <CourseDialog
                title="Edit course"
                submitLabel="Save changes"
                initial={{
                  title: data.course.title,
                  description: data.course.description,
                  start_date: data.course.start_date ?? "",
                  end_date: data.course.end_date ?? "",
                  facilitator_name: data.course.facilitator_name,
                }}
                onSubmit={(values) =>
                  update("courses", courseId, {
                    title: values.title,
                    description: values.description,
                    start_date: values.start_date || null,
                    end_date: values.end_date || null,
                    facilitator_name: values.facilitator_name,
                  })
                }
                trigger={
                  <Button size="sm" variant="outline">
                    Edit course
                  </Button>
                }
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  void update("courses", courseId, { is_hidden: !data.course.is_hidden })
                }
              >
                {data.course.is_hidden ? "Show" : "Hide"}
              </Button>
              <ConfirmDelete
                label="course"
                name={data.course.title}
                onDelete={() => void remove("courses", courseId)}
              />
            </div>
          </div>
          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
            <span className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {formatDate(data.course.start_date)} – {formatDate(data.course.end_date)}
            </span>
            <span className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {data.course.facilitator_name || "No facilitator"}
            </span>
            <span className="flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              {data.lessons.length} lessons · {totalModules} modules
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {totalMinutes} min total
            </span>
          </div>
        </CardHeader>
      </Card>

      <div className="mt-7 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Lessons</h2>
        <LessonDialog
          title="New lesson"
          submitLabel="Add lesson"
          onSubmit={(values) =>
            insert("lessons", {
              course_id: courseId,
              topic: values.topic,
              overview_md: values.overview_md,
              duration_minutes: values.duration_minutes,
              lesson_number: data.lessons.length + 1,
            })
          }
          trigger={
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add lesson
            </Button>
          }
        />
      </div>

      {data.lessons.length === 0 ? (
        <Card className="mt-4 border-dashed">
          <CardContent className="py-10 text-center text-muted-foreground">
            No lessons yet. Add the first lesson to start building modules and tasks.
          </CardContent>
        </Card>
      ) : null}

      <div className="mt-4 space-y-4">
        {data.lessons.map((lesson) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            modules={data.modules.filter((m) => m.lesson_id === lesson.id)}
            tasks={data.tasks.filter((t) => t.lesson_id === lesson.id)}
            insert={insert}
            update={update}
            remove={remove}
          />
        ))}
      </div>
    </main>
  );
}

function LessonCard({
  lesson,
  modules,
  tasks,
  insert,
  update,
  remove,
}: {
  lesson: Lesson;
  modules: Module[];
  tasks: Task[];
  insert: (t: "lessons" | "modules" | "tasks", v: Record<string, unknown>) => Promise<void>;
  update: (t: Table, id: string, v: Record<string, unknown>) => Promise<void>;
  remove: (t: Table, id: string) => Promise<void>;
}) {
  const moduleMinutes = modules.reduce((sum, m) => sum + (m.duration_minutes ?? 0), 0);
  const lessonMinutes = lesson.duration_minutes || moduleMinutes;

  const uploadDocument = async (moduleId: string, file: File | null) => {
    if (!file) return;
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${moduleId}/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage.from("module-documents").upload(path, file);
    if (error) {
      toast.error(error.message);
      return;
    }
    await update("modules", moduleId, { document_path: path });
  };

  const openDocument = async (path: string) => {
    const { data, error } = await supabase.storage
      .from("module-documents")
      .createSignedUrl(path, 60 * 10);
    if (error || !data) {
      toast.error(error?.message ?? "Could not open document");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener");
  };

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Lesson {lesson.lesson_number}
            </p>
            <CardTitle className="text-lg">{lesson.topic}</CardTitle>
            <p className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {lessonMinutes} min
              </span>
              <span>{modules.length} modules</span>
              <span>{tasks.length} tasks</span>
              {lesson.is_hidden ? <Badge variant="secondary">Hidden</Badge> : null}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <LessonDialog
              title="Edit lesson"
              submitLabel="Save changes"
              initial={{
                topic: lesson.topic,
                overview_md: lesson.overview_md,
                duration_minutes: lesson.duration_minutes,
              }}
              onSubmit={(values) => update("lessons", lesson.id, values)}
              trigger={
                <Button size="sm" variant="outline">
                  Edit
                </Button>
              }
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => void update("lessons", lesson.id, { is_hidden: !lesson.is_hidden })}
            >
              {lesson.is_hidden ? (
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
              label="lesson"
              name={lesson.topic}
              onDelete={() => void remove("lessons", lesson.id)}
            />
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="grid gap-6 pt-6 md:grid-cols-2">
        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Modules</h3>
            <ModuleDialog
              title="New module"
              submitLabel="Add module"
              onSubmit={(values) =>
                insert("modules", {
                  lesson_id: lesson.id,
                  topic: values.topic,
                  content_md: values.content_md,
                  video_url: values.video_url || null,
                  duration_minutes: values.duration_minutes,
                  position: modules.length + 1,
                })
              }
              trigger={
                <Button size="sm" variant="ghost">
                  <Plus className="mr-1 h-4 w-4" />
                  Add
                </Button>
              }
            />
          </div>
          <div className="mt-3 space-y-2">
            {modules.length === 0 ? (
              <p className="text-sm text-muted-foreground">No modules yet.</p>
            ) : null}
            {modules.map((module) => (
              <div key={module.id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{module.topic}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{module.duration_minutes} min</span>
                      {module.video_url ? (
                        <span className="flex items-center gap-1">
                          <Video className="h-3 w-3" />
                          Video
                        </span>
                      ) : null}
                      {module.content_md ? (
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          Text
                        </span>
                      ) : null}
                      {module.document_path ? (
                        <button
                          type="button"
                          className="flex items-center gap-1 text-primary underline"
                          onClick={() => void openDocument(module.document_path as string)}
                        >
                          <Upload className="h-3 w-3" />
                          Document
                        </button>
                      ) : null}
                      {module.is_hidden ? <Badge variant="secondary">Hidden</Badge> : null}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    <ModuleDialog
                      title="Edit module"
                      submitLabel="Save changes"
                      initial={{
                        topic: module.topic,
                        content_md: module.content_md,
                        video_url: module.video_url ?? "",
                        duration_minutes: module.duration_minutes,
                      }}
                      onSubmit={(values) =>
                        update("modules", module.id, {
                          topic: values.topic,
                          content_md: values.content_md,
                          video_url: values.video_url || null,
                          duration_minutes: values.duration_minutes,
                        })
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
                        void update("modules", module.id, { is_hidden: !module.is_hidden })
                      }
                    >
                      {module.is_hidden ? "Show" : "Hide"}
                    </Button>
                    <label className="inline-flex cursor-pointer items-center rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted">
                      Upload
                      <input
                        className="hidden"
                        type="file"
                        onChange={(e) =>
                          void uploadDocument(module.id, e.target.files?.[0] ?? null)
                        }
                      />
                    </label>
                    <ConfirmDelete
                      label="module"
                      name={module.topic}
                      onDelete={() => void remove("modules", module.id)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Tasks</h3>
            <TaskDialog
              title="New task"
              submitLabel="Add task"
              onSubmit={(values) =>
                insert("tasks", {
                  lesson_id: lesson.id,
                  topic: values.topic,
                  instructions_md: values.instructions_md,
                  due_date: values.due_date || null,
                })
              }
              trigger={
                <Button size="sm" variant="ghost">
                  <Plus className="mr-1 h-4 w-4" />
                  Add
                </Button>
              }
            />
          </div>
          <div className="mt-3 space-y-2">
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tasks yet.</p>
            ) : null}
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-wrap items-start justify-between gap-2 rounded-lg border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{task.topic}</p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    Due {formatDate(task.due_date)}
                    {task.is_hidden ? <Badge variant="secondary">Hidden</Badge> : null}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <TaskDialog
                    title="Edit task"
                    submitLabel="Save changes"
                    initial={{
                      topic: task.topic,
                      instructions_md: task.instructions_md,
                      due_date: task.due_date ? task.due_date.slice(0, 10) : "",
                    }}
                    onSubmit={(values) =>
                      update("tasks", task.id, {
                        topic: values.topic,
                        instructions_md: values.instructions_md,
                        due_date: values.due_date || null,
                      })
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
                    onClick={() => void update("tasks", task.id, { is_hidden: !task.is_hidden })}
                  >
                    {task.is_hidden ? "Show" : "Hide"}
                  </Button>
                  <ConfirmDelete
                    label="task"
                    name={task.topic}
                    onDelete={() => void remove("tasks", task.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
