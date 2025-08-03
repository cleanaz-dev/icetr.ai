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
import { Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function EditTeamDialog({ onEdit, team, orgId }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [teamName, setTeamName] = useState(team?.name || "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await onEdit(team.id, { teamName }, orgId);
      toast.success(result.message || "Team updated successfully!");
      setOpen(false);
    } catch (error) {
      toast.error(error.message || "Failed to update team");
    } finally {
      setLoading(false);
    }
  };
  const handleClose = () => {
    setOpen(false);
    // Reset form to original values
    setTeamName(team.name);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="actionGreen">
          <Edit />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2">
              {" "}
              <Edit className="size-4" />
              Edit Team
            </span>
          </DialogTitle>
          <DialogDescription>
            Update the team name and save your changes.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="team-name">Team Name</Label>
            <Input
              id="team-name"
              name="team-name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Team"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
