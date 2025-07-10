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

export default function UnassignCampaignDialog({
  onSuccess,
  teamId,
  campaign,
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await fetch(`/api/teams/${teamId}/unassign-campaign`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignId: campaign.id,
        }),
      });

      if (!result.ok) {
        const { message } = await result.json();
        toast.error(message || "Failed to unassign campaign");
        return;
      }
      const { message } = await result.json();
      toast.success(message);

      if (typeof onSuccess === "function") {
        onSuccess();
      }

      setOpen(false);
    } catch (error) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="warn">
          <MinusCircle className="" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl -mb-2">
            <span className="decoration-1.5 underline decoration-amber-500">
              Unassign Campaign
            </span>
            <MinusCircle className="w-5 h-5 text-amber-500" />
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to unassign this campaign?{" "}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col sm:flex-row gap-2">
            <Label>Selected Campaign:</Label>
            <p className="flex items-center gap-1 rounded-2xl text-xl">{campaign.name}</p>
          </div>
          <div className="flex gap-1 items-center mt-2 text-xs underline decoration-1 decoration-amber-500">
            <AlertCircle className="size-4 " />
            <p>This action will also unassign leads</p>
          </div>
          <div className="flex flex-row gap-4 mt-4 justify-end">
            <Button
              type="button"
              className="w-1/4"
              onClick={() => setOpen(false)}
              variant="ghost"
            >
              Close
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="w-1/4"
              disabled={isLoading}
              variant="warn"
            >
              {isLoading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
