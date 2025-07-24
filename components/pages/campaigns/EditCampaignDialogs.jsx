import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Info } from "lucide-react";

// Assignment strategy options
const ASSIGNMENT_STRATEGIES = [
  {
    value: "ROUND_ROBIN",
    label: "Round Robin",
    description:
      "Assigns leads to agents in a rotating order to ensure equal distribution.",
  },
  {
    value: "LEAST_LOADED",
    label: "Least Loaded",
    description:
      "Assigns leads to the agent with the fewest active assignments.",
  },
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

export default function EditCampaignDialog({
  campaign,
  open,
  onOpenChange,
  onSuccess,
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);

  // Update form fields when campaign changes
  useEffect(() => {
    if (campaign) {
      setName(campaign.name || "");
      setType(campaign.assignmentStrategy || "");
    }
  }, [campaign]);

  const handleSubmit = async () => {
    if (!campaign) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          type: type,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update campaign");
      }

      onOpenChange(false);
      if (typeof onSuccess === "function") {
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating campaign:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Campaign - {campaign?.name}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Campaign Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter campaign name"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="type">Lead Assignment Strategy</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select assignment strategy" />
              </SelectTrigger>
              <SelectContent>
                {ASSIGNMENT_STRATEGIES.map((strategy) => (
                  <SelectItem key={strategy.value} value={strategy.value}>
                    {strategy.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {type && (
              <div className="p-2 bg-muted/50 rounded-md">
                <p className="text-sm text-muted-foreground">
                  {
                    ASSIGNMENT_STRATEGIES.find((s) => s.value === type)
                      ?.description
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
