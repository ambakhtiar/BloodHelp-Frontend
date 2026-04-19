"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Droplets,
  Clock,
  AlertTriangle,
  MessageCircle,
  Activity,
  Heart,
  Phone,
  Wallet,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  Siren,
  Calendar,
  Timer,
  X,
  MoreVertical,
  Pencil,
  Trash2,
  CheckCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { deletePost, resolvePost } from "@/services/post.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EditPostModal } from "./EditPostModal";
import { DonateFundsModal } from "@/features/payments/components/DonateFundsModal";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { LikeAction } from "./LikeAction";
import { useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthContext } from "@/providers/AuthProvider";
import { toast } from "sonner";

interface PostCardProps {
  post: any;
}

// ── Blood Group Display Helper ───────────────────────────────────────────────
const formatBloodGroup = (bg: string): string => {
  const map: Record<string, string> = {
    A_POSITIVE: "A+",
    A_NEGATIVE: "A-",
    B_POSITIVE: "B+",
    B_NEGATIVE: "B-",
    AB_POSITIVE: "AB+",
    AB_NEGATIVE: "AB-",
    O_POSITIVE: "O+",
    O_NEGATIVE: "O-",
  };
  return map[bg] || bg?.replace(/_/g, " ");
};

// ── Donation Time Type Badge ─────────────────────────────────────────────────
function DonationTimeBadge({ type }: { type: string }) {
  const config: Record<string, { icon: React.ReactNode; label: string; className: string }> = {
    EMERGENCY: {
      icon: <Siren className="w-3 h-3" />,
      label: "Emergency",
      className: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
    },
    FIXED: {
      icon: <Calendar className="w-3 h-3" />,
      label: "Fixed Time",
      className: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    },
    FLEXIBLE: {
      icon: <Timer className="w-3 h-3" />,
      label: "Flexible",
      className: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800",
    },
  };

  const c = config[type];
  if (!c) return null;

  return (
    <Badge className={`${c.className} text-[10px] h-4 px-1.5 font-medium gap-0.5`}>
      {c.icon}
      {c.label}
    </Badge>
  );
}

// ── Image Gallery Component ──────────────────────────────────────────────────
function PostImageGallery({ images, postType }: { images: string[], postType?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div
        className="relative w-full aspect-[16/9] bg-muted/10 rounded-lg overflow-hidden group border border-border/50 cursor-zoom-in"
        onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
      >
        <img
          src={images[currentIndex]}
          alt={`${(postType || 'Post').replace(/_/g, " ")} image ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
        />

        {/* Navigation Arrows (only if multiple images) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                  className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${i === currentIndex
                    ? "bg-white w-3"
                    : "bg-white/50 hover:bg-white/80"
                    }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Image Counter Badge */}
        {images.length > 1 && (
          <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-medium z-10">
            {currentIndex + 1}/{images.length}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-sm"
          onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}
        >
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 md:top-6 md:right-8 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all cursor-pointer z-[100000]"
            onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative w-full max-w-6xl h-full max-h-[85vh] flex items-center justify-center">
            <img
              src={images[currentIndex]}
              alt={`${(postType || 'Fullscreen post').replace(/_/g, " ")} image ${currentIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Fullscreen Navigation */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goPrev(); }}
                  className="absolute left-0 md:-left-12 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-10 h-10 md:w-16 md:h-16" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goNext(); }}
                  className="absolute right-0 md:-right-12 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-10 h-10 md:w-16 md:h-16" />
                </button>

                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium tracking-widest">
                  {currentIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ── Main PostCard Component ──────────────────────────────────────────────────
export function PostCard({ post }: PostCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);

  // Mutation for deleting a post
  const deleteMutation = useMutation({
    mutationFn: (postId: string) => deletePost(postId),
    onSuccess: () => {
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["user-posts"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete post");
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(post.id);
    setIsDeleteDialogOpen(false);
  };

  // Mutation for resolving a post
  const resolveMutation = useMutation({
    mutationFn: (postId: string) => resolvePost(postId),
    onSuccess: () => {
      toast.success("Post marked as resolved");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["user-posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", post.id] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to resolve post");
    },
  });

  const handleResolve = (e: React.MouseEvent) => {
    e.stopPropagation();
    resolveMutation.mutate(post.id);
  };

  // Extract correct author name based on role
  const authorName =
    post.author?.donorProfile?.name ||
    post.author?.bloodDonor?.name ||
    post.author?.hospital?.name ||
    post.author?.organisation?.name ||
    `${process.env.NEXT_PUBLIC_APP_NAME_FF}${process.env.NEXT_PUBLIC_APP_NAME_SS} User`;

  const authorRole = post.author?.role;

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

  const roleLabel = (role: string) => {
    switch (role) {
      case "HOSPITAL": return "Hospital";
      case "ORGANISATION": return "Organisation";
      default: return null;
    }
  };

  const timeAgo = post.createdAt
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
    : "Just now";

  const handleCardClick = (e: React.MouseEvent) => {
    // If any modal belonging to this post is open, ignore clicks that bubble up
    if (isDonateOpen || isEditModalOpen) {
      return;
    }

    const target = e.target as HTMLElement;
    // Don't navigate if clicking a button, link, image, or specifically excluded areas
    if (
      target.closest("button") || 
      target.closest("a") || 
      target.closest("img") ||
      target.closest("input") ||
      target.closest(".no-navigate")
    ) {
      return;
    }

    if (!user) {
      toast.error("Please login to view details");
      router.push(`/auth/login?callbackUrl=/feed/${post.id}`);
      return;
    }

    // Prevent redirect if already on the post details page
    if (pathname === `/feed/${post.id}`) return;

    router.push(`/feed/${post.id}`);
  };

  const handleCommentClick = () => {
    if (!user) {
      toast.error("Please login to see and write comments");
      router.push(`/auth/login?callbackUrl=/feed/${post.id}`);
      return;
    }
    router.push(`/feed/${post.id}`);
  };

  return (
    <Card
      onClick={handleCardClick}
      className={`w-full mb-4 shadow-sm border border-border/50 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20 bg-card group/card cursor-pointer ${
        post.isResolved ? "opacity-75 grayscale-[0.2]" : ""
      }`}
    >
      <CardHeader className="flex flex-row items-start gap-3 pb-3">
        {/* Avatar */}
        <Link href={`/profile/${post.authorId}`} className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg mb-1 overflow-hidden border border-primary/5 hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer">
          {post.author?.profilePictureUrl ? (
            <img 
              src={post.author.profilePictureUrl} 
              alt={authorName} 
              className="w-full h-full object-cover"
            />
          ) : (
            authorName.charAt(0)
          )}
        </Link>

        <div className="flex-1 flex flex-col min-w-0 pt-0.5">
          <div className="flex items-start w-full gap-2">
            <div className="flex flex-col min-w-0">
              <Link href={`/profile/${post.authorId}`} className="font-semibold text-base leading-tight truncate text-foreground hover:text-primary hover:underline transition-colors w-fit">
                {authorName}
              </Link>

              <div className="flex flex-col gap-1 mt-1 mb-1.5 align-start">
                <div className="flex flex-wrap gap-1">
                  <Badge className={`${getBadgeStyle(post.type)} text-[10px] h-4 px-1.5`}>
                    {formatText(post.type)}
                  </Badge>
                  {post.donationTimeType && (
                    <DonationTimeBadge type={post.donationTimeType} />
                  )}
                  {roleLabel(authorRole) && (
                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border border-purple-200 text-[10px] h-4 px-1.5 font-medium dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800">
                      {roleLabel(authorRole)}
                    </Badge>
                  )}
                  {post.type === "HELPING" && !post.isVerified && (
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border border-amber-200 text-[10px] h-4 px-1.5 font-medium dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
                      Unverified
                    </Badge>
                  )}
                  {post.isVerified && (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border border-blue-200 text-[10px] h-4 px-1.5 font-medium">
                      Verified
                    </Badge>
                  )}
                  {post.isResolved && (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[10px] h-4 px-1.5 font-medium">
                      Resolved
                    </Badge>
                  )}
                </div>
                <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground w-max whitespace-nowrap mt-0.5">
                  {timeAgo}
                </span>
              </div>
            </div>
            
            <div className="flex items-start ml-auto shrink-0">
              {/* Options Menu for Author and Admin */}
              {(user?.id === post.authorId || user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") && (
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-primary/10 transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      {user?.id === post.authorId && (
                        <DropdownMenuItem 
                          className="cursor-pointer gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" /> Edit Post
                        </DropdownMenuItem>
                      )}
                      
                      {/* Resolve Option for Author or Admin */}
                      {["BLOOD_FINDING", "HELPING"].includes(post.type) && !post.isResolved && (
                        <DropdownMenuItem 
                          className="cursor-pointer gap-2 text-emerald-600 focus:text-emerald-700"
                          onClick={handleResolve}
                          disabled={resolveMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4" /> 
                          {resolveMutation.isPending ? "Resolving..." : "Mark as Resolved"}
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem 
                        className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" /> Delete Post
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your post
                  and remove it from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Location moved to header for cleanliness */}
          {(post.location || post.district || post.division) && (
            <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-primary/70 shrink-0" />
              <span className="line-clamp-1 truncate">
                {[post.location, post.upazila, post.district, post.division].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {/* Title */}
        {post.title && (
          <h4 className="font-bold text-lg text-foreground leading-snug">{post.title}</h4>
        )}

        {/* Content */}
        {post.content && (
          <p className="whitespace-pre-wrap text-[15px] text-foreground/90 leading-relaxed font-normal">
            {post.content}
          </p>
        )}

        {/* Primary Alert / Blood Group Minimal Block */}
        {post.bloodGroup && (
          <div className="flex items-center gap-3">
            <div className="bg-destructive/10 text-destructive text-lg font-black px-3 py-1.5 rounded-lg">
              {formatBloodGroup(post.bloodGroup)}
            </div>
            <div className="text-sm">
              <p className="font-semibold text-foreground">
                {post.type === "BLOOD_FINDING" ? "Required Blood Group" : "Blood Group"}
              </p>
              {post.bloodBags && <p className="text-muted-foreground text-sm">{post.bloodBags} bags needed</p>}
            </div>
          </div>
        )}

        {/* Info Bulletins - No massive background colored grids, just clean flex rows */}
        <div className="flex flex-col gap-2 pt-2">
          {post.reason && (
            <div className="flex items-start gap-2 text-[13px] text-muted-foreground">
              <Stethoscope className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span className="line-clamp-2"><span className="font-medium text-foreground">Reason:</span> {post.reason}</span>
            </div>
          )}

          {post.medicalIssues && (
            <div className="flex items-start gap-2 text-[13px] text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span><span className="font-bold">Medical Issue:</span> {post.medicalIssues}</span>
            </div>
          )}

          {post.hemoglobin && (
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <Activity className="w-4 h-4 text-emerald-500 shrink-0" />
              <span><span className="font-medium text-foreground">Hemoglobin:</span> {post.hemoglobin} g/dL</span>
            </div>
          )}

          {post.donationTime && (
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <Clock className="w-4 h-4 text-blue-500 shrink-0" />
              <span>
                <span className="font-medium text-foreground">Time:</span> {format(new Date(post.donationTime), "MMM dd, yyyy")} at {format(new Date(post.donationTime), "hh:mm a")}
              </span>
            </div>
          )}
        </div>

        {/* Crowdfunding block for HELPING posts */}
        {post.type === "HELPING" && post.isApproved && post.isVerified && post.targetAmount && post.targetAmount > 0 && (
          <div className="mt-2 space-y-3">
          <div 
            className="space-y-4 pt-1 no-navigate"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Progress bar */}
            <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-blue-700 dark:text-blue-300">
                  ৳{(post.raisedAmount ?? 0).toLocaleString()} raised
                </span>
                <span className="text-muted-foreground text-xs">
                  of ৳{post.targetAmount.toLocaleString()}
                </span>
              </div>
              <Progress
                value={Math.min(((post.raisedAmount ?? 0) / post.targetAmount) * 100, 100)}
                className="h-2 bg-blue-100 dark:bg-blue-900 [&>div]:bg-blue-600"
              />
              <p className="text-[11px] text-blue-600/70 dark:text-blue-400">
                {Math.round(((post.raisedAmount ?? 0) / post.targetAmount) * 100)}% funded
              </p>
            </div>

            {/* Donate Now button or Goal Reached Message */}
            {post.raisedAmount >= post.targetAmount ? (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold mb-1">
                  <CheckCircle className="w-5 h-5" />
                  Goal Reached!
                </div>
                <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 font-medium">
                  Target amount successfully reached. Thank you for your kind support!
                </p>
              </div>
            ) : !post.isResolved ? (
              <Button
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 shadow-sm"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (!user) {
                    toast.error("Please login to donate");
                    router.push(`/auth/login?callbackUrl=/feed/${post.id}`);
                    return;
                  }
                  setIsDonateOpen(true); 
                }}
              >
                <Heart className="w-4 h-4 fill-white" />
                Donate Now — SSLCommerz
              </Button>
            ) : (
                <div className="bg-secondary/20 border border-border rounded-xl p-4 text-center">
                   <p className="text-xs text-muted-foreground font-medium">
                      This request has been resolved.
                   </p>
                </div>
            )}
          </div>
          </div>
        )}

        {/* bKash/Nagad manual block - Hide if goal reached or resolved */}
        {post.bkashNagadNumber && post.isVerified && post.raisedAmount < (post.targetAmount || 0) && !post.isResolved && (
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center gap-3 text-sm text-foreground bg-pink-50/50 dark:bg-pink-950/20 p-3 rounded-lg border border-pink-100 dark:border-pink-900/50">
              <Wallet className="w-5 h-5 text-pink-600 shrink-0 self-start mt-0.5" />
              <div className="flex flex-col">
                <span>
                  <strong className="text-sm font-semibold">bKash/Nagad:</strong>{" "}
                  <span className="font-bold">{post.bkashNagadNumber}</span>
                </span>
                <span className="text-[11px] text-pink-700/80 dark:text-pink-400 mt-1 leading-tight font-medium">
                  NB: Manual transfers will not auto-update the raised amount.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Image Gallery at the bottom so text dominates */}
        {post.images && post.images.length > 0 && (
          <div className="mt-4 pt-1">
            <PostImageGallery images={post.images} postType={post.type} />
          </div>
        )}

        {/* Action Call */}
        {post.contactNumber && (
          <div className="mt-4">
            <Button
              variant={post.type === "BLOOD_FINDING" ? "default" : "outline"}
              className={`w-full gap-2 font-bold h-11 ${post.type === "BLOOD_FINDING" ? "bg-destructive hover:bg-destructive/90 text-white shadow-sm hover:shadow-md" : ""}`}
              asChild
            >
              <a href={`tel:${post.contactNumber}`}>
                <Phone className="w-4 h-4" />
                {post.type === "BLOOD_FINDING" ? "CALL NOW" : "Contact Number"}
              </a>
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between border-t border-border/40 p-1 bg-muted/5">
        <LikeAction
          postId={post.id}
          initialLikes={post._count?.likes || 0}
          initialHasLiked={post.hasLiked}
        />

        <div className="w-[1px] bg-primary/10 h-6 self-center" />

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCommentClick}
          className="flex-1 rounded-none hover:bg-primary/5 hover:text-primary transition-all group py-5 z-10"
        >
          <MessageCircle className="w-4 h-4 mr-2 group-hover:fill-primary transition-colors" />
          <div className="flex items-baseline gap-1">
            <span className="font-bold">{post._count?.comments || 0}</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Comments
            </span>
          </div>
        </Button>
      </CardFooter>

      {/* Edit Post Modal */}
      {isEditModalOpen && (
        <EditPostModal
          post={post}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {/* Donate Funds Modal */}
      <DonateFundsModal
        isOpen={isDonateOpen}
        onClose={() => setIsDonateOpen(false)}
        postId={post.id}
        postTitle={post.title}
        targetAmount={post.targetAmount}
        raisedAmount={post.raisedAmount ?? 0}
      />
    </Card>
  );
}
