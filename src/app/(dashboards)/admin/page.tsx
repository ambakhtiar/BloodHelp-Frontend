import AnalyticsDashboard from "@/features/admin/components/AnalyticsDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Overview",
  description: "Monitor system analytics and overview.",
};

export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground/90">System Overview</h2>
        <p className="text-muted-foreground italic">
          Track core metrics and user activity across the {process.env.NEXT_PUBLIC_APP_NAME_FF}{process.env.NEXT_PUBLIC_APP_NAME_SS} platform.
        </p>
      </div>
      
      <AnalyticsDashboard />
    </div>
  );
}
