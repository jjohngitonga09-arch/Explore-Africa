import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Star, Shield, Globe, CheckCircle2 } from "lucide-react";

export default function Sponsorships() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    nationality: user?.nationality ?? "",
    passportNumber: "",
    purpose: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setLocation("/login"); return; }
    if (!form.fullName || !form.email || !form.nationality || !form.purpose) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("africa_travel_token");
      const res = await fetch("/api/sponsorships", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      toast({ title: "Application submitted!", description: "Our team will review your application." });
      setLocation("/my-sponsorships");
    } catch (err: any) {
      toast({ title: "Submission failed", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-24 pt-10 min-h-screen bg-sidebar">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Hero */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-6">
            <Star className="w-3 h-3" /> Free Sponsorship Programme
          </div>
          <h1 className="text-4xl md:text-5xl font-serif mb-6">Travel Africa on Us</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We sponsor exceptional individuals to experience the wonders of Africa. Selected applicants receive full travel support — our team reviews every application personally.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            { icon: <Globe className="w-6 h-6" />, title: "Full Travel Package", desc: "Flights, accommodation, and guided tours across African destinations" },
            { icon: <Shield className="w-6 h-6" />, title: "Team Review", desc: "Every application is carefully evaluated by our selection committee" },
            { icon: <CheckCircle2 className="w-6 h-6" />, title: "Acceptance Email", desc: "Selected applicants receive a personal email with travel instructions" },
          ].map((f, i) => (
            <div key={i} className="text-center p-6 border border-border bg-background">
              <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">{f.icon}</div>
              <h3 className="font-serif text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="rounded-none shadow-sm border-border">
            <CardHeader className="border-b border-border">
              <CardTitle className="font-serif text-2xl">Apply for Sponsorship</CardTitle>
              <CardDescription>Tell us about yourself and why you'd like to experience Africa.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input id="fullName" name="fullName" className="rounded-none" value={form.fullName} onChange={handleChange} placeholder="As on passport" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" name="email" type="email" className="rounded-none" value={form.email} onChange={handleChange} />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality *</Label>
                    <Input id="nationality" name="nationality" className="rounded-none" value={form.nationality} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passportNumber">Passport Number <span className="text-muted-foreground text-xs">(optional)</span></Label>
                    <Input id="passportNumber" name="passportNumber" className="rounded-none" value={form.passportNumber} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purpose">Why do you want to travel Africa? *</Label>
                  <Textarea
                    id="purpose"
                    name="purpose"
                    className="rounded-none min-h-32"
                    value={form.purpose}
                    onChange={handleChange}
                    placeholder="Share your story, motivation, and what this experience would mean to you (minimum 100 characters)..."
                  />
                </div>
                <div className="bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800">
                  A small processing fee is required only after your application is accepted by our team. No payment is needed at this stage.
                </div>
                {!user && (
                  <div className="bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
                    Please <button type="button" className="underline font-medium" onClick={() => setLocation("/login")}>log in</button> to submit your application.
                  </div>
                )}
                <Button type="submit" size="lg" className="w-full rounded-none" disabled={isSubmitting || !user}>
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
