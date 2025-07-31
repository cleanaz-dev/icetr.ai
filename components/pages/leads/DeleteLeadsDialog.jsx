import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function DeleteLeadsDialog({ lead, onDelete, isOpen, onClose, orgId }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(lead.id,orgId);
      onClose();
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Lead</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the lead.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4">
          <p className="text-sm text-gray-700 mb-3">
            Are you sure you want to delete this lead?
          </p>
          <div className="bg-gray-50 p-3 rounded border">
            <div className="text-sm">
              <div className="font-medium">{lead?.company || "No company"}</div>
              <div className="text-gray-600">{lead?.phoneNumber}</div>
              {lead?.assignedTo && (
                <div className="text-gray-600">
                  Assigned to: {lead.assignedTo.name}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Lead
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
