"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  User, 
  Droplets, 
  MapPin, 
  Phone, 
  Mail, 
  Weight, 
  Calendar, 
  Briefcase, 
  Building2, 
  ShieldCheck, 
  BadgeCheck,
  Edit2,
  History,
  FileText,
  Users
} from "lucide-react";
import { getMyProfile, getDonationHistory } from "@/services/user.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Star, Award, Medal, Crown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EditProfileModal } from "./EditProfileModal";
import { getUserPosts } from "@/services/post.service";
import { PostCard } from "@/features/feed/components/PostCard";


export function ProfileDetails() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["my-profile"],
    queryFn: getMyProfile,
  });

  const profileData = data?.data;

  const { data: postsData, isLoading: isPostsLoading } = useQuery({
    queryKey: ["user-posts", profileData?.id],
    queryFn: () => getUserPosts(profileData!.id),
    enabled: !!profileData?.id,
  });

  const { data: donationData, isLoading: isDonationLoading } = useQuery({
    queryKey: ["donation-history"],
    queryFn: getDonationHistory,
    enabled: !!profileData?.id && profileData.role === "USER",
  });

  const donationCount = donationData?.data?.length || 0;

  const getDonorRank = (count: number) => {
    if (count >= 20) return { label: "Hero Donor", color: "bg-red-600", icon: <Crown className="w-3.5 h-3.5" /> };
    if (count >= 10) return { label: "Gold Donor", color: "bg-amber-500", icon: <Medal className="w-3.5 h-3.5" /> };
    if (count >= 5) return { label: "Silver Donor", color: "bg-slate-400", icon: <Award className="w-3.5 h-3.5" /> };
    if (count >= 3) return { label: "Bronze Donor", color: "bg-orange-400", icon: <Star className="w-3.5 h-3.5" /> };
    if (count >= 1) return { label: "Rising Donor", color: "bg-blue-500", icon: <Trophy className="w-3.5 h-3.5" /> };
    return { label: "Newbie Donor", color: "bg-gray-400", icon: <User className="w-3.5 h-3.5" /> };
  };

  const rank = getDonorRank(donationCount);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-destructive/10 p-4 rounded-full mb-4">
          <User className="w-12 h-12 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold">Failed to load profile</h2>
        <p className="text-muted-foreground mt-2">Please try refreshing the page or sign in again.</p>
        <Button className="mt-6" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const user = data.data;

  // Render different UI based on role
  const renderRoleProfile = () => {
    switch (user.role) {
      case "USER":
        return (
          <div className="grid gap-6">
            <Card className="border-primary/10 shadow-sm overflow-hidden bg-gradient-to-br from-card to-secondary/10">
              <CardContent className="p-0">
                <div className="bg-primary/5 p-6 flex items-start gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary border-4 border-background shadow-sm overflow-hidden">
                    {user.profilePictureUrl ? (
                      <img 
                        src={user.profilePictureUrl} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-bold">{user.donorProfile?.name}</h2>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-0">Donor</Badge>
                      <Badge className={`${rank.color} text-white border-0 flex items-center gap-1.5 px-3 py-1 shadow-sm`}>
                         {rank.icon}
                         {rank.label}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground flex items-center gap-1 mt-1">
                      <Mail className="w-3.5 h-3.5" /> {user.email}
                    </p>
                    <p className="text-muted-foreground flex items-center gap-1 mt-1">
                      <Phone className="w-3.5 h-3.5" /> {user.contactNumber}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)} className="gap-2 shrink-0">
                    <Edit2 className="w-4 h-4" /> Edit Profile
                  </Button>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Blood Group</p>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                        <Droplets className="w-6 h-6" />
                      </div>
                      <span className="text-xl font-bold">{user.donorProfile?.bloodGroup.replace("_", " ")}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Availability</p>
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full animate-pulse ${user.donorProfile?.isAvailableForDonation ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className={`font-bold ${user.donorProfile?.isAvailableForDonation ? 'text-green-500' : 'text-red-500'}`}>
                        {user.donorProfile?.isAvailableForDonation ? 'Available for Donation' : 'Not Available'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Weight</p>
                    <div className="flex items-center gap-2 text-foreground font-bold italic">
                      <Weight className="w-5 h-5 text-muted-foreground" />
                      {user.donorProfile?.weight ? `${user.donorProfile.weight} KG` : 'Not specified'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" /> Location Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-muted-foreground">Division</span>
                    <span className="font-medium">{user.division || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-muted-foreground">District</span>
                    <span className="font-medium">{user.district || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Upazila</span>
                    <span className="font-medium">{user.upazila || "N/A"}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" /> Quick Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start gap-4 h-12" variant="outline" asChild>
                    <Link href="/user/donation-history">
                      <BadgeCheck className="w-5 h-5 text-green-500" /> Donation History
                    </Link>
                  </Button>
                  <Button className="w-full justify-start gap-4 h-12" variant="outline" asChild>
                    <Link href="/feed">
                       <Droplets className="w-5 h-5 text-red-500" /> Find Blood
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "HOSPITAL":
        return (
          <div className="grid gap-6">
            <Card className="border-primary/10 shadow-sm overflow-hidden">
               <div className="bg-primary/5 p-6 flex items-start gap-4">
                  <div className="h-16 w-16 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500 border-4 border-background shadow-sm overflow-hidden">
                    {user.profilePictureUrl ? (
                      <img 
                        src={user.profilePictureUrl} 
                        alt="Hospital" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-8 h-8" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold">{user.hospital?.name}</h2>
                      <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-0">Hospital</Badge>
                    </div>
                    <p className="text-muted-foreground flex items-center gap-1 mt-1 italic">
                      <Mail className="w-3.5 h-3.5" /> {user.email}
                    </p>
                    <p className="text-muted-foreground flex items-center gap-1 mt-1 italic">
                      <Phone className="w-3.5 h-3.5" /> {user.contactNumber}
                    </p>
                  </div>
                  <Button onClick={() => setIsEditModalOpen(true)} variant="outline" size="sm" className="gap-2">
                    <Edit2 className="w-4 h-4" /> Edit Profile
                  </Button>
                </div>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Contact</p>
                        <p className="font-semibold">{user.contactNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Registration</p>
                        <p className="font-semibold">{user.hospital?.registrationNumber || "Not recorded"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 border-l pl-8">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Address</p>
                        <p className="font-semibold max-w-xs">{user.hospital?.address || "N/A"}</p>
                        <p className="text-sm text-muted-foreground">{user.upazila}, {user.district}, {user.division}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Management</CardTitle>
                <CardDescription>Quick access to hospital donation management</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full md:w-auto gap-2" variant="default" asChild>
                  <Link href="/hospital/donation-records">
                    <BadgeCheck className="w-4 h-4" /> Go to Donation Records
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case "ORGANISATION":
        return (
          <div className="grid gap-6">
            <Card className="border-primary/10 shadow-sm overflow-hidden">
               <div className="bg-primary/5 p-6 flex items-start gap-4">
                  <div className="h-16 w-16 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500 border-4 border-background shadow-sm overflow-hidden">
                    {user.profilePictureUrl ? (
                      <img 
                        src={user.profilePictureUrl} 
                        alt="Organisation" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-8 h-8" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold">{user.organisation?.name}</h2>
                      <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 border-0">Organisation</Badge>
                    </div>
                    <p className="text-muted-foreground flex items-center gap-1 mt-1 uppercase text-xs tracking-widest">
                      <Mail className="w-3.5 h-3.5" /> {user.email}
                    </p>
                    <p className="text-muted-foreground flex items-center gap-1 mt-1 uppercase text-xs tracking-widest">
                      <Phone className="w-3.5 h-3.5" /> {user.contactNumber}
                    </p>
                  </div>
                  <Button onClick={() => setIsEditModalOpen(true)} variant="outline" size="sm" className="gap-2">
                    <Edit2 className="w-4 h-4" /> Edit Profile
                  </Button>
                </div>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Contact</p>
                        <p className="font-semibold">{user.contactNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Registration No</p>
                        <p className="font-semibold">{user.organisation?.registrationNumber || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 border-l pl-8">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Established</p>
                        <p className="font-semibold">{user.organisation?.establishedYear || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Base Area</p>
                        <p className="font-semibold">{user.upazila}, {user.district}, {user.division}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
            </Card>

            <Card className="bg-orange-50/50 border-orange-200">
               <CardHeader>
                <CardTitle className="text-lg text-orange-950">Volunteer Network</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white gap-2" asChild>
                  <Link href="/organisation/volunteers">
                    <Users className="w-4 h-4" /> Manage Members & Volunteers
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case "ADMIN":
      case "SUPER_ADMIN":
        return (
          <Card className="border-primary/10 shadow-sm overflow-hidden">
             <div className="bg-primary/5 p-6 flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center text-white border-4 border-background shadow-sm overflow-hidden">
                   {user.profilePictureUrl ? (
                      <img 
                        src={user.profilePictureUrl} 
                        alt="Admin" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShieldCheck className="w-8 h-8" />
                    )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">
                      {user.admin?.name}
                    </h2>
                    <Badge className="bg-slate-800 text-white border-0">
                      {user.role === "SUPER_ADMIN" ? "Super Admin" : "System Admin"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground flex items-center gap-1 mt-1 italic">
                    <Mail className="w-3.5 h-3.5" /> {user.email}
                  </p>
                  <p className="text-muted-foreground flex items-center gap-1 mt-1 italic">
                    <Phone className="w-3.5 h-3.5" /> {user.contactNumber}
                  </p>
                </div>
                <Button onClick={() => setIsEditModalOpen(true)} variant="outline" size="sm" className="gap-2">
                  <Edit2 className="w-4 h-4" /> Edit Profile
                </Button>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="p-4 rounded-xl bg-secondary/20 border border-secondary">
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Account Contact</p>
                      <p className="text-lg font-semibold">{user.contactNumber}</p>
                   </div>
                   <div className="p-4 rounded-xl bg-secondary/20 border border-secondary">
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Administrative Area</p>
                      <p className="text-lg font-semibold">{user.district}, {user.division}</p>
                   </div>
                </div>
                
                <div className="mt-8 flex gap-4">
                   <Button variant="outline" asChild className="gap-2">
                      <Link href="/admin">
                         <Briefcase className="w-4 h-4" /> Access Dashboard
                      </Link>
                   </Button>
                </div>
              </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground lowercase font-medium tracking-tighter">Manage your personal information and account settings</p>
      </div>

      {renderRoleProfile()}

      {/* User Posts Section */}
      <div className="pt-8 border-t border-primary/5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <FileText className="w-5 h-5" />
             </div>
             <h2 className="text-2xl font-bold">My Activity</h2>
          </div>
          <Badge variant="outline" className="font-semibold px-3 py-1">
            {postsData?.data?.length || 0} Posts
          </Badge>
        </div>

        {isPostsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-[300px] w-full rounded-2xl" />
            <Skeleton className="h-[300px] w-full rounded-2xl" />
          </div>
        ) : postsData?.data?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {postsData.data.map((post: any) => (
              <div key={post.id} className="h-full">
                <PostCard post={post} />
              </div>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 bg-muted/50">
            <CardContent className="py-12 flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-bold text-muted-foreground">No posts yet</h3>
              <p className="text-muted-foreground max-w-xs mt-2">
                You haven't shared any donation requests or updates yet. Your activity will appear here.
              </p>
              <Button className="mt-6 gap-2" asChild>
                <Link href="/feed">
                  <Droplets className="w-4 h-4" /> Create Your First Post
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Profile Edit Modal */}
      {isEditModalOpen && user && (
        <EditProfileModal 
          user={user} 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
        />
      )}
    </div>
  );
}
