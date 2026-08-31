import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About us" },
  { to: "/location", label: "Company location" },
  { to: "/privacy", label: "Privacy & Policy" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { session, loading } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    setOpen(false);
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <img
            src="/favicon.png"
            alt="Hamonate Learning Management System logo"
            width={36}
            height={36}
            className="h-9 w-9 rounded-lg object-contain"
          />
          <span className="font-display text-lg font-bold tracking-tight">Hamonate LMS</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {loading ? null : session ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/admin">Admin</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/courses">Courses</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/dashboard">My dashboard</Link>
              </Button>
              <Button size="sm" variant="outline" onClick={handleSignOut}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/facilitator-login">Facilitator sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/auth">Sign in</Link>
              </Button>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <div className={cn("border-t border-border/70 md:hidden", open ? "block" : "hidden")}>
        <nav aria-label="Mobile" className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
          {loading ? null : session ? (
            <>
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                Admin
              </Link>
              <Link
                to="/courses"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                Courses
              </Link>
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                My dashboard
              </Link>
              <Button variant="outline" size="sm" className="mt-1" onClick={handleSignOut}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="sm" className="mt-1">
                <Link to="/auth" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="mt-1">
                <Link to="/facilitator-login" onClick={() => setOpen(false)}>
                  Facilitator sign in
                </Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
