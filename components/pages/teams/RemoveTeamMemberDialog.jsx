import { useTeamContext } from "@/context/TeamProvider";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, UserMinus } from "lucide-react";
import { toast } from "sonner";

export default function RemoveTeamMemberDialog({
  member,
  teamId,

  memberId,
  onRemoveMember,
}) {
  const { orgId, refreshTeams } = useTeamContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


const handleSubmit = async () => {
  setIsLoading(true);

  try {
    // Add 'await' to wait for the async function to complete
    await onRemoveMember(orgId, teamId, memberId);
    toast.success(`Member has been removed from the team`);
    setIsOpen(false);

  } catch (error) {
    console.error("Error removing team member:", error);
    toast.error(error.message || "Failed to remove team member");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="menu"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:scale-125 duration-300"
        >
          <UserMinus className="h-4 w-4 mr-1" />
      
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Remove Team Member
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to remove{" "}
            <span className="font-medium">{member?.email || "Member"}</span>{" "}
            from the team? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Removing..." : "Remove Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
