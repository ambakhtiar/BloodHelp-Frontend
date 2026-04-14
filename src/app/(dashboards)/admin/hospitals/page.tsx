import EntityManagementTable from "@/features/admin/components/EntityManagementTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hospital Management",
  description: "Manage hospital registrations and statuses.",
};

export default function ManageHospitalsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-foreground/90 font-sans">Hospital Management</h2>
        <p className="text-muted-foreground italic flex items-center gap-2">
            Verify and manage hospital accounts across the platform.
        </p>
      </div>

      <EntityManagementTable entityType="hospitals" />
    </div>
  );
}
