import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send } from "lucide-react";
import { useEffect } from "react";
import { useCoreContext } from "@/context/CoreProvider";
import { useTeamContext } from "@/context/TeamProvider";

export default function CreateBroadcastDialog({
  isOpen,
  onClose,
  onSend,
  teams = [],
  selectedTeam,
  setSelectedTeam,
}) {
  const { orgId } = useTeamContext();
  const [broadcast, setBroadcast] = useState({
    title: "",
    message: "",
    type: "general",
    targetTeams: [selectedTeam || "all"],
  });

  const resetForm = () => {
    setBroadcast({
      title: "",
      message: "",
      type: "general",
      targetTeams: [selectedTeam || "all"],
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
    setSelectedTeam(null);
  };

  const handleSend = async () => {
    if (broadcast.title && broadcast.message) {
      // If "all" is selected, send to all available teams
      const finalBroadcast = {
        ...broadcast,
        targetTeams:
          broadcast.targetTeams[0] === "all"
            ? teams.map((team) => team.id)
            : broadcast.targetTeams,
      };


      await onSend(finalBroadcast);
      resetForm();
      onClose?.();
    }
  };

  const broadcastTypes = [
    { value: "general", label: "General Update" },
    { value: "announcement", label: "Announcement" },
    { value: "training", label: "Training" },
    { value: "system", label: "System Alert" },
    { value: "alert", label: "Important Alert" },
  ];

  // Always include "All Teams" option at the beginning
  const teamOptions = [{ id: "all", name: "All Teams" }, ...teams];

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Create Team Broadcast
          </AlertDialogTitle>
          <AlertDialogDescription>
            Send announcements, updates, and alerts to your teams
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={broadcast.title}
              onChange={(e) =>
                setBroadcast({ ...broadcast, title: e.target.value })
              }
              placeholder="Enter broadcast title..."
            />
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={broadcast.message}
              onChange={(e) =>
                setBroadcast({ ...broadcast, message: e.target.value })
              }
              placeholder="Enter your message..."
              rows={4}
            />
          </div>

          {/* Type Selection */}
          <div className="space-y-2">
            <Label>Message Type</Label>
            <Select
              value={broadcast.type}
              onValueChange={(value) =>
                setBroadcast({ ...broadcast, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select message type" />
              </SelectTrigger>
              <SelectContent>
                {broadcastTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Teams */}
          <div className="space-y-2">
            <Label>Send To</Label>
            <Select
              value={selectedTeam || "all"}
              onValueChange={(value) =>
                setSelectedTeam(value === "all" ? null : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select target team" />
              </SelectTrigger>
              <SelectContent>
                {teamOptions.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={handleSend}
              disabled={!broadcast.title || !broadcast.message}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Broadcast
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
