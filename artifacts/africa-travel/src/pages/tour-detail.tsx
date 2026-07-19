import { useRoute, Link } from "wouter";
import { useGetTour, useListOriginCountries, getGetTourQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Clock, Check, X, Calendar, Image as ImageIcon } from "lucide-react";
import { useState } from "react";

export default function TourDetail() {
  const [, params] = useRoute("/tours/:id");
  const id = parseInt(params?.id || "0");
  
  const [originId, setOriginId] = useState<string>("default");

  const { data: tour, isLoading, isError } = useGetTour(id, {
    query: {
      enabled: !!id,
      queryKey: getGetTourQueryKey(id)
    }
  });

  const { data: origins } = useListOriginCountries();

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="h-[60vh] bg-muted animate-pulse" />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="h-12 w-2/3 bg-muted animate-pulse" />
            <div className="h-6 w-1/3 bg-muted animate-pulse" />
            <div className="h-40 bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !tour) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-serif mb-4">Tour not found</h1>
        <Button asChild rounded-none><Link href="/tours">Back to tours</Link></Button>
      </div>
    );
  }

  // Find pricing based on selected origin
  const selectedPricing = tour.pricing?.find(p => p.originCountryId === parseInt(originId));
  const currentPrice = selectedPricing ? selectedPricing.price : tour.basePrice;

  return (
    <div className="pb-24">
      {/* Hero Image */}
      <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden bg-black">
        <img 
          src={tour.images?.[0]?.imageUrl || tour.coverImage || "/cape-town.jpg"} 
          alt={tour.title}
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
          <div className="container mx-auto">
            <div className="max-w-3xl">
              <div className="flex items-center gap-4 text-white/90 mb-4 text-sm font-medium uppercase tracking-widest">
                <span className="flex items-center"><MapPin className="w-4 h-4 mr-1 text-primary" /> {tour.destinationCountry?.name}</span>
                <span className="flex items-center"><Clock className="w-4 h-4 mr-1 text-primary" /> {tour.durationDays} Days</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-serif text-white mb-4 leading-tight">{tour.title}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-16">
            
            <section>
              <h2 className="text-2xl font-serif mb-6 border-b pb-4">The Experience</h2>
              <div className="prose prose-lg prose-p:text-muted-foreground prose-p:leading-relaxed max-w-none">
                <p>{tour.description}</p>
              </div>
            </section>

            {tour.highlights && tour.highlights.length > 0 && (
              <section>
                <h2 className="text-2xl font-serif mb-6 border-b pb-4">Journey Highlights</h2>
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
                  {tour.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-3 shrink-0" />
                      <span className="text-muted-foreground">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="grid sm:grid-cols-2 gap-8 bg-sidebar p-8">
              <div>
                <h3 className="font-serif text-xl mb-4 flex items-center"><Check className="w-5 h-5 text-green-600 mr-2" /> What's Included</h3>
                <ul className="space-y-3">
                  {tour.included?.map((item, idx) => (
                    <li key={idx} className="text-muted-foreground text-sm flex items-start">
                      <span className="text-muted-foreground mr-2">•</span> {item}
                    </li>
                  ))}
                  {(!tour.included || tour.included.length === 0) && (
                    <li className="text-muted-foreground text-sm italic">Standard inclusions apply.</li>
                  )}
                </ul>
              </div>
              <div>
                <h3 className="font-serif text-xl mb-4 flex items-center"><X className="w-5 h-5 text-destructive mr-2" /> Not Included</h3>
                <ul className="space-y-3">
                  {tour.notIncluded?.map((item, idx) => (
                    <li key={idx} className="text-muted-foreground text-sm flex items-start">
                      <span className="text-muted-foreground mr-2">•</span> {item}
                    </li>
                  ))}
                  {(!tour.notIncluded || tour.notIncluded.length === 0) && (
                    <li className="text-muted-foreground text-sm italic">Flights and visas typically excluded.</li>
                  )}
                </ul>
              </div>
            </section>

            {/* Images Gallery */}
            {tour.images && tour.images.length > 1 && (
              <section>
                <h2 className="text-2xl font-serif mb-6 border-b pb-4 flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2 text-primary" /> Visuals
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {tour.images.slice(1).map(img => (
                    <img key={img.id} src={img.imageUrl} alt={img.caption || tour.title} className="w-full aspect-[4/3] object-cover" />
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card border border-border/50 p-8 shadow-sm">
              <div className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-2">Reserve Your Spot</div>
              <div className="text-4xl font-serif text-primary mb-6">${currentPrice} <span className="text-sm font-sans text-muted-foreground">per person</span></div>

              {tour.pricing && tour.pricing.length > 0 && origins && (
                <div className="mb-6 pb-6 border-b border-border/50">
                  <label className="block text-sm font-medium mb-2 text-foreground">Select your origin for precise pricing:</label>
                  <Select value={originId} onValueChange={setOriginId}>
                    <SelectTrigger className="w-full rounded-none">
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Standard Pricing</SelectItem>
                      {origins.filter(o => tour.pricing?.some(p => p.originCountryId === o.id)).map(origin => (
                        <SelectItem key={origin.id} value={origin.id.toString()}>{origin.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{tour.durationDays} Days</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Destination</span>
                  <span className="font-medium text-right">{tour.destinationCountry?.name}</span>
                </div>
              </div>

              <Button size="lg" className="w-full rounded-none text-lg py-6" asChild>
                <Link href={`/book/${tour.id}`}>Book This Journey</Link>
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-4">
                No payment required to hold your reservation today.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
