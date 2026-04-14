"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Heart,
  Droplets
} from "lucide-react";

const mainNavItems = [
  {
    title: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Manage Hospitals",
    href: "/admin/hospitals",
    icon: Building2,
  },
  {
    title: "Manage Organisations",
    href: "/admin/organisations",
    icon: Droplets,
  },
  {
    title: "Manage Users",
    href: "/admin/users",
    icon: Users,
  },
];

interface AdminSidebarProps {
  className?: string;
  onClose?: () => void;
}

export default function AdminSidebar({ className, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn("pb-12 h-screen border-r bg-card", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 px-4 mb-8">
            <Heart className="h-6 w-6 text-primary filled-primary" />
            <span className="text-xl font-bold tracking-tight">BloodLink Admin</span>
          </div>
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                  pathname === item.href
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "transparent text-muted-foreground"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      <div className="mt-auto px-3 py-2 border-t">
          <Link
            href="/feed"
            className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Droplets className="mr-2 h-4 w-4 text-primary filled-primary" />
            <span>Go to Feed</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
