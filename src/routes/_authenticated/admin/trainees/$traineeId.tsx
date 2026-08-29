import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { fetchTraineeOverview, traineeName } from "@/lib/admin-queries";
import { performanceGrade } from "@/lib/admin-static";
export const Route = createFileRoute("/_authenticated/admin/trainees/$traineeId")({
  component: TraineeDetail,
});
function TraineeDetail() {
  const { traineeId } = Route.useParams();
  const { data } = useQuery({ queryKey: ["admin-trainees"], queryFn: fetchTraineeOverview });
  const row = data?.find((item) => item.trainee.id === traineeId);
  if (!row) return <p className="text-muted-foreground">Loading trainee…</p>;
  const grade = performanceGrade(row.performance);
  return (
    <main>
      <Link to="/admin/trainees" className="text-sm font-medium text-primary">
        ← All trainees
      </Link>
      <h1 className="mt-5 font-display text-3xl font-bold">{traineeName(row.trainee)}</h1>
      <p className="mt-1 text-muted-foreground">{row.trainee.email}</p>
      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{row.attendance.rate}%</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {row.attendance.attended} of {row.attendance.sessionsHeld} sessions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {row.submitted}/{row.totalTasks}
            </p>
            <Link
              to="/admin/submissions/$traineeId"
              params={{ traineeId }}
              className="mt-2 block text-sm font-medium text-primary"
            >
              View GitHub links
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{row.performance}%</p>
            <p className={`mt-1 text-sm font-medium ${grade.tone}`}>{grade.label}</p>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Module progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={row.progressRate} />
          <p className="mt-2 text-sm text-muted-foreground">
            {row.completed} of {row.totalModules} modules complete
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
