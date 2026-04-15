import ChangePasswordForm from "@/features/auth/components/ChangePasswordForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { RoleGuard } from "@/components/shared/RoleGuard";

export default function ProfileSettingsPage() {
  return (
    <RoleGuard allowedRoles={["USER", "ADMIN", "SUPER_ADMIN", "HOSPITAL", "ORGANISATION"]}>
      <div className="container max-w-2xl mx-auto py-10">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            <p className="text-muted-foreground">
              Manage your personal account security.
            </p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <CardTitle>Change Password</CardTitle>
              </div>
              <CardDescription>
                Update your login password to keep your account safe.
              </CardDescription>
            </CardHeader>
            <CardContent>
               <ChangePasswordForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
