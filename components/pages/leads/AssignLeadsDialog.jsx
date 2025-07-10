"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { LeadAssignmentComponent } from "./LeadAssignmentComponent";

export default function AssignLeadsDialog({
  leads,
  members,
  team,
  onAssignComplete,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  // Reset selections when dialog closes
  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (!open) {
      setSelectedLeadIds([]);
      setSelectedUserId("");
    }
  };

  // Handle individual lead selection
  const handleLeadToggle = (leadId, checked) => {
    if (checked) {
      setSelectedLeadIds((prev) => [...prev, leadId]);
    } else {
      setSelectedLeadIds((prev) => prev.filter((id) => id !== leadId));
    }
  };

  // Handle select all/none
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedLeadIds(leads.map((lead) => lead.id));
    } else {
      setSelectedLeadIds([]);
    }
  };

  const handleAssign = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user to assign leads to");
      return;
    }

    if (selectedLeadIds.length === 0) {
      toast.error("Please select at least one lead to assign");
      return;
    }

    setIsAssigning(true);

    try {
      const response = await fetch("/api/leads/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadIds: selectedLeadIds,
          assignedUserId: selectedUserId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`Successfully assigned ${selectedLeadIds.length} leads`);
        setIsOpen(false);
        onAssignComplete?.(result);
      } else {
        toast.error(result.error || "Failed to assign leads");
      }
    } catch (error) {
      console.error("Assignment error:", error);
      toast.error("Failed to assign leads");
    } finally {
      setIsAssigning(false);
    }
  };

  const selectedUser = members?.find((member) => member.id === selectedUserId);
  const selectedLeads = leads.filter((lead) =>
    selectedLeadIds.includes(lead.id)
  );
  const allSelected =
    selectedLeadIds.length === leads.length && leads.length > 0;
  const someSelected =
    selectedLeadIds.length > 0 && selectedLeadIds.length < leads.length;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Assign Leads
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Assign Leads</DialogTitle>
          <DialogDescription>
            Select leads to assign to a team member
          </DialogDescription>
        </DialogHeader>

        <LeadAssignmentComponent
          leads={leads}
          members={members}
          selectedLeadIds={selectedLeadIds}
          setSelectedLeadIds={setSelectedLeadIds}
          selectedUserId={selectedUserId}
          setSelectedUserId={setSelectedUserId}
        />

        <div className="flex justify-between items-center pt-4">
          <div className="text-sm text-muted-foreground">
            {selectedLeadIds.length} of {leads.length} leads selected
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isAssigning}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={
                !selectedUserId || selectedLeadIds.length === 0 || isAssigning
              }
            >
              {isAssigning && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Assign {selectedLeadIds.length} Lead
              {selectedLeadIds.length !== 1 ? "s" : ""}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
