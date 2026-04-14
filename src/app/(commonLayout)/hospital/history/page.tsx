import { HospitalRecordsTable } from "@/features/hospital/components/HospitalRecordsTable";
import { ClipboardList, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Donation History | BloodLink Hospital",
  description: "View all recorded blood donations for your hospital.",
};

export default function DonationHistoryPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
              <ClipboardList className="w-4 h-4" />
              Administrative Tools
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Donation <span className="text-primary">History</span>
            </h1>
            <p className="text-slate-500 max-w-md">
              A comprehensive history of all blood donations recorded at your facility.
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2 border-slate-200">
              <Filter className="w-4 h-4" /> Export Report
            </Button>
          </div>
        </div>

        {/* Action Table */}
        <div className="bg-white rounded-3xl p-1 shadow-xl shadow-slate-200/50">
          <HospitalRecordsTable />
        </div>
      </div>
    </main>
  );
}
