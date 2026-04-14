import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AddVolunteerForm from "@/features/organisation/components/AddVolunteerForm";

export const metadata = {
  title: "Add Volunteer | BloodLink Organisation",
  description: "Register a new blood donor volunteer under your organisation.",
};

export default function AddVolunteerPage() {
  return (
    <div className="container mx-auto max-w-3xl py-8 px-4 space-y-6">
      {/* Back link */}
      <div>
        <Button asChild variant="ghost" className="text-slate-500 hover:text-slate-700 -ml-2">
          <Link href="/organisation/volunteers">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Volunteers
          </Link>
        </Button>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-primary" />
          Add New Volunteer
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manually register a blood donor as a volunteer for your organisation.
        </p>
      </div>

      {/* Form Card */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-lg font-bold text-slate-800">Volunteer Information</CardTitle>
          <CardDescription>
            Fill in the details below. Fields marked with <span className="text-primary font-bold">*</span> are required.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <AddVolunteerForm />
        </CardContent>
      </Card>
    </div>
  );
}
