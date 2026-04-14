import Link from "next/link";
import { PlusCircle, ClipboardList, Activity, Users, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function HospitalDashboard() {
  const stats = [
    { label: "Total Recorded", value: "124", icon: Activity, color: "text-blue-600" },
    { label: "Active Donors", value: "85", icon: Users, color: "text-emerald-600" },
    { label: "This Month", value: "12", icon: Calendar, color: "text-orange-600" },
  ];

  return (
    <main className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Hospital <span className="text-primary">Dashboard</span>
          </h1>
          <p className="text-slate-500">Welcome back. Manage your blood donation records and history from here.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-none shadow-sm overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-2xl bg-slate-100 ${stat.color} group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/hospital/record">
            <Card className="h-full border-2 border-transparent hover:border-primary/20 transition-all duration-300 hover:shadow-xl group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                <PlusCircle className="w-32 h-32 text-primary" />
              </div>
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl">Record Donation</CardTitle>
                <CardDescription className="text-base">
                  Click here to register a new blood donation record in the central registry.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <span className="text-primary font-bold inline-flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                  Get Started &rarr;
                </span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/hospital/history">
            <Card className="h-full border-2 border-transparent hover:border-primary/20 transition-all duration-300 hover:shadow-xl group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                <ClipboardList className="w-32 h-32 text-primary" />
              </div>
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl">Donation History</CardTitle>
                <CardDescription className="text-base">
                  View and manage the ledger of all blood donations recorded at this hospital.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <span className="text-primary font-bold inline-flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                  View Ledger &rarr;
                </span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </main>
  );
}
