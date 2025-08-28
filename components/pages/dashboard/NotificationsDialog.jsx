// components/ui/notifications.js
"use client";

import { useState } from "react";
import {
  Bell,
  Check,
  AlertCircle,
  Info,
  CheckCircle2,
  PhoneMissed,
  Loader2,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { CircleAlert } from "lucide-react";
import { useTeamContext } from "@/context/TeamProvider";

import useSWR, { mutate } from "swr";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsDialog({
  sidebarCollapsed = false,
  open,
  setOpen,
  // notifications: initialNotifications,
  // onNotificationsUpdate,
}) {
  const { orgId } = useTeamContext();
  const fetcher = (url) => fetch(url).then((res) => res.json());
const { data: notifications, error, mutate: mutateNotifications } = useSWR(
    orgId ? `/api/org/${orgId}/notifications/` : null,
    fetcher
  );

  if (!notifications) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-full bg-muted-foreground/25" />
        <Skeleton className="h-6 w-full rounded-2xl bg-muted-foreground/25" />
      </div>
    );
  }

  const notificationsToDisplay = notifications.filter(
    (n) => n.status === "pending"
  );
  console.log("notifications", notificationsToDisplay);
  const getNotificationIcon = (type) => {
    switch (type.toLowerCase()) {
      case "missed call":
        return <PhoneMissed className="h-4 w-4 text-amber-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "broadcast":
        return <Megaphone className="h-4 w-4 text-purple-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getBroadcastTypeConfig = (broadcastType) => {
    switch (broadcastType?.toLowerCase()) {
      case "announcement":
        return {
          icon: <Megaphone className="h-4 w-4 text-blue-500" />,
          bgColor: "bg-card",
          titleColor: "text-blue-900",
          label: "Announcement",
        };
      case "alert":
        return {
          icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          bgColor: "bg-card",
          titleColor: "text-red-900",
          label: "Alert",
        };
      case "training":
        return {
          icon: <Info className="h-4 w-4 text-green-500" />,
          bgColor: "bg-card",
          titleColor: "text-green-900",
          label: "Training",
        };
      case "system":
        return {
          icon: <CircleAlert className="h-4 w-4 text-orange-500" />,
          bgColor: "bg-card",
          titleColor: "text-orange-900",
          label: "System",
        };
      case "general":
      default:
        return {
          icon: <Megaphone className="h-4 w-4 text-purple-500" />,
          bgColor: "bg-card",
          titleColor: "text-purple-900",
          label: "General",
        };
    }
  };

  const BroadcastNotificationItem = ({ notification, onMarkAsRead, orgId }) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const broadcastConfig = getBroadcastTypeConfig(
      notification.broadcast?.type
    );

    const handleMarkAsRead = async () => {
      if (isUpdating) return;

      setIsUpdating(true);
      try {
        const response = await fetch(
          `/api/org/${orgId}/notifications/${notification.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update notification");
        }

        onMarkAsRead(notification.id);
        toast.success("Notification marked as read");
      } catch (error) {
        console.error(error);
        toast.error("Failed to update notification");
      } finally {
        setIsUpdating(false);
      }
    };

    return (
      <div
        className={cn(
          "flex items-start gap-3 p-4 rounded-lg border-2 transition-colors",
          broadcastConfig.bgColor,
          notification.status === "pending" && "shadow-sm"
        )}
      >
        <div className="flex-shrink-0 mt-1">{broadcastConfig.icon}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4
                  className={cn(
                    "text-sm font-semibold",
                    broadcastConfig.titleColor
                  )}
                >
                  {broadcastConfig.label}
                </h4>
                {notification.broadcast?.type && (
                  <Badge variant="secondary" className="text-xs">
                    {notification.broadcast.type}
                  </Badge>
                )}
              </div>
              <h5 className="text-base font-medium text-foreground mb-1">
                {notification.title || notification.broadcast?.title}
              </h5>
              <p className="text-sm text-muted-foreground">
                {notification.message || notification.broadcast?.message}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {formatDistanceToNow(new Date(notification.createdAt))} ago
              </p>
            </div>

            <div className="flex items-center gap-1">
              {notification.status === "pending" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  title="Mark as read"
                  onClick={handleMarkAsRead}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const RegularNotificationItem = ({ notification, onMarkAsRead, orgId }) => {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleMarkAsRead = async () => {
      if (isUpdating) return;

      setIsUpdating(true);
      try {
        const response = await fetch(
          `/api/org/${orgId}/notifications/${notification.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update notification");
        }

        onMarkAsRead(notification.id);
        toast.success("Notification marked as read");
      } catch (error) {
        console.error(error);
        toast.error("Failed to update notification");
      } finally {
        setIsUpdating(false);
      }
    };

    return (
      <div
        className={cn(
          "flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors",
          notification.status === "pending" && "bg-muted/30"
        )}
      >
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className="text-base font-medium text-foreground">
                {notification.type}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                {notification.message}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {formatDistanceToNow(new Date(notification.createdAt))} ago
              </p>
            </div>

            <div className="flex items-center gap-1">
              {notification.status === "pending" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  title="Mark as read"
                  onClick={handleMarkAsRead}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* {notification.status === "pending" && (
        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
      )} */}
      </div>
    );
  };

  const NotificationItem = ({ notification, onMarkAsRead, orgId }) => {
    // Check if this is a broadcast notification
    if (
      notification.type?.toLowerCase() === "broadcast" ||
      notification.broadcastId
    ) {
      return (
        <BroadcastNotificationItem
          notification={notification}
          onMarkAsRead={onMarkAsRead}
        />
      );
    }

    return (
      <RegularNotificationItem
        notification={notification}
        onMarkAsRead={onMarkAsRead}
      />
    );
  };

  const unreadCount = notificationsToDisplay.length;

const handleMarkAsRead = async (notificationId) => {
  // Update cache immediately
  mutateNotifications(
    notifications.filter(n => n.id !== notificationId),
    false
  );
  
  // Make API call and revalidate
  await fetch(`/api/org/${orgId}/notifications/${notificationId}`, {
    method: 'PATCH'
  });
  mutateNotifications(); // Revalidate
};
  const handleMarkAllAsRead = async () => {
    if (notifications.length === 0) return;

    try {
      const updatePromises = localNotifications.map((notification) =>
        fetch(`/api/org/${orgId}/notifications/${notification.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        })
      );

      const responses = await Promise.all(updatePromises);
      const allSuccessful = responses.every((response) => response.ok);

      if (allSuccessful) {
        setLocalNotifications([]);
        toast.success("All notifications marked as read");

        if (onNotificationsUpdate) {
          onNotificationsUpdate();
        }
        setOpen(false);
      } else {
        throw new Error("Some notifications failed to update");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to mark all notifications as read");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className={` ${sidebarCollapsed ? "flex justify-center" : ""}`}>
          <Button
            variant="ghost"
            size="sm"
            className={`relative hover:bg-primary ${
              sidebarCollapsed ? "w-8 h-8 p-0" : "w-full justify-start"
            }`}
            title={sidebarCollapsed ? "Notifications" : undefined}
          >
            <Bell className="h-4 w-4" />
            {!sidebarCollapsed && <span className="ml-2">Notifications</span>}
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs animate-pulse">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </div>
      </DialogTrigger>

      <DialogContent className="min-w-xl">
        <ScrollArea className="h-96">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Notifications</DialogTitle>
            </div>
          </DialogHeader>

          <div className="mt-4">
            {notificationsToDisplay.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No new notifications yet
                </p>
              </div>
            ) : (
              <ScrollArea className="max-h-96">
                <div className="space-y-3">
                  {notificationsToDisplay.map((notification, index) => (
                    <div key={notification.id}>
                      <NotificationItem
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={handleMarkAllAsRead}
              >
                Mark all read
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
