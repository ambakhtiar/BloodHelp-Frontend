"use client";

import { useQuery } from "@tanstack/react-query";
import { getSinglePost } from "@/services/post.service";
import { PostCard } from "./components/PostCard";
import { CommentSection } from "./components/CommentSection";
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  MessageSquare,
  CalendarDays,
  MapPin,
  UserCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const POST_TYPE_COLOR: Record<string, string> = {
  BLOOD_FINDING:
    "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  BLOOD_DONATION:
    "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  HELPING:
    "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
};

export default function PostDetailsContainer({ postId }: { postId: string }) {
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => getSinglePost(postId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Loading post...
          </p>
        </div>
      </div>
    );
  }

  const post = data?.data || (data?.id ? data : null);

  if (isError || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className="bg-destructive/10 rounded-full p-6 mb-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Post Not Found</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          This post may have been deleted or is no longer available.
        </p>
        <Button onClick={() => router.push("/feed")} variant="outline" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Feed
        </Button>
      </div>
    );
  }

  const authorName =
    post.author?.donorProfile?.name ||
    post.author?.bloodDonor?.name ||
    post.author?.hospital?.name ||
    post.author?.organisation?.name ||
    `${process.env.NEXT_PUBLIC_APP_NAME_FF}${process.env.NEXT_PUBLIC_APP_NAME_SS} User`;

  const timeAgo = post.createdAt
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
    : "Recently";

  const locationParts = [
    post.location,
    post.upazila,
    post.district,
    post.division,
  ].filter(Boolean);

  const typeColor = POST_TYPE_COLOR[post.type] ?? "bg-muted text-muted-foreground border-border";
  const typeLabel = post.type?.replace(/_/g, " ") ?? "";

  return (
    <div className="w-full bg-gradient-to-b from-muted/30 to-background">
      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <div className="border-b border-border/50 bg-card/60 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-5">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 -ml-2 gap-1.5 text-muted-foreground hover:text-primary group"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Feed
          </Button>

          {/* Meta Row */}
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              className={cn(
                "text-xs font-semibold border px-3 py-1 rounded-full",
                typeColor
              )}
            >
              {typeLabel}
            </Badge>

            {post.isVerified && (
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 text-xs border rounded-full px-3 py-1">
                ✓ Verified
              </Badge>
            )}
            {post.isResolved && (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 text-xs border rounded-full px-3 py-1">
                ✓ Resolved
              </Badge>
            )}

            <Separator orientation="vertical" className="h-4" />

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <UserCircle2 className="w-3.5 h-3.5" />
              <span>{authorName}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>{timeAgo}</span>
            </div>

            {locationParts.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 text-primary/70" />
                <span>{locationParts.join(", ")}</span>
              </div>
            )}

            <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{post._count?.comments ?? 0} comments</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] xl:grid-cols-[1fr_520px] gap-6 items-start">

          {/* Left — Post Card (full detail) */}
          <div className="space-y-4 min-w-0">
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden transition-shadow hover:shadow-md">
              <PostCard post={post} />
            </div>

            {/* Mobile: comments below card */}
            <div className="lg:hidden rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border/50 bg-muted/30 flex items-center justify-between">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Discussion
                  <span className="bg-primary/10 text-primary text-[11px] px-2 py-0.5 rounded-full font-bold">
                    {post._count?.comments ?? 0}
                  </span>
                </h3>
              </div>
              <CommentSection postId={post.id} />
            </div>
          </div>

          {/* Right — Sticky Comments Panel (desktop only) */}
          <div className="hidden lg:block sticky top-20">
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden flex flex-col h-[calc(100vh-120px)] min-h-[600px]">
              {/* Header */}
              <div className="px-5 py-4 border-b border-border/50 bg-muted/30 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-base flex items-center gap-2 text-foreground">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Discussion
                  <span className="bg-primary/10 text-primary text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                    {post._count?.comments ?? 0}
                  </span>
                </h3>
                <span className="text-[11px] text-muted-foreground">
                  Sort: Newest
                </span>
              </div>

              {/* Scrollable comments */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <CommentSection postId={post.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}