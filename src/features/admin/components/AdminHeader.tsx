"use client";

import { usePathname } from "next/navigation";
import { 
  Bell, 
  Menu, 
  Search, 
  User as UserIcon,
  LogOut,
  Settings
} from "lucide-react";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAuthContext } from "@/providers/AuthProvider";
import { ModeToggle } from "@/components/shared/ModeToggle";
import Link from "next/link";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthContext();

  const getPageTitle = (path: string) => {
    switch (path) {
      case "/admin":
        return "Dashboard Overview";
      case "/admin/hospitals":
        return "Hospital Management";
      case "/admin/organisations":
        return "Organisation Management";
      case "/admin/users":
        return "User Management";
      default:
        return "Admin Panel";
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center gap-2 border-b bg-background px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 md:hidden -ml-2"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle navigation menu</span>
      </Button>

      <div className="flex flex-1 items-center gap-2 md:gap-4">
        <h1 className="text-sm font-bold md:text-xl capitalize truncate max-w-[120px] sm:max-w-none">
          {getPageTitle(pathname)}
        </h1>
        {user?.role && (
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
            <span className="h-1 w-1 rounded-full bg-primary animate-pulse" />
            {user.role.replace("_", " ")}
          </div>
        )}
        <div className="ml-auto flex-1 md:grow-0 hidden lg:block">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 lg:w-[320px]"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        <div className="lg:hidden">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
        </div>
        <ModeToggle />
        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <UserIcon className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.role}</p>
                <p className="text-xs leading-none text-muted-foreground italic truncate">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/profile">
              <DropdownMenuItem className="cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/admin/settings">
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive cursor-pointer"
              onClick={() => logout()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
