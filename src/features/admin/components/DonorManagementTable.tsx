"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Heart, 
  Search, 
  MapPin, 
  User, 
  Building2, 
  Droplets,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Phone,
  Award,
  Layers,
  Trophy,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { AdminServices } from "@/services/admin.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

// Ranking Helper
const getDonorRank = (count: number) => {
  if (count === 0) return { label: "Newbie", color: "bg-slate-100 text-slate-600 border-slate-200", icon: Award };
  if (count <= 2) return { label: "Rising", color: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: Layers };
  if (count <= 5) return { label: "Bronze", color: "bg-orange-50 text-orange-700 border-orange-200", icon: Trophy };
  if (count <= 10) return { label: "Silver", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Trophy };
  if (count <= 20) return { label: "Gold", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Trophy };
  return { label: "Hero", color: "bg-primary/10 text-primary border-primary/20 shadow-sm", icon: Heart };
};

export function DonorManagementTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const [bloodGroup, setBloodGroup] = useState<string>("ALL");
  const [district, setDistrict] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  
  const debouncedDistrict = useDebounce(district, 500);

  const { data, isLoading } = useQuery({
    queryKey: ["admin_donors", { page, limit, searchTerm: debouncedSearch, bloodGroup: bloodGroup === "ALL" ? "" : bloodGroup, district: debouncedDistrict, startDate, endDate, sortBy, sortOrder }],
    queryFn: () => 
      AdminServices.getDonors({
        page,
        limit,
        searchTerm: debouncedSearch,
        bloodGroup: bloodGroup === "ALL" ? "" : bloodGroup,
        district: debouncedDistrict,
        startDate,
        endDate,
        sortBy,
        sortOrder
      }),
  });

  const donors = data?.data || [];
  const meta = data?.meta;

  const totalPages = meta?.total ? Math.ceil(meta.total / limit) : 0;

  return (
    <div className="space-y-6">
      {/* ────────────────── Modern Controls Bar ────────────────── */}
      <div className="flex flex-col lg:flex-row gap-4 items-end lg:items-center justify-between bg-card/60 backdrop-blur-md p-5 rounded-2xl border border-primary/10 shadow-sm">
        <div className="flex flex-1 items-center gap-3 w-full max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search donors..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-10 h-12 rounded-xl border-primary/10 bg-background/50 focus:ring-primary/20 transition-all font-medium"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Location Filter */}
          <Input
            placeholder="Location/District..."
            value={district}
            onChange={(e) => {
              setDistrict(e.target.value);
              setPage(1);
            }}
            className="w-[160px] h-10 rounded-xl border-primary/10 bg-background/50 text-xs font-medium"
          />

          {/* Start Date */}
          <Input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="w-[140px] h-10 rounded-xl border-primary/10 bg-background/50 text-xs font-medium"
            title="Joined After"
          />

          {/* End Date */}
          <Input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="w-[140px] h-10 rounded-xl border-primary/10 bg-background/50 text-xs font-medium"
            title="Joined Before"
          />

          {/* Blood Group Filter */}
          <Select 
            value={bloodGroup} 
            onValueChange={(val) => {
              setBloodGroup(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[130px] h-10 rounded-xl border-primary/10 bg-background/50 font-semibold text-xs tracking-wider uppercase">
              <SelectValue placeholder="Blood Group" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-primary/10 font-bold">
              <SelectItem value="ALL">All Groups</SelectItem>
              <SelectItem value="A_POSITIVE">A+</SelectItem>
              <SelectItem value="A_NEGATIVE">A-</SelectItem>
              <SelectItem value="B_POSITIVE">B+</SelectItem>
              <SelectItem value="B_NEGATIVE">B-</SelectItem>
              <SelectItem value="AB_POSITIVE">AB+</SelectItem>
              <SelectItem value="AB_NEGATIVE">AB-</SelectItem>
              <SelectItem value="O_POSITIVE">O+</SelectItem>
              <SelectItem value="O_NEGATIVE">O-</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Filter */}
          <Select 
            value={`${sortBy}-${sortOrder}`} 
            onValueChange={(val) => {
              const [by, order] = val.split("-");
              setSortBy(by);
              setSortOrder(order);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px] h-10 rounded-xl border-primary/10 bg-background/50 font-semibold text-xs tracking-wider uppercase">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-primary/10 font-bold text-xs">
              <SelectItem value="createdAt-desc">Newly Added</SelectItem>
              <SelectItem value="createdAt-asc">Oldest Added</SelectItem>
              <SelectItem value="lastDonationDate-desc">Last Donation (Recent)</SelectItem>
              <SelectItem value="lastDonationDate-asc">Last Donation (Oldest)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ────────────────── Enhanced Table Container ────────────────── */}
      <div className="rounded-2xl border border-primary/10 bg-card/40 backdrop-blur-sm shadow-xl shadow-primary/5 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5 hover:bg-primary/5 border-primary/5">
                <TableHead className="w-[280px] h-14 font-bold text-primary uppercase text-[11px] tracking-widest pl-6">
                  Donor Info
                </TableHead>
                <TableHead className="font-bold text-primary uppercase text-[11px] tracking-widest">
                  Location & Blood
                </TableHead>
                <TableHead className="font-bold text-primary uppercase text-[11px] tracking-widest">
                  Rank / Donations
                </TableHead>
                <TableHead className="font-bold text-primary uppercase text-[11px] tracking-widest">
                  Added By / Profile
                </TableHead>
                <TableHead className="text-right pr-6 font-bold text-primary uppercase text-[11px] tracking-widest">
                  Last Donation
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5} className="py-6 px-6">
                      <Skeleton className="h-12 w-full rounded-xl" />
                    </TableCell>
                  </TableRow>
                ))
              ) : donors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-[400px] text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <AlertCircle className="h-10 w-10 mb-4 opacity-20" />
                      <p className="text-lg font-semibold">No donors found</p>
                      <p className="text-sm">Try adjusting your filters or search terms.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                donors.map((donor: any) => {
                  const isPlatformUser = !!donor.user;
                  const addedByHospital = donor.hospitalRecords?.[0]?.hospital;
                  const addedByOrg = donor.organisationVols?.[0]?.organisation;

                  // Calculate total donation count
                  const donationCount = donor.donations?.reduce((acc: number, curr: any) => acc + (curr.donationCount || 1), 0) || 0;
                  const rank = getDonorRank(donationCount);
                  const RankIcon = rank.icon;

                  return (
                    <TableRow key={donor.id} className="hover:bg-primary/5 transition-colors border-primary/5 group">
                      
                      {/* Name & Contact */}
                      <TableCell className="pl-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="font-semibold text-foreground text-sm">
                            {isPlatformUser ? (
                              <Link href={`/profile/${donor.user.id}`} className="hover:text-primary transition-colors flex items-center gap-1.5 group-hover:underline">
                                {donor.name}
                              </Link>
                            ) : (
                              <span>{donor.name}</span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Phone className="h-3 w-3" /> {donor.contactNumber}
                          </div>
                        </div>
                      </TableCell>

                      {/* Location & Blood Group */}
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-semibold px-2 py-0 text-xs">
                              {donor.bloodGroup?.replace("_POSITIVE", "+").replace("_NEGATIVE", "-")}
                            </Badge>
                            <span className="text-xs text-muted-foreground capitalize">
                              {donor.gender?.toLowerCase()}
                            </span>
                          </div>
                          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            <div className="flex flex-col">
                              <span>{donor.district}{donor.upazila ? `, ${donor.upazila}` : ''}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Ranking & count */}
                      <TableCell>
                        <div className="flex flex-col gap-1.5">
                          <Badge variant="outline" className={cn("w-fit font-semibold px-2.5 py-0.5 border flex items-center gap-1.5 shadow-sm text-[10px] uppercase tracking-wider", rank.color)}>
                            <RankIcon className="w-3 h-3" />
                            {rank.label}
                          </Badge>
                          <span className="text-xs font-medium text-muted-foreground pl-1">
                            {donationCount} {donationCount === 1 ? 'time' : 'times'}
                          </span>
                        </div>
                      </TableCell>

                      {/* Origin Badge */}
                      <TableCell>
                        {isPlatformUser ? (
                          <div className="flex flex-col gap-1 items-start">
                            <Badge className="w-fit bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none px-2 py-0">Platform User</Badge>
                            <Link href={`/profile/${donor.user.id}`} className="text-xs text-primary hover:underline font-medium flex items-center gap-1">
                              View Profile <ArrowUpRight className="w-3 h-3" />
                            </Link>
                          </div>
                        ) : addedByHospital ? (
                          <div className="flex flex-col gap-1 items-start">
                              <Badge className="w-fit bg-teal-50 text-teal-700 hover:bg-teal-100 border-none px-2 py-0">Clinic Entry</Badge>
                              <Link href={`/profile/${addedByHospital.id}`} className="text-[10px] text-muted-foreground hover:text-primary hover:underline truncate max-w-[150px] font-medium flex items-center gap-1" title={addedByHospital.hospital?.name}>
                                By {addedByHospital.hospital?.name || 'Unknown Hospital'}
                                <ArrowUpRight className="w-2.5 h-2.5" />
                              </Link>
                          </div>
                        ) : addedByOrg ? (
                          <div className="flex flex-col gap-1 items-start">
                              <Badge className="w-fit bg-blue-50 text-blue-700 hover:bg-blue-100 border-none px-2 py-0">Org Entry</Badge>
                              <Link href={`/profile/${addedByOrg.id}`} className="text-[10px] text-muted-foreground hover:text-primary hover:underline truncate max-w-[150px] font-medium flex items-center gap-1" title={addedByOrg.organisation?.name}>
                                By {addedByOrg.organisation?.name || 'Unknown Organization'}
                                <ArrowUpRight className="w-2.5 h-2.5" />
                              </Link>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-[10px] font-medium text-muted-foreground px-2 py-0 bg-muted/20">Manual Record</Badge>
                        )}
                      </TableCell>

                      {/* Last Donation Date */}
                      <TableCell className="text-right pr-6">
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="text-sm font-medium text-foreground">
                              {donor.lastDonationDate 
                                ? format(new Date(donor.lastDonationDate), "MMM dd, yyyy") 
                                : 'N/A'}
                          </span>
                          {donor.lastDonationDate && (
                            <span className="text-[10px] tracking-wider font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                                Verified
                            </span>
                          )}
                        </div>
                      </TableCell>

                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* ────────────────── Pagination ────────────────── */}
      {totalPages > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-5 bg-card/60 backdrop-blur-md border border-primary/10 rounded-2xl shadow-sm gap-4">
          <div className="text-xs font-medium text-muted-foreground text-center sm:text-left">
            Showing <span className="text-foreground font-semibold">{(page - 1) * limit + 1}-{Math.min(page * limit, meta?.total || 0)}</span> of <span className="text-foreground font-semibold">{meta?.total || 0}</span> donors
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 rounded-xl border-primary/10 font-medium transition-all shadow-sm disabled:opacity-50 text-xs"
              onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setPage((p) => Math.max(1, p - 1));
              }}
              disabled={page === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-1.5" />
              Prev
            </Button>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/30 border border-primary/5">
              {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  if (pageNum === 1 || pageNum === totalPages || (pageNum >= page - 1 && pageNum <= page + 1)) {
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "ghost"}
                          size="sm"
                          className={cn(
                            "h-7 w-7 p-0 rounded-lg text-xs font-semibold transition-all",
                            page === pageNum 
                              ? "shadow-md" 
                              : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                          )}
                          onClick={() => {
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                              setPage(pageNum);
                          }}
                        >
                          {pageNum}
                        </Button>
                      );
                  } else if (pageNum === page - 2 || pageNum === page + 2) {
                      return <span key={pageNum} className="text-muted-foreground font-bold text-xs mx-1">...</span>;
                  }
                  return null;
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 rounded-xl border-primary/10 font-medium transition-all shadow-sm disabled:opacity-50 text-xs"
              onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setPage((p) => Math.min(totalPages, p + 1));
              }}
              disabled={page >= totalPages || isLoading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
