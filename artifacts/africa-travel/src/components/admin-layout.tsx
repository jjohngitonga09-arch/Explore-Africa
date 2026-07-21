import { Link, useLocation } from "wouter";
import { type ReactNode, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Menu,
  LayoutDashboard,
  MapPin,
  Globe,
  Images,
  Link2,
  Briefcase,
  FileText,
  Star,
  Settings,
} from "lucide-react";

interface AdminLinkProps {
  href: string;
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function AdminLink({ href, icon, label, active, onClick }: AdminLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-none font-medium text-sm transition-colors ${
        active ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"
      }`}
    >
      <span className={active ? "" : "text-primary"}>{icon}</span>
      {label}
    </Link>
  );
}

const ADMIN_LINKS = [
  { href: "/admin/dashboard", icon: <LayoutDashboard className="w-4 h-4" />, label: "Dashboard" },
  { href: "/admin/countries", icon: <Globe className="w-4 h-4" />, label: "Manage Countries" },
  { href: "/admin/tours", icon: <MapPin className="w-4 h-4" />, label: "Tours" },
  { href: "/admin/bookings", icon: <Briefcase className="w-4 h-4" />, label: "Bookings" },
  { href: "/admin/visa-services", icon: <Globe className="w-4 h-4" />, label: "Visa Services" },
  { href: "/admin/visa-cases", icon: <FileText className="w-4 h-4" />, label: "Visa Cases" },
  { href: "/admin/sponsorships", icon: <Star className="w-4 h-4" />, label: "Sponsorships" },
  { href: "/admin/gallery", icon: <Images className="w-4 h-4" />, label: "Gallery" },
  { href: "/admin/urls", icon: <Link2 className="w-4 h-4" />, label: "URLs" },
  { href: "/admin/settings", icon: <Settings className="w-4 h-4" />, label: "Settings" },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const close = () => setOpen(false);

  return (
    <div className="flex min-h-[calc(100dvh-4rem)]">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0 flex flex-col border-r border-border/40 bg-background">
          <div className="h-16 flex items-center px-5 border-b border-border/40">
            <span className="font-serif text-xl font-semibold tracking-tight text-primary">Admin Panel</span>
          </div>
          <nav className="flex-1 flex flex-col gap-0.5 p-3 overflow-y-auto">
            {ADMIN_LINKS.map((link) => (
              <AdminLink key={link.href} {...link} active={location === link.href} onClick={close} />
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border/40 bg-background">
        <nav className="flex-1 flex flex-col gap-0.5 p-3">
          {ADMIN_LINKS.map((link) => (
            <AdminLink key={link.href} {...link} active={location === link.href} onClick={() => {}} />
          ))}
        </nav>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="md:hidden flex items-center h-14 px-4 border-b border-border/40">
          <button
            className="p-2 -ml-2 rounded hover:bg-accent transition-colors"
            onClick={() => setOpen(true)}
            aria-label="Open admin menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="ml-2 font-serif text-lg text-primary">Admin Panel</span>
        </div>
        {children}
      </div>
    </div>
  );
}
