import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export default function DeletePendingUserDialog({ invitee, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const toastId = toast.loading("Deleting invitation...");
    
    try {
      const response = await fetch(`/api/invite/${invitee.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        toast.error('Failed to delete invitation');
      }

      toast.success("Invitation deleted successfully", { id: toastId });
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Invitation</DialogTitle>
          <DialogDescription>
            This will permanently remove the invitation for {invitee.email}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="p-4 border rounded-md bg-muted">
            <p className="font-medium">{invitee.email}</p>
            <div className="flex gap-2 text-sm text-muted-foreground mt-1">
              <span>
                Invited: {new Date(invitee.createdAt).toLocaleDateString()}
              </span>
              <span>•</span>
              <span className="capitalize">{invitee.status}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                
                Deleting...
              </>
            ) : (
              <>
               
                Delete Invitation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
