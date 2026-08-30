import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/profile")({ component: ProfilePage });
function ProfilePage() {
  const navigate = useNavigate();
  const client = useQueryClient();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
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
    await client.cancelQueries();
    client.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    void navigate({ to: "/auth", replace: true });
  }
  async function changeAvatar(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) { toast.error("Choose an image under 5MB."); return; }
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) { toast.error("Please sign in again."); return; }
    const extension = file.name.split(".").pop() ?? "jpg";
    const path = `${user.user.id}/avatar.${extension}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) { toast.error(error.message); return; }
    const { error: profileError } = await supabase.from("profiles").update({ avatar_url: path }).eq("id", user.user.id);
    if (profileError) { toast.error(profileError.message); return; }
    toast.success("Profile picture updated");
    await client.invalidateQueries({ queryKey: ["profile"] });
  }
  return (
    <main className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Your profile</h1>
      <p className="mt-2 text-muted-foreground">Keep your trainee details up to date.</p>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Personal details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <p className="mt-1 text-sm text-muted-foreground">{data?.email}</p>
          </div>
          <div>
            <input ref={fileRef} className="hidden" type="file" accept="image/*" onChange={(e) => void changeAvatar(e.target.files?.[0] ?? null)} />
            <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>Change profile picture</Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">
              First name
              <Input
                className="mt-1"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
              />
            </label>
            <label className="text-sm font-medium">
              Last name
              <Input
                className="mt-1"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
            </label>
          </div>
          <Button disabled={save.isPending} onClick={() => save.mutate()}>
            Save changes
          </Button>
        </CardContent>
      </Card>
      <Button variant="outline" className="mt-5" onClick={() => void signOut()}>
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </Button>
    </main>
  );
}
