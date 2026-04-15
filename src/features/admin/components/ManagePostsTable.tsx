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
  const [page, setPage] = useState(1);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const queryClient = useQueryClient();

  const { data: postsRes, isLoading } = useQuery({
    queryKey: ["admin-posts", searchTerm, typeFilter, page],
    queryFn: () =>
      getAllPosts({
        searchTerm,
        type: typeFilter === "ALL" ? undefined : typeFilter,
        page,
        limit: 10,
      }),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id }: { id: string; currentState: boolean }) => approvePost(id),
    onSuccess: (res, variables) => {
      variables.currentState
        ? toast.warning("Post approval withdrawn successfully")
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
        ? toast.warning("Post verification removed successfully")
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
        : toast.warning("Post deleted successfully");
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
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 min-w-0 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search posts..."
            className="pl-9 w-full"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            {Object.entries(postTypeDisplayMap).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="font-semibold">Post</TableHead>
              <TableHead className="font-semibold">Location</TableHead>
              <TableHead className="font-semibold text-center">Approved</TableHead>
              <TableHead className="font-semibold text-center">Verified</TableHead>
              <TableHead className="font-semibold text-center">Visibility</TableHead>
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
                  {/* Post Info */}
                  <TableCell className="max-w-[280px]">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px] font-normal shrink-0">
                          {postTypeDisplayMap[post.type as PostType] || post.type}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0">
                          <Clock className="h-2.5 w-2.5" />
                          {format(new Date(post.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                      <Link
                        href={`/feed/${post.id}`}
                        target="_blank"
                        className="font-semibold text-sm text-foreground hover:text-primary transition-colors line-clamp-1"
                      >
                        {post.title || "Untitled Post"}
                      </Link>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <User className="h-3 w-3" />
                        ID: {post.id.slice(-8).toUpperCase()}
                      </div>
                    </div>
                  </TableCell>

                  {/* Location */}
                  <TableCell>
                    <div className="flex flex-col text-xs gap-0.5">
                      <div className="flex items-center gap-1 text-foreground font-medium">
                        <MapPin className="h-3 w-3 text-primary shrink-0" />
                        {post.upazila}, {post.district}
                      </div>
                      <span className="text-muted-foreground pl-4">{post.division}</span>
                    </div>
                  </TableCell>

                  {/* Approve Toggle */}
                  <TableCell className="text-center">
                    <Button
                      variant={post.isApproved ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "h-9 px-4 gap-2 text-xs font-semibold rounded-lg transition-all duration-200",
                        post.isApproved
                          ? "bg-green-600 hover:bg-green-700 text-white border-transparent shadow-md shadow-green-500/20"
                          : "border-amber-400 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950"
                      )}
                      onClick={() => setPendingAction({ type: "approve", postId: post.id, currentState: post.isApproved })}
                      disabled={isAnyPending}
                    >
                      {post.isApproved ? (
                        <ShieldCheck className="h-3.5 w-3.5" />
                      ) : (
                        <ShieldOff className="h-3.5 w-3.5" />
                      )}
                      {post.isApproved ? "Approved" : "Pending"}
                    </Button>
                  </TableCell>

                  {/* Verify Toggle */}
                  <TableCell className="text-center">
                    {post.type === PostType.HELPING ? (
                      <Button
                        variant={post.isVerified ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "h-9 px-4 gap-2 text-xs font-semibold rounded-lg transition-all duration-200",
                          post.isVerified
                            ? "bg-blue-600 hover:bg-blue-700 text-white border-transparent shadow-md shadow-blue-500/20"
                            : "border-blue-300 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950"
                        )}
                        onClick={() => setPendingAction({ type: "verify", postId: post.id, currentState: post.isVerified })}
                        disabled={isAnyPending}
                      >
                        {post.isVerified ? (
                          <BadgeCheck className="h-3.5 w-3.5" />
                        ) : (
                          <BadgeX className="h-3.5 w-3.5" />
                        )}
                        {post.isVerified ? "Verified" : "Unverified"}
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">N/A</span>
                    )}
                  </TableCell>

                  {/* Delete/Restore Toggle */}
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "h-9 px-4 gap-2 text-xs font-semibold rounded-lg transition-all duration-200",
                        post.isDeleted
                          ? "border-green-400 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                          : "border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                      )}
                      onClick={() => setPendingAction({ type: "delete", postId: post.id, currentState: post.isDeleted })}
                      disabled={isAnyPending}
                    >
                      {post.isDeleted ? (
                        <Eye className="h-3.5 w-3.5" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5" />
                      )}
                      {post.isDeleted ? "Restore" : "Delete"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta && meta.total > meta.limit && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Showing {((meta.page - 1) * meta.limit) + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total} posts
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm font-medium px-2">{page} / {Math.ceil(meta.total / meta.limit)}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= Math.ceil(meta.total / meta.limit)}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
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
