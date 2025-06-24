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
import { UserPlus, Loader2, UserMinus } from "lucide-react";
import { toast } from "sonner";

export default function UnassignLeadsDialog({ leads, users, onComplete }) {
  // console.log("leads:", leads)
  // console.log("users:", users)
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isUnassigning, setIsUnassigning] = useState(false);

  const selectedUser = users?.find((user) => user.id === selectedUserId);
  const assignedLeads = leads.filter((lead) => lead.assignedUserId === selectedUserId);

  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
    setSelectedLeadIds([]); // Clear selected leads when user changes
  };

  const handleLeadSelect = (leadId, checked) => {
    if (checked) {
      setSelectedLeadIds((prev) => [...prev, leadId]);
    } else {
      setSelectedLeadIds((prev) => prev.filter((id) => id !== leadId));
    }
  };

  const handleSelectAll = () => {
    if (selectedLeadIds.length === assignedLeads.length) {
      // If all are selected, deselect all
      setSelectedLeadIds([]);
    } else {
      // Select all leads
      setSelectedLeadIds(assignedLeads.map((lead) => lead.id));
    }
  };

  const handleUnassign = async () => {
    if (selectedLeadIds.length === 0) {
      toast.error("Please select leads to unassign");
      return;
    }

    setIsUnassigning(true);
    try {
      const response = await fetch("/api/leads/unassign", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadIds: selectedLeadIds,
          assignedUserId: selectedUserId
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to unassign leads");
      }

      toast.success(`Successfully unassigned ${selectedLeadIds.length} lead(s)`);
      setSelectedLeadIds([]);
      setSelectedUserId("");
      setIsOpen(false);
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Error unassigning leads:", error);
      toast.error("Failed to unassign leads");
    } finally {
      setIsUnassigning(false);
    }
  };

  const isAllSelected = assignedLeads.length > 0 && selectedLeadIds.length === assignedLeads.length;
  const isIndeterminate = selectedLeadIds.length > 0 && selectedLeadIds.length < assignedLeads.length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <UserMinus className="h-4 w-4 mr-2" />
          Unassign Leads
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Unassign Leads</DialogTitle>
          <DialogDescription>
            Select leads to unassign from a team member
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1">
          {/* User Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Team Member</label>
            <Select value={selectedUserId} onValueChange={handleUserSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a team member" />
              </SelectTrigger>
              <SelectContent>
                {users?.map((user) => {
                  const userLeadCount = leads.filter(
                    (lead) => lead.assignedUserId === user.id
                  ).length;
                  return (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{user.firstname || user.email} {user.lastname}</span>
                        <Badge variant="secondary" className="ml-2">
                          {userLeadCount} leads
                        </Badge>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Leads Selection */}
          {selectedUserId && (
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Select Leads to Unassign
                </label>
                {assignedLeads.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all"
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      className={isIndeterminate ? "data-[state=checked]:bg-primary" : ""}
                    />
                    <label
                      htmlFor="select-all"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Select All ({assignedLeads.length})
                    </label>
                  </div>
                )}
              </div>

              {assignedLeads.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No leads assigned to this user
                </div>
              ) : (
                <ScrollArea className="h-64 border rounded-md p-2">
                  <div className="space-y-2">
                    {assignedLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-md"
                      >
                        <Checkbox
                          id={`lead-${lead.id}`}
                          checked={selectedLeadIds.includes(lead.id)}
                          onCheckedChange={(checked) =>
                            handleLeadSelect(lead.id, checked)
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">
                              <span className="font-light">{lead.name || "Unnamed Lead"}</span> {lead.company}
                            </p>
                            {lead.status && (
                              <Badge variant="outline" className="text-xs">
                                {lead.status}
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                          {lead.email && (
                            <p className="text-xs text-muted-foreground truncate">
                              {lead.email}
                            </p>
                          )}
                          {lead.phoneNumber && (
                            <p className="text-xs text-muted-foreground">
                              {lead.phoneNumber}
                            </p>
                          )}
                          {lead.industry && (
                              <p className="text-xs text-muted-foreground capitalize">
                              {lead.industry}
                            </p>
                          )}
                          {lead.region && (
                              <p className="text-xs text-muted-foreground capitalize">
                              {lead.region}
                            </p>
                          )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {selectedLeadIds.length === 0 ? (<p  className="text-sm text-muted-foreground">0 leads selected</p>) : (
                <div className="text-sm text-muted-foreground">
                  {selectedLeadIds.length} of {assignedLeads.length} leads selected
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isUnassigning}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUnassign}
            disabled={selectedLeadIds.length === 0 || isUnassigning}
          >
            {isUnassigning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Unassigning...
              </>
            ) : (
              <>
                <UserMinus className="h-4 w-4 mr-2" />
                Unassign {selectedLeadIds.length} Lead{selectedLeadIds.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}