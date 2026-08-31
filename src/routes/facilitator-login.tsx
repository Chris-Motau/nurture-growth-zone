import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { emailSchema, fieldErrors, loginSchema } from "@/lib/auth-schemas";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/facilitator-login")({
  head: () => ({
    meta: [
      { title: "Facilitator sign in — Hamonate LMS" },
      {
        name: "description",
        content:
          "Facilitators sign in to Hamonate LMS with the email and password registered for them in the system. Accounts are created by the administrator.",
      },
      { property: "og:title", content: "Facilitator sign in — Hamonate LMS" },
      {
        property: "og:description",
        content: "Staff access to Hamonate LMS for facilitators managing trainees, attendance and submissions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FacilitatorLoginPage,
});

function FacilitatorLoginPage() {
  const navigate = useNavigate();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [resetting, setResetting] = useState(false);

  const redirectStaff = async (userId: string) => {
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const isAdmin = (roles ?? []).some((role) => role.role === "admin");
    void navigate({ to: isAdmin ? "/admin" : "/admin/trainees", replace: true });
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) void redirectStaff(data.session.user.id);
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setBusy(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      setBusy(false);
      const message = /invalid login credentials/i.test(error.message)
        ? "Incorrect email or password. Facilitator accounts are created by the administrator."
        : /email not confirmed/i.test(error.message)
          ? "This account has not been confirmed yet — check your inbox."
          : error.message;
      toast.error("Sign in failed", { description: message });
      setErrors({ password: message });
      return;
    }

    // Verify the signed-in account is actually a facilitator.
    const { data: roles, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user!.id);

    const isFacilitator = !roleError && (roles ?? []).some((r) => r.role === "facilitator" || r.role === "admin");

    if (!isFacilitator) {
      await supabase.auth.signOut();
      setBusy(false);
      const message = "This email is not registered as a facilitator. Use the trainee sign in instead.";
      toast.error("Access denied", { description: message });
      setErrors({ email: message });
      return;
    }

    setBusy(false);
    toast.success("Signed in", { description: "Welcome back to Hamonate LMS." });
    await router.invalidate();
    const isAdmin = (roles ?? []).some((role) => role.role === "admin");
    void navigate({ to: isAdmin ? "/admin" : "/admin/trainees", replace: true });
  };

  const handleReset = async () => {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error("Enter your email first", {
        description: "Type your facilitator email above, then tap “Forgot password?”.",
      });
      return;
    }
    setResetting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResetting(false);
    if (error) {
      toast.error("Could not send reset link", { description: error.message });
      return;
    }
    toast.success("Reset link sent", { description: `Check ${parsed.data} for the link.` });
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Facilitator access</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in with the credentials registered for you in the system.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Staff sign in</CardTitle>
          <CardDescription>Facilitator accounts are created by the administrator — there is no self-registration.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="fac-email">Email</Label>
              <Input
                id="fac-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@hamonate.co.za"
                className={cn("mt-1.5", errors["email"] && "border-destructive")}
              />
              {errors["email"] ? <p className="mt-1.5 text-xs text-destructive">{errors["email"]}</p> : null}
            </div>

            <div>
              <Label htmlFor="fac-password">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="fac-password"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={cn("pr-10", errors["password"] && "border-destructive")}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                  aria-pressed={show}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors["password"] ? <p className="mt-1.5 text-xs text-destructive">{errors["password"]}</p> : null}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleReset}
                disabled={resetting}
                className="text-sm font-medium text-primary underline-offset-4 hover:underline disabled:opacity-60"
              >
                Forgot password?
              </button>
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-border bg-secondary/50 p-3 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <span>
                Your email and password are checked against the facilitator records held in the system database.
              </span>
            </div>

            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Are you a trainee?{" "}
        <Link to="/auth" className="font-medium text-primary underline-offset-4 hover:underline">
          Trainee sign in
        </Link>
      </p>
    </div>
  );
}
