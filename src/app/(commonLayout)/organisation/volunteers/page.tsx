import { Suspense } from "react";
import Link from "next/link";
import { UserPlus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import VolunteersTable from "@/features/organisation/components/VolunteersTable";

export const metadata = {
  title: "Manage Volunteers | BloodLink Organisation",
  description: "View and manage your registered blood donor volunteers.",
};

export default function OrganisationVolunteersPage() {
  return (
    <div className="container mx-auto max-w-6xl py-8 px-4 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Manage Volunteers
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            View all volunteers registered under your organisation.
          </p>
        </div>
        <Button asChild>
          <Link href="/organisation/volunteers/add">
            <UserPlus className="w-4 h-4 mr-2" />
            Add New Volunteer
          </Link>
        </Button>
      </div>

      {/* Volunteers Table */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-lg font-bold text-slate-800">Volunteer List</CardTitle>
          <CardDescription>All blood donor volunteers linked to your organisation.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Suspense fallback={
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          }>
            <VolunteersTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
