"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminServices } from "@/services/admin.service";
import { Droplets, Building2, LayoutDashboard as DashIcon, Loader2, ArrowLeft, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6'];
const formatBg = (bg: string) => bg?.replace('_POSITIVE', '+').replace('_NEGATIVE', '-');

export default function AdvancedAnalytics() {
  const router = useRouter();
  
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: AdminServices.getAnalytics,
  });

  const data = analytics?.data;

  // Derive unique divisions for the filter dropdown
  const divisions = useMemo(() => {
    if (!data?.donorsByDivision) return [];
    return data.donorsByDivision
      .map((d: any) => d.division)
      .filter((div: string) => div && div.trim() !== "")
      .sort();
  }, [data]);

  const [selectedDivision, setSelectedDivision] = useState<string>("");
  
  // Use the explicitly selected division, or default to the first available division
  const activeDivision = selectedDivision || (divisions.length > 0 ? divisions[0] : "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const bloodGroupData = data?.donorsByBloodGroup?.map((d: any) => ({
    name: formatBg(d.bloodGroup),
    value: d.count
  })).sort((a: any, b: any) => b.value - a.value) || [];

  const divisionData = data?.donorsByDivision?.map((d: any) => ({
    name: d.division,
    count: d.count
  })).sort((a: any, b: any) => b.count - a.count) || [];

  // Filter blood group data based on active division
  const filteredBloodGroupData = data?.donorsByDivisionAndBloodGroup
    ?.filter((d: any) => d.division === activeDivision)
    ?.map((d: any) => ({
      name: formatBg(d.bloodGroup),
      count: d.count
    })).sort((a: any, b: any) => b.count - a.count) || [];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push("/admin")} className="gap-2 hover:bg-muted">
          <ArrowLeft className="w-4 h-4" />
          Back to Overview
        </Button>
      </div>

      {(bloodGroupData.length > 0 || divisionData.length > 0) ? (
        <div className="space-y-8">
          <h3 className="text-xl font-bold flex items-center gap-2 text-foreground/90">
            <DashIcon className="w-6 h-6 text-primary" /> Donor Distribution Analytics
          </h3>
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Blood Group Pie Chart */}
            <Card className="shadow-md border-border/50">
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-red-500" /> Donors by Blood Group
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={bloodGroupData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        label={(props: any) => `${props.name} ${((props.percent || 0) * 100).toFixed(0)}%`}
                      >
                        {bloodGroupData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any) => [value, 'Donors']}
                      />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Division Bar Chart */}
            <Card className="shadow-md border-border/50">
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-500" /> Donors by Division
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={divisionData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" opacity={0.5} />
                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: '#6b7280' }} 
                        width={80}
                      />
                      <Tooltip 
                        cursor={{ fill: '#f3f4f6' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any) => [value, 'Donors']}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="#6366f1" 
                        radius={[0, 4, 4, 0]}
                        barSize={24}
                      >
                        {divisionData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={`hsl(226, 70%, ${50 + (index * 5)}%)`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtered Analytics Section */}
          {divisions.length > 0 && (
            <div className="pt-8">
              <Card className="shadow-md border-border/50">
                <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between py-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Filter className="w-5 h-5 text-emerald-500" /> Division-wise Blood Group Breakdown
                  </CardTitle>
                  <div className="w-[200px]">
                    <Select value={activeDivision} onValueChange={setSelectedDivision}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select Division" />
                      </SelectTrigger>
                      <SelectContent>
                        {divisions.map((div: string) => (
                          <SelectItem key={div} value={div}>{div}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {filteredBloodGroupData.length > 0 ? (
                    <div className="h-[350px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={filteredBloodGroupData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 14, fontWeight: 'bold', fill: '#4b5563' }} 
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fill: '#6b7280' }} 
                          />
                          <Tooltip 
                            cursor={{ fill: '#f3f4f6' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: any) => [value, 'Donors']}
                          />
                          <Bar 
                            dataKey="count" 
                            radius={[4, 4, 0, 0]}
                            barSize={40}
                          >
                            {filteredBloodGroupData.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                      No donor data available for {activeDivision || "this division"}.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center p-10 border rounded-xl bg-muted/10">
          <p className="text-muted-foreground">No donor analytics data available yet.</p>
        </div>
      )}
    </div>
  );
}
