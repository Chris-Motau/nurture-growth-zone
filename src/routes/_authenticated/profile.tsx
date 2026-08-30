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
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
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
    setEmail(data?.email ?? "");
  }, [data]);
  useEffect(() => {
    let active = true;
    if (!data?.avatar_url) {
      setAvatarUrl(null);
      return;
    }
    void supabase.storage
      .from("avatars")
      .createSignedUrl(data.avatar_url, 3600)
      .then(({ data: signed }) => {
        if (active) setAvatarUrl(signed?.signedUrl ?? null);
      });
    return () => {
      active = false;
    };
  }, [data?.avatar_url]);
  const save = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Please sign in again.");
      const nextEmail = email.trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(nextEmail)) throw new Error("Enter a valid email address.");
      if (newPassword && newPassword.length < 8)
        throw new Error("Your new password must be at least 8 characters.");
      if (newPassword && newPassword !== confirmPassword)
        throw new Error("New passwords do not match.");
      const authChanges: { email?: string; password?: string } = {};
      if (nextEmail !== user.user.email?.toLowerCase()) authChanges.email = nextEmail;
      if (newPassword) authChanges.password = newPassword;
      if (Object.keys(authChanges).length) {
        const { error: authError } = await supabase.auth.updateUser(authChanges);
        if (authError) throw authError;
      }
      const { error } = await supabase
        .from("profiles")
        .update({ first_name: firstName.trim(), last_name: lastName.trim() })
        .eq("id", user.user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Profile saved", {
        description: email.trim().toLowerCase() !== data?.email?.toLowerCase()
          ? "Confirm the email-change link sent to your old and new addresses."
          : undefined,
      });
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
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return toast.error("Choose an image under 5MB.");
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return toast.error("Please sign in again.");
    const extension = file.name.split(".").pop() ?? "jpg";
    const path = `${user.user.id}/avatar.${extension}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) return toast.error(error.message);
    const { error: profileError } = await supabase.from("profiles").update({ avatar_url: path }).eq("id", user.user.id);
    if (profileError) return toast.error(profileError.message);
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
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-2xl font-semibold">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Your profile picture" className="h-full w-full object-cover" />
              ) : (
                (firstName[0] ?? "?").toUpperCase()
              )}
            </div>
            <div>
              <p className="font-medium">Profile picture</p>
              <p className="text-sm text-muted-foreground">Optional image, up to 5MB.</p>
            </div>
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
          <label className="block text-sm font-medium">
            Email address
            <Input className="mt-1" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm font-medium">Change password <span className="font-normal text-muted-foreground">(optional)</span></p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">New password<Input className="mt-1" type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></label>
              <label className="text-sm font-medium">Confirm password<Input className="mt-1" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label>
            </div>
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
