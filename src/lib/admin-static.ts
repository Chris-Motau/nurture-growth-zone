/**
 * Static / dummy data used for the admin views where live trainee data
 * (attendance history, performance scoring) is not yet captured by the system.
 */

export type AttendanceStatus = "Excellent" | "Good" | "At risk";

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 100000;
  }
  return hash;
}

export function staticAttendance(userId: string) {
  const seed = hashString(userId);
  const sessionsHeld = 12;
  const attended = 6 + (seed % 7); // 6..12
  const rate = Math.round((attended / sessionsHeld) * 100);
  const status: AttendanceStatus = rate >= 90 ? "Excellent" : rate >= 70 ? "Good" : "At risk";
  return { sessionsHeld, attended, rate, status };
}

export function performanceGrade(score: number) {
  if (score >= 80) return { label: "Distinction", tone: "text-accent" };
  if (score >= 60) return { label: "On track", tone: "text-primary" };
  if (score >= 40) return { label: "Needs support", tone: "text-muted-foreground" };
  return { label: "At risk", tone: "text-destructive" };
}

/** Overall performance = 40% attendance + 35% submissions + 25% module progress. */
export function overallPerformance(input: {
  attendanceRate: number;
  submissionRate: number;
  progressRate: number;
}) {
  return Math.round(
    input.attendanceRate * 0.4 + input.submissionRate * 0.35 + input.progressRate * 0.25,
  );
}
