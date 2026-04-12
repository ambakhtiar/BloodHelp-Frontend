"use client";

import { useState } from "react";
import { IUser } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Phone, Share2, Info, CheckCircle2, Clock } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";

interface DonorCardProps {
  donor: IUser;
}

export function DonorCard({ donor }: DonorCardProps) {
  const [showNumber, setShowNumber] = useState(false);
  const profile = donor.donorProfile;

  const formatBloodGroup = (bg: string) => {
    return bg.replace("_POSITIVE", "+").replace("_NEGATIVE", "-");
  };

  const bloodGroupLabel = profile?.bloodGroup ? formatBloodGroup(profile.bloodGroup) : "??";

  const lastDonationDate = profile?.lastDonationDate 
    ? formatDistanceToNow(new Date(profile.lastDonationDate), { addSuffix: true })
    : "Never donated yet";

  const isAvailable = profile?.isAvailableForDonation;

  return (
    <Card className="group relative overflow-hidden border-primary/5 hover:border-primary/20 transition-all duration-300 hover:shadow-xl bg-card/40 backdrop-blur-sm">
      {/* GLOWING BACKGROUND EFFECT */}
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
      
      <CardContent className="p-5">
        <div className="flex justify-between items-start gap-4">
          <div className="flex gap-4">
            {/* AVATAR / INITIALS */}
            <div className="relative h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xl font-black text-primary overflow-hidden shrink-0">
              {donor.profilePictureUrl ? (
                <img 
                  src={donor.profilePictureUrl} 
                  alt={profile?.name} 
                  className="h-full w-full object-cover"
                />
              ) : (
                profile?.name?.charAt(0) || donor.email?.charAt(0)
              )}
              {/* STATUS INDICATOR */}
              <div className={cn(
                "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background",
                isAvailable ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-muted-foreground"
              )} />
            </div>

            <div className="space-y-1 min-w-0">
              <h3 className="font-bold text-lg leading-tight truncate text-foreground group-hover:text-primary transition-colors">
                {profile?.name || "Anonymous Donor"}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <MapPin className="h-3 w-3 text-primary/70" />
                <span className="truncate">
                  {[donor.upazila, donor.district].filter(Boolean).join(", ")}
                </span>
              </div>
            </div>
          </div>

          {/* GLOWING BLOOD GROUP BADGE */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {/* Pulse Animation Overlay */}
              <div className="absolute inset-0 rounded-lg bg-primary animate-ping opacity-20 scale-110" />
              <Badge className="relative h-10 w-10 flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-lg shadow-[0_0_15px_rgba(239,68,68,0.4)] border-none">
                {bloodGroupLabel}
              </Badge>
            </div>
            {isAvailable ? (
              <span className="text-[10px] font-bold text-emerald-600 mt-1 uppercase tracking-tighter">Ready</span>
            ) : (
              <span className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-tighter">Resting</span>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="bg-secondary/20 rounded-lg p-2.5 border border-primary/5 group/info hover:border-primary/20 transition-all">
            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5 flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" /> Last Donation
            </p>
            <p className="text-xs font-semibold text-foreground truncate">
              {lastDonationDate}
            </p>
          </div>
          <div className="bg-secondary/20 rounded-lg p-2.5 border border-primary/5 group/info hover:border-primary/20 transition-all">
            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5 flex items-center gap-1">
              <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" /> Availability
            </p>
            <p className="text-xs font-semibold text-foreground">
              {isAvailable ? "Can Donate" : "Must Wait"}
            </p>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <Button 
            onClick={() => setShowNumber(!showNumber)}
            variant={showNumber ? "outline" : "default"}
            className={cn(
              "flex-1 gap-2 font-bold transition-all duration-300",
              !showNumber && "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            )}
          >
            <Phone className="h-4 w-4" />
            {showNumber ? (
              <span className="animate-in fade-in zoom-in duration-300">
                {donor.contactNumber}
              </span>
            ) : (
              "Reveal Phone"
            )}
          </Button>
          <Button variant="outline" size="icon" className="shrink-0 hover:bg-primary/5 hover:text-primary transition-colors">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function DonorCardSkeleton() {
  return (
    <Card className="animate-pulse border-primary/5 bg-card/40">
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <div className="h-14 w-14 rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-3 w-24 bg-muted rounded" />
            </div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-muted" />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="h-12 bg-muted rounded-lg" />
          <div className="h-12 bg-muted rounded-lg" />
        </div>
        <div className="mt-5 flex gap-2">
          <div className="h-10 flex-1 bg-muted rounded-md" />
          <div className="h-10 w-10 bg-muted rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}
