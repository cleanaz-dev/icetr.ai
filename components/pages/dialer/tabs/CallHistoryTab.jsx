"use client"
import React from "react";
import { History, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function CallHistoryTab({
  sessionCalls,
  onRedial,
  formatDuration,
}) {
  if (sessionCalls.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No calls in this session yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessionCalls.map((callRecord) => {
        const OutcomeIcon = callRecord.outcomeConfig?.icon || Phone;
        const outcomeColor =
          callRecord.outcomeConfig?.color || "text-gray-500";

        return (
          <Card key={callRecord.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="font-medium">{callRecord.leadName}</div>
                <div className="text-sm text-muted-foreground">
                  {callRecord.phoneNumber}
                </div>
              </div>
              {callRecord.status === "ongoing" ? (
                <Badge variant="default">Ongoing</Badge>
              ) : callRecord.outcome ? (
                <div className={cn("flex items-center gap-1", outcomeColor)}>
                  <OutcomeIcon className="w-4 h-4" />
                  <span className="text-sm">
                    {callRecord.outcomeConfig?.label}
                  </span>
                </div>
              ) : (
                <Badge variant="secondary">No outcome</Badge>
              )}
            </div>

            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>
                {new Date(callRecord.startTime).toLocaleTimeString()}
              </span>
              {callRecord.duration !== undefined && (
                <span>Duration: {formatDuration(callRecord.duration)}</span>
              )}
            </div>

            {callRecord.notes && (
              <div className="mt-2 p-2 bg-muted rounded text-sm">
                {callRecord.notes}
              </div>
            )}

            {callRecord.status !== "ongoing" && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => onRedial(callRecord.phoneNumber)}
              >
                <Phone className="w-3 h-3 mr-1" />
                Redial
              </Button>
            )}
          </Card>
        );
      })}
    </div>
  );
}