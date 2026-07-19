import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Star, Clock, CheckCircle2, XCircle, Plane, CreditCard, AlertCircle } from "lucide-react";
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

export default function MySponsorships() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Sponsorship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paying, setPaying] = useState<number | null>(null);

  const load = async () => {
    const token = localStorage.getItem("africa_travel_token");
    const res = await fetch("/api/sponsorships/mine", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setItems(await res.json());
    setIsLoading(false);
  };

  useEffect(() => { if (user) load(); }, [user]);

  const handlePay = async (id: number) => {
    if (!confirm("Confirm fee payment to secure your sponsorship spot?")) return;
    setPaying(id);
    try {
      const token = localStorage.getItem("africa_travel_token");
      const res = await fetch(`/api/sponsorships/${id}/pay`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast({ title: "Payment confirmed!", description: "Your travel package will be prepared shortly." });
      load();
    } catch (err: any) {
      toast({ title: "Payment failed", description: err.message, variant: "destructive" });
    } finally {
      setPaying(null);
    }
  };

  const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    pending:      { color: "bg-yellow-100 text-yellow-800", icon: <Clock className="w-4 h-4" />,         label: "Under Review" },
    under_review: { color: "bg-blue-100 text-blue-800",    icon: <Clock className="w-4 h-4" />,         label: "Under Review" },
    accepted:     { color: "bg-green-100 text-green-800",  icon: <CheckCircle2 className="w-4 h-4" />,  label: "Accepted 🎉" },
    rejected:     { color: "bg-red-100 text-red-800",      icon: <XCircle className="w-4 h-4" />,       label: "Not Selected" },
  };

  return (
    <div className="pb-24 pt-10 min-h-screen bg-sidebar">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif mb-2">My Sponsorships</h1>
            <p className="text-muted-foreground">Track the status of your sponsorship applications.</p>
          </div>
          <Button asChild className="rounded-none">
            <Link href="/sponsorships">New Application</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">{[1, 2].map(i => <div key={i} className="h-48 bg-muted animate-pulse border border-border" />)}</div>
        ) : items.length === 0 ? (
          <Card className="rounded-none border-dashed text-center py-20">
            <CardContent>
              <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-serif mb-2">No Applications Yet</h3>
              <p className="text-muted-foreground mb-6">Apply for our free sponsorship programme and travel Africa on us.</p>
              <Button asChild className="rounded-none"><Link href="/sponsorships">Apply Now</Link></Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {items.map(s => {
              const cfg = statusConfig[s.status] ?? statusConfig.pending;
              return (
                <Card key={s.id} className="rounded-none border-border bg-background">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          Applied {format(new Date(s.createdAt), "MMM d, yyyy")}
                        </p>
                        <h3 className="font-serif text-xl">{s.fullName}</h3>
                        <p className="text-sm text-muted-foreground">{s.nationality}</p>
                      </div>
                      <Badge className={`rounded-none flex items-center gap-1.5 ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{s.purpose}</p>

                    {/* Accepted state */}
                    {s.status === "accepted" && (
                      <div className="space-y-4 mt-2">
                        <Separator />

                        <div className="bg-green-50 border border-green-200 p-4">
                          <p className="text-green-800 font-semibold text-sm mb-1 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Congratulations! Your application has been accepted.
                          </p>
                          {s.acceptedAt && (
                            <p className="text-xs text-green-700">Accepted on {format(new Date(s.acceptedAt), "MMMM d, yyyy")}</p>
                          )}
                        </div>

                        {/* Airport Instructions */}
                        {s.airportInstructions && (
                          <div className="bg-blue-50 border border-blue-200 p-4">
                            <div className="flex items-center gap-2 text-blue-800 font-medium mb-2 text-sm">
                              <Plane className="w-4 h-4" /> Airport & Travel Instructions
                            </div>
                            <p className="text-sm text-blue-700 whitespace-pre-line">{s.airportInstructions}</p>
                          </div>
                        )}

                        {/* Payment section */}
                        {!s.feePaid ? (
                          <div className="bg-primary/5 border border-primary/20 p-5">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-base">Processing Fee Required</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Pay to confirm your travel spot and receive your full travel package.</p>
                                {s.sponsorshipFee != null ? (
                                  <p className="text-3xl font-serif text-primary mt-2">
                                    ${s.sponsorshipFee.toFixed(2)}
                                  </p>
                                ) : (
                                  <div className="flex items-center gap-1.5 mt-2 text-amber-700 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    Fee amount being finalised — check back shortly.
                                  </div>
                                )}
                              </div>
                              {s.sponsorshipFee != null && (
                                <Button
                                  className="rounded-none gap-2"
                                  disabled={paying === s.id}
                                  onClick={() => handlePay(s.id)}
                                >
                                  <CreditCard className="w-4 h-4" />
                                  {paying === s.id ? "Processing…" : "Pay Fee"}
                                </Button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-green-50 border border-green-200 p-4 flex items-center gap-2 text-green-700 text-sm">
                            <CheckCircle2 className="w-4 h-4" /> Fee paid — your travel package is being prepared.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Admin notes */}
                    {s.adminNotes && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Message from Our Team</p>
                        <p className="text-sm">{s.adminNotes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
