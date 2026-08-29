import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchTrainees, traineeName } from "@/lib/admin-queries";
export const Route = createFileRoute("/_authenticated/admin/attendance/$meetingId")({
  component: RegisterPage,
});
function RegisterPage() {
  const { meetingId } = Route.useParams();
  const client = useQueryClient();
  const { data } = useQuery({
    queryKey: ["meeting-register", meetingId],
    queryFn: async () => {
      const [{ data: meeting, error }, trainees, { data: attendance }] = await Promise.all([
        supabase.from("meetings").select("*").eq("id", meetingId).single(),
        fetchTrainees(),
        supabase.from("meeting_attendance").select("user_id, present").eq("meeting_id", meetingId),
      ]);
      if (error) throw error;
      return {
        meeting,
        trainees,
        attendance: new Map((attendance ?? []).map((item) => [item.user_id, item.present])),
      };
    },
  });
  const setAttendance = useMutation({
    mutationFn: async ({ userId, present }: { userId: string; present: boolean }) => {
      const { error } = await supabase
        .from("meeting_attendance")
        .upsert(
          { meeting_id: meetingId, user_id: userId, present },
          { onConflict: "meeting_id,user_id" },
        );
      if (error) throw error;
    },
    onSuccess: () => void client.invalidateQueries({ queryKey: ["meeting-register", meetingId] }),
    onError: (error) => toast.error(error.message),
  });
  if (!data) return <p className="text-muted-foreground">Loading register…</p>;
  return (
    <main>
      <Link to="/admin/attendance" className="text-sm font-medium text-primary">
        ← All meetings
      </Link>
      <h1 className="mt-5 font-display text-3xl font-bold">{data.meeting.topic}</h1>
      <p className="mt-2 text-muted-foreground">Mark each trainee present or absent.</p>
      <div className="mt-7 space-y-2">
        {data.trainees.map((trainee) => {
          const present = data.attendance.get(trainee.id);
          return (
            <Card key={trainee.id}>
              <CardContent className="flex items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-medium">{traineeName(trainee)}</p>
                  <p className="text-sm text-muted-foreground">{trainee.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={present === true ? "default" : "outline"}
                    onClick={() => setAttendance.mutate({ userId: trainee.id, present: true })}
                  >
                    <Check className="mr-1 h-4 w-4" />
                    Present
                  </Button>
                  <Button
                    size="sm"
                    variant={present === false ? "destructive" : "outline"}
                    onClick={() => setAttendance.mutate({ userId: trainee.id, present: false })}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Absent
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
