import AdvancedAnalytics from "@/features/admin/components/AdvancedAnalytics";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advanced Analytics",
  description: "Detailed system analytics and donor distribution.",
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground/90">Advanced Analytics</h2>
        <p className="text-muted-foreground italic">
          Deep dive into the platform metrics and data distributions.
        </p>
      </div>
      
      <AdvancedAnalytics />
    </div>
  );
}
