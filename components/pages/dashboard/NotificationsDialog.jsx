// components/ui/notifications.js
"use client";

import { useState } from "react";
import { Bell, Check, AlertCircle, Info, CheckCircle2, PhoneMissed, Loader2 } from "lucide-react";
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

const getNotificationIcon = (type) => {
  switch (type) {
    case "Missed Call":
      return <PhoneMissed className="h-4 w-4 text-amber-500" />;
    case "warning":
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    case "error":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Info className="h-4 w-4 text-blue-500" />;
  }
};

const NotificationItem = ({ notification, onMarkAsRead }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleMarkAsRead = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/notifications/${notification.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to update notification");
      }

      // Call the parent callback to update the UI
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

      {notification.status === "pending" && (
        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
      )}
    </div>
  );
};

export default function NotificationsDialog({
  sidebarCollapsed = false,
  notifications,
  onNotificationsUpdate, // Add this prop to handle state updates
}) {
  const [open, setOpen] = useState(false);
  // Only show pending notifications
  const [localNotifications, setLocalNotifications] = useState(
    notifications.filter(n => n.status === "pending")
  );

  const unreadCount = localNotifications.length;

  const handleMarkAsRead = (notificationId) => {
    // Remove the notification from local state since we only show pending ones
    setLocalNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    );
    // Also update parent component if callback provided
    if (onNotificationsUpdate) {
      onNotificationsUpdate();
    }
    // Close dialog after update
    setOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    if (localNotifications.length === 0) return;

    try {
      // Update all pending notifications
      const updatePromises = localNotifications.map(notification =>
        fetch(`/api/notifications/${notification.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        })
      );

      const responses = await Promise.all(updatePromises);
      
      // Check if all requests were successful
      const allSuccessful = responses.every(response => response.ok);
      
      if (allSuccessful) {
        // Clear all notifications since they're all marked as read
        setLocalNotifications([]);
        toast.success("All notifications marked as read");
        
        if (onNotificationsUpdate) {
          onNotificationsUpdate();
        }
        // Close dialog after marking all as read
        setOpen(false);
      } else {
        throw new Error("Some notifications failed to update");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to mark all notifications as read");
    }
  };

  // Update local state when notifications prop changes
  useState(() => {
    setLocalNotifications(notifications.filter(n => n.status === "pending"));
  }, [notifications]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div
          className={`mb-3 ${sidebarCollapsed ? "flex justify-center" : ""}`}
        >
          <Button
            variant="ghost"
            size="sm"
            className={`relative ${
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

      <DialogContent className="max-w-md">
        <ScrollArea className="h-96">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Notifications</DialogTitle>
            </div>
          </DialogHeader>

          <div className="mt-4">
            {localNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No notifications yet
                </p>
              </div>
            ) : (
              <ScrollArea className="max-h-96">
                <div className="space-y-1">
                  {localNotifications.map((notification, index) => (
                    <div key={notification.id}>
                      <NotificationItem 
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                      />
                      {index < localNotifications.length - 1 && (
                        <Separator className="my-1" />
                      )}
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