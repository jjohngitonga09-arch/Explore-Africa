import { useState } from "react";
import { Link } from "wouter";
import { useListTours, useListDestinationCountries } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, ArrowRight, FilterX } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export default function Tours() {
  const [destinationId, setDestinationId] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number[]>([10000]);
  
  const { data: countries } = useListDestinationCountries();
  
  // Create params object only if filters are actively applied
  const queryParams = {
    ...(destinationId !== "all" && { destinationCountryId: parseInt(destinationId) }),
    ...(maxPrice[0] < 10000 && { maxPrice: maxPrice[0] })
  };
  
  const { data: tours, isLoading } = useListTours(queryParams);

  const resetFilters = () => {
    setDestinationId("all");
    setMaxPrice([10000]);
  };

  return (
    <div className="pb-24 pt-10">
      <div className="container mx-auto px-4 md:px-6">
        
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Discover Destinations</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Browse our collection of expertly crafted itineraries across the continent. 
            From the endless plains of the Serengeti to the vibrant souks of Marrakech.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-sidebar p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-xl">Refine Search</h3>
                {(destinationId !== "all" || maxPrice[0] < 10000) && (
                  <button onClick={resetFilters} className="text-xs text-muted-foreground hover:text-primary flex items-center transition-colors">
                    <FilterX className="w-3 h-3 mr-1" /> Reset
                  </button>
                )}
              </div>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Destination</label>
                  <Select value={destinationId} onValueChange={setDestinationId}>
                    <SelectTrigger className="w-full rounded-none bg-background">
                      <SelectValue placeholder="Any Destination" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                      <SelectItem value="all">Any Destination</SelectItem>
                      {countries?.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Max Price</label>
                    <span className="text-sm font-medium text-primary">
                      {maxPrice[0] === 10000 ? "Any Price" : `Up to $${maxPrice[0]}`}
                    </span>
                  </div>
                  <Slider 
                    value={maxPrice} 
                    onValueChange={setMaxPrice} 
                    max={10000} 
                    min={500} 
                    step={500}
                    className="py-4"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-96 bg-muted animate-pulse" />
                ))}
              </div>
            ) : tours?.length === 0 ? (
              <div className="text-center py-20 bg-muted/30 border border-dashed border-border">
                <h3 className="text-2xl font-serif mb-2">No journeys found</h3>
                <p className="text-muted-foreground mb-6">We couldn't find any tours matching your current filters.</p>
                <Button variant="outline" onClick={resetFilters} className="rounded-none">Clear Filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {tours?.map(tour => (
                  <Link key={tour.id} href={`/tours/${tour.id}`} className="group block h-full">
                    <Card className="h-full border-border/50 bg-background overflow-hidden rounded-none hover:border-primary/50 transition-colors flex flex-col">
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <img 
                          src={tour.coverImage || "/safari-lodge.jpg"} 
                          alt={tour.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4 flex justify-between items-end">
                          <span className="text-white font-medium text-lg">${tour.basePrice}</span>
                          <span className="bg-primary text-primary-foreground px-2 py-1 text-xs font-bold uppercase tracking-wider">
                            {tour.durationDays} Days
                          </span>
                        </div>
                      </div>
                      <CardContent className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center text-xs text-muted-foreground uppercase tracking-widest mb-3">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-primary" /> 
                          {tour.destinationCountry?.name || 'Multiple Destinations'}
                        </div>
                        <h3 className="text-2xl font-serif mb-3 group-hover:text-primary transition-colors">{tour.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                          {tour.description}
                        </p>
                        <div className="flex items-center justify-between text-sm font-medium text-primary mt-auto pt-4 border-t border-border/50">
                          <span>View Itinerary</span>
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
