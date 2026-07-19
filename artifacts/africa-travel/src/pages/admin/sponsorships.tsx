import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Star, User, Clock, CheckCircle2, XCircle, DollarSign } from "lucide-react";
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
  sponsorshipFee: number | null;
  feePaid: boolean;
  acceptedAt: string | null;
  createdAt: string;
}

export default function AdminSponsorships() {
  const { toast } = useToast();
  const [items, setItems] = useState<Sponsorship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<number | null>(null);
  const [editData, setEditData] = useState<{
    status: string;
    adminNotes: string;
    airportInstructions: string;
    sponsorshipFee: string;
  }>({ status: "", adminNotes: "", airportInstructions: "", sponsorshipFee: "" });
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
    setEditData({
      status: s.status,
      adminNotes: s.adminNotes ?? "",
      airportInstructions: s.airportInstructions ?? "",
      sponsorshipFee: s.sponsorshipFee != null ? String(s.sponsorshipFee) : "",
    });
  };

  const handleSave = async (id: number) => {
    setSaving(true);
    try {
      const token = localStorage.getItem("africa_travel_token");
      const payload: Record<string, any> = {
        status: editData.status,
        adminNotes: editData.adminNotes || undefined,
        airportInstructions: editData.airportInstructions || undefined,
      };
      if (editData.sponsorshipFee !== "") payload.sponsorshipFee = parseFloat(editData.sponsorshipFee);

      const res = await fetch(`/api/admin/sponsorships/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast({
        title: "Saved",
        description: editData.status === "accepted"
          ? "Acceptance email sent to the applicant."
          : "Application updated successfully.",
      });
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

  const counts = {
    total: items.length,
    pending: items.filter(i => i.status === "pending" || i.status === "under_review").length,
    accepted: items.filter(i => i.status === "accepted").length,
    feePaid: items.filter(i => i.feePaid).length,
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center">
        <Star className="w-8 h-8 mr-4 text-primary" />
        <div>
          <h1 className="text-3xl font-serif">Sponsorship Applications</h1>
          <p className="text-muted-foreground mt-1">Review applications, set the processing fee, and send acceptance emails.</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", value: counts.total },
          { label: "Pending Review", value: counts.pending, accent: "text-yellow-600" },
          { label: "Accepted", value: counts.accepted, accent: "text-green-600" },
          { label: "Fee Paid", value: counts.feePaid, accent: "text-primary" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{s.label}</p>
            <p className={`text-3xl font-serif ${s.accent ?? ""}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted animate-pulse border border-border" />)}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">No applications yet.</div>
      ) : (
        <div className="space-y-6">
          {items.map(s => (
            <Card key={s.id} className="rounded-none border-border bg-background">
              <CardContent className="p-6">
                {/* Applicant header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{s.fullName}</h3>
                      <p className="text-sm text-muted-foreground">{s.email} · {s.nationality}</p>
                      {s.passportNumber && <p className="text-xs text-muted-foreground">Passport: {s.passportNumber}</p>}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Applied {format(new Date(s.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap justify-end">
                    {s.feePaid && <Badge className="bg-green-100 text-green-800 rounded-none">Fee Paid</Badge>}
                    {s.sponsorshipFee != null && !s.feePaid && (
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 rounded-none">
                        Fee: ${s.sponsorshipFee}
                      </Badge>
                    )}
                    <Badge className={`rounded-none ${statusBadge(s.status)}`}>{s.status.replace("_", " ")}</Badge>
                  </div>
                </div>

                {/* Application statement */}
                <div className="bg-sidebar p-4 border border-border mb-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Application Statement</p>
                  <p className="text-sm">{s.purpose}</p>
                </div>

                {/* Edit panel */}
                {editing === s.id ? (
                  <div className="space-y-4 border border-primary/30 p-5 bg-primary/5">
                    <div className="grid sm:grid-cols-2 gap-4">
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

                      {/* Fee field — always editable so admin can set it before or after accepting */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" /> Processing Fee (USD)
                          <span className="text-muted-foreground text-xs font-normal ml-1">shown to applicant</span>
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          className="rounded-none"
                          placeholder="e.g. 150.00"
                          value={editData.sponsorshipFee}
                          onChange={e => setEditData(d => ({ ...d, sponsorshipFee: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Message to Applicant <span className="text-muted-foreground text-xs font-normal">(shown on their dashboard)</span></Label>
                      <Textarea
                        className="rounded-none"
                        rows={2}
                        value={editData.adminNotes}
                        onChange={e => setEditData(d => ({ ...d, adminNotes: e.target.value }))}
                        placeholder="Optional note to the applicant…"
                      />
                    </div>

                    {editData.status === "accepted" && (
                      <div className="space-y-2">
                        <Label>Airport & Travel Instructions <span className="text-muted-foreground text-xs font-normal">(sent in acceptance email + shown on dashboard)</span></Label>
                        <Textarea
                          className="rounded-none"
                          rows={5}
                          value={editData.airportInstructions}
                          onChange={e => setEditData(d => ({ ...d, airportInstructions: e.target.value }))}
                          placeholder="e.g. Arrive at Terminal 2 by 5:00 AM. Bring two passport copies. Your guide's contact is John — +254 700 000 000…"
                        />
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button className="rounded-none" disabled={saving} onClick={() => handleSave(s.id)}>
                        {saving ? "Saving…" : editData.status === "accepted" ? "Save & Send Email" : "Save Decision"}
                      </Button>
                      <Button variant="outline" className="rounded-none" onClick={() => setEditing(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground italic">
                      {s.adminNotes ? `Note: ${s.adminNotes}` : ""}
                    </div>
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
