import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
export const Route = createFileRoute("/_authenticated/admin/content/$courseId")({
  component: CourseEditor,
});
function DeleteButton({ label, onDelete }: { label: string; onDelete: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trash2 className="mr-1 h-4 w-4" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {label}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes it and any linked content.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
function RenameButton({ value, onSave }: { value: string; onSave: (value: string) => void }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        const next = window.prompt("Update title", value)?.trim();
        if (next && next !== value) onSave(next);
      }}
    >
      Edit
    </Button>
  );
}
function CourseEditor() {
  const { courseId } = Route.useParams();
  const client = useQueryClient();
  const [lessonTopic, setLessonTopic] = useState("");
  const [lessonOverview, setLessonOverview] = useState("");
  const { data } = useQuery({
    queryKey: ["admin-course", courseId],
    queryFn: async () => {
      const [{ data: course, error }, { data: lessons }, { data: modules }, { data: tasks }] =
        await Promise.all([
          supabase.from("courses").select("*").eq("id", courseId).single(),
          supabase.from("lessons").select("*").eq("course_id", courseId).order("lesson_number"),
          supabase.from("modules").select("*"),
          supabase.from("tasks").select("*"),
        ]);
      if (error) throw error;
      return { course, lessons: lessons ?? [], modules: modules ?? [], tasks: tasks ?? [] };
    },
  });
  const refresh = () => void client.invalidateQueries({ queryKey: ["admin-course", courseId] });
  const addLesson = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("lessons").insert({
        course_id: courseId,
        topic: lessonTopic,
        overview_md: lessonOverview,
        lesson_number: (data?.lessons.length ?? 0) + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setLessonTopic("");
      setLessonOverview("");
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });
  const remove = (table: "courses" | "lessons" | "modules" | "tasks", id: string) => {
    void supabase
      .from(table)
      .delete()
      .eq("id", id)
      .then(({ error }) => {
        if (error) toast.error(error.message);
        else {
          toast.success("Deleted");
          if (table === "courses") void window.history.back();
          else refresh();
        }
      });
  };
  const rename = (
    table: "courses" | "lessons" | "modules" | "tasks",
    id: string,
    value: string,
  ) => {
    const field = table === "courses" ? { title: value } : { topic: value };
    void supabase
      .from(table)
      .update(field)
      .eq("id", id)
      .then(({ error }) => {
        if (error) toast.error(error.message);
        else {
          toast.success("Updated");
          refresh();
        }
      });
  };
  if (!data) return <p className="text-muted-foreground">Loading course…</p>;
  return (
    <main>
      <Link to="/admin/content" className="text-sm font-medium text-primary">
        ← Courses
      </Link>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">{data.course.title}</h1>
          <p className="text-muted-foreground">{data.course.description}</p>
        </div>
        <div className="flex gap-2">
          <RenameButton
            value={data.course.title}
            onSave={(value) => rename("courses", courseId, value)}
          />
          <DeleteButton label="course" onDelete={() => remove("courses", courseId)} />
        </div>
      </div>
      <Card className="mt-7">
        <CardHeader>
          <CardTitle>Add lesson</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={lessonTopic}
            onChange={(event) => setLessonTopic(event.target.value)}
            placeholder="Lesson topic"
          />
          <Textarea
            value={lessonOverview}
            onChange={(event) => setLessonOverview(event.target.value)}
            placeholder="Lesson overview (Markdown)"
          />
          <Button disabled={!lessonTopic} onClick={() => addLesson.mutate()}>
            Add lesson
          </Button>
        </CardContent>
      </Card>
      <div className="mt-7 space-y-4">
        {data.lessons.map((lesson) => (
          <LessonEditor
            key={lesson.id}
            lesson={lesson}
            modules={data.modules.filter((module) => module.lesson_id === lesson.id)}
            tasks={data.tasks.filter((task) => task.lesson_id === lesson.id)}
            remove={remove}
            refresh={refresh}
            rename={rename}
          />
        ))}
      </div>
    </main>
  );
}
function LessonEditor({
  lesson,
  modules,
  tasks,
  remove,
  refresh,
  rename,
}: {
  lesson: { id: string; topic: string };
  modules: { id: string; topic: string }[];
  tasks: { id: string; topic: string }[];
  remove: (table: "courses" | "lessons" | "modules" | "tasks", id: string) => void;
  refresh: () => void;
  rename: (table: "courses" | "lessons" | "modules" | "tasks", id: string, value: string) => void;
}) {
  const [moduleTopic, setModuleTopic] = useState("");
  const [taskTopic, setTaskTopic] = useState("");
  const add = async (table: "modules" | "tasks", topic: string) => {
    const payload =
      table === "modules"
        ? { lesson_id: lesson.id, topic, content_md: "" }
        : { lesson_id: lesson.id, topic, instructions_md: "" };
    const { error } = await supabase.from(table).insert(payload);
    if (error) toast.error(error.message);
    else {
      refresh();
      if (table === "modules") setModuleTopic("");
      else setTaskTopic("");
    }
  };
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">{lesson.topic}</CardTitle>
        <div className="flex gap-2">
          <RenameButton
            value={lesson.topic}
            onSave={(value) => rename("lessons", lesson.id, value)}
          />
          <DeleteButton label="lesson" onDelete={() => remove("lessons", lesson.id)} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold">Modules</p>
          {modules.map((module) => (
            <div key={module.id} className="mt-2 flex justify-between gap-2 text-sm">
              <span>{module.topic}</span>
              <div className="flex gap-1">
                <RenameButton
                  value={module.topic}
                  onSave={(value) => rename("modules", module.id, value)}
                />
                <DeleteButton label="module" onDelete={() => remove("modules", module.id)} />
              </div>
            </div>
          ))}
          <div className="mt-3 flex gap-2">
            <Input
              value={moduleTopic}
              onChange={(event) => setModuleTopic(event.target.value)}
              placeholder="New module"
            />
            <Button
              size="sm"
              disabled={!moduleTopic}
              onClick={() => void add("modules", moduleTopic)}
            >
              Add
            </Button>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold">Tasks</p>
          {tasks.map((task) => (
            <div key={task.id} className="mt-2 flex justify-between gap-2 text-sm">
              <span>{task.topic}</span>
              <div className="flex gap-1">
                <RenameButton
                  value={task.topic}
                  onSave={(value) => rename("tasks", task.id, value)}
                />
                <DeleteButton label="task" onDelete={() => remove("tasks", task.id)} />
              </div>
            </div>
          ))}
          <div className="mt-3 flex gap-2">
            <Input
              value={taskTopic}
              onChange={(event) => setTaskTopic(event.target.value)}
              placeholder="New task"
            />
            <Button size="sm" disabled={!taskTopic} onClick={() => void add("tasks", taskTopic)}>
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
