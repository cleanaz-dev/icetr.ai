"use client";

import React, { useState, useEffect } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/ui/timeline";
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
        return "outline";
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

  const formatActivityTitle = (activity) => {
    if (activity.type === "CONTACT_ATTEMPTS") {
      const attempts = activity.callAttemptCount || 1;
      return `${attempts} Contact Attempt${attempts > 1 ? 's' : ''}`;
    }

    if (activity.type === "CONTACTED") {
      return "Contact Established";
    }

    return activity.type.replace('_', ' ');
  };

  const formatActivityContent = (activity) => {
    if (activity.type === "CONTACT_ATTEMPTS") {
      const latestOutcome = activity.outcome;
      const duration = activity.duration;
      
      return (
        <div className="space-y-2">
          {latestOutcome && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Latest outcome:</span>
              <Badge variant="secondary" className="text-xs capitalize">
                {latestOutcome.toLowerCase().replace('_', ' ')}
              </Badge>
            </div>
          )}
          {duration > 0 && (
            <div className="text-sm text-muted-foreground">
              Total duration: {Math.floor(duration / 60)}m {duration % 60}s
            </div>
          )}
        </div>
      );
    }

    if (activity.type === "CONTACTED") {
      return (
        <div className="space-y-2">
          {activity.outcome && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Outcome:</span>
              <Badge variant="default" className="text-xs">
                <span className="capitalize">{activity.outcome.toLowerCase().replace('_', ' ')}</span>
              </Badge>
            </div>
          )}
          {activity.duration > 0 && (
            <div className="text-sm text-muted-foreground">
              Duration: {Math.floor(activity.duration / 60)}m {activity.duration % 60}s
            </div>
          )}
          {activity.content && activity.content !== `Contact established - ${activity.outcome}` && (
            <div className="text-sm text-muted-foreground">
              {activity.content}
            </div>
          )}
        </div>
      );
    }

    // For other activity types (NOTE, EMAIL, MEETING, etc.)
    return (
      <div className="space-y-2">
        {activity.content && (
          <div className="text-sm">{activity.content}</div>
        )}
        {activity.outcome && activity.outcome !== activity.content && (
          <div className="text-sm text-muted-foreground">{activity.outcome}</div>
        )}
        {activity.duration > 0 && (
          <div className="text-sm text-muted-foreground">
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
          <h4 className="font-semibold mb-4 text-sm">Lead Activities</h4>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : activities.length > 0 ? (
              <Timeline>
                {activities.map((activity, index) => (
                  <TimelineItem key={activity.id} step={index + 1}>
                    <TimelineHeader>
                      <TimelineSeparator />
                      <TimelineDate>{getTimeDisplay(activity)}</TimelineDate>
                      <TimelineTitle className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        <span>{formatActivityTitle(activity)}</span>
                        <Badge 
                          variant={getActivityBadgeVariant(activity.type)} 
                          className="text-xs ml-2"
                        >
                          {activity.type.replace('_', ' ')}
                        </Badge>
                      </TimelineTitle>
                      <TimelineIndicator />
                    </TimelineHeader>
                    <TimelineContent>
                      <div className="space-y-2">
                        {formatActivityContent(activity)}
                        {activity.createdUser && (
                          <div className="text-xs text-muted-foreground">
                            Created by {activity.createdUser.firstname} {activity.createdUser.lastname}
                          </div>
                        )}
                      </div>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            ) : (
              <p className="text-muted-foreground text-sm">No activities yet</p>
            )}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}