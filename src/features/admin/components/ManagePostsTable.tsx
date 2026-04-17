"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ShieldCheck,
  ShieldOff,
  BadgeCheck,
  BadgeX,
  Eye,
  EyeOff,
  Clock,
  MapPin,
  User,
  Search,
  ArrowUpDown,
  Trash2,
  CheckCircle2,
  Filter,
  SortAsc,
  SortDesc,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  getAllPosts,
  approvePost,
  verifyPost,
  toggleDeletePost,
} from "@/services/post.service";
import { PostType, postTypeDisplayMap } from "@/types/post.types";
import { format } from "date-fns";
import Link from "next/link";

type ActionType = "approve" | "verify" | "delete" | null;

interface PendingAction {
  type: ActionType;
  postId: string;
  currentState: boolean;
}

export function ManagePostsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [isApproved, setIsApproved] = useState<boolean | undefined>(undefined);
  const [isVerified, setIsVerified] = useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const queryClient = useQueryClient();

  const { data: postsRes, isLoading } = useQuery({
    queryKey: ["admin-posts", searchTerm, typeFilter, isApproved, isVerified, sortBy, sortOrder, page],
    queryFn: () =>
      getAllPosts({
        searchTerm,
        type: typeFilter === "ALL" ? undefined : typeFilter,
        isApproved,
        isVerified,
        sortBy,
        sortOrder,
        page,
        limit: 10,
      }),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id }: { id: string; currentState: boolean }) => approvePost(id),
    onSuccess: (res, variables) => {
      variables.currentState
        ? toast.error("Post approval withdrawn successfully")
        : toast.success("Post approved successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      setPendingAction(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update approval");
      setPendingAction(null);
    },
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id }: { id: string; currentState: boolean }) => verifyPost(id),
    onSuccess: (res, variables) => {
      variables.currentState
        ? toast.error("Post verification removed successfully")
        : toast.success("Post verified successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      setPendingAction(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update verification");
      setPendingAction(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: string; currentState: boolean }) => toggleDeletePost(id),
    onSuccess: (res, variables) => {
      variables.currentState
        ? toast.success("Post restored successfully")
        : toast.error("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      setPendingAction(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update post");
      setPendingAction(null);
    },
  });

  const handleConfirm = () => {
    if (!pendingAction) return;
    if (pendingAction.type === "approve") approveMutation.mutate({ id: pendingAction.postId, currentState: pendingAction.currentState });
    else if (pendingAction.type === "verify") verifyMutation.mutate({ id: pendingAction.postId, currentState: pendingAction.currentState });
    else if (pendingAction.type === "delete") deleteMutation.mutate({ id: pendingAction.postId, currentState: pendingAction.currentState });
  };

  const isAnyPending =
    approveMutation.isPending || verifyMutation.isPending || deleteMutation.isPending;

  const getDialogContent = () => {
    if (!pendingAction) return { title: "", description: "", actionLabel: "" };
    const { type, currentState } = pendingAction;

    if (type === "approve") {
      return currentState
        ? {
          title: "Withdraw Approval?",
          description: "This post will no longer appear as approved. It will be hidden from the public feed.",
          actionLabel: "Withdraw Approval",
          actionClass: "bg-amber-600 hover:bg-amber-700",
        }
        : {
          title: "Approve this Post?",
          description: "This post will be marked as approved and become visible to all users in the feed.",
          actionLabel: "Approve Post",
          actionClass: "bg-green-600 hover:bg-green-700",
        };
    }
    if (type === "verify") {
      return currentState
        ? {
          title: "Remove Verification?",
          description: "The verified badge will be removed from this post.",
          actionLabel: "Remove Verification",
          actionClass: "bg-amber-600 hover:bg-amber-700",
        }
        : {
          title: "Verify this Post?",
          description: "This post will receive a verified badge, signaling to users that the information has been reviewed.",
          actionLabel: "Verify Post",
          actionClass: "bg-blue-600 hover:bg-blue-700",
        };
    }
    if (type === "delete") {
      return currentState
        ? {
          title: "Restore this Post?",
          description: "This post will be restored and become visible in the feed.",
          actionLabel: "Restore Post",
          actionClass: "bg-green-600 hover:bg-green-700",
        }
        : {
          title: "Delete this Post?",
          description: "This post will be hidden from the feed. You can restore it later.",
          actionLabel: "Delete Post",
          actionClass: "bg-destructive hover:bg-destructive/90",
        };
    }
    return { title: "", description: "", actionLabel: "", actionClass: "" };
  };

  const dialog = getDialogContent();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
        <div className="h-64 w-full bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  const posts = postsRes?.data || [];
  const meta = postsRes?.meta;

  return (
    <div className="space-y-6">
      {/* Advanced Search, Sort & Filters */}
      <div className="flex flex-col gap-4 bg-card p-4 rounded-2xl border-2 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search posts by title..."
              className="pl-9 h-11 rounded-xl bg-background border-2 focus:border-primary/50 transition-all"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select 
              value={typeFilter} 
              onValueChange={(v) => { setTypeFilter(v); setPage(1); }}
            >
              <SelectTrigger className="w-[140px] h-11 rounded-xl bg-background border-2 font-black uppercase text-[10px] tracking-wider">
                <Filter className="h-3 w-3 mr-1" />
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="ALL">All Types</SelectItem>
                {Object.entries(postTypeDisplayMap).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={sortBy} 
              onValueChange={(v) => { setSortBy(v); setPage(1); }}
            >
              <SelectTrigger className="w-[140px] h-11 rounded-xl bg-background border-2 font-black uppercase text-[10px] tracking-wider">
                <SortAsc className="h-3 w-3 mr-1" />
                <span>{sortBy === "createdAt" ? "Date" : sortBy === "title" ? "Title" : "Amount"}</span>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="createdAt">Sort by Date</SelectItem>
                <SelectItem value="title">Sort by Title</SelectItem>
                <SelectItem value="targetAmount">Sort by Goal</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-xl border-2"
              onClick={() => { setSortOrder(sortOrder === "asc" ? "desc" : "asc"); setPage(1); }}
            >
              {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-muted">
          <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mr-2">Status Filter:</span>
          <div className="flex items-center gap-1.5">
            <Button
              variant={isApproved === undefined ? "secondary" : "outline"}
              size="sm"
              className="h-8 text-[9px] font-black uppercase rounded-lg px-3 border-2"
              onClick={() => { setIsApproved(undefined); setPage(1); }}
            >
              All Posts
            </Button>
            <Button
              variant={isApproved === true ? "success" : "outline"}
              size="sm"
              className={cn("h-8 text-[9px] font-black uppercase rounded-lg px-3 border-2", isApproved !== true && "text-muted-foreground border-muted")}
              onClick={() => { setIsApproved(true); setPage(1); }}
            >
              Approved Only
            </Button>
            <Button
              variant={isApproved === false ? "warning" : "outline"}
              size="sm"
              className={cn("h-8 text-[9px] font-black uppercase rounded-lg px-3 border-2", isApproved !== false && "text-muted-foreground border-muted")}
              onClick={() => { setIsApproved(false); setPage(1); }}
            >
              Pending Approval
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block rounded-xl border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="font-semibold">Post Details</TableHead>
              <TableHead className="font-semibold">Location</TableHead>
              <TableHead className="font-semibold text-center">Approved</TableHead>
              <TableHead className="font-semibold text-center">Verified</TableHead>
              <TableHead className="font-semibold text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                  No posts found.
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post: any) => (
                <TableRow
                  key={post.id}
                  className={cn(
                    "transition-colors",
                    post.isDeleted && "opacity-50 bg-muted/30"
                  )}
                >
                  <TableCell className="min-w-[400px]">
                    <div className="flex flex-col gap-2 py-2">
                       <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0">
                          {postTypeDisplayMap[post.type as PostType] || post.type}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(post.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                      <Link
                        href={`/feed/${post.id}`}
                        target="_blank"
                        className="font-bold text-base text-foreground hover:text-primary transition-colors line-clamp-1"
                      >
                        {post.title || "Untitled Post"}
                      </Link>
                      
                      {/* Donation Progress - Text Based Indicator */}
                      {post.type === PostType.HELPING && (
                        <div className="mt-2 w-full bg-blue-50/50 dark:bg-blue-950/20 rounded-lg p-2 border border-blue-100 dark:border-blue-900/40">
                           <div className="flex justify-between items-center text-xs font-black">
                            <span className="text-blue-600 dark:text-blue-400">Raised: ৳{post.raisedAmount?.toLocaleString()}</span>
                            <span className="text-muted-foreground">Target: ৳{post.targetAmount?.toLocaleString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        {post.upazila}, {post.district}
                      </div>
                      <span className="text-[11px] text-muted-foreground pl-5 uppercase tracking-tighter font-semibold">{post.division}</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <Button
                      variant={post.isApproved ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "h-9 px-4 gap-1.5 text-xs font-bold rounded-lg transition-all",
                        post.isApproved ? "bg-green-600 hover:bg-green-700" : "border-amber-500 text-amber-600 hover:bg-amber-50"
                      )}
                      onClick={() => setPendingAction({ type: "approve", postId: post.id, currentState: post.isApproved })}
                    >
                      {post.isApproved ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldOff className="h-3.5 w-3.5" />}
                      <span className="hidden sm:inline">{post.isApproved ? "Approved" : "Approve"}</span>
                    </Button>
                  </TableCell>

                  <TableCell className="text-center">
                    {post.type === PostType.HELPING ? (
                      <Button
                        variant={post.isVerified ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "h-9 px-4 gap-1.5 text-xs font-bold rounded-lg transition-all",
                          post.isVerified ? "bg-blue-600 hover:bg-blue-700" : "border-blue-400 text-blue-500 hover:bg-blue-50"
                        )}
                        onClick={() => setPendingAction({ type: "verify", postId: post.id, currentState: post.isVerified })}
                      >
                        {post.isVerified ? <BadgeCheck className="h-3.5 w-3.5" /> : <BadgeX className="h-3.5 w-3.5" />}
                        <span className="hidden sm:inline">{post.isVerified ? "Verified" : "Verify"}</span>
                      </Button>
                    ) : "-"}
                  </TableCell>

                  <TableCell className="text-center">
                    <Button
                      variant={post.isDeleted ? "outline" : "destructive"}
                      size="sm"
                      className={cn(
                        "h-9 px-4 gap-1.5 text-xs font-bold rounded-lg transition-all",
                        post.isDeleted ? "border-green-600 text-green-600 hover:bg-green-50" : "bg-red-600 hover:bg-red-700 text-white"
                      )}
                      onClick={() => setPendingAction({ type: "delete", postId: post.id, currentState: post.isDeleted })}
                    >
                      {post.isDeleted ? <Eye className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5" />}
                      <span className="hidden sm:inline">{post.isDeleted ? "Restore" : "Delete"}</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {posts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border">No posts found.</div>
        ) : (
          posts.map((post: any) => (
            <div 
              key={post.id} 
              className={cn(
                "bg-card rounded-2xl border p-5 shadow-sm space-y-4 transition-all",
                post.isDeleted && "opacity-60 bg-muted/40"
              )}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest">
                    {postTypeDisplayMap[post.type as PostType] || post.type}
                  </Badge>
                  <Link href={`/feed/${post.id}`} target="_blank" className="block text-lg font-black leading-tight hover:text-primary transition-colors">
                    {post.title}
                  </Link>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground font-bold">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {format(new Date(post.createdAt), "MMM d, yyyy")}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {post.upazila}, {post.district}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                   <Badge variant={post.isApproved ? "success" : "warning"} className="text-[9px] font-bold px-2 py-0.5">
                    {post.isApproved ? "Approved" : "Pending"}
                   </Badge>
                   {post.type === PostType.HELPING && (
                     <Badge variant={post.isVerified ? "info" : "outline"} className="text-[9px] font-bold px-2 py-0.5">
                      {post.isVerified ? "Verified" : "Verify Required"}
                     </Badge>
                   )}
                </div>
              </div>

              {/* Progress Info - Text Based */}
              {post.type === PostType.HELPING && (
                <div className="py-2 px-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/40">
                   <div className="flex justify-between items-center text-sm font-black">
                    <span className="text-blue-600">Raised: ৳{post.raisedAmount?.toLocaleString()}</span>
                    <span className="text-muted-foreground/70 text-xs">Goal: ৳{post.targetAmount?.toLocaleString()}</span>
                   </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={cn("h-11 text-xs font-black rounded-xl border-2", post.isApproved ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200")}
                  onClick={() => setPendingAction({ type: "approve", postId: post.id, currentState: post.isApproved })}
                >
                  {post.isApproved ? "Unapprove" : "Approve"}
                </Button>
                {post.type === PostType.HELPING ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={cn("h-11 text-xs font-black rounded-xl border-2", post.isVerified ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-50 border-slate-200")}
                    onClick={() => setPendingAction({ type: "verify", postId: post.id, currentState: post.isVerified })}
                  >
                    {post.isVerified ? "Unverify" : "Verify"}
                  </Button>
                ) : <div className="invisible" />}
                <Button 
                  variant={post.isDeleted ? "outline" : "destructive"} 
                  size="sm" 
                  className={cn("h-11 text-xs font-black rounded-xl border-2 shadow-sm", post.isDeleted ? "bg-green-50 text-green-700 border-green-200" : "bg-red-600 hover:bg-red-700 border-transparent text-white")}
                  onClick={() => setPendingAction({ type: "delete", postId: post.id, currentState: post.isDeleted })}
                >
                  {post.isDeleted ? "Restore" : "Delete"}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ────────────────── Modern Unified Pagination ────────────────── */}
      {meta && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-5 bg-card/60 backdrop-blur-md border border-primary/10 rounded-2xl shadow-xl shadow-primary/5 gap-4 mt-6">
          <div className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] text-center sm:text-left">
            Showing <span className="text-foreground font-black">{(page - 1) * meta.limit + 1}–{Math.min(page * meta.limit, meta.total)}</span> of <span className="text-foreground font-black">{meta.total}</span> Posts
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-4 rounded-xl border-primary/10 bg-background/50 font-black text-[10px] tracking-widest uppercase transition-all shadow-sm hover:translate-y-[-1px] active:translate-y-[0.1px] shadow-primary/5 disabled:opacity-30"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1.5 text-primary" />
              Prev
            </Button>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/5 border border-primary/10">
              <span className="text-[10px] font-black text-primary/40 tracking-tighter mr-1">PAGE</span>
              {Array.from({ length: Math.ceil(meta.total / meta.limit) })
                .slice(Math.max(0, page - 3), Math.min(Math.ceil(meta.total / meta.limit), page + 2))
                .map((_, i) => {
                  const pageNum = Math.max(0, page - 3) + i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 w-8 p-0 rounded-lg font-black text-xs transition-all",
                        page === pageNum 
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" 
                          : "text-primary/60 hover:bg-primary/10 hover:text-primary"
                      )}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-10 px-4 rounded-xl border-primary/10 bg-background/50 font-black text-[10px] tracking-widest uppercase transition-all shadow-sm hover:translate-y-[-1px] active:translate-y-[0.1px] shadow-primary/5 disabled:opacity-30"
              onClick={() => setPage((p) => Math.min(Math.ceil(meta.total / meta.limit), p + 1))}
              disabled={page === Math.ceil(meta.total / meta.limit)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1.5 text-primary" />
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation AlertDialog */}
      <AlertDialog open={!!pendingAction} onOpenChange={(open) => !open && setPendingAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{dialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isAnyPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={cn("font-semibold", (dialog as any).actionClass)}
              disabled={isAnyPending}
            >
              {isAnyPending ? "Processing..." : dialog.actionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
