"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function CampaignStatusDialog({ 
  campaign, 
  open, 
  onOpenChange, 
  status,
  onSuccess 
}) {
  const [isLoading, setIsLoading] = useState(false);

  // Get action labels based on the new status
  const getActionLabels = (newStatus) => {
    switch(newStatus) {
      case "Active":
        return {
          action: "start",
          actionLabel: currentStatus === "Paused" ? "Resume" : "Start",
          loadingLabel: currentStatus === "Paused" ? "Resuming..." : "Starting...",
          successMessage: currentStatus === "Paused" ? "resumed" : "started"
        };
      case "Paused":
        return {
          action: "pause",
          actionLabel: "Pause",
          loadingLabel: "Pausing...",
          successMessage: "paused"
        };
      // Add more cases if you have other statuses
      default:
        return {
          action: "update",
          actionLabel: "Update",
          loadingLabel: "Updating...",
          successMessage: "updated"
        };
    }
  };

  const currentStatus = campaign?.status;
  const { action, actionLabel, loadingLabel, successMessage } = getActionLabels(status);

const handleStatusUpdate = async () => {
  setIsLoading(true);
  try {
    const response = await fetch(`/api/org/${orgId}/campaigns/${campaign.id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) throw new Error("Failed to update campaign status");

    toast.success(`Campaign "${campaign.name}" has been ${successMessage}`);
    
    onOpenChange(false);
    
    // Wait a bit for dialog to close before revalidating
    setTimeout(() => {
      onSuccess();
    }, 100);
    
  } catch (error) {
    toast.error(error?.message || "Failed to update campaign status. Please try again.");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg">{actionLabel} Campaign</DialogTitle>
          <DialogDescription className="mt-2">
            Are you sure you want to {action} the campaign{" "}
            <span className="font-semibold text-foreground">{campaign?.name}</span>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant={status === "Active" ? "default" : "secondary"}
            onClick={handleStatusUpdate}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {loadingLabel}
              </>
            ) : (
              `${actionLabel} Campaign`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}