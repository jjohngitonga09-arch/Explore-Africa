import { useGetAllBookings, useUpdateBookingStatus, getGetAllBookingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Briefcase } from "lucide-react";

export default function AdminBookings() {
  const { data: bookings, isLoading } = useGetAllBookings();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateStatus = useUpdateBookingStatus();

  const handleStatusChange = (id: number, status: string) => {
    updateStatus.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          toast({ title: "Booking status updated" });
          queryClient.invalidateQueries({ queryKey: getGetAllBookingsQueryKey() });
        }
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center mb-8">
        <Briefcase className="w-8 h-8 mr-4 text-primary" />
        <div>
          <h1 className="text-3xl font-serif">Booking Registry</h1>
          <p className="text-muted-foreground mt-1">Review and manage all client expeditions.</p>
        </div>
      </div>

      <div className="bg-card border border-border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20">
              <TableHead className="w-20">ID</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Journey</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Financial</TableHead>
              <TableHead className="w-48">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading records...</TableCell></TableRow>
            ) : bookings?.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-mono text-muted-foreground">{booking.id}</TableCell>
                <TableCell>
                  <div className="font-medium">{booking.user?.fullName}</div>
                  <div className="text-xs text-muted-foreground">{booking.user?.email}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">From: {booking.originCountry?.name}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-primary">{booking.tour?.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {booking.tour?.destinationCountry?.name} • {booking.tour?.durationDays} Days
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{booking.numberOfPeople} Travelers</div>
                  <div className="text-xs text-muted-foreground">Created: {format(new Date(booking.bookingDate), 'MMM d')}</div>
                </TableCell>
                <TableCell>
                  <div className="font-serif text-lg">${booking.totalPrice}</div>
                  {booking.paymentDate ? (
                    <Badge variant="outline" className="text-[10px] px-1 py-0 bg-green-50 text-green-700 border-green-200">Paid</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] px-1 py-0 bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Select 
                    value={booking.status} 
                    onValueChange={(v) => handleStatusChange(booking.id, v)}
                  >
                    <SelectTrigger className={`rounded-none h-8 text-xs font-medium uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
