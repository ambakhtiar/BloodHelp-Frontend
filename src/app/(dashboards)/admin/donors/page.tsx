import { Metadata } from "next";
import { DonorManagementTable } from "@/features/admin/components/DonorManagementTable";

export const metadata: Metadata = {
  title: "Manage Donors | Admin Dashboard",
  description: "View and manage all blood donors on the platform.",
};

export default function AdminDonorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Donor Management</h1>
        <p className="text-muted-foreground mt-1">
          Monitor and manage donor profiles, availability, and registration origins.
        </p>
      </div>
      
      <DonorManagementTable />
    </div>
  );
}
