"use client";

import { useAuthContext } from "@/providers/AuthProvider";
import { notFound, useRouter, usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { Droplets } from "lucide-react";
import { UserRole } from "@/types";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

// ---------- Loading Spinner (Consistent with AuthProvider) ----------
function AuthLoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-background">
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-primary/30 blur-xl animate-pulse" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
          <Droplets className="h-10 w-10" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {process.env.NEXT_PUBLIC_APP_NAME_FF || "Blood"}<span className="text-primary">{process.env.NEXT_PUBLIC_APP_NAME_SS || "Link"}</span>
        </h1>
        <p className="text-sm text-muted-foreground">Verifying access...</p>
      </div>
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/auth/login?callbackUrl=${pathname}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return null; // Will be handled by useEffect redirect
  }

  if (!user || !allowedRoles.includes(user.role)) {
    // If user exists but role is not allowed, show 404
    notFound();
  }

  return <>{children}</>;
}
