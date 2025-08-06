"use client"
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function DeleteCampaignDialog({ campaign, open, onOpenChange, onSuccess, orgId, setCampaigns }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!campaign) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/org/${orgId}/campaigns/${campaign.id}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        throw new Error("Failed to delete campaign");
      }
      
     
      if (typeof onSuccess === "function") {
        onSuccess(campaign.id);
      }
      // setCampaigns(result.campaigns)
       onOpenChange(false);
      toast.success("Campaign deleted successfully!");
    } catch (error) {
      console.error("Error deleting campaign:", error);
      toast.error("Failed to delete campaign. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Campaign
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {campaign?.name ? `"${campaign.name}"` : "this campaign"}? 
          </DialogDescription>
        </DialogHeader>
        <p className='text-sm'>
          This action cannot be undone and will permanently remove the campaign and all associated data.
        </p>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Campaign"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}