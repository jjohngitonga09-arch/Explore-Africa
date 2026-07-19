import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { AuthProvider, useAuth } from '@/lib/auth';
import { Layout } from '@/components/layout';
import { ScrollToTop } from '@/components/scroll-to-top';

// Public Pages
import Home from '@/pages/home';
import Tours from '@/pages/tours';
import TourDetail from '@/pages/tour-detail';
import Gallery from '@/pages/gallery';
import VisaServices from '@/pages/visa-services';
import Login from '@/pages/login';
import Register from '@/pages/register';
import NotFound from '@/pages/not-found';

// Protected Pages
import MyBookings from '@/pages/my-bookings';
import MyVisaCases from '@/pages/my-visa-cases';
import BookTour from '@/pages/book';
import ApplyVisa from '@/pages/apply-visa';

// Admin Pages
import AdminDashboard from '@/pages/admin/dashboard';
import AdminTours from '@/pages/admin/tours';
import AdminCountries from '@/pages/admin/countries';
import AdminGallery from '@/pages/admin/gallery';
import AdminVisaServices from '@/pages/admin/visa-services';
import AdminBookings from '@/pages/admin/bookings';
import AdminVisaCases from '@/pages/admin/visa-cases';

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, requireAdmin = false, path }: { component: any, requireAdmin?: boolean, path: string }) {
  return (
    <Route path={path}>
      {(params) => {
        const { user, isLoading } = useAuth();
        const [, setLocation] = useLocation();

        if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

        if (!user) {
          setLocation("/login");
          return null;
        }

        if (requireAdmin && user.role !== "admin") {
          setLocation("/");
          return null;
        }

        return <Component params={params} />;
      }}
    </Route>
  );
}

function AppRouter() {
  return (
    <Layout>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/tours" component={Tours} />
        <Route path="/tours/:id" component={TourDetail} />
        <Route path="/gallery" component={Gallery} />
        <Route path="/visa-services" component={VisaServices} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />

        <ProtectedRoute path="/my-bookings" component={MyBookings} />
        <ProtectedRoute path="/my-visa-cases" component={MyVisaCases} />
        <ProtectedRoute path="/book/:tourId" component={BookTour} />
        <ProtectedRoute path="/apply-visa/:serviceId" component={ApplyVisa} />

        <ProtectedRoute path="/admin/dashboard" component={AdminDashboard} requireAdmin />
        <ProtectedRoute path="/admin/tours" component={AdminTours} requireAdmin />
        <ProtectedRoute path="/admin/countries" component={AdminCountries} requireAdmin />
        <ProtectedRoute path="/admin/gallery" component={AdminGallery} requireAdmin />
        <ProtectedRoute path="/admin/visa-services" component={AdminVisaServices} requireAdmin />
        <ProtectedRoute path="/admin/bookings" component={AdminBookings} requireAdmin />
        <ProtectedRoute path="/admin/visa-cases" component={AdminVisaCases} requireAdmin />

        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <AppRouter />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
