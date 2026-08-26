import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, ImagePlus, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  emailSchema,
  fieldErrors,
  loginSchema,
  registerSchema,
  setRememberMe,
} from "@/lib/auth-schemas";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or register — Kaelo LMS" },
      {
        name: "description",
        content:
          "Trainees can register with their facilitator-listed email or sign in to Kaelo LMS to access courses, attendance and submissions.",
      },
      { property: "og:title", content: "Trainee sign in — Kaelo LMS" },
      {
        property: "og:description",
        content: "Register or log in to your Kaelo LMS trainee account.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  const onAuthenticated = async () => {
    await router.invalidate();
    void navigate({ to: "/dashboard", replace: true });
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Trainee access
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use the email address your facilitator registered for you.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign in</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-0">
              <CardTitle className="mt-6 text-lg">Welcome back</CardTitle>
              <CardDescription>Enter your email and password to continue.</CardDescription>
              <CardContent className="px-0 pt-6">
                <LoginForm onSuccess={onAuthenticated} />
              </CardContent>
            </TabsContent>

            <TabsContent value="register" className="mt-0">
              <CardTitle className="mt-6 text-lg">Create your trainee account</CardTitle>
              <CardDescription>Your details are checked against your facilitator's list.</CardDescription>
              <CardContent className="px-0 pt-6">
                <RegisterForm onSuccess={onAuthenticated} onNeedsConfirmation={() => setTab("login")} />
              </CardContent>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        By continuing you agree to our{" "}
        <Link to="/terms" className="underline hover:text-foreground">
          Terms &amp; Conditions
        </Link>{" "}
        and{" "}
        <Link to="/privacy" className="underline hover:text-foreground">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}

function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  placeholder,
  invalid,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  placeholder?: string;
  invalid?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder ?? "••••••••"}
        className={cn("pr-10", invalid && "border-destructive")}
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
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-destructive">{message}</p>;
}

function LoginForm({ onSuccess }: { onSuccess: () => void | Promise<void> }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setBusy(false);

    if (error) {
      const message = /invalid login credentials/i.test(error.message)
        ? "Incorrect email or password. Please try again."
        : /email not confirmed/i.test(error.message)
          ? "Please confirm your email address first — check your inbox."
          : error.message;
      toast.error("Sign in failed", { description: message });
      setErrors({ password: message });
      return;
    }

    setRememberMe(remember);
    toast.success("Signed in", { description: "Welcome back to Kaelo LMS." });
    await onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="you@example.com"
          className={cn("mt-1.5", errors["email"] && "border-destructive")}
        />
        <FieldError {...(errors["email"] ? { message: errors["email"] } : {})} />
      </div>

      <div>
        <Label htmlFor="login-password">Password</Label>
        <div className="mt-1.5">
          <PasswordInput
            id="login-password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            {...(errors["password"] ? { invalid: true } : {})}
          />
        </div>
        <FieldError {...(errors["password"] ? { message: errors["password"] } : {})} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <Checkbox
            checked={remember}
            onCheckedChange={(v) => setRemember(v === true)}
            aria-label="Remember me on this device"
          />
          Remember me on this device
        </label>
        <ForgotPasswordLink email={email} />
      </div>

      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Sign in
      </Button>
    </form>
  );
}

function ForgotPasswordLink({ email }: { email: string }) {
  const [busy, setBusy] = useState(false);

  const handleReset = async () => {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error("Enter your email first", {
        description: "Type your email address above, then tap “Forgot password?”.",
      });
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) {
      toast.error("Could not send reset link", { description: error.message });
      return;
    }
    toast.success("Reset link sent", { description: `Check ${parsed.data} for the link.` });
  };

  return (
    <button
      type="button"
      onClick={handleReset}
      disabled={busy}
      className="shrink-0 text-sm font-medium text-primary underline-offset-4 hover:underline disabled:opacity-60"
    >
      Forgot password?
    </button>
  );
}

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

function RegisterForm({
  onSuccess,
  onNeedsConfirmation,
}: {
  onSuccess: () => void | Promise<void>;
  onNeedsConfirmation: () => void;
}) {
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof typeof values) => (v: string) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Unsupported file", { description: "Please choose an image file." });
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("Image too large", { description: "Profile pictures must be under 5MB." });
      return;
    }
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error as z.ZodError));
      toast.error("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    setBusy(true);

    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { first_name: parsed.data.firstName, last_name: parsed.data.lastName },
      },
    });
    setBusy(false);

    if (error) {
      const message = /already registered|already been registered|user already/i.test(error.message)
        ? "That email is already registered. Try signing in instead."
        : error.message;
      toast.error("Registration failed", { description: message });
      setErrors({ email: message });
      return;
    }

    if (!data.session) {
      toast.success("Account created", {
        description: "Check your inbox to confirm your email, then sign in.",
      });
      onNeedsConfirmation();
      return;
    }

    if (avatar && data.user) {
      const ext = avatar.name.split(".").pop() ?? "jpg";
      const path = `${data.user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, avatar, { upsert: true });
      if (uploadError) {
        toast.warning("Profile picture not uploaded", { description: uploadError.message });
      } else {
        await supabase.from("profiles").update({ avatar_url: path }).eq("id", data.user.id);
      }
    }

    toast.success("Welcome to Kaelo LMS", { description: "Your trainee account is ready." });
    await onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Selected profile picture" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          )}
        </div>
        <div>
          <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            {avatar ? "Change picture" : "Add picture"}
          </Button>
          <p className="mt-1 text-xs text-muted-foreground">Optional · JPG or PNG, up to 5MB</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="reg-first">Name</Label>
          <Input
            id="reg-first"
            value={values.firstName}
            onChange={(e) => set("firstName")(e.target.value)}
            autoComplete="given-name"
            className={cn("mt-1.5", errors["firstName"] && "border-destructive")}
          />
          <FieldError {...(errors["firstName"] ? { message: errors["firstName"] } : {})} />
        </div>
        <div>
          <Label htmlFor="reg-last">Surname</Label>
          <Input
            id="reg-last"
            value={values.lastName}
            onChange={(e) => set("lastName")(e.target.value)}
            autoComplete="family-name"
            className={cn("mt-1.5", errors["lastName"] && "border-destructive")}
          />
          <FieldError {...(errors["lastName"] ? { message: errors["lastName"] } : {})} />
        </div>
      </div>

      <div>
        <Label htmlFor="reg-email">Email</Label>
        <Input
          id="reg-email"
          type="email"
          value={values.email}
          onChange={(e) => set("email")(e.target.value)}
          autoComplete="email"
          placeholder="you@example.com"
          className={cn("mt-1.5", errors["email"] && "border-destructive")}
        />
        <FieldError {...(errors["email"] ? { message: errors["email"] } : {})} />
      </div>

      <div>
        <Label htmlFor="reg-password">Password</Label>
        <div className="mt-1.5">
          <PasswordInput
            id="reg-password"
            value={values.password}
            onChange={set("password")}
            autoComplete="new-password"
            {...(errors["password"] ? { invalid: true } : {})}
          />
        </div>
        <FieldError {...(errors["password"] ? { message: errors["password"] } : {})} />
      </div>

      <div>
        <Label htmlFor="reg-confirm">Confirm password</Label>
        <div className="mt-1.5">
          <PasswordInput
            id="reg-confirm"
            value={values.confirmPassword}
            onChange={set("confirmPassword")}
            autoComplete="new-password"
            {...(errors["confirmPassword"] ? { invalid: true } : {})}
          />
        </div>
        <FieldError {...(errors["confirmPassword"] ? { message: errors["confirmPassword"] } : {})} />
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-border bg-secondary/50 p-3 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
        <span>
          On your first sign-in we check your email against the list your facilitator submitted. If it
          matches, your account is verified automatically.
        </span>
      </div>

      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Create account
      </Button>
    </form>
  );
}
