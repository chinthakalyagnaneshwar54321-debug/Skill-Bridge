import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { demoRequests, isDemoId } from "@/lib/demoData";
import { DemoBanner } from "@/components/DemoBanner";

export const Route = createFileRoute("/_authenticated/requests")({
  component: RequestsPage,
});

interface RequestRow {
  id: string;
  status: "pending" | "accepted" | "rejected" | "cancelled" | "completed";
  message: string | null;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  sender: { id: string; full_name: string; avatar_url: string | null } | null;
  receiver: { id: string; full_name: string; avatar_url: string | null } | null;
  offered: { title: string } | null;
  requested: { title: string } | null;
}

function RequestsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);
  const [reviewFor, setReviewFor] = useState<{ exchangeId: string; revieweeId: string; name: string } | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("exchange_requests")
      .select(`id, status, message, created_at, sender_id, receiver_id,
        sender:profiles!exchange_requests_sender_id_fkey(id, full_name, avatar_url),
        receiver:profiles!exchange_requests_receiver_id_fkey(id, full_name, avatar_url),
        offered:skills!exchange_requests_offered_skill_id_fkey(title),
        requested:skills!exchange_requests_requested_skill_id_fkey(title)`)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false });
    const real = (data as any as RequestRow[]) ?? [];
    if (real.length === 0) {
      setDemo(true);
      setRows(demoRequests.map((r) => ({
        ...r,
        sender_id: r.sender_id === "self" ? user.id : r.sender_id,
        receiver_id: r.receiver_id === "self" ? user.id : r.receiver_id,
      })) as any);
    } else {
      setDemo(false);
      setRows(real);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const updateStatus = async (r: RequestRow, status: RequestRow["status"]) => {
    if (isDemoId(r.id)) {
      setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, status } : x)));
      toast.success(`Request ${status} (demo)`);
      return;
    }
    const { error } = await supabase.from("exchange_requests").update({ status }).eq("id", r.id);
    if (error) return toast.error(error.message);

    // Send notification to the other party
    const otherId = r.sender_id === user?.id ? r.receiver_id : r.sender_id;
    const type =
      status === "accepted" ? "request_accepted" :
      status === "rejected" ? "request_rejected" :
      status === "completed" ? "request_completed" : null;
    if (type && otherId !== user?.id) {
      await supabase.from("notifications").insert({
        user_id: otherId,
        type,
        title: `Request ${status}`,
        body: `Your skill exchange request was ${status}.`,
        link: "/requests",
      });
    }
    toast.success(`Request ${status}`);
    load();
  };

  const submitReview = async () => {
    if (!user || !reviewFor) return;
    if (isDemoId(reviewFor.exchangeId)) {
      toast.success("Review posted (demo)");
      setReviewFor(null); setComment(""); setRating(5);
      return;
    }
    const { error } = await supabase.from("reviews").insert({
      exchange_id: reviewFor.exchangeId,
      reviewer_id: user.id,
      reviewee_id: reviewFor.revieweeId,
      rating,
      comment: comment.trim().slice(0, 500) || null,
    });
    if (error) return toast.error(error.message);
    await supabase.from("notifications").insert({
      user_id: reviewFor.revieweeId,
      type: "new_review",
      title: "New review",
      body: `You received a ${rating}★ review.`,
      link: "/my-profile",
    });
    toast.success("Review posted");
    setReviewFor(null);
    setComment("");
    setRating(5);
  };

  if (loading) return <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />;

  const incoming = rows.filter((r) => r.receiver_id === user?.id);
  const outgoing = rows.filter((r) => r.sender_id === user?.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Exchange Requests</h1>
        <p className="mt-1 text-muted-foreground">Manage your incoming and outgoing skill swaps.</p>
      </div>

      {demo && <DemoBanner />}

      <Tabs defaultValue="incoming">
        <TabsList>
          <TabsTrigger value="incoming">Incoming ({incoming.length})</TabsTrigger>
          <TabsTrigger value="outgoing">Outgoing ({outgoing.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="incoming" className="mt-4 space-y-3">
          {incoming.length === 0 ? <Empty text="No incoming requests." /> : incoming.map((r) => (
            <RequestCard key={r.id} r={r} viewerId={user!.id} onAccept={() => updateStatus(r, "accepted")} onReject={() => updateStatus(r, "rejected")} onComplete={() => updateStatus(r, "completed")} onReview={() => setReviewFor({ exchangeId: r.id, revieweeId: r.sender_id, name: r.sender?.full_name ?? "student" })} />
          ))}
        </TabsContent>
        <TabsContent value="outgoing" className="mt-4 space-y-3">
          {outgoing.length === 0 ? <Empty text="No outgoing requests. Browse students to send one!" /> : outgoing.map((r) => (
            <RequestCard key={r.id} r={r} viewerId={user!.id} onCancel={() => updateStatus(r, "cancelled")} onComplete={() => updateStatus(r, "completed")} onReview={() => setReviewFor({ exchangeId: r.id, revieweeId: r.receiver_id, name: r.receiver?.full_name ?? "student" })} />
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={!!reviewFor} onOpenChange={(o) => !o && setReviewFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rate {reviewFor?.name}</DialogTitle></DialogHeader>
          <div className="flex justify-center gap-2 py-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <button key={i} onClick={() => setRating(i + 1)}>
                <Star className={`h-8 w-8 transition ${i < rating ? "fill-[color:var(--brand-2)] text-[color:var(--brand-2)]" : "text-muted"}`} />
              </button>
            ))}
          </div>
          <Textarea placeholder="Optional review…" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReviewFor(null)}>Cancel</Button>
            <Button onClick={submitReview} className="bg-gradient-hero text-white">Post review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <Card className="p-8 text-center text-sm text-muted-foreground">{text}</Card>;
}

function RequestCard({ r, viewerId, onAccept, onReject, onCancel, onComplete, onReview }: {
  r: RequestRow; viewerId: string;
  onAccept?: () => void; onReject?: () => void; onCancel?: () => void; onComplete?: () => void; onReview?: () => void;
}) {
  const isReceiver = r.receiver_id === viewerId;
  const other = isReceiver ? r.sender : r.receiver;
  const initials = (other?.full_name || "?").slice(0, 2).toUpperCase();
  const color = statusColor(r.status);

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <Link to="/profile/$id" params={{ id: other?.id ?? "" }}>
          <Avatar className="h-12 w-12">
            <AvatarImage src={other?.avatar_url ?? undefined} />
            <AvatarFallback className="bg-gradient-hero text-sm text-white">{initials}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <div>
              <Link to="/profile/$id" params={{ id: other?.id ?? "" }} className="font-semibold hover:underline">
                {other?.full_name || "Student"}
              </Link>
              <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
            </div>
            <Badge className={color}>{r.status}</Badge>
          </div>
          <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
            <div className="rounded-lg bg-muted px-3 py-2">
              <div className="text-xs font-semibold text-muted-foreground">Offering</div>
              <div>{r.offered?.title ?? "—"}</div>
            </div>
            <div className="rounded-lg bg-muted px-3 py-2">
              <div className="text-xs font-semibold text-muted-foreground">Wants to learn</div>
              <div>{r.requested?.title ?? "—"}</div>
            </div>
          </div>
          {r.message && <p className="mt-2 text-sm italic text-muted-foreground">"{r.message}"</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            {isReceiver && r.status === "pending" && (
              <>
                <Button size="sm" onClick={onAccept} className="bg-gradient-hero text-white">Accept</Button>
                <Button size="sm" variant="outline" onClick={onReject}>Reject</Button>
              </>
            )}
            {!isReceiver && r.status === "pending" && (
              <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
            )}
            {r.status === "accepted" && (
              <Button size="sm" onClick={onComplete} className="bg-gradient-hero text-white">Mark completed</Button>
            )}
            {r.status === "completed" && (
              <Button size="sm" variant="outline" onClick={onReview}><Star className="mr-1 h-3 w-3" /> Leave review</Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function statusColor(status: string) {
  switch (status) {
    case "pending": return "bg-amber-100 text-amber-800 hover:bg-amber-100";
    case "accepted": return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "completed": return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100";
    case "rejected": return "bg-rose-100 text-rose-800 hover:bg-rose-100";
    case "cancelled": return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    default: return "bg-muted";
  }
}
