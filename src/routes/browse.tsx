import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppNav } from "@/components/AppNav";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { demoBrowseRows } from "@/lib/demoData";
import { DemoBanner } from "@/components/DemoBanner";

export const Route = createFileRoute("/browse")({
  component: Browse,
});

interface Row {
  id: string;
  title: string;
  description: string | null;
  type: "offered" | "wanted";
  level: string;
  user_id: string;
  categories: { name: string } | null;
  profiles: { id: string; full_name: string; college: string | null; branch: string | null; avatar_url: string | null } | null;
}

function Browse() {
  const [rows, setRows] = useState<Row[]>([]);
  const [cats, setCats] = useState<{ id: string; name: string }[]>([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [type, setType] = useState<string>("offered");
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    supabase.from("categories").select("id, name").order("name").then(({ data }) => setCats(data ?? []));
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let query = supabase
        .from("skills")
        .select("id, title, description, type, level, user_id, categories(name), profiles!skills_user_id_fkey(id, full_name, college, branch, avatar_url)")
        .order("created_at", { ascending: false })
        .limit(60);
      if (type !== "all") query = query.eq("type", type as "offered" | "wanted");
      if (category !== "all") query = query.eq("category_id", category);
      const { data } = await query;
      const real = (data as any as Row[]) ?? [];
      if (real.length === 0) {
        setDemo(true);
        setRows(demoBrowseRows.filter((r) => type === "all" || r.type === type) as any);
      } else {
        setDemo(false);
        setRows(real);
      }
      setLoading(false);
    })();
  }, [category, type]);

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const s = q.toLowerCase();
    return rows.filter((r) =>
      r.title.toLowerCase().includes(s) ||
      r.profiles?.full_name.toLowerCase().includes(s) ||
      r.profiles?.college?.toLowerCase().includes(s) ||
      r.profiles?.branch?.toLowerCase().includes(s) ||
      r.categories?.name.toLowerCase().includes(s)
    );
  }, [q, rows]);

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">Browse Skills</h1>
          <p className="mt-1 text-muted-foreground">Discover what fellow students can teach — or what they want to learn.</p>
          {demo && <div className="mt-4"><DemoBanner text="These are sample students shown until real profiles exist." /></div>}
        </div>

        <Card className="p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search skill, name, college, category…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
            </div>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="offered">Teaching</SelectItem>
                <SelectItem value="wanted">Wants to learn</SelectItem>
                <SelectItem value="all">All types</SelectItem>
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </Card>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-52 animate-pulse bg-muted/40" />
            ))
          ) : filtered.length === 0 ? (
            <Card className="col-span-full p-10 text-center text-sm text-muted-foreground">
              <Sparkles className="mx-auto mb-2 h-6 w-6" /> No skills found. Try clearing filters.
            </Card>
          ) : filtered.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.4) }}>
              <Link to="/profile/$id" params={{ id: r.profiles?.id ?? "" }}>
                <Card className="group h-full p-5 transition hover:-translate-y-1 hover:shadow-glow">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={r.profiles?.avatar_url ?? undefined} />
                      <AvatarFallback className="bg-gradient-hero text-xs text-white">
                        {(r.profiles?.full_name || "?").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-semibold">{r.profiles?.full_name || "Student"}</div>
                      <div className="text-xs text-muted-foreground">
                        {[r.profiles?.college, r.profiles?.branch].filter(Boolean).join(" • ") || "—"}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {r.type === "offered" ? "Teaches" : "Wants to learn"}
                    </div>
                    <h3 className="mt-1 text-lg font-bold">{r.title}</h3>
                    {r.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.description}</p>}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {r.categories?.name && <Badge variant="secondary">{r.categories.name}</Badge>}
                    <Badge variant="outline">{r.level}</Badge>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
