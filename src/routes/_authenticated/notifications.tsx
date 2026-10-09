import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { demoNotifications, isDemoId } from "@/lib/demoData";
import { DemoBanner } from "@/components/DemoBanner";

export const Route = createFileRoute("/_authenticated/notifications")({
  component: NotificationsPage,
});

interface Notif {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

function NotificationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notif[]>([]);
  const [demo, setDemo] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    const real = data ?? [];
    setDemo(real.length === 0);
    setItems(real.length === 0 ? (demoNotifications as Notif[]) : real);
  };

  useEffect(() => { load(); }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    if (demo) return setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    load();
  };

  const markOne = async (id: string) => {
    if (isDemoId(id)) return setItems((prev) => prev.map((i) => (i.id === id ? { ...i, read: true } : i)));
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    load();
  };

  const del = async (id: string) => {
    if (isDemoId(id)) { setItems((prev) => prev.filter((i) => i.id !== id)); toast.success("Deleted (demo)"); return; }
    await supabase.from("notifications").delete().eq("id", id);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Notifications</h1>
          <p className="mt-1 text-muted-foreground">Stay on top of your exchanges.</p>
        </div>
        {items.some((i) => !i.read) && (
          <Button variant="outline" onClick={markAllRead}><Check className="mr-1 h-4 w-4" /> Mark all read</Button>
        )}
      </div>

      {demo && <DemoBanner />}

      {items.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 p-12 text-center">
          <Bell className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No notifications yet.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <Card key={n.id} className={`p-4 transition ${n.read ? "" : "border-primary/30 bg-primary/5"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{n.title}</div>
                  {n.body && <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>}
                  <div className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</div>
                </div>
                <div className="flex gap-1">
                  {!n.read && <Button size="icon" variant="ghost" onClick={() => markOne(n.id)}><Check className="h-4 w-4" /></Button>}
                  <Button size="icon" variant="ghost" onClick={() => del(n.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
