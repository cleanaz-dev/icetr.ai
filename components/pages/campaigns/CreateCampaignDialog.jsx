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
import { useRouter } from "next/navigation";
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

export default function CreateCampaignDialog({ onSuccess }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);


  const handleSubmit = async () => {
    if (!name.trim()) return;

    setLoading(true);

    try {
      const response = await fetch("/api/campaigns/add-campaign", {
        method: "POST",
        body: JSON.stringify({ name, type }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        toast.error("Failed to create campaign. Please try again.");
        return;
      }

      toast.success("Campaign created successfully!");
      setName("");
      setOpen(false);
         // 🔁 Refresh parent page
      if (typeof onSuccess === "function") {
        onSuccess();
      }
    } catch (err) {
      console.error("Failed to create campaign:", err);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <PlusCircle /> Add Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle><span className="text-primary">Create Campaign</span></DialogTitle>
          <DialogDescription>
            Enter information to create dialog
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

        <div className="mt-4 space-y-2">
          <Label htmlFor="campaignType">Campaign Type</Label>
          <Select value={type} onValueChange={(value) => setType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="emails">Emails</SelectItem>
                <SelectItem value="calls">Calls</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={handleSubmit}>
            {loading ? "Creating..." : "Create"}
          </Button>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
