"use client";

import React, { useState, useEffect } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Phone, PhoneCall, MessageSquare, Mail, Calendar, Clock } from "lucide-react";

export default function LeadActivities({ leadId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch(`/api/leads/${leadId}/activities`);
        const data = await response.json();
        setActivities(data);
      } catch (err) {
        console.error("Failed to fetch activities:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [leadId]);

  const getActivityIcon = (type) => {
    switch (type) {
      case "CONTACT_ATTEMPTS":
        return <Clock className="w-4 h-4" />;
      case "CONTACTED":
        return <PhoneCall className="w-4 h-4" />;
      case "CALL":
        return <Phone className="w-4 h-4" />;
      case "NOTE":
        return <MessageSquare className="w-4 h-4" />;
      case "EMAIL":
        return <Mail className="w-4 h-4" />;
      case "MEETING":
        return <Calendar className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getActivityBadgeVariant = (type) => {
    switch (type) {
      case "CONTACT_ATTEMPTS":
        return "secondary";
      case "CONTACTED":
        return "default";
      case "CALL":
        return "default";
      case "NOTE":
        return "outline";
      case "EMAIL":
        return "outline";
      case "MEETING":
        return "outline";
      default:
        return "outline";
    }
  };

  const formatActivityContent = (activity) => {
    if (activity.type === "CONTACT_ATTEMPTS") {
      const attempts = activity.callAttemptCount || 1;
      const latestOutcome = activity.outcome;
      const duration = activity.duration;
      
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {attempts} contact attempt{attempts > 1 ? 's' : ''}
            </span>
            {latestOutcome && (
              <Badge variant="outline" className="text-xs">
                Latest: {latestOutcome.toLowerCase().replace('_', ' ')}
              </Badge>
            )}
          </div>
          {duration > 0 && (
            <div className="text-xs text-muted-foreground">
              Total duration: {Math.floor(duration / 60)}m {duration % 60}s
            </div>
          )}
        </div>
      );
    }

    if (activity.type === "CONTACTED") {
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Contact established</span>
            {activity.outcome && (
              <Badge variant="default" className="text-xs">
                <span className="capitalize">{activity.outcome.toLowerCase().replace('_', ' ')}</span>
              </Badge>
            )}
          </div>
          {activity.duration > 0 && (
            <div className="text-xs text-muted-foreground">
              Duration: {Math.floor(activity.duration / 60)}m {activity.duration % 60}s
            </div>
          )}
          {activity.content && activity.content !== `Contact established - ${activity.outcome}` && (
            <div className="text-xs text-muted-foreground">
              {activity.content}
            </div>
          )}
        </div>
      );
    }

    // For other activity types (NOTE, EMAIL, MEETING, etc.)
    return (
      <div className="space-y-1">
        <span className="text-sm">{activity.content || activity.outcome}</span>
        {activity.duration > 0 && (
          <div className="text-xs text-muted-foreground">
            Duration: {Math.floor(activity.duration / 60)}m {activity.duration % 60}s
          </div>
        )}
      </div>
    );
  };

  const getTimeDisplay = (activity) => {
    // For CONTACT_ATTEMPTS, show the most recent update time
    if (activity.type === "CONTACT_ATTEMPTS") {
      const updateTime = activity.updatedAt || activity.createdAt;
      return formatDistanceToNow(new Date(updateTime), { addSuffix: true });
    }
    
    // For other activities, show creation time
    const activityTime = activity.timestamp || activity.createdAt;
    return formatDistanceToNow(new Date(activityTime), { addSuffix: true });
  };

  return (
    <TableRow>
      <TableCell colSpan={7} className="p-0">
        <div className="bg-muted/30 p-4">
          <h4 className="font-semibold mb-3 text-sm">Lead Activities</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : activities.length > 0 ? (
              activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex gap-3 bg-background rounded-lg border p-3 items-start"
                >
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant={getActivityBadgeVariant(activity.type)} 
                            className="text-xs"
                          >
                            {activity.type.replace('_', ' ')}
                          </Badge>
                          {activity.createdUser && (
                            <span className="text-xs text-muted-foreground">
                              by {activity.createdUser.firstname} {activity.createdUser.lastname}
                            </span>
                          )}
                        </div>
                        {formatActivityContent(activity)}
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {getTimeDisplay(activity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No activities yet</p>
            )}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}