import { supabase } from "@/integrations/supabase/client";
import { overallPerformance, staticAttendance } from "@/lib/admin-static";

export type TraineeRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
};

export function traineeName(t: Pick<TraineeRow, "first_name" | "last_name" | "email">) {
  const full = `${t.first_name ?? ""} ${t.last_name ?? ""}`.trim();
  return full || t.email;
}

export async function fetchTrainees(): Promise<TraineeRow[]> {
  const { data: roles, error: rolesError } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "trainee");
  if (rolesError) throw rolesError;
  const ids = (roles ?? []).map((r) => r.user_id);
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email, avatar_url, created_at")
    .in("id", ids)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Trainee list with progress, submissions and (static) attendance summaries. */
export async function fetchTraineeOverview() {
  const trainees = await fetchTrainees();
  const [{ count: moduleCount }, { count: taskCount }, { data: completions }, { data: submissions }] =
    await Promise.all([
      supabase.from("modules").select("id", { count: "exact", head: true }),
      supabase.from("tasks").select("id", { count: "exact", head: true }),
      supabase.from("module_completions").select("user_id"),
      supabase.from("task_submissions").select("user_id"),
    ]);

  const totalModules = moduleCount ?? 0;
  const totalTasks = taskCount ?? 0;

  return trainees.map((trainee) => {
    const completed = (completions ?? []).filter((c) => c.user_id === trainee.id).length;
    const submitted = (submissions ?? []).filter((s) => s.user_id === trainee.id).length;
    const attendance = staticAttendance(trainee.id);
    const progressRate = totalModules ? Math.round((completed / totalModules) * 100) : 0;
    const submissionRate = totalTasks ? Math.round((submitted / totalTasks) * 100) : 0;
    return {
      trainee,
      completed,
      totalModules,
      submitted,
      totalTasks,
      progressRate,
      submissionRate,
      attendance,
      performance: overallPerformance({
        attendanceRate: attendance.rate,
        submissionRate,
        progressRate,
      }),
    };
  });
}
