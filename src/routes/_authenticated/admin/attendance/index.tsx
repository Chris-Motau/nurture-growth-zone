import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
export const Route = createFileRoute("/_authenticated/admin/attendance/")({
  component: AttendancePage,
});
function AttendancePage() {
  const client = useQueryClient();
  const [topic, setTopic] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [content, setContent] = useState("");
  const { data } = useQuery({
    queryKey: ["admin-meetings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .order("meeting_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const create = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("meetings")
        .insert({ topic, meeting_date: date, content, created_by: user.user?.id ?? null });
      if (error) throw error;
    },
    onSuccess: () => {
      setTopic("");
      setContent("");
      void client.invalidateQueries({ queryKey: ["admin-meetings"] });
      toast.success("Meeting created");
    },
    onError: (error) => toast.error(error.message),
  });
  return (
    <main>
      <h1 className="font-display text-3xl font-bold">Attendance</h1>
      <p className="mt-2 text-muted-foreground">Create a meeting, then capture its register.</p>
      <Card className="mt-7">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarPlus className="h-5 w-5 text-accent" />
            New meeting
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Input
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="Meeting topic"
          />
          <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="sm:col-span-2"
            placeholder="Agenda or meeting notes (optional)"
          />
          <Button
            disabled={!topic || create.isPending}
            onClick={() => create.mutate()}
            className="w-fit"
          >
            Create meeting
          </Button>
        </CardContent>
      </Card>
      <div className="mt-7 space-y-3">
        {data?.map((meeting) => (
          <Link
            key={meeting.id}
            to="/admin/attendance/$meetingId"
            params={{ meetingId: meeting.id }}
          >
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">{meeting.topic}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium" }).format(
                    new Date(meeting.meeting_date),
                  )}
                </p>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
