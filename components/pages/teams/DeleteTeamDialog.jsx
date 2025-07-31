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
import { Trash2,  AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";



export default function DeleteTeamDialog({ onDelete, team, orgId }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);


 const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await onDelete(team.id, orgId);
      toast.success(result.message || "Team deleted successfully!");
      setOpen(false);
    } catch (error) {
      toast.error(error.message || "Failed to delete team");
    } finally {
      setLoading(false);
    }
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
          <Button type="button" variant="outline" onClick={setOpen}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Team"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
