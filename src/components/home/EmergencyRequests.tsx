"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, MapPin, Droplets, Clock, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import PostSkeleton from "../shared/PostSkeleton";
import axiosInstance from "../../lib/axiosInstance";
import type { IPost, ApiResponse } from "../../types";

const bloodGroupDisplay: Record<string, string> = {
  A_POSITIVE: "A+",
  A_NEGATIVE: "A−",
  B_POSITIVE: "B+",
  B_NEGATIVE: "B−",
  AB_POSITIVE: "AB+",
  AB_NEGATIVE: "AB−",
  O_POSITIVE: "O+",
  O_NEGATIVE: "O−",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function EmergencyRequests() {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get<ApiResponse<IPost[]>>("/posts", {
          params: { type: "BLOOD_FINDING", limit: 3, sortBy: "createdAt", sortOrder: "desc" },
        });
        setPosts(response.data.data);
      } catch {
        setError("Failed to load urgent requests. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <section className="py-16 sm:py-20" aria-label="Emergency blood requests">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-destructive" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-destructive">
                Urgent
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Emergency Blood Requests
            </h2>
            <p className="text-muted-foreground max-w-md">
              These people need blood urgently. Your donation can save their lives.
            </p>
          </div>
          <Button variant="outline" asChild className="gap-2 self-start sm:self-auto">
            <Link href="/feed?type=BLOOD_FINDING">
              View All Requests
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <PostSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
              <p className="text-lg font-medium mb-2">Something went wrong</p>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="gap-2"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && posts.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Droplets className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No urgent requests right now</p>
              <p className="text-sm text-muted-foreground">
                Check back later or browse all posts in the feed.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Posts Grid */}
        {!loading && !error && posts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="group relative overflow-hidden border-border/60 hover:border-primary/40 transition-all duration-300"
              >
                {/* Urgency Stripe */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-destructive via-primary to-destructive" />

                <CardContent className="p-5 space-y-4">
                  {/* Blood Group Badge + Time */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                      <Droplets className="h-3.5 w-3.5" />
                      {post.bloodGroup ? bloodGroupDisplay[post.bloodGroup] || post.bloodGroup : "Any"}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {timeAgo(post.createdAt)}
                    </span>
                  </div>

                  {/* Content */}
                  <p className="text-sm leading-relaxed text-foreground line-clamp-3">
                    {post.content || post.reason || "Urgent blood needed. Please help!"}
                  </p>

                  {/* Location */}
                  {(post.district || post.upazila) && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      <span>
                        {[post.upazila, post.district, post.division].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}

                  {/* Meta Tags */}
                  <div className="flex flex-wrap gap-2">
                    {post.bloodBags && (
                      <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
                        {post.bloodBags} bag{post.bloodBags > 1 ? "s" : ""} needed
                      </span>
                    )}
                    {post.donationTimeType && (
                      <span className="rounded-md bg-destructive/10 text-destructive px-2 py-1 text-xs font-medium">
                        {post.donationTimeType === "EMERGENCY" ? "🚨 Emergency" : post.donationTimeType}
                      </span>
                    )}
                  </div>

                  {/* CTA */}
                  <Button size="sm" className="w-full gap-2" asChild>
                    <Link href={`/post/${post.id}`}>
                      Respond to Request
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
