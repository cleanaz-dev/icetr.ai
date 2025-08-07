"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { TierLimitBanner } from "@/components/tier/TierLimitBanner";
import { useTeamContext } from "@/context/TeamProvider";

// Assignment strategy options
const ASSIGNMENT_STRATEGIES = [
  {
    value: "ROUND_ROBIN",
    label: "Round Robin",
    description:
      "Assigns leads to agents in a rotating order to ensure equal distribution.",
  },
  // {
  //   value: "LEAST_LOADED",
  //   label: "Least Loaded",
  //   description:
  //     "Assigns leads to the agent with the fewest active assignments.",
  // },
  {
    value: "ROLE_BASED",
    label: "Role Based",
    description: "Assigns leads based on agent roles and specializations.",
  },
  {
    value: "MANUAL",
    label: "Manual",
    description: "Requires manual assignment of leads to specific agents.",
  },
];

export default function CreateCampaignDialog({ onSuccess, open, setOpen }) {
  const { orgId, teams } = useTeamContext();
  const [name, setName] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(teams[0]?.id);
  const [campaigntype, setCampaignType] = useState("");
  const [assignmentType, setAssignmentType] = useState("MANUAL");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/org/${orgId}/campaigns/add-campaign`, {
        method: "POST",
        body: JSON.stringify({
          name,
          campaignType: campaigntype,
          assignmentStrategy: assignmentType,
          selectedTeamId: selectedTeam,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        toast.error("Failed to create campaign. Please try again.");
        return;
      }

      const result = await response.json();

      onSuccess(result);

      toast.success("Campaign created successfully!");
      setName("");
      setCampaignType("");
      setAssignmentType("MANUAL");
      setOpen(false);
    } catch (err) {
      console.error("Failed to create campaign:", err);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="min-w-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Campaign</DialogTitle>
          <DialogDescription>
            Enter information to create campaign
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-2">
          <Label htmlFor="campaignName">Campaign Name</Label>
          <Input
            id="campaignName"
            placeholder="Enter campaign name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="on"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="campaignType">Campaign Type</Label>
            <Select
              value={campaigntype}
              onValueChange={(value) => setCampaignType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="CALLS">Calls</SelectItem>
                  <SelectItem value="FORMS">Forms</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignmentType">Lead Assignment Strategy</Label>
            <Select
              value={assignmentType}
              onValueChange={(value) => setAssignmentType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {ASSIGNMENT_STRATEGIES.map((strategy) => (
                    <SelectItem key={strategy.value} value={strategy.value}>
                      {strategy.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="team">Assign to Team</Label>
          <Select
            value={selectedTeam}
            onValueChange={(value) => setSelectedTeam(value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {assignmentType && (
          <div className="p-2 bg-muted/50 rounded-md">
            <p className="text-sm text-muted-foreground">
              {
                ASSIGNMENT_STRATEGIES.find((s) => s.value === assignmentType)
                  ?.description
              }
            </p>
          </div>
        )}

        <TierLimitBanner check="campaigns" />

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={!name || !campaigntype || !assignmentType}
          >
            {loading ? "Creating..." : "Create Campaign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
