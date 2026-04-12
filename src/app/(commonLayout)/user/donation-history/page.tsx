"use client";

import { useQuery } from "@tanstack/react-query";
import { getDonationHistory } from "@/services/user.service";
import { 
  BadgeCheck, 
  Droplets, 
  Calendar, 
  MapPin, 
  History, 
  Trophy, 
  Star, 
  Award, 
  Medal, 
  Crown,
  Heart,
  ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { format } from "date-fns";

export default function DonationHistoryPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["donation-history"],
    queryFn: getDonationHistory,
  });

  const donations = data?.data || [];
  const donationCount = donations.length;

  const getDonorRank = (count: number) => {
    if (count >= 20) return { label: "Hero Donor", color: "bg-red-600", icon: <Crown className="w-5 h-5" />, next: null };
    if (count >= 10) return { label: "Gold Donor", color: "bg-amber-500", icon: <Medal className="w-5 h-5" />, next: 20 };
    if (count >= 5) return { label: "Silver Donor", color: "bg-slate-400", icon: <Award className="w-5 h-5" />, next: 10 };
    if (count >= 3) return { label: "Bronze Donor", color: "bg-orange-400", icon: <Star className="w-5 h-5" />, next: 5 };
    if (count >= 1) return { label: "Rising Donor", color: "bg-blue-500", icon: <Trophy className="w-5 h-5" />, next: 3 };
    return { label: "Newbie Donor", color: "bg-gray-400", icon: <BadgeCheck className="w-5 h-5" />, next: 1 };
  };

  const rank = getDonorRank(donationCount);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-[600px] w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2 text-muted-foreground">
            <Link href="/profile" className="flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to Profile
            </Link>
          </Button>
          <h1 className="text-3xl font-extrabold tracking-tight">Donation History</h1>
          <p className="text-muted-foreground font-medium">Tracking your impact on saving lives</p>
        </div>
        <div className="hidden sm:block">
           <Droplets className="w-12 h-12 text-primary/20" />
        </div>
      </div>

      {/* Hero Stats Card */}
      <Card className="border-primary/10 shadow-md bg-gradient-to-br from-card to-primary/5 overflow-hidden">
        <CardContent className="p-0">
          <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className={`h-20 w-20 rounded-2xl ${rank.color} flex items-center justify-center text-white shadow-lg`}>
                {rank.icon}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Current Status</p>
                <h2 className="text-3xl font-black text-foreground">{rank.label}</h2>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-bold border-primary/20 text-primary">
                    {donationCount} Successful {donationCount === 1 ? 'Donation' : 'Donations'}
                  </Badge>
                </div>
              </div>
            </div>
            
            {rank.next && (
              <div className="bg-background/60 backdrop-blur-sm p-4 rounded-xl border border-primary/10 shadow-sm md:w-64">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Next Rank Progress</p>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${rank.color} transition-all duration-1000`} 
                    style={{ width: `${(donationCount / rank.next) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 font-medium">
                   Need {rank.next - donationCount} more donations for {getDonorRank(rank.next).label}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <History className="w-5 h-5 text-primary" /> 
          Records Log
        </h3>
        
        {donations.length > 0 ? (
          <div className="grid gap-4">
            {donations.map((donation: any, index: number) => (
              <Card key={donation.id} className="group hover:border-primary/30 transition-all duration-300 hover:shadow-sm">
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Droplets className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">
                        Blood Donation #{donations.length - index}
                      </h4>
                      <p className="text-muted-foreground text-sm flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {donation.donationDate ? format(new Date(donation.donationDate), "PPPP") : "Date not recorded"}
                      </p>
                      
                      <div className="flex flex-wrap gap-3 mt-2">
                        {donation.weightDuringDonation && (
                          <div className="flex items-center gap-1 text-[11px] bg-secondary/50 px-2 py-0.5 rounded-full text-muted-foreground">
                            Weight: <span className="font-bold text-foreground">{donation.weightDuringDonation} KG</span>
                          </div>
                        )}
                        {donation.donationCount > 1 && (
                          <div className="flex items-center gap-1 text-[11px] bg-secondary/50 px-2 py-0.5 rounded-full text-muted-foreground">
                            Count: <span className="font-bold text-foreground">{donation.donationCount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:items-end gap-3 px-4 sm:px-0">
                    <div className="flex flex-col sm:items-end gap-1">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="font-semibold">
                          {donation.receiverOrg?.name || donation.hospital?.name || "Verified Records"}
                        </span>
                      </div>
                      <Badge variant="outline" className="w-fit bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30 text-[10px]">
                        Verified Successful
                      </Badge>
                    </div>

                    {donation.postId ? (
                      <Button variant="outline" size="sm" asChild className="h-8 gap-1.5 text-xs font-bold border-primary/20 hover:bg-primary/5 hover:text-primary">
                        <Link href={`/feed/${donation.postId}`}>
                          View Source Post
                        </Link>
                      </Button>
                    ) : (
                      <span className="text-[10px] text-destructive font-bold italic bg-destructive/5 px-2 py-1 rounded">
                        Source Post Deleted
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 py-20 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <History className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-bold text-muted-foreground">No records found</h3>
            <p className="text-muted-foreground max-w-xs mt-2">
              Your donation history is empty. Records are added once a donation is confirmed by a hospital or organization.
            </p>
            <Button className="mt-6 gap-2" asChild>
              <Link href="/feed">
                <Heart className="w-4 h-4" /> Start Saving Lives
              </Link>
            </Button>
          </Card>
        )}
      </div>

      {/* Ranking System Info */}
      <Card className="bg-secondary/20 border-primary/5">
        <CardHeader className="pb-3 text-center">
          <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">Donor Ranking System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { count: "0", label: "Newbie", color: "bg-gray-400" },
              { count: "1-2", label: "Rising", color: "bg-blue-500" },
              { count: "3-5", label: "Bronze", color: "bg-orange-400" },
              { count: "6-10", label: "Silver", color: "bg-slate-400" },
              { count: "11-20", label: "Gold", color: "bg-amber-500" },
              { count: "21+", label: "Hero", color: "bg-red-600" },
            ].map((r) => (
              <div key={r.label} className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-lg ${r.color} flex items-center justify-center text-white text-[10px] font-bold`}>
                  {r.count}
                </div>
                <span className="text-xs font-bold">{r.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
