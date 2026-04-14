import EntityManagementTable from "@/features/admin/components/EntityManagementTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Management",
  description: "Monitor and manage all user accounts.",
};

export default function ManageUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-foreground/90 font-sans">User Management</h2>
        <p className="text-muted-foreground italic">
            Review and manage all individual user and donor accounts on the platform.
        </p>
      </div>

      <EntityManagementTable entityType="users" />
    </div>
  );
}
