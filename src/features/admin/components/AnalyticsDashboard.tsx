"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminServices } from "@/services/admin.service";
import { 
  Users, 
  Droplets, 
  FileText, 
  History, 
  Building2, 
  AlertCircle, 
  UserX,
  ShieldCheck,
  ShieldAlert,
  Clock,
  LayoutDashboard as DashIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AnalyticsDashboard() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: AdminServices.getAnalytics,
  });

  const data = analytics?.data;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] w-full rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            <Skeleton className="h-[300px] w-full rounded-xl" />
            <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* SECTION 1: PLATFORM OVERVIEW */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
            <DashIcon className="w-5 h-5 text-primary" /> Platform Quick Stats
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard 
                title="Total Users" 
                value={data?.totalUsers} 
                icon={Users} 
                description="Total accounts in database"
                color="blue"
            />
            <StatCard 
                title="Blood Donors" 
                value={data?.totalBloodDonors} 
                icon={Droplets} 
                description="Verified active donors"
                color="red"
            />
            <StatCard 
                title="Total Posts" 
                value={data?.totalPosts} 
                icon={FileText} 
                description="Requests & announcements"
                color="purple"
            />
            <StatCard 
                title="Total Donation" 
                value={data?.totalDonationHistories} 
                icon={History} 
                description="Successful procedures"
                color="green"
            />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* SECTION 2: HOSPITAL BREAKDOWN */}
        <EntitySection 
            title="Hospital Management"
            icon={Building2}
            total={data?.totalHospital}
            pending={data?.pendingHospital}
            active={data?.activeHospital}
            rejected={data?.rejectedHospital}
            blocked={data?.blockedHospital}
            color="amber"
        />

        {/* SECTION 3: ORGANISATION BREAKDOWN */}
        <EntitySection 
            title="Organisation Management"
            icon={Droplets}
            total={data?.totalOrg}
            pending={data?.pendingOrg}
            active={data?.activeOrg}
            rejected={data?.rejectedOrg}
            blocked={data?.blockedOrg}
            color="cyan"
        />
      </div>

      {/* SECTION 4: USER BREAKDOWN */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-500" /> Standard User Breakdown
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
             <StatCard 
                title="Total Users (Only User)" 
                value={data?.totalStandardUser} 
                icon={Users} 
                description="Excluding hospitals/orgs"
                color="slate"
            />
             <StatCard 
                title="Blocked Users" 
                value={data?.blockedUser} 
                icon={ShieldAlert} 
                description="Accounts with restrictions"
                color="rose"
            />
             <StatCard 
                title="Rejected Requests" 
                value={data?.rejectedUser} 
                icon={UserX} 
                description="Denied registrations"
                color="rose"
            />
        </div>
      </div>
    </div>
  );
}

// ---------- Sub-components ----------

function StatCard({ title, value, icon: Icon, description, color }: any) {
  const colorMap: any = {
    blue: "text-blue-600 bg-blue-100",
    red: "text-red-600 bg-red-100",
    purple: "text-purple-600 bg-purple-100",
    green: "text-green-600 bg-green-100",
    amber: "text-amber-600 bg-amber-100",
    cyan: "text-cyan-600 bg-cyan-100",
    slate: "text-slate-600 bg-slate-100",
    rose: "text-rose-600 bg-rose-100",
  };

  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
        <div className={cn("p-2 rounded-lg", colorMap[color] || colorMap.slate)}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{(value || 0).toLocaleString()}</div>
        <p className="text-[10px] text-muted-foreground mt-1 font-medium">{description}</p>
      </CardContent>
    </Card>
  );
}

function EntitySection({ title, icon: Icon, total, pending, active, rejected, blocked, color }: any) {
    const hasPending = (pending || 0) > 0;
    
    return (
        <Card className={cn(
            "border-none shadow-md",
            hasPending && "ring-2 ring-primary/20"
        )}>
            <CardHeader className="border-b bg-muted/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-xl bg-background shadow-sm")}>
                            <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-base">{title}</CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">Total Registered: {total || 0}</p>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className={cn(
                        "p-4 rounded-2xl border transition-all",
                        hasPending ? "bg-amber-50 border-amber-200" : "bg-muted/20 border-transparent"
                    )}>
                        <div className="flex items-center justify-between mb-2">
                            <Clock className={cn("w-4 h-4", hasPending ? "text-amber-600" : "text-slate-400")} />
                            <Badge variant={hasPending ? "default" : "outline"} className={hasPending ? "bg-amber-500 hover:bg-amber-600" : ""}>Pending</Badge>
                        </div>
                        <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{pending || 0}</div>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase mt-1">Awaiting Approval</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-green-50 border border-green-100">
                        <div className="flex items-center justify-between mb-2">
                            <ShieldCheck className="w-4 h-4 text-green-600" />
                            <Badge variant="outline" className="text-green-600 border-green-200">Active</Badge>
                        </div>
                        <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{active || 0}</div>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase mt-1">Verified Entities</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100">
                        <div className="flex items-center justify-between mb-2">
                            <AlertCircle className="w-4 h-4 text-rose-600" />
                            <Badge variant="outline" className="text-rose-600 border-rose-200">Rejected</Badge>
                        </div>
                        <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{rejected || 0}</div>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase mt-1">Denied Access</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                            <ShieldAlert className="w-4 h-4 text-slate-600" />
                            <Badge variant="outline" className="text-slate-600 border-slate-300">Blocked</Badge>
                        </div>
                        <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{blocked || 0}</div>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase mt-1">Suspended Accounts</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
