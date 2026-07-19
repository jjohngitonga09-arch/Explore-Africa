import { useRoute, useLocation, Link } from "wouter";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useGetTour, useListOriginCountries, useCreateBooking, getGetTourQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const bookingSchema = z.object({
  originCountryId: z.string().min(1, "Please select your origin country"),
  numberOfPeople: z.coerce.number().min(1, "At least 1 person required").max(20, "Maximum 20 people per booking"),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function BookTour() {
  const [, params] = useRoute("/book/:tourId");
  const tourId = parseInt(params?.tourId || "0");
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: tour, isLoading: tourLoading } = useGetTour(tourId, {
    query: {
      enabled: !!tourId,
      queryKey: getGetTourQueryKey(tourId)
    }
  });

  const { data: origins, isLoading: originsLoading } = useListOriginCountries();
  const createBooking = useCreateBooking();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      originCountryId: "",
      numberOfPeople: 1,
      notes: "",
    },
  });

  const watchOrigin = form.watch("originCountryId");
  const watchPeople = form.watch("numberOfPeople");

  // Calculate pricing
  const originPricing = tour?.pricing?.find(p => p.originCountryId === parseInt(watchOrigin));
  const perPersonPrice = originPricing ? originPricing.price : (tour?.basePrice || 0);
  const totalPrice = perPersonPrice * (watchPeople || 1);

  const onSubmit = (data: BookingFormValues) => {
    createBooking.mutate(
      { 
        data: { 
          tourId, 
          originCountryId: parseInt(data.originCountryId),
          numberOfPeople: data.numberOfPeople,
          notes: data.notes
        } 
      },
      {
        onSuccess: () => {
          toast({
            title: "Booking Requested Successfully",
            description: "We will contact you shortly to confirm dates and arrange payment.",
          });
          setLocation("/my-bookings");
        },
        onError: (err: any) => {
          toast({
            title: "Booking Failed",
            description: err.message || "An error occurred. Please try again.",
            variant: "destructive"
          });
        }
      }
    );
  };

  if (tourLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center">Loading tour details...</div>;
  }

  if (!tour) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-serif mb-4">Tour not found</h1>
        <Button asChild rounded-none><Link href="/tours">Browse tours</Link></Button>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-10 min-h-screen bg-sidebar">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-10">
          <Link href={`/tours/${tourId}`} className="text-sm font-medium uppercase tracking-wider text-muted-foreground hover:text-primary mb-4 inline-block">
            ← Back to Tour Details
          </Link>
          <h1 className="text-4xl font-serif mb-2">Reserve Your Journey</h1>
          <p className="text-muted-foreground">Secure your spot for {tour.title}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Form */}
          <div className="md:col-span-2">
            <Card className="rounded-none border-border shadow-sm">
              <CardHeader className="border-b border-border/50 bg-muted/20">
                <CardTitle className="font-serif text-2xl">Traveler Information</CardTitle>
                <CardDescription>We need a few details to provide an accurate quote.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="originCountryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="uppercase tracking-wider text-xs">Origin Country</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="rounded-none">
                                  <SelectValue placeholder="Select where you are flying from" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {originsLoading ? (
                                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                                ) : (
                                  origins?.map(country => (
                                    <SelectItem key={country.id} value={country.id.toString()}>{country.name}</SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            <FormDescription className="text-xs">Pricing varies by origin due to flight inclusions.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="numberOfPeople"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="uppercase tracking-wider text-xs">Number of Travelers</FormLabel>
                            <FormControl>
                              <Input type="number" min={1} max={20} className="rounded-none" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase tracking-wider text-xs">Special Requests / Preferred Dates</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any dietary requirements, preferred travel months, or special occasions?" 
                              className="rounded-none min-h-[120px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-4 border-t border-border flex justify-end">
                      <Button type="submit" size="lg" className="rounded-none px-8" disabled={createBooking.isPending}>
                        {createBooking.isPending ? "Submitting Request..." : "Request Booking"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="md:col-span-1">
            <Card className="rounded-none border-border shadow-sm sticky top-24">
              <div className="aspect-[4/3] relative">
                <img src={tour.coverImage || "/safari-lodge.jpg"} alt={tour.title} className="w-full h-full object-cover" />
              </div>
              <CardContent className="p-6">
                <h3 className="font-serif text-xl mb-4">{tour.title}</h3>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <MapPin className="w-4 h-4 mr-2" /> {tour.destinationCountry?.name}
                </div>
                <div className="flex items-center text-sm text-muted-foreground mb-6">
                  <Clock className="w-4 h-4 mr-2" /> {tour.durationDays} Days
                </div>

                <div className="border-t border-border pt-4 mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Price per traveler</span>
                    <span>${perPersonPrice}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-4">
                    <span className="text-muted-foreground">Travelers</span>
                    <span>x {watchPeople || 1}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold border-t border-border pt-4">
                    <span>Estimated Total</span>
                    <span className="text-primary">${totalPrice}</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    No payment is collected at this stage. Our team will verify availability first.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
