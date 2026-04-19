"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { getPublicProfile } from "@/services/user.service";
import { PostCard } from "@/features/feed/components/PostCard";
import { 
  Heart, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  Trophy, 
  Award,
  Layers,
  Info
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Donor Ranking Logic
const getDonorRank = (count: number) => {
  if (count === 0) return { label: "Newbie", color: "bg-slate-100 text-slate-600 border-slate-200", icon: Award };
  if (count <= 2) return { label: "Rising", color: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: Layers };
  if (count <= 5) return { label: "Bronze", color: "bg-orange-50 text-orange-700 border-orange-200", icon: Trophy };
  if (count <= 10) return { label: "Silver", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Trophy };
  if (count <= 20) return { label: "Gold", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Trophy };
  return { label: "Hero", color: "bg-primary/10 text-primary border-primary/20 animate-pulse", icon: Heart };
};

export default function PublicProfilePage() {
  const { userId } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["public-profile", userId],
    queryFn: () => getPublicProfile(userId as string),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl space-y-8">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 col-span-2 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Profile not found</h1>
        <p className="text-muted-foreground">The user you are looking for does not exist or has been removed.</p>
      </div>
    );
  }

  const { user, posts, donationCount } = data.data;
  const rank = getDonorRank(donationCount);
  const RankIcon = rank.icon;

  const displayName = 
    user.donorProfile?.name || 
    user.hospital?.name || 
    user.organisation?.name || 
    "User";

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Profile Header */}
      <section className="relative pt-12 pb-24 bg-primary/5 border-b border-primary/10 overflow-hidden">
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl -mr-32 -mt-32" />
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10">
            {/* Avatar */}
            <div className="h-32 w-32 md:h-40 md:w-40 rounded-full bg-background border-4 border-primary/20 flex items-center justify-center text-4xl md:text-5xl font-black text-primary shadow-2xl relative z-10 overflow-hidden">
              {user.profilePictureUrl ? (
                <img src={user.profilePictureUrl} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                displayName[0].toUpperCase()
              )}
            </div>

            <div className="flex-1 text-center md:text-left space-y-4 relative z-10">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                    {displayName}
                  </h1>
                  {user.role === 'USER' && (
                    <Badge variant="outline" className={cn("px-3 py-1 rounded-full font-semibold text-xs border-2 flex items-center gap-1.5 shadow-sm", rank.color, rank.label === 'Hero' ? 'shadow-primary/20' : '')}>
                      <RankIcon className="w-3.5 h-3.5" />
                      {rank.label}
                    </Badge>
                  )}
                </div>
                <div className="text-base text-muted-foreground font-medium flex items-center justify-center md:justify-start gap-2">
                  <Badge variant="secondary" className="font-semibold text-xs">{user.role}</Badge>
                  Joined {format(new Date(user.createdAt), "MMMM yyyy")}
                </div>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                  <MapPin className="w-4 h-4 text-primary" />
                  {user.district}, {user.division}
                </div>
                {user.contactNumber && (
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                    <Phone className="w-4 h-4 text-primary" />
                    {user.contactNumber}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                  <Mail className="w-4 h-4 text-primary" />
                  {user.email}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar: Stats & Info */}
          <div className="space-y-6">
            <Card className="border-primary/10 shadow-lg overflow-hidden rounded-2xl bg-card/60 backdrop-blur-md">
              <div className="bg-primary/5 p-4 border-b border-primary/10">
                <h3 className="font-bold text-primary tracking-wide text-sm flex items-center gap-2">
                  <Trophy className="w-4 h-4" /> Donation Stats
                </h3>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-3xl font-bold text-foreground">{donationCount}</p>
                    <p className="text-xs font-semibold text-muted-foreground tracking-wide">Total Donations</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20">
                    <Heart className="w-7 h-7 filled-primary" />
                  </div>
                </div>

                {user.role === 'USER' && (
                  <div className="p-4 rounded-xl bg-muted/40 border border-primary/5 space-y-2">
                    <p className="text-sm font-bold text-foreground tracking-wide flex items-center gap-2">
                      <Award className="w-4 h-4 text-primary" /> Current Rank
                    </p>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                      This donor is a <span className="text-primary font-bold">{rank.label}</span>. 
                      {donationCount === 0 
                        ? " Encourage them to start their life-saving journey!" 
                        : ` They have consistently contributed to saving lives ${donationCount} times.`}
                    </p>
                  </div>
                )}

                {(user.donorProfile || user.bloodDonor) && (
                  <div className="pt-5 border-t border-primary/5 space-y-4">
                     <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-muted-foreground">Blood Group</span>
                        <Badge className="bg-primary text-primary-foreground font-bold px-3 py-0.5 shadow-sm">
                          {(user.donorProfile?.bloodGroup || user.bloodDonor?.bloodGroup || "").replace("_POSITIVE", "+").replace("_NEGATIVE", "-")}
                        </Badge>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-muted-foreground">Availability</span>
                        <Badge variant={(user.donorProfile?.isAvailableForDonation ?? user.bloodDonor?.isAvailable) ? "default" : "secondary"} className={cn("font-bold text-xs shadow-sm", (user.donorProfile?.isAvailableForDonation ?? user.bloodDonor?.isAvailable) ? "bg-emerald-500 hover:bg-emerald-600" : "")}>
                          {(user.donorProfile?.isAvailableForDonation ?? user.bloodDonor?.isAvailable) ? "Ready to Donate" : "Resting"}
                        </Badge>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-muted-foreground">Last Donation</span>
                        <span className="text-sm font-bold text-foreground">
                          {user.donorProfile?.lastDonationDate || user.bloodDonor?.lastDonationDate
                            ? format(new Date(user.donorProfile?.lastDonationDate || user.bloodDonor?.lastDonationDate), "dd MMM, yyyy")
                            : "Never Donated"}
                        </span>
                     </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Motivational Banner */}
            {(() => {
              // Only regular users with a blood donor profile should get the motivation message
              if (user.role !== 'USER' || (!user.donorProfile && !user.bloodDonor)) return null;

              const donationDate = user.donorProfile?.lastDonationDate || user.bloodDonor?.lastDonationDate;
              let isEligible = false;

              if (!donationDate) {
                // If they never donated, they are eligible 
                isEligible = true;
              } else {
                const lastDate = new Date(donationDate);
                const monthsSince = (new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
                // Get gender from bloodDonor profile. Default to MALE condition if unknown
                const gender = user.bloodDonor?.gender || 'MALE';
                const requiredMonths = gender === 'FEMALE' ? 4 : 3;
                
                if (monthsSince >= requiredMonths) {
                  isEligible = true;
                }
              }

              if (isEligible) {
                return (
                  <Card className="border-emerald-200 shadow-lg overflow-hidden rounded-2xl bg-emerald-50/50 backdrop-blur-md animate-in fade-in zoom-in duration-700">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200">
                          <Heart className="w-5 h-5 text-emerald-600 fill-emerald-600" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-bold text-emerald-800 text-base">পরোপকারের মহা সুযোগ!</h4>
                          <p className="text-sm text-emerald-700 font-medium leading-relaxed">
                            রক্ত দিয়ে মানুষকে সাহায্য করার সুযোগাতা হাতছাড়া করবেন না। আপনি এখন রক্তদানের জন্য একদম উপযুক্ত! চলুন রক্ত দিয়ে মানুষকে সাহায্য করার সুযোগটা মিস না করি।
                          </p>
                          <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 rounded-lg mt-1 w-fit">
                            <Link href="/posts/create">চলো রক্ত দেই</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }
              return null;
            })()}

            <Card className="border-primary/10 shadow-lg overflow-hidden rounded-2xl bg-card/60 backdrop-blur-md">
              <div className="bg-primary/5 p-4 border-b border-primary/10">
                <h3 className="font-bold text-primary tracking-wide text-sm flex items-center gap-2">
                  <Info className="w-4 h-4" /> About
                </h3>
              </div>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  Registered on {process.env.NEXT_PUBLIC_APP_NAME_FF}{process.env.NEXT_PUBLIC_APP_NAME_SS} as a {user.role.toLowerCase()}. Committed to building a stronger, healthier community through the platform.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Main: Activity/Posts */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between border-b border-primary/10 pb-4">
              <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
                <Calendar className="w-6 h-6 text-primary" /> Recent Activity
              </h2>
              <Badge variant="outline" className="font-semibold border-primary/20 text-muted-foreground shadow-sm">
                {posts?.length || 0} Posts
              </Badge>
            </div>

            {posts && posts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {posts.map((post: any) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-card/20 rounded-3xl border border-dashed border-primary/20 shadow-sm">
                <div className="h-16 w-16 rounded-full bg-primary/5 flex items-center justify-center mb-4 text-primary opacity-50">
                  <Layers className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No public posts yet</h3>
                <p className="text-base font-medium text-muted-foreground max-w-sm">
                  This user has not shared any donation requests or posts on the platform yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
