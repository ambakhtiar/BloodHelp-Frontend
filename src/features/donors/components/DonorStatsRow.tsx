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
    <div className="flex flex-wrap gap-4 mt-2">
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-tight">Live Database</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        <span className="text-[11px] font-bold text-foreground uppercase tracking-tight">{formattedCount} Potential Donors</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-tight">Verified Contacts</span>
      </div>
    </div>
  );
}
