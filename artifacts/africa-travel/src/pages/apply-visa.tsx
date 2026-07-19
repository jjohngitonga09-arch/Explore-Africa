import { useRoute, useLocation, Link } from "wouter";
import { useListVisaServices, useCreateVisaCase } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Shield, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ApplyVisa() {
  const [, params] = useRoute("/apply-visa/:serviceId");
  const serviceId = parseInt(params?.serviceId || "0");
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: services, isLoading } = useListVisaServices();
  const service = services?.find(s => s.id === serviceId);
  const createCase = useCreateVisaCase();

  const handleApply = () => {
    createCase.mutate(
      { data: { visaServiceId: serviceId } },
      {
        onSuccess: (response) => {
          toast({
            title: "Application Initiated",
            description: "Your visa case has been created. Please upload the required documents.",
          });
          setLocation("/my-visa-cases");
        },
        onError: (err: any) => {
          toast({
            title: "Failed to initiate application",
            description: err.message || "An error occurred.",
            variant: "destructive"
          });
        }
      }
    );
  };

  if (isLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center">Loading visa details...</div>;
  }

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-serif mb-4">Service not found</h1>
        <Button asChild rounded-none><Link href="/visa-services">View all services</Link></Button>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-10 min-h-screen bg-sidebar">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-10">
          <Link href="/visa-services" className="text-sm font-medium uppercase tracking-wider text-muted-foreground hover:text-primary mb-4 inline-block">
            ← Back to Services
          </Link>
          <h1 className="text-4xl font-serif mb-2">Initiate Visa Application</h1>
          <p className="text-muted-foreground">Start the process for your {service.name}</p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3">
            <Card className="rounded-none border-border shadow-sm">
              <CardHeader className="bg-muted/20 border-b border-border/50">
                <CardTitle className="font-serif text-2xl">Application Process</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-8">
                  By starting this application, you are creating a secure case file in our system. You will then be prompted to securely upload the required documentation.
                </p>

                <div className="space-y-6 mb-8">
                  <div className="flex">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mr-4 shrink-0">1</div>
                    <div>
                      <h4 className="font-medium">Create Case</h4>
                      <p className="text-sm text-muted-foreground">Initialize your application in our portal.</p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold mr-4 shrink-0">2</div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">Upload Documents</h4>
                      <p className="text-sm text-muted-foreground">Provide passport scans and photos securely.</p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold mr-4 shrink-0">3</div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">Expert Review</h4>
                      <p className="text-sm text-muted-foreground">Our specialists vet your file before embassy submission.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 border border-yellow-200 flex items-start text-yellow-800 text-sm mb-8">
                  <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
                  <p>Processing fees are collected after your documents have been verified by our team to ensure you meet all requirements.</p>
                </div>

                <Button 
                  size="lg" 
                  className="w-full rounded-none text-lg py-6" 
                  onClick={handleApply}
                  disabled={createCase.isPending}
                >
                  {createCase.isPending ? "Creating File..." : "Start Application"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="rounded-none border-primary/20 bg-primary/5 shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif text-xl">{service.name}</CardTitle>
                <CardDescription className="text-primary font-medium text-lg">${service.fee} Fee</CardDescription>
              </CardHeader>
              <CardContent>
                <h4 className="font-medium uppercase tracking-wider text-xs mb-3 text-muted-foreground">Preparation Checklist:</h4>
                <ul className="space-y-3">
                  {service.requirements?.map((req, i) => (
                    <li key={i} className="flex items-start text-sm text-foreground/80">
                      <CheckCircle2 className="w-4 h-4 text-primary mr-2 shrink-0 mt-0.5" />
                      <span className="leading-tight">{req}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 pt-6 border-t border-primary/20 flex items-center justify-center text-primary text-sm font-medium">
                  <Shield className="w-4 h-4 mr-2" /> Secure Processing
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
