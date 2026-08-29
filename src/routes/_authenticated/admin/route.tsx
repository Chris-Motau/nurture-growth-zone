import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShieldAlert } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const adminNav = [
  { to: "/admin", label: "Overview", exact: true },
  { to: "/admin/trainees", label: "Trainees" },
  { to: "/admin/submissions", label: "Submissions" },
  { to: "/admin/attendance", label: "Attendance" },
  { to: "/admin/content", label: "Courses" },
  { to: "/admin/profile", label: "My profile" },
] as const;

function AdminLayout() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-access"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return { isStaff: false };
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", uid);
      return {
        isStaff: (roles ?? []).some((r) => r.role === "facilitator" || r.role === "admin"),
      };
    },
  });

  if (isLoading) {
    return <div className="mx-auto max-w-5xl px-4 py-16 text-muted-foreground">Loading admin…</div>;
  }

  if (!data?.isStaff) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-16 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldAlert className="h-5 w-5 text-destructive" aria-hidden="true" />
              Staff area
            </CardTitle>
            <CardDescription>
              Only facilitators and admins can open the admin workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => void navigate({ to: "/dashboard" })}>
              Go to trainee dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <nav
        aria-label="Admin sections"
        className="mb-8 flex flex-wrap gap-1 rounded-xl border border-border bg-card p-1.5"
      >
        {adminNav.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: "exact" in item ? item.exact : false }}
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
