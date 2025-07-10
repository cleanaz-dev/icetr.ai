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

export default function CreateTeamDialog({ onSuccess, userId }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [teamType, setTeamType] = useState("sales");
  const [userType, setUserType] = useState("manager")
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Team name is required");
      return;
    }
    setLoading(true);
    try {
      // Replace with your actual API call
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          teamType: teamType,
          userId: userId,
          userType: userType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create team");
      }
      const result = await response.json();

      if (typeof onSuccess === "function") {
        onSuccess()
      }
      toast.success(result.message);
    } catch (error) {
      console.error(error);
      toast.error("Error creating team, please try again.");
    } finally {
      setLoading(false);
      setOpen(false);
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
          <DialogTitle>
            <span className="text-primary">Create Team</span>
          </DialogTitle>
          <DialogDescription>
            Enter information to create dialog
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
          <Label htmlFor="teamType">Team Type</Label>
          <Select
            id="teamType"
            value={teamType}
            onValueChange={(value) => setTeamType(value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="userType">Add Self to Team?</Label>
          <Select
            id="userType"
            value={userType}
            onValueChange={(value) => setUserType(value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
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
