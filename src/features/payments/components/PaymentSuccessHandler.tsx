"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface PaymentSuccessHandlerProps {
  postId?: string;
}

export function PaymentSuccessHandler({ postId }: PaymentSuccessHandlerProps) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Aggressively invalidate all related queries
    const keys = ["posts", "post", "admin-posts", "donations"];
    
    keys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: [key] });
      queryClient.resetQueries({ queryKey: [key] });
    });

    // If a specific postId is provided, specifically refetch it after a tiny delay
    if (postId) {
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ["post", postId] });
        queryClient.refetchQueries({ queryKey: ["posts"] });
      }, 500);
    }
  }, [queryClient, postId]);

  return null;
}
