"use client";

import { useState } from "react";
import { IUser } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Phone, Share2, Info, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DonorCardProps {
  donor: any; // Using any or specific BloodDonor interface if available
}

export function DonorCard({ donor }: DonorCardProps) {
  const [showNumber, setShowNumber] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const formatBloodGroup = (bg: string) => {
    return bg.replace("_POSITIVE", "+").replace("_NEGATIVE", "-");
  };

  const bloodGroupLabel = donor.bloodGroup ? formatBloodGroup(donor.bloodGroup) : "??";

  const lastDonationDate = donor.lastDonationDate 
    ? formatDistanceToNow(new Date(donor.lastDonationDate), { addSuffix: true })
    : "Never donated yet";

  const isAvailable = donor.isAvailable;

  const handleRevealClick = () => {
    if (showNumber) {
      setShowNumber(false);
    } else {
      setIsAlertOpen(true);
    }
  };

  return (
    <>
      <Card className="group relative overflow-hidden border-primary/5 hover:border-primary/20 transition-all duration-300 hover:shadow-xl bg-card/40 backdrop-blur-sm">
        {/* GLOWING BACKGROUND EFFECT */}
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
        
        <CardContent className="p-5">
          <div className="flex justify-between items-start gap-4">
            <div className="flex gap-4">
              {/* AVATAR / INITIALS */}
              <div className="relative h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xl font-black text-primary overflow-hidden shrink-0">
                {donor.user?.profilePictureUrl ? (
                  <img 
                    src={donor.user.profilePictureUrl} 
                    alt={donor.name} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  donor.name?.charAt(0) || "U"
                )}
                {/* STATUS INDICATOR */}
                <div className={cn(
                  "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background",
                  isAvailable ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-muted-foreground"
                )} />
              </div>

              <div className="space-y-1 min-w-0">
                <h3 className="font-bold text-lg leading-tight truncate text-foreground group-hover:text-primary transition-colors">
                  {donor.name || "Anonymous Donor"}
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
            {showNumber ? (
              <Button 
                variant="outline"
                className="flex-1 gap-2 font-bold transition-all duration-300 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                asChild
              >
                <a href={`tel:${donor.contactNumber}`}>
                  <Phone className="h-4 w-4" />
                  <span className="animate-in fade-in zoom-in duration-300">
                    {donor.contactNumber}
                  </span>
                </a>
              </Button>
            ) : (
              <Button 
                onClick={handleRevealClick}
                className="flex-1 gap-2 font-bold transition-all duration-300 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                <Phone className="h-4 w-4" />
                Reveal Phone
              </Button>
            )}
            <Button variant="outline" size="icon" className="shrink-0 hover:bg-primary/5 hover:text-primary transition-colors">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="sm:max-w-md border-destructive/20 shadow-xl shadow-destructive/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2 text-xl font-bold">
              <AlertTriangle className="h-6 w-6" /> 
              সতর্কতা / Warning
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 pt-2 text-sm leading-relaxed">
                <p className="text-foreground font-semibold text-base border-l-4 border-destructive pl-4 py-1">
                  রক্তের প্রয়োজন ছাড়া কাউকে কল দিবেন না অথবা কাউকে বিরক্ত করার অভিযোগ আসলে আইনানুগ ব্যবস্থা নেওয়া হবে।
                </p>
                <p className="text-muted-foreground opacity-90 border-l-4 border-muted pl-4 py-1">
                  Please do not call anyone without a genuine need for blood. Legal action will be taken if there are any complaints of harassment.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2 sm:gap-0">
            <AlertDialogCancel className="font-semibold">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setShowNumber(true);
                setIsAlertOpen(false);
              }}
              className="bg-destructive hover:bg-destructive/90 font-bold tracking-wide"
            >
              আমি বুঝতে পেরেছি / I Understand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
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
