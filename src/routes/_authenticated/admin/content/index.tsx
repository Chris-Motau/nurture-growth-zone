import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
export const Route = createFileRoute("/_authenticated/admin/content/")({ component: ContentPage });
function ContentPage() {
  const client = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { data } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("*").order("position");
      if (error) throw error;
      return data;
    },
  });
  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("courses")
        .insert({ title, description, position: (data?.length ?? 0) + 1 });
      if (error) throw error;
    },
    onSuccess: () => {
      setTitle("");
      setDescription("");
      void client.invalidateQueries({ queryKey: ["admin-courses"] });
      toast.success("Course created");
    },
    onError: (error) => toast.error(error.message),
  });
  return (
    <main>
      <h1 className="font-display text-3xl font-bold">Course content</h1>
      <p className="mt-2 text-muted-foreground">
        Create courses and manage their lessons, modules and tasks.
      </p>
      <Card className="mt-7">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="h-5 w-5 text-accent" />
            New course
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Course title"
          />
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Short course description"
          />
          <Button disabled={!title || create.isPending} onClick={() => create.mutate()}>
            Create course
          </Button>
        </CardContent>
      </Card>
      <div className="mt-7 space-y-3">
        {data?.map((course) => (
          <Link key={course.id} to="/admin/content/$courseId" params={{ courseId: course.id }}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{course.description}</p>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
