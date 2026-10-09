import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Pencil, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { demoSkills, isDemoId } from "@/lib/demoData";
import { DemoBanner } from "@/components/DemoBanner";

interface Skill {
  id: string;
  title: string;
  description: string | null;
  type: "offered" | "wanted";
  level: "beginner" | "intermediate" | "advanced";
  category_id: string | null;
  categories?: { name: string } | null;
}

interface Category { id: string; name: string; }

export const Route = createFileRoute("/_authenticated/skills")({
  component: SkillsPage,
});

type FormShape = { title: string; description: string; type: "offered" | "wanted"; level: "beginner" | "intermediate" | "advanced"; category_id: string };
const empty: FormShape = { title: "", description: "", type: "offered", level: "intermediate", category_id: "" };

function SkillsPage() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [form, setForm] = useState<FormShape>(empty);
  const [demo, setDemo] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("skills")
      .select("*, categories(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    const real = (data as Skill[]) ?? [];
    setDemo(real.length === 0);
    setSkills(real.length === 0 ? (demoSkills as Skill[]) : real);
  };

  useEffect(() => {
    supabase.from("categories").select("id, name").order("name").then(({ data }) => setCats(data ?? []));
    load();
  }, [user]);

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (s: Skill) => {
    setEditing(s);
    setForm({
      title: s.title,
      description: s.description ?? "",
      type: s.type,
      level: s.level,
      category_id: s.category_id ?? "",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!user) return;
    if (!form.title.trim()) return toast.error("Title required");
    const payload = {
      user_id: user.id,
      title: form.title.trim().slice(0, 100),
      description: form.description.trim().slice(0, 500) || null,
      type: form.type,
      level: form.level,
      category_id: form.category_id || null,
    };
    const { error } = editing
      ? await supabase.from("skills").update(payload).eq("id", editing.id)
      : await supabase.from("skills").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Skill updated" : "Skill added");
    setOpen(false);
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this skill?")) return;
    const { error } = await supabase.from("skills").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  const offered = skills.filter((s) => s.type === "offered");
  const wanted = skills.filter((s) => s.type === "wanted");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My Skills</h1>
          <p className="mt-1 text-muted-foreground">Add what you teach and what you want to learn.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="bg-gradient-hero text-white shadow-glow hover:opacity-90">
              <Plus className="mr-1 h-4 w-4" /> Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit skill" : "Add a skill"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. React fundamentals" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as "offered" | "wanted" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="offered">I can teach</SelectItem>
                      <SelectItem value="wanted">I want to learn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Level</Label>
                  <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Choose category" /></SelectTrigger>
                  <SelectContent>
                    {cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save} className="bg-gradient-hero text-white">Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <SkillColumn title="Skills I teach" empty="Add a skill you can teach." skills={offered} onEdit={openEdit} onDelete={del} tone="teal" />
        <SkillColumn title="Skills I want to learn" empty="Add a skill you'd like to learn." skills={wanted} onEdit={openEdit} onDelete={del} tone="purple" />
      </div>
    </div>
  );
}

function SkillColumn({ title, skills, onEdit, onDelete, empty, tone }: { title: string; skills: Skill[]; onEdit: (s: Skill) => void; onDelete: (id: string) => void; empty: string; tone: "teal" | "purple" }) {
  const chip = tone === "teal" ? "bg-teal-100 text-teal-800" : "bg-purple-100 text-purple-800";
  return (
    <Card className="p-6">
      <h2 className="font-bold">{title}</h2>
      {skills.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-sm text-muted-foreground">
          <Sparkles className="h-6 w-6" /> {empty}
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {skills.map((s) => (
            <li key={s.id} className="group rounded-lg border p-3 transition hover:border-primary/50 hover:shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{s.title}</div>
                  {s.description && <p className="mt-1 text-xs text-muted-foreground">{s.description}</p>}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {s.categories?.name && <Badge variant="secondary" className={chip}>{s.categories.name}</Badge>}
                    <Badge variant="outline">{s.level}</Badge>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <Button size="icon" variant="ghost" onClick={() => onEdit(s)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => onDelete(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
