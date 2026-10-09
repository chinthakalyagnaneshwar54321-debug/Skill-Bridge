import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Trash2, Users, Sparkles, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, skills: 0, requests: 0 });

  useEffect(() => {
    if (!loading && !isAdmin) navigate({ to: "/dashboard", replace: true });
  }, [loading, isAdmin, navigate]);

  const load = async () => {
    const [ps, u, s, r] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email, college, branch, created_at").order("created_at", { ascending: false }).limit(100),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("skills").select("*", { count: "exact", head: true }),
      supabase.from("exchange_requests").select("*", { count: "exact", head: true }),
    ]);
    setProfiles(ps.data ?? []);
    setStats({ users: u.count ?? 0, skills: s.count ?? 0, requests: r.count ?? 0 });
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const removeUser = async (id: string) => {
    if (id === user?.id) return toast.error("You can't delete yourself");
    if (!confirm("Delete this profile? Their skills & requests will cascade.")) return;
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Profile removed");
    load();
  };

  if (loading || !isAdmin) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-hero shadow-glow">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Admin</h1>
          <p className="text-muted-foreground">Manage students, skills and platform data.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Users} label="Total students" value={stats.users} />
        <StatCard icon={Sparkles} label="Total skills" value={stats.skills} />
        <StatCard icon={MessageSquare} label="Total requests" value={stats.requests} />
      </div>

      <Card className="p-6">
        <h2 className="font-bold">Students</h2>
        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>College</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.full_name || "—"}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell>{p.college || "—"}</TableCell>
                  <TableCell>{p.branch || "—"}</TableCell>
                  <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" onClick={() => removeUser(p.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <Card className="p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-hero">
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="mt-3 text-3xl font-extrabold">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </Card>
  );
}
