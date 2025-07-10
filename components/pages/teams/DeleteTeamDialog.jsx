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
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

export default function DeleteTeamDialog({ onSuccess, team }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/teams/${team.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const { message } = await response.json();

      if (!response.ok) {
        // Show error toast with message from API
        toast.error(message || "Failed to delete team");
        return;
      }

      // Show success toast
      toast.success(message || "Team deleted successfully!");

      // Call success callback
      if (typeof onSuccess === "function") {
        onSuccess();
      }

      // // Close dialog
      // setOpen(false);
    } catch (error) {
      console.error("Error deleting team:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="destructive">
          <Trash2 />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2 decoration-rose-500 underline ">
              <Trash2 className="size-4 text-rose-500" />
              Delete Team
            </span>
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <span className="font-bold text-foreground">{team.name}</span>? 
          </DialogDescription>
        </DialogHeader>
        <div className="decoration-rose-500 underline flex gap-2 items-center text-sm wrap-normal">
         <AlertCircle className="size-4"/> Campaigns, leads and members will be unassigned!
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Team"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
