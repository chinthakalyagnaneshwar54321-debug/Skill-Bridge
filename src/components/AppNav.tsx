import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Sparkles, LayoutDashboard, Search, Bell, LogOut, User as UserIcon, ShieldCheck, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function AppNav() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [profile, setProfile] = useState<{ full_name: string; avatar_url: string | null } | null>(null);

  useEffect(() => {
    if (!user) {
      setUnread(0);
      setProfile(null);
      return;
    }
    supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data));

    const loadUnread = async () => {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false);
      setUnread(count ?? 0);
    };
    loadUnread();
    const channel = supabase
      .channel("notif-count")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, loadUnread)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const links = user
    ? [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/browse", label: "Browse", icon: Search },
        { to: "/requests", label: "Requests", icon: Sparkles },
      ]
    : [
        { to: "/", label: "Home", icon: null },
        { to: "/browse", label: "Browse Skills", icon: null },
      ];

  const initials = (profile?.full_name || user?.email || "?").slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero shadow-glow">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">SkillBridge</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {l.icon && <l.icon className="h-4 w-4" />}
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Link to="/notifications" className="relative rounded-lg p-2 hover:bg-muted">
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 min-w-[20px] justify-center rounded-full bg-[color:var(--brand-2)] p-0 text-[10px] text-white">
                    {unread}
                  </Badge>
                )}
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-lg p-1 pr-3 hover:bg-muted">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url ?? undefined} />
                      <AvatarFallback className="bg-gradient-hero text-xs text-white">{initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{profile?.full_name || "Account"}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate({ to: "/my-profile" })}>
                    <UserIcon className="mr-2 h-4 w-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: "/skills" })}>
                    <Sparkles className="mr-2 h-4 w-4" /> My Skills
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate({ to: "/admin" })}>
                      <ShieldCheck className="mr-2 h-4 w-4" /> Admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      await signOut();
                      navigate({ to: "/", replace: true });
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate({ to: "/auth" })}>
                Log in
              </Button>
              <Button
                onClick={() => navigate({ to: "/auth", search: { mode: "signup" } })}
                className="bg-gradient-hero text-white shadow-glow hover:opacity-90"
              >
                Join Free
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-card md:hidden">
          <div className="flex flex-col gap-1 px-6 py-3">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/my-profile" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">Profile</Link>
                <Link to="/skills" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">My Skills</Link>
                {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">Admin</Link>}
                <button
                  onClick={async () => {
                    await signOut();
                    setOpen(false);
                    navigate({ to: "/", replace: true });
                  }}
                  className="rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-muted"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Button onClick={() => { setOpen(false); navigate({ to: "/auth" }); }} className="mt-2 bg-gradient-hero text-white">
                Log in / Sign up
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
