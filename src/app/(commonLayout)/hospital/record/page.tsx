import { RecordDonationForm } from "@/features/hospital/components/RecordDonationForm";
import { PlusCircle, Info } from "lucide-react";

export const metadata = {
  title: "Record Donation | BloodLink Hospital",
  description: "Record a new blood donation for a donor.",
};

export default function RecordDonationPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-900 mb-2 flex items-center justify-center gap-3">
            <PlusCircle className="w-8 h-8 text-primary" />
            RECORD DONATION
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto">
            Easily record donor contributions and help keep our central registry up to date.
          </p>
        </div>

        {/* Form Container */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/5 blur-3xl -z-10 rounded-full" />
          <RecordDonationForm />
        </div>

        {/* Guidelines */}
        <div className="mt-12 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex gap-4 items-start">
          <div className="p-2 rounded-full bg-blue-50 text-blue-600 shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900">Hospital Guidelines</h4>
            <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
              <li>Ensure the donor's contact number is correct to link with their profile.</li>
              <li>Donors must weigh at least 45kg to be safely recorded.</li>
              <li>A digital notification will be sent to the donor upon recording.</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
