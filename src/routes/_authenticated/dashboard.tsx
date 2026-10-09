import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Sparkles, Users, CheckCircle2, Clock, TrendingUp, Star } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import { motion } from "motion/react";
import { Link as RLink } from "@tanstack/react-router";
import { demoDashboard, demoRequests } from "@/lib/demoData";
import { DemoBanner } from "@/components/DemoBanner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

interface Stats {
  skills: number;
  pending: number;
  accepted: number;
  completed: number;
  avgRating: number | null;
  reviewsCount: number;
}

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ skills: 0, pending: 0, accepted: 0, completed: 0, avgRating: null, reviewsCount: 0 });
  const [recent, setRecent] = useState<any[]>([]);
  const [byCategory, setByCategory] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [skillsC, pendingC, acceptedC, completedC, reviews, recentReq, skillsWithCats] = await Promise.all([
        supabase.from("skills").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("exchange_requests").select("*", { count: "exact", head: true }).eq("receiver_id", user.id).eq("status", "pending"),
        supabase.from("exchange_requests").select("*", { count: "exact", head: true }).or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).eq("status", "accepted"),
        supabase.from("exchange_requests").select("*", { count: "exact", head: true }).or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).eq("status", "completed"),
        supabase.from("reviews").select("rating").eq("reviewee_id", user.id),
        supabase
          .from("exchange_requests")
          .select("id, status, created_at, sender_id, receiver_id, sender:profiles!exchange_requests_sender_id_fkey(full_name), receiver:profiles!exchange_requests_receiver_id_fkey(full_name)")
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order("created_at", { ascending: false })
          .limit(6),
        supabase.from("skills").select("categories(name)").eq("user_id", user.id),
      ]);

      const ratings = reviews.data ?? [];
      const avg = ratings.length ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : null;

      const empty = (skillsC.count ?? 0) === 0 && (recentReq.data ?? []).length === 0;
      if (empty) {
        setDemo(true);
        setStats(demoDashboard.stats);
        setByCategory(demoDashboard.byCategory);
        setRecent(demoRequests.map((r) => ({
          ...r,
          sender_id: r.sender_id === "self" ? user.id : r.sender_id,
          receiver_id: r.receiver_id === "self" ? user.id : r.receiver_id,
          sender: { full_name: r.sender.full_name },
          receiver: { full_name: r.receiver.full_name },
        })));
        setLoading(false);
        return;
      }
      setDemo(false);
      setStats({
        skills: skillsC.count ?? 0,
        pending: pendingC.count ?? 0,
        accepted: acceptedC.count ?? 0,
        completed: completedC.count ?? 0,
        avgRating: avg,
        reviewsCount: ratings.length,
      });
      setRecent(recentReq.data ?? []);

      const catMap = new Map<string, number>();
      (skillsWithCats.data ?? []).forEach((s: any) => {
        const name = s.categories?.name || "Other";
        catMap.set(name, (catMap.get(name) ?? 0) + 1);
      });
      setByCategory(Array.from(catMap.entries()).map(([name, value]) => ({ name, value })));
      setLoading(false);
    })();
  }, [user]);

  const cards = [
    { label: "Total Skills", value: stats.skills, icon: Sparkles, color: "from-blue-500 to-indigo-600", to: "/skills" },
    { label: "Pending Requests", value: stats.pending, icon: Clock, color: "from-amber-500 to-orange-600", to: "/requests" },
    { label: "Active Exchanges", value: stats.accepted, icon: Users, color: "from-fuchsia-500 to-purple-600", to: "/requests" },
    { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "from-emerald-500 to-teal-600", to: "/requests" },
  ];

  const COLORS = ["#2563EB", "#7C3AED", "#14B8A6", "#F59E0B", "#EC4899", "#06B6D4", "#8B5CF6"];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Track your skills, requests and progress at a glance.</p>
      </div>

      {demo && <DemoBanner />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <RLink to={c.to}>
              <Card className="group relative overflow-hidden p-6 transition hover:-translate-y-1 hover:shadow-glow">
                <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${c.color} opacity-20 blur-2xl transition group-hover:opacity-40`} />
                <div className={`relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${c.color}`}>
                  <c.icon className="h-5 w-5 text-white" />
                </div>
                <div className="mt-4 text-3xl font-extrabold">{loading ? "—" : c.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{c.label}</div>
              </Card>
            </RLink>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Skills by Category</h2>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-4 h-64">
            {byCategory.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Add skills to see your breakdown. <Link to="/skills" className="ml-1 font-semibold text-primary hover:underline">Add now →</Link>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCategory}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={11} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="url(#gradBar)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="100%" stopColor="#7C3AED" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Your Rating</h2>
            <Star className="h-4 w-4 text-[color:var(--brand-2)]" />
          </div>
          <div className="mt-4 flex flex-col items-center justify-center py-6">
            <div className="text-5xl font-extrabold text-gradient">
              {stats.avgRating ? stats.avgRating.toFixed(1) : "—"}
            </div>
            <div className="mt-2 flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-5 w-5 ${stats.avgRating && i < Math.round(stats.avgRating) ? "fill-[color:var(--brand-2)] text-[color:var(--brand-2)]" : "text-muted"}`} />
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">from {stats.reviewsCount} review{stats.reviewsCount === 1 ? "" : "s"}</p>
          </div>
          {byCategory.length > 0 && (
            <div className="h-32">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={byCategory} dataKey="value" innerRadius={30} outerRadius={55} paddingAngle={4}>
                    {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="font-bold">Recent Activity</h2>
        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No activity yet. <Link to="/browse" className="font-semibold text-primary hover:underline">Browse students →</Link>
          </p>
        ) : (
          <ul className="mt-4 divide-y">
            {recent.map((r) => {
              const isSender = r.sender_id === user?.id;
              const other = isSender ? r.receiver?.full_name : r.sender?.full_name;
              return (
                <li key={r.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium">
                      {isSender ? "Request to " : "Request from "}{other ?? "Unknown"}
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(r.status)}`}>{r.status}</span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

function statusColor(status: string) {
  switch (status) {
    case "pending": return "bg-amber-100 text-amber-800";
    case "accepted": return "bg-blue-100 text-blue-800";
    case "completed": return "bg-emerald-100 text-emerald-800";
    case "rejected": return "bg-rose-100 text-rose-800";
    case "cancelled": return "bg-gray-100 text-gray-800";
    default: return "bg-muted text-muted-foreground";
  }
}
