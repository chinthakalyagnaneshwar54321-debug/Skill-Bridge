import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppNav } from "@/components/AppNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Github, Linkedin, Mail, Star, MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile/$id")({
  component: ProfilePage,
});

function ProfilePage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [mySkills, setMySkills] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [offeredId, setOfferedId] = useState<string>("");
  const [wantedId, setWantedId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [p, s, r] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
        supabase.from("skills").select("*, categories(name)").eq("user_id", id),
        supabase
          .from("reviews")
          .select("*, reviewer:profiles!reviews_reviewer_id_fkey(full_name, avatar_url)")
          .eq("reviewee_id", id)
          .order("created_at", { ascending: false }),
      ]);
      setProfile(p.data);
      setSkills(s.data ?? []);
      setReviews(r.data ?? []);
      setLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    if (!user) return;
    supabase.from("skills").select("id, title, type").eq("user_id", user.id).then(({ data }) => setMySkills(data ?? []));
  }, [user]);

  const offered = skills.filter((s) => s.type === "offered");
  const wanted = skills.filter((s) => s.type === "wanted");
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;

  const sendRequest = async () => {
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    const { error } = await supabase.from("exchange_requests").insert({
      sender_id: user.id,
      receiver_id: id,
      offered_skill_id: offeredId || null,
      requested_skill_id: wantedId || null,
      message: msg.trim().slice(0, 500) || null,
    });
    if (error) return toast.error(error.message);
    await supabase.from("notifications").insert({
      user_id: id,
      type: "request_received",
      title: "New skill exchange request",
      body: "You have a new request. Review it now.",
      link: "/requests",
    });
    toast.success("Request sent!");
    setOpen(false);
    setMsg("");
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (!profile) return (
    <div className="min-h-screen"><AppNav /><div className="mx-auto max-w-3xl p-12 text-center"><p>Student not found.</p><Link to="/browse" className="text-primary">← Back to browse</Link></div></div>
  );

  const initials = (profile.full_name || "?").slice(0, 2).toUpperCase();
  const isSelf = user?.id === id;

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        <Card className="overflow-hidden">
          <div className="h-32 bg-gradient-hero" />
          <div className="px-6 pb-6">
            <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src={profile.avatar_url ?? undefined} />
                <AvatarFallback className="bg-gradient-hero text-2xl text-white">{initials}</AvatarFallback>
              </Avatar>
              {!isSelf && (
                <Dialog open={open} onOpenChange={setOpen}>
                  <Button onClick={() => setOpen(true)} className="bg-gradient-hero text-white shadow-glow">
                    <MessageSquarePlus className="mr-1 h-4 w-4" /> Send Request
                  </Button>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Send exchange request</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                      <div>
                        <div className="mb-1 text-sm font-medium">Skill you'll teach</div>
                        <Select value={offeredId} onValueChange={setOfferedId}>
                          <SelectTrigger><SelectValue placeholder="Pick from your offered skills" /></SelectTrigger>
                          <SelectContent>
                            {mySkills.filter(s => s.type === "offered").map((s) => (
                              <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <div className="mb-1 text-sm font-medium">Skill you want to learn from them</div>
                        <Select value={wantedId} onValueChange={setWantedId}>
                          <SelectTrigger><SelectValue placeholder="Pick one of their skills" /></SelectTrigger>
                          <SelectContent>
                            {offered.map((s) => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <Textarea placeholder="Say hi and describe what you'd like to swap…" value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={500} />
                    </div>
                    <DialogFooter>
                      <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                      <Button onClick={sendRequest} className="bg-gradient-hero text-white">Send</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            <div className="mt-4">
              <h1 className="text-2xl font-extrabold">{profile.full_name || "Student"}</h1>
              <p className="text-sm text-muted-foreground">
                {[profile.college, profile.branch, profile.year].filter(Boolean).join(" • ") || "Student"}
              </p>
              {avg && (
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-[color:var(--brand-2)] text-[color:var(--brand-2)]" />
                  <span className="font-bold">{avg.toFixed(1)}</span>
                  <span className="text-muted-foreground">({reviews.length} review{reviews.length === 1 ? "" : "s"})</span>
                </div>
              )}
              {profile.bio && <p className="mt-4 text-sm">{profile.bio}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.github_url && <SocialLink href={profile.github_url} icon={Github} label="GitHub" />}
                {profile.linkedin_url && <SocialLink href={profile.linkedin_url} icon={Linkedin} label="LinkedIn" />}
                {profile.contact && <SocialLink href={`mailto:${profile.contact}`} icon={Mail} label={profile.contact} />}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <SkillList title="Teaches" skills={offered} tone="teal" />
          <SkillList title="Wants to learn" skills={wanted} tone="purple" />
        </div>

        <Card className="p-6">
          <h2 className="font-bold">Reviews</h2>
          {reviews.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {reviews.map((r) => (
                <li key={r.id} className="border-b pb-4 last:border-none">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={r.reviewer?.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs">{(r.reviewer?.full_name || "?").slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm font-semibold">{r.reviewer?.full_name || "Anonymous"}</div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-[color:var(--brand-2)] text-[color:var(--brand-2)]" : "text-muted"}`} />
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className="mt-2 text-sm text-muted-foreground">"{r.comment}"</p>}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </main>
    </div>
  );
}

function SkillList({ title, skills, tone }: { title: string; skills: any[]; tone: "teal" | "purple" }) {
  const chip = tone === "teal" ? "bg-teal-100 text-teal-800" : "bg-purple-100 text-purple-800";
  return (
    <Card className="p-6">
      <h2 className="font-bold">{title}</h2>
      {skills.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">None yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {skills.map((s) => (
            <li key={s.id} className="rounded-lg border p-3">
              <div className="font-semibold">{s.title}</div>
              {s.description && <p className="mt-1 text-xs text-muted-foreground">{s.description}</p>}
              <div className="mt-2 flex gap-1">
                {s.categories?.name && <Badge className={chip}>{s.categories.name}</Badge>}
                <Badge variant="outline">{s.level}</Badge>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function SocialLink({ href, icon: Icon, label }: { href: string; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted">
      <Icon className="h-3.5 w-3.5" /> {label}
    </a>
  );
}
