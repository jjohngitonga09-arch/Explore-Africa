import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { type ReactNode, useState } from "react";
import {
  Menu,
  LogOut,
  LayoutDashboard,
  Briefcase,
  FileText,
  MapPin,
  Images,
  Globe,
  Star,
  User,
} from "lucide-react";

interface NavLinkProps {
  href: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

function SidebarLink({ href, icon, label, onClick }: NavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-none font-medium text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      <span className="text-primary">{icon}</span>
      {label}
    </Link>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const handleLogout = () => {
    logout();
    setLocation("/login");
    close();
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* ── Left-side slide-in Sheet (mobile) ── */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="w-72 p-0 flex flex-col border-r border-border/40 bg-background"
        >
          {/* Sheet header */}
          <div className="h-16 flex items-center px-5 border-b border-border/40">
            <Link
              href="/"
              onClick={close}
              className="font-serif text-xl font-semibold tracking-tight text-primary"
            >
              Sojourn Africa
            </Link>
          </div>

          {/* Sheet nav */}
          <nav className="flex-1 flex flex-col gap-0.5 p-3 overflow-y-auto">
            <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
              Explore
            </p>
            <SidebarLink href="/tours"          icon={<MapPin  className="w-4 h-4" />} label="Destinations"   onClick={close} />
            <SidebarLink href="/gallery"        icon={<Images  className="w-4 h-4" />} label="Gallery"        onClick={close} />
            <SidebarLink href="/visa-services"  icon={<Globe   className="w-4 h-4" />} label="Visa Services"  onClick={close} />
            <SidebarLink href="/sponsorships"   icon={<Star    className="w-4 h-4" />} label="Free Sponsorship" onClick={close} />

            <div className="my-3 border-t border-border/40" />

            {user ? (
              <>
                <p className="px-3 pt-1 pb-1 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                  My Account
                </p>
                {isAdmin ? (
                  <>
                    <SidebarLink href="/admin/dashboard"     icon={<LayoutDashboard className="w-4 h-4" />} label="Admin Dashboard"   onClick={close} />
                    <SidebarLink href="/admin/sponsorships" icon={<Star           className="w-4 h-4" />} label="Sponsorships"       onClick={close} />
                  </>
                ) : (
                  <>
                    <SidebarLink href="/my-bookings"      icon={<Briefcase className="w-4 h-4" />} label="My Bookings"    onClick={close} />
                    <SidebarLink href="/my-visa-cases"    icon={<FileText   className="w-4 h-4" />} label="My Visas"       onClick={close} />
                    <SidebarLink href="/my-sponsorships"  icon={<Star       className="w-4 h-4" />} label="My Sponsorships" onClick={close} />
                    <SidebarLink href="/profile"          icon={<User       className="w-4 h-4" />} label="My Profile"     onClick={close} />
                  </>
                )}
                <div className="mt-auto pt-4 px-3 pb-3">
                  <Button
                    variant="outline"
                    className="w-full rounded-none gap-2 justify-start"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="mt-2 flex flex-col gap-2 px-1">
                <Button variant="outline" className="w-full rounded-none" onClick={() => { setLocation("/login"); close(); }}>
                  Log In
                </Button>
                <Button className="w-full rounded-none" onClick={() => { setLocation("/register"); close(); }}>
                  Register
                </Button>
              </div>
            )}
          </nav>
        </SheetContent>
      </Sheet>

      {/* ── Sticky top header ── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center gap-3">

          {/* Hamburger — left side, mobile only */}
          <button
            className="md:hidden p-2 -ml-2 rounded hover:bg-accent transition-colors"
            onClick={() => setOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="font-serif text-2xl font-semibold tracking-tight text-primary shrink-0"
          >
            Sojourn Africa
          </Link>

          {/* Desktop nav — center */}
          <nav className="hidden md:flex flex-1 items-center gap-8 text-sm font-medium ml-6">
            <Link href="/tours"        className="hover:text-primary transition-colors">Destinations</Link>
            <Link href="/gallery"      className="hover:text-primary transition-colors">Gallery</Link>
            <Link href="/visa-services" className="hover:text-primary transition-colors">Visa Services</Link>
          </nav>

          {/* Desktop auth — right */}
          <div className="hidden md:flex items-center gap-3 ml-auto">
            {user ? (
              <>
                {isAdmin ? (
                  <Button variant="ghost" size="sm" onClick={() => setLocation("/admin/dashboard")} className="gap-2">
                    <LayoutDashboard className="w-4 h-4" /> Admin
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => setLocation("/my-bookings")} className="gap-2">
                      <Briefcase className="w-4 h-4" /> My Bookings
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setLocation("/my-visa-cases")} className="gap-2">
                      <FileText className="w-4 h-4" /> Visas
                    </Button>
                  </>
                )}
                <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 rounded-none">
                  <LogOut className="w-4 h-4" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => setLocation("/login")}>Log In</Button>
                <Button size="sm" onClick={() => setLocation("/register")} className="rounded-none">Register</Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="flex-1">{children}</main>

      {/* ── Footer ── */}
      <footer className="bg-foreground text-background py-12 md:py-16 mt-20">
        <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="font-serif text-2xl font-semibold tracking-tight text-primary-foreground">
              Sojourn Africa
            </Link>
            <p className="mt-4 text-sm text-muted/80 max-w-xs">
              Curated luxury travel and seamless visa experiences across the African continent.
            </p>
          </div>
          <div>
            <h3 className="font-serif text-lg mb-4">Discover</h3>
            <ul className="space-y-2 text-sm text-muted/80">
              <li><Link href="/tours">All Destinations</Link></li>
              <li><Link href="/gallery">Inspiration Gallery</Link></li>
              <li><Link href="/visa-services">Visa Assistance</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-serif text-lg mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted/80">
              <li><span>About Us</span></li>
              <li><span>Journal</span></li>
              <li><span>Contact</span></li>
            </ul>
          </div>
          <div>
            <h3 className="font-serif text-lg mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted/80">
              <li><span>Terms of Service</span></li>
              <li><span>Privacy Policy</span></li>
              <li><span>Booking Conditions</span></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 md:px-6 mt-12 pt-8 border-t border-white/10 text-xs text-muted/60 text-center">
          &copy; {new Date().getFullYear()} Sojourn Africa. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
