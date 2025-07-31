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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export default function AssignCampaignDialog({
  onSuccess,
  teamId,
  campaigns = [],
  orgId,
  handleAssign,
}) {
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // console.log("campaigns", campaigns);

  // Safely filter unassigned campaigns
  const unassignedCampaigns = campaigns.filter(
    (campaign) => campaign.teamId === null
  );

  const handleClose = () => {
    setOpen(false);
    setSelectedCampaign("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCampaign) return;

    setIsLoading(true);
    try {
      await handleAssign(teamId, selectedCampaign, orgId);

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
          <Plus className="mr-2 h-4 w-4" /> Assign Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Assign Campaign
          </DialogTitle>
          <DialogDescription>
            Assign a new campaign to your team
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="campaign">Select Campaign</Label>
              <Select
                value={selectedCampaign}
                onValueChange={setSelectedCampaign}
                disabled={unassignedCampaigns.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      unassignedCampaigns.length === 0
                        ? "No available campaigns"
                        : "Select a campaign"
                    }
                  />
                </SelectTrigger>
                {unassignedCampaigns.length > 0 && (
                  <SelectContent>
                    {unassignedCampaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                )}
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !selectedCampaign ||
                  isLoading ||
                  unassignedCampaigns.length === 0
                }
              >
                {isLoading ? "Assigning..." : "Assign Campaign"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
