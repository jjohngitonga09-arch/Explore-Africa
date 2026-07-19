import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Save } from "lucide-react";

export default function Profile() {
  const { user, login } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName ?? "",
    nationality: user?.nationality ?? "",
    phone: (user as any)?.phone ?? "",
    passportNumber: (user as any)?.passportNumber ?? "",
    dateOfBirth: (user as any)?.dateOfBirth ?? "",
    address: (user as any)?.address ?? "",
    emergencyContact: (user as any)?.emergencyContact ?? "",
    emergencyPhone: (user as any)?.emergencyPhone ?? "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("africa_travel_token");
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const updated = await res.json();
      login(token!, updated);
      toast({ title: "Profile updated successfully" });
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-24 pt-10 min-h-screen bg-sidebar">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-10 flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-serif">My Profile</h1>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Personal Information */}
          <Card className="rounded-none border-border">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-lg font-serif">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" name="fullName" className="rounded-none" value={form.fullName} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input id="nationality" name="nationality" className="rounded-none" value={form.nationality} onChange={handleChange} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" type="tel" className="rounded-none" value={form.phone} onChange={handleChange} placeholder="+1 234 567 8900" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input id="dateOfBirth" name="dateOfBirth" type="date" className="rounded-none" value={form.dateOfBirth} onChange={handleChange} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Residential Address</Label>
                <Textarea id="address" name="address" className="rounded-none" value={form.address} onChange={handleChange} rows={2} placeholder="Street, City, Country" />
              </div>
            </CardContent>
          </Card>

          {/* Travel Documents */}
          <Card className="rounded-none border-border">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-lg font-serif">Travel Documents</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="passportNumber">Passport Number</Label>
                <Input id="passportNumber" name="passportNumber" className="rounded-none" value={form.passportNumber} onChange={handleChange} placeholder="A12345678" />
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="rounded-none border-border">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-lg font-serif">Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Contact Name</Label>
                  <Input id="emergencyContact" name="emergencyContact" className="rounded-none" value={form.emergencyContact} onChange={handleChange} placeholder="Full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Contact Phone</Label>
                  <Input id="emergencyPhone" name="emergencyPhone" type="tel" className="rounded-none" value={form.emergencyPhone} onChange={handleChange} placeholder="+1 234 567 8900" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full rounded-none gap-2" disabled={saving}>
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </div>
    </div>
  );
}
