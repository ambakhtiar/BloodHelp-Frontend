"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BellOff, CheckCheck, Circle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  getNotifications,
  markAllRead,
  markAsRead,
} from "@/services/notification.service";
import { respondToConsent, respondToHospitalRequest } from "@/services/post.service";
import { respondToVolunteerConsent } from "@/services/organisation.service";
import { INotification } from "@/types/notification.types";
import { formatDistanceToNow } from "date-fns";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    refetchInterval: 30_000, // Poll every 30s — best practice without websockets
    refetchIntervalInBackground: false,
    staleTime: 20_000,
  });

  const notifications: INotification[] = data?.data ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      toast.success("All notifications marked as read");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => {
      toast.error("Failed to mark all as read");
    },
  });

  const consentMutation = useMutation({
    mutationFn: ({ postId, status }: { postId: string; status: 'ACCEPTED' | 'REJECTED' }) =>
      respondToConsent(postId, status),
    onSuccess: (_, variables) => {
      const isAccepted = variables.status === 'ACCEPTED';
      toast.success(
        isAccepted
          ? "✅ Accepted! Your profile and timeline have been updated."
          : "❌ Rejected. The original post remains."
      );
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Failed to respond to consent request.";
      toast.error(msg);
    },
  });

  const hospitalRequestMutation = useMutation({
    mutationFn: ({ requestId, status }: { requestId: string; status: 'ACCEPTED' | 'REJECTED' }) =>
      respondToHospitalRequest(requestId, status),
    onSuccess: (_, variables) => {
      const isAccepted = variables.status === 'ACCEPTED';
      toast.success(
        isAccepted
          ? "✅ Donation accepted! Your profile, timeline, and donation history have been updated."
          : "❌ Donation declined."
      );
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Failed to respond to donation request.";
      toast.error(msg);
    },
  });

  const volunteerConsentMutation = useMutation({
    mutationFn: ({ volunteerId, status }: { volunteerId: string; status: 'ACCEPTED' | 'REJECTED' }) =>
      respondToVolunteerConsent(volunteerId, status),
    onSuccess: (_, variables) => {
      const isAccepted = variables.status === 'ACCEPTED';
      toast.success(
        isAccepted
          ? "✅ You have joined the organisation as a volunteer!"
          : "❌ Volunteer invitation rejected."
      );
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Failed to respond to volunteer invitation.";
      toast.error(msg);
    },
  });

  const handleNotificationClick = (notification: INotification) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full hover:bg-accent"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        >
          <Bell className="h-4.5 w-4.5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white ring-2 ring-background min-w-[18px] px-0.5">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[380px] p-0 shadow-xl rounded-xl border border-border/60"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/30 rounded-t-xl">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm text-foreground">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-primary gap-1"
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        {/* List */}
        <ScrollArea className="max-h-[420px]">
          {isLoading ? (
            <div className="flex flex-col gap-2 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-muted rounded w-3/4" />
                    <div className="h-2.5 bg-muted rounded w-full" />
                    <div className="h-2 bg-muted rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <BellOff className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                No notifications yet
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                You&apos;ll see notifications for new activity here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "w-full text-left px-4 py-3.5 flex gap-3 items-start transition-colors hover:bg-accent/50 group cursor-pointer",
                    !notification.isRead && "bg-primary/[0.04]"
                  )}
                >
                  {/* Unread dot */}
                  <div className="mt-1.5 shrink-0">
                    {!notification.isRead ? (
                      <Circle className="h-2 w-2 fill-primary text-primary" />
                    ) : (
                      <Circle className="h-2 w-2 fill-muted-foreground/20 text-muted-foreground/20" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm leading-snug line-clamp-1",
                        !notification.isRead
                          ? "font-semibold text-foreground"
                          : "font-medium text-muted-foreground"
                      )}
                    >
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1.5">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>

                    {/* ── Consent Action Buttons (B-3: post consent flow) ── */}
                    {notification.type === "DONATION_CONSENT_REQUEST" && notification.postId && (
                      <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          disabled={consentMutation.isPending}
                          onClick={(e) => {
                            e.stopPropagation();
                            consentMutation.mutate({ postId: notification.postId!, status: 'ACCEPTED' });
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer"
                        >
                          ✅ Accept
                        </button>
                        <button
                          type="button"
                          disabled={consentMutation.isPending}
                          onClick={(e) => {
                            e.stopPropagation();
                            consentMutation.mutate({ postId: notification.postId!, status: 'REJECTED' });
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted hover:bg-destructive/10 hover:text-destructive text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer"
                        >
                          ❌ Reject
                        </button>
                      </div>
                    )}

                    {/* ── Hospital Donation Record Buttons ── */}
                    {notification.type === "DONATION_RECORD_REQUEST" && notification.postId && !notification.isRead && (
                      <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          disabled={hospitalRequestMutation.isPending}
                          onClick={(e) => {
                            e.stopPropagation();
                            hospitalRequestMutation.mutate({ requestId: notification.postId!, status: 'ACCEPTED' });
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer"
                        >
                          ✅ Accept
                        </button>
                        <button
                          type="button"
                          disabled={hospitalRequestMutation.isPending}
                          onClick={(e) => {
                            e.stopPropagation();
                            hospitalRequestMutation.mutate({ requestId: notification.postId!, status: 'REJECTED' });
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted hover:bg-destructive/10 hover:text-destructive text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer"
                        >
                          ❌ Reject
                        </button>
                      </div>
                    )}

                    {/* ── Volunteer Consent Buttons ── */}
                    {notification.type === "VOLUNTEER_CONSENT_REQUEST" && notification.postId && !notification.isRead && (
                      <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          disabled={volunteerConsentMutation.isPending}
                          onClick={(e) => {
                            e.stopPropagation();
                            volunteerConsentMutation.mutate({ volunteerId: notification.postId!, status: 'ACCEPTED' });
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer"
                        >
                          ✅ Join
                        </button>
                        <button
                          type="button"
                          disabled={volunteerConsentMutation.isPending}
                          onClick={(e) => {
                            e.stopPropagation();
                            volunteerConsentMutation.mutate({ volunteerId: notification.postId!, status: 'REJECTED' });
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted hover:bg-destructive/10 hover:text-destructive text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer"
                        >
                          ❌ Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="px-4 py-2.5 border-t border-border/60 bg-muted/20 rounded-b-xl">
            <p className="text-[10px] text-muted-foreground text-center">
              Showing latest {notifications.length} notification
              {notifications.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
