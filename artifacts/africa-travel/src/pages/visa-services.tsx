import { useListVisaServices } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Shield, Clock, Globe } from "lucide-react";

export default function VisaServices() {
  const { data: services, isLoading } = useListVisaServices();

  const activeServices = services?.filter(s => s.isActive) || [];

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-sidebar py-16 md:py-24 mb-16 border-b border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl">
            <span className="uppercase tracking-widest text-sm font-medium text-primary mb-4 block">Concierge Services</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6 leading-tight">Effortless Visa Acquisition</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Navigating bureaucratic requirements shouldn't be the hardest part of your journey. 
              Our dedicated experts streamline the visa process for premium African destinations, 
              ensuring your documentation is flawless and timely.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        
        {/* Value Props */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="flex flex-col">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif mb-2">Expert Review</h3>
            <p className="text-muted-foreground text-sm">Every application is thoroughly vetted by our specialists before submission to minimize rejection risks.</p>
          </div>
          <div className="flex flex-col">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif mb-2">Expedited Processing</h3>
            <p className="text-muted-foreground text-sm">We leverage established embassy relationships to process your documentation as swiftly as possible.</p>
          </div>
          <div className="flex flex-col">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif mb-2">Centralized Tracking</h3>
            <p className="text-muted-foreground text-sm">Upload documents once and track your visa status securely through your private client portal.</p>
          </div>
        </div>

        {/* Services Grid */}
        <h2 className="text-3xl font-serif mb-8 border-b border-border pb-4">Available Destinations</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-muted animate-pulse" />
            ))}
          </div>
        ) : activeServices.length === 0 ? (
          <div className="text-center py-16 bg-sidebar border border-border/50">
            <p className="text-muted-foreground text-lg">No visa services are currently listed. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeServices.map(service => (
              <Card key={service.id} className="border-border/50 bg-card rounded-none hover:border-primary/50 transition-colors flex flex-col shadow-sm">
                <CardContent className="p-8 flex flex-col h-full">
                  <div className="mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {service.destinationCountry?.name || 'Various'}
                    </span>
                    <h3 className="text-2xl font-serif text-foreground mt-1">{service.name}</h3>
                  </div>
                  
                  <div className="text-3xl font-serif text-primary mb-6">
                    ${service.fee} <span className="text-sm font-sans text-muted-foreground">processing fee</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-6 flex-1">
                    {service.description}
                  </p>

                  <div className="mb-8">
                    <p className="text-sm font-medium mb-3 uppercase tracking-wider">Required Documents:</p>
                    <ul className="space-y-2">
                      {service.requirements?.slice(0, 3).map((req, i) => (
                        <li key={i} className="flex items-start text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-primary mr-2 shrink-0 mt-0.5" />
                          <span className="leading-tight">{req}</span>
                        </li>
                      ))}
                      {service.requirements && service.requirements.length > 3 && (
                        <li className="text-sm text-muted-foreground italic pl-6">
                          + {service.requirements.length - 3} more
                        </li>
                      )}
                    </ul>
                  </div>

                  <Button className="w-full rounded-none mt-auto" asChild>
                    <Link href={`/apply-visa/${service.id}`}>Apply Now</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
