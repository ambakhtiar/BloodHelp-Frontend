"use client";

import React, { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getAllPosts, IPostFilters } from "@/services/post.service";
import { PostCard } from "./components/PostCard";
import { PostCardSkeleton } from "./components/PostCardSkeleton";
import { FeedFilters } from "./components/FeedFilters";
import { AlertCircle, RefreshCw, Droplets, Heart, HandHelping } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuthContext } from "@/providers/AuthProvider";

export default function FeedContainer() {
  const { user, isAuthenticated } = useAuthContext();
  const [filters, setFilters] = useState<IPostFilters>({
    searchTerm: "",
    type: "",
    bloodGroup: "",
  });

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ["posts", filters],
    queryFn: ({ pageParam = 1 }) => getAllPosts({ ...filters, page: pageParam, limit: 10 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // Usually backend returns meta: { total, page, limit }
      // We will assume lastPage.data.length === limit means there are more posts.
      if (lastPage?.data?.length === 10) {
        return allPages.length + 1;
      }
      return undefined;
    },
  });

  const posts = data?.pages.flatMap((page) => page.data || []) || [];

  // Implement Intersection Observer natively
  const observerRef = React.useRef<IntersectionObserver | null>(null);
  const loadMoreRef = React.useCallback((node: HTMLDivElement) => {
    if (isFetchingNextPage) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });

    if (node) observerRef.current.observe(node);
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  // Get user initial for avatar
  const userName =
    user?.donorProfile?.name ||
    user?.bloodDonor?.name ||
    user?.hospital?.name ||
    user?.organisation?.name ||
    user?.admin?.name ||
    user?.email?.split("@")[0] ||
    "User";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto py-8 px-4 sm:px-6">
      {/* Left Sidebar: Filters */}
      <aside className="hidden lg:block lg:col-span-1">
        <FeedFilters filters={filters} onChange={setFilters} />
      </aside>

      {/* Center Column: Feed */}
      <main className="lg:col-span-2 space-y-6">
        {/* Mobile Filters Toggle */}
        <div className="lg:hidden mb-6">
          <Button 
            variant="outline" 
            className="w-full justify-between items-center font-bold px-4 h-12 shadow-sm border-primary/20 bg-card rounded-xl"
            onClick={() => setMobileFiltersOpen((prev) => !prev)}
          >
            <span className="flex items-center gap-2 text-foreground">
               <span className="text-xl">🎛</span> 
               Filter & Sort
            </span>
            <span className={`text-xl transition-transform ${mobileFiltersOpen ? 'rotate-180' : ''}`}>▼</span>
          </Button>
          
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${mobileFiltersOpen ? "max-h-[1000px] opacity-100 mt-4" : "max-h-0 opacity-0 m-0"}`}>
            <FeedFilters filters={filters} onChange={setFilters} />
          </div>
        </div>

        {/* ═══════ Create Post Prompt ═══════ */}
        {isAuthenticated && user && (
          <div className="bg-card rounded-xl border border-primary/10 shadow-sm overflow-hidden">
            <div className="p-4 flex gap-3 items-center">
              <Link 
                href="/profile" 
                className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-black text-xs border-2 border-primary/20 shrink-0 overflow-hidden hover:scale-105 active:scale-95 transition-all shadow-sm"
              >
                {user?.profilePictureUrl ? (
                  <img 
                    src={user.profilePictureUrl} 
                    alt={userName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="drop-shadow-sm">{userInitial}</span>
                )}
              </Link>
              <Link href="/posts/create" className="bg-secondary/40 hover:bg-secondary/60 text-muted-foreground w-full py-2.5 px-4 rounded-full transition-colors text-sm">
                What kind of help or donation do you need?
              </Link>
            </div>
            <div className="border-t border-primary/5 px-2 py-1.5 flex">
              <Link href="/posts/create" className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/5 transition-colors">
                <Droplets className="w-3.5 h-3.5" />
                Blood Request
              </Link>
              <div className="w-px bg-primary/10 my-1" />
              <Link href="/posts/create" className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors">
                <Heart className="w-3.5 h-3.5" />
                Donate Blood
              </Link>
              <div className="w-px bg-primary/10 my-1" />
              <Link href="/posts/create" className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
                <HandHelping className="w-3.5 h-3.5" />
                Get Help
              </Link>
            </div>
          </div>
        )}

        {/* Initial Loading */}
        {isLoading && (
          <div>
            <PostCardSkeleton />
            <PostCardSkeleton />
          </div>
        )}

        {isError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-8 text-center flex flex-col items-center justify-center">
            <AlertCircle className="w-12 h-12 text-destructive mb-3" />
            <h3 className="font-semibold text-lg">Failed to load feed</h3>
            <p className="text-muted-foreground mt-1 mb-4">Please try again.</p>
            <Button onClick={() => refetch()} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" /> Retry
            </Button>
          </div>
        )}

        {!isLoading && !isError && posts.length === 0 && (
          <div className="bg-card rounded-xl border border-primary/10 p-12 text-center flex flex-col items-center shadow-sm">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">📭</span>
            </div>
            <h3 className="font-semibold text-xl text-foreground">No posts available</h3>
            <p className="text-muted-foreground mt-2">Check back later or expand your search filters.</p>
          </div>
        )}

        {!isLoading && !isError && posts.length > 0 && (
          <div className="space-y-4">
            {posts.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
            
            {/* Infinite Scroll Trigger */}
            <div ref={loadMoreRef} className="h-10 flex items-center justify-center py-4">
              {isFetchingNextPage ? (
                <div className="flex gap-2 items-center text-muted-foreground">
                  <span className="animate-spin text-xl">🔄</span> Loading more...
                </div>
              ) : hasNextPage ? (
                <span className="text-sm text-muted-foreground">Scroll for more</span>
              ) : (
                 <div className="text-sm font-medium text-muted-foreground bg-secondary/50 px-4 py-2 rounded-full border border-primary/5">
                    End of posts
                 </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Right Sidebar: Extras */}
      <aside className="hidden lg:block lg:col-span-1">
         <div className="bg-card rounded-xl border border-primary/10 p-5 shadow-sm sticky top-20">
            <h3 className="font-semibold text-lg mb-4">Sponsored</h3>
            <div className="aspect-square bg-secondary/30 flex items-center justify-center rounded-md text-sm text-muted-foreground">
              Ad Placeholder
            </div>
         </div>
      </aside>
    </div>
  );
}
