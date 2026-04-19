"use client";

import { useQuery } from "@tanstack/react-query";
import { getDonorCount } from "@/services/user.service";

export function DonorStatsRow() {
  const { data } = useQuery({
    queryKey: ["donor-count"],
    queryFn: getDonorCount,
  });

  const count = data?.data ?? "...";
  const formattedCount = typeof count === "number" ? `${count.toLocaleString()}+` : count;

  return (
    <div className="flex flex-wrap gap-6 mt-8">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-sm font-semibold text-foreground">Live Database</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        <span className="text-sm font-semibold text-foreground">{formattedCount} Potential Donors</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-sm font-semibold text-foreground">Verified Contacts</span>
      </div>
    </div>
  );
}
