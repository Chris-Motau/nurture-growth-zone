import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
export const Route = createFileRoute("/_authenticated/admin/profile")({ component: AdminProfile });
function AdminProfile() {
  const client = useQueryClient();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const { data } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  useEffect(() => {
    setFirstName(data?.first_name ?? "");
    setLastName(data?.last_name ?? "");
  }, [data]);
  const save = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Please sign in again.");
      const { error } = await supabase
        .from("profiles")
        .update({ first_name: firstName.trim(), last_name: lastName.trim() })
        .eq("id", user.user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile saved");
      void client.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => toast.error(error.message),
  });
  async function signOut() {
    client.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/facilitator-login", replace: true });
  }
  return (
    <main>
      <h1 className="font-display text-3xl font-bold">My profile</h1>
      <Card className="mt-7 max-w-xl">
        <CardHeader>
          <CardTitle>Staff details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{data?.email}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="First name"
            />
            <Input
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              placeholder="Last name"
            />
          </div>
          <Button disabled={save.isPending} onClick={() => save.mutate()}>
            Save changes
          </Button>
        </CardContent>
      </Card>
      <Button variant="outline" className="mt-5" onClick={() => void signOut()}>
        Sign out
      </Button>
    </main>
  );
}
