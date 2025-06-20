// components/ui/notifications.js
"use client";

import { useState } from "react";
import { Bell, X, Check, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Mock notification data - replace with your actual data source
const mockNotifications = [
  {
    id: 1,
    type: "success",
    title: "Lead Converted",
    message: "John Doe has been successfully converted to a customer.",
    timestamp: "2 minutes ago",
    read: false,
  },
  {
    id: 2,
    type: "info",
    title: "New Lead Assigned",
    message: "You have been assigned a new lead: Sarah Johnson.",
    timestamp: "1 hour ago",
    read: false,
  },
  {
    id: 3,
    type: "warning",
    title: "Follow-up Required",
    message: "Mike Wilson requires follow-up within 24 hours.",
    timestamp: "3 hours ago",
    read: true,
  },
  {
    id: 4,
    type: "info",
    title: "System Update",
    message: "The CRM system will undergo maintenance tonight at 11 PM.",
    timestamp: "1 day ago",
    read: true,
  },
];

const getNotificationIcon = (type) => {
  switch (type) {
    case "success":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "warning":
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    case "error":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Info className="h-4 w-4 text-blue-500" />;
  }
};

const NotificationItem = ({ notification, onMarkAsRead, onRemove }) => {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors",
        !notification.read && "bg-muted/30"
      )}
    >
      <div className="flex-shrink-0 mt-1">
        {getNotificationIcon(notification.type)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4 className="text-sm font-medium text-foreground">
              {notification.title}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              {notification.message}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {notification.timestamp}
            </p>
          </div>

          <div className="flex items-center gap-1">
            {!notification.read && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onMarkAsRead(notification.id)}
                title="Mark as read"
              >
                <Check className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => onRemove(notification.id)}
              title="Remove notification"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {!notification.read && (
        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
      )}
    </div>
  );
};

export function NotificationsDialog({ sidebarCollapsed = false }) {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const handleRemove = (id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const handleClearAll = () => {
    setNotifications([]);
    setOpen(false);
  };

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
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
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
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="text-xs text-muted-foreground"
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="mt-4">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No notifications yet
                </p>
              </div>
            ) : (
              <ScrollArea className="max-h-96">
                <div className="space-y-1">
                  {notifications.map((notification, index) => (
                    <div key={notification.id}>
                      <NotificationItem
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onRemove={handleRemove}
                      />
                      {index < notifications.length - 1 && (
                        <Separator className="my-1" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// Usage example for your RoleBasedDashboardLayout:
export default NotificationsDialog;
