import { useGetAdminStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, FileText, Map, DollarSign, CalendarX, CalendarCheck } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminStats();

  if (isLoading || !stats) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-serif mb-8">Executive Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-none" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { title: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, icon: <DollarSign className="w-5 h-5 text-primary" />, trend: "Lifetime" },
    { title: "Total Bookings", value: stats.totalBookings, icon: <Briefcase className="w-5 h-5 text-blue-600" />, trend: "All time" },
    { title: "Confirmed Journeys", value: stats.confirmedBookings, icon: <CalendarCheck className="w-5 h-5 text-green-600" />, trend: "Active" },
    { title: "Cancelled Journeys", value: stats.cancelledBookings, icon: <CalendarX className="w-5 h-5 text-red-600" />, trend: "Inactive" },
    { title: "Pending Visas", value: stats.pendingVisaCases, icon: <FileText className="w-5 h-5 text-yellow-600" />, trend: "Action required" },
    { title: "Registered Users", value: stats.totalUsers, icon: <Users className="w-5 h-5 text-purple-600" />, trend: "Client base" },
    { title: "Active Tours", value: stats.totalTours, icon: <Map className="w-5 h-5 text-orange-600" />, trend: "Catalog size" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif">Executive Overview</h1>
        <p className="text-muted-foreground mt-1">Real-time platform metrics and KPIs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i} className="rounded-none border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
