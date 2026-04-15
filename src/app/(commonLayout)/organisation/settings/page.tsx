import ChangePasswordForm from "@/features/auth/components/ChangePasswordForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { RoleGuard } from "@/components/shared/RoleGuard";

export default function OrganisationSettingsPage() {
  return (
    <RoleGuard allowedRoles={["ORGANISATION"]}>
      <div className="container max-w-2xl mx-auto py-10">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Organisation Settings</h2>
            <p className="text-muted-foreground">
              Manage security and preferences for your organisation.
            </p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <CardTitle>Update Password</CardTitle>
              </div>
              <CardDescription>
                Ensure your account stays secure with a strong password.
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
