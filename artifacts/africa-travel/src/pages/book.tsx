import { useRoute, useLocation, Link } from "wouter";
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
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, User, Plane, ShieldCheck, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];
const MARITAL_STATUSES = ["Single", "Married", "Divorced", "Widowed"];
const PURPOSES = [
  "Tourism / Holiday",
  "Business",
  "Transit",
  "Study",
  "Medical Treatment",
  "Family Visit",
  "Other",
];

const bookingSchema = z.object({
  originCountryId: z.string().min(1, "Please select your origin country"),
  numberOfPeople: z.coerce.number().min(1).max(20),
  notes: z.string().optional(),
  // Immigration info
  passportNumber: z.string().min(1, "Passport number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  phone: z.string().min(1, "Phone number is required"),
  gender: z.string().min(1, "Gender is required"),
  address: z.string().min(1, "Address is required"),
  occupation: z.string().min(1, "Occupation is required"),
  purposeOfTravel: z.string().min(1, "Purpose of travel is required"),
  maritalStatus: z.string().min(1, "Marital status is required"),
  emergencyContact: z.string().min(1, "Emergency contact name is required"),
  emergencyPhone: z.string().min(1, "Emergency contact phone is required"),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function BookTour() {
  const [, params] = useRoute("/book/:tourId");
  const tourId = parseInt(params?.tourId || "0");
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: tour, isLoading: tourLoading } = useGetTour(tourId, {
    query: { enabled: !!tourId, queryKey: getGetTourQueryKey(tourId) },
  });

  const { data: origins, isLoading: originsLoading } = useListOriginCountries();
  const createBooking = useCreateBooking();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      originCountryId: "", numberOfPeople: 1, notes: "",
      passportNumber: "", dateOfBirth: "", phone: "", gender: "",
      address: "", occupation: "", purposeOfTravel: "", maritalStatus: "",
      emergencyContact: "", emergencyPhone: "",
    },
  });

  const watchOrigin = form.watch("originCountryId");
  const watchPeople = form.watch("numberOfPeople");

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
          notes: data.notes,
          passportNumber: data.passportNumber,
          dateOfBirth: data.dateOfBirth,
          phone: data.phone,
          gender: data.gender,
          address: data.address,
          occupation: data.occupation,
          purposeOfTravel: data.purposeOfTravel,
          maritalStatus: data.maritalStatus,
          emergencyContact: data.emergencyContact,
          emergencyPhone: data.emergencyPhone,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Booking Requested", description: "Our team will contact you to confirm dates and arrange payment." });
          setLocation("/my-bookings");
        },
        onError: (err: any) => {
          toast({ title: "Booking Failed", description: err.message || "An error occurred.", variant: "destructive" });
        },
      }
    );
  };

  if (tourLoading) return <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">Loading tour details…</div>;

  if (!tour) return (
    <div className="container mx-auto px-4 py-24 text-center">
      <h1 className="text-3xl font-serif mb-4">Tour not found</h1>
      <Button asChild className="rounded-none"><Link href="/tours">Browse tours</Link></Button>
    </div>
  );

  return (
    <div className="pb-24 pt-10 min-h-screen bg-sidebar">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-10">
          <Link href={`/tours/${tourId}`} className="text-sm font-medium uppercase tracking-wider text-muted-foreground hover:text-primary mb-4 inline-block">
            ← Back to Tour Details
          </Link>
          <h1 className="text-4xl font-serif mb-2">Reserve Your Journey</h1>
          <p className="text-muted-foreground">Complete the immigration form to secure your spot for <strong>{tour.title}</strong></p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Form */}
          <div className="md:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/* Section: Trip Details */}
                <Card className="rounded-none border-border shadow-sm">
                  <CardHeader className="border-b border-border/50 bg-muted/20">
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4 text-primary" />
                      <CardTitle className="font-serif text-xl">Trip Details</CardTitle>
                    </div>
                    <CardDescription>Select your origin and group size.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <FormField control={form.control} name="originCountryId" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase tracking-wider text-xs">Origin Country *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-none">
                                <SelectValue placeholder="Select where you fly from" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {originsLoading ? (
                                <SelectItem value="loading" disabled>Loading…</SelectItem>
                              ) : (
                                origins?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)
                              )}
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-xs">Pricing varies by origin due to flight inclusions.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="numberOfPeople" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase tracking-wider text-xs">Number of Travelers *</FormLabel>
                          <FormControl><Input type="number" min={1} max={20} className="rounded-none" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </CardContent>
                </Card>

                {/* Section: Personal Information */}
                <Card className="rounded-none border-border shadow-sm">
                  <CardHeader className="border-b border-border/50 bg-muted/20">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      <CardTitle className="font-serif text-xl">Personal Information</CardTitle>
                    </div>
                    <CardDescription>As it appears on your passport — required for immigration processing.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <FormField control={form.control} name="passportNumber" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase tracking-wider text-xs">Passport Number *</FormLabel>
                          <FormControl><Input placeholder="e.g. A12345678" className="rounded-none" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase tracking-wider text-xs">Date of Birth *</FormLabel>
                          <FormControl><Input type="date" className="rounded-none" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="gender" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase tracking-wider text-xs">Gender *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="rounded-none"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                            <SelectContent>{GENDERS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="maritalStatus" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase tracking-wider text-xs">Marital Status *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="rounded-none"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                            <SelectContent>{MARITAL_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase tracking-wider text-xs">Phone Number *</FormLabel>
                          <FormControl><Input placeholder="+1 555 000 0000" className="rounded-none" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="occupation" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase tracking-wider text-xs">Occupation *</FormLabel>
                          <FormControl><Input placeholder="e.g. Engineer, Teacher" className="rounded-none" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="address" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase tracking-wider text-xs">Residential Address *</FormLabel>
                        <FormControl><Textarea placeholder="Full address including city, state/province, country" className="rounded-none min-h-[80px]" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="purposeOfTravel" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase tracking-wider text-xs">Purpose of Travel *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="rounded-none"><SelectValue placeholder="Select purpose" /></SelectTrigger></FormControl>
                          <SelectContent>{PURPOSES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </CardContent>
                </Card>

                {/* Section: Emergency Contact */}
                <Card className="rounded-none border-border shadow-sm">
                  <CardHeader className="border-b border-border/50 bg-muted/20">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      <CardTitle className="font-serif text-xl">Emergency Contact</CardTitle>
                    </div>
                    <CardDescription>Person to contact in case of emergency during your trip.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <FormField control={form.control} name="emergencyContact" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase tracking-wider text-xs">Contact Name *</FormLabel>
                          <FormControl><Input placeholder="Full name" className="rounded-none" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="emergencyPhone" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase tracking-wider text-xs">Contact Phone *</FormLabel>
                          <FormControl><Input placeholder="+1 555 000 0000" className="rounded-none" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </CardContent>
                </Card>

                {/* Section: Additional Notes */}
                <Card className="rounded-none border-border shadow-sm">
                  <CardHeader className="border-b border-border/50 bg-muted/20">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      <CardTitle className="font-serif text-xl">Additional Notes</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <FormField control={form.control} name="notes" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase tracking-wider text-xs">Special Requests / Preferred Dates</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Dietary requirements, preferred travel months, special occasions…" className="rounded-none min-h-[100px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button type="submit" size="lg" className="rounded-none px-10" disabled={createBooking.isPending}>
                    {createBooking.isPending ? "Submitting Request…" : "Request Booking"}
                  </Button>
                </div>
              </form>
            </Form>
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
                <Separator className="mb-4" />
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Price per traveler</span>
                  <span>${perPersonPrice}</span>
                </div>
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-muted-foreground">Travelers</span>
                  <span>× {watchPeople || 1}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold border-t border-border pt-4">
                  <span>Estimated Total</span>
                  <span className="text-primary">${totalPrice}</span>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  No payment collected now — our team confirms availability first.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
