"use client";

import React, { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Mail, User, Shield, Crown, Users } from "lucide-react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export default function AssignCampaignDialog({ onSuccess, teamId, campaigns }) {
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const unassignedCampaigns = campaigns.filter(
    (campaign) => campaign.teamId === null
  );

  const handleClose = () => {
    setOpen(false);
    setSelectedCampaign("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await fetch(`/api/teams/${teamId}/assign-campaign`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignId: selectedCampaign,
        }),
      });

      if (!result.ok) {
        const { message } = await result.json();
        toast.error(message || "Failed to assign campaign");
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
        <Button size="sm">
          <Plus /> Assign Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex gap-2 items-center">
              <Plus className="size-4 text-primary" /> Assign Campaign
              
            </div>
          </DialogTitle>
          <DialogDescription className="-mt-2">
            Assign a new campaign for your team!
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label>Please Select Campaign</Label>
            <Select
              value={selectedCampaign}
              onValueChange={setSelectedCampaign}
            >
              <SelectTrigger id="campaign-select">
                <SelectValue placeholder="Choose a campaign..." />
              </SelectTrigger>
              <SelectContent>
                {unassignedCampaigns.length > 0 ? (
                  unassignedCampaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    No unassigned campaigns available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-row gap-4 mt-4 justify-end">
            <Button
              type="button"
              className="w-1/4"
              onClick={handleClose}
              variant="ghost"
            >
              Close
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="w-1/4"
              disabled={!selectedCampaign || isLoading}
            >
              {isLoading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
