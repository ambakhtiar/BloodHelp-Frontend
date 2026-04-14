import EntityManagementTable from "@/features/admin/components/EntityManagementTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organisation Management",
  description: "Manage organisation registrations and statuses.",
};

export default function ManageOrganisationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-foreground/90 font-sans">Organisation Management</h2>
        <p className="text-muted-foreground italic">
            Verify and manage blood donation organisations and volunteer groups.
        </p>
      </div>

      <EntityManagementTable entityType="organisations" />
    </div>
  );
}
