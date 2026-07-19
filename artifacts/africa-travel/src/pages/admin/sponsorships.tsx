import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Star, User, Clock, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";

interface Sponsorship {
  id: number;
  fullName: string;
  email: string;
  nationality: string;
  passportNumber: string | null;
  purpose: string;
  status: string;
  adminNotes: string | null;
  airportInstructions: string | null;
  feePaid: boolean;
  acceptedAt: string | null;
  createdAt: string;
}

export default function AdminSponsorships() {
  const { toast } = useToast();
  const [items, setItems] = useState<Sponsorship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<number | null>(null);
  const [editData, setEditData] = useState<{ status: string; adminNotes: string; airportInstructions: string }>({
    status: "", adminNotes: "", airportInstructions: "",
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const token = localStorage.getItem("africa_travel_token");
    const res = await fetch("/api/admin/sponsorships", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setItems(await res.json());
    setIsLoading(false);
  };

  useEffect(() => { load(); }, []);

  const startEdit = (s: Sponsorship) => {
    setEditing(s.id);
    setEditData({ status: s.status, adminNotes: s.adminNotes ?? "", airportInstructions: s.airportInstructions ?? "" });
  };

  const handleSave = async (id: number) => {
    setSaving(true);
    try {
      const token = localStorage.getItem("africa_travel_token");
      const res = await fetch(`/api/admin/sponsorships/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editData),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast({ title: "Saved", description: editData.status === "accepted" ? "Acceptance email sent to applicant." : undefined });
      setEditing(null);
      load();
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      under_review: "bg-blue-100 text-blue-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return map[status] ?? "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center">
        <Star className="w-8 h-8 mr-4 text-primary" />
        <div>
          <h1 className="text-3xl font-serif">Sponsorship Applications</h1>
          <p className="text-muted-foreground mt-1">Review and manage sponsorship requests. Accepting sends an email to the applicant.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-muted animate-pulse border border-border" />)}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">No applications yet.</div>
      ) : (
        <div className="space-y-6">
          {items.map(s => (
            <Card key={s.id} className="rounded-none border-border bg-background">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{s.fullName}</h3>
                      <p className="text-sm text-muted-foreground">{s.email} · {s.nationality}</p>
                      {s.passportNumber && <p className="text-xs text-muted-foreground">Passport: {s.passportNumber}</p>}
                      <p className="text-xs text-muted-foreground mt-0.5">Applied {format(new Date(s.createdAt), "MMM d, yyyy 'at' h:mm a")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {s.feePaid && <Badge className="bg-green-100 text-green-800 rounded-none">Fee Paid</Badge>}
                    <Badge className={`rounded-none ${statusBadge(s.status)}`}>{s.status}</Badge>
                  </div>
                </div>

                <div className="bg-sidebar p-4 border border-border mb-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Application Statement</p>
                  <p className="text-sm">{s.purpose}</p>
                </div>

                {editing === s.id ? (
                  <div className="space-y-4 border border-primary/30 p-4 bg-primary/5">
                    <div className="space-y-2">
                      <Label>Decision</Label>
                      <Select value={editData.status} onValueChange={v => setEditData(d => ({ ...d, status: v }))}>
                        <SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="under_review">Under Review</SelectItem>
                          <SelectItem value="accepted">Accept ✓</SelectItem>
                          <SelectItem value="rejected">Reject ✗</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Admin Notes <span className="text-muted-foreground text-xs">(shown to applicant)</span></Label>
                      <Textarea
                        className="rounded-none"
                        rows={2}
                        value={editData.adminNotes}
                        onChange={e => setEditData(d => ({ ...d, adminNotes: e.target.value }))}
                        placeholder="Optional note to the applicant..."
                      />
                    </div>
                    {editData.status === "accepted" && (
                      <div className="space-y-2">
                        <Label>Airport & Travel Instructions <span className="text-muted-foreground text-xs">(included in acceptance email)</span></Label>
                        <Textarea
                          className="rounded-none"
                          rows={5}
                          value={editData.airportInstructions}
                          onChange={e => setEditData(d => ({ ...d, airportInstructions: e.target.value }))}
                          placeholder="e.g. Arrive at terminal 2 by 5:00 AM. Bring two copies of your passport. Your tour guide's contact is..."
                        />
                      </div>
                    )}
                    <div className="flex gap-3">
                      <Button className="rounded-none" disabled={saving} onClick={() => handleSave(s.id)}>
                        {saving ? "Saving..." : "Save Decision"}
                      </Button>
                      <Button variant="outline" className="rounded-none" onClick={() => setEditing(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    {s.adminNotes && (
                      <p className="text-sm text-muted-foreground italic">Note: {s.adminNotes}</p>
                    )}
                    <Button variant="outline" className="rounded-none ml-auto" onClick={() => startEdit(s)}>
                      Review Application
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
