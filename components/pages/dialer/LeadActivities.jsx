"use client";

import React, { useState, useEffect } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

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

  return (
    <TableRow>
      <TableCell colSpan={6} className="p-0">
        <div className="bg-muted/30 p-4">
          <h4 className="font-semibold mb-3 text-sm">Lead Activities</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : activities.length > 0 ? (
              activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex gap-3 bg-background rounded-lg border p-3 items-center"
                >
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center gap-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          {activity.type}
                        </Badge>
                        <span className="text-sm">{activity.content || activity.outcome}</span>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatDistanceToNow(
                          new Date(activity.timestamp || activity.createdAt),
                          { addSuffix: true }
                        )}
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
