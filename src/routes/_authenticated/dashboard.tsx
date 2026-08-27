import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BadgeCheck, ShieldAlert, LogOut } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Trainee dashboard — Kaelo LMS" },
      { name: "description", content: "Your Kaelo LMS trainee account: profile details, facilitator verification status and course readiness." },
      { property: "og:title", content: "Trainee dashboard — Kaelo LMS" },
      { property: "og:description", content: "Your Kaelo LMS trainee account overview." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return null;
      const { data, error } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    let active = true;
    if (!profile?.avatar_url) {
      setAvatarUrl(null);
      return;
    }
    supabase.storage
      .from("avatars")
      .createSignedUrl(profile.avatar_url, 3600)
      .then(({ data }) => {
        if (active) setAvatarUrl(data?.signedUrl ?? null);
      });
    return () => {
      active = false;
    };
  }, [profile?.avatar_url]);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    void navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold tracking-tight">
        Welcome{profile?.first_name ? `, ${profile.first_name}` : ""}
      </h1>
      <p className="mt-2 text-muted-foreground">
        This is your trainee space. Course content arrives in the next sprint.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your profile</CardTitle>
            <CardDescription>Details from your registration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-secondary text-lg font-semibold">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Your profile picture" className="h-full w-full object-cover" />
                ) : (
                  (profile?.first_name?.[0] ?? "?").toUpperCase()
                )}
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {isLoading ? "Loading…" : `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim() || "Trainee"}
                </p>
                <p className="truncate text-sm text-muted-foreground">{profile?.email}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
              Sign out
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Facilitator verification</CardTitle>
            <CardDescription>First-time trainee email check</CardDescription>
          </CardHeader>
          <CardContent>
            {profile?.facilitator_verified ? (
              <p className="flex items-start gap-2 text-sm">
                <BadgeCheck className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
                Your email matches an invite captured by your facilitator. You are verified.
              </p>
            ) : (
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <ShieldAlert className="mt-0.5 h-5 w-5" aria-hidden="true" />
                We could not match your email to a facilitator invite yet. Ask your facilitator to add
                the email you registered with.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
