"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MinusCircle } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { Target } from "lucide-react";
import { Loader2 } from "lucide-react";
import { ChevronRightCircle } from "lucide-react";

export default function UnassignCampaignDialog({
  onSuccess,
  teamId,
  campaign,
  orgId,
  handleUnassign,
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use the handleUnassign function from the provider
      await handleUnassign(teamId, campaign.id, orgId);

      // Call onSuccess callback if provided
      if (typeof onSuccess === "function") {
        onSuccess();
      }

      setOpen(false);
    } catch (error) {
      // Error handling is done in the provider
      console.error("Failed to unassign campaign:", error);
      toast.error(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="warn">
          <MinusCircle className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl -mb-2">
            <span>Unassign Campaign</span>
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to unassign this campaign?
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 mb-4">
            <Label>Selected Campaign:</Label>
            <p className="ml-1 text-lg font-medium flex items-center gap-2">
              <ChevronRightCircle className="text-amber-400 size-4" />
              {campaign.name}
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 mb-4">
            <div className="flex gap-2 items-center text-amber-500">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm">
                This action will also unassign all associated leads
              </p>
            </div>
          </div>

          <div className="flex flex-row gap-4 mt-4 justify-end">
            <Button
              type="button"
              className="w-1/4"
              onClick={() => setOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-1/4"
              disabled={isLoading}
              variant="warn"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting
                </span>
              ) : (
                "Confirm"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
