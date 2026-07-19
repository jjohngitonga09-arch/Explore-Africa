import { useGetMyBookings } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Calendar, MapPin, Users, CreditCard, Clock } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function MyBookings() {
  const { data: bookings, isLoading } = useGetMyBookings();

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 hover:bg-red-100 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="pb-24 pt-10 min-h-screen bg-sidebar">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        
        <div className="mb-10">
          <h1 className="text-4xl font-serif mb-2">My Journeys</h1>
          <p className="text-muted-foreground">Manage your upcoming and past expeditions.</p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2].map(i => (
              <div key={i} className="h-48 bg-muted animate-pulse border border-border" />
            ))}
          </div>
        ) : !bookings || bookings.length === 0 ? (
          <Card className="rounded-none border-dashed border-border/60 bg-background text-center py-20">
            <CardContent>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-serif mb-2">No Bookings Yet</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                You haven't booked any tours with us yet. Discover the wonders of Africa and start planning your next adventure.
              </p>
              <Button asChild rounded-none>
                <Link href="/tours">Browse Destinations</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookings.map(booking => (
              <Card key={booking.id} className="rounded-none border-border overflow-hidden bg-background">
                <div className="flex flex-col md:flex-row">
                  {/* Tour Image */}
                  <div className="md:w-1/3 aspect-[4/3] md:aspect-auto relative bg-muted">
                    <img 
                      src={booking.tour?.coverImage || "/elephant-wild.jpg"} 
                      alt={booking.tour?.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge variant="outline" className={`rounded-none uppercase tracking-widest text-[10px] px-2 py-1 ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Details */}
                  <div className="p-6 md:w-2/3 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
                          {booking.tour?.destinationCountry?.name || 'Multiple Destinations'}
                        </div>
                        <h3 className="text-2xl font-serif hover:text-primary transition-colors">
                          <Link href={`/tours/${booking.tourId}`}>{booking.tour?.title}</Link>
                        </h3>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-2xl font-serif text-primary">${booking.totalPrice}</div>
                        <div className="text-xs text-muted-foreground">Total Amount</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-6 mt-4 flex-1">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2 text-foreground/40" />
                        <span>Booked: {format(new Date(booking.bookingDate), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="w-4 h-4 mr-2 text-foreground/40" />
                        <span>{booking.numberOfPeople} Traveler{booking.numberOfPeople > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-2 text-foreground/40" />
                        <span>{booking.tour?.durationDays} Days</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CreditCard className="w-4 h-4 mr-2 text-foreground/40" />
                        <span>{booking.paymentDate ? 'Paid' : 'Payment Pending'}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border flex justify-end">
                      <Button variant="outline" className="rounded-none shrink-0" asChild>
                        <Link href={`/tours/${booking.tourId}`}>View Tour Details</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
