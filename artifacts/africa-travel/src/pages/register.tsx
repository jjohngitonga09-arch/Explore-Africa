import { useState } from "react";
import { useLocation, Link } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRegister, useListOriginCountries } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";

const registerSchema = z.object({
  fullName:    z.string().min(2, "Full name is required"),
  email:       z.string().email("Please enter a valid email address"),
  password:    z.string().min(6, "Password must be at least 6 characters"),
  nationality: z.string().min(2, "Please select your nationality"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

type Step = "form" | "otp";

export default function Register() {
  const [, setLocation] = useLocation();
  const { login: setAuthUser } = useAuth();
  const { toast } = useToast();

  const [step, setStep]               = useState<Step>("form");
  const [pendingData, setPendingData]  = useState<RegisterFormValues | null>(null);
  const [otpCode, setOtpCode]          = useState("");
  const [devOtp, setDevOtp]            = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying]   = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { data: countries, isLoading: loadingCountries } = useListOriginCountries();
  const registerMutation = useRegister();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "", nationality: "" },
  });

  /* ── Step 1: send OTP ── */
  const onSubmit = async (data: RegisterFormValues) => {
    setIsSendingOtp(true);
    try {
      const res  = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to send code");

      setPendingData(data);
      setStep("otp");
      setDevOtp(json.devOtp ?? null);

      toast({
        title: "Verification code sent",
        description: json.devOtp
          ? `Dev mode — your code is: ${json.devOtp}`
          : `We sent a 6-digit code to ${data.email}`,
      });

      // cooldown 60 s
      setResendCooldown(60);
      const t = setInterval(() => {
        setResendCooldown((c) => {
          if (c <= 1) { clearInterval(t); return 0; }
          return c - 1;
        });
      }, 1000);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSendingOtp(false);
    }
  };

  /* ── Resend ── */
  const handleResend = async () => {
    if (!pendingData || resendCooldown > 0) return;
    await onSubmit(pendingData);
  };

  /* ── Step 2: verify OTP then register ── */
  const onVerifyAndRegister = async () => {
    if (!pendingData || !otpCode.trim()) return;
    setIsVerifying(true);
    try {
      // 1. Verify OTP
      const vRes  = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingData.email, otp: otpCode.trim() }),
      });
      const vJson = await vRes.json();
      if (!vRes.ok) throw new Error(vJson.error ?? "Invalid code");

      // 2. Register
      registerMutation.mutate(
        { data: pendingData },
        {
          onSuccess: (response) => {
            setAuthUser(response.token, response.user);
            toast({
              title: "Welcome to Sojourn Africa",
              description: "Your account has been verified and created.",
            });
            setLocation("/tours");
          },
          onError: (error: any) => {
            toast({ title: "Registration failed", description: error.message, variant: "destructive" });
            setIsVerifying(false);
          },
        },
      );
    } catch (err: any) {
      toast({ title: "Verification failed", description: err.message, variant: "destructive" });
      setIsVerifying(false);
    }
  };

  /* ── Render ── */
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 py-12 bg-sidebar">
      <Card className="w-full max-w-md rounded-none shadow-xl border-border/50">

        {/* ── Step: FORM ── */}
        {step === "form" && (
          <>
            <CardHeader className="text-center space-y-2 pb-8">
              <CardTitle className="text-3xl font-serif">Begin Your Journey</CardTitle>
              <CardDescription className="text-base">
                Create an account to book tours and apply for visas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase tracking-wider text-xs">Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Doe" className="rounded-none bg-background" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase tracking-wider text-xs">Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="jane@example.com" className="rounded-none bg-background" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase tracking-wider text-xs">Nationality</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-none bg-background">
                              <SelectValue placeholder="Select your country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {loadingCountries ? (
                              <SelectItem value="loading" disabled>Loading…</SelectItem>
                            ) : (
                              countries?.map((c) => (
                                <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase tracking-wider text-xs">Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" className="rounded-none bg-background" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full rounded-none py-6 text-base mt-4 gap-2"
                    disabled={isSendingOtp}
                  >
                    <Mail className="w-4 h-4" />
                    {isSendingOtp ? "Sending code…" : "Send Verification Code"}
                  </Button>
                </form>
              </Form>

              <div className="mt-8 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">Log in here</Link>
              </div>
            </CardContent>
          </>
        )}

        {/* ── Step: OTP ── */}
        {step === "otp" && (
          <>
            <CardHeader className="text-center space-y-2 pb-8">
              <div className="flex justify-center mb-2">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7 text-primary" />
                </div>
              </div>
              <CardTitle className="text-3xl font-serif">Verify Your Email</CardTitle>
              <CardDescription className="text-base">
                We sent a 6-digit code to{" "}
                <span className="font-medium text-foreground">{pendingData?.email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dev mode hint */}
              {devOtp && (
                <div className="bg-amber-50 border border-amber-200 rounded p-3 text-center">
                  <p className="text-xs text-amber-700 font-medium uppercase tracking-wider mb-1">Dev mode — no email sent</p>
                  <p className="text-2xl font-mono font-bold tracking-widest text-amber-900">{devOtp}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="uppercase tracking-wider text-xs font-medium text-muted-foreground">
                  6-Digit Code
                </label>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  className="rounded-none bg-background text-center text-3xl font-mono tracking-widest h-16 border-2 focus:border-primary"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  autoFocus
                />
              </div>

              <Button
                className="w-full rounded-none py-6 text-base gap-2"
                onClick={onVerifyAndRegister}
                disabled={otpCode.length !== 6 || isVerifying || registerMutation.isPending}
              >
                <ShieldCheck className="w-4 h-4" />
                {isVerifying || registerMutation.isPending ? "Creating account…" : "Verify & Create Account"}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => { setStep("form"); setOtpCode(""); setDevOtp(null); }}
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  className={`text-primary hover:underline font-medium transition-colors ${resendCooldown > 0 ? "opacity-50 pointer-events-none" : ""}`}
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || isSendingOtp}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                </button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
