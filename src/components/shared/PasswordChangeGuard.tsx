"use client";

import { useAuthContext } from "@/providers/AuthProvider";
import { ReactNode } from "react";
import ChangePasswordForm from "@/features/auth/components/ChangePasswordForm";
import { Droplets, ShieldAlert } from "lucide-react";

interface PasswordChangeGuardProps {
  children: ReactNode;
}

export default function PasswordChangeGuard({ children }: PasswordChangeGuardProps) {
  const { user, isAuthenticated } = useAuthContext();

  // If user is logged in and needs a password change, show the force layout
  if (isAuthenticated && user?.needsPasswordChange) {
    return (
      <div className="fixed inset-0 z-[9999] bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-2xl border shadow-xl">
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Security Update</h1>
            <p className="text-sm text-muted-foreground">
              Your account requires a mandatory password update before you can continue.
            </p>
          </div>

          <div className="bg-muted/30 p-4 rounded-xl border border-dashed border-primary/20">
             <ChangePasswordForm hideOldPassword={false} />
          </div>

          <p className="text-[10px] text-center text-muted-foreground italic">
            Logging in as <span className="font-semibold">{user.email || user.contactNumber}</span>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
