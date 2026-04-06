"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Droplets, Clock, AlertTriangle, Heart, MessageCircle, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
  post: any;
}

export function PostCard({ post }: PostCardProps) {
  // Extract correct author name based on role
  const authorName =
    post.author?.donorProfile?.name ||
    post.author?.bloodDonor?.name ||
    post.author?.hospital?.name ||
    post.author?.organisation?.name ||
    "BloodLink User";

  // Utility to determine badge styling based on type
  const getBadgeStyle = (type: string) => {
    switch (type) {
      case "BLOOD_FINDING":
        return "bg-destructive text-primary-foreground hover:bg-destructive/90";
      case "BLOOD_DONATION":
        return "bg-emerald-500 text-primary-foreground hover:bg-emerald-600";
      case "HELPING":
        return "bg-blue-500 text-primary-foreground hover:bg-blue-600";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const formatText = (text: string) => {
    return text?.replace(/_/g, " ");
  };

  const timeAgo = post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : "Just now";

  return (
    <Card className="w-full mb-4 shadow-sm border-primary/10 overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-4 pb-4">
        {/* Simple Avatar Fallback using initial */}
        <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full bg-primary/20 text-primary font-bold uppercase border-2 border-background shadow-inner">
          {authorName.charAt(0)}
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex justify-between items-start w-full gap-2">
            <div className="flex flex-col min-w-0">
              <h3 className="font-semibold text-base leading-tight truncate">
                {authorName}
              </h3>
              <div className="flex flex-wrap gap-1.5 mt-1">
                <Badge className={`${getBadgeStyle(post.type)} text-[10px] h-4 px-1.5`}>
                  {formatText(post.type)}
                </Badge>
                {post.isVerified && (
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 text-[10px] h-4 px-1.5 font-medium">
                    Verified
                  </Badge>
                )}
                {post.isResolved && (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 text-[10px] h-4 px-1.5 font-medium">
                    Resolved
                  </Badge>
                )}
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">{timeAgo}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {post.title && <h4 className="font-bold text-lg leading-snug">{post.title}</h4>}

        {post.content && (
          <p className="whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed italic border-l-4 border-primary/20 pl-3">
            {post.content}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {/* Universal Data */}
          {(post.location || (post.district && post.division)) && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground bg-secondary/30 p-2.5 rounded-lg border border-primary/5">
              <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span className="line-clamp-2">
                {post.location}{post.location && (post.district || post.division) ? ", " : ""}
                {[post.district, post.division].filter(Boolean).join(", ")}
              </span>
            </div>
          )}

          {post.contactNumber && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/30 p-2.5 rounded-lg border border-primary/5">
              <Droplets className="w-4 h-4 text-primary shrink-0" />
              <span className="font-medium">Call: {post.contactNumber}</span>
            </div>
          )}

          {/* Blood Specific Data */}
          {post.bloodGroup && (
            <div className="flex items-center justify-between gap-2 text-sm font-semibold bg-destructive/10 text-destructive p-2.5 rounded-lg border border-destructive/10 sm:col-span-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Required Blood Group:</span>
              </div>
              <span className="text-xl font-black tracking-tight">{post.bloodGroup.replace(/_/g, " ")}</span>
            </div>
          )}

          {post.donationTime && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/30 p-2.5 rounded-lg border border-primary/5">
              <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{new Date(post.donationTime).toLocaleDateString()} at {new Date(post.donationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}

          {/* Helping / Medical Financial Data */}
          {post.targetAmount && (
            <div className="flex items-center justify-between gap-2 text-sm font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 p-2.5 rounded-lg border border-blue-200/50 sm:col-span-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>Financial Target:</span>
              </div>
              <span className="text-lg">৳{post.targetAmount.toLocaleString()}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between border-t border-primary/5 p-1 bg-secondary/10">
        <Button variant="ghost" size="sm" className="flex-1 rounded-none hover:bg-primary/5 hover:text-primary transition-all group py-5">
          <Heart className="w-4 h-4 mr-2 group-hover:fill-primary transition-colors" />
          <div className="flex items-baseline gap-1">
            <span className="font-bold">{post._count?.likes || 0}</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">Likes</span>
          </div>
        </Button>
        <div className="w-[1px] bg-primary/10 h-6 self-center" />
        <Button variant="ghost" size="sm" className="flex-1 rounded-none hover:bg-primary/5 hover:text-primary transition-all group py-5">
          <MessageCircle className="w-4 h-4 mr-2 group-hover:fill-primary transition-colors" />
          <div className="flex items-baseline gap-1">
            <span className="font-bold">{post._count?.comments || 0}</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">Comments</span>
          </div>
        </Button>
      </CardFooter>
    </Card>
  );
}
