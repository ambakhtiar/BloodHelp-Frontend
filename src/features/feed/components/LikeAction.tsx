"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleLike } from "@/services/post.service";
import { toast } from "sonner"; // Assuming sonner is used, if not we'll fallback to alert
import { useAuthContext } from "@/providers/AuthProvider";
import { useRouter, usePathname } from "next/navigation";

interface LikeActionProps {
  postId: string;
  initialLikes: number;
  initialHasLiked: boolean;
}

export function LikeAction({ postId, initialLikes, initialHasLiked }: LikeActionProps) {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  const [hasLiked, setHasLiked] = useState(initialHasLiked);
  const [likesCount, setLikesCount] = useState(initialLikes);

  // Sync state with props when they change (e.g. after login/refetch)
  useEffect(() => {
    setHasLiked(initialHasLiked);
    setLikesCount(initialLikes);
  }, [initialHasLiked, initialLikes]);

  const mutation = useMutation({
    mutationFn: () => toggleLike(postId),
    onMutate: async () => {
      // Optimistically update the UI
      const previousHasLiked = hasLiked;
      const previousCount = likesCount;

      // Toggle state: If already liked, decrease count. If not liked, increase count.
      const newHasLiked = !previousHasLiked;
      const newLikesCount = newHasLiked ? previousCount + 1 : Math.max(0, previousCount - 1);

      setHasLiked(newHasLiked);
      setLikesCount(newLikesCount);

      return { previousHasLiked, previousCount };
    },
    onError: (error: any, variables, context) => {
      // Rollback on error
      if (context) {
        setHasLiked(context.previousHasLiked);
        setLikesCount(context.previousCount);
      }
      toast.error("Failed to update like status");
    },
    onSuccess: () => {
      // Invalidate queries to sync with server in background
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    }
  });

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card navigation
    if (!user) {
      toast.error("Please login to like this post");
      router.push(`/auth/login?callbackUrl=${pathname}`);
      return;
    }
    mutation.mutate();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={mutation.isPending}
      className={`flex-1 rounded-none hover:bg-primary/5 transition-all group py-5 ${hasLiked ? 'text-primary' : 'text-muted-foreground'}`}
    >
      <Heart className={`w-4 h-4 mr-2 ${hasLiked ? 'fill-primary' : 'group-hover:fill-primary/20'} transition-all duration-300 ${mutation.isPending ? 'scale-90' : 'scale-100 hover:scale-110'}`} />
      <div className="flex items-baseline gap-1">
        <span className="font-bold">{likesCount}</span>
        <span className="text-xs hidden sm:inline">{likesCount === 1 ? 'Like' : 'Likes'}</span>
      </div>
    </Button>
  );
}
