import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MarkdownContent } from "@/components/LearningContent";

export const Route = createFileRoute(
  "/_authenticated/courses/$courseId/lessons/$lessonId/modules/$moduleId",
)({ component: ModulePage });
function ModulePage() {
  const { courseId, lessonId, moduleId } = Route.useParams();
  const client = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["module", moduleId],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      const [{ data: module, error }, { data: completion }] = await Promise.all([
        supabase.from("modules").select("*").eq("id", moduleId).single(),
        user.user
          ? supabase
              .from("module_completions")
              .select("id")
              .eq("module_id", moduleId)
              .eq("user_id", user.user.id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      if (error) throw error;
      return { module, complete: Boolean(completion) };
    },
  });
  const markComplete = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Please sign in again.");
      const { error } = await supabase
        .from("module_completions")
        .upsert(
          { user_id: user.user.id, module_id: moduleId },
          { onConflict: "user_id,module_id" },
        );
      if (error) throw error;
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["module", moduleId] });
      void client.invalidateQueries({ queryKey: ["courses-with-progress"] });
      toast.success("Module marked complete");
    },
    onError: (error) => toast.error(error.message),
  });
  if (isLoading)
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-muted-foreground">Loading module…</div>
    );
  if (!data) return null;
  const video = data.module.video_url?.replace("watch?v=", "embed/");
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        to="/courses/$courseId/lessons/$lessonId"
        params={{ courseId, lessonId }}
        className="text-sm font-medium text-primary"
      >
        ← Back to lesson
      </Link>
      <p className="mt-6 text-sm font-semibold text-primary">
        Module {data.module.position} · {data.module.duration_minutes} minutes
      </p>
      <h1 className="mt-1 font-display text-3xl font-bold">{data.module.topic}</h1>
      {video && (
        <div className="mt-7 aspect-video overflow-hidden rounded-xl bg-secondary">
          <iframe
            className="h-full w-full"
            src={video}
            title={`${data.module.topic} video`}
            allowFullScreen
          />
        </div>
      )}
      <Card className="mt-7">
        <CardContent className="pt-6">
          <MarkdownContent content={data.module.content_md} />
        </CardContent>
      </Card>
      <div className="mt-7">
        <Button
          disabled={data.complete || markComplete.isPending}
          onClick={() => markComplete.mutate()}
        >
          {data.complete ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Completed
            </>
          ) : (
            <>
              <PlayCircle className="mr-2 h-4 w-4" />
              Mark as complete
            </>
          )}
        </Button>
      </div>
    </main>
  );
}
