import { Metadata } from "next";
import { AdminsTable } from "@/features/super-admin/components/AdminsTable";
import { CreateAdminModal } from "@/features/super-admin/components/CreateAdminModal";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Manage Admins | BloodLink",
  description: "Administrative account management for Super Admins.",
};

export default function ManageAdminsPage() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Administrators</h1>
          </div>
          <p className="text-muted-foreground ml-10">
            Create, update, and manage access for system-wide administrative accounts.
          </p>
        </div>
        <div>
          <CreateAdminModal />
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        <div className="bg-muted/30 p-4 rounded-lg border border-primary/20 flex items-start gap-3">
          <div className="mt-1 bg-primary/20 p-1 rounded-full">
            <ShieldCheck className="h-4 w-4 text-primary" />
          </div>
          <div className="text-sm">
            <p className="font-semibold text-primary">Security Protocol</p>
            <p className="text-muted-foreground">
              Only Super Administrators can access this module. All actions are logged and strictly enforced via backend role-based access control.
            </p>
          </div>
        </div>

        <AdminsTable />
      </div>
    </div>
  );
}
