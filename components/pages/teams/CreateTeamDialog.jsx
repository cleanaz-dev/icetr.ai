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
import { PlusCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function CreateTeamDialog({ orgId, onCreate }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [addSelf, setAddSelf] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Team name is required");
      return;
    }

    setLoading(true);
    const teamData = { name, addSelf };
    

    try {
      const result = await onCreate(teamData, orgId);

      toast.success(result.message);

      // Reset form
      setName("");
      setAddSelf(false);
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error creating team, please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <PlusCircle /> Create Team
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Team</DialogTitle>
          <DialogDescription>
            Enter information to create new team
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-2">
          <Label htmlFor="teamName">Team Name</Label>
          <Input
            id="teamName"
            placeholder="Enter team name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="on"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="userType">Add Self to Team?</Label>
          <Switch
            id="add-self"
            checked={addSelf}
            onCheckedChange={setAddSelf}
          />
        </div>
        <p className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-md border">
          <Info className="h-4 w-4" />
          {addSelf ? 
            "Added to team as Team Manager"
          : 
            "Cannot assign leads until members are added"
          }
        </p>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>
            {loading ? "Creating..." : "Create Team"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
