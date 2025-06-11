"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CALL_OUTCOMES } from "@/lib/constants/frontend";
import LeadActivities from "./LeadActivities";

export default function PostCallDialog({
  open,
  onOpenChange,
  currentCallData,
  callOutcome,
  onCallOutcomeChange,
  callNotes,
  onCallNotesChange,
  formatDuration,
  followUpTime,
  onSave,
  isSaving = false,
}) {

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Call Summary</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">ID:</span>
              <span className="text-sm">
                  {currentCallData?.leadActivityId}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Call Outcome</Label>
            <Select value={callOutcome} onValueChange={onCallOutcomeChange}>
              <SelectTrigger>
                <SelectValue placeholder="How did the call go?" />
              </SelectTrigger>
              <SelectContent>
                {CALL_OUTCOMES.map((outcome) => {
                  const Icon = outcome.icon;
                  return (
                    <SelectItem key={outcome.value} value={outcome.value}>
                      <div
                        className={cn("flex items-center gap-2", outcome.color)}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{outcome.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {(callOutcome === "busy" || callOutcome === "scheduled_callback") && (
            <div className="space-y-2">
              <Label>Follow Up</Label>
              <Select onValueChange={followUpTime}>
                <SelectTrigger>
                  <SelectValue placeholder="When to follow up?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1_hour">In 1 hour</SelectItem>
                  <SelectItem value="2_hours">In 2 hours</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="3_days">In 3 days</SelectItem>
                  <SelectItem value="1_week">In 1 week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Call Notes</Label>
            <Textarea
              value={callNotes}
              onChange={(e) => onCallNotesChange(e.target.value)}
              placeholder="Any notes about this call..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                onCallOutcomeChange("");
                onCallNotesChange("");
              }}
            >
              Skip
            </Button>
            <Button onClick={onSave} disabled={!callOutcome || isSaving}>
              {isSaving ? "Saving..." : "Save & Continue"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
