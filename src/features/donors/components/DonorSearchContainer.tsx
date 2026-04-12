"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDonorsList, DonorFilters } from "@/services/user.service";
import { DonorSearchFilter, DonorFilterValues } from "./DonorSearchFilter";
import { DonorCard, DonorCardSkeleton } from "./DonorCard";
import { SearchX, Users, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function DonorSearchContainer() {
  const [filters, setFilters] = useState<DonorFilters>({
    searchTerm: "",
    bloodGroup: "",
    division: "",
    district: "",
    upazila: "",
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["donors", filters],
    queryFn: () => getDonorsList(filters),
    placeholderData: (previousData) => previousData,
  });

  const handleFilterChange = (newFilters: DonorFilterValues) => {
    setFilters(newFilters);
  };

  const donors = data?.data || [];

  return (
    <div className="space-y-10">
      {/* FILTER SECTION */}
      <section className="animate-in fade-in slide-in-from-top-4 duration-500">
        <DonorSearchFilter 
          onFilterChange={handleFilterChange} 
          isFetching={isFetching} 
        />
      </section>

      {/* RESULTS SECTION */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-primary/10 pb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">
              All Matching Donors
            </h2>
          </div>
          <p className="text-sm font-bold text-muted-foreground">
            {isLoading ? "Searching..." : `${donors.length} donors found`}
          </p>
        </div>

        {isLoading ? (
          /* SKELETON GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <DonorCardSkeleton key={i} />
            ))}
          </div>
        ) : donors.length > 0 ? (
          /* DONOR GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-500">
            {donors.map((donor) => (
              <DonorCard key={donor.id} donor={donor} />
            ))}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center p-12 text-center bg-card/20 backdrop-blur-sm rounded-2xl border-2 border-dashed border-primary/10 min-h-[400px] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="h-24 w-24 rounded-full bg-primary/5 flex items-center justify-center mb-6">
              <SearchX className="h-12 w-12 text-primary opacity-50" />
            </div>
            <h3 className="text-2xl font-black text-foreground mb-2">No Donors Found</h3>
            <p className="text-muted-foreground max-w-md mb-8 font-medium">
              We couldn't find any donors matching your current filters. Try broadening your search or choosing a different location.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                onClick={() => handleFilterChange({})} 
                variant="outline" 
                className="font-bold border-primary/20 hover:bg-primary/5"
              >
                Clear All Filters
              </Button>
              <Button asChild className="gap-2 bg-primary hover:bg-primary/90 font-bold">
                <Link href="/posts/create">
                  Post a Request <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
