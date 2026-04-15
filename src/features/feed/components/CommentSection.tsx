"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPostComments, addComment, editComment, deleteComment, ICommentPayload } from "@/services/post.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreVertical, Edit2, Trash2 } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useAuthContext } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const router = useRouter();

  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const { data: comments, isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => getPostComments(postId),
  });

  const mutation = useMutation({
    mutationFn: (payload: ICommentPayload) => addComment(payload),
    onSuccess: (response, variables) => {
      setNewComment("");
      setReplyTo(null);
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });

      const successMessage = variables.parentId
        ? "Reply added successfully!"
        : "Comment added successfully!";

      toast.success(successMessage);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(errorMessage);
    }
  });

  const editMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => editComment(id, { content }),
    onSuccess: () => {
      setEditingCommentId(null);
      setEditContent("");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      toast.success("Comment updated successfully");
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to update comment"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      setCommentToDelete(null);
      toast.success("Comment deleted successfully");
    },
    onError: (error: any) => {
      setCommentToDelete(null);
      toast.error(error?.response?.data?.message || "Failed to delete comment");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to comment");
      router.push("/login");
      return;
    }
    if (!newComment.trim()) return;

    const payload: ICommentPayload = {
      postId,
      content: newComment,
    };

    if (replyTo?.id) {
      payload.parentId = replyTo.id;
    }

    mutation.mutate(payload);
  };

  return (
    <div className="flex flex-col h-full bg-transparent border-t border-primary/5">
      {/* Comment List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {isLoading ? (
          <div className="flex justify-center p-10"><span className="animate-spin">🔄</span></div>
        ) : comments?.data?.length === 0 ? (
          <div className="text-center text-muted-foreground py-20 font-medium italic">
            No comments yet. Be the first to share your thoughts!
          </div>
        ) : (
          comments?.data?.map((comment: any) => {
            const commenterName = comment.user?.donorProfile?.name || 
                                  comment.user?.hospital?.name || 
                                  comment.user?.organisation?.name || 
                                  comment.user?.admin?.name || "User";
            const commenterInitial = commenterName.charAt(0).toUpperCase();

            return (
              <div key={comment.id} className="space-y-4">
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold uppercase overflow-hidden shrink-0 border border-primary/10">
                    {comment.user?.profilePictureUrl ? (
                      <img 
                        src={comment.user.profilePictureUrl} 
                        alt={commenterName} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      commenterInitial
                    )}
                  </div>
                  <div className="relative flex-1 bg-secondary/30 p-4 rounded-2xl rounded-tl-none border border-primary/10 shadow-sm">
                    <div className="flex flex-wrap justify-between items-start gap-x-4 gap-y-1 mb-1.5">
                      <span className="font-bold text-[13px] md:text-sm text-primary/90 leading-tight">
                        {commenterName}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium shrink-0">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                      
                      {(user?.id === comment.userId || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                        <div className="absolute top-2 right-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="text-muted-foreground hover:bg-black/5 p-1 rounded-md">
                                <MoreVertical className="h-3 w-3" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {user?.id === comment.userId && (
                                <DropdownMenuItem onClick={() => {
                                  setEditingCommentId(comment.id);
                                  setEditContent(comment.content);
                                }}>
                                  <Edit2 className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onClick={() => {
                                setCommentToDelete(comment.id);
                              }}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                    
                    {editingCommentId === comment.id ? (
                      <div className="flex gap-2 items-center mt-2">
                        <Input 
                          value={editContent} 
                          onChange={(e) => setEditContent(e.target.value)} 
                          className="h-8 text-xs" 
                          autoFocus
                        />
                        <Button size="sm" className="h-8 px-2 text-xs" onClick={() => editMutation.mutate({ id: comment.id, content: editContent })}>Save</Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => setEditingCommentId(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <p className="text-[13px] md:text-sm text-foreground/90 leading-relaxed pr-6">{comment.content}</p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-2.5">
                      <button
                        onClick={() => setReplyTo({ id: comment.id, name: commenterName })}
                        className="text-[10px] font-bold text-primary hover:text-primary/70 transition-colors"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>

                {/* Nested Replies (1 Level Only) */}
                {comment.replies?.length > 0 && (
                  <div className="ml-11 space-y-4 border-l-2 border-primary/10 pl-4 mt-2">
                    {comment.replies.map((reply: any) => {
                      const replyName = reply.user?.donorProfile?.name || 
                                        reply.user?.hospital?.name || 
                                        reply.user?.organisation?.name || 
                                        reply.user?.admin?.name || "User";
                      const replyInitial = replyName.charAt(0).toUpperCase();
                      
                      return (
                        <div key={reply.id} className="flex gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold uppercase shrink-0 overflow-hidden border border-primary/5">
                            {reply.user?.profilePictureUrl ? (
                              <img 
                                src={reply.user.profilePictureUrl} 
                                alt={replyName} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              replyInitial
                            )}
                          </div>
                          <div className="relative flex-1 bg-primary/5 p-2.5 rounded-xl rounded-tl-none">
                            <div className="flex justify-between items-baseline mb-0.5">
                              <span className="font-bold text-[11px] text-primary/70">
                                {replyName}
                              </span>
                              
                              {(user?.id === reply.userId || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button className="text-muted-foreground hover:bg-black/5 p-0.5 rounded-md">
                                      <MoreVertical className="h-3 w-3" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {user?.id === reply.userId && (
                                      <DropdownMenuItem onClick={() => {
                                        setEditingCommentId(reply.id);
                                        setEditContent(reply.content);
                                      }}>
                                        <Edit2 className="mr-2 h-4 w-4" /> Edit
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onClick={() => {
                                      setCommentToDelete(reply.id);
                                    }}>
                                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                            
                            {editingCommentId === reply.id ? (
                              <div className="flex gap-2 items-center mt-1">
                                <Input 
                                  value={editContent} 
                                  onChange={(e) => setEditContent(e.target.value)} 
                                  className="h-7 text-xs" 
                                  autoFocus
                                />
                                <Button size="sm" className="h-7 px-2 text-[10px]" onClick={() => editMutation.mutate({ id: reply.id, content: editContent })}>Save</Button>
                                <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px]" onClick={() => setEditingCommentId(null)}>Cancel</Button>
                              </div>
                            ) : (
                              <p className="text-xs text-foreground/90 pr-4">{reply.content}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Input Form */}
      <div className="p-4 border-t bg-card sticky bottom-0 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        {replyTo && (
          <div className="flex justify-between items-center mb-2 bg-primary/5 px-3 py-1.5 rounded-md border border-primary/10">
            <span className="text-xs text-muted-foreground">Replying to <span className="font-bold text-primary">{replyTo.name}</span></span>
            <button onClick={() => setReplyTo(null)} className="text-xs font-bold text-destructive">Cancel</button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={replyTo ? "Write a reply..." : "Add a comment..."}
            className="flex-1 bg-secondary/40 border-primary/10 rounded-full h-10 px-4 focus:bg-background transition-all"
          />
          <Button
            disabled={mutation.isPending || !newComment.trim()}
            className="rounded-full px-5 h-10 bg-primary font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
          >
            {mutation.isPending ? "..." : "Post"}
          </Button>
        </form>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!commentToDelete} onOpenChange={(open) => !open && setCommentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your comment from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => commentToDelete && deleteMutation.mutate(commentToDelete)}
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Comment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

