"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Heart,
  Droplets,
  ShieldCheck,
  Settings as SettingsLogo,
  LayoutDashboard,
  Building2,
  Users
} from "lucide-react";
import { useAuthContext } from "@/providers/AuthProvider";

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
  {
    title: "Manage Donors",
    href: "/admin/donors",
    icon: Heart,
  },
];

interface AdminSidebarProps {
  className?: string;
  onClose?: () => void;
}

export default function AdminSidebar({ className, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthContext();

  return (
    <div className={cn("pb-12 h-screen border-r bg-card", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 px-4 mb-8">
            <Heart className="h-6 w-6 text-primary filled-primary" />
            <p className="text-xl font-bold tracking-tight">
              {process.env.NEXT_PUBLIC_APP_NAME_FF || "Blood"}<span className="text-primary">{process.env.NEXT_PUBLIC_APP_NAME_SS || "Link"}</span>{" "}
            </p>
            <p className="text-sm block md:inline font-bold">
              {user?.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
            </p>
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

            {/* Manage Admins - SUPER_ADMIN ONLY */}
            {user?.role === "SUPER_ADMIN" && (
              <Link
                href="/admin/manage-admins"
                onClick={onClose}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                  pathname === "/admin/manage-admins"
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "transparent text-muted-foreground"
                )}
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                <span>Manage Admins</span>
              </Link>
            )}

            {/* Manage Posts - Accessible to all admins */}
            <Link
              href="/admin/manage-posts"
              onClick={onClose}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                pathname === "/admin/manage-posts"
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "transparent text-muted-foreground"
              )}
            >
              <Droplets className="mr-2 h-4 w-4" />
              <span>Manage Posts</span>
            </Link>

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
