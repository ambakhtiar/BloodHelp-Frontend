"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  X,
  Droplets,
  LogOut,
  User,
  ChevronDown,
  PlusCircle,
  ClipboardList,
  UserPlus,
  Users,
  Settings as SettingsIcon
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { useAuthContext } from "@/providers/AuthProvider";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/feed", label: "Feed" },
  { href: "/donors", label: "Search Donors" },
  { href: "/about", label: "About" },
];

// Helper: get display name from user profile
function getUserDisplayName(
  user: ReturnType<typeof useAuthContext>["user"]
): string {
  if (!user) return "";
  return (
    user.donorProfile?.name ||
    user.hospital?.name ||
    user.organisation?.name ||
    user.admin?.name ||
    user.email?.split("@")[0] ||
    user.contactNumber ||
    "User"
  );
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthContext();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const displayName = getUserDisplayName(user);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setMobileOpen(false);
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105">
            <Droplets className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            {process.env.NEXT_PUBLIC_APP_NAME_FF || "Blood"}<span className="text-primary">{process.env.NEXT_PUBLIC_APP_NAME_SS || "Link"}</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-md ${isActive
                      ? "text-primary bg-primary/10 font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-t-lg" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated && user && <NotificationBell />}
          <ThemeToggle />

          {isAuthenticated && user ? (
            // ---------- User Dropdown ----------
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                aria-haspopup="true"
                aria-expanded={userMenuOpen}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold border border-primary/20 overflow-hidden shrink-0">
                  {user.profilePictureUrl ? (
                    <img
                      src={user.profilePictureUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    displayName.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="max-w-[120px] truncate">{displayName}</span>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {userMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  {/* Dropdown */}
                  <div className="absolute right-0 top-full z-20 mt-1 w-52 rounded-xl border border-border bg-popover p-1 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-border/50 mb-1">
                      <p className="text-xs text-muted-foreground">Signed in as</p>
                      <p className="text-sm font-medium truncate">{displayName}</p>
                      <span className="text-xs text-primary capitalize">
                        {user.role.replace("_", " ").toLowerCase()}
                      </span>
                    </div>

                    {/* Role-based Quick Links */}
                    {user.role === "USER" && (
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          router.push("/user/donation-history");
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                      >
                        <Droplets className="h-4 w-4" />
                        Donation History
                      </button>
                    )}
                    {user.role === "HOSPITAL" && (
                      <>
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            router.push("/hospital/record");
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                        >
                          <PlusCircle className="h-4 w-4" />
                          Record Donation
                        </button>
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            router.push("/hospital/history");
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                        >
                          <ClipboardList className="h-4 w-4" />
                          Donation History
                        </button>
                      </>
                    )}
                    {user.role === "ORGANISATION" && (
                      <>
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            router.push("/organisation/volunteers");
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                        >
                          <Users className="h-4 w-4" />
                          Manage Volunteers
                        </button>
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            router.push("/organisation/volunteers/add");
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                        >
                          <UserPlus className="h-4 w-4" />
                          Add Volunteer
                        </button>
                      </>
                    )}
                    {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          router.push("/admin");
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                      >
                        <User className="h-4 w-4" />
                        Admin Dashboard
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        const settingsPath =
                          user.role === "HOSPITAL" ? "/hospital/settings" :
                            user.role === "ORGANISATION" ? "/organisation/settings" :
                              (user.role === "ADMIN" || user.role === "SUPER_ADMIN") ? "/admin/settings" :
                                "/profile/settings";
                        router.push(settingsPath);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                    >
                      <SettingsIcon className="h-4 w-4" />
                      Settings
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        router.push("/profile");
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                    >
                      <User className="h-4 w-4" />
                      My Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            // ---------- Guest Buttons ----------
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register">Register</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Right */}
        <div className="flex items-center gap-3 md:hidden">
          {isAuthenticated && user && <NotificationBell />}
          <ThemeToggle />
          <button
            className="rounded-md p-2 text-muted-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary z-50 relative"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {mobileOpen ? (
              <X className="block h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="block h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors ${isActive
                      ? "bg-primary/10 text-primary font-bold border-l-4 border-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground border-l-4 border-transparent"
                    }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-3 border-t border-border/40 space-y-2">
              {isAuthenticated && user ? (
                <>
                  <div className="px-4 py-2 text-sm text-muted-foreground">
                    Signed in as{" "}
                    <span className="font-medium text-foreground">
                      {displayName}
                    </span>
                  </div>
                  <Link
                    href={
                      user.role === "HOSPITAL" ? "/hospital/settings" :
                        user.role === "ORGANISATION" ? "/organisation/settings" :
                          (user.role === "ADMIN" || user.role === "SUPER_ADMIN") ? "/admin/settings" :
                            "/profile/settings"
                    }
                    className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
                    onClick={() => setMobileOpen(false)}
                  >
                    <SettingsIcon className="h-4 w-4" />
                    Settings
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
                    onClick={() => setMobileOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </Link>

                  {/* Role-based Mobile Links */}
                  {user.role === "USER" && (
                    <Link
                      href="/user/donation-history"
                      className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Droplets className="h-4 w-4" />
                      Donation History
                    </Link>
                  )}
                  {user.role === "HOSPITAL" && (
                    <>
                      <Link
                        href="/hospital/record"
                        className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
                        onClick={() => setMobileOpen(false)}
                      >
                        <PlusCircle className="h-4 w-4" />
                        Record Donation
                      </Link>
                      <Link
                        href="/hospital/history"
                        className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
                        onClick={() => setMobileOpen(false)}
                      >
                        <ClipboardList className="h-4 w-4" />
                        Donation History
                      </Link>
                    </>
                  )}
                  {user.role === "ORGANISATION" && (
                    <>
                      <Link
                        href="/organisation/volunteers"
                        className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
                        onClick={() => setMobileOpen(false)}
                      >
                        <Users className="h-4 w-4" />
                        Manage Volunteers
                      </Link>
                      <Link
                        href="/organisation/volunteers/add"
                        className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
                        onClick={() => setMobileOpen(false)}
                      >
                        <UserPlus className="h-4 w-4" />
                        Add Volunteer
                      </Link>
                    </>
                  )}
                  {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
                      onClick={() => setMobileOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href="/auth/login">Login</Link>
                  </Button>
                  <Button size="sm" className="flex-1" asChild>
                    <Link href="/auth/register">Register</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
