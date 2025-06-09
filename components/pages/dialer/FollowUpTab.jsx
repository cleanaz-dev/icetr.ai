"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Phone, User, Calendar } from "lucide-react";
import { format, isToday, isPast, isThisWeek } from "date-fns";
import { MdConnectWithoutContact } from "react-icons/md";
import { Loader2 } from "lucide-react";
import { Mail } from "lucide-react";
import { Check } from "lucide-react";
import Link from "next/link";
import { Voicemail } from "lucide-react";

export default function FollowUpTab({ onLeadSelect }) {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'today', 'overdue', 'week'
  console.log("followups", followUps);

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/leads/followups");
      if (response.ok) {
        const data = await response.json();
        setFollowUps(data.followUps);
      }
    } catch (error) {
      console.error("Error fetching follow-ups:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsCompleted = async (followUpId) => {
    try {
      const response = await fetch(`/api/followups/${followUpId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });

      if (response.ok) {
        setFollowUps((prev) => prev.filter((f) => f.id !== followUpId));
      }
    } catch (error) {
      console.error("Error marking follow-up as completed:", error);
    }
  };

  const handleCallLead = (lead) => {
    onLeadSelect(lead);
  };

  const getFilteredFollowUps = () => {
    return followUps.filter((followUp) => {
      const dueDate = new Date(followUp.dueDate);

      switch (filter) {
        case "today":
          return isToday(dueDate) && !followUp.completed;
        case "overdue":
          return isPast(dueDate) && !isToday(dueDate) && !followUp.completed;
        case "week":
          return isThisWeek(dueDate) && !followUp.completed;
        default:
          return !followUp.completed;
      }
    });
  };

  const getFollowUpBadge = (dueDate) => {
    const date = new Date(dueDate);

    if (isPast(date) && !isToday(date)) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    if (isToday(date)) {
      return <Badge variant="default">Today</Badge>;
    }
    return <Badge variant="secondary">Upcoming</Badge>;
  };

  const filteredFollowUps = getFilteredFollowUps();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="animate-spin mb-4">
          <Loader2 className="text-primary size-6" />
        </div>
        <p className="text-sm text-muted-foreground">Loading follow-ups...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-medium mb-1">Follow-ups</h2>

        {/* Filter select */}
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full mb-4">
            <SelectValue placeholder="Filter follow-ups" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              All ({followUps.filter((f) => !f.completed).length})
            </SelectItem>
            <SelectItem value="today">
              Today (
              {
                followUps.filter(
                  (f) => isToday(new Date(f.dueDate)) && !f.completed
                ).length
              }
              )
            </SelectItem>
            <SelectItem value="overdue">
              Overdue (
              {
                followUps.filter(
                  (f) =>
                    isPast(new Date(f.dueDate)) &&
                    !isToday(new Date(f.dueDate)) &&
                    !f.completed
                ).length
              }
              )
            </SelectItem>
            <SelectItem value="week">
              This Week (
              {
                followUps.filter(
                  (f) => isThisWeek(new Date(f.dueDate)) && !f.completed
                ).length
              }
              )
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Follow-up list */}
      <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
        {filteredFollowUps.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              <MdConnectWithoutContact className="mx-auto h-12 w-12 mb-2 text-gray-300" />
              <p>
                No follow-ups for <span className="uppercase">{filter}</span>
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredFollowUps.map((followUp) => (
            <Card key={followUp.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-semibold text-foreground">
                    {followUp.lead.name}
                  </CardTitle>
                  {getFollowUpBadge(followUp.dueDate)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Lead info */}
                  <div className="text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 text-gray-400" />
                      <p>{followUp.lead.email}</p>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground mt-2">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      <p>{followUp.lead.phoneNumber}</p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-muted my-2"></div>

                  {/* Follow-up details */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      <span>
                        Due:{" "}
                        {format(new Date(followUp.dueDate), "MMM dd, h:mm a")}
                      </span>
                    </div>

                    {followUp.recordingUrl && (
                      <Button asChild size="sm" variant="muted">
                        <Link
                          href={followUp.recordingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Voicemail className="mr-1" /> Play
                        </Link>
                      </Button>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 bg-muted px-2.5 py-1.5 rounded-md inline-block">
                    Reason:{" "}
                    <span className="font-medium text-muted-foreground capitalize">
                      {followUp.reason.replace("_", " ")}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-3">
                    <Button
                      size="sm"
                      onClick={() => handleCallLead(followUp.lead)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Phone className="h-3.5 w-3.5 mr-1.5" />
                      Call Now
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markAsCompleted(followUp.id)}
                    >
                      <Check className="h-3.5 w-3.5 mr-1.5" />
                      Done
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
