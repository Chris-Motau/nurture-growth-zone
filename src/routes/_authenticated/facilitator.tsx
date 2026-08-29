import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, ShieldAlert, Users } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/facilitator")({
  head: () => ({
    meta: [
      { title: "Facilitator workspace — Hamonate LMS" },
      {
        name: "description",
        content: "Facilitator workspace for Hamonate LMS: trainee invites, cohorts and upcoming attendance tools.",
      },
      { property: "og:title", content: "Facilitator workspace — Hamonate LMS" },
      { property: "og:description", content: "Manage your Hamonate LMS trainees and cohorts." },
    ],
  }),
  component: FacilitatorPage,
});

function FacilitatorPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [cohort, setCohort] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["facilitator-workspace"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return null;

      const [{ data: roles }, { data: profile }, { data: invites }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", uid),
        supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
        supabase.from("trainee_invites").select("*").order("created_at", { ascending: false }),
      ]);

      const isStaff = (roles ?? []).some((r) => r.role === "facilitator" || r.role === "admin");
      return { isStaff, profile, invites: invites ?? [] };
    },
  });

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    void navigate({ to: "/facilitator-login", replace: true });
  }

  async function addInvite() {
    const normalised = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalised)) return toast.error("Enter a valid trainee email");
    const { error } = await supabase.from("trainee_invites").insert({
      email: normalised,
      cohort: cohort.trim() || null,
      facilitator_name: data?.profile ? `${data.profile.first_name} ${data.profile.last_name}`.trim() : null,
    });
    if (error) return toast.error(error.message.includes("duplicate") ? "That trainee email is already registered." : error.message);
    setEmail(""); setCohort("");
    toast.success("Trainee email registered");
    await queryClient.invalidateQueries({ queryKey: ["facilitator-workspace"] });
  }

  if (isLoading) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-muted-foreground">Loading your workspace…</div>;
  }

  if (!data?.isStaff) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-16 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldAlert className="h-5 w-5 text-destructive" aria-hidden="true" />
              Facilitators only
            </CardTitle>
            <CardDescription>
              This account is not registered as a facilitator. Trainees can use the trainee dashboard instead.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button onClick={() => void navigate({ to: "/dashboard" })}>Go to trainee dashboard</Button>
            <Button variant="outline" onClick={handleSignOut}>
              Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Facilitator workspace
          </h1>
          <p className="mt-2 text-muted-foreground">
            Signed in as {data.profile?.email ?? "facilitator"}.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          Sign out
        </Button>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-accent" aria-hidden="true" />
            Trainee invite list
          </CardTitle>
          <CardDescription>
            Emails you registered for trainees. A trainee is verified automatically when they sign up with a listed email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-5 grid gap-2 rounded-lg border p-4 sm:grid-cols-[1fr_1fr_auto]">
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="trainee@email.com" />
            <Input value={cohort} onChange={(e) => setCohort(e.target.value)} placeholder="Cohort (optional)" />
            <Button onClick={() => void addInvite()} disabled={!email}>Register trainee</Button>
          </div>
          {data.invites.length === 0 ? (
            <p className="text-sm text-muted-foreground">No trainee emails registered yet.</p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {data.invites.map((invite) => (
                <li key={invite.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                  <span className="font-medium">{invite.email}</span>
                  <span className="text-muted-foreground">{invite.cohort ?? "—"}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
