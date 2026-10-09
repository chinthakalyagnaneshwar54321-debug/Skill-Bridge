import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Github, Linkedin, Save, User as UserIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/my-profile")({
  component: MyProfile,
});

interface ProfileForm {
  full_name: string;
  college: string;
  branch: string;
  year: string;
  bio: string;
  interests: string;
  github_url: string;
  linkedin_url: string;
  contact: string;
  avatar_url: string;
}

function MyProfile() {
  const { user } = useAuth();
  const [form, setForm] = useState<ProfileForm | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      setForm({
        full_name: data?.full_name ?? "",
        college: data?.college ?? "",
        branch: data?.branch ?? "",
        year: data?.year ?? "",
        bio: data?.bio ?? "",
        interests: data?.interests ?? "",
        github_url: data?.github_url ?? "",
        linkedin_url: data?.linkedin_url ?? "",
        contact: data?.contact ?? "",
        avatar_url: data?.avatar_url ?? "",
      });
    });
  }, [user]);

  const save = async () => {
    if (!user || !form) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ ...form })
      .eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile saved");
  };

  if (!form) return <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />;

  const initials = (form.full_name || user?.email || "?").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">My Profile</h1>
        <p className="mt-1 text-muted-foreground">Keep it up to date so other students can find you.</p>
      </div>
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={form.avatar_url || undefined} />
            <AvatarFallback className="bg-gradient-hero text-lg text-white">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Label htmlFor="avatar">Avatar URL</Label>
            <Input id="avatar" placeholder="https://…" value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} />
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Full name" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
          <Field label="Contact (phone/email)" value={form.contact} onChange={(v) => setForm({ ...form, contact: v })} />
          <Field label="College" value={form.college} onChange={(v) => setForm({ ...form, college: v })} />
          <Field label="Branch" value={form.branch} onChange={(v) => setForm({ ...form, branch: v })} />
          <Field label="Year" value={form.year} onChange={(v) => setForm({ ...form, year: v })} placeholder="e.g. 3rd Year" />
          <Field label="Interests" value={form.interests} onChange={(v) => setForm({ ...form, interests: v })} placeholder="e.g. AI, Music, Startups" />
        </div>

        <div className="mt-4">
          <Label>Bio</Label>
          <Textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell students about yourself…" />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="GitHub URL" icon={Github} value={form.github_url} onChange={(v) => setForm({ ...form, github_url: v })} />
          <Field label="LinkedIn URL" icon={Linkedin} value={form.linkedin_url} onChange={(v) => setForm({ ...form, linkedin_url: v })} />
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={save} disabled={saving} className="bg-gradient-hero text-white shadow-glow hover:opacity-90">
            <Save className="mr-2 h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, icon: Icon }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div>
      <Label className="flex items-center gap-1.5">{Icon && <Icon className="h-3.5 w-3.5" />} {label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
