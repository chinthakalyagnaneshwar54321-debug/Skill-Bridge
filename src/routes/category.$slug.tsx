import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppNav } from "@/components/AppNav";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Search, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { demoCategoryRows } from "@/lib/demoData";
import { DemoBanner } from "@/components/DemoBanner";

export const Route = createFileRoute("/category/$slug")({
  component: CategoryPage,
  head: ({ params }) => {
    const title = categoryNames[params.slug] ?? "Skill Category";
    return {
      meta: [
        { title: `${title} Skills — SkillBridge` },
        { name: "description", content: `Discover students sharing ${title.toLowerCase()} skills on SkillBridge.` },
        { property: "og:title", content: `${title} Skills — SkillBridge` },
        { property: "og:description", content: `Discover students sharing ${title.toLowerCase()} skills on SkillBridge.` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
});

const categoryNames: Record<string, string> = {
  programming: "Programming",
  "web-development": "Web Development",
  "ai-ml": "AI & ML",
  "ui-ux": "UI/UX Design",
  cloud: "Cloud Computing",
  "public-speaking": "Public Speaking",
};

interface CategoryRow {
  id: string;
  title: string;
  description: string | null;
  type: "offered" | "wanted";
  level: string;
  user_id: string;
  categories: { name: string } | null;
  profiles: { id: string; full_name: string; college: string | null; branch: string | null; avatar_url: string | null } | null;
}

function CategoryPage() {
  const { slug } = Route.useParams();
  const [categoryName, setCategoryName] = useState(categoryNames[slug] ?? "Skill Category");
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data: category } = await supabase.from("categories").select("id, name").eq("slug", slug).maybeSingle();
      if (!active) return;
      if (category) setCategoryName(slug === "ai-ml" ? "AI & ML" : category.name);

      const { data } = category
        ? await supabase
            .from("skills")
            .select("id, title, description, type, level, user_id, categories(name), profiles!skills_user_id_fkey(id, full_name, college, branch, avatar_url)")
            .eq("category_id", category.id)
            .order("created_at", { ascending: false })
            .limit(60)
        : { data: null };
      const real = (data as CategoryRow[] | null) ?? [];
      setDemo(real.length === 0);
      setRows(real.length === 0 ? (demoCategoryRows[slug] as CategoryRow[] | undefined) ?? [] : real);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [slug]);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return rows;
    return rows.filter((row) => [row.title, row.description, row.profiles?.full_name, row.profiles?.college, row.profiles?.branch]
      .filter(Boolean)
      .some((value) => value?.toLowerCase().includes(search)));
  }, [query, rows]);

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <div className="mb-8 mt-6">
          <h1 className="text-3xl font-extrabold tracking-tight">{categoryName} Skills</h1>
          <p className="mt-1 text-muted-foreground">Discover students who teach or want to learn in {categoryName}.</p>
          {demo && <div className="mt-4"><DemoBanner text="These sample skills help you explore the category before real listings are added." /></div>}
        </div>

        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={`Search ${categoryName.toLowerCase()} skills or students…`} value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" />
          </div>
        </Card>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => <Card key={index} className="h-52 animate-pulse bg-muted/40" />)
          ) : filtered.length === 0 ? (
            <Card className="col-span-full p-10 text-center text-sm text-muted-foreground">
              <Sparkles className="mx-auto mb-2 h-6 w-6" /> No skills found in this category.
            </Card>
          ) : filtered.map((row, index) => (
            <motion.div key={row.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.03, 0.4) }}>
              <Link to="/profile/$id" params={{ id: row.profiles?.id ?? row.user_id }}>
                <Card className="group h-full p-5 transition hover:-translate-y-1 hover:shadow-glow">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={row.profiles?.avatar_url ?? undefined} />
                      <AvatarFallback className="bg-gradient-hero text-xs text-white">{(row.profiles?.full_name || "?").slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-semibold">{row.profiles?.full_name || "Student"}</div>
                      <div className="text-xs text-muted-foreground">{[row.profiles?.college, row.profiles?.branch].filter(Boolean).join(" • ") || "—"}</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{row.type === "offered" ? "Teaches" : "Wants to learn"}</div>
                    <h2 className="mt-1 text-lg font-bold">{row.title}</h2>
                    {row.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{row.description}</p>}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <Badge variant="secondary">{categoryName}</Badge>
                    <Badge variant="outline">{row.level}</Badge>
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