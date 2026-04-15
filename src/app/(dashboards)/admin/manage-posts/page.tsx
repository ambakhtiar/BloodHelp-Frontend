import { Metadata } from "next";
import { ManagePostsTable } from "@/features/admin/components/ManagePostsTable";
import { FileText, Droplets } from "lucide-react";

export const metadata: Metadata = {
  title: "Manage Posts | BloodLink Admin",
  description: "Review and verify blood donation and financial help requests.",
};

export default function ManagePostsPage() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Post Management</h1>
          </div>
          <p className="text-muted-foreground ml-10">
            Review community requests, approve posts for visibility, and verify financial authenticity.
          </p>
        </div>
      </div>

      {/* Stats/Quick Tips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Droplets className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Verification Logic</p>
            <p className="text-xs">Help posts only show payment info after verification.</p>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-warning" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Default Visibility</p>
            <p className="text-xs">Posts currently default to Approved: True.</p>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <ManagePostsTable />
    </div>
  );
}
