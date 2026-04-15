import ChangePasswordForm from "@/features/auth/components/ChangePasswordForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account security and preferences.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <CardTitle>Change Password</CardTitle>
            </div>
            <CardDescription>
              We recommend using a strong password that you don't use elsewhere.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <ChangePasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
